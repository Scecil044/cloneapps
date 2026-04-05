const express = require('express');
const router = express.Router();
const { kycEnrollmentsController } = require('../../controllers');

// Get KYC enrollment by lead ID
router.get('/:leadId', kycEnrollmentsController.getKycEnrollmentByLeadId);

// Create new KYC enrollment
router.post('/', kycEnrollmentsController.createKycEnrollment);

// Update KYC enrollment
router.put('/:leadId', kycEnrollmentsController.updateKycEnrollment);

// Submit completed KYC enrollment
router.post('/:leadId/submit', kycEnrollmentsController.submitKycEnrollment);

// Upload KYC documents
router.post('/:leadId/upload', kycEnrollmentsController.uploadKycDocuments);

module.exports = router;
