const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

// Middleware to check if the user's role is one of the allowed roles
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.roleName)) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Access denied'));
  }
  
  next();
};

module.exports = checkRole;
