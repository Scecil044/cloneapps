const { Users } = require('../models');
const logger = require('../middlewares/logger');

function authorizeRoleUserAndUnauth(roles = [], usersEmail = [], unauthEmail = []) {
    return [
        async (req, res, next) => {
            if (typeof roles === 'string') {
                roles = [roles];
            }
            if (typeof usersEmail === 'string') {
                usersEmail = [usersEmail];
            }
            if (typeof unauthEmail === 'string') {
                unauthEmail = [unauthEmail];
            }
            const url = `${req.protocol}://${req.hostname}${req.originalUrl}`;
            const accessURL = `${req.method} ${url}`;
            const user = await Users.findById(req.userId).select(['first_name', 'email']).exec();
            if ((roles.length && !roles.includes(req.roleName) && !usersEmail.includes(user.email)) || (unauthEmail.includes(user.email))) {
                logger.error(`${user.first_name} is Unauthorized. Access Denied (${accessURL}). (userID ${req.userId})`);
                return res.status(401).json({ message: 'Unauthorized' });
            }
            logger.info(`${user.first_name} is Authorized (Role Access). Access Granted (${accessURL}). (userID ${req.userId})`);
            next();
        }
    ];
}

module.exports = {
    authorizeRoleUserAndUnauth
};