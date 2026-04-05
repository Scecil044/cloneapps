const { CreditNote, Invoice, DocumentTemplate, JournalEntry, Companies, Users } = require('../models');
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
 * Generates a unique credit note number using MongoDB transactions to ensure uniqueness
 * during concurrent requests. Adds a timestamp component for additional uniqueness.
 * @returns {Promise<string>} The generated credit note number
 */
const generateCreditNoteNumber = async () => {
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
      const sequenceKey = `creditNote-${year}`;

      // Use findOneAndUpdate with upsert to atomically increment the sequence
      const sequenceDoc = await CreditNote.db.collection('counters').findOneAndUpdate(
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

      // Format the credit note number with the credit note number with the sequence and milliseconds for uniqueness
      const creditNoteNumber = `CN-${year}-${String(sequence).padStart(5, '0')}-${milliseconds}`;

      // Check if this credit note number already exists
      const existingCreditNote = await CreditNote.findOne({ credit_note_number: creditNoteNumber }).session(session);
      if (existingCreditNote) {
        await session.abortTransaction();
        retryCount++;
        console.log(`Credit note number ${creditNoteNumber} already exists, retrying... (attempt ${retryCount})`);
        await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
        continue;
      }

      await session.commitTransaction();
      return creditNoteNumber;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error generating credit note number:', error);
      retryCount++;
      if (retryCount >= maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
    } finally {
      session.endSession();
    }
  }

  throw new Error('Failed to generate unique credit note number after maximum retries');
};

const setupCreditNotePreview = async (data) => {
  const maxRetries = 3;
  let retryCount = 0;

  console.log('🔍 [setupCreditNotePreview] Received data:', JSON.stringify(data, null, 2));
  console.log('🔍 [setupCreditNotePreview] data.invoice_id:', data.invoice_id, 'type:', typeof data.invoice_id);
  console.log('🔍 [setupCreditNotePreview] data.invoice:', data.invoice, 'type:', typeof data.invoice);

  // Determine credit note type (default to 'standard' for backward compatibility)
  const creditNoteType = data.type || 'standard';
  console.log('🔍 [setupCreditNotePreview] creditNoteType:', creditNoteType);

  // Extract invoiceId, treating empty strings as falsy
  const invoiceId = (data.invoice_id && data.invoice_id !== '')
    ? data.invoice_id
    : (data.invoice && data.invoice !== '')
      ? data.invoice
      : null;

  console.log('🔍 [setupCreditNotePreview] Extracted invoiceId:', invoiceId, 'type:', typeof invoiceId);

  // For standard credit notes, check by invoice
  // For custom credit notes, check by company and invoice (if provided)
  if (creditNoteType === 'standard' && invoiceId) {
    const existingDraft = await CreditNote.findOne({
      invoice: typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId,
      status: 'Draft',
      is_draft: true,
      is_deleted: { $ne: true },
      type: 'standard', // Match standard type
    });

    if (existingDraft) {
      console.log(
        'Found existing draft credit note for invoice, returning it instead of creating new one:',
        existingDraft._id
      );
      // Update the existing draft with any new data provided
      if (data.credit_note_number && data.credit_note_number !== existingDraft.credit_note_number) {
        existingDraft.credit_note_number = data.credit_note_number;
        await existingDraft.save();
      }
      return existingDraft;
    }
  }

  // For custom credit notes, check by company and invoice_id (if provided)
  if (creditNoteType === 'custom' && data.company) {
    const query = {
      company: typeof data.company === 'string' ? ObjectId(data.company) : data.company,
      status: 'Draft',
      is_draft: true,
      is_deleted: { $ne: true },
      type: 'custom', // Match custom type
    };

    // If invoice_id is provided for custom credit note, include it in the query
    if (invoiceId) {
      query.invoice = typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId;
    } else {
      // If no invoice_id, check for credit notes without invoice (don't use empty string - Mongoose will try to cast it)
      query.$or = [{ invoice: { $exists: false } }, { invoice: null }];
    }

    const existingDraft = await CreditNote.findOne(query);

    if (existingDraft) {
      console.log(
        'Found existing draft custom credit note, returning it instead of creating new one:',
        existingDraft._id
      );
      return existingDraft;
    }
  }

  // Also check by company if no invoice is specified (for backward compatibility with general credit notes)
  if (!invoiceId && data.company && creditNoteType === 'standard') {
    const existingDraft = await CreditNote.findOne({
      company: typeof data.company === 'string' ? ObjectId(data.company) : data.company,
      status: 'Draft',
      is_draft: true,
      is_deleted: { $ne: true },
      type: 'standard',
      $or: [{ invoice: { $exists: false } }, { invoice: null }],
    });

    if (existingDraft) {
      console.log(
        'Found existing draft credit note for company, returning it instead of creating new one:',
        existingDraft._id
      );
      return existingDraft;
    }
  }

  while (retryCount < maxRetries) {
    try {
      // Clean up the incoming data - remove empty strings for invoice fields
      const cleanedData = { ...data };

      console.log('🔍 [setupCreditNotePreview] Before cleaning - cleanedData.invoice_id:', cleanedData.invoice_id, 'cleanedData.invoice:', cleanedData.invoice);

      // Remove invoice_id and invoice if they are empty strings
      if (cleanedData.invoice_id === '' || !cleanedData.invoice_id) {
        console.log('🔍 [setupCreditNotePreview] Removing invoice_id (empty or falsy)');
        delete cleanedData.invoice_id;
      }
      if (cleanedData.invoice === '' || !cleanedData.invoice) {
        console.log('🔍 [setupCreditNotePreview] Removing invoice (empty or falsy)');
        delete cleanedData.invoice;
      }

      console.log('🔍 [setupCreditNotePreview] After cleaning - cleanedData.invoice_id:', cleanedData.invoice_id, 'cleanedData.invoice:', cleanedData.invoice);

      // Create a temporary credit note for preview purposes
      const creditNoteData = {
        ...cleanedData,
        is_draft: true,
        status: 'Draft', // Set to Draft for preview
        type: creditNoteType, // Ensure type is set
        // Ensure all required fields are present
        due_date: cleanedData.due_date || new Date(),
        credit_date: cleanedData.credit_date || new Date(),
        terms: cleanedData.terms || '',
        terms_name: cleanedData.terms_name || '',
        email: cleanedData.email || '',
        company: cleanedData.company || cleanedData.customer || '', // Use customer if company not provided
      };

      console.log('🔍 [setupCreditNotePreview] creditNoteData before invoice handling:', JSON.stringify(creditNoteData, null, 2));
      console.log('🔍 [setupCreditNotePreview] creditNoteData.invoice before handling:', creditNoteData.invoice);

      // Handle invoice field based on type
      if (creditNoteType === 'standard') {
        // For standard, invoice is required - use invoiceId if available
        if (invoiceId) {
          console.log('🔍 [setupCreditNotePreview] Setting invoice for standard type:', invoiceId);
          creditNoteData.invoice = invoiceId;
        } else {
          console.log('🔍 [setupCreditNotePreview] No invoiceId for standard type - will let validation handle it');
          // If no invoiceId for standard type, this is an error, but we'll let validation handle it
          // Don't set invoice field at all to let validation catch it
        }
      } else {
        // For custom type, invoice is optional - only set if invoiceId exists
        if (invoiceId) {
          console.log('🔍 [setupCreditNotePreview] Setting invoice for custom type:', invoiceId);
          creditNoteData.invoice = invoiceId;
        } else {
          console.log('🔍 [setupCreditNotePreview] No invoiceId for custom type - removing invoice field completely');
        }
        // If no invoiceId, don't set invoice field at all (already deleted from cleanedData)
        // Explicitly ensure invoice is not in the object if it's empty
        if (!invoiceId && creditNoteData.invoice !== undefined) {
          console.log('🔍 [setupCreditNotePreview] Explicitly deleting invoice field from creditNoteData');
          delete creditNoteData.invoice;
        }
      }

      console.log('🔍 [setupCreditNotePreview] creditNoteData after invoice handling:', JSON.stringify(creditNoteData, null, 2));
      console.log('🔍 [setupCreditNotePreview] creditNoteData.invoice after handling:', creditNoteData.invoice);

      // Remove _id if it exists to create a new document
      delete creditNoteData._id;

      // Final check - ensure invoice field is completely removed if it's empty string or null
      if (creditNoteData.invoice === '' || creditNoteData.invoice === null || creditNoteData.invoice === undefined) {
        console.log('🔍 [setupCreditNotePreview] Final cleanup - removing invoice field (empty/null/undefined)');
        delete creditNoteData.invoice;
      }

      console.log('🔍 [setupCreditNotePreview] Final creditNoteData before create:', JSON.stringify(creditNoteData, null, 2));
      console.log('🔍 [setupCreditNotePreview] Final creditNoteData.invoice:', creditNoteData.invoice);

      // If credit_note_number is provided and might cause duplicates, generate a new one
      if (creditNoteData.credit_note_number) {
        // Check if this credit note number already exists
        const existingCreditNote = await CreditNote.findOne({ credit_note_number: creditNoteData.credit_note_number });
        if (existingCreditNote) {
          console.log(`Credit note number ${creditNoteData.credit_note_number} already exists, generating new one...`);
          creditNoteData.credit_note_number = await generateCreditNoteNumber();
        }
      } else {
        // Generate a new credit note number if none provided
        creditNoteData.credit_note_number = await generateCreditNoteNumber();
      }

      // Double-check for existing draft before creating (race condition protection)
      const finalCheckQuery = {
        status: 'Draft',
        is_draft: true,
        is_deleted: { $ne: true },
        type: creditNoteType, // Match the type
      };

      if (creditNoteType === 'standard' && invoiceId) {
        finalCheckQuery.invoice = typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId;
      } else if (creditNoteType === 'custom') {
        // For custom, check by company and optionally invoice_id
        if (data.company) {
          finalCheckQuery.company = typeof data.company === 'string' ? ObjectId(data.company) : data.company;
        }
        if (invoiceId) {
          finalCheckQuery.invoice = typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId;
        } else {
          // Don't use empty string in query - Mongoose will try to cast it to ObjectId
          finalCheckQuery.$or = [{ invoice: { $exists: false } }, { invoice: null }];
        }
      }

      const finalCheck = await CreditNote.findOne(finalCheckQuery);

      if (finalCheck) {
        console.log('Found existing draft during final check, returning it instead of creating new one:', finalCheck._id);
        return finalCheck;
      }

      console.log('🔍 [setupCreditNotePreview] About to create CreditNote with data:', JSON.stringify(creditNoteData, null, 2));
      console.log('🔍 [setupCreditNotePreview] creditNoteData.invoice just before create:', creditNoteData.invoice);

      const creditNote = await CreditNote.create(creditNoteData);
      console.log('✅ [setupCreditNotePreview] Created new draft credit note:', creditNote._id, 'for invoice:', invoiceId);
      return creditNote;
    } catch (error) {
      // Check if it's a duplicate key error
      if (error.code === 11000 && error.message.includes('credit_note_number')) {
        retryCount++;
        console.log(`Duplicate credit note number detected in setup preview, retrying... (attempt ${retryCount})`);

        if (retryCount < maxRetries) {
          // Generate a new credit note number and retry
          data.credit_note_number = await generateCreditNoteNumber();
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
          continue;
        }
      }

      console.error('Error setting up credit note preview:', error);
      throw error;
    }
  }

  throw new Error('Failed to setup credit note preview after maximum retries');
};

/**
 * Approves a credit note by updating its status to 'Approved'
 * @param {String} creditNoteId - The credit note ID to approve
 * @param {String} userId - The user ID who is approving
 * @returns {Promise<Object>} The updated credit note
 */
const approveCreditNote = async (creditNoteId, userId) => {
  try {
    const creditNote = await CreditNote.findById(creditNoteId);
    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    if (creditNote.status === 'Approved') {
      throw new Error('Credit note is already approved');
    }

    if (creditNote.status !== 'Unapproved') {
      throw new Error('Only unapproved credit notes can be approved');
    }

    // Update the credit note status
    creditNote.status = 'Approved';
    creditNote.approved_by = userId;
    creditNote.approved_at = new Date();

    await creditNote.save();

    console.log(`Credit note ${creditNote.credit_note_number} approved by user ${userId}`);
    return creditNote;
  } catch (error) {
    console.error('Error approving credit note:', error);
    throw error;
  }
};

/**
 * Creates a new credit note.
 * @param {Object} data - The data for the new credit note.
 * @returns {Promise<Object>} The created credit note object.
 * @throws Will throw an error if the credit note creation fails.
 */

/**
 * Creates a new credit note with transaction support.
 * @param {Object} data - The data for the new credit note.
 * @param {Object} session - Optional MongoDB session for transaction support.
 * @returns {Promise<Object>} The created credit note object.
 * @throws Will throw an error if the credit note creation fails.
 */
const createCreditNote = async (data, session = null) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { _id, ...creditBody } = data;
      let response;

      // Determine credit note type (default to 'standard' for backward compatibility)
      const creditNoteType = data.type || 'standard';

      // Validation: For standard credit notes, total must be positive
      // For custom credit notes, negative values are allowed (adjustments)
      if (creditNoteType === 'standard' && data.total <= 0) {
        throw new Error(`Standard credit note amount must be greater than zero: ${data.total}`);
      }

      if (session) {
        // Create credit note within an existing transaction
        response = await CreditNote.create([creditBody], { session }).then((docs) => docs[0]);

        if (response && creditNoteType === 'standard') {
          /**
           * Update invoice to include this credit note (only for standard credit notes)
           * Add credit note to invoice's credit_notes array and update credit_amount
           */
          const invoiceId = data.invoice_id || data.invoice;
          if (invoiceId) {
            const invoice = await Invoice.findById(invoiceId).session(session);
            if (!invoice) throw new Error('Invoice not found! Could not create credit note!');

            console.log('updating credit notes array on invoice model------------------------->');
            if (!invoice.credit_notes) {
              invoice.credit_notes = [];
            }
            invoice.credit_notes.push(response._id);
            // NOTE: Do NOT update credit_amount here - it should only be updated when credit note is applied
            await invoice.save({ session });
          }
        }
      } else {
        // Create credit note without transaction
        response = await CreditNote.create(data);

        if (response && creditNoteType === 'standard') {
          /**
           * Update invoice to include this credit note (only for standard credit notes)
           * Add credit note to invoice's credit_notes array and update credit_amount
           */
          const invoiceId = data.invoice_id || data.invoice;
          if (invoiceId) {
            const invoice = await Invoice.findById(invoiceId);
            if (!invoice) throw new Error('Invoice not found! Could not create credit note!');

            console.log('updating credit notes array on invoice model------------------------->');
            if (!invoice.credit_notes) {
              invoice.credit_notes = [];
            }
            invoice.credit_notes.push(response._id);
            // NOTE: Do NOT update credit_amount here - it should only be updated when credit note is applied
            await invoice.save();
          }
        }
      }

      return response;
    } catch (error) {
      // Check if it's a duplicate key error
      if (error.code === 11000 && error.message.includes('credit_note_number')) {
        retryCount++;
        console.log(`Duplicate credit note number detected, retrying... (attempt ${retryCount})`);

        if (retryCount < maxRetries) {
          // Generate a new credit note number and retry
          data.credit_note_number = await generateCreditNoteNumber();
          await new Promise((resolve) => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
          continue;
        }
      }

      console.error('Error creating credit note:', error);
      throw new Error(error);
    }
  }

  throw new Error('Failed to create credit note after maximum retries');
};

/**
 * Creates a credit note and associated journal entry within a transaction
 * to ensure data consistency and atomicity.
 * @param {Object} body - The credit note data
 * @param {Array} journal_entry - Journal entry line items
 * @param {Array} taxItems - Tax items for the journal entry
 * @param {String} userID - ID of the user creating the credit note
 * @returns {Promise<Object>} The created journal entry
 */
const addCreditNote = async (body, journal_entry, taxItems, userID) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    const { total, sub_total, vat_total, credit_date, due_date, invoice_id, type } = body;

    // Determine credit note type (default to 'standard' for backward compatibility)
    const creditNoteType = type || 'standard';

    // For standard credit notes, validate invoice and amount
    // For custom credit notes, invoice is optional and negative values are allowed
    let invoiceToCredit = null;
    if (creditNoteType === 'standard') {
      // Validate invoice and credit amount for standard credit notes
      invoiceToCredit = await Invoice.findById(invoice_id).session(session);
      if (!invoiceToCredit) throw new Error(`Invalid invoice id ${invoice_id}`);
      // Credit notes can exceed invoice balance - they have a negative effect
      // Only validate that the credit note amount is positive for standard
      if (total <= 0) {
        throw new Error(`Standard credit note amount must be greater than zero: ${total}`);
      }
    } else if (creditNoteType === 'custom') {
      // For custom credit notes, invoice is optional but if provided, validate it exists
      if (invoice_id) {
        invoiceToCredit = await Invoice.findById(invoice_id).session(session);
        if (!invoiceToCredit) throw new Error(`Invalid invoice id ${invoice_id}`);
      }
      // Custom credit notes allow negative values (adjustments)
    }

    // Set dates
    const dueDate = new Date(due_date);
    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Generate credit note number with transaction support
    const newCreditNoteId = await generateCreditNoteNumber();

    // Create credit note payload
    const payload = {
      ...body,
      credit_note_number: newCreditNoteId,
      status: today > dueDate ? 'Overdue' : 'Unapproved',
      balance_due: total,
      invoice: creditNoteType === 'standard' ? invoice_id : (invoice_id || null), // Only set invoice for standard type
      created_by: userID,
      credit_date: new Date(),
      is_draft: false, // Final credit note, not a draft
      type: creditNoteType, // Ensure type is set
    };

    // Create credit note within the transaction
    const credit = await createCreditNote(payload, session);

    console.log('created credit note===========>');

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
      isInvoiceRelated: !!invoice_id, // Only true if invoice exists
      invoice: invoice_id || null, // Can be null for custom credit notes
      credit_note: credit._id, // Add reference to credit note
      company: credit.company,
      tax_item: taxItems,
      document_id: credit.credit_note_number,
      document_customer: credit.customer_name,
      memo_description: invoiceToCredit
        ? `Credit Note for Invoice ${invoiceToCredit.invoice_number}`
        : `Custom Credit Note ${credit.credit_note_number}`,
      created_by: userID,
    };

    // Generate journal entry within the transaction
    const je = await generateJournalEntry(journal_payload, session);
    console.log(je, '========> the generated JE');

    // Update invoice balance within the transaction (only for standard credit notes with invoice)
    if (creditNoteType === 'standard' && invoice_id) {
      const invoice = await Invoice.findById(invoice_id).session(session);
      if (!invoice) {
        throw new Error(`Invoice with id ${invoice_id} not found`);
      }

      // If credit_notes doesn't exist, initialize it as an empty array
      if (!invoice.credit_notes) {
        invoice.credit_notes = [];
      }

      // Update the fields
      console.log('pushing credit id to invoice--------<', credit._id);
      invoice.credit_notes.push(credit._id); // Add the credit note to the array
      invoice.markModified('credit_notes');

      // Save the updated document within the transaction
      const savedInvoice = await invoice.save({ session });
      console.log(
        'this is the saved invoice is',
        savedInvoice._id,
        'with credit notes',
        savedInvoice.credit_notes,
        'of length',
        savedInvoice.credit_notes.length
      );
    }

    // Commit the transaction
    await session.commitTransaction();

    return je;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Error in addCreditNote transaction:', error);
    throw new Error(error);
  } finally {
    // End the session
    session.endSession();
  }
};
/**
 * Function to create Jaurnal entry
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
 * Finds a credit note by its ID.
 * @param {string} creditNoteId - The ID of the credit note to find.
 * @returns {Promise<Object>} The credit note object if found.
 * @throws Will throw an error if the credit note is not found or if an error occurs during the query.
 */
const findCreditNoteById = async (creditNoteId) => {
  try {
    const creditNote = await CreditNote.findOne({ _id: ObjectId(creditNoteId), is_deleted: false });
    if (!creditNote) {
      throw new Error('Credit Note not found.');
    }
    return creditNote;
  } catch (error) {
    throw new Error(`Error finding credit note: ${error.message}`);
  }
};

const getAllCreditNotes = async (reqQuery, reqBody) => {
  try {
    // Extract and set pagination and sorting defaults
    const page = parseInt(reqQuery.page, 10) || 1;
    const limit = parseInt(reqQuery.limit, 10) || 30;
    const skip = (page - 1) * limit;
    const sortBy = reqQuery.sortBy || 'createdAt';
    const sortOrder = parseInt(reqQuery.sort, 10) || -1;

    // Build dynamic search filter
    const search = reqQuery.search
      ? {
          $or: [
            { credit_note_number: { $regex: new RegExp(reqQuery.search, 'i') } },
            { memo: { $regex: new RegExp(reqQuery.search, 'i') } },
            { status: { $regex: new RegExp(reqQuery.search, 'i') } },
          ],
        }
      : {};

    // Initial base filter
    const filter = {
      is_deleted: false,
      ...search, // Add search criteria
    };

    // Add type filter (custom or standard)
    if (reqQuery.type || reqBody.type) {
      const typeFilter = reqQuery.type || reqBody.type;
      if (typeFilter === 'custom') {
        filter.type = 'custom';
      } else if (typeFilter === 'standard') {
        filter.type = { $ne: 'custom' }; // All non-custom credit notes
      }
    }

    // Add status filter
    if (reqQuery.status || reqBody.status) {
      const statusFilter = reqQuery.status || reqBody.status;
      if (Array.isArray(statusFilter)) {
        filter.status = { $in: statusFilter.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) };
      } else {
        const statusCapitalized = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase();
        filter.status = statusCapitalized;
      }
    }

    // Add company-specific filtering
    if (reqBody.selected_company_id) {
      filter.customer = typeof reqBody.selected_company_id === 'string'
        ? ObjectId(reqBody.selected_company_id)
        : reqBody.selected_company_id;
    }

    // Prepare lookup and project pipeline
    const body = [
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
          credit_note_number: 1,
          createdAt: 1,
          updatedAt: 1,
          memo: 1,
          status: 1,
          type: 1, // Include type field
          items: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          terms_name: 1,
          credit_date: 1,
          due_date: 1,
          customer_name: '$companyDetails.company_name',
          customer_email: '$companyDetails.email',
          customer_phone: '$companyDetails.phone',
          customer_address: '$companyDetails.address',
          invoice_number: '$invoiceDetails.invoice_number',
          invoice: 1, // Include invoice field for unlinked filtering
          credit_amount: 1,
          applied_amount: 1,
          credit_balance: {
            $subtract: [
              { $ifNull: ['$credit_amount', 0] },
              { $ifNull: ['$applied_amount', 0] }
            ]
          },
          void_reason: {
            $cond: {
              if: { $eq: ['$status', 'void'] },
              then: '$void_reason', // Use the void_reason field from the document
              else: null,
            },
          },
          // remaining_balance: 1,
          // applied_to_balance: 1,
        },
      },
    ];

    // Add additional filters from `queryService` if needed
    if (reqBody.selected_company_id) {
      body.unshift(...queryService(reqBody));
    }

    // Define pagination and sorting options
    const options = {
      limit,
      skip,
      sort: { [sortBy]: sortOrder },
    };

    // Perform the aggregation query with pagination
    const result = await CreditNote.paginateLookup(filter, options, body);

    return result;
  } catch (error) {
    // Improve error handling for better traceability
    throw new Error(`Failed to fetch credit notes: ${error.message}`);
  }
};

/**
 * ===============================================================================================================
 * This is the entry point for generating credit notes
 * The function uses two other helper functions:
 * -addCreditNote
 * -createCreditNote
 * ===============================================================================================================
 */
/**
 * Main entry point for generating credit notes with transaction support
 * @param {Object} reqBody - Request body containing credit note data
 * @returns {Promise<Object>} The created journal entry
 */
const generateCreditNote = async (reqBody) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // Determine credit note type (default to 'standard' for backward compatibility)
    const creditNoteType = reqBody.type || 'standard';
    const invoice_id = reqBody.invoice_id;

    // For standard credit notes, validate invoice and extract currency info
    // For custom credit notes, invoice is optional
    if (creditNoteType === 'standard') {
      // conditionally check applied balances from invoice
      if (!invoice_id) {
        throw new Error('Invoice ID is required for standard credit notes');
      }
      const parentInvoice = await Invoice.findById(invoice_id).session(session);
      if (!parentInvoice) throw new Error(`Invalid invoice id ${invoice_id}`);

      // Extract currency information from the parent invoice for inheritance
      const inheritedCurrency = parentInvoice.currency || 'AED';
      const inheritedConversionRate = parentInvoice.conversion_rate || 1.0;
      const inheritedBaseCurrency = parentInvoice.base_currency || 'AED';

      // Calculate converted amount to AED for reporting
      const totalAmount = reqBody.total || 0;
      const convertedAmountAED = totalAmount * inheritedConversionRate;

      // Add currency fields to the request body for credit note creation
      reqBody.currency = inheritedCurrency;
      reqBody.conversion_rate = inheritedConversionRate;
      reqBody.base_currency = inheritedBaseCurrency;
      reqBody.converted_amount_aed = convertedAmountAED;
      /**
       * ===============================================================================================================
       * Conditionally check if credit note balances are applicable to the invoice
       * Sum up all total from valid credit notes and compare with total from body
       * ===============================================================================================================
       */
      const validStatuses = ['Draft', 'Unapproved', 'Approved', 'Applied'];
      const totalCreditNotAmount = parentInvoice.credit_notes
        .filter((cn) => validStatuses.includes(cn.status)) // Filter by valid statuses
        .reduce((sum, cn) => sum + (cn.total || 0), 0);
      console.log(totalCreditNotAmount, '=======> total');
      // Credit notes can exceed invoice balance - they have a negative effect
      // Only validate that the credit note amount is positive for standard
      if (reqBody.total <= 0) {
        throw new Error(`Standard credit note amount must be greater than zero: ${reqBody.total}`);
      }
    } else if (creditNoteType === 'custom') {
      // For custom credit notes, use currency from request body or defaults
      reqBody.currency = reqBody.currency || 'AED';
      reqBody.conversion_rate = reqBody.conversion_rate || 1.0;
      reqBody.base_currency = reqBody.base_currency || 'AED';

      // Calculate converted amount to AED for reporting (can be negative)
      const totalAmount = reqBody.total || 0;
      reqBody.converted_amount_aed = totalAmount * (reqBody.conversion_rate || 1.0);

      // Custom credit notes allow negative values (adjustments)
      // No validation needed for total amount

      // If invoice_id is provided, validate it exists
      if (invoice_id) {
        const parentInvoice = await Invoice.findById(invoice_id).session(session);
        if (!parentInvoice) {
          throw new Error(`Invalid invoice id ${invoice_id}`);
        }
        // Optionally inherit currency from invoice if not provided
        if (!reqBody.currency || reqBody.currency === 'AED') {
          reqBody.currency = parentInvoice.currency || 'AED';
          reqBody.conversion_rate = parentInvoice.conversion_rate || 1.0;
        }
      }
    }
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

    // Setup proper journal entries for credit note
    // 1. Debit Sales (to reduce revenue)
    const salesEntry = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, reqBody, reqBody.customer);
    journal_entry.push({
      ...salesEntry,
      isDebit: true,
      isCredit: false,
      amount: reqBody.sub_total,
    });

    // 2. Debit VAT Payable (to reduce tax liability)
    if (reqBody.vat_total > 0) {
      const vatEntry = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, reqBody, reqBody.customer);
      journal_entry.push({
        ...vatEntry,
        isDebit: true,
        isCredit: false,
        amount: reqBody.vat_total,
      });
    }

    // 3. Credit Accounts Receivable (to reduce customer balance)
    journal_entry.push({
      ...arResult,
      isDebit: false,
      isCredit: true,
      amount: reqBody.total,
    });

    // Process tax items
    let taxItems = [];
    const mapItems = reqBody.items.map((obj) => {
      if (obj.tax_name && obj.tax_code) {
        let dataItems = {
          name: `VAT on Credit Note ${obj.tax_name}`,
          account_name: `VAT Payable`,
          account: journal_entry.find((je) => je.code === 'VP') && journal_entry.find((je) => je.code === 'VP').account,
          isDebit: true,
          isCredit: false,
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
        `Credit Note Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`
      );
      await session.abortTransaction();
      return {
        success: false,
        message: `Invalid Journal Entry: Debits=${debitsTotal.toFixed(2)}, Credits=${creditsTotal.toFixed(
          2
        )}, Difference=${difference.toFixed(2)}`,
      };
    }

    if (validJournal) {
      // Pass the session to addCreditNote to maintain transaction context
      const data = await addCreditNote(body, journal_entry, taxItems, reqBody.userId);

      // Commit the transaction
      await session.commitTransaction();
      return data;
    }
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Error in generateCreditNote transaction:', error);
    throw new Error(error);
  } finally {
    // End the session
    session.endSession();
  }
};
/**
 *
 * @param {Object} reqBody
 * @returns {Promise<Object>}
 * @throws Will throw an error if the credit note is not found or if the operation fails.
 * @description
 * This function is used to filter credit notes by status
 */
const filterCreditNotesByStatus = async (reqBody) => {
  try {
    const { status } = reqBody;
    let filter = {
      is_deleted: false,
    };
    const options = {
      limit: 10,
      page: 1,
      sort: '-createdAt',
    };

    let body = [
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceDetails',
        },
      },
      { $unwind: '$invoiceDetails' },
      {
        $project: {
          _id: 1,
          invoice: '$invoiceDetails',
          credit_note_number: 1,
          total: 1,
          status: 1,
          credit_date: 1,
          due_date: 1,
          memo: 1,
          items: 1,
          sub_total: 1,
          vat_total: 1,
          company: 1,
          customer: 1,
          terms_name: 1,
        },
      },
    ];

    if (status && status.length > 0) {
      if (Array.isArray(status)) {
        filter.status = {
          $in: status.map((s) => s.toLowerCase()),
        };
        console.log('Filter being applied:', JSON.stringify(filter));
      } else {
        filter.status = {
          $in: ['Draft', 'Unapproved', 'Approved', 'Applied', 'Void', 'Overdue'],
        };
      }
    }

    if (reqBody.selected_company_id) {
      reqBody.isCreditFilter = true;
      body.unshift(...queryService(reqBody));
    }

    console.log('Filter being applied:', JSON.stringify(filter));

    const response = await CreditNote.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Creates a new credit note.
 * @param {Object} requestBody - The data for credit note.
 * @param {Object} creditNoteId - id for the new credit note.
 * @returns {Promise<Object>} update credit note.
 * @throws Will throw an error if the credit note update fails.
 */
const updateCreditNote = async (creditNoteId, reqBody) => {
  try {
    console.log('=== UPDATE CREDIT NOTE SERVICE ===');
    console.log('creditNoteId:', creditNoteId);
    console.log('reqBody:', reqBody);

    const creditNote = await findCreditNoteById(creditNoteId);
    console.log('Found credit note:', creditNote);

    const updates = Object.keys(reqBody);
    console.log('Updates to apply:', updates);

    updates.forEach((update) => {
      creditNote[update] = reqBody[update];
    });

    await creditNote.save();
    console.log('Credit note saved successfully');
    return creditNote;
  } catch (error) {
    console.log('=== UPDATE CREDIT NOTE SERVICE ERROR ===');
    console.log('Error:', error);
    throw new Error(error);
  }
};
/**
 * Soft deletes a credit note by marking it as deleted and recording the user who deleted it.
 * @param {string} creditNoteId - The ID of the credit note to delete.
 * @param {string} userId - The ID of the user performing the deletion.
 * @returns {Promise<boolean>} True if the operation is successful.
 * @throws Will throw an error if the credit note is not found or if the operation fails.
 */
const deleteCreditNote = async (creditNoteId, userId) => {
  try {
    const creditNote = await findCreditNoteById(creditNoteId);

    creditNote.is_deleted = true;
    creditNote.deleted_by = userId;

    await creditNote.save();
    return true;
  } catch (error) {
    throw new Error(`Error deleting credit note: ${error.message}`);
  }
};

/**
 *
 * @param {Object} creditNoteId
 * @returns {Promise<Object>}
 * @throws Will throw an error if the credit note is not found or if the operation fails.
 * @description
 * This function is used to get credit note pdf preview
 */

const getCreditNotePdfPreview = async (creditNoteId) => {
  try {
    console.log('===================> getting pdf preview', creditNoteId, '-------->');
    // Fetch credit note details
    const result = await CreditNote.findById(creditNoteId)
      .populate('invoice')
      .populate('customer')
      .populate({
        path: 'invoice',
        populate: {
          path: 'terms',
        },
      });

    let sponsorType;

    if (!result) {
      throw new Error('Credit note not found!. could not fetch credit note details for preview');
    }
    sponsorType = result.visa_sponsor.toLowerCase() || 'dynamic employment services';
    const companyDoc = await Companies.findById(result.customer);
    if (!companyDoc) throw new Error(`invalid company id. Exiting preview for credit note`);

    // For custom credit notes, invoice might be optional
    // Use visa_sponsor from credit note if invoice is not available
    let templt;
    let creditedInvoice = null; // Initialize to null for custom credit notes without invoice
    if (result.invoice) {
      creditedInvoice = await Invoice.findById(result.invoice);
      if (!creditedInvoice) {
        throw new Error('Invoice not found. Could not generate credit note preview');
      }
      switch (creditedInvoice.visa_sponsor) {
        case 'Dynamic Employment Services':
          templt = 'Credit Note Template';
          break;
        case 'Executive Employment Services':
          templt = 'Credit Note Template EES';
          break;
        default:
          templt = 'Credit Note Template';
      }
    } else {
      // For custom credit notes without invoice, use credit note's visa_sponsor
      switch (result.visa_sponsor) {
        case 'Dynamic Employment Services':
          templt = 'Credit Note Template';
          break;
        case 'Executive Employment Services':
          templt = 'Credit Note Template EES';
          break;
        default:
          templt = 'Credit Note Template';
      }
    }
    // Fetch document template
    const template = await DocumentTemplate.findOne({ name: templt }).select({ content: 1 });
    if (!template || !template.content) {
      throw new Error('Credit Note Template not found or content is empty');
    }

    // Format billing address similar to getCreditNotePreview
    let billingAddressText = '';
    if (typeof result.billing_address === 'string' && result.billing_address.trim() !== '') {
      billingAddressText = result.billing_address;
    } else if (companyDoc && companyDoc.billing_address) {
      const addr = companyDoc.billing_address;
      billingAddressText = [addr.address_line1].filter(Boolean).join('\n');
    }

    const replacements = [
      { key: 'creditnotenumber', value: result.credit_note_number },
      { key: 'currency', value: result.currency || creditedInvoice.currency || 'AED' },
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
      { key: 'creditdate', value: formatDate(result.credit_date) },
      { key: 'creditdue', value: formatDate(result.due_date) },
      { key: 'memo', value: result.reason },
      { key: 'status', value: result.status },
      { key: 'subtotal', value: thousandSeparator(result.sub_total) },
      { key: 'totalvat', value: thousandSeparator(result.vat_total) },
      { key: 'tax', value: thousandSeparator(result.vat_total) },
      { key: 'totaltax', value: thousandSeparator(result.vat_total) },
      { key: 'total_credit_amount', value: thousandSeparator(result.total_credit_amount) },
      { key: 'applied_to_balance', value: thousandSeparator(result.applied_to_balance || 0) },
      { key: 'remaining_credit', value: thousandSeparator(result.total_credit_amount - (result.applied_to_balance || 0)) },
      { key: 'billing_address', value: billingAddressText },
      { key: 'balance_due', value: thousandSeparator(result.total) },
      { key: 'date_created', value: moment(result.createdAt).format('MMM Do YY') },
      { key: 'user', value: companyDoc.company_name },
    ];

    // Get related invoice information if available (for both standard and custom credit notes)
    if (result.invoice) {
      const invoiceDoc = typeof result.invoice === 'object' ? result.invoice : await Invoice.findById(result.invoice);
      if (invoiceDoc) {
        replacements.push(
          { key: 'invoice_number', value: invoiceDoc.invoice_number || 'N/A' },
          { key: 'invoice_date', value: formatDate(invoiceDoc.invoice_date) }
        );
      }
    } else if (result.type === 'custom') {
      // For custom credit notes without invoice, show a placeholder or skip
      replacements.push(
        { key: 'invoice_number', value: 'N/A' },
        { key: 'invoice_date', value: 'N/A' }
      );
    }

    // Get customer information
    if (companyDoc) {
      replacements.push({ key: 'company', value: companyDoc.company_name });
    }

    // Prepare items table array
    const tableArray = result.items.map((element) => ({
      service: typeof element.service_name === 'object' ? element.service_name.name : element.service_name,
      description: typeof element.description === 'object' ? element.description.text : element.description,
      rate: thousandSeparator(element.rate),
      amount: thousandSeparator(element.amount),
      quantity: element.quantity || 1,
      vat: thousandSeparator(element.vat_amount),
      _id: element._id,
      net_total:
        element && element.net_total
          ? typeof element.net_total !== 'object'
            ? thousandSeparator(parseFloat(element.net_total))
            : thousandSeparator(parseFloat(element.net_total.vat_rate || 0) + parseFloat(element.net_total.amount || 0))
          : '0',
    }));

    // Prepare template replacement object
    const obj = {
      replaceText: JSON.stringify(replacements),
      replaceTable: JSON.stringify([{ tablename: 'credittable', table: tableArray }]),
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
    const url = await invoiceService.uploadLetterArrayBuffer(response.data, `creditnote_${result.credit_note_number}.pdf`);

    return {
      url: url,
      name: `creditnote_${result.credit_note_number}.pdf`,
    };
  } catch (error) {
    console.error('Error generating credit note preview:', error.message);
    throw error;
  }
};

const getAvailableCreditNotesByInvoiceId = async (reqBody, reqQuery) => {
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
          // If original_invoice_balance is not set, calculate it from current balance + applied amount
          original_invoice_balance: {
            $cond: {
              if: { $gt: ['$original_invoice_balance', 0] },
              then: '$original_invoice_balance',
              else: {
                $add: ['$invoiceDetails.balance_due', '$applied_amount'],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          credit_note_number: 1,
          createdAt: 1,
          updatedAt: 1,
          memo: 1,
          status: 1,
          items: 1,
          sub_total: 1,
          vat_total: 1,
          total: 1,
          terms_name: 1,
          credit_date: 1,
          due_date: 1,
          credit_amount: 1,
          applied_amount: 1,
          credit_balance: 1,
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
      filter.$or = [{ credit_note_number: { $regex: search, $options: 'i' } }, { memo: { $regex: search, $options: 'i' } }];
    }
    if (reqBody.selected_company_id) {
      reqBody.isCreditFilter = true;
      body.unshift(...queryService(reqBody));
    }
    const response = await CreditNote.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 *
 * @param {String} creditNoteId
 * @returns {Promise<Object>}
 * @description
 * This function is used to get credit note preview
 */
const getCreditNotePreview = async (creditNoteId) => {
  try {
    const result = await CreditNote.findById(ObjectId(creditNoteId));
    let sponsorType;
    if (!result) {
      throw new Error('Credit note not found!. could not fetch credit note details for preview');
    }
    // For custom credit notes, invoice might be optional
    // Use visa_sponsor from credit note if invoice is not available
    sponsorType = result.visa_sponsor.toLowerCase() || 'dynamic employment services';
    let templt;
    let creditedInvoice = null; // Initialize to null for custom credit notes without invoice
    if (result.invoice) {
      creditedInvoice = await Invoice.findById(result.invoice);
      if (!creditedInvoice) {
        throw new Error('Invoice not found. Could not generate credit note preview');
      }
      switch (creditedInvoice.visa_sponsor) {
        case 'Dynamic Employment Services':
          templt = 'Credit Note Template';
          break;
        case 'Executive Employment Services':
          templt = 'Credit Note Template EES';
          break;
        default:
          templt = 'Credit Note Template';
      }
    } else {
      // For custom credit notes without invoice, use credit note's visa_sponsor
      switch (result.visa_sponsor) {
        case 'Dynamic Employment Services':
          templt = 'Credit Note Template';
          break;
        case 'Executive Employment Services':
          templt = 'Credit Note Template EES';
          break;
        default:
          templt = 'Credit Note Template';
      }
    }
    console.log(templt, 'this is the name of the template');
    const test = await DocumentTemplate.find({ name: templt });
    console.log(test.name, 'this is the test name', test._id);
    const content = await DocumentTemplate.find({ name: templt }).select({ content: 1 });
    const companyDoc = await Companies.findById(result.customer);
    if (!companyDoc) throw new Error(`invalid company id. Exiting pdf preview for credit note`);
    // console.log(result);
    function formatDate(val) {
      return val ? moment(val).format('DD-MMM-YYYY') : '';
    }
    let billingAddressText = '';
    if (typeof result.billing_address === 'string' && result.billing_address.trim() !== '') {
      billingAddressText = result.billing_address;
    } else if (companyDoc && companyDoc.billing_address) {
      const addr = companyDoc.billing_address;
      billingAddressText = [addr.address_line1]
        .filter(Boolean) // removes empty strings/nulls
        .join('\n');
    }
    // Basic credit note information
    let array = [
      { key: 'creditnotenumber', value: result.credit_note_number },
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
      { key: 'creditdate', value: formatDate(result.credit_date) },
      { key: 'currency', value: result.currency || (creditedInvoice ? creditedInvoice.currency : null) || 'AED' },
      { key: 'creditdue', value: formatDate(result.due_date) },
      { key: 'memo', value: result.reason },
      { key: 'status', value: result.status },
      { key: 'invoice_number', value: creditedInvoice ? creditedInvoice.invoice_number : 'N/A' },
      { key: 'creditterm', value: result.terms_name },
      { key: 'subtotal', value: thousandSeparator(result.sub_total) },
      { key: 'totalvat', value: thousandSeparator(result.vat_total) },
      { key: 'tax', value: thousandSeparator(result.vat_total) },
      { key: 'totaltax', value: thousandSeparator(result.vat_total) },
      { key: 'total_credit_amount', value: thousandSeparator(result.total_credit_amount) },
      { key: 'applied_to_balance', value: thousandSeparator(result.applied_to_balance || 0) },
      { key: 'remaining_credit', value: thousandSeparator(result.total_credit_amount - (result.applied_to_balance || 0)) },
      { key: 'billing_address', value: (companyDoc && companyDoc.company_address) || '' },
      { key: 'balance_due', value: thousandSeparator(result.total) },
      { key: 'date_created', value: moment(result.createdAt).format('MMM Do YY') },
      { key: 'user', value: companyDoc.company_name },
      // { key: 'customer_notes', value: result.customer_notes ? results.customer_notes : '' }
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
    if (result.invoice_id) {
      console.log('result of invoice id evaluated to true');
      const relatedInvoice = await Invoice.findById(result.invoice);
      if (relatedInvoice) {
        array.push(
          { key: 'invoice_number', value: relatedInvoice.invoice_number },
          { key: 'invoice_date', value: formatDate(relatedInvoice.invoice_date) }
        );
      }
    }

    // Get customer information
    const customer = await Companies.findById(result.customer);
    if (customer) {
      array.push(
        { key: 'company', value: customer.company_name }
        // { key: 'billing_address', value: customer.billing_address }
      );
      console.log('console insude condition for customer', JSON.stringify(array));
      console.log(customer.company_name, 'is the company name');
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
        description: 'No items added to this invoice',
      });
    } else {
      for (const item of result.items) {
        console.log(item, 'this is the item');
        let obj = {
          service: typeof item.service_name === 'object' ? item.service_name.name : item.service_name,
          description: typeof item.description === 'object' ? item.description.text : item.description,
          rate: thousandSeparator(item.rate),
          amount: thousandSeparator(item.amount),
          quantity: item.quantity || 1,
          vat: thousandSeparator(item.vat_amount),
          _id: item._id,
          net_total:
            item && item.net_total
              ? typeof item.net_total !== 'object'
                ? thousandSeparator(parseFloat(item.net_total))
                : thousandSeparator(parseFloat(item.net_total.vat_rate || 0) + parseFloat(item.net_total.amount || 0))
              : '0',
        };
        tablearray.push(obj);
      }
    }
    console.log('start of array to table--->', JSON.stringify(array), 'this is the array passed to the table');
    let obj = {
      replaceText: JSON.stringify(array),
      replaceTable: JSON.stringify([{ tablename: 'credittable', table: tablearray }]),
      replaceImage: JSON.stringify([
        { key: 'logo', value: 'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg' },
      ]),
      content: content[0].content,
    };

    let response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContent', JSON.stringify(obj), {
      headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
/**
 *
 * @param {string} companyId
 * @param {string} invoiceId
 * @returns {Promise<Object>}
 * @description
 * This function checks if a credit note already exists for the given company and invoice
 */
const checkExistingCreditNote = async (companyId, invoiceId) => {
  try {
    const existingCreditNote = await CreditNote.findOne({
      company: ObjectId(companyId),
      invoice: ObjectId(invoiceId),
      status: { $nin: ['Void', 'Applied'] }, // Don't count voided or applied credit notes
    });

    return {
      exists: !!existingCreditNote,
      creditNote: existingCreditNote,
    };
  } catch (error) {
    console.error('Error checking existing credit note:', error);
    throw error;
  }
};

const voidCreditNote = async (creditNoteId, voidReason, userId) => {
  try {
    const creditNote = await CreditNote.findById(creditNoteId);
    if (!creditNote) {
      throw new Error('Credit note not found');
    }

    // Check if credit note can be voided
    if (creditNote.status === 'Approved' || creditNote.status === 'Applied') {
      throw new Error('Cannot void an approved or applied credit note');
    }

    // Update credit note status and add void information
    const updatedCreditNote = await CreditNote.findByIdAndUpdate(
      creditNoteId,
      {
        status: 'Void',
        void_reason: voidReason,
        voided_by: userId,
        voided_at: new Date(),
        credit_note_number: `VOID-${creditNote.credit_note_number}`, // Add VOID prefix
      },
      { new: true }
    );

    return updatedCreditNote;
  } catch (error) {
    console.error('Error voiding credit note:', error);
    throw error;
  }
};

/**
 * @param {Object} reqBody
 * @returns {Promise<Object>}
 * @description
 * This function is used to get credit note stats
 */
const getCreditNoteStats = async (reqBody) => {
  try {
    const matchStage = {
      $match: {
        is_deleted: false,
      },
    };

    if (reqBody && reqBody.selected_company_id) {
      matchStage.$match.customer = mongoose.Types.ObjectId(reqBody.selected_company_id);
    }

    const pipeline = [
      matchStage,
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
        $group: {
          _id: {
            company: '$companyDetails._id',
            company_name: '$companyDetails.company_name',
            legal_name: '$companyDetails.legal_name',
            registration_number: '$companyDetails.registration_number',
            vat_number: '$companyDetails.vat_number',
            status: '$status',
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          appliedAmount: { $sum: { $ifNull: ['$credit_amount', 0] } },
          creditNotes: {
            $push: {
              creditNumber: '$credit_note_number',
              total: '$total',
              applied_to_balance: { $ifNull: ['$credit_amount', 0] },
              remaining_balance: {
                $subtract: ['$total', { $ifNull: ['$credit_amount', 0] }],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            company_id: '$_id.company',
            company_name: '$_id.company_name',
            legal_name: '$_id.legal_name',
            registration_number: '$_id.registration_number',
            vat_number: '$_id.vat_number',
          },
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              total: '$totalAmount',
              applied: '$appliedAmount',
              creditNotes: '$creditNotes',
            },
          },
          total_count: { $sum: '$count' },
          total_amount: { $sum: '$totalAmount' },
          total_applied: { $sum: '$appliedAmount' },
        },
      },
      {
        $group: {
          _id: null,
          total_creditnotes: { $sum: '$total_count' },
          total_amount: { $sum: '$total_amount' },
          total_applied: { $sum: '$total_applied' },
          companies: {
            $push: {
              company_id: '$_id.company_id',
              company_name: '$_id.company_name',
              legal_name: '$_id.legal_name',
              registration_number: '$_id.registration_number',
              vat_number: '$_id.vat_number',
              total_count: '$total_count',
              total_amount: '$total_amount',
              total_applied: '$total_applied',
              remaining_balance: { $subtract: ['$total_amount', '$total_applied'] },
              status: {
                $reduce: {
                  input: '$statuses',
                  initialValue: {
                    Draft: { count: 0, total: 0, applied: 0, creditNotes: [] },
                    Unapproved: { count: 0, total: 0, applied: 0, creditNotes: [] },
                    Approved: { count: 0, total: 0, applied: 0, creditNotes: [] },
                    Applied: { count: 0, total: 0, applied: 0, creditNotes: [] },
                    Void: { count: 0, total: 0, applied: 0, creditNotes: [] },
                    Overdue: { count: 0, total: 0, applied: 0, creditNotes: [] },
                  },
                  in: {
                    Draft: {
                      count: {
                        $cond: [{ $eq: ['$$this.status', 'Draft'] }, '$$this.count', '$$value.Draft.count'],
                      },
                      total: {
                        $cond: [{ $eq: ['$$this.status', 'Draft'] }, '$$this.total', '$$value.Draft.total'],
                      },
                      applied: {
                        $cond: [{ $eq: ['$$this.status', 'Draft'] }, '$$this.applied', '$$value.Draft.applied'],
                      },
                      creditNotes: {
                        $cond: [{ $eq: ['$$this.status', 'Draft'] }, '$$this.creditNotes', '$$value.Draft.creditNotes'],
                      },
                    },
                    Unapproved: {
                      count: {
                        $cond: [{ $eq: ['$$this.status', 'Unapproved'] }, '$$this.count', '$$value.Unapproved.count'],
                      },
                      total: {
                        $cond: [{ $eq: ['$$this.status', 'Unapproved'] }, '$$this.total', '$$value.Unapproved.total'],
                      },
                      applied: {
                        $cond: [{ $eq: ['$$this.status', 'Unapproved'] }, '$$this.applied', '$$value.Unapproved.applied'],
                      },
                      creditNotes: {
                        $cond: [
                          { $eq: ['$$this.status', 'Unapproved'] },
                          '$$this.creditNotes',
                          '$$value.Unapproved.creditNotes',
                        ],
                      },
                    },
                    Approved: {
                      count: {
                        $cond: [{ $eq: ['$$this.status', 'Approved'] }, '$$this.count', '$$value.Approved.count'],
                      },
                      total: {
                        $cond: [{ $eq: ['$$this.status', 'Approved'] }, '$$this.total', '$$value.Approved.total'],
                      },
                      applied: {
                        $cond: [{ $eq: ['$$this.status', 'Approved'] }, '$$this.applied', '$$value.Approved.applied'],
                      },
                      creditNotes: {
                        $cond: [
                          { $eq: ['$$this.status', 'Approved'] },
                          '$$this.creditNotes',
                          '$$value.Approved.creditNotes',
                        ],
                      },
                    },
                    Applied: {
                      count: {
                        $cond: [{ $eq: ['$$this.status', 'Applied'] }, '$$this.count', '$$value.Applied.count'],
                      },
                      total: {
                        $cond: [{ $eq: ['$$this.status', 'Applied'] }, '$$this.total', '$$value.Applied.total'],
                      },
                      applied: {
                        $cond: [{ $eq: ['$$this.status', 'Applied'] }, '$$this.applied', '$$value.Applied.applied'],
                      },
                      creditNotes: {
                        $cond: [{ $eq: ['$$this.status', 'Applied'] }, '$$this.creditNotes', '$$value.Applied.creditNotes'],
                      },
                    },
                    Void: {
                      count: {
                        $cond: [{ $eq: ['$$this.status', 'Void'] }, '$$this.count', '$$value.Void.count'],
                      },
                      total: {
                        $cond: [{ $eq: ['$$this.status', 'Void'] }, '$$this.total', '$$value.Void.total'],
                      },
                      applied: {
                        $cond: [{ $eq: ['$$this.status', 'Void'] }, '$$this.applied', '$$value.Void.applied'],
                      },
                      creditNotes: {
                        $cond: [{ $eq: ['$$this.status', 'Void'] }, '$$this.creditNotes', '$$value.Void.creditNotes'],
                      },
                    },
                    Overdue: {
                      count: {
                        $cond: [{ $eq: ['$$this.status', 'Overdue'] }, '$$this.count', '$$value.Overdue.count'],
                      },
                      total: {
                        $cond: [{ $eq: ['$$this.status', 'Overdue'] }, '$$this.total', '$$value.Overdue.total'],
                      },
                      applied: {
                        $cond: [{ $eq: ['$$this.status', 'Overdue'] }, '$$this.applied', '$$value.Overdue.applied'],
                      },
                      creditNotes: {
                        $cond: [{ $eq: ['$$this.status', 'Overdue'] }, '$$this.creditNotes', '$$value.Overdue.creditNotes'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total_creditnotes: 1,
          total_amount: 1,
          total_applied: 1,
          remaining_balance: { $subtract: ['$total_amount', '$total_applied'] },
          companies: 1,
        },
      },
    ];

    const result = await CreditNote.aggregate(pipeline);

    if (!result.length) {
      return {
        total_creditnotes: 0,
        total_amount: 0,
        total_applied: 0,
        remaining_balance: 0,
        companies: [],
      };
    }

    return result[0];
  } catch (error) {
    throw new Error(`Failed to fetch credit note statistics: ${error.message}`);
  }
};
/**
 * Applies a credit note to reduce a customer's balance, links it to an invoice,
 * and creates a journal entry to record the transaction.
 *
 * @param {string} creditNoteId - The ID of the credit note to apply.
 * @param {number} amountToApply - The amount of credit to apply.
 * @param {string} customerId - The ID of the customer to whom the credit is being applied.
 * @param {string} invoiceId - The ID of the invoice to which the credit is being applied.
 * @returns {Promise<Object>} The updated credit note object.
 * @throws {Error} Will throw an error if the applied amount exceeds the available credit
 * or if any operation in the process fails.
 *
 * @description
 * This function performs the following steps:
 * 1. Retrieves the credit note by its ID and validates that the applied amount does not exceed the available credit.
 * 2. Updates the credit note balance to reflect the applied amount.
 * 3. Creates a journal entry with appropriate debit and credit accounts:
 *    - Accounts Receivable (Debit): Reduces the customer's outstanding balance.
 *    - Credit Note Liability (Credit): Reduces the credit note liability.
 * 4. Links the journal entry to the credit note and invoice for traceability.
 * 5. Saves the updated credit note and journal entry to the database.
 */
const applyCreditNote = async (reqBody, userId, userName) => {
  try {
    const { creditNoteId, amountToApply, invoiceId, applicationDate, notes } = reqBody;

    const creditNote = await CreditNote.findById(creditNoteId);
    const invoice = await Invoice.findById(invoiceId);

    if (!creditNote || !invoice) {
      throw new Error('Invalid credit note or invoice ID');
    }

    if (creditNote.status !== 'Approved') {
      throw new Error(`Credit note must be approved before it can be applied (Status: ${creditNote.status})`);
    }

    if (amountToApply > creditNote.credit_balance) {
      throw new Error(`Amount to apply (${amountToApply}) exceeds available credit balance (${creditNote.credit_balance})`);
    }

    // No validation needed for invoice balance_due - credit notes can exceed current balance
    // Credit notes have a negative effect and should be allowed to reduce balance below zero

    // Pre-validate to avoid pre-save hook issues
    const newCreditAmount = invoice.credit_amount + amountToApply;
    const newBalanceDue = invoice.balance_due - amountToApply;

    // No validation needed - credit notes can create negative balance

    const vatPortion = creditNote.vat_total ? amountToApply * (creditNote.vat_total / creditNote.total) : 0;
    const subtotalPortion = amountToApply - vatPortion;

    // Store original values for logging
    const originalCreditNoteAppliedAmount = creditNote.applied_amount;
    const originalInvoiceBalanceDue = invoice.balance_due;
    const originalInvoiceCreditAmount = invoice.credit_amount;

    creditNote.applied_amount += amountToApply;
    creditNote.date_applied = applicationDate ? new Date(applicationDate) : new Date();
    creditNote.application_date = applicationDate ? new Date(applicationDate) : new Date();
    creditNote.original_invoice_balance = originalInvoiceBalanceDue;

    // Save notes if provided
    if (notes && notes.trim()) {
      creditNote.application_notes = notes.trim();
    }

    if (creditNote.applied_amount >= creditNote.credit_amount) {
      creditNote.status = 'Applied';
    }

    // Update invoice balance due and credit applied amount
    // IMPORTANT: Update balance_due first to avoid pre-save hook validation issues
    invoice.balance_due -= amountToApply;
    invoice.credit_amount += amountToApply;
    invoice.credit_applied = true;

    // No validation needed - credit notes can reduce balance below zero
    // Credit notes have a negative effect and should be allowed to exceed current balance

    const journal_entry = [
      // Credit AR (reduce customer's receivable)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, { customer: creditNote.customer }),
        amount: amountToApply,
        isCredit: true,
        customer: creditNote.customer,
      },
      // Debit Sales (offset the original credit note entry)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, { customer: creditNote.customer }),
        amount: subtotalPortion,
        isDebit: true,
        customer: creditNote.customer,
      },
    ];

    // Add VAT entry if applicable
    if (vatPortion > 0) {
      journal_entry.push({
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, { customer: creditNote.customer }),
        amount: vatPortion,
        isDebit: true,
        customer: creditNote.customer,
      });
    }

    const journal_payload = {
      line_items: journal_entry,
      total: amountToApply,
      sub_total: subtotalPortion,
      vat_total: vatPortion,
      journal_date: new Date(),
      isInvoiceRelated: true,
      credit_note: creditNoteId,
      invoice: invoiceId,
      company: creditNote.company,
      document_id: `CNA-${creditNoteId}`,
      document_customer: creditNote.customer_name,
      memo_description: `Applied ${amountToApply} from Credit Note ${creditNote.credit_note_number} to Invoice ${invoice.invoice_number}`,
      created_by: userId,
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save credit note and invoice within transaction
      await creditNote.save({ session });
      await invoice.save({ session });

      // Create journal entry within the same transaction
      const journalEntry = await generateJournalEntry(journal_payload, session);

      // Commit the transaction only if all operations succeed
      await session.commitTransaction();

      // Create invoice log for the credit note application
      const invoiceLogService = require('./invoice_logs.service');
      const logData = {
        user_id: userId,
        document_id: invoiceId,
        module: 'credit_note_application',
        dataBeforeUpdationOrCreation: {
          invoice_balance_due: originalInvoiceBalanceDue,
          invoice_credit_amount: originalInvoiceCreditAmount,
          credit_note_applied_amount: originalCreditNoteAppliedAmount,
          credit_note_status: creditNote.status === 'Applied' ? 'Approved' : creditNote.status,
        },
        createdOrUpdateData: {
          invoice_balance_due: invoice.balance_due,
          invoice_credit_amount: invoice.credit_amount,
          credit_note_applied_amount: creditNote.applied_amount,
          credit_note_status: creditNote.status,
          amount_applied: amountToApply,
          application_date: creditNote.date_applied,
          application_notes: notes || null,
        },
        updatedFields: {
          invoice: ['balance_due', 'credit_amount'],
          credit_note: ['applied_amount', 'date_applied', 'status', 'application_notes'],
        },
        logMessage: `${userName} applied credit note ${
          creditNote.credit_note_number
        } for amount AED ${amountToApply} to invoice ${invoice.invoice_number}${notes ? ` with notes: "${notes}"` : ''}`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      await invoiceLogService.createInvoiceLog(logData);

      return {
        creditNote,
        invoice,
        journalEntry,
      };
    } catch (error) {
      console.error('Error in applyCreditNote transaction:', error);
      await session.abortTransaction();
      throw new Error(`Failed to apply credit note: ${error.message}`);
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error(`Failed to apply credit note: ${error.message}`);
  }
};

// cron job tot mark credit note statuses as overdue
cron.schedule(
  '0 1 * * *',
  async () => {
    console.log('----------------------------------> Updating Credit Note Status <===============================>');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Find all credit notes with "available" or "due" status
      const creditNotes = await CreditNote.find({
        status: { $in: ['Draft', 'Unapproved', 'Approved', 'Applied'] },
        is_deleted: false,
      });

      console.log(`Found ${creditNotes.length} eligible credit notes`);

      for (const creditNote of creditNotes) {
        try {
          const invoice = await Invoice.findById(creditNote.invoice);

          if (!invoice) {
            console.warn(`No associated invoice found for credit note ID: ${creditNote._id}`);
            continue;
          }

          const invoiceDate = new Date(invoice.invoice_date);
          const daysSinceInvoice = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));

          if (daysSinceInvoice > 30) {
            creditNote.status = 'overdue';
            await creditNote.save();
            console.log(`Marked credit note ID: ${creditNote._id} as overdue`);
          }
        } catch (err) {
          console.error(`Error processing credit note ID: ${creditNote._id}`, err);
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
 * Gets draft credit note by invoice ID
 * @param {String} invoiceId - The invoice ID to find draft credit notes for
 * @returns {Promise<Object|null>} The draft credit note or null if not found
 */
const getDraftCreditNoteByInvoiceId = async (invoiceId) => {
  try {
    const creditNotes = await CreditNote.find({
      invoice: typeof invoiceId === 'string' ? ObjectId(invoiceId) : invoiceId,
      is_draft: true,
      status: 'Draft',
    });

    if (!creditNotes.length) {
      return null;
    }

    // Return the first draft credit note found
    return creditNotes[0];
  } catch (error) {
    console.error('Error finding draft credit note by invoice ID:', error);
    throw new Error('Error when finding draft credit note: ' + error.message);
  }
};

/**
 * ================================================================================================================================
 * Function to unapply/reverse a credit note application
 * This function reverses the application of a credit note with full transaction support
 * ================================================================================================================================
 */
const unapplyCreditNote = async (reqBody, userId, userName) => {
  try {
    const { creditNoteId, invoiceId, reversalReason } = reqBody;

    const creditNote = await CreditNote.findById(creditNoteId);
    const invoice = await Invoice.findById(invoiceId);

    if (!creditNote || !invoice) {
      throw new Error('Invalid credit note or invoice ID');
    }

    if (creditNote.status !== 'Applied') {
      throw new Error(`Credit note must be applied before it can be unapplied (Status: ${creditNote.status})`);
    }

    if (creditNote.applied_amount <= 0) {
      throw new Error('No applied amount to reverse');
    }

    // Store original values for logging
    const originalCreditNoteAppliedAmount = creditNote.applied_amount;
    const originalInvoiceBalanceDue = invoice.balance_due;
    const originalInvoiceCreditAmount = invoice.credit_amount;
    const originalCreditNoteStatus = creditNote.status;

    // Calculate the amount to reverse (full applied amount)
    const amountToReverse = creditNote.applied_amount;
    const vatPortion = creditNote.vat_total ? amountToReverse * (creditNote.vat_total / creditNote.total) : 0;
    const subtotalPortion = amountToReverse - vatPortion;

    // Reverse the credit note application
    creditNote.applied_amount = 0;
    creditNote.date_applied = null;
    creditNote.application_date = null;
    creditNote.original_invoice_balance = 0;
    creditNote.status = 'Approved';
    creditNote.reversal_notes = reversalReason || null;
    creditNote.reversed_by = userId;
    creditNote.reversed_at = new Date();

    // Reverse invoice changes
    invoice.balance_due += amountToReverse;
    invoice.credit_amount -= amountToReverse;

    // If credit_amount becomes 0, remove credit_applied flag
    if (invoice.credit_amount <= 0) {
      invoice.credit_applied = false;
    }

    // Create reverse journal entry
    const reverseJournalEntry = [
      // Debit AR (increase customer's receivable back)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, { customer: creditNote.customer }),
        amount: amountToReverse,
        isDebit: true,
        customer: creditNote.customer,
      },
      // Credit Sales (reverse the original credit note entry)
      {
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, { customer: creditNote.customer }),
        amount: subtotalPortion,
        isCredit: true,
        customer: creditNote.customer,
      },
    ];

    // Add reverse VAT entry if applicable
    if (vatPortion > 0) {
      reverseJournalEntry.push({
        account: await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, { customer: creditNote.customer }),
        amount: vatPortion,
        isCredit: true,
        customer: creditNote.customer,
      });
    }

    const reverseJournalPayload = {
      line_items: reverseJournalEntry,
      total: amountToReverse,
      sub_total: subtotalPortion,
      vat_total: vatPortion,
      journal_date: new Date(),
      isInvoiceRelated: true,
      credit_note: creditNoteId,
      invoice: invoiceId,
      company: creditNote.company,
      document_id: `CNR-${creditNoteId}`,
      document_customer: creditNote.customer_name,
      memo_description: `Reversed application of ${amountToReverse} from Credit Note ${
        creditNote.credit_note_number
      } to Invoice ${invoice.invoice_number}${reversalReason ? ` - Reason: ${reversalReason}` : ''}`,
      created_by: userId,
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await creditNote.save({ session });
      await invoice.save({ session });

      const reverseJournalEntryResult = await generateJournalEntry(reverseJournalPayload, session);

      await session.commitTransaction();

      // Create invoice log for the credit note reversal
      const invoiceLogService = require('./invoice_logs.service');
      const logData = {
        user_id: userId,
        document_id: invoiceId,
        module: 'credit_note_reversal',
        dataBeforeUpdationOrCreation: {
          invoice_balance_due: originalInvoiceBalanceDue,
          invoice_credit_amount: originalInvoiceCreditAmount,
          credit_note_applied_amount: originalCreditNoteAppliedAmount,
          credit_note_status: originalCreditNoteStatus,
        },
        createdOrUpdateData: {
          invoice_balance_due: invoice.balance_due,
          invoice_credit_amount: invoice.credit_amount,
          credit_note_applied_amount: creditNote.applied_amount,
          credit_note_status: creditNote.status,
          amount_reversed: amountToReverse,
          reversal_date: creditNote.reversed_at,
          reversal_reason: reversalReason || null,
          reversed_by: userId,
        },
        updatedFields: {
          invoice: ['balance_due', 'credit_amount', 'credit_applied'],
          credit_note: ['applied_amount', 'date_applied', 'status', 'reversal_notes', 'reversed_by', 'reversed_at'],
        },
        logMessage: `${userName} reversed credit note ${
          creditNote.credit_note_number
        } application for amount AED ${amountToReverse} from invoice ${invoice.invoice_number}${
          reversalReason ? ` - Reason: ${reversalReason}` : ''
        }`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      await invoiceLogService.createInvoiceLog(logData);

      return {
        creditNote,
        invoice,
        reverseJournalEntry: reverseJournalEntryResult,
        amountReversed: amountToReverse,
      };
    } catch (error) {
      console.error('Error in unapplyCreditNote transaction:', error);
      await session.abortTransaction();
      throw new Error(`Failed to unapply credit note: ${error.message}`);
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error('Error when unapplying credit note: ' + error.message);
  }
};

/**
 * Get available custom credit notes for a customer (unlinked, approved)
 * @param {String} customerId - Customer ID to filter credit notes
 * @param {String} invoiceId - Optional invoice ID for validation
 * @returns {Promise<Object>} Available custom credit notes
 */
const getAvailableCustomCreditNotes = async (customerId, invoiceId = null) => {
  try {
    const { ObjectId } = mongoose.Types;

    // Validate invoice customer matches if invoiceId provided
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invalid invoice ID');
      }
      const invoiceCustomerId = invoice.customer?.toString();
      if (invoiceCustomerId !== customerId.toString()) {
        throw new Error('Invoice customer does not match provided customer ID');
      }
    }

    // Build filter for unlinked custom credit notes
    // Note: We only show 'Approved' credit notes that can be applied
    // Draft/Unapproved credit notes must be approved first before they can be applied
    const filter = {
      type: 'custom',
      customer: ObjectId(customerId),
      status: 'Approved',
      is_deleted: { $ne: true },
      // Unlinked credit notes only (invoice is null, undefined, or doesn't exist)
      $or: [
        { invoice: { $exists: false } },
        { invoice: null },
        { invoice: '' }
      ],
      // Must have available balance (can be negative, but must have balance)
      // Check if credit_balance (credit_amount - applied_amount) is not zero
      $expr: {
        $gt: [
          { $abs: { $subtract: ['$credit_amount', { $ifNull: ['$applied_amount', 0] }] } },
          0
        ]
      }
    };

    // Query with lookup for customer details
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          credit_balance: { $subtract: ['$credit_amount', { $ifNull: ['$applied_amount', 0] }] },
          customer_name: '$customerDetails.company_name'
        }
      },
      {
        $project: {
          _id: 1,
          credit_note_number: 1,
          credit_date: 1,
          total: 1,
          credit_amount: 1,
          applied_amount: 1,
          credit_balance: 1,
          currency: 1,
          conversion_rate: 1,
          status: 1,
          customer: 1,
          customer_name: 1,
          memo: 1,
          type: 1
        }
      },
      { $sort: { credit_date: -1 } }
    ];

    const results = await CreditNote.aggregate(pipeline);

    return {
      results,
      total: results.length
    };
  } catch (error) {
    console.error('Error getting available custom credit notes:', error);
    throw new Error(`Failed to get available custom credit notes: ${error.message}`);
  }
};

module.exports = {
  applyCreditNote,
  unapplyCreditNote,
  findCreditNoteById,
  createCreditNote,
  deleteCreditNote,
  getAllCreditNotes,
  updateCreditNote,
  filterCreditNotesByStatus,
  getCreditNotePdfPreview,
  getCreditNotePreview,
  getCreditNoteStats,
  generateCreditNote,
  getAvailableCreditNotesByInvoiceId,
  getAvailableCustomCreditNotes,
  generateCreditNoteNumber,
  setupCreditNotePreview,
  approveCreditNote,
  getDraftCreditNoteByInvoiceId,
  checkExistingCreditNote,
  voidCreditNote,
};
