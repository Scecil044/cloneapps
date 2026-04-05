const moment = require('moment');
const { InvoiceInputs, Companies } = require('../models');
const { emailService } = require('../services');
const logger = require('../config/logger');

/**
 * Check if a company has submitted invoice input for the current month
 * @param {string} companyId - Company ID
 * @param {string} currentMonth - Current month in YYYY-MM format
 * @returns {Promise<boolean>} - Returns true if invoice input exists
 */
const hasInvoiceInputForMonth = async (companyId, currentMonth) => {
  try {
    const invoiceInput = await InvoiceInputs.findOne({
      company_id: companyId,
      input_month: currentMonth,
      is_deleted: false
    });

    return !!invoiceInput;
  } catch (error) {
    logger.error('Error checking invoice input for month:', error);
    return false;
  }
};

/**
 * Parse input cutoff date and calculate if it's 3 days from today
 * @param {string} inputCutoffDate - Date string (e.g., "Every 15", "15", "2025-07-15")
 * @returns {boolean} - Returns true if cutoff date is 3 days from today
 */
const isCutoffDateApproaching = (inputCutoffDate) => {
  try {
    const today = moment();
    const threeDaysFromNow = moment().add(3, 'days');

    let cutoffDay;

    // Handle different formats: "Every 15", "15", or full date
    if (inputCutoffDate.toLowerCase().includes('every')) {
      cutoffDay = parseInt(inputCutoffDate.replace(/[^0-9]/g, ''));
    } else if (!isNaN(inputCutoffDate)) {
      cutoffDay = parseInt(inputCutoffDate);
    } else {
      // Handle full date format
      const cutoffMoment = moment(inputCutoffDate);
      return cutoffMoment.isSame(threeDaysFromNow, 'day');
    }

    if (!cutoffDay || cutoffDay < 1 || cutoffDay > 31) {
      return false;
    }

    // Create cutoff date for current month
    const currentMonth = today.month();
    const currentYear = today.year();
    const cutoffDate = moment().year(currentYear).month(currentMonth).date(cutoffDay);

    // If cutoff date has passed this month, consider next month
    if (cutoffDate.isBefore(today, 'day')) {
      cutoffDate.add(1, 'month');
    }

    return cutoffDate.isSame(threeDaysFromNow, 'day');
  } catch (error) {
    logger.error('Error parsing cutoff date:', error);
    return false;
  }
};

/**
 * Parse input cutoff date and check if today is the cutoff date
 * @param {string} inputCutoffDate - Date string (e.g., "Every 15", "15", "2025-07-15")
 * @returns {boolean} - Returns true if today is the cutoff date
 */
const isCutoffDateToday = (inputCutoffDate) => {
  try {
    const today = moment();

    let cutoffDay;

    // Handle different formats: "Every 15", "15", or full date
    if (inputCutoffDate.toLowerCase().includes('every')) {
      cutoffDay = parseInt(inputCutoffDate.replace(/[^0-9]/g, ''));
    } else if (!isNaN(inputCutoffDate)) {
      cutoffDay = parseInt(inputCutoffDate);
    } else {
      // Handle full date format
      const cutoffMoment = moment(inputCutoffDate);
      return cutoffMoment.isSame(today, 'day');
    }

    if (!cutoffDay || cutoffDay < 1 || cutoffDay > 31) {
      return false;
    }

    // Create cutoff date for current month
    const currentMonth = today.month();
    const currentYear = today.year();
    const cutoffDate = moment().year(currentYear).month(currentMonth).date(cutoffDay);

    // If cutoff date has passed this month, consider next month
    if (cutoffDate.isBefore(today, 'day')) {
      cutoffDate.add(1, 'month');
    }

    return cutoffDate.isSame(today, 'day');
  } catch (error) {
    logger.error('Error parsing cutoff date for today check:', error);
    return false;
  }
};

/**
 * Send invoice input reminder email to company
 * @param {Object} company - Company object
 * @param {string} currentMonth - Current month in YYYY-MM format
 */
const sendInvoiceInputReminderEmail = async (company, currentMonth) => {
  try {
    const monthName = moment(currentMonth, 'YYYY-MM').format('MMMM YYYY');

    const emailTemplate = {
      to: company.company_email,
      subject: `Invoice Input Reminder - ${monthName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Invoice Input Reminder</h2>
            
            <p>Dear ${company.company_name || company.legal_name} Team,</p>
            
            <p>This is a reminder that your invoice input submission deadline is approaching.</p>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">Submission Details:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>Month:</strong> ${monthName}</li>
                <li><strong>Cutoff Date:</strong> ${company.payroll_schedule?.input_cutoff_date.value + ` ${monthName}` || 'Not specified'}</li>
                <li><strong>Days Remaining:</strong> 3 days</li>
              </ul>
            </div>
            
            <p>Please ensure you submit your invoice inputs before the cutoff date to avoid any delays in payroll processing.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CUSTOMER_URL || 'https://your-portal.com'}/invoice-inputs" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Submit Invoice Inputs
              </a>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 12px;">
              This is an automated reminder. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    await emailService.sendEmail([emailTemplate.to], emailTemplate.subject, emailTemplate.html, []);
    logger.info(`Invoice input reminder email sent to ${company.company_email} for ${company.company_name}`);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    logger.error(`Error sending reminder email to ${company.company_email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send final invoice input reminder email to company (on cutoff date)
 * @param {Object} company - Company object
 * @param {string} currentMonth - Current month in YYYY-MM format
 */
const sendFinalInvoiceInputReminderEmail = async (company, currentMonth) => {
  try {
    const monthName = moment(currentMonth, 'YYYY-MM').format('MMMM YYYY');

    const emailTemplate = {
      to: company.company_email,
      subject: `FINAL REMINDER: Invoice Input Due Today - ${monthName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">⚠️ FINAL REMINDER - ACTION REQUIRED TODAY</h2>
        </div>
        
        <p>Dear ${company.company_name || company.legal_name} Team,</p>
        
        <p><strong>This is your FINAL REMINDER that your invoice input submission is due TODAY.</strong></p>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Submission Details:</h3>
          <ul style="margin-bottom: 0;">
          <li><strong>Month:</strong> ${monthName}</li>
          <li><strong>Cutoff Date:</strong> TODAY - ${company.payroll_schedule?.input_cutoff_date?.value + ` ${monthName}` || 'Not specified'}</li>
          <li><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">URGENT - DUE TODAY</span></li>
          </ul>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;">
          <strong>Important:</strong> Failure to submit your invoice inputs today may result in delays to your payroll processing. 
          Please submit immediately to avoid any disruptions.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CUSTOMER_URL || 'https://your-portal.com'}/invoice-inputs" 
           style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
          SUBMIT NOW - INVOICE INPUTS
          </a>
        </div>
        
        <p>If you are experiencing any technical difficulties or need immediate assistance, please contact our support team right away.</p>
        
        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #0c5460;">
          <strong>Support Contact:</strong> sahiba@nathanhr.com | +971 50 202 4674
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated final reminder. Please do not reply to this email. Contact support for immediate assistance.
        </p>
        </div>
      </div>
      `
    };

    await emailService.sendEmail([emailTemplate.to], emailTemplate.subject, emailTemplate.html, []);
    logger.info(`FINAL invoice input reminder email sent to ${company.company_email} for ${company.company_name}`);

    return { success: true, message: 'Final reminder email sent successfully' };
  } catch (error) {
    logger.error(`Error sending final reminder email to ${company.company_email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Check companies and send reminder emails for missing invoice inputs
 * This function should be called by a cron job or scheduler
 */
const checkAndSendInvoiceInputReminders = async () => {
  try {
    logger.info('Starting invoice input reminder check...');

    const currentMonth = moment().format('YYYY-MM');
    let emailsSent = 0;
    let errors = 0;

    // Get all active companies with automated payroll enabled
    const companies = await Companies.find({
      is_deleted: false,
      status: 'active',
      'payroll_schedule.automated_payroll.value': true,
      company_email: { $exists: true, $ne: '' }
    });

    logger.info(`Found ${companies.length} companies with automated payroll enabled`);

    for (const company of companies) {
      try {
        // Check if cutoff date is approaching (3 days from now)
        const cutoffDateApproaching = isCutoffDateApproaching(
          company.payroll_schedule?.input_cutoff_date?.value
        );

        if (!cutoffDateApproaching) {
          continue;
        }

        // Check if company has submitted invoice input for current month
        const hasInvoiceInput = await hasInvoiceInputForMonth(company._id, currentMonth);

        if (!hasInvoiceInput) {
          // Send reminder email
          const emailResult = await sendInvoiceInputReminderEmail(company, currentMonth);

          if (emailResult.success) {
            emailsSent++;
          } else {
            errors++;
          }
        }
      } catch (error) {
        logger.error(`Error processing company ${company._id}:`, error);
        errors++;
      }
    }

    logger.info(`Invoice input reminder check completed. Emails sent: ${emailsSent}, Errors: ${errors}`);

    return {
      success: true,
      emailsSent,
      errors,
      totalCompaniesChecked: companies.length
    };
  } catch (error) {
    logger.error('Error in checkAndSendInvoiceInputReminders:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check companies and send final reminder emails for missing invoice inputs (on cutoff date)
 * This function should be called by a cron job or scheduler on the cutoff date
 */
const checkAndSendFinalInvoiceInputReminders = async () => {
  try {
    logger.info('Starting FINAL invoice input reminder check...');

    const currentMonth = moment().format('YYYY-MM');
    let emailsSent = 0;
    let errors = 0;

    // Get all active companies with automated payroll enabled
    const companies = await Companies.find({
      is_deleted: false,
      status: 'active',
      'payroll_schedule.automated_payroll.value': true,
      company_email: { $exists: true, $ne: '' }
    });

    logger.info(`Found ${companies.length} companies with automated payroll enabled for final reminder check`);

    for (const company of companies) {
      try {
        // Check if today is the cutoff date
        const isCutoffToday = isCutoffDateToday(
          company.payroll_schedule?.input_cutoff_date?.value
        );

        if (!isCutoffToday) {
          continue;
        }

        // Check if company has submitted invoice input for current month
        const hasInvoiceInput = await hasInvoiceInputForMonth(company._id, currentMonth);

        if (!hasInvoiceInput) {
          // Send final reminder email
          const emailResult = await sendFinalInvoiceInputReminderEmail(company, currentMonth);

          if (emailResult.success) {
            emailsSent++;
            logger.info(`FINAL reminder sent to ${company.company_name} (${company.company_email})`);
          } else {
            errors++;
            logger.error(`Failed to send FINAL reminder to ${company.company_name}: ${emailResult.error}`);
          }
        } else {
          logger.info(`${company.company_name} has already submitted invoice input for ${currentMonth}`);
        }
      } catch (error) {
        logger.error(`Error processing company ${company._id} for final reminder:`, error);
        errors++;
      }
    }

    logger.info(`FINAL invoice input reminder check completed. Emails sent: ${emailsSent}, Errors: ${errors}`);

    return {
      success: true,
      emailsSent,
      errors,
      totalCompaniesChecked: companies.length,
      reminderType: 'final'
    };
  } catch (error) {
    logger.error('Error in checkAndSendFinalInvoiceInputReminders:', error);
    return {
      success: false,
      error: error.message,
      reminderType: 'final'
    };
  }
};

/**
 * Get companies that need invoice input reminders
 * This function can be used for reporting or manual checking
 * @param {string} currentMonth - Month to check (default: current month)
 * @returns {Promise<Array>} - Array of companies that need reminders
 */
const getCompaniesNeedingReminders = async (currentMonth = null) => {
  try {
    if (!currentMonth) {
      currentMonth = moment().format('YYYY-MM');
    }

    const companies = await Companies.find({
      is_deleted: false,
      status: 'active',
      'payroll_schedule.automated_payroll': true,
      company_email: { $exists: true, $ne: '' }
    });

    const companiesNeedingReminders = [];

    for (const company of companies) {
      const cutoffDateApproaching = isCutoffDateApproaching(
        company.payroll_schedule?.input_cutoff_date.value
      );

      if (cutoffDateApproaching) {
        const hasInvoiceInput = await hasInvoiceInputForMonth(company._id, currentMonth);

        if (!hasInvoiceInput) {
          companiesNeedingReminders.push({
            id: company._id,
            company_name: company.company_name,
            legal_name: company.legal_name,
            company_email: company.company_email,
            input_cutoff_date: company.payroll_schedule?.input_cutoff_date,
            current_month: currentMonth
          });
        }
      }
    }

    return companiesNeedingReminders;
  } catch (error) {
    logger.error('Error getting companies needing reminders:', error);
    throw error;
  }
};

/**
 * Manual trigger for sending reminder to a specific company
 * @param {string} companyId - Company ID
 * @param {string} currentMonth - Month to check (default: current month)
 * @returns {Promise<Object>} - Result of the operation
 */
const sendManualReminder = async (companyId, currentMonth = null) => {
  try {
    if (!currentMonth) {
      currentMonth = moment().format('YYYY-MM');
    }

    const company = await Companies.findById(companyId);

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    if (!company.company_email) {
      return { success: false, error: 'Company email not found' };
    }

    const hasInvoiceInput = await hasInvoiceInputForMonth(companyId, currentMonth);

    if (hasInvoiceInput) {
      return { success: false, error: 'Invoice input already submitted for this month' };
    }

    const emailResult = await sendInvoiceInputReminderEmail(company, currentMonth);

    return emailResult;
  } catch (error) {
    logger.error('Error sending manual reminder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get companies that need final invoice input reminders (on cutoff date)
 * @param {string} currentMonth - Month to check (default: current month)
 * @returns {Promise<Array>} - Array of companies that need final reminders
 */
const getCompaniesNeedingFinalReminders = async (currentMonth = null) => {
  try {
    if (!currentMonth) {
      currentMonth = moment().format('YYYY-MM');
    }

    const companies = await Companies.find({
      is_deleted: false,
      status: 'active',
      'payroll_schedule.automated_payroll.value': true,
      company_email: { $exists: true, $ne: '' }
    });

    const companiesNeedingFinalReminders = [];

    for (const company of companies) {
      const isCutoffToday = isCutoffDateToday(
        company.payroll_schedule?.input_cutoff_date?.value
      );

      if (isCutoffToday) {
        const hasInvoiceInput = await hasInvoiceInputForMonth(company._id, currentMonth);

        if (!hasInvoiceInput) {
          companiesNeedingFinalReminders.push({
            id: company._id,
            company_name: company.company_name,
            legal_name: company.legal_name,
            company_email: company.company_email,
            input_cutoff_date: company.payroll_schedule?.input_cutoff_date,
            current_month: currentMonth,
            reminder_type: 'final'
          });
        }
      }
    }

    return companiesNeedingFinalReminders;
  } catch (error) {
    logger.error('Error getting companies needing final reminders:', error);
    throw error;
  }
};

/**
 * Manual trigger for sending final reminder to a specific company
 * @param {string} companyId - Company ID
 * @param {string} currentMonth - Month to check (default: current month)
 * @returns {Promise<Object>} - Result of the operation
 */
const sendManualFinalReminder = async (companyId, currentMonth = null) => {
  try {
    if (!currentMonth) {
      currentMonth = moment().format('YYYY-MM');
    }

    const company = await Companies.findById(companyId);

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    if (!company.company_email) {
      return { success: false, error: 'Company email not found' };
    }

    const hasInvoiceInput = await hasInvoiceInputForMonth(companyId, currentMonth);

    if (hasInvoiceInput) {
      return { success: false, error: 'Invoice input already submitted for this month' };
    }

    const emailResult = await sendFinalInvoiceInputReminderEmail(company, currentMonth);

    return {
      ...emailResult,
      reminderType: 'final'
    };
  } catch (error) {
    logger.error('Error sending manual final reminder:', error);
    return { success: false, error: error.message, reminderType: 'final' };
  }
};

module.exports = {
  hasInvoiceInputForMonth,
  isCutoffDateApproaching,
  isCutoffDateToday,
  sendInvoiceInputReminderEmail,
  sendFinalInvoiceInputReminderEmail,
  checkAndSendInvoiceInputReminders,
  checkAndSendFinalInvoiceInputReminders,
  getCompaniesNeedingReminders,
  sendManualReminder,
  getCompaniesNeedingFinalReminders,
  sendManualFinalReminder
};
