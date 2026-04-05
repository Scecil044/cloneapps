const { ObjectId } = require('mongodb');
const httpStatus = require('http-status');
const { Payment } = require('../models');
const ApiError = require('../utils/ApiError');

const getPaymentByInvoiceId = async (invoiceId) => {
  try {
    const pipeline = [
      {
        $match: {
          $or: [
            // Individual payments with direct invoice reference
            { invoice: ObjectId(invoiceId) },
            // Bulk payments with invoice in invoice_allocations array
            { 'invoice_allocations.invoice_id': ObjectId(invoiceId) },
          ],
          is_deleted: 0,
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
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoice_allocations.invoice_id',
          foreignField: '_id',
          as: 'bulkInvoiceDetails',
        },
      },
      {
        $unwind: {
          path: '$invoiceDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          bank_charge: 1,
          bank_name: 1,
          bulk_invoices: 1,
          company: 1,
          createdAt: 1,
          customer: 1,
          deposit_to: 1,
          documents: 1,
          invoice: 1,
          invoice_allocations: 1,
          isDebitNote: 1,
          isInvoice: 1,
          is_deleted: 1,
          is_multi_invoice: 1,
          is_reversed: 1,
          is_thanks_required: 1,
          notes: 1,
          payment_date: 1,
          payment_link: 1,
          payment_mode: 1,
          payment_note_link: 1,
          payment_number: 1,
          reference: 1,
          shortfall_invoices_count: 1,
          updatedAt: 1,
          // Currency fields for multi-currency support
          currency: 1,
          conversion_rate: 1,
          base_currency: 1,
          converted_amount_aed: 1,
          visa_sponsor: {
            $cond: {
              if: { $ne: ['$invoiceDetails', null] },
              then: '$invoiceDetails.visa_sponsor',
              else: { $arrayElemAt: ['$bulkInvoiceDetails.visa_sponsor', 0] },
            },
          },
          company_name: {
            $cond: {
              if: { $ne: ['$invoiceDetails', null] },
              then: '$invoiceDetails.customer_name',
              else: { $arrayElemAt: ['$bulkInvoiceDetails.customer_name', 0] },
            },
          },
        },
      },
    ];
    const invoicePayments = await Payment.aggregate(pipeline);
    return invoicePayments;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  getPaymentByInvoiceId,
};
