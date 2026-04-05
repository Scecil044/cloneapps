const { ObjectId } = require("mongodb");
const { EmailLog } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');

const createEmailLog = async (reqBody) => {
    let newEmailLog = new EmailLog(reqBody)
    return await newEmailLog.save()
}

const getEmailLogById = async (emailLogId) => {
    let emaillog = await EmailLog.findById({ "_id": ObjectId(emailLogId) })
    if (!emaillog) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Email Log")
    }
    return emaillog
}

const updateEmailLogOnId = async (emailLogId, updateEmailLog) => {
    const result = await getEmailLogById(emailLogId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Email Log Not found');
    }
    return EmailLog.findOneAndUpdate({ _id: emailLogId }, { $set: updateEmailLog }, { new: true });
}

const listAllEmailLog = async (page, limit) => {
    const result = await EmailLog.find({ is_deleted: false });
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Email Log")
    }
    return result
}


const getEmailDetails = async (email) => {
    const pipeline = [
        {
            $match : {
                $or: [
                    { "to": { $in : [email]}},
                    { "cc": { $in : [email]}},
                ]
            }
        },
        {
            $sort:{createdAt:-1}
        }
    ]
    const emails = await  EmailLog.aggregate(pipeline)
    return emails
}


module.exports = {
    createEmailLog,
    getEmailLogById,
    updateEmailLogOnId,
    listAllEmailLog,  
    getEmailDetails
}