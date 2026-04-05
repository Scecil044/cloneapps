const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { azureService } = require("../services")


const login = catchAsync(async (req, res) => {
    let url = await azureService.redirectToMSLoginPage()
    res.send({ loginURL: url })
})

const callback = catchAsync(async (req, res) => {
    let response = await azureService.getTokenFromAuthCode(req.body)
    let idToken = await azureService.authenticateUser(response.account.username, response.accessToken, response.idToken, response.account)
    if (idToken == null) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Cannot find account.")
    }
    let redirect = `${process.env.ADMIN_URL}?idToken=${idToken}`
    res.redirect(redirect)
})

const authorize = catchAsync(async (req, res) => {
    const idToken = req.body.idToken
    let response = await azureService.authorizeUser(idToken)
    if (response === null) {
        res.status(401).json({ success: false, message: 'Unauthorized / No user found.', data: [] });
    }
    res.status(200).json({ success: true, message: 'Success', data: response });
})


module.exports = {
    login,
    callback,
    authorize
}