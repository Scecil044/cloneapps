const { ObjectId } = require('mongodb');
const { Companies, ChartOfAccounts, Users, Offboardings, Onboardings, Renewals, VisaProcess, Poc, Role, EmailLog, Invoice } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const pagination = require('../middlewares/paginate');
const chartOfAccountsService = require('./chart_of_accounts.service');
const fs = require("fs");
const excelJs = require("exceljs")
const crypto = require('crypto');


const paginatedCompanyList = async(reqQuery)=>{
  try{
    let searchRegex;
    const options ={
      page: reqQuery.page ? parseInt(reqQuery.page, 10) :1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) :10,
      sortBy: reqQuery.sort || "_id:-1"

    }
    const filter = {
      is_deleted: false
    }
    if(reqQuery.search && reqQuery.search.trim() !== ""){
      searchRegex = new RegExp(reqQuery.search, "i"),
      filter.$or =[
        {company_name: searchRegex},
        {email: searchRegex},
        {email: searchRegex},
        {legal_name: searchRegex},
      ]
    }
    const response = await Companies.paginate(filter, options)
    return response;
  }catch(error){
    throw error
  }
}
const fetchCompaniesByIds = async(reqBody)=>{
  try{
    const comapnyIds = reqBody.comapnyIds.map((id) => ObjectId(id));
    const selectedCompanies = await Companies.find({_id:{$in:comapnyIds}}).select('_id company_name email').lean();
    return selectedCompanies
  }catch(error){
    throw error
  }
}
function mergeAndCleanFields(existingFields = {}, newFields = {}) {
  const mergedObject = { ...existingFields };

  for (const [key, value] of Object.entries(newFields)) {
    if (value !== null && value !== undefined) {
      mergedObject[key] = value;
    }
  }

  for (const key of Object.keys(newFields)) {
    if (newFields[key] === null || newFields[key] === undefined) {
      delete mergedObject[key];
    }
  }

  return mergedObject;
}
const generateCompanyReferenceNumbers = async (companyId) => {
  try {
    if (companyId) {
      // Generate reference number for a specific company
      const company = await Companies.findOne({ _id: companyId, is_deleted: false });
      if (!company) {
        console.log(`Company with ID ${companyId} not found or is deleted.`);
        return;
      }

      // Get first four letters of company name
      const prefix = company.company_name
        .trim()
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 4);

      // Get the last sequence used for reference number
      let lastSeq = 9; // Default starting value for sequence
      const lastCompany = await Companies.findOne(
        { is_deleted: false, reference_number: { $exists: true } }
      ).sort({ reference_number: -1 });

      if (lastCompany) {
        // Extract the last sequence number from the most recent reference number
        const lastReferenceNumber = lastCompany.reference_number;
        const lastSeqNumber = parseInt(lastReferenceNumber.split('-')[1], 10);
        lastSeq = lastSeqNumber;
      }

      // Increment sequence
      lastSeq++;

      // Format sequence as 4 digits with leading zeros
      const sequence = String(lastSeq).padStart(4, '0');

      // Get creation date details
      const creationDate = new Date(company.createdAt || Date.now());
      const month = String(creationDate.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
      const year = creationDate.getFullYear();

      // Create reference number
      const referenceNumber = `${prefix}-${sequence}-${month}-${year}`;

      // Update company with new reference number
      await Companies.updateOne(
        { _id: company._id },
        { $set: { reference_number: referenceNumber } },
        { new: true }
      );

      console.log(`Generated reference number for ${company.company_name}: ${referenceNumber}`);
      return referenceNumber; // Return the unique reference number
    } else {
      // Unset existing reference numbers for non-deleted companies
      await Companies.updateMany(
        { is_deleted: false },
        { $unset: { reference_number: "" } }
      );
      console.log('Unset all existing reference numbers for companies with is_deleted: false');

      // Get companies without reference_number and not deleted
      const companies = await Companies.find(
        { reference_number: { $exists: false }, is_deleted: false },
        { company_name: 1, createdAt: 1 }
      );

      let lastSeq = 9; // Starting from 0010
      let count = 0;

      for (const company of companies) {
        count += 1;

        // Get first four letters of company name
        const prefix = company.company_name
          .trim()
          .replace(/[^a-zA-Z]/g, '')
          .toUpperCase()
          .slice(0, 4);

        // Increment sequence
        lastSeq++;

        // Format sequence as 4 digits with leading zeros
        const sequence = String(lastSeq).padStart(4, '0');

        // Get creation date details
        const creationDate = new Date(company.createdAt || Date.now());
        const month = String(creationDate.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
        const year = creationDate.getFullYear();

        // Create reference number
        const referenceNumber = `${prefix}-${sequence}-${month}-${year}`;

        // Update company with new reference number
        await Companies.updateOne(
          { _id: company._id },
          { $set: { reference_number: referenceNumber } },
          { new: true }
        );

        console.log(`${count} Updated reference number for ${company.company_name} to -------> ${referenceNumber}`);
      }

      console.log('Successfully generated new reference numbers for all companies');
    }
  } catch (error) {
    console.error('Error generating reference numbers:', error);
    throw error;
  }
};

const fetchCompanyEmails = async(companyEmail, reqQuery)=>{
  try{
    const options = {
      limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) : 100,
      page: reqQuery.page ? parseInt(reqQuery.page, 10) : 1,
      sortBy: reqQuery.sortBy ? reqQuery.sortBy : 'createdAt:-1',
    }
    const filter = {
      is_deleted: false,
      to:{$in:[companyEmail]}
    }
    let searchRegex;
    if(reqQuery.search){
      searchRegex = new RegExp(reqQuery.search, 'i');
      filter.$or = [
        { subject: searchRegex },

      ];
    }
    const emailLogs = await EmailLog.paginate(filter, options);

    return emailLogs
  }catch(error){
    throw error
  }
}

const generateUniqueCode = (prefix = 'PEO-', length = 6) => {
  // Generate a random hex value and limit the length
  return `${prefix}${crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase()}`;
};

const createCompany = async (companyBody, userId) => {
  try {
    if(companyBody.address){
      companyBody.company_address = companyBody.address;
      delete companyBody.address
    }
    companyBody = {...companyBody, created_by: userId, status: 'active' };
    let uniqueCode;
    let isUnique = false;

    while (!isUnique) {
      // Generate a new unique code
      uniqueCode = generateUniqueCode();

      // Check if the generated unique code already exists
      const existingCompany = await Companies.findOne({ unique_code: uniqueCode });
      if (!existingCompany) {
        isUnique = true; // Exit loop if the code is unique
      }
    }

    console.log("Unique code generated:", uniqueCode);

    // Add the unique code to the company body
    companyBody.unique_code = uniqueCode;
    companyBody.contact_persons = !Array.isArray(companyBody.contact_person) ? [companyBody.contact_person] : companyBody.contact_person;
    // Create new company
    console.log(companyBody.contact_persons, "this is the reconstructed array")
    const newCompany = new Companies(companyBody);
    const createdCompany = await newCompany.save();

    console.log(companyBody.company_name, 'is the company name');
    if (!createdCompany) throw new Error('Could not create company');

    console.log("============",createdCompany, "this is the created company$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    // Generate and set reference number
    const reference_number = await generateCompanyReferenceNumbers(newCompany._id);
    console.log(reference_number, "The generated reference number");
    createdCompany.reference_number = reference_number;
    await createdCompany.save();
    console.log("print before chart of accounts", createdCompany, "end of it")
    // Construct Chart of Accounts Object
    const data = await ChartOfAccounts.find({ code: "AR" });
    const count = data.length;
    const { account_type, company, details_type, name, _id, is_balance_sheet, account_id, isDebitAccount, trialBalanceDebitType, isReportValuePositive, city } = data[0];

    const accountObj = {
      name: `AR-${createdCompany.company_name}`,
      company: ObjectId(company),
      account_id: `${account_id}-${count.toString().padStart(3, "0")}`,
      account_type,
      details_type,
      base_view: true,
      parent_account_id: _id,
      parent_account_name: name,
      is_balance_sheet,
      customer: createdCompany._id,
      isDebitAccount,
      trialBalanceDebitType,
      isReportValuePositive,
      is_sub: true,
      city,
    };
    await chartOfAccountsService.createChartOfAccounts(accountObj);

    // Create POC for the company
    const pocRole = await Role.findOne({ role_name: "Admin" });

    // const newPocs = await Poc.insertMany(
    //   companyBody.contact_persons.map((person) => ({
    //     company_id: createdCompany._id,
    //     designation: person.designation,
    //     name: person.name,
    //     email: person.email,
    //     department: person.department,
    //     role_ID: pocRole._id,
    //   }))
    // );

    //  if (!newPocs) throw new Error('Could not create POC(s)');

    return createdCompany;
  } catch (error) {
    console.error("Error creating company:", error && error.message);
    throw error;
  }
};


const listAllCompaniesAndTheirPayrollSchedule = async (page, limit) => {
  const companies = await Companies.find(
    { is_deleted: false, status:{$in:['active']} },
    { _id: 1, payroll_schedule: 1, company_name: 1, address: 1, email: 1 }
  );
  if (companies == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companies;
};

const listAllCompaniesAndTheirPayrollScheduleOnID = async companyID => {
  const companies = await Companies.find(
    { is_deleted: false, status:{$in:['active']} },
    { _id: 1, payroll_schedule: 1, company_name: 1, address: 1, email: 1 }
  );
  if (companies == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companies;
};


// const updateCompaniesOnId = async (companyId, updateCompanyBody) => {
//   try {
//     console.log(updateCompanyBody, '+++ the update body');
//   const companyResult = await companyById(companyId);
//   if (!companyResult) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Company Not found');
//   }

//   const defaultUpfrontCostsEes = {
//     employment_visa: '0',
//     visa_validity: '0',
//     emiratisation_cost: '0',
//     medical_insurance: '0',
//     security_deposit: '0',
//     employee_statutory_benifits: '0',
//     monthly_costs: ['A-Level'],
//     employee_salary: '0',
//     service_fee: '0'
//   };

//   const defaultUpfrontCosts = {
//     employment_visa: '0',
//     visa_validity: '0',
//     emiratisation_cost: '0',
//     medical_insurance: '0',
//     security_deposit: '0',
//     employee_statutory_benifits: '0',
//     monthly_costs: ['A-Level'],
//     employee_salary: '0',
//     service_fee: '0'
//   };

//   const updates = Object.keys(updateCompanyBody);
//   // handle payroll schedule update
//   updates.forEach(update => {
//     if (update === 'payroll_schedule') {
//       // If an empty object is passed, clear the payroll schedule
//       if (Object.keys(updateCompanyBody[update]).length === 0) {
//         updateCompanyBody[update] = {};
//       } else {
//         // Replace the entire payroll schedule with the new data
//         updateCompanyBody[update] = { ...updateCompanyBody[update] };
//       }
//     }
//     // handle configurations update
//     if (update === 'configurations') {
//       const updatedConfigurations = { ...companyResult.configurations };

//       // Merge new updates without clearing existing configurations
//       Object.entries(updateCompanyBody[update]).forEach(([key, value]) => {
//         if (value !== null && value !== undefined) {
//           updatedConfigurations[key] = value;
//         }
//       });

//       updateCompanyBody[update] = updatedConfigurations;
//     }

//     // Handle contact_persons updates (override the array)
//     if (update === 'contact_persons') {
//       if (Array.isArray(updateCompanyBody[update]) && updateCompanyBody[update].length > 0) {
//         updateCompanyBody[update] = updateCompanyBody[update]; // Simply override the entire array
//       }
//     }

//     if (update === 'upfront_costs_ees') {
//       console.log('this is an ees update');
//       const updatedUpfrontCostsEes = {
//         ...defaultUpfrontCostsEes,
//         ...companyResult.upfront_costs_ees,
//         ...updateCompanyBody[update]
//       };
//       // Remove keys that are not in the updateCompanyBody
//       Object.keys(updatedUpfrontCostsEes).forEach(key => {
//         if (!(key in updateCompanyBody[update])) {
//           delete updatedUpfrontCostsEes[key];
//         }
//       });
//       updateCompanyBody[update] = updatedUpfrontCostsEes;
//     }
//     if (update === 'upfront_costs') {
//       const updatedUpfrontCosts = {
//         ...defaultUpfrontCosts,
//         ...companyResult.upfront_costs,
//         ...updateCompanyBody[update]
//       };
//       // Remove keys that are not in the updateCompanyBody
//       Object.keys(updatedUpfrontCosts).forEach(key => {
//         if (!(key in updateCompanyBody[update])) {
//           delete updatedUpfrontCosts[key];
//         }
//       });
//       updateCompanyBody[update] = updatedUpfrontCosts;
//     }
//     if (update === 'monthly_costs') {
//       let updatedMonthlyCosts = { ...companyResult.monthly_costs };

//       if (Object.keys(updateCompanyBody[update]).length === 0) {
//         // If an empty object is passed, clear all existing monthly costs
//         updatedMonthlyCosts = {};
//       } else {
//         // Add, update, or delete items
//         Object.entries(updateCompanyBody[update]).forEach(([key, value]) => {
//           if (value !== null && value !== undefined) {
//             updatedMonthlyCosts[key] = value;
//           } else {
//             // Remove the item if the value is null or undefined
//             delete updatedMonthlyCosts[key];
//           }
//         });
//       }

//       updateCompanyBody[update] = updatedMonthlyCosts;
//     }
//     if (update === 'monthly_costs_ees') {
//       const updatedMonthlyCostsEes = {
//         ...companyResult.monthly_costs_ees,
//         ...updateCompanyBody[update]
//       };
//       // Remove keys that are not in the updateCompanyBody
//       Object.keys(updatedMonthlyCostsEes).forEach(key => {
//         if (!(key in updateCompanyBody[update])) {
//           delete updatedMonthlyCostsEes[key];
//         }
//       });
//       updateCompanyBody[update] = updatedMonthlyCostsEes;
//     }
//     if(update === 'billing_address') {
//       const billingAddress = {
//         ...companyResult.billing_address,
//         ...updateCompanyBody[update]
//       }
//       Object.keys(billingAddress).forEach(key => {
//         if(!(key in updateCompanyBody[update])) {
//           delete billingAddress[key];
//         }
//       })
//     }
//     if(update === 'shipping_address') {
//       const shippingAddress = {
//         ...companyResult.shipping_address,
//         ...updateCompanyBody[update]
//       }
//       Object.keys(shippingAddress).forEach(key => {
//         if(!(key in updateCompanyBody[update])) {
//           delete shippingAddress[key];
//         }
//       })
//     }
//   });

//   if (updateCompanyBody.status && updateCompanyBody.status !== undefined) {
//     let employees = [];
//     switch (updateCompanyBody.status) {
//       case 'inactive':
//         console.log("marking company as inactive==================");
//         employees = await Users.find({ is_deleted: false, company_id: ObjectId(companyId) });
//         console.log(employees.length);

//         for (let i = 0; i < employees.length; i++) {
//           const element = employees[i];

//           // Update status to 'inactive'
//           await Users.updateOne(
//             { _id: element._id },
//             { $set: { user_status: 'inactive' } },
//             { new: true }
//           );

//           // Offboarding documents
//           const offboardingDocs = await Offboardings.find({ user_id: element._id });
//           for (const offboardingDoc of offboardingDocs) {
//             offboardingDoc.processes.forEach((item) => {
//               item.process_status = 'completed';
//             });
//             offboardingDoc.status = 'completed';
//             offboardingDoc.reason_for_unsuccessful = 'cancelled';
//             offboardingDoc.markModified('processes')
//             await offboardingDoc.save();
//           }

//           // Onboarding documents
//           const onboardingDocs = await Onboardings.find({ user_id: element._id });
//           for (const onboardingDoc of onboardingDocs) {
//             onboardingDoc.processes.forEach((item) => {
//               item.process_status = 'completed';
//             });
//             onboardingDoc.status = 'completed';
//             onboardingDoc.reason_for_unsuccessful = 'cancelled';
//             onboardingDoc.markModified('processes');
//             await onboardingDoc.save();
//           }

//           // Renewal documents
//           const renewalDocs = await Renewals.find({ user_id: element._id });
//           for (const renewalDoc of renewalDocs) {
//             renewalDoc.processes.forEach((item) => {
//               item.process_status = 'completed';
//             });
//             renewalDoc.status = 'completed';
//             renewalDoc.reason_for_unsuccessful = 'cancelled';
//             renewalDoc.markModified('processes')
//             await renewalDoc.save();
//           }

//           // Visa documents
//           const visaDocs = await VisaProcess.find({ user_id: element._id });
//           for (const visaDoc of visaDocs) {
//             visaDoc.processes.forEach((process) => {
//               process.process_status = 'completed';
//             });
//             visaDoc.reason_for_unsuccessful = 'Cancelled';
//             visaDoc.markModified('processes')
//             await visaDoc.save();
//           }
//         }
//         break;

//       case 'active':
//         employees = await Users.find({ is_deleted: false, company_id: ObjectId(companyId) });
//         for (let i = 0; i < employees.length; i++) {
//           const element = employees[i];

//           // Update status to 'active'
//           await Users.updateOne(
//             { _id: element._id },
//             { $set: { status: 'active' } },
//             { new: true }
//           );
//         }
//         break;

//       default:
//         return;
//     }
//   }

//   return Companies.findOneAndUpdate({ _id: companyId }, { $set: updateCompanyBody }, { new: true });
//   } catch(error){
//     console.log(error);
//     throw new Error(error)
//   }
// };
const updateCompaniesOnId = async (companyId, updateCompanyBody) => {
  try {
    console.log(updateCompanyBody, '+++ the update body-------------->');
    if(updateCompanyBody.address){
      updateCompanyBody.company_address = updateCompanyBody.address;
      delete updateCompanyBody.address;
    }
    const companyResult = await companyById(companyId);
    if (!companyResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company Not Found');
    }

    // For complete object replacement of cost fields
    if (updateCompanyBody.upfront_costs) {
      // Normalize keys by handling both underscore and space versions
      updateCompanyBody.upfront_costs = normalizeAndMergeCostKeys(updateCompanyBody.upfront_costs);
    }

    if (updateCompanyBody.upfront_costs_ees) {
      updateCompanyBody.upfront_costs_ees = normalizeAndMergeCostKeys(updateCompanyBody.upfront_costs_ees);
    }

    if (updateCompanyBody.monthly_costs) {
      updateCompanyBody.monthly_costs = normalizeAndMergeCostKeys(updateCompanyBody.monthly_costs);
    }

    if (updateCompanyBody.monthly_costs_ees) {
      updateCompanyBody.monthly_costs_ees = normalizeAndMergeCostKeys(updateCompanyBody.monthly_costs_ees);
    }

    // Handle other updates
    const updates = Object.keys(updateCompanyBody);
    updates.forEach(update => {
      if (!['upfront_costs', 'upfront_costs_ees', 'monthly_costs', 'monthly_costs_ees'].includes(update)) {
        handleSpecificUpdates(update, companyResult, updateCompanyBody);
      }
    });

    // Handle Points of Contact (POC) updates
    if (updateCompanyBody.contact_persons) {
      console.log('Updating Points of Contact...');
      await updatePointsOfContact(companyId, updateCompanyBody.contact_persons);
    }

    // Update the company record in the database
    const updatedCompany = await Companies.findById(companyId);

    if (!updatedCompany) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company not found for update');
    }

    // Apply all updates to the document
    Object.keys(updateCompanyBody).forEach(key => {
      updatedCompany[key] = updateCompanyBody[key];

      // Explicitly mark the fields as modified
      if (['upfront_costs', 'upfront_costs_ees', 'monthly_costs', 'monthly_costs_ees'].includes(key)) {
        updatedCompany.markModified(key);
      }
    });

    // Save the document with the changes
    return await updatedCompany.save();
  } catch (error) {
    console.error('Error updating company:', error);
    throw new Error(error.message);
  }
};

function normalizeAndMergeCostKeys(costObject) {
  // Create a new object to store normalized costs
  const normalizedCosts = {};

  // Process each key-value pair
  Object.entries(costObject).forEach(([key, value]) => {
    // Convert underscores to spaces for consistency
    const normalizedKey = key.replace(/_/g, ' ');
    normalizedCosts[normalizedKey] = value;
  });

  return normalizedCosts;
}

function handleSpecificUpdates(update, companyResult, updateCompanyBody) {
  switch (update) {
    case 'configurations':
      // Merge new configurations
      const updatedConfigurations = { ...companyResult.configurations, ...updateCompanyBody[update] };
      updateCompanyBody[update] = updatedConfigurations;
      break;

    case 'billing_address':
    case 'shipping_address':
      // Update address fields by merging changes
      updateCompanyBody[update] = mergeAndCleanFields(companyResult[update], updateCompanyBody[update]);
      break;

    default:
      break;
  }
}

async function updatePointsOfContact(companyId, newPOCDetails) {
  try {
    const result = await Poc.find({ company_id: ObjectId(companyId), is_deleted: false });

    const deleteResult = await Poc.deleteMany({ company_id: companyId });

    const pocRole = await Role.findOne({ role_name: "Admin" });
    // Create new POCs with the provided details
    const newPOCs = newPOCDetails.map(poc => ({
      ...poc,
      company_id: companyId,
      is_deleted: false,  // Ensure new POCs are active
      role_ID: pocRole._id,
    }));

    const createdPOCs = await Poc.insertMany(newPOCs);

    return {
      message: 'POCs updated successfully',
      createdPOCs,
    };
  } catch (error) {
    console.error('Error updating POCs:', error);
    throw new Error('Failed to update points of contact');
  }
}

async function handleCompanyStatusUpdate(companyId, status) {
  const employees = await Users.find({ is_deleted: false, company_id: ObjectId(companyId) });

  for (const employee of employees) {
    await updateEmployeeAndDocuments(employee._id, status);
  }
}

async function updateEmployeeAndDocuments(employeeId, status) {
  const updateStatus = status === 'inactive' ? 'inactive' : 'active';

  // Update employee status
  await Users.updateOne({ _id: employeeId }, { $set: { user_status: updateStatus } });

  if (status === 'inactive') {
    // Mark documents as completed for inactive status
    await completeEmployeeDocuments(employeeId);
  }
}

async function completeEmployeeDocuments(employeeId) {
  const documentCollections = [Offboardings, Onboardings, Renewals, VisaProcess];

  for (const collection of documentCollections) {
    const documents = await collection.find({ user_id: employeeId });

    for (const doc of documents) {
      doc.processes.forEach(process => process.process_status = 'completed');
      doc.status = 'completed';
      doc.reason_for_unsuccessful = 'cancelled';
      doc.markModified('processes');
      await doc.save();
    }
  }
}

const UpdateCompanyContacts = async (companyId, updateCompanyBody) => {
  return await Companies.findOneAndUpdate({ _id: companyId }, { $set: updateCompanyBody }, { new: true });
};

const updateUpdatedBy = async (companyId, userId) => {
  return Companies.findOneAndUpdate({ _id: companyId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (companyId, userId) => {
  return Companies.findOneAndUpdate({ _id: companyId }, { $set: { created_by: userId } });
};

const listAllCompanies = async queryObject => {
  const query = { is_deleted: false };
  const options = { limit: queryObject.limit ? parseInt(queryObject.limit) : 1000, sort: { createdAt: -1 } };
  const companies = await Companies.find(query, null, options).lean();
  console.log(companies.length);
  if (companies.length < 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companies;
};

const companyById = async companyId => {
  try{
    let company = await Companies.findById({ _id: ObjectId(companyId), is_deleted: false });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, `No matching company was found with the provided id: ${companyId}`);
  }
  return company;
  }catch(error){
    throw new Error(error);
  }
};

// Get the List of Companies on the Company ID
const getCompanyById = async (companyId, projection = {}) => {
  let companies = await Companies.findOne({ _id: ObjectId(companyId) }, projection).lean();
  if (!companies || companies.length === 0) {
    return { message: 'Unable Get Company by id', data: [] };
  }
  return { message: 'Success', data: companies };
};

const companiesOnStatus = async (status, page, limit) => {
  let companies = await Companies.find({ status: status }, { is_deleted: false });
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  if (!companies) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companiesResult;
};

const deleteCompany = async companyId => {
  console.log(companyId, 'this is the id');
  console.log('warning 333');
  let companies = await Companies.findByIdAndUpdate({ _id: ObjectId(companyId) }, { is_deleted: true }, { new: true });
  if (!companies) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Companies');
  }
  return companies;
};

//Get all company details with just the required fields (company_name, email, phone and logo)
const listAllCompaniesWithRequiredFields = async (page, limit) => {
  const companies = await Companies.find(
    { is_deleted: false },
    { _id: 1, logo: 1, company_name: 1, email: 1, phone: 1, status: 1 }
  );
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  if (companies == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companiesResult;
};

//Get all company Names with their IDS
const listOfAllCompanyNamesWithTheirIDs = async (page, limit) => {
  const companies = await Companies.find({ is_deleted: false, }, { _id: 1, company_name: 1, logo: 1 });
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  if (companies == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companiesResult;
};

//Get the Company details on CompanyID
const companyExptendedDetailsOnId3 = async companyId => {
  let companies = await Companies.find(
    { _id: ObjectId(companyId) },
    { is_deleted: false },
    {
      legal_name: 1,
      company_name: 1,
      registration_number: 1,
      logo: 1,
      phone: 1,
      email: 1,
      address: 1,
      country: 1,
      status: 1,
      contact_person: 1,
      website: 1,
      configurations: 1,
      locations: 1,
      available_insurances: 1,
      bank_details: 1
    }
  );
  if (!companies) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companies;
};
const companyExptendedDetailsOnId = async companyId => {
  const pipeline = [
    {
      $match: {
        _id: ObjectId(companyId),
        is_deleted: false
      }
    },
    // {
    //   $addFields: {
    //     total_costs_ees: {
    //       $add: [
    //         {
    //           $reduce: {
    //             input: { $objectToArray: '$upfront_costs_ees' },
    //             initialValue: 0,
    //             in: {
    //               $add: [
    //                 '$$value',
    //                 {
    //                   $cond: {
    //                     if: {
    //                       $and: [
    //                         { $ne: ['$$this.k', 'monthly_costs'] },
    //                         { $regexMatch: { input: { $toString: '$$this.v' }, regex: /^\s*-?(\d+\.?\d*|\.\d+)\s*$/ } }
    //                       ]
    //                     },
    //                     then: { $toDouble: '$$this.v' },
    //                     else: 0
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $reduce: {
    //             input: { $objectToArray: '$monthly_costs_ees' },
    //             initialValue: 0,
    //             in: {
    //               $add: [
    //                 '$$value',
    //                 {
    //                   $cond: {
    //                     if: { $regexMatch: { input: { $toString: '$$this.v' }, regex: /^\s*-?(\d+\.?\d*|\.\d+)\s*$/ } },
    //                     then: { $toDouble: '$$this.v' },
    //                     else: 0
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         }
    //       ]
    //     },
    //     total_costs_des: {
    //       $add: [
    //         {
    //           $reduce: {
    //             input: { $objectToArray: '$upfront_costs' },
    //             initialValue: 0,
    //             in: {
    //               $add: [
    //                 '$$value',
    //                 {
    //                   $cond: {
    //                     if: {
    //                       $and: [
    //                         { $ne: ['$$this.k', 'monthly_costs'] },
    //                         { $regexMatch: { input: { $toString: '$$this.v' }, regex: /^\s*-?(\d+\.?\d*|\.\d+)\s*$/ } }
    //                       ]
    //                     },
    //                     then: { $toDouble: '$$this.v' },
    //                     else: 0
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         {
    //           $reduce: {
    //             input: { $objectToArray: '$monthly_costs' },
    //             initialValue: 0,
    //             in: {
    //               $add: [
    //                 '$$value',
    //                 {
    //                   $cond: {
    //                     if: { $regexMatch: { input: { $toString: '$$this.v' }, regex: /^\s*-?(\d+\.?\d*|\.\d+)\s*$/ } },
    //                     then: { $toDouble: '$$this.v' },
    //                     else: 0
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         }
    //       ]
    //     }
    //   }
    // },
    {
      $addFields: {
        total_costs_ees: {
          $sum: {
            $map: {
              input: { $objectToArray: '$upfront_costs_ees' },
              as: 'item',
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ['$$item.k', 'monthly_costs'] },
                      { $regexMatch: { input: { $toString: '$$item.v' }, regex: /^\s*-?(\d+\.?\d*|\.\d+)\s*$/ } }
                    ]
                  },
                  then: { $toDouble: '$$item.v' },
                  else: 0
                }
              }
            }
          }
        },
        total_costs_des: {
          $sum: {
            $map: {
              input: { $objectToArray: '$upfront_costs' },
              as: 'item',
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ['$$item.k', 'monthly_costs'] },
                      { $regexMatch: { input: { $toString: '$$item.v' }, regex: /^\s*-?(\d+\.?\d*|\.\d+)\s*$/ } }
                    ]
                  },
                  then: { $toDouble: '$$item.v' },
                  else: 0
                }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        legal_name: 1,
        company_name: 1,
        registration_number: 1,
        logo: 1,
        phone: 1,
        email: 1,
        company_email: 1,
        company_address: 1,
        country: 1,
        status: 1,
        contact_persons: 1,
        website: 1,
        configurations: 1,
        locations: 1,
        available_insurances: 1,
        bank_details: 1,
        business_industry: 1,
        type_of_business: 1,
        no_of_employees: 1,
        company_notes: 1,
        parent_id: 1,
        letterDetail: 1,
        upfront_costs: 1,
        upfront_costs_ees: 1,
        payroll_schedule: 1,
        trade_license_number: 1,
        vat_number: 1,
        place_of_reg: 1,
        unique_code: 1,
        created_by: 1,
        updated_by: 1,
        created_date: 1,
        updated_date: 1,
        monthly_costs: 1,
        monthly_costs_ees: 1,
        total_costs_ees: 1,
        total_costs_des: 1
      }
    }
  ];

  try {
    const companies = await Companies.aggregate(pipeline);
    console.log(companies, 'the result');
    if (!companies || companies.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
    }

    return companies;
  } catch (error) {
    console.error('Error in companyExptendedDetailsOnId:', error);
    throw error;
  }
};

//Pagination Get all Companies
const paginationForCompanies = async (page, limit) => {
  const companies = await Companies.find();
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  if (companies == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companiesResult;
};

//Get the counts of total companies, Active Companies, inactive companies and the companies Registerd today
const countsOfDifferentCompanies = async () => {
  const customersCount = await Companies.aggregate([
    {
      $group: {
        _id: null,
        total_customers: { $sum: 1 },
        active_customers: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'active'] },
              then: 1,
              else: 0
            }
          }
        },
        inactive_customers: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'inactive'] },
              then: 1,
              else: 0
            }
          }
        },
        new_customers_added_today: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                  { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    }
  ]);
  if (customersCount == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Data');
  }
  return customersCount;
};

const getCompaniesBetweenDatesAndStatus = async (reqBody, page, limit) => {
  const query = { is_deleted: false };
  if (reqBody.start_date && reqBody.end_date) {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    query.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
  }
  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      query.status = { $in: reqBody.status };
    } else {
      query.status = reqBody.status;
    }
  }
  const companies = await Companies.find(query);
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  if (companies.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companiesResult;
};

const listAllCompaniesDropDown = async (companyBody, page, limit) => {
  let matchStage = { is_deleted: false, }; // Only exclude 'new' if NOT an invoice filter
  if (!companyBody.isInvoiceFilter) {
    matchStage.status = { $nin: ['new'] };
  }
  if (companyBody.isInvoiceFilter) {
    matchStage.status = { $nin: ['new', 'inactive'] };
  }
  let pipeline = [
    { $match: matchStage },
    {
      $project: {
        _id: 1,
        legal_name: 1,
        company_name: 1,
        logo: 1
      }
    }
  ];
  let companies = await Companies.aggregate(pipeline);
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  if (!companies) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  return companiesResult;
};

const listOfCompaniesWithFilterAndSearch = async (reqBody, page, limit) => {
  let matchStage = { is_deleted: false };
  if (!reqBody.isInvoiceFilter) {
    matchStage.status = { $nin: ['new'] };
  }

  let pipeline = [
    {
      $match: matchStage
    },
    {
      $project: {
        _id: 1,
        logo: 1,
        company_name: 1,
        phone: 1,
        email: 1,
        createdAt: 1,
        status: 1,
        logo: 1,
        billing_address:1,
        shipping_address:1,
        monthly_costs:1,
        monthly_costs_ees:1,
        chargeableMonthlyCostDEES: {
          $round: [
            {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: { $objectToArray: '$monthly_costs' },
                      as: 'costItem',
                      cond: {
                        $and: [
                          { $ne: ['$$costItem.k', 'employee_salary'] }, // Exclude employee_salary key
                          { $ne: ['$$costItem.v', 'As Actuals'] }, // Exclude "As Actuals" text
                          { $ne: ['$$costItem.v', null] }, // Exclude null values
                          { $ne: ['$$costItem.v', ''] } // Exclude empty strings
                        ]
                      }
                    }
                  },
                  as: 'filteredCost',
                  in: {
                    $convert: {
                      input: '$$filteredCost.v',
                      to: 'double',
                      onError: 0,
                      onNull: 0
                    }
                  }
                }
              }
            },
            2
          ]
        },
        chargeableMonthlyCostEES: {
          $round: [
            {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: { $objectToArray: '$monthly_costs_ees' },
                      as: 'eesItem',
                      cond: {
                        $and: [
                          { $ne: ['$$eesItem.k', 'employee_salary'] }, // Exclude employee_salary key
                          { $ne: ['$$eesItem.v', 'As Actuals'] }, // Exclude "As Actuals" text
                          { $ne: ['$$eesItem.v', null] }, // Exclude null values
                          { $ne: ['$$eesItem.v', ''] } // Exclude empty strings
                        ]
                      }
                    }
                  },
                  as: 'filteredEes',
                  in: {
                    $convert: {
                      input: '$$filteredEes.v',
                      to: 'double',
                      onError: 0,
                      onNull: 0
                    }
                  }
                }
              }
            },
            2
          ]
        }
      }
    }
  ];
  if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    if (Array.isArray(reqBody.status)) {
      pipeline.push({ $match: { status: { $in: reqBody.status } } });
    } else {
      pipeline.push({ $match: { status: reqBody.status } });
    }
  }
  if (reqBody.start_date && reqBody.end_date) {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    pipeline.push({
      $match: {
        createdAt: { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) }
      }
    });
  }
  if (reqBody.search) {
    const searchRegex = new RegExp(reqBody.search, 'i');
    pipeline.push({
      $match: {
        $or: [{ company_name: searchRegex }]
      }
    });
  }
  let companies = await Companies.aggregate(pipeline);
  if (!companies) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Companies');
  }
  let companiesResult = pagination(companies, page, limit, ['company_name', '_id']);
  return companiesResult;
};

const listOfCompaniesStatus = async (query, reqBody) => {
  const distinctStatuses = await Companies.distinct('status').exec();
  return distinctStatuses;
};

const getAllCompanyRequiredField = async (reqBody, query) => {
  const aggregationStages = [{ $sort: { _id: -1 } }];
  if (query?.skip) aggregationStages.push({ $skip: parseInt(query.skip) });
  if (query?.limit) aggregationStages.push({ $limit: parseInt(query.limit) });
  aggregationStages.push({ $project: reqBody });
  const company = await Companies.aggregate(aggregationStages);
  if (!company || company.length === 0) {
    return { message: 'Unable to Get the Data', data: [] };
  }
  return { message: 'Success', data: company };
};

/**
 * Function to generate excel report for companies on the system
 * Unlike the users implementation, This function generates an exel dirrectly, and returns a link to download
 */

const exportClientData = async () => {
  try {
    // Step 1: Fetch data (pipeline remains the same)
    const pipeline = [
      {
        $match: { is_deleted: false }
      },
      {
        $project: {
          legal_name: 1,
          company_name: 1,
          registration_number: 1,
          phone: 1,
          company_phone: 1,
          email: 1,
          company_email: 1,
          company_address: 1,
          country: 1,
          business_industry: 1,
          type_of_business: 1,
          no_of_employees: 1,
          website: 1,
          status: 1,
          trade_license_number: 1,
          vat_number: 1,
          place_of_reg: 1,
          contact_persons: 1,
          upfront_costs: 1,
          upfront_costs_ees: 1,
          payroll_schedule: 1,
          monthly_costs: 1,
          monthly_costs_ees: 1,
          bank_details: 1
        }
      }
    ];
    const companies = await Companies.aggregate(pipeline);
    // Step 2: Initialize workbook
    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('PEO-CENTRAL Clients Report');

    // Step 3: Define columns with split fields for upfront costs and monthly costs
    sheet.columns = [
      { header: 'Legal Name', key: 'legal_name', width: 45 },
      { header: 'Company Name', key: 'company_name', width: 45 },
      { header: 'Registration Number', key: 'registration_number', width: 20, alignment: { horizontal: 'right' } },
      { header: 'Phone', key: 'phone', width: 20, alignment: { horizontal: 'right' } },
      { header: 'Company Phone', key: 'company_phone', width: 15, alignment: { horizontal: 'right' } },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Company Email', key: 'company_email', width: 30, alignment: {horizontal: 'right'} },
      { header: 'Address', key: 'company_address', width: 30, alignment: { horizontal: 'right' } },
      { header: 'Country', key: 'country', width: 15, alignment: {horizontal: 'right'} },
      { header: 'Business Industry', key: 'business_industry', width: 20 },
      { header: 'Type of Business', key: 'type_of_business', width: 20 },
      { header: 'No. of Employees', key: 'no_of_employees', width: 10 },
      { header: 'Website', key: 'website', width: 25 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Trade License Number', key: 'trade_license_number', width: 20 },
      { header: 'VAT Number', key: 'vat_number', width: 15 },
      { header: 'Place of Registration', key: 'place_of_reg', width: 20 },
      // Split Payroll Schedule fields
      { header: 'Salary Payment Date', key: 'salary_payment_date', width: 20 },
      { header: 'Payment Due Notification', key: 'payment_due_notification', width: 20 },
      { header: 'Invoice Date', key: 'invoice_date', width: 20 },
        // Split Bank Details fields
        { header: 'Bank Name', key: 'bank_name', width: 20 },
        { header: 'Account Number', key: 'account_number', width: 20 },
        { header: 'IBAN', key: 'iban', width: 25 },
        { header: 'Payment Mode', key: 'payment_mode', width: 20 },
      // ... previous basic columns ...
      { header: 'Contact Person Name', key: 'contact_person_name', width: 32 },
      { header: 'Contact Person Email', key: 'contact_person_email', width: 38 },
      { header: 'Contact Person Phone', key: 'contact_person_phone', width: 20 },
      { header: 'Contact Person Designation', key: 'contact_person_designation', width: 32 },
      // Upfront costs columns
      { header: 'Upfront Costs - Employment Visa', key: 'upfront_costs_employment_visa', width: 30 },
      { header: 'Upfront Costs - Emiritisation Cost', key: 'upfront_costs_emiritisation', width: 30 },
      { header: 'Upfront Costs - Medical Insurance', key: 'upfront_costs_medical_insurance', width: 30 },
      { header: 'Upfront Costs - Security Deposit', key: 'upfront_costs_security_deposit', width: 30 },
      { header: 'Upfront Costs - Employee Statutory Benefits', key: 'upfront_costs_statutory_benefits', width: 30 },
      { header: 'Upfront Costs - Employment Visa Renewal', key: 'upfront_costs_visa_renewal', width: 30 },
      // Monthly costs columns
      { header: 'Monthly Costs - Monthly Salary', key: 'monthly_costs_salary', width: 30 },
      { header: 'Monthly Costs - Nathan & Nathan Service Fee', key: 'monthly_costs_service_fee', width: 30 }
    ];

    // ... header styling remains the same ...
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };


    const applyStylesToRow = (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    };

    applyStylesToRow(headerRow);
    // Step 4: Add data rows with transformed data
    for (const company of companies) {
      const employeeCount = await Users.countDocuments({ company_id: company._id, user_status:{$in:['active','onboarding','offboarding','new visa peocess']} });

      // Extract other details as before
      const payrollSchedule = company.payroll_schedule || {};
      const bankDetails = Array.isArray(company.bank_details) ? company.bank_details[0] || {} : (company.bank_details || {});
      const contactPerson = Array.isArray(company.contact_persons) ? company.contact_persons[0] || {} : (company.contact_persons || {});

      // Extract upfront costs and monthly costs into separate fields
      const upfrontCosts = company.upfront_costs || {};
      const monthlyCosts = company.monthly_costs || {};

      // Format the data
      const formattedData = {
        ...company,
        no_of_employees: employeeCount,
        salary_payment_date: payrollSchedule.salary_payment_date?.display || '',
        payment_due_notification: payrollSchedule.payment_due_notification?.display || '',
        invoice_date: payrollSchedule.invoice_date?.display || '',
        bank_name: bankDetails.bank_name || '',
        account_number: bankDetails.account_number || '',
        iban: bankDetails.iban || '',
        payment_mode: bankDetails.salary_payment_mode || '',
        contact_person_name: contactPerson.name || '',
        contact_person_phone: contactPerson.phone || '',
        contact_person_email: contactPerson.email || '',
        contact_person_designation: contactPerson.designation || '',
        // Upfront costs fields
        upfront_costs_employment_visa: upfrontCosts.Employment_Visa || '',
        upfront_costs_emiritisation: upfrontCosts.Emiritisation_Cost || '',
        upfront_costs_medical_insurance: upfrontCosts.Medical_Insurance || '',
        upfront_costs_security_deposit: upfrontCosts.Security_Deposit || '',
        upfront_costs_statutory_benefits: upfrontCosts.Employee_Statutory_Benefits || '',
        upfront_costs_visa_renewal: upfrontCosts.Employment_Visa_Renewal || '',
        // Monthly costs fields
        monthly_costs_salary: monthlyCosts['Monthly Salary'] || '',
        monthly_costs_service_fee: monthlyCosts['Nathan & Nathan Service Fee'] || ''
      };

      sheet.addRow(formattedData);
    }

    // Step 5: Export file
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(`Failed to export client data: ${error}`);
  }
};
/**
 *===============================================================================================================
 * This is a one-time function to update company details
 * This function was necessay because invoice creation faills at instances where these details
 * are not found in DB
 * It can be commented out if not needed
 * ===============================================================================================================
 */
const insertTestDataForCompanyMissingFields = async () => {
  try {
    const systemCompanies = await Companies.find({ is_deleted: false });

    for (let company of systemCompanies) {
      if (!company?.website || company.website === '' || company.website === undefined) {
        company.website = 'https://testwebsite.com';
      }
      if (!company?.email || company.email === '' || company.email === undefined) {
        company.email = 'test@gmail.com';
      }
      if (!company?.registration_number || company.registration_number === '' || company.registration_number === undefined) {
        company.registration_number = '23456789090987';
      }
      if (!company?.company_email) {
        company.company_email = 'test@gmail.com';
      }
      if (!company?.legal_name || company.legal_name === '' || company.legal_name === undefined) {
        company.legal_name = ' ';
      }
      if (!company?.phone || company.phone === '' || company.phone === undefined) {
        company.phone = '+234444444444';
      }
      if (!company?.company_phone || company.company_phone === '' || company.company_phone === undefined) {
        company.company_phone = '+234444444444';
      }

      console.log('i got', company.company_email, 'here');
      await company.save();
    }

    return systemCompanies;
  } catch (error) {
    console.log(error);
    console.log(error.message);
    throw new Error(error);
  }
};

const generateUniqueCompanyCodes = async () => {
  try {
    // Unset all existing unique codes for companies that are not deleted
    await Companies.updateMany(
      { is_deleted: false },
      { $unset: { unique_code: "" } }
    );
    console.log('Unset all existing unique codes for companies with is_deleted: false');

    // Get the companies without unique_code and are not deleted
    const companies = await Companies.find(
      { unique_code: { $exists: false }, is_deleted: false },
      { company_name: 1 }
    );

    let lastSeq = 0;

    let count =0;
    for (const company of companies) {
      // Get the first two letters of the company name
      count+=1;
      const prefix = company.company_name
        .trim()
        .replace(/[^a-zA-Z]/g, '')  // Remove non-letters
        .toUpperCase()
        .slice(0, 3);

      // Increment sequence
      lastSeq++;

      // Format sequence as 3 digits with leading zeros
      const sequence = String(lastSeq).padStart(3, '0');

      // Create unique code
      const uniqueCode = `${prefix}-${sequence}`;

      // Update company with new code using atomic operation
      await Companies.updateOne(
        { _id: company._id },
        { $set: { unique_code: uniqueCode } },
        {new : true}
      );
      console.log(`${count} Updated unique code for ${company.company_name} to -------> ${uniqueCode}`);
    }

    console.log('Successfully generated new unique codes for all companies');
  } catch (error) {
    console.error('Error generating unique codes:', error);
    throw error;
  }
};



module.exports = {
  createCompany,
  updateCompaniesOnId,
  listAllCompanies,
  companyById,
  deleteCompany,
  listAllCompaniesWithRequiredFields,
  companyExptendedDetailsOnId,
  paginationForCompanies,
  countsOfDifferentCompanies,
  updateUpdatedBy,
  updateCreatedBy,
  companiesOnStatus,
  getCompaniesBetweenDatesAndStatus,
  listOfAllCompanyNamesWithTheirIDs,
  listAllCompaniesDropDown,
  listOfCompaniesWithFilterAndSearch,
  listOfCompaniesStatus,
  listAllCompaniesAndTheirPayrollSchedule,
  listAllCompaniesAndTheirPayrollScheduleOnID,
  getAllCompanyRequiredField,
  UpdateCompanyContacts,
  insertTestDataForCompanyMissingFields,
  getCompanyById,
  exportClientData,
  generateUniqueCompanyCodes,
  generateCompanyReferenceNumbers,
  fetchCompanyEmails,
  fetchCompaniesByIds,
  paginatedCompanyList
};
