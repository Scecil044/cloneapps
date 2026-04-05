const { ObjectId } = require("mongodb");
const httpStatus = require("http-status")
const { ClaimConfig } = require("../models")

// Create a new Company
const createClaimConfig = async (ClaimConfigBody) => {
  return await new ClaimConfig(ClaimConfigBody).save();
}


const updateClaimConfig = async (company_ID,ClaimConfigBody) => {
 const key_name = Object.keys(ClaimConfigBody)[0]
  const config = await ClaimConfig.findOne({company_ID: ObjectId(company_ID)}).lean()
  Object.assign(config, ClaimConfigBody);
  const data = await ClaimConfig.findOneAndUpdate({company_ID: ObjectId(company_ID)}, { $set: config }, { new: true }).lean()
  return data[key_name]
}


const removeByID = async (id) => {
  return await ClaimConfig.deleteOne({ _id: id });
}

const getClaimConfigData = async (body) => {
  let pipeline = [ { $match: {} } ];
  if (body.company_ID != "All") {
    pipeline[0].$match.company_ID = ObjectId(body.company_ID)
    delete body.company_ID
  } else {
    body.company_ID = 1
    pipeline = []
  }

  pipeline.push({ $project: body });
  return await ClaimConfig.aggregate(pipeline)
}




module.exports = {
  createClaimConfig,
  updateClaimConfig,
  removeByID,
  getClaimConfigData
}
