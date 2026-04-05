const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService, clientService, otpService, graphService } = require('../services');
const { tokenTypes } = require('../config/tokens');
const ApiError = require('../utils/ApiError');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user.user, false);
  res.send({ ...user, tokens });
});

const authenticate = catchAsync(async (req, res) => {
  const result = await authService.authenticate(req.user.email);
  const tokens = await tokenService.generateAuthTokens(result.user, false);
  res.send({ ...result, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken, false);
  res.send({ tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email, false);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password, false);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { platform } = req.body;
  const user = await clientService.getClientByEmail({ email });
  // if (!user) {
  //   const otp = await otpService.createOtp(email);
  //   await emailService.sendVerificationEmail(req.user.email, otp.otp);
  // }
  res.json({ user });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const registerClient = catchAsync(async (req, res) => {
  const user = await clientService.createClient(req.body);
  const tokens = await tokenService.generateAuthTokens(user, true);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const loginClient = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUserWithEmailAndPassword(email.toLowerCase(), password);
  const tokens = await tokenService.generateAuthTokens(result.user, true);
  res.send({ ...result, tokens });
});

const authenticateClient = catchAsync(async (req, res) => {
  const result = await authService.authenticate(req.user.email);
  const tokens = await tokenService.generateAuthTokens(result.user);
  res.send({ ...result, tokens });
});

const refreshClientTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken, true);
  res.send({ tokens });
});

const resetClientPassword = catchAsync(async (req, res) => {
  try{
      // const {isAdminReset, sendEmail} = req.body
  // if (isAdminReset) {
  //   // console.log("executing admin reset ================================")
  //   await authService.adminPasswordReset(req.body.userId, req.userId, req.body.newPassword, sendEmail);
  // } else {
  //   await authService.resetPassword(req.query.token, req.body.password, true);
  // }
  await authService.resetPassword(req.query.token, req.body.password, true);
  res.status(httpStatus.OK).send({success: true, message: 'Password reset successfully'});
  }catch(error){
    throw new Error(error);
  }
});

const forgotClientPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email, true);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);

  res.status(httpStatus.OK).send({success: true, message: 'Password reset link sent to your email'});
});

const sendClientVerificationEmail = catchAsync(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const user = await clientService.getClientByEmail({ email });
  const otp = await otpService.createOtp(email);
  await emailService.sendVerificationEmail(email, otp.otp);
  res.json({ user });
});

const validatePasswordToken = catchAsync(async (req, res) => {
  const token = await tokenService.verifyToken(req.query.token, tokenTypes.RESET_PASSWORD);
  res.send(true);
});

const authenticateAdmin = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.send({ user });
});

const outlookSignIn = catchAsync(async (req, res) => {
  const authUrl = await authService.outlookSignIn(req.project);
  res.send(authUrl);
});

const outlookCallback = catchAsync(async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: req.project.outlookScopes.split(','),
    redirectUri: req.project.outlookRedirectUris.liveServer,
  };

  const response = await req.app.locals.msalClient.acquireTokenByCode(tokenRequest);

  const user = await graphService.getUserDetails(req.app.locals.msalClient, response.account.homeAccountId);

  // Add the user to user storage
  req.app.locals.users[req.session.userId] = {
    displayName: user.displayName,
    email: user.mail || user.userPrincipalName,
    timeZone: user.mailboxSettings.timeZone,
  };

  res.send(authUrl);
});

module.exports = {
  login,
  authenticate,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  registerClient,
  loginClient,
  refreshClientTokens,
  resetClientPassword,
  forgotClientPassword,
  sendClientVerificationEmail,
  validatePasswordToken,
  authenticateAdmin,
  authenticateClient,
  outlookSignIn,
  outlookCallback,
};
