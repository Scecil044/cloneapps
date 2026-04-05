const adminRoles = require('../constants/adminRoles.constant');

const allRoles = {
  client: ['client'],
  admin: [
    adminRoles.admin,
    adminRoles.getInvoiceInputs,
    adminRoles.manageInvoiceInputs
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
