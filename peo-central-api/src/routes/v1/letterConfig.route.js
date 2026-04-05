const express = require('express');

const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { letterConfigController } = require('../../controllers');
const { letterConfigValidation } = require('../../validations');

router
    .route("/add").all(verifyToken)
    .post(validate(letterConfigValidation.letterConfigValidate),letterConfigController.createLetterConfiguration)

router
    .route('/getLetterConfig').all(verifyToken)
    .post(letterConfigController.listLetterConfigbyCompanyID)

router
    .route('/getrequestcontent').all(verifyToken)
    .post(letterConfigController.listRequestContent)

router
    .route('/getrequesttype').all(verifyToken)
    .post(letterConfigController.listrequestTypeforCompany_ID)

router
    .route('/update/letter/config/:company_ID').all(verifyToken)
    .patch(validate(letterConfigValidation.letterConfigValidate),letterConfigController.updateLetterConfigOnCompanyId)

router
    .route('/requesttype/letterkeys').all(verifyToken)
    .post(letterConfigController.getLetterRequestTypesAndLetterKeys)
   
module.exports = router;