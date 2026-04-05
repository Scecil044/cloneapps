const { DebitNote, Invoice, DocumentTemplate, JournalEntry, Companies, Users } = require('../models');
const queryService = require('./query.service');
const invoiceService = require('./invoice.service');
const journalEntryService = require('./journal_entry.service');
const chartOfAccountsService = require('./chart_of_accounts.service');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const moment = require('moment');
const axios = require('axios');
const { formatDate, formatDateOneMonthLater, thousandSeparator } = require('../helpers/common');
const cron = require('node-cron');

/**
 * Generates a debit note PDF preview
 * @param {string} debitNoteId - The ID of the debit note
 * @returns {Promise<Object>} The URL of the generated PDF
 * @throws Will throw an error if the debit note is not found or if the operation fails
 *
 */

const getTemplateName = async (invoiceId) => {
  try {
    console.log(invoiceId, 'this is the invoice id');
    let templateName;
    const originalInvoice = await Invoice.findById(invoiceId);
    if (!originalInvoice) throw new Error('Invalid invoice id. Could not fetch invoice details');
    let visaSponsor =
      typeof originalInvoice.visa_sponsor === 'string' && originalInvoice.visa_sponsor.trim() !== ''
        ? originalInvoice.visa_sponsor.trim()
        : 'Dynamic Employment Services';
    if (visaSponsor === 'Dynamic Employment Services') {
      templateName = 'Debit Note Template';
    } else {
      templateName = 'Debit Note Template EES';
    }
    return templateName;
  } catch (error) {
    throw error;
  }
};
const getDebitNotePdfPreview = async (debitNoteId) => {
  try {
    // Fetch debit note details
    const result = await DebitNote.findById(debitNoteId)
      .populate('invoice')
      .populate('customer')
      .populate({
        path: 'invoice',
        populate: {
          path: 'terms',
        },
      });

    if (!result) {
      throw new Error('Debit note not found! Could not fetch debit note details for preview');
    }
    const debitNoteInvoice = await Invoice.findById(result.invoice);
    if(!debitNoteInvoice){
      throw new Error('Associated invoice not found for the debit note!');
    }
    const companyDoc = await Companies.findById(result.customer);
    if (!companyDoc) throw new Error(`Invalid company id. Exiting preview for debit note`);
    let templateName = await getTemplateName(result.invoice._id);
    console.log(templateName, 'this is the template name');
    const template = await DocumentTemplate.findOne({ name: templateName }).select({ content: 1 });
    if (!template || !template.content) {
      throw new Error('Debit Note Template not found or content is empty');
    }
    let sponsorType;
    sponsorType = result.visa_sponsor.toLowerCase() || 'dynamic employment services';

    // Format billing address
    let billingAddressText = '';
    if (typeof result.billing_address === 'string' && result.billing_address.trim() !== '') {
      billingAddressText = result.billing_address;
    } else if (companyDoc && companyDoc.billing_address) {
      const addr = companyDoc.billing_address && companyDoc.billing_address.address_line1;
      billingAddressText = addr;
    }
    console.log(
      companyDoc && companyDoc.billing_address && companyDoc.billing_address.address_line1,
      'the company address',
      billingAddressText[0]
    );

    const replacements = [
      { key: 'debit_number', value: result.debit_note_number },
      { key: 'date_created', value: moment(result.createdAt).format('Do MMMM YYYY') },
      { key: 'trnnumber', value: companyDoc.trn_number },
      {
        key: 'account_number',
        value: sponsorType === 'executive employment services' ? '11771253920002' : '11403139820001',
      },
      {
        key: 'iban_number',
        value: sponsorType === 'executive employment services' ? 'AE640030011771253920002' : 'AE460030011403139820001',
      },
      {
        key: 'swift_code',
        value: sponsorType === 'executive employment services' ? 'ADCBAEAA' : 'ADCBAEAA',
      },
      {
        key: 'bank_name',
        value: sponsorType === 'executive employment services' ? 'ABU Dhabi Commercial Bank' : 'ABU Dhabi Commercial Bank',
      },
      { key: 'invoice_number', value: (result && result.invoice && result.invoice.invoice_number) || '' },
      { key: 'debitdate', value: formatDate(result.debit_date) },
      { key: 'debitdue', value: formatDate(result.due_date) },
      { key: 'debitterm', value: formatDate((result && result.terms && result.terms.name) || '') },
      { key: 'memo', value: result.notes },
      { key: 'status', value: result.status || 'Draft' },
      { key: 'subtotal', value: thousandSeparator(result.sub_total) },
      { key: 'totalvat', value: result.vat_total },
      { key: 'tax', value: thousandSeparator(result.vat_total) },
      { key: 'totaltax', value: result.vat_total },
      { key: 'total', value: result.total },
      { key: 'balance_due', value: result.balance_due || result.total.toFixed(2) },
      { key: 'billing_address', value: billingAddressText },
      { key: 'terms', value: result.terms_name || '' },
      { key: 'currency', value: result.currency || debitNoteInvoice.currency || 'AED' },

    ];
    if (companyDoc.trn_number && companyDoc.trn_number.trim() !== '') {
      replacements.push(
        { key: 'trnnumber', value: (companyDoc && companyDoc.trn_number) || '' },
        { key: 'trnLabel:', value: 'TRN Number' || '' }
      );
    }
    if (companyDoc.PO_number && companyDoc.PO_number.trim() !== '') {
      replacements.push(
        { key: 'ponumber', value: (companyDoc && companyDoc.PO_number) || '' },
        { key: 'poLabel:', value: 'PO Number' || '' }
      );
    }

    // Get related invoice information if available
    if (result.invoice) {
      replacements.push(
        { key: 'invoice_number', value: result.invoice.invoice_number },
        { key: 'invoice_date', value: formatDate(result.invoice.invoice_date) }
      );
    }

    // Get customer information
    if (companyDoc) {
      replacements.push({ key: 'company', value: companyDoc.company_name });
    }
    let tableArray = [];
    if (result.items.length === 0) {
      tableArray.push({
        service: 'No items',
        rate: 0.0,
        amount: 0.0,
        quantity: 0,
        vat: 0.0,
        description: 'No items added to this debit note',
      });
    } else {
      for (const item of result.items) {
        let obj = {
          service: item.service_name,
          rate: thousandSeparator(item.rate) || 0.0,
          amount: thousandSeparator(item.amount) || 0.0,
          quantity: item.quantity,
          vat: item.vat_amount.toFixed(2) || 0.0,
          description: item.description || '',
        };
        tableArray.push(obj);
      }
    }

    // Prepare template replacement object
    const obj = {
      replaceText: JSON.stringify(replacements),
      replaceTable: JSON.stringify([{ tablename: 'debittable', table: tableArray }]),
      replaceImage: JSON.stringify([
        {
          key: 'logo',
          value:
            process.env.COMPANY_LOGO_URL ||
            'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg',
        },
      ]),
      content: template.content.toString('utf-8'),
    };
    console.log('the obj for pdf generation----------------------->');
    // Generate PDF
    const response = await axios.post(
      `${process.env.documenturl}api/DocumentEditor/ReplaceContenttoPDF`,
      JSON.stringify(obj),
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        responseType: 'arraybuffer',
      }
    );

    // Upload generated PDF
    const url = await invoiceService.uploadLetterArrayBuffer(response.data, `debitnote_${result.debit_note_number}.pdf`);

    return {
      url: url,
      name: `debitnote_${result.debit_note_number}.pdf`,
    };
  } catch (error) {
    console.error('Error generating debit note preview:', error.message);
    throw error;
  }
};

/**
 * Gets a preview of a debit note
 * @param {string} debitNoteId - The ID of the debit note
 * @returns {Promise<Object>} The preview data
 * @throws Will throw an error if the debit note is not found or if the operation fails
 */
const getDebitNotePreview = async (debitNoteId) => {
  try {
    console.log('===================> getting preview for debit note', debitNoteId, '-------->');
    // Fetch debit note details
    const result = await DebitNote.findById(ObjectId(debitNoteId))
      .populate('invoice')
      .populate('customer')
      .populate({
        path: 'invoice',
        populate: {
          path: 'terms',
        },
      });

    if (!result) {
      throw new Error('Debit note not found!');
    }

    const debitNoteInvoice = await Invoice.findById(result.invoice);
    if(!debitNoteInvoice){
      throw new Error('Associated invoice not found for the debit note!');
    }
    console.log(result.customer, 'the customer id');
    const companyDoc = await Companies.findById(result.customer);
    if (!companyDoc) throw new Error(`Invalid company id. Exiting preview for debit note`);

    let sponsorType;
    sponsorType = result.visa_sponsor.toLowerCase() || 'dynamic employment services';
    let templateName = await getTemplateName(result.invoice._id);
    console.log(templateName, 'this is it');
    // Fetch document template
    const template = await DocumentTemplate.findOne({ name: templateName }).select({ content: 1 });
    if (!template || !template.content) {
      throw new Error('Debit Note Template not found or content is empty');
    }

    // Format billing address
    let billingAddressText = '';
    if (typeof result.billing_address === 'string' && result.billing_address.trim() !== '') {
      billingAddressText = result.billing_address;
    } else if (companyDoc && companyDoc.billing_address) {
      billingAddressText = [
        companyDoc.billing_address.address_line1,
        // companyDoc.billing_address.address_line2,
        // companyDoc.billing_address.city,
        // companyDoc.billing_address.state,
        // companyDoc.billing_address.zip,
        // companyDoc.billing_address.country
      ]
        .filter(Boolean) // removes empty strings/nulls
        .join('\n');
    }

    // Basic debit note information
    let array = [
      { key: 'debit_number', value: result.debit_note_number },
      { key: 'date_created', value: moment(result.createdAt).format('Do MMMM YYYY') },
      {
        key: 'account_number',
        value:
          companyDoc?.bank_details &&
          Array.isArray(companyDoc?.bank_details) &&
          companyDoc?.bank_details[0]?.account_number?.trim() !== ''
            ? companyDoc?.bank_details[0].account_number
            : sponsorType === 'executive employment services'
            ? '11771253920002'
            : '11403139820001',
      },
      {
        key: 'iban_number',
        value:
          companyDoc?.bank_details &&
          Array.isArray(companyDoc?.bank_details) &&
          companyDoc?.bank_details[0]?.iban?.trim() !== ''
            ? companyDoc.bank_details[0].iban
            : sponsorType === 'executive employment services'
            ? 'AE640030011771253920002'
            : 'AE460030011403139820001',
      },
      {
        key: 'swift_code',
        value:
          companyDoc?.bank_details &&
          Array.isArray(companyDoc?.bank_details) &&
          companyDoc?.bank_details[0]?.swift_code?.trim() !== ''
            ? companyDoc.bank_details[0].swift_code
            : sponsorType === 'executive employment services'
            ? 'ADCBAEAA'
            : 'ADCBAEAA',
      },
      {
        key: 'bank_name',
        value:
          companyDoc?.bank_details &&
          Array.isArray(companyDoc?.bank_details) &&
          companyDoc?.bank_details[0]?.bank_name?.trim() !== ''
            ? companyDoc.bank_details[0].bank_name
            : sponsorType === 'executive employment services'
            ? 'ABU Dhabi Commercial Bank'
            : 'ABU Dhabi Commercial Bank',
      },
      { key: 'debitdate', value: result.debit_date ? formatDate(result.debit_date) : formatDate(result.createdAt) },
      { key: 'debitdue', value: formatDate(result.due_date) },
      { key: 'debitterm', value: (result && result.terms && result.terms.name) || '' },
      { key: 'memo', value: result.notes },
      { key: 'status', value: result.status || 'Draft' },
      { key: 'subtotal', value: thousandSeparator(result.sub_total) },
      { key: 'totalvat', value: result.vat_total },
      { key: 'tax', value: thousandSeparator(result.vat_total) },
      { key: 'totaltax', value: result.vat_total },
      { key: 'total', value: result.total },
      { key: 'billing_address', value: billingAddressText },
      { key: 'balance_due', value: result.balance_due || result.total.toFixed(2) },
      { key: 'terms', value: result.terms_name || '' },
      { key: 'currency', value: result.currency || debitNoteInvoice.currency || 'AED' },
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

    // Get related invoice information
    if (result.invoice) {
      array.push(
        { key: 'invoice_number', value: result.invoice.invoice_number },
        { key: 'invoice_date', value: formatDate(result.invoice.invoice_date) }
      );
    }

    // Get customer information
    if (companyDoc) {
      array.push({ key: 'company', value: companyDoc.company_name });
    }

    // Process items table
    let tablearray = [];
    if (result.items.length === 0) {
      tablearray.push({
        service: 'No items',
        rate: '0',
        amount: '0',
        quantity: 0,
        vat: '0',
        description: 'No items added to this debit note',
      });
    } else {
      for (const item of result.items) {
        let obj = {
          service: item.service_name,
          rate: thousandSeparator(item.rate) || '0',
          amount: thousandSeparator(item.amount) || '0',
          quantity: item.quantity,
          vat: item.vat_amount.toFixed(2) || '0',
          description: item.description || '',
        };
        tablearray.push(obj);
      }
    }

    let obj = {
      replaceText: JSON.stringify(array),
      replaceTable: JSON.stringify([{ tablename: 'debittable', table: tablearray }]),
      replaceImage: JSON.stringify([
        {
          key: 'logo',
          value:
            process.env.COMPANY_LOGO_URL ||
            'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg',
        },
      ]),
      content: template.content.toString('utf-8'),
    };

    // Make API call to process SFDT
    let response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContent', JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    });

    return response.data;
  } catch (error) {
    console.error('Error generating debit note preview:', error.message);
    throw error;
  }
};

/**
 * Gets all debit notes with pagination and filtering options
 * @param {Object} query - Query parameters for pagination and sorting
 * @param {Object} body - Body parameters for filtering
 * @returns {Promise<Object>} Paginated list of debit notes
 */
const getAllDebitNotes = async (query, reqBody) => {
  try {
    let search = query.search ? query.search.trim() : '';
    let filter = { is_deleted: false };
    let options = {
      limit: query.limit,
      page: query.page,
      sortBy: query.sortBy || 'createdAt:desc',
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
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
        },
      },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceDetails',
        },
      },
      { $unwind: { path: '$invoiceDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          debit_note_number: 1,
          createdAt: 1,
          updatedAt: 1,
          notes: 1,
          status: 1,
          items: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          terms_name: 1,
          debit_date: 1,
          due_date: 1,
          customer_name: '$companyDetails.company_name',
          customer_email: '$companyDetails.email',
          customer_phone: '$companyDetails.phone',
          customer_address: '$companyDetails.address',
          invoice_number: '$invoiceDetails.invoice_number',
          balance_due: 1,
          paid: 1,
        },
      },
    ];

    if (search.length > 0) {
      filter.$or = [{ debit_note_number: { $regex: search, $options: 'i' } }, { notes: { $regex: search, $options: 'i' } }];
    }

    if (reqBody.selected_company_id) {
      reqBody.isDebitFilter = true;
      body.unshift(...queryService(reqBody));
    }

    const response = await DebitNote.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Finds a debit note by its ID
 * @param {string} debitNoteId - The ID of the debit note
 * @returns {Promise<Object>} The debit note
 * @throws Will throw an error if the debit note is not found
 */
const findDebitNoteById = async (debitNoteId) => {
  try {
    const debitNote = await DebitNote.findById(debitNoteId).populate('invoice').populate('customer');
    if (!debitNote) {
      throw new Error('Debit note not found');
    }
    return debitNote;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Updates a debit note
 * @param {string} debitNoteId - The ID of the debit note
 * @param {Object} reqBody - The update data
 * @returns {Promise<Object>} The updated debit note
 * @throws Will throw an error if the update fails
 */
const updateDebitNote = async (debitNoteId, reqBody) => {
  try {
    const debitNote = await findDebitNoteById(debitNoteId);
    const updates = Object.keys(reqBody);
    updates.forEach((update) => {
      debitNote[update] = reqBody[update];
    });
    await debitNote.save();
    return debitNote;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Soft deletes a debit note
 * @param {string} debitNoteId - The ID of the debit note
 * @param {string} userId - The ID of the user performing the deletion
 * @returns {Promise<boolean>} True if successful
 * @throws Will throw an error if the deletion fails
 */
const deleteDebitNote = async (debitNoteId, userId) => {
  try {
    const debitNote = await findDebitNoteById(debitNoteId);
    debitNote.is_deleted = true;
    debitNote.deleted_by = userId;
    await debitNote.save();
    return true;
  } catch (error) {
    throw new Error(`Error deleting debit note: ${error.message}`);
  }
};

/**
 * Filters debit notes by status
 * @param {Object} reqBody - The request body containing status filter
 * @returns {Promise<Array>} Filtered debit notes
 */
const filterDebitNotesByStatus = async (reqBody) => {
  try {
    const { status } = reqBody;
    let filter = { is_deleted: 0 };
    let options = {
      limit: 10,
      page: 1,
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
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
        },
      },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceDetails',
        },
      },
      { $unwind: { path: '$invoiceDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          debit_note_number: 1,
          createdAt: 1,
          updatedAt: 1,
          notes: 1,
          status: 1,
          items: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          terms_name: 1,
          debit_date: 1,
          due_date: 1,
          customer_name: '$companyDetails.company_name',
          customer_email: '$companyDetails.email',
          customer_phone: '$companyDetails.phone',
          customer_address: '$companyDetails.address',
          invoice_number: '$invoiceDetails.invoice_number',
          balance_due: 1,
          paid: 1,
        },
      },
    ];

    if (status && status.length > 0) {
      if (Array.isArray(status)) {
        filter.status = {
          $in: status.map((s) => s.toLowerCase()),
        };
      } else {
        filter.status = {
          $in: ['due', 'paid', 'overdue', 'cancelled'].map((s) => s.toLowerCase()),
        };
      }
    }

    if (reqBody.selected_company_id) {
      reqBody.isDebitFilter = true;
      body.unshift(...queryService(reqBody));
    }

    const response = await DebitNote.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Gets debit note statistics
 * @returns {Promise<Object>} Debit note statistics
 */
const getDebitNoteStats = async () => {
  try {
    const totalDebitNotes = await DebitNote.countDocuments({ is_deleted: false });
    const paidDebitNotes = await DebitNote.countDocuments({ is_deleted: false, paid: true });
    const unpaidDebitNotes = await DebitNote.countDocuments({ is_deleted: false, paid: false });
    const totalAmount = await DebitNote.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    return {
      totalDebitNotes,
      paidDebitNotes,
      unpaidDebitNotes,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

cron.schedule(
  '0 1 * * *',
  async () => {
    console.log('----------------------------------> Updating Debit Note Status <===============================>');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Find all debit notes with "available" or "due" status
      const debitNotes = await DebitNote.find({
        status: { $in: ['due'] },
        is_deleted: 0,
      });

      console.log(`Found ${debitNotes.length} eligible credit notes`);

      for (const debitNote of debitNotes) {
        try {
          const invoice = await Invoice.findById(debitNote.invoice);

          if (!invoice) {
            console.warn(`No associated invoice found for credit note ID: ${debitNote._id}`);
            continue;
          }

          const invoiceDate = new Date(invoice.invoice_date);
          const daysSinceInvoice = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));

          if (daysSinceInvoice > 30) {
            debitNote.status = 'overdue';
            await debitNote.save();
            console.log(`Marked credit note ID: ${debitNote._id} as overdue`);
          }
        } catch (err) {
          console.error(`Error processing credit note ID: ${debitNote._id}`, err);
        }
      }

      console.log('Credit note status update cron job completed successfully.');
    } catch (error) {
      console.error('Error in credit note status update cron job:', error);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Dubai',
  }
);

/**
 * Generates a unique debit note number using MongoDB transactions to ensure uniqueness
 * during concurrent requests. Adds a timestamp component for additional uniqueness.
 * @returns {Promise<string>} The generated debit note number
 */
const generateDebitNoteNumber = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const year = new Date().getFullYear().toString().slice(-2);
      const now = new Date();

      // Get milliseconds for uniqueness during concurrent requests
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

      // Find the sequence document and atomically increment it
      // If it doesn't exist for the current year, create it with sequence 1
      const sequenceKey = `debitNote-${year}`;

      // Use findOneAndUpdate with upsert to atomically increment the sequence
      const sequenceDoc = await DebitNote.db.collection('counters').findOneAndUpdate(
        { _id: sequenceKey },
        { $inc: { sequence: 1 } },
        {
          upsert: true,
          returnDocument: 'after',
          session,
        }
      );

      // Get the incremented sequence value
      const sequence = sequenceDoc.value ? sequenceDoc.value.sequence : 1;

      // Format the debit note number with the sequence and milliseconds for uniqueness
      const debitNoteNumber = `DN-${year}-${String(sequence).padStart(5, '0')}-${milliseconds}`;

      // Check if this debit note number already exists
      const existingDebitNote = await DebitNote.findOne({ debit_note_number: debitNoteNumber }).session(session);
      if (existingDebitNote) {
        await session.abortTransaction();
        retryCount++;
        console.log(`Debit note number ${debitNoteNumber} already exists, retrying... (attempt ${retryCount})`);
        await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
        continue;
      }

      await session.commitTransaction();
      return debitNoteNumber;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error generating debit note number:', error);
      retryCount++;
      if (retryCount >= maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
    } finally {
      session.endSession();
    }
  }

  throw new Error('Failed to generate unique debit note number after maximum retries');
};

const setupDebitNotePreview = async (data) => {
  const maxRetries = 3;
  let retryCount = 0;

  // First, check if there's already a draft debit note for this invoice
  const invoiceId = data.invoice_id || data.invoice;
  if (invoiceId) {
    const existingDraft = await DebitNote.findOne({
      invoice: typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId,
      status: 'Draft',
      is_draft: true,
      is_deleted: { $ne: true },
    });

    if (existingDraft) {
      console.log(
        'Found existing draft debit note for invoice, returning it instead of creating new one:',
        existingDraft._id
      );
      // Update the existing draft with any new data provided
      if (data.debit_note_number && data.debit_note_number !== existingDraft.debit_note_number) {
        existingDraft.debit_note_number = data.debit_note_number;
        await existingDraft.save();
      }
      return existingDraft;
    }
  }

  // Also check by company if no invoice is specified (for general debit notes)
  if (!invoiceId && data.company) {
    const existingDraft = await DebitNote.findOne({
      company: typeof data.company === 'string' ? ObjectId(data.company) : data.company,
      status: 'Draft',
      is_draft: true,
      is_deleted: { $ne: true },
      $or: [{ invoice: { $exists: false } }, { invoice: null }, { invoice: '' }],
    });

    if (existingDraft) {
      console.log(
        'Found existing draft debit note for company, returning it instead of creating new one:',
        existingDraft._id
      );
      return existingDraft;
    }
  }

  while (retryCount < maxRetries) {
    try {
      // Create a temporary debit note for preview purposes
      const debitNoteData = {
        ...data,
        is_draft: true,
        status: 'Draft', // Set to Draft for preview
        // Ensure all required fields are present
        due_date: data.due_date || new Date(),
        debit_date: data.debit_date || new Date(),
        terms: data.terms || '',
        terms_name: data.terms_name || '',
        email: data.email || '',
        company: data.company || data.customer || '', // Use customer if company not provided
        invoice: invoiceId || '', // Use invoice_id if invoice not provided
      };

      // Remove _id if it exists to create a new document
      delete debitNoteData._id;

      // If debit_note_number is provided and might cause duplicates, generate a new one
      if (debitNoteData.debit_note_number) {
        // Check if this debit note number already exists
        const existingDebitNote = await DebitNote.findOne({ debit_note_number: debitNoteData.debit_note_number });
        if (existingDebitNote) {
          console.log(`Debit note number ${debitNoteData.debit_note_number} already exists, generating new one...`);
          debitNoteData.debit_note_number = await generateDebitNoteNumber();
        }
      } else {
        // Generate a new debit note number if none provided
        debitNoteData.debit_note_number = await generateDebitNoteNumber();
      }

      // Double-check for existing draft before creating (race condition protection)
      const finalCheck = await DebitNote.findOne({
        invoice: typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId,
        status: 'Draft',
        is_draft: true,
        is_deleted: { $ne: true },
      });

      if (finalCheck) {
        console.log('Found existing draft during final check, returning it instead of creating new one:', finalCheck._id);
        return finalCheck;
      }

      const debitNote = await DebitNote.create(debitNoteData);
      console.log('Created new draft debit note:', debitNote._id, 'for invoice:', invoiceId);
      return debitNote;
    } catch (error) {
      // Check if it's a duplicate key error
      if (error.code === 11000 && error.message.includes('debit_note_number')) {
        retryCount++;
        console.log(`Duplicate debit note number detected in setup preview, retrying... (attempt ${retryCount})`);

        if (retryCount < maxRetries) {
          // Generate a new debit note number and retry
          data.debit_note_number = await generateDebitNoteNumber();
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
          continue;
        }
      }

      console.error('Error setting up debit note preview:', error);
      throw error;
    }
  }

  throw new Error('Failed to setup debit note preview after maximum retries');
};

/**
 * Approves a debit note by updating its status to 'Approved'
 * @param {String} debitNoteId - The debit note ID to approve
 * @param {String} userId - The user ID who is approving
 * @returns {Promise<Object>} The updated debit note
 */
const approveDebitNote = async (debitNoteId, userId) => {
  try {
    const debitNote = await DebitNote.findById(debitNoteId);
    if (!debitNote) {
      throw new Error('Debit note not found');
    }

    if (debitNote.status === 'Approved') {
      throw new Error('Debit note is already approved');
    }

    if (debitNote.status !== 'Unapproved') {
      throw new Error('Only unapproved debit notes can be approved');
    }

    // Update the debit note status
    debitNote.status = 'Approved';
    debitNote.approved_by = userId;
    debitNote.approved_at = new Date();

    await debitNote.save();

    console.log(`Debit note ${debitNote.debit_note_number} approved by user ${userId}`);
    return debitNote;
  } catch (error) {
    console.error('Error approving debit note:', error);
    throw error;
  }
};

/**
 * Creates a new debit note with transaction support.
 * @param {Object} data - The data for the new debit note.
 * @param {Object} session - Optional MongoDB session for transaction support.
 * @returns {Promise<Object>} The created debit note object.
 * @throws Will throw an error if the debit note creation fails.
 */
const createDebitNote = async (data, session = null) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { _id, ...debitBody } = data;
      let response;

      if (session) {
        // Create debit note within an existing transaction
        response = await DebitNote.create([debitBody], { session }).then((docs) => docs[0]);

        if (response) {
          /**
           * Update invoice to include this debit note
           * Add debit note to invoice's debit_notes array and update debit_amount
           */
          const invoice = await Invoice.findById(data.invoice_id).session(session);
          if (!invoice) throw new Error('Invoice not found! Could not create debit note!');

          // No validation needed - debit notes can always increase the invoice balance
          // Debit notes have a positive effect and should not be limited by current balance

          console.log('updating debit notes array on invoice model------------------------->');
          invoice.debit_notes.push(response._id);
          // NOTE: Do NOT update debit_amount here - it should only be updated when debit note is applied
          await invoice.save({ session });
        }
      } else {
        // Create debit note without transaction
        response = await DebitNote.create(data);

        if (response) {
          /**
           * Update invoice to include this debit note
           * Add debit note to invoice's debit_notes array and update debit_amount
           */
          const invoice = await Invoice.findById(data.invoice_id);
          if (!invoice) throw new Error('Invoice not found! Could not create debit note!');

          // No validation needed - debit notes can always increase the invoice balance
          // Debit notes have a positive effect and should not be limited by current balance

          console.log('updating debit notes array on invoice model------------------------->');
          invoice.debit_notes.push(response._id);
          // NOTE: Do NOT update debit_amount here - it should only be updated when debit note is applied
          await invoice.save();
        }
      }

      return response;
    } catch (error) {
      // Check if it's a duplicate key error
      if (error.code === 11000 && error.message.includes('debit_note_number')) {
        retryCount++;
        console.log(`Duplicate debit note number detected, retrying... (attempt ${retryCount})`);

        if (retryCount < maxRetries) {
          // Generate a new debit note number and retry
          data.debit_note_number = await generateDebitNoteNumber();
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
          continue;
        }
      }

      console.error('Error creating debit note:', error);
      throw new Error(error);
    }
  }

  throw new Error('Failed to create debit note after maximum retries');
};

/**
 * Creates a debit note and associated journal entry within a transaction
 * to ensure data consistency and atomicity.
 * @param {Object} body - The debit note data
 * @param {Array} journal_entry - Journal entry line items
 * @param {Array} taxItems - Tax items for the journal entry
 * @param {String} userID - ID of the user creating the debit note
 * @returns {Promise<Object>} The created journal entry
 */
const addDebitNote = async (body, journal_entry, taxItems, userID) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    const { total, sub_total, vat_total, debit_date, due_date, invoice_id } = body;

    // Validate invoice exists
    const invoiceToDebit = await Invoice.findById(invoice_id).session(session);
    if (!invoiceToDebit) throw new Error(`Invalid invoice id ${invoice_id}`);

    // No validation needed - debit notes can always increase the invoice balance
    // Debit notes have a positive effect and should not be limited by current balance

    // Set dates
    const dueDate = new Date(due_date);
    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Generate debit note number with transaction support
    const newDebitNoteId = await generateDebitNoteNumber();

    // Create debit note payload
    const payload = {
      ...body,
      debit_note_number: newDebitNoteId,
      status: body.is_preview_fallback ? 'Draft' : today > dueDate ? 'Overdue' : 'Unapproved',
      balance_due: total,
      invoice: invoice_id,
      created_by: userID,
      debit_date: new Date(),
      is_draft: body.is_preview_fallback ? true : false, // Draft if preview fallback, otherwise final debit note
    };

    // Create debit note within the transaction
    const debit = await createDebitNote(payload, session);

    console.log('created debit note===========>');

    // Prepare journal entries
    const updatedJournalEntry = journal_entry.map((obj) => ({
      ...obj,
      account: ObjectId(obj.account),
      customer: ObjectId(obj.customer),
    }));

    // Create journal entry payload
    const journal_payload = {
      line_items: updatedJournalEntry,
      sub_total,
      vat_total,
      total,
      journal_date: new Date(),
      isInvoiceRelated: true,
      invoice: invoice_id,
      debit_note: debit._id, // Add reference to debit note
      company: debit.company,
      tax_item: taxItems,
      document_id: debit.debit_note_number,
      document_customer: debit.customer_name,
      memo_description: `Debit Note for Invoice ${invoiceToDebit.invoice_number}`,
      created_by: userID,
    };

    // Generate journal entry within the transaction
    const je = await generateJournalEntry(journal_payload, session);
    console.log(je, '========> the generated JE');

    // Update invoice balance within the transaction
    const invoice = await Invoice.findById(invoice_id).session(session);
    if (!invoice) {
      throw new Error(`Invoice with id ${invoice_id} not found`);
    }

    // If debit_notes doesn't exist, initialize it as an empty array
    if (!invoice.debit_notes) {
      invoice.debit_notes = [];
    }

    // Update the fields
    console.log('pushing debit id to invoice--------<', debit._id);
    invoice.debit_notes.push(debit._id); // Add the debit note to the array
    invoice.markModified('debit_notes');

    // Save the updated document within the transaction
    const savedInvoice = await invoice.save({ session });
    console.log(
      'this is the saved invoice is',
      savedInvoice._id,
      'with debit notes',
      savedInvoice.debit_notes,
      'of length',
      savedInvoice.debit_notes.length
    );

    // Commit the transaction
    await session.commitTransaction();

    return je;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Error in addDebitNote transaction:', error);
    throw new Error(error);
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * Function to create Journal entry
 * @param {Object} data
 * @returns {Promise<Object>}
 * @throws Will throw an error if the journal entry creation fails.
 */

/**
 * Generates a journal entry with transaction support
 * @param {Object} data - Journal entry data
 * @param {Object} session - MongoDB session for transaction
 * @returns {Promise<Object>} The created journal entry
 */
const generateJournalEntry = async (data, session = null) => {
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

    // Use transaction if session is provided
    if (session) {
      return await journalEntryService.createJournalEntryWithSession(data, session);
    } else {
      return await journalEntryService.createJournalEntry(data);
    }
  } catch (error) {
    console.error('Error generating journal entry:', error);
    throw new Error(error);
  }
};

/**
 * Main entry point for generating debit notes with transaction support
 * @param {Object} reqBody - Request body containing debit note data
 * @returns {Promise<Object>} The created journal entry
 */
const generateDebitNote = async (reqBody) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // conditionally check applied balances from invoice
    const invoice_id = reqBody.invoice_id;
    const parentInvoice = await Invoice.findById(invoice_id).session(session);
    if (!parentInvoice) throw new Error(`Invalid invoice id ${invoice_id}`);

    // Extract currency information from the parent invoice for inheritance
    const inheritedCurrency = parentInvoice.currency || 'AED';
    const inheritedConversionRate = parentInvoice.conversion_rate || 1.0;
    const inheritedBaseCurrency = parentInvoice.base_currency || 'AED';

    // Calculate converted amount to AED for reporting
    const totalAmount = reqBody.total || 0;
    const convertedAmountAED = totalAmount * inheritedConversionRate;

    // Add currency fields to the request body for debit note creation
    reqBody.currency = inheritedCurrency;
    reqBody.conversion_rate = inheritedConversionRate;
    reqBody.base_currency = inheritedBaseCurrency;
    reqBody.converted_amount_aed = convertedAmountAED;
    /**
     * ===============================================================================================================
     * Conditionally check if debit note balances are applicable to the invoice
     * Sum up all total from valid debit notes and compare with total from body
     * ===============================================================================================================
     */
    const validStatuses = ['Draft', 'Unapproved', 'Approved', 'Applied'];
    const totalDebitNotAmount = parentInvoice.debit_notes
      .filter((dn) => validStatuses.includes(dn.status)) // Filter by valid statuses
      .reduce((sum, dn) => sum + (dn.total || 0), 0);
    console.log(totalDebitNotAmount, '=======> total');
    // No validation needed - debit notes can always increase the invoice balance
    // Debit notes have a positive effect and should not be limited by current balance
    //End of Check ==============================================================================================
    var validJournal = false;
    const body = reqBody;
    const journal_entry = [];

    // Get accounts receivable account (for customer)
    const arResult = await chartOfAccountsService.getChartOfAccountByCode(
      { customer: ObjectId(reqBody.customer) },
      reqBody,
      reqBody.customer
    );
    body.company = arResult.company;

    // Setup proper journal entries for debit note
    // 1. Credit Sales (to increase revenue)
    const salesEntry = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, reqBody, reqBody.customer);
    journal_entry.push({
      ...salesEntry,
      isDebit: false,
      isCredit: true,
      amount: reqBody.sub_total,
    });

    // 2. Credit VAT Payable (to increase tax liability)
    if (reqBody.vat_total > 0) {
      const vatEntry = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, reqBody, reqBody.customer);
      journal_entry.push({
        ...vatEntry,
        isDebit: false,
        isCredit: true,
        amount: reqBody.vat_total,
      });
    }

    // 3. Debit Accounts Receivable (to increase customer balance)
    journal_entry.push({
      ...arResult,
      isDebit: true,
      isCredit: false,
      amount: reqBody.total,
    });

    // Process tax items
    let taxItems = [];
    const mapItems = reqBody.items.map((obj) => {
      if (obj.tax_name && obj.tax_code) {
        let dataItems = {
          name: `VAT on Debit Note ${obj.tax_name}`,
          account_name: `VAT Payable`,
          account: journal_entry.find((je) => je.code === 'VP') && journal_entry.find((je) => je.code === 'VP').account,
          isDebit: false,
          isCredit: true,
          isInvoiceRelated: true,
          taxName: obj.tax_name,
          taxCode: obj.tax_code,
          totalAmount: obj.net_total,
          netAmount: obj.amount,
          taxAmount: obj.vat_amount,
          customer: reqBody.customer,
          city: obj.city,
        };
        taxItems.push(dataItems);
      }
    });

    // Validate journal entries balance
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
      console.error(
        `Debit Note Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`
      );
      await session.abortTransaction();
      return {
        success: false,
        message: `Invalid Journal Entry: Debits=${debitsTotal.toFixed(2)}, Credits=${creditsTotal.toFixed(
          2
        )}, Difference=${difference.toFixed(2)}`,
      };
    }

    if (validJournal || reqBody.is_preview_fallback) {
      // For preview fallback, skip journal entries and create simple debit note
      if (reqBody.is_preview_fallback) {
        console.log('Preview fallback: Checking for existing draft before creating new one');

        // First check if there's already a draft debit note for this invoice (same logic as setupDebitNotePreview)
        const existingDraft = await DebitNote.findOne({
          invoice: typeof invoice_id === 'string' ? ObjectId(invoice_id) : invoice_id,
          status: 'Draft',
          is_draft: true,
          is_deleted: { $ne: true },
        }).session(session);

        if (existingDraft) {
          console.log(
            'Found existing draft debit note for invoice, returning it instead of creating new one:',
            existingDraft._id
          );
          // Update the existing draft with any new data provided
          if (body.debit_note_number && body.debit_note_number !== existingDraft.debit_note_number) {
            existingDraft.debit_note_number = body.debit_note_number;
            await existingDraft.save({ session });
          }
          await session.commitTransaction();
          return existingDraft;
        }

        console.log('No existing draft found, creating new draft debit note');
        const debitNoteData = {
          ...body,
          debit_note_number: await generateDebitNoteNumber(),
          status: 'Draft',
          balance_due: body.total || 0,
          invoice: invoice_id,
          created_by: reqBody.userId,
          debit_date: new Date(),
          is_draft: true,
        };

        const debitNote = await createDebitNote(debitNoteData, session);

        // Commit the transaction
        await session.commitTransaction();
        return debitNote; // Return debit note directly, not journal entry
      } else {
        // Normal flow: Pass the session to addDebitNote to maintain transaction context
        const data = await addDebitNote(body, journal_entry, taxItems, reqBody.userId);

        // Commit the transaction
        await session.commitTransaction();
        return data;
      }
    }
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Error in generateDebitNote transaction:', error);
    throw new Error(error);
  } finally {
    // End the session
    session.endSession();
  }
};

/**
 * Applies a debit note to increase a customer's balance, links it to an invoice,
 * and creates a journal entry to record the transaction.
 *
 * @param {string} debitNoteId - The ID of the debit note to apply.
 * @param {number} amountToApply - The amount of debit to apply.
 * @param {string} customerId - The ID of the customer to whom the debit is being applied.
 * @param {string} invoiceId - The ID of the invoice to which the debit is being applied.
 * @returns {Promise<Object>} The updated debit note object.
 * @throws {Error} Will throw an error if the applied amount exceeds the available debit
 * or if any operation in the process fails.
 *
 * @description
 * This function performs the following steps:
 * 1. Retrieves the debit note by its ID and validates that the applied amount does not exceed the available debit.
 * 2. Updates the debit note balance to reflect the applied amount.
 * 3. Creates a journal entry with appropriate debit and credit accounts:
 *    - Accounts Receivable (Credit): Increases the customer's outstanding balance.
 *    - Debit Note Liability (Debit): Reduces the debit note liability.
 * 4. Links the journal entry to the debit note and invoice for traceability.
 * 5. Saves the updated debit note and journal entry to the database.
 */
const applyDebitNote = async (reqBody, userId, userName) => {
  try {
    const { debitNoteId, amountToApply, invoiceId, applicationDate, notes } = reqBody;

    const debitNote = await DebitNote.findById(debitNoteId);
    const invoice = await Invoice.findById(invoiceId);

    if (!debitNote || !invoice) {
      throw new Error('Invalid debit note or invoice ID');
    }

    if (debitNote.status !== 'Approved') {
      throw new Error(`Debit note must be approved before it can be applied (Status: ${debitNote.status})`);
    }

    if (amountToApply > debitNote.debit_balance) {
      throw new Error(`Amount to apply (${amountToApply}) exceeds available debit balance (${debitNote.debit_balance})`);
    }

    // No validation needed for invoice balance_due - debit notes have a positive effect
    // Debit notes can always increase the invoice balance, unlike credit notes which reduce it

    // Pre-validate to avoid pre-save hook issues
    const newDebitAmount = invoice.debit_amount + amountToApply;
    const newBalanceDue = invoice.balance_due + amountToApply;

    const vatPortion = debitNote.vat_total ? amountToApply * (debitNote.vat_total / debitNote.total) : 0;
    const subtotalPortion = amountToApply - vatPortion;

    // Store original values for logging
    const originalDebitNoteAppliedAmount = debitNote.applied_amount;
    const originalInvoiceBalanceDue = invoice.balance_due;
    const originalInvoiceDebitAmount = invoice.debit_amount;

    debitNote.applied_amount += amountToApply;
    debitNote.date_applied = applicationDate ? new Date(applicationDate) : new Date();
    debitNote.application_date = applicationDate ? new Date(applicationDate) : new Date();
    debitNote.original_invoice_balance = originalInvoiceBalanceDue;

    // Save notes if provided
    if (notes && notes.trim()) {
      debitNote.application_notes = notes.trim();
    }

    if (debitNote.applied_amount >= debitNote.debit_amount) {
      debitNote.status = 'Applied';
    }

    // Update invoice balance due and debit applied amount
    // IMPORTANT: Update balance_due first to avoid pre-save hook validation issues
    invoice.balance_due += amountToApply;
    invoice.debit_amount += amountToApply;
    invoice.debit_applied = true;

    const journal_entry = [
      // Debit AR (increase customer's receivable)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, { customer: debitNote.customer }),
        amount: amountToApply,
        isDebit: true,
        customer: debitNote.customer,
      },
      // Credit Sales (offset the original debit note entry)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, { customer: debitNote.customer }),
        amount: subtotalPortion,
        isCredit: true,
        customer: debitNote.customer,
      },
    ];

    // Add VAT entry if applicable
    if (vatPortion > 0) {
      journal_entry.push({
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, { customer: debitNote.customer }),
        amount: vatPortion,
        isCredit: true,
        customer: debitNote.customer,
      });
    }

    const journal_payload = {
      line_items: journal_entry,
      total: amountToApply,
      sub_total: subtotalPortion,
      vat_total: vatPortion,
      journal_date: new Date(),
      isInvoiceRelated: true,
      debit_note: debitNoteId,
      invoice: invoiceId,
      company: debitNote.company,
      document_id: `DNA-${debitNoteId}`,
      document_customer: debitNote.customer_name,
      memo_description: `Applied ${amountToApply} from Debit Note ${debitNote.debit_note_number} to Invoice ${invoice.invoice_number}`,
      created_by: userId,
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save debit note and invoice within transaction
      await debitNote.save({ session });
      await invoice.save({ session });

      // Create journal entry within the same transaction
      const journalEntry = await generateJournalEntry(journal_payload, session);

      // Commit the transaction only if all operations succeed
      await session.commitTransaction();

      // Create invoice log for the debit note application
      const invoiceLogService = require('./invoice_logs.service');
      const logData = {
        user_id: userId,
        document_id: invoiceId,
        module: 'debit_note_application',
        dataBeforeUpdationOrCreation: {
          invoice_balance_due: originalInvoiceBalanceDue,
          invoice_debit_amount: originalInvoiceDebitAmount,
          debit_note_applied_amount: originalDebitNoteAppliedAmount,
          debit_note_status: debitNote.status === 'Applied' ? 'Approved' : debitNote.status,
        },
        createdOrUpdateData: {
          invoice_balance_due: invoice.balance_due,
          invoice_debit_amount: invoice.debit_amount,
          debit_note_applied_amount: debitNote.applied_amount,
          debit_note_status: debitNote.status,
          amount_applied: amountToApply,
          application_date: debitNote.date_applied,
          application_notes: notes || null,
        },
        updatedFields: {
          invoice: ['balance_due', 'debit_amount'],
          debit_note: ['applied_amount', 'date_applied', 'status', 'application_notes'],
        },
        logMessage: `${userName} applied debit note ${
          debitNote.debit_note_number
        } for amount AED ${amountToApply} to invoice ${invoice.invoice_number}${notes ? ` with notes: "${notes}"` : ''}`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      await invoiceLogService.createInvoiceLog(logData);

      return {
        debitNote,
        invoice,
        journalEntry,
      };
    } catch (error) {
      console.error('Error in applyDebitNote transaction:', error);
      await session.abortTransaction();
      throw new Error(`Failed to apply debit note: ${error.message}`);
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error(`Failed to apply debit note: ${error.message}`);
  }
};

/**
 * ================================================================================================================================
 * Function to unapply/reverse a debit note application
 * This function reverses the application of a debit note with full transaction support
 * ================================================================================================================================
 */
const unapplyDebitNote = async (reqBody, userId, userName) => {
  try {
    const { debitNoteId, invoiceId, reversalReason } = reqBody;

    const debitNote = await DebitNote.findById(debitNoteId);
    const invoice = await Invoice.findById(invoiceId);

    if (!debitNote || !invoice) {
      throw new Error('Invalid debit note or invoice ID');
    }

    if (debitNote.status !== 'Applied') {
      throw new Error(`Debit note must be applied before it can be unapplied (Status: ${debitNote.status})`);
    }

    if (debitNote.applied_amount <= 0) {
      throw new Error('No applied amount to reverse');
    }

    // Validate that the debit note belongs to the specified invoice
    if (debitNote.invoice.toString() !== invoiceId) {
      throw new Error('Debit note does not belong to the specified invoice');
    }

    // Validate that the invoice has sufficient debit amount to reverse
    if (invoice.debit_amount < debitNote.applied_amount) {
      throw new Error(
        `Invoice debit amount (${invoice.debit_amount}) is less than the debit note applied amount (${debitNote.applied_amount})`
      );
    }

    // Store original values for logging
    const originalDebitNoteAppliedAmount = debitNote.applied_amount;
    const originalInvoiceBalanceDue = invoice.balance_due;
    const originalInvoiceDebitAmount = invoice.debit_amount;
    const originalDebitNoteStatus = debitNote.status;

    // Calculate the amount to reverse (full applied amount)
    const amountToReverse = debitNote.applied_amount;
    const vatPortion = debitNote.vat_total ? amountToReverse * (debitNote.vat_total / debitNote.total) : 0;
    const subtotalPortion = amountToReverse - vatPortion;

    // Validate that reversal won't create negative balance
    const newBalanceDue = invoice.balance_due - amountToReverse;
    if (newBalanceDue < 0) {
      throw new Error(
        `Reversing this debit note would create a negative balance. Current balance: ${invoice.balance_due}, Amount to reverse: ${amountToReverse}`
      );
    }

    // Reverse the debit note application
    debitNote.applied_amount = 0;
    debitNote.date_applied = null;
    debitNote.application_date = null;
    debitNote.original_invoice_balance = 0;
    debitNote.status = 'Approved';
    debitNote.reversal_notes = reversalReason || null;
    debitNote.reversed_by = userId;
    debitNote.reversed_at = new Date();

    // Reverse invoice changes
    invoice.balance_due -= amountToReverse;
    invoice.debit_amount -= amountToReverse;

    // If debit_amount becomes 0, remove debit_applied flag
    if (invoice.debit_amount <= 0) {
      invoice.debit_applied = false;
    }

    // Create reverse journal entry
    const reverseJournalEntry = [
      // Credit AR (decrease customer's receivable back)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, { customer: debitNote.customer }),
        amount: amountToReverse,
        isCredit: true,
        customer: debitNote.customer,
      },
      // Debit Sales (reverse the original debit note entry)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, { customer: debitNote.customer }),
        amount: subtotalPortion,
        isDebit: true,
        customer: debitNote.customer,
      },
    ];

    // Add reverse VAT entry if applicable
    if (vatPortion > 0) {
      reverseJournalEntry.push({
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, { customer: debitNote.customer }),
        amount: vatPortion,
        isDebit: true,
        customer: debitNote.customer,
      });
    }

    const reverseJournalPayload = {
      line_items: reverseJournalEntry,
      total: amountToReverse,
      sub_total: subtotalPortion,
      vat_total: vatPortion,
      journal_date: new Date(),
      isInvoiceRelated: true,
      debit_note: debitNoteId,
      invoice: invoiceId,
      company: debitNote.company,
      document_id: `DNR-${debitNoteId}`,
      document_customer: debitNote.customer_name,
      memo_description: `Reversed application of ${amountToReverse} from Debit Note ${
        debitNote.debit_note_number
      } to Invoice ${invoice.invoice_number}${reversalReason ? ` - Reason: ${reversalReason}` : ''}`,
      created_by: userId,
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create journal entry first to ensure it's valid before modifying main documents
      let reverseJournalEntryResult;
      try {
        reverseJournalEntryResult = await generateJournalEntry(reverseJournalPayload, session);
      } catch (journalError) {
        throw new Error(`Failed to create reverse journal entry: ${journalError.message}`);
      }

      // Only save main documents after journal entry is successfully created
      await debitNote.save({ session });
      await invoice.save({ session });

      await session.commitTransaction();

      // Create invoice log for the debit note reversal
      const invoiceLogService = require('./invoice_logs.service');
      const logData = {
        user_id: userId,
        document_id: invoiceId,
        module: 'debit_note_reversal',
        dataBeforeUpdationOrCreation: {
          invoice_balance_due: originalInvoiceBalanceDue,
          invoice_debit_amount: originalInvoiceDebitAmount,
          debit_note_applied_amount: originalDebitNoteAppliedAmount,
          debit_note_status: originalDebitNoteStatus,
        },
        createdOrUpdateData: {
          invoice_balance_due: invoice.balance_due,
          invoice_debit_amount: invoice.debit_amount,
          debit_note_applied_amount: debitNote.applied_amount,
          debit_note_status: debitNote.status,
          amount_reversed: amountToReverse,
          reversal_date: debitNote.reversed_at,
          reversal_reason: reversalReason || null,
          reversed_by: userId,
        },
        updatedFields: {
          invoice: ['balance_due', 'debit_amount', 'debit_applied'],
          debit_note: ['applied_amount', 'date_applied', 'status', 'reversal_notes', 'reversed_by', 'reversed_at'],
        },
        logMessage: `${userName} reversed debit note ${
          debitNote.debit_note_number
        } application for amount AED ${amountToReverse} from invoice ${invoice.invoice_number}${
          reversalReason ? ` - Reason: ${reversalReason}` : ''
        }`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      await invoiceLogService.createInvoiceLog(logData);

      return {
        debitNote,
        invoice,
        reverseJournalEntry: reverseJournalEntryResult,
        amountReversed: amountToReverse,
      };
    } catch (error) {
      console.error('Error in unapplyDebitNote transaction:', error);
      await session.abortTransaction();
      throw new Error(`Failed to unapply debit note: ${error.message}`);
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error('Error when unapplying debit note: ' + error.message);
  }
};

/**
 * Gets draft debit note by invoice ID
 * @param {String} invoiceId - The invoice ID to find draft debit notes for
 * @returns {Promise<Object|null>} The draft debit note or null if not found
 */
const getDraftDebitNoteByInvoiceId = async (invoiceId) => {
  try {
    const debitNotes = await DebitNote.find({
      invoice: typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId,
      is_draft: true,
      status: 'Draft',
    });

    if (!debitNotes.length) {
      return null;
    }

    // Return the first draft debit note found
    return debitNotes[0];
  } catch (error) {
    console.error('Error finding draft debit note by invoice ID:', error);
    throw new Error('Error when finding draft debit note: ' + error.message);
  }
};

/**
 * Checks if a debit note already exists for the given company and invoice
 * @param {string} companyId - The company ID
 * @param {string} invoiceId - The invoice ID
 * @returns {Promise<Object>} Object with exists boolean and debit note if found
 */
const checkExistingDebitNote = async (companyId, invoiceId) => {
  try {
    const existingDebitNote = await DebitNote.findOne({
      company: ObjectId(companyId),
      invoice: ObjectId(invoiceId),
      status: { $nin: ['Void', 'Applied'] }, // Don't count voided or applied debit notes
    });

    return {
      exists: !!existingDebitNote,
      debitNote: existingDebitNote,
    };
  } catch (error) {
    console.error('Error checking existing debit note:', error);
    throw error;
  }
};

/**
 * Voids a debit note
 * @param {string} debitNoteId - The debit note ID to void
 * @param {string} voidReason - The reason for voiding
 * @param {string} userId - The user ID who is voiding
 * @returns {Promise<Object>} The voided debit note
 */
const voidDebitNote = async (debitNoteId, voidReason, userId) => {
  try {
    const debitNote = await DebitNote.findById(debitNoteId);
    if (!debitNote) {
      throw new Error('Debit note not found');
    }

    // Check if debit note can be voided
    if (debitNote.status === 'Approved' || debitNote.status === 'Applied') {
      throw new Error('Cannot void an approved or applied debit note');
    }

    // Update debit note status and add void information
    const updatedDebitNote = await DebitNote.findByIdAndUpdate(
      debitNoteId,
      {
        status: 'Void',
        void_reason: voidReason,
        voided_by: userId,
        voided_at: new Date(),
        debit_note_number: `VOID-${debitNote.debit_note_number}`, // Add VOID prefix
      },
      { new: true }
    );

    return updatedDebitNote;
  } catch (error) {
    console.error('Error voiding debit note:', error);
    throw error;
  }
};

/**
 * Gets available debit notes by invoice ID
 * @param {Object} reqBody - Request body containing invoice ID
 * @param {Object} reqQuery - Query parameters
 * @returns {Promise<Object>} Available debit notes for the invoice
 */
const getAvailableDebitNotesByInvoiceId = async (reqBody, reqQuery) => {
  try {
    let search = reqQuery.search ? reqQuery.search.trim() : '';
    let filter = {
      is_deleted: false,
      invoice: ObjectId(reqBody.invoiceId),
      status: { $in: ['Draft', 'Unapproved', 'Approved', 'Applied'] },
    };
    let options = {
      limit: reqQuery.limit,
      page: reqQuery.page,
      sortBy: reqQuery.sortBy,
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
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
        },
      },
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceDetails',
        },
      },
      { $unwind: { path: '$invoiceDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          // If original_invoice_balance is not set, calculate it from current balance - applied amount
          original_invoice_balance: {
            $cond: {
              if: { $gt: ['$original_invoice_balance', 0] },
              then: '$original_invoice_balance',
              else: {
                $subtract: ['$invoiceDetails.balance_due', '$applied_amount'],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          debit_note_number: 1,
          createdAt: 1,
          updatedAt: 1,
          memo: 1,
          status: 1,
          items: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          terms_name: 1,
          debit_date: 1,
          due_date: 1,
          debit_amount: 1,
          applied_amount: 1,
          debit_balance: 1,
          original_invoice_balance: 1,
          application_date: 1,
          customer_name: '$companyDetails.company_name',
          customer_email: '$companyDetails.email',
          customer_phone: '$companyDetails.phone',
          customer_address: '$companyDetails.address',
          invoice_number: '$invoiceDetails.invoice_number',
          current_invoice_balance: '$invoiceDetails.balance_due',
          void_reason: {
            $cond: {
              if: { $eq: ['$status', 'void'] },
              then: '$void_reason', // Use the void_reason field from the document
              else: null,
            },
          },
        },
      },
    ];
    if (search.length > 0) {
      filter.$or = [{ debit_note_number: { $regex: search, $options: 'i' } }, { memo: { $regex: search, $options: 'i' } }];
    }
    if (reqBody.selected_company_id) {
      reqBody.isDebitFilter = true;
      body.unshift(...queryService(reqBody));
    }
    const response = await DebitNote.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  getDebitNotePdfPreview,
  getDebitNotePreview,
  getAllDebitNotes,
  findDebitNoteById,
  updateDebitNote,
  deleteDebitNote,
  filterDebitNotesByStatus,
  getDebitNoteStats,
  approveDebitNote,
  generateDebitNoteNumber,
  setupDebitNotePreview,
  createDebitNote,
  addDebitNote,
  generateDebitNote,
  applyDebitNote,
  unapplyDebitNote,
  getDraftDebitNoteByInvoiceId,
  checkExistingDebitNote,
  voidDebitNote,
  getAvailableDebitNotesByInvoiceId,
};
