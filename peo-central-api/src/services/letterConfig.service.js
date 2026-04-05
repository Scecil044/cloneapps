const { ObjectId } = require('mongodb');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { letterConfigModel, Companies } = require('../models');
const AWS = require('aws-sdk');

AWS.config.update({
  // accessKeyId: process.env.SECRET_ID_AWS,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1'
});

const s3 = new AWS.S3();
// Used in the Process Flow

// Create a new
const createLetterConfiguration = async reqBody => {
  const letter = new letterConfigModel({
    ...reqBody
  });
  return await letter.save();
};

// Update letter Requests AWS File
const updateLetterRequests = async (companyID, letterRequest) => {
  // console.log('running first insert on s3 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: process.env.BUCKET_NAME,
        Key: 'LetterRequests/' + companyID + '.json',
        Body: JSON.stringify(letterRequest)
      },
      function (err, data) {
        if (err) reject(err);
        else resolve(data);
        console.log(data, 'data');
      }
    );
  });
};

// Update letter Key Hints AWS File
const updateLetterKeyHints = async (companyID, letterKeyHint) => {
  // console.log('running second insert on s3 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: process.env.BUCKET_NAME,
        Key: 'LetterKeyHints/' + companyID + '.json',
        Body: JSON.stringify(letterKeyHint)
      },
      function (err, data) {
        if (err) reject(err);
        else resolve(data);
      }
    );
  });
};
// Update a letter Config on ID
const updateLetterConfigOnCompanyId = async (company_ID, updateBody) => {
  console.log('uploading to s3 starting here');
  if (!updateBody || !company_ID) throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide valid data');

  if (updateBody.letterRequest) await updateLetterRequests(company_ID, updateBody.letterRequest);
  if (updateBody.letterKeyHint) await updateLetterKeyHints(company_ID, updateBody.letterKeyHint);
  return {
    message: 'Successfully updated letter config',
    data: updateBody
  };
};

const letterConfigById = async company_ID => {
  let config = await letterConfigModel.findOne({ company_ID: ObjectId(company_ID) });
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find config');
  }
  return config;
};

const listLetterRequestsbyCompanyID = async reqBody => {
  try {
    const { company_ID } = reqBody;
    console.log(company_ID, 'is the company id in contention 444');
    if (!company_ID) throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find config');

    if (company_ID !== 'All') {
      console.log('the condition is not set to all');
      return new Promise((resolve, reject) => {
        s3.getObject({ Bucket: process.env.BUCKET_NAME, Key: `LetterRequests/${company_ID}.json` }, function (err, data) {
          if (err) {
            console.log('Error in fetching letter requests', err?.message);
            reject(err?.message);
          } else {
            resolve(JSON.parse(data.Body.toString('utf-8')));
          }
        });
      });
    } else {
      console.log('executing else condition for distinct company ids');
      // Remove the company_ID from the request body
      delete reqBody.company_ID;
      // Fetch all companies
      const allCompanies = await Companies.distinct('_id');
      console.log(allCompanies, 'this is the array of distinct company ids');
      // Create promises for fetching letter requests for all companies
      return allCompanies.map(
        companyID =>
          new Promise((resolve, reject) => {
            s3.getObject({ Bucket: process.env.BUCKET_NAME, Key: `LetterRequests/${companyID}.json` }, function (err, data) {
              if (err) {
                console.log(`Error in fetching letter requests for company ${companyID}`, err);
                resolve(null); // Resolve with null to indicate an error for this company
              } else {
                resolve(JSON.parse(data.Body.toString('utf-8')));
              }
            });
          })
      );
      // Run all promises and group all documents in one array
      //return promises;
      /*const results = await Promise.all(promises);
            const allLetterRequests = results.filter(request => request !== null);  // Filter out any null results
            return allLetterRequests;*/
    }
  } catch (err) {
    console.log(err);
    return { message: err.message, data: {} };
  }
};

const listLetterConfigbyCompanyID = async (reqBody) => {
  try {
    // console.log('running function to get letter config by company id');
    const { company_ID, letterRequest, letterKeyHint } = reqBody;
    // console.log(company_ID, 'printed id for company')
    if (!company_ID) throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find config');
    let letterRequestPromise = Promise.resolve(undefined);
    let letterKeyHintPromise = Promise.resolve(undefined);
    if (letterRequest == 1) {
      if (company_ID === 'All') {
        letterRequestPromise = await listLetterRequestsbyCompanyID(reqBody);
        let letterRequests = await Promise.all(letterRequestPromise);
        letterRequests = letterRequests.filter(request => request !== null).flat();
        if (reqBody.category) {
          letterRequests = letterRequests.filter(item => item.category.includes(reqBody.category));
        }
        return { data: { letterRequest: letterRequests }, message: 'Successfully fetched letter config' };
      } else {
        letterRequestPromise = listLetterRequestsbyCompanyID(reqBody);
        if (reqBody.category) {
          letterRequestPromise = letterRequestPromise.then(obj =>
            obj.filter(item => item.category.includes(reqBody.category))
          );
        }
      }
    }
    if (letterKeyHint == 1) letterKeyHintPromise = listLetterKeyHintsByCompanyID(reqBody);
    const [letterRequestObj, letterKeyHintObj] = await Promise.all([letterRequestPromise, letterKeyHintPromise]);

    return {
      data:
        company_ID === 'All'
          ? { letterRequest: letterRequestObj }
          : { letterRequest: letterRequestObj, letterKeyHint: letterKeyHintObj },
      message: 'Successfully fetched letter config'
    };
  } catch (err) {
    return { message: err.message, data: {} };
  }
};

const listLetterKeyHintsByCompanyID = async (reqBody) => {
  try {
    const { company_ID } = reqBody;
    if (!company_ID) throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find config');
    else if (company_ID != 'All') {
      return new Promise((resolve, reject) => {
        s3.getObject({ Bucket: process.env.BUCKET_NAME, Key: `LetterKeyHints/${company_ID}.json` }, function (err, data) {
          if (err) reject({});
          else resolve(JSON.parse(data.Body.toString('utf-8')));
        });
      });
    } else {
      return { message: 'Please select a company or use /getLetterConfigBackup.', data: {} };
    }
  } catch (err) {
    console.log(err);
    return { message: err.message, data: {} };
  }
};

const listrequestTypeforCompany_ID = async (reqBody, options) => {
  let pipeline = [
    {
      $match: {
        company_ID: ObjectId(reqBody.company_ID)
      }
    },
    {
      $project: {
        letterRequest: 1
      }
    },
    {
      $unwind: '$letterRequest'
    },
    {
      $project: {
        'letterRequest.letterDescription.requestType': 1,
        'letterRequest.letterDescription.requestSubType': 1
      }
    }
  ];
  console.log(pipeline);
  const letters = await letterConfigModel.aggregate(pipeline);
  if (letters.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find letter Configuration');
  }
  return letters;
};

const listRequestContent = async (reqBody, options) => {
  let pipeline = [
    {
      $match: {
        company_ID: ObjectId(reqBody.company_ID)
      }
    },
    {
      $project: {
        letterRequest: 1
      }
    },
    {
      $unwind: '$letterRequest'
    },
    {
      $match: {
        'letterRequest.letterDescription.requestType': reqBody.requestType,
        'letterRequest.letterDescription.requestSubType': reqBody.requestSubType
      }
    },
    {
      $project: {
        'letterRequest.content': 1,
        'letterRequest.contentbefore': 1
      }
    }
  ];
  const letters = await letterConfigModel.aggregate(pipeline);
  if (letters.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find letter Configuration');
  }
  return letters;
};

const getLetterRequestByTypes = async function (companyId, requestType, requestSubType) {
  let letterTypes = await listLetterRequestsbyCompanyID({ company_ID: companyId });
  const filteredType = letterTypes.filter(
    item => item.letterDescription.requestType == requestType && item.letterDescription.requestSubType == requestSubType
  );
  let config = [{ _id: new ObjectId(), letterRequest: filteredType }];
  return config;
};

const getLetterRequestTypesAndLetterKeys = async reqBody => {
  try {
    const { company_ID, isMobile } = reqBody;
    if (!company_ID) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find config');
    } else {
      const data = await listLetterConfigbyCompanyID({ company_ID, letterRequest: 1, letterKeyHint: 1 });

      if (isMobile)
        data.data.letterRequest = (data.data.letterRequest || []).map(item => {
          const { letterKeys } = item;
          item.letterKeys = (letterKeys || []).map(sub => {
            const { type, selector_values } = sub;
            if (type === 'Select') sub.selector_values = selector_values.replace(/\n/g, '').replace(/\t/g, '');
            return sub;
          });
          return item;
        });
      return data;
    }
  } catch (err) {
    console.log(err);
    return { message: err.message, data: {} };
  }
};

module.exports = {
  createLetterConfiguration,
  updateLetterConfigOnCompanyId,
  listLetterConfigbyCompanyID,
  listRequestContent,
  listrequestTypeforCompany_ID,
  letterConfigById,
  getLetterRequestByTypes,
  getLetterRequestTypesAndLetterKeys,
  listLetterRequestsbyCompanyID
};
