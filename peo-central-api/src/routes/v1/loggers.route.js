const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { loggersController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(loggersController.createLogger)
    .get(loggersController.getAllLoggers)

router
    .route("/:loggerId").all(verifyToken)
    .get(loggersController.getLoggerById)
    .patch(loggersController.updateLoggersOnId)
    .delete(loggersController.deleteLoggerOnId)

router
    .route("/module/:module").all(verifyToken)
    .get(loggersController.getLoggersByModule)

router
    .route("/userid/:userId").all(verifyToken)
    .get(loggersController.loggerByUserId)

router
    .route("/search/filter").all(verifyToken)
    .post(loggersController.filterAndSearchLogger)

module.exports = router