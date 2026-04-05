const { ObjectId } = require("mongodb");
const {Role} = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');

const createRole = async (roleBody) => {
    let newRole = new Role(roleBody)
    return await newRole.save()
}

const updateRole = async (roleId, updateBody)=>{
    updateBody.$addToSet = {permissions:updateBody.permissions}
    delete updateBody.permissions
    return await Role.findByIdAndUpdate({"_id":ObjectId(roleId)},updateBody,{new:true})
}

const updateUpdatedBy = async (roleId, userId) => {
    return Role.findOneAndUpdate({ _id: roleId }, { $set: { updated_by: userId } });
  }
  
  const updateCreatedBy = async (roleId, userId) => {
    return Role.findOneAndUpdate({ _id: roleId }, { $set: { created_by: userId } });
  }  

const listAllRoles = async () =>{
    const roles = await Role.find({is_deleted:false});
    if(roles.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot find Roles")
    }
    return roles
}

const roleById = async (roleId)=>{
    let role = await Role.findById({"_id":ObjectId(roleId)})
    if(!role){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot find Role")
    }
    return role
}

const deleteRole = async (roleId) =>{
    let role = await Role.findByIdAndUpdate({"_id":ObjectId(roleId)},{is_deleted:true})
    if(!role){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot delete Role")
    }
    return role
}


module.exports = {
    createRole,
    updateRole,
    listAllRoles,
    roleById,
    deleteRole,
    updateUpdatedBy,
    updateCreatedBy
}