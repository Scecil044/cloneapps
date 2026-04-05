const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {accountingCompanyService} = require('../services');
const {createSubTypeCompanyAccount,createStandardCompanyAccount,createShadowCompanyAccount}=require('./account_configurator.controller');


const createAccountingCompany = catchAsync(async (req, res) => {
    const company = await accountingCompanyService.createAccountingCompany(req.body);
    if (req.body.is_parent_org){
        const user = await userService.updateUserCompanyById(req.user._id, company.company._id);
    }
    const companyPayload=company.result
    !companyPayload.city_code && (companyPayload.city_code=companyPayload.state_code)
    await createStandardCompanyAccount(companyPayload)
    await createSubTypeCompanyAccount(companyPayload)
    // await createShadowCompanyAccount(companyPayload)
    res.status(httpStatus.CREATED).send({data:company});
});

const listAllAccountingCompanies = catchAsync(async (req, res) => {
    const result = await accountingCompanyService.listAllAccountingCompanies();
    res.status(httpStatus.OK).send(result);
});

module.exports = {
    createAccountingCompany,
    listAllAccountingCompanies
}