const { ObjectId } = require("mongodb");
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const { payrollConfigModel } = require("../models")

// Create a new
const createpayrollConfiguration = async (reqBody) => {
            const payroll = new payrollConfigModel({
                ...reqBody
            })
    return await payroll.save()
}

const getPayrollbyCompanyID = async (company_ID) =>{
    const result =await payrollConfigModel.findOne({"company_ID": company_ID}).lean()
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'payroll Configuration Not found');
    }
    return result
}

const listallPayloadConfig = async () =>{
    const result = await payrollConfigModel.find();
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'payroll Configuration Not found');
    }
    return result
}

// Update a payroll Config on ID
const updatepayrollConfigOnCompanyId = async (company_ID, updateBody) => {
    const key_name = Object.keys(updateBody)[0]
    if (Object.keys(updateBody).length === 0) res.status(400).json({ data: updateBody, message: "Please provide valid data." })
    else {
            const config = await payrollConfigModel.findOne({ company_ID: company_ID });

            Object.assign(config, updateBody);

            await config.save();

            return config[key_name]
    }
}

// Listing based on company ID
const getPayrollConfig = async (reqBody , options) => {
    let pipeline = [{
        $match: {

        }
    }];

    if (reqBody.company_ID != "All") {
        pipeline[0].$match.company_ID = ObjectId(reqBody.company_ID)
        delete reqBody.company_ID
    } else {
        reqBody.company_ID = 1
        pipeline = []
    }

    pipeline.push({ $project: reqBody });
    const config = await payrollConfigModel.aggregate(pipeline)
    return config
}

const deletepayrollConfig = async(id)=>{
    const data = await payrollConfigModel.findByIdAndDelete({ _id: id });
}

module.exports = {
    createpayrollConfiguration,
    updatepayrollConfigOnCompanyId,
    getPayrollConfig,
    getPayrollbyCompanyID,
    listallPayloadConfig,
    deletepayrollConfig,
}



