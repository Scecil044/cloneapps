const express = require("express")
const validate = require('../../middlewares/validate');

const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { msGraphController } = require("../../controllers");
const { msGraphValidation } = require("../../validations")

router.get("/mail/fetchEmails",validate(msGraphValidation.fetchMailListing),verifyToken,msGraphController.fetchMailListing)
router.get("/mail/getAttachments/:mail_id",validate(msGraphValidation.getMailById),verifyToken,msGraphController.getMailAttachments)
router.get("/mail/fetchEmailsFolders",verifyToken,msGraphController.fetchMailFolders)
router.get("/mail/fetchEmailsByFolder",validate(msGraphValidation.fetchEmailsByFolder),verifyToken,msGraphController.fetchEmailByFolder)
router.get("/mail/getEmailById/:mail_id",validate(msGraphValidation.getMailById),verifyToken,msGraphController.getMailById)
router.get("/mail/searchMail",validate(msGraphValidation.searchMail),verifyToken,msGraphController.searchMail)

router.post("/mail/sendMail",validate(msGraphValidation.sendMail),verifyToken,msGraphController.sendMail)
router.post("/mail/:mail_id/reply",validate(msGraphValidation.sendreplyToMail),verifyToken,msGraphController.sendreplyToMail)
router.post("/mail/:mail_id/replyAll",validate(msGraphValidation.sendReplyAll),verifyToken,msGraphController.sendReplyAll)
router.post("/mail/:mail_id/forward",validate(msGraphValidation.forwardMail),verifyToken,msGraphController.forwardMail)
router.delete("/mail/:mail_id",validate(msGraphValidation.getMailById),verifyToken,msGraphController.deleteMail)
router.patch("/mail/:mail_id",validate(msGraphValidation.getMailById),verifyToken,msGraphController.markEmailAsRead)

module.exports = router;