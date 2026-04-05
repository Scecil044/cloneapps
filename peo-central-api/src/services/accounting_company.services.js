const { AccountingCompany } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');


const createAccountingCompany = async (body) => {
  const result = await AccountingCompany.create(body);
  return { result };
};

const listAllAccountingCompanies = async () => {
    const result = await AccountingCompany.find({});
    return result
  }

module.exports = {
    createAccountingCompany,
    listAllAccountingCompanies
}