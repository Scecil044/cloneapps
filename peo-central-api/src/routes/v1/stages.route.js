const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { stagesController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(stagesController.createStages)
    .get(stagesController.listAllStages)

router
    .route("/:stageId").all(verifyToken)
    .get(stagesController.stagesById)
    .patch(stagesController.updateStagesOnId)
    .delete(stagesController.deleteStagesOnId)

router
    .route("/visaprocess/stages").all(verifyToken)
    .post(stagesController.listVisaProcessStages)

router
    .route("/visaprocess/stages/section/:sectionName").all(verifyToken)
    .post(stagesController.listVisaProcessStagesOnSectionName)

module.exports = router