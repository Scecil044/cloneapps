const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { insightsController } = require("../../controllers");

router
    .route('/leads/counts').all(verifyToken)
    .post(insightsController.leadsCounts)

router
    .route('/leads/client_type').all(verifyToken)
    .post(insightsController.leadsCountsOnClientType)

router
    .route('/leads/pipeline').all(verifyToken)
    .post(insightsController.leadsPipelineCounts)

router
    .route('/onboardings/count').all(verifyToken)
    .post(insightsController.onboardingsCount)

router
    .route('/onboardings/pipeline').all(verifyToken)
    .post(insightsController.onboardingPipelineCounts)

module.exports = router