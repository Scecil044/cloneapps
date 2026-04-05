const express = require('express');
const router = express.Router();
const BiReportModel = require('../../models/bi_report');
const validateToken = require('../../../utils').validateAccessToken;
const { ObjectId } = require('mongoose').Types;

router.post('/add_report', validateToken, async (req, res) => {
  const report = new BiReportModel({
    ...req.body,
  });

  try {
    const newProcess = await report.save();
    res.status(201).json(newProcess);
    res.send('Request saved');
  } catch (error) {
    console.log(error, '--error');
    res.json({ success: false, message: error.message, data: [] });
  }
});

router.get('/all', validateToken, async (req, res) => {
  try {
    const report = await BiReportModel.find().sort({ report_name: 'asc' });
    res.json(report);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/update-report/:_id', validateToken, async (req, res, next) => {
  try {
    let updateData = {
      creator_name: req.body[0].createdBy,
      user_id: req.body[0].user_id,
      export_type: req.body[0].export_type,
      report_name: req.body[0].name,
      access_rights: req.body[0].access_rights,
      description: req.body[0].desc,
      date_created: req.body[0].createdDate,
    };
    let update_match = {
      _id: ObjectId(req.body[0].id),
    };
    const report = await BiReportModel.findOneAndUpdate(update_match, updateData, { new: true });
    res.status(200).send(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
