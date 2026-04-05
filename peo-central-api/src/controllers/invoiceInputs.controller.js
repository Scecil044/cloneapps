const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { invoiceInputsService } = require('../services');

const createInvoiceInput = catchAsync(async (req, res) => {
  req.body.created_by = req.userId;
  const invoiceInput = await invoiceInputsService.createInvoiceInput(req.body);
  res.status(httpStatus.CREATED).send(invoiceInput);
});

const getInvoiceInputs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['company_id', 'status', 'input_month']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Only show non-deleted records
  filter.is_deleted = false;

  const result = await invoiceInputsService.queryInvoiceInputs(filter, options);
  res.send(result);
});

const getInvoiceInput = catchAsync(async (req, res) => {
  const invoiceInput = await invoiceInputsService.getInvoiceInputById(req.params.invoiceInputId);
  if (!invoiceInput) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice input not found');
  }
  res.send(invoiceInput);
});

const updateInvoiceInput = catchAsync(async (req, res) => {
  req.body.updated_by = req.userId;
  const invoiceInput = await invoiceInputsService.updateInvoiceInputById(req.params.invoiceInputId, req.body);
  res.send(invoiceInput);
});

const deleteInvoiceInput = catchAsync(async (req, res) => {
  await invoiceInputsService.deleteInvoiceInputById(req.params.invoiceInputId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getInvoiceInputsByCompany = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await invoiceInputsService.getInvoiceInputsByCompanyId(req.params.companyId, options);
  res.send(result);
});

const updateInvoiceStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const invoiceInput = await invoiceInputsService.updateInvoiceStatus(
    req.params.invoiceInputId,
    status,
    req.userId
  );
  res.send(invoiceInput);
});

const addReceipt = catchAsync(async (req, res) => {
  const receiptData = {
    filename: req.body.filename,
    file_url: req.body.file_url
  };

  const invoiceInput = await invoiceInputsService.addReceiptToInvoiceItem(
    req.params.invoiceInputId,
    req.params.itemId,
    receiptData
  );
  res.send(invoiceInput);
});

const removeReceipt = catchAsync(async (req, res) => {
  const invoiceInput = await invoiceInputsService.removeReceiptFromInvoiceItem(
    req.params.invoiceInputId,
    req.params.itemId,
    req.params.receiptId
  );
  res.send(invoiceInput);
});

const getInvoiceInputsStats = catchAsync(async (req, res) => {
  const stats = await invoiceInputsService.getInvoiceInputsStatsByCompany(req.params.companyId);
  res.send(stats);
});

const approveInvoiceInputViaEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const result = await invoiceInputsService.handleEmailApproval(token);

  // Return an HTML response for email links
  const html = `
    <html>
      <head>
        <title>Invoice Input ${result.action === 'approve' ? 'Approved' : 'Rejected'}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { color: #28a745; }
          .error { color: #dc3545; }
          .container { background-color: #f8f9fa; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .icon { font-size: 48px; margin-bottom: 20px; }
          .message { font-size: 18px; margin-bottom: 20px; }
          .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${result.action === 'approve' ? '✅' : '❌'}</div>
          <h1 class="success">Success!</h1>
          <div class="message">
            Invoice input has been <strong>${result.action}d</strong> successfully.
          </div>
          <div class="details">
            <strong>Invoice ID:</strong> ${result.invoiceInput._id}<br>
            <strong>Company:</strong> ${result.invoiceInput.company_id?.company_name || result.invoiceInput.company_id?.legal_name || 'N/A'}<br>
            <strong>Status:</strong> ${result.invoiceInput.status}<br>
            <strong>Action Date:</strong> ${new Date().toLocaleString()}
          </div>
          <a href="${process.env.ADMIN_URL || 'https://admin.yourcompany.com'}/invoice-inputs" class="button">
            Go to Admin Panel
          </a>
        </div>
      </body>
    </html>
  `;

  res.status(httpStatus.OK).send(html);
});

const rejectInvoiceInputViaEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const result = await invoiceInputsService.handleEmailApproval(token);

  // Return an HTML response for email links
  const html = `
    <html>
      <head>
        <title>Invoice Input Rejected</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { color: #28a745; }
          .error { color: #dc3545; }
          .container { background-color: #f8f9fa; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .icon { font-size: 48px; margin-bottom: 20px; }
          .message { font-size: 18px; margin-bottom: 20px; }
          .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1 class="success">Invoice Input Rejected</h1>
          <div class="message">
            Invoice input has been <strong>rejected</strong> successfully.
          </div>
          <div class="details">
            <strong>Invoice ID:</strong> ${result.invoiceInput._id}<br>
            <strong>Company:</strong> ${result.invoiceInput.company_id?.company_name || result.invoiceInput.company_id?.legal_name || 'N/A'}<br>
            <strong>Status:</strong> ${result.invoiceInput.status}<br>
            <strong>Action Date:</strong> ${new Date().toLocaleString()}
          </div>
          <a href="${process.env.ADMIN_URL || 'https://admin.yourcompany.com'}/invoice-inputs" class="button">
            Go to Admin Panel
          </a>
        </div>
      </body>
    </html>
  `;

  res.status(httpStatus.OK).send(html);
});

module.exports = {
  createInvoiceInput,
  getInvoiceInputs,
  getInvoiceInput,
  updateInvoiceInput,
  deleteInvoiceInput,
  getInvoiceInputsByCompany,
  updateInvoiceStatus,
  addReceipt,
  removeReceipt,
  getInvoiceInputsStats,
  approveInvoiceInputViaEmail,
  rejectInvoiceInputViaEmail
};
