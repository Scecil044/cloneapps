const { ObjectId } = require("mongodb");
const {Access} = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');

const createAccess = async (accessBody) => {
    let newAccess = new Access(accessBody)
    return await newAccess.save()
}

const updateAccess = async (accessId, updateBody)=>{
    updateBody.$addToSet = {};
    if (updateBody.authorize_roles) {
        updateBody.$addToSet.authorize_roles = updateBody.authorize_roles;
    }
    if (updateBody.authorize_users) {
        updateBody.$addToSet.authorize_users = updateBody.authorize_users;
    }
    if (updateBody.unauthorize_users) {
        updateBody.$addToSet.unauthorize_users = updateBody.unauthorize_users;
    }
    delete updateBody.authorize_roles;
    delete updateBody.authorize_users;
    delete updateBody.unauthorize_users;
    return await Access.findByIdAndUpdate({"_id":ObjectId(accessId)}, updateBody, {new:true})
}



  const updateUpdatedBy = async (accessId, userId) => {
    return Access.findOneAndUpdate({ _id: accessId }, { $set: { updated_by: userId } });
  }

  const updateCreatedBy = async (accessId, userId) => {
    return Access.findOneAndUpdate({ _id: accessId }, { $set: { created_by: userId } });
  } 

  const listAllAccess = async () =>{
    const access = await Access.find({is_deleted:false});
    if(access === []){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot find Access")
    }
    return access
}

const listofAccessById = async (accessId)=>{
    let access = await Access.findById({"_id":ObjectId(accessId)})
    if(!access){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot find Access")
    }
    return access
}

const listofAccessByModule = async (module) => {
    const access = await Access.findOne({ module });
    if (access === []) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Module")
    }
    return access
  }

  const deleteAccess = async (accessId) =>{
    let access = await Access.findByIdAndUpdate({"_id":ObjectId(accessId)},{is_deleted:true})
    if(!access){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot delete Access")
    }
    return access
}

module.exports = {
    createAccess,
    updateAccess,
    updateUpdatedBy,
    updateCreatedBy,
    listAllAccess,
    listofAccessById,
    listofAccessByModule,
    deleteAccess
}