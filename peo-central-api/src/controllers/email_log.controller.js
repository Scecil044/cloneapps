const httpStatus = require("http-status");
const { emailLogService } = require("../services")
const catchAsync = require("../utils/catchAsync")

const createEmailLog = catchAsync(async (req, res) => {
    try {
        const result = await emailLogService.createEmailLog(req.body)
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed create Email Log', details: error });
    }
});

const listAllEmailLog = catchAsync(async (req, res) => {
    try {
        const result = await emailLogService.listAllEmailLog()
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Email Log', details: error });
    }
});

const getEmailLogById = catchAsync(async (req, res) => {
    try {
        const result = await emailLogService.getEmailLogById(req.params.emailLogId);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Email Log for the given ID ', details: error });
    }
});

const updateEmailLogOnId = catchAsync(async (req, res) => {
    try {
        const result = await emailLogService.updateEmailLogOnId(req.params.emailLogId, req.body);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to Update Email Log for the given ID ', details: error });
    }
});


const getUserEmailLog = catchAsync(async (req, res) => {
    try {
        const result = await emailLogService.getEmailDetails(req.params.email);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        res.status(400).json({ message: 'Failed to get Email Log', details: error });
    }
});

module.exports = {
    createEmailLog,
    listAllEmailLog,
    getEmailLogById,
    updateEmailLogOnId,
    getUserEmailLog
}
