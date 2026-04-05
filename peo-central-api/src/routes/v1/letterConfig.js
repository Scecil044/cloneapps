const express = require('express');
const router = express.Router();
const LetterConfigModel = require('../../models/letterConfig');
// const validateToken = require('../utils').validateToken;
const validateToken = require('../../../utils').validateAccessToken;
const { letterConfigValidate } = require('../../validations/letterConfigValidation');
const { ObjectId } = require('mongodb');
const AWS = require('aws-sdk');

// AWS.config.update({
//   accessKeyId: process.env.ACCESS_KEY,
//   secretAccessKey: process.env.SECRET_KEY_AWS,
//   region: 'eu-central-1',
// });

const s3 = new AWS.S3();

router.post('/getLetterConfig', validateToken, async (req, res) => {
  try {
    const reqBody = req.body;
    if (reqBody.company_ID != 'All') {
      const company_ID = reqBody.company_ID;
      s3.getObject(
        {
          Bucket: process.env.BUCKET_NAME,
          Key: 'letterconfigs/' + company_ID + '.json',
        },
        function (err, data) {
          if (err) res.status(500).json(/*{ success: false, message: err.message, data: */ [] /*}*/);
          else
            res.json(
              /*{ success: true, message: "File Retrieved Successfully.", data: */ [
                JSON.parse(data.Body.toString('utf-8')),
              ] /*}*/
            );
        }
      );
    } else
      res.json(/*{ success: false, message: "Please select a company or use /getLetterConfigBackup.", data: */ [] /*}*/);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/getLetterConfigBackup', validateToken, async (req, res) => {
  try {
    const reqBody = req.body;
    let pipeline = [
      {
        $match: {},
      },
    ];

    if (reqBody.company_ID != 'All') {
      pipeline[0].$match.company_ID = ObjectId(req.body.company_ID);
      delete req.body.company_ID;
    } else {
      req.body.company_ID = 1;
      pipeline = [];
    }
    pipeline.push({ $project: reqBody });
    const letters = await LetterConfigModel.aggregate(pipeline);
    res.json(letters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/getrequestcontent', validateToken, async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          company_ID: ObjectId(req.body.company_ID),
        },
      },
      {
        $project: {
          letterRequest: 1,
        },
      },
      {
        $unwind: '$letterRequest',
      },
      {
        $match: {
          'letterRequest.letterDescription.requestType': req.body.requestType,
          'letterRequest.letterDescription.requestSubType': req.body.requestSubType,
        },
      },
      {
        $project: {
          'letterRequest.content': 1,
          'letterRequest.contentbefore': 1,
        },
      },
    ];
    const letters = await LetterConfigModel.aggregate(pipeline);

    res.json(letters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/getrequesttype', validateToken, async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          company_ID: ObjectId(req.body.company_ID),
        },
      },
      {
        $project: {
          letterRequest: 1,
        },
      },
      {
        $unwind: '$letterRequest',
      },
      {
        $project: {
          'letterRequest.letterDescription.requestType': 1,
          'letterRequest.letterDescription.requestSubType': 1,
        },
      },
    ];
    const letters = await LetterConfigModel.aggregate(pipeline);

    res.json(letters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { error, value } = letterConfigValidate.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  } else {
    try {
      const letter = new LetterConfigModel({
        ...req.body,
      });

      const newLetter = await letter.save();
      res.status(201).json(newLetter);
      res.send('Request saved');
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
});

router.patch('/update/:company_ID', async (req, res, next) => {
  const key_name = Object.keys(req.body)[0];
  const company_ID = req.params.company_ID;
  if (Object.keys(req.body).length === 0) res.status(400).json({ data: req.body, message: 'Please provide valid data.' });
  else {
    const { error, value } = letterConfigValidate.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    } else {
      try {
        const config = await LetterConfigModel.findOne({ company_ID: ObjectId(company_ID) });
        Object.assign(config, req.body);
        await config.save();
        s3.putObject(
          {
            Bucket: 'nathanhrerp',
            Key: 'letterconfigs/' + company_ID + '.json',
            Body: JSON.stringify(config),
            ContentType: 'application/json',
          },
          function (err, data) {
            if (err) {
              res.status(500).json({ success: false, message: err.message, data: [] });
            } else {
              res.status(200).send({ data: config[key_name], message: 'File Uploaded Successfully.', success: true });
            }
          }
        );
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  }
});

router.post('/init/:company_ID', validateToken, async (req, res) => {
  const company_ID = req.params.company_ID;
  try {
    const initial_config = {
      _id: ObjectId(),
      company_ID: ObjectId(company_ID),
      letterRequest: [],
      letterKeyHint: [],
    };
    const letter = new LetterConfigModel(initial_config);
    await letter.save();

    s3.putObject(
      {
        Bucket: 'peo-central',
        Key: 'LetterRequests/' + company_ID + '.json',
        Body: JSON.stringify(initial_config),
        ContentType: 'application/json',
      },
      function (err, data) {
        if (err) {
          res.status(500).json({ success: false, message: err.message, data: [] });
        } else {
          res.status(200).send({ data: initial_config, message: 'Config File Created Successfully.', success: true });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
