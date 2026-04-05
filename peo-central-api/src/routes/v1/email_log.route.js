const express = require("express")
const router = express.Router()
const { emailLogController } = require("../../controllers");

router
    .route("/")
    .post(emailLogController.createEmailLog)
    .get(emailLogController.listAllEmailLog)

router
    .route("/emailid/:emailLogId")
    .get(emailLogController.getEmailLogById)

router
    .route("/:emailLogId")
    .patch(emailLogController.updateEmailLogOnId)


router
    .route("/employees/:email")
    .post(emailLogController.getUserEmailLog)

module.exports = router