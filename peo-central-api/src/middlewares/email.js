const AWS = require('aws-sdk');
const MailComposer = require('nodemailer/lib/mail-composer');
const configuration = require('../models/configuration.model');
const { Users, EmailConfig, Approvals } = require('../models');
// const tokenService = require('../services/token.service');
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');
const config = require('../config/config');
const { isEmail } = require('validator');
const { UserBackUp } = require('../models');

const { EmailLog } = require('../models/index');

const ses = new AWS.SES({
  // accessKeyId: process.env.SECRET_ID_AWS,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1',
});

let tokenService;
function getTokenService() {
  if (!tokenService) {
    tokenService = require('../services/token.service');
  }
  return tokenService;
}
/* Send email to approvers and applicant */
// sendEmail('ashritha@nathandigital.com', 'Test Email', 'This is a test email', ['ashrithashetty168@gmail.com']).then((result) => {
//     console.log('Email sent successfully:', result);
// })
function sendEmail(toEmail, subject, body, cc_emails) {
  return new Promise(async (resolve, reject) => {
    const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });

    try {
      let ccAddresses = [];
      if (cc_emails != false) {
        ccAddresses = cc_emails;
      }
      const msg = {
        Source: 'donotreply@nathanhr.ae',
        Destination: {
          ToAddresses: config.mailTrap.trap == true ? config.mailTrap.toEmails : toEmail,
          CcAddresses: config.mailTrap.trap == true ? config.mailTrap.ccEmails : ccAddresses
        },
        Message: {
          Body: {
            Html: {
              Data: body,
              Charset: 'UTF-8'
            },
            Text: {
              Data: body,
              Charset: 'UTF-8'
            }
          },
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          }
        }
      };

      ses.sendEmail(msg, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          await new EmailLog({
            from: 'donotreply@nathanhr.ae',
            to: toEmail,
            cc: ccAddresses,
            subject: subject,
            body: body
          }).save();
          resolve(data);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function sendRawEmail(toEmail, subject, body, cc_emails, attachments, from = null) {
  const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });
  console.log(toEmail, "this is the email to send message to");
  return Promise.resolve().then(() => {
    let sendRawEmailPromise;

    const mail = new MailComposer({
      from: from == null ? 'donotreply@nathanhr.ae' : from,
      replyTo: from == null
        ? 'donotreply@nathanhr.ae'
        : from == 'accounts@nathanhr.com'
          ? 'accounts@nathanhr.com'
          : 'donotreply@nathanhr.com',
      to: config.mailTrap.trap == true ? config.mailTrap.toEmails : toEmail,
      cc: config.mailTrap.trap == true ? config.mailTrap.ccEmails : cc_emails,
      subject: subject,
      html: body,
      attachments: attachments,
    });

    return new Promise((resolve, reject) => {
      mail.compile().build(async (err, message) => {
        if (err) {
          reject(`Error sending raw email: ${err}`);
        }
        sendRawEmailPromise = ses.sendRawEmail({ RawMessage: { Data: message } }).promise();
        await new EmailLog({
          from: 'donotreply@nathanhr.ae',
          to: toEmail,
          cc: cc_emails,
          subject: subject,
          body: body,
          attachments: attachments
        }).save();
      });

      resolve(sendRawEmailPromise);
    });
  });
}

async function requestUserInfoUpdate(subject, body, cc_emails, attachments, baseUrl) {
  const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });

  // filter employees from the users table
  const pipeline = [
    {
      $match: {
        is_deleted: false,
        user_status: 'onboarding'
      }
    }
  ];

  // Use the pipeline to aggregate the data and fetch users with the role of "Employee"
  const systemUsers = await Users.aggregate(pipeline);
  console.log(systemUsers.length, 'the syst user');


  const emails = systemUsers.map(user => user.email);
  console.log(emails, "the emails")
  // Group users by email
  const usersByEmail = systemUsers.reduce((acc, user) => {
    if (!acc[user.email]) {
      acc[user.email] = [];
    }
    acc[user.email].push(user);
    return acc;
  }, {});

  const generateSingleUserEmailBody = (user, updateLink) =>
    `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
          }
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #555555;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .button-container {
            text-align: center;
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
          }
          .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
          <tr>
            <td align="center">
              <table class="container" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Important: Personal Information Update</h1>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Dear ${user.first_name} ${user.last_name},</p>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">I hope this message finds you well. We have noticed that some important details are missing from your profile in our system.</p>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">To ensure compliance and that our records are accurate and up-to-date, we kindly request that you review and update your information using the link below:</p>
                    <table cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <table cellspacing="0" cellpadding="0">
                            <tr>
                              <td bgcolor="#007bff" style="border-radius: 5px;">
                                <a href="${updateLink}" class="button" style="color: #ffffff; display: inline-block; text-decoration: none; padding: 10px 20px;">Update Details</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Important Note: The link is valid only until 11:59pm, 05 August 2024. Please ensure the form is submitted by or before the date of expiry</p>
                    <p style="color: #555555; font-size: 16px; margin-top: 20px; margin-bottom: 20px;">Your prompt attention to this matter will help us provide you with better service and support. If you have any questions or require assistance, please do not hesitate to contact our support team at peosupport@nathanhr.com.</p>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Thank you for your cooperation.</p>
                    <br/>
                    <p style="color: #555555; font-size: 16px;">Thanks and regards,
                    <br>PEO Support Team
                    </p>
                    <p style="color: #555555; font-size: 16px;">Nathan HR</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const generateMultipleUsersEmailBody = (users, updateLinks) =>
    `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
          }
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #555555;
            font-size: 16px;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
          }
          .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
          <tr>
            <td align="center">
              <table class="container" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Important: Personal Information Update For multiple Employees</h1>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Hello,</p>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">We have noticed that some important details are missing from the profiles of multiple employees associated with this email address in our system.</p>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Please update the information for the following employees:</p>
                  <table cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse;">
  ${users
      .map(
        (user, index) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
        <p style="color: #555555; font-size: 16px; margin: 0; display: flex; justify-content: space-between; align-items: center;">
          ${user.first_name} ${user.last_name}
          <a href="${updateLinks[index]}" class="button" style="color: #ffffff; text-decoration: none; margin-left: 15px;">Update Details</a>
        </p>
      </td>
    </tr>
  `
      )
      .join('')}
</table>

                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Important Note: The links are valid only until 11:59pm, 05 August 2024. Please ensure the forms are submitted by or before the date of expiry.</p>
                    <p style="color: #555555; font-size: 16px; margin-top: 20px; margin-bottom: 20px;">If you have any questions or require assistance, please contact our support team at peosupport@nathanhr.com.</p>
                    <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Thank you for your cooperation.</p>
                    <br/>
                    <p style="color: #555555; font-size: 16px;">Thanks and regards,
                    <br>PEO Support Team
                    </p>
                    <p style="color: #555555; font-size: 16px;">Nathan HR</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const sendIntendedEmail = async (users, tokens) => {
    const user = users[0]; // Use the first user for email address

    if (!user.email || !isEmail(user.email)) {
      console.error(`Invalid or undefined email for user with ID: ${user._id}`);
      try {
        await UserBackUp.create({
          ...user,
          backup_reason: 'invalid email'
        });
        console.log(`User with invalid email backed up successfully`);
      } catch (err) {
        console.error(`Error backing up user with invalid email: ${err}`);
      }
      return Promise.resolve();
    }

    // const updateLinks = users.map((u, index) => `${baseUrl}/update-missing-details?token=${tokens[index]}`);
    const updateLinks = users.map(
      (u, index) => `https://eor-central.nathanhr.com/update-missing-details?token=${tokens[index]}`
    );

    const htmlBody =
      users.length > 1
        ? generateMultipleUsersEmailBody(users, updateLinks)
        : generateSingleUserEmailBody(user, updateLinks[0]);

    // return new Promise((resolve, reject) => {
    //   const mail = new MailComposer({
    //     from: 'donotreply@nathanhr.ae',
    //     replyTo: 'donotreply@nathanhr.ae',
    //     to: [user.email],
    //     cc: [],
    //     subject: subject,
    //     html: htmlBody,
    //     attachments: attachments,
    //   });

    //   mail.compile().build((err, message) => {
    //     if (err) {
    //       return reject(`Error sending raw email: ${err}`);
    //     }
    //     console.log(`sending email to ${user?.first_name} ${user?.last_name}`)
    //     ses.sendRawEmail({ RawMessage: { Data: message } }).promise()
    //       .then(async (data) => {
    //         try {
    //           await new EmailLog({
    //             from: 'donotreply@nathanhr.ae',
    //             to: [user.email],
    //             cc: [],
    //             subject: subject,
    //             body: htmlBody,
    //           }).save();
    //           resolve(data);
    //         } catch (logErr) {
    //           console.error(`Error logging email: ${logErr}`);
    //           resolve(data);
    //         }
    //       })
    //       .catch((err) => reject(`Error sending raw email: ${err}`));
    //   });
    // });

    return new Promise((resolve, reject) => {
      const mail = new MailComposer({
        from: 'donotreply@nathanhr.ae',
        replyTo: 'donotreply@nathanhr.ae',
        to: config.mailTrap.trap == true ? config.mailTrap.toEmails : [user.email],
        cc: config.mailTrap.trap == true ? config.mailTrap.ccEmails : [],
        // to: [user.email],
        // cc: [],
        subject: subject,
        html: htmlBody,
        attachments: attachments,
        headers: {
          'X-Priority': '1', // Highest priority
          'X-MSMail-Priority': 'High', // For Outlook
          Importance: 'High' // General priority header
        }
      });

      mail.compile().build((err, message) => {
        if (err) {
          return reject(`Error sending raw email: ${err}`);
        }
        console.log(`Sending email to ${user?.first_name} ${user?.last_name}`);
        ses
          .sendRawEmail({ RawMessage: { Data: message } })
          .promise()
          .then(async data => {
            try {
              await new EmailLog({
                from: 'donotreply@nathanhr.ae',
                to: [user.email],
                cc: [],
                subject: subject,
                body: htmlBody
              }).save();
              resolve(data);
            } catch (logErr) {
              console.error(`Error logging email: ${logErr}`);
              resolve(data);
            }
          })
          .catch(err => reject(`Error sending raw email: ${err}`));
      });
    });
  };

  for (const email in usersByEmail) {
    const users = usersByEmail[email];
    const tokens = await Promise.all(users.map(user => tokenService.generateVerifyUpdateMissingDetailsToken(user._id)));
    try {
      await sendIntendedEmail(users, tokens);
    } catch (err) {
      console.error(`Failed to send email to ${email}: ${err}`);
    }
  }
}

// new implementations
async function getRecipientsEmail(user_id, recipients, requestType = '') {
  const emails = [];
  let user = await Users.findOne({ _id: ObjectId(user_id) });
  for (const recipient of recipients) {
    let currentUser = user;
    switch (recipient) {
      case 'employee':
        emails.push(user.email);
        break;
      case 'line_manager':
        const lineManager = await Users.findOne({ _id: ObjectId(user.reporting.manager) });
        emails.push(lineManager.email);
        break;
      case 'approvers':
        if (!requestType) break;
        const approval = await Approvals.findOne({ module: requestType, user_id: ObjectId(user_id) });
        if (approval) {
          const approvers = approval.approvers;
          for (const level in approvers) {
            const approverLevel = approvers[level];
            if (Array.isArray(approverLevel) && approverLevel.length > 0) {
              for (const approver of approverLevel) {
                try {
                  if (!approver) continue;
                  if (approver === 'line_manager_id') {
                    const lineManager = await Users.findOne({ _id: ObjectId(currentUser.reporting.manager) });
                    emails.push(lineManager.email);
                  } else {
                    const approverUser = await Users.findOne({ _id: ObjectId(approver) });
                    emails.push(approverUser.email);
                  }
                  continue;
                } catch (error) {
                  console.log('Error getting approver:', error);
                }
              }
            }
          }
        }
        break;
      default:
        user = await Users.findOne({ _id: ObjectId(recipient) });
        emails.push(user.email);
        break;
    }
  }

  return emails;
}

function replacePlaceholders(template, data) {
  return template.replace(/\[([^\]]+)\]/g, function (text, key) {
    const keyCamelCase = _.camelCase(key)
    return data[keyCamelCase];
  });
}
async function sendEmailUsingTemplateName(template_name, emailParams, company_ID, user_id, requestType, recipients = []) {
  try {
    const emailConfig = await EmailConfig.findOne({ company_ID: ObjectId(company_ID) });
    if (!emailConfig || !emailConfig.templates || emailConfig.templates.length == 0) {
      console.error('No email config found for company:', company_ID);
      return;
    }
    // console.log(template_name, "is the template name to sent email from")
    console.log(emailConfig.templates)
    // const template = emailConfig.templates.find((template) => {
    //   template.title === template_name && (template.status !== 'inactive' || !template.status)
    //   // template.subcategory === template_name && (template.status !== 'inactive' || !template.status)

    // }
    // );
    const template = emailConfig.templates.find((template) => {
      return template.title === template_name && (template.status !== 'inactive' || !template.status);
    });
    console.log(recipients, "==============>")
    if (!template) {
      console.error('No email template found for name:', template_name);
      return;
    }
    const to = recipients.length > 0 ? recipients : await getRecipientsEmail(user_id, template.to, requestType);
    if (!to || to.length == 0) {
      console.error('No recipients found for email template:', template_name);
      return;
    }
    await sendEmail(
      to,
      template.subject,
      replacePlaceholders(template.body, emailParams),
      await getRecipientsEmail(user_id, template.cc, requestType),
      await getRecipientsEmail(user_id, template.bcc, requestType)
    );
  } catch (error) {
    console.error('Error sending email using template name:', error);
    return;
  }
}

async function requestTenancyandResidencyDetailsTwo(subject, body, cc_emails, attachments, baseUrl) {
  const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });

  // filter employees from the users table
  const pipeline = [
    {
      $match: {
        is_deleted: false,
        user_status: { $in: ['onboarding', 'active'] },
        'employment.employment_type': { $in: ['Employment Visa (2-Year)', 'Work Permit (for UAE Resident visa holders)'] },
      }
    }
  ];

  // Use the pipeline to aggregate the data and fetch users with the role of "Employee"
  const systemUsers = await Users.aggregate(pipeline);
  console.log(systemUsers.length, 'total number of emaployees in this category');

  const emails = systemUsers.map(user => user.email);
  console.log(emails, "the emails")

  // Group users by email
  const usersByEmail = systemUsers.reduce((acc, user) => {
    if (!acc[user.email]) {
      acc[user.email] = [];
    }
    acc[user.email].push(user);
    return acc;
  }, {});

  const generateSingleUserEmailBody = (user, updateLink) =>
    `
    <html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px;">
        <h1 style="color: #333333; font-size: 16px; margin-bottom: 20px;">REMINDER: Dubai Tenancy Contract (EJARI) and Electricity Bill (DEWA) Update</h1>
        <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Dear ${user.first_name} ${user.last_name},</p>
        <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">We hope this message finds you well.</p>
        <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">As a friendly reminder, we are required to periodically update your information to maintain your residential status, in accordance with the <strong>UAE Ministry of Labour</strong> guidelines.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px;">
              <p style="color: #555555; font-size: 15px; margin-bottom: 10px;"><strong>If you live in Dubai:</strong></p>
              <ul style="color: #555555; font-size: 15px; margin-bottom: 10px; padding-left: 20px;">
                <li>Please upload a copy of your Tenancy Contract (EJARI) or Title Deed</li>
                <li>Also include your Electricity Bill (DEWA)</li>
              </ul>
              <p style="color: #555555; font-size: 15px; margin-bottom: 10px;"><strong>If you reside in a different emirate:</strong></p>
              <ul style="color: #555555; font-size: 15px; margin-bottom: 10px; padding-left: 20px;">
                <li>You only need to update your current address</li>
              </ul>
            </td>
          </tr>
        </table>
        <p style="color: #555555; font-size: 15px; margin-bottom: 20px;"><strong>Important:</strong> This update must be completed by <strong>August 31, 2024</strong>. If you have already submitted the necessary documents, please disregard this message.</p>
        <table align="center" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td align="center">
              <a href="${updateLink}" style="display: inline-block; background-color: #007bff; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 15px; font-weight: bold;">Update Your Information</a>
            </td>
          </tr>
        </table>
        <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Your prompt attention to this matter is greatly appreciated and helps ensure compliance with local regulations.</p>
        <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">If you have any questions or need assistance, please don't hesitate to reach out to our HR team.</p>
        <p style="color: #555555; font-size: 15px; margin-bottom: 20px;">Thank you for your cooperation.</p>

        <p style="color: #555555; font-size: 15px; margin-bottom: 20px;">Best regards,<br>HR Department<br>Support Team - Nathan and Nathan HR<br>
        Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>
        Branch office: 3rd Floor, Albwardy Building, Near Burjuman Mall, Dubai, United Arab Emirates<br>
        Ph: +971 4 354 4466
        </p>

      </td>
    </tr>
  </table>
</body>
</html>

  `
  const generateMultipleUsersEmailBody = (users, updateLinks) =>
    `
    <html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;">
    <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4" style="border-collapse: collapse;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px;">
                <h1 style="color: #333333; font-size: 16px; margin-bottom: 20px;">REMINDER: Dubai Tenancy Contract (EJARI) and Electricity Bill (DEWA) Update</h1>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Hello,</p>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">We are reaching out to remind you to update the residential information for the following employees as per the <strong>UAE Ministry of Labour</strong> guidelines. Maintaining up-to-date records is crucial for compliance.</p>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Please ensure the following details are updated:</p>

                <table>
                  ${users
      .map(
        (user, index) => `
                    <tr>
                      <td>
                        <p style="color: #555555; font-size: 16px; margin: 0; display: flex; justify-content: space-between; align-items: center;">
                          ${user.first_name} ${user.last_name}
                          <a href="${updateLinks[index]}" class="button">Update Tenancy and Residence Details</a>
                        </p>
                      </td>
                    </tr>
                  `
      )
      .join('')}
                </table>

                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;"><strong>If any of the employees live in Dubai:</strong></p>
                <ul style="color: #555555; font-size: 15px; margin-bottom: 10px;">
                  <li>Please upload a copy of their Tenancy Contract (EJARI) or Title Deed</li>
                  <li>Also include their Electricity Bill (DEWA)</li>
                </ul>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;"><strong>If they reside in a different emirate:</strong></p>
                <ul style="color: #555555; font-size: 15px; margin-bottom: 10px;">
                  <li>Only their current address needs to be updated</li>
                </ul>

                <p style="color: #555555; font-size: 15px; margin-bottom: 20px;"><strong>Important:</strong> This update must be completed by <strong>August 31, 2024</strong>. If you have already submitted the necessary documents, please disregard this message.</p>

                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">If you have any questions or require assistance, please contact our support team at <a href="mailto:peosupport@nathanhr.com" style="color: #007bff;">peosupport@nathanhr.com</a>.</p>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Thank you for your cooperation.</p>
                <br/>

                <p style="color: #555555; font-size: 15px; margin-bottom: 20px;">Best regards,<br>HR Department<br>Support Team - Nathan and Nathan HR<br>Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>Branch office: 3rd Floor, Albwardy Building, Near Burjuman Mall, Dubai, United Arab Emirates<br>Ph: +971 4 354 4466</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

  `

  const sendIntendedEmail = async (users, tokens) => {
    const user = users[0]; // Use the first user for email address

    if (!user.email || !isEmail(user.email)) {
      console.error(`Invalid or undefined email for user with ID: ${user._id}`);
      try {
        await UserBackUp.create({
          ...user,
          backup_reason: 'invalid email for tenancy'
        });
        console.log(`User with invalid email backed up successfully`);
      } catch (err) {
        console.error(`Error backing up user with invalid email: ${err}`);
      }
      return Promise.resolve();
    }

    // const updateLinks = users.map((u, index) => `${baseUrl}/update-missing-details?token=${tokens[index]}`);
    const updateLinks = users.map(
      (u, index) => `https://eor-central.nathanhr.com/update-v2?token=${tokens[index]}`
    );

    const htmlBody =
      users.length > 1
        ? generateMultipleUsersEmailBody(users, updateLinks)
        : generateSingleUserEmailBody(user, updateLinks[0]);

    return new Promise((resolve, reject) => {
      const mail = new MailComposer({
        from: 'donotreply@nathanhr.ae',
        replyTo: 'donotreply@nathanhr.ae',
        to: config.mailTrap.trap == true ? config.mailTrap.toEmails : [user.email],
        cc: config.mailTrap.trap == true ? config.mailTrap.ccEmails : [],
        // to: [user.email],
        // cc: [],
        subject: subject,
        html: htmlBody,
        attachments: attachments,
        headers: {
          'X-Priority': '1', // Highest priority
          'X-MSMail-Priority': 'High', // For Outlook
          Importance: 'High' // General priority header
        }
      });

      mail.compile().build((err, message) => {
        if (err) {
          return reject(`Error sending raw email: ${err}`);
        }
        console.log(`Sending email to ${user?.first_name} ${user?.last_name}`);
        ses
          .sendRawEmail({ RawMessage: { Data: message } })
          .promise()
          .then(async data => {
            try {
              await new EmailLog({
                from: 'donotreply@nathanhr.ae',
                to: [user.email],
                cc: [],
                subject: subject,
                body: htmlBody
              }).save();
              resolve(data);
            } catch (logErr) {
              console.error(`Error logging email: ${logErr}`);
              resolve(data);
            }
          })
          .catch(err => reject(`Error sending raw email: ${err}`));
      });
    });
  };

  for (const email in usersByEmail) {
    const users = usersByEmail[email];
    const tokens = await Promise.all(users.map(user => tokenService.generateVerifyUpdateMissingDetailsToken(user._id)));
    try {
      await sendIntendedEmail(users, tokens);
    } catch (err) {
      console.error(`Failed to send email to ${email}: ${err}`);
    }
  }
}

async function requestTenancyandResidencyDetails(subject, baseUrl, userIds = []) {
  try {
    const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });

    // Specified user IDs
    const userIds = [
      '6589150e4044e59354d84132',
      '6479c6145a00de0b984a14a0',
    ];
    let users;

    // Fetch users based on the specified IDs
    // const users = await Users.find({ email: { $in: "cecil@nathandigital.com" } });
    if (userIds.length > 1) {
      users = await Users.find({ is_deleted: false, user_status: { $in: ['onboarding', 'active', 'new visa process'] } })
    } else {
      const mappedIds = userIds.map(id => ObjectId(id));
      users = await Users.find({ _id: { $in: mappedIds }, is_deleted: false, user_status: { $in: ['onboarding', 'active', 'new visa process'] } })
    }

    // console.log(users[0].role_ID)
    // Generate tokens for each user
    const tokens = await Promise.all(users.map(user => getTokenService().generateVerifyUpdateMissingDetailsToken(user._id)));

    // Generate update links
    const updateLinks = tokens.map(token => `https://eor-central.nathanhr.com/update-v2?token=${token}`);

    // Generate email body
    const htmlBody = generateMultipleUsersEmailBody(users, updateLinks);

    // Email configuration
    const mailOptions = {
      from: 'donotreply@nathanhr.ae',
      replyTo: 'donotreply@nathanhr.ae',
      to: config.mailTrap.trap ? config.mailTrap.toEmails : users.map(user => user.email),
      cc: config.mailTrap.trap ? config.mailTrap.ccEmails : [],
      subject: subject,
      html: htmlBody,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        Importance: 'High'
      }
    };

    // Send email
    return new Promise((resolve, reject) => {
      const mail = new MailComposer(mailOptions);

      mail.compile().build((err, message) => {
        if (err) {
          return reject(`Error compiling email: ${err}`);
        }

        console.log(`Sending email to individual users: ${mailOptions.to.join(', ')}`);
        ses.sendRawEmail({ RawMessage: { Data: message } })
          .promise()
          .then(async data => {
            try {
              await new EmailLog({
                from: mailOptions.from,
                to: mailOptions.to,
                cc: mailOptions.cc,
                subject: mailOptions.subject,
                body: mailOptions.html
              }).save();
              resolve(data);
            } catch (logErr) {
              console.error(`Error logging email: ${logErr}`);
              resolve(data);
            }
          })
          .catch(err => reject(`Error sending raw email: ${err}`));
      });
    });
  } catch (error) {
    console.log(error)
  }
}

// Existing generateMultipleUsersEmailBody function (unchanged)
const generateMultipleUsersEmailBody = (users, updateLinks) =>
  `
    <html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;">
    <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4" style="border-collapse: collapse;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px;">
                <h1 style="color: #333333; font-size: 16px; margin-bottom: 20px;">REMINDER: Dubai Tenancy Contract (EJARI) and Electricity Bill (DEWA) Update</h1>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Hello,</p>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">We are reaching out to remind you to update the residential information for the following employees as per the <strong>UAE Ministry of Labour</strong> guidelines. Maintaining up-to-date records is crucial for compliance.</p>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Please ensure the following details are updated:</p>

                <table>
                  ${users
    .map(
      (user, index) => `
                    <tr>
                      <td>
                        <p style="color: #555555; font-size: 16px; margin: 0; display: flex; justify-content: space-between; align-items: center;">
                          ${user.first_name} ${user.last_name}
                          <a href="${updateLinks[index]}" class="button">Update Tenancy and Residence Details</a>
                        </p>
                      </td>
                    </tr>
                  `
    )
    .join('')}
                </table>

                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;"><strong>If any of the employees live in Dubai:</strong></p>
                <ul style="color: #555555; font-size: 15px; margin-bottom: 10px;">
                  <li>Please upload a copy of their Tenancy Contract (EJARI) or Title Deed</li>
                  <li>Also include their Electricity Bill (DEWA)</li>
                </ul>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;"><strong>If they reside in a different emirate:</strong></p>
                <ul style="color: #555555; font-size: 15px; margin-bottom: 10px;">
                  <li>Only their current address needs to be updated</li>
                </ul>

                <p style="color: #555555; font-size: 15px; margin-bottom: 20px;"><strong>Important:</strong> This update must be completed by <strong>August 31, 2024</strong>. If you have already submitted the necessary documents, please disregard this message.</p>

                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">If you have any questions or require assistance, please contact our support team at <a href="mailto:peosupport@nathanhr.com" style="color: #007bff;">peosupport@nathanhr.com</a>.</p>
                <p style="color: #555555; font-size: 15px; margin-bottom: 10px;">Thank you for your cooperation.</p>
                <br/>

                <p style="color: #555555; font-size: 15px; margin-bottom: 20px;">Best regards,<br>HR Department<br>Support Team - Nathan and Nathan HR<br>Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>Branch office: 3rd Floor, Albwardy Building, Near Burjuman Mall, Dubai, United Arab Emirates<br>Ph: +971 4 354 4466</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`




const sendMobileAppInvitations = async (users, company_ID) => {

  const emails = [{
    "first_name": "Shaiju",
    "last_name": "Sahadevan",
    "email": "mr.qaizi@gmail.com"
  },
  {
    "first_name": "James Lazarus",
    "last_name": "Fernandes",
    "email": "fernzjames@yahoo.com"
  },
  {
    "first_name": "Imran",
    "last_name": "Ali",
    "email": "lanie-saupan@gr.sei.co.jp"
  },
  {
    "first_name": "Naveed",
    "last_name": "Anjum",
    "email": "naveedachu@gmail.com"
  },
  {
    "first_name": "Nizomiddin",
    "last_name": "Arzumetov",
    "email": "narzumetov@harso.com"
  },
  {
    "first_name": "Sahil",
    "last_name": "Rashid",
    "email": "sahilrashid21@gmail.com"
  },
  {
    "first_name": "Ayyaz",
    "last_name": "Ali Khan",
    "email": "khan.ayyaz@gmail.com"
  },
  {
    "first_name": "Mohamed Elfatih",
    "last_name": "Eldaw Ali",
    "email": "mohmedelfatih95@gmail.com"
  },
  {
    "first_name": "Saneesh ",
    "last_name": "Thomas",
    "email": "saneeshts4@gmail.com"
  },
  {
    "first_name": "Srinavasa Raghavan",
    "last_name": "-",
    "email": "c_raghavan@hotmail.com"
  },
  {
    "first_name": "Dennis Franciscus Joannes",
    "last_name": "Snijders",
    "email": "dennis.snijders@integratedglobal.com"
  },
  {
    "first_name": "Gina",
    "last_name": "Paloyo",
    "email": "ginapaloyo@gmail.com"
  },
  {
    "first_name": "Syed Imran Farooq",
    "last_name": "Syed farooq",
    "email": "imran.syed@richfitint.com"
  },
  {
    "first_name": "Merceditha",
    "last_name": "Jaro",
    "email": "waleed.mohamed@a-map.net"
  },
  {
    "first_name": "Viran ",
    "last_name": "Jagdev"
  },
  {
    "first_name": "Sara",
    "last_name": "Belehri",
    "email": "belehrisara@gmail.com"
  },
  {
    "first_name": "Alaa",
    "last_name": "Al Hasn",
    "email": "alaa_277@hotmail.com"
  },
  {
    "first_name": "Tegan Rosalie",
    "last_name": "Kerr",
    "email": "tegan.kerridge@gmail.com"
  },
  {
    "first_name": "Baha Talal Ibrahim",
    "last_name": "Ashour",
    "email": "bahaatashour@gmail.com"
  },
  {
    "first_name": "Yubak",
    "last_name": "Rai",
    "email": "lanie-saupan@gr.sei.co.jp"
  },
  {
    "first_name": "Andrea",
    "last_name": "Rincon Ray",
    "email": "andrearinconray@gmail.com"
  },
  {
    "first_name": "Balavenkatesh",
    "last_name": "Mani",
    "email": "splendidbala@gmail.com"
  },
  {
    "first_name": "Chandra Mouli",
    "last_name": "Yenda",
    "email": "ychandu1995@gmail.com"
  },
  {
    "first_name": "Mohamed Kamel Ali Yousef Ahmed Rezk",
    "last_name": "Rezk",
    "email": "mohamed.rizk@breas.com"
  },
  {
    "first_name": "Clinton Rakesh",
    "last_name": "Lobo",
    "email": "clinton_lobo@yahoo.com"
  },
  {
    "first_name": "Linu",
    "last_name": "Babu",
    "email": "mr.qaizi@gmail.com"
  },
  {
    "first_name": "Majed",
    "last_name": "Rajab",
    "email": "majdrajab@gmail.com"
  },
  {
    "first_name": "Ruth Bisola",
    "last_name": "Jolayemi",
    "email": "ashnaisbitt@yahoo.co.uk"
  },
  {
    "first_name": "Shen",
    "last_name": "Feng",
    "email": "1537313816@qq.com"
  },
  {
    "first_name": "Sheryl Anne",
    "last_name": "Anden",
    "email": "sherylhawaiianhush@gmail.com"
  },
  {
    "first_name": "Ranpreet",
    "last_name": "Singh",
    "email": "ranpreet790@gmail.com"
  },
  {
    "first_name": "Indu ",
    "last_name": "Koottala ",
    "email": "indu.koottala@belimed.com"
  },
  {
    "first_name": "Jad",
    "last_name": "Srouji",
    "email": "sroujijad@gmail.com"
  },
  {
    "first_name": "Lea Gamboca",
    "last_name": "Cajomocan",
    "email": "9250430@gmail.com"
  },
  {
    "first_name": "Sunil",
    "last_name": "Bose",
    "email": "sunigdr.89@gmail.com"
  },
  {
    "first_name": "Racha",
    "last_name": "Abdallah",
    "email": "rasha.sami.abdallah@gmail.com"
  },
  {
    "first_name": "Georges",
    "last_name": "Saad",
    "email": "george_s83@hotmail.com"
  },
  {
    "first_name": "Emerson Alexandre",
    "last_name": "Mauf",
    "email": "sean@kis.com.br"
  },
  {
    "first_name": "Marian",
    "last_name": "Kamel",
    "email": "mkamel@automatic-systems.com"
  },
  {
    "first_name": "Johny",
    "last_name": "Kannan",
    "email": "jkanaan@inspiredbeauty.com"
  },
  {
    "first_name": "Nasir",
    "last_name": "Mushtaq",
    "email": "waleed.mohamed@a-map.net"
  },
  {
    "first_name": "Melia",
    "last_name": "Hasanah",
    "email": "waleed.mohamed@a-map.net"
  },
  {
    "first_name": "Nitya Sudha",
    "last_name": "Kaul",
    "email": "nityaka3@gmail.com"
  },
  {
    "first_name": "Sarath Kumar",
    "last_name": "Sasidharan Pillai",
    "email": "sarathbme25@gmail.com"
  },
  {
    "first_name": "Muhammad Raza",
    "last_name": "Muhammad Imran",
    "email": "mubeen95@hotmail.co.uk"
  },
  {
    "first_name": "Riyad (Moh'd Mesbah) Hamdi Al Khalili",
    "last_name": "-",
    "email": "riyad.khalili@csisolar.com"
  },
  {
    "first_name": "Tobechukwu Chiemena",
    "last_name": "Onuegbu",
    "email": "onuegbu.tobechukwu@gmail.com"
  },
  {
    "first_name": "Akbar Ali Khan",
    "last_name": "Pathan",
    "email": "paakhan@gmail.com"
  },
  {
    "first_name": "Katherine",
    "last_name": "Cabanach Dresden",
    "email": "katherinecabanach@gmail.com"
  },
  {
    "first_name": "Ramamurthy",
    "last_name": "Ramakumar Kuzhalmannam",
    "email": "sai.krr652@gmail.com"
  },
  {
    "first_name": "John",
    "last_name": "Michael",
    "email": "anyemailcj@gmail.com"
  },
  {
    "first_name": "Elsa",
    "last_name": "Crucillo",
    "email": "tatiana.aspinwall@clermont.com"
  },
  {
    "first_name": "Jerold Baffour Kwabena",
    "last_name": "Twum Adjei-Ampofo",
    "email": "jjaampofo@yahoo.co.uk"
  },
  {
    "first_name": "Chaitanya",
    "last_name": "Sharma",
    "email": "chaitanya@connectwell.com / c.sharma8888@gmail.com"
  },
  {
    "first_name": "Romeo",
    "last_name": "Avinante",
    "email": "avinanter@yahoo.com"
  },
  {
    "first_name": "Nisha",
    "last_name": "Lama Syangbo",
    "email": "waleed.mohamed@a-map.net"
  },
  {
    "first_name": "Rami",
    "last_name": "Aldeeb",
    "email": "ramideeb65@gmail.com"
  },
  {
    "first_name": "Niwat",
    "last_name": "Boonsong",
    "email": "niwat251601@gmail.com"
  },
  {
    "first_name": "Adam Matthew",
    "last_name": "Mc Hugh"
  },
  {
    "first_name": "Hussein",
    "last_name": "Dasuki",
    "email": "hdassouki@gmail.com"
  },
  {
    "first_name": "Kotze",
    "last_name": "Nieuwenhuys",
    "email": "kotze.nieuwenhuys@gmail.com"
  },
  {
    "first_name": "Hamza",
    "last_name": "Drici Tani",
    "email": "hamzadricitani@gmail.com"
  },
  {
    "first_name": "Vinay Kumar",
    "last_name": "Panuganti",
    "email": "vinay2503@gmail.com"
  },
  {
    "first_name": "Mary Joy",
    "last_name": "De Leon",
    "email": "jmelgarejo@ecri.org"
  },
  {
    "first_name": "Eric",
    "last_name": "Gibson",
    "email": "bmf160971@gmail.com"
  },
  {
    "first_name": "Prema",
    "last_name": "Gautam",
    "email": "premaasingh979@gmail.com"
  },
  {
    "first_name": "Maride",
    "last_name": "Pahuriray",
    "email": "maride.pahuriray01@gmail.com"
  },
  {
    "first_name": "JOEY",
    "last_name": "DARYL",
    "email": "joey.lim@cedarholdings.org"
  },
  {
    "first_name": "Chittima",
    "last_name": "Rakphrom",
    "email": "chittima.rakphrom@shangdumail.com"
  },
  {
    "first_name": "Huseyin ",
    "last_name": "Aslan "
  },
  {
    "first_name": "Raheez",
    "last_name": "Srambikkooloth",
    "email": "raheez.abdulrahim@live.com"
  },
  {
    "first_name": "Mohamed Irfan",
    "last_name": "Ashraf",
    "email": "irfan.mohamed37@gmail.com"
  },
  {
    "first_name": "Ninder",
    "last_name": "Jhita",
    "email": "njhita34@googlemail.com"
  },
  {
    "first_name": "Sofia",
    "last_name": "Ouqaf",
    "email": "sofia@sam-media.com"
  },
  {
    "first_name": "Halim",
    "last_name": "Hardan",
    "email": "hardan.halim@gmail.com"
  },
  {
    "first_name": "Sadyrbek",
    "last_name": "Semeteev"
  },
  {
    "first_name": "Rachna",
    "last_name": "Dixit Chader",
    "email": "vivian.cao@ins-global.com"
  },
  {
    "first_name": "Zhang",
    "last_name": "Hua",
    "email": "1835185068@qq.com"
  },
  {
    "first_name": "Esther",
    "last_name": "Conteh",
    "email": "contehester47@gmail.com"
  },
  {
    "first_name": "Rania",
    "last_name": "Kassab",
    "email": "rania.kassab@hotmail.com"
  },
  {
    "first_name": "Nanchakon ",
    "last_name": "Seechuen "
  },
  {
    "first_name": "Sithin",
    "last_name": "Kottala Sunil",
    "email": ""
  },
  {
    "first_name": "Alif",
    "last_name": "Fikri",
    "email": "aliffikri90@yahoo.com"
  },
  {
    "first_name": "Yuquan",
    "last_name": "Wei",
    "email": "weiyuquan@vspn.com"
  },
  {
    "first_name": "Reshma",
    "last_name": "Suresh",
    "email": "reshmasureshraman@gmail.com"
  },
  {
    "first_name": "Eman",
    "last_name": "Al Khatib",
    "email": "emansameer8@gmail.com"
  },
  {
    "first_name": "Riman",
    "last_name": "Oueiti",
    "email": "vivian.cao@ins-global.com"
  },
  {
    "first_name": "Alisher",
    "last_name": "Sorokin",
    "email": "operations@silberson.com"
  },
  {
    "first_name": "Malik Omar Mohammad Abuserdaneh",
    "last_name": "-",
    "email": "malik.abuserdaneh@efficientip.com"
  },
  {
    "first_name": "Albert",
    "last_name": "Alphones",
    "email": "albert@sam-media.com"
  },
  {
    "first_name": "Poonam",
    "last_name": "Gupta",
    "email": "poonam.gupta@tendable.com"
  },
  {
    "first_name": "Adrian",
    "last_name": "Martinez",
    "email": "adrianom540@gmail.com"
  },
  {
    "first_name": "Jossy",
    "last_name": "Pathaparambil Varghese",
    "email": "jossy.x.kurien@nord-lock.com"
  },
  {
    "first_name": "Brenda",
    "last_name": "Gladys Matare",
    "email": "brendagladys26@gmail.com"
  },
  {
    "first_name": "Vlizy",
    "last_name": "Dumanay",
    "email": "dumanayvlizy@gmail.com"
  },
  {
    "first_name": "Neha",
    "last_name": "Jamshid",
    "email": "nehajamshid99@gmail.com"
  },
  {
    "first_name": "Yuan",
    "last_name": "Xu",
    "email": "anwar.yuan@dji.com"
  },
  {
    "first_name": "Mohamed Mahmoud Soliman",
    "last_name": "Elfeky",
    "email": "mohamed82.soliman@gmail.com"
  },
  {
    "first_name": "Christopher",
    "last_name": "Pidsley",
    "email": "chris.pidsley@efinancialcareers.com"
  },
  {
    "first_name": "Abdullah Waleed O",
    "last_name": "Albissi",
    "email": "aa_ww2006@hotmail.com"
  },
  {
    "first_name": "Eiman",
    "last_name": "Andargiri",
    "email": "eman.andrgiri@icloud.com"
  },
  {
    "first_name": "Grace",
    "last_name": "Ablaza",
    "email": "gracevillono441@gmail.com"
  },
  {
    "email": "ahmed.thabet@oetkercollection.com",
    "first_name": "Ahmed",
    "last_name": "Thabet"
  },
  {
    "first_name": "Mohammad Ayman",
    "last_name": "Aitour",
    "email": "aytour.ayman@gmail.com"
  },
  {
    "email": "herbertekujones@gmail.com",
    "first_name": "Herbert",
    "last_name": "Eku Jones"
  },
  {
    "first_name": "Rungano Precious",
    "last_name": "Takawira",
    "email": "precioustakawira42@gmail.com"
  },
  {
    "first_name": "Elsie",
    "last_name": "Quindap Bustamante",
    "email": "richellestocks@gmail.com"
  },
  {
    "first_name": "Raed Mutlaq O",
    "last_name": "Alotaibi",
    "email": "alwafi8008@gmail.com"
  },
  {
    "first_name": "Armie",
    "last_name": "Jane Arquion",
    "email": "armiearquion@gmail.com"
  },
  {
    "first_name": "Dawn ",
    "last_name": "Ene Woodhouse",
    "email": "dawn.ene.woodhouse@googlemail.com"
  },
  {
    "first_name": "Sunil Mansukhlal",
    "last_name": "Modha",
    "email": "sunil.modha152@gmail.com"
  },
  {
    "first_name": "Okla Fawzi",
    "last_name": "Okla Aldabet",
    "email": "okla.aldabet@gmail.com"
  },
  {
    "first_name": "Cinderella ",
    "last_name": "Jaylo",
    "email": "jaylocinderella@gmail.com"
  },
  {
    "first_name": "Charity",
    "last_name": "Chimene",
    "email": "briggskabaya7@gmail.com"
  },
  {
    "first_name": "Yitian",
    "last_name": "Huang",
    "email": "huangyitian1@shein.com"
  },
  {
    "first_name": "Jose Miguel",
    "last_name": "Alcivar Nunez",
    "email": "j.malcivar@exagroup.net"
  },
  {
    "first_name": "Brieuc",
    "last_name": "Derouault",
    "email": "brieuc.derouault@malt.com"
  },
  {
    "first_name": "Seyed Homam",
    "last_name": "Hosseini",
    "email": "homam@sam-media.com"
  },
  {
    "first_name": "Christina Abi ",
    "last_name": "Rizk",
    "email": "christina.abirizk@gmail.com"
  },
  {
    "first_name": "Florence",
    "last_name": "Tampus",
    "email": "florencetampus@yahoo.com"
  },
  {
    "email": "aysegulbahcivanoglu@yahoo.com",
    "first_name": "Aysegul",
    "last_name": "Bahcivanoglu"
  },
  {
    "first_name": "Alain Franck Maxance",
    "last_name": "Lacombe",
    "email": "aflacombe@hotmail.com"
  },
  {
    "first_name": "Antoni Olgierd",
    "last_name": "Zarychta",
    "email": "antoni.zarychta@gmail.com"
  },
  {
    "first_name": "Saifullah Ahmed",
    "last_name": "Khan",
    "email": "saifullahkhan04@outlook.com"
  },
  {
    "first_name": "Charlyn",
    "last_name": "Dacalan",
    "email": "charlyndacalan@gmail.com"
  },
  {
    "first_name": "Shaoxiang",
    "last_name": "Wang",
    "email": "homerwang@shein.com"
  },
  {
    "email": "juliet@nathanhrarchived.com",
    "first_name": "Juliet ",
    "last_name": "Mganda"
  },
  {
    "first_name": "John Kennedy ",
    "last_name": "Politico",
    "email": "johnkennedypolitico@gmail.com"
  },
  {
    "first_name": "  Ntui Ayuk ",
    "last_name": "Romario",
    "email": "ntuiayukromariol8@gmail.com"
  },
  {
    "first_name": "Muhammad ",
    "last_name": "Ishfaq",
    "email": "ishfaqgujjar198@gmail.com"
  },
  {
    "first_name": "Abdul",
    "last_name": "Ashik ",
    "email": "ashikmadathattu@icloud.com"
  },
  {
    "first_name": "Valentin Victor Claude",
    "last_name": " Reyx",
    "email": "valentin.reyx@gmail.com"
  },
  {
    "first_name": "Roden Banaga ",
    "last_name": "Abacan",
    "email": "abacanroden@gmail.com"
  },
  {
    "first_name": "Xiaofan ",
    "last_name": "Shang",
    "email": "shawn.shang@dji.com"
  },
  {
    "first_name": "Birkhalal  ",
    "last_name": "Khadka",
    "email": "birkhakhadka46@gmail.com"
  },
  {
    "first_name": "Madhu Kishor ",
    "last_name": "Dawadi",
    "email": "madhukishor321@gmail.com"
  },
  {
    "first_name": "Chirag Kumar Jitendrabhai",
    "last_name": "Bhavsar",
    "email": "cjbhavsar1@yahoo.com"
  },
  {
    "first_name": "Sanil",
    "last_name": "Sunny",
    "email": "sanilparekkadens@gmail.com"
  },
  {
    "first_name": "Selvin Joseph",
    "last_name": "Fernandes",
    "email": "jenefer.anto@xische.com"
  },
  {
    "first_name": "Peijie",
    "last_name": "Yuan",
    "email": "patrykyuan@shein.com"
  },
  {
    "first_name": "Chao",
    "last_name": "Wang",
    "email": "wangchao21@shein.com"
  },
  {
    "first_name": "Shankar Ramchand",
    "last_name": "Lochani",
    "email": "suri.lochani@inp-e.com"
  },
  {
    "first_name": "William Fraser Gwynfor",
    "last_name": "Jones",
    "email": "william.jones@malt.com"
  },
  {
    "first_name": "Samshul Hoda",
    "last_name": "Ansari",
    "email": "shamsulhodaansari@gmail.com"
  },
  {
    "first_name": "Mohamed Fouad Ismaiel",
    "last_name": "Shaheen",
    "email": "jenefer.anto@xische.com"
  },
  {
    "first_name": "Valeriia",
    "last_name": "Gard",
    "email": "zmoster@ctme.co"
  },
  {
    "first_name": "Grigore ",
    "last_name": "Roman",
    "email": "j.ludovice@exagroup.net"
  },
  {
    "first_name": "Gregory",
    "last_name": "Williams",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Grant ",
    "last_name": "Bettinson",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Antonio Jimenez ",
    "last_name": "Manzorro",
    "email": "antonio_jim@yahoo.es"
  },
  {
    "first_name": "Lisa",
    "last_name": "Snape",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Ashley Elizabeth",
    "last_name": "Cercone",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Margaux Amandine",
    "last_name": "Gillis",
    "email": "margaux.a.gillis@gmail.com"
  },
  {
    "first_name": "Sally Fathi Alsayed Mohamed ",
    "last_name": "Wehesh",
    "email": "jenefer.anto@xische.com"
  },
  {
    "first_name": "Enzo ",
    "last_name": "Cocca",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Ols",
    "last_name": "Lafe",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Abigail",
    "last_name": "Francesca",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Vidyadharan",
    "last_name": "Gurickalkandy",
    "email": "vidya1964@gmail.com"
  },
  {
    "first_name": "Riccardo",
    "last_name": "Ferrareso",
    "email": "accountant@rcssportsandevents.com"
  },
  {
    "first_name": "Alexandra Rose ",
    "last_name": "Ritter",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Lawrence Philip",
    "last_name": "Chiatti",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Nicholas",
    "last_name": "Handerson",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Bernardo Vila ",
    "last_name": "Rodriguez",
    "email": "amcdowell@chronicleheritage.com"
  },
  {
    "first_name": "Mohammed ",
    "last_name": "Asif Ali",
    "email": "jenefer.anto@xische.com"
  },
  {
    "first_name": "David Philip ",
    "last_name": "Cheshire",
    "email": "people@carbonclean.com"
  },
  {
    "first_name": "Patrick Clark",
    "last_name": "Mcduffie",
    "email": "m.shahid@silberson.com"
  },
  {
    "first_name": "Edward",
    "last_name": "Holmes",
    "email": "people@carbonclean.com"
  },
  {
    "first_name": "Amol",
    "last_name": "Bhosale",
    "email": "people@carbonclean.com"
  },
  {
    "first_name": "Camil",
    "last_name": "Micsunescu",
    "email": "people@carbonclean.com"
  },
  {
    "first_name": "Christopher Neil ",
    "last_name": "Wright",
    "email": "gemma.uy@eerme.com"
  },
  {
    first_name: "Roney",
    last_name: "George",
    email: "roney@nathandigital.com"
  }
  ]


  let i = 0;
  for (const email of emails) {
    console.log(`Sending email ${++i} out of ${emails.length}`);
    const msg = {
      Source: 'donotreply@nathanhr.ae',
      Destination: {
        ToAddresses: [email.email],
      },
      Message: {
        Body: {
          Html: {
            Data: `<div
                  style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="text-align: center; color: #007BFF;">Exciting Update: Access Payslips & HR Support via PEO Central</h2>

                  <p>Dear <strong>${email.first_name} ${email.last_name}</strong>,</p>

                  <p>We are excited to announce that starting <strong>January 2025</strong>, all payslips will be available for download
                    directly through the <strong>PEO Central</strong> portal! Additionally, you can access all payslips from
                    <strong>December 2024</strong> onward on the portal as well.
                  </p>

                  <h3 style="color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Why PEO Central?</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">📄</span>
                      <strong>Access Payslips Instantly:</strong> Download your payslips with just a few taps.
                    </li>
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">🔒</span>
                      <strong>Secure Document Storage:</strong> Keep all your important HR documents in one place.
                    </li>
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">🎯</span>
                      <strong>Simplified HR Requests:</strong> Raise requests for letters, salary inquiries, and more—all through the
                      app.
                    </li>
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">💬</span>
                      <strong>24/7 Support:</strong> Get quick assistance via the app’s live chat feature.
                    </li>
                  </ul>

                  <h3 style="color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Steps to Get Started</h3>
                  <ol style="padding-left: 20px;">
                    <li>
                      <strong>Download the App:</strong>
                      <div style="   display: flex;  justify-content: center; ">
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
                    <li><strong>Sign in:</strong> Use your registered email.</li>
                    <li><strong>Verify:</strong> Enter the OTP sent to your email.</li>
                    <li><strong>Set Password:</strong> Create your password and start exploring!</li>
                  </ol>

                  <h3 style="color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 5px;">What’s Changing?</h3>
                  <p>All HR support will now be moving <strong>online</strong> via PEO Central. This means:</p>
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">📋</span>
                      <strong>Raise Support Tickets:</strong> Submit requests like letters or salary inquiries quickly.
                    </li>
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">📥</span>
                      <strong>Easy Payslip Access:</strong> Retrieve your payslips anytime, anywhere.
                    </li>
                    <li style="margin-bottom: 10px;">
                      <span style="font-size: 20px; vertical-align: middle; margin-right: 8px;">💼</span>
                      <strong>Comprehensive HR Tools:</strong> Manage all your HR needs seamlessly.
                    </li>
                  </ul>

                  <p>If you have any questions or need assistance, our <strong>support team</strong> is just a tap away via the app.</p>

                  <p>Thank you for your cooperation, and we’re confident you’ll love the convenience of PEO Central!</p>

                  <p style="margin-top: 20px;"><strong>Best Regards,</strong><br>PEO Support Team</p>
                </div>`,
            Charset: 'UTF-8'
          },
          Text: {
            Data: ``,
            Charset: 'UTF-8'
          }
        },
        Subject: {
          Data: 'Important Reminder: Access Payslips & HR Support via PEO Central',
          Charset: 'UTF-8'
        }
      }
    };
    await ses.sendEmail(msg, async (err, data) => {
      if (err) {
        reject(err);
      } else {
        await new EmailLog({
          from: 'donotreply@nathanhr.ae',
          to: email,
          subject: msg.Message.Subject.Data,
          body: msg.Message.Body.Data
        }).save();
      }
    });
  }
}
module.exports = {
  sendEmail,
  sendRawEmail,
  requestUserInfoUpdate,
  getRecipientsEmail,
  sendEmailUsingTemplateName,
  requestTenancyandResidencyDetails,
  sendMobileAppInvitations
};
