const express = require('express');
const router = express.Router();
const WFHConfigModel = require('../../models/wfhConfig');
const validateToken = require('../../../utils').validateToken;
const { wfhconfigValidate } = require('../../validations/wfhconfig');
const { ObjectId } = require('mongodb');

router.post('/getWFHConfig', validateToken, async (req, res) => {
  try {
    const reqBody = req.body;
    let pipeline = [
      {
        $match: {},
      },
    ];

    if (req.body.company_ID != 'All') {
      pipeline[0].$match.company_ID = ObjectId(req.body.company_ID);
      delete req.body.company_ID;
    } else {
      req.body.company_ID = 1;
      pipeline = [];
    }

    pipeline.push({ $project: reqBody });
    const config = await WFHConfigModel.aggregate(pipeline);
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', validateToken, async (req, res) => {
  const { error, value } = wfhconfigValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  } else {
    try {
      const config = new WFHConfigModel({
        ...req.body,
      });
      const newConfig = await config.save();
      res.status(201).json(newConfig);
      res.send('Request saved');
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
});

router.patch('/update/:company_ID', async (req, res, next) => {
  const id = req.params._id;
  const key_name = Object.keys(req.body)[0];
  if (Object.keys(req.body).length === 0) res.status(400).json({ data: req.body, message: 'Please provide valid data.' });
  else {
    const { error, value } = wfhconfigValidate.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    } else {
      try {
        const company_ID = req.params.company_ID;
        const config = await WFHConfigModel.findOne({ company_ID: ObjectId(company_ID) });
        Object.assign(config, req.body);

        await config.save();

        res.status(200).send({ data: config[key_name], success: true });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  }
});

module.exports = router;
