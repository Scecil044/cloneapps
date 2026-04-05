const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { accessController } = require("../../controllers");

router
.route("/").all(verifyToken)
.post(accessController.createAccess)
.get(accessController.listAllAccess)

router
.route("/:accessId").all(verifyToken)
.get(accessController.listofAccessById)
.patch(accessController.updateAccess)
.delete(accessController.deleteAccess)

router
.route("/module/:module").all(verifyToken)
.get(accessController.listofAccessByModule)

module.exports = router