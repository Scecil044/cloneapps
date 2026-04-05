const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const usersService = require('./users.service');
const employeeService = require('./employee.service');
const { Token, Companies } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
// const { clientService } = require('./index');
const companiesService = require('./companies.service');
const {Users} = require("../models")

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (user, expires, type, secret = config.jwt.secret) => {
  console.log(user.role_ID, "now this is the role id")
  const payload = {
    _id: user._id,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
    role_id: user.role_ID
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false, isClient = true) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    isClient,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  console.log(payload, "the payload++++++++", token)
  const tokenDoc = await Token.findOne({ user: payload._id, blacklisted: false, token, type });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, isClient = true, overrideExpiryNumber = null, ignoreRefreshToken = false) => {
  let { accessExpirationMinutes } = config.jwt;
  if (overrideExpiryNumber) {
    accessExpirationMinutes = overrideExpiryNumber;
  }
  const accessTokenExpires = moment().add(accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);

  if (ignoreRefreshToken) {
    return accessToken;
  }

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, false, isClient);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email, isClient = true) => {
  const user = isClient ? await usersService.getUserByEmail(email) : await usersService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD, false, isClient);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user, isClient = false) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL, false, isClient);
  return verifyEmailToken;
};

/**
 * Get token
 * @param {ObjectId} userId
 * @param {String} type
 * @returns {Promise<string>}
 */
const getToken = async (userId, type) => {
  return Token.findOne({ user: userId, type });
};

const generateVerifyUpdateMissingDetailsToken = async (userId, isClient = true) => {
  const user = await Users.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this id');
  }
  const expires = moment().add(config.jwt.updateMissingDetailsMinutes, 'minutes');
  const updateMissingDetailsToken = generateToken(user, expires, tokenTypes.UPDATE_MISSING_DETAILS);
  const newToken = await saveToken(updateMissingDetailsToken, user._id, expires, tokenTypes.UPDATE_MISSING_DETAILS, false, isClient);
  console.log(newToken, "the new token")
  return updateMissingDetailsToken;
};


module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  getToken,
  generateVerifyUpdateMissingDetailsToken,
};
