const { ObjectId } = require('mongodb');
const { emailTemplate } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const _ = require('lodash');
const {
  Users,
  Role,
  Companies,
  emails,
  Leads,
  VisaProcess,
  Offboardings,
  Onboardings,
  Invoice,
  Token,
  enrollmentsModel, Renewals
} = require('../models');
const { Configurations, Documents } = require('../models');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
// const tokenService = require('./token.service');
// const { generateOnboardingToken } = require('./token.service');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');

const getEmailTemplateByName = async reqQuery => {
  try {
    if (!reqQuery.templateName) return null;

    // Escape special regex characters in templateName
    const escapedName = reqQuery.templateName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const search = { name: new RegExp(escapedName, 'i') };

    const emailTemplt = await emailTemplate.findOne(search);
    return emailTemplt;
  } catch (error) {
    throw new Error(error);
  }
};

const getEmailTemplate = async companyBody => {
  const emailTemplate = await emailTemplate.findOne({ _id: companyBody._id });

  let content = emailTemplate.content;
  if (emailTemplate) {
    let autoReplacedContent = await getReplacedTemplate(emailTemplate, content);

    emailTemplate.user_input_keys.forEach(async ele => {
      autoReplacedContent = autoReplacedContent.split(ele.key).join(ele.value);
    });

    return autoReplacedContent;
  } else {
    return [];
  }
};

// async function getReplacedTemplate(emailTemplate, content) {
//     let replaceKeys = emailTemplate.auto_replace_keys

//     for (let index = 0; index < replaceKeys.length; index++) {
//         const element = replaceKeys[index];
//         let project = {}
//         let DBModel
//         project[element.field] = 1

//         if (element.collection == 'users') {
//             DBModel = Users
//         } else if (element.collection == 'companies') {
//             DBModel = Companies
//         } else if (element.collection == 'leads') {
//             DBModel = Leads
//         }

//         let getDoc = await DBModel.findOne({ _id: element.fk_id }).select(project)

//         if (getDoc) {
//             content = content.split(element.key).join(getDoc ? getDoc[element.field] : element.key);

//         }

//         if (replaceKeys.length == index + 1) {
//             return content
//         }
//     }

//     // let sadf = false
//     // let grouped = _.mapValues(_.groupBy(emailTemplate.auto_replace_keys, 'collection'),
//     //     templates => templates.map(car => _.omit(car)));

//     // for (const key in grouped) {

//     //     if (Object.hasOwnProperty.call(grouped, key)) {
//     //         const element = grouped[key];

//     //         let project = {}

//     //         let DBModel

//     //         element.forEach(async (ele, index) => {
//     //             project[ele.field] = 1

//     //             if (ele.collection == 'users') {
//     //                 DBModel = Users
//     //             } else if (ele.collection == 'companies') {
//     //                 DBModel = Companies
//     //             } else if (ele.collection == 'leads') {
//     //                 DBModel = Leads
//     //             }

//     //             let getDoc = await DBModel.findOne({ _id: ele.fk_id }).select(project)
//     //             if (getDoc) {
//     //                 content = content.split(ele.key).join(getDoc ? getDoc[ele.field] : 'hadhi');
//     //                 sadf = true
//     //             }
//     //         })

//     //     }
//     // }
//     // if (sadf) return content
//     // console.log(sadf, "--", content)
// }

const addNewEmailTemplate = async (body, userId) => {
  if (userId) {
    body.created_by = userId;
  }
  const newTemplate = new emailTemplate(body);
  return await newTemplate.save();
};

const listAllEmailTemplates = async reqQuery => {
  const visibilityFilter = reqQuery.visibility ? new RegExp(reqQuery.visibility, 'i') : 'public';
  const result = await emailTemplate
    .find({ is_deleted: false, visibility: visibilityFilter })
    .select({ _id: 1, name: 1, module: 1, flag: 1 });
  if (result == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Email Templates');
  }
  return result;
};

const updateUpdatedBy = async (emailTempltId, userId) => {
  return emailTemplate.findOneAndUpdate({ _id: emailTempltId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (emailTempltId, userId) => {
  return emailTemplate.findOneAndUpdate({ _id: emailTempltId }, { $set: { created_by: userId } });
};

const getEmailTemplatesOnIDWorking = async (emailTempltId, invoice_number) => {
  console.log(invoice_number, 'the invoice number');
  let result = await emailTemplate.findById({ _id: ObjectId(emailTempltId) });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Email Template for the given ID');
  }
  /**
   * note that strings in jsvascript are immutable
   * As such, .replace does not modify the original string
   * it returns a new string. use this or the commented version
   */
  let invoice;
  if (invoice_number && invoice_number !== '') {
    invoice = await Invoice.findOne({ is_deleted: 0, invoice_number: invoice_number });
    if (!invoice) throw new Error('Invalid invoice number: ${invoice_number}');
    result.content = result.content.replace('[invoice_number]', invoice_number);
    result.content = result.content.replace('[amount_due]', invoice.total);
    result.subject = result.subject.replace('[invoice_number]', invoice_number);
    result.subject = result.subject.replace('[due_date]', moment(invoice?.due_date).format('Do MMMM YYYY'));
    result.content = result.content.replace('[due_date]', moment(invoice?.due_date).format('Do MMMM YYYY'));
  }

  return result;
};
const getEmailTemplatesOnID = async (emailTempltId, invoice_number) => {
  console.log(invoice_number, 'the invoice number');

  const result = await emailTemplate.findById({ _id: ObjectId(emailTempltId) });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Email Template for the given ID');
  }

  // If invoice_number is not provided or empty, just return the result
  if (!invoice_number || (Array.isArray(invoice_number) && invoice_number.length === 0)) {
    return result;
  }

  // Normalize to array
  // map currencies
  const currencyMap = {};


  const invoiceNumbers = Array.isArray(invoice_number) ? invoice_number : [invoice_number];

  const invoices = await Invoice.find({
    is_deleted: 0,
    invoice_number: { $in: invoiceNumbers },
  });

  console.log("the invoices found", invoices.length);

  if (invoices.length !== invoiceNumbers.length) {
    const foundNumbers = invoices.map(inv => inv.invoice_number);
    const notFound = invoiceNumbers.filter(num => !foundNumbers.includes(num));
    throw new Error(`Invalid invoice numbers: ${notFound.join(', ')}`);
  }

  // Optionally: combine or format data
  // const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

  // Map currencies
  invoices.forEach(inv => {
    const currency = inv.currency || 'AED';
    currencyMap[currency] = currencyMap[currency] ? currencyMap[currency] + 1 : 1;
  });

  let selected_currency = "AED"

  if (Object.keys(currencyMap).length > 1) {
    throw new Error('Invoices have multiple currencies. Please ensure all invoices are in the same currency.');
  } else {
    selected_currency = Object.keys(currencyMap)[0];
  }


// Ensure exactly two decimal places (as a number)
  const totalAmountFixed = totalAmount.toFixed(2);

  const dueDates = invoices.map(inv => moment(inv.due_date).format('Do MMMM YYYY'));
  const dueDateStr = dueDates.join(', ');

  const paymentDates = invoices.map(inv => moment(inv?.payment_date).format('Do MMMM YYYY') || '');
  console.log(paymentDates)
  const paymentDateStr = paymentDates.join(', ');

  const invoiceNumberStr = invoiceNumbers.join(', ');


  // Replace placeholders in content
  result.content = result.content
    .replace('[invoice_number]', invoiceNumberStr)
    .replace('[amount_due]', `${selected_currency} ${totalAmountFixed}`)
    .replace('[due_date]', dueDateStr)
    .replace('[payment_date]', paymentDateStr);

  // Replace placeholders in subject
  result.subject = result.subject
    .replace('[invoice_number]', invoiceNumberStr)
    .replace('[due_date]', dueDateStr);

  return result;
};



const updateEmailTemplateOnId = async (emailTempltId, updateBody) => {
  const result = await getEmailTemplatesOnID(emailTempltId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email Template Not found');
  }
  return emailTemplate.findOneAndUpdate({ _id: emailTempltId }, { $set: updateBody }, { new: true });
};

const deleteEmailTemplateOnId = async emailTempltId => {
  let result = await emailTemplate.findByIdAndUpdate({ _id: ObjectId(emailTempltId) }, { is_deleted: true });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Email Template');
  }
  return result;
};

const getEmailTemplateOnIDWithoutContent = async (
  EmailTempltCloneID,
  moduleID,
  reqBody,
  onboardingLink,
  generatedDocumentId,
  userModule = false
) => {
  try {
    // let replacedCc = [];
    let pipeline = [
      {
        $match: {
          _id: ObjectId(EmailTempltCloneID),
          is_deleted: false
        }
      },
      {
        $project: {
          is_deleted: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0
        }
      }
    ];

    var result = await emailTemplate.aggregate(pipeline);
    let originalResult = result[0].module;
    if (result[0].module == 'visaprocess') {
      // get the corresponding visa process doc
      const visaProcessDoc = await VisaProcess.findById(moduleID);
      if (!visaProcessDoc) console.log('could not find visa process by provided id');
      const isUserDoc = await Users.findById(visaProcessDoc.user_id);

      // get email template for Abu Dhabi based on visa sponsor
      if (
        isUserDoc.employment.visa_sponsor_type == 'Executive Employment Services' &&
        result[0].name == 'Medical Test Application (Dubai)'
      ) {
        result = await emailTemplate.find({ module: 'visaprocess', name: 'Medical Test Application (Abu Dhabi)' });
      } else if (
        isUserDoc.employment.visa_sponsor_type == 'Dynamic Employment Services' &&
        result[0].name == 'Medical Test Application (Dubai)'
      ) {
        result = await emailTemplate.find({ module: 'visaprocess', name: 'Medical Test Application (Dubai)' });
      }
    }

    let emailTempt = result[0];
    if (emailTempt.to || emailTempt.cc) {
      const confResult = await Configurations.findOne({}).select({ module_relations: 1 });
      const relations = confResult.module_relations;
      let form = {
        fields: []
      };
      form['foreign_id'] = moduleID;
      let replaceKeys = emailTempt.auto_replace_keys;
      for (let i = 0; i < replaceKeys.length; i++) {
        const element = replaceKeys[i];
        if (element.collection == emailTempt.module) {
          form.fields.push({
            connection_type: 'default',
            module: emailTempt.module,
            foreign_id: '',
            primiary_connection: '',
            value: '',
            field: element.field
          });
        } else {
          form.fields.push({
            connection_type: 'primary',
            module: element.collection,
            foreign_id: relations.filter(a => {
              return a.module == emailTempt.module && a.foreign_module == element.collection;
            })[0].foreign_key,
            primiary_connection: '',
            value: '',
            field: element.field
          });
        }
      }
      const regexExp =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
      var emailarray = emailTempt.to.concat(emailTempt.cc);
      for (let index = 0; index < emailarray.length; index++) {
        const element = emailarray[index];
        if (element && element != '' && !regexExp.test(element)) {
          let foreignElementId = relations.filter(a => {
            return a.module == emailTempt.module && a.foreign_module == element;
          });
          if (foreignElementId && foreignElementId[0] && foreignElementId[0].foreign_key) {
            form.fields.push({
              connection_type: 'primary',
              module: element,
              foreign_id: relations.filter(a => {
                return a.module == emailTempt.module && a.foreign_module == element;
              })[0].foreign_key,
              primiary_connection: '',
              value: '',
              field: 'email'
            });
          }
        }
      }
      ticketingDateFormatter = function (value) {
        if (value) {
          return moment(String(value)).format('MMM DD, YYYY');
        }
      };
      const model = require(`../models/${emailTempt.module}.model`);
      let query = await generateGetQuery(form, emailTempt.module);
      
      let data = await model.aggregate(query);

      let result = data[0];
      var resultDoc = data[0];
      
      let returnObj = {
        to: [],
        cc: [],
        content: [],
        subject: [],
        name: emailTempt.name,
        add_attachments: emailTempt.add_attachments
        //   auto_replace_keys: emailTempt.auto_replace_keys
      };
      for (let index = 0; index < emailTempt.to.length; index++) {
        const element = emailTempt.to[index];
        if (element && element != '' && !regexExp.test(element) && result && result[element] && result[element].email) {
          returnObj.to.push(result[element].email);
        } else {
          returnObj.to.push(element);
        }
      }
      for (let index = 0; index < emailTempt.cc.length; index++) {
        const element = emailTempt.cc[index];
        if (element && element != '' && !regexExp.test(element) && result && result[element] && result[element].email) {
          returnObj.cc.push(result[element].email);
        } else {
          returnObj.cc.push(element);
        }
      }
      returnObj.content = emailTempt.content.toString();
      returnObj.subject = emailTempt.subject.toString();
      if (returnObj.content.includes('[application_link]')) {
        returnObj.content = returnObj.content.replace(
          '[application_link]',
          `<a href="${config.clientUrl}">PEO Central Portal</a>`
        );
      }

      function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      }

      function replaceAll(str, find, replace) {
        // Standard replacement for exact matches
        let result = str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        
        // Special handling for salary fields - check for any string that starts with the find string
        // This handles cases where the template has "employee_basic_XXXXX" instead of just "employee_basic_salary"
        if (find === 'employee_basic_salary') {
          // Replace any text starting with 'employee_basic_' and followed by digits
          result = result.replace(new RegExp('employee_basic_\\d+', 'g'), replace);
        }
        
        return result;
      }
      let iterate = function (obj, stack, returnObj) {
        for (const [property, value] of Object.entries(obj)) {
          // Ensure that the property exists and is not null or undefined
          if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] === 'object' && obj[property] !== null) {
              // If it's an object and not null, continue iterating
              if (stack !== '') {
                iterate(obj[property], stack + '.' + property, returnObj);
              } else {
                iterate(obj[property], property, returnObj);
              }
            } else {
              // For non-object properties, add them to the returnObj
              if (stack !== '') {
                returnObj[stack + '.' + property] = value;
              } else {
                returnObj[property] = value;
              }
            }
          }
        }
        return returnObj;
      };
      // Debug log for employee data structure
      if (resultDoc && resultDoc.employees) {
        console.log('EMPLOYEE STRUCTURE:', JSON.stringify(resultDoc.employees.salary));
      }
      
      for (let i = 0; i < replaceKeys.length; i++) {
        const element = replaceKeys[i];
        let replacementValue;
        
        // console.log('PROCESSING KEY:', element.key, 'COLLECTION:', element.collection, 'FIELD:', element.field);
        
        // Special case for employee_basic_salary
        if (element.key === 'employee_basic_salary') {
          // Try multiple paths to find the salary value
          if (resultDoc[element.collection] && resultDoc[element.collection].salary && resultDoc[element.collection].salary.basic_salary) {
            replacementValue = resultDoc[element.collection].salary.basic_salary;
          } else if (resultDoc[element.collection] && resultDoc[element.collection].employment && resultDoc[element.collection].employment.salary) {
            replacementValue = resultDoc[element.collection].employment.salary.basic_salary;
          } else if (resultDoc.employees && resultDoc.employees.salary) {
            replacementValue = resultDoc.employees.salary.basic_salary;
          } else {
            // Fallback to the default method if no specific path works
            const flattenedObj = iterate(resultDoc[element.collection], '', {});
            // Look for any property that might contain basic_salary
            for (const key in flattenedObj) {
              if (key.includes('basic_salary')) {
                replacementValue = flattenedObj[key];
                break;
              }
            }
            if (!replacementValue) {
              replacementValue = flattenedObj[element.field] || "Not Found";
            }
          }
          
          // Format the salary value if it's a number (remove any commas and ensure it's a number)
          if (replacementValue && !isNaN(replacementValue)) {
            // Format as a number without commas
            replacementValue = Number(replacementValue).toString();
          }
          
          // console.log('FOUND employee_basic_salary:', replacementValue);
        } else {
          replacementValue = iterate(resultDoc[element.collection], '', {})[element.field];
        }
        
        console.log('REPLACEMENT:', element.key, '=>', replacementValue);
        
        returnObj.content = replaceAll(
          returnObj.content,
          element.key,
          replacementValue
        );
        returnObj.subject = replaceAll(
          returnObj.subject,
          element.key,
          replacementValue
        );
      }
      let user_id = await model.findOne({ _id: ObjectId(moduleID) }).select({ user_id: 1, created_by: 1 });
      eVisa = await Documents.findOne({
        type: ObjectId('64db904b987bf13670b42980'),
        module: 'visa process',
        foreign_id: ObjectId(user_id.user_id),
        expiry: { $exists: true },
        expiry: { $ne: '' }
      }).select({ expiry: 1 });
      if (eVisa) {
        returnObj.content = returnObj.content.replace('evisExpiry', ticketingDateFormatter(new Date(eVisa.expiry)));
      } else {
        returnObj.content = returnObj.content.replace('evisExpiry', '');
      }

      // for Passport Number
      // console.log(user_id , "user_id")
      const passport = await Documents.findOne({
        type: ObjectId('64254208e92b0c35c0541ce8'),
        module: 'users',
        foreign_id: ObjectId(user_id.user_id),
        expiry: { $exists: true },
        expiry: { $ne: '' }
      });
      // console.log(passport , "Passport")
      if (passport) {
        returnObj.content = returnObj.content.replace('[passport_number]', passport.document_number);
        returnObj.content = returnObj.content.replace(
          '[passport_expiry]',
          ticketingDateFormatter(new Date(passport.expiry))
        );
      } else {
        returnObj.content = returnObj.content.replace('[passport_number]', '');
        returnObj.content = returnObj.content.replace('[passport_expiry]', '');
      }

      // For labour card
      const labourCardDoc = await Documents.findOne({
        type: ObjectId('650dba596a348a1a1022945f'),
        module: 'users',
        foreign_id: ObjectId(user_id.user_id),
        expiry: { $exists: true },
        expiry: { $ne: '' }
      });
      if (labourCardDoc) {
        returnObj.content = returnObj.content.replace('[labour_card_number]', labourCardDoc.document_number);
        returnObj.content = returnObj.content.replace(
          '[labour_card_expiry]',
          ticketingDateFormatter(new Date(labourCardDoc.expiry))
        );
      } else {
        returnObj.content = returnObj.content.replace('[labour_card_number]', '');
        returnObj.content = returnObj.content.replace('[labour_card_expiry]', '');
      }

      // for medical Test application
      const medicalTestApplication = await Documents.findOne({
        type: ObjectId('64db904c987bf13670b42988'),
        module: 'users',
        foreign_id: ObjectId(user_id.user_id),
        expiry: { $exists: true },
        expiry: { $ne: '' }
      });
      if (medicalTestApplication) {
        console.log(medicalTestApplication.document_number, 'this is the document number for med application');
        returnObj.content = returnObj.content.replace('[medicalApplication_number]', medicalTestApplication.document_number);
        returnObj.content = returnObj.content.replace(
          '[medical_test_application_expiry]',
          ticketingDateFormatter(new Date(medicalTestApplication.expiry))
        );
      } else {
        returnObj.content = returnObj.content.replace('[medical_test_application_number]', '');
        returnObj.content = returnObj.content.replace('[medical_test_application_expiry]', '');
      }

      // for Support Agent
      const supportAgent = await Users.findOne({ _id: user_id.created_by }).select({ first_name: 1, last_name: 1 });
      if (supportAgent) {
        returnObj.content = returnObj.content.replace(
          '[support_agent]',
          supportAgent.first_name + ' ' + supportAgent.last_name
        );
      } else {
        returnObj.content = returnObj.content.replace('[support_agent]', '');
      }
      // handle unique case for subject
      let userData;
     

      const modelName = model.modelName || model.collection.name;
      console.log(modelName, "->this is the model name before switch&&");

      switch (modelName.toLowerCase()) {
        case 'users': {
          userData = await Users.findOne({ _id: ObjectId(moduleID) }).select({ first_name: 1, last_name: 1 });
          break;
        }
        case 'visa_processes': {
          const visaDoc = await VisaProcess.findOne({ _id: ObjectId(moduleID) }).select({ user_id: 1 });
          userData = await Users.findOne({ _id: visaDoc.user_id }).select({ first_name: 1, last_name: 1 });
          break;
        }
        case 'onboardings': {
          const onboardingDoc = await Onboardings.findOne({ _id: ObjectId(moduleID) }).select({ user_id: 1 });

          userData = await Users.findOne({ _id: onboardingDoc.user_id }).select({ first_name: 1, last_name: 1 });
          break;
        }
        case 'offboardings': {
          const offboardingDoc = await Offboardings.findOne({ _id: ObjectId(moduleID) }).select({ user_id: 1 });
          userData = await Users.findOne({ _id: offboardingDoc.user_id }).select({ first_name: 1, last_name: 1 });
          break;
        }
        case 'renewals': {
          const renewalDoc = await Renewals.findOne({ _id: ObjectId(moduleID) }).select({ user_id: 1 });
          userData = await Users.findOne({ _id: renewalDoc.user_id }).select({ first_name: 1, last_name: 1 });
          break;
        }
        default: {
          userData = {};
        }
      }


      if(userData && userData.first_name && userData.last_name){
        returnObj.subject = returnObj.subject.replace('[employee_name]', userData.first_name + ' ' + userData.last_name);
      } else {
        returnObj.subject = returnObj.subject.replace('[employee_name]', '');
      }

      if (reqBody && reqBody.isInquiryEmail) {
        console.log(reqBody, 'the req body for inquiry email, condition met');
        returnObj.content = returnObj.content.replace('[email]', reqBody.inquiryEmail);
        returnObj.content = returnObj.content.replace('[phone]', reqBody.inquiryPhone);
        returnObj.content = returnObj.content.replace('[type]', reqBody.inquiryType);
        returnObj.content = returnObj.content.replace('[inquiry_name]', reqBody.inquiryName);
      } else {
        returnObj.content = returnObj.content.replace('[email]', '');
        returnObj.content = returnObj.content.replace('[phone]', '');
        returnObj.content = returnObj.content.replace('[type]', '');
        returnObj.content = returnObj.content.replace('[inquiry_name]', '');
      }
      if (reqBody && reqBody.isReminderEmail) {
        returnObj.content = returnObj.content.replace('[lead_name]', reqBody.leadName);
        returnObj.content = returnObj.content.replace('[title]', reqBody.taskTitle);
        returnObj.content = returnObj.content.replace('[description]', reqBody.taskDescription);
      } else {
        returnObj.content = returnObj.content.replace('[lead_name]', '');
        returnObj.content = returnObj.content.replace('[title]', '');
        returnObj.content = returnObj.content.replace('[description]', '');
      }
      // case of OTP
      if (reqBody && reqBody.otp) {
        returnObj.content = returnObj.content.replace('[OTP]', reqBody.otp);
      } else {
        returnObj.content = returnObj.content.replace('[OTP]', '');
      }
      // for invoice number
      if ((reqBody && reqBody.invoiceNumber) || (reqBody && reqBody.amountDue)) {
        returnObj.content = returnObj.content.replace('[invoice_number]', reqBody.invoiceNumber);
        returnObj.content = returnObj.content.replace('[amount_due]', reqBody.amountDue);
        returnObj.subject = returnObj.subject.replace('[invoice_number]', reqBody.invoiceNumber);
      } else {
        returnObj.content = returnObj.content.replace('[invoice_number]', '');
        returnObj.content = returnObj.content.replace('[amount_due]]', '');
        returnObj.subject = returnObj.subject.replace('[invoice_number]', '');
      }

      if (reqBody && reqBody.invoices) {
        returnObj.content = returnObj.content.replace('[invoice_numbers]', reqBody.invoices);
      } else {
        returnObj.content = returnObj.content.replace('[invoice_numbers]', '');
      }
      // for ticket incident number
      if ((reqBody && reqBody.incidentNumber) || (reqBody && reqBody.ticketRaiser) || (reqBody && reqBody.companyName)) {
        returnObj.content = returnObj.content.replace('[incident_number]', reqBody.incidentNumber);
        returnObj.content = returnObj.content.replace('[ticket_raiser]', reqBody.ticketRaiser);
        returnObj.content = returnObj.content.replace('[company_name]', reqBody.companyName);
      } else {
        returnObj.content = returnObj.content.replace('[incident_number]', '');
        returnObj.content = returnObj.content.replace('[ticket_raiser]', '');
        returnObj.content = returnObj.content.replace('[company_name]', '');
      }
      // Handle replace for onboarding received email
      if ((reqBody && reqBody.first_name) || (reqBody && reqBody.last_name) || (reqBody && reqBody.email)) {
        returnObj.content = returnObj.content.replace('[employee_first_name]', reqBody.first_name);
        returnObj.content = returnObj.content.replace('[employee_last_name]', reqBody.last_name);
        returnObj.content = returnObj.content.replace('[employee_email]', reqBody.email);
      } else {
        returnObj.content = returnObj.content.replace('[employee_first_name]', '');
        returnObj.content = returnObj.content.replace('[employee_last_name]', '');
        returnObj.content = returnObj.content.replace('[employee_email]', '');
      }
      if (reqBody && reqBody.userDetails) {
        returnObj.content = returnObj.content.replace('[employee_full_name]', reqBody.userDetails.full_name);
        returnObj.content = returnObj.content.replace('[email_address]', reqBody.userDetails.email);
        returnObj.content = returnObj.content.replace('[phone_number]', reqBody.userDetails.phone_number);
        returnObj.content = returnObj.content.replace('[visa_sponsor_type]', reqBody.userDetails.visa_sponsor_type);
        returnObj.content = returnObj.content.replace('[employment_type]', reqBody.userDetails.employment_type);
        returnObj.content = returnObj.content.replace('[client_name]', reqBody.userDetails.company_name);
      } else {
        returnObj.content = returnObj.content.replace('[employee_full_name]', '');
        returnObj.content = returnObj.content.replace('[email_address]', '');
        returnObj.content = returnObj.content.replace('[phone_number]', '');
        returnObj.content = returnObj.content.replace('[visa_sponsor_type]', '');
        returnObj.content = returnObj.content.replace('[employment_type]', '');
        returnObj.content = returnObj.content.replace('[client_name]', '');
      }
      if (reqBody && reqBody.rejectionReason) {
        returnObj.content = returnObj.content.replace('reason_for_Cancelation', reqBody.rejectionReason);
      } else {
        returnObj.content = returnObj.content.replace('reason_for_Cancelation', '');
      }
      /**
       * ==================================================================================================================
       * Condition to generate onboarding tokens
       * these tokens are intended to allow companies to onboard dirrectly from a link
       * While this implementation is straight forward security considerations need to me reviewed.
       * ==================================================================================================================
       */
      // Handle cases where onboarding link is to be attached
      // console.log('==================================================================> lets do this', returnObj.name, returnObj._id);
      console.log("AWS")
      let enrollmentDoc;
      if ((typeof onboardingLink !== "undefined" && onboardingLink) || emailTempt.module  == "leads"  ) {
        // console.log("an onboarding link has been provided", onboardingLink)
        if (returnObj.name == 'Client Onboarding Email (Leads Process)' || returnObj.name == "Client Onboarding Email (Leads Process)") {
          // console.log('engineering process 001-----------------------------> email template for lead');
          let leadDoc;
          if (emailTempt.module == 'leads') {
            // console.log('engineering process 002, this is the email template with leads as module');
            leadDoc = await Leads.findById(moduleID);
            if (!leadDoc) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lead id');
          }
          console.log(leadDoc._id, 'the lead id!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          console.log(leadDoc.company_id, 'company id');
          let companyDocument = await Companies.findById(leadDoc.company_id);
          if(!companyDocument){
            throw new ApiError(httpStatus.BAD_REQUEST, 'Company not found for the provided lead');
          }
          console.log("found company document, proceeding to create enrollment", companyDocument.company_name, "the company name is this");
          let enrollmentBody = {
            legal_name: companyDocument.legal_name,
            company_name: companyDocument.company_name,
            email:companyDocument.company_email || companyDocument.email,
            company_email: companyDocument.company_email || companyDocument.email,
            company_id: companyDocument._id,
            bank_details: companyDocument.bank_details,
            contact_persons: companyDocument.contact_persons,
            registration_number: companyDocument.registration_number,
            upfront_costs: companyDocument.upfront_costs,
            upfront_costs_ees: companyDocument.upfront_costs_ees,
            payroll_schedule: companyDocument.payroll_schedule,
            trade_license_number: companyDocument.trade_license_number || companyDocument.trn_number,
            trn_number: companyDocument.trn_number,
            phone: companyDocument.phone,
            company_phone: companyDocument.company_phone,
            logo: companyDocument.logo,
            country: companyDocument.country,
            GRN_number: companyDocument.GRN_number,
            PO_number: companyDocument.PO_number,
            billing_address: companyDocument.billing_address,
            shipping_address: companyDocument.shipping_address,
            company_address: companyDocument?.company_address,
            type_of_business: companyDocument?.type_of_business,
            Industry: companyDocument?.business_industry,
            business_industry: companyDocument?.business_industry,
            company_email: companyDocument?.company_email,
            website: companyDocument?.website,
            isOnboardedLead: true,
          };
          console.log('^^^^^^^^^^^^^^^^^^^^^^^^------>', Object.keys(enrollmentBody), "the keys from enrollment body object");
          enrollmentDoc = await enrollmentsModel.findOne({ company_id: companyDocument._id });
          if (!enrollmentDoc) {
            console.log('creating new enrollment------> since no enrollment was found');
            enrollmentDoc = await enrollmentsModel.create(enrollmentBody);
            console.log("enrollmentDoc created successfully------->", enrollmentDoc._id, "===========>");
            if (!enrollmentDoc) throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating enrollment');
          }
          console.log('enrollment exists --------->');
          const config = await Configurations.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });
          const link =
            config.mailTrap.trap == true
              ? `https://peo-central-preprod.nathanhr.com/enrollment-form?id=${enrollmentDoc._id}`
              : `https://eor-central.nathanhr.com/enrollment-form?id=${enrollmentDoc._id}`;
          returnObj.content = returnObj.content.replace('[onboarding_link]', `<a href="${link}">Fill The Form</a>`);
          // add a field named enrollment id to return object
          returnObj.enrollmentId = enrollmentDoc._id || "sample return email";
        } else {
          console.log(emailTempt.name)
          if(emailTempt.name !== "Client Onboarding Email (Leads Process)" && emailTempt.name !== "Proposal from Nathan HR" && emailTempt.name !== 'Leads Service Agreement Email'){
             const generateToken = (company, expires, type, secret = config.jwt.secret) => {
            const payload = {
              _id: company._id,
              iat: moment().unix(),
              exp: expires.unix(),
              type,
              company_name: company.company_name
              // role_id: company.role_ID
            };
            return jwt.sign(payload, secret);
          };

          const saveToken = async (token, companyId, expires, type, blacklisted = false, isClient = true) => {
            const tokenDoc = await Token.create({
              token,
              user: companyId,
              isClient,
              expires: expires.toDate(),
              type,
              blacklisted,
              isOnboardingToken: true
            });
            return tokenDoc;
          };
          const generateOnboardingToken = async companyId => {
            try {
              const result = await Companies.findById(companyId);
              const company = result;

              const expires = moment().add(config.jwt.onboardingExpirationMinutes, 'minutes');

              const generatedToken = generateToken(company, expires, tokenTypes.ONBOARDING);

              const newToken = await saveToken(generatedToken, company._id, expires, tokenTypes.ONBOARDING, false, false);

              return generatedToken;
            } catch (error) {
              console.log(error);
              throw new Error(error);
            }
          };

          const onboardingLink = await generateOnboardingToken(moduleID);

          //   returnObj.content = returnObj.content.replace("[onboarding_link]", config.clientUrl + "/onboarding?token=" + onboardingLink);
          returnObj.content = returnObj.content.replace(
            '[onboarding_link]',
            `<a href="${config.clientUrl}Onboarding/create-employee-link?token=${onboardingLink}">Click here to complete your onboarding</a>`
            // `<a href="${config.clientUrl}Onboarding/new-employee?token=${onboardingLink}">Click here to complete your onboarding</a>`
          );
          const companyToNotifyViaEmail = await Companies.findById(moduleID);
          returnObj.to = [companyToNotifyViaEmail.email];
          }
         
        }
      }
      /**
       * ==================================================================================================================
       * Conditions to replace contents on bank details changed email
       * These are dependant on user input keys used on this email template
       * ==================================================================================================================
       */

      if (reqBody && reqBody.bank) {
        // Only replace fields that exist in reqBody.bank
        if (reqBody.bank.updatedAccountNumber !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedAccountNumber]', reqBody.bank.updatedAccountNumber);
          returnObj.content = returnObj.content.replace('[previousAccountNumber]', reqBody.bank.previousAccountNumber);
        } else {
          returnObj.content = returnObj.content.replace('[updatedAccountNumber]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousAccountNumber]', 'unchanged');
        }

        if (reqBody.bank.updatedBankName !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedBankName]', reqBody.bank.updatedBankName);
          returnObj.content = returnObj.content.replace('[previousBankName]', reqBody.bank.previousBankName);
        } else {
          returnObj.content = returnObj.content.replace('[updatedBankName]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousBankName]', 'unchanged');
        }

        if (reqBody.bank.updatedMOLWPSNumber !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedMOLWPSNumber]', reqBody.bank.updatedMOLWPSNumber);
          returnObj.content = returnObj.content.replace('[previousMOLWPSNumber]', reqBody.bank.previousMOLWPSNumber);
        } else {
          returnObj.content = returnObj.content.replace('[updatedMOLWPSNumber]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousMOLWPSNumber]', 'unchanged');
        }

        if (reqBody.bank.updatedIban !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedIban]', reqBody.bank.updatedIban);
          returnObj.content = returnObj.content.replace('[previousIban]', reqBody.bank.previousIban);
        } else {
          returnObj.content = returnObj.content.replace('[updatedIban]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousIban]', 'unchanged');
        }

        if (reqBody.bank.updatedBankPostOffice !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedBankPostOffice]', reqBody.bank.updatedBankPostOffice);
          returnObj.content = returnObj.content.replace('[previousBankPostOffice]', reqBody.bank.previousBankPostOffice);
        } else {
          returnObj.content = returnObj.content.replace('[updatedBankPostOffice]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousBankPostOffice]', 'unchanged');
        }

        if (reqBody.bank.updatedBankAddress !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedBankAddress]', reqBody.bank.updatedBankAddress);
          returnObj.content = returnObj.content.replace('[previousBankAddress]', reqBody.bank.previousBankAddress);
        } else {
          returnObj.content = returnObj.content.replace('[updatedBankAddress]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousBankAddress]', 'unchanged');
        }

        if (reqBody.bank.updatedSalaryPaymentMode !== undefined) {
          returnObj.content = returnObj.content.replace('[updatedSalaryPaymentMode]', reqBody.bank.updatedSalaryPaymentMode);
          returnObj.content = returnObj.content.replace(
            '[previousSalaryPaymentMode]',
            reqBody.bank.previousSalaryPaymentMode
          );
        } else {
          returnObj.content = returnObj.content.replace('[updatedSalaryPaymentMode]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousSalaryPaymentMode]', 'unchanged');
        }

        if (reqBody.bank.updatedSubSalaryPaymentMode !== undefined) {
          returnObj.content = returnObj.content.replace(
            '[updatedSubSalaryPaymentMode]',
            reqBody.bank.updatedSubSalaryPaymentMode
          );
          returnObj.content = returnObj.content.replace(
            '[previousSubSalaryPaymentMode]',
            reqBody.bank.previousSubSalaryPaymentMode
          );
        } else {
          returnObj.content = returnObj.content.replace('[updatedSubSalaryPaymentMode]', 'unchanged');
          returnObj.content = returnObj.content.replace('[previousSubSalaryPaymentMode]', 'unchanged');
        }
      } else {
        // If no bank details were provided, replace all placeholders with 'unchanged'
        returnObj.content = returnObj.content.replace('[updatedAccountNumber]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousAccountNumber]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedBankName]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousBankName]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedMOLWPSNumber]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousMOLWPSNumber]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedIban]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousIban]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedBankPostOffice]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousBankPostOffice]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedBankAddress]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousBankAddress]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedSalaryPaymentMode]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousSalaryPaymentMode]', 'unchanged');
        returnObj.content = returnObj.content.replace('[updatedSubSalaryPaymentMode]', 'unchanged');
        returnObj.content = returnObj.content.replace('[previousSubSalaryPaymentMode]', 'unchanged');
      }

      if (!data) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No Data Found');
      }
      // Condition to replace company string on to with the actual company email
      if (returnObj.to.includes('company')) {
        let companyId;
        let result;
        switch (originalResult) {
          case 'visaprocess':
            result = await VisaProcess.findById(moduleID);
            companyId = result.company_id;
            companyDoc = await Companies.findById(companyId);
            companyEmail = companyDoc.email;
            returnObj.to = returnObj.to.filter(toEmails => toEmails !== 'company');
            if (!returnObj.to.includes(companyEmail)) {
              returnObj.to.push(companyEmail);
            }
            returnObj.to.push(companyEmail);
            break;
          case 'onboardings':
            result = await Onboardings.findById(moduleID);
            companyId = result.company_id;
            companyDoc = await Companies.findById(companyId);
            companyEmail = companyDoc.email;
            returnObj.to = returnObj.to.filter(toEmails => toEmails !== 'company');
            if (!returnObj.to.includes(companyEmail)) {
              returnObj.to.push(companyEmail);
            }
            returnObj.to.push(companyEmail);
            break;
          case 'offboardings':
            result = await Offboardings.findById(moduleID);
            companyId = result.company_id;
            companyDoc = await Companies.findById(companyId);
            companyEmail = companyDoc.email;
            returnObj.to = returnObj.to.filter(toEmails => toEmails !== 'company');
            if (!returnObj.to.includes(companyEmail)) {
              returnObj.to.push(companyEmail);
            }
            returnObj.to.push(companyEmail);
            break;
          case 'companies':
            companyDoc = await Companies.findById(moduleID);
            companyEmail = companyDoc.email;
            returnObj.to = returnObj.to.filter(toEmails => toEmails !== 'company');
            if (!returnObj.to.includes(companyEmail)) {
              returnObj.to.push(companyEmail);
            }
            returnObj.to.push(companyEmail);
            break;
          default:
            console.log('Module passed is not viable for search');
        }
      }
      if (returnObj.name == 'Authentication Credentials Email') {
        const query = { module: 'onboardings', foreign_id: ObjectId(moduleID) };
        console.log(query);
        const signedEmploymentContract = await Documents.find(query).sort({ _id: -1 }).limit(1);
        console.log(signedEmploymentContract, 'this is the signed contract');
        console.log(signedEmploymentContract[0]?.url, 'the path');
        console.log(signedEmploymentContract[0]?.url.toString().split('/').slice(-1)[0], 'the name');
        returnObj.attachments = [{ path: signedEmploymentContract[0]?.url }];
      }
      if (
        generatedDocumentId &&
        generatedDocumentId != undefined &&
        generatedDocumentId != null &&
        /^[0-9a-fA-F]{24}$/.test(generatedDocumentId)
      ) {
        const uploadedDocument = await Documents.findOne({ _id: ObjectId(generatedDocumentId) });
        if (returnObj.content.includes('[Invoice Number/Description]')) {
          const invoiceNumber = uploadedDocument.name.split('_')[1].split('.')[0];
          returnObj.content = returnObj.content.replace('[Invoice Number/Description]', invoiceNumber);
        }
      }
      if(enrollmentDoc){
        console.log("got it", enrollmentDoc)
        returnObj.enrollmentId = enrollmentDoc._id;
      }
      return returnObj;
    } else {
      throw new ApiError(httpStatus.NOT_FOUND, 'No Data Found');
    }
  } catch (error) {
    console.log(error, 'Error from email template service-> getting email template without content');
    throw new Error(error);
  }
};

const generateGetQueryFirst = async (form, module) => {
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  defualtfields = form.fields.filter(a => a.connection_type == 'default');
  primaryfields = form.fields.filter(a => a.connection_type == 'primary');
  secondaryfields = form.fields.filter(a => a.connection_type == 'secondary');

  // secondary looksup collection
  let secondarylookups = [];
  let filteredsecondaryfields = groupBy(secondaryfields, 'module');
  for (let [collectionkey, value] of Object.entries(filteredsecondaryfields)) {
    let primiryconnectionsort = groupBy(value, 'primiary_connection');
    for (let [key, value] of Object.entries(primiryconnectionsort)) {
      const element = value;
      let project = {};
      for (let i = 0; i < element.length; i++) {
        const i_element = element[i];
        project[i_element.field] = `$${i_element.field}`;
      }
      let lookup = {
        from: collectionkey,
        localField: element[0].foreign_id,
        foreignField: '_id',
        as: collectionkey,
        pipeline: [
          {
            $project: project
          }
        ]
      };
      secondarylookups.push({ collection: key, lookup: lookup });
    }
  }

  // primary looksup collection
  let primarylookups = [];

  let filteredprimaryfields = groupBy(primaryfields, 'module');
  for (let [key, value] of Object.entries(filteredprimaryfields)) {
    const primaryelement = value;
    let lookup = {
      from: key == 'pro' ? 'users' : key,
      localField: primaryelement[0].foreign_id,
      foreignField: '_id',
      as: key,
      pipeline: []
    };
    let project = {};
    for (let i = 0; i < primaryelement.length; i++) {
      const i_element = primaryelement[i];
      project[i_element.field] = `$${i_element.field}`;
    }
    if (secondarylookups.filter(a => a.collection == key).length > 0) {
      for (let index = 0; index < secondarylookups.filter(a => a.collection == key).length; index++) {
        const element = secondarylookups.filter(a => a.collection == key)[index];
        lookup.pipeline.push({ $lookup: element.lookup });
        lookup.pipeline.push({ $unwind: `$${element.lookup.as}` });
        for (let [projectionkey, value] of Object.entries(element.lookup.pipeline[0]['$project'])) {
          project[projectionkey] = `$${element.lookup.as}.${projectionkey}`;
        }
      }
    }
    lookup.pipeline.push({ $project: project });
    primarylookups.push(lookup);
  }

  // creating main aggregate
  let aggregate = [];
  aggregate.push({
    $match: { _id: ObjectId(form.foreign_id) }
  });

  let project = {};

  for (let index = 0; index < defualtfields.length; index++) {
    const element = defualtfields[index];
    project[module + '.' + element.field] = `$${element.field}`;
  }
  if (primarylookups.length > 0) {
    for (let index = 0; index < primarylookups.length; index++) {
      const element = primarylookups[index];
      aggregate.push({ $lookup: element });
      aggregate.push({ $unwind: `$${element.as}` });
      for (let [projectionkey, value] of Object.entries(
        element.pipeline.filter(a => a.hasOwnProperty('$project'))[0]['$project']
      )) {
        project[element.as + '.' + projectionkey] = `$${element.as}.${projectionkey}`;
      }
    }
  }
  aggregate.push({ $project: project });

  return aggregate;
};

const generateGetQuery = async (form, module) => {
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  let defualtfields = form.fields.filter(a => a.connection_type == 'default');
  let primaryfields = form.fields.filter(a => a.connection_type == 'primary');
  let secondaryfields = form.fields.filter(a => a.connection_type == 'secondary');

  // Handle secondary lookups (no changes needed here)
  let secondarylookups = []; // ... (keep your existing secondary lookup logic)

  // Handle primary lookups
  let primarylookups = [];
  let filteredprimaryfields = groupBy(primaryfields, 'module');
  for (let [key, value] of Object.entries(filteredprimaryfields)) {
    const primaryelement = value;
    let lookup = {
      from: key == 'pro' ? 'users' : key,
      /**
       * This change ensures that for the 'onboardings' collection,
       * we're matching the main document's '_id' with the 'user_id' in
       * the onboardings collection.
       */
      localField: key === 'onboardings' ? '_id' : primaryelement[0].foreign_id,
      foreignField: key === 'onboardings' ? 'user_id' : '_id',
      as: key,
      pipeline: []
    };

    let project = {};
    for (let i = 0; i < primaryelement.length; i++) {
      const i_element = primaryelement[i];
      project[i_element.field] = `$${i_element.field}`;
    }

    if (secondarylookups.filter(a => a.collection == key).length > 0) {
      for (let index = 0; index < secondarylookups.filter(a => a.collection == key).length; index++) {
        const element = secondarylookups.filter(a => a.collection == key)[index];
        lookup.pipeline.push({ $lookup: element.lookup });
        lookup.pipeline.push({ $unwind: `$${element.lookup.as}` });
        for (let [projectionkey, value] of Object.entries(element.lookup.pipeline[0]['$project'])) {
          project[projectionkey] = `$${element.lookup.as}.${projectionkey}`;
        }
      }
    }
    lookup.pipeline.push({ $project: project });
    primarylookups.push(lookup);
  }

  // Create main aggregate
  let aggregate = [
    {
      $match: { _id: ObjectId(form.foreign_id) }
    }
  ];

  let project = {};
  // console.log(project, "this is the value of project&&&&&&&&&&&&&&&&&&");
  for (let index = 0; index < defualtfields.length; index++) {
    const element = defualtfields[index];
    project[`${module}.${element.field}`] = `$${element.field}`;
  }

  if (primarylookups.length > 0) {
    for (let index = 0; index < primarylookups.length; index++) {
      const element = primarylookups[index];
      aggregate.push({ $lookup: element });
      aggregate.push({
        $unwind: {
          path: `$${element.as}`,
          preserveNullAndEmptyArrays: true // This allows documents without matches to still be included
        }
      });
      for (let [projectionkey, value] of Object.entries(
        element.pipeline.filter(a => a.hasOwnProperty('$project'))[0]['$project']
      )) {
        project[`${element.as}.${projectionkey}`] = `$${element.as}.${projectionkey}`;
      }
    }
  }
  aggregate.push({ $project: project });

  // console.log('Generated aggregate query:', JSON.stringify(aggregate, null, 2));
  for (let index = 0; index < aggregate.length; index++) {
    const element = aggregate[index];

    // Check if the element has a $lookup stage
    if (element.hasOwnProperty('$lookup')) {
      console.log('============================================');
      // Modify the localField and foreignField for the specific $lookup from "onboardings"
      if (
        element.$lookup.from === 'onboardings' &&
        element.$lookup.localField === '_id' &&
        element.$lookup.foreignField === 'user_id'
      ) {
        aggregate[index].$lookup.localField = 'foreign_id'; // Change localField
        aggregate[index].$lookup.foreignField = '_id'; // Change foreignField
      }
    }
  }
  // console.log('Generated aggregate query:', JSON.stringify(aggregate, null, 2));
  return aggregate;
};

async function getReplacedTemplate(moduleID, emailTempt, content) {
  let replaceKeys = emailTempt.auto_replace_keys;
  for (let index = 0; index < replaceKeys.length; index++) {
    const element = replaceKeys[index];
    let project = {};
    project[element.field] = 1;
    project._id = 0;
    const model = require(`../models/${emailTempt.module}.model`);
    let moduleData = await model.findOne({ _id: ObjectId(moduleID) });

    let DBModel = require(`../models/${element.collection}.model`);
    const query = {
      module_relations: {
        $elemMatch: {
          module: emailTempt.module,
          foreign_module: element.collection
        }
      }
    };
    const projection = { 'module_relations.$': 1 };
    const result = await Configurations.findOne(query, projection);

    forignKey = result.module_relations[0].foreign_key;
    element.fk_id = moduleData[forignKey];

    let getDoc = await DBModel.findOne({ _id: element.fk_id }).select(project);
    // console.log(getDoc, "GET")
    let str = element.key;
    let updatedArr = [str.slice(1, -1)];
    let fieldValue;
    if (getDoc && getDoc[element.field] && getDoc[element.field][updatedArr]) {
      fieldValue = getDoc ? getDoc[element.field][updatedArr] : '';
    } else {
      fieldValue = getDoc ? getDoc[element.field] : '';
    }
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.join(', ');
    }
    element.value = fieldValue;
    content = content.replace(element.key, fieldValue);

    if (replaceKeys.length == index + 1) {
      return content;
    }
  }
}

module.exports = {
  getEmailTemplate,
  addNewEmailTemplate,
  listAllEmailTemplates,
  updateUpdatedBy,
  updateCreatedBy,
  getEmailTemplatesOnID,
  updateEmailTemplateOnId,
  deleteEmailTemplateOnId,
  getEmailTemplateOnIDWithoutContent,
  getEmailTemplateByName
};
