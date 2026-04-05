const express = require('express');

const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { inquiryController } = require('../../controllers');
const { InquiryValidations } = require('../../validations');

const router = express.Router();
// create inquiry
router.post('/new', inquiryController.createInquiry);
// fetch inquiries
router.post('/', verifyToken, inquiryController.filterInquiries);
// assign inquiries
// router.post('/assign-pro', verifyToken, validate(InquiryValidations.assignPro), inquiryController.assignInquiryToPro);
router.post('/assign-pro', verifyToken, inquiryController.assignInquiryToPro);

router.post('/reassign-pro', verifyToken, validate(InquiryValidations.reassignInquiry), inquiryController.reassignToPRO);
// archive inquiry
router.post('/archive', verifyToken, inquiryController.archiveInquiry);
// restore archived inquiry
router.post('/restore-archive', verifyToken, inquiryController.restoreArchivedInquiry);
// counts
router.get('/counts', verifyToken, inquiryController.getInquiryCounts);

module.exports = router;
