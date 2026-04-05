const express = require('express');

const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { newsController } = require('../../controllers');
const { newsValidation } = require('../../validations');

router
  .route('/new')
  .all(verifyToken)
  .post(validate(newsValidation.createNews), newsController.createNewNews)
  .get(newsController.listAllCompanyNews);

router.route('/bulk-new').all(verifyToken).post(newsController.createBulkNews);

router.route('/update/:newsId').all(verifyToken).put(newsController.updateNewsOnId);

router.route('/get_all_news').all(verifyToken).get(newsController.getAllNews);

router.route('/list_all_news').all(verifyToken).post(newsController.listAllNews);

router.route('/list_all_news_company').all(verifyToken).get(newsController.listAllCompanyNews);

module.exports = router;
