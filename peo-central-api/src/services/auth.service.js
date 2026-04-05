const httpStatus = require('http-status');
const tokenService = require('./token.service');
const usersService = require('./users.service');
const { ObjectId } = require("mongodb");
const { Token, emailTemplate, Users  } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
// const {clientService } = require("./index");
const graphService = require('./generic.service');
const bcrypt = require('bcryptjs');
const emailTemplateService = require('./email_template.service');
const emailService = require('./email.service')
const { sendRawEmail} = require('../middlewares/email')

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await usersService.getUserByEmail(email);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  const authorized = await user.isPasswordMatch(password);
  if (!authorized) {
    incrementLoginAttempt(user);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    // const user = await usersService.getUserById(ObjectId(refreshTokenDoc.user));
    const user = await Users.findById(ObjectId(refreshTokenDoc.user))
    if (!user) {
      throw new Error();
    }
    // await refreshTokenDoc.remove();
    // Check if the refresh token has expired
    if (new Date() > refreshTokenDoc.expires) {
      await refreshTokenDoc.remove();
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token expired');
    }

    return tokenService.generateAuthTokens(user);

  } catch (error) {
    // throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword, isClient = true) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await usersService.getUserById(ObjectId(resetPasswordTokenDoc.user));
    if (!user) {
      throw new Error('User not found. Invalid token!');
    }
    let resetPasswordassword = await bcrypt.hash(newPassword, 8)
    // await usersService.updateUserOnId(user.id, { password: resetPasswordassword });
    const updatedUser =await Users.findByIdAndUpdate(user._id, {$set:{password: resetPasswordassword}});
    if (!updatedUser) throw new Error('Could not update user password')
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

const adminPasswordReset = async (userId, authenticatedUserId, newPassword, sendEmail = false) => {
  const isUser = await usersService.getUserById(userId);
  if (!isUser) throw new Error(`Could not find user with the provided id ${userId}`);
  isUser.password = newPassword;
  isUser.updated_by = authenticatedUserId;
  await isUser.save();
  // optionally notify employee if send email is true
  if (sendEmail) {
    await emailService.sendAdminPasswordResetEmail(isUser.email, newPassword);
  }
  return true
}
/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  // try {
  //   const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
  //   const user = await clientService.getClientById(verifyEmailTokenDoc.user);
  //   if (!user) {
  //     throw new Error();
  //   }
  //   await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });

  //   await clientService.updateClientById(user.id, { isEmailVerified: true });

  // } catch (error) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  // }
};

const outlookSignIn = async (project) => {
  try {
    const scopes = project.outlookScopes || 'https://graph.microsoft.com/.default';
    const urlParameters = {
      scopes: scopes.split(','),
      redirectUri: process.env.OAUTH_RED222IRECT_URI
    };

    const authUrl = await req.app.locals
      .msalClient.getAuthCodeUrl(urlParameters);

    return authUrl;
  } catch(error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication Failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  outlookSignIn,
  adminPasswordReset
};
