const { InvoiceLog } = require('../models');
const { ObjectId } = require("mongodb");
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');

const createInvoiceLog = async (reqBody) => {
    try{
        let result = new InvoiceLog(reqBody)
    return await result.save()
    }catch(error){
        throw error
    }
}

const invoiceLogByID = async (invoiceLogId) => {
    let result = await InvoiceLog.findById({ "_id": ObjectId(invoiceLogId) })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Invoice Logs")
    }
    return result
}

const listAllInvoiceLogs = async () => {
    const result = await InvoiceLog.find({ is_deleted: false });
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Invoice Logs")
    }
    return result
}

const getInvoiceLogsByDocumentId = async (documentId) => {
    const result = await InvoiceLog.aggregate([
        {
            $match: {
                document_id: documentId,
                is_deleted: false
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { userId: '$user_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ['$_id', '$$userId'] },
                                    { $eq: [{ $toString: '$_id' }, '$$userId'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'userDetails'
            }
        },
        {
            $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                userFullName: {
                    $cond: {
                        if: { $and: ['$userDetails.first_name', '$userDetails.last_name'] },
                        then: { $concat: ['$userDetails.first_name', ' ', '$userDetails.last_name'] },
                        else: {
                            $cond: {
                                if: '$userDetails.first_name',
                                then: '$userDetails.first_name',
                                else: {
                                    $cond: {
                                        if: '$userDetails.last_name',
                                        then: '$userDetails.last_name',
                                        else: 'Unknown User'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    if (!result) {
        return [];
    }
    return result
}

const updateInvoiceLogOnId = async (invoiceLogId, updateBody) => {
    const result = await invoiceLogByID(invoiceLogId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No Invoice Log Found for the given ID');
    }
    return InvoiceLog.findOneAndUpdate({ _id: invoiceLogId }, { $set: updateBody }, { new: true });
}

const deleteInvoiceLogOnId = async (invoiceLogId) => {
    let result = await InvoiceLog.findByIdAndUpdate({ "_id": ObjectId(invoiceLogId) }, { is_deleted: true })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete Invoice Log")
    }
    return result
}

module.exports = {
    createInvoiceLog,
    invoiceLogByID,
    listAllInvoiceLogs,
    getInvoiceLogsByDocumentId,
    updateInvoiceLogOnId,
    deleteInvoiceLogOnId
}
