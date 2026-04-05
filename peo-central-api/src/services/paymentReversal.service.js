const { Payment } = require('../models');
const { Invoice } = require('../models');
const { ObjectId } = require('mongodb');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const mongoose = require('mongoose');

/**
 * Reverse a payment and update related invoices
 * @param {string} paymentId - Payment ID to reverse
 * @param {string} userId - User ID performing the reversal
 * @param {string} userName - User name performing the reversal
 * @param {string} reason - Reason for reversal
 * @returns {Promise<Object>} Reversal result
 */
const reversePayment = async (paymentId, userId, userName, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the payment
    const payment = await Payment.findOne({
      _id: ObjectId(paymentId),
      is_deleted: 0
    }).session(session);

    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    // Check if payment is already reversed
    if (payment.is_reversed) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment has already been reversed');
    }

    // Get all invoices affected by this payment
    const affectedInvoices = [];

    if (payment.is_multi_invoice && payment.invoice_allocations) {
      // Multi-invoice payment
      for (const allocation of payment.invoice_allocations) {
        const invoice = await Invoice.findById(allocation.invoice_id).session(session);
        if (invoice) {
          affectedInvoices.push({
            invoice,
            allocation,
            originalPartialAmount: invoice.partial_amount || 0,
            originalStatus: invoice.status,
            originalPaid: invoice.paid
          });
        }
      }
    } else if (payment.invoice) {
      // Single invoice payment
      const invoice = await Invoice.findById(payment.invoice).session(session);
      if (invoice) {
        affectedInvoices.push({
          invoice,
          allocation: {
            amount: payment.amount,
            bank_charge: payment.bank_charge || 0,
            total_payment: payment.amount + (payment.bank_charge || 0)
          },
          originalPartialAmount: invoice.partial_amount || 0,
          originalStatus: invoice.status,
          originalPaid: invoice.paid
        });
      }
    }

    // Calculate new invoice statuses after reversal
    for (const { invoice, allocation } of affectedInvoices) {
      const currentPartialAmount = invoice.partial_amount || 0;
      const totalPaymentAmount = allocation.total_payment || (allocation.amount + (allocation.bank_charge || 0));
      const newPartialAmount = Math.max(0, currentPartialAmount - totalPaymentAmount);

      // Determine new status
      let newStatus = 'Due';
      if (newPartialAmount > 0) {
        newStatus = 'Partially Paid';
      }

      // Update invoice
      const beforeUpdate = invoice.toObject();
      invoice.partial_amount = newPartialAmount;
      invoice.paid = newPartialAmount > 0;
      invoice.status = newStatus;

      // Remove shortfall fields if they exist
      if (invoice.shortfall_amount) {
        invoice.shortfall_amount = undefined;
        invoice.shortfall_date = undefined;
        invoice.shortfall_reason = undefined;
        invoice.shortfall_approved_by = undefined;
      }

      await invoice.save({ session });

      // Create invoice log
      const invoiceLogService = require('./invoice_logs.service');
      await invoiceLogService.createInvoiceLog({
        user_id: userId,
        document_id: invoice._id,
        dataBeforeUpdationOrCreation: beforeUpdate,
        updatedFields: {
          partial_amount: { from: beforeUpdate.partial_amount, to: newPartialAmount },
          status: { from: beforeUpdate.status, to: newStatus },
          paid: { from: beforeUpdate.paid, to: newPartialAmount > 0 }
        },
        module: 'invoice',
        createdOrUpdateData: invoice,
        logMessage: `${userName} reversed payment ${payment.payment_number} for invoice ${invoice.invoice_number}. Status changed from ${beforeUpdate.status} to ${newStatus}. Reason: ${reason}`
      });
    }

    // Mark payment as reversed
    const beforePaymentUpdate = payment.toObject();
    payment.is_reversed = true;
    payment.reversed_at = new Date();
    payment.reversed_by = userId;
    payment.reversal_reason = reason;
    payment.is_deleted = 1; // Soft delete

    await payment.save({ session });

    // Create payment log
    const invoiceLogService = require('./invoice_logs.service');
    await invoiceLogService.createInvoiceLog({
      user_id: userId,
      document_id: payment._id,
      dataBeforeUpdationOrCreation: beforePaymentUpdate,
      updatedFields: {
        is_reversed: { from: false, to: true },
        reversed_at: { from: null, to: new Date() },
        reversed_by: { from: null, to: userId },
        reversal_reason: { from: null, to: reason },
        is_deleted: { from: 0, to: 1 }
      },
      module: 'payment',
      createdOrUpdateData: payment,
      logMessage: `${userName} reversed payment ${payment.payment_number}. Reason: ${reason}`
    });

    await session.commitTransaction();

    return {
      success: true,
      message: 'Payment reversed successfully',
      payment: {
        _id: payment._id,
        payment_number: payment.payment_number,
        amount: payment.amount,
        reversed_at: payment.reversed_at,
        reversal_reason: reason
      },
      affectedInvoices: affectedInvoices.map(({ invoice, originalStatus }) => ({
        invoice_id: invoice._id,
        invoice_number: invoice.invoice_number,
        previous_status: originalStatus,
        new_status: invoice.status,
        new_partial_amount: invoice.partial_amount
      }))
    };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get payment reversal history
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Array>} Reversal history
 */
const getPaymentReversalHistory = async (paymentId) => {
  try {
    const payment = await Payment.findOne({
      _id: ObjectId(paymentId),
      is_deleted: 1
    }).populate('reversed_by', 'first_name last_name');

    if (!payment || !payment.is_reversed) {
      return null;
    }

    return {
      payment_number: payment.payment_number,
      amount: payment.amount,
      reversed_at: payment.reversed_at,
      reversed_by: payment.reversed_by,
      reversal_reason: payment.reversal_reason
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  reversePayment,
  getPaymentReversalHistory
};
