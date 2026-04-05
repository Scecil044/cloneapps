const { ObjectId } = require("mongodb");
const { PayItems } = require('../models');
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const { Invoice } = require('../models');
const { toLower } = require("lodash");

const createPayItems = async (payItemBody) => {
    // let newPayItem = new PayItems(payItemBody)
    // return await newPayItem.save()
    return await PayItems.insertMany(payItemBody);
}

const payItemsById = async (payItemId) => {
    let result = await PayItems.findById({ "_id": ObjectId(payItemId) })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find PayItems")
    }
    return result
}

const updatePayItemsOnId = async (id, updateBody) => {
    const result = await payItemsById(id);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Pay Items Not found');
    }
    return PayItems.findOneAndUpdate({ _id: id }, { $set: updateBody }, { new: true });
}

const listAllPayItems = async (query) => {
    let filter = {
        is_deleted: false
    }
    let options = {
        limit: query.limit,
        page: query.page,
        sortBy: query.sortBy
    }
    const result = await PayItems.paginate(filter, options);
    if (result === []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Pay Items")
    }
    return result
}

const deletePayItemsOnId = async (id) => {
    let result = await PayItems.findByIdAndUpdate({ "_id": ObjectId(id) }, { is_deleted: true })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete Pay Items")
    }
    return result
}

const payItemsOnCompanyId = async (companyId, query) => {
    let filter = {
        "company_id": ObjectId(companyId),
        is_deleted: false
    }
    let options = {
        limit: query.limit,
        page: query.page,
        sortBy: query.sortBy
    }
    const result = await PayItems.paginate(filter, options);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Pay Items for the given Company ID")
    }
    return result
}

const payItemsOnUserId = async (userId, query) => {
    let filter = {
        "user_id": ObjectId(userId),
        is_deleted: false
    }
    let options = {
        limit: query.limit,
        page: query.page,
        sortBy: query.sortBy
    }
    const result = await PayItems.paginate(filter, options);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Pay Items for the given User ID")
    }
    return result
}

const updateUpdatedBy = async (id, userId) => {
    return PayItems.findOneAndUpdate({ _id: id }, { $set: { updated_by: userId } });
}

const updateCreatedBy = async (id, userId) => {
    return PayItems.findOneAndUpdate({ _id: id }, { $set: { created_by: userId } });
}

const listOfAllPayItemsWithTheirCompanyNameAndUserNames = async (query, reqBody) => {
    let result;
    const searchRegex = new RegExp(reqBody.search, "i");
    let filter = {
        is_deleted: false
    }
    let body = [
        {
            $lookup: {
                from: "companies",
                localField: "company_id",
                foreignField: "_id",
                as: "companyDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: '$companyDetails'
        },
        {
            $unwind: '$userDetails'
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
                user_id: 1,
                company_id: 1,
                pay_month: 1,
                type: 1,
                category: 1,
                remarks: 1,
                amount: 1,
                currency: 1,
                unpaid: 1,
                ot_type: 1,
                hours: 1,
                status: 1,
                company_name: "$companyDetails.company_name",
                company_logo: "$companyDetails.logo",
                first_name: "$userDetails.first_name",
                middle_name: "$userDetails.middle_name",
                last_name: "$userDetails.last_name",
                user_image: "$userDetails.image_url"
            },
        },
        {
            $match: {
                $or: [
                    { company_name: searchRegex },
                    { first_name: searchRegex },
                    { middle_name: searchRegex },
                    { last_name: searchRegex },
                    { type: searchRegex },
                    { category: searchRegex },
                    { remarks: searchRegex },
                    { status: searchRegex }
                ]
            }
        }
    ];
    if (reqBody.status && (reqBody.status != "" || (reqBody.status.length > 0 && reqBody.status[0] !== ""))) {
        if (Array.isArray(reqBody.status)) {
            filter.status = { $in: reqBody.status };
        } else {
            filter.status = reqBody.status;
        }
    }
    if (reqBody.start_date && reqBody.end_date && reqBody.start_date != "" && reqBody.end_date != "") {
        const endDate = new Date(reqBody.end_date);
        endDate.setDate(endDate.getDate() + 1);
        filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) }
    }
    if (reqBody.company_id && ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== "") || reqBody.company_id != "")) {
        if (Array.isArray(reqBody.company_id)) {
            let compID = reqBody.company_id.map(id => ObjectId(id));
            filter.company_id = { $in: compID }
        } else {
            filter.company_id = ObjectId(reqBody.company_id);
        }
    }
    if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== "") || reqBody.user_id != "")) {
        if (Array.isArray(reqBody.user_id)) {
            let usrID = reqBody.user_id.map(id => ObjectId(id));
            filter.user_id = { $in: usrID }
        } else {
            filter.user_id = ObjectId(reqBody.user_id);
        }
    }
    let options = {
        limit: query.limit,
        page: query.page,
        sortBy: query.sortBy
    }
    result = await PayItems.paginateLookup(filter, options, body);
    return result
}

const getPayItemsAndInvoiceDataOnInvoiceID = async (invoiceId) => {
    const invoice = await Invoice.findById(invoiceId);
    const payItms = await PayItems.find({ invoice_id: ObjectId(invoiceId) });
    if ((toLower(invoice.type) === "payroll invoice") && (payItms.length > 0)) {
        let pipeline = [
            {
                $match: {
                    invoice_id: ObjectId(invoiceId)
                }
            },
            {
                $lookup: {
                    from: "invoices",
                    localField: "invoice_id",
                    foreignField: "_id",
                    as: "invoiceDetails"
                }
            },
            {
                $unwind: "$invoiceDetails"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $group: {
                    _id: "$invoice_id",
                    invoiceData: { $first: "$invoiceDetails" }, // Include all fields of the invoiceDetails
                    additionsOrDeductions: {
                        $push: {
                            user_id: "$user_id",
                            first_name: "$userDetails.first_name",
                            middle_name: "$userDetails.middle_name",
                            last_name: "$userDetails.last_name",
                            email: "$userDetails.email",
                            company_id: "$company_id",
                            pay_month: "$pay_month",
                            type: "$type",
                            category: "$category",
                            remarks: "$remarks",
                            amount: "$amount",
                            currency: "$currency",
                            unpaid: "$unpaid",
                            ot_type: "$ot_type",
                            hours: "$hours",
                            invoice_id: "$invoice_id",
                            status: "$status",
                            createdAt: "$createdAt",
                            created_by: "$created_by"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    invoiceData: 1,
                    additionsOrDeductions: 1
                }
            }
        ];
        const result = await PayItems.aggregate(pipeline);
        return result[0] || null;
    } else {
        return { invoiceData: invoice }
    }
};

const listOfInvoicesInPayitems = async (query, reqBody, page, limit) => {
    const disctinctInvoices = await PayItems.distinct('invoice_id').exec();
    let invoiceData = [];

    // Calculate the starting index based on the page and limit
    const startIndex = (page - 1) * limit;
    // Calculate the ending index
    const endIndex = page * limit;

    const invoiceDetailsList = disctinctInvoices.slice(startIndex, endIndex).map(async (data) => {
        const invoice = await Invoice.findById({ _id: ObjectId(data) });
        invoiceData.push({
            invoice_number: invoice.invoice_number,
            customer: invoice.customer,
            customer_name: invoice.customer_name,
            email: invoice.email,
            status: invoice.status
        });
    });

    await Promise.all(invoiceDetailsList);

    return invoiceData;
};

module.exports = {
    createPayItems,
    payItemsById,
    updatePayItemsOnId,
    listAllPayItems,
    deletePayItemsOnId,
    payItemsOnCompanyId,
    payItemsOnUserId,
    updateUpdatedBy,
    updateCreatedBy,
    listOfAllPayItemsWithTheirCompanyNameAndUserNames,
    getPayItemsAndInvoiceDataOnInvoiceID,
    listOfInvoicesInPayitems
}