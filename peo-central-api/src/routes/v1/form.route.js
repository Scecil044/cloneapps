const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { formController } = require("../../controllers");

router
    .route("/fillform").all(verifyToken)
    .get(formController.getFilledForm)
    .post(formController.fillForm)
    .patch(formController.updateForm)

router
    .route("/getallfields").all(verifyToken)
    .get(formController.getAllFields)

router
    .route("/all").all(verifyToken)
    .get(formController.getAllList)

router
    .route("/formdata/dropdown").all(verifyToken)
    .get(formController.getDropdownItems)

router
    .route("/").all(verifyToken)
    .get(formController.getForm)

module.exports = router
