const httpStatus = require('http-status');
const mongoose = require('mongoose');
const moment = require('moment');
const { InvoiceInputs } = require('../models');
const { emailService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Create invoice input
 * @param {Object} invoiceInputBody
 * @returns {Promise<InvoiceInputs>}
 */
const createInvoiceInput = async (invoiceInputBody) => {
  console.log('Creating invoice input:', invoiceInputBody);

  // Fix obsolete indexes on first use (one-time fix)
  if (!createInvoiceInput._indexesFixed) {
    await InvoiceInputs.fixObsoleteIndexes();
    createInvoiceInput._indexesFixed = true;
  }

  // Validate all user_ids in items exist
  if (invoiceInputBody.items && invoiceInputBody.items.length > 0) {
    const { Users } = require('../models');
    const userIds = invoiceInputBody.items.map(item => item.user_id).filter(Boolean);

    if (userIds.length > 0) {
      const existingUsers = await Users.find({ _id: { $in: userIds }, is_deleted: false });
      const existingUserIds = existingUsers.map(user => user._id.toString());

      const invalidUserIds = userIds.filter(userId => !existingUserIds.includes(userId));
      if (invalidUserIds.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid user IDs: ${invalidUserIds.join(', ')}`);
      }
    }
  }

  // Check if invoice input already exists for the company and month
  const existingInvoice = await InvoiceInputs.findOne({
    company_id: invoiceInputBody.company_id,
    input_month: invoiceInputBody.input_month,
    is_deleted: false
  });

  if (existingInvoice) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invoice input already exists for this company and month');
  }

  return InvoiceInputs.create(invoiceInputBody);
};

/**
 * Query invoice inputs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryInvoiceInputs = async (filter, options) => {
  // Add population for related fields
  const populateOptions = [
    { path: 'company_id', select: 'company_name legal_name email' },
    { path: 'created_by', select: 'first_name last_name email email', name: 'createdBy' },
    { path: 'updated_by', select: 'first_name last_name email email', name: 'updatedBy' },
    { path: 'approved_by', select: 'first_name last_name email email', name: 'approvedBy' },
    { path: 'items.user_id', select: 'first_name last_name email emp_id designation', name: 'items.userId' }
  ];

  const invoiceInputs = await InvoiceInputs.paginate(filter, { ...options, populate: populateOptions });
  return invoiceInputs;
};

/**
 * Get invoice input by id
 * @param {ObjectId} id
 * @returns {Promise<InvoiceInputs>}
 */
const getInvoiceInputById = async (id) => {
  const invoiceInput = await InvoiceInputs.findById(id)
    .populate('company_id', 'company_name legal_name email')
    .populate('created_by', 'first_name last_name email', { name: 'createdBy' })
    .populate('updated_by', 'first_name last_name email', { name: 'updatedBy' })
    .populate('approved_by', 'first_name last_name email', { name: 'approvedBy' })
    .populate('items.user_id', 'first_name last_name email emp_id designation', { name: 'items.userId' });

  if (!invoiceInput || invoiceInput.is_deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice input not found');
  }
  return invoiceInput;
};

/**
 * Update invoice input by id
 * @param {ObjectId} invoiceInputId
 * @param {Object} updateBody
 * @returns {Promise<InvoiceInputs>}
 */
const updateInvoiceInputById = async (invoiceInputId, updateBody) => {
  const invoiceInput = await getInvoiceInputById(invoiceInputId);
  const previousStatus = invoiceInput.status;

  // Validate all user_ids in items exist if items are being updated
  if (updateBody.items && updateBody.items.length > 0) {
    const { Users } = require('../models');
    const userIds = updateBody.items.map(item => item.user_id).filter(Boolean);

    if (userIds.length > 0) {
      const existingUsers = await Users.find({ _id: { $in: userIds }, is_deleted: false });
      const existingUserIds = existingUsers.map(user => user._id.toString());

      const invalidUserIds = userIds.filter(userId => !existingUserIds.includes(userId));
      if (invalidUserIds.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid user IDs: ${invalidUserIds.join(', ')}`);
      }
    }
  }

  // Check if trying to update input_month and if it conflicts
  if (updateBody.input_month && updateBody.input_month !== invoiceInput.input_month) {
    const existingInvoice = await InvoiceInputs.findOne({
      company_id: invoiceInput.company_id,
      input_month: updateBody.input_month,
      _id: { $ne: invoiceInputId },
      is_deleted: false
    });

    if (existingInvoice) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invoice input already exists for this company and month');
    }
  }

  Object.assign(invoiceInput, updateBody);
  await invoiceInput.save();

  // Check if status changed to pending and send approval email
  if (updateBody.status === 'pending' && previousStatus !== 'pending') {
    // Populate company data for email
    await invoiceInput.populate('company_id', 'company_name legal_name email');

    // Send approval email asynchronously
    sendPendingApprovalEmail(invoiceInput).catch(error => {
      logger.error('Failed to send pending approval email:', error);
    });
  }

  return invoiceInput;
};

/**
 * Delete invoice input by id
 * @param {ObjectId} invoiceInputId
 * @returns {Promise<InvoiceInputs>}
 */
const deleteInvoiceInputById = async (invoiceInputId) => {
  const invoiceInput = await getInvoiceInputById(invoiceInputId);
  invoiceInput.is_deleted = true;
  await invoiceInput.save();
  return invoiceInput;
};

/**
 * Get invoice inputs by company id
 * @param {ObjectId} companyId
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getInvoiceInputsByCompanyId = async (companyId, options) => {
  const filter = { company_id: companyId, is_deleted: false };
  return queryInvoiceInputs(filter, options);
};

/**
 * Update invoice status
 * @param {ObjectId} invoiceInputId
 * @param {string} status
 * @param {ObjectId} userId
 * @returns {Promise<InvoiceInputs>}
 */
const updateInvoiceStatus = async (invoiceInputId, status, userId) => {
  const invoiceInput = await getInvoiceInputById(invoiceInputId);
  const previousStatus = invoiceInput.status;

  const updateData = {
    status: status,
    updated_by: userId
  };

  if (status === 'approved') {
    updateData.approved_by = userId;
    updateData.approved_date = new Date();
  }

  Object.assign(invoiceInput, updateData);
  await invoiceInput.save();

  // Check if status changed to pending and send approval email
  if (status === 'pending' && previousStatus !== 'pending') {
    // Populate company data for email
    await invoiceInput.populate('company_id', 'company_name legal_name email');

    // Send approval email asynchronously
    sendPendingApprovalEmail(invoiceInput).catch(error => {
      logger.error('Failed to send pending approval email:', error);
    });
  }

  return invoiceInput;
};

/**
 * Add receipt to invoice input item
 * @param {ObjectId} invoiceInputId
 * @param {ObjectId} itemId
 * @param {Object} receiptData
 * @returns {Promise<InvoiceInputs>}
 */
const addReceiptToInvoiceItem = async (invoiceInputId, itemId, receiptData) => {
  const invoiceInput = await getInvoiceInputById(invoiceInputId);

  const item = invoiceInput.items.id(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }

  item.receipts.push({
    filename: receiptData.filename,
    file_url: receiptData.file_url
  });

  await invoiceInput.save();
  return invoiceInput;
};

/**
 * Remove receipt from invoice input item
 * @param {ObjectId} invoiceInputId
 * @param {ObjectId} itemId
 * @param {ObjectId} receiptId
 * @returns {Promise<InvoiceInputs>}
 */
const removeReceiptFromInvoiceItem = async (invoiceInputId, itemId, receiptId) => {
  const invoiceInput = await getInvoiceInputById(invoiceInputId);

  const item = invoiceInput.items.id(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }

  item.receipts = item.receipts.filter(
    receipt => receipt._id.toString() !== receiptId.toString()
  );

  await invoiceInput.save();
  return invoiceInput;
};

/**
 * Get invoice inputs statistics by company
 * @param {ObjectId} companyId
 * @returns {Promise<Object>}
 */
const getInvoiceInputsStatsByCompany = async (companyId) => {
  const stats = await InvoiceInputs.aggregate([
    {
      $match: {
        company_id: new mongoose.Types.ObjectId(companyId),
        is_deleted: false
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total_amount: { $sum: '$items.total_amount' }
      }
    }
  ]);

  return stats;
};

/**
 * Send approval/rejection email to admin when status becomes pending
 * @param {Object} invoiceInput - Invoice input object
 * @returns {Promise<void>}
 */
const sendPendingApprovalEmail = async (invoiceInput) => {
  try {
    const approvalToken = Buffer.from(JSON.stringify({
      invoiceInputId: invoiceInput._id,
      action: 'approve',
      timestamp: Date.now()
    })).toString('base64');

    const rejectionToken = Buffer.from(JSON.stringify({
      invoiceInputId: invoiceInput._id,
      action: 'reject',
      timestamp: Date.now()
    })).toString('base64');

    const baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
    const approveUrl = `${baseUrl}/api/v1/invoice-inputs/approve-email/${approvalToken}`;
    const rejectUrl = `${baseUrl}/api/v1/invoice-inputs/reject-email/${rejectionToken}`;

    const monthName = moment(invoiceInput.input_month, 'YYYY-MM').format('MMMM YYYY');

    // Calculate total amount
    const totalAmount = invoiceInput.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const emailTemplate = {
      to: 'roney@nathandigital.com',
      subject: `Invoice Input Approval Required - ${invoiceInput.company_id?.company_name || invoiceInput.company_id?.legal_name} (${monthName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Invoice Input Approval Required</h1>
          </div>
          
          <div style="padding: 30px; background-color: white; margin: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #856404;">⏳ Action Required</h2>
              <p style="margin-bottom: 0; color: #856404;">
                A new invoice input has been submitted and requires your approval.
              </p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Invoice Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Company:</td>
                  <td style="padding: 8px 0;">${invoiceInput.company_id?.company_name || invoiceInput.company_id?.legal_name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Month:</td>
                  <td style="padding: 8px 0;">${monthName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Total Amount:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #007bff;">AED ${totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Items Count:</td>
                  <td style="padding: 8px 0;">${invoiceInput.items.length} item(s)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
                  <td style="padding: 8px 0;"><span style="background-color: #ffc107; color: #000; padding: 2px 8px; border-radius: 3px; font-size: 12px;">PENDING</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Submitted Date:</td>
                  <td style="padding: 8px 0;">${moment(invoiceInput.createdAt).format('MMMM DD, YYYY hh:mm A')}</td>
                </tr>
              </table>
            </div>

            ${invoiceInput.items.length > 0 ? `
            <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Invoice Items</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 5px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #007bff; color: white;">
                    <th style="padding: 10px; text-align: left;">Service</th>
                    <th style="padding: 10px; text-align: left;">Description</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceInput.items.map((item, index) => `
                    <tr style="border-bottom: 1px solid #dee2e6; ${index % 2 === 0 ? 'background-color: #f8f9fa;' : ''}">
                      <td style="padding: 10px;">${item.service_name || 'N/A'}</td>
                      <td style="padding: 10px;">${item.description || 'N/A'}</td>
                      <td style="padding: 10px; text-align: center;">${item.quantity || 0}</td>
                      <td style="padding: 10px; text-align: right; font-weight: bold;">AED ${(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${invoiceInput.notes ? `
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #0c5460;">📝 Notes</h4>
              <p style="margin-bottom: 0; color: #0c5460;">${invoiceInput.notes}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 40px 0;">
              <h3 style="color: #333; margin-bottom: 20px;">Quick Actions</h3>
              
              <a href="${approveUrl}" 
                 style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px; font-weight: bold; font-size: 16px;">
                ✅ APPROVE
              </a>
              
              <a href="${rejectUrl}" 
                 style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px; font-weight: bold; font-size: 16px;">
                ❌ REJECT
              </a>
            </div>

            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #155724; font-size: 14px;">
                <strong>Note:</strong> Click the buttons above to approve or reject this invoice input directly. 
                You can also review the details in the admin panel for more information.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.ADMIN_URL || 'https://admin.yourcompany.com'}/invoice-inputs/${invoiceInput._id}" 
                 style="background-color: #6c757d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View in Admin Panel
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 12px; text-align: center;">
              This is an automated notification. Invoice ID: ${invoiceInput._id}
            </p>
          </div>
        </div>
      `
    };

    await emailService.sendEmail([emailTemplate.to], emailTemplate.subject, emailTemplate.html, []);
    logger.info(`Pending approval email sent to ${emailTemplate.to} for invoice input ${invoiceInput._id}`);

  } catch (error) {
    logger.error(`Error sending pending approval email for invoice input ${invoiceInput._id}:`, error);
    // Don't throw error to prevent blocking the update operation
  }
};

/**
 * Handle email-based approval
 * @param {string} token - Base64 encoded approval token
 * @returns {Promise<Object>}
 */
const handleEmailApproval = async (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { invoiceInputId, action, timestamp } = decoded;

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Approval link has expired');
    }

    const invoiceInput = await getInvoiceInputById(invoiceInputId);

    if (invoiceInput.status !== 'pending') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invoice input is no longer pending approval');
    }

    let updateData = {};
    if (action === 'approve') {
      updateData = {
        status: 'approved',
        approved_by: null, // You might want to set this to a specific admin user ID
        approved_date: new Date()
      };
    } else if (action === 'reject') {
      updateData = {
        status: 'rejected',
        approved_by: null, // You might want to set this to a specific admin user ID
        approved_date: new Date()
      };
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action');
    }

    // Update without triggering another email
    Object.assign(invoiceInput, updateData);
    await invoiceInput.save();

    logger.info(`Invoice input ${invoiceInputId} ${action}d via email link`);

    return {
      success: true,
      action,
      invoiceInput,
      message: `Invoice input has been ${action}d successfully`
    };

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Error processing email approval:', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or corrupted approval link');
  }
};

module.exports = {
  createInvoiceInput,
  queryInvoiceInputs,
  getInvoiceInputById,
  updateInvoiceInputById,
  deleteInvoiceInputById,
  getInvoiceInputsByCompanyId,
  updateInvoiceStatus,
  addReceiptToInvoiceItem,
  removeReceiptFromInvoiceItem,
  getInvoiceInputsStatsByCompany,
  sendPendingApprovalEmail,
  handleEmailApproval
};
