const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { companiesValidation } = require('../../validations');
const { companiesController } = require('../../controllers');
const { Companies } = require('../../models');
const CompaniesModel = require('../../models/companies.model');
const ChartOfAccounts = require('../../models/chart_of_accounts.model');
const chartOfAccountsService = require('../../services/chart_of_accounts.service')

router.post('/BulkUpdate', async (req, res) => {
  try {
    const AllCompanies = await Companies.find();

    for (let index = 0; index < AllCompanies.length; index++) {
      const element = AllCompanies[index];

      const letterDetail = {
        companyLogo: [],
        footerImage: [],
        companyStamp: [],
        waterMark: [],
        companyLogoLink: 'https://nathanhroperations.s3.eu-central-1.amazonaws.com/companies/NN%20Full%20Logo.png',
        headerImageLink: 'https://nn-hr-extra.s3.eu-central-1.amazonaws.com/hr-direct/header.png',
        footerImageLink: 'https://nathanhroperations.s3.eu-central-1.amazonaws.com/companies/Footer%20Image.png',
        companyStampLink: 'https://nathanhroperations.s3.eu-central-1.amazonaws.com/Company%20Stamp.png',
        waterMarkLink: 'https://amap-nathanhr.s3.eu-central-1.amazonaws.com/companies/amap_watermark.png',
        websiteUrl: 'https://hrdirect-staging.devnhr.com',
        leftSideBarLink: 'https://theaimes-nathanhr.s3.eu-central-1.amazonaws.com/Theaimes-FZ-side.png',
        rightSideBarLink: 'https://theaimes-nathanhr.s3.eu-central-1.amazonaws.com/Theaimes-FZ-side.png',
        signatureLink:
          'https://docib.s3.amazonaws.com/users/undefined%20undefined/HR%27s%20Signature%20%28Osama%20El%20Din%29.jpg',
      };

      const Update  = await Companies.updateOne({_id : element._id} , {$set : { "letterDetail" : letterDetail}})
      console.log(Update, "Update")

      // res.json('Updated');
    }
  } catch (error) {
    console.log(error.message);
  }
});

// temporary route to create chart of accounts for all companies without these
router.post('/updateChartOfAccounts', async (req, res)=> {
 try {
  const allCompanies = await Companies.find({is_deleted: false});
  const data = await ChartOfAccounts.find({ code: "AR" });
  const count = data.length;
  const { account_type, company, details_type, name, _id, is_balance_sheet, account_id, isDebitAccount, trialBalanceDebitType, isReportValuePositive, city } = data[0];

  for (let index = 0; index < allCompanies.length; index++) {
    const currentCompany = allCompanies[index];

       // Check for duplicate Chart of Accounts based on `customer` field
       const existingAccount = await ChartOfAccounts.findOne({ customer: currentCompany._id });
       if (existingAccount) {
           console.log(`Account for customer ${currentCompany.company_name} (${currentCompany._id}) already exists. Skipping...`);
           continue; // Skip this iteration if account already exists
       }
      // construct Chart of Accounts Object

  const accountObj = {
    name: `AR-${currentCompany.company_name}`,
    company: ObjectId(company),
    account_id: account_id + "-" + (count + index + 1).toString().padStart(3, "0"),
    account_type: account_type,
    details_type: details_type,
    base_view: true,
    description: "",
    parent_account_id: _id,
    parent_account_name: name,
    is_balance_sheet: is_balance_sheet,
    customer: currentCompany._id,
    isDebitAccount: isDebitAccount,
    trialBalanceDebitType: trialBalanceDebitType,
    isReportValuePositive: isReportValuePositive,
    is_sub: true,
    city: city,
    isNewChartOfAccount: true,
  }
  await chartOfAccountsService.createChartOfAccounts(accountObj)
  };
  res.status(200).json({message: "updated chart of accounts for all companies"});
 } catch (error) {
  console.log(error);
  res.status(500).json({message:"could not update chart of accounts for all companies", error});
 }

});

router.route('/export/data').get(verifyToken, companiesController.exportClientData);

router
  .route('/')
  .all(verifyToken)
  .post(validate(companiesValidation.createCompany), companiesController.createCompany)
  .get(companiesController.listAllCompanies);

router
  .route('/comp/:companyId')
  .all(verifyToken)
  .get(validate(companiesValidation.companiesById), companiesController.companiesById);

router
  .route('/:companyId')
  .all(verifyToken)
  .patch(companiesController.updateCompaniesOnId)
  .delete(validate(companiesValidation.companiesById), companiesController.deleteCompany);


router
  .route('/contact_update/:companyId')
  .all(verifyToken)
  .put(companiesController.ContactUpdates)

router.route('/listall').all(verifyToken).get(companiesController.listAllCompanies);

router.route('/paginated/list').all(verifyToken).get(companiesController.paginatedCompanyList);

router.route('/all_companies_required_fields').all(verifyToken).get(companiesController.listAllCompaniesWithRequiredFields);

router.route('/all/pagination').all(verifyToken).get(companiesController.paginationForCompanies);

router
  .route('/detailsonid/:companyId')
  .all(verifyToken)
  .get(validate(companiesValidation.companiesById), companiesController.companyExptendedDetailsOnId);

router.route('/status/:status').all(verifyToken).get(companiesController.companiesOnStatus);

router.route('/by/ids').all(verifyToken).post(companiesController.fetchCompaniesByIds);

router.route('/counts/all').all(verifyToken).get(companiesController.countsOfDifferentCustomers);

router.route('/emails/:email').all(verifyToken).get(companiesController.fetchCompanyEmails);

router.route('/filter/dates/status').all(verifyToken).post(companiesController.getCompaniesBetweenDatesAndStatus);

router.route('/names/all').all(verifyToken).post(companiesController.listOfAllCompanyNamesWithTheirIDs);

router.route('/list/dropdown').all(verifyToken).post(companiesController.listAllCompaniesDropDown);

router.route('/list/filter/search').all(verifyToken).post(companiesController.listOfCompaniesWithFilterAndSearch);

router.route('/status/list').all(verifyToken).post(companiesController.listOfCompaniesStatus);
router
    .route('/all/companies_req_fields').all(verifyToken)
    .post(companiesController.getAllCompanyRequiredField)

router.get('/all', async (req, res) => {
  try {
    const companies = await CompaniesModel.find();
    res.json(companies);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.route('/update/missing/details').all(verifyToken).put(companiesController.insertTestDataForCompanyMissingFields);
router.route('/update/unique/codes').put(verifyToken, companiesController.generateUniqueCompanyCodes);
router.route('/update/unique/reference/numbers').put(verifyToken, companiesController.generateCompanyReferenceNumbers);
module.exports = router;
