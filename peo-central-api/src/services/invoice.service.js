const { Invoice, Companies, Onboardings, ChartOfAccounts, InvoiceInputs, Configurations } = require('../models');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const { DebitNote } = require('../models');
const { PayrollInvoice } = require('../models');
const { Users, emailTemplate } = require('../models');
const { Payment } = require('../models');
const { DocumentTemplate } = require('../models');
const { payItemService, emailTemplateService } = require('../services');
const { toLower } = require('lodash');
const axios = require('axios');
const AWS = require('aws-sdk');
const invoiceLogService = require('./invoice_logs.service');
const awsService = require('./aws.service');
const { sendRawEmail, sendEmail } = require('../middlewares/email');
const chartOfAccountsService = require('./chart_of_accounts.service');
const journalEntryService = require('./journal_entry.service');
const cron = require('node-cron');
const { thousandSeparator, formatDate } = require('../helpers/common');
const fs = require('fs');
const excelJs = require('exceljs');
const { Terms } = require('../models');

const updateSentStatuses = async (invoiceIds) => {
  try {
    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      console.warn('No invoice IDs provided.');
      return;
    }

    // const objectIds = invoiceIds.map(id => new ObjectId(id));
    const invoices = await Invoice.find({ invoice_number: { $in: invoiceIds } });
    console.log(`Found ${invoices.length} invoices for the provided IDs.`);
    const updates = invoices
      .map((invoice) => {
        if (!['Due', 'Overdue', 'Paid'].includes(invoice.status)) {
          console.warn(`Skipping unknown status for invoice ${invoice._id}`);
          return null;
        }

        const update = {
          [`is_sent.${invoice.status}`]: true,
          sent_date: new Date(),
        };

        return Invoice.updateOne({ _id: invoice._id }, { $set: update });
      })
      .filter(Boolean); // filter out nulls

    await Promise.all(updates);
    console.log('Invoice statuses updated successfully.');
  } catch (error) {
    console.error('Error in updateSentStatuses:', error);
    throw error;
  }
};

const markinvoiceAsVoid = async (invoiceId, reqBody, userId) => {
  try {
    const isInvoice = await Invoice.findById(invoiceId);
    if (!isInvoice) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invoice not found');
    }
    isInvoice.void = reqBody.void;
    isInvoice.void_reason = reqBody.void_reason;
    isInvoice.updatedBy = userId;
    isInvoice.voided_by = userId;
    isInvoice.voided_at = new Date();
    // update invoice number to avoid altering invoice number sequence
    isInvoice.invoice_number = `VOID-${isInvoice.invoice_number}`;
    await isInvoice.save();
    return isInvoice;
  } catch (error) {
    throw error;
  }
};
const getAmountsDueForCompanies = async (companyId = null, reqQuery) => {
  try {
    const filter = {
      status: { $in: ['Due', 'Overdue'] },
      invoice_number: { $not: /NaN/ },
      is_deleted: 0,
    };

    if (companyId) {
      filter.customer = ObjectId(companyId);
    }
    // Define pagination options
    const options = {
      limit: reqQuery.limit || 10,
      page: reqQuery.page || 1,
      sortBy: reqQuery.sortBy || 'createdAt',
    };

    const body = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: `companyDetails`,
        },
      },
      { $unwind: '$companyDetails' },
      {
        $addFields: {
          amount_due: '$balance_due',
        },
      },
      {
        $project: {
          _id: 1,
          invoice_number: 1,
          customer: 1,
          company_name: '$companyDetails.company_name',
          balance_due: 1,
          amount_due: 1,
        },
      },
    ];

    const results = await Invoice.paginateLookup(filter, options, body);

    //   const totalAmount = results.results.reduce((sum, invoice) => sum + (invoice.amount_due || 0), 0);
    const totalAmountResult = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmountDue: { $sum: '$balance_due' },
        },
      },
    ]);

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmountDue : 0;

    return {
      totalAmount,
      ...results,
    };
  } catch (error) {
    throw new Error(error.message || 'Error retrieving amounts due for companies');
  }
};

const generateInvoiceNumberInitial = async () => {
  const year = new Date().getFullYear().toString().slice(-2);

  const lastInvoice = await Invoice.findOne().sort({ _id: -1 }).select('invoice_number').lean();

  const lastSequence = lastInvoice ? parseInt(lastInvoice.invoice_number.split('-')[2], 10) : 0;

  const newSequence = lastSequence + 1;

  const invoiceNumber = `INV-${year}-${String(newSequence).padStart(5, '0')}`;

  return invoiceNumber;
};
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2); // e.g., '25'
  const prefix = `INV-${year}-`;

  // Find all invoices with the current year's prefix, excluding VOID and DRAFT prefixes
  const invoices = await Invoice.find({
    invoice_number: { $regex: `^${prefix}` },
    invoice_number: { $not: /^VOID-|^DRAFT-/ },
  })
    .select('invoice_number')
    .lean();

  // Extract valid numeric sequences
  const sequences = invoices
    .map((inv) => {
      const parts = inv.invoice_number && inv.invoice_number.split('-');
      if (parts && parts.length === 3 && !isNaN(parts[2])) {
        return parseInt(parts[2], 10);
      }
      return null;
    })
    .filter((n) => n !== null);

  let maxSequence = sequences.length ? Math.max(...sequences) : 0;

  // Find the next available unique invoice number
  let newInvoiceNumber;
  let isUnique = false;
  while (!isUnique) {
    maxSequence += 1;
    newInvoiceNumber = `${prefix}${String(maxSequence).padStart(5, '0')}`;

    const exists = await Invoice.exists({ invoice_number: newInvoiceNumber });
    if (!exists) {
      isUnique = true;
    }
  }

  return newInvoiceNumber;
};

const generateDraftInvoiceNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2); // e.g., '25'
  const prefix = `DRAFT-INV-${year}-`;

  // Find all draft invoices with the current year's prefix
  const draftInvoices = await Invoice.find({
    invoice_number: { $regex: `^${prefix}` },
  })
    .select('invoice_number')
    .lean();

  // Extract valid numeric sequences from draft invoices
  const sequences = draftInvoices
    .map((inv) => {
      const parts = inv.invoice_number && inv.invoice_number.split('-');
      if (parts && parts.length === 4 && !isNaN(parts[3])) {
        // DRAFT-INV-25-00001 format
        return parseInt(parts[3], 10);
      }
      return null;
    })
    .filter((n) => n !== null);

  let maxSequence = sequences.length ? Math.max(...sequences) : 0;

  // Find the next available unique draft invoice number
  let newDraftInvoiceNumber;
  let isUnique = false;
  while (!isUnique) {
    maxSequence += 1;
    newDraftInvoiceNumber = `${prefix}${String(maxSequence).padStart(5, '0')}`;

    const exists = await Invoice.exists({ invoice_number: newDraftInvoiceNumber });
    if (!exists) {
      isUnique = true;
    }
  }

  return newDraftInvoiceNumber;
};

const createInvoice = async (body, userId) => {
  // console.log(body, "this is the body")
  let userDetails;
  if (userId) {
    userDetails = await Users.findById(userId);
  }
  if (userDetails) {
    // console.log(userDetails.employment.visa_sponsor_type, "this is the user details with visa sponsor type")
    body.visa_sponsor = userDetails.employment.visa_sponsor_type;
  }

  // Ensure all items in the invoice have a valid _id
  if (body.items && Array.isArray(body.items)) {
    body.items = body.items.map((item) => {
      // If the item doesn't have an _id, assign a new MongoDB ObjectId
      if (!item._id) {
        return {
          ...item,
          _id: new ObjectId(),
        };
      }
      return item;
    });
  }

  const invoice = await Invoice.create(body);
  console.log('print after invoice creation on add invoice function$$$$$$$$$$$', invoice._id, 'this is the invoice id');
  const preview = await getPreviewPDF(invoice._id, userId || body.user_id);
  invoice.invoice_link = preview && preview.url;
  await invoice.save();
  return {
    invoice,
  };
};

const getLastInvoice = async (filter) => {
  const latestDoc = await Invoice.aggregate([
    {
      $project: {
        _id: 1,
        invoice_number: 1,
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return latestDoc[0];
};

const getAllInvoices = async () => {
  let pipeline = [
    {
      $match: {
        is_deleted: 0,
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'customer',
        foreignField: '_id',
        as: 'companyDetails',
      },
    },
    { $unwind: '$companyDetails' },
    {
      $match: {
        'companyDetails.status': { $in: ['active', 'new'] },
      },
    },
    {
      $project: {
        _id: 1,
        customer: 1,
        customer_name: 1,
        email: 1,
        invoice_date: 1,
        due_date: 1,
        invoice_number: 1,
        status: 1,
        type: 1,
        currency: 1,
        conversion_rate: 1,
        base_currency: 1,
        converted_amount_aed: 1,
        createdAt: 1,
      },
    },
  ];
  let result = await Invoice.aggregate(pipeline);
  return result;
};

const getInvoiceOnInvoiceID = async (invoiceID) => {
  try {
    const pipeline = [
      {
        $match: {
          _id: ObjectId(invoiceID),
          is_deleted: 0,
        },
      },
      {
        $lookup: {
          from: 'creditnotes',
          let: { invoiceId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$invoice', '$$invoiceId'] },
                is_deleted: { $ne: true },
                status: { $ne: 'Void' }, // Exclude voided credit notes
              },
            },
          ],
          as: 'creditNoteDetails',
        },
      },
      {
        $lookup: {
          from: 'debitnotes',
          let: { invoiceId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$invoice', '$$invoiceId'],
                },
                is_deleted: { $ne: true },
                status: { $ne: 'Void' }, // Exclude voided debit notes
              },
            },
          ],
          as: 'debitNoteDetails',
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assigned_to',
          foreignField: '_id',
          as: 'assignedToDetails',
        },
      },
      {
        $unwind: {
          path: '$assignedToDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          billing_address: {
            $cond: {
              if: {
                $or: [{ $eq: ['$billing_address', ''] }, { $eq: ['$billing_address', null] }],
              },
              then: {
                $concat: [
                  { $ifNull: ['$companyDetails.billing_address.address_line1', ''] },
                  ', ',
                  { $ifNull: ['$companyDetails.billing_address.city', ''] },
                  ', ',
                  { $ifNull: ['$companyDetails.billing_address.address_country', ''] },
                ],
              },
              else: '$billing_address',
            },
          },
          shipping_address: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$shipping_address', ''] },
                  { $eq: ['$shipping_address', null] },
                  { $not: ['$shipping_address'] },
                ],
              },
              then: {
                $concat: [
                  { $ifNull: ['$companyDetails.shipping_address.address_line1', ''] },
                  ', ',
                  { $ifNull: ['$companyDetails.shipping_address.city', ''] },
                  ', ',
                  { $ifNull: ['$companyDetails.shipping_address.address_country', ''] },
                ],
              },
              else: '$shipping_address',
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          invoice_number: 1,
          type: 1,
          customer: 1,
          company: 1,
          cost_center: 1,
          customer_name: 1,
          credit_amount: 1,
          customer_address: 1,
          customer_trn: 1,
          branch: 1,
          email: 1,
          billing_address: 1,
          shipping_address: 1,
          order_number: 1,
          currency: 1,
          conversion_rate: 1,
          base_currency: 1,
          converted_amount_aed: 1,
          terms: 1,
          terms_name: 1,
          due_date: 1,
          invoice_date: 1,
          sale_location: 1,
          sale_person: 1,
          items: 1,
          details_field: 1,
          sub_total: 1,
          totalAdministrationCost: 1,
          vat_total: 1,
          discount_total: 1,
          total: 1,
          partial_amount: 1,
          status: 1,
          paid: 1,
          void: 1,
          write_off: 1,
          credit_applied: 1,
          debit_applied: 1,
          debit_notes: 1,
          credit_amount: 1,
          credit_notes: 1,
          void_reason: 1,
          write_off_reason: 1,
          is_recurring: 1,
          is_draft: 1,
          recurring_template: 1,
          subject: 1,
          customer_notes: 1,
          terms_condition: 1,
          documents: 1,
          balance_due: 1,
          invoice_path: 1,
          payment_note_link: 1,
          cancelled: 1,
          estimate: 1,
          user_id: 1,
          is_deleted: 1,
          time_sheet: 1,
          visa_sponsor: 1,
          memo: 1,
          assigned_to: 1,
          creditNoteDetails: 1,
          assignedToDetails: 1,
          is_individual_invoice: 1,
          createdAt: 1,
          updatedAt: 1,
          companyDetails: 1,
          is_sent: 1,
          creditNoteDetails: 1,
          debitNoteDetails: 1,
          debit_amount: 1,
        },
      },
    ];

    const result = await Invoice.aggregate(pipeline);
    return result;
  } catch (error) {
    throw error;
  }
};

const getLastDebitNote = async (filter) => {
  try {
    const latestDoc = await DebitNote.aggregate([
      {
        $project: {
          _id: 1,
          debit_note_number: 1,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    return latestDoc[0];
  } catch (error) {
    throw new Error(error);
  }
};

const createDebitNote = async (body) => {
  try {
    const formattedBody = {
      ...body,
      created_date: new Date(body.created_date),
      debit_note_date: new Date(body.debit_note_date),
      due_date: new Date(body.due_date),
    };
    const companyDoc = await Companies.findById(formattedBody.customer);
    formattedBody.customer_name = (companyDoc && companyDoc.company_name) || '';
    formattedBody.email = (companyDoc && companyDoc.company_email) || (companyDoc && companyDoc.email) || '';
    formattedBody.debit_date = new Date();
    console.log('Input to DebitNote.create:', JSON.stringify(formattedBody, null, 2));
    const debitNote = await DebitNote.create(formattedBody);
    if (debitNote) {
      // console.log(debitNote, "this is the created debit note===============>")
    } else {
      throw new Error('Debit note not created');
    }
    return { debitNote };
  } catch (error) {
    console.error('Error in createDebitNote:', error);
    throw new Error(error);
  }
};

const getInvoiceById = async (id) => {
  try {
    const invoice = await Invoice.findById(id).populate({
      path: 'credit_notes',
      match: { is_deleted: false },
    });
    return invoice;
  } catch (error) {
    throw error;
  }
};

const getAllDueInvoices = async () => {
  const invoice = await Invoice.find({ status: 'Due' });
  return invoice;
};

const updateInvoiceById = async (id, updateBody) => {
  try {
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
    }

    // Check if items are coming directly in updateBody or in invoiceItems.items
    let itemUpdates = null;
    if (updateBody.invoiceItems && updateBody.invoiceItems.items) {
      // If items are in updateBody.invoiceItems.items
      itemUpdates = updateBody.invoiceItems.items;
    } else if (updateBody.items && Array.isArray(updateBody.items)) {
      // If items are directly in updateBody.items
      itemUpdates = updateBody.items;
    }

    if (itemUpdates) {
      // Create a map for quick lookup of updates by _id
      const updatesMap = new Map(
        itemUpdates
          .filter((update) => update._id) // Only map items that have an _id
          .map((update) => [update._id.toString(), update])
      );

      // Handle existing items in the invoice
      if (invoice.items && Array.isArray(invoice.items)) {
        // Update only the provided fields for each item in the invoice
        invoice.items = invoice.items.map((existingItem) => {
          // Ensure each existing item has a valid _id
          if (!existingItem._id) {
            existingItem._id = new ObjectId();
          }

          const update = existingItem._id && updatesMap.get(existingItem._id.toString());
          if (update) {
            // Merge existing item with the fields provided in update
            return {
              ...existingItem,
              ...update,
            };
          }
          return existingItem; // Keep the item unchanged if no update is provided
        });
      } else {
        // If invoice.items doesn't exist or isn't an array, initialize it
        invoice.items = [];
      }

      // Process any new items that might have been added in the update
      const newItems = itemUpdates.filter((item) => !item._id);
      if (newItems.length > 0) {
        // Add new ObjectIds to each new item that doesn't have one
        newItems.forEach((item) => {
          item._id = new ObjectId();
        });

        // Add the new items to the invoice
        invoice.items = [...invoice.items, ...newItems];
      }
    } else if (updateBody.items && !Array.isArray(updateBody.items)) {
      // If items is present but not an array, ensure it's properly formatted
      console.warn('Warning: updateBody.items is present but not an array. Skipping item updates.');
    }

    // Update other fields on the invoice
    Object.assign(invoice, updateBody);

    // Ensure all invoice items have _id
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items = invoice.items.map((item) => {
        if (!item._id) {
          item._id = new ObjectId();
        }
        return item;
      });
    }

    // mark invoice items as modified
    console.log('--------------------------> marking invoices as modified');
    invoice.markModified('items');
    await invoice.save();
    return invoice;
  } catch (error) {
    throw error;
  }
};

const createPayrollInvoice = async (body) => {
  const payrollInvoice = await PayrollInvoice.create(body);
  return {
    payrollInvoice,
  };
};

const getAllPayrollInvoice = async (invoiceType) => {
  let pipeline = [
    {
      $match: {
        type: invoiceType,
        is_deleted: 0,
      },
    },
    {
      $project: {
        _id: 1,
        invoice_number: 1,
        type: 1,
        customer: 1,
        customer_name: 1,
      },
    },
  ];
  let result = await Invoice.aggregate(pipeline);
  return result;
};

const getPayrollInvoice = async (filter) => {
  const latestDoc = await PayrollInvoice.aggregate([
    {
      $project: {
        _id: 1,
        payroll_invoice_number: 1,
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return latestDoc[0];
};

const getLastPayment = async (filter) => {
  const latestDoc = await Payment.aggregate([
    {
      $project: {
        _id: 1,
        payment_number: 1,
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return latestDoc[0];
};

const recordPayment = async (body) => {
  try {
    body.payment_date = new Date();
    const payment = await Payment.create(body);

    // Check if this payment makes the invoice fully paid
    if (body.invoice) {
      await checkAndUpdateInvoiceStatus(body.invoice, payment);
    }

    return { payment };
  } catch (error) {
    throw error;
  }
};

/**
 * Check if an invoice is fully paid considering bank charges and update status accordingly
 * @param {ObjectId} invoiceId - The invoice ID
 * @param {Object} payment - The payment object
 */
const checkAndUpdateInvoiceStatus = async (invoiceId, payment) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return;

    // Get all payments for this invoice
    const allPayments = await Payment.find({
      invoice: invoiceId,
      is_deleted: { $ne: 1 },
    });

    // Calculate total amount paid including bank charges
    let totalPaid = 0;
    let totalBankCharges = 0;

    allPayments.forEach((pay) => {
      totalPaid += Number(pay.amount || 0);
      totalBankCharges += Number(pay.bank_charge || 0);
    });

    const totalPaidWithCharges = Number((totalPaid + totalBankCharges).toFixed(2));
    const balanceDue = Number((invoice.balance_due || 0).toFixed(2));

    // Check if invoice is fully paid
    if (totalPaidWithCharges >= balanceDue) {
      const updateData = {
        status: 'Paid',
        partial_amount: totalPaidWithCharges,
        paid: true,
      };

      await Invoice.findByIdAndUpdate(invoiceId, updateData);

      console.log(
        `✅ Updated invoice ${invoice.invoice_number} to Paid (total paid: ${totalPaidWithCharges}, balance_due: ${balanceDue})`
      );
    } else {
      // Update partial amount
      const updateData = {
        status: 'Partially Paid',
        partial_amount: totalPaidWithCharges,
        paid: false,
      };

      await Invoice.findByIdAndUpdate(invoiceId, updateData);

      console.log(
        `📝 Updated invoice ${invoice.invoice_number} to Partially Paid (total paid: ${totalPaidWithCharges}, balance_due: ${balanceDue})`
      );
    }
  } catch (error) {
    console.error('Error checking invoice status:', error);
    throw error;
  }
};

const getInvoicesByIds = async (invoiceIds) => {
  try {
    const invoices = await Invoice.find({ _id: { $in: invoiceIds } });
    return invoices;
  } catch (error) {
    throw error;
  }
};

const getBulkInvoicePaymentInfo = async (id) => {
  const payments = await Payment.find({
    $or: [
      { isBulkInvoice: true, 'bulk_invoices.invoiceId': String(id) },
      { isInvoice: true, invoice: id },
    ],
  });
  const paymentData = payments.map((payment) => {
    const amount = payment.isBulkInvoice
      ? payment.bulk_invoices.find((invoice) => invoice.invoiceId === String(id)).amount
      : payment.amount;
    const date = payment.payment_date;
    return { amount, date };
  });
  return paymentData;
};

const getDebitNoteById = async (id) => {
  const debitNote = await DebitNote.findById(id);
  return debitNote;
};

const updateDebitNoteId = async (id, updateBody) => {
  const debitNote = await getDebitNoteById(id);
  if (!debitNote) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  Object.assign(debitNote, updateBody);
  await debitNote.save();
  return debitNote;
};

const getPayrollInvoiceById = async (id) => {
  const invoice = await PayrollInvoice.findById(id);
  return invoice;
};

const updatePayrollInvoiceOnId = async (id, updateBody) => {
  const payrollInvoice = await getPayrollInvoiceById(id);
  if (!payrollInvoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  Object.assign(payrollInvoice, updateBody);
  await payrollInvoice.save();
  return payrollInvoice;
};

const cancelInvoice = async (id) => {
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  invoice.cancelled = 1;
  await invoice.save();
  return invoice;
};

const updateAllDueInvoices = async (filter) => {
  const invoices = await Invoice.updateMany(filter, { status: 'Overdue' }, { new: true });
  return {
    invoices,
  };
};

const getCountsOfInvoices = async (reqBody) => {
  try {
    const defaultCounts = [
      { name: 'All Invoices', count: 0, totals: 0 },
      { name: 'OverDue Invoices', count: 0, totals: 0 },
      { name: 'Paid Invoices', count: 0, totals: 0 },
      { name: 'Partially Paid Invoices', count: 0, totals: 0 },
      { name: 'Unapproved Invoices', count: 0, totals: 0 },
      { name: 'Draft Invoices', count: 0, totals: 0 },
      { name: 'Due Invoices', count: 0, totals: 0 },
      { name: 'Void Invoices', count: 0, totals: 0 },
      { name: 'Monthly Invoices', count: 0, totals: 0 },
    ];

    const pipeline = [
      {
        $match: { is_deleted: 0 },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: { path: '$companyDetails' },
      },
      {
        $match: {
          'companyDetails.status': { $in: ['new', 'active', 'inactive'] },
        },
      },
      {
        $project: {
          // ✅ ENHANCED: Add currency conversion fields for AED conversion
          currency: { $ifNull: ['$currency', 'AED'] },
          conversion_rate: { $ifNull: ['$conversion_rate', 1.0] },
          total: 1,
          balance_due: 1,
          void: 1,
          is_draft: 1,
          status: 1,
          type: 1,
          createdAt: 1,
          // Convert amounts to AED
          total_aed: {
            $cond: {
              if: { $ne: ['$currency', 'AED'] },
              then: { $multiply: ['$total', { $ifNull: ['$conversion_rate', 1.0] }] },
              else: '$total'
            }
          },
          balance_due_aed: {
            $cond: {
              if: { $ne: ['$currency', 'AED'] },
              then: { $multiply: ['$balance_due', { $ifNull: ['$conversion_rate', 1.0] }] },
              else: '$balance_due'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total_invoices: { $sum: 1 },
          // Hierarchical counting - each invoice counted only once
          void_invoices: {
            $sum: {
              $cond: [{ $eq: ['$void', true] }, 1, 0],
            },
          },
          draft_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$is_draft', true] }, { $ne: ['$void', true] }],
                },
                1,
                0,
              ],
            },
          },
          paid_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Paid$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          partially_paid_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Partially Paid$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          overdue_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Overdue$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          unpaid_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Due$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                    { $ne: ['$type', 'payroll invoice'] },
                    { $ne: ['$type', null] }
                  ],
                },
                1,
                0,
              ],
            },
          },
          new_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Unapproved$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          monthly_invoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$type', regex: '^Monthly Invoice$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          invoices_generated_today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // ✅ ENHANCED: Use AED-converted amounts for all balance calculations
          total_balance_due: { $sum: '$total_aed' },
          // Hierarchical totals calculation using AED amounts
          void_balance_due: {
            $sum: {
              $cond: [{ $eq: ['$void', true] }, '$total_aed', 0],
            },
          },
          draft_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$is_draft', true] }, { $ne: ['$void', true] }],
                },
                '$total_aed',
                0,
              ],
            },
          },
          paid_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Paid$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                '$total_aed',
                0,
              ],
            },
          },
          partially_paid_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Partially Paid$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                '$total_aed',
                0,
              ],
            },
          },
          overdue_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Overdue$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                '$balance_due_aed',
                0,
              ],
            },
          },
          unpaid_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Due$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                    { $ne: ['$type', 'payroll invoice'] },
                    { $ne: ['$type', null] }
                  ],
                },
                '$total_aed',
                0,
              ],
            },
          },
          unapproved_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$status', regex: '^Unapproved$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                '$balance_due_aed',
                0,
              ],
            },
          },
          monthly_balance_due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $regexMatch: { input: '$type', regex: '^Monthly Invoice$', options: 'i' } },
                    { $ne: ['$void', true] },
                    { $ne: ['$is_draft', true] },
                  ],
                },
                '$balance_due_aed',
                0,
              ],
            },
          },
          balance_due_generated_today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] },
                  ],
                },
                '$total_aed',
                0,
              ],
            },
          },
        },
      },
      {
        $set: {
          total_balance_due: { $round: ['$total_balance_due', 2] },
          unpaid_balance_due: { $round: ['$unpaid_balance_due', 2] },
          overdue_balance_due: { $round: ['$overdue_balance_due', 2] },
          paid_balance_due: { $round: ['$paid_balance_due', 2] },
          partially_paid_balance_due: { $round: ['$partially_paid_balance_due', 2] },
          general_balance_due: { $round: ['$general_balance_due', 2] },
          monthly_balance_due: { $round: ['$monthly_balance_due', 2] },
          draft_balance_due: { $round: ['$draft_balance_due', 2] },
          new_balance_due: { $round: ['$new_balance_due', 2] },
          balance_due_generated_today: { $round: ['$balance_due_generated_today', 2] },
        },
      },
      {
        $project: {
          counts: [
            { name: 'All Invoices', count: '$total_invoices', totals: '$total_balance_due' },
            { name: 'OverDue Invoices', count: '$overdue_invoices', totals: '$overdue_balance_due' },
            { name: 'Paid Invoices', count: '$paid_invoices', totals: '$paid_balance_due' },
            { name: 'Partially Paid Invoices', count: '$partially_paid_invoices', totals: '$partially_paid_balance_due' },
            { name: 'Unapproved Invoices', count: '$new_invoices', totals: '$unapproved_balance_due' },
            { name: 'Draft Invoices', count: '$draft_invoices', totals: '$draft_balance_due' },
            { name: 'Due Invoices', count: '$unpaid_invoices', totals: '$unpaid_balance_due' },
            { name: 'Void Invoices', count: '$void_invoices', totals: '$total_balance_due' },
            // {name: 'Monthly Invoices', count: '$monthly_invoices', totals: '$monthly_balance_due' }
          ],
          total_balance_due: 1,
          unpaid_balance_due: 1,
          overdue_balance_due: 1,
          paid_balance_due: 1,
          partially_paid_balance_due: 1,
          general_balance_due: 1,
          monthly_balance_due: 1,
          draft_balance_due: 1,
          unapproved_balance_due: 1,
          balance_due_generated_today: 1,
        },
      },
    ];

    if (reqBody.company_id) {
      // Support both single company_id and array of company_ids
      const companyIds = Array.isArray(reqBody.company_id)
        ? reqBody.company_id.map((id) => new ObjectId(id))
        : [new ObjectId(reqBody.company_id)];

      pipeline.unshift({
        $match: { customer: { $in: companyIds } },
      });
    }
    const result = await Invoice.aggregate(pipeline);

    const responseObj = {
      counts: (result[0] && result[0].counts) || defaultCounts,
      total_balance_due: (result[0] && result[0].total_balance_due) || 0,
      unpaid_balance_due: (result[0] && result[0].unpaid_balance_due) || 0,
      overdue_balance_due: (result[0] && result[0].overdue_balance_due) || 0,
      paid_balance_due: (result[0] && result[0].paid_balance_due) || 0,
      partially_paid_balance_due: (result[0] && result[0].partially_paid_balance_due) || 0,
      general_balance_due: (result[0] && result[0].general_balance_due) || 0,
      monthly_balance_due: (result[0] && result[0].monthly_balance_due) || 0,
      draft_balance_due: (result[0] && result[0].draft_balance_due) || 0,
      unapproved_balance_due: (result[0] && result[0].unapproved_balance_due) || 0,
      balance_due_generated_today: (result[0] && result[0].balance_due_generated_today) || 0,
    };
    return responseObj.counts;
  } catch (error) {
    throw error;
  }
};

const invoicesAllFilterSearchworking = async (query, reqBody) => {
  try {
    let result;
    // const searchRegex = new RegExp(reqBody.search, 'i');
    let filter = {
      is_deleted: 0,
      void: reqBody.void === true ? true : false,
      // is_draft: false
    };
    let body = [
      {
        $lookup: {
          from: 'creditnotes',
          localField: 'credit_notes',
          foreignField: '_id',
          as: 'creditNoteDetails',
          pipeline: [
            {
              $match: {
                status: { $nin: ['Void'] },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$creditNoteDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          invoice_number: 1,
          type: 1,
          items: 1,
          customer: 1,
          customer_name: 1,
          customer_address: 1,
          email: 1,
          billing_address: 1,
          shipping_address: 1,
          terms: 1,
          terms_name: 1,
          invoice_date: 1,
          due_date: 1,
          sale_location: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          customer_notes: 1,
          status: 1,
          balance_due: 1,
          terms_condition: 1,
          createdAt: 1,
          is_individual_invoice: 1,
          partial_amount: 1,
          visa_sponsor: 1,
          memo: 1,
          is_draft: 1,
          is_sent: 1,
          sent_date: {
            $ifNull: ['$sent_date', null],
          },
          // Wrap creditNoteDetails in an array, even if it contains only one item
          creditNoteDetails: {
            $cond: {
              if: {
                $and: [
                  { $eq: [{ $type: '$creditNoteDetails' }, 'array'] }, // Check if it's an array
                  { $eq: [{ $size: '$creditNoteDetails' }, 1] }, // Check if the array has one item
                ],
              },
              then: '$creditNoteDetails', // If it's an array with one item, keep it as an array
              else: { $ifNull: ['$creditNoteDetails', []] }, // If it's not an array or null, return an empty array
            },
          },
        },
      },
      // {
      //   $match: {
      //     $or: [{ customer_name: searchRegex }, { status: searchRegex }, { invoice_number: searchRegex }],
      //   },
      // },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'companyDetails.status': { $in: ['active', 'new', 'inactive'] },
        },
      },
    ];

    if (reqBody.search && reqBody.search.trim() !== '') {
      const searchRegex = new RegExp(reqBody.search, 'i');
      const searchNumber = Number(reqBody.search);
      const isNumber = !isNaN(searchNumber);

      const orConditions = [
        { customer_name: searchRegex },
        { status: searchRegex },
        { email: searchRegex },
        { terms_name: searchRegex },
        { type: searchRegex },
        { invoice_number: searchRegex },
        { visa_sponsor: searchRegex },
        { 'companyDetails.company_name': searchRegex },
        { 'companyDetails.trn_number': searchRegex },
        { 'companyDetails.PO_number': searchRegex },
        { 'companyDetails.GRN_number': searchRegex },
      ];

      if (isNumber) {
        console.log('condition met');
        // Exact number match
        orConditions.push({ balance_due: searchNumber });
        orConditions.push({ total: searchNumber });

        // String representation match for partial numbers
        orConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: '$balance_due' },
              regex: reqBody.search,
              options: 'i',
            },
          },
        });
        orConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: '$total' },
              regex: reqBody.search,
              options: 'i',
            },
          },
        });
      }
      // Remove the else block that was adding regex to numeric fields

      body.push({
        $match: {
          $or: orConditions,
        },
      });
    }

    let options = {
      limit: query.limit,
      page: query.page,
      sortBy: query.sortBy,
    };

    if (reqBody.status && reqBody.void && reqBody.void === true) {
      delete reqBody.status;
    }
    if (reqBody.status && reqBody.status.length > 0) {
      const statusRegexArray = Array.isArray(reqBody.status)
        ? reqBody.status.map((status) => ({ status: new RegExp(status, 'i') }))
        : [{ status: new RegExp(reqBody.status, 'i') }];

      body.push({
        $match: { $or: statusRegexArray },
      });
    }

    if (reqBody.is_draft) {
      filter.is_draft = reqBody.is_draft;
      // remove filter status
      delete filter.status;
    }

    if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
      const endDate = new Date(reqBody.end_date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
    }

    if (
      reqBody.company_id &&
      ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')
    ) {
      let compID = Array.isArray(reqBody.company_id)
        ? reqBody.company_id.map((id) => ObjectId(id))
        : [ObjectId(reqBody.company_id)];
      filter.customer = { $in: compID };
    }

    if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
      let userID = Array.isArray(reqBody.user_id) ? reqBody.user_id.map((id) => ObjectId(id)) : [ObjectId(reqBody.user_id)];
      body.push({ $match: { 'items.id': { $in: userID } } });
    }

    // if (reqBody.type && (reqBody.type != '' || (reqBody.type.length > 0 && reqBody.type[0] !== ''))) {
    //     console.log("found type on the request body----------------->", reqBody.type);
    //     filter.type = Array.isArray(reqBody.type)
    //         ? { $in: reqBody.type }
    //         : reqBody.type;
    // }

    /**
     * =====================================================================================================
     * This change effects filter from front-end to ensure monthly invoices are always fetched well
     * It changes the casing of monthly invoice from body to match what is in the db
     * It leaves all the others as they are.
     * You can restore the commented block if this becomes an issue latter on
     * =====================================================================================================
     */
    if (reqBody.type && Array.isArray(reqBody.type) && reqBody.type.length > 0) {
      filter.type = {
        $in: reqBody.type.map(
          (t) =>
            t.toLowerCase() === 'monthly invoice'
              ? new RegExp(`^Monthly Invoice$`, 'i') // Ensure "monthly invoice" always matches "Monthly Invoice"
              : t // Leave other types unchanged
        ),
      };
    }
    console.log(filter, 'the filter test this');
    console.log(options, 'the options');
    console.log(JSON.stringify(body), 'the body');
    result = await Invoice.paginateLookup(filter, options, body);
    // Step 1: Collect all the company IDs from the results
    const companyIds = result.results.map((item) => item.customer);

    // Step 2: Fetch users once for all the companies
    const users = await Users.find({ company_id: { $in: companyIds } });

    // Step 3: Group users by company_id to avoid multiple queries
    const companyEmployeeCount = users.reduce((acc, user) => {
      if (acc[user.company_id]) {
        acc[user.company_id] += 1;
      } else {
        acc[user.company_id] = 1;
      }
      return acc;
    }, {});

    // Step 4: Filter results based on employee count
    // const filteredResults = result.results.filter(item => {
    //   const employeeCount = companyEmployeeCount[item.customer];
    //   return employeeCount > 0;
    // });

    // return {
    //   ...result
    //   // results: filteredResults,
    // };
    console.log(result.results.length, '!!');
    const filteredResults = result.results.filter((item) => {
      if (item.is_draft === true) {
        return true;
      }

      return item.total > 0;
    });

    return {
      ...result,
      results: filteredResults,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const invoicesAllFilterSearch = async (query, reqBody) => {
  try {
    let result;
    let filter = {
      is_deleted: 0,
      void: reqBody.void === true ? true : false,
      type: { $nin: ['payroll invoice', null] },
    };

    let body = [
      {
        $lookup: {
          from: 'creditnotes',
          localField: 'credit_notes',
          foreignField: '_id',
          as: 'creditNoteDetails',
          pipeline: [
            {
              $match: {
                status: { $nin: ['Void'] },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$creditNoteDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          invoice_number: 1,
          type: 1,
          items: 1,
          customer: 1,
          customer_name: 1,
          customer_address: 1,
          email: 1,
          billing_address: 1,
          shipping_address: 1,
          terms: 1,
          terms_name: 1,
          invoice_date: 1,
          due_date: 1,
          sale_location: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          customer_notes: 1,
          status: 1,
          balance_due: 1,
          terms_condition: 1,
          createdAt: 1,
          is_individual_invoice: 1,
          partial_amount: 1,
          visa_sponsor: 1,
          memo: 1,
          is_draft: 1,
          is_sent: 1,
          void: 1,
          currency: 1,
          conversion_rate: 1,
          base_currency: 1,
          converted_amount_aed: 1,
          sent_date: {
            $ifNull: ['$sent_date', null],
          },
          creditNoteDetails: {
            $cond: {
              if: {
                $and: [{ $eq: [{ $type: '$creditNoteDetails' }, 'array'] }, { $eq: [{ $size: '$creditNoteDetails' }, 1] }],
              },
              then: '$creditNoteDetails',
              else: { $ifNull: ['$creditNoteDetails', []] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'companyDetails.logo': {
            $ifNull: ['$companyDetails.logo', ''],
          },
        },
      },
      {
        $match: {
          'companyDetails.status': { $in: ['active', 'new', 'inactive'] },
        },
      },
    ];

    // Handle search functionality
    if (reqBody.search && reqBody.search.trim() !== '') {
      const searchRegex = new RegExp(reqBody.search, 'i');
      const searchNumber = Number(reqBody.search);
      const isNumber = !isNaN(searchNumber);

      const orConditions = [
        { customer_name: searchRegex },
        { status: searchRegex },
        { email: searchRegex },
        { terms_name: searchRegex },
        { type: searchRegex },
        { invoice_number: searchRegex },
        { visa_sponsor: searchRegex },
        { 'companyDetails.company_name': searchRegex },
        { 'companyDetails.trn_number': searchRegex },
        { 'companyDetails.PO_number': searchRegex },
        { 'companyDetails.GRN_number': searchRegex },
      ];

      if (isNumber) {
        console.log('condition met');
        orConditions.push({ balance_due: searchNumber });
        orConditions.push({ total: searchNumber });
        orConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: '$balance_due' },
              regex: reqBody.search,
              options: 'i',
            },
          },
        });
        orConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: '$total' },
              regex: reqBody.search,
              options: 'i',
            },
          },
        });
      }

      body.push({
        $match: {
          $or: orConditions,
        },
      });
    }

    let options = {
      limit: query.limit,
      page: query.page,
      sortBy: query.sortBy,
    };

    // Handle status filtering with proper void and draft exclusion (matching getCountsOfInvoices logic)
    // But only apply this logic when void is not explicitly set to true
    if (reqBody.status && reqBody.status.length > 0) {
      const statusArray = Array.isArray(reqBody.status) ? reqBody.status : [reqBody.status];

      // If void is explicitly requested, don't exclude void invoices
      if (reqBody.void === true) {
        body.push({
          $match: {
            status: { $in: statusArray },
          },
        });
      } else {
        // Apply the same logic as getCountsOfInvoices - exclude void and draft invoices
        const statusMatchConditions = statusArray.map((status) => {
          return {
            $and: [
              { status: { $regex: `^${status}$`, $options: 'i' } },
              { void: { $ne: true } },
              { is_draft: { $ne: true } },
            ],
          };
        });

        body.push({
          $match: {
            $or: statusMatchConditions,
          },
        });
      }

      console.log('Applied status filter:', statusArray);
    }

    // Handle draft invoices explicitly
    if (reqBody.is_draft) {
      filter.is_draft = reqBody.is_draft;
    }

    if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
      const endDate = new Date(reqBody.end_date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
    }

    if (
      reqBody.company_id &&
      ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')
    ) {
      let compID = Array.isArray(reqBody.company_id)
        ? reqBody.company_id.map((id) => ObjectId(id))
        : [ObjectId(reqBody.company_id)];
      filter.customer = { $in: compID };
    }

    if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
      let userID = Array.isArray(reqBody.user_id) ? reqBody.user_id.map((id) => ObjectId(id)) : [ObjectId(reqBody.user_id)];
      body.push({ $match: { 'items.id': { $in: userID } } });
    }

    if (reqBody.type && Array.isArray(reqBody.type) && reqBody.type.length > 0) {
      filter.type = {
        $in: reqBody.type.map((t) => (t.toLowerCase() === 'monthly invoice' ? new RegExp(`^Monthly Invoice$`, 'i') : t)),
      };
    }

    console.log(filter, 'the filter test this');
    console.log(options, 'the options');
    console.log(JSON.stringify(body), 'the body');

    result = await Invoice.paginateLookup(filter, options, body);

    // Step 1: Collect all the company IDs from the results
    const companyIds = result.results.map((item) => item.customer);

    // Step 2: Fetch users once for all the companies
    const users = await Users.find({ company_id: { $in: companyIds } });

    // Step 3: Group users by company_id to avoid multiple queries
    const companyEmployeeCount = users.reduce((acc, user) => {
      if (acc[user.company_id]) {
        acc[user.company_id] += 1;
      } else {
        acc[user.company_id] = 1;
      }
      return acc;
    }, {});

    console.log(result.results.length, '!!');

    const filteredResults = result.results.filter((item) => {
      if (item.is_draft === true) {
        return true;
      }
      return item.total > 0;
    });

    return {
      ...result,
      results: filteredResults,
    };
  } catch (error) {
    throw new Error(error);
  }
};
const listVoidInvoices = async (query, reqBody) => {
  try {
    let result;
    let filter = {
      is_deleted: 0,
      void: true,
    };

    let body = [
      {
        $lookup: {
          from: 'creditnotes',
          localField: 'credit_notes',
          foreignField: '_id',
          as: 'creditNoteDetails',
        },
      },
      {
        $unwind: {
          path: '$creditNoteDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          invoice_number: 1,
          type: 1,
          items: 1,
          customer: 1,
          customer_name: 1,
          customer_address: 1,
          email: 1,
          billing_address: 1,
          shipping_address: 1,
          terms: 1,
          terms_name: 1,
          invoice_date: 1,
          due_date: 1,
          sale_location: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          customer_notes: 1,
          status: 1,
          balance_due: 1,
          terms_condition: 1,
          createdAt: 1,
          is_individual_invoice: 1,
          partial_amount: 1,
          visa_sponsor: 1,
          memo: 1,
          is_draft: 1,
          is_sent: 1,
          // Wrap creditNoteDetails in an array, even if it contains only one item
          creditNoteDetails: {
            $cond: {
              if: {
                $and: [
                  { $eq: [{ $type: '$creditNoteDetails' }, 'array'] }, // Check if it's an array
                  { $eq: [{ $size: '$creditNoteDetails' }, 1] }, // Check if the array has one item
                ],
              },
              then: '$creditNoteDetails', // If it's an array with one item, keep it as an array
              else: { $ifNull: ['$creditNoteDetails', []] }, // If it's not an array or null, return an empty array
            },
          },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'companyDetails.status': { $in: ['active', 'new'] },
        },
      },
    ];

    // Only apply search if search parameter is provided and not empty
    if (reqBody.search && reqBody.search.trim() !== '') {
      const searchRegex = new RegExp(reqBody.search, 'i');
      body.push({
        $match: {
          $or: [{ customer_name: searchRegex }, { status: searchRegex }, { invoice_number: searchRegex }],
        },
      });
    }

    let options = {
      limit: query.limit,
      page: query.page,
      sortBy: query.sortBy,
    };

    // Handle additional filters
    // if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    //   filter.status = Array.isArray(reqBody.status) ? { $in: reqBody.status } : reqBody.status;
    // }
    if (reqBody.status && reqBody.status.length > 0) {
      const statusRegexArray = Array.isArray(reqBody.status)
        ? reqBody.status.map((status) => ({ status: new RegExp(status, 'i') }))
        : [{ status: new RegExp(reqBody.status, 'i') }];

      body.push({
        $match: { $or: statusRegexArray },
      });
    }

    if (reqBody.is_draft) {
      filter.is_draft = reqBody.is_draft;
      // remove filter status
      delete filter.status;
    }

    if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
      const endDate = new Date(reqBody.end_date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
    }

    if (
      reqBody.company_id &&
      ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')
    ) {
      let compID = Array.isArray(reqBody.company_id)
        ? reqBody.company_id.map((id) => ObjectId(id))
        : [ObjectId(reqBody.company_id)];
      filter.customer = { $in: compID };
    }

    if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
      let userID = Array.isArray(reqBody.user_id) ? reqBody.user_id.map((id) => ObjectId(id)) : [ObjectId(reqBody.user_id)];
      body.push({ $match: { 'items.id': { $in: userID } } });
    }

    // if (reqBody.type && (reqBody.type != '' || (reqBody.type.length > 0 && reqBody.type[0] !== ''))) {
    //     console.log("found type on the request body----------------->", reqBody.type);
    //     filter.type = Array.isArray(reqBody.type)
    //         ? { $in: reqBody.type }
    //         : reqBody.type;
    // }

    /**
     * =====================================================================================================
     * This change effects filter from front-end to ensure monthly invoices are always fetched well
     * It changes the casing of monthly invoice from body to match what is in the db
     * It leaves all the others as they are.
     * You can restore the commented block if this becomes an issue latter on
     * =====================================================================================================
     */
    if (reqBody.type && Array.isArray(reqBody.type) && reqBody.type.length > 0) {
      filter.type = {
        $in: reqBody.type.map(
          (t) =>
            t.toLowerCase() === 'monthly invoice'
              ? new RegExp(`^Monthly Invoice$`, 'i') // Ensure "monthly invoice" always matches "Monthly Invoice"
              : t // Leave other types unchanged
        ),
      };
    }
    console.log(filter, 'the filter');
    console.log(options, 'the options');
    console.log(JSON.stringify(body), 'the body');
    result = await Invoice.paginateLookup(filter, options, body);
    // Step 1: Collect all the company IDs from the results
    const companyIds = result.results.map((item) => item.customer);

    // Step 2: Fetch users once for all the companies
    const users = await Users.find({ company_id: { $in: companyIds } });

    // Step 3: Group users by company_id to avoid multiple queries
    const companyEmployeeCount = users.reduce((acc, user) => {
      if (acc[user.company_id]) {
        acc[user.company_id] += 1;
      } else {
        acc[user.company_id] = 1;
      }
      return acc;
    }, {});

    // Step 4: Filter results based on employee count
    // const filteredResults = result.results.filter(item => {
    //   const employeeCount = companyEmployeeCount[item.customer];
    //   return employeeCount > 0;
    // });

    // return {
    //   ...result
    //   // results: filteredResults,
    // };
    const filteredResults = result.results.filter((item) => {
      if (item.is_draft === true) {
        return true;
      }

      return item.total > 0;
    });

    return {
      ...result,
      results: filteredResults,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getUsersOfSelectedInvoice = async (invoiceId, reqBody) => {
  let result = [];
  const invoice = await Invoice.find({ _id: ObjectId(invoiceId), type: new RegExp('payroll invoice', 'i') });

  if (invoice && invoice[0] && invoice[0].items) {
    const itemIds = invoice[0].items.map((item) => item.id.toString());
    const users = await Users.find({ _id: { $in: itemIds } }, { first_name: 1, middle_name: 1, last_name: 1, email: 1 });

    result = users.map((user) => ({
      id: user._id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email: user.email,
      company_id: invoice[0].customer,
    }));
  }

  return result;
};

const listOfInvoiceStatus = async (query, reqBody) => {
  const distinctStatuses = await Invoice.distinct('status').exec();
  const statArr = ['Due', 'Overdue', 'Paid', 'Partially Paid'];
  let combinedArray = [...distinctStatuses, ...statArr];
  const uniqueArray = Array.from(new Set(combinedArray));
  return uniqueArray;
};

const paymentScheduleData = async (query, reqBody) => {
  try {
    let generalData = [];
    let payrollData = [];
    let scheduleData;
    let scheduleResult = [];
    let paymentData;
    let paymentDetails;
    const allInvoices = await Invoice.find();

    const result = allInvoices.map(async (data) => {
      paymentData = await Payment.find({ invoice: ObjectId(data._id) });
      if (data && data.type) {
        if (data.type === 'general invoice') {
          if (paymentData.length) {
            paymentDetails = {
              _id: paymentData[0]._id,
              amount: paymentData[0].amount,
              bank_charge: paymentData[0].bank_charge,
              payment_date: paymentData[0].payment_date,
              payment_mode: paymentData[0].payment_mode,
              payment_number: paymentData[0].payment_number,
              createdAt: paymentData[0].createdAt,
            };
          }
          scheduleData = {
            _id: data._id,
            customer: data.customer,
            customer_name: data.customer_name,
            email: data.email,
            invoice_date: data.invoice_date,
            invoice_number: data.invoice_number,
            status: data.status,
            createdAt: data.createdAt,
            type: data.type,
            paymentDetails: paymentDetails,
          };
          generalData.push(scheduleData);
        } else if (data.type === 'payroll invoice') {
          if (data && data.items) {
            const itemIds = data.items.map((item) => item.id.toString());
            const usersPromise = Users.find(
              { _id: { $in: itemIds } },
              { first_name: 1, middle_name: 1, last_name: 1, email: 1 }
            );
            const users = await usersPromise;
            userResult = users.map((user) => ({
              id: user._id,
              first_name: user.first_name,
              middle_name: user.middle_name,
              last_name: user.last_name,
              email: user.email,
            }));
            if (paymentData.length) {
              paymentDetails = {
                _id: paymentData[0]._id,
                amount: paymentData[0].amount,
                bank_charge: paymentData[0].bank_charge,
                payment_date: paymentData[0].payment_date,
                payment_mode: paymentData[0].payment_mode,
                payment_number: paymentData[0].payment_number,
                createdAt: paymentData[0].createdAt,
              };
            }
            scheduleData = {
              _id: data._id,
              customer: data.customer,
              customer_name: data.customer_name,
              email: data.email,
              invoice_date: data.invoice_date,
              invoice_number: data.invoice_number,
              status: data.status,
              createdAt: data.createdAt,
              type: data.type,
              payroll_users: userResult,
              paymentDetails: paymentDetails,
            };
            payrollData.push(scheduleData);
          }
        }
      }
    });
    await Promise.all(result);
    scheduleResult = generalData.concat(payrollData);
    return scheduleResult;
  } catch (error) {
    throw new Error(error);
  }
};

//Filter on (Status, companies, Employees), search,
const paymentScheduleStatus = async (reqBody, page, limit) => {
  try {
    const matchStage = {};

    if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
      if (Array.isArray(reqBody.status)) {
        matchStage.status = { $in: reqBody.status };
      } else {
        matchStage.status = reqBody.status;
      }
    }

    if (
      reqBody.company_id &&
      ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')
    ) {
      if (Array.isArray(reqBody.company_id)) {
        let compID = reqBody.company_id.map((id) => ObjectId(id));
        matchStage.customer = { $in: compID };
      } else {
        matchStage.customer = ObjectId(reqBody.company_id);
      }
    }

    if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
      const endDate = new Date(reqBody.end_date);
      endDate.setDate(endDate.getDate() + 1);
      matchStage.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
    }

    const allInvoices = await Invoice.aggregate([
      { $match: { is_deleted: 0 } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'invoice',
          as: 'paymentDetails',
        },
      },
      {
        $project: {
          _id: 1,
          customer: 1,
          customer_name: 1,
          email: 1,
          invoice_number: 1,
          status: 1,
          type: 1,
          items: 1,
          invoice_date: 1,
          due_date: 1,
          payroll_users: 1,
          createdAt: 1,
          paymentDetails: {
            $cond: {
              if: { $ne: [{ $size: '$paymentDetails' }, 0] },
              then: {
                _id: { $arrayElemAt: ['$paymentDetails._id', 0] },
                amount: { $arrayElemAt: ['$paymentDetails.amount', 0] },
                bank_charge: { $arrayElemAt: ['$paymentDetails.bank_charge', 0] },
                payment_date: { $arrayElemAt: ['$paymentDetails.payment_date', 0] },
                payment_mode: { $arrayElemAt: ['$paymentDetails.payment_mode', 0] },
                payment_number: { $arrayElemAt: ['$paymentDetails.payment_number', 0] },
                createdAt: { $arrayElemAt: ['$paymentDetails.createdAt', 0] },
              },
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          customer: 1,
          customer_name: 1,
          email: 1,
          invoice_number: 1,
          status: 1,
          invoice_date: 1,
          due_date: 1,
          items: 1,
          type: 1,
          payroll_users: 1,
          createdAt: 1,
          paymentDetails: {
            $cond: {
              if: '$paymentDetails',
              then: '$paymentDetails',
              else: {
                _id: null,
                amount: null,
                bank_charge: null,
                payment_date: null,
                payment_mode: null,
                payment_number: null,
                createdAt: null,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          customer: 1,
          customer_name: 1,
          email: 1,
          invoice_number: 1,
          status: 1,
          items: 1,
          invoice_date: 1,
          type: 1,
          due_date: 1,
          payroll_users: 1,
          createdAt: 1,
          paymentDetails: {
            _id: '$paymentDetails._id',
            amount: '$paymentDetails.amount',
            bank_charge: '$paymentDetails.bank_charge',
            payment_date: '$paymentDetails.payment_date',
            payment_mode: '$paymentDetails.payment_mode',
            payment_number: '$paymentDetails.payment_number',
            createdAt: '$paymentDetails.createdAt',
          },
        },
      },
      {
        $match: matchStage,
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    // Apply search filter if provided
    let filteredInvoices = allInvoices;
    if (reqBody.search && reqBody.search.trim() !== '') {
      const searchRegex = new RegExp(reqBody.search, 'i');
      filteredInvoices = allInvoices.filter(
        (invoice) =>
          searchRegex.test(invoice.customer_name) ||
          searchRegex.test(invoice.invoice_number) ||
          searchRegex.test(invoice.status) ||
          searchRegex.test(invoice.invoice_date) ||
          searchRegex.test(invoice.due_date) ||
          searchRegex.test(invoice.type)
      );
    }

    const finalResult = await Promise.all(
      Array.from(filteredInvoices, async (info) => {
        const {
          status,
          paymentDetails: { payment_date: paymentDate },
        } = info;

        const isPartiallyPaid = status.toLowerCase() === 'partially paid';
        const isPaymentReceived = status.toLowerCase() === 'paid';
        const isInvoiceExpired = status.toLowerCase() === 'overdue';

        const partiallyPaidStatus = isPartiallyPaid ? 'Completed' : 'Not Completed';
        const paymentReceivedStatus = isPaymentReceived ? 'Completed' : 'Not Completed';
        const invoiceExpiredStatus = isInvoiceExpired ? 'Completed' : 'Not Completed';

        const partiallyPaidDate = isPartiallyPaid ? paymentDate || '' : '';
        const paymentReceivedDate = isPaymentReceived ? paymentDate || '' : '';
        const invoiceExpiredDate = isInvoiceExpired ? info.due_date : '';

        if (info && info.type && info.type === 'payroll invoice') {
          const itemIds = info.items.map((item) => item.id.toString());
          const usersPromise = Users.find(
            { _id: { $in: itemIds } },
            { first_name: 1, middle_name: 1, last_name: 1, email: 1 }
          );
          const users = await usersPromise;
          const associatedUsers = users.map((user) => ({
            id: user._id,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            email: user.email,
          }));

          return {
            _id: info._id,
            customer: info.customer,
            customer_name: info.customer_name,
            email: info.email,
            invoice_number: info.invoice_number,
            status: info.status,
            type: info.type,
            schedules: [
              { name: 'Invoice Sent', status: 'Completed', date: info.invoice_date },
              { name: 'Partially Paid', status: partiallyPaidStatus, partially_paid_date: partiallyPaidDate },
              { name: 'Payment Received', status: paymentReceivedStatus, payment_received_date: paymentReceivedDate },
              { name: 'Invoice Expired', status: invoiceExpiredStatus, invoice_expired_date: invoiceExpiredDate },
            ],
            associated_users: associatedUsers,
          };
        } else {
          return {
            _id: info._id,
            customer: info.customer,
            customer_name: info.customer_name,
            email: info.email,
            invoice_number: info.invoice_number,
            status: info.status,
            type: info.type,
            schedules: [
              { name: 'Invoice Sent', status: 'Completed', date: info.invoice_date },
              { name: 'Partially Paid', status: partiallyPaidStatus, partially_paid_date: partiallyPaidDate },
              { name: 'Payment Received', status: paymentReceivedStatus, payment_received_date: paymentReceivedDate },
              { name: 'Invoice Expired', status: invoiceExpiredStatus, invoice_expired_date: invoiceExpiredDate },
            ],
            associated_users: info.payroll_users,
          };
        }
      })
    );
    return finalResult;
  } catch (error) {
    throw new Error(error);
  }
};

const getInvoicesOfUsers = async (userId, page, limit) => {
  // const result = await Invoice.find({ type: new RegExp("payroll invoice", "i"), 'items.id': ObjectId(userId) })
  const result = await Invoice.aggregate([
    {
      $match: {
        type: { $regex: 'payroll invoice', $options: 'i' },
        'items.id': ObjectId(userId),
      },
    },
    {
      $project: {
        invoice_number: 1,
        items: {
          $filter: {
            input: '$items',
            as: 'item',
            cond: { $eq: ['$$item.id', ObjectId(userId)] },
          },
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  return result;
};

const getPreview = async (invoiceId, userId) => {
  try {
    const userDoc = {};
    let sponsorType = '';
    let content;
    const result = await Invoice.findById(ObjectId(invoiceId));
    if (!result) {
      throw new Error(`Could not find an invoice with the specified id: ${invoiceId}`);
    }

    if (result.type === 'Security Deposit & Mobilization Invoice') {
      content = await DocumentTemplate.find({ name: 'security Deposit Mobilization Charges Invoice' }).select({
        content: 1,
      });
    } else {
      // Get visa_sponsor from the invoice or determine from items if not set directly

      if (result.visa_sponsor && typeof result.visa_sponsor === 'string') {
        // Use the visa_sponsor field if it exists
        sponsorType = result.visa_sponsor.toLowerCase();
      } else if (result.items && result.items.length > 0) {
        // Try to determine from the first employee in items
        // First check if we can find a user with employment data in the items
        for (const item of result.items) {
          if (item.userFullName) {
            const user = await Users.findOne({ fullName: item.userFullName });
            if (user && user.employment && user.employment.visa_sponsor_type) {
              sponsorType = user.employment.visa_sponsor_type.toLowerCase();
              break;
            }
          }
        }

        // If we still don't have a sponsor type, default to dynamic employment services
        if (!sponsorType) {
          sponsorType = 'dynamic employment services';
        }
      } else {
        // Default to dynamic employment services if no information is available
        sponsorType = 'dynamic employment services';
      }

      // Select the appropriate template based on sponsor type
      if (sponsorType === 'dynamic employment services') {
        content = await DocumentTemplate.find({ name: 'Invoice Template' }).select({ content: 1 });
      } else if (sponsorType === 'executive employment services') {
        content = await DocumentTemplate.find({ name: 'Invoice Template EES' }).select({ content: 1 });
      } else {
        console.log('defaulting to DEES invoice. invalid visa sponsor type provided====================>');
        content = await DocumentTemplate.find({ name: 'Invoice Template' }).select({ content: 1 });
      }
    }
    console.log('company====> after before for company', typeof result.customer);
    const company = await Companies.findById(ObjectId(result.customer));
    console.log('company====> after fetch for company', company && company._id);
    console.log(result.total, 'this is the total shown', thousandSeparator(result.total), 'after separator');
    let array = [
      { key: 'invoicenumber', value: result.invoice_number },
      {
        key: 'account_number',
        value: sponsorType === 'executive employment services'
            ? '11771253920002'
            : '11403139820001',
      },
      {
        key: 'iban_number',
        value: sponsorType === 'executive employment services'
            ? 'AE640030011771253920002'
            : 'AE460030011403139820001',
      },
      {
        key: 'swift_code',
        value: sponsorType === 'executive employment services'
            ? 'ADCBAEAA'
            : 'ADCBAEAA',
      },
      {
        key: 'bank_name',
        value: sponsorType === 'executive employment services'
            ? 'ABU Dhabi Commercial Bank'
            : 'ABU Dhabi Commercial Bank',
      },
      // { key: 'trnnumber', value: company?.trn_number || '' },
      { key: 'invoicedate', value: formatDate(result.invoice_date) },
      { key: 'invoicedue', value: formatDate(result.due_date) },
      { key: 'invoiceterm', value: result.terms_name },
      { key: 'currency', value: result.currency || 'AED' },
      { key: 'subtotal', value: thousandSeparator(result.sub_total) },
      { key: 'totalvat', value: thousandSeparator(result.vat_total) },
      { key: 'tax', value: result.vat_total },
      { key: 'totaltax', value: result.vat_total },
      { key: 'total', value: thousandSeparator(result.total) },
      // use moment to convert date
      { key: 'date_created', value: moment(result.createdAt).format('Do MMMM YYYY') },
      { key: 'balance_due', value: thousandSeparator(result.balance_due) },
      { key: 'user', value: company.company_name },
      // { key: 'user', value: `${userDoc?.first_name} ${userDoc?.last_name || " "}` },
      {
        key: 'billing_address',
        value: `${
          result.billing_address ? result.billing_address : company && company.company_address ? company.company_address : ''
        }`,
      },
      {
        key: 'billing_city',
        value: company && company.billing_address && company.billing_address.city ? company.billing_address.city + ', ' : '',
      },
      { key: 'billing_country', value: (company && company.billing_address && company.billing_address.country) || '' },
      { key: 'customer_notes', value: result.customer_notes ? result.customer_notes : '' },
      { key: 'terms_condition', value: result.terms_condition ? result.terms_condition : '' },
    ];
    if (company.trn_number && company.trn_number.trim() !== '') {
      array.push(
        { key: 'trnnumber', value: (company && company.trn_number) || '' },
        { key: 'trnLabel:', value: 'TRN Number' || '' }
      );
    }
    if (company.PO_number && company.PO_number.trim() !== '') {
      array.push(
        { key: 'ponumber', value: (company && company.PO_number) || '' },
        { key: 'poLabel:', value: 'PO Number' || '' }
      );
    }
    console.log('=================> start of array', array, '-----------> end of array');
    console.log(result.items.length, 'is the total length of items in the result');
    let tablearray = [];
    // Process regular invoice items
    if (result.items.length === 0) {
      tablearray.push({
        service: 'No items',
        rate: '0',
        amount: '0',
        quantity: 0,
        vat: '0',
        description: 'No items added to this invoice',
      });
    } else {
      for (let index = 0; index < result.items.length; index++) {
        const element = result.items[index];
        const itemObj = {
          // service: element.service_name,
          service: typeof element.service_name === 'object' ? element.service_name.name : element.service_name,
          description: element && element.description,
          rate: thousandSeparator(element.rate),
          amount: thousandSeparator(element.amount),
          quantity: element.quantity || 1,
          vat: thousandSeparator(element.vat_amount),
          _id: element._id,
          // net_total: element?.net_total ? thousandSeparator(element.net_total) : '0',
          net_total:
            element && element.net_total
              ? typeof element.net_total !== 'object'
                ? thousandSeparator(parseFloat(element.net_total))
                : thousandSeparator(parseFloat(element.net_total.vat_rate || 0) + parseFloat(element.net_total.amount || 0))
              : '0',
        };
        tablearray.push(itemObj);
      }
    }
    console.log(
      'here is the table array after pushing items',
      tablearray,
      '---------------------------> end of table array^^^^^'
    );
    if (result.type === 'Monthly Invoice') {
      // Process employee data
      console.log('monthly invoice condition met');
      const employeeData = {
        dees: { count: 0, totalCost: 0 },
        ees: { count: 0, totalCost: 0 },
      };

      for (const item of result.items) {
        const user = await Users.findOne({ fullName: item.userFullName });
        if (user && user.employment) {
          if (user.employment.visa_sponsor_type === 'Dynamic Employment Services') {
            employeeData.dees.count++;
            employeeData.dees.totalCost += parseFloat(item.amount);
          } else {
            employeeData.ees.count++;
            employeeData.ees.totalCost += parseFloat(item.amount);
          }
        }
      }

      const totalEmployees = employeeData.dees.count + employeeData.ees.count;
      const totalCost = employeeData.dees.totalCost + employeeData.ees.totalCost;

      // Find company attached to invoice
      const isCompanyOnInvoice = await Companies.findById(result.customer);
      if (!isCompanyOnInvoice) {
        throw new Error(`Could not get company by id ${result.customer} on invoice`);
      }

      // Add monthly invoice specific data
      array = array.concat([
        { key: 'total_employees', value: totalEmployees },
        { key: 'dees_employees', value: employeeData.dees.count },
        { key: 'ees_employees', value: employeeData.ees.count },
        { key: 'dees_total_cost', value: employeeData.dees.totalCost.toFixed(2) },
        { key: 'ees_total_cost', value: employeeData.ees.totalCost.toFixed(2) },
        { key: 'total_cost', value: totalCost.toFixed(2) },
        { key: 'dees_monthly_costs', value: JSON.stringify(isCompanyOnInvoice.monthly_costs) },
        { key: 'ees_monthly_costs', value: JSON.stringify(isCompanyOnInvoice.monthly_costs_ees) },
      ]);
    }
    console.log('check after type');

    const obj = {
      replaceText: JSON.stringify(array),
      replaceTable: JSON.stringify([{ tablename: 'invoicetable', table: tablearray }]),
      replaceImage: JSON.stringify([
        { key: 'logo', value: 'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg' },
      ]),
      content: content[0].content,
    };
    console.log('next process');
    const response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContent', JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    });

    return response.data;
  } catch (error) {
    throw new Error(error);
  }
};

const getPreviewPDF = async (invoiceId, userId) => {
  try {
    const userDoc = {};
    let sponsorType = '';
    let content;
    const result = await Invoice.find({ _id: ObjectId(invoiceId) });
    if (result[0].type === 'Security Deposit & Mobilization Invoice') {
      content = await DocumentTemplate.find({ name: 'security Deposit Mobilization Charges Invoice' }).select({
        content: 1,
      });
    } else {
      // Get visa_sponsor from the invoice or determine from items if not set directly

      if (result[0] && result[0].visa_sponsor && typeof result[0].visa_sponsor === 'string') {
        // Use the visa_sponsor field if it exists
        sponsorType = result[0].visa_sponsor.toLowerCase();
      } else if (result[0] && result[0].items && result[0].items.length > 0) {
        // Try to determine from the first employee in items
        const firstEmployee = result[0].items.find((item) => item.user && item.user.employment);
        if (
          firstEmployee &&
          firstEmployee.user &&
          firstEmployee.user.employment &&
          firstEmployee.user.employment.visa_sponsor_type
        ) {
          sponsorType = firstEmployee.user.employment.visa_sponsor_type.toLowerCase();
        } else {
          // Default to dynamic employment services
          sponsorType = 'dynamic employment services';
        }
      } else {
        // Default to dynamic employment services if no information is available
        sponsorType = 'dynamic employment services';
      }

      // Select the appropriate template based on sponsor type
      if (sponsorType === 'dynamic employment services') {
        content = await DocumentTemplate.find({ name: 'Invoice Template' }).select({ content: 1 });
      } else if (sponsorType === 'executive employment services') {
        content = await DocumentTemplate.find({ name: 'Invoice Template EES' }).select({ content: 1 });
      } else {
        // Default template if sponsor type is not recognized
        console.log('defaulting to DEES invoice. invalid visa sponsor type provided====================>');
        content = await DocumentTemplate.find({ name: 'Invoice Template' }).select({ content: 1 });
      }
    }

    // let userDetails = await Users.find({ _id: ObjectId(result[0]?.user_id) });
    const companyDoc = await Companies.findById(result[0].customer);
    if (!companyDoc) throw new Error(`invalid id for customer. Exiting invoice pdf preview generattion`);

    let array = [
      { key: 'invoicenumber', value: result[0].invoice_number },
      // handle account and bank details
      {
        key: 'account_number',
        value:sponsorType === 'executive employment services'
            ? '11771253920002'
            : '11403139820001',
      },
      {
        key: 'swift_code',
        value:sponsorType === 'executive employment services'
            ? 'ADCBAEAA'
            : 'ADCBAEAA',
      },
      {
        key: 'iban_number',
        value:sponsorType === 'executive employment services'
            ? 'AE640030011771253920002'
            : 'AE460030011403139820001',
      },
      {
        key: 'bank_name',
        value: sponsorType === 'executive employment services'
            ? 'ABU Dhabi Commercial Bank'
            : 'ABU Dhabi Commercial Bank',
      },
      // { key: 'trnnumber', value: companyDoc.trn_number || '' },

      // { key: 'trnnumber', value: companyDoc.trn_number || '' },
      { key: 'invoicedate', value: formatDate(result[0].invoice_date) },
      { key: 'invoicedue', value: formatDate(result[0].due_date) },
      { key: 'invoiceterm', value: result[0].terms_name },
      { key: 'currency', value: result[0].currency || 'AED' },
      { key: 'subtotal', value: thousandSeparator(result[0].sub_total) },
      { key: 'totalvat', value: thousandSeparator(result[0].vat_total) },
      { key: 'tax', value: result[0].vat_total },
      { key: 'totaltax', value: result[0].vat_total },
      { key: 'total', value: thousandSeparator(result[0].total) },
      { key: 'balance_due', value: thousandSeparator(result[0].total) },
      { key: 'user', value: companyDoc && companyDoc.company_name },
      { key: 'date_created', value: moment(result[0].createdAt).format('Do MMMM YYYY') },
      // { key: 'user', value: `${userDoc?.first_name} ${userDoc?.middle_name || " "}` },
      {
        key: 'billing_address',
        value: result[0].billing_address
          ? result[0].billing_address
          : companyDoc.company_address
          ? companyDoc.company_address
          : '',
      },
      { key: 'customer_notes', value: result[0].customer_notes ? result[0].customer_notes : '' },
      { key: 'terms_condition', value: result[0].terms_condition ? result[0].terms_condition : '' },
    ];

    if (companyDoc.trn_number && companyDoc.trn_number.trim() !== '') {
      array.push(
        { key: 'trnnumber', value: (companyDoc && companyDoc.trn_number) || '' },
        { key: 'trnLabel:', value: 'TRN Number' || '' }
      );
    }
    if (companyDoc.PO_number && companyDoc.PO_number.trim() !== '') {
      array.push(
        { key: 'ponumber', value: (companyDoc && companyDoc.PO_number) || '' },
        { key: 'poLabel:', value: 'PO Number' || '' }
      );
    }
    console.log('end of table array');
    let tablearray = [];
    if (result[0].items.length === 0) {
      tablearray.push({
        service: 'No items',
        rate: '0',
        amount: '0',
        quantity: 0,
        vat: '0',
        description: 'No items added to this invoice',
      });
    } else {
      for (let index = 0; index < result[0].items.length; index++) {
        const element = result[0].items[index];
        console.log(element.description, 'here is the description text---------->');
        let obj = {
          // service: element.service_name,
          service: typeof element.service_name === 'object' ? element.service_name.name : element.service_name,
          rate: thousandSeparator(element.rate),
          amount: thousandSeparator(element.amount),
          quantity: element.quantity,
          vat: thousandSeparator(element.vat_amount),
          description: (element && element.description) || '',
          // net_total: element?.net_total ? thousandSeparator(element.net_total) : '0',
          net_total:
            element && element.net_total
              ? typeof element.net_total === 'object'
                ? thousandSeparator(parseFloat(element.amount || 0)) // Use amount if net_total is an object
                : thousandSeparator(parseFloat(element.net_total))
              : '0',
        };
        tablearray.push(obj);
      }
    }

    console.log(JSON.stringify(array), 'end array----------->');
    console.log(JSON.stringify([{ tablename: 'invoicetable', table: tablearray }]), 'end------------>');
    console.log(result[0].items, 'end items------------->', result[0].items.length, 'now this is the length of items');

    let obj = {
      replaceText: JSON.stringify(array),
      replaceTable: JSON.stringify([{ tablename: 'invoicetable', table: tablearray }]),
      replaceImage: JSON.stringify([
        { key: 'logo', value: 'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg' },
      ]),
      content: content[0].content,
    };

    let response = await axios.post(
      process.env.documenturl + 'api/DocumentEditor/ReplaceContenttoPDF',
      JSON.stringify(obj),
      { headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' }, responseType: 'arraybuffer' }
    );
    let url = await uploadLetterArrayBuffer(response.data, `invoice_${result[0].invoice_number}.pdf`);
    console.log('start of url------------------>', url, 'this is the generated URL from get preview============>');
    return { url: url, name: `invoice_${result[0].invoice_number}.pdf` };
  } catch (error) {
    throw error;
  }
};

const getUserFullName = function (obj_userInfo) {
  if (obj_userInfo) {
    var name = '';
    if (obj_userInfo.first_name != undefined) {
      name += obj_userInfo.first_name + ' ';
    }
    if (obj_userInfo.middle_name != undefined) {
      name += obj_userInfo.middle_name + ' ';
    }
    if (obj_userInfo.last_name != undefined) {
      name += obj_userInfo.last_name;
    }
    return name;
  } else {
    return '';
  }
};

const uploadLetterArrayBuffer = async (fileContent, fileName) => {
  try {
    console.log('start of upload letter array buffer------------------->');
    const s3 = new AWS.S3({
      accessKeyId: process.env.SECRET_ID_AWS,
      secretAccessKey: process.env.SECRET_KEY_AWS,
    });

    const params = {
      Bucket: process.env.BUCKET_NAME + '/' + `invoices`,
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: 'application/pdf',
    };

    // Returning a promise to handle the asynchronous upload operation
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Location);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

const currencyList = async () => {
  const currencyList = ['AED', 'USD', 'EUR'];
  return currencyList;
};

const InvoiceStatusCheck = async (InvoiceId) => {
  return Invoice.findOne({ _id: InvoiceId }).select({ status: 1 });
};

// Helper function to get the date from a "Every X" format
// const getDateFromSchedule = (scheduleString, monthlyInvoice= false) => {
//     console.log(monthlyInvoice, "is the value for monthly invoice!!!!!!!!!")
//     if (monthlyInvoice) {
//         console.log("found monthly invoice running the first condition")
//         console.log(scheduleString, "this is the schedule string", typeof scheduleString);

//         const match = scheduleString.display.match(/\d+/);  // Extract the first number
//         console.log(match, 'this is the value for match')
//     if (match) {
//         return parseInt(match[0], 10);  // Return the extracted number (e.g., 4)
//     } else {
//         throw new Error('Invalid schedule format');
//     }
//     } else {
//         console.log("running else condition for if on schedule")
//     const dayMatch = scheduleString.match(/Every (\d+)/);
//     return dayMatch ? parseInt(dayMatch[1], 10) : null;
//     }

//   };
const getDateFromSchedule = (scheduleString, monthlyInvoice = false) => {
  try {
    if (monthlyInvoice) {
      // console.log("Checking monthly invoice schedule format...");
      // console.log(scheduleString, "this is the schedule string", typeof scheduleString);

      const match = scheduleString.display.match(/\d+/); // Extract the first number
      // console.log(match, 'this is the value for match');

      if (match) {
        return parseInt(match[0], 10); // Return the extracted number (e.g., 4)
      } else {
        throw new Error('Invalid schedule format');
      }
    } else {
      // console.log("Checking other schedule formats...");
      const dayMatch = scheduleString.match(/Every (\d+)/);
      return dayMatch ? parseInt(dayMatch[1], 10) : null;
    }
  } catch (err) {
    console.error('Error parsing schedule string:', scheduleString, 'Error:', err.message);
    return null; // Safely return null if parsing fails
  }
};

const createInvoiceJournalEntry = async (data) => {
  const result = await generateJournalEntry(data);
  return result;
};

const generateJournalEntry = async (data) => {
  let newJournalNumber;
  const lastJournalNumber = await journalEntryService.getLastJournalEntry();
  if (!lastJournalNumber) {
    newJournalNumber = 'JN-0001';
  } else {
    let currentNum = parseInt(lastJournalNumber.journal_number.split('-')[1]);
    let nextNum = currentNum + 1;
    let leadingZeros = '0'.repeat(4 - nextNum.toString().length);
    newJournalNumber = 'JN-' + leadingZeros + nextNum;
  }
  data.journal_number = newJournalNumber;
  console.log('creating je from invoice service');
  const result = await journalEntryService.createJournalEntry(data);
  if (result) console.log('created journal entry^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  return result;
};
/**
 * This function will send out notification emails to employers
 * It takes in an atttachment-> the invoice due
 */
async function sendEmailNotificationEmail(invoice, emailTemplateName) {
  const company = await Companies.findById(invoice.company);
  const emailTemplateDoc = await emailTemplate.findOne({ name: emailTemplateName });
  if (!emailTemplateDoc) throw new Error(`Could not find email template with name ${emailTemplateName}`);

  const replacedEmail = await emailTemplateService.getEmailTemplateOnIDWithoutContent(emailTemplateDoc._id, company._id);
  // get pdf preview for invoice
  const invoicepdf = await getPreviewPDF(invoice._id);
  let attachments = [
    {
      filename: invoicepdf.url.toString().split('/')[4],
      path: invoicepdf.url,
    },
  ];
  console.log('This is the attachments array===========', attachments, '=================');
  await sendRawEmail(replacedEmail.to, replacedEmail.subject, replacedEmail.content, replacedEmail.cc, attachments);
}

/**
 * Function to manually generate monthly invoice from the system
 * This implementation is based on requirements from finance team
 */
async function manualMonthlyInvoiceGeneration(companyId) {
  try {
    const company = await Companies.findOne({ _id: companyId, is_deleted: false, status: 'active' });
    if (!company) {
      throw new Error('Company not found or not active');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoiceDay = getDateFromSchedule(company.payroll_schedule.invoice_date, true);
    const paymentDay = getDateFromSchedule(company.payroll_schedule.salary_payment_date, true);

    // If any critical value is null, log and return error
    if (invoiceDay === null || paymentDay === null) {
      throw new Error(`Invalid schedule format for company: ${company._id} (${company.company_name})`);
    }

    // Generate invoice regardless of the date
    console.log(`Generating invoice for ${company.company_name}`);
    const newInvoice = await createMonthlyInvoice(company);
    console.log(`Generated monthly invoice for ${company.company_name}: ${newInvoice.invoice_number}`);

    // Send payment due notification
    const upcomingInvoice = await Invoice.findOne({
      company: company._id,
      status: 'Due',
      due_date: { $gte: today },
      type: { $regex: /monthly invoice/i },
    }).sort({ due_date: 1 });

    if (upcomingInvoice) {
      // Here you might want to implement the actual notification sending
      console.log(`Would send payment due notification for invoice: ${upcomingInvoice.invoice_number}`);
    }

    // Check for and handle overdue invoices
    const overdueInvoices = await Invoice.find({
      company: company._id,
      status: 'Due',
      due_date: { $lt: today },
      type: { $regex: /monthly invoice/i },
    });

    for (const overdueInvoice of overdueInvoices) {
      // Update status to overdue
      overdueInvoice.status = 'Overdue';
      await overdueInvoice.save();

      // Here you might want to implement the actual overdue notification
      console.log(`Would send overdue notification for invoice: ${overdueInvoice.invoice_number}`);
    }

    console.log('Manual invoice generation completed.');
    return newInvoice;
  } catch (error) {
    console.error('Error in manual invoice generation:', error);
    throw error;
  }
}

function getInvoiceDateRange(payrollSchedule) {
  const currDate = new Date();
  const invoiceDay = getDateFromSchedule(payrollSchedule.invoice_date, true);

  // Current invoice date
  const currentInvoiceDate = new Date(currDate.getFullYear(), currDate.getMonth(), invoiceDay);
  currentInvoiceDate.setUTCHours(0, 0, 0, 0);

  // Previous invoice date (subtract one month)
  const previousInvoiceDate = new Date(currentInvoiceDate);
  previousInvoiceDate.setMonth(currentInvoiceDate.getMonth() - 1);

  // Format the dates
  const formattedPreviousDate = previousInvoiceDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedCurrentDate = currentInvoiceDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return { previousDate: formattedPreviousDate, currDate: formattedCurrentDate };
}
/**
 * ==========================================================================================
 * Function to generatte security deposit invoice based on work order
 * The functionality considers all the amounts charged on employees as security deposit
 * From onboarding, the function works with what is in the upfront_costs object
 *  -Note: The preview for these invoices are handled using the if condition on get previews
 * ==========================================================================================
 */

// This implementation does not run the if condition to check invoice format
// const generateSecurityDepositAndMobilizationInvoiceWorking = async (company, reqBody = {}) => {
//     try {
//         const { date_range } = reqBody;
//         const startDate = formatDate(date_range?.start_date);
//         const endDate = formatDate(date_range?.end_date);

//         const companyDoc = await Companies.findOne({ is_deleted: false, _id: ObjectId(company._id) });
//         if (!companyDoc) throw new Error(`Invalid company id ${company._id}! Exiting security deposit generation`);

//         let query = {
//             is_deleted: false,
//             company_id: ObjectId(company._id),
//             user_status: { $in: ['onboarding', 'new visa process', 'active'] }
//         };

//         if (date_range) {
//             const { start_date, end_date } = date_range;
//             query.date_of_joining = {
//                 $gte: new Date(start_date),
//                 $lte: new Date(end_date)
//             };
//         }

//         const employees = await Users.find(query);
//         const employeeCount = employees.length;
//         console.log(employeeCount, 'is the employee count-------->');

//         const reconstructedItems = [];
//         let computedSecurityDeposit = 0;
//         let computedMobilizationCost = 0;

//         for (let employee of employees) {
//             const fullName = `${employee.first_name} ${employee.last_name}`;
//             let employeeSecurityDeposit = 0.00;
//             let employeeMobilizationCost = 0.00;

//             // Fetch corresponding onboarding doc
//             const onboardingDoc = await Onboardings.findOne({ user_id: employee._id });
//             if (onboardingDoc) {
//                 console.log(`Processing onboarding-> ${onboardingDoc._id}`);

//                 // Validate and ensure numeric values
//                 employeeSecurityDeposit = Number.isFinite(onboardingDoc && onboardingDoc.upfront_costs?.security_deposit)
//                     ? onboardingDoc.upfront_costs.security_deposit
//                     : 0.00;

//                 employeeMobilizationCost = Number.isFinite(onboardingDoc && onboardingDoc.upfront_costs?.total_mobilization_cost)
//                     ? onboardingDoc.upfront_costs.total_mobilization_cost
//                     : 0.00;

//                 computedSecurityDeposit += employeeSecurityDeposit;
//                 computedMobilizationCost += employeeMobilizationCost;
//             }

//             const currentDate = new Date();
//             const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
//             const currentYear = currentDate.getFullYear();

//             reconstructedItems.push({
//                 _id: employee._id,
//                 service_name: `Security Deposit and Mobilization Charges`,
//                 description: `${fullName} - ${currentMonth} ${currentYear}`,
//                 rate: (employeeSecurityDeposit + employeeMobilizationCost).toFixed(2),
//                 quantity: 1,
//                 amount: (employeeSecurityDeposit + employeeMobilizationCost).toFixed(2),
//                 vat_amount: 0.00,
//                 user: {
//                     _id: employee._id,
//                     first_name: employee.first_name,
//                     last_name: employee.last_name,
//                     email: employee.email,
//                     designation: employee.designation,
//                     emp_id: employee.emp_id,
//                     employment: employee.employment,
//                     salary: employee.salary,
//                     date_of_joininng: employee && employee.date_of_joininng || ''
//                 },
//                 companyName: company.company_name,
//                 upfront_costs: onboardingDoc && onboardingDoc.upfront_costs || {},
//                 security_deposit: employeeSecurityDeposit.toFixed(2),
//                 totalMobilizationCos: employeeMobilizationCost.toFixed(2),
//             });
//         }

//         const adminFee = {
//             service_name: "Service Fee",
//             description: 'Nathan & Nathan Service Fee',
//             rate: 0.00,
//             quantity: employeeCount,
//             amount: 0.00,
//             vat_amount: 0.00,
//             _id: new ObjectId(),
//             companyName: company.company_name,
//         };
//         reconstructedItems.push(adminFee);

//         // Validate and calculate totals
//         const subTotal = reconstructedItems.reduce((acc, item) => {
//             const amount = Number.isFinite(parseFloat(item.amount)) ? parseFloat(item.amount) : 0.00;
//             return acc + amount;
//         }, 0).toFixed(2);

//         const vatTotal = 0.00;
//         const total = parseFloat(subTotal).toFixed(2);
//         const balanceDue = parseFloat(total).toFixed(2);

//         const invoicePayload = {
//             invoice_number: await generateInvoiceNumber(),
//             type: 'Security Deposit & Mobilization Invoice',
//             customer: company._id,
//             company: company._id,
//             customer_address: company.company_address,
//             customer_notes: `Security Deposit & Mobilization Invoice (${company.company_name})`,
//             terms_condition: '',
//             customer_name: company.company_name,
//             email: company.email,
//             billing_address: company.company_address,
//             terms: '644a5e16e60f06ccb37e9716',
//             terms_name: 'Security Deposit Terms',
//             status: '',
//             balance_due: balanceDue,
//             total: total,
//             items: reconstructedItems,
//             sub_total: subTotal,
//             vat_total: vatTotal,
//             invoice_date: new Date(),
//             due_date: new Date(),
//             is_recurring: false,
//             is_draft: false,
//             details_field: {
//                 employee_fullName: reconstructedItems.map(item =>
//                     item.user ? `${item.user.first_name} ${item.user.last_name}` : `${company.company_name}`
//                 ).join(', '),
//                 description: `Security Deposit Invoice for ${company.company_name}`,
//             },
//             memo: `Security Deposit and Mobilization Charges Invoice for ${company.company_name}. ${
//                 date_range && date_range.start_date && date_range.end_date
//                     ? `${currentDate} - ${currentYear}`
//                     : ''
//             }`,
//         };

//         const invoice = await Invoice.create(invoicePayload);
//         const preview = await getPreviewPDF(invoice._id);
//         invoice.invoice_link = preview.url;
//         await invoice.save();

//         return invoice;

//     } catch (error) {
//         console.log(`Error in generateSecurityDepositAndMobilizationInvoice: ${error.message}`);
//         throw new Error(error);
//     }
// };
const generateSecurityDepositAndMobilizationInvoice = async (company, reqBody = {}) => {
  try {
    const { date_range } = reqBody;
    const startDate = formatDate(date_range && date_range.start_date);
    const endDate = formatDate(date_range && date_range.end_date);

    const companyDoc = await Companies.findOne({ is_deleted: false, _id: ObjectId(company._id) });
    if (!companyDoc) throw new Error(`Invalid company id ${company._id}! Exiting security deposit generation`);

    let query = {
      is_deleted: false,
      company_id: ObjectId(company._id),
      user_status: { $in: ['onboarding', 'new visa process', 'active'] },
    };

    if (date_range) {
      const { start_date, end_date } = date_range;
      query.date_of_joining = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    }

    const employees = await Users.find(query);
    const eligibleEmployees = [];

    // Filter eligible employees with valid costs upfront
    for (let employee of employees) {
      const onboardingDoc = await Onboardings.findOne({ user_id: employee._id });
      if (!onboardingDoc) continue;

      const securityDeposit = Number.isFinite(
        onboardingDoc && onboardingDoc.upfront_costs && onboardingDoc.upfront_costs.security_deposit
      )
        ? onboardingDoc.upfront_costs.security_deposit
        : 0.0;
      const mobilizationCost = Number.isFinite(
        onboardingDoc && onboardingDoc.upfront_costs && onboardingDoc.upfront_costs.total_mobilization_cost
      )
        ? onboardingDoc.upfront_costs.total_mobilization_cost
        : 0.0;

      if (securityDeposit > 0 || mobilizationCost > 0) {
        eligibleEmployees.push({
          employee,
          onboardingDoc,
          securityDeposit,
          mobilizationCost,
        });
      }
    }

    console.log(`Found ${eligibleEmployees.length} eligible employees with valid costs`);

    if (eligibleEmployees.length === 0) {
      console.log('No eligible employees found with security deposit or mobilization costs > 0');
      return [];
    }

    if (companyDoc.invoice_format === 'company') {
      // Company-wide invoice logic for eligible employees only
      const reconstructedItems = [];
      let computedSecurityDeposit = 0;
      let computedMobilizationCost = 0;

      for (let { employee, securityDeposit, mobilizationCost, onboardingDoc } of eligibleEmployees) {
        const fullName = `${employee.first_name} ${employee.last_name}`;
        computedSecurityDeposit += securityDeposit;
        computedMobilizationCost += mobilizationCost;

        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = currentDate.getFullYear();

        reconstructedItems.push({
          _id: employee._id,
          service_name: `Security Deposit and Mobilization Charges`,
          description: `${fullName} - ${currentMonth} ${currentYear}`,
          rate: (securityDeposit + mobilizationCost).toFixed(2),
          quantity: 1,
          amount: (securityDeposit + mobilizationCost).toFixed(2),
          vat_amount: 0.0,
          user: {
            _id: employee._id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            designation: employee.designation,
            emp_id: employee.emp_id,
            employment: employee.employment,
            salary: employee.salary,
            date_of_joininng: (employee && employee.date_of_joininng) || '',
          },
          companyName: company.company_name,
          upfront_costs: (onboardingDoc && onboardingDoc.upfront_costs) || {},
          security_deposit: securityDeposit.toFixed(2),
          totalMobilizationCos: mobilizationCost.toFixed(2),
        });
      }

      const adminFee = {
        service_name: 'Service Fee',
        description: 'Nathan & Nathan Service Fee',
        rate: 0.0,
        quantity: eligibleEmployees.length,
        amount: 0.0,
        vat_amount: 0.0,
        _id: new ObjectId(),
        companyName: company.company_name,
      };
      reconstructedItems.push(adminFee);

      const subTotal = reconstructedItems
        .reduce((acc, item) => {
          const amount = Number.isFinite(parseFloat(item.amount)) ? parseFloat(item.amount) : 0.0;
          return acc + amount;
        }, 0)
        .toFixed(2);

      const vatTotal = 0.0;
      const total = parseFloat(subTotal).toFixed(2);
      const balanceDue = parseFloat(total).toFixed(2);

      const invoicePayload = {
        invoice_number: await generateInvoiceNumber(),
        type: 'Security Deposit & Mobilization Invoice',
        customer: company._id,
        company: company._id,
        customer_address: company.company_address,
        customer_notes: `Security Deposit & Mobilization Invoice (${company.company_name})`,
        terms_condition: '',
        customer_name: company.company_name,
        email: company.email,
        billing_address: company.company_address,
        terms: '644a5e16e60f06ccb37e9716',
        terms_name: 'Security Deposit Terms',
        status: '',
        balance_due: balanceDue,
        total: total,
        items: reconstructedItems,
        sub_total: subTotal,
        vat_total: vatTotal,
        invoice_date: new Date(),
        due_date: new Date(),
        is_recurring: false,
        is_draft: false,
        details_field: {
          employee_fullName: reconstructedItems
            .map((item) => (item.user ? `${item.user.first_name} ${item.user.last_name}` : `${company.company_name}`))
            .join(', '),
          description: `Security Deposit Invoice for ${company.company_name}`,
        },
        memo: `Security Deposit and Mobilization Charges Invoice for ${company.company_name}. ${
          date_range && date_range.start_date && date_range.end_date
            ? `${date_range.start_date} - ${date_range.end_date}`
            : `${currentMonth}, ${currentYear}`
        }`,
      };

      const invoice = await Invoice.create(invoicePayload);
      const preview = await getPreviewPDF(invoice._id);
      invoice.invoice_link = preview.url;
      await invoice.save();

      return invoice;
    } else {
      console.log('-------->generating individual invoices for eligible employees----------------->');
      // Individual invoice generation for eligible employees only
      const generatedInvoices = [];

      for (let { employee, securityDeposit, mobilizationCost, onboardingDoc } of eligibleEmployees) {
        console.log(`----->generating individual invoice for ${employee.first_name} ${employee.last_name}!!!!!!!!!!!!!!!!`);
        const reconstructedItems = [];

        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = currentDate.getFullYear();

        reconstructedItems.push({
          _id: employee._id,
          service_name: `Security Deposit and Mobilization Charges`,
          description: `${employee.first_name} ${employee.last_name} - ${currentMonth} ${currentYear}`,
          rate: (securityDeposit + mobilizationCost).toFixed(2),
          quantity: 1,
          amount: (securityDeposit + mobilizationCost).toFixed(2),
          vat_amount: 0.0,
          user: {
            _id: employee._id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            designation: employee.designation,
            emp_id: employee.emp_id,
            employment: employee.employment,
            salary: employee.salary,
            date_of_joininng: (employee && employee.date_of_joininng) || '',
          },
          companyName: company.company_name,
          upfront_costs: (onboardingDoc && onboardingDoc.upfront_costs) || {},
          security_deposit: securityDeposit.toFixed(2),
          totalMobilizationCos: mobilizationCost.toFixed(2),
        });

        const adminFee = {
          service_name: 'Service Fee',
          description: 'Nathan & Nathan Service Fee',
          rate: 0.0,
          quantity: 1,
          amount: 0.0,
          vat_amount: 0.0,
          _id: new ObjectId(),
          companyName: company.company_name,
        };
        reconstructedItems.push(adminFee);

        const subTotal = (securityDeposit + mobilizationCost).toFixed(2);
        const vatTotal = 0.0;
        const total = subTotal;
        const balanceDue = total;

        const invoicePayload = {
          invoice_number: await generateInvoiceNumber(),
          type: 'Security Deposit & Mobilization Invoice',
          customer: company._id,
          company: company._id,
          customer_address: company.company_address,
          customer_notes: `Security Deposit & Mobilization Invoice for ${employee.first_name} ${employee.last_name}`,
          terms_condition: '',
          customer_name: company.company_name,
          email: employee.email,
          billing_address: company.company_address,
          terms: '644a5e16e60f06ccb37e9716',
          terms_name: 'Security Deposit Terms',
          status: '',
          balance_due: balanceDue,
          total: total,
          items: reconstructedItems,
          sub_total: subTotal,
          vat_total: vatTotal,
          invoice_date: new Date(),
          due_date: new Date(),
          is_recurring: false,
          is_draft: false,
          is_individual_invoice: true,
          details_field: {
            employee_fullName: `${employee.first_name} ${employee.last_name}`,
            description: `Security Deposit Invoice for ${employee.first_name} ${employee.last_name}`,
          },
          memo: `Security Deposit and Mobilization Charges Invoice for ${employee.first_name} ${employee.last_name}. ${
            date_range && date_range.start_date && date_range.end_date ? `${startDate} - ${endDate}` : ''
          }`,
        };

        const invoice = await Invoice.create(invoicePayload);
        const preview = await getPreviewPDF(invoice._id);
        invoice.invoice_link = preview.url;
        await invoice.save();

        generatedInvoices.push(invoice);
        console.log(
          `Generated individual security deposit invoice for ${employee.first_name} ${employee.last_name}: ${invoice.invoice_number}`
        );
      }

      return generatedInvoices;
    }
  } catch (error) {
    console.log(`Error in generateSecurityDepositAndMobilizationInvoice: ${error.message}`);
    throw new Error(error);
  }
};
/**
 * This is the latest working version with notifications set
 */
cron.schedule(
  '0 1 * * *',
  async () => {
    // const februaryStart = new Date(2025, 1, 4); // February 1st, 2025
    // const februaryEnd = new Date(2025, 4, 28, 23, 59, 59); // February 28th, 2025
    console.log('---------------------------------->  generating monthly invoice   <===============================>');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Find all active companies
      const companies = await Companies.find({
        is_deleted: false,
        status: 'active',
        'payroll_schedule.automated_payroll.value': true,
      });
      console.log(`Found ${companies.length} active companies`);

      for (const company of companies) {
        try {
          console.log(company._id, 'this is the current company ID:', company.company_name);

          const invoiceDay = getDateFromSchedule(company.payroll_schedule.invoice_date, true);
          const paymentDay = getDateFromSchedule(company.payroll_schedule.salary_payment_date, true);
          const notificationDay = invoiceDay - 5; // Notification 5 days before due date
          const overdueNotificationDay = paymentDay + 2; // Notification 2 days after payment date

          // If any critical value is null, log and skip this company
          if (invoiceDay === null || paymentDay === null) {
            console.warn(`Invalid schedule format for company: ${company._id} (${company.company_name}). Skipping...`);
            continue;
          }

          // Generate invoice if today is the invoice date
          if (today.getDate() === invoiceDay) {
            console.log(`Generating invoice for ${company.company_name}`);
            if (company.invoice_format == 'company') {
              console.log(`Invoice format for company is ${company.invoice_format} --> generating general monthly  invoice`);
              // const newInvoice = await createMonthlyInvoice(company);
              console.log(`Generated monthly invoice for ${company.company_name}: ${newInvoice.invoice_number}`);
            } else {
              console.log(
                `Invoice format for company is ${company.invoice_format} --> generating invoices for individual employees`
              );
              // const employeeInvoices = await generateInvoicesForCompany(company._id);
            }
          }

          // Send payment due notification 5 days before due date
          if (today.getDate() === notificationDay) {
            console.log(`Sending payment notification for ${company.company_name}`);
            const upcomingInvoice = await Invoice.findOne({
              company: company._id,
              status: 'Due',
              due_date: { $gte: today },
              type: { $regex: /monthly invoice/i },
            }).sort({ due_date: 1 });

            if (upcomingInvoice) {
              if (!company.requires_payroll_input) {
                // await sendEmailNotificationEmail(upcomingInvoice, "Invoice Payment Due");
                console.log(`Sent payment due notification for invoice: ${upcomingInvoice.invoice_number}`);
              } else {
                console.log(`Notification not sent since invoice ${upcomingInvoice.invoice_number} requires payroll input`);
              }
            }
          }

          // Check for overdue invoices and send notifications
          const overdueInvoices = await Invoice.find({
            company: company._id,
            status: 'Due',
            due_date: { $lt: today },
            type: { $regex: /monthly invoice/i },
          });

          for (const overdueInvoice of overdueInvoices) {
            // Update status to overdue
            overdueInvoice.status = 'Overdue';
            await overdueInvoice.save();

            // Send overdue notification 2 days after payment date
            if (today.getDate() === overdueNotificationDay) {
              // await sendEmailNotificationEmail(overdueInvoice, "Overdue Invoice Reminder");
              console.log(`Sent overdue notification for invoice: ${overdueInvoice.invoice_number}`);
            }
          }
        } catch (err) {
          console.error(`Error processing company ${company._id} (${company.company_name}):`, err);
        }
      }

      console.log('Invoice generation and notification cron job completed successfully.');
    } catch (error) {
      console.error('Error in invoice generation and notification cron job:', error);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Dubai',
  }
);

/**
 * gENERATE NOVERMBER INVOICES
 */

// Cron job to run at a specific time for February 2025 invoices
// cron.schedule('*/5 * * * *', async () => {
//     console.log("---------------------------------->  generating monthly invoices for Feb 2025   <===============================>");

//     // Define February 2025 date range
//     const februaryStart = new Date(2025, 1, 1); // February 1st, 2025
//     const februaryEnd = new Date(2025, 1, 28, 23, 59, 59); // February 28th, 2025

//     try {
//         // Find all active companies
//         const companies = await Companies.find({
//             is_deleted: false,
//             status: "active",
//             // _id: ObjectId("647891f4db2d9a5f80b45181")
//         });

//         console.log(`Found ${companies.length} active companies`);
//         let count = 0;

//         // Loop through each company and generate monthly invoices
//         for (const company of companies) {
//             try {
//                 count += 1;
//                 console.log(company._id, "this is the current company ID:", company.company_name);

//                 // Check the invoice format and generate appropriate invoices
//                 if (company.invoice_format == 'company') {
//                     console.log(`Invoice format for company is ${company.invoice_format} --> generating general monthly invoice`);
//                     const newInvoice = await createMonthlyInvoice(company, februaryStart, februaryEnd);
//                     console.log(`Generated monthly invoice for ${company.company_name}: ${newInvoice.invoice_number}`);
//                 } else {
//                     console.log(`Invoice format for company is ${company.invoice_format} --> generating invoices for individual employees`);
//                     const employeeInvoices = await generateInvoicesForCompany(company._id, null, februaryStart, februaryEnd);
//                 }

//                 console.log(`Generated monthly invoice for ${company.company_name}: ----------------> ${count}----------->`);
//             } catch (err) {
//                 console.error(`Error processing company ${company._id} (${company.company_name}):`, err);
//             }
//         }

//         console.log('=======================================>Monthly invoice generation cron job completed successfully=========================================================================>.');
//     } catch (error) {
//         console.error('Error in monthly invoice generation cron job:', error);
//     }
// }, {
//     scheduled: true,
//     timezone: 'Asia/Dubai',
// });

/**
 * Generate invoices for individual employees of a company
 * @param {ObjectId} companyId - The ID of the company
 * @param {ObjectId|null} userId - Optional user ID to generate invoice for a specific employee
 * @param {Date} startDate - The start date for the invoice period (optional)
 * @param {Date} endDate - The end date for the invoice period (optional)
 */
async function generateInvoicesForCompany(companyId, userId = null, startDate, endDate) {
  // Set default dates if not provided (for cron job)
  if (!startDate) {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of current month
  }

  if (!endDate) {
    const currentDate = new Date();
    // Last day of current month
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }
  try {
    const company = await Companies.findOne({ _id: companyId, is_deleted: false, status: 'active' });
    if (!company) {
      throw new Error('Company not found or not active');
    }

    let users;
    if (userId) {
      users = await Users.find({
        _id: userId,
        company_id: ObjectId(company._id),
        is_deleted: false,
        user_status: { $in: ['active', 'onboarding', 'new visa process', 'offboarding'] },
      });
    } else {
      console.log(
        '=======> ^^^^ Executing second condition for users to generate individual employee invoices for the month---------->'
      );
      users = await Users.find({
        company_id: ObjectId(company._id),
        user_status: { $in: ['active', 'onboarding', 'visa process', 'offboarding'] },
      });
    }

    if (users.length === 0) {
      console.log(`No users found for invoice generation in company ${company.company_name}.`);
      return;
    }

    // Group users by visa_sponsor_type
    const usersByVisaSponsor = {
      'Dynamic Employment Services': [],
      'Executive Employment Services': [],
    };

    // Categorize users by visa sponsor type
    for (const user of users) {
      const sponsorType = (user.employment && user.employment.visa_sponsor_type) || 'Dynamic Employment Services';
      if (sponsorType === 'Dynamic Employment Services' || sponsorType === 'Executive Employment Services') {
        usersByVisaSponsor[sponsorType].push(user);
      } else {
        // Default to Dynamic Employment Services if type is not recognized
        usersByVisaSponsor['Dynamic Employment Services'].push(user);
      }
    }

    // Generate separate invoices for each visa sponsor type
    const generatedInvoices = [];

    // Process each visa sponsor type group
    for (const [visaSponsorType, sponsorUsers] of Object.entries(usersByVisaSponsor)) {
      if (sponsorUsers.length === 0) continue;

      console.log(`Generating invoice for ${visaSponsorType} employees. Count: ${sponsorUsers.length}`);

      let clientMonthlyCosts = 0;
      const reconstructedItems = [];

      // Process each user in this visa sponsor group
      for (const user of sponsorUsers) {
        console.log(`Processing ${user.first_name} ${user.last_name} for ${visaSponsorType} invoice`);

        const monthlyCosts =
          visaSponsorType === 'Dynamic Employment Services' ? company.monthly_costs : company.monthly_costs_ees;

        // Calculate costs for this user
        const costsForClient = parseFloat(
          Object.entries(monthlyCosts)
            .filter(([key]) => key !== 'employee_salary') // Exclude `employee_salary`
            .reduce((total, [, item]) => {
              const value = typeof item === 'string' ? parseFloat(item) : item;
              return typeof value === 'number' && isFinite(value) ? total + value : total;
            }, 0)
        );
        clientMonthlyCosts += costsForClient;

        const totalFixedSalary = (Number(user.salary.total_fixed) || 0).toFixed(2);
        const computedTotalSalary = totalFixedSalary;

        // Use the specified date range or current date if not provided
        const currentDate = new Date();
        const currentMonth = startDate
          ? startDate.toLocaleString('default', { month: 'long' })
          : currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = startDate ? startDate.getFullYear() : currentDate.getFullYear();

        const monthAndYear = `${currentMonth} ${currentYear}`;

        // Add this employee to the invoice items
        reconstructedItems.push({
          _id: user._id,
          service_name: `Monthly salary`,
          description: `${user.first_name} ${user.last_name} - ${monthAndYear}`,
          rate: computedTotalSalary,
          quantity: 1,
          amount: computedTotalSalary,
          vat_amount: ((5 / 100) * computedTotalSalary).toFixed(2),
          // net total should be the sum of amount and vat_total
          net_total: (Number(computedTotalSalary) + Number((5 / 100) * computedTotalSalary)).toFixed(2),
          user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            designation: user.designation,
            emp_id: user.emp_id,
            employment: user.employment,
            salary: user.salary,
          },
          companyName: company.company_name,
          monthlyCosts,
          totalFixedSalary: totalFixedSalary,
          totalPayableSalary: computedTotalSalary,
        });
      } // End of user loop for this visa sponsor type

      // Calculate total monthly costs for this visa sponsor group
      const totalMonthlyCosts = parseFloat(clientMonthlyCosts.toFixed(2));

      // Add admin fee for this visa sponsor group
      const adminFee = {
        service_name: 'Service Fee',
        description: `Nathan & Nathan Service Fee - ${visaSponsorType}`,
        rate: clientMonthlyCosts,
        quantity: 1,
        amount: totalMonthlyCosts,
        vat_amount: ((5 / 100) * clientMonthlyCosts).toFixed(2),
        _id: new ObjectId(),
        companyName: company.company_name,
      };
      reconstructedItems.push(adminFee);

      // Set invoice and payment dates
      const invoiceDay = getDateFromSchedule(company.payroll_schedule.invoice_date, true);
      const salaryPaymentDay = getDateFromSchedule(company.payroll_schedule.salary_payment_date, true);

      // Set due date and payment date
      const dueDate = startDate
        ? new Date(startDate.getFullYear(), startDate.getMonth(), invoiceDay)
        : new Date(new Date().getFullYear(), new Date().getMonth(), invoiceDay);

      const paymentDate = startDate
        ? new Date(startDate.getFullYear(), startDate.getMonth(), salaryPaymentDay)
        : new Date(new Date().getFullYear(), new Date().getMonth(), salaryPaymentDay);

      [dueDate, paymentDate].forEach((date) => date.setUTCHours(0, 0, 0, 0));

      // Generate invoice number
      const newInvoiceID = await generateInvoiceNumber();
      console.log(newInvoiceID, `------>is the generated invoice number for ${visaSponsorType} employees`);

      // Calculate totals
      let totalSalary = 0;
      reconstructedItems.forEach((item) => {
        if (item.service_name === 'Monthly salary') {
          totalSalary += parseFloat(item.amount);
        }
      });

      const subTotal = totalSalary + totalMonthlyCosts;
      const vatOnSalary = ((5 / 100) * totalSalary).toFixed(2);
      const vatOnAdminFee = parseFloat(adminFee.vat_amount);
      const vatTotal = (parseFloat(vatOnSalary) + vatOnAdminFee).toFixed(2);
      const total = (subTotal + parseFloat(vatTotal)).toFixed(2);

      // Date range for invoice memo
      const previousDate = startDate
        ? startDate.toISOString().split('T')[0]
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const currDate = endDate
        ? endDate.toISOString().split('T')[0]
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

      // Get employee names for the invoice
      const employeeNames = sponsorUsers.map((user) => `${user.first_name} ${user.last_name}`).join(', ');

      // Create invoice payload
      const invoicePayload = {
        invoice_number: newInvoiceID,
        type: 'Monthly Invoice',
        customer: company._id,
        company: company._id,
        customer_address: company.company_address,
        customer_notes: `Monthly salary invoice for ${visaSponsorType} employees - ${startDate.toLocaleString('default', {
          month: 'long',
        })} ${startDate.getFullYear()}`,
        terms_condition: '',
        customer_name: `${company.company_name}`,
        email: company.email, // Use company email instead of individual user email
        billing_address:
          `${
            ((company.billing_address && company.billing_address.address_line1) ||
              (company.billing_address && company.billing_address.address_line2),
            company.billing_address && company.billing_address.country,
            (company.billing_address && company.billing_address.city) || '')
          }` ||
          company.company_address ||
          company.company_name,
        shipping_address:
          `${
            ((company.shipping_address && company.shipping_address.address_line1) ||
              (company.shipping_address && company.shipping_address.address_line2),
            company.shipping_address && company.shipping_address.country,
            (company.shipping_address && company.shipping_address.city) || '')
          }` ||
          company.company_address ||
          company.company_name,
        terms: '644a5e16e60f06ccb37e9716',
        administrationCost: clientMonthlyCosts,
        terms_name: 'Custom',
        status: 'Unapproved',
        balance_due: total,
        total: total,
        items: reconstructedItems,
        sub_total: subTotal.toFixed(2),
        vat_total: vatTotal,
        invoice_date: dueDate,
        due_date: paymentDate,
        is_recurring: false,
        is_draft: false,
        visa_sponsor: visaSponsorType, // Set the visa_sponsor field
        details_field: {
          employee_fullName: employeeNames,
          description: `Monthly salary invoice for ${company.company_name} - ${visaSponsorType} employees`,
        },
        memo: `Monthly salary invoice: ${previousDate} to ${currDate} - ${visaSponsorType}`,
        is_individual_invoice: false, // This is now a group invoice
      };

      // Generate and save invoice
      const generatedInvoice = await Invoice.create(invoicePayload);
      generatedInvoices.push(generatedInvoice);

      // Generate journal entries
      const debitResult = await chartOfAccountsService.getChartOfAccountByCode(
        { customer: company._id },
        invoicePayload,
        company._id
      );
      const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, invoicePayload, company._id);
      const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, invoicePayload, company._id);

      const journal_entry = [
        {
          ...debitResult,
          account: ObjectId(debitResult.account),
          customer: ObjectId(company._id),
          amount: total,
          isDebit: true,
          isCredit: false,
        },
        {
          ...creditResult,
          account: ObjectId(creditResult.account),
          customer: ObjectId(company._id),
          amount: subTotal,
          isDebit: false,
          isCredit: true,
        },
      ];

      // Only add VAT entry if there is VAT
      if (parseFloat(vatTotal) > 0) {
        journal_entry.push({
          ...vatResult,
          account: ObjectId(vatResult.account),
          customer: ObjectId(company._id),
          amount: vatTotal,
          isDebit: false,
          isCredit: true,
        });
      }

      // Generate tax items
      const taxItems = reconstructedItems
        .filter((item) => parseFloat(item.vat_amount) > 0)
        .map((item) => ({
          name: vatResult.name,
          account_name: vatResult.account_name,
          account: vatResult.account,
          isDebit: false,
          isCredit: true,
          isInvoiceRelated: true,
          taxName: 'VAT',
          taxCode: 'VAT',
          totalAmount: parseFloat(item.amount) + parseFloat(item.vat_amount),
          netAmount: parseFloat(item.amount),
          taxAmount: parseFloat(item.vat_amount),
          customer: company._id,
          city: vatResult.city,
        }));

      // Create journal entry
      await createInvoiceJournalEntry({
        line_items: journal_entry,
        sub_total: subTotal.toFixed(2),
        vat_total: vatTotal,
        total: total,
        journal_date: dueDate,
        isInvoiceRelated: true,
        invoice: generatedInvoice._id,
        company: company._id,
        tax_item: taxItems,
        document_id: newInvoiceID,
        document_customer: company.company_name,
        memo_description: `Monthly salary invoice - ${visaSponsorType} - ${startDate.toLocaleString('default', {
          month: 'long',
        })} ${startDate.getFullYear()}`,
      });

      // Generate PDF preview for the invoice
      const preview = await getPreviewPDF(generatedInvoice._id);
      await Invoice.findByIdAndUpdate(generatedInvoice._id, { $set: { invoice_link: preview.url } }, { new: true });

      console.log(`Generated invoice for ${visaSponsorType} employees: ${newInvoiceID}`);
    } // End of visa sponsor type loop

    console.log('Invoice and journal entry generation completed.');
    return generatedInvoices;
  } catch (error) {
    console.error('Error generating invoices and journal entries:', error);
    throw new Error(error.message || 'Error generating invoices');
  }
}

/**
 * Create a monthly invoice for a company with all employees summarized
 * @param {Object} company - The company object
 * @param {Date} startDate - The start date for the invoice period (optional)
 * @param {Date} endDate - The end date for the invoice period (optional)
 */
async function createMonthlyInvoice(company, startDate, endDate) {
  // Set default dates if not provided (for cron job)
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  if (!startDate) {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of current month
  }

  if (!endDate) {
    const currentDate = new Date();
    // Last day of current month
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }
  try {
    console.log(
      company._id,
      'this is the company ID',
      startDate,
      'this is the start date, ',
      endDate,
      'this is the end date'
    );

    const users = await Users.find({
      company_id: company._id,
      is_deleted: false,
      user_status: { $in: ['active', 'onboarding', 'new visa process', 'offboarding'] },
    });
    const invoiceInputs = await InvoiceInputs.find({
      company_id: company._id,
      is_deleted: false,
      status: 'approved',
      input_month: currentMonth,
    });
    console.log(users.length, 'this is the number of users');

    // Group users by visa_sponsor_type
    const usersByVisaSponsor = {
      'Dynamic Employment Services': [],
      'Executive Employment Services': [],
    };

    // Categorize users by visa sponsor type
    for (const user of users) {
      const sponsorType = (user.employment && user.employment.visa_sponsor_type) || 'Dynamic Employment Services';
      if (sponsorType === 'Dynamic Employment Services' || sponsorType === 'Executive Employment Services') {
        usersByVisaSponsor[sponsorType].push(user);
      } else {
        // Default to Dynamic Employment Services if type is not recognized
        usersByVisaSponsor['Dynamic Employment Services'].push(user);
      }
    }

    // Generate separate invoices for each visa sponsor type
    const generatedInvoices = [];

    // Process each visa sponsor type group
    for (const [visaSponsorType, sponsorUsers] of Object.entries(usersByVisaSponsor)) {
      if (sponsorUsers.length === 0) continue;

      console.log(`Generating invoice for ${visaSponsorType} employees. Count: ${sponsorUsers.length}`);

      const reconstructedItems = [];
      let totalAmountDueForClient = 0;
      let employeeCount = 0;
      let clientMonthlyCosts = 0;

      // Use the appropriate monthly costs based on visa sponsor type
      const monthlyCosts =
        visaSponsorType === 'Dynamic Employment Services' ? company.monthly_costs : company.monthly_costs_ees;

      const chargesForClient = parseFloat(
        Object.entries(monthlyCosts)
          .filter(([key]) => key !== 'employee_salary') // Exclude `employee_salary`
          .reduce((total, [, item]) => {
            const value = typeof item === 'string' ? parseFloat(item) : item;
            return typeof value === 'number' && isFinite(value) ? total + value : total;
          }, 0)
      );
      // Process each user in this visa sponsor group
      for (const user of sponsorUsers) {
        employeeCount += 1;
        const fullName = `${user.first_name} ${user.last_name}`;
        console.log('======>', fullName, "User's full name");

        clientMonthlyCosts += chargesForClient;

        const totalFixedSalary = Number(user.salary.total_fixed) || 0;
        console.log(totalFixedSalary, `for ${user.first_name} ${user.last_name}`);
        totalAmountDueForClient += totalFixedSalary;

        // Use the specified month and year
        const currentMonth = startDate.toLocaleString('default', { month: 'long' });
        const currentYear = startDate.getFullYear();

        reconstructedItems.push({
          _id: user._id,
          service_name: `Monthly salary`,
          description: `${fullName} - ${currentMonth} ${currentYear}`,
          rate: totalFixedSalary,
          quantity: 1,
          amount: totalFixedSalary,
          vat_amount: ((5 / 100) * totalFixedSalary).toFixed(2),
          // net_total should the sum of amunt and vat_total
          net_total: (totalFixedSalary + (5 / 100) * totalFixedSalary).toFixed(2),
          user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            designation: user.designation,
            emp_id: user.emp_id,
            employment: user.employment,
            salary: user.salary,
          },
          companyName: company.company_name,
          monthlyCosts,
          totalFixedSalary,
          totalPayableSalary: totalFixedSalary,
        });
        // Check if there are any invoice inputs for this company and add them to the invoice
        if (invoiceInputs.length > 0) {
          for (const input of invoiceInputs) {
            if (input.items && input.items.length > 0) {
              for (const item of input.items) {
                if (item.user_id && item.user_id.toString() === user._id.toString()) {
                  reconstructedItems.push({
                    _id: new ObjectId(),
                    service_name: item.service_name || 'Additional Service',
                    description: item.description || 'Invoice input item',
                    rate: item.amount || 0,
                    quantity: item.quantity || 1,
                    amount: item.amount * item.quantity || 0,
                    vat_amount: item.receipts.length > 0 ? 0 : ((5 / 100) * item.amount).toFixed(2),
                    companyName: company.company_name,
                    net_total: (item.amount + (5 / 100) * item.amount).toFixed(2),
                    user: {
                      _id: user._id,
                      first_name: user.first_name,
                      last_name: user.last_name,
                      email: user.email,
                      designation: user.designation,
                      emp_id: user.emp_id,
                      employment: user.employment,
                      salary: user.salary,
                    },
                  });
                }
              }
            }
          }
        }
      }

      // Calculate total monthly costs for this visa sponsor group
      const totalMonthlyCosts = parseFloat(clientMonthlyCosts.toFixed(2));

      // Add admin fee for this visa sponsor group
      const adminFee = {
        service_name: 'Service Fee',
        description: `Nathan & Nathan Service Fee - ${visaSponsorType}`,
        rate: chargesForClient,
        quantity: employeeCount,
        amount: totalMonthlyCosts,
        vat_amount: ((5 / 100) * totalMonthlyCosts).toFixed(2),
        net_total: (totalMonthlyCosts + (5 / 100) * totalMonthlyCosts).toFixed(2),
        _id: new ObjectId(),
        companyName: company.company_name,
      };
      reconstructedItems.push(adminFee);

      // Calculate invoice totals for this group
      const subTotal = reconstructedItems.reduce((acc, item) => acc + parseFloat(item.amount), 0).toFixed(2);
      const vatTotal = reconstructedItems.reduce((acc, item) => acc + parseFloat(item.vat_amount), 0);
      const total = parseFloat(subTotal) + parseFloat(vatTotal);

      console.log(`Invoice subtotals calculated successfully for ${visaSponsorType} group.`);

      // Use specific date range
      const previousDate = startDate.toISOString().split('T')[0];
      const currDate = endDate.toISOString().split('T')[0];

      // Calculate invoice and due dates based on the company's payroll schedule
      const invoiceDay = getDateFromSchedule(company.payroll_schedule.invoice_date, true);
      const salaryPaymentDay = getDateFromSchedule(company.payroll_schedule.salary_payment_date, true);

      const invoiceDate = new Date(startDate.getFullYear(), startDate.getMonth(), invoiceDay);
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth(), salaryPaymentDay);

      [invoiceDate, dueDate].forEach((date) => date.setUTCHours(0, 0, 0, 0));

      // Get employee names for the invoice
      const employeeNames = sponsorUsers.map((user) => `${user.first_name} ${user.last_name}`).join(', ');

      // Create invoice payload for this visa sponsor group
      const invoicePayload = {
        invoice_number: await generateInvoiceNumber(),
        type: 'Monthly Invoice',
        customer: company._id,
        company: company._id,
        customer_address: company.company_address,
        customer_notes: `Monthly salary invoice for ${visaSponsorType} employees - ${startDate.toLocaleString('default', {
          month: 'long',
        })} ${startDate.getFullYear()}`,
        terms_condition: '',
        customer_name: company.company_name,
        email: company.email,
        billing_address:
          `${
            ((company.billing_address && company.billing_address.address_line1) ||
              (company.billing_address && company.billing_address.address_line2),
            company.billing_address && company.billing_address.country,
            (company.billing_address && company.billing_address.city) || '')
          }` ||
          company.company_address ||
          company.company_name,
        shipping_address:
          `${
            ((company.shipping_address && company.shipping_address.address_line1) ||
              (company.shipping_address && company.shipping_address.address_line2),
            company.shipping_address && company.shipping_address.country,
            (company.shipping_address && company.shipping_address.city) || '')
          }` ||
          company.company_address ||
          company.company_name,
        // shipping_address: company.shipping_address || company.company_name,
        terms: '644a5e16e60f06ccb37e9716',
        administrationCost: totalMonthlyCosts,
        terms_name: 'Custom',
        status: 'Unapproved',
        balance_due: total,
        total,
        items: reconstructedItems,
        sub_total: subTotal,
        vat_total: vatTotal,
        invoice_date: invoiceDate,
        due_date: dueDate,
        is_recurring: false,
        is_draft: false,
        visa_sponsor: visaSponsorType, // Set the visa_sponsor field based on the group type
        details_field: {
          employee_fullName: employeeNames,
          description: `Monthly salary invoice for ${company.company_name} - ${visaSponsorType} employees`,
        },
        memo: `Monthly salary invoice: ${previousDate} to ${currDate} - ${visaSponsorType}`,
      };

      // Generate journal entries
      // Get chart of accounts
      const debitResult = await chartOfAccountsService.getChartOfAccountByCode(
        { customer: ObjectId(company._id) },
        invoicePayload,
        company._id
      );

      const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, invoicePayload, company._id);

      const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, invoicePayload, company._id);

      const discountResult = await chartOfAccountsService.getChartOfAccountByCode(
        { code: 'DC' },
        invoicePayload,
        company._id
      );

      const journal_entry = [
        {
          ...debitResult,
          account: ObjectId(debitResult.account),
          customer: ObjectId(company._id),
          amount: total,
          isDebit: true,
          isCredit: false,
        },
        {
          ...creditResult,
          account: ObjectId(creditResult.account),
          customer: ObjectId(company._id),
          amount: subTotal,
          isDebit: false,
          isCredit: true,
        },
      ];

      // Only add VAT entry if there is VAT
      if (parseFloat(vatTotal) > 0) {
        journal_entry.push({
          ...vatResult,
          account: ObjectId(vatResult.account),
          customer: ObjectId(company._id),
          amount: vatTotal,
          isDebit: false,
          isCredit: true,
        });
      }

      // Generate tax items
      const taxItems = reconstructedItems
        .filter((item) => parseFloat(item.vat_amount) > 0)
        .map((item) => ({
          name: vatResult.name,
          account_name: vatResult.account_name,
          account: vatResult.account,
          isDebit: false,
          isCredit: true,
          isInvoiceRelated: true,
          taxName: 'VAT',
          taxCode: 'VAT',
          totalAmount: parseFloat(item.amount) + parseFloat(item.vat_amount),
          netAmount: parseFloat(item.amount),
          taxAmount: parseFloat(item.vat_amount),
          customer: company._id,
          city: vatResult.city,
        }));

      // Create invoice
      const invoice = await Invoice.create(invoicePayload);
      generatedInvoices.push(invoice);

      // Create journal entry
      await createInvoiceJournalEntry({
        line_items: journal_entry,
        sub_total: subTotal,
        vat_total: vatTotal,
        total,
        journal_date: invoiceDate,
        isInvoiceRelated: true,
        invoice: invoice._id,
        company: company._id,
        tax_item: taxItems,
        document_id: invoice.invoice_number,
        document_customer: company.company_name,
        memo_description: `Monthly salary invoice - ${visaSponsorType} - ${startDate.toLocaleString('default', {
          month: 'long',
        })} ${startDate.getFullYear()}`,
      });

      // Generate PDF preview and save invoice
      const preview = await getPreviewPDF(invoice._id);
      await Invoice.findByIdAndUpdate(invoice._id, { $set: { invoice_link: preview.url } }, { new: true });

      console.log(`Generated invoice for ${visaSponsorType} employees: ${invoice.invoice_number}`);
    }

    // Return all generated invoices
    return generatedInvoices.length === 1 ? generatedInvoices[0] : generatedInvoices;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

// use this route to test on postman
const createmonthlyInvoicePostMan = async (reqBody, startDate, endDate) => {
  // Set default dates if not provided
  if (!startDate) {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of current month
  }

  if (!endDate) {
    const currentDate = new Date();
    // Last day of current month
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }
  try {
    const users = await Users.find({ company_id: ObjectId(reqBody._id) });
    console.log(users[0].first_name);
    const employer = await Companies.findById(reqBody._id);
    console.log(employer._id, 'this is the employer id');
    if (!employer) throw new Error(`could not find company with provided id ${reqBody._id}`);

    // Group users by visa_sponsor_type
    const usersByVisaSponsor = {
      'Dynamic Employment Services': [],
      'Executive Employment Services': [],
    };

    // Categorize users by visa sponsor type
    for (const user of users) {
      const sponsorType = (user.employment && user.employment.visa_sponsor_type) || 'Dynamic Employment Services';
      if (sponsorType === 'Dynamic Employment Services' || sponsorType === 'Executive Employment Services') {
        usersByVisaSponsor[sponsorType].push(user);
      } else {
        // Default to Dynamic Employment Services if type is not recognized
        usersByVisaSponsor['Dynamic Employment Services'].push(user);
      }
    }

    // Generate separate invoices for each visa sponsor type
    const generatedInvoices = [];

    // Process each visa sponsor type group
    for (const [visaSponsorType, sponsorUsers] of Object.entries(usersByVisaSponsor)) {
      if (sponsorUsers.length === 0) continue;

      console.log(`Generating invoice for ${visaSponsorType} employees. Count: ${sponsorUsers.length}`);

      const reconstructedItems = [];
      let totalAmountDueForClient = 0;

      // Process each user in this visa sponsor group
      for (const user of sponsorUsers) {
        const fullName = `${user.first_name} ${user.last_name}`;

        // Use the appropriate monthly costs based on visa sponsor type
        const monthlyCosts =
          visaSponsorType === 'Dynamic Employment Services' ? employer.monthly_costs : employer.monthly_costs_ees;

        const totalFixedSalary = user.salary.total_fixed;
        const clientMonthlyCosts = Object.entries(monthlyCosts)
          .filter(([key]) => key !== 'employee_salary')
          .reduce((total, [, item]) => {
            const value = typeof item === 'string' ? parseFloat(item) : item;
            return typeof value === 'number' && isFinite(value) ? total + value : total;
          }, 0);

        const computedTotalSalary = Number(clientMonthlyCosts) + Number(totalFixedSalary);
        console.log(computedTotalSalary, 'this is the computed total salary--------->');
        totalAmountDueForClient += computedTotalSalary;
        console.log(
          typeof totalAmountDueForClient,
          'this is the type of total amount due for client=========',
          totalAmountDueForClient
        );

        // Get month and year from startDate for the description
        const currentMonth = startDate.toLocaleString('default', { month: 'long' });
        const currentYear = startDate.getFullYear();
        const monthAndYear = `${currentMonth} ${currentYear}`;

        reconstructedItems.push({
          _id: user._id,
          service_name: `Monthly salary for ${fullName} - ${monthAndYear}`,
          rate: computedTotalSalary.toFixed(2),
          quantity: 1,
          amount: computedTotalSalary.toFixed(2),
          vat_amount: ((5 / 100) * computedTotalSalary).toFixed(2),
          user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            designation: user.designation,
            emp_id: user.emp_id,
            employment: user.employment,
            salary: user.salary,
          },
          companyName: employer.company_name,
          monthlyCosts,
          totalFixedSalary: totalFixedSalary,
          totalPayableSalary: computedTotalSalary,
        });
      }

      // Use the provided startDate or default to current date
      const currentDate = startDate || new Date();
      console.log(employer.payroll_schedule.invoice_date, 'value before scheduler');
      const invoiceDay = getDateFromSchedule(employer.payroll_schedule.invoice_date, (monthlyInvoice = true));
      const salaryPaymentDay = getDateFromSchedule(employer.payroll_schedule.salary_payment_date, (monthlyInvoice = true));

      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), invoiceDay);
      const paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), salaryPaymentDay);

      [dueDate, paymentDate, currentDate].forEach((date) => date.setUTCHours(0, 0, 0, 0));

      const newInvoiceID = 'INV-' + (currentDate.getTime() + Math.floor(Math.random() * 100000) + 10000);

      const subTotal = totalAmountDueForClient.toFixed(2);
      const vatTotal = ((5 / 100) * totalAmountDueForClient).toFixed(2);
      const total = (parseFloat(subTotal) + parseFloat(vatTotal)).toFixed(2);

      // Get employee names for the invoice
      const employeeNames = sponsorUsers.map((user) => `${user.first_name} ${user.last_name}`).join(', ');

      // Create invoice payload for this visa sponsor group
      const invoicePayload = {
        invoice_number: newInvoiceID,
        type: 'Monthly Invoice',
        customer: employer._id,
        employer: employer._id,
        customer_address: employer.employer_address,
        customer_notes: `Monthly salary invoice for ${visaSponsorType} employees - ${startDate.toLocaleString('default', {
          month: 'long',
        })} ${startDate.getFullYear()}`,
        terms_condition: '',
        customer_name: employer.employer_name,
        email: employer.email,
        billing_address: employer.company_address,
        shipping_address: 'Dubai',
        terms: '644a5e16e60f06ccb37e9716',
        terms_name: 'Custom',
        status: 'Due',
        balance_due: total,
        total: total,
        items: reconstructedItems,
        sub_total: subTotal,
        vat_total: vatTotal,
        invoice_date: dueDate,
        due_date: paymentDate,
        is_recurring: false,
        is_draft: false,
        company: employer._id,
        customer_name: employer.legal_name,
        visa_sponsor: visaSponsorType, // Set the visa_sponsor field based on the group type
        details_field: {
          employee_fullName: employeeNames,
          description: `Monthly salary invoice for ${employer.company_name} - ${visaSponsorType} employees`,
        },
      };

      // Create invoice for this visa sponsor group
      const invoice = await Invoice.create(invoicePayload);
      generatedInvoices.push(invoice);

      // Generate PDF preview and save invoice link
      const preview = await getPreviewPDF(invoice._id);
      await Invoice.findByIdAndUpdate(invoice._id, { $set: { invoice_link: preview.url } }, { new: true });

      console.log(`Generated invoice for ${visaSponsorType} employees: ${invoice.invoice_number}`);
    }

    // Return all generated invoices
    return generatedInvoices.length === 1 ? generatedInvoices[0] : generatedInvoices;
  } catch (error) {
    throw error;
  }
};

const triggerExpiredInvoicesNotification = async () => {
  try {
    const pipeline = [
      {
        $match: {
          is_deleted: 0,
          status: { $regex: 'overdue', $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
        },
      },
      {
        $project: {
          invoice_number: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          status: 1,
          balance_due: 1,
          status: 1,
          company: {
            company_name: '$companyDetails.company_name',
            email: '$companyDetails.email',
            legal_name: '$companyDetails.legal_name',
            _id: '$companyDetails._id',
          },
        },
      },
    ];
    let reconstructedBody;
    const result = await Invoice.aggregate(pipeline);
    console.log(result.length, 'this is the length');
    if (result.length > 0) {
      const data = result;
      const emailtTemplt = await emailTemplateService.getEmailTemplateByName({ templateName: 'Invoice Expired' });
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const companyInvoices = data.filter((invoice) => invoice.company.toString() === element.company.toString());
        // get company specific invoices from the returned array
        const formattedInvoices = companyInvoices
          .map(
            (inv) =>
              `Invoice Number: ${inv.invoice_number}, Type: ${inv.type ? inv.type : 'N/A'}, Total: ${
                inv.total
              }, Balance Due: ${inv.balance_due}, Status: ${inv.status}`
          )
          .join('<br>');
        // const invoiceNumbers = companyInvoices.map(inv => inv.invoice_number).join(', ');
        // console.log("start of  company invoices", companyInvoices, "===========> end of company invoices");
        const reconstructedBody = {
          company_name: element.company.company_name,
          invoices: formattedInvoices,
        };

        const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
          emailtTemplt._id,
          element.company._id,
          reconstructedBody,
          false
        );
        return replacedTemplate;
        await sendEmail(replacedTemplate.to, replacedTemplate.subject, replacedTemplate.content, replacedTemplate.cc, []);
      }
    }
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 *  ===================================================================================
 * Function to generate the general invoice summary for the app
 * It collectively provides an overview of all invoices on billings section
 * ===================================================================================
 */
const exportGeneralInvoiceReport = async (reqQuery) => {
  try {
    const pipeline = [
      {
        $match: {
          is_deleted: 0,
          type: { $nin: ['payroll invoice'] },
          invoice_number: { $not: /^VOID-/ },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: {
          path: '$customerDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'creditnotes',
          localField: 'credit_notes',
          foreignField: '_id',
          as: 'creditNoteDetails',
        },
      },
      {
        $unwind: {
          path: '$creditNoteDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          client_number: '$customerDetails.unique_code',
          client_reference_number: '$customerDetails.reference_number',
          invoice_number: 1,
          type: 1,
          customer_name: 1,
          email: 1,
          billing_address: 1,
          shipping_address: 1,
          terms: 1,
          terms_name: 1,
          status: 1,
          invoice_date: 1,
          due_date: 1,
          paid: 1,
          description: '$memo',
          currency: 'AED',
          balance_due: 1,
          total: 1,
          vat_total: 1,
          sub_total: 1,
          invoice_link: { $ifNull: ['$invoice_link', ''] },
          PO_number: { $ifNull: ['$customerDetails.PO_number', ''] },
          GRN_number: { $ifNull: ['$customerDetails.GRN_number', ''] },
        },
      },
    ];

    if (reqQuery.company_id) {
      pipeline.push({
        $match: {
          customer: ObjectId(reqQuery.company_id),
        },
      });
    }

    let invoices = await Invoice.aggregate(pipeline);

    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('Invoice Report');

    sheet.columns = [
      { header: 'Invoice Number', key: 'invoice_number', width: 20 },
      { header: 'Client Number', key: 'client_number', width: 20 },
      { header: 'Client Reference Number', key: 'client_reference_number', width: 29 },
      { header: 'Customer Name', key: 'customer_name', width: 38 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Billing Address', key: 'billing_address', width: 54 },
      { header: 'Type', key: 'type', width: 20 },
      // { header: 'Shipping Address', key: 'shipping_address', width: 50, },
      { header: 'Invoice Date', key: 'invoice_date', width: 20 },
      { header: 'Due Date', key: 'due_date', width: 20 },
      { header: 'Balance Due', key: 'balance_due', width: 20 },
      { header: 'Total', key: 'total', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'VAT Total', key: 'vat_total', width: 20 },
      { header: 'Sub Total', key: 'sub_total', width: 20 },
      { header: 'PO Number', key: 'PO_number', width: 20 },
      { header: 'GRN Number', key: 'GRN_number', width: 20 },
      { header: 'Invoice Link', key: 'invoice_link', width: 85 },
    ];

    // Add data rows
    invoices.forEach((invoice, index) => {
      const row = sheet.addRow({
        invoice_number: invoice.invoice_number,
        client_number: invoice.client_number,
        client_reference_number: invoice.client_reference_number,
        customer_name: invoice.customer_name,
        email: invoice.email,
        billing_address: invoice.billing_address,
        // shipping_address: invoice.shipping_address,
        type: invoice.type,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        balance_due: invoice.balance_due,
        total: invoice.total,
        status: invoice.status,
        vat_total: invoice.vat_total,
        sub_total: invoice.sub_total,
        PO_number: invoice.PO_number,
        GRN_number: invoice.GRN_number,
        invoice_link: invoice.invoice_link,
      });

      // Apply different colors based on status
      // let fillColor;
      // switch(invoice.status) {
      //   case 'Partially Paid':
      //     fillColor = 'FFFFD1'; // Light yellow
      //     break;
      //   case 'Paid':
      //     fillColor = 'E2EFDA'; // Light green
      //     break;
      //   case 'Due':
      //     fillColor = 'FDE9D9'; // Light orange
      //     break;
      //   default:
      //     fillColor = 'FFFFFF'; // White for any other status
      // }

      // row.eachCell({ includeEmpty: true }, (cell) => {
      //   cell.fill = {
      //     type: 'pattern',
      //     pattern: 'solid',
      //     fgColor: { argb: fillColor }
      //   };
      // });
    });

    // Apply styles to header
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    const applyStylesToRow = (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    };

    // Apply border and alignment styles to all rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        applyStylesToRow(row);
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *  ==================================================================================================================
 * Function to generate monthly invoice summary for all companies on the system
 * Note that date range can be provided on request query in this format
 * - date_range=["2024-12-01T00:00:00Z","2024-12-31T23:59:59Z"]
 * This will enable filtering based on specified durations on the system
 * ==================================================================================================================
 */
const monthlyInvoiceSummary = async (reqQuery) => {
  try {
    // ✅ ENHANCED: Get currency display option from query
    const currencyDisplayOption = reqQuery.currency_display || 'both'; // 'original', 'aed', 'both'

    const pipeline = [
      {
        $match: {
          is_deleted: 0,
          type: {
            $in: [/^general invoice$/i],
          },
          invoice_number: { $not: /^VOID-/ },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: {
          path: '$customerDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$items',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'items.user._id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          entity: {
            $cond: {
              if: { $eq: ['$visa_sponsor', 'Dynamic Employment Services'] },
              then: 'DES',
              else: {
                $cond: {
                  if: { $eq: ['$visa_sponsor', 'Dynamic Executive Services'] },
                  then: 'EES',
                  else: 'DES', // Default to DES if not specified
                },
              },
            },
          },
          invoice_date: 1,
          invoice_number: 1,
          category: '$type',
          customer_name: 1,
          invoice_due_date: '$due_date',
          product_services: '$items.service_name',
          description: '$items.description',
          employee_name: {
            $let: {
              vars: {
                descriptionParts: { $split: ['$items.description', ' - '] },
              },
              in: { $arrayElemAt: ['$$descriptionParts', 0] },
            },
          },
          quantity: { $ifNull: ['$items.quantity', 1] },
          rate: { $ifNull: ['$items.rate', 0] },
          // ✅ ENHANCED: Add currency fields for "Both" option support
          currency: { $ifNull: ['$currency', 'AED'] },
          conversion_rate: { $ifNull: ['$conversion_rate', 1.0] },
          amount: { $ifNull: ['$items.amount', 0] },
          vat: { $ifNull: ['$items.vat_amount', 0] },
          total: { $ifNull: ['$items.net_total', '$items.amount'] },
        },
      },
    ];

    // Add company_id filter if provided
    if (reqQuery.company_id) {
      pipeline.unshift({
        $match: {
          customer: ObjectId(reqQuery.company_id),
        },
      });
    }

    // Add date range filter if provided
    if (reqQuery.date_range) {
      const dateRange = JSON.parse(reqQuery.date_range);
      console.log('Start Date:', new Date(dateRange[0]));
      console.log('End Date:', new Date(dateRange[1]));

      // Add date filter to the beginning of pipeline after initial match
      pipeline.splice(1, 0, {
        $match: {
          invoice_date: {
            $gte: new Date(dateRange[0]),
            $lte: new Date(dateRange[1]),
          },
        },
      });

      console.log('Date range filter applied to pipeline');
    }
    console.log('start of pipeline', JSON.stringify(pipeline));
    const invoices = await Invoice.aggregate(pipeline);
    console.log('start of invoices----------->', invoices, '=============> end of invoices');

    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('PEO Invoice Report');

    // Set workbook metadata for professional appearance
    workbook.creator = 'PEO Central Financial System';
    workbook.lastModifiedBy = 'PEO Central Admin';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.category = 'Financial Reports';
    workbook.subject = 'Monthly Invoice Detailed Report';

    // Define the current month and year for the report title
    const currentDate = new Date();
    let reportSubtitle = '';

    // Check if date filtering is applied
    if (reqQuery.date_range) {
      const dateRange = JSON.parse(reqQuery.date_range);
      const startDate = new Date(dateRange[0]).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const endDate = new Date(dateRange[1]).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      reportSubtitle = `INVOICE DATE RANGE: ${startDate} - ${endDate}`;
    } else {
      const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
      reportSubtitle = `FTM OF ${monthYear}`;
    }

    const generatedDateTime =
      currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      currentDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

    // Professional title section with enhanced styling
    // Note: lastColumn calculation moved after columns definition

    // Add professional borders to title section (moved after columns definition)

    // Add separator rows for better visual separation
    sheet.addRow([]);
    sheet.addRow([]);

    // ✅ ENHANCED: Dynamic column structure based on currency display option
    let columns;
    if (currencyDisplayOption === 'original') {
      // Original Currency: Show only original amounts, no AED columns
      columns = [
      { header: 'ENTITY', key: 'entity', width: 10 },
      { header: 'INVOICE DATE', key: 'invoice_date', width: 14 },
      { header: 'INVOICE NUMBER', key: 'invoice_number', width: 16 },
      { header: 'CATEGORY', key: 'category', width: 16 },
      { header: 'CUSTOMER NAME', key: 'customer_name', width: 28 },
      { header: 'INVOICE DUE DATE', key: 'invoice_due_date', width: 16 },
      { header: 'PRODUCT/SERVICES', key: 'product_services', width: 22 },
      { header: 'DESCRIPTION', key: 'description', width: 18 },
      { header: 'EMPLOYEE NAME', key: 'employee_name', width: 20 },
      { header: 'QTY', key: 'quantity', width: 8 },
      { header: 'RATE', key: 'rate', width: 12 },
        { header: 'CURRENCY', key: 'currency', width: 10 },
        { header: 'CONVERSION RATE', key: 'conversion_rate', width: 14 },
      { header: 'AMOUNT', key: 'amount', width: 12 },
      { header: 'VAT', key: 'vat', width: 10 },
      { header: 'TOTAL', key: 'total', width: 12 },
    ];
    } else if (currencyDisplayOption === 'aed') {
      // AED Only: Show only AED amounts, hide original currency columns
      columns = [
        { header: 'ENTITY', key: 'entity', width: 10 },
        { header: 'INVOICE DATE', key: 'invoice_date', width: 14 },
        { header: 'INVOICE NUMBER', key: 'invoice_number', width: 16 },
        { header: 'CATEGORY', key: 'category', width: 16 },
        { header: 'CUSTOMER NAME', key: 'customer_name', width: 28 },
        { header: 'INVOICE DUE DATE', key: 'invoice_due_date', width: 16 },
        { header: 'PRODUCT/SERVICES', key: 'product_services', width: 22 },
        { header: 'DESCRIPTION', key: 'description', width: 18 },
        { header: 'EMPLOYEE NAME', key: 'employee_name', width: 20 },
        { header: 'QTY', key: 'quantity', width: 8 },
        { header: 'RATE (AED)', key: 'rate', width: 12 },
        { header: 'AMOUNT (AED)', key: 'amount', width: 12 },
        { header: 'VAT (AED)', key: 'vat', width: 10 },
        { header: 'TOTAL (AED)', key: 'total', width: 12 },
      ];
    } else {
      // Both: Show both original and AED amounts
      columns = [
        { header: 'ENTITY', key: 'entity', width: 10 },
        { header: 'INVOICE DATE', key: 'invoice_date', width: 14 },
        { header: 'INVOICE NUMBER', key: 'invoice_number', width: 16 },
        { header: 'CATEGORY', key: 'category', width: 16 },
        { header: 'CUSTOMER NAME', key: 'customer_name', width: 28 },
        { header: 'INVOICE DUE DATE', key: 'invoice_due_date', width: 16 },
        { header: 'PRODUCT/SERVICES', key: 'product_services', width: 22 },
        { header: 'DESCRIPTION', key: 'description', width: 18 },
        { header: 'EMPLOYEE NAME', key: 'employee_name', width: 20 },
        { header: 'QTY', key: 'quantity', width: 8 },
        { header: 'RATE', key: 'rate', width: 12 },
        { header: 'CURRENCY', key: 'currency', width: 10 },
        { header: 'CONVERSION RATE', key: 'conversion_rate', width: 14 },
        { header: 'AMOUNT', key: 'amount', width: 12 },
        { header: 'AED AMOUNT', key: 'aed_amount', width: 12 },
        { header: 'VAT', key: 'vat', width: 10 },
        { header: 'AED VAT', key: 'aed_vat', width: 10 },
        { header: 'TOTAL', key: 'total', width: 12 },
        { header: 'AED TOTAL', key: 'aed_total', width: 12 },
      ];
    }

    sheet.columns = columns;

    // ✅ ENHANCED: Dynamic header merge cells based on column count
    const lastColumn = String.fromCharCode(64 + columns.length); // Calculate last column letter
    sheet.mergeCells(`A1:${lastColumn}1`);
    const titleCell1 = sheet.getCell('A1');
    titleCell1.value = 'PEO INVOICING DETAILED REPORT';
    titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell1.font = { name: 'Calibri', size: 18, bold: true, color: { argb: '1F4E79' } };
    titleCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F7FC' } };
    sheet.getRow(1).height = 30;

    sheet.mergeCells(`A2:${lastColumn}2`);
    const titleCell2 = sheet.getCell('A2');
    titleCell2.value = reportSubtitle;
    titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell2.font = { name: 'Calibri', size: 14, bold: true, color: { argb: '2D5797' } };
    titleCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F1F8' } };
    sheet.getRow(2).height = 25;

    sheet.mergeCells(`A3:${lastColumn}3`);
    const titleCell3 = sheet.getCell('A3');
    titleCell3.value = `GENERATED DATE: ${generatedDateTime}`;
    titleCell3.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell3.font = { name: 'Calibri', size: 12, italic: true, color: { argb: '4A5568' } };
    titleCell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F7FAFC' } };
    sheet.getRow(3).height = 22;

    // Add professional borders to title section
    [1, 2, 3].forEach((rowNum) => {
      const row = sheet.getRow(rowNum);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= columns.length) { // Dynamic column count
          cell.border = {
            top: { style: 'thin', color: { argb: 'D1D5DB' } },
            left: { style: 'thin', color: { argb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
            right: { style: 'thin', color: { argb: 'D1D5DB' } },
          };
        }
      });
    });

    // Enhanced header row styling (row 6)
    const headerRow = sheet.getRow(6);
    headerRow.height = 35;

    // Apply header styling cell by cell for better control
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.font = {
        name: 'Calibri',
        bold: true,
        size: 11,
        color: { argb: 'FFFFFF' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1F4E79' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'medium', color: { argb: '1F4E79' } },
        left: { style: 'thin', color: { argb: 'FFFFFF' } },
        bottom: { style: 'medium', color: { argb: '1F4E79' } },
        right: { style: 'thin', color: { argb: 'FFFFFF' } },
      };
    });

    // Add data rows with enhanced formatting
    invoices.forEach((invoice, index) => {
      // ✅ ENHANCED: Currency-sensitive amount formatting with "Both" option support
      let rateValue = parseFloat(invoice.rate) || 0;
      let amountValue = parseFloat(invoice.amount) || 0;
      let vatValue = parseFloat(invoice.vat) || 0;
      let totalValue = parseFloat(invoice.total) || 0;

      // ✅ ENHANCED: Calculate AED equivalents with conversion rate validation
      let conversionRate = parseFloat(invoice.conversion_rate) || 1.0;

      // ✅ VALIDATION: Ensure conversion rates are reasonable
      if (invoice.currency === 'USD' && conversionRate < 1.0) {
        // If USD rate is less than 1, it's likely inverted - fix it
        conversionRate = 1.0 / conversionRate;
      } else if (invoice.currency === 'EUR' && conversionRate < 1.0) {
        // If EUR rate is less than 1, it's likely inverted - fix it
        conversionRate = 1.0 / conversionRate;
      }

      const aedRate = rateValue * conversionRate;
      const aedAmount = amountValue * conversionRate;
      const aedVat = vatValue * conversionRate;
      const aedTotal = totalValue * conversionRate;

      // Apply currency display logic for "AED Only" option
      if (currencyDisplayOption === 'aed' && invoice.currency && invoice.currency !== 'AED') {
        rateValue = aedRate;
        amountValue = aedAmount;
        vatValue = aedVat;
        totalValue = aedTotal;
      }

      // ✅ ENHANCED: Dynamic row creation based on currency display option
      let rowData;
      if (currencyDisplayOption === 'original') {
        // Original Currency: Show only original amounts, no AED columns
        rowData = {
        entity: invoice.entity || 'DES',
        invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-GB') : '',
        invoice_number: invoice.invoice_number || '',
        category: invoice.category || '',
        customer_name: invoice.customer_name || '',
        invoice_due_date: invoice.invoice_due_date ? new Date(invoice.invoice_due_date).toLocaleDateString('en-GB') : '',
        product_services: invoice.product_services || '',
        description: invoice.description || '',
        employee_name: invoice.employee_name || '',
        quantity: parseFloat(invoice.quantity) || 0,
        rate: rateValue,
          currency: invoice.currency || 'AED',
          conversion_rate: conversionRate,
        amount: amountValue,
        vat: vatValue,
        total: totalValue,
        };
      } else if (currencyDisplayOption === 'aed') {
        // AED Only: Show only AED amounts, hide original currency columns
        rowData = {
          entity: invoice.entity || 'DES',
          invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-GB') : '',
          invoice_number: invoice.invoice_number || '',
          category: invoice.category || '',
          customer_name: invoice.customer_name || '',
          invoice_due_date: invoice.invoice_due_date ? new Date(invoice.invoice_due_date).toLocaleDateString('en-GB') : '',
          product_services: invoice.product_services || '',
          description: invoice.description || '',
          employee_name: invoice.employee_name || '',
          quantity: parseFloat(invoice.quantity) || 0,
          rate: rateValue, // Already converted to AED if needed
          amount: amountValue, // Already converted to AED if needed
          vat: vatValue, // Already converted to AED if needed
          total: totalValue, // Already converted to AED if needed
        };
      } else {
        // Both: Show both original and AED amounts
        rowData = {
          entity: invoice.entity || 'DES',
          invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-GB') : '',
          invoice_number: invoice.invoice_number || '',
          category: invoice.category || '',
          customer_name: invoice.customer_name || '',
          invoice_due_date: invoice.invoice_due_date ? new Date(invoice.invoice_due_date).toLocaleDateString('en-GB') : '',
          product_services: invoice.product_services || '',
          description: invoice.description || '',
          employee_name: invoice.employee_name || '',
          quantity: parseFloat(invoice.quantity) || 0,
          rate: rateValue,
          currency: invoice.currency || 'AED',
          conversion_rate: conversionRate,
          amount: amountValue,
          aed_amount: aedAmount,
          vat: vatValue,
          aed_vat: aedVat,
          total: totalValue,
          aed_total: aedTotal,
        };
      }

      const row = sheet.addRow(rowData);

      // Enhanced alternating row colors for better readability
      const fillColor = index % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Apply styling to data cells only (exclude empty columns beyond our data)
        if (colNumber <= 19) { // Updated for more columns
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor },
          };

          // Enhanced font styling
          cell.font = {
            name: 'Calibri',
            size: 10,
            color: { argb: '2D3748' },
          };

          // Improved alignment and text wrapping
          cell.alignment = {
            vertical: 'middle',
            wrapText: true,
            indent: colNumber <= 9 ? 1 : 0, // Add slight indent for text columns
          };

          // ✅ ENHANCED: Column-specific formatting for new structure
          if ([10, 11, 13, 14, 15, 16, 17, 18, 19].includes(colNumber)) {
            // Numeric columns: QTY, RATE, AMOUNT, AED AMOUNT, VAT, AED VAT, TOTAL, AED TOTAL
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'right',
              wrapText: false,
            };

            if (colNumber === 10) {
              // Quantity column - no decimal places
              cell.numFmt = '#,##0';
            } else {
              // Currency columns - 2 decimal places with currency symbol based on display option
              if (currencyDisplayOption === 'aed') {
                cell.numFmt = '_("AED"* #,##0.00_);_("AED"* (#,##0.00);_("AED"* "-"??_);_(@_)';
              } else if (currencyDisplayOption === 'original' && invoice.currency) {
                const currencySymbol = invoice.currency === 'USD' ? 'USD' : invoice.currency === 'EUR' ? 'EUR' : 'AED';
                cell.numFmt = `_("${currencySymbol}"* #,##0.00_);_("${currencySymbol}"* (#,##0.00);_("${currencySymbol}"* "-"??_);_(@_)`;
              } else {
                // Default format for 'both' option
                cell.numFmt = '#,##0.00';
              }
            }
          } else if (colNumber === 12) {
            // Currency column - center align
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (colNumber === 13) {
            // Conversion Rate column - right align with decimal formatting
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0.0000';
          } else {
            // Text columns
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'left',
              wrapText: true,
              indent: 1,
            };
          }

          // Professional borders
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } },
          };
        }
      });

      // Set optimal row height for readability
      row.height = 22;
    });

    // Add summary information at the bottom
    const summaryStartRow = sheet.lastRow.number + 2;
    const totalInvoices = invoices.length;

    // ✅ ENHANCED: Currency-sensitive summary calculations
    let totalAmount, totalVAT, grandTotal;
    if (currencyDisplayOption === 'original') {
      // Original Currency: Show original amounts only
      totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
      totalVAT = invoices.reduce((sum, inv) => sum + (parseFloat(inv.vat) || 0), 0);
      grandTotal = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    } else if (currencyDisplayOption === 'aed') {
      // AED Only: Convert all amounts to AED
      totalAmount = invoices.reduce((sum, inv) => {
        const amount = parseFloat(inv.amount) || 0;
        const rate = parseFloat(inv.conversion_rate) || 1.0;
        return sum + (inv.currency !== 'AED' ? amount * rate : amount);
      }, 0);
      totalVAT = invoices.reduce((sum, inv) => {
        const vat = parseFloat(inv.vat) || 0;
        const rate = parseFloat(inv.conversion_rate) || 1.0;
        return sum + (inv.currency !== 'AED' ? vat * rate : vat);
      }, 0);
      grandTotal = invoices.reduce((sum, inv) => {
        const total = parseFloat(inv.total) || 0;
        const rate = parseFloat(inv.conversion_rate) || 1.0;
        return sum + (inv.currency !== 'AED' ? total * rate : total);
      }, 0);
    } else {
      // Both: Show original amounts (AED conversion handled in columns)
      totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
      totalVAT = invoices.reduce((sum, inv) => sum + (parseFloat(inv.vat) || 0), 0);
      grandTotal = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    }

    // Summary section
    sheet.mergeCells(`A${summaryStartRow}:${lastColumn}${summaryStartRow}`);
    const summaryCell = sheet.getCell(`A${summaryStartRow}`);
    // ✅ ENHANCED: Dynamic currency-sensitive summary text
    let currencyText = '';
    if (currencyDisplayOption === 'original') {
      currencyText = 'Original Currencies';
    } else if (currencyDisplayOption === 'aed') {
      currencyText = 'AED';
    } else {
      currencyText = 'Mixed Currencies';
    }
    summaryCell.value = `REPORT SUMMARY: ${totalInvoices} Invoice Line Items | Total Amount: ${totalAmount.toLocaleString(
      'en-US',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )} ${currencyText} | Total VAT: ${totalVAT.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencyText} | Grand Total: ${grandTotal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencyText}`;
    summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summaryCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '1F4E79' } };
    summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDF2F7' } };
    sheet.getRow(summaryStartRow).height = 25;

    // Footer
    const footerRow = summaryStartRow + 2;
    sheet.mergeCells(`A${footerRow}:${lastColumn}${footerRow}`);
    const footerCell = sheet.getCell(`A${footerRow}`);
    footerCell.value = `Generated by PEO Central Financial System | ${new Date().toLocaleString(
      'en-US'
    )} | Confidential & Proprietary`;
    footerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    footerCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: '718096' } };

    // Freeze panes for better navigation
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 6 }];

    // Auto-fit columns for optimal display
    sheet.columns.forEach((column) => {
      if (column.width < 10) column.width = 10;
      if (column.width > 35) column.width = 35;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const exportAgeingSummaryReport = async (reqQuery) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ ENHANCED: Get currency display option from query
    const currencyDisplayOption = reqQuery.currency_display || 'both'; // 'original', 'aed', 'both'

    // Define age brackets for proper aging analysis
    const ageBrackets = [
      { name: 'Current', days: 0 },
      { name: '1 - 30', days: 30 },
      { name: '31 - 60', days: 60 },
      { name: '61 - 90', days: 90 },
      { name: '91 and over', days: Infinity },
    ];

    const pipeline = [
      {
        $match: {
          is_deleted: 0,
          status: { $in: ['Due', 'Overdue', 'Partially Paid'] },
          $or: [{ paid: false }, { paid: { $exists: false } }],
          invoice_number: { $not: /^VOID-/ }, // Exclude VOID invoices
          balance_due: { $gt: 0 }, // Only invoices with outstanding balance
          type: { $nin: ['payroll invoice'] },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: '$customerDetails',
      },
      {
        $project: {
          customer_name: '$customerDetails.company_name',
          customer_reference: '$customerDetails.reference_number',
          invoice_number: 1,
          invoice_date: 1,
          due_date: 1,
          type: 1,
          status: 1,
          balance_due: 1, // Use balance_due instead of total for aging
          currency: { $ifNull: ['$currency', 'AED'] }, // Include currency field
          conversion_rate: { $ifNull: ['$conversion_rate', 1.0] }, // Include conversion rate
          // ✅ ENHANCED: Currency-aware balance calculation
          balance_due_aed: {
            $cond: {
              if: { $ne: ['$currency', 'AED'] },
              then: { $multiply: ['$balance_due', { $ifNull: ['$conversion_rate', 1.0] }] },
              else: '$balance_due'
            }
          },
          invoice_age_days: {
            $max: [
              0,
              {
                $divide: [{ $subtract: [today, '$due_date'] }, 24 * 60 * 60 * 1000],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            customer_name: '$customer_name',
            customer_reference: '$customer_reference',
          },
          // ✅ ENHANCED: Calculate both original and AED totals for "Both" option
          total_outstanding: { $sum: '$balance_due' },
          total_outstanding_aed: { $sum: '$balance_due_aed' },
          invoice_count: { $sum: 1 },
          ...Object.fromEntries(
            ageBrackets.map((bracket, index) => {
              const nextBracket = ageBrackets[index + 1];
              const condition = nextBracket
                ? { $and: [{ $gte: ['$invoice_age_days', bracket.days] }, { $lt: ['$invoice_age_days', nextBracket.days] }] }
                : { $gte: ['$invoice_age_days', bracket.days] };
              return [
                `age_${bracket.name.replace(/\s+/g, '_')}`,
                { $sum: { $cond: [condition, '$balance_due', 0] } }
              ];
            })
          ),
          ...Object.fromEntries(
            ageBrackets.map((bracket, index) => {
              const nextBracket = ageBrackets[index + 1];
              const condition = nextBracket
                ? { $and: [{ $gte: ['$invoice_age_days', bracket.days] }, { $lt: ['$invoice_age_days', nextBracket.days] }] }
                : { $gte: ['$invoice_age_days', bracket.days] };
              return [
                `age_${bracket.name.replace(/\s+/g, '_')}_aed`,
                { $sum: { $cond: [condition, '$balance_due_aed', 0] } }
              ];
            })
          ),
        },
      },
      {
        $sort: { '_id.customer_name': 1 },
      },
    ];

    if (reqQuery.company_id) {
      pipeline.unshift({
        $match: {
          customer: ObjectId(reqQuery.company_id),
        },
      });
    }

    const ageingSummary = await Invoice.aggregate(pipeline);

    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('Ageing Summary Report');

    // Set workbook properties for professional appearance
    workbook.creator = 'PEO Central Financial System';
    workbook.lastModifiedBy = 'PEO Central';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // ✅ ENHANCED: Dynamic column structure based on currency display option
    let columns;
    if (currencyDisplayOption === 'original') {
      // Original Currency: Show only original amounts, no AED columns
      columns = [
      { header: 'Client Name', key: 'customer_name', width: 45 },
      { header: 'Reference #', key: 'customer_reference', width: 18 },
      { header: 'Invoices', key: 'invoice_count', width: 12 },
      ...ageBrackets.map((bracket) => ({
        header: `${bracket.name} Days`,
        key: `age_${bracket.name.replace(/\s+/g, '_')}`,
        width: 20,
      })),
      { header: 'Total Outstanding', key: 'total_outstanding', width: 22 },
    ];
    } else if (currencyDisplayOption === 'aed') {
      // AED Only: Show only AED amounts, hide original currency columns
      columns = [
        { header: 'Client Name', key: 'customer_name', width: 45 },
        { header: 'Reference #', key: 'customer_reference', width: 18 },
        { header: 'Invoices', key: 'invoice_count', width: 12 },
        ...ageBrackets.map((bracket) => ({
          header: `${bracket.name} Days (AED)`,
          key: `age_${bracket.name.replace(/\s+/g, '_')}_aed`,
          width: 20,
        })),
        { header: 'Total Outstanding (AED)', key: 'total_outstanding_aed', width: 22 },
      ];
    } else {
      // Both: Show both original and AED amounts
      columns = [
        { header: 'Client Name', key: 'customer_name', width: 45 },
        { header: 'Reference #', key: 'customer_reference', width: 18 },
        { header: 'Invoices', key: 'invoice_count', width: 12 },
        ...ageBrackets.map((bracket) => ({
          header: `${bracket.name} Days (Original)`,
          key: `age_${bracket.name.replace(/\s+/g, '_')}`,
          width: 20,
        })),
        ...ageBrackets.map((bracket) => ({
          header: `${bracket.name} Days (AED)`,
          key: `age_${bracket.name.replace(/\s+/g, '_')}_aed`,
          width: 20,
        })),
        { header: 'Total Outstanding (Original)', key: 'total_outstanding', width: 22 },
        { header: 'Total Outstanding (AED)', key: 'total_outstanding_aed', width: 22 },
      ];
    }

    sheet.columns = columns;

    // Professional Report Header Section
    const lastColumn = String.fromCharCode(64 + columns.length); // Calculate last column letter
    sheet.mergeCells(`A1:${lastColumn}1`);
    const companyCell = sheet.getCell('A1');
    companyCell.value = 'PEO CENTRAL - DYNAMIC EMPLOYMENT SERVICES L.L.C';
    companyCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    companyCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: '1F4E79' } };
    companyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F7FC' } };

    sheet.mergeCells(`A2:${lastColumn}2`);
    const titleCell = sheet.getCell('A2');
    titleCell.value = 'ACCOUNTS PAYABLE AGING SUMMARY';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: '1F4E79' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F1F8' } };

    // Report metadata section
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    sheet.mergeCells(`A3:${lastColumn}3`);
    const dateCell = sheet.getCell('A3');
    // ✅ ENHANCED: Dynamic currency display based on option
    let currencyText = '';
    if (currencyDisplayOption === 'aed') {
      currencyText = 'Currency: AED Only';
    } else if (currencyDisplayOption === 'original') {
      currencyText = 'Currency: Original (USD/EUR/AED)';
    } else {
      currencyText = 'Currency: Both Original + AED Equivalent';
    }
    dateCell.value = `Report Date: ${reportDate} | As of: ${new Date().toLocaleDateString('en-US')} | ${currencyText}`;
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dateCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: '4A5568' } };

    // Summary statistics section
    // ✅ ENHANCED: Use appropriate balance field for summary calculations
    const totalOutstanding = ageingSummary.reduce((sum, item) => sum + (item.total_outstanding || 0), 0);
    const totalInvoices = ageingSummary.reduce((sum, item) => sum + item.invoice_count, 0);
    const totalVendors = ageingSummary.length;

    sheet.mergeCells(`A4:${lastColumn}4`);
    const summaryCell = sheet.getCell('A4');
    // ✅ ENHANCED: Dynamic currency display in summary
    let currencySymbol = '';
    if (currencyDisplayOption === 'aed') {
      currencySymbol = 'AED';
    } else if (currencyDisplayOption === 'original') {
      currencySymbol = 'Mixed Currency';
    } else {
      currencySymbol = 'Mixed Currency';
    }
    summaryCell.value = `Summary: ${totalVendors} Clients | ${totalInvoices} Outstanding Invoices | Total: ${currencySymbol} ${totalOutstanding.toLocaleString(
      'en-US',
      { minimumFractionDigits: 2 }
    )}`;
    summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summaryCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'C53030' } };
    summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF5E7' } };

    // Add separator rows
    sheet.insertRow(5, []);
    sheet.insertRow(6, []);

    // Professional header row styling
    const headerRow = sheet.getRow(7);
    headerRow.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.values = columns.map((col) => col.header);
    headerRow.height = 25;

    // Add data rows with enhanced formatting
    ageingSummary.forEach((item, index) => {
      // ✅ ENHANCED: Currency-sensitive amount formatting for ageing summary with "Both" option
      const ageBracketData = Object.fromEntries(
        ageBrackets.map((bracket) => {
          const key = `age_${bracket.name.replace(/\s+/g, '_')}`;
          const keyAed = `age_${bracket.name.replace(/\s+/g, '_')}_aed`;
          return [
            [key, item[key] || 0],
            [keyAed, item[keyAed] || 0]
          ];
        }).flat()
      );

      // ✅ ENHANCED: Dynamic row creation based on currency display option
      let rowData;
      if (currencyDisplayOption === 'original') {
        rowData = {
        customer_name: item._id.customer_name,
        customer_reference: item._id.customer_reference || 'N/A',
        invoice_count: item.invoice_count,
        ...ageBracketData,
        total_outstanding: item.total_outstanding || 0,
        };
      } else if (currencyDisplayOption === 'aed') {
        rowData = {
          customer_name: item._id.customer_name,
          customer_reference: item._id.customer_reference || 'N/A',
          invoice_count: item.invoice_count,
          ...ageBracketData,
          total_outstanding_aed: item.total_outstanding_aed || 0,
        };
      } else {
        rowData = {
          customer_name: item._id.customer_name,
          customer_reference: item._id.customer_reference || 'N/A',
          invoice_count: item.invoice_count,
          ...ageBracketData,
          total_outstanding: item.total_outstanding || 0,
          total_outstanding_aed: item.total_outstanding_aed || 0,
        };
      }

      const row = sheet.addRow(rowData);

      // Alternating row colors for better readability
      const rowColor = index % 2 === 0 ? 'FFFFFF' : 'F8FAFC';

      // Apply sophisticated color coding based on risk levels
      const totalAmount = item.total_outstanding;
      let riskColor = rowColor;

      if (totalAmount > 100000) {
        riskColor = 'FFE6E6'; // Critical - Light red
      } else if (totalAmount > 50000) {
        riskColor = 'FFF4E6'; // High - Light orange
      } else if (totalAmount > 20000) {
        riskColor = 'FFFBF0'; // Medium - Very light yellow
      }

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: riskColor },
        };

        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle', wrapText: true };

        // ✅ ENHANCED: Column-specific formatting for new structure with "Both" option
        if (cell.col >= 4) {
          // Currency columns (age brackets and totals)
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          if (currencyDisplayOption === 'aed') {
            cell.numFmt = '_("AED"* #,##0.00_);_("AED"* (#,##0.00);_("AED"* "-"??_);_(@_)';
          } else if (currencyDisplayOption === 'original') {
            // For original currency, we'll use a generic format since ageing summary aggregates multiple currencies
            cell.numFmt = '#,##0.00';
          } else {
            // Default format for 'both' option
            cell.numFmt = '#,##0.00';
          }
        } else if (cell.col === 3) {
          // Invoice count - center align
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          // Text columns - left align
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      row.height = 22;
    });

    // ✅ ENHANCED: Dynamic totals row based on currency display option
    let totalRowData;
    if (currencyDisplayOption === 'original') {
      totalRowData = {
      customer_name: 'GRAND TOTAL',
      customer_reference: '',
      invoice_count: ageingSummary.reduce((sum, item) => sum + item.invoice_count, 0),
      ...Object.fromEntries(
        ageBrackets.map((bracket) => {
          const key = `age_${bracket.name.replace(/\s+/g, '_')}`;
            return [key, ageingSummary.reduce((sum, item) => sum + (item[key] || 0), 0)];
          })
        ),
        total_outstanding: ageingSummary.reduce((sum, item) => sum + (item.total_outstanding || 0), 0),
      };
    } else if (currencyDisplayOption === 'aed') {
      totalRowData = {
        customer_name: 'GRAND TOTAL',
        customer_reference: '',
        invoice_count: ageingSummary.reduce((sum, item) => sum + item.invoice_count, 0),
        ...Object.fromEntries(
          ageBrackets.map((bracket) => {
            const keyAed = `age_${bracket.name.replace(/\s+/g, '_')}_aed`;
            return [keyAed, ageingSummary.reduce((sum, item) => sum + (item[keyAed] || 0), 0)];
          })
        ),
        total_outstanding_aed: ageingSummary.reduce((sum, item) => sum + (item.total_outstanding_aed || 0), 0),
      };
    } else {
      totalRowData = {
        customer_name: 'GRAND TOTAL',
        customer_reference: '',
        invoice_count: ageingSummary.reduce((sum, item) => sum + item.invoice_count, 0),
        ...Object.fromEntries(
          ageBrackets.map((bracket) => {
            const key = `age_${bracket.name.replace(/\s+/g, '_')}`;
            const keyAed = `age_${bracket.name.replace(/\s+/g, '_')}_aed`;
          return [
              [key, ageingSummary.reduce((sum, item) => sum + (item[key] || 0), 0)],
              [keyAed, ageingSummary.reduce((sum, item) => sum + (item[keyAed] || 0), 0)]
          ];
          }).flat()
      ),
      total_outstanding: ageingSummary.reduce((sum, item) => sum + (item.total_outstanding || 0), 0),
        total_outstanding_aed: ageingSummary.reduce((sum, item) => sum + (item.total_outstanding_aed || 0), 0),
      };
    }

    const totalRow = sheet.addRow(totalRowData);

    // Style the totals row
    totalRow.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FFFFFF' } };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2D3748' } };
    totalRow.height = 28;

    totalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: 'middle', horizontal: cell.col >= 4 ? 'right' : 'left' };
      if (cell.col >= 4) {
        // ✅ ENHANCED: Dynamic currency formatting for totals row
        if (currencyDisplayOption === 'aed') {
        cell.numFmt = '_("AED"* #,##0.00_);_("AED"* (#,##0.00);_("AED"* "-"??_);_(@_)';
        } else if (currencyDisplayOption === 'original') {
          // For original currency, we'll use a generic format since ageing summary aggregates multiple currencies
          cell.numFmt = '#,##0.00';
        } else {
          // Default format for 'both' option
          cell.numFmt = '#,##0.00';
        }
      }
    });

    // Apply professional borders to all data rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 7) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'D1D5DB' } },
            left: { style: 'thin', color: { argb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
            right: { style: 'thin', color: { argb: 'D1D5DB' } },
          };
        });
      }
    });

    // Add footer with generation timestamp
    const lastRow = sheet.lastRow.number + 2;
    sheet.mergeCells(`A${lastRow}:I${lastRow}`);
    const footerCell = sheet.getCell(`A${lastRow}`);
    footerCell.value = `Generated by PEO Central Financial System on ${new Date().toLocaleString(
      'en-US'
    )} | Confidential & Proprietary`;
    footerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    footerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '6B7280' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const exportAgeingDetailedReport = async (reqQuery) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ ENHANCED: Get currency display option from query
    const currencyDisplayOption = reqQuery.currency_display || 'both'; // 'original', 'aed', 'both'

    const pipeline = [
      {
        $match: {
          is_deleted: 0,
          // Include ALL unpaid invoices for comprehensive aging analysis
          status: { $in: ['Due', 'Overdue', 'Partially Paid'] },
          $or: [{ paid: false }, { paid: { $exists: false } }],
          invoice_number: { $not: /^VOID-/ }, // Exclude VOID invoices
          balance_due: { $gt: 0 }, // Only invoices with outstanding balance
          type: { $nin: ['payroll invoice'] },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $unwind: '$customerDetails',
      },
      {
        $project: {
          customer_name: '$customerDetails.company_name',
          reference_number: '$customerDetails.reference_number',
          unique_code: '$customerDetails.unique_code',
          trn_number: '$customerDetails.trn_number',
          email: '$customerDetails.email',
          type: 1,
          invoice_number: 1,
          invoice_date: 1,
          due_date: 1,
          original_amount: '$total',
          balance_due: 1,
          partial_amount: { $ifNull: ['$partial_amount', 0] },
          // ✅ ENHANCED: Add currency fields for multi-currency support
          currency: { $ifNull: ['$currency', 'AED'] },
          conversion_rate: { $ifNull: ['$conversion_rate', 1.0] },
          status: 1,
          terms_name: 1,
          invoice_age_days: {
            $floor: {
              $max: [
                0,
                {
                  $divide: [{ $subtract: [today, '$due_date'] }, 24 * 60 * 60 * 1000],
                },
              ],
            },
          },
          aging_category: {
            $switch: {
              branches: [
                {
                  case: { $lte: [{ $divide: [{ $subtract: [today, '$due_date'] }, 24 * 60 * 60 * 1000] }, 0] },
                  then: 'Current',
                },
                {
                  case: { $lte: [{ $divide: [{ $subtract: [today, '$due_date'] }, 24 * 60 * 60 * 1000] }, 30] },
                  then: '1-30 Days',
                },
                {
                  case: { $lte: [{ $divide: [{ $subtract: [today, '$due_date'] }, 24 * 60 * 60 * 1000] }, 60] },
                  then: '31-60 Days',
                },
                {
                  case: { $lte: [{ $divide: [{ $subtract: [today, '$due_date'] }, 24 * 60 * 60 * 1000] }, 90] },
                  then: '61-90 Days',
                },
              ],
              default: '91+ Days',
            },
          },
        },
      },
      {
        $sort: { customer_name: 1, invoice_age_days: -1, due_date: 1 },
      },
    ];

    if (reqQuery.company_id) {
      pipeline.unshift({
        $match: {
          customer: ObjectId(reqQuery.company_id),
        },
      });
    }

    const detailedAgeingData = await Invoice.aggregate(pipeline);

    // Generate Excel file with professional layout
    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('Detailed Ageing Report');

    // Set workbook metadata
    workbook.creator = 'PEO Central Financial System';
    workbook.lastModifiedBy = 'PEO Central';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ✅ ENHANCED: Dynamic column structure based on currency display option
    let columns;
    if (currencyDisplayOption === 'original') {
      // Original Currency: Show only original amounts, no AED columns
      columns = [
      { header: 'Client Name', key: 'customer_name', width: 40 },
      { header: 'Client Ref.', key: 'reference_number', width: 25 },
      { header: 'Client Unique Code', key: 'unique_code', width: 20 },
      { header: 'TRN Number', key: 'trn_number', width: 18 },
      { header: 'Email Address', key: 'email', width: 30 },
      { header: 'Invoice #', key: 'invoice_number', width: 18 },
      { header: 'Transaction Type', key: 'type', width: 22 },
      { header: 'Invoice Date', key: 'invoice_date', width: 14 },
      { header: 'Due Date', key: 'due_date', width: 14 },
      { header: 'Original Amount', key: 'original_amount', width: 18 },
        { header: 'Currency', key: 'currency', width: 12 },
        { header: 'Conversion Rate', key: 'conversion_rate', width: 16 },
      { header: 'Paid Amount', key: 'partial_amount', width: 16 },
      { header: 'Balance Due', key: 'balance_due', width: 18 },
      { header: 'Days Overdue', key: 'invoice_age_days', width: 15 },
      { header: 'Risk Category', key: 'aging_category', width: 16 },
      { header: 'Payment Terms', key: 'terms_name', width: 16 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    } else if (currencyDisplayOption === 'aed') {
      // AED Only: Show only AED amounts, hide original currency columns
      columns = [
        { header: 'Client Name', key: 'customer_name', width: 40 },
        { header: 'Client Ref.', key: 'reference_number', width: 25 },
        { header: 'Client Unique Code', key: 'unique_code', width: 20 },
        { header: 'TRN Number', key: 'trn_number', width: 18 },
        { header: 'Email Address', key: 'email', width: 30 },
        { header: 'Invoice #', key: 'invoice_number', width: 18 },
        { header: 'Transaction Type', key: 'type', width: 22 },
        { header: 'Invoice Date', key: 'invoice_date', width: 14 },
        { header: 'Due Date', key: 'due_date', width: 14 },
        { header: 'AED Amount', key: 'aed_amount', width: 18 },
        { header: 'Paid Amount (AED)', key: 'partial_amount', width: 16 },
        { header: 'Balance Due (AED)', key: 'balance_due', width: 18 },
        { header: 'Days Overdue', key: 'invoice_age_days', width: 15 },
        { header: 'Risk Category', key: 'aging_category', width: 16 },
        { header: 'Payment Terms', key: 'terms_name', width: 16 },
        { header: 'Status', key: 'status', width: 15 },
      ];
    } else {
      // Both: Show both original and AED amounts
      columns = [
        { header: 'Client Name', key: 'customer_name', width: 40 },
        { header: 'Client Ref.', key: 'reference_number', width: 25 },
        { header: 'Client Unique Code', key: 'unique_code', width: 20 },
        { header: 'TRN Number', key: 'trn_number', width: 18 },
        { header: 'Email Address', key: 'email', width: 30 },
        { header: 'Invoice #', key: 'invoice_number', width: 18 },
        { header: 'Transaction Type', key: 'type', width: 22 },
        { header: 'Invoice Date', key: 'invoice_date', width: 14 },
        { header: 'Due Date', key: 'due_date', width: 14 },
        { header: 'Original Amount', key: 'original_amount', width: 18 },
        { header: 'Currency', key: 'currency', width: 12 },
        { header: 'Conversion Rate', key: 'conversion_rate', width: 16 },
        { header: 'AED Amount', key: 'aed_amount', width: 18 },
        { header: 'Paid Amount', key: 'partial_amount', width: 16 },
        { header: 'Balance Due', key: 'balance_due', width: 18 },
        { header: 'AED Balance', key: 'aed_balance', width: 18 },
        { header: 'Days Overdue', key: 'invoice_age_days', width: 15 },
        { header: 'Risk Category', key: 'aging_category', width: 16 },
        { header: 'Payment Terms', key: 'terms_name', width: 16 },
        { header: 'Status', key: 'status', width: 15 },
      ];
    }

    sheet.columns = columns;

    // Professional header section
    const lastColumn = String.fromCharCode(64 + columns.length); // Calculate last column letter
    sheet.mergeCells(`A1:${lastColumn}1`);
    const companyCell = sheet.getCell('A1');
    companyCell.value = 'PEO CENTRAL - DYNAMIC EMPLOYMENT SERVICES L.L.C';
    companyCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    companyCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: '1F4E79' } };
    companyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F7FC' } };

    sheet.mergeCells(`A2:${lastColumn}2`);
    const titleCell = sheet.getCell('A2');
    titleCell.value = 'ACCOUNTS PAYABLE AGING DETAILED REPORT';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: '1F4E79' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F1F8' } };

    // Report metadata
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    sheet.mergeCells(`A3:${lastColumn}3`);
    const dateCell = sheet.getCell('A3');
    // ✅ ENHANCED: Dynamic currency display based on option
    let currencyText = '';
    if (currencyDisplayOption === 'aed') {
      currencyText = 'Currency: AED Only';
    } else if (currencyDisplayOption === 'original') {
      currencyText = 'Currency: Original (USD/EUR/AED)';
    } else {
      currencyText = 'Currency: Both Original + AED Equivalent';
    }
    dateCell.value = `Report Date: ${reportDate} | As of: ${new Date().toLocaleDateString('en-US')} | ${currencyText}`;
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dateCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: '4A5568' } };

    // Summary statistics
    const totalRecords = detailedAgeingData.length;
    // ✅ ENHANCED: Calculate totals based on currency display option
    const totalOutstanding = detailedAgeingData.reduce((sum, inv) => {
      if (currencyDisplayOption === 'aed') {
        return sum + ((inv.balance_due || 0) * (inv.conversion_rate || 1.0));
      } else {
        return sum + (inv.balance_due || 0);
      }
    }, 0);
    const avgDaysOverdue =
      totalRecords > 0
        ? Math.round(detailedAgeingData.reduce((sum, inv) => sum + inv.invoice_age_days, 0) / totalRecords)
        : 0;
    const criticalCount = detailedAgeingData.filter((inv) => inv.invoice_age_days > 90).length;

    sheet.mergeCells(`A4:${lastColumn}4`);
    const summaryCell = sheet.getCell('A4');
    // ✅ ENHANCED: Dynamic currency display in summary
    let currencySymbol = '';
    if (currencyDisplayOption === 'aed') {
      currencySymbol = 'AED';
    } else if (currencyDisplayOption === 'original') {
      currencySymbol = 'Mixed Currency';
    } else {
      currencySymbol = 'Mixed Currency';
    }
    summaryCell.value = `Outstanding Invoices: ${totalRecords} | Total Amount: ${currencySymbol} ${totalOutstanding.toLocaleString(
      'en-US',
      { minimumFractionDigits: 2 }
    )} | Avg Days Overdue: ${avgDaysOverdue} | Critical (90+ days): ${criticalCount}`;
    summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };
    summaryCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'C53030' } };
    summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF5E7' } };

    // Separator rows
    sheet.insertRow(5, []);
    sheet.insertRow(6, []);

    // Professional header row
    const headerRow = sheet.getRow(7);
    headerRow.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.values = columns.map((col) => col.header);
    headerRow.height = 28;

    // Add data rows with enhanced formatting
    detailedAgeingData.forEach((invoice, index) => {
      // ✅ ENHANCED: Currency-sensitive amount formatting for detailed ageing
      let originalAmount = parseFloat(invoice.original_amount) || 0;
      let partialAmount = parseFloat(invoice.partial_amount) || 0;
      let balanceDue = parseFloat(invoice.balance_due) || 0;

      // Apply currency conversion if needed
      if (currencyDisplayOption === 'aed' && invoice.currency && invoice.currency !== 'AED') {
        const conversionRate = parseFloat(invoice.conversion_rate) || 1.0;
        originalAmount = originalAmount * conversionRate;
        partialAmount = partialAmount * conversionRate;
        balanceDue = balanceDue * conversionRate;
      }

      // ✅ ENHANCED: Calculate AED amounts using conversion rates with validation
      let conversionRate = parseFloat(invoice.conversion_rate) || 1.0;

      // ✅ VALIDATION: Ensure conversion rates are reasonable
      if (invoice.currency === 'USD' && conversionRate < 1.0) {
        // If USD rate is less than 1, it's likely inverted - fix it
        conversionRate = 1.0 / conversionRate;
      } else if (invoice.currency === 'EUR' && conversionRate < 1.0) {
        // If EUR rate is less than 1, it's likely inverted - fix it
        conversionRate = 1.0 / conversionRate;
      }

      const aedAmount = originalAmount * conversionRate;
      const aedBalance = balanceDue * conversionRate;

      // ✅ ENHANCED: Dynamic row creation based on currency display option
      let rowData;
      if (currencyDisplayOption === 'original') {
        // Original Currency: Show only original amounts
        rowData = {
        customer_name: invoice.customer_name,
        reference_number: invoice.reference_number || 'N/A',
        unique_code: invoice.unique_code || 'N/A',
        trn_number: invoice.trn_number || 'N/A',
        email: invoice.email || 'N/A',
        invoice_number: invoice.invoice_number,
        type: invoice.type,
        invoice_date: invoice.invoice_date ? invoice.invoice_date.toISOString().split('T')[0] : 'N/A',
        due_date: invoice.due_date ? invoice.due_date.toISOString().split('T')[0] : 'N/A',
        original_amount: originalAmount,
          currency: invoice.currency || 'AED',
          conversion_rate: conversionRate,
        partial_amount: partialAmount,
        balance_due: balanceDue,
        invoice_age_days: invoice.invoice_age_days,
        aging_category: invoice.aging_category,
        terms_name: invoice.terms_name || 'Standard',
        status: invoice.status,
        };
      } else if (currencyDisplayOption === 'aed') {
        // AED Only: Show only AED amounts
        rowData = {
          customer_name: invoice.customer_name,
          reference_number: invoice.reference_number || 'N/A',
          unique_code: invoice.unique_code || 'N/A',
          trn_number: invoice.trn_number || 'N/A',
          email: invoice.email || 'N/A',
          invoice_number: invoice.invoice_number,
          type: invoice.type,
          invoice_date: invoice.invoice_date ? invoice.invoice_date.toISOString().split('T')[0] : 'N/A',
          due_date: invoice.due_date ? invoice.due_date.toISOString().split('T')[0] : 'N/A',
          aed_amount: aedAmount,
          partial_amount: partialAmount,
          balance_due: balanceDue,
          invoice_age_days: invoice.invoice_age_days,
          aging_category: invoice.aging_category,
          terms_name: invoice.terms_name || 'Standard',
          status: invoice.status,
        };
      } else {
        // Both: Show both original and AED amounts
        rowData = {
          customer_name: invoice.customer_name,
          reference_number: invoice.reference_number || 'N/A',
          unique_code: invoice.unique_code || 'N/A',
          trn_number: invoice.trn_number || 'N/A',
          email: invoice.email || 'N/A',
          invoice_number: invoice.invoice_number,
          type: invoice.type,
          invoice_date: invoice.invoice_date ? invoice.invoice_date.toISOString().split('T')[0] : 'N/A',
          due_date: invoice.due_date ? invoice.due_date.toISOString().split('T')[0] : 'N/A',
          original_amount: originalAmount,
          currency: invoice.currency || 'AED',
          conversion_rate: conversionRate,
          aed_amount: aedAmount,
          partial_amount: partialAmount,
          balance_due: balanceDue,
          aed_balance: aedBalance,
          invoice_age_days: invoice.invoice_age_days,
          aging_category: invoice.aging_category,
          terms_name: invoice.terms_name || 'Standard',
          status: invoice.status,
        };
      }

      const row = sheet.addRow(rowData);

      // Sophisticated risk-based color coding
      let riskColor = index % 2 === 0 ? 'FFFFFF' : 'F8FAFC'; // Alternating base colors

      if (invoice.invoice_age_days > 120) {
        riskColor = 'FFCCCC'; // Critical - Red
      } else if (invoice.invoice_age_days > 90) {
        riskColor = 'FFE6CC'; // Severe - Dark orange
      } else if (invoice.invoice_age_days > 60) {
        riskColor = 'FFF2CC'; // High - Orange
      } else if (invoice.invoice_age_days > 30) {
        riskColor = 'FFFACC'; // Medium - Yellow
      } else if (invoice.invoice_age_days > 0) {
        riskColor = 'F0FFF0'; // Low - Light green
      }

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: riskColor },
        };

        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { vertical: 'middle', wrapText: true };

        // ✅ ENHANCED: Column-specific formatting for new structure
        if ([10, 13, 15, 16].includes(cell.col)) {
          // Currency columns (Original Amount, AED Amount, Balance Due, AED Balance)
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          if (currencyDisplayOption === 'aed') {
            cell.numFmt = '_("AED"* #,##0.00_);_("AED"* (#,##0.00);_("AED"* "-"??_);_(@_)';
          } else if (currencyDisplayOption === 'original' && invoice.currency) {
            const currencySymbol = invoice.currency === 'USD' ? 'USD' : invoice.currency === 'EUR' ? 'EUR' : 'AED';
            cell.numFmt = `_("${currencySymbol}"* #,##0.00_);_("${currencySymbol}"* (#,##0.00);_("${currencySymbol}"* "-"??_);_(@_)`;
          } else {
            // Default format for 'both' option
            cell.numFmt = '#,##0.00';
          }
        } else if (cell.col === 11) {
          // Currency column - center align
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (cell.col === 12) {
          // Conversion Rate column - right align with decimal formatting
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0.0000';
        } else if (cell.col === 14) {
          // Paid Amount column - right align
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0.00';
        } else if (cell.col === 17) {
          // Days overdue
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          // Add conditional formatting for days
          if (invoice.invoice_age_days > 90) {
            cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C53030' } };
          }
        } else if (cell.col === 18) {
          // Risk category
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Arial', size: 9, bold: true };
        } else {
          // Text columns - left align
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });

      row.height = 20;
    });

    // Enhanced borders for all data rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 7) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'D1D5DB' } },
            left: { style: 'thin', color: { argb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
            right: { style: 'thin', color: { argb: 'D1D5DB' } },
          };
        });
      }
    });

    // Professional footer
    const lastRow = sheet.lastRow.number + 2;
    sheet.mergeCells(`A${lastRow}:P${lastRow}`);
    const footerCell = sheet.getCell(`A${lastRow}`);
    footerCell.value = `Generated by PEO Central Financial System on ${new Date().toLocaleString(
      'en-US'
    )} | Confidential & Proprietary`;
    footerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    footerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '6B7280' } };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

/**
 *  Function to generate employee salaries report from the system
 */
const exportEmployeeSalariesReport = async (reqQuery) => {
  try {
    const pipeline = [
      {
        $match: {
          is_deleted: false,
          user_status: { $in: ['active', 'onboarding', 'new visa process', 'offboarding'] },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'clientDetails',
          pipeline: [
            {
              $match: {
                status: { $in: ['active', 'new'] },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$clientDetails',
        },
      },
      {
        $project: {
          _id: 1,
          clientName: '$clientDetails.company_name',
          employeeName: {
            $concat: ['$first_name', ' ', { $ifNull: ['$middle_name', ''] }, ' ', '$last_name'],
          },
          employmentType: '$employment.visa_sponsor_type',
          // monthlySalary: {
          //   $round: [
          //     {
          //       $sum: {
          //         $map: {
          //           input: {
          //             $filter: {
          //               input: { $objectToArray: "$salary" },
          //               as: "item",
          //               cond: {
          //                 $and: [
          //                   { $not: { $in: ["$$item.k", ["total_fixed", "remarks"]] } },
          //                   { $ne: ["$$item.v", "none"] }
          //                 ]
          //               }
          //             }
          //           },
          //           as: "filteredItem",
          //           in: {
          //             $convert: {
          //               input: "$$filteredItem.v",
          //               to: "double",
          //               onError: 0,
          //               onNull: 0
          //             }
          //           }
          //         }
          //       }
          //     },
          //     2
          //   ]
          // },
          monthlySalary: '$salary.total_fixed',
          adminFee: {
            $round: [
              {
                $cond: [
                  {
                    $eq: ['$employment.visa_sponsor_type', 'Dynamic Employment Services'],
                  },
                  // Sum monthly_costs if visa_sponsor_type is "Dynamic Employment Services"
                  {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: { $objectToArray: '$clientDetails.monthly_costs' },
                            as: 'costItem',
                            cond: {
                              $and: [
                                { $ne: ['$$costItem.v', 'As Actuals'] }, // Exclude "As Actuals"
                                {
                                  $ne: ['$$costItem.v', null], // Exclude null
                                },
                              ],
                            },
                          },
                        },
                        as: 'filteredCost',
                        in: {
                          $convert: {
                            input: '$$filteredCost.v',
                            to: 'double',
                            onError: 0,
                            onNull: 0,
                          },
                        },
                      },
                    },
                  },
                  // Otherwise, sum monthly_costs_ees
                  {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: { $objectToArray: '$clientDetails.monthly_costs_ees' },
                            as: 'eesItem',
                            cond: {
                              $and: [
                                { $ne: ['$$eesItem.v', 'As Actuals'] }, // Exclude "As Actuals"
                                {
                                  $ne: ['$$eesItem.v', null], // Exclude null
                                },
                              ],
                            },
                          },
                        },
                        as: 'filteredEes',
                        in: {
                          $convert: {
                            input: '$$filteredEes.v',
                            to: 'double',
                            onError: 0,
                            onNull: 0,
                          },
                        },
                      },
                    },
                  },
                ],
              },
              2,
            ],
          },
          status: '$user_status',
        },
      },
    ];
    if (reqQuery.companyId) {
      pipeline.push({
        $match: {
          company_id: ObjectId(reqQuery.companyId),
        },
      });
    }
    const employeeData = await Users.aggregate(pipeline);
    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('Employee Salary Report');

    sheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 52 },
      { header: 'Employee Name', key: 'employeeName', width: 42 },
      { header: 'Monthly Salary', key: 'monthlySalary', width: 20 },
      { header: 'Employment Type', key: 'employmentType', width: 32 },
      { header: 'Admin Fee', key: 'adminFee', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
    ];
    employeeData.forEach((employee) => {
      sheet.addRow({
        clientName: employee.clientName,
        employeeName: employee.employeeName,
        monthlySalary: employee.monthlySalary,
        employmentType: employee.employmentType,
        adminFee: employee.adminFee,
        status: employee.status,
      });
    });
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const applyStylesToRow = (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    };

    // Apply border and alignment styles to all rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        applyStylesToRow(row);
      }
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getDraftInvoiceByCustomerId = async (customerId) => {
  try {
    const invoices = await Invoice.find({ customer: customerId, is_draft: true, invoice_number: { $not: /^VOID-/ } });
    if (!invoices.length) {
      return null;
    }
    // get the first invoice
    return invoices[0];
  } catch (e) {
    throw new Error('Error when creating draft invoice: ', e.message);
  }
};

const duplicateInvoice = async (originalId, userId, userName) => {
  // Load original invoice
  const original = await getInvoiceById(originalId);
  if (!original) {
    throw new Error('Original invoice not found');
  }

  // Generate a fresh invoice number
  const newInvoiceNumber = await generateInvoiceNumber();

  // Build payload for duplication
  const duplicatedItems = Array.isArray(original.items) ? original.items.map((it) => ({ ...it, _id: new ObjectId() })) : [];

  const payload = {
    invoice_number: newInvoiceNumber,
    type: original.type,
    customer: original.customer,
    company: original.company,
    cost_center: original.cost_center,
    customer_name: original.customer_name,
    customer_address: original.customer_address,
    customer_trn: original.customer_trn,
    branch: original.branch,
    email: original.email,
    billing_address: original.billing_address,
    shipping_address: original.shipping_address,
    order_number: original.order_number,
    terms: original.terms,
    terms_name: original.terms_name,
    due_date: original.due_date,
    invoice_date: original.invoice_date,
    sale_location: original.sale_location,
    sale_person: original.sale_person,
    items: duplicatedItems,
    details_field: original.details_field,
    sub_total: original.sub_total,
    totalAdministrationCost: original.totalAdministrationCost,
    vat_total: original.vat_total,
    discount_total: original.discount_total,
    total: original.total,
    partial_amount: 0,
    status: 'Unapproved',
    paid: false,
    void: false,
    write_off: false,
    credit_applied: false,
    debit_applied: false,
    debit_amount: 0,
    debit_notes: [],
    credit_amount: 0,
    credit_notes: [],
    is_duplicate: true,
    parent_invoice: original._id,
    void_reason: undefined,
    write_off_reason: undefined,
    is_recurring: original.is_recurring,
    is_draft: true,
    recurring_template: original.recurring_template,
    subject: original.subject,
    customer_notes: original.customer_notes,
    terms_condition: original.terms_condition,
    documents: [],
    balance_due: original.total,
    invoice_path: [],
    payment_note_link: [],
    payment_date: null,
    cancelled: 0,
    estimate: original.estimate,
    user_id: original.user_id,
    is_deleted: 0,
    time_sheet: '',
    invoice_link: '',
    is_sent: { Due: false, Overdue: false, Paid: false },
    sent_date: null,
    visa_sponsor: original.visa_sponsor,
    memo: original.memo,
    assigned_to: original.assigned_to,
    updatedBy: userId || undefined,
  };

  const created = await Invoice.create(payload);

  // Optionally generate preview link to keep behavior consistent
  try {
    const preview = await getPreviewPDF(created._id, userId || original.user_id);
    created.invoice_link = preview && preview.url;
    await created.save();
  } catch (e) {
    // Non-fatal: continue even if preview generation fails
    console.error('Preview generation failed for duplicated invoice', e && e.message);
  }
  return created;
};

const exportInvoiceTemplate = async () => {
  try {
    const excelJs = require('exceljs');
    const moment = require('moment');
    const { Companies, Terms } = require('../models');
    const workbook = new excelJs.Workbook();
    workbook.creator = 'PEO Central';
    workbook.created = new Date();

    // Main Invoice Details Sheet
    const mainSheet = workbook.addWorksheet('Invoice Bulk Upload Template', {
      pageSetup: { paperSize: 9, orientation: 'portrait' },
    });

    // Line Items Sheet
    const lineItemsSheet = workbook.addWorksheet('Line Items', {
      pageSetup: { paperSize: 9, orientation: 'portrait' },
    });

    // Main sheet columns
    const mainColumns = [
      { header: 'Invoice Number*', key: 'invoice_number', width: 25 },
      { header: 'Customer/Company*', key: 'customer', width: 30 },
      { header: 'Customer Email', key: 'email', width: 30 },
      { header: 'Billing Address*', key: 'billing_address', width: 40 },
      { header: 'Shipping Address', key: 'shipping_address', width: 40 },
      { header: 'Memo', key: 'memo', width: 50 },
      { header: 'Invoice Date*', key: 'invoice_date', width: 20 },
      { header: 'Due Date*', key: 'due_date', width: 20 },
      { header: 'Status*', key: 'status', width: 15 },
      { header: 'Terms*', key: 'terms', width: 25 },
      { header: 'Terms & Conditions', key: 'terms_condition', width: 50 },
      { header: 'Currency', key: 'currency', width: 15 },
      { header: 'Customer Notes', key: 'notes', width: 40 },
      { header: 'Visa Sponsor Type*', key: 'visa_sponsor', width: 35 },
      { header: 'Invoice Type', key: 'invoice_type', width: 20 },
      { header: 'Sub Total', key: 'sub_total', width: 20 },
      { header: 'VAT Total', key: 'vat_total', width: 20 },
      { header: 'Total', key: 'total', width: 20 },
    ];

    // Line Items sheet columns (Line Item Number removed, Tax Code after Amount, then VAT Rate)
    const lineItemColumns = [
      { header: 'Invoice Number*', key: 'invoice_number', width: 25 },
      { header: 'Service Name*', key: 'service_name', width: 30 },
      { header: 'Employee Name', key: 'employee_name', width: 35 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Quantity*', key: 'quantity', width: 15 },
      { header: 'Rate*', key: 'rate', width: 20 },
      { header: 'Amount', key: 'amount', width: 20 },
      { header: 'Tax Code*', key: 'tax_code', width: 20 },
      { header: 'VAT Rate', key: 'vat_rate', width: 15 },
      { header: 'VAT Amount', key: 'vat_amount', width: 20 },
      { header: 'Net Total', key: 'net_total', width: 20 },
    ];

    // Add title row to main sheet
    const title = `Invoice Bulk Upload Template - ${moment().format('MMMM YYYY')}`;
    mainSheet.addRow([title]);
    mainSheet.getRow(1).font = { bold: true, size: 16 };
    mainSheet.getRow(1).alignment = { horizontal: 'center' };
    mainSheet.mergeCells(1, 1, 1, mainColumns.length);

    // Add header row to main sheet
    const mainHeaderValues = mainColumns.map((col) => col.header);
    const mainHeaderRow = mainSheet.addRow(mainHeaderValues);

    // Add header row to line items sheet
    const lineItemHeaderValues = lineItemColumns.map((col) => col.header);
    const lineItemHeaderRow = lineItemsSheet.addRow(lineItemHeaderValues);

    // Set column widths for main sheet
    mainColumns.forEach((col, index) => {
      mainSheet.getColumn(index + 1).width = col.width;
    });

    // Set column widths for line items sheet
    lineItemColumns.forEach((col, index) => {
      lineItemsSheet.getColumn(index + 1).width = col.width;
    });

    // Style header rows
    [mainHeaderRow, lineItemHeaderRow].forEach((headerRow) => {
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Get dynamic data from database
    let companies = ['Default Company'];
    let terms = ['Default Terms'];
    let currencies = ['AED'];
    let visaSponsors = ['Dynamic Employment Services', 'Executive Employment Services'];
    let invoiceTypes = ['general invoice'];
    let taxCodesData = [{ code: 'Default Tax Code', rate: 0 }];
    let productsAndServices = ['Default Service'];

    try {
      // Get companies
      const companiesData = await Companies.find({ is_deleted: false, status: { $in: ['active', 'new'] } });
      if (companiesData && companiesData.length > 0) {
        companies = companiesData.map((company) => company.company_name || company.name);
      }

      // Get terms
      const termsData = await Terms.find({ is_deleted: false });
      if (termsData && termsData.length > 0) {
        terms = termsData.map((term) => term.name);
      }

      // Get tax codes with rates
      const TaxCodes = require('../models/tax_codes.model');
      const fetchedTaxCodesData = await TaxCodes.find({ is_deleted: 0 });
      if (fetchedTaxCodesData && fetchedTaxCodesData.length > 0) {
        taxCodesData = fetchedTaxCodesData.map((tax) => ({ code: tax.code, rate: tax.rate }));
      }

      // Get products and services
      const Configurations = require('../models/configuration.model');
      const configData = await Configurations.findOne({ is_deleted: false });
      if (configData && configData.products_and_services && configData.products_and_services.length > 0) {
        productsAndServices = configData.products_and_services.map((item) => item.name);
      }
    } catch (error) {
      console.warn('Could not fetch dynamic data, using defaults:', error.message);
    }

    // Create hidden reference sheets
    const companiesSheet = workbook.addWorksheet('Companies', { state: 'hidden' });
    companies.forEach((company, index) => {
      companiesSheet.getCell(`A${index + 1}`).value = company;
    });

    const termsSheet = workbook.addWorksheet('Terms', { state: 'hidden' });
    terms.forEach((term, index) => {
      termsSheet.getCell(`A${index + 1}`).value = term;
    });

    const currenciesSheet = workbook.addWorksheet('Currencies', { state: 'hidden' });
    currencies.forEach((currency, index) => {
      currenciesSheet.getCell(`A${index + 1}`).value = currency;
    });

    const visaSponsorsSheet = workbook.addWorksheet('VisaSponsors', { state: 'hidden' });
    visaSponsors.forEach((sponsor, index) => {
      visaSponsorsSheet.getCell(`A${index + 1}`).value = sponsor;
    });

    const invoiceTypesSheet = workbook.addWorksheet('InvoiceTypes', { state: 'hidden' });
    invoiceTypes.forEach((type, index) => {
      invoiceTypesSheet.getCell(`A${index + 1}`).value = type;
    });

    const taxCodesSheet = workbook.addWorksheet('TaxCodes', { state: 'hidden' });
    taxCodesData.forEach((tax, index) => {
      taxCodesSheet.getCell(`A${index + 1}`).value = tax.code;
      taxCodesSheet.getCell(`B${index + 1}`).value = tax.rate;
    });

    const productsAndServicesSheet = workbook.addWorksheet('ProductsAndServices', { state: 'hidden' });
    productsAndServices.forEach((service, index) => {
      productsAndServicesSheet.getCell(`A${index + 1}`).value = service;
    });

    // Helper function to get column letter from index (0-based)
    const getColumnLetter = (index) => String.fromCharCode(65 + index); // A=65, B=66, etc.

    // Helper function for dropdown validation
    const addDropdownValidation = (
      sheet,
      columnKey,
      columns,
      options,
      title,
      allowBlank = true,
      startRow = 3,
      maxRow = 1002
    ) => {
      try {
        // Find the column index for the given key
        const colIndex = columns.findIndex((col) => col.key === columnKey);
        if (colIndex === -1) {
          throw new Error(`Column key ${columnKey} not found`);
        }
        const colLetter = getColumnLetter(colIndex);
        const range = `${colLetter}${startRow}:${colLetter}${maxRow}`;

        let formulae;
        if (Array.isArray(options)) {
          formulae = [`"${options.join(',')}"`];
        } else {
          formulae = [options];
        }

        sheet.dataValidations.add(range, {
          type: 'list',
          allowBlank: allowBlank,
          formulae: formulae,
          showErrorMessage: true,
          errorTitle: `Invalid ${title}`,
          error: `Please select a valid ${title.toLowerCase()} from the dropdown`,
          showDropDown: true,
        });
      } catch (error) {
        console.warn(`Could not add dropdown validation for ${title}: ${error.message}`);
      }
    };

    // Helper function for email validation
    const addEmailValidation = (sheet, columnKey, columns, fieldName, startRow = 3, maxRow = 1002) => {
      try {
        const colIndex = columns.findIndex((col) => col.key === columnKey);
        if (colIndex === -1) {
          throw new Error(`Column key ${columnKey} not found`);
        }
        const colLetter = getColumnLetter(colIndex);
        const range = `${colLetter}${startRow}:${colLetter}${maxRow}`;

        sheet.dataValidations.add(range, {
          type: 'textLength',
          operator: 'greaterThan',
          formulae: [5],
          allowBlank: true,
          showErrorMessage: true,
          errorTitle: 'Invalid Email',
          error: `Please enter a valid ${fieldName.toLowerCase()}.`,
        });
      } catch (error) {
        console.warn(`Could not add email validation for ${fieldName}: ${error.message}`);
      }
    };

    // Add dropdown validations to main sheet (starts at row 3)
    addDropdownValidation(
      mainSheet,
      'customer',
      mainColumns,
      `Companies!$A$1:$A$${companies.length}`,
      'Company',
      false,
      3,
      1002
    );
    addEmailValidation(mainSheet, 'email', mainColumns, 'Email (Optional - will use company email if not provided)', 3, 1002);
    addDropdownValidation(mainSheet, 'terms', mainColumns, `Terms!$A$1:$A$${terms.length}`, 'Terms', false, 3, 1002);
    addDropdownValidation(
      mainSheet,
      'currency',
      mainColumns,
      `Currencies!$A$1:$A$${currencies.length}`,
      'Currency',
      true,
      3,
      1002
    );
    addDropdownValidation(
      mainSheet,
      'visa_sponsor',
      mainColumns,
      `VisaSponsors!$A$1:$A$${visaSponsors.length}`,
      'Visa Sponsor Type',
      false,
      3,
      1002
    );
    addDropdownValidation(
      mainSheet,
      'invoice_type',
      mainColumns,
      `InvoiceTypes!$A$1:$A$${invoiceTypes.length}`,
      'Invoice Type',
      true,
      3,
      1002
    );
    addDropdownValidation(mainSheet, 'status', mainColumns, ['Paid', 'Due'], 'Status', false, 3, 1002);

    // Add dropdown validations to line items sheet (starts at row 2)
    addDropdownValidation(
      lineItemsSheet,
      'service_name',
      lineItemColumns,
      `ProductsAndServices!$A$1:$A$${productsAndServices.length}`,
      'Service Name',
      false,
      2,
      1001
    );
    addDropdownValidation(
      lineItemsSheet,
      'tax_code',
      lineItemColumns,
      `TaxCodes!$A$1:$A$${taxCodesData.length}`,
      'Tax Code',
      false,
      2,
      1001
    );

    // Add date validations for main sheet
    const dateValidationStart = new Date(1900, 0, 1);

    // Invoice Date validation
    const invoiceDateColIndex = mainColumns.findIndex((col) => col.key === 'invoice_date');
    mainSheet.dataValidations.add(`${getColumnLetter(invoiceDateColIndex)}3:${getColumnLetter(invoiceDateColIndex)}1002`, {
      type: 'date',
      operator: 'greaterThanOrEqual',
      formulae: [dateValidationStart],
      allowBlank: false,
      showErrorMessage: true,
      errorTitle: 'Invalid Invoice Date',
      error: 'Please enter a valid invoice date (DD-MM-YYYY format)',
      showInputMessage: true,
      inputTitle: 'Date Format',
      inputMessage: 'Enter date in DD-MM-YYYY format or use the date picker',
    });

    // Due Date validation
    const dueDateColIndex = mainColumns.findIndex((col) => col.key === 'due_date');
    mainSheet.dataValidations.add(`${getColumnLetter(dueDateColIndex)}3:${getColumnLetter(dueDateColIndex)}1002`, {
      type: 'date',
      operator: 'greaterThanOrEqual',
      formulae: [dateValidationStart],
      allowBlank: false,
      showErrorMessage: true,
      errorTitle: 'Invalid Due Date',
      error: 'Please enter a valid due date (DD-MM-YYYY format)',
      showInputMessage: true,
      inputTitle: 'Date Format',
      inputMessage: 'Enter date in DD-MM-YYYY format or use the date picker',
    });

    // Format date columns
    const dateColumns = [
      mainColumns.findIndex((col) => col.key === 'invoice_date') + 1,
      mainColumns.findIndex((col) => col.key === 'due_date') + 1,
    ];
    for (let row = 3; row <= 1002; row++) {
      dateColumns.forEach((colIndex) => {
        mainSheet.getCell(row, colIndex).numFmt = 'dd-mm-yyyy';
      });
    }

    // Format number columns in main sheet
    const numberColumns = [
      mainColumns.findIndex((col) => col.key === 'sub_total') + 1,
      mainColumns.findIndex((col) => col.key === 'vat_total') + 1,
      mainColumns.findIndex((col) => col.key === 'total') + 1,
    ];
    for (let row = 3; row <= 1002; row++) {
      numberColumns.forEach((colIndex) => {
        if (colIndex > 0) {
          // Safety check to ensure valid column index
          mainSheet.getCell(row, colIndex).numFmt = '#,##0.00';
        }
      });
    }

    // Format number columns in line items sheet
    const lineItemNumberColumns = [
      lineItemColumns.findIndex((col) => col.key === 'quantity') + 1,
      lineItemColumns.findIndex((col) => col.key === 'rate') + 1,
      lineItemColumns.findIndex((col) => col.key === 'amount') + 1,
      lineItemColumns.findIndex((col) => col.key === 'vat_rate') + 1,
      lineItemColumns.findIndex((col) => col.key === 'vat_amount') + 1,
      lineItemColumns.findIndex((col) => col.key === 'net_total') + 1,
    ];
    for (let row = 2; row <= 1001; row++) {
      lineItemNumberColumns.forEach((colIndex) => {
        lineItemsSheet.getCell(row, colIndex).numFmt = '#,##0.00';
      });
    }

    // Add formulas to line items sheet for auto-calculations
    const lineStartRow = 2;
    const lineMaxRow = 1001;
    for (let row = lineStartRow; row <= lineMaxRow; row++) {
      // Amount = Quantity * Rate
      const qtyCol = getColumnLetter(lineItemColumns.findIndex((col) => col.key === 'quantity'));
      const rateCol = getColumnLetter(lineItemColumns.findIndex((col) => col.key === 'rate'));
      const amountCell = lineItemsSheet.getCell(row, lineItemColumns.findIndex((col) => col.key === 'amount') + 1);
      amountCell.formula = `${qtyCol}${row}*${rateCol}${row}`;
      // Make Amount cell read-only since it's auto-calculated
      amountCell.protection = { locked: true };

      // VAT Rate = IF(Tax Code="", "", VLOOKUP(Tax Code, TaxCodes!A:B, 2, FALSE))
      const taxCodeCol = getColumnLetter(lineItemColumns.findIndex((col) => col.key === 'tax_code'));
      const vatRateCell = lineItemsSheet.getCell(row, lineItemColumns.findIndex((col) => col.key === 'vat_rate') + 1);
      vatRateCell.formula = `IF(${taxCodeCol}${row}="", "", VLOOKUP(${taxCodeCol}${row}, TaxCodes!$A$1:$B$${taxCodesData.length}, 2, FALSE))`;
      // Make VAT Rate cell read-only since it's auto-populated
      vatRateCell.protection = { locked: true };

      // VAT Amount = IF(VAT Rate="", 0, Amount * (VAT Rate / 100))
      const amountCol = getColumnLetter(lineItemColumns.findIndex((col) => col.key === 'amount'));
      const vatRateCol = getColumnLetter(lineItemColumns.findIndex((col) => col.key === 'vat_rate'));
      const vatAmountCell = lineItemsSheet.getCell(row, lineItemColumns.findIndex((col) => col.key === 'vat_amount') + 1);
      vatAmountCell.formula = `IF(${vatRateCol}${row}="", 0, ${amountCol}${row} * (${vatRateCol}${row}/100))`;
      // Make VAT Amount cell read-only since it's auto-calculated
      vatAmountCell.protection = { locked: true };

      // Net Total = Amount + VAT Amount
      const vatAmountCol = getColumnLetter(lineItemColumns.findIndex((col) => col.key === 'vat_amount'));
      const netTotalCell = lineItemsSheet.getCell(row, lineItemColumns.findIndex((col) => col.key === 'net_total') + 1);
      netTotalCell.formula = `${amountCol}${row} + ${vatAmountCol}${row}`;
      // Make Net Total cell read-only since it's auto-calculated
      netTotalCell.protection = { locked: true };
    }

    // Add instructions section to main sheet
    const instructionRow = 25;
    mainSheet.getCell(`A${instructionRow}`).value = 'INSTRUCTIONS:';
    mainSheet.getCell(`A${instructionRow}`).font = { bold: true, size: 12, color: { argb: 'FF0000' } };

    const instructions = [
      '1. Required fields (marked with *): Invoice Number, Customer/Company, Email, Invoice Date, Due Date, Status, Terms, Visa Sponsor Type',
      '2. Invoice Number: Manual entry - must be unique and match exactly in the "Line Items" sheet',
      '3. Date fields: Use DD-MM-YYYY format (e.g., 25-07-2025)',
      '4. Email: Must be valid (e.g., user@domain.com)',
      '5. Status: Select from dropdown - Paid, Due, or Partially Paid (required field)',
      '6. Dropdown fields: Select only from provided options',
      '7. Line Items Sheet: Each row represents one line item for an invoice',
      '8. Invoice Number: Must match exactly with the main sheet invoice number',
      '9. Amount fields: Will be auto-calculated if formulas are preserved',
      '10. Maximum 1000 invoices can be uploaded at once',
      '11. Do not modify column headers or their order',
      '12. VAT Rate: Auto-populated when Tax Code is selected',
      '13. Currency: Default is AED if not specified',
      '14. Tax Code: Select from dropdown - required for each line item',
    ];

    instructions.forEach((instruction, index) => {
      const currentRow = instructionRow + index + 1;
      mainSheet.getCell(`A${currentRow}`).value = instruction;
      mainSheet.getCell(`A${currentRow}`).font = { italic: true, size: 10 };
    });

    // Add instructions section to line items sheet (updated to remove Line Item Number)
    const lineItemInstructionRow = 25;
    lineItemsSheet.getCell(`A${lineItemInstructionRow}`).value = 'LINE ITEMS INSTRUCTIONS:';
    lineItemsSheet.getCell(`A${lineItemInstructionRow}`).font = { bold: true, size: 12, color: { argb: 'FF0000' } };

    const lineItemInstructions = [
      '1. Invoice Number: Must match exactly with the main sheet invoice number',
      '2. Required fields: Service Name, Quantity, Rate, Tax Code',
      '3. Service Name: Select from dropdown - must match available services',
      '4. Amount: Auto-calculated as Quantity × Rate',
      '5. VAT Amount: Auto-calculated as Amount × (VAT Rate / 100)',
      '6. Net Total: Auto-calculated as Amount + VAT Amount',
      '7. VAT Rate: Auto-populated when Tax Code is selected (like UI behavior)',
      '8. Tax Code: Select from dropdown - required field, auto-populates VAT Rate',
      '9. Each invoice can have multiple line items',
      '10. Line items are grouped by Invoice Number',
      '11. IMPORTANT: When you select a Tax Code, the VAT Rate will be auto-populated',
    ];

    lineItemInstructions.forEach((instruction, index) => {
      const currentRow = lineItemInstructionRow + index + 1;
      lineItemsSheet.getCell(`A${currentRow}`).value = instruction;
      lineItemsSheet.getCell(`A${currentRow}`).font = { italic: true, size: 10 };
    });

    // Convert workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error generating invoice template:', error);
    throw new Error(`Failed to generate Excel template: ${error.message}`);
  }
};

const bulkUploadInvoices = async (req) => {
  try {
    console.log('Start of bulk invoice upload processing');
    const filename = req.files.file.tempFilePath;
    console.log('Reading file:', filename);

    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filename);
    const moment = require('moment');
    const { ObjectId } = require('mongodb');
    const { Companies, Terms, Invoices } = require('../models');

    const uploaderUserId = req.userId;
    const uploaderUserName = req.userName;

    // Load products and services from Excel sheet "ProductsAndServices"
    console.log('Available sheets in workbook:', Object.keys(workbook.Sheets));
    console.log('Sheet names array:', workbook.SheetNames);

    // Check if this is a proper template file
    const requiredSheets = ['Invoice Bulk Upload Template', 'Line Items', 'ProductsAndServices'];

    // Check if all required sheets exist in the workbook
    const missingSheets = requiredSheets.filter((sheet) => {
      const exists = workbook.SheetNames.includes(sheet);
      console.log(`Checking sheet "${sheet}": ${exists ? 'FOUND' : 'MISSING'}`);
      return !exists;
    });

    if (missingSheets.length > 0) {
      console.log('Missing sheets:', missingSheets);
      console.log('Available sheets:', workbook.SheetNames);
      throw new Error(
        `Invalid template file. Missing required sheets: ${missingSheets.join(
          ', '
        )}. Please download a fresh template from the system.`
      );
    }

    const productsSheet = workbook.Sheets['ProductsAndServices'];
    if (!productsSheet) {
      throw new Error('ProductsAndServices sheet not found');
    }
    const productsData = XLSX.utils.sheet_to_json(productsSheet, { header: 1 });
    const productsAndServices = productsData
      .slice(0)
      .filter((row) => row[0] && row[0].toString().trim() !== '')
      .map((row) => row[0].toString().trim());

    // Read main sheet
    const mainSheet = workbook.Sheets['Invoice Bulk Upload Template'];
    if (!mainSheet) {
      throw new Error('Main sheet "Invoice Bulk Upload Template" not found');
    }

    // Read line items sheet
    const lineItemsSheet = workbook.Sheets['Line Items'];
    if (!lineItemsSheet) {
      throw new Error('Line Items sheet not found');
    }

    // Parse main sheet data
    const mainData = XLSX.utils.sheet_to_json(mainSheet, { header: 1 });
    const mainHeaders = mainData[1] || [];
    const mainHeaderMap = {};
    mainHeaders.forEach((h, idx) => {
      if (h) mainHeaderMap[(h + '').replace(/\*/g, '').trim().toLowerCase()] = idx;
    });

    // Parse line items sheet data
    const lineItemsData = XLSX.utils.sheet_to_json(lineItemsSheet, { header: 1 });
    const lineItemHeaders = lineItemsData[0] || [];
    const lineItemHeaderMap = {};
    lineItemHeaders.forEach((h, idx) => {
      if (h) lineItemHeaderMap[(h + '').replace(/\*/g, '').trim().toLowerCase()] = idx;
    });

    // Helper functions
    function getMainCell(row, name) {
      const idx = mainHeaderMap[name.toLowerCase()];
      if (typeof idx !== 'number') return '';
      return (row[idx] || '').toString().trim();
    }

    function getLineItemCell(row, name) {
      const idx = lineItemHeaderMap[name.toLowerCase()];
      if (typeof idx !== 'number') return '';
      return (row[idx] || '').toString().trim();
    }

    function cleanValue(value) {
      if (!value) return '';
      const trimmedValue = value.toString().trim().toLowerCase();
      const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
      return naValues.includes(trimmedValue) ? '' : value.toString().trim();
    }

    function isValidEmail(email) {
      if (!email) return false;
      const trimmedEmail = email.toString().trim().toLowerCase();
      const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
      if (naValues.includes(trimmedEmail)) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    }

    function parseExcelDate(serial) {
      if (!serial || isNaN(serial)) return '';
      const excelEpoch = moment('1900-01-01');
      return moment(excelEpoch)
        .add(serial - 2, 'days')
        .format('YYYY-MM-DD');
    }

    function parseNumber(value) {
      if (!value) return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }

    // Result structure
    let result = {
      message: null,
      error: null,
      duplicates: [],
      errors: [],
      success: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        duplicates: 0,
        skipped: 0,
      },
    };

    // Process main sheet data (skip title and header rows)
    const allRows = mainData.slice(2);
    let skippedRowsCount = 0;

    const invoiceRows = allRows.filter((row) => {
      // Check if row has any non-empty cells
      const hasData = row.some((cell) => cell && cell.toString().trim() !== '');

      // Additional check: ensure row has essential fields (Invoice Number and Customer/Company)
      if (hasData) {
        const invoiceNumber = getMainCell(row, 'Invoice Number');
        const customerName = getMainCell(row, 'Customer/Company');

        // Only include rows that have both essential fields
        const hasEssentialFields =
          invoiceNumber && invoiceNumber.toString().trim() !== '' && customerName && customerName.toString().trim() !== '';

        if (!hasEssentialFields) {
          skippedRowsCount++;
          console.log(`Skipping row with incomplete data: Invoice Number="${invoiceNumber}", Customer="${customerName}"`);
        }

        return hasEssentialFields;
      }

      return false;
    });

    console.log(`Processing ${invoiceRows.length} invoice rows (skipped ${skippedRowsCount} incomplete rows)`);

    // Set skipped rows count in result
    result.summary.skipped = skippedRowsCount;

    // Group line items by invoice number
    const lineItemRows = lineItemsData.slice(1).filter((row) => {
      return row.some((cell) => cell && cell.toString().trim() !== '');
    });

    const lineItemsByInvoice = {};
    lineItemRows.forEach((row) => {
      const invoiceNumber = getLineItemCell(row, 'Invoice Number');
      if (invoiceNumber && invoiceNumber.trim() !== '') {
        if (!lineItemsByInvoice[invoiceNumber]) {
          lineItemsByInvoice[invoiceNumber] = [];
        }
        lineItemsByInvoice[invoiceNumber].push(row);
      }
    });

    // Start single transaction for entire bulk upload process
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('🔄 Starting bulk upload transaction for all invoices');

      // Process each invoice within the single transaction
      for (let i = 0; i < invoiceRows.length; i++) {
        const row = invoiceRows[i];
        const rowNumber = i + 3; // Excel row number (accounting for title and header)

        try {
          // Extract invoice data
          const invoiceNumber = getMainCell(row, 'Invoice Number');
          const customerName = getMainCell(row, 'Customer/Company');
          const email = getMainCell(row, 'Customer Email');
          const billingAddress = getMainCell(row, 'Billing Address');
          const shippingAddress = getMainCell(row, 'Shipping Address');
          const memo = getMainCell(row, 'Memo');
          const invoiceDate = getMainCell(row, 'Invoice Date');
          const dueDate = getMainCell(row, 'Due Date');
          const status = getMainCell(row, 'Status');
          const termsName = getMainCell(row, 'Terms');
          const termsCondition = getMainCell(row, 'Terms & Conditions');
          const currency = getMainCell(row, 'Currency') || 'AED';

          // Validate currency against supported currencies
          const supportedCurrencies = ['AED', 'USD', 'EUR'];
          if (!supportedCurrencies.includes(currency)) {
            result.errors.push({
              row: rowNumber,
              error: `Invalid currency "${currency}". Supported currencies: ${supportedCurrencies.join(', ')}`,
              invoice_number: invoiceNumber,
              customer: customerName,
            });
            result.summary.failed++;
            continue;
          }

          // Handle currency conversion rates
          let conversionRate = 1.0;
          let baseCurrency = 'AED';
          let convertedAmountAED = total;

          if (currency !== 'AED') {
            try {
              // Fetch current exchange rate
              const exchangeRateService = require('./exchangeRate.service');
              const latestRates = await exchangeRateService.getLatestExchangeRates();

              if (latestRates && latestRates.rates && latestRates.rates[currency]) {
                conversionRate = latestRates.rates[currency];
                convertedAmountAED = total * conversionRate;
                console.log(`Currency conversion: ${currency} to AED at rate ${conversionRate}`);
              } else {
                result.errors.push({
                  row: rowNumber,
                  error: `Exchange rate not found for currency "${currency}". Please ensure exchange rates are updated.`,
                  invoice_number: invoiceNumber,
                  customer: customerName,
                });
                result.summary.failed++;
                continue;
              }
            } catch (exchangeError) {
              console.error(`Error fetching exchange rate for ${currency}:`, exchangeError);
              result.errors.push({
                row: rowNumber,
                error: `Failed to fetch exchange rate for currency "${currency}". Please try again or contact support.`,
                invoice_number: invoiceNumber,
                customer: customerName,
              });
              result.summary.failed++;
              continue;
            }
          }
          const visaSponsor = getMainCell(row, 'Visa Sponsor Type');
          const invoiceType = getMainCell(row, 'Invoice Type') || 'general invoice';
          const subTotalFromExcel = getMainCell(row, 'Sub Total');
          const vatTotalFromExcel = getMainCell(row, 'VAT Total');
          const totalFromExcel = getMainCell(row, 'Total');

          // Validation - check if this is actually a valid row with required data
          if (!invoiceNumber || invoiceNumber.toString().trim() === '') {
            // Skip rows without invoice numbers (likely empty or incomplete rows)
            console.log(`Skipping row ${rowNumber}: No invoice number provided`);
            continue;
          }

          // Check for duplicate invoice number in database
          const existingInvoice = await Invoice.findOne({
            invoice_number: invoiceNumber,
            is_deleted: false,
          });
          if (existingInvoice) {
            result.errors.push({
              row: rowNumber,
              error: `Invoice Number "${invoiceNumber}" already exists`,
              invoice_number: invoiceNumber,
              customer: customerName || 'N/A',
            });
            result.summary.duplicates++;
            result.summary.failed++;
            continue;
          }

          if (!customerName || customerName.toString().trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Customer/Company is required',
              invoice_number: invoiceNumber,
              customer: 'N/A',
            });
            result.summary.failed++;
            continue;
          }

          // Email validation - make it optional, fall back to company email
          let finalEmail = email;
          if (!email || !isValidEmail(email)) {
            // If no valid email provided, we'll use company email after lookup
            finalEmail = null;
          }

          if (!invoiceDate) {
            result.errors.push({
              row: rowNumber,
              error: 'Invoice Date is required',
              invoice_number: invoiceNumber,
              customer: customerName,
            });
            result.summary.failed++;
            continue;
          }

          if (!dueDate) {
            result.errors.push({
              row: rowNumber,
              error: 'Due Date is required',
              invoice_number: invoiceNumber,
              customer: customerName,
            });
            result.summary.failed++;
            continue;
          }

          if (!status) {
            result.errors.push({
              row: rowNumber,
              error: 'Status is required',
              invoice_number: invoiceNumber,
              customer: customerName,
            });
            result.summary.failed++;
            continue;
          }

          // Validate status value
          const validStatuses = ['Paid', 'Due', 'Partially Paid'];
          if (!validStatuses.includes(status)) {
            result.errors.push(`Row ${rowNumber}: Status must be "Paid", "Due", or "Partially Paid"`);
            result.summary.failed++;
            continue;
          }

          if (!termsName) {
            result.errors.push(`Row ${rowNumber}: Terms is required`);
            result.summary.failed++;
            continue;
          }

          if (!visaSponsor) {
            result.errors.push(`Row ${rowNumber}: Visa Sponsor Type is required`);
            result.summary.failed++;
            continue;
          }

          // Parse dates
          const parsedInvoiceDate = parseExcelDate(invoiceDate);
          const parsedDueDate = parseExcelDate(dueDate);

          // Convert to Date objects for proper handling
          const invoiceDateObj = parsedInvoiceDate ? new Date(parsedInvoiceDate) : null;
          const dueDateObj = parsedDueDate ? new Date(parsedDueDate) : null;

          if (!parsedInvoiceDate) {
            result.errors.push(`Row ${rowNumber}: Invalid Invoice Date format`);
            result.summary.failed++;
            continue;
          }

          if (!parsedDueDate) {
            result.errors.push(`Row ${rowNumber}: Invalid Due Date format`);
            result.summary.failed++;
            continue;
          }

          // Lookup company
          const company = await Companies.findOne({
            company_name: customerName,
            is_deleted: false,
            status: { $in: ['active', 'new'] },
          });

          if (!company) {
            result.errors.push({
              row: rowNumber,
              error: `Company "${customerName}" not found`,
              invoice_number: invoiceNumber,
              customer: customerName,
            });
            result.summary.failed++;
            continue;
          }

          // Use company email if no valid email was provided
          if (!finalEmail) {
            // Try company email fields in order of preference
            finalEmail = company.email || company.company_email || (company.billing_address && company.billing_address.email);

            if (!finalEmail) {
              result.errors.push({
                row: rowNumber,
                error: `No email provided and company "${customerName}" has no email configured`,
                invoice_number: invoiceNumber,
                customer: customerName,
              });
              result.summary.failed++;
              continue;
            }
          }

          // Lookup terms
          const terms = await Terms.findOne({
            name: termsName,
            is_deleted: false,
          });

          if (!terms) {
            result.errors.push(`Row ${rowNumber}: Terms "${termsName}" not found`);
            result.summary.failed++;
            continue;
          }

          // Get line items for this invoice
          const lineItems = lineItemsByInvoice[invoiceNumber] || [];

          if (lineItems.length === 0) {
            result.errors.push({
              row: rowNumber,
              error: `No line items found for invoice number "${invoiceNumber}"`,
              invoice_number: invoiceNumber,
              customer: customerName,
            });
            result.summary.failed++;
            continue;
          }

          // Process line items
          const processedItems = [];
          // Use values from Excel instead of calculating from line items
          const subTotal = parseNumber(subTotalFromExcel) || 0;
          const vatTotal = parseNumber(vatTotalFromExcel) || 0;

          for (let j = 0; j < lineItems.length; j++) {
            const lineItemRow = lineItems[j];
            const serviceName = getLineItemCell(lineItemRow, 'Service Name');
            const employeeName = getLineItemCell(lineItemRow, 'Employee Name');
            const description = getLineItemCell(lineItemRow, 'Description');
            const quantity = getLineItemCell(lineItemRow, 'Quantity');
            const rate = getLineItemCell(lineItemRow, 'Rate');
            const taxCode = getLineItemCell(lineItemRow, 'Tax Code');
            const serviceType = getLineItemCell(lineItemRow, 'Service Type') || 'Service';

            // Validate line item
            if (!serviceName) {
              result.errors.push(`Row ${rowNumber}, Line Item ${j + 1}: Service Name is required`);
              result.summary.failed++;
              continue;
            }

            // Validate service name exists in products and services
            if (!productsAndServices.includes(serviceName)) {
              result.errors.push(
                `Row ${rowNumber}, Line Item ${j + 1}: Service Name "${serviceName}" not found in available services`
              );
              result.summary.failed++;
              continue;
            }

            if (!quantity || parseNumber(quantity) <= 0) {
              result.errors.push(`Row ${rowNumber}, Line Item ${j + 1}: Valid quantity is required`);
              result.summary.failed++;
              continue;
            }

            if (!rate || parseNumber(rate) <= 0) {
              result.errors.push(`Row ${rowNumber}, Line Item ${j + 1}: Valid rate is required`);
              result.summary.failed++;
              continue;
            }

            if (!taxCode) {
              result.errors.push(`Row ${rowNumber}, Line Item ${j + 1}: Tax Code is required`);
              result.summary.failed++;
              continue;
            }

            const parsedQuantity = parseNumber(quantity);
            const parsedRate = parseNumber(rate);
            const amount = parsedQuantity * parsedRate;

            // Lookup tax code and get VAT rate
            const TaxCodes = require('../models/tax_codes.model');
            const taxCodeData = await TaxCodes.findOne({ code: taxCode, is_deleted: 0 });

            if (!taxCodeData || isNaN(taxCodeData.rate)) {
              result.errors.push(`Row ${rowNumber}, Line Item ${j + 1}: Invalid tax code or rate for "${taxCode}"`);
              result.summary.failed++;
              continue;
            }

            // Auto-populate VAT rate from tax code
            const vatRate = parseNumber(taxCodeData.rate);
            const vatAmount = amount * (vatRate / 100);
            const netTotal = amount + vatAmount;

            processedItems.push({
              id: new ObjectId(),
              service: serviceName,
              service_name: serviceName,
              employee_name: employeeName || '',
              description: description || serviceName,
              quantity: parsedQuantity,
              rate: parsedRate,
              amount: amount,
              discount: 0,
              tax_name: taxCodeData.name,
              tax_code: taxCodeData._id,
              vat_rate: vatRate,
              vat_amount: vatAmount,
              net_total: netTotal,
              type: serviceType,
              date: parsedInvoiceDate,
              isInventory: false,
              city: 'Dubai',
            });
          }

          if (processedItems.length === 0) {
            result.errors.push(`Row ${rowNumber}: No valid line items processed for invoice number "${invoiceNumber}"`);
            result.summary.failed++;
            continue;
          }

          const total = parseNumber(totalFromExcel) || subTotal + vatTotal;
          const balance_due = total; // Adjust if payments or discounts apply

          // Debug log to trace calculations
          console.log(
            `Row ${rowNumber}: subTotal=${subTotal}, vatTotal=${vatTotal}, total=${total}, balance_due=${balance_due}`
          );

          // Create invoice payload
          const invoicePayload = {
            invoice_number: invoiceNumber,
            customer: company._id,
            company: company._id,
            customer_name: company.company_name,
            customer_address: billingAddress || company.company_address,
            email: finalEmail,
            billing_address: billingAddress || company.company_address,
            shipping_address: shippingAddress || billingAddress || company.company_address,
            memo: memo || '',
            terms: terms._id,
            terms_name: terms.name,
            terms_condition: termsCondition || '',
            invoice_date: invoiceDateObj,
            due_date: dueDateObj,
            currency: currency,
            conversion_rate: conversionRate,
            base_currency: baseCurrency,
            converted_amount_aed: convertedAmountAED,
            customer_notes: notes || '',
            visa_sponsor: visaSponsor,
            type: invoiceType,
            items: processedItems,
            sub_total: subTotal,
            vat_total: vatTotal,
            total: total,
            balance_due: balance_due,
            is_recurring: false,
            is_draft: false,
            status: status,
            is_uploaded: true,
            uploaded_at: new Date(),
            uploaded_by: req.userId,
            user_id: uploaderUserId,
          };

          // Create invoice using existing function (within main transaction)
          const createdInvoice = await createInvoice(invoicePayload, uploaderUserId);

          // Create invoice log with descriptive message
          const invoiceLogBody = {
            user_id: uploaderUserId,
            document_id: createdInvoice.invoice._id,
            module: 'invoice',
            createdOrUpdateData: createdInvoice,
            logMessage: `${uploaderUserName} created invoice ${createdInvoice.invoice.invoice_number} via bulk upload for ${
              company.company_name
            }. Invoice amount: ${total.toFixed(2)} ${currency}${currency !== 'AED' ? ` (AED: ${convertedAmountAED.toFixed(2)})` : ''}, Email: ${finalEmail}${!email || email !== finalEmail ? ' (from company)' : ''}, Status: ${status}, Invoice date: ${
              invoiceDateObj ? invoiceDateObj.toISOString().split('T')[0] : parsedInvoiceDate
            }, Due date: ${dueDateObj ? dueDateObj.toISOString().split('T')[0] : parsedDueDate}${
              status === 'Paid' ? ' (with automatic payment)' : ''
            }`,
          };

          await invoiceLogService.createInvoiceLog(invoiceLogBody);

          // Process automatic payment if status is "Paid"
          if (status === 'Paid') {
            console.log(
              `🔄 Processing automatic payment for invoice ${createdInvoice.invoice.invoice_number} (Row ${rowNumber})`
            );

            // Get chart of accounts for payment processing
            const debitResult = await chartOfAccountsService.getChartOfAccountByCode(
              { customer: company._id },
              invoicePayload,
              company._id
            );
            const depositAccount = await chartOfAccountsService.getChartOfAccountByCode(
              { code: 'BN' },
              invoicePayload,
              company._id
            );

            // Generate payment number
            const lastPaymentEntry = await getLastPayment();
            const newPaymentID = lastPaymentEntry
              ? 'PY-' + (parseInt(lastPaymentEntry.payment_number.split('-')[1]) + 1)
              : 'PY-1000';

            // Create payment payload
            const paymentPayload = {
              customer: company._id,
              invoice: createdInvoice.invoice._id,
              amount: total,
              bank_charge: 0,
              payment_date: invoiceDateObj, // Use invoice date as payment date
              payment_mode: 'Bulk Upload - Auto Payment',
              deposit_to: depositAccount._id,
              reference: `AUTO-${invoiceNumber}`,
              notes: `Automatic payment created during bulk upload for invoice ${invoiceNumber}`,
              bank_name: '',
              payment_link: '',
              is_thanks_required: 0,
              isInvoice: true,
              is_multi_invoice: false,
              payment_number: newPaymentID,
              company: debitResult.company,
              user_id: uploaderUserId,
              total_allocated: total,
              shortfall_invoices_count: 0,
              // Currency metadata
              currency: currency,
              conversion_rate: conversionRate,
              base_currency: baseCurrency,
              converted_amount_aed: total * conversionRate,
            };

            // Create payment within main transaction
            const createdPayment = await Payment.create([paymentPayload], { session });
            const paymentDoc = createdPayment[0];
            console.log(`✅ Created automatic payment ${newPaymentID} for invoice ${createdInvoice.invoice.invoice_number}`);

            // Update invoice status to Paid and set partial_amount within main transaction
            await Invoice.findByIdAndUpdate(
              createdInvoice.invoice._id,
              {
                status: 'Paid',
                partial_amount: total,
                paid: true,
              },
              { session }
            );

            // Create payment log with descriptive message
            const paymentLogBody = {
              user_id: uploaderUserId,
              document_id: paymentDoc._id,
              module: 'payment',
              createdOrUpdateData: paymentDoc,
              logMessage: `${uploaderUserName} created automatic payment ${newPaymentID} for invoice ${
                createdInvoice.invoice.invoice_number
              } via bulk upload. Payment amount: ${total.toFixed(2)} ${currency}${currency !== 'AED' ? ` (AED: ${(total * conversionRate).toFixed(2)})` : ''}, Payment date: ${
                invoiceDateObj ? invoiceDateObj.toISOString().split('T')[0] : parsedInvoiceDate
              }, Payment mode: Bulk Upload - Auto Payment`,
            };
            await invoiceLogService.createInvoiceLog(paymentLogBody);

            console.log(`📝 Payment processing completed for invoice ${createdInvoice.invoice.invoice_number}`);
          }

          console.log(`✅ Invoice ${createdInvoice.invoice.invoice_number} processed successfully`);

          result.success.push({
            row: rowNumber,
            invoice_number: createdInvoice.invoice.invoice_number,
            customer: company.company_name,
            total: total,
            currency: currency,
            converted_amount_aed: convertedAmountAED,
            status: status,
            payment_processed: status === 'Paid',
          });

          result.summary.successful++;
        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
          // Add structured error object for better frontend display
          result.errors.push({
            row: rowNumber,
            error: error.message,
            invoice_number: getMainCell(row, 'Invoice Number') || 'N/A',
            customer: getMainCell(row, 'Customer/Company') || 'N/A',
          });
          result.summary.failed++;
          // If any invoice fails, we need to rollback the entire transaction
          throw error;
        }
      }

      // Commit the entire transaction if all invoices processed successfully
      await session.commitTransaction();
      console.log(`✅ Bulk upload transaction committed successfully for ${result.summary.successful} invoices`);

      result.summary.total = invoiceRows.length;

      // Create more informative success message
      if (result.summary.failed === 0 && result.summary.duplicates === 0) {
        if (result.summary.skipped > 0) {
          result.message = `✅ All ${result.summary.successful} invoices uploaded successfully! (${result.summary.skipped} incomplete rows were skipped)`;
        } else {
          result.message = `✅ All ${result.summary.successful} invoices uploaded successfully!`;
        }
      } else {
        result.message = `Bulk upload completed: ${result.summary.successful} successful${
          result.summary.failed > 0 ? `, ${result.summary.failed} failed` : ''
        }${result.summary.duplicates > 0 ? `, ${result.summary.duplicates} duplicates` : ''}${
          result.summary.skipped > 0 ? `, ${result.summary.skipped} skipped` : ''
        }`;
      }

      return result;
    } catch (transactionError) {
      // Rollback entire transaction if any invoice fails
      await session.abortTransaction();
      console.error(`❌ Bulk upload transaction aborted due to error:`, transactionError);
      throw transactionError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error in bulk upload invoices:', error);
    throw new Error(`Bulk upload failed: ${error.message}`);
  }
};

const convertDraftToFinalInvoiceNumber = async (draftInvoiceNumber) => {
  // Remove DRAFT- prefix and generate a new final invoice number
  const finalInvoiceNumber = await generateInvoiceNumber();
  return finalInvoiceNumber;
};

const convertDraftInvoiceToFinal = async (invoiceId) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (!invoice.is_draft) {
      throw new Error('Invoice is not a draft');
    }

    // Generate a new final invoice number
    const finalInvoiceNumber = await generateInvoiceNumber();

    // Update the invoice
    invoice.invoice_number = finalInvoiceNumber;
    invoice.is_draft = false;
    await invoice.save();

    return invoice;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  exportAgeingDetailedReport,
  exportAgeingSummaryReport,
  generateInvoicesForCompany,
  exportGeneralInvoiceReport,
  getPreview,
  getPreviewPDF,
  createInvoice,
  getLastInvoice,
  getLastDebitNote,
  createDebitNote,
  getInvoiceById,
  updateInvoiceById,
  createPayrollInvoice,
  getPayrollInvoice,
  getLastPayment,
  recordPayment,
  checkAndUpdateInvoiceStatus,
  getBulkInvoicePaymentInfo,
  getDebitNoteById,
  updateDebitNoteId,
  getPayrollInvoiceById,
  updatePayrollInvoiceOnId,
  cancelInvoice,
  updateAllDueInvoices,
  getCountsOfInvoices,
  invoicesAllFilterSearch,
  getAllDueInvoices,
  getUsersOfSelectedInvoice,
  listOfInvoiceStatus,
  getAllInvoices,
  getInvoiceOnInvoiceID,
  getAllPayrollInvoice,
  paymentScheduleData,
  paymentScheduleStatus,
  getInvoicesOfUsers,
  currencyList,
  InvoiceStatusCheck,
  triggerExpiredInvoicesNotification,
  uploadLetterArrayBuffer,
  monthlyInvoiceSummary,
  manualMonthlyInvoiceGeneration,
  generateSecurityDepositAndMobilizationInvoice,
  getAmountsDueForCompanies,
  exportEmployeeSalariesReport,
  createmonthlyInvoice: createmonthlyInvoicePostMan,
  createMonthlyInvoice,
  getDraftInvoiceByCustomerId,
  getInvoicesByIds,
  listVoidInvoices,
  markinvoiceAsVoid,
  updateSentStatuses,
  duplicateInvoice,
  exportInvoiceTemplate,
  bulkUploadInvoices,
  generateInvoiceNumber,
  generateDraftInvoiceNumber,
  convertDraftToFinalInvoiceNumber,
  convertDraftInvoiceToFinal,
};
