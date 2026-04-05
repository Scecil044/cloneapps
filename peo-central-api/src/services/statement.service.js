const { Statement, Invoice, CreditNote, DebitNote, Companies, Payment } = require('../models');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const cron = require('node-cron');
const Bull = require('bull');
const excelJs = require('exceljs');
const fs = require('fs');
const path = require('path');
// const { v4: uuidv4 } = require('uuid');
const awsService = require('./aws.service');

/**
 * ================================================================================================
 * These implementations effect statements for clients on the portal
 * These services provide an efficient way of previewing payment history and balance history
 * ================================================================================================
 */

/**
 * Generate a statement number
 * @returns {Promise<string>}
 */
const generateStatementNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `ST-${year}-`;

  // Find all statements with the current year's prefix
  const statements = await Statement.find({ statement_number: { $regex: `^${prefix}` } })
    .select('statement_number')
    .lean();

  // Extract valid numeric sequences
  const sequences = statements
    .map(st => {
      const raw = st && st.statement_number ? st.statement_number : '';
      const parts = typeof raw === 'string' ? raw.split('-') : [];
      if (Array.isArray(parts) && parts.length === 3 && !isNaN(parts[2])) {
        return parseInt(parts[2], 10);
      }
      return null;
    })
    .filter(n => n !== null);

  let maxSequence = sequences.length ? Math.max(...sequences) : 0;

  // Find the next available unique statement number
  let newStatementNumber;
  let isUnique = false;
  while (!isUnique) {
    maxSequence += 1;
    newStatementNumber = `${prefix}${String(maxSequence).padStart(5, '0')}`;

    const exists = await Statement.exists({ statement_number: newStatementNumber });
    if (!exists) {
      isUnique = true;
    }
  }

  return newStatementNumber;
};

/**
 * ================================================================================================
 * This implementation enables the creation of statements on the system
 * Created statements should have a relationship with clients
 * ================================================================================================
 */
const createStatement = async (reqBody, userId) => {
  try {
    const statementNumber = await generateStatementNumber();
    reqBody = {
      ...reqBody,
      createdBy: userId,
      statement_number: statementNumber
    };
    const response = await Statement.create(reqBody);
    return response;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create statement', error);
  }
};

/**
 * ================================================================================================
 * this implementation enables fetching of statements from the billings section
 * It enables fetching based on company id, and should also enable fetching by date ranges
 * ================================================================================================
 */
const fetchStatements = async reqQuery => {
  try {
    const { startDate, endDate, company_id, search = '' } = reqQuery;
    const filter = {
      is_deleted: false
    };

    // Adding date filter if startDate or endDate is provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    if (company_id) {
      filter.company_id = ObjectId(company_id);
    }

    if (search) {
    }
    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 30;

    const options = {
      page,
      limit,
      skip: (page - 1) * limit,
      sortBy: reqQuery.sort || 'createdAt:desc'
    };

    const body = [
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice_number',
          foreignField: '_id',
          as: 'invoiceDetails',
          // Add pipeline to exclude void invoices
          pipeline: [
            {
              $match: {
                invoice_number: { $not: /^VOID-/i }
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: '$invoiceDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          company_name: '$companyDetails.company_name',
          company_email: '$companyDetails.email',
          company_id: '$companyDetails._id',
          invoice_number: '$invoiceDetails.invoice_number',
          running_balance: 1,
          credit_amount: 1,
          debit_amount: 1,
          date: 1,
          descripttion: 1
        }
      }
    ];
    const response = await Statement.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ================================================================================================
 * This implementation aggregates financial transactions for a company within a date range
 * It calculates opening and closing balances and prepares statement items
 * ================================================================================================
 */
const aggregateFinancialTransactions = async (companyId, startDate, endDate) => {
  try {
    // Convert string dates to Date objects if needed
    const periodStart = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const periodEnd = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Find previous statement to get opening balance
    const previousStatement = await Statement.findOne({
      company_id: companyId,
      period_end: { $lt: periodStart }
    })
      .sort({ period_end: -1 })
      .lean();

    // Set opening balance from previous statement or default to 0
    const openingBalance = previousStatement ? previousStatement.closing_balance : 0;

    // Fetch all invoices within the date range (excluding void invoices)
    const invoices = await Invoice.find({
      customer: companyId,
      invoice_date: { $gte: periodStart, $lte: periodEnd },
      is_deleted: false,
      // Exclude void invoices (those with invoice numbers starting with "VOID-")
      invoice_number: { $not: /^VOID-/i },
      type: { $ne: 'payroll invoice' }, // Exclude payroll invoices
      is_draft: false
    }).lean();

    // Fetch all credit notes within the date range
    const creditNotes = await CreditNote.find({
      customer: companyId,
      credit_date: { $gte: periodStart, $lte: periodEnd },
      is_deleted: false
    }).lean();

    // Fetch all debit notes within the date range
    const debitNotes = await DebitNote.find({
      customer: companyId,
      debit_date: { $gte: periodStart, $lte: periodEnd },
      is_deleted: false
    }).lean();

    // Fetch all payments within the date range
    const payments = await Payment.find({
      customer: companyId,
      payment_date: { $gte: periodStart, $lte: periodEnd },
      is_deleted: false
    }).lean();

    // Prepare statement items
    let statementItems = [];
    let runningBalance = openingBalance;
    let totalDebit = 0;
    let totalCredit = 0;

    // Add invoices to statement items
    invoices.forEach(invoice => {
      const originalAmount = invoice.total || 0;
      const currency = invoice.currency || 'AED';
      const conversionRate = invoice.conversion_rate || 1.0;
      
      // Convert to AED for calculations
      const debitAmount = currency !== 'AED' ? originalAmount * conversionRate : originalAmount;
      runningBalance += debitAmount;
      totalDebit += debitAmount;

      statementItems.push({
        date: invoice.invoice_date,
        type: 'invoice',
        document_id: invoice._id,
        document_number: invoice.invoice_number,
        description: `Invoice: ${invoice.invoice_number}`,
        debit_amount: debitAmount,
        credit_amount: 0,
        running_balance: runningBalance,
        // ✅ ENHANCED: Add currency information
        currency: currency,
        original_amount: originalAmount,
        conversion_rate: conversionRate,
        aed_amount: debitAmount
      });
    });

    // Add credit notes to statement items
    creditNotes.forEach(creditNote => {
      const originalAmount = creditNote.total || 0;
      const currency = creditNote.currency || 'AED';
      const conversionRate = creditNote.conversion_rate || 1.0;
      
      // Convert to AED for calculations
      const creditAmount = currency !== 'AED' ? originalAmount * conversionRate : originalAmount;
      runningBalance -= creditAmount;
      totalCredit += creditAmount;

      statementItems.push({
        date: creditNote.credit_date,
        type: 'credit_note',
        document_id: creditNote._id,
        document_number: creditNote.credit_note_number,
        description: `Credit Note: ${creditNote.credit_note_number}`,
        debit_amount: 0,
        credit_amount: creditAmount,
        running_balance: runningBalance,
        // ✅ ENHANCED: Add currency information
        currency: currency,
        original_amount: originalAmount,
        conversion_rate: conversionRate,
        aed_amount: creditAmount
      });
    });

    // Add debit notes to statement items
    debitNotes.forEach(debitNote => {
      const originalAmount = debitNote.total || 0;
      const currency = debitNote.currency || 'AED';
      const conversionRate = debitNote.conversion_rate || 1.0;
      
      // Convert to AED for calculations
      const debitAmount = currency !== 'AED' ? originalAmount * conversionRate : originalAmount;
      runningBalance += debitAmount;
      totalDebit += debitAmount;

      statementItems.push({
        date: debitNote.debit_date,
        type: 'debit_note',
        document_id: debitNote._id,
        document_number: debitNote.debit_note_number,
        description: `Debit Note: ${debitNote.debit_note_number}`,
        debit_amount: debitAmount,
        credit_amount: 0,
        running_balance: runningBalance,
        // ✅ ENHANCED: Add currency information
        currency: currency,
        original_amount: originalAmount,
        conversion_rate: conversionRate,
        aed_amount: debitAmount
      });
    });

    // Add payments to statement items
    payments.forEach(payment => {
      const originalAmount = payment.amount || 0;
      const currency = payment.currency || 'AED';
      const conversionRate = payment.conversion_rate || 1.0;
      
      // Convert to AED for calculations
      const creditAmount = currency !== 'AED' ? originalAmount * conversionRate : originalAmount;
      runningBalance -= creditAmount;
      totalCredit += creditAmount;

      statementItems.push({
        date: payment.payment_date,
        type: 'payment',
        document_id: payment._id,
        document_number: payment.payment_number,
        description: `Payment: ${payment.payment_number}`,
        debit_amount: 0,
        credit_amount: creditAmount,
        running_balance: runningBalance,
        // ✅ ENHANCED: Add currency information
        currency: currency,
        original_amount: originalAmount,
        conversion_rate: conversionRate,
        aed_amount: creditAmount
      });
    });

    // Sort items by date
    statementItems.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Recalculate running balance after sorting
    let balance = openingBalance;
    statementItems = statementItems.map(item => {
      balance = balance + item.debit_amount - item.credit_amount;
      return { ...item, running_balance: balance };
    });

    return {
      openingBalance,
      closingBalance: balance,
      totalDebit,
      totalCredit,
      items: statementItems
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to aggregate financial transactions', error);
  }
};

/**
 * ================================================================================================
 * This implementation generates a statement for a specific company and date range
 * ================================================================================================
 */
const generateStatement = async (companyId, startDate, endDate, userId) => {
  try {
    // Validate company exists
    const company = await Companies.findOne({ _id: companyId, is_deleted: false });
    if (!company) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }

    // Aggregate financial transactions
    const { openingBalance, closingBalance, totalDebit, totalCredit, items } = await aggregateFinancialTransactions(
      companyId,
      startDate,
      endDate
    );

    // Check if there are any transactions
    if (items.length === 0 && openingBalance === 0) {
      return { message: 'No transactions found for the specified period' };
    }

    // Generate statement number
    const statementNumber = await generateStatementNumber();

    // Create statement
    const statement = await Statement.create({
      company_id: companyId,
      statement_number: statementNumber,
      statement_date: new Date(),
      period_start: startDate,
      period_end: endDate,
      opening_balance: openingBalance,
      closing_balance: closingBalance,
      total_debit: totalDebit,
      total_credit: totalCredit,
      items: items,
      createdBy: userId
    });

    return statement;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate statement', error);
  }
};

/**
 * ================================================================================================
 * This implementation generates statements for all active companies for a specific period
 * ================================================================================================
 */

// Create a dedicated queue for statement generation
const statementQueue = new Bull('statement-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Modified function to use queue
const generateStatementsForAllCompanies = async (startDate, endDate, userId) => {
  try {
    // Find all active companies
    const companies = await Companies.find({
      status: { $in: ['active', 'new'] },
      is_deleted: false
    });

    // Create a job in the queue
    const job = await statementQueue.add(
      {
        companies: companies.map(c => ({ id: c._id, name: c.company_name })),
        startDate,
        endDate,
        userId
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    );

    // Return job ID for tracking
    return {
      jobId: job.id,
      status: 'queued',
      message: `Statement generation for ${companies.length} companies has been queued`,
      totalCompanies: companies.length
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate statements for all companies', error);
  }
};

// Process the queue (add this to your service)
statementQueue.process(async job => {
  const { companies, startDate, endDate, userId } = job.data;
  const results = [];
  let processedCount = 0;

  // Generate statement for each company
  for (const company of companies) {
    try {
      const statement = await generateStatement(company.id, startDate, endDate, userId);
      results.push({
        company_id: company.id,
        company_name: company.name,
        statement_id: statement._id,
        statement_number: statement.statement_number,
        status: 'success'
      });
    } catch (error) {
      results.push({
        company_id: company.id,
        company_name: company.name,
        status: 'failed',
        error: error.message
      });
    }

    // Update progress
    processedCount++;
    await job.progress(Math.floor((processedCount / companies.length) * 100));
  }

  return results;
});

// Add a new endpoint to check job status
const getStatementGenerationStatus = async jobId => {
  const job = await statementQueue.getJob(jobId);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }

  const state = await job.getState();
  const progress = job._progress;
  const result = job.returnvalue;

  return {
    jobId,
    status: state,
    progress,
    result: state === 'completed' ? result : null
  };
};

/**
 * ================================================================================================
 * This implementation sets up a scheduled task to generate statements monthly
 * ================================================================================================
 */
const setupScheduledStatementGeneration = () => {
  // Schedule monthly statement generation (runs on the 1st day of each month at 1:00 AM)
  cron.schedule(
    '0 1 1 * *',
    async () => {
      try {
        // Calculate previous month's date range
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0);

        console.log(
          `Starting scheduled statement generation for period: ${startDate.toISOString()} to ${endDate.toISOString()}`
        );

        // Use system user ID or admin ID for automated tasks
        const systemUserId = '000000000000000000000000'; // Replace with actual system user ID if available

        // Generate statements for all companies
        await generateStatementsForAllCompanies(startDate, endDate, systemUserId);

        console.log('Scheduled statement generation completed successfully');
      } catch (error) {
        console.error('Scheduled statement generation failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC' // Adjust timezone as needed
    }
  );

  console.log('Scheduled statement generation task set up successfully');
};

// Initialize scheduled tasks when the service is loaded
setupScheduledStatementGeneration();

/**
 * ================================================================================================
 * This implementation exports statements to Excel with date filtering capabilities
 * It creates a professionally formatted Excel file with comprehensive financial data
 * Supports:
 * - Single company export (company_id)
 * - Multiple companies export (company_ids - comma separated)
 * - All companies export (no company parameters)
 * ================================================================================================
 */
const exportStatementsToExcel = async (reqQuery) => {
  try {
    const { startDate, endDate, company_id, company_ids } = reqQuery;

    // Validate required parameters
    if (!startDate || !endDate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Start date and end date are required');
    }

    // Parse company IDs if provided
    let targetCompanyIds = [];
    let companyName = 'All Companies';

    if (company_id) {
      // Single company mode (backward compatibility)
      targetCompanyIds = [company_id];
    } else if (company_ids) {
      // Multiple companies mode
      targetCompanyIds = Array.isArray(company_ids)
        ? company_ids
        : company_ids.split(',').map(id => id.trim()).filter(id => id);

      if (targetCompanyIds.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'At least one valid company ID must be provided');
      }

      companyName = `${targetCompanyIds.length} Selected Companies`;
    }

    // Create a new Excel workbook
    const workbook = new excelJs.Workbook();
    workbook.creator = 'PEO Central';
    workbook.created = new Date();

    // Add a worksheet
    const worksheet = workbook.addWorksheet('Statement', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // ✅ ENHANCED: Define columns with currency information
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15, style: { numFmt: 'dd/mm/yyyy' } },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Reference', key: 'reference', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Original Amount', key: 'original_amount', width: 18, style: { numFmt: '#,##0.00' } },
      { header: 'Conversion Rate', key: 'conversion_rate', width: 16, style: { numFmt: '#,##0.0000' } },
      { header: 'AED Amount', key: 'aed_amount', width: 18, style: { numFmt: '#,##0.00' } },
      { header: 'Debit (AED)', key: 'debit', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Credit (AED)', key: 'credit', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Balance (AED)', key: 'balance', width: 15, style: { numFmt: '#,##0.00' } }
    ];

    // Apply header styling
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    if (targetCompanyIds.length === 1) {
      // Single company export (original functionality)
      const singleCompanyId = targetCompanyIds[0];
      const company = await Companies.findById(singleCompanyId);
      if (!company) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
      }
      companyName = company.company_name;

      // Get financial transactions for the company
      const { openingBalance, closingBalance, totalDebit, totalCredit, items } = await aggregateFinancialTransactions(
        singleCompanyId,
        startDate,
        endDate
      );

      // Add opening balance row
      worksheet.addRow({
        date: new Date(startDate),
        type: 'Opening Balance',
        reference: '',
        description: 'Opening Balance',
        currency: 'AED',
        original_amount: openingBalance,
        conversion_rate: 1.0,
        aed_amount: openingBalance,
        debit: '',
        credit: '',
        balance: openingBalance
      });

      // Add statement items
      items.forEach(item => {
        worksheet.addRow({
          date: new Date(item.date),
          type: item.type.toUpperCase(),
          reference: item.document_number,
          description: item.description,
          currency: item.currency || 'AED',
          original_amount: item.original_amount || item.debit_amount || item.credit_amount || 0,
          conversion_rate: item.conversion_rate || 1.0,
          aed_amount: item.aed_amount || item.debit_amount || item.credit_amount || 0,
          debit: item.debit_amount || '',
          credit: item.credit_amount || '',
          balance: item.running_balance
        });
      });

      // Add closing balance row
      worksheet.addRow({
        date: new Date(endDate),
        type: 'Closing Balance',
        reference: '',
        description: 'Closing Balance',
        currency: 'AED',
        original_amount: closingBalance,
        conversion_rate: 1.0,
        aed_amount: closingBalance,
        debit: '',
        credit: '',
        balance: closingBalance
      });

      // Add summary section
      worksheet.addRow(['', '', '', '', '', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', 'Summary', '', '', '', '', '', '']);
      worksheet.addRow(['', '', '', '', 'Opening Balance:', '', '', '', '', '', openingBalance]);
      worksheet.addRow(['', '', '', '', 'Total Debits:', '', '', '', '', '', totalDebit]);
      worksheet.addRow(['', '', '', '', 'Total Credits:', '', '', '', '', '', totalCredit]);
      worksheet.addRow(['', '', '', '', 'Closing Balance:', '', '', '', '', '', closingBalance]);

      // Apply styling to opening and closing balance rows
      const openingRow = 2;
      const closingRow = items.length + 3; // +3 accounts for header row, opening balance row, and 1-based indexing

      [openingRow, closingRow].forEach(row => {
        worksheet.getRow(row).font = { bold: true };
        worksheet.getRow(row).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E6E6E6' }
        };
      });

      // Style summary section
      for (let i = closingRow + 2; i <= closingRow + 7; i++) {
        if (i === closingRow + 2) {
          // Summary header
          worksheet.getRow(i).font = { bold: true, size: 12 };
          worksheet.getCell(`D${i}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9E1F2' }
          };
        } else if (i === closingRow + 7) {
          // Closing balance (make it stand out)
          worksheet.getRow(i).font = { bold: true };
          worksheet.getCell(`D${i}`).font = { bold: true };
          worksheet.getCell(`E${i}`).font = { bold: true };
          worksheet.getCell(`E${i}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9E1F2' }
          };
        }
      }
    } else if (targetCompanyIds.length > 1) {
      // Multiple specific companies export
      const companies = await Companies.find({
        _id: { $in: targetCompanyIds },
        is_deleted: false
      }).lean();

      if (companies.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No valid companies found');
      }

      companyName = `${companies.length} Selected Companies`;

      // Add company header row for multi-company format
      worksheet.spliceRows(1, 0, [
        'Company',
        'Period Start',
        'Period End',
        'Opening Balance',
        'Closing Balance',
        'Total Debit',
        'Total Credit',
        'Currency',
        'Original Amount',
        'Conversion Rate',
        'AED Amount'
      ]);
      worksheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };

      let currentRow = 3;

      // Process each company
      for (const company of companies) {
        try {
          const { openingBalance, closingBalance, totalDebit, totalCredit, items } = await aggregateFinancialTransactions(
            company._id,
            startDate,
            endDate
          );

          // Add company summary row
          worksheet.spliceRows(currentRow, 0, [
            company.company_name,
            new Date(startDate),
            new Date(endDate),
            openingBalance,
            closingBalance,
            totalDebit,
            totalCredit,
            'AED', // Currency for summary
            '', // Original Amount (not applicable for summary)
            '', // Conversion Rate (not applicable for summary)
            '' // AED Amount (not applicable for summary)
          ]);

          worksheet.getRow(currentRow).font = { bold: true };
          worksheet.getRow(currentRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9E1F2' }
          };

          currentRow++;

          // Skip if no transactions
          if (items.length === 0) {
            worksheet.spliceRows(currentRow, 0, ['No transactions found', '', '', '', '', '', '', '', '', '', '']);
            currentRow++;
            continue;
          }

          // Add items for this company
          items.forEach(item => {
            worksheet.spliceRows(currentRow, 0, [
              new Date(item.date),
              item.type.toUpperCase(),
              item.document_number,
              item.description,
              item.currency || 'AED',
              item.original_amount || item.debit_amount || item.credit_amount || 0,
              item.conversion_rate || 1.0,
              item.aed_amount || item.debit_amount || item.credit_amount || 0,
              item.debit_amount || '',
              item.credit_amount || '',
              item.running_balance
            ]);
            currentRow++;
          });

          // Add a blank row between companies
          worksheet.spliceRows(currentRow, 0, ['', '', '', '', '', '', '', '', '', '', '']);
          currentRow++;
        } catch (error) {
          console.error(`Error processing company ${company._id}: ${error.message}`);
          worksheet.spliceRows(currentRow, 0, [
            company.company_name,
            'Error processing statement',
            error.message,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ]);
          currentRow++;
        }
      }
    } else {
      // Get data for all companies (original functionality)
      const companies = await Companies.find({
        status: { $in: ['active', 'new'] },
        is_deleted: false
      })
        .select('_id company_name')
        .lean();

      // Add company header row
      worksheet.spliceRows(1, 0, [
        'Company',
        'Period Start',
        'Period End',
        'Opening Balance',
        'Closing Balance',
        'Total Debit',
        'Total Credit',
        'Currency',
        'Original Amount',
        'Conversion Rate',
        'AED Amount'
      ]);
      worksheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };

      let currentRow = 3; // Start after the two header rows

      // Process companies in small concurrent batches to avoid timeouts
      const concurrency = parseInt(process.env.STATEMENT_EXPORT_CONCURRENCY || '5', 10);
      for (let i = 0; i < companies.length; i += concurrency) {
        const batch = companies.slice(i, i + concurrency);

        // Compute financials concurrently for this batch
        const batchResults = await Promise.all(
          batch.map(async (company) => {
            try {
              const data = await aggregateFinancialTransactions(company._id, startDate, endDate);
              return { company, data, error: null };
            } catch (err) {
              return { company, data: null, error: err };
            }
          })
        );

        // Append results sequentially to preserve order and avoid worksheet race conditions
        for (const result of batchResults) {
          const { company, data, error } = result;
          if (error) {
            console.error(`Error processing company ${company._id}: ${error.message}`);
            worksheet.spliceRows(currentRow, 0, [
              company.company_name,
              'Error processing statement',
              error.message,
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''
            ]);
            currentRow++;
            continue;
          }

          const { openingBalance, closingBalance, totalDebit, totalCredit, items } = data;

          // Company summary row
          worksheet.spliceRows(currentRow, 0, [
            company.company_name,
            new Date(startDate),
            new Date(endDate),
            openingBalance,
            closingBalance,
            totalDebit,
            totalCredit,
            'AED', // Currency for summary
            '', // Original Amount (not applicable for summary)
            '', // Conversion Rate (not applicable for summary)
            '' // AED Amount (not applicable for summary)
          ]);
          worksheet.getRow(currentRow).font = { bold: true };
          worksheet.getRow(currentRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9E1F2' }
          };
          currentRow++;

          if (items.length === 0) {
            worksheet.spliceRows(currentRow, 0, ['No transactions found', '', '', '', '', '', '', '', '', '', '']);
            currentRow++;
          } else {
            for (const item of items) {
              worksheet.spliceRows(currentRow, 0, [
                new Date(item.date),
                item.type.toUpperCase(),
                item.document_number,
                item.description,
                item.currency || 'AED',
                item.original_amount || item.debit_amount || item.credit_amount || 0,
                item.conversion_rate || 1.0,
                item.aed_amount || item.debit_amount || item.credit_amount || 0,
                item.debit_amount || '',
                item.credit_amount || '',
                item.running_balance
              ]);
              currentRow++;
            }
          }

          // Blank row between companies
          worksheet.spliceRows(currentRow, 0, ['', '', '', '', '', '', '', '', '', '', '']);
          currentRow++;
        }
      }
    }

    // Format date columns and currency - only apply to rows with actual data
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        // Check if row has meaningful data (not empty or just spaces)
        const hasData = row.values && row.values.some((value, index) => {
          if (index === 0) return false; // Skip the undefined first element
          return value !== null && value !== undefined && value !== '';
        });

        if (hasData) {
          const dateCell = row.getCell(1);
          if (dateCell.value instanceof Date) {
            dateCell.numFmt = 'dd/mm/yyyy';
          }

          // Format currency cells
          const originalAmountCell = row.getCell(6);
          const conversionRateCell = row.getCell(7);
          const aedAmountCell = row.getCell(8);
          const debitCell = row.getCell(9);
          const creditCell = row.getCell(10);
          const balanceCell = row.getCell(11);

          [originalAmountCell, aedAmountCell, debitCell, creditCell, balanceCell].forEach(cell => {
            if (typeof cell.value === 'number') {
              cell.numFmt = '#,##0.00';
            }
          });

          if (typeof conversionRateCell.value === 'number') {
            conversionRateCell.numFmt = '#,##0.0000';
          }
        }
      }
    });

    // Set column widths only for columns that have data
    const maxRowWithData = worksheet.actualRowCount;
    if (maxRowWithData > 0) {
      worksheet.columns = [
        { width: 20 }, // Date
        { width: 15 }, // Type
        { width: 20 }, // Document Number
        { width: 30 }, // Description
        { width: 10 }, // Currency
        { width: 18 }, // Original Amount
        { width: 16 }, // Conversion Rate
        { width: 18 }, // AED Amount
        { width: 15 }, // Debit Amount
        { width: 15 }, // Credit Amount
        { width: 15 }  // Running Balance
      ];
    }

    // Add title with date range
    const formattedStartDate = moment(startDate).format('DD/MM/YYYY');
    const formattedEndDate = moment(endDate).format('DD/MM/YYYY');
    const title = `${companyName} - Statement of Account (${formattedStartDate} to ${formattedEndDate})`;

    // Insert title row at the top
    worksheet.spliceRows(1, 0, [title]);
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(1).alignment = { horizontal: 'center' };
    worksheet.mergeCells('A1:G1');

    // Generate a unique filename
    // const tempFilePath = path.join('/tmp', `statement-${uuidv4()}.xlsx`);
    const tempFilePath = path.join('/tmp', `statement-${new ObjectId().toString()}.xlsx`);

    // Write to file
    await workbook.xlsx.writeFile(tempFilePath);

    // Upload to S3
    const fileContent = fs.readFileSync(tempFilePath);
    const s3Key = `statements/statement-${moment().format('YYYYMMDD-HHmmss')}.xlsx`;

    // With this implementation:
    // const tempUploadPath = path.join('/tmp', `upload-${uuidv4()}.xlsx`);
    const tempUploadPath = path.join('/tmp', `upload-${new ObjectId().toString()}.xlsx`);
    fs.writeFileSync(tempUploadPath, fileContent);

    const uploadFile = {
      tempFilePath: tempUploadPath,
      name: path.basename(s3Key),
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    const uploadedUrls = await awsService.uploadFilesToS3(uploadFile, 'statements');
    const uploadResult = { Location: uploadedUrls[0] };

    // Clean up both temp files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempUploadPath);

    return {
      url: uploadResult.Location,
      key: s3Key,
      filename: path.basename(s3Key)
    };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Error exporting statements to Excel'
    );
  }
};

module.exports = {
  createStatement,
  fetchStatements,
  generateStatement,
  generateStatementsForAllCompanies,
  aggregateFinancialTransactions,
  exportStatementsToExcel,
  getStatementGenerationStatus
};
