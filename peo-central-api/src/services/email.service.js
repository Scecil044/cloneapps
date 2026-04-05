/* eslint-disable no-param-reassign */
const nodemailer = require('nodemailer');

const { ObjectId } = require('mongodb');
const AWS = require('aws-sdk');
const config = require('../config/config');
const logger = require('../config/logger');
const { sendEmail, sendRawEmail } = require('../middlewares/email');
const { EmailLog, Configurations, Users, Companies } = require('../models');

const clientService = require('./index');
const emailTemplateService = require('./email_template.service');

const ses = new AWS.SES({
  // accessKeyId: config.aws.accessKeyId,
  // secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'production') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email to any receiver
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} body
 * @returns {Promise}
 */

const sendEmails = async (toEmail, subject, body) => {
  const msg = { from: config.email.from, to: toEmail, subject, body, html: body };
  if (['development', 'staging'].includes(config.env)) {
    await transport.sendMail(msg);
  } else {
    let emails = [];

    if (typeof toEmail === 'string') {
      emails.push(toEmail);
    } else emails = toEmail.filter(a => a !== '');

    const params = {
      Destination: {
        ToAddresses: emails
      },
      Message: {
        Body: {
          Html: {
            Data: body,
            Charset: 'UTF-8'
          },
          Text: {
            Data: subject,
            Charset: 'UTF-8'
          }
        },
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        }
      },
      Source: config.email.from
    };

    ses.sendEmail(params, function (err) {
      if (err) {
        logger.warn(err);
        throw err;
      }
    });
  }
};

// /**
//  * Send reset password email
//  * @param {string} to
//  * @param {string} token
//  * @returns {Promise}
//  */
const sendResetPasswordEmail = async (to, token) => {
  let cc = [];
  let toAddrs = [];
  const subject = 'Password Recovery Email';
  const resetPasswordUrl = `${config.clientUrl}forgot-password?q=${token}`;
  const text = `Hi, <br/>Looks like you've forgotten your password! If so, click the link below to create a new password:<br/>
  <a href='${resetPasswordUrl}'>Reset your Password</a> <br/> If you didn't request this, please ignore this email. <br/><br/>Thanks, Team <br/><br/>`;
  toAddrs.push(to);
  sendEmail(toAddrs, subject, text, cc).then(async result => {
    console.log('Email sent successfully: ', result);
    // await new EmailLog({
    //   from: "donotreply@nathanhr.ae",
    //   to: toAddrs,
    //   cc: cc,
    //   subject: subject,
    //   body: toString(text)
    // }).save()
  });
};

const sendAdminPasswordResetEmail = async (to, newPassword) => {
  let cc = [];
  let toAddrs = [];
  const subject = 'Password Reset';
  // const resetPasswordUrl = `${config.clientUrl}/forgot-password?q=${token}`;
  const text = `Hi, <br/>Your password has been reset on PEO Central Portal:<br/>
    Your new password is ${newPassword}
  `;
  toAddrs.push(to);
  sendEmail(toAddrs, subject, text, cc).then(async result => {
    console.log('Email sent successfully: ', result);
    // await new EmailLog({
    //   from: "donotreply@nathanhr.ae",
    //   to: toAddrs,
    //   cc: cc,
    //   subject: subject,
    //   body: toString(text)
    // }).save()
  });
};
/**
 * Send verification email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, otp) => {
  const subject = 'OTP Verification';
  // replace this url with the link to the email verification page of your front-end app
  const text = `Hello,<br/><br/>Your OTP is ${otp}. Please use the code to continue your registration.<br/><br/>Kind regards,<br> Team `;
  await sendEmail(to, subject, text);
};

const sendPaymentProofAttachedEmail = async (paymentProofData, userData, invoiceData, companyDoc) => {
  try {
    const { sendRawEmail } = require('../middlewares/email');

    // Extract data
    const {
      invoice_id,
      amount_claimed,
      payment_method,
      currency,
      payment_date,
      payment_reference,
      file_name,
      file_path
    } = paymentProofData;

    const {
      first_name,
      last_name,
      name,
      email: userEmail
    } = userData;

    // Handle both Users table (first_name, last_name) and Poc table (name) formats
    const displayName = first_name && last_name
      ? `${first_name} ${last_name}`
      : name || 'Unknown User';

    // Debug logging to identify data source
    console.log('User data source:', {
      hasFirstNameLastName: !!(first_name && last_name),
      hasName: !!name,
      displayName: displayName,
      userData: userData
    });

    const {
      invoice_number,
      total_amount
    } = invoiceData;

    // Email configuration
    const toEmail = ['accounts@nathanhr.com'];
    const subject = `Payment Proof Attached - Invoice ${invoice_number}`;

    // Create modern, clean HTML email template inspired by payment confirmation emails
    const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Proof Notification</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #ffffff;
            }
            .email-container {
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                text-align: center;
                padding: 40px 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            .logo {
                width: 60px;
                height: 60px;
                background: #667eea;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 600;
                color: #333;
            }
            .header p {
                margin: 0;
                font-size: 16px;
                color: #666;
            }
            .content {
                padding: 30px 20px;
            }
            .payment-details {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-size: 14px;
                color: #666;
                font-weight: 500;
            }
            .detail-value {
                font-size: 14px;
                color: #333;
                font-weight: 600;
            }
            .amount-value {
                font-size: 18px;
                color: #28a745;
                font-weight: 700;
            }
            .attachment-section {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                text-align: center;
            }
            .attachment-icon {
                width: 50px;
                height: 50px;
                background: #667eea;
                border-radius: 8px;
                margin: 0 auto 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
            }
            .attachment-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }
            .attachment-subtitle {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
            }
            .download-button {
                display: inline-block;
                background: #667eea;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            .download-button:hover {
                background: #5a6fd8;
            }
            .summary-section {
                border-top: 1px solid #e9ecef;
                border-bottom: 1px solid #e9ecef;
                padding: 20px 0;
                margin: 30px 0;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
            }
            .summary-label {
                font-size: 14px;
                color: #666;
            }
            .summary-value {
                font-size: 16px;
                color: #333;
                font-weight: 600;
            }
            .help-section {
                text-align: center;
                padding: 30px 20px;
                color: #666;
            }
            .help-text {
                font-size: 14px;
                margin-bottom: 15px;
            }
            .contact-email {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            .contact-email:hover {
                text-decoration: underline;
            }
            .footer {
                text-align: center;
                padding: 30px 20px;
                color: #999;
                font-size: 12px;
                border-top: 1px solid #f0f0f0;
            }
            .company-name {
                font-size: 16px;
                font-weight: 600;
                color: #667eea;
                margin-bottom: 10px;
            }
            @media (max-width: 600px) {
                body {
                    padding: 20px 10px;
                }
                .header {
                    padding: 30px 15px 20px;
                }
                .content {
                    padding: 20px 15px;
                }
                .detail-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">P</div>
                <h1>Payment Proof Attached</h1>
                <p>A new payment proof document has been submitted for ${companyDoc.company_name}</p>
            </div>

            <div class="content">
                <div class="payment-details">
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${new Date(payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment</span>
                        <span class="detail-value amount-value">${currency} ${parseFloat(amount_claimed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Method</span>
                        <span class="detail-value">${payment_method}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Reference</span>
                        <span class="detail-value">${payment_reference}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submitted by</span>
                        <span class="detail-value">${displayName}</span>
                    </div>
                </div>

                ${file_name ? `
                <div class="attachment-section">
                    <div class="attachment-icon">📄</div>
                    <div class="attachment-title">${file_name}</div>
                    <div class="attachment-subtitle">Payment proof document for invoice ${invoice_number}</div>
                    <a href="${file_path}" class="download-button" target="_blank">View Document →</a>
                </div>
                ` : ''}

                <div class="summary-section">
                    <div class="summary-row">
                        <span class="summary-label">Invoice Number</span>
                        <span class="summary-value">${invoice_number}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Amount</span>
                        <span class="summary-value">${currency} ${parseFloat(amount_claimed).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <p class="help-text">If you need help with anything, don't hesitate to send us an email:</p>
                <a href="mailto:accounts@nathanhr.com" class="contact-email">accounts@nathanhr.com</a>
            </div>

            <div class="footer">
                <div class="company-name">EOR Central</div>
                <p>This is an automated notification from the EOR Central system.</p>
                <p>Generated on ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email (no attachments needed - using clickable link instead)
    await sendRawEmail(toEmail, subject, emailBody, [], []);

    console.log(`Payment proof notification email sent successfully for invoice ${invoice_number}`);

    return {
      success: true,
      message: 'Payment proof notification email sent successfully',
      recipient: toEmail,
      subject: subject
    };

  } catch (error) {
    console.error('Error sending payment proof notification email:', error);
    throw new Error(`Failed to send payment proof notification email: ${error.message}`);
  }
};
/**
 * Send verification email
 * @param {string} to
 * @param {string} otp
 * @returns {Promise}
 */
const sendResetPasswordOTPEmail = async (to, otp) => {
  const subject = 'OTP Verification';
  // replace this url with the link to the email verification page of your front-end app
  const text = `Hello,<br/><br/>Your OTP is ${otp}. Please use the code to continue your reset password.<br/><br/>Kind regards,<br> Team `;
  await sendEmail(to, subject, text);
};

const sendsalaryChangeEmail = async salaryChangeLog => {
  try {
    const config = await Configurations.findOne({}).select({ mailTrap: 1 });
    let cc = ['sahiba@nathanhr.com'];
    let toAddress = ['aruni@nathanhr.com', 'akshay@nathanhr.com', 'spnair@nathanhr.com'];
    let subject = `${salaryChangeLog.type == 'salary' ? 'Salary' : 'Non-Wage Protection System(WPS)'} Change For ${
      salaryChangeLog?.first_name
    } ${salaryChangeLog?.middle_name || ''} ${salaryChangeLog?.last_name} : ${salaryChangeLog?.company_name}  `;

    const text = `
      <div style="margin: 0 auto;">
        <p>Dear Payroll Team,</p>
        <p>This is to notify you of a ${
          salaryChangeLog.type == 'salary' ? 'salary' : 'Non-Wage Protection System(WPS)'
        } adjustment for ${salaryChangeLog?.first_name} ${salaryChangeLog?.middle_name || ''} ${
      salaryChangeLog?.last_name
    }, ${salaryChangeLog?.company_name}. Please update your
         records with the following information:</p>

        <p>Salary Change Details</p>
        <p>Previous Salary: ${salaryChangeLog?.old_salary}</p>
        <p>New Salary: ${salaryChangeLog?.new_salary}</p>

        <p>Please ensure this adjustment is applied to the payroll.</p>
        <p>Should you need any further information, feel free to reach out to me</p>
      </div>
    `;

    sendEmail(toAddress, subject, text, cc);
    await new EmailLog({
      from: 'donotreply@nathanhr.ae',
      to: config.mailTrap === true ? config.mailTrap.toEmails : toAddress,
      cc: config.mailTrap === true ? config.mailTrap.ccEmails : cc,
      subject: subject,
      body: toString(text)
    }).save();
  } catch (error) {
    throw new Error(error);
  }
};

const sendInsurancePlanEmail = async () => {
  try {
    // Fetch the email template asynchronously
    const emailTemplt = await emailTemplateService.getEmailTemplateByName({ templateName: 'Insurance Renewal Email' });
    if (!emailTemplt) throw new Error('Could not find email template');

    console.log(emailTemplt._id, 'is the id, and this is the name', emailTemplt.name);

    // Define the aggregation pipeline
    const pipeline = [
      {
        $match: {
          is_deleted: false,
          user_status: { $in: ['active', 'onboarding'] }
        }
      }
    ];

    // Aggregate the list of employees
    const employees = await Users.aggregate(pipeline);

    // Email details
    let cc = [];
    let subject = emailTemplt.subject;
    let text = emailTemplt.content;
    let attachments = [];

    // Loop through employees and send emails
    for (let employee of employees) {
      console.log('Sending email to', employee.first_name);

      // Ensure toAddrs only includes the current employee's email
      let toAddrs = [employee.email];

      await sendRawEmail(toAddrs, subject, text, cc, attachments);
    }

    return employees;
  } catch (error) {
    console.error('Error sending insurance plan emails:', error);
    throw new Error(error.message || 'Error sending insurance plan emails');
  }
};

/**
 * This functionality should send welcome email on peo central
 * Its implementation is urgent and should be completed before end of day
 */
const sendAnnouncementEmail = async () => {
  try {
    const subject = 'Welcome to PEO Central!'; // Dynamic subject for the email

    const mailBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div
          style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #007BFF;">Welcome to PEO Central!</h2>

          <p>We're thrilled to introduce <strong>PEO Central</strong>, the ultimate app designed to streamline your HR experience. Manage your professional journey effortlessly with its user-friendly interface and powerful features.</p>

          <h3 style="color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 5px;">What Can You Do on PEO Central?</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;">
              <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">🔄</span>
              <strong>Track Visa Process:</strong> Stay informed about your visa progress and receive real-time notifications.
            </li>
            <li style="margin-bottom: 10px;">
              <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">📄</span>
              <strong>Access Documents Instantly:</strong> Download your documents and payslips with just one click.
            </li>
            <li style="margin-bottom: 10px;">
              <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">📋</span>
              <strong>Raise and Track Requests:</strong> Submit and monitor letter requests like NOCs with automated notifications.
            </li>
            <li style="margin-bottom: 10px;">
              <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">💬</span>
              <strong>Live Support:</strong> Connect seamlessly with our team via online live chat for quick assistance.
            </li>
          </ul>

          <h3 style="color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 5px;">How to Download the App</h3>
          <ol style="padding-left: 20px;">
            <li>
              <strong>Download the App:</strong>
              <div style="display: flex; justify-content: center;">
                <a href="https://play.google.com/store/apps/details?id=com.nathan.peocentral&pcampaignid=web_share">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play" style="width: 140px; margin: 10px;">
                </a>
                <a href="https://apps.apple.com/ke/app/peo-central/id6670541414">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Download_on_the_App_Store_RGB_blk.svg"
                    alt="Download on the App Store" style="width: 140px; margin: 10px;">
                </a>
              </div>
            </li>
            <li><strong>Locate the App Store:</strong> For iOS users, open the App Store. For Android users, open Google Play Store.</li>
            <li><strong>Search for the App:</strong> Type <strong>PEO Central</strong> in the search bar.</li>
            <li><strong>Install the App:</strong> Tap <strong>Get</strong> (iOS) or <strong>Install</strong> (Android) to download the app.</li>
            <li><strong>Open the App:</strong> Once installed, tap <strong>Open</strong> to get started!</li>
          </ol>

          <h3 style="color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 5px;">First-Time Login Steps</h3>
          <ol style="padding-left: 20px;">
            <li><strong>Sign In:</strong> Use your registered email address.</li>
            <li><strong>Verify Your Email:</strong> You'll receive an OTP via email. Input the OTP to proceed.</li>
            <li><strong>Set Your Password:</strong> Create a new password to access your account.</li>
          </ol>

          <p>Once logged in, you'll unlock a whole new level of convenience. Welcome to <strong>PEO Central</strong>—let's simplify your work journey!</p>

          <p>If you have any questions or need assistance, our <strong>support team</strong> is just a tap away via the app.</p>

          <p>Thank you for your cooperation, and we're confident you'll love the convenience of PEO Central!</p>

          <p style="margin-top: 20px;"><strong>Best Regards,</strong><br>PEO Support Team</p>
        </div>
      </body>
      </html>
    `;
    const companies = await Companies.find({ is_deleted: false, status: { $in: ['active'] } });
    companyEmails = companies.map(company => company.email);
    let toAddrs = [
      // "cheryl.goh@ins-global.com",
      // "margaux.a.gillis@gmail.com",
      // "Cansin.Sevindik@tr.guess.eu",
      // "vidya1964@gmail.com",
      // "antonio_jim@yahoo.es",
      // "farimah.moeini@gmail.com",
      // "max_daniels@hotmail.co.uk",
      // "saleemism92@gmail.com",
      // "mejicsnicole17@gmail.com",
      // "drmagued@hotmail.com",
      // "veronaroses@yahoo.co.uk",
      // "kso@ctme.co",
      // "faheem.hamid@gmail.com",
      // "cecil@nathandigital.com",
      // "brian.bett@nathandigital.com"
    ]; // Recipients
    let cc = []; // CC recipients
    let attachments = []; // Attachments if any
   for(let address of toAddrs){
    await sendRawEmail([address], subject, mailBody, cc, attachments, mailBody);
   }
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const clientOTPEmail = async (poc, otp) => {
  try{
    const subject = "OTP Generated";
    const mailBody = `
    <p>Hello ${poc.first_name || poc.name}${poc.last_name ? ' ' + poc.last_name : ''},</p>
    <p>To access your account for the first time, please use the One-Time Password (OTP) below to complete your verification:</p>
    <p><strong>OTP</strong>: ${otp.otp}</p>
    <p><strong>Please Note</strong>: </p>
    <p>This OTP is only valid for 5 minutes only.</p>
    <p>For your security, do not share this code with anyone.</p>
    <p>If you did not request this code, you can safely ignore this email.</p>
    <p><br></p>
    <p>If you encounter any issues or have any questions, our team is here to assist you.</p>
    <p><br></p>
    <p>Best Regards,</p>
    <p><strong>The PEO Central Team</strong></p>
    `;
  let toAddrs = [poc?.email];
  let cc = [];
  let attachments = [];
  console.log("message before send email on else condition")
  await sendRawEmail(toAddrs, subject, mailBody, cc, attachments, null);
  return { success: true, message: 'Email sent successfully' };
  }catch(error){
    throw new Error(error)
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendResetPasswordOTPEmail,
  sendEmail,
  sendAdminPasswordResetEmail,
  sendsalaryChangeEmail,
  sendInsurancePlanEmail,
  sendAnnouncementEmail,
  clientOTPEmail,
  sendPaymentProofAttachedEmail
};
