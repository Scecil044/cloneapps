const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { activitiesController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(activitiesController.createActivity)
    .get(activitiesController.listAllActivities)

router
    .route("/act/:activityId").all(verifyToken)
    .get(activitiesController.activityById)

router
    .route("/:activityId").all(verifyToken)
    .patch(activitiesController.updateActivityOnId)
    .delete(activitiesController.deleteActivity)

router
    .route("/userid/:userId").all(verifyToken)
    .get(activitiesController.activityByUserId)

router
    .route("/documentid/:documentId").all(verifyToken)
    .get(activitiesController.activityByDocId)

router
    .route("/module/:module").all(verifyToken)
    .get(activitiesController.activityOnModuleName)

module.exports = router;