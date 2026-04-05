const jwtDecode = require('jwt-decode');
const { Role } = require('../models');
const { Users, Poc } = require('../models');
const logger = require('./logger');

async function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    logger.info(`No Token Provided`);
    return res.status(403).send({ message: 'No token provided.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwtDecode(token);
    // Check if the token is expired
    if (Date.now() >= decoded.exp * 1000) {
      logger.info(`Token Expired`);
      return res.status(401).send({ message: 'Token expired.' });
    }
    const role = await Role.findById(decoded.role_id).select('role_name').exec();
    let user;

    // Try to find user in Users table first
    user = await Users.findById(decoded._id).select('first_name last_name email').exec();

    // If not found in Users table, try Poc table
    if (!user) {
      user = await Poc.findById(decoded._id).select('name email').exec();
      if (user) {
        logger.info(`User found in Poc table: ${user.name} (${user.email})`);
      }
    } else {
      logger.info(`User found in Users table: ${user.first_name} ${user.last_name} (${user.email})`);
    }

    // If still not found, return unauthorized
    if (!user) {
      logger.info(`User not found in Users or Poc tables for ID: ${decoded._id}`);
      return res.status(401).send({ message: 'User not found.' });
    }

    req.userId = decoded._id;
    req.roleName = role.role_name;

    // Handle both Users table (first_name, last_name) and Poc table (name) formats
    req.userName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name || 'Unknown User';

    req.userEmail = user.email;

    next();
  } catch (err) {
    logger.error(`Unauthorized - ${err}`);
    return res.status(401).send({ message: 'Unauthorized.' });
  }
}

module.exports = verifyToken;
