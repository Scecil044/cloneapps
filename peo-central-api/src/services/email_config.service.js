const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { ObjectId } = require('mongodb');
const { EmailConfig } = require('../models');

// Create a new Company
const createEmailConfig = async EmailConfigBody => {
  return await new EmailConfig(EmailConfigBody).save();
};

const updateEmailConfig = async (company_ID, EmailConfigBody) => {
  const key_name = Object.keys(EmailConfigBody)[0];
  const config = await EmailConfig.findOne({ company_ID: ObjectId(company_ID) }).lean();
  if (!config) {
    if (EmailConfigBody.hasOwnProperty('templates')) {
      EmailConfigBody.key_hints = [];
    } else if (EmailConfigBody.hasOwnProperty('key_hints')) {
      EmailConfigBody.templates = [];
    }
    const result = await EmailConfig.create({ ...EmailConfigBody });
    return result[key_name];
  }

  Object.assign(config, EmailConfigBody);
  const data = await EmailConfig.findOneAndUpdate(
    { company_ID: ObjectId(company_ID) },
    { $set: config },
    { new: true }
  ).lean();
  return data[key_name];
};

const removeByID = async id => {
  return await EmailConfig.deleteOne({ _id: id });
};

const getEmailConfigData = async body => {
  let pipeline = [{ $match: {} }];
  if (body.company_ID != 'All') {
    pipeline[0].$match.company_ID = ObjectId(body.company_ID);
    delete body.company_ID;
  } else {
    body.company_ID = 1;
    pipeline = [];
  }
  pipeline.push({ $project: body });
  return await EmailConfig.aggregate(pipeline);
};

module.exports = {
  createEmailConfig,
  updateEmailConfig,
  removeByID,
  getEmailConfigData
};
