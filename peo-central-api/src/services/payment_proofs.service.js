const { ObjectId } = require('mongodb');
const { PaymentProofs } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const createPaymentProof = async (paymentProofBody) => {
  const paymentProof = new PaymentProofs(paymentProofBody);
  return await paymentProof.save();
};

const getPaymentProofById = async (paymentProofId) => {
  const paymentProof = await PaymentProofs.findById(paymentProofId)
    .populate('invoice_id', 'invoice_number total customer')
    .populate('customer_id', 'company_name')
    .populate('uploaded_by', 'first_name last_name email')
    .populate('reviewed_by', 'first_name last_name email');

  if (!paymentProof) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment proof not found');
  }
  return paymentProof;
};

const updatePaymentProofById = async (paymentProofId, updateBody) => {
  const paymentProof = await PaymentProofs.findByIdAndUpdate(
    paymentProofId,
    { $set: updateBody },
    { new: true }
  )
    .populate('invoice_id', 'invoice_number total customer')
    .populate('customer_id', 'company_name')
    .populate('uploaded_by', 'first_name last_name email')
    .populate('reviewed_by', 'first_name last_name email');

  if (!paymentProof) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment proof not found');
  }
  return paymentProof;
};

const deletePaymentProof = async (paymentProofId) => {
  const paymentProof = await PaymentProofs.findByIdAndUpdate(
    paymentProofId,
    { $set: { is_deleted: true } },
    { new: true }
  );

  if (!paymentProof) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment proof not found');
  }
  return paymentProof;
};

const getPaymentProofsByInvoice = async (invoiceId, options = {}) => {
  const filter = {
    invoice_id: ObjectId(invoiceId),
    is_deleted: false,
  };

  const paymentProofs = await PaymentProofs.paginate(filter, {
    ...options,
    populate: [
      { path: 'customer_id', select: 'company_name' },
      { path: 'uploaded_by', select: 'first_name last_name email' },
      { path: 'reviewed_by', select: 'first_name last_name email' },
    ],
  });

  return paymentProofs;
};

const getPaymentProofsByCustomer = async (customerId, options = {}) => {
  const filter = {
    customer_id: ObjectId(customerId),
    is_deleted: false,
  };

  const paymentProofs = await PaymentProofs.paginate(filter, {
    ...options,
    populate: [
      { path: 'invoice_id', select: 'invoice_number total' },
      { path: 'uploaded_by', select: 'first_name last_name email' },
      { path: 'reviewed_by', select: 'first_name last_name email' },
    ],
  });

  return paymentProofs;
};

const getPaymentProofsByStatus = async (status, options = {}) => {
  const filter = {
    status: status,
    is_deleted: false,
  };

  const paymentProofs = await PaymentProofs.paginate(filter, {
    ...options,
    populate: [
      { path: 'invoice_id', select: 'invoice_number total customer' },
      { path: 'customer_id', select: 'company_name' },
      { path: 'uploaded_by', select: 'first_name last_name email' },
      { path: 'reviewed_by', select: 'first_name last_name email' },
    ],
  });

  return paymentProofs;
};

const getAllPaymentProofs = async (options = {}) => {
  const filter = {
    is_deleted: false,
  };

  // Add search functionality if search parameter is provided
  if (options.search) {
    filter.$or = [
      { payment_reference: { $regex: options.search, $options: 'i' } },
      { file_name: { $regex: options.search, $options: 'i' } },
      { notes: { $regex: options.search, $options: 'i' } },
    ];
  }

  // Add status filter if provided
  if (options.status) {
    filter.status = options.status;
  }

  // Add customer filter if provided
  if (options.customer_id) {
    filter.customer_id = ObjectId(options.customer_id);
  }

  // Add date range filter if provided
  if (options.start_date || options.end_date) {
    filter.upload_date = {};
    if (options.start_date) {
      filter.upload_date.$gte = new Date(options.start_date);
    }
    if (options.end_date) {
      filter.upload_date.$lte = new Date(options.end_date);
    }
  }

  const paymentProofs = await PaymentProofs.paginate(filter, {
    ...options,
    populate: [
      { path: 'invoice_id', select: 'invoice_number total customer' },
      { path: 'customer_id', select: 'company_name' },
      { path: 'uploaded_by', select: 'first_name last_name email' },
      { path: 'reviewed_by', select: 'first_name last_name email' },
    ],
  });

  return paymentProofs;
};

const reviewPaymentProof = async (paymentProofId, reviewData, reviewedBy) => {
  const updateData = {
    ...reviewData,
    reviewed_by: reviewedBy,
    reviewed_date: new Date(),
  };

  const paymentProof = await PaymentProofs.findByIdAndUpdate(
    paymentProofId,
    { $set: updateData },
    { new: true }
  )
    .populate('invoice_id', 'invoice_number total customer')
    .populate('customer_id', 'company_name')
    .populate('uploaded_by', 'first_name last_name email')
    .populate('reviewed_by', 'first_name last_name email');

  if (!paymentProof) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment proof not found');
  }

  return paymentProof;
};

const getPaymentProofStats = async (customerId = null) => {
  const matchFilter = { is_deleted: false };

  if (customerId) {
    matchFilter.customer_id = ObjectId(customerId);
  }

  const stats = await PaymentProofs.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$converted_amount_aed' },
      },
    },
    {
      $group: {
        _id: null,
        totalProofs: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' },
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            amount: '$totalAmount',
          },
        },
      },
    },
  ]);

  return stats[0] || {
    totalProofs: 0,
    totalAmount: 0,
    statusBreakdown: [],
  };
};

const updateCreatedBy = async (paymentProofId, userId) => {
  return PaymentProofs.findOneAndUpdate(
    { _id: paymentProofId },
    { $set: { created_by: userId } }
  );
};

const updateUpdatedBy = async (paymentProofId, userId) => {
  return PaymentProofs.findOneAndUpdate(
    { _id: paymentProofId },
    { $set: { updated_by: userId } }
  );
};

module.exports = {
  createPaymentProof,
  getPaymentProofById,
  updatePaymentProofById,
  deletePaymentProof,
  getPaymentProofsByInvoice,
  getPaymentProofsByCustomer,
  getPaymentProofsByStatus,
  getAllPaymentProofs,
  reviewPaymentProof,
  getPaymentProofStats,
  updateCreatedBy,
  updateUpdatedBy,
};
