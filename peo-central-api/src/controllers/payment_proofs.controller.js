const httpStatus = require('http-status');
const { paymentProofsService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { loggerService } = require('../services');
const {ObjectId} = require('mongodb');

const createPaymentProof = catchAsync(async (req, res) => {
  try {
    const paymentProof = await paymentProofsService.createPaymentProof(req.body);
    const created_by = await paymentProofsService.updateCreatedBy(paymentProof._id, req.userId);

    const logString = logger.info(`${req.userName} Created a Payment Proof with ID ${paymentProof._id}`).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    // Send email notification after successful payment proof creation
    try {
      const { emailService } = require('../services');
      const { Users, Invoice, Poc, Companies } = require('../models');

      // Get user data for email
      let userData; 
      let companyDoc;
      userData = await Users.findById(req.userId).select('first_name last_name email company_id');
      if(!userData){
        console.log(req.userId, "the second block")
        const pocData = await Poc.findOne({ _id: ObjectId(req.userId) }).select('email name company_id');
        userData = pocData;
      }
      companyDoc = await Companies.findById(userData.company_id).select('company_name');


      // Get invoice data for email
      const invoiceData = await Invoice.findById(req.body.invoice_id).select('invoice_number total_amount');

      if (userData && invoiceData) {
        console.log(userData, "user data")
        console.log(invoiceData, "invoice data")
        await emailService.sendPaymentProofAttachedEmail(paymentProof, userData, invoiceData, companyDoc);
        console.log(`Payment proof notification email sent for invoice ${invoiceData.invoice_number}`);
      } else {
          console.log(userData, "user data")
        console.log(invoiceData, "invoice data")
        console.warn('Could not send payment proof notification email - missing user or invoice data');
      }
    } catch (emailError) {
      // Don't fail the payment proof creation if email fails
      console.error('Failed to send payment proof notification email:', emailError);
    }

    res.status(httpStatus.CREATED).send(paymentProof);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create a Payment Proof, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Payment Proof. Please Check the Input', details: error });
  }
});

const getPaymentProofById = catchAsync(async (req, res) => {
  try {
    const paymentProof = await paymentProofsService.getPaymentProofById(req.params.paymentProofId);

    const logString = logger.info(
      `${req.userName} Accessed Payment Proof with ID - ${req.params.paymentProofId}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProof);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Payment Proof with ID - ${req.params.paymentProofId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Payment Proof for the Given ID.', details: error });
  }
});

const updatePaymentProof = catchAsync(async (req, res) => {
  try {
    const paymentProof = await paymentProofsService.updatePaymentProofById(req.params.paymentProofId, req.body);
    const updatedBy = await paymentProofsService.updateUpdatedBy(req.params.paymentProofId, req.userId);

    const logString = logger.info(`${req.userName} Updated Payment Proof with ID - ${req.params.paymentProofId}`)
      .transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProof);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Payment Proof with ID - ${req.params.paymentProofId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Payment Proof. Please Check the Input', details: error });
  }
});

const deletePaymentProof = catchAsync(async (req, res) => {
  try {
    const paymentProof = await paymentProofsService.deletePaymentProof(req.params.paymentProofId);
    const updatedBy = await paymentProofsService.updateUpdatedBy(req.params.paymentProofId, req.userId);

    const logString = logger.info(`${req.userName} Deleted Payment Proof with ID - ${req.params.paymentProofId}`)
      .transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProof);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete Payment Proof with ID - ${req.params.paymentProofId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete Payment Proof for the Given ID.', details: error });
  }
});

const getPaymentProofsByInvoice = catchAsync(async (req, res) => {
  try {
    const paymentProofs = await paymentProofsService.getPaymentProofsByInvoice(req.params.invoiceId, req.query);

    const logString = logger.info(`${req.userName} Accessed Payment Proofs for Invoice - ${req.params.invoiceId}`)
      .transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProofs);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Payment Proofs for Invoice - ${req.params.invoiceId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Payment Proofs for the Given Invoice.', details: error });
  }
});

const getPaymentProofsByCustomer = catchAsync(async (req, res) => {
  try {
    const paymentProofs = await paymentProofsService.getPaymentProofsByCustomer(req.params.customerId, req.query);

    const logString = logger.info(`${req.userName} Accessed Payment Proofs for Customer - ${req.params.customerId}`)
      .transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProofs);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Payment Proofs for Customer - ${req.params.customerId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Payment Proofs for the Given Customer.', details: error });
  }
});

const getPaymentProofsByStatus = catchAsync(async (req, res) => {
  try {
    const paymentProofs = await paymentProofsService.getPaymentProofsByStatus(req.params.status, req.query);

    const logString = logger.info(`${req.userName} Accessed Payment Proofs with Status - ${req.params.status}`)
      .transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProofs);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Payment Proofs with Status - ${req.params.status}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Payment Proofs for the Given Status.', details: error });
  }
});

const getAllPaymentProofs = catchAsync(async (req, res) => {
  try {
    const paymentProofs = await paymentProofsService.getAllPaymentProofs(req.query);

    const logString = logger.info(`${req.userName} Accessed all Payment Proofs`).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProofs);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Payment Proofs, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Payment Proofs.', details: error });
  }
});

const reviewPaymentProof = catchAsync(async (req, res) => {
  try {
    const paymentProof = await paymentProofsService.reviewPaymentProof(
      req.params.paymentProofId,
      req.body,
      req.userId
    );

    const logString = logger.info(`${req.userName} Reviewed Payment Proof with ID - ${req.params.paymentProofId}`)
      .transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(paymentProof);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Review Payment Proof with ID - ${req.params.paymentProofId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Review Payment Proof. Please Check the Input', details: error });
  }
});

const getPaymentProofStats = catchAsync(async (req, res) => {
  try {
    const stats = await paymentProofsService.getPaymentProofStats(req.query.customer_id);

    const logString = logger.info(`${req.userName} Accessed Payment Proof Statistics`).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);

    res.status(httpStatus.OK).send(stats);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Payment Proof Statistics, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('paymentproofs', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Payment Proof Statistics.', details: error });
  }
});

module.exports = {
  createPaymentProof,
  getPaymentProofById,
  updatePaymentProof,
  deletePaymentProof,
  getPaymentProofsByInvoice,
  getPaymentProofsByCustomer,
  getPaymentProofsByStatus,
  getAllPaymentProofs,
  reviewPaymentProof,
  getPaymentProofStats,
};
