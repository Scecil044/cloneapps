const httpStatus = require('http-status');

const { newsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

// Create a new News
const createNewNews = catchAsync(async (req, res) => {
  try {
    const result = await newsService.createNewNews(req.body, req.userId);
    res.status(httpStatus.OK).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Create News', error });
  }
});

// Create a new News
const createBulkNews = catchAsync(async (req, res) => {
  try {
    const result = await newsService.createBulkNews(req.body, req.userId);
    res.status(httpStatus.OK).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Create News', error });
  }
});

// Get All News
const getAllNews = catchAsync(async (req, res) => {
  try {
    const result = await newsService.getAllNews(req.body);
    res.status(httpStatus.OK).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Get All News', error });
  }
});

// List All News
const listAllNews = catchAsync(async (req, res) => {
  try {
    const result = await newsService.listAllNews(req.body);
    res.status(httpStatus.OK).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to List All News', error });
  }
});

const listAllCompanyNews = catchAsync(async (req, res) => {
  try {
    const result = await newsService.listAllCompanyNews(req.body);
    res.status(httpStatus.OK).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to List All News', error });
  }
});

// Update News On ID
const updateNewsOnId = catchAsync(async (req, res) => {
  try {
    const result = await newsService.updateNewsOnId(req.params.newsId, req.body, req.userId);
    res.status(httpStatus.OK).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Update News', error });
  }
});

module.exports = {
  createNewNews,
  createBulkNews,
  getAllNews,
  listAllNews,
  updateNewsOnId,
  listAllCompanyNews
};
