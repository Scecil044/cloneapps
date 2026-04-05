const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { onboardingsValidation } = require("../../validations");
const { onboardingsController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(validate(onboardingsValidation.createOnboardings), onboardingsController.createOnboardings)
    .get(onboardingsController.listAllOnboardings)

// create new onboarding via link
router.post('/onboard_via_link', validate(onboardingsValidation.onboardViaLink),onboardingsController.onboardViaLink);

router
    .route("/service/:onboardingsId").all(verifyToken)
    .get(validate(onboardingsValidation.onboardingsById), onboardingsController.onboardingsById)

router
    .route("/:onboardingsId").all(verifyToken)
    .patch(validate(onboardingsValidation.updateOnboardings), onboardingsController.updateOnboardingsOnId)
    .delete(validate(onboardingsValidation.onboardingsById), onboardingsController.deleteOnboardings)

router
    .route("/userid/:userId").all(verifyToken)
    .get(validate(onboardingsValidation.onboardingsByUserId), onboardingsController.onboardingsOnUserID)

router
    .route("/stageid/:stageId").all(verifyToken)
    .get(validate(onboardingsValidation.onboardingsByStageId), onboardingsController.onboardingsOnStageID)

router
    .route("/status/:status").all(verifyToken)
    .get(onboardingsController.onboardingsOnStatus)

router
    .route("/filter/status/dates/stagetype").all(verifyToken)
    .post(onboardingsController.filterOnDatesStatusAndStageTypes)

router
    .route("/list/users/company").all(verifyToken)
    .post(onboardingsController.listOfUsersAndCompaniesWithStatus)

router
    .route("/get_status_count").all(verifyToken)
    .post(onboardingsController.getOnboardingStatusCount)

router
    .route("/employee/details/:onboardingId").all(verifyToken)
    .post(onboardingsController.extendedListOfUsersAndCompanies)

router
    .route("/get_onboardings").all(verifyToken)
    .get(onboardingsController.getOnboardings)

router
    .route("/process/forward/:onboardingId").all(verifyToken)
    .post(onboardingsController.onboardingProcessForward)

router
    .route("/backward/process/:onboardingId").all(verifyToken)
    .post(onboardingsController.onboardingProcessBackward)

router
    .route("/create/onboarding/users").all(verifyToken)
    .post(onboardingsController.newOnboardingCreationAPIUsers)

    router
    .route("/create/onboarding/users/continue/:userId").all(verifyToken)
    .post(onboardingsController.continueWithOnboardingProcess)

router
    .route("/pipeline").all(verifyToken)
    .post(onboardingsController.onboardingPipeline)

router
    .route("/pipeline/list").all(verifyToken)
    .get(onboardingsController.getPipelineList)

router
    .route("/list/status").all(verifyToken)
    .post(onboardingsController.listOfOnboardingStatus)


router
    .route("/distribution")
    .all(verifyToken)
    .post(onboardingsController.getDashboardCount)


router
    .route("/details/invoice/:invoiceId")
    .all(verifyToken)
    .post(onboardingsController.ProcessDetailsByInvoice)

router
    .route("/document/:invoiceId")
    .all(verifyToken)
    .post(onboardingsController.GeneratedDocument)


router
    .route("/companyId/:companyId")
    .all(verifyToken)
    .get(onboardingsController.getOnboardingOnCompanyId)

router
    .route("/export/bulk/upload/template")
    .get(onboardingsController.exportBulkUploadTemplate)

router
    .route("/bulk/upload/onboardings")
    .post(onboardingsController.bulkUploadOnboardings)

    
module.exports = router;