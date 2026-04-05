const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate')
const { taxCodesController } = require("../../controllers");
const { taxCodeValidations } = require('../../validations')

router
    .route("/").all(verifyToken)
    .get(taxCodesController.listAllTaxCodes)
    .post(validate(taxCodeValidations.createTaxCode), taxCodesController.createTaxCode)

router.
    route('/:taxId')
    .all(verifyToken)
    .get(validate(taxCodeValidations.getTaxCodeById),taxCodesController.findTaxCodeById)
    .put(validate(taxCodeValidations.updateTaxCode),taxCodesController.updateTaxCode)
    .delete(validate(taxCodeValidations.deleteTaxCode),taxCodesController.deleteTaxCode)

module.exports = router