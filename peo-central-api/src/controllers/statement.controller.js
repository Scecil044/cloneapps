const httpStatus = require('http-status');
const { statementService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Create a statement
 */
const createStatement = catchAsync(async (req, res) => {
  const statement = await statementService.createStatement(req.body, req.userId);
  res.status(httpStatus.CREATED).send(statement);
});

/**
 * Fetch statements
 */
const fetchStatements = catchAsync(async (req, res) => {
  const statements = await statementService.fetchStatements(req.query);
  res.status(httpStatus.OK).send(statements);
});

/**
 * Generate a statement for a specific company and date range
 */
const generateStatement = catchAsync(async (req, res) => {
  const { companyId, startDate, endDate } = req.body;

  if (!companyId || !startDate || !endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Company ID, start date, and end date are required');
  }

  const statement = await statementService.generateStatement(companyId, startDate, endDate, req.userId);
  res.status(httpStatus.CREATED).send(statement);
});

/**
 * Generate statements for all active companies for a specific period
 */
// Modified controller function
const generateStatementsForAllCompanies = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Start date and end date are required');
  }

  const jobInfo = await statementService.generateStatementsForAllCompanies(startDate, endDate, req.userId);
  res.status(httpStatus.ACCEPTED).send(jobInfo);
});

// Add a new endpoint to check job status
const getStatementGenerationStatus = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const status = await statementService.getStatementGenerationStatus(jobId);
  res.status(httpStatus.OK).send(status);
});

/**
 * Export statements to Excel with date filtering capabilities
 * This endpoint allows exporting statements for:
 * - A single company (company_id parameter)
 * - Multiple specific companies (company_ids parameter - comma separated)
 * - All companies (no company parameters)
 * within a specified date range
 */
const exportStatementsToExcel = catchAsync(async (req, res) => {
  const { startDate, endDate, company_id, company_ids } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Start date and end date are required');
  }

  // Validate that only one company parameter is provided
  if (company_id && company_ids) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide either company_id or company_ids, not both');
  }

  const result = await statementService.exportStatementsToExcel(req.query);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createStatement,
  fetchStatements,
  generateStatement,
  generateStatementsForAllCompanies,
  exportStatementsToExcel,
  getStatementGenerationStatus
};
