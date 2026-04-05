const express = require('express');

const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { faqController } = require('../../controllers');

router.route('/').all(verifyToken).post(faqController.createFaq);

router.route('/:faqId').all(verifyToken).get(faqController.getFaqById);

router.route('/filter/faqs').all(verifyToken).get(faqController.filterFaqs);

router.route('/filter/faqs/by/category').all(verifyToken).get(faqController.filterFaqsByCategory);

router.route('/:faqId').all(verifyToken).put(faqController.updateFaqById);

router.route('/:faqId').all(verifyToken).delete(faqController.deleteFaqById);

module.exports = router;
