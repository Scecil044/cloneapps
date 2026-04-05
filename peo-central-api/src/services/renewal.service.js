const { ObjectId } = require("mongodb");
const { Onboardings } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const pagination = require('../middlewares/paginate');


const getRenewals = async (companyId, page, limit) => {

    let match = {
        "is_deleted": false
    }

    if (companyId) {
        match = {
            "is_deleted": false,
            "company_id": companyId
        }
    }

    const onboardings = await Onboardings.find(match)
    let onboardingsResult = pagination(onboardings, page, limit, ["_id"]);

    if (onboardings === []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Onboardings")
    }
    return onboardingsResult
}


module.exports = {
    getRenewals,
}