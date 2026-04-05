const express = require('express');
const router = express.Router();
const UserConfigModel = require('../../models/userConfig');
const validateToken = require('../../../utils').validateToken;
const { CreateUserConfigValidate, UpdateUserConfigValidate } = require('../../validations');

router.post('/userConfig', async (req, res) => {
  try {
    const reqBody = req.body;
    let pipeline = [
      {
        $match: {},
      },
    ];

    if (req.body.company_ID) {
      pipeline[0].$match.company_ID = ObjectId(req.body.company_ID);
      delete req.body.company_ID;
    } else {
      req.body.company_ID = 1;
      pipeline = [];
    }

    pipeline.push({ $project: reqBody });
    const config = await UserConfigModel.aggregate(pipeline);
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserConfigModel.findByIdAndRemove({ _id: id }).lean();
    const response = {
      message: 'Successfully deleted',
      id: user._id,
    };
    return res.status(200).send(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { error, value } = CreateUserConfigValidate.validate(req.body);
  if (error) res.status(400).json({ error: value, message: error.details[0].message });

  try {
    const config = new UserConfigModel({
      ...req.body,
    });
    const newConfig = await config.save();
    res.status(201).json(newConfig);
    res.send('Request saved');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:company_ID', validateToken, async (req, res, next) => {
  const { error, value } = UpdateUserConfigValidate.validate(req.body);
  if (Object.keys(req.body).length === 0) res.status(400).json({ data: req.body, message: 'Please provide valid data.' });
  if (error) res.status(400).json({ error: value, message: error.details[0].message });
  try {
    const { company_ID } = req.params;
    const config = await UserConfigModel.findOne({ company_ID: company_ID });
    const result = Object.assign(config, req.body);
    await UserConfigModel.findOneAndUpdate({ company_ID }, { $set: result }).lean();
    res.status(200).send(req.body);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
