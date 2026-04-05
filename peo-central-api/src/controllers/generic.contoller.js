const { ObjectId } = require('mongodb');

const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const {
  sendEmail,
  sendRawEmail,
  requestUserInfoUpdate,
  requestTenancyandResidencyDetails,
  sendMobileAppInvitations
} = require('../middlewares/email');
const { ChartOfAccounts, Invoice, Users, EmailLog } = require('../models');
const {
  invoiceService,
  chartOfAccountsService,
  companiesService,
  usersService,
  termsService,
  emailService,
  loggerService,
  genericService,
  journalEntryService,
  invoiceLogService
} = require('../services');
const config = require('../config/config');
const fs = require('fs');
const excelJs = require('exceljs');

const searchLeadsOnboardingVisProcessOffboardingsRenewalRequest = catchAsync(async (req, res) => {
  try {
    const result = await genericService.searchLeadsOnboardingVisProcessOffboardingsRenewalRequest(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Search the give Data');
    }
    const logString = logger.info(`${req.userName} Searched - ${req.body.search} in the module - ${req.body.module}`)
      .transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to fetch the data Searched - ${req.body.search} in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    throw error;
    // res.status(400).json({ message: 'Unable to fetch the data', details: error });
  }
});

const filterLeadsOnboardingVisProcessOffboardingsRenewalRequest = catchAsync(async (req, res) => {
  console.log('error message');
  try {
    const result = await genericService.filterLeadsOnboardingVisProcessOffboardingsRenewalRequest(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to filter for the give Data');
    }
    const logString = logger.info(`${req.userName} filtered the Data and fetched it for the module - ${req.body.module}`)
      .transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to filter Data for the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to filter the Data', details: error });
  }
});

const genericSendEmail = catchAsync(async (req, res) => {
  try {
    sendEmail(req.body.to, req.body.subject, req.body.body, req.body.cc).then(async result => {
      console.log('Email sent successfully: ', result);
      // await new EmailLog(req.body).save()
    });
    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    console.log('error ', error);
    res.status(400).json({ message: 'Unable to Send Mail', details: error });
  }
});

const mobileInvite = catchAsync(async (req, res) => {
  try {
    sendMobileAppInvitations().then(async result => {
      console.log('Email sent successfully: ', result);
      // await new EmailLog(req.body).save()
    });
    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    console.log('error ', error);
    res.status(400).json({ message: 'Unable to Send Mail', details: error });
  }
});


const genericSendRawEmail = catchAsync(async (req, res) => {
  try {
    if (req.body.attachments && req.body.attachments.length > 0) {
      for (const attachment of req.body.attachments) {
        if (attachment.filename) {
          // If filename has no extension, try to extract it from the path
          const hasExtension = /\.[^/.]+$/.test(attachment.filename);
          if (!hasExtension && attachment.path) {
            try {
              const urlPath = new URL(attachment.path).pathname;
              const extMatch = urlPath.match(/\.[^/.]+$/);
              if (extMatch) {
                attachment.filename += extMatch[0]; // append the extension
              }
            } catch (e) {
              console.warn('Invalid URL in attachment.path:', attachment.path);
            }
          }
        }
      }
    }
    sendRawEmail(req.body.to, req.body.subject, req.body.content, req.body.cc, req.body.attachments, req.body.from).then(
      async result => {
        console.log('Email sent successfully: ', sendRawEmail);
        // await new EmailLog(req.body).save()
      }
    );
    // handle case where isClient is provided on body
    if (req.body.isClientEmail === true) {
      let invoiceIds = [];

      if (req.body.attachments && req.body.attachments.length > 0) {
        invoiceIds = req.body.attachments
          .map(att => {
            const match = att.filename.match(/INV-\d{2}-\d{5}/);
            return match ? match[0] : null;
          })
          .filter(Boolean);
      }
      console.log('Extracted invoice IDs:', invoiceIds);
      await invoiceService.updateSentStatuses(invoiceIds);
      console.log('Updated invoice statuses successfully----------------->');

      // Create invoice logs for each invoice that was sent
      if (invoiceIds.length > 0) {
        try {
          const invoices = await Invoice.find({ invoice_number: { $in: invoiceIds } });

          for (const invoice of invoices) {
            const invoiceLogBody = {
              user_id: req.userId,
              document_id: invoice._id,
              module: 'email',
              createdOrUpdateData: invoice,
              logMessage: `${req.userName} Sent invoice ${invoice.invoice_number} via email to client`
            };

            await invoiceLogService.createInvoiceLog(invoiceLogBody);
          }

          console.log(`Created invoice logs for ${invoices.length} invoices successfully----------------->`);
        } catch (logError) {
          console.error('Error creating invoice logs:', logError);
          // Don't fail the entire operation if logging fails
        }
      }
    }

    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    console.log('error ', error);
    res.status(400).json({ message: 'Unable to Send Mail', details: error });
  }
});

const sendMultipleInvoices = catchAsync(async (req, res) => {
  try {
    const invoiceNumbers = req.body.attachments
      .map(attachment => {
        const match = attachment.path.match(/invoice_([A-Za-z0-9\-]+)\.pdf/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    const selectedInvoices = await Invoice.find({ invoice_number: { $in: invoiceNumbers } });

    const emailPromises = selectedInvoices.map(async invoice => {
      const invoiceEmail = invoice.email;
      if (invoiceEmail) {
        const invoiceAttachment = req.body.attachments.find(attachment => attachment.path.includes(invoice.invoice_number));

        if (invoiceAttachment) {
          await sendRawEmail(invoiceEmail, req.body.subject, req.body.content, req.body.cc, [invoiceAttachment]);
        }
      }
    });

    await Promise.all(emailPromises);

    const bulkOps = selectedInvoices.map(invoice => ({
      updateOne: {
        filter: { _id: invoice._id },
        update: {
          $set: {
            is_sent: {
              Due: invoice.status === 'Due',
              Overdue: invoice.status === 'Overdue',
              Paid: invoice.status === 'Paid'
            }
          }
        }
      }
    }));

    // Execute bulk write operation if there are any updates
    if (bulkOps.length > 0) {
      await Invoice.bulkWrite(bulkOps);
    }

    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    console.log('Error: ', error);
    res.status(400).json({ message: 'Unable to Send Mail', details: error.message });
  }
});

const getAllDetailsProcessFlow = catchAsync(async (req, res) => {
  try {
    const result = await genericService.getAllDetailsProcessFlow(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Data');
    }
    const logString = logger.info(`${req.userName} Accessed the Process Flow - ${req.body.module}`).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to Get the Process Flow for the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to get the Data', details: error });
  }
});

const processFlowMarkUnsuccessful = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processFlowMarkUnsuccessful(req.body, req);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Mark Unsuccessfull');
    }
    const logString = logger.info(`${req.userName} Marked Unsuccessfull Module - ${req.body.module}`).transports[0]
      .logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to Mark Unsuccessfull for the module - ${req.body.module}, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to Mark Unsuccessfull', details: error?.message });
  }
});

const processRejectApplication = catchAsync(async (req, res) => {
  try {
    const result = await genericService.RejectApplication(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Mark Unsuccessfull');
    }
    const logString = logger.info(`${req.userName} Marked Unsuccessfull Module - ${req.body.module}`).transports[0]
      .logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to Mark Unsuccessfull for the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to Mark Unsuccessfull', details: error });
  }
});

const processFlowMoveForward = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processFlowMoveForward(req.body, req.userId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Forward Process');
    }
    const logString = logger.info(
      `${req.userName} Moved forward from one process to other in the Module - ${req.body.module}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Forward Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Forward Process', details: error });
  }
});

const processFlowMoveBackward = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processFlowMoveBackward(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Backward Process');
    }
    const logString = logger.info(
      `${req.userName} Moved backward from one process to the previous in the Module - ${req.body.module}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Backward Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Backward Process', details: error });
  }
});

const processFlowMoveToStage = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processFlowMoveToStage(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Move To Stage Process');
    }
    const logString = logger.info(`${req.userName} Moved to Stage - ${req.body.stage} in the Module - ${req.body.module}`)
      .transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Move To Stage Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Move To Stage Process', details: error?.message });
  }
});

const processFlowUpdate = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processFlowUpdate(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Update Process');
    }
    const logString = logger.info(`${req.userName} Updated process in the Module - ${req.body.module}`).transports[0]
      .logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable Update Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable Update Process', details: error });
  }
});

const processActionDocument = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processActionDocument(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Add Document Process');
    }
    const logString = logger.info(`${req.userName} Add Document process in the Module - ${req.body.module}`).transports[0]
      .logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable Add Document Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable Add Document Process', details: error });
  }
});

const processActionGenerateDocument = catchAsync(async (req, res) => {
  try {
    const result = await genericService.processActionGenerateDocument(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Add Document Process');
    }
    const logString = logger.info(`${req.userName} Add Document process in the Module - ${req.body.module}`).transports[0]
      .logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable Add Document Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable Add Document Process', details: error });
  }
});

const getModuleData = catchAsync(async (req, res) => {
  try {
    const result = await genericService.getModuleData(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get Module Data');
    }
    const logString = logger.info(`${req.userName} Fetch Filtered Data - ${req.body.module}`).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Update Data in module module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to update Data', details: error });
  }
});

const updateModuleData = catchAsync(async (req, res) => {
  try {
    const result = await genericService.updateModuleData(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Backward Process');
    }
    const logString = logger.info(
      `${req.userName} Moved backward from one process to the previous in the Module - ${req.body.module}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Backward Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Backward Process', details: error });
  }
});

const createInvoice = catchAsync(async (req, res) => {
  try {
    function add(accumulator, a) {
      return accumulator + parseInt(a);
    }
    const dataresult = await genericService.getInvoiceDetails(req.body);
    console.log(dataresult, 'the data result=========================');
    let invoiceResult = await createInvoiceService(dataresult, req.body);
    console.log('print after invoice result-->');
    console.log(req.body.data.debit, 'the debit data');
    var total_debitamount = req.body.data.debit.map(elem => elem.amount).reduce(add, 0);
    let debitObject = {
      customer: dataresult.customer,
      invoice: invoiceResult.invoice.id,
      branch: 'N/A',
      reference: 'N/A',
      created_date: dataresult.invoice_date,
      debit_note_date: dataresult.invoice_date,
      due_date: dataresult.due_date,
      sale_person: 'N/A',
      subject: 'N/A',
      notes: 'N/A',
      terms: '63d770da79fbf645c441af34',
      terms_name: 'Net 30',
      items: [],
      sub_total: total_debitamount,
      vat_total: 0,
      total: 0 + total_debitamount
    };
    console.log('the debit object before adding items');
    for (let index = 0; index < req.body.data.debit.length; index++) {
      const element = req.body.data.debit[index];

      debitObject.items.push({
        date: dataresult.invoice_date,
        service_name: element.text,
        amount: element.amount
      });
    }
    console.log('$$$$$$$$$$$$$$$$$$$$$$', 'updating process');
    let debitResult = await createDebitNote(debitObject, req);
    console.log('moving ahead');
    const result = await genericService.updateProcess(req.body, debitResult.id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Create Invoice Process');
    }
    console.log('console after updating process');
    const logString = logger.info(
      `${req.userName} Moved backward from one process to the previous in the Module - ${req.body.module}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    console.log(debitResult, 'now this is the debit result');
    res.status(httpStatus.OK).json(debitResult);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Create Invoice Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Create Invoice Process', details: error });
  }
});

const getInvoiceDetails = catchAsync(async (req, res) => {
  try {
    const result = await genericService.getInvoiceByProcessID(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the get Invoice Process');
    }
    const logString = logger.info(`${req.userName} get Invoice data Module - ${req.body.module}`).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the get Invoice Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the get Invoice Process', details: error });
  }
});

const createVisaProcess = catchAsync(async (req, res) => {
  try {
    const result = await genericService.createVisaProcess(req.body, req.userId);
    if (!result) {
      console.log(result, 'Result');
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to handle the Create Visa Process');
    }
    const logString = logger.info(`${req.userName} Create Visa data Module - ${req.body.module}`).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Create Visa Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Create Visa Process', details: error });
  }
});

const createDebitNote = async (reqbody, req) => {
  try {
    let result;
    let updatedInvoice;
    let newDebitID;
    const lastCreditNote = await invoiceService.getLastDebitNote();

    const debitResult = await ChartOfAccounts.find({ code: 'AR' });

    if (!lastCreditNote) {
      newDebitID = 'DN-1000';
    } else {
      newDebitID = 'DN-' + (parseInt(lastCreditNote.debit_note_number.split('-')[1]) + 1);
    }
    console.time('going to next phase');
    const body = reqbody;
    result = await invoiceService.createDebitNote({
      ...body,
      company: debitResult[0].company,
      debit_note_number: newDebitID,
      balance_due: body.total
    });
    console.timeEnd('going to next phase'); // End timer here

    // Rest of your code...
    const invoiceLogBody = {
      user_id: req.userId,
      document_id: result.debitNote._id,
      module: 'debit_note',
      createdOrUpdateData: result,
      logMessage: `${req.userName} Created a new Debit Note with ID - ${result.debitNote._id} for the invoice with ID - ${body.invoice}`
    };
    const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);
    // console.log("console after adding log on this function");
    const invoiceId = ObjectId(body.invoice);
    // console.log(invoiceId, "this is the invoice id");
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    if (invoice) {
      let debitData = invoice.debit_notes ? invoice.debit_notes : [];
      var payload = {
        debit_applied: true,
        debit_notes: debitData.concat(result.debitNote._id)
      };
      updatedInvoice = await invoiceService.updateInvoiceById(invoiceId, payload);
    }
    // console.log(updatedInvoice, "this is the updated invoice after adding debit note");
    return updatedInvoice;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to create Debit Note', error);
  }
};

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2); // e.g., '25'
  const prefix = `INV-${year}-`;

  // Find all invoices with the current year's prefix, excluding VOID and DRAFT prefixes
  const invoices = await Invoice.find({
    invoice_number: { $regex: `^${prefix}` },
    invoice_number: { $not: /^VOID-|^DRAFT-/ }
  })
    .select('invoice_number')
    .lean();

  // Extract valid numeric sequences
  const sequences = invoices
    .map(inv => {
      const parts = inv.invoice_number?.split('-');
      if (parts?.length === 3 && !isNaN(parts[2])) {
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

const addInvoice = async (body, journal_entry, taxItems, userID, invoiceDetails, userName) => {
  console.time('addInvoice');
  console.log(invoiceDetails, 'this is the invoice details on add invoicer');
  const { items, total, email, sub_total, vat_total, invoice_date, due_date } = body;
  const dueDate = new Date(due_date);
  var today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let invoice_status = 'Unapproved';

  console.time('generateInvoiceNumber');

  // Use draft invoice number if is_draft is true, otherwise use regular invoice number
  let newInvoiceID;
  if (body.is_draft === true) {
    newInvoiceID = await invoiceService.generateDraftInvoiceNumber();
    console.log('Generated DRAFT invoice number:', newInvoiceID);
  } else {
    newInvoiceID = await generateInvoiceNumber();
    console.log('Generated final invoice number:', newInvoiceID);
  }

  console.timeEnd('generateInvoiceNumber');

  const payload = {
    ...body,
    invoice_number: newInvoiceID,
    status: invoice_status,
    balance_due: total,
    details_field: invoiceDetails.data
  };

  console.time('createInvoice');
  const invoice = await invoiceService.createInvoice(payload, invoiceDetails.userId);
  console.timeEnd('createInvoice');

  console.time('createInvoiceLog');
  const invoiceLogBody = {
    user_id: userID,
    document_id: invoice.invoice._id,
    module: 'invoice',
    createdOrUpdateData: invoice,
    logMessage: `${userName} Created a new General Invoice with invoice number - ${invoice.invoice.invoice_number}`
  };
  const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);
  console.timeEnd('createInvoiceLog');

  const updatedJournalEntry = journal_entry.map(obj => ({
    ...obj,
    account: ObjectId(obj.account),
    customer: ObjectId(obj.customer)
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

  console.time('createInvoiceJournalEntry');
  const test = await createInvoiceJournalEntry(journal_payload);
  console.timeEnd('createInvoiceJournalEntry');

  console.timeEnd('addInvoice');
  return invoice;
};
const createInvoiceJournalEntry = async data => {
  const result = await generateJournalEntry(data);
  return result;
};


const generateJournalEntry = async data => {
  try {
    console.time('generateJournalEntry');
    let newJournalNumber;
    console.time('getLastJournalEntry');
    const lastJournalNumber = await journalEntryService.getLastJournalEntry();
    console.timeEnd('getLastJournalEntry');
    if (!lastJournalNumber) {
      newJournalNumber = 'JN-0001';
    } else {
      let currentNum = parseInt(lastJournalNumber.journal_number.split('-')[1]);
      let nextNum = currentNum + 1;
      let leadingZeros = '0'.repeat(4 - nextNum.toString().length);
      newJournalNumber = 'JN-' + leadingZeros + nextNum;
    }
    data.journal_number = newJournalNumber;
    console.log('creating js from generic controller');

    console.time('createJournalEntry');
    const result = await journalEntryService.createJournalEntry(data);
    console.timeEnd('createJournalEntry');
    console.log('Journal entry created successfully');
    console.timeEnd('generateJournalEntry');
    return result;
  } catch (error) {
    console.error('Error in generateJournalEntry:', error);
    return {
      error: true,
      message: 'Journal entry creation encountered an issue',
      details: error.message
    };
  }
};
const createInvoiceService = async (req, reqBody) => {
  var validJournal = false;
  const body = req;

  const InvoiceDetails = reqBody;
  // const { journal_entry } = body;
  const journal_entry = [];
  const debitResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'AR' }, req, req.customer);
  body.company = debitResult.company;
  journal_entry.push(debitResult);
  const creditResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'SL' }, req, req.customer);
  journal_entry.push(creditResult);
  const vatResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'VP' }, req, req.customer);
  journal_entry.push(vatResult);
  const discountResult = await chartOfAccountsService.getChartOfAccountByCode({ code: 'DC' }, req, req.customer);
  journal_entry.push(discountResult);
  // add tax_item
  let taxItems = [];
  const mapItems = req.items.map(obj => {
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
        customer: req.customer,
        city: vatResult.city
      };
      taxItems.push(dataItems);
    }
  });
  const debitsTotal = journal_entry
    .filter(item => item.isDebit)
    .reduce((total, item) => total + parseFloat(item.amount || 0), 0);
  const creditsTotal = journal_entry
    .filter(item => item.isCredit)
    .reduce((total, item) => total + parseFloat(item.amount || 0), 0);

  // Use a small tolerance for floating point comparison
  const tolerance = 0.01; // 1 cent tolerance
  const difference = Math.abs(debitsTotal - creditsTotal);

  if (difference <= tolerance) {
    validJournal = true;
  } else {
    console.error(`Journal entry mismatch: Debits=${debitsTotal}, Credits=${creditsTotal}, Difference=${difference}`);
    validJournal = true; // Keep the existing behavior but log the issue
    // throw new ApiError(httpStatus.FORBIDDEN, 'journal entry not matching');
  }
  if (validJournal) {
    console.log(InvoiceDetails, 'the invoice details');
    const data = await addInvoice(body, journal_entry, taxItems, req.userId, InvoiceDetails, req.userName);
    console.log('adding data', data);
    //---Mailing service was written here---
    return data;
  }
};

const proDetails = async (req, res) => {
  try {
    const result = await genericService.getProDetails(req.params.module, req.params.processId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the process');
    }
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to handle the Create Visa Process in the module - ${req.body.module}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger(req.body.module, req.userId, logString);
    res.status(400).json({ message: 'Unable to handle the Create Visa Process', details: error });
  }
};

/**
 * ===================================================================================
 * The ApproveInvoice function updates the status of an invoice based on whether the current date
 *  is past its due date, setting the status to either "Overdue" or "Due." It then logs this status
 *  update action, including the user who approved the invoice and the invoice ID, using an invoice
 *  logging service. Finally, the function responds with the result of the invoice update, while catching
 *  and logging any errors that may occur during the process.
 * ===================================================================================
 */
const ApproveInvoice = async (req, res) => {
  try {
    const response = await genericService.approveInvoice(req.body, req);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to approve the invoice');
    }
    const logString = logger.info(`${req.userName} Approved the invoice - ${req.body.invoice_number}`).transports[0]
      .logString;
    await loggerService.createLogger('invoice', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    // console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to approve the invoice - ${req.body.invoice_number}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('invoice', req.userId, logString);
    res.status(400).json({ message: 'Unable to approve the invoice', details: error?.message });
  }
};

/**
 * This function sends emails to users requesting the update of their details
 * It basically forwards the intended email to employees with an embedded link
 * The users can then update their details without entering their passwords
 * Note that the token send out to users have an expiration period of three days
 */
const genericRequestUserInfoUpdate = catchAsync(async (req, res) => {
  try {
    // Determine the protocol (http or https)
    const protocol = req.protocol; //http
    // Get the host (hostname and port)
    const host = req.get('host'); //localhost:4100
    // Construct the base URL
    const baseUrl = `${protocol}://${host}`; //http://localhost:4100
    // Make the base URL available to the request object
    req.baseUrl = baseUrl;
    // console.log("base url is --> ", baseUrl)
    requestUserInfoUpdate(req.body.subject, req.body.text, req.body.cc, req.body.attachments, baseUrl).then(async result => {
      console.log('Email sent successfully: ', requestUserInfoUpdate);
      // await new EmailLog(req.body).save()
    });
    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    console.log('error ', error);
    res.status(400).json({ message: 'Unable to Send Mail', details: error });
  }
});

const genericRequestTenancyAndResidenceUpdate = catchAsync(async (req, res) => {
  try {
    // Determine the protocol (http or https)
    const protocol = req.protocol; //http
    // Get the host (hostname and port)
    const host = req.get('host'); //localhost:4100
    // Construct the base URL
    const baseUrl = `${protocol}://${host}`; //http://localhost:4100
    // Make the base URL available to the request object
    req.baseUrl = baseUrl;
    // console.log("base url is --> ", baseUrl)
    requestTenancyandResidencyDetails(req.body.subject, baseUrl, req.body.users).then(async result => {
      console.log('Email sent successfully: ', requestTenancyandResidencyDetails);
      // await new EmailLog(req.body).save()
    });
    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    console.log('error ', error);
    res.status(400).json({ message: 'Unable to Send Mail', details: error });
  }
});

const updateCompanyAndUserRecords = async (req, res) => {
  try {
    const response = await genericService.updateUserDetailsAndCompanyDetails(req.body.userIds);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update company details');
    }
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * This is a one-time function to get users without onboarding
 * Note that the function can be phased out when needed
 */
const getUsersWithourOffboarding = async (req, res) => {
  try {
    const response = await genericService.getUsersWithoutOffBoarding();
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update company details');
    }
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    throw new Error(error);
  }
};

const missinVisaDeleteFunction = async (req, res) => {
  try {
    const response = await genericService.missinVisaDeleteFunction();
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to edit employees on mission visa');
    }
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const markEmployeesAsDeleted = async (req, res) => {
  try {
    const response = await genericService.newFunction(req.params.companyId);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to edit employees on mission visa');
    }
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const markEmployeesOnMissionVisaAsInactiveByUserId = async (req, res) => {
  try {
    console.log('this is the active path ****************');
    const response = await genericService.markEmployeesOnMissionVisaAsInactiveByUserId(req.body.userIds);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to edit employees on mission visa');
    }
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const exportUserData = catchAsync(async (req, res) => {
  const pipeline = [
    {
      $match: {
        is_deleted: false,
        user_status: { $in: ['onboarding', 'new visa process', 'active'] }
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        localField: '_id',
        foreignField: 'user_id',
        as: 'onboardingDetails'
      }
    },
    {
      $unwind: {
        path: '$onboardingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'visa_processes',
        let: { onboardingId: '$onboardingDetails._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$foreign_id', '$$onboardingId']
              }
            }
          }
        ],
        as: 'visaProcessDetails'
      }
    },
    {
      $unwind: {
        path: '$visaProcessDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'documents',
        let: { userId: '$_id', onboardingId: '$onboardingDetails._id', visaId: '$visaProcessDetails._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: [
                      '$type',
                      [
                        { $toObjectId: '650dba596a348a1a1022945f' },
                        { $toObjectId: '64229e20bf0f5a1ca8b5117d' },
                        { $toObjectId: '64ec534ca721df8c76728541' },
                        { $toObjectId: '65bce579ee896e3f7824d243' },
                        { $toObjectId: '64254208e92b0c35c0541ce8' }
                      ]
                    ]
                  },
                  {
                    $or: [
                      { $eq: ['$foreign_id', '$$userId'] },
                      { $eq: ['$foreign_id', '$$onboardingId'] },
                      { $eq: ['$foreign_id', '$$visaId'] }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'documentDetails'
      }
    },
    {
      $lookup: {
        from: 'document_types',
        localField: 'documentDetails.type',
        foreignField: '_id',
        as: 'documentTypeDetails'
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        last_name: 1,
        gender: '$personal.gender',
        address: '$personal.address',
        nationality: '$personal.nationality',
        phone: '$personal.phone',
        dob: '$personal.dob',
        user_status: 1,
        visa: '$visaProcessDetails._id',
        documents: {
          $reduce: {
            input: {
              $map: {
                input: '$documentDetails',
                as: 'doc',
                in: {
                  name: {
                    $let: {
                      vars: {
                        matchedType: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$documentTypeDetails',
                                as: 'type',
                                cond: { $eq: ['$$type._id', '$$doc.type'] }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: '$$matchedType.name'
                    }
                  },
                  expiry: '$$doc.expiry',
                  document_number: '$$doc.document_number'
                }
              }
            },
            initialValue: [],
            in: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$$this.document_number', null] },
                    { $ne: ['$$this.document_number', ''] },
                    { $ne: ['$$this.document_number', 'undefined'] }
                  ]
                },
                { $concatArrays: ['$$value', ['$$this']] },
                {
                  $cond: [
                    {
                      $anyElementTrue: {
                        $map: {
                          input: '$$value',
                          as: 'item',
                          in: { $eq: ['$$item.name', '$$this.name'] }
                        }
                      }
                    },
                    '$$value',
                    { $concatArrays: ['$$value', ['$$this']] }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ];

  const users = await Users.aggregate(pipeline);

  const workBook = new excelJs.Workbook();
  const sheet = workBook.addWorksheet('User Data');

  // Define columns
  sheet.columns = [
    { header: 'First Name', key: 'first_name', width: 20 },
    { header: 'Last Name', key: 'last_name', width: 20 },
    { header: 'Gender', key: 'gender', width: 15 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'Nationality', key: 'nationality', width: 20 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Date of Birth', key: 'dob', width: 20 },
    { header: 'User Status', key: 'user_status', width: 20 },
    { header: 'Passport Name', key: 'passport_name', width: 20 },
    { header: 'Passport Expiry', key: 'passport_expiry', width: 20 },
    { header: 'Passport Number', key: 'passport_number', width: 20 },
    { header: 'Labour Card Name', key: 'labour_card_name', width: 20 },
    { header: 'Labour Card Expiry', key: 'labour_card_expiry', width: 20 },
    { header: 'Labour Card Number', key: 'labour_card_number', width: 20 },
    { header: 'Emirates ID Name', key: 'emirates_id_name', width: 20 },
    { header: 'Emirates ID Expiry', key: 'emirates_id_expiry', width: 20 },
    { header: 'Emirates ID Number', key: 'emirates_id_number', width: 20 },
    { header: 'MOL WPS Number Name', key: 'mol_wps_name', width: 25 },
    { header: 'MOL WPS Number Expiry', key: 'mol_wps_expiry', width: 25 },
    { header: 'MOL WPS Number', key: 'mol_wps_number', width: 25 }
  ];

  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Apply styles to all cells
  const applyStylesToRow = row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  };

  applyStylesToRow(headerRow);

  // Add data rows
  users.forEach(user => {
    const rowData = {
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      address: user.address,
      nationality: user.nationality,
      phone: user.phone,
      dob: user.dob,
      user_status: user.user_status
    };

    // Process documents
    user.documents.forEach(doc => {
      if (doc.name === 'Passport') {
        rowData.passport_name = doc.name;
        rowData.passport_expiry = doc.expiry;
        rowData.passport_number = doc.document_number;
      } else if (doc.name === 'Labour Card') {
        rowData.labour_card_name = doc.name;
        rowData.labour_card_expiry = doc.expiry;
        rowData.labour_card_number = doc.document_number;
      } else if (doc.name === 'Emirates ID') {
        rowData.emirates_id_name = doc.name;
        rowData.emirates_id_expiry = doc.expiry;
        rowData.emirates_id_number = doc.document_number;
      } else if (doc.name === 'MOL WPS Number') {
        rowData.mol_wps_name = doc.name;
        rowData.mol_wps_expiry = doc.expiry;
        rowData.mol_wps_number = doc.document_number;
      }
    });

    const row = sheet.addRow(rowData);
    applyStylesToRow(row);
  });

  // Auto-fit columns
  sheet.columns.forEach(column => {
    column.width = Math.max(column.width, 15);
  });

  // Set headers for file download
  res.setHeader('Content-Disposition', 'attachment; filename=UserData.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  // Write the workbook to the response
  await workBook.xlsx.write(res);

  // End the response
  res.end();
});
const exportEmployeeData = catchAsync(async (req, res) => {
  const pipeline = [
    {
      $match: {
        user_status: { $in: ['active', 'onboarding', 'new visa process'] }
        // "personal.designation":"Telecommunication Assistant"
      }
    },
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
        from: 'documents',
        let: { user_id: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$foreign_id', '$$user_id'] },
                  {
                    $in: [
                      '$type',
                      [
                        ObjectId('64254208e92b0c35c0541ce8'), // Passport Number
                        ObjectId('65bce579ee896e3f7824d243'), // Visa Number
                        ObjectId('64229e20bf0f5a1ca8b5117d'), // Emirates ID Number
                        ObjectId('6412c9795d3c723a3cf939d6') // Labor Card Number
                      ]
                    ]
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'document_types',
              localField: 'type',
              foreignField: '_id',
              as: 'documentTypeDetails'
            }
          },
          {
            $unwind: {
              path: '$documentTypeDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              documentName: '$documentTypeDetails.name',
              document_number: 1,
              expiry: 1,
              type: 1
            }
          }
        ],
        as: 'allDocuments'
      }
    },
    {
      $project: {
        employeeName: {
          $concat: [
            '$first_name',
            ' ',
            { $ifNull: ['$middle_name', ''] },
            { $cond: { if: { $ne: ['$middle_name', null] }, then: ' ', else: '' } },
            '$last_name'
          ]
        },
        email: 1,
        phoneNumber: '$personal.phone',
        gender: '$personal.gender',
        marital_status: '$personal.marital_status',
        Nationality: '$personal.nationality',
        DOB: '$personal.dob',
        companyName: '$companyDetails.company_name',
        InternalDesignation: {
          $cond: {
            if: { $eq: ['$personal.designation', 'Telecommunication Assistant'] },
            then: 'Not Applicable',
            else: '$personal.designation'
          }
        },
        VisaDesignation: '$personal.designation',
        DateOfJoining: '$date_of_joining',

        // Passport fields
        passportNumber: {
          $let: {
            vars: {
              passport: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('64254208e92b0c35c0541ce8')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$passport.document_number'
          }
        },
        passportExpiry: {
          $let: {
            vars: {
              passport: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('64254208e92b0c35c0541ce8')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$passport.expiry'
          }
        },

        // Visa fields
        visaNumber: {
          $let: {
            vars: {
              visa: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('65bce579ee896e3f7824d243')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$visa.document_number'
          }
        },
        visaExpiry: {
          $let: {
            vars: {
              visa: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('65bce579ee896e3f7824d243')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$visa.expiry'
          }
        },

        // Emirates ID fields
        emiratesIdNumber: {
          $let: {
            vars: {
              emiratesId: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('64229e20bf0f5a1ca8b5117d')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$emiratesId.document_number'
          }
        },
        emiratesIdExpiry: {
          $let: {
            vars: {
              emiratesId: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('64229e20bf0f5a1ca8b5117d')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$emiratesId.expiry'
          }
        },

        // Labor Card fields
        laborCardNumber: {
          $let: {
            vars: {
              laborCard: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('6412c9795d3c723a3cf939d6')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$laborCard.document_number'
          }
        },
        laborCardExpiry: {
          $let: {
            vars: {
              laborCard: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$allDocuments',
                      as: 'doc',
                      cond: { $eq: ['$$doc.type', ObjectId('6412c9795d3c723a3cf939d6')] }
                    }
                  },
                  0
                ]
              }
            },
            in: '$$laborCard.expiry'
          }
        }
      }
    }
  ];

  const users = await Users.aggregate(pipeline);

  const workBook = new excelJs.Workbook();
  const sheet = workBook.addWorksheet('Employee Data');

  // Define columns
  sheet.columns = [
    { header: 'Employee Name', key: 'employeeName', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone Number', key: 'phoneNumber', width: 20 },
    { header: 'Gender', key: 'gender', width: 15 },
    { header: 'Marital Status', key: 'marital_status', width: 15 },
    { header: 'Nationality', key: 'Nationality', width: 20 },
    { header: 'Date of Birth', key: 'DOB', width: 15 },
    { header: 'Company Name', key: 'companyName', width: 25 },
    { header: 'Internal Designation', key: 'InternalDesignation', width: 25 },
    { header: 'Visa Designation', key: 'VisaDesignation', width: 25 },
    { header: 'Date of Joining', key: 'DateOfJoining', width: 15 },
    { header: 'Passport Number', key: 'passportNumber', width: 20 },
    { header: 'Passport Expiry', key: 'passportExpiry', width: 15 },
    { header: 'Visa Number', key: 'visaNumber', width: 20 },
    { header: 'Visa Expiry', key: 'visaExpiry', width: 15 },
    { header: 'Emirates ID Number', key: 'emiratesIdNumber', width: 20 },
    { header: 'Emirates ID Expiry', key: 'emiratesIdExpiry', width: 15 },
    { header: 'Labor Card Number', key: 'laborCardNumber', width: 20 },
    { header: 'Labor Card Expiry', key: 'laborCardExpiry', width: 15 }
  ];

  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Apply styles to all cells
  const applyStylesToRow = row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  };

  applyStylesToRow(headerRow);

  // Format dates if needed
  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
  };

  // Add data rows
  users.forEach(user => {
    const rowData = {
      employeeName: user.employeeName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      marital_status: user.marital_status,
      Nationality: user.Nationality,
      DOB: formatDate(user.DOB),
      companyName: user.companyName,
      InternalDesignation: user.InternalDesignation,
      VisaDesignation: user.VisaDesignation,
      DateOfJoining: formatDate(user.DateOfJoining),
      passportNumber: user.passportNumber,
      passportExpiry: formatDate(user.passportExpiry),
      visaNumber: user.visaNumber,
      visaExpiry: formatDate(user.visaExpiry),
      emiratesIdNumber: user.emiratesIdNumber,
      emiratesIdExpiry: formatDate(user.emiratesIdExpiry),
      laborCardNumber: user.laborCardNumber,
      laborCardExpiry: formatDate(user.laborCardExpiry)
    };

    const row = sheet.addRow(rowData);
    applyStylesToRow(row);
  });

  // Auto-fit columns
  sheet.columns.forEach(column => {
    column.width = Math.max(column.width || 0, 15);
  });

  // Set headers for file download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=EmployeeData.xlsx');

  // Write to response
  await workBook.xlsx.write(res);
  res.end();
});

/**
 * Function to send welcome emails to clients on the portal
 * This implementation is complete but awaits confirmation and to address and cc
 * Once done, this can be initiated via postman
 */

const sendAnnouncementEmail = catchAsync(async (req, res) => {
  try {
    const response = await emailService.sendAnnouncementEmail();
    const logString = logger.info(`${req.userName} Accessed the functionality to send welcome emails on the portal`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to send announcement email, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(error);
  }
});

/**
 * ======================================================================
 * This function is the implementation of internal resources space
 * This is essential for PEO documents shared with insurance Portal
 * ======================================================================
 */
const fetcgDocumentsFromSharedResource = catchAsync(async (req, res) => {
  try {
    const response = await genericService.fetcgDocumentsFromSharedResource(req.query);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

const sendRamadhanEmailForEmployees = catchAsync(async (req, res) => {
  try {
    const response = await genericService.sendResidentsUpdateEmailForEmployees();
    res.status(httpStatus.OK).json({ message: 'Emails sent tto employees' });
  } catch (error) {
    throw new Error(error);
  }
});
const sendRamadhanEmailForClients = catchAsync(async (req, res) => {
  try {
    const response = await genericService.sendRamadhanEmailForClients();
    res.status(httpStatus.OK).json({ message: 'Emails sent tto employees' });
  } catch (error) {
    throw new Error(error);
  }
});


module.exports = {
  sendRamadhanEmailForEmployees,
  sendRamadhanEmailForClients,
  searchLeadsOnboardingVisProcessOffboardingsRenewalRequest,
  filterLeadsOnboardingVisProcessOffboardingsRenewalRequest,
  genericSendEmail,
  getAllDetailsProcessFlow,
  processFlowMarkUnsuccessful,
  processFlowMoveForward,
  processFlowMoveBackward,
  getModuleData,
  updateModuleData,
  createInvoice,
  getInvoiceDetails,
  createVisaProcess,
  processFlowUpdate,
  genericSendRawEmail,
  processActionDocument,
  proDetails,
  processRejectApplication,
  processActionGenerateDocument,
  ApproveInvoice,
  // editCompanyRecords,
  genericRequestUserInfoUpdate,
  updateCompanyAndUserRecords,
  getUsersWithourOffboarding,
  missinVisaDeleteFunction,
  markEmployeesAsDeleted,
  markEmployeesOnMissionVisaAsInactiveByUserId,
  genericRequestTenancyAndResidenceUpdate,
  exportUserData,
  sendAnnouncementEmail,
  mobileInvite,
  fetcgDocumentsFromSharedResource,
  sendMultipleInvoices,
  processFlowMoveToStage
  // genericSendbulkInvoices
  // eidEmail
};
