const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { processesController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(processesController.createProcesses)
    .get(processesController.listAllProcesses)

router
    .route("/module/:moduleName").all(verifyToken)
    .get(processesController.getProcessOnModuleName)

router
    .route("/id/:processId").all(verifyToken)
    .get(processesController.processById)

router
    .route("/:processId").all(verifyToken)
    .patch(processesController.updateProcessOnId)
    .delete(processesController.deleteProcessOnId)

module.exports = router