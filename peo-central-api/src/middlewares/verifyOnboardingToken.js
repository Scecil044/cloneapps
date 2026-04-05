const jwtDecode = require('jwt-decode');
const logger = require('./logger');

async function verifyOnboardingToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    logger.info(`No Onboarding Token Provided`);
    return res.status(403).send({ message: 'No token provided.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwtDecode(token);
    
    // Check if the token is expired
    if (Date.now() >= decoded.exp * 1000) {
      logger.info(`Onboarding Token Expired`);
      return res.status(401).send({ message: 'Token expired.' });
    }

    // Verify this is an onboarding token
    if (decoded.type !== 'onboarding') {
      logger.info(`Invalid token type: ${decoded.type}`);
      return res.status(401).send({ message: 'Invalid token type. Onboarding token required.' });
    }

    // Set onboarding-specific request properties
    req.userId = decoded._id; // Company ID
    req.companyId = decoded._id; // Company ID  
    req.userName = decoded.company_name;
    req.roleName = 'onboarding';
    req.userEmail = null; // No email for company tokens
    req.isOnboardingToken = true; // Flag to identify onboarding tokens
    
    next()
  } catch (err) {
    logger.error(`Unauthorized Onboarding Token - ${err}`);
    return res.status(401).send({ message: 'Unauthorized.' });
  }
}

module.exports = verifyOnboardingToken;

