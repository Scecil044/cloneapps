const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
  checkAndSendInvoiceInputReminders,
  checkAndSendFinalInvoiceInputReminders,
  getCompaniesNeedingReminders,
  getCompaniesNeedingFinalReminders,
  sendManualReminder,
  sendManualFinalReminder
} = require('../utils/invoiceUtils');

/**
 * Manually trigger invoice input reminder check
 */
const triggerReminderCheck = catchAsync(async (req, res) => {
  const result = await checkAndSendInvoiceInputReminders();

  res.status(httpStatus.OK).send({
    message: 'Invoice input reminder check completed',
    ...result
  });
});

/**
 * Get list of companies that need invoice input reminders
 */
const getCompaniesNeedingInvoiceReminders = catchAsync(async (req, res) => {
  const { month } = req.query;
  const companies = await getCompaniesNeedingReminders(month);

  res.status(httpStatus.OK).send({
    companies,
    count: companies.length,
    month: month || new Date().toISOString().slice(0, 7)
  });
});

/**
 * Send manual reminder to a specific company
 */
const sendManualInvoiceReminder = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { month } = req.body;

  const result = await sendManualReminder(companyId, month);

  if (result.success) {
    res.status(httpStatus.OK).send({
      message: 'Manual reminder sent successfully',
      ...result
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({
      message: 'Failed to send manual reminder',
      error: result.error
    });
  }
});

/**
 * Manually trigger final invoice input reminder check (on cutoff date)
 */
const triggerFinalReminderCheck = catchAsync(async (req, res) => {
  const result = await checkAndSendFinalInvoiceInputReminders();

  res.status(httpStatus.OK).send({
    message: 'Final invoice input reminder check completed',
    ...result
  });
});

/**
 * Get list of companies that need final invoice input reminders (on cutoff date)
 */
const getCompaniesNeedingFinalInvoiceReminders = catchAsync(async (req, res) => {
  const { month } = req.query;
  const companies = await getCompaniesNeedingFinalReminders(month);

  res.status(httpStatus.OK).send({
    companies,
    count: companies.length,
    month: month || new Date().toISOString().slice(0, 7),
    reminderType: 'final'
  });
});

/**
 * Send manual final reminder to a specific company
 */
const sendManualFinalInvoiceReminder = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { month } = req.body;

  const result = await sendManualFinalReminder(companyId, month);

  if (result.success) {
    res.status(httpStatus.OK).send({
      message: 'Manual final reminder sent successfully',
      ...result
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({
      message: 'Failed to send manual final reminder',
      error: result.error
    });
  }
});

module.exports = {
  triggerReminderCheck,
  getCompaniesNeedingInvoiceReminders,
  sendManualInvoiceReminder,
  triggerFinalReminderCheck,
  getCompaniesNeedingFinalInvoiceReminders,
  sendManualFinalInvoiceReminder
};
