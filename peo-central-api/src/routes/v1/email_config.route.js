const express = require('express');
const validate = require('../../middlewares/validate');
const { emailConfigController } = require('../../controllers');

const router = express.Router();

router.route('/getEmailConfig').post(emailConfigController.getEmailConfig);

router.route('/', validate(emailConfigController.create)).post(emailConfigController.create);

router.route('/:company_ID').patch(emailConfigController.update);

router.route('/:id').delete(emailConfigController.remove);

module.exports = router;
