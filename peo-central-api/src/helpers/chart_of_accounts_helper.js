const { Companies, ChartOfAccounts } = require('../models');
const chartOfAccountsService = require('../services/chart_of_accounts.service');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const createChartOfAccounts = async (session = null) => {
  const useSession = session || await mongoose.startSession();
  let isNewSession = !session;
  
  try {
    if (isNewSession) {
      useSession.startTransaction();
    }
    
    const allCompanies = await Companies.find({ is_deleted: false }).session(useSession);
    const data = await ChartOfAccounts.find({ code: 'AR' }).session(useSession);
    const count = data.length;
    const {
      account_type,
      company,
      details_type,
      name,
      _id,
      is_balance_sheet,
      account_id,
      isDebitAccount,
      trialBalanceDebitType,
      isReportValuePositive,
      city
    } = data[0];

    for (let index = 0; index < allCompanies.length; index++) {
      const currentCompany = allCompanies[index];

      // Check for duplicate Chart of Accounts based on `customer` field
      const existingAccount = await ChartOfAccounts.findOne({ customer: currentCompany._id }).session(useSession);
      if (existingAccount) {
        console.log(
          `Account for customer ${currentCompany.company_name} (${currentCompany._id}) already exists. Skipping...`
        );
        continue; // Skip this iteration if account already exists
      }
      
      // construct Chart of Accounts Object
      const accountObj = {
        name: `AR-${currentCompany.company_name}`,
        company: ObjectId(company),
        account_id: account_id + '-' + (count + index + 1).toString().padStart(3, '0'),
        account_type: account_type,
        details_type: details_type,
        base_view: true,
        description: '',
        parent_account_id: _id,
        parent_account_name: name,
        is_balance_sheet: is_balance_sheet,
        customer: currentCompany._id,
        isDebitAccount: isDebitAccount,
        trialBalanceDebitType: trialBalanceDebitType,
        isReportValuePositive: isReportValuePositive,
        is_sub: true,
        city: city,
        isNewChartOfAccount: true
      };
      
      await chartOfAccountsService.createChartOfAccounts(accountObj, useSession);
    }
    
    if (isNewSession) {
      await useSession.commitTransaction();
    }
    
    console.log('updated chart of accounts for all companies');
    return true;
  } catch (error) {
    if (isNewSession) {
      await useSession.abortTransaction();
    }
    console.log(error);
    throw new Error(error);
  } finally {
    if (isNewSession && useSession) {
      useSession.endSession();
    }
  }
};

const createChartOfAccountForCompany = async (companyId, session = null) => {
  const useSession = session || await mongoose.startSession();
  let isNewSession = !session;
  
  try {
    if (isNewSession) {
      useSession.startTransaction();
    }
    
    // Validate companyId
    if (!ObjectId.isValid(companyId)) {
      throw new Error('Invalid companyId');
    }

    // Find the company
    const company = await Companies.findOne({ _id: ObjectId(companyId), is_deleted: false }).session(useSession);
    if (!company) {
      throw new Error(`Company with ID ${companyId} not found or is deleted`);
    }

    // Find the base AR Chart of Accounts
    const data = await ChartOfAccounts.find({ code: 'AR' }).session(useSession);
    if (!data || data.length === 0) {
      throw new Error('Base AR Chart of Accounts not found');
    }

    const count = data.length;
    const {
      account_type,
      details_type,
      name,
      _id,
      is_balance_sheet,
      account_id,
      isDebitAccount,
      trialBalanceDebitType,
      isReportValuePositive,
      city
    } = data[0];

    // Check for duplicate Chart of Accounts based on `customer` field
    const existingAccount = await ChartOfAccounts.findOne({ customer: ObjectId(companyId) }).session(useSession);
    if (existingAccount) {
      console.log(`Account for customer ${company.company_name} (${companyId}) already exists. Skipping...`);
      
      if (isNewSession) {
        await useSession.commitTransaction();
      }
      
      return { message: `Account for customer ${company.company_name} already exists`, account: existingAccount };
    }

    // Construct Chart of Accounts Object
    const accountObj = {
      name: `AR-${company.company_name}`,
      company: ObjectId(company._id),
      account_id: `${account_id}-${(count + 1).toString().padStart(3, '0')}`,
      account_type,
      details_type,
      base_view: true,
      description: '',
      parent_account_id: _id,
      parent_account_name: name,
      is_balance_sheet,
      customer: ObjectId(company._id),
      isDebitAccount,
      trialBalanceDebitType,
      isReportValuePositive,
      is_sub: true,
      city,
      isNewChartOfAccount: true
    };

    // Create the Chart of Accounts
    const newAccount = await chartOfAccountsService.createChartOfAccounts(accountObj, useSession);
    console.log(`Created Chart of Accounts for company ${company.company_name} (${companyId})`);

    if (isNewSession) {
      await useSession.commitTransaction();
    }
    
    return { message: 'Chart of Accounts created successfully', account: newAccount };
  } catch (error) {
    if (isNewSession) {
      await useSession.abortTransaction();
    }
    console.error('Error creating Chart of Accounts:', error);
    throw new Error(error.message || 'Failed to create Chart of Accounts');
  } finally {
    if (isNewSession && useSession) {
      useSession.endSession();
    }
  }
};

module.exports = {
  createChartOfAccounts,
  createChartOfAccountForCompany
};