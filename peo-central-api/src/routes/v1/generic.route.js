const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { genericController } = require("../../controllers");

router
    .route("/search").all(verifyToken)
    .post(genericController.searchLeadsOnboardingVisProcessOffboardingsRenewalRequest)

router
    .route("/filter").all(verifyToken)
    .post(genericController.filterLeadsOnboardingVisProcessOffboardingsRenewalRequest)

router
    .route("/send/email").all(verifyToken)
    .post(genericController.genericSendEmail);


router
    .route("/send/mobileInvite").all(verifyToken)
    .post(genericController.mobileInvite);


router
    .route("/send/emailraw").all(verifyToken)
    .post(genericController.genericSendRawEmail);

router
    .route("/send/multiple/emails").all(verifyToken)
    .post(genericController.sendMultipleInvoices);

router
    .route("/process/flow").all(verifyToken)
    .post(genericController.getAllDetailsProcessFlow)

router
    .route("/process/mark/unsuccessfull").all(verifyToken)
    .post(genericController.processFlowMarkUnsuccessful)


router
    .route("/process/application-reject").all(verifyToken)
    .post(genericController.processRejectApplication)

router
    .route("/process/flow/forward").all(verifyToken)
    .post(genericController.processFlowMoveForward)

router
    .route("/process/flow/backward").all(verifyToken)
    .post(genericController.processFlowMoveBackward)

router
    .route("/process/flow/move/forward/stage").all(verifyToken)
    .post(genericController.processFlowMoveToStage)

router
    .route("/process").all(verifyToken)
    .put(genericController.processFlowUpdate)

router
    .route("/process/action/document").all(verifyToken)
    .put(genericController.processActionDocument)

router
    .route("/process/action/generatedocument").all(verifyToken)
    .put(genericController.processActionGenerateDocument)

router
    .route("/process/getmoduledata").all(verifyToken)
    .post(genericController.getModuleData)

router
    .route("/process/updatemoduledata").all(verifyToken)
    .post(genericController.updateModuleData)

router
    .route("/process/createInvoice").all(verifyToken)
    .post(genericController.createInvoice)

router
    .route("/process/getInvoiceDetails").all(verifyToken)
    .post(genericController.getInvoiceDetails)

router
    .route("/process/createVisaProcess").all(verifyToken)
    .post(genericController.createVisaProcess)


router
    .route("/process/proDetails/:module/:processId").all(verifyToken)
    .post(genericController.proDetails)


router
    .route("/invoice/approve").all(verifyToken)
    .post(genericController.ApproveInvoice)

router
    .route("/update/company/and/user/details").all(verifyToken)
    .post(genericController.updateCompanyAndUserRecords)

// Temporary route to send emails requesting update of details from employees
router
    .route("/send/emailraw/user/update").all(verifyToken)
    .post(genericController.genericRequestUserInfoUpdate);

router
    .route("/send/emailraw/tenancy/update").all(verifyToken)
    .post(genericController.genericRequestTenancyAndResidenceUpdate);

// get employees without offboarding: temp route
router
    .route("/employees-without-offboarding").all(verifyToken)
    .get(genericController.getUsersWithourOffboarding);

// Temporary route to delete employees on mission visa
router
    .route("/delete-employees-mission-visa").all(verifyToken)
    .put(genericController.missinVisaDeleteFunction);

router
    .route("/inactive/:companyId").all(verifyToken)
    .put(genericController.markEmployeesAsDeleted);

router
    .route("/deactivate/users/by/id").all(verifyToken)
    .post(genericController.markEmployeesOnMissionVisaAsInactiveByUserId);

router.route('/send-announcement-email-users').post(verifyToken, genericController.sendAnnouncementEmail);

router.route("/documents").get(genericController.exportUserData)

router.route("/ramadhan/email/clients").post(genericController.sendRamadhanEmailForClients)

router.route("/ramadhan/email/employees").post(genericController.sendRamadhanEmailForEmployees)

// router.route("/eid/email/employees").post(genericController.eidEmail)


module.exports = router;