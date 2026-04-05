const mongoose = require('mongoose');

const { SECRET_ID_AWS, SECRET_KEY_AWS, AWS_REGION } = process.env;
const { uploadFilesToS3 } = require('./aws.service');
const { ObjectId } = require('mongodb');
const { EmailLog, enrollmentsModel, Companies, Role, Poc, Configurations, Documents, Leads } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { createChartOfAccountForCompany } = require('../helpers/chart_of_accounts_helper');
const ses = new AWS.SES({
  accessKeyId: SECRET_ID_AWS,
  secretAccessKey: SECRET_KEY_AWS,
  region: AWS_REGION
});

const createEnrollment = async enrollmentBody => {
  try {
    const enrollment = await enrollmentsModel.create(enrollmentBody);
    if (!enrollment) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating enrollment');
    }
    await sendInitialEmail(enrollment._id);
    return enrollment;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating enrollment');
  }
};

const listAllEnrollments = async () => {
  try {
    const enrollments = await enrollmentsModel.find({ is_deleted: false });
    return enrollments;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error listing enrollments');
  }
};

const getEntrollmentByCompanyEmail = async companyEmail => {
  try {
    const enrollment = await enrollmentsModel.findOne({ email: companyEmail });
    return enrollment;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error listing enrollment');
  }
};

const getEnrollmentByCompanyId = async companyId => {
  try {
    const enrollment = await enrollmentsModel.findOne({ company_id: ObjectId(companyId) });
    // const company = await Companies.findOne({ _id: ObjectId(companyId) });
    // console.log(company.company_name, "company name in getEnrollmentByCompanyId")
    // const reconstructedDoc = enrollment.toObject();
    // reconstructedDoc.billing_address = company.billing_address;
    // reconstructedDoc.shipping_address = company.shipping_address;
    // reconstructedDoc.company_address = company.company_address;
    // reconstructedDoc.contact_persons = company.contact_persons;
    return enrollment;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error listing enrollment');
  }
};

const getEnrollmentById = async enrollmentId => {
  if (!ObjectId.isValid(enrollmentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid enrollment id');
  }
  try {
    const enrollment = await enrollmentsModel.findById(enrollmentId);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }
    return enrollment;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error getting enrollment');
  }
};

const updateEnrollmentById = async (enrollmentId, updateBody) => {
  if (!ObjectId.isValid(enrollmentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid enrollment');
  }
  try {
    const enrollment = await enrollmentsModel.findById(enrollmentId);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }
    Object.assign(enrollment, updateBody);
    await enrollment.save();
    let companyData;
    if (enrollment.isOnboardedLead) {
      companyData = await Companies.findById(enrollment.company_id);
      if (companyData) {
        console.log('--------> updating company!!!!!!!!!!!!!!!!!!');
        delete updateBody._id;
        console.log(Object.keys(updateBody));
        const allowedKeys = [
          'billing_address',
          'shipping_address',
          'is_editable',
          'letterDetail',
          'contact_persons',
          'upfront_costs',
          'upfront_costs_ees',
          'payroll_schedule',
          'configurations',
          'locations',
          'available_insurances',
          'is_deleted',
          'monthly_costs',
          'requires_payroll_input',
          'invoice_format',
          'details_updated',
          'legal_name',
          'company_name',
          'email',
          'company_id',
          'bank_details',
          'registration_number',
          'phone',
          'GRN_number',
          'business_industry',
          'company_address',
          'country',
          'documents',
          'linkedIn',
          'phone_number',
          'trn_number',
          'website',
          'selected_company_id'
        ];

        for (const key of Object.keys(updateBody)) {
          if (allowedKeys.includes(key)) {
            companyData[key] = updateBody[key];
          }
        }

        await companyData.save();
      }
    }
    /**
     * ====================================================================
     * * Update the status of lead process flow to verify client
     * ====================================================================
     */
    const leadDoc = await Leads.findOne({ company_id: enrollment.company_id });
    if (leadDoc && companyData.status !== 'active' && companyData.status == 'new') {
      if (leadDoc.status !== 'Verify Client') {
        console.log("status is not verify client---------------->")
        // find the index of the active stage
        const activeIndex = leadDoc.processes.findIndex(stage => stage.stage_name == leadDoc.status);
        const verifyClientIndex = leadDoc.processes.findIndex(stage => stage.stage_name == 'Verify Client');

        if (activeIndex !== -1 && verifyClientIndex !== -1) {
          // Loop through processes from active index to verify client index (inclusive)
          for (let i = activeIndex; i <= verifyClientIndex; i++) {
            const process = leadDoc.processes[i];

            if (i < verifyClientIndex) {
              // For processes before "Verify Client", mark as completed
              process.process_status = 'completed';

              // Mark all actions in this process as completed
              if (process.actions && process.actions.length > 0) {
                process.actions.forEach(action => {
                  action.status = 'completed';
                  action.updated_date_time = new Date().toISOString();
                });
              }

              // Set completed date if not already set
              if (!process.completed_date) {
                process.completed_date = new Date().toISOString();
              }
            } else if (i === verifyClientIndex) {
              // For "Verify Client" process, set to progress
              process.process_status = 'progress';

              // Set the first action to progress if actions exist
              if (process.actions && process.actions.length > 0) {
                process.actions[0].status = 'progress';
              }
            }
          }

          // Update the lead status to "Verify Client"
          leadDoc.status = 'Verify Client';

          // Mark the processes array as modified for Mongoose
          leadDoc.markModified('processes');
        }

        await leadDoc.save();
      }
    }
    // send email to notify super admin
    await notifySuperAdmins(enrollment._id);
    return enrollment;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error updating enrollment');
  }
};

const deleteEnrollmentById = async enrollmentId => {
  if (!ObjectId.isValid(enrollmentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid enrollment id');
  }
  try {
    const enrollment = await enrollmentsModel.findById(enrollmentId);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }
    await enrollment.remove();
    return enrollment;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error deleting enrollment');
  }
};

const verifyEnrollmentWorking = async (enrollmentId, reqBody) => {
  if (!ObjectId.isValid(enrollmentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid enrollment id');
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    const enrollment = await enrollmentsModel.findById(enrollmentId).session(session);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }

    enrollment.status = 'Completed';
    await enrollment.save({ session });

    let createdCompany = null;

    // Check if module is 'leads' - if so, skip company and chart of accounts creation
    if (!reqBody.module || reqBody.module.toLowerCase() !== 'leads') {
      console.log('enrollment$$$$$$$$$$');
      const generateUniqueCode = (prefix = 'PEO-', length = 6) => {
        return `${prefix}${crypto
          .randomBytes(Math.ceil(length / 2))
          .toString('hex')
          .slice(0, length)
          .toUpperCase()}`;
      };

      let companyBody = {
        company_name: enrollment.company_name,
        legal_name: enrollment.legal_name,
        phone: enrollment.phone,
        trn_number: enrollment.trn_number,
        registration_number: enrollment.registration_number,
        GRN_number: enrollment.GRN_number,
        contact_persons: enrollment.contact_persons,
        email: enrollment.email,
        billing_address: enrollment.billing_address,
        country: enrollment.country,
        business_industry: enrollment.business_industry,
        shipping_address: enrollment.shipping_address,
        website: enrollment.website,
        linkedin: enrollment.linkedin,
        company_email: enrollment.email,
        bank_details: enrollment.bank_details,
        company_address: enrollment.company_address || 'undefined',
        status: 'active',
        isEnrolledClient: true
      };

      let uniqueCode;
      let isUnique = false;

      while (!isUnique) {
        uniqueCode = generateUniqueCode();
        const existingCompany = await Companies.findOne({ unique_code: uniqueCode }).session(session);
        if (!existingCompany) {
          isUnique = true;
        }
      }

      console.log('Unique code generated:', uniqueCode);
      companyBody.unique_code = uniqueCode;

      // Create new company
      const newCompany = new Companies(companyBody);
      createdCompany = await newCompany.save({ session });

      if (!createdCompany) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating company');
      }

      // Create chart of account for company
      const companyChartOfAccount = await createChartOfAccountForCompany(createdCompany._id, session);
      if (!companyChartOfAccount) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating chart of account');
      }
      console.log('created chart of accounts', companyChartOfAccount, '^^^^^^^^^^^^^^^^^^^^^^^^ end of chart of account');
    }

    // For leads module, we need to find an existing company or handle POC creation differently
    if ((reqBody.module && reqBody.module.toLowerCase() === 'leads') || enrollment.isOnboardedLead) {
      console.log(
        'Processing leads module - skipping company and chart of accounts creation!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
      );
      const existingCompany = await Companies.findOne({ _id: enrollment.company_id }).session(session);
      if (existingCompany) {
        createdCompany = existingCompany;
        const generateUniqueCode = (prefix = 'PEO-', length = 6) => {
          return `${prefix}${crypto
            .randomBytes(Math.ceil(length / 2))
            .toString('hex')
            .slice(0, length)
            .toUpperCase()}`;
        };
        createdCompany.unique_code = generateUniqueCode();
        await createdCompany.save({ session });
      }
      console.log('Processing leads module - skipping company and chart of accounts creation');
    }

    const pocRole = await Role.findOne({ role_name: 'Admin' }).session(session);

    // Create POCs - this will work for both regular enrollments and leads
    if (createdCompany && createdCompany.contact_persons) {
      const pocPromises = createdCompany.contact_persons.map(async person => {
        return await Poc.create(
          [
            {
              company_id: createdCompany._id,
              designation: person.designation,
              name: person.name,
              email: person.email,
              department: person.designation,
              role_ID: pocRole._id,
              phone: person.phone
            }
          ],
          { session }
        );
      });

      await Promise.all(pocPromises || []);
    }

    // Handle documents creation - only if we have a created company
    if (createdCompany) {
      const getNameFromLink = link => {
        if (link == null) return '';
        return link.split('/').pop();
      };

      let documentsArray = ['certification', 'passport_copy', 'signed_kyc', 'vat_certificate'];
      let documentTypeArray = [
        '67b72778bd28e43350a405cc',
        '67b727a2bd28e43350a40627',
        '67b72795bd28e43350a4060e',
        '67b727b7bd28e43350a40657'
      ];

      const documentPromises = [];
      for (let i = 0; i < documentsArray.length; i++) {
        if (enrollment.documents && enrollment.documents[documentsArray[i]]) {
          let document = {
            type: ObjectId(documentTypeArray[i]),
            url: enrollment.documents[documentsArray[i]],
            identifier: 'companies',
            foreign_id: ObjectId(createdCompany._id),
            module: 'companies',
            document_number: '',
            expiry: '',
            doc_status: 'valid',
            name: getNameFromLink(enrollment.documents[documentsArray[i]]),
            is_deleted: false
          };
          documentPromises.push(Documents.create([document], { session }));
        }
      }

      await Promise.all(documentPromises);
    }

    // Send confirmation email after all database operations
    await sendConfirmationEmail(enrollmentId);

    // Commit the transaction
    await session.commitTransaction();

    return createdCompany;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error verifying enrollment: ' + error.message);
  } finally {
    // End session
    session.endSession();
  }
};
const verifyEnrollment = async (enrollmentId, reqBody) => {
  if (!ObjectId.isValid(enrollmentId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid enrollment id');
  }

  // Start a session for the transaction
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    const enrollment = await enrollmentsModel.findById(enrollmentId).session(session);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }

    enrollment.status = 'Completed';
    await enrollment.save({ session });

    let createdCompany = null;

    // Helper function to generate unique code
    const generateUniqueCode = async (prefix = 'PEO-', length = 6) => {
      let uniqueCode;
      let isUnique = false;

      while (!isUnique) {
        uniqueCode = `${prefix}${crypto
          .randomBytes(Math.ceil(length / 2))
          .toString('hex')
          .slice(0, length)
          .toUpperCase()}`;
        const existingCompany = await Companies.findOne({ unique_code: uniqueCode }).session(session);
        if (!existingCompany) {
          isUnique = true;
        }
      }
      return uniqueCode;
    };
    // console.log(enrollment.isOnboardedLead, "#######################################")
    // Check if this is a leads module or onboarded lead
    const isLeadsModule = (reqBody.module && reqBody.module.toLowerCase() === 'leads') || enrollment.isOnboardedLead;

    if (isLeadsModule) {
      // console.log("Processing leads module - skipping company and chart of accounts creation!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      // For leads module, find existing company
      const existingCompany = await Companies.findOne({ _id: enrollment.company_id }).session(session);
      if (existingCompany) {
        createdCompany = existingCompany;

        // Generate and assign unique code if it doesn't exist
        if (!createdCompany.unique_code) {
          createdCompany.unique_code = await generateUniqueCode();
        }

        // Merge enrollment contact persons with existing company contact persons
        const uniquePointsOfContacts = new Map();

        // First, add existing company contact persons to the map using email as key
        if (createdCompany.contact_persons && createdCompany.contact_persons.length > 0) {
          for (let i = 0; i < createdCompany.contact_persons.length; i++) {
            const person = createdCompany.contact_persons[i];
            if (person.email) {
              uniquePointsOfContacts.set(person.email, person);
            }
          }
        }

        // Then, add or update with enrollment contact persons
        if (enrollment.contact_persons && enrollment.contact_persons.length > 0) {
          for (let i = 0; i < enrollment.contact_persons.length; i++) {
            const person = enrollment.contact_persons[i];
            if (person.email) {
              uniquePointsOfContacts.set(person.email, person);
            }
          }
        }

        // Update company contact_persons with the merged list
        createdCompany.contact_persons = Array.from(uniquePointsOfContacts.values());
        createdCompany.markModified('contact_persons');
        await createdCompany.save({ session });
      }
      console.log('Processing leads module - found existing company:', createdCompany?._id);
    } else {
      // For non-leads modules, create new company and chart of accounts
      console.log('enrollment$$$$$$$$$$');

      let companyBody = {
        company_name: enrollment.company_name,
        legal_name: enrollment.legal_name,
        phone: enrollment.phone,
        trn_number: enrollment.trn_number,
        registration_number: enrollment.registration_number,
        GRN_number: enrollment.GRN_number,
        contact_persons: enrollment.contact_persons,
        email: enrollment.email,
        billing_address: enrollment.billing_address,
        country: enrollment.country,
        business_industry: enrollment.business_industry,
        shipping_address: enrollment.shipping_address,
        website: enrollment.website,
        linkedin: enrollment.linkedin,
        company_email: enrollment.email,
        bank_details: enrollment.bank_details,
        company_address: enrollment.company_address || 'undefined',
        status: 'active',
        isEnrolledClient: true
      };

      // Generate unique code for new company
      const uniqueCode = await generateUniqueCode();
      console.log('Unique code generated:', uniqueCode);
      companyBody.unique_code = uniqueCode;

      // Create new company
      const newCompany = new Companies(companyBody);
      createdCompany = await newCompany.save({ session });

      if (!createdCompany) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating company');
      }

      // Create chart of account for company
      const companyChartOfAccount = await createChartOfAccountForCompany(createdCompany._id, session);
      if (!companyChartOfAccount) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating chart of account');
      }
      console.log('created chart of accounts', companyChartOfAccount, '^^^^^^^^^^^^^^^^^^^^^^^^ end of chart of account');
    }

    // Create POCs - this will work for both regular enrollments and leads
    if (createdCompany && createdCompany.contact_persons) {
      const pocRole = await Role.findOne({ role_name: 'Admin' }).session(session);

      const pocPromises = createdCompany.contact_persons.map(async person => {
        return await Poc.create(
          [
            {
              company_id: createdCompany._id,
              designation: person.designation,
              name: person.name,
              email: person.email,
              department: person.designation,
              role_ID: pocRole._id
            }
          ],
          { session }
        );
      });

      await Promise.all(pocPromises || []);
    }

    // Handle documents creation - only if we have a created company
    if (createdCompany) {
      const getNameFromLink = link => {
        if (link == null) return '';
        return link.split('/').pop();
      };

      let documentsArray = ['certification', 'passport_copy', 'signed_kyc', 'vat_certificate'];
      let documentTypeArray = [
        '67b72778bd28e43350a405cc',
        '67b727a2bd28e43350a40627',
        '67b72795bd28e43350a4060e',
        '67b727b7bd28e43350a40657'
      ];

      const documentPromises = [];
      for (let i = 0; i < documentsArray.length; i++) {
        if (enrollment.documents && enrollment.documents[documentsArray[i]]) {
          let document = {
            type: ObjectId(documentTypeArray[i]),
            url: enrollment.documents[documentsArray[i]],
            identifier: 'companies',
            foreign_id: ObjectId(createdCompany._id),
            module: 'companies',
            document_number: '',
            expiry: '',
            doc_status: 'valid',
            name: getNameFromLink(enrollment.documents[documentsArray[i]]),
            is_deleted: false
          };
          documentPromises.push(Documents.create([document], { session }));
        }
      }

      await Promise.all(documentPromises);
    }

    // Send confirmation email after all database operations
    await sendConfirmationEmail(enrollmentId);

    // Commit the transaction
    await session.commitTransaction();

    return createdCompany;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error verifying enrollment: ' + error.message);
  } finally {
    // End session
    session.endSession();
  }
};

const sendInitialEmail = async id => {
  try {
    const enrollment = await enrollmentsModel.findById(id);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }
    const email = enrollment.email;
    const config = await Configurations.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });
    const link =
      config.mailTrap.trap == true
        ? `https://peo-central-preprod.nathanhr.com/enrollment-form?id=${id}`
        : `https://eor-central.nathanhr.com/enrollment-form?id=${id}`;

    console.log(`Sending email to ${email} with link ${link}`);

    const msg = {
      Source: 'donotreply@nathanhr.ae',
      Destination: {
        ToAddresses: config.mailTrap.trap == true ? config.mailTrap.toEmails : [email]
      },
      Message: {
        Body: {
          Html: {
            Data: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Complete Your Company Information</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Content Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">

          <!-- Header Section -->
          <tr>
            <td style="background-color: #004A99; padding: 30px 20px; text-align: center;">
              <!-- Logo Container with Fallback -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <!-- Logo Image with Fallback Text -->
                    <img src="https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1738235562677_logo.svg/logo.svg"
                         alt="NathanHR PEO Central"
                         width="120"
                         height="40"
                         style="display: block; border: 0; max-width: 120px; height: auto;">
                    <!-- Fallback Text Logo -->
                    <span style="display: none; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">NATHANHR</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; line-height: 1.2;">Complete Your Company Information</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333333; line-height: 1.3;">Welcome to NathanHR PEO Central</h2>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6; max-width: 500px;">
                      To proceed with your setup, we need some details about your company.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      Please fill out the form using the link below so we can verify your company information.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 40px;">
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #004A99;">
                          <a href="${link}"
                             style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #004A99; border: 2px solid #004A99;">
                            Fill the Form
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      If you have any questions, feel free to reach out to our support team.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 25px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.5;">
                      Need assistance?
                      <a href="mailto:peosupport@nathanhr.com" style="color: #004A99; text-decoration: underline;">Contact Support</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.5;">
                      &copy; 2024 NathanHR PEO Central. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `Complete Your Company Information

Welcome to NathanHR PEO Central

To proceed with your setup, we need some details about your company.

Please fill out the form using the link below so we can verify your company information:
${link}

If you have any questions, feel free to reach out to our support team.

Need assistance? Contact Support at peosupport@nathanhr.com
© 2024 NathanHR PEO Central. All rights reserved.`,
            Charset: 'UTF-8'
          }
        },
        Subject: {
          Data: "Let's Get Started! Fill in Your Company Details",
          Charset: 'UTF-8'
        }
      }
    };

    await ses.sendEmail(msg, async (err, data) => {
      if (err) {
        console.log(err);
        throw new ApiError(err);
      } else {
        await new EmailLog({
          from: 'donotreply@nathanhr.ae',
          to: email,
          subject: msg.Message.Subject.Data,
          body: msg.Message.Body.Html.Data
        }).save();
      }
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error sending email');
  }
};

const sendConfirmationEmail = async id => {
  try {
    const enrollment = await enrollmentsModel.findById(id);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }
    let emails;
    const systemConfig = await Configurations.findOne();
    if (systemConfig.mailTrap.trap == true) {
      console.log('trap is true sending to eemails');
      emails = systemConfig.mailTrap.toEmails;
    } else {
      emails = enrollment.contact_persons.map(person => person.email);
    }
    const link = `https://eor-central.nathanhr.com/enrollment-form?id=${id}`;
    emails.forEach(async email => {
      const msg = {
        Source: 'donotreply@nathanhr.ae',
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Body: {
            Html: {
              Data: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Account is Ready – Login to NathanHR PEO Central</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Content Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header Section -->
          <tr>
            <td style="background-color: #004A99; padding: 30px 20px; text-align: center;">
              <!-- Logo Container with Fallback -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <!-- Logo Image with Fallback Text -->
                    <img src="https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1738235562677_logo.svg/logo.svg"
                         alt="NathanHR PEO Central"
                         width="120"
                         height="40"
                         style="display: block; border: 0; max-width: 120px; height: auto;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <!-- Fallback Text Logo -->
                    <span style="display: none; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">NATHANHR</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; line-height: 1.2;">Your Account is Ready!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333333; line-height: 1.3;">Welcome to NathanHR PEO Central</h2>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6; max-width: 500px;">
                      We're happy to inform you that your company verification process is complete. You can now log in with your email to start using NathanHR PEO Central.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      Click the button below to access your account:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 40px;">
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #004A99;">
                          <a href="https://peo-central-client.nathanhr.ae"
                             style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #004A99; border: 2px solid #004A99;">
                            Login Now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Instructions Section -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 6px;">
                      <tr>
                        <td style="padding: 25px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333333;">How to Log In:</h3>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td valign="top" style="padding-right: 12px; font-size: 16px; color: #004A99; font-weight: bold;">1.</td>
                                    <td style="font-size: 14px; color: #555555; line-height: 1.5;">
                                      Click on the "Login Now" button above or visit
                                      <a href="https://peo-central-client.nathanhr.ae" style="color: #004A99; text-decoration: underline;">https://peo-central-client.nathanhr.ae</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td valign="top" style="padding-right: 12px; font-size: 16px; color: #004A99; font-weight: bold;">2.</td>
                                    <td style="font-size: 14px; color: #555555; line-height: 1.5;">
                                      Enter your registered email address
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td valign="top" style="padding-right: 12px; font-size: 16px; color: #004A99; font-weight: bold;">3.</td>
                                    <td style="font-size: 14px; color: #555555; line-height: 1.5;">
                                      You will receive a One-Time Password (OTP) in your email
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td valign="top" style="padding-right: 12px; font-size: 16px; color: #004A99; font-weight: bold;">4.</td>
                                    <td style="font-size: 14px; color: #555555; line-height: 1.5;">
                                      Enter the OTP to complete your login
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td valign="top" style="padding-right: 12px; font-size: 16px; color: #004A99; font-weight: bold;">5.</td>
                                    <td style="font-size: 14px; color: #555555; line-height: 1.5;">
                                      Once logged in, you can explore and manage your company profile
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      If you have any questions, feel free to reach out to our support team.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 25px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.5;">
                      Need assistance?
                      <a href="mailto:support@nathanhr.com" style="color: #004A99; text-decoration: underline;">Contact Support</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.5;">
                      &copy; 2024 NathanHR PEO Central. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
              Charset: 'UTF-8'
            },
            Text: {
              Data: `Your Account is Ready!

Welcome to NathanHR PEO Central

We're happy to inform you that your company verification process is complete. You can now log in with your email to start using NathanHR PEO Central.

Click the link below to access your account:
https://peo-central-client.nathanhr.ae

How to Log In:
1. Click on the link above or visit https://peo-central-client.nathanhr.ae
2. Enter your registered email address
3. You will receive a One-Time Password (OTP) in your email
4. Enter the OTP to complete your login
5. Once logged in, you can explore and manage your company profile

If you have any questions, feel free to reach out to our support team at support@nathanhr.com

Need assistance? Contact Support
© 2024 NathanHR PEO Central. All rights reserved.`,
              Charset: 'UTF-8'
            }
          },
          Subject: {
            Data: 'Welcome to NathanHR! Your Access is Now Active',
            Charset: 'UTF-8'
          }
        }
      };
      await ses.sendEmail(msg, async (err, data) => {
        if (err) {
          console.log(err);
          throw new ApiError(err);
        } else {
          await new EmailLog({
            from: 'donotreply@nathanhr.ae',
            to: email,
            subject: msg.Message.Subject.Data,
            body: msg.Message.Body.Html.Data
          }).save();
        }
      });
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error sending email');
  }
};

const notifySuperAdmins = async id => {
  try {
    const enrollment = await enrollmentsModel.findById(id);
    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }

    const config = await Configurations.findOne({}).select({ mailTrap: 1 });
    const emails = config.mailTrap.trap === true ? config.mailTrap.toEmails : ['sahiba@nathanhr.com'];
    const url =
      config.mailTrap.trap === true
        ? 'https://peo-central-preprod.nathanhr.com/enrollments'
        : 'https://eor-central.nathanhr.com/enrollments';

    emails.forEach(async email => {
      const msg = {
        Source: 'donotreply@nathanhr.ae',
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Body: {
            Html: {
              Data: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Enrollment Completed - NathanHR PEO Central</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Content Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">

          <!-- Header Section -->
          <tr>
            <td style="background-color: #004A99; padding: 30px 20px; text-align: center;">
              <!-- Logo Container with Fallback -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <!-- Logo Image with Fallback Text -->
                    <img src="https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1738235562677_logo.svg/logo.svg"
                         alt="NathanHR PEO Central"
                         width="120"
                         height="40"
                         style="display: block; border: 0; max-width: 120px; height: auto;">
                    <!-- Fallback Text Logo -->
                    <span style="display: none; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">NATHANHR</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; line-height: 1.2;">New Enrollment Completed!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #333333; line-height: 1.3;">A new enrollment has been submitted</h2>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      Hello,
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      A new enrollment has been completed on the PEO Central Portal with the following details:
                    </p>
                  </td>
                </tr>

                <!-- Enrollment Details -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 6px;">
                      <tr>
                        <td style="padding: 25px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333333;">Enrollment Details:</h3>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding-bottom: 12px;">
                                <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.5;">
                                  <strong>Company Name:</strong> ${enrollment.company_name}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.5;">
                                  <strong>Email:</strong> ${enrollment.email}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      Please review the enrollment details at your earliest convenience:
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-bottom: 40px;">
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #004A99;">
                          <a href="${url}"
                             style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: #004A99; border: 2px solid #004A99;">
                            View Enrollment
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">
                      For any questions or required actions, please contact our support team.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 25px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.5;">
                      Need assistance?
                      <a href="mailto:support@nathanhr.com" style="color: #004A99; text-decoration: underline;">Contact Support</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.5;">
                      &copy; 2024 NathanHR PEO Central. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
              Charset: 'UTF-8'
            },
            Text: {
              Data: `New Enrollment Completed - NathanHR PEO Central

A new enrollment has been submitted

Hello,

A new enrollment has been completed on the PEO Central Portal with the following details:

Enrollment Details:
Company Name: ${enrollment.company_name}
Email: ${enrollment.email}

Please review the enrollment details at your earliest convenience:
${url}

For any questions or required actions, please contact our support team.

Need assistance? Contact Support at support@nathanhr.com
© 2024 NathanHR PEO Central. All rights reserved.`,
              Charset: 'UTF-8'
            }
          },
          Subject: {
            Data: 'New Enrollment Created',
            Charset: 'UTF-8'
          }
        }
      };

      await ses.sendEmail(msg, async (err, data) => {
        if (err) {
          console.log(err);
          throw new ApiError(err);
        } else {
          await new EmailLog({
            from: 'donotreply@nathanhr.ae',
            to: email,
            subject: msg.Message.Subject.Data,
            body: msg.Message.Body.Html.Data
          }).save();
        }
      });
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error sending email notification to super admins');
  }
};

const simpleDocumentUpload = async (userId, file) => {
  try {
    if (file && file.documents && file.documents.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to Upload Multiple Files');
    } else {
      let uploadedFile = await uploadFilesToS3(file.documents, userId);
      return uploadedFile;
    }
  } catch (error) {
    console.log('#AWS S3 Error: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not upload file');
  }
};
module.exports = {
  createEnrollment,
  listAllEnrollments,
  getEnrollmentById,
  updateEnrollmentById,
  deleteEnrollmentById,
  sendInitialEmail,
  verifyEnrollment,
  sendConfirmationEmail,
  simpleDocumentUpload,
  getEntrollmentByCompanyEmail,
  getEnrollmentByCompanyId
};
