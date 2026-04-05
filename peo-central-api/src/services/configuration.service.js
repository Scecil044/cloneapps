const { ObjectId } = require("mongodb");
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const pagination = require('../middlewares/paginate');
const { Configurations } = require('../models');
const _ = require("lodash");

const getconfig = async () => {
  let configurations = await Configurations.find({})
  return configurations
}

const getmodules = async () => {
  let configurations = await Configurations.find({ is_deleted: false }).select({ 'modules': 1 })
  return configurations[0]
}

const getVisaSponsors = async () => {
  let configurations = await Configurations.find({ is_deleted: false }).select({ 'visa_sponsors': 1 })
  return configurations[0]
}
const getMedicalTawheehAndEidCenters = async (filter) => {
  try {
    // Define an object to hold the selected fields
    let selectFields = {};
    
    // Dynamically add the fields based on the filter
    if (filter === 'medical_centers') {
      selectFields.medical_centers = 1;
    } else if (filter === 'eid_centers') {
      selectFields.eid_centers = 1;
    } else if (filter === 'tawjeeh_centers') {
      selectFields.tawjeeh_centers = 1;
    }

    // If no filter is passed, select all three
    if (Object.keys(selectFields).length === 0) {
      selectFields = {
        medical_centers: 1,
        eid_centers: 1,
        tawjeeh_centers: 1
      };
    }

    // Query the Configurations model with the dynamically selected fields
    const configurations = await Configurations.findOne({ is_deleted: false }).select(selectFields).lean();
    if (configurations) {
      delete configurations._id;  // Remove the _id field
    }
  
    return configurations || {};
  } catch (error) {
    throw new Error(error);
  }
};

// function to update products and services on configurations
const updateProductsAndServices = async(reqBody, userId)=>{
  try{
    const systemConfig = await Configurations.findOne({ is_deleted: false });
    if(systemConfig){
      if(!systemConfig.hasOwnProperty('products_and_services') || !systemConfig.products_and_services){
        systemConfig.products_and_services = [];
      }
      await Configurations.updateOne({ _id: systemConfig._id }, { $set: { products_and_services: reqBody.products_and_services, updated_by: userId } });
    }
    return systemConfig.products_and_services;
  }catch(error){
    throw new Error(error);
  }
}



module.exports = {
  getconfig,
  getmodules,
  getVisaSponsors,
  getMedicalTawheehAndEidCenters,
  updateProductsAndServices
}