const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { azureController } = require("../../controllers");

router.get('/login', azureController.login);
router.post('/callback', azureController.callback);
router.post('/authorize', azureController.authorize);

module.exports = router;

