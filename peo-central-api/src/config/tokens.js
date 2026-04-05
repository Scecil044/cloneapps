const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
  UPDATE_MISSING_DETAILS: 'updateMissingDetails',
  ONBOARDING: 'onboarding'
};

const tokenTypeList = Object.values(tokenTypes);

module.exports = {
  tokenTypes,
  tokenTypeList
};
