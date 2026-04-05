const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');
const Joi = require('joi');
const { objectId } = require('../../validations/custom.validation');
const invoiceUtilsController = require('../../controllers/invoiceUtils.controller');

const router = express.Router();

// Validation schemas
const sendManualReminderValidation = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    month: Joi.string().pattern(/^\d{4}-\d{2}$/)
  })
};

const getCompaniesNeedingRemindersValidation = {
  query: Joi.object().keys({
    month: Joi.string().pattern(/^\d{4}-\d{2}$/)
  })
};

// Routes
router
  .route('/reminder-check').all(verifyToken)
  .post(
    invoiceUtilsController.triggerReminderCheck
  );

router
  .route('/companies-needing-reminders').all(verifyToken)
  .get(
    validate(getCompaniesNeedingRemindersValidation),
    invoiceUtilsController.getCompaniesNeedingInvoiceReminders
  );

router
  .route('/send-manual-reminder/:companyId').all(verifyToken)
  .post(
    validate(sendManualReminderValidation),
    invoiceUtilsController.sendManualInvoiceReminder
  );

router
  .route('/final-reminder-check').all(verifyToken)
  .post(
    invoiceUtilsController.triggerFinalReminderCheck
  );

router
  .route('/companies-needing-final-reminders').all(verifyToken)
  .get(
    validate(getCompaniesNeedingRemindersValidation),
    invoiceUtilsController.getCompaniesNeedingFinalInvoiceReminders
  );

router
  .route('/send-manual-final-reminder/:companyId').all(verifyToken)
  .post(
    validate(sendManualReminderValidation),
    invoiceUtilsController.sendManualFinalInvoiceReminder
  );

module.exports = router;
