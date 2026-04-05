const express = require("express")
const router = express.Router()
// const verifyToken = require('../../middlewares/verifyToken');
const { accountingCompanyController } = require("../../controllers");

router
.route("/")
// .all(verifyToken)
.post(accountingCompanyController.createAccountingCompany)
.get(accountingCompanyController.listAllAccountingCompanies)

module.exports = router;