const express = require('express');
const router = express.Router();
const ClaimConfigModel = require('../../models/claimsConfig');
const validateToken = require('../../../utils').validateAccessToken;
const ObjectId = require('mongoose').Types.ObjectId;
const { claimConfigValidation, CreateClaimConfigValidation, UpdateClaimConfigValidation } = require('../../validations');
const { boolean } = require('joi');

router.post('/', validateToken, async (req, res) => {
  const { error, value } = CreateClaimConfigValidation.validate(req.body);
  if (error) res.status(400).json({ error: value, message: error.details[0].message });

  try {
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;
    const data = await ClaimConfigModel.create(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'failed to create claims type.' });
  }
});

router.get('/:company_ID', validateToken, async (req, res) => {
  try {
    const { company_ID } = req.params;
    const data = await ClaimTypesModel.findOne({ company_ID: company_ID }).lean();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'failed Fetch claims type by id.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const data = await ClaimConfigModel.find();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'failed all Fetch claims type.' });
  }
});
//
router.patch('/update/:company_ID', async (req, res, next) => {
  const id = req.params._id;
  const key_name = Object.keys(req.body)[0];
  if (Object.keys(req.body).length === 0) res.status(400).json({ data: req.body, message: 'Please provide valid data.' });
  else {
    const { error, value } = UpdateClaimConfigValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    } else {
      try {
        const company_ID = req.params.company_ID;
        const config = await ClaimConfigModel.findOne({ company_ID: company_ID });

        Object.assign(config, req.body);

        await config.save();

        res.status(200).send({ data: config[key_name], success: true });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  }
});

router.delete('/:id', validateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ClaimConfigModel.findByIdAndDelete({ _id: id });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'Failed delete claims type.' });
  }
});

router.post('/getClaimConfig', validateToken, async (req, res) => {
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
    const config = await ClaimConfigModel.aggregate(pipeline);
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
