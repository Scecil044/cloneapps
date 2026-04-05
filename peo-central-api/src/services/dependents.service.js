const { Dependent } = require("../models");
const {ObjectId} = require("mongodb");
const ApiError = require('../utils/ApiError');
const  createNewDependent = async(reqBody, userId)=>{
    try{
        reqBody = {...reqBody, createdBy: userId}
        const newDependent = await Dependent.create(reqBody);
        return newDependent
    }catch(error){
        throw error
    }
};

const filterDependents = async (reqQuery) => {
    try {
        const searchFilter = reqQuery.search
            ? {
                $or: [
                    { first_name: { $regex: reqQuery.search, $options: "i" } },
                    { last_name: { $regex: reqQuery.search, $options: "i" } },
                    { middle_name: { $regex: reqQuery.search, $options: "i" } }
                ]
            }
            : {};

        const options = {
            page: parseInt(reqQuery.page, 10) || 1,
            limit: parseInt(reqQuery.limit, 10) || 30,
            sortBy: reqQuery.sortBy || "createdAt",
        };

        const body = [
            {
                $addFields: {
                    principalObjectId: { $toObjectId: "$principal_id" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "principalObjectId", 
                    foreignField: "_id",
                    as: "principalDetails",
                },
            },
            {
                $unwind: {
                    path: "$principalDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: reqQuery.search
                    ? {
                        $or: [
                            { "principalDetails.first_name": { $regex: reqQuery.search, $options: "i" } },
                            { "principalDetails.last_name": { $regex: reqQuery.search, $options: "i" } },
                            { "principalDetails.email": { $regex: reqQuery.search, $options: "i" } },
                            ...searchFilter.$or,
                        ],
                    }
                    : {},
            },
            {
                $project: {
                    principal_id: 1,
                    first_name: 1,
                    last_name: 1,
                    middle_name: 1,
                    "principalDetails.first_name": 1,
                    "principalDetails.last_name": 1,
                    "principalDetails.middle_name": {$ifNull: ["$principalDetails.middle_name", ""]},
                    "principalDetails.email": 1,
                    "principalDetails.image_url": 1,
                    personal: 1,
                    attachments: 1,
                    documents: 1,
                    email: 1,
                    image_url: 1,
                    relation_to_principal: 1,
                },
            },
        ];

        const response = await Dependent.paginateLookup({}, options, body);
        return response;
    } catch (error) {
        throw error;
    }
};



const  updateDependent = async(dependentId, reqBody, userId)=>{
    try{
        const isDependent = await Dependent.findById(dependentId);
        if(!isDependent){
            throw new ApiError(httpStatus.NOT_FOUND, 'Dependent not found');
        }
        const updates = Object.keys(reqBody);
        updates.forEach((update) => (isDependent[update] = reqBody[update]));
        isDependent.updatedBy = userId;
        await isDependent.save();
        return isDependent
    }catch(error){
        throw error
    }
};

const  deleteDependent = async(dependentId, reqBody, userId)=>{
    try{
        const isDependent = await Dependent.findById(dependentId);
        if(!isDependent){
            throw new ApiError(httpStatus.NOT_FOUND, 'Dependent not found');
        } if(reqBody.reason_for_deletion.trim() !== ""){
            isDependent.reason_for_deletion = reqBody.reason_for_deletion
        }
        isDependent.is_deleted = true;
        isDependent.updatedBy = userId;
        await isDependent.save();
        return isDependent
    }catch(error){
        throw error
    }
};

module.exports = {
    createNewDependent,
    filterDependents,
    updateDependent,
    deleteDependent
}