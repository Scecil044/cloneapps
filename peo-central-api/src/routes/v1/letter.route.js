const express = require('express');

const router = express.Router();

const { letterController } = require('../../controllers');

router.post('/letter_download', letterController.letterDownload);
router.post('/letter_preview', letterController.letterPreview);

module.exports = router