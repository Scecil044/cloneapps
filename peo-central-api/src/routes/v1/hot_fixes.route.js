const express = require('express');
const verifyToken  = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const {companiesController, usersController} = require('../../controllers')
const router = express.Router();


router.route("/").all(verifyToken).put();

module.exports = router;