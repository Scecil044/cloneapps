const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/loggers');
const { loggerService, payslipsService } = require("../services");

const getUserPayslipByID = catchAsync(async (req, res) => {
    try {
        const { id, company_id } = req.params;
        const data = await payslipsService.getUserPayslipByIDService(id, company_id)
        const logString = (logger.info(`${req.userName} Fetch user pay slip by user ID-${id} company ID- ${company_id}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(httpStatus.OK).send({success : true, data, message: "Success"});
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to fetch user pay slip by user ID-${id} company ID- ${company_id}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(400).send(error);
    }
});

const getUserPayslipByMonth = catchAsync(async (req, res) => {
    try {
        const { month } = req.params;
        const options = req.query.limit && req.query.page ? { limit: req.query.limit || 10, page: req.query.page || 1 } : {}
        const data = await payslipsService.getUserPayslipByMonthService(month, company_id, options)
        if(!data || data.length <= 0) {
            res.status(httpStatus.OK).json({success: true, message: 'No Data Found.', data: []});
        }
        const logString = (logger.info(`${req.userName} Fetch user pay slip by month-${month} company ID- ${company_id}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(httpStatus.OK).send({success: true, message: "Success", data});
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to fetch user pay slip by month-${month} company ID- ${company_id}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(400).send(error);
    }
});

const getUserPayslipByMonthAndCompany = catchAsync(async (req, res) => {
    try {
        const { month, company_id } = req.params;
        const options = { limit: req.query.limit || 10, page: req.query.page || 1 }
        const data = await payslipsService.getUserPayslipByMonthAndCompanyService(month, company_id, options)
        const logString = (logger.info(`${req.userName} Fetch user pay slip by month-${month} company ID- ${company_id}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(httpStatus.OK).send({success: true, data, message: "Success"});
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to fetch user pay slip by month-${month} company ID- ${company_id}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(400).send(error);
    }
});

const getPayslipURL = catchAsync(async (req, res) => {
  const { payslipId } = req.params
  try {
      const result = await payslipsService.getPayslipURL(payslipId)
      const logString = (logger.info(`GET PaySlip URL`)).transports[0].logString;
      await loggerService.createLogger('payslips', req.userId, logString);
      res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data })
  } catch (error) {
      console.log("ERROR ---------- ", error);
      const logString = (logger.error(`Failed to get PaySlip URL, encountered following error => ${error}`)).transports[0].logString;
      await loggerService.createLogger('payslips', req.userId, logString);
      res.status(400).json({ success: false, message: 'Failed to Get PaySlip URL', error })
  }
})

const sendEmail = catchAsync(async (req, res) => {
  try {
      const result = await payslipsService.sendEmail(req.body)
      const logString = (logger.info(`Send Email`)).transports[0].logString;
      await loggerService.createLogger('payslips', req.userId, logString);
      res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data })
  } catch (error) {
      console.log("ERROR ---------- ", error);
      const logString = (logger.error(`Failed to send Email, encountered following error => ${error}`)).transports[0].logString;
      await loggerService.createLogger('payslips', req.userId, logString);
      res.status(400).json({ success: false, message: 'Failed to send Email', error })
  }
})


const getPaySlips = catchAsync(async (req, res) => {
    try {
        const result = await payslipsService.allCompanyPaySlips(req.params.company_id)
        const logString = (logger.info(`get Company wise PaySlips`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result })
    } catch (error) {
        console.log("ERROR ---------- ", error);
        const logString = (logger.error(`Failed to get Company PaySlips, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to send Email', error })
    }
  })


  const getPaySlipsMonthly = catchAsync(async (req, res) => {
    try {
        const result = await payslipsService.MonthlyPaySlips(req.params.company_id)
        const logString = (logger.info(`get Company wise PaySlips`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result })
    } catch (error) {
        console.log("ERROR ---------- ", error);
        const logString = (logger.error(`Failed to get Company PaySlips, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to send Email', error })
    }
  })


  const AllPayslipsForUser = catchAsync(async (req, res) => {
    try {
        console.log(req.params.userId , "req.params.userId")
        const result = await payslipsService.UserPaySlipsAll(req.params.userId)
        const logString = (logger.info(`Failed to All Payslips for user,`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result })
    } catch (error) {
        console.log("ERROR ---------- ", error);
        const logString = (logger.error(`Failed to All Payslips for user, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payslips', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to send Email', error })
    }  
  })




module.exports = {
    getUserPayslipByID,
    getUserPayslipByMonth,
    getUserPayslipByMonthAndCompany,
    getPayslipURL,
    sendEmail, 
    getPaySlips, 
    getPaySlipsMonthly, 
    AllPayslipsForUser
}
