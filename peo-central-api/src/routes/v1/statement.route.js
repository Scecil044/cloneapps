const express = require('express');
const validate = require('../../middlewares/validate');
const verifyToken = require("../../middlewares/verifyToken")
const { statementController } = require('../../controllers');

const router = express.Router();

// Create a statement
router.route("/").post(verifyToken,statementController.createStatement);

// Fetch statements
router.route("/").get(verifyToken, statementController.fetchStatements);

// Generate a statement for a specific company and date range
router.route("/generate").post(verifyToken,statementController.generateStatement);

// Generate statements for all active companies for a specific period
router.route("/generate-all").post(verifyToken,statementController.generateStatementsForAllCompanies);

// Export statements to Excel with date filtering capabilities
// Supports: single company (company_id), multiple companies (company_ids), or all companies
router.route("/export").get(verifyToken, statementController.exportStatementsToExcel);

// Add this route
router.route("/job/:jobId").get(verifyToken, statementController.getStatementGenerationStatus);

module.exports = router;
