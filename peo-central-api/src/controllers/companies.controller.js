const httpStatus = require('http-status');
const { companiesService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require('../services');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require('../services');


const paginatedCompanyList = catchAsync(async(req, res)=>{
  try{
    const response = await companiesService.paginatedCompanyList(req.query);
     res.status(httpStatus.OK).send(response);
  }catch(error){
    console.log(error);
    res.status(400).json({ message: 'Failed to fetch companies. Please Check the Input', details: error?.message });
  }
})
const fetchCompaniesByIds = catchAsync(async (req, res) => {
  try {
    const response = await companiesService.fetchCompaniesByIds(req.body);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Failed to fetch Company. Please Check the Input', details: error?.message });
  }
})

const fetchCompanyEmails = catchAsync(async (req, res) => {
  try {
    const response = await companiesService.fetchCompanyEmails(req.params.email, req);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Failed to fetch Company. Please Check the Input', details: error?.message });
  }
})

const createCompany = catchAsync(async (req, res) => {
  try {
    const company = await companiesService.createCompany(req.body, req?.userId);
    const created_by = await companiesService.updateCreatedBy(company._id, req.userId);
    const logMessage = logCompanyCreation(req.userId, company);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      company._id,
      'companies',
      {},
      company,
      {},
      logMessage
    );
    const logString = logger.info(
      `${req.userName} Created a Company with name ${company.company_name} and ID ${company._id}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.CREATED).send(company);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Faliled to Create a Company, encountered following error => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Company. Please Check the Input', details: error?.message });
  }
});

function logCompanyCreation(userId, company) {
  const logMsg = `User ${userId} Created Company ${company._id}`;
  return logMsg;
}

const updateCompaniesOnId = catchAsync(async (req, res) => {
  try {
    const existingCompanybyID = await companiesService.companyById(req.params.companyId);
    const updatedCompany = await companiesService.updateCompaniesOnId(req.params.companyId, req.body);
    const updatedBy = await companiesService.updateUpdatedBy(req.params.companyId, req.userId);
    const updatedFields = diff(existingCompanybyID.toJSON(), updatedCompany.toJSON());
    const logMessage = logCompanyUpdates(req.userId, existingCompanybyID, updatedCompany, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.companyId,
      'companies',
      existingCompanybyID,
      updatedCompany,
      updatedFields,
      logMessage
    );
    if (!updatedCompany) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot update Company');
    }
    const logString = logger.info(
      `${req.userName} Updated Company with name ${updatedCompany.company_name} and CompanyID - ${req.params.companyId}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(updatedCompany);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update a Company with CompanyID ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Company. Please Check the Input', details: error?.message });
  }
});

const ContactUpdates = catchAsync(async (req, res) => {
  try {
    const company = await companiesService.UpdateCompanyContacts(req.params.companyId, req.body);
    if (!company) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot to Update Contact');
    }
    const logString = logger.info(`${req.userName} Accessed All Companies`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(company);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Access All Companies, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Companies', details: error });
  }
});

function logCompanyUpdates(userId, oldDoc, updatedCompany, updatedFields) {
  const logMsg = `User ${userId} updated Company ${updatedCompany._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedCompany[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const listAllCompanies = catchAsync(async (req, res) => {
  try {
    const company = await companiesService.listAllCompanies(req.query);
    if (!company) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch all Companies');
    }
    const logString = logger.info(`${req.userName} Accessed All Companies`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(company);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Access All Companies, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Companies', details: error });
  }
});

const companiesById = catchAsync(async (req, res) => {
  try {
    const companies = await companiesService.companyById(req.params.companyId);
    if (!companies) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch companies');
    }
    const logString = logger.info(`${req.userName} Accessed Companies with following CompanyID - ${req.params.companyId}`)
      .transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Companies with CompanyID ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Companies for the Given ID', details: error });
  }
});

const companiesOnStatus = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const companies = await companiesService.companiesOnStatus(req.params.status, page, limit);
    if (!companies) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Companies');
    }
    const logString = logger.info(`${req.userName} Accessed Companies with Status - ${req.params.status}`).transports[0]
      .logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Companies with Status ${req.params.status}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Companies for the Given Status', details: error });
  }
});

const deleteCompany = catchAsync(async (req, res) => {
  try {
    const existingCompanybyID = await companiesService.companyById(req.params.companyId);
    const updatedCompanies = await companiesService.deleteCompany(req.params.companyId);
    const updatedBy = await companiesService.updateUpdatedBy(req.params.companyId, req.userId);
    const logMessage = logCompanyDeletion(req.userId, updatedCompanies);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.companyId,
      'companies',
      existingCompanybyID,
      {},
      {},
      logMessage
    );
    if (!updatedCompanies) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete companies');
    }
    const logString = logger.info(
      `${req.userName} Deleted Company with name ${updatedCompanies.company_name} and CompanyID - ${req.params.companyId}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(updatedCompanies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete Company with CompanyID - ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete Companies for the Given ID', details: error });
  }
});

function logCompanyDeletion(userId, updatedCompanies) {
  const logMsg = `User ${userId} Deleted Company ${updatedCompanies._id}`;
  return logMsg;
}

const listAllCompaniesWithRequiredFields = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const companies = await companiesService.listAllCompaniesWithRequiredFields(page, limit);
    if (!companies) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch Companies');
    }
    const logString = logger.info(`${req.userName} Accessed List of All Companies`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access List of All Companies, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the required Data', details: error });
  }
});

const companyExptendedDetailsOnId = catchAsync(async (req, res) => {
  try {
    const companies = await companiesService.companyExptendedDetailsOnId(req.params.companyId);
    if (!companies) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch companies');
    }
    const logString = logger.info(
      `${req.userName} Accessed List of All Extended Company Details On CompanyID - ${req.params.companyId}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access List of All Extended Company Details On CompanyID - ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the required Data', details: error });
  }
});

const paginationForCompanies = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const companies = await companiesService.paginationForCompanies(page, limit);
    if (!companies) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch Companies');
    }
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    res.status(400).json({ message: 'Unable to Fetch the Data', details: error });
  }
});

const countsOfDifferentCustomers = catchAsync(async (req, res) => {
  try {
    const companiesCount = await companiesService.countsOfDifferentCompanies();
    const logString = logger.info(`${req.userName} Fetched the Counts of Companies`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companiesCount);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Fetch the Counts of the Companies, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the Counts', details: error });
  }
});

const getCompaniesBetweenDatesAndStatus = catchAsync(async (req, res) => {
  const body = JSON.stringify(req.body);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const companies = await companiesService.getCompaniesBetweenDatesAndStatus(req.body, page, limit);
    const logString = logger.info(`${req.userName} Accessed Companies by filtering on Dates / Status - ${body}`)
      .transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Companies by filtering on Dates / Status - ${body}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(500).json({ message: 'No Data available for the given Filter' });
  }
});

const listOfAllCompanyNamesWithTheirIDs = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const companies = await companiesService.listOfAllCompanyNamesWithTheirIDs(page, limit);
    if (!companies) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Companies');
    }
    const logString = logger.info(`${req.userName} Accessed Companies All Company Names`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Companies Names, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Companies All Companies Names', details: error });
  }
});

const listAllCompaniesDropDown = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10000;
    const companies = await companiesService.listAllCompaniesDropDown(req.body, page, limit);
    if (!companies) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch Companies');
    }
    const logString = logger.info(`${req.userName} Accessed List of All Companies Drop Down`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access List of All Companies Drop Down, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the required Data', details: error });
  }
});

const listOfCompaniesWithFilterAndSearch = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const companies = await companiesService.listOfCompaniesWithFilterAndSearch(req.body, page, limit);
    if (!companies) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the list of Companies');
    }
    const logString = logger.info(`${req.userName} Accessed list of All Companies`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(companies);f
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Access the list of Companies`).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to Access the list of Companies' });
  }
});

const listOfCompaniesStatus = catchAsync(async (req, res) => {
  try {
    const result = await companiesService.listOfCompaniesStatus(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Companies `).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Companies, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('companies', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Companies ', details: error });
  }
});

const getAllCompanyRequiredField = catchAsync(async (req, res) => {
  try {
    const result = await companiesService.getAllCompanyRequiredField(req?.body, req?.query);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Get Company Details', error });
  }
});

/**
 * =========================================================================================================================
 * 
 * This is a one-time function to update company details
 * This function was necessay because invoice creation faills at instances where these details
 * are not found in DB
 * It can be commented out if not needed
 * 
 * =========================================================================================================================
 */
const insertTestDataForCompanyMissingFields = catchAsync(async (req, res) => {
  try {
    const result = await companiesService.insertTestDataForCompanyMissingFields();
    res.status(httpStatus.OK).json( result );
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update company details', error });
  }
})

const exportClientData = catchAsync(async(req, res)=>{
  try{
    const buffer = await companiesService.exportClientData();
    const logString = logger.info(`${req.userName} Accessed the export clients data functionality`).transports[0]
    .logString;
  await loggerService.createLogger('users', req.userId, logString);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=clients_report.xlsx');
  res.send(buffer);
  }catch(error){
    console.log(error);
    const logString = logger.error(
      `${req.userName} Failed to extract clients data ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(error);
  }
});

/*
 * Function to update company codes
 * This implementation is necessary as some companies did not have unique codes
 * The feature uses database-side generation of codes which makes it efficient
 */
const generateUniqueCompanyCodes = catchAsync(async(req, res)=>{
  try{
    const response = await companiesService.generateUniqueCompanyCodes();
    res.status(httpStatus.OK).json(response);
  }catch(error){
    throw new Error(error);
  }
});

const generateCompanyReferenceNumbers = catchAsync(async(req, res)=>{
  try{
    const response = await companiesService.generateCompanyReferenceNumbers();
    res.status(httpStatus.OK).json(response);
  }catch(error){
    throw new Error(error);
  }
});

module.exports = {
  exportClientData,
  createCompany,
  updateCompaniesOnId,
  listAllCompanies,
  companiesById,
  deleteCompany,
  listAllCompaniesWithRequiredFields,
  companyExptendedDetailsOnId,
  paginationForCompanies,
  countsOfDifferentCustomers,
  companiesOnStatus,
  getCompaniesBetweenDatesAndStatus,
  listOfAllCompanyNamesWithTheirIDs,
  listAllCompaniesDropDown,
  listOfCompaniesWithFilterAndSearch,
  listOfCompaniesStatus,
  getAllCompanyRequiredField,
  ContactUpdates,
  insertTestDataForCompanyMissingFields,
  generateUniqueCompanyCodes,
  generateCompanyReferenceNumbers,
  fetchCompanyEmails,
  fetchCompaniesByIds,
  paginatedCompanyList
};
