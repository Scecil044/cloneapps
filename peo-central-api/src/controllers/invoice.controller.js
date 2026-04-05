const httpStatus = require("http-status");
const { invoiceService, companiesService, usersService, termsService, loggerService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users, Invoice, Payment } = require('../models');
const { diff } = require('deep-object-diff');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { journalEntryService } = require("../services");
const { chartOfAccountsService } = require("../services");
const { ChartOfAccounts } = require('../models');
const { invoiceLogService } = require('../services');
const cron = require('node-cron');
const { toLower } = require("lodash");
const { calculateTotalFixed } = require('../helpers/common');
const moment = require('moment');

const exportEmployeeSalariesReport = catchAsync(async (req, res) => {
    try {
        const buffer = await invoiceService.exportEmployeeSalariesReport(req.query);
        // if (!buffer){
        //     throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to generate employee salaries report');
        // }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=PEO Central Employees Salary Report.xlsx');
        res.send(buffer);
    } catch (error) {
        throw new Error("Failed to export employees salary report", error)
    }
})

const getAmountsDueForCompanies = catchAsync(async (req, res) => {
    try {
        const { companyId } = req.body;
        const result = await invoiceService.getAmountsDueForCompanies(companyId, req.query);
        res.status(httpStatus.OK).json(result);
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get the Data', details: error && error.message });
    }
});

const generateInvoiceNumberWorking = async () => {
    const year = new Date().getFullYear().toString().slice(-2);


    const lastInvoice = await Invoice.findOne()
        .sort({ _id: -1 })
        .select('invoice_number')
        .lean();

    const lastSequence = lastInvoice
        ? parseInt(lastInvoice.invoice_number.split('-')[2], 10)
        : 0;

    const newSequence = lastSequence + 1;

    const invoiceNumber = `INV-${year}-${String(newSequence).padStart(5, '0')}`;

    return invoiceNumber;
};
const generateInvoiceNumber = async () => {
    const year = new Date().getFullYear().toString().slice(-2); // e.g., '25'
    const prefix = `INV-${year}-`;

    // Find all invoices with the current year's prefix
    const invoices = await Invoice.find({ invoice_number: { $regex: `^${prefix}` }, invoice_number: { $not: /^VOID-/ } })
        .select('invoice_number')
        .lean();

    // Extract valid numeric sequences
    const sequences = invoices
        .map(inv => {
            const parts = inv.invoice_number && inv.invoice_number.split('-');
            if (parts && parts.length === 3 && !isNaN(parts[2])) {
                return parseInt(parts[2], 10);
            }
            return null;
        })
        .filter(n => n !== null);

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


const addInvoice = async (body, journal_entry, taxItems, userID, userName=null) => {
    const { items, total, email, sub_total, vat_total, invoice_date, due_date } = body
    const dueDate = new Date(due_date);
    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // let invoice_status = today > dueDate ? 'Overdue' : 'Due';
    let invoice_status = 'Unapproved';
    let newInvoiceID;
    // const lastInvoice = await invoiceService.getLastInvoice();
    // if (!lastInvoice) {
    //     newInvoiceID = 'INV-1000';
    // } else {
    //     newInvoiceID = 'INV-' + (parseInt(lastInvoice.invoice_number.split('-')[1]) + 1)
    // }
    const currentDate = new Date();
    const timestamp = currentDate.getTime(); // Get the current timestamp in milliseconds
    const randomDigits = Math.floor(Math.random() * 100000) + 10000; // Generate a random 5-digit number

    // Use draft invoice number if is_draft is true, otherwise use regular invoice number
    if (body.is_draft === true) {
        newInvoiceID = await invoiceService.generateDraftInvoiceNumber();
        console.log(newInvoiceID, "=============>this is the generated DRAFT invoice id=========================>")
    } else {
        newInvoiceID = await generateInvoiceNumber();
        console.log(newInvoiceID, "=============>this is the generated invoice id=========================>")
    }
    // newInvoiceID = "INV-" + (timestamp + randomDigits);
    const payload = {
        ...body,
        invoice_number: newInvoiceID,
        status: invoice_status,
        balance_due: total,
    };
    console.log("before start----")
    const invoice = await invoiceService.createInvoice(payload);
    console.log(invoice, "this is the generated invoice number^^^^^^^^^^^^^^^^^^^^^^^")
    const invoiceLogBody = {
        user_id: userID,
        document_id: invoice.invoice._id,
        module: "invoice",
        createdOrUpdateData: invoice,
        logMessage: `${userName} Created a new General Invoice with invoice number - ${invoice && invoice.invoice && invoice.invoice.invoice_number}`
    }
    const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

    const updatedJournalEntry = journal_entry.map((obj) => ({
        ...obj,
        account: ObjectId(obj.account),
        customer: ObjectId(obj.customer),
    }));
    const journal_payload = {
        line_items: updatedJournalEntry,
        sub_total,
        vat_total,
        total,
        journal_date: invoice_date,
        isInvoiceRelated: true,
        invoice: invoice.invoice._id,
        company: invoice.invoice.company,
        tax_item: taxItems,
        document_id: invoice.invoice.invoice_number,
        document_customer: invoice.invoice.customer_name,
        memo_description: invoice.invoice.customer_notes
    };
    const test = await createInvoiceJournalEntry(journal_payload);
    // const invoice_generated = await uploadInvoiceFileToS3(newInvoiceID, invoice.invoice);
    // return invoice_generated;
    return invoice
};

const createInvoice = catchAsync(async (req, res) => {
    var validJournal = false;
    const { body } = req;
    // const { journal_entry } = body;
    const journal_entry = []
    const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ customer: ObjectId(req.body.customer) }, req.body, req.body.customer);
    body.company = debitResult.company
    journal_entry.push(debitResult)
    const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, req.body, req.body.customer);
    journal_entry.push(creditResult)
    const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, req.body, req.body.customer);
    journal_entry.push(vatResult)
    const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, req.body, req.body.customer);
    journal_entry.push(discountResult)
    // add tax_item
    let taxItems = []
    const mapItems = req.body.items.map((obj) => {
        if (obj.tax_name && obj.tax_code) {
            let dataItems = {
                name: vatResult.name,
                account_name: vatResult.account_name,
                account: vatResult.account,
                isDebit: false,
                isCredit: true,
                isInvoiceRelated: true,
                taxName: obj.tax_name,
                taxCode: obj.tax_code,
                totalAmount: obj.net_total,
                netAmount: obj.amount,
                taxAmount: obj.vat_amount,
                customer: req.body.customer,
                city: vatResult.city
            }
            taxItems.push(dataItems);
        }
    })
    const debitsTotal = journal_entry.filter((item) => item.isDebit).reduce((total, item) => total + parseFloat(item.amount || 0), 0);
    const creditsTotal = journal_entry
        .filter((item) => item.isCredit)
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0);

    // Use a small tolerance for floating point comparison
    const tolerance = 0.01; // 1 cent tolerance
    const difference = Math.abs(debitsTotal - creditsTotal);

    if (difference <= tolerance) {
        validJournal = true;
    } else {
        console.error(`Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`);
        throw new ApiError(httpStatus.FORBIDDEN, `Journal entry not matching: Debits=${debitsTotal.toFixed(2)}, Credits=${creditsTotal.toFixed(2)}, Difference=${difference.toFixed(2)}`);
    }
    if (validJournal) {
        const data = await addInvoice(body, journal_entry, taxItems, req.userId, req.userName);
        //---Mailing service was written here---
        res.status(httpStatus.CREATED).send({
            data,
        });
    }
});

const createInvoiceJournalEntry = async (data) => {
    const result = await generateJournalEntry(data)
    return result
}

const generateJournalEntry = async (data) => {
    try {
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
        console.log("creating js from invoice controller");

        // Set a timeout to ensure the operation doesn't hang indefinitely
        const result = await Promise.race([
            journalEntryService.createJournalEntry(data),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Journal entry creation timed out')), 60000)
            )
        ]);

        console.log("Journal entry created successfully");
        return result;
    } catch (error) {
        console.error('Error in generateJournalEntry:', error);
        // Return a partial success response with error info
        // This ensures the API doesn't time out even if there's an issue
        return {
            error: true,
            message: 'Journal entry creation encountered an issue',
            details: error.message
        };
    }
};

const getInfo = catchAsync(async (req, res) => {
    const result = await getInfoByAccount(req.params.id, req.body)
    res.status(httpStatus.OK).send({ data: { product: { accounts: result } } });
});


const getInfoByAccount = async (customerId, data) => {
    let credit = [];
    let debit = [];
    const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ customer: ObjectId(customerId) }, data, customerId);
    const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, data, customerId);
    const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, data, customerId);
    const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, data, customerId);
    credit.push(creditResult)
    credit.push(vatResult)
    debit.push(debitResult)
    debit.push(discountResult)
    return { credit, debit }
};

const createDebitNote = catchAsync(async (req, res) => {
    try {
        let result;
        let updatedInvoice;
        let newDebitID;
        const lastCreditNote = await invoiceService.getLastDebitNote();
        const debitResult = await ChartOfAccounts.find({ customer: req.body.customer });
        if (!lastCreditNote) {
            newDebitID = 'DN-1000';
        } else {
            newDebitID = 'DN-' + (parseInt(lastCreditNote.debit_note_number.split('-')[1]) + 1);
        }
        const { body } = req;
        result = await invoiceService.createDebitNote({
            ...body,
            company: debitResult[0].company,
            debit_note_number: newDebitID,
            balance_due: body.total,
            status: 'draft'
        });

        const invoiceLogBody = {
            user_id: req.userId,
            document_id: result.debitNote._id,
            module: "debit_note",
            createdOrUpdateData: result,
            logMessage: `${req && req.userName} Created a new Debit Note with ID - ${result.debitNote._id} for the invoice with ID - ${body.invoice}`
        }
        const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

        const invoiceId = ObjectId(body.invoice);
        const invoice = await invoiceService.getInvoiceById(invoiceId);
        if (invoice) {
            let debitData = invoice.debit_notes ? invoice.debit_notes : [];
            var payload = {
                debit_applied: true,
                debit_notes: debitData.concat(result.debitNote._id),
            };
            updatedInvoice = await invoiceService.updateInvoiceById(invoiceId, payload);
        }
        res.status(httpStatus.OK).send({ updatedInvoice })
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create a Debit Note, encountered following error => ${error && error.message}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw error;
    }
});

const createPayrollInvoice = catchAsync(async (req, res) => {
    var validJournal = false;
    const { body } = req;
    const journal_entry = []
    const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ customer: ObjectId(req.body.customer) }, req.body, req.body.customer);
    body.company = debitResult.company
    journal_entry.push(debitResult)
    const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, req.body, req.body.customer);
    journal_entry.push(creditResult)
    const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, req.body, req.body.customer);
    journal_entry.push(vatResult)
    const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, req.body, req.body.customer);
    journal_entry.push(discountResult)
    // add tax_item
    let taxItems = []
    const mapItems = req.body.items.map((obj) => {
        if (obj.tax_name && obj.tax_code) {
            let dataItems = {
                name: vatResult.name,
                account_name: vatResult.account_name,
                account: vatResult.account,
                isDebit: false,
                isCredit: true,
                isInvoiceRelated: true,
                taxName: obj.tax_name,
                taxCode: obj.tax_code,
                totalAmount: obj.net_total,
                netAmount: obj.amount,
                taxAmount: obj.vat_amount,
                customer: req.body.customer,
                city: vatResult.city
            }
            taxItems.push(dataItems);
        }
    })
    const debitsTotal = journal_entry.filter((item) => item.isDebit).reduce((total, item) => total + parseFloat(item.amount || 0), 0);
    const creditsTotal = journal_entry
        .filter((item) => item.isCredit)
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0);

    // Use a small tolerance for floating point comparison
    const tolerance = 0.01; // 1 cent tolerance
    const difference = Math.abs(debitsTotal - creditsTotal);

    if (difference <= tolerance) {
        validJournal = true;
    } else {
        console.error(`Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`);
        throw new ApiError(httpStatus.FORBIDDEN, `Journal entry not matching: Debits=${debitsTotal.toFixed(2)}, Credits=${creditsTotal.toFixed(2)}, Difference=${difference.toFixed(2)}`);
    }
    if (validJournal) {
        const data = await addInvoice(body, journal_entry, taxItems, req.userId);
        //---Mailing service was written here---
        res.status(httpStatus.CREATED).send({
            data,
        });
    }
})

const markinvoiceAsVoid = catchAsync(async (req, res) => {
    try {
        const existingInvoice = await invoiceService.getInvoiceById(req.params.invoiceId);
        if (!existingInvoice) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
        }

        const response = await invoiceService.markinvoiceAsVoid(req.params.invoiceId, req.body, req.userId);

        // If invoice is being voided, also void the related journal entry
        if (req.body.void === true) {
            try {
                const journalData = await journalEntryService.deleteLastJournalData(req.params.invoiceId);
                console.log('Journal entry voided for invoice:', req.params.invoiceId);
            } catch (journalError) {
                console.log('No journal entry found to void for invoice:', req.params.invoiceId);
                // Don't throw error if no journal entry exists, as some invoices might not have journal entries
            }
        }

        // Create invoice log for voiding
        const invoiceLogBody = {
            user_id: req.userId,
            document_id: req.params.invoiceId,
            dataBeforeUpdationOrCreation: existingInvoice,
            updatedFields: { void: req.body.void, void_reason: req.body.void_reason },
            module: "invoice",
            createdOrUpdateData: response,
            logMessage: `${req && req.userName} ${req.body.void ? 'Voided' : 'Unvoided'} Invoice with Invoice number - ${response && response.invoice_number}${req.body.void_reason ? ` (Reason: ${req.body.void_reason})` : ''}`
        }
        const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

        res.status(httpStatus.OK).send(response);
    } catch (error) {
        throw error
    }
})

const updateInvoice = catchAsync(async (req, res) => {
  try {
    console.log("this is the update function-------------------->")
    const existingInvoice = await invoiceService.getInvoiceById(req.params.invoiceId);
    console.log(existingInvoice.is_draft, "the status normalized one is draft")
    if (toLower(existingInvoice.status) !== "partially paid") {
      var validJournal = false;
      const { body } = req;
      const journal_entry = []
      const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ customer: ObjectId(req.body.customer) }, req.body, req.body.customer);
      body.company = debitResult.company
      journal_entry.push(debitResult)
      const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, req.body, req.body.customer);
      journal_entry.push(creditResult)
      const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, req.body, req.body.customer);
      journal_entry.push(vatResult)
      const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, req.body, req.body.customer);
      journal_entry.push(discountResult)

      // add tax_item
      let taxItems = []
      const mapItems = req.body.items.map((obj) => {
        if (obj.tax_name && obj.tax_code) {
          let dataItems = {
            name: vatResult.name,
            account_name: vatResult.account_name,
            account: vatResult.account,
            isDebit: false,
            isCredit: true,
            isInvoiceRelated: true,
            taxName: obj.tax_name,
            taxCode: obj.tax_code,
            totalAmount: obj.net_total,
            netAmount: obj.amount,
            taxAmount: obj.vat_amount,
            customer: req.body.customer,
            city: vatResult.city
          }
          taxItems.push(dataItems);
        }
      })

      const debitsTotal = journal_entry.filter((item) => item.isDebit).reduce((total, item) => total + parseFloat(item.amount || 0), 0);
      const creditsTotal = journal_entry
        .filter((item) => item.isCredit)
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0);
      console.log(debitsTotal, creditsTotal, "debits and credits total");

      // Use a small tolerance for floating point comparison
      const tolerance = 0.01; // 1 cent tolerance
      const difference = Math.abs(debitsTotal - creditsTotal);

      if (difference <= tolerance) {
        validJournal = true;
      } else {
        console.error(`Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`);
        throw new ApiError(httpStatus.FORBIDDEN, `Journal entry not matching: Debits=${debitsTotal.toFixed(2)}, Credits=${creditsTotal.toFixed(2)}, Difference=${difference.toFixed(2)}`);
      }

      if (validJournal) {
        const { body } = req
        const { total, sub_total, vat_total, invoice_date, tax_item } = body
        body.balance_due = total

                // Check if we're converting from draft to final invoice
                const isConvertingFromDraft = existingInvoice.is_draft === true && body.is_draft === false;
                console.log('[updateInvoice] draft conversion check', {
                    existing_is_draft: existingInvoice.is_draft,
                        incoming_is_draft: body.is_draft,
                        existing_invoice_number: existingInvoice.invoice_number
                });

                if (isConvertingFromDraft) {
                    // Heuristic: treat numbers containing 'INV' (and not 'DRAFT') as already-final to avoid regenerating
                    const looksFinalAlready = typeof existingInvoice.invoice_number === 'string' && /INV/i.test(existingInvoice.invoice_number) && !/DRAFT/i.test(existingInvoice.invoice_number);
                    if (looksFinalAlready) {
                        console.log('[updateInvoice] Skipping regeneration; invoice already has a final-looking number:', existingInvoice.invoice_number);
                        // Ensure draft flag flips
                        body.is_draft = false;
                    } else {
                        console.log('[updateInvoice] Converting draft -> final, generating new number from', existingInvoice.invoice_number);
                        const finalInvoiceNumber = await invoiceService.generateInvoiceNumber();
                        body.invoice_number = finalInvoiceNumber;
                        body.is_draft = false; // enforce state flip to persist
                        console.log(`Converting draft invoice ${existingInvoice.invoice_number} to final invoice ${finalInvoiceNumber}`);
                    }
                }

        const result = await invoiceService.updateInvoiceById(req.params.invoiceId, body);

        console.log('invoice update result: ', result);

        const invoiceLogBody = {
          user_id: req.userId,
          document_id: req.params.invoiceId,
          dataBeforeUpdationOrCreation: existingInvoice,
          updatedFields: diff(existingInvoice.toJSON(), result.toJSON()),
          module: "invoice",
          createdOrUpdateData: result,
          logMessage: isConvertingFromDraft
            ? `${req.userName} Converted draft invoice ${existingInvoice && existingInvoice.invoice_number} to final invoice ${result && result.invoice_number}`
            : `${req.userName} Updated an Invoice with Invoice number - ${existingInvoice && existingInvoice.invoice_number}`
        }
        const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

        const journalInfo = await journalEntryService.getJournalByInvoice(req.params.invoiceId);

        console.log('journal info: ', journalInfo);

        // Prepare journal entry data (moved outside conditional blocks)
        const updatedJournalEntry = journal_entry.map((obj) => ({
          ...obj,
          account: ObjectId(obj.account),
          customer: ObjectId(obj.customer),
        }));

        const journal_payload = {
          line_items: updatedJournalEntry,
          sub_total,
          vat_total,
          total,
          journal_date: invoice_date,
          isInvoiceRelated: true,
          tax_item: tax_item
        };

        // Check if journal entry exists
        if (journalInfo && journalInfo._id) {
          // Update existing journal entry
          await journalEntryService.updateJournalEntry(journalInfo._id, journal_payload, req.userId, body);
        } else {
          // Create new journal entry if it doesn't exist (using the same method as addInvoice)
          const createJournalPayload = {
            ...journal_payload,
            invoice: ObjectId(req.params.invoiceId),
            company: result.company,
            tax_item: taxItems,
            document_id: result.invoice_number,
            document_customer: result.customer_name,
            memo_description: result.customer_notes
          };
          await createInvoiceJournalEntry(createJournalPayload);
        }

        res.status(httpStatus.CREATED).json({ data: result });
      }
    } else {
      res.status(httpStatus.CREATED).send("You are not allowed to edit this invoice (Invoice Status = Partially Paid)");
    }
  } catch (error) {
    console.log('invoice update error: ', error)
    throw error;
  }
});

const recordPayment = catchAsync(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { body } = req;

        // Preload accounts (not transactional critical) BEFORE validation
        const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, req.body, req.body.customer);
        const depositAccount = await chartOfAccountsService.getChartOfAccountByCode({ code: 'BN' }, req.body, req.body.customer);

        body.company = debitResult.company;
        body.isDebitNote = false;
        body.is_thanks_required = 0;
        body.deposit_to = depositAccount._id;
        body.isInvoice = true;
        body.sub_total = req.body.amount;
        body.vat_total = 0;
        body.total = req.body.amount;
        body.accounts = [{
            account: debitResult._id,
            amount: req.body.amount,
            customer: req.body.customer,
            isDebit: false,
            isCredit: true
        }];

        const { _id, ...newBody } = body;
        const { isInvoice, deposit_to } = body;
        const { accounts, sub_total, vat_total, total, ...payload } = newBody; // eslint-disable-line

        // Set default currency values for non-invoice payments
        if (!isInvoice) {
            body.currency = 'AED';
            body.conversion_rate = 1.0;
            body.base_currency = 'AED';
            body.converted_amount_aed = Number(newBody.amount) + Number(newBody.bank_charge || 0);
        }

        let invoice = null;
        let invoiceId = null;
        if (isInvoice) {
            invoiceId = ObjectId(body.invoice);
            invoice = await invoiceService.getInvoiceById(invoiceId);
            if (!invoice) throw new Error('Invoice not found');

            // Extract currency information from invoice (with backward compatibility)
            const invoiceCurrency = invoice.currency || 'AED';
            const invoiceConversionRate = invoice.conversion_rate || 1.0;
            const invoiceBaseCurrency = invoice.base_currency || 'AED';

            // Calculate converted amounts to AED for reporting
            const paymentAmount = Number(newBody.amount);
            const bankCharge = Number(newBody.bank_charge || 0);
            const convertedAmountAED = paymentAmount * invoiceConversionRate;
            const convertedBankChargeAED = bankCharge * invoiceConversionRate;
            const totalConvertedAED = convertedAmountAED + convertedBankChargeAED;

            // Add currency information to payment payload (ensure all fields have values)
            body.currency = invoiceCurrency;
            body.conversion_rate = invoiceConversionRate;
            body.base_currency = invoiceBaseCurrency;
            body.converted_amount_aed = totalConvertedAED; // Total converted amount including bank charge

            console.log('[recordPayment] Currency info:', {
                invoiceCurrency,
                invoiceConversionRate,
                paymentAmount,
                bankCharge,
                totalConvertedAED
            });

            // Validation FIRST - no persistence before this point
            const alreadySettled = Number(invoice.partial_amount || 0);
            const totalDueNum = Number(invoice.balance_due);

            const toCents = (val) => Math.round(Number(val) * 100);
            const paymentCents = toCents(paymentAmount);
            const bankChargeCents = toCents(bankCharge);
            const alreadyCents = toCents(alreadySettled);
            const dueCents = toCents(totalDueNum);

            if (paymentAmount <= 0) {
                throw new Error('Invalid payment amount.');
            }

            const newSettledCents = alreadyCents + paymentCents + bankChargeCents;
            console.log('[recordPayment] cents debug', { paymentCents, bankChargeCents, alreadyCents, dueCents, newSettledCents });
            if (newSettledCents > dueCents) {
                throw new Error('Payment exceeds the total balance due.');
            }

            // Prepare invoice update (defer saving until after payment doc created so logs consistent)
            const isFullyPaid = newSettledCents >= dueCents;
            body._invoiceUpdatePayload = {
                partial_amount: newSettledCents / 100,
                paid: isFullyPaid,
                status: isFullyPaid ? 'Paid' : 'Partially Paid'
            };
        }

        // Generate payment number
        let newPaymentID;
        const lastPaymentEntry = await invoiceService.getLastPayment();
        newPaymentID = lastPaymentEntry ? 'PY-' + (parseInt(lastPaymentEntry.payment_number.split('-')[1]) + 1) : 'PY-1000';

        // Create payment (not using session originally; ensure atomic by attaching session)
        const payment = await Payment.create([{ ...payload, payment_number: newPaymentID }], { session });
        const paymentDoc = Array.isArray(payment) ? payment[0] : payment;

        // Apply invoice update now (inside transaction) if needed
        if (invoice && body._invoiceUpdatePayload) {
            const before = invoice.toObject();
            Object.assign(invoice, body._invoiceUpdatePayload);
            await invoice.save({ session });
            const invoiceLogBody = {
                user_id: req.userId,
                document_id: invoiceId,
                dataBeforeUpdationOrCreation: before,
                updatedFields: diff(before, invoice.toObject()),
                module: 'invoice',
                createdOrUpdateData: invoice,
                logMessage: `${req.userName} Triggered action to update invoice status: Details:invoice number - ${invoice.invoice_number}  Status Updated to - ${invoice.status}${Number(newBody.bank_charge||0) > 0 ? ` (Bank Charge: ${newBody.bank_charge})` : ''}`
            };
            await invoiceLogService.createInvoiceLog(invoiceLogBody);
        }

        // Journal entry
        await createPaymentJournalEntry(body, deposit_to, paymentDoc._id, req.userId, invoice, session);

        // Payment log
        await invoiceLogService.createInvoiceLog({
            user_id: req.userId,
            document_id: invoiceId || (paymentDoc.invoice ? ObjectId(paymentDoc.invoice) : undefined),
            module: 'payment',
            createdOrUpdateData: paymentDoc,
            logMessage: `${req.userName} Recorded Payment for the General Invoice with invoice number - ${invoice && invoice.invoice_number}${Number(newBody.bank_charge||0) > 0 ? ` (Bank Charge: ${newBody.bank_charge})` : ''}`
        });

        await session.commitTransaction();
        res.status(httpStatus.CREATED).send({ data: { payment: paymentDoc } });
    } catch (error) {
        await session.abortTransaction();
        console.error('Payment recording failed, transaction rolled back:', error);
        throw error;
    } finally {
        session.endSession();
    }
});

const updatePayment = catchAsync(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { paymentId } = req.params;
        const { body } = req;

        // Get the existing payment
        const existingPayment = await Payment.findById(paymentId).session(session);
        if (!existingPayment) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
        }

        // Check if payment is already reversed
        if (existingPayment.is_reversed) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot edit a reversed payment');
        }

        let invoice = null;
        let invoiceId = null;

        // Get the invoice associated with this payment
        // First check if payment has a direct invoice field
        invoiceId = existingPayment.invoice;

        // If no direct invoice field, check invoice_allocations for bulk payments
        if (!invoiceId) {
            if (existingPayment.invoice_allocations && Array.isArray(existingPayment.invoice_allocations) && existingPayment.invoice_allocations.length > 0) {
                // Find the allocation that matches the invoice being updated
                const matchingAllocation = existingPayment.invoice_allocations.find(allocation =>
                    allocation.invoice_id && allocation.invoice_id.toString() === body.invoice
                );

                if (matchingAllocation) {
                    invoiceId = matchingAllocation.invoice_id;
                }
            }
        }

        // If still no invoiceId found, use the invoice from the request body as fallback
        if (!invoiceId && body.invoice) {
            invoiceId = body.invoice;
        }

        invoice = await invoiceService.getInvoiceById(invoiceId);
        if (!invoice) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Associated invoice not found');
        }

        // Store original payment data for logging
        const originalPayment = existingPayment.toObject();

        // Calculate the difference in payment amount
        const oldAmount = Number(existingPayment.amount);
        const newAmount = Number(body.amount);
        const amountDifference = newAmount - oldAmount;

        // Validate new payment amount
        if (newAmount <= 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment amount');
        }

        // Check if the new amount exceeds the invoice balance
        const currentSettled = Number(invoice.partial_amount || 0);
        const totalDue = Number(invoice.balance_due);
        const newSettledAmount = currentSettled + amountDifference;

        if (newSettledAmount > totalDue) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Updated payment amount exceeds the total balance due');
        }

        // Update payment fields
        const updateData = {
            amount: newAmount,
            bank_charge: Number(body.bank_charge || 0),
            bank_name: body.bank_name || '',
            payment_link: body.payment_link || '',
            payment_date: body.payment_date,
            payment_mode: body.payment_mode,
            notes: body.notes || '',
            reference: body.reference || '',
            // Preserve currency fields from original payment (with fallbacks)
            currency: body.currency || existingPayment.currency || 'AED',
            conversion_rate: body.conversion_rate || existingPayment.conversion_rate || 1.0,
            base_currency: body.base_currency || existingPayment.base_currency || 'AED',
            converted_amount_aed: body.converted_amount_aed || (newAmount * (existingPayment.conversion_rate || 1.0))
        };

        // Update the payment
        Object.assign(existingPayment, updateData);
        await existingPayment.save({ session });

        // Update invoice status based on new payment amount
        const isFullyPaid = newSettledAmount >= totalDue;
        const invoiceUpdateData = {
            partial_amount: newSettledAmount,
            paid: isFullyPaid,
            status: isFullyPaid ? 'Paid' : 'Partially Paid'
        };

        const beforeInvoice = invoice.toObject();
        Object.assign(invoice, invoiceUpdateData);
        await invoice.save({ session });

        // Create journal entry for the amount difference
        const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, req.body, req.body.customer);
        const depositAccount = await chartOfAccountsService.getChartOfAccountByCode({ code: 'BN' }, req.body, req.body.customer);

        if (amountDifference !== 0) {
            const journalEntryData = {
                amount: Math.abs(amountDifference),
                customer: req.body.customer,
                invoice: invoiceId,
                payment: existingPayment._id,
                isDebit: amountDifference > 0,
                isCredit: amountDifference < 0
            };

            await createPaymentJournalEntry(journalEntryData, depositAccount._id, existingPayment._id, req.userId, invoice, session);
        }

        // Calculate comprehensive amount changes
        const oldBankCharge = Number(originalPayment.bank_charge || 0);
        const newBankCharge = Number(existingPayment.bank_charge || 0);
        const bankChargeDifference = newBankCharge - oldBankCharge;
        const totalAmountDifference = amountDifference + bankChargeDifference;

        // Build comprehensive log message for payment update
        let paymentLogMessage = `${req && req.userName} updated payment ${existingPayment.payment_number}`;
        paymentLogMessage += `\n• Payment Amount: ${oldAmount} → ${newAmount} (${amountDifference >= 0 ? '+' : ''}${amountDifference})`;
        if (oldBankCharge !== newBankCharge) {
            paymentLogMessage += `\n• Bank Charges: ${oldBankCharge} → ${newBankCharge} (${bankChargeDifference >= 0 ? '+' : ''}${bankChargeDifference})`;
        }
        paymentLogMessage += `\n• Payment Method: ${originalPayment.payment_mode} → ${existingPayment.payment_mode}`;
        if (originalPayment.bank_name !== existingPayment.bank_name) {
            paymentLogMessage += `\n• Bank Name: ${originalPayment.bank_name || 'N/A'} → ${existingPayment.bank_name || 'N/A'}`;
        }
        if (originalPayment.reference !== existingPayment.reference) {
            paymentLogMessage += `\n• Reference: ${originalPayment.reference || 'N/A'} → ${existingPayment.reference || 'N/A'}`;
        }

        // Log the payment update
        await invoiceLogService.createInvoiceLog({
            user_id: req.userId,
            document_id: existingPayment._id,
            dataBeforeUpdationOrCreation: originalPayment,
            updatedFields: diff(originalPayment, existingPayment.toObject()),
            module: 'payment',
            createdOrUpdateData: existingPayment,
            logMessage: paymentLogMessage
        });

        // Build comprehensive log message for invoice update
        const oldPartialAmount = Number(beforeInvoice.partial_amount || 0);
        const newPartialAmount = Number(invoice.partial_amount || 0);
        const oldStatus = beforeInvoice.status;
        const newStatus = invoice.status;

        let invoiceLogMessage = `${req && req.userName} updated invoice ${invoice.invoice_number} due to payment edit`;
        invoiceLogMessage += `\n• Partial Amount: ${oldPartialAmount} → ${newPartialAmount} (${totalAmountDifference >= 0 ? '+' : ''}${totalAmountDifference})`;
        invoiceLogMessage += `\n• Status: ${oldStatus} → ${newStatus}`;
        invoiceLogMessage += `\n• Total Due: ${Number(invoice.balance_due)}`;
        invoiceLogMessage += `\n• Remaining Balance: ${Number(invoice.balance_due) - newPartialAmount}`;

        // Log the invoice update
        await invoiceLogService.createInvoiceLog({
            user_id: req.userId,
            document_id: invoiceId,
            dataBeforeUpdationOrCreation: beforeInvoice,
            updatedFields: diff(beforeInvoice, invoice.toObject()),
            module: 'invoice',
            createdOrUpdateData: invoice,
            logMessage: invoiceLogMessage
        });

        await session.commitTransaction();
        res.status(httpStatus.OK).send({
            data: existingPayment,
            message: 'Payment updated successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Payment update failed, transaction rolled back:', error);
        throw error;
    } finally {
        session.endSession();
    }
});

/**
 * =====================================================================================================
 * Implementation to effect multiple payment for invoices
 * =====================================================================================================
 */
const recordMultipleInvoicePayment = catchAsync(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { body } = req;
        if (!body.invoices || !Array.isArray(body.invoices) || body.invoices.length === 0) {
            throw new Error('At least one invoice must be specified for payment.');
        }
        if (!body.total_payment_amount || body.total_payment_amount <= 0) {
            throw new Error('Invalid total payment amount.');
        }
        console.log('multi payment body:', body);

        // Accounts
        const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, req.body, req.body.customer);
        const depositAccount = await chartOfAccountsService.getChartOfAccountByCode({ code: 'BN' }, req.body, req.body.customer);
        body.company = debitResult.company;
        body.deposit_to = depositAccount._id;

        // Payment number
        const lastPaymentEntry = await invoiceService.getLastPayment();
        const newPaymentID = lastPaymentEntry ? 'PY-' + (parseInt(lastPaymentEntry.payment_number.split('-')[1]) + 1) : 'PY-1000';

        // Fetch invoices
        const invoiceIds = body.invoices.map(inv => ObjectId(inv.id || inv._id));
        const invoices = await invoiceService.getInvoicesByIds(invoiceIds);
        if (invoices.length !== body.invoices.length) throw new Error('One or more invoices not found.');
        const invoiceMap = new Map(invoices.map(inv => [inv._id.toString(), inv]));

        // Helpers
        const toCents = (v) => Math.round(Number(v) * 100);

        let totalAllocatedCents = 0;
        const paymentAllocations = [];
        const invoiceUpdates = [];
        const shortfallInvoices = [];

        for (const item of body.invoices) {
            const id = item.id || item._id;
            const inv = invoiceMap.get(id);
            if (!inv) throw new Error(`Invoice ${id} not found.`);

            const paymentAmount = Number(item.amount);
            const bankCharge = Number(item.bank_charge || 0);
            if (paymentAmount <= 0) throw new Error(`Invalid payment amount for invoice ${inv.invoice_number}.`);

            const currentSettled = Number(inv.partial_amount || 0);
            const balanceDue = Number(inv.balance_due);

            // Cents math
            const currentSettledCents = toCents(currentSettled);
            const paymentCents = toCents(paymentAmount);
            const bankChargeCents = toCents(bankCharge);
            const balanceDueCents = toCents(balanceDue);
            const newSettledCents = currentSettledCents + paymentCents + bankChargeCents;
            console.log('[multiPayment] cents debug', { invoice: inv.invoice_number, currentSettledCents, paymentCents, bankChargeCents, newSettledCents, balanceDueCents });
            if (newSettledCents > balanceDueCents) throw new Error(`Payment amount exceeds balance due for invoice ${inv.invoice_number}.`);

            const allowShortfall = item.allow_shortfall || false;
            const isShortfall = allowShortfall && newSettledCents < balanceDueCents && item.mark_as_shortfall;
            const status = newSettledCents >= balanceDueCents ? 'Paid' : (isShortfall ? 'Shortfall' : 'Partially Paid');

            paymentAllocations.push({
                invoice_id: ObjectId(id),
                invoice_number: inv.invoice_number,
                amount: paymentAmount,
                bank_charge: bankCharge,
                total_payment: paymentAmount + bankCharge,
                status,
                is_shortfall: isShortfall,
                shortfall_amount: isShortfall ? (balanceDueCents - newSettledCents) / 100 : 0,
                balance_due_before: balanceDue,
                partial_amount_before: currentSettled,
                partial_amount_after: newSettledCents / 100
            });

            const updateData = {
                partial_amount: newSettledCents / 100,
                paid: newSettledCents >= balanceDueCents || isShortfall,
                status,
                ...(isShortfall && {
                    shortfall_amount: (balanceDueCents - newSettledCents) / 100,
                    shortfall_date: new Date(),
                    shortfall_reason: item.shortfall_reason || 'Client partial payment accepted',
                    shortfall_approved_by: req.userId
                })
            };
            invoiceUpdates.push({ invoice: inv, updateData });
            if (isShortfall) shortfallInvoices.push({ invoice_number: inv.invoice_number, shortfall_amount: (balanceDueCents - newSettledCents) / 100 });
            totalAllocatedCents += paymentCents + bankChargeCents;
        }

        // Validate total allocation
        if (Math.abs(totalAllocatedCents - toCents(body.total_payment_amount)) > 1) {
            throw new Error('Total payment amount does not match sum of invoice allocations.');
        }

        // Determine currency from request or first invoice (backward compatibility)
        const effectiveCurrency = body.currency || (invoices[0] && invoices[0].currency) || 'AED'
        const effectiveConversionRate = body.conversion_rate || (invoices[0] && invoices[0].conversion_rate) || 1.0
        const effectiveBaseCurrency = body.base_currency || (invoices[0] && invoices[0].base_currency) || 'AED'

        // Calculate converted amount to AED for reporting
        const totalAmountWithCharges = Number(body.total_payment_amount) + Number(body.bank_charge || 0)
        const convertedAmountAED = body.converted_amount_aed || (totalAmountWithCharges * effectiveConversionRate)

        // Build payment doc
        const paymentBody = {
            customer: body.customer,
            amount: body.total_payment_amount,
            bank_charge: body.bank_charge || 0,
            payment_date: body.payment_date || new Date(),
            payment_mode: body.payment_mode || body.payment_method,
            deposit_to: depositAccount._id,
            reference: body.reference || body.reference_number,
            notes: body.notes,
            bank_name: (body && body.bank_name) || '',
            payment_link: (body && body.payment_link) || '',
            is_thanks_required: body.is_thanks_required || 0,
            isInvoice: true,
            is_multi_invoice: true,
            payment_number: newPaymentID,
            invoice_allocations: paymentAllocations,
            company: debitResult.company,
            user_id: req.userId,
            total_allocated: totalAllocatedCents / 100,
            shortfall_invoices_count: shortfallInvoices.length,
            // Currency fields for multi-currency support
            currency: effectiveCurrency,
            conversion_rate: effectiveConversionRate,
            base_currency: effectiveBaseCurrency,
            converted_amount_aed: convertedAmountAED
        };
        if (body.invoices.length === 1) paymentBody.invoice = ObjectId(body.invoices[0].id || body.invoices[0]._id);

        // Create payment inside transaction
        const createdPaymentArr = await Payment.create([paymentBody], { session });
        const paymentDoc = createdPaymentArr[0];

        // Update invoices + logs
        for (const upd of invoiceUpdates) {
            const before = upd.invoice.toObject();
            Object.assign(upd.invoice, upd.updateData);
            await upd.invoice.save({ session });
            await invoiceLogService.createInvoiceLog({
                user_id: req.userId,
                document_id: upd.invoice._id,
                dataBeforeUpdationOrCreation: before,
                updatedFields: diff(before, upd.invoice.toObject()),
                module: 'invoice',
                createdOrUpdateData: upd.invoice,
                logMessage: `${req && req.userName} recorded payment for invoice ${before.invoice_number}. Status: ${upd.updateData.status}${upd.updateData.status === 'Shortfall' ? ` (Shortfall: ${upd.updateData.shortfall_amount})` : ''}`
            });
        }

        // Journal entry
        await createMultiInvoicePaymentJournalEntry(paymentBody, depositAccount._id, paymentDoc._id, req.userId, paymentAllocations);

        // Payment log
        await invoiceLogService.createInvoiceLog({
            user_id: req.userId,
            document_id: paymentDoc._id,
            module: 'payment',
            createdOrUpdateData: paymentDoc,
            logMessage: `${req && req.userName} recorded multi-invoice payment ${newPaymentID} for ${paymentAllocations.length} invoices. Total: ${paymentBody.amount}`
        });

        await session.commitTransaction();
        res.status(httpStatus.CREATED).send({
            data: {
                payment: { payment: paymentDoc },
                allocations: paymentAllocations,
                shortfall_invoices: shortfallInvoices,
                total_allocated: totalAllocatedCents / 100
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Multi-invoice payment failed, transaction rolled back:', error);
        throw error;
    } finally {
        session.endSession();
    }
});

// Helper function for multi-invoice journal entry
const createMultiInvoicePaymentJournalEntry = async (paymentBody, depositTo, paymentId, userId, allocations) => {
    // Create detailed journal entry that shows allocation to multiple invoices
    const journalEntries = allocations.map(allocation => ({
        invoice_id: allocation.invoice_id,
        invoice_number: allocation.invoice_number,
        amount: allocation.amount,
        bank_charge: allocation.bank_charge,
        total_payment: allocation.total_payment,
        status: allocation.status,
        is_shortfall: allocation.is_shortfall,
        shortfall_amount: allocation.shortfall_amount
    }));

    return await createPaymentJournalEntry({
        ...paymentBody,
        multi_invoice_allocations: journalEntries
    }, depositTo, paymentId, userId, null);
};
/**
 * =====================================================================================================
 * End of Implementation to effect multiple payment for invoices
 * =====================================================================================================
 */


const createPaymentJournalEntry = async (body, depositAccount, paymentId, user, invoice) => {
    const { accounts, customer, amount, payment_date, sub_total, vat_total, total, company, reference, multi_invoice_allocations } = body;
    const depositAccountInfo = await chartOfAccountsService.getAccountById(depositAccount);

    // Convert customer and _id fields to ObjectId in all objects of accounts array
    const updatedAccounts = accounts ? accounts.map((account) => {
        return {
            ...account,
            customer: ObjectId(account.customer),
            account: ObjectId(account.account),
            type: "Payment"
        };
    }) : [];

    let line_items = updatedAccounts;
    if (depositAccountInfo) {
        const item = {
            account: depositAccountInfo._id,
            customer: ObjectId(customer),
            isDebit: true,
            isCredit: false,
            amount: amount,
            type: "Payment",
            account_name: depositAccountInfo.name
        };
        line_items.push(item);
    }

    // Prepare document_id and document_customer based on whether this is a multi-invoice payment
    let document_id = 'Multiple Invoices';
    let document_customer = 'Multiple';

    if (invoice) {
        document_id = invoice.invoice_number;
        document_customer = invoice.customer_name;
    } else if (multi_invoice_allocations && multi_invoice_allocations.length === 1) {
        // If there's only one invoice in the allocations, use its details
        document_id = multi_invoice_allocations[0].invoice_number;
    }

    const journal_payload = {
        line_items: line_items,
        sub_total,
        vat_total,
        total,
        journal_date: payment_date,
        isPaymentRelated: true,
        payment: paymentId,
        company: company,
        document_id: document_id,
        document_customer: document_customer,
        memo_description: reference,
        multi_invoice_allocations: multi_invoice_allocations
    };
    const result = await createInvoiceJournalEntry(journal_payload, user);
    return [];
};

const updateDebitNoteId = catchAsync(async (req, res) => {
    try {
        req.body.balance_due = req.body.total;
        const existingData = await invoiceService.getDebitNoteById(req.params.debitNoteId);
        const result = await invoiceService.updateDebitNoteId(req.params.debitNoteId, req.body)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Debit Note');
        }
        const logString = (logger.info(`${req.userName} Updated an Debit Note with ID ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);

        const invoiceLogBody = {
            user_id: req.userId,
            document_id: req.params.debitNoteId,
            dataBeforeUpdationOrCreation: existingData,
            updatedFields: diff(existingData.toJSON(), result.toJSON()),
            module: "debit_note",
            createdOrUpdateData: result,
            logMessage: `${req && req.userName} Updated Debit Note with ID - ${req.params.debitNoteId}`
        }
        const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update an Debit Note with ID ${req.params.debitNoteId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Debit Note. Please Check the Input', details: error });
    }
});

const updatePayrollInvoiceOnId = catchAsync(async (req, res) => {
    try {
        req.body.balance_due = req.body.total;
        const existingData = await invoiceService.getPayrollInvoiceById(req.params.payrollInvoiceId);
        const result = await invoiceService.updatePayrollInvoiceOnId(req.params.payrollInvoiceId, req.body)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Payroll Invoice');
        }
        const logString = (logger.info(`${req.userName} Updated an Payroll Invoice with ID ${req.params.payrollInvoiceId}`)).transports[0].logString;
        await loggerService.createLogger('payroll_invoice', req.userId, logString);

        const invoiceLogBody = {
            user_id: req.userId,
            document_id: req.params.payrollInvoiceId,
            dataBeforeUpdationOrCreation: existingData,
            updatedFields: diff(existingData.toJSON(), result.toJSON()),
            module: "payroll_invoice",
            createdOrUpdateData: result,
            logMessage: `${req && req.userName} Updated Payroll Invoice with ID - ${req.params.payrollInvoiceId}`
        }
        const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update a Payroll Invoice with ID ${req.params.payrollInvoiceId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Payroll Invoice. Please Check the Input', details: error });
    }
});

const revertGeneralInvoice = catchAsync(async (req, res) => {
    const { body } = req
    const invoice = await invoiceService.getInvoiceById(req.params.generalInvoiceId, body);
    var today = new Date();
    let invoice_status = today < invoice.due_date ? 'Overdue' : 'Due';
    const result = await invoiceService.updateInvoiceById(req.params.generalInvoiceId, { status: invoice_status, balance_due: invoice.total });
    const msg = result.isVoid ? "user reverted void invoice" : "user reverted writeoff invoice'"

    const invoiceLogBody = {
        user_id: req.userId,
        document_id: req.params.generalInvoiceId,
        dataBeforeUpdationOrCreation: invoice,
        updatedFields: diff(invoice.toJSON(), result.toJSON()),
        module: "invoice",
        createdOrUpdateData: result,
        logMessage: `${req && req.userName} Reverted General Invoice with ID - ${result && result.invoice_number}`
    }
    const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);

    let journalData = await journalEntryService.deleteLastJournalData(req.params.generalInvoiceId)
    res.status(httpStatus.CREATED).send({ data: journalData });
})

const cancelGeneralInvoice = catchAsync(async (req, res) => {
    const existingData = await invoiceService.getInvoiceById(req.params.generalInvoiceId);
    const invoice = await invoiceService.cancelInvoice(req.params.generalInvoiceId);
    const invoiceLogBody = {
        user_id: req.userId,
        document_id: req.params.generalInvoiceId,
        dataBeforeUpdationOrCreation: existingData,
        updatedFields: diff(existingData.toJSON(), invoice.toJSON()),
        module: "invoice",
        createdOrUpdateData: invoice,
        logMessage: `${req && req.userName} Cancelled General Invoice with Invoice number - ${invoice && invoice.invoice_number}`
    }
    const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);
    res.status(httpStatus.CREATED).send({
        data: {
            invoice,
        },
    });
});

const getChartOfAccountByCustID = catchAsync(async (req, res) => {
    try {
        const result = await chartOfAccountsService.getChartOfAccountByCustID(req.body)
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch Details');
        }
        const logString = (logger.info(`${req.userName} Accessed All Details`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Get Data, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch the Data', details: error });
    }
});


const getCountsOfInvoices = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.getCountsOfInvoices(req.body)
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch the Counts');
        }
        const logString = (logger.info(`${req.userName} Accessed the Counts of invoices`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Counts of invoices, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        // res.status(400).json({ message: 'Failed to Fetch Counts of invoices', details: error && error.message });
        throw error;
    }
});


const invoicesAllFilterSearch = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.invoicesAllFilterSearch(req.query, req.body)
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch the Data');
        }
        const logString = (logger.info(`${req.userName} Fetched the List of invoices`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the list of invoices, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        // res.status(400).json({ message: 'Failed to get the list of invoices', details: error && error.message });
        throw new Error(error && error.message);
    }
});
const listVoidInvoices = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.listVoidInvoices(req.query, req.body)
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot list void invoices');
        }
        const logString = (logger.info(`${req.userName} Fetched the List of void invoices`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the list of  void invoices, encountered following error => ${error && error.message}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        // res.status(400).json({ message: 'Failed to get the list of invoices', details: error && error.message });
        throw new Error(error && error.message);
    }
});

const listOfInvoiceStatus = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.listOfInvoiceStatus(req.query, req.body)
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch the List of Status');
        }
        const logString = (logger.info(`${req.userName} Fetched the List of Invoice Status`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the List of Status, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the List of Status', details: error });
    }
});

const currencyList = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.currencyList()
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch the Currency List');
        }
        const logString = (logger.info(`${req.userName} Fetched the Currency List`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Currency List, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Currency List', details: error });
    }
});

const getAllInvoices = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.getAllInvoices();
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot get the list of Invoices');
        }
        const logString = (logger.info(`${req.userName} Fetched the list of Invoices`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the List of Invoices, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the List of Invoices', details: error });
    }
});

const getInvoiceOnInvoiceID = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.getInvoiceOnInvoiceID(req.params.invoiceId);
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot get the invocie for the ID');
        }
        const logString = (logger.info(`${req.userName} Fetched the invocie with ID - ${req.params.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Invoice with ID - ${req.params.invoiceId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Invoice for the given ID', details: error });
    }
});

const getUsersOfSelectedInvoice = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.getUsersOfSelectedInvoice(req.params.invoiceId, req.body);
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error });
    }
});

const getAllPayrollInvoice = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.getAllPayrollInvoice(req.query.invoiceType);
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error });
    }
});

const paymentScheduleData = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.paymentScheduleData();
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error });
    }
});

const paymentScheduleStatus = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await invoiceService.paymentScheduleStatus(req.body, page, limit);
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error });
    }
});

const getInvoicesOfUsers = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await invoiceService.getInvoicesOfUsers(req.params.userId, page, limit);
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error });
    }
})

const getOrCreatePreviewInvoice = catchAsync(async (req, res) => {
    try {
        var validJournal = false;
        const body = req.body;

        // check if a draft invoice exists
        const invoice = await invoiceService.getDraftInvoiceByCustomerId(body.customer);
        if (invoice) {
            return res.status(httpStatus.CREATED).json(invoice);
        }

        // const { journal_entry } = body;
        const journal_entry = [];
        const debitResult = await chartOfAccountsService.getChartOfAccountByCode(
            { customer: ObjectId(body.customer) },
            body,
            body.customer,
        );
        body.company = (debitResult && debitResult.company) || '';
        journal_entry.push(debitResult);
        const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, req.body, req.body.customer);
        journal_entry.push(creditResult);
        const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, req.body, req.body.customer);
        journal_entry.push(vatResult);
        const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, req.body, req.body.customer);
        journal_entry.push(discountResult);
        // add tax_item
        let taxItems = [];
        const mapItems = body.items.map((obj) => {
            if (obj.tax_name && obj.tax_code) {
                let dataItems = {
                    name: vatResult.name,
                    account_name: vatResult.account_name,
                    account: vatResult.account,
                    isDebit: false,
                    isCredit: true,
                    isInvoiceRelated: true,
                    taxName: obj.tax_name,
                    taxCode: obj.tax_code,
                    totalAmount: obj.net_total,
                    netAmount: obj.amount,
                    taxAmount: obj.vat_amount,
                    customer: req.body.customer,
                    city: vatResult.city,
                };
                taxItems.push(dataItems);
            }
        });
        const debitsTotal = journal_entry
            .filter((item) => item.isDebit)
            .reduce((total, item) => total + parseFloat(item.amount || 0), 0);
        const creditsTotal = journal_entry
            .filter((item) => item.isCredit)
            .reduce((total, item) => total + parseFloat(item.amount || 0), 0);

        // Use a small tolerance for floating point comparison
        const tolerance = 0.01; // 1 cent tolerance
        const difference = Math.abs(debitsTotal - creditsTotal);

        if (difference <= tolerance) {
            validJournal = true;
        } else {
            console.error(`Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`);
            throw new ApiError(httpStatus.FORBIDDEN, `Journal entry not matching: Debits=${debitsTotal.toFixed(2)}, Credits=${creditsTotal.toFixed(2)}, Difference=${difference.toFixed(2)}`);
        }
        if (validJournal) {
            const data = await addInvoice(body, journal_entry, taxItems, req.user_id);
            //---Mailing service was written here---
            return res.status(httpStatus.CREATED).json(data.invoice);
        }
        return res.json({ message: 'Invalid journal entry detected' })
    } catch (error) {
        // res.status(400).json({ message: 'Failed to get the Data', details: error });
        throw error;
    }
});

const getPreview = catchAsync(async (req, res) => {
    // try {
    const result = await invoiceService.getPreview(req.body.invoice_id, req.body.userId);
    res.status(httpStatus.OK).send(result);
    // } catch (error) {
    //     // res.status(400).json({ message: 'Failed to get the Data', details: error });
    //     throw new Error(error);
    // }
});

const getPreviewPDF = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.getPreviewPDF(req.body.invoice_id, req.body.userId);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error && error.message });
    }
});


/**
 * ===================================================================================================
 *  Function to generate payroll invoice
 * This has been commented out temporarily to effect monthly invoices
 * Note that the cron job can be commented or uncommented and it will work perfectly -> commnted out on thursday
 * ===================================================================================================
 */
// cron.schedule('0 1 * * *', async () => {
//  try {
//     const today = new Date(new Date().setHours(0, 0, 0, 0));
//     console.log('Running a task EveryDay at 1 am ------------------------------->', today);
//     //-----Updating the Invoice Status to Overdue
//     const filter = {
//         is_deleted: 0,
//         status: {
//             $in: ['Due'],
//         },
//         due_date: {
//             $lt: today,
//         },
//     };
//     const result = await invoiceService.updateAllDueInvoices(filter);

//     //------Generate Invoice
//     const term = await termsService.termOnName()
//     const companies = await companiesService.listAllCompaniesAndTheirPayrollSchedule();
//     const payrollUsers = companies.map(async (companyData, index) => {
//         const invoiceDay = companyData.payroll_schedule.invoice_date
//         // console.log(invoiceDay, "----------> the printed invoice day------->")
//         const invoiceDayValue = parseInt(invoiceDay.display.match(/\d+/)[0]);
//         const date = new Date(today);
//         const dayToday = date.getDate();
//         if (dayToday === invoiceDayValue) {
//             let total = 0
//             const usersOnCompanyID = await usersService.listAllUsersIdAndSalary(companyData._id)

//             const paymentDueDay = companyData.payroll_schedule.salary_payment_date
//             const billingAddress = companyData.billing_address?.address_line1 + ' ' + companyData.billing_address?.address_line2 + ' '
//              + companyData.billing_address?.city + ' ' + companyData.billing_address?.state + ' ' + companyData.billing_address?.country;
//             const shippingAddress = companyData.shipping_address?.address_line1 + ' ' + companyData.shipping_address?.address_line2 + ' '
//              + companyData.shipping_address?.city + ' ' + companyData.shipping_address?.state + ' ' + companyData.shipping_address?.country;
//             const paymentDueValue = parseInt(paymentDueDay.display.match(/\d+/)[0]);
//             const previousDay = paymentDueValue - 1;
//             const dueDate = new Date();
//             dueDate.setDate(previousDay);
//             const PayrolInvoiceBody = {
//                 "customer": companyData._id,
//                 "customer_name": companyData.company_name,
//                 "customer_address": companyData.address,
//                 "email": companyData.email,
//                 "type": "payroll invoice",
//                 "billing_address": billingAddress,
//                 "shipping_address": shippingAddress || (companyData.address ? companyData.address : "-"),
//                 "terms": term[0]._id,
//                 "terms_name": term[0].name,
//                 "invoice_date": new Date(),
//                 "due_date": dueDate,
//                 "sale_location": "Dubai",
//                 "items": [],
//                 "sub_total": 0,
//                 "total": 0,
//                 "vat_total": 0,
//                 "customer_notes": "Payroll Invoice",
//                 "terms_condition": "Terms and Conditions",
//                 "is_recurring": false,
//                 "is_draft": false
//             }
//             const currentDate = new Date();
//             const currentMonth = currentDate.toLocaleString('default', { month: 'long' }); // Get full month name
//             const currentYear = currentDate.getFullYear(); // Get the full year

//             const monthAndYear = `${currentMonth} ${currentYear}`;
//             const UserInvoiceToBeGenerated = usersOnCompanyID.map(async (usersData, index) => {
//                 // optionally calculate total fixed
//                 const fixedSalary = calculateTotalFixed(usersData.salary);
//                 console.log("this is the salary object",usersData.salary, "for", usersData.first_name)
//                 console.log("start of fixed salary----->",fixedSalary, "end of fixed salary=========>")
//                 // const totalFixedSalry = usersData.salary.total_fixed
//                 const totalFixedSalry = fixedSalary
//                 const usersPayrolItems = {
//                     "id": usersData._id,
//                     "service": "Payroll",
//                     "service_name": "Payroll Invoice",
//                     // "description": `Payroll Generated for the Month: ${monthAndYear}`,
//                     "description": `${usersData?.full_name} - ${monthAndYear}`,
//                     "rate": totalFixedSalry,
//                     "amount": totalFixedSalry,
//                     "net_total": totalFixedSalry,
//                     "type": "Payroll",
//                     "date": new Date(),
//                     "vat_amount": 0,
//                     "isInventory": "false",
//                     "city": "Dubai"
//                 }
//                 total = total + totalFixedSalry
//                 PayrolInvoiceBody.items.push(usersPayrolItems)
//             })
//             PayrolInvoiceBody.sub_total = total;
//             PayrolInvoiceBody.total = total;

//             const journal_entry = []
//             const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ customer: ObjectId(PayrolInvoiceBody.customer) }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             PayrolInvoiceBody.company = debitResult.company
//             journal_entry.push(debitResult)
//             const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             journal_entry.push(creditResult)
//             const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             journal_entry.push(vatResult)
//             const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             journal_entry.push(discountResult)
//             let taxItems = []
//             const mapItems = PayrolInvoiceBody.items.map((obj) => {
//                 if (obj.tax_name && obj.tax_code) {
//                     let dataItems = {
//                         name: vatResult.name,
//                         account_name: vatResult.account_name,
//                         account: vatResult.account,
//                         isDebit: false,
//                         isCredit: true,
//                         isInvoiceRelated: true,
//                         taxName: obj.tax_name,
//                         taxCode: obj.tax_code,
//                         totalAmount: obj.net_total,
//                         netAmount: obj.amount,
//                         taxAmount: obj.vat_amount,
//                         customer: PayrolInvoiceBody.customer,
//                         city: vatResult.city
//                     }
//                     taxItems.push(dataItems);
//                 }
//             })
//             const debitsTotal = journal_entry.filter((item) => item.isDebit).reduce((total, item) => total + parseInt(item.amount), 0);
//             const creditsTotal = journal_entry
//                 .filter((item) => item.isCredit)
//                 .reduce((total, item) => total + parseInt(item.amount), 0);
//             if (debitsTotal == creditsTotal) {
//                 validJournal = true;
//             } else {
//                 throw new ApiError(httpStatus.FORBIDDEN, 'journal entry not matching');
//             }
//             if (validJournal) {
//                 /**
//                  * ========================================================================================
//                  * Condition to optionally create invoice if customer has at least one employeebundleRenderer.renderToStream
//                  * This implementation is necessary to fix failling previews on billing section
//                  * ========================================================================================
//                  */
//                 const employees = await Users.find({company_id: companyData._id});
//                 const employeesCount = employees.length;
//                 if (employeesCount > 0) {
//                     const data = await addInvoice(PayrolInvoiceBody, journal_entry, taxItems, "");
//                     console.log("---VALID JOURNAL ENTRY---");
//                     console.log("---PAYROLL CREATION---");
//                 }else {

//                 }
//                 //---Mailing service was written here---
//             }
//         }
//     });

//     //--------Due Notify
//     const dueInvoices = await invoiceService.getAllDueInvoices();
//     const mappingDueInvoices = dueInvoices.map(async (data, index) => {
//         const company = await companiesService.listAllCompaniesAndTheirPayrollScheduleOnID(data.customer);
//         const notifyPayrollDue = company.map(async (companyData, index) => {
//             const notifyDueDay = companyData.payroll_schedule.payment_due_notification
//             console.log(notifyDueDay, "date of notification=---->")
//             console.log(notifyDueDay.display, "value of display-------->")
//             const notifyDayValue = parseInt(notifyDueDay.display.match(/\d+/)[0]);
//             console.log(notifyDayValue, "notification value-------->")
//             const date = new Date(today);
//             const dayToday = date.getDate();
//             if (dayToday === notifyDayValue) {
//                 console.log("-------------NOTIFY BY SENDING A MAIL-------------")
//                 console.log("INVOICE ID ==>> ", data._id);
//                 console.log("INVOICE NUMBER ==>> ", data.invoice_number);
//                 console.log("COMPANY EMAIL ==>> ", data.email);
//             }
//         })
//     })
//  } catch(error){
//     throw new Error(error);
//  }
// },
//     {
//         scheduled: true,
//         timezone: 'Asia/Dubai',
//     }
// );





/**
 * cron job to generate payroll invoices for the month of november
 * This can be commented or uncommented for quick generation of invoices on the system
 */

// cron.schedule('*/5 * * * *', async () => {
//     try {
//         const today = new Date(new Date().setHours(0, 0, 0, 0));
//         console.log('Running a task EveryDay at 1 am ------------------------------->!!!!!!!!!!!!!!!!!!!!', today);

//         //-----Updating the Invoice Status to Overdue
//         const filter = {
//             is_deleted: 0,
//             status: {
//                 $in: ['Due'],
//             },
//             due_date: {
//                 $lt: today,
//             },
//         };
//         const result = await invoiceService.updateAllDueInvoices(filter);

//         //------Generate Invoice
//         const term = await termsService.termOnName();
//         const companies = await companiesService.listAllCompaniesAndTheirPayrollSchedule();

//         const payrollUsers = companies.map(async (companyData) => {
//             console.log(companyData.company_name, "----------> Generating invoice for company ------->");

//             let total = 0;
//             const usersOnCompanyID = await usersService.listAllUsersIdAndSalary(companyData._id);

//             const paymentDueDay = companyData.payroll_schedule.salary_payment_date;
//             const billingAddress = companyData.billing_address?.address_line1 + ' ' + companyData.billing_address?.address_line2 + ' '
//                 + companyData.billing_address?.city + ' ' + companyData.billing_address?.state + ' ' + companyData.billing_address?.country;
//             const shippingAddress = companyData.shipping_address?.address_line1 + ' ' + companyData.shipping_address?.address_line2 + ' '
//                 + companyData.shipping_address?.city + ' ' + companyData.shipping_address?.state + ' ' + companyData.shipping_address?.country;
//             const paymentDueValue = parseInt(paymentDueDay.display.match(/\d+/)[0]);
//             const previousDay = paymentDueValue - 1;
//             const dueDate = new Date();
//             dueDate.setDate(previousDay);

//             const PayrolInvoiceBody = {
//                 "customer": companyData._id,
//                 "customer_name": companyData.company_name,
//                 "customer_address": companyData.address,
//                 "email": companyData.email,
//                 "type": "payroll invoice",
//                 "billing_address": billingAddress,
//                 "shipping_address": shippingAddress || (companyData.address ? companyData.address : "-"),
//                 "terms": term[0]._id,
//                 "terms_name": term[0].name,
//                 "invoice_date": new Date(),
//                 "due_date": dueDate,
//                 "sale_location": "Dubai",
//                 "items": [],
//                 "sub_total": 0,
//                 "total": 0,
//                 "vat_total": 0,
//                 "customer_notes": "Payroll Invoice",
//                 "terms_condition": "Terms and Conditions",
//                 "is_recurring": false,
//                 "is_draft": false
//             };

//             const monthAndYear = `November ${new Date().getFullYear()}`;
//             const UserInvoiceToBeGenerated = usersOnCompanyID.map(async (usersData) => {
//                 const fixedSalary = calculateTotalFixed(usersData.salary);
//                 console.log("this is the salary object", usersData.salary, "for", usersData.first_name);
//                 console.log("start of fixed salary----->", fixedSalary, "end of fixed salary=========>");

//                 const usersPayrolItems = {
//                     "id": usersData._id,
//                     "service": "Payroll",
//                     "service_name": "Payroll Invoice",
//                     "description": `${usersData?.full_name} - ${monthAndYear}`,
//                     "rate": fixedSalary,
//                     "amount": fixedSalary,
//                     "net_total": fixedSalary,
//                     "type": "Payroll",
//                     "date": new Date(),
//                     "vat_amount": 0,
//                     "isInventory": "false",
//                     "city": "Dubai"
//                 };
//                 total = total + fixedSalary;
//                 PayrolInvoiceBody.items.push(usersPayrolItems);
//             });

//             PayrolInvoiceBody.sub_total = total;
//             PayrolInvoiceBody.total = total;

//             const journal_entry = [];
//             const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ customer: ObjectId(PayrolInvoiceBody.customer) }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             PayrolInvoiceBody.company = debitResult.company;
//             journal_entry.push(debitResult);

//             const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             journal_entry.push(creditResult);

//             const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             journal_entry.push(vatResult);

//             const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, PayrolInvoiceBody, PayrolInvoiceBody.customer);
//             journal_entry.push(discountResult);

//             let taxItems = [];
//             PayrolInvoiceBody.items.map((obj) => {
//                 if (obj.tax_name && obj.tax_code) {
//                     let dataItems = {
//                         name: vatResult.name,
//                         account_name: vatResult.account_name,
//                         account: vatResult.account,
//                         isDebit: false,
//                         isCredit: true,
//                         isInvoiceRelated: true,
//                         taxName: obj.tax_name,
//                         taxCode: obj.tax_code,
//                         totalAmount: obj.net_total,
//                         netAmount: obj.amount,
//                         taxAmount: obj.vat_amount,
//                         customer: PayrolInvoiceBody.customer,
//                         city: vatResult.city
//                     };
//                     taxItems.push(dataItems);
//                 }
//             });

//             const debitsTotal = journal_entry.filter((item) => item.isDebit).reduce((total, item) => total + parseInt(item.amount), 0);
//             const creditsTotal = journal_entry.filter((item) => item.isCredit).reduce((total, item) => total + parseInt(item.amount), 0);

//             if (debitsTotal !== creditsTotal) {
//                 throw new ApiError(httpStatus.FORBIDDEN, 'journal entry not matching');
//             }

//             const employees = await Users.find({ company_id: companyData._id });
//             if (employees.length > 0) {
//                 const data = await addInvoice(PayrolInvoiceBody, journal_entry, taxItems, "");
//                 console.log("---VALID JOURNAL ENTRY---");
//                 console.log("---PAYROLL CREATION---");
//             }
//         });

//         console.log("completed invoice generation for November===================================================>")
//     } catch (error) {
//         console.error("Error generating November invoices:", error);
//     }
// }, {
//     scheduled: true,
//     timezone: 'Asia/Dubai',
// });

const InvoiceChecker = catchAsync(async (req, res) => {
    try {
        const result = await invoiceService.InvoiceStatusCheck(req.params.id);

        if (result.status == 'new') {
            res.status(httpStatus.OK).send({ data: true, message: "Please Approve the New Invoice from Billing Section" });
        } else {
            res.status(httpStatus.OK).send({ data: false, message: "" });
        }

    } catch (error) {
        res.status(400).json({ message: 'Failed to get the Data', details: error });
    }
});

const createmonthlyInvoice = catchAsync(async (req, res) => {
    const response = await invoiceService.createmonthlyInvoice(req.body, req.userId);
    if (!response) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Could not create general invoice!');
    }

    res.status(httpStatus.OK).json(response);
});

const createMonthlyInvoiceDirect = catchAsync(async (req, res) => {
    const { companyId, startDate, endDate } = req.body;

    if (!companyId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Company ID is required');
    }

    // Get company object
    const company = await companiesService.getCompanyById(companyId);
    if (!company.data) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }

    // Parse dates if provided
    let parsedStartDate, parsedEndDate;
    if (startDate) {
        parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid start date format');
        }
    }
    if (endDate) {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid end date format');
        }
    }

    // Call the createMonthlyInvoice function directly
    // console.log("Creating monthly invoice for company:", company);
    const response = await invoiceService.createMonthlyInvoice(company.data, parsedStartDate, parsedEndDate);

    if (!response) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Could not create monthly invoice!');
    }

    res.status(httpStatus.OK).json({
        message: 'Monthly invoice created successfully',
        data: response
    });
});

const triggerExpiredInvoicesNotification = catchAsync(async (req, res) => {
    try {
        const response = await invoiceService.triggerExpiredInvoicesNotification();
        if (!response) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Could not trigger expired notifications!');
        }
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
});
/**
 * ==============================================================================================
 * This function outlines a summary of all invoices
 * It does not list individual employees, but rather invoices for companies
 * ==============================================================================================
 */
const exportGeneralInvoiceReport = catchAsync(async (req, res) => {
    try {
        const buffer = await invoiceService.exportGeneralInvoiceReport(req.query);
        if (!buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Generate general invoice report!');
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice_report.xlsx');
        res.send(buffer);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
});
/**
 * ==============================================================================================
 * This function generates the invoice report outlining individual employees and their payments
 * The list is based on company and the service fees are also outlined
 * ==============================================================================================
 */
const monthlyInvoiceSummary = catchAsync(async (req, res) => {
    try {
        console.log("touched api for monthly invoice report=================>")
        const buffer = await invoiceService.monthlyInvoiceSummary(req.query);
        if (!buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Generate monthly invoice report!');
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=EOR Detailed Invoicing Report.xlsx');
        res.send(buffer);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
});

const exportAgeingSummaryReport = catchAsync(async (req, res) => {
    try {
        const buffer = await invoiceService.exportAgeingSummaryReport(req.query);
        if (!buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to generate ageing summary report!');
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Ageing Summary Report.xlsx');
        res.send(buffer);
    } catch (error) {
        throw new Error(error);
    }
});

const exportAgeingDetailedReport = catchAsync(async (req, res) => {
    try {
        const buffer = await invoiceService.exportAgeingDetailedReport(req.query);
        if (!buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to generate detailed ageing report!');
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Ageing Detailed Report.xlsx');
        res.send(buffer);
    } catch (error) {
        throw new Error(error);
    }
});
/**
 * Function to manually generate monthly invoice by company id
 * This implementation is based on requirements from finance team
 */
const manualMonthlyInvoiceGeneration = catchAsync(async (req, res) => {
    try {
        const response = await invoiceService.manualMonthlyInvoiceGeneration(req.params.companyId);
        const logString = (logger.info(`${req.userName} generated manyal monthly invoice for company with id - ${req.params.companyId}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        res.status(httpStatus.OK).send(response)
    } catch (error) {
        console.log(error);
        const logString = (logger.error(`${req.userName} Failed to generate manual monthly invoice for company- ${req.params.companyId}, encountered following error => ${error && error.message}`)).transports[0].logString;
        await loggerService.createLogger('invoice', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * Function to generate security deposit and mobilization invoice
 * This implementation is based on requirements from finance team
 * Varriables used here are from onboarding model
 */
const generateSecurityDepositAndMobilizationInvoice = catchAsync(async (req, res) => {
    try {
        const company = await companiesService.companyById(req.body.companyId);
        const response = await invoiceService.generateSecurityDepositAndMobilizationInvoice(company, req.body);
        res.status(httpStatus.OK).send(response);
    } catch (error) {
        throw new Error(error);
    }
})

const duplicateInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.userId;

  const duplicated = await invoiceService.duplicateInvoice(invoiceId, userId, req.userName);

  // optional: add log entry similar to other actions
  try {
    const logString = `Duplicated invoice ${invoiceId} -> ${duplicated._id}`;
    await loggerService.createLogger('invoice', req.userId, logString);
  } catch (e) {}

     const invoiceLogBody = {
        user_id: userId,
        document_id: duplicated._id,
        module: "invoice",
        createdOrUpdateData: duplicated,
        logMessage: `${req.userName} Created a duplicate invoice with invoice number - ${duplicated?.invoice_number}`
    }
    await invoiceLogService.createInvoiceLog(invoiceLogBody);
  res.status(httpStatus.CREATED).send({
    message: 'Invoice duplicated successfully',
    invoice: duplicated,
  });
});

const exportInvoiceTemplate = catchAsync(async (req, res) => {
  try {
    const buffer = await invoiceService.exportInvoiceTemplate();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_Bulk_Upload_Template_${moment().format('YYYY-MM-DD')}.xlsx"`);

    res.send(buffer);
  } catch (error) {
    console.error('Error exporting invoice template:', error);
    res.status(400).json({ message: 'Failed to export template', details: error.message });
  }
});

const bulkUploadInvoices = catchAsync(async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await invoiceService.bulkUploadInvoices(req);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in bulk upload invoices:', error);
    res.status(400).json({
      message: 'Bulk upload failed',
      details: error.message,
      summary: {
        total: 0,
        successful: 0,
        failed: 1,
        duplicates: 0
      }
    });
  }
});

module.exports = {
    exportAgeingDetailedReport,
    exportAgeingSummaryReport,
    exportGeneralInvoiceReport,
    getPreview,
    addInvoice,
    createInvoice,
    createInvoiceJournalEntry,
    generateJournalEntry,
    getInfo,
    getInfoByAccount,
    createDebitNote,
    createPayrollInvoice,
    updateInvoice,
    recordPayment,
    updatePayment,
    createPaymentJournalEntry,
    updateDebitNoteId,
    updatePayrollInvoiceOnId,
    revertGeneralInvoice,
    cancelGeneralInvoice,
    getChartOfAccountByCustID,
    getCountsOfInvoices,
    invoicesAllFilterSearch,
    getUsersOfSelectedInvoice,
    listOfInvoiceStatus,
    getAllInvoices,
    getInvoiceOnInvoiceID,
    getAllPayrollInvoice,
    paymentScheduleData,
    paymentScheduleStatus,
    getInvoicesOfUsers,
    currencyList,
    getPreviewPDF,
    InvoiceChecker,
    createmonthlyInvoice,
    createMonthlyInvoiceDirect,
    triggerExpiredInvoicesNotification,
    monthlyInvoiceSummary,
    manualMonthlyInvoiceGeneration,
    generateSecurityDepositAndMobilizationInvoice,
    getAmountsDueForCompanies,
    exportEmployeeSalariesReport,
    getOrCreatePreviewInvoice,
    recordMultipleInvoicePayment,
    listVoidInvoices,
    markinvoiceAsVoid,
    duplicateInvoice,
    exportInvoiceTemplate,
    bulkUploadInvoices,
};
