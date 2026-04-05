const cron = require('node-cron');
const { checkAndSendInvoiceInputReminders, checkAndSendFinalInvoiceInputReminders } = require('../utils/invoiceUtils');
const logger = require('../config/logger');

/**
 * Initialize invoice-related cron jobs
 */
const initializeInvoiceCronJobs = () => {
  // Run every day at 9:00 AM to check for invoice input reminders
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running daily invoice input reminder check...');
    try {
      const result = await checkAndSendInvoiceInputReminders();
      logger.info('Daily invoice reminder check completed:', result);
    } catch (error) {
      logger.error('Error in daily invoice reminder check:', error);
    }
  }, {
    timezone: "Asia/Dubai" // Adjust timezone as needed
  });

  // Run every 6 hours during business days for more frequent checks
  cron.schedule('0 */6 * * 1-5', async () => {
    logger.info('Running business hours invoice input reminder check...');
    try {
      const result = await checkAndSendInvoiceInputReminders();
      if (result.emailsSent > 0) {
        logger.info('Business hours invoice reminder check completed:', result);
      }
    } catch (error) {
      logger.error('Error in business hours invoice reminder check:', error);
    }
  }, {
    timezone: "Asia/Dubai"
  });

  // Run every hour to check for final invoice input reminders (on cutoff date)
  cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly final invoice input reminder check...');
    try {
      const result = await checkAndSendFinalInvoiceInputReminders();
      if (result.emailsSent > 0) {
        logger.info('Final invoice reminder check completed:', result);
      }
    } catch (error) {
      logger.error('Error in final invoice reminder check:', error);
    }
  }, {
    timezone: "Asia/Dubai"
  });

  // Run final reminders more frequently on business hours during cutoff days
  cron.schedule('*/30 8-18 * * 1-5', async () => {
    logger.info('Running frequent final invoice input reminder check (business hours)...');
    try {
      const result = await checkAndSendFinalInvoiceInputReminders();
      if (result.emailsSent > 0) {
        logger.info('Frequent final invoice reminder check completed:', result);
      }
    } catch (error) {
      logger.error('Error in frequent final invoice reminder check:', error);
    }
  }, {
    timezone: "Asia/Dubai"
  });

  logger.info('Invoice cron jobs initialized successfully');
};

module.exports = {
  initializeInvoiceCronJobs
};
