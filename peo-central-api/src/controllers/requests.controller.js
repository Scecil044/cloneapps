const httpStatus = require('http-status');
const { requestsService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/loggers');
const { Users, Requests } = require('../models');
const { loggerService } = require('../services');

/* Count of each requests */
const getRequestsCount = catchAsync(async (req, res) => {
  try {
    const count = await requestsService.getRequestsCount(
      req.body.userType,
      req.body.user_id,
      req.body.company_id,
      req.body.date
    );
    const logString = logger.info(
      `Fetched requests count for userType: ${req.body.userType}, user_id: ${req.body.user_id}, company_id: ${req.body.company_id}, date: ${req.body.date}`
    ).transports[0].logString;
    await loggerService.createLogger('getRequestsCount', req.userId, logString);

    res.status(httpStatus.CREATED).send(count);
  } catch (error) {
    const logString = logger.error(`Failed to fetch requests count, encountered error: ${error}`).transports[0].logString;
    await loggerService.createLogger('getRequestsCount', req.userId, logString);

    res.status(400).json({ message: 'Failed to get Count. Please try again later.', details: error });
  }
});

const upcomingRequests = catchAsync(async (req, res) => {
  try {
    const data = await requestsService.upcomingRequests(req.body.leave_type);

    const logString = logger.info(`Fetched upcoming requests for leave_type: ${req.body.leave_type}`).transports[0]
      .logString;
    await loggerService.createLogger('upcomingRequests', req.userId, logString);

    res.status(200).json({ success: true, message: 'Success', data });
  } catch (error) {
    const logString = logger.error(`Failed to fetch upcoming requests, encountered error: ${error}`).transports[0].logString;
    await loggerService.createLogger('upcomingRequests', req.userId, logString);

    res
      .status(400)
      .json({ message: 'Unable to get Upcoming requests. Please try again later.', data: [], details: error.message });
  }
});

const getRequestUsersInfo = catchAsync(async (req, res) => {
  try {
    const data = await requestsService.getRequestUsersInfo(req.body);

    const logString = logger.info(`Fetched request users info`).transports[0].logString;
    await loggerService.createLogger('getRequestUsersInfo', req.userId, logString);

    res.status(200).json({ success: true, message: 'Success', data });
  } catch (error) {
    const logString = logger.error(`Failed to fetch request users info, encountered error: ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('getRequestUsersInfo', req.userId, logString);

    res
      .status(400)
      .json({ message: 'Unable to get Requests info. Please try again later.', data: [], details: error.message });
  }
});

const getAllRequest = catchAsync(async (req, res) => {
  try {
    const data = await requestsService.getAllRequest(req.body);
    if (!data) {
      const logString = logger.warn(`No requests found`).transports[0].logString;
      await loggerService.createLogger('getAllRequest', req.userId, logString);

      res.status(httpStatus.OK).json({ message: 'No Data Found.', data: [] });
    } else {
      const logString = logger.info(`Fetched all requests`).transports[0].logString;
      await loggerService.createLogger('getAllRequest', req.userId, logString);

      res.status(httpStatus.OK).json({ success: true, message: 'Success', data });
    }
  } catch (error) {
    console.log(error)
    const logString = logger.error(`Failed to fetch all requests, encountered error: ${error}`).transports[0].logString;
    await loggerService.createLogger('getAllRequest', req.userId, logString);

    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Unable to get Requests. Please try again later', data: [], details: error.message });
  }
});

// /leaves/department/ in requests
const getRequestsByDepartment = catchAsync(async (req, res) => {
  try {
    let dept = req.params.dept;
    let reqType = req.body.request_type;
    let monthYear = req.query.monthYear || null;
    const data = await requestsService.getRequestsByDepartment(req.body, dept, monthYear, reqType);
    const logString = logger.info(`Fetched Leave Request`).transports[0].logString;
    await loggerService.createLogger('leave_request', req.userId, logString);
    if (!data) {
      res.status(httpStatus.OK).json({ message: 'No Data Found.', data: [] });
    } else res.status(httpStatus.OK).json({ success: true, message: 'Success', data });
  } catch (error) {
    console.log(error, 'ERROR');
    const logString = logger.error(`Failed to fetch Leave Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('leave_request', req.userId, logString);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Unable to get Requests. Please try again later', data: [], details: error.message });
  }
});

const getPayrollReportCountByCompanyId = catchAsync(async (req, res) => {
  const id = req.params.company_id;
  const pay_month = req.params.pay_month;
  try {
    const data = await requestsService.getPayrollReportCountByCompanyId(id, pay_month);
    if (!data) {
      const logString = logger.warn(`No payroll report found for company_id: ${id}, pay_month: ${pay_month}`).transports[0]
        .logString;
      await loggerService.createLogger('getPayrollReportCountByCompanyId', req.userId, logString);

      res.status(httpStatus.OK).json({ message: 'No Data Found.', data: [] });
    } else {
      const logString = logger.info(`Fetched payroll report count for company_id: ${id}, pay_month: ${pay_month}`)
        .transports[0].logString;
      await loggerService.createLogger('getPayrollReportCountByCompanyId', req.userId, logString);

      res.status(httpStatus.OK).json({ success: true, message: 'Success', data });
    }
  } catch (error) {
    const logString = logger.error(
      `Failed to fetch payroll report count for company_id: ${id}, pay_month: ${pay_month}, encountered error: ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('getPayrollReportCountByCompanyId', req.userId, logString);

    console.log(error, 'ERROR');
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Unable to get Leaves for user. Please try again later', data: [], details: error.message });
  }
});

const userRequest = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.userRequest(req?.params?.userId, req?.query, req?.body);
    const logString = logger.info(`User Requests`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to get Users Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to get Users Request. Please Check the Input', error });
  }
});

const getAllRequestsAndSpecificRequests = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.getAllRequestsAndSpecificRequests(req?.body, req?.query);
    const logString = logger.info(`Get Requests`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to get Request, encountered following error => ${error}`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to get Request. Please Check the Input', error });
  }
});

const getAllRequestCountsOnDate = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.getAllRequestCountsOnDate(req?.body);
    const logString = logger.info(`Get Requests Counts`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to get Request Counts, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to get Request Counts. Please Check the Input', error });
  }
});

const getAllPendingRequestCounts = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.getAllPendingRequestCounts(req?.body);
    const logString = logger.info(`Get Pending Requests Counts`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to get pending Request Counts, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to get pending Request Counts. Please Check the Input', error });
  }
});

const getRequestCountsOnUserId = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.getRequestCountsOnUserId(req?.params?.userId, req?.body);
    const logString = logger.info(`Get Requests Counts on UserID`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Get Requests Counts on UserID, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res
      .status(200)
      .json({ success: false, message: 'Failed to Get Requests Counts on UserID. Please Check the Input', error });
  }
});

const getLeaveAndWfhHistory = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.getLeaveAndWfhHistory(req?.body);
    const logString = logger.info(`Get Leave/WFH History`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Get Leave/WFH History, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Get Leave/WFH History. Please Check the Input', error });
  }
});

const getEachLeaveCountWeekly = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.getEachLeaveCountWeekly(
      req?.body.month,
      req?.body.request_type,
      req?.body.letterType
    );
    const logString = logger.info(`Get Each Leave Count Weekly`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Get Each Leave Count Weekly, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res
      .status(200)
      .json({ success: false, message: 'Failed to Get Each Leave Count Weekly. Please Check the Input', error });
  }
});

const updateRequests = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.updateRequests(req?.params?.requestId, req?.body);
    const logString = logger.info(`Request Update`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Update Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Update Request. Please Check the Input', error });
  }
});

const getRequestDetails = catchAsync(async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await requestsService.getRequestDetails(_id);
    const logString = logger.info(`Request Retrieve`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: 'Successfully retrieve details', data: result.data });
  } catch (error) {
    const logString = logger.error(`Failed to Retrieve Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Retrieve Request. Please Check the Input', error });
  }
});

const getRequestApproverDetails = catchAsync(async (req, res) => {
  const { _id } = req.params;
  try {
    const result = await requestsService.getRequestDetails(_id);
    const logString = logger.info(`Request Retrieve`).transports[0].logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: true, message: 'Successfully retrieve details', data: result.approvers });
  } catch (error) {
    const logString = logger.error(`Failed to Retrieve Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Retrieve Request. Please Check the Input', error });
  }
});

const generateReferenceNumber = catchAsync(async (req, res) => {
  try {
    const result = await requestsService.generateReferenceNumber(req?.body);
    if (result.success) {
      const logString = logger.info(`Reference number generated.`).transports[0].logString;
      await loggerService.createLogger('requests', req.userId, logString);
      res.status(200).json({ success: true, message: result.message, data: result.data });
    } else {
      const logString = logger.info(`Failed to generate reference number.`).transports[0].logString;
      await loggerService.createLogger('requests', req.userId, logString);
      res.status(200).json({ success: false, message: result.message });
    }
  } catch (error) {
    const logString = logger.error(`Failed to Retrieve Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('requests', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Retrieve Request. Please Check the Input', error });
  }
});

module.exports = {
  getRequestsCount,
  upcomingRequests,
  getRequestUsersInfo,
  getAllRequest,
  getRequestsByDepartment,
  getPayrollReportCountByCompanyId,
  userRequest,
  getAllRequestsAndSpecificRequests,
  getAllRequestCountsOnDate,
  getAllPendingRequestCounts,
  getRequestCountsOnUserId,
  getLeaveAndWfhHistory,
  updateRequests,
  getRequestDetails,
  getRequestApproverDetails,
  getEachLeaveCountWeekly,
  generateReferenceNumber
};
