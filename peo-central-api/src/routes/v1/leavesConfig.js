const express = require('express');
const router = express.Router();
const LeavesConfigModel = require('../../models/leavesConfig');
const validateToken = require('../../../utils').validateAccessToken;
const { CreateLeaveConfigValidation, UpdateLeaveConfigValidation } = require('../../validations');

router.get('/commonHoliday', async (_req, res) => {
  try {
    const result = await LeavesConfigModel.aggregate([
      {
        $project: {
          result: {
            $concatArrays: '$holiday_calendar',
          },
        },
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            startDate: '$holiday_calendar.from_date',
            endDate: '$holiday_calendar.to_date',
          },
          data: {
            $addToSet: '$result',
          },
        },
      },
    ]);
    res.status(200).json(result[0].data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'failed all Fetch claims type.' });
  }
});

router.post('/', async (req, res) => {
  const { error, value } = CreateLeaveConfigValidation.validate(req.body);
  if (error) res.status(400).json({ error: value, message: error.details[0].message });

  try {
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;
    const data = await LeavesConfigModel.create(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'failed to create leave type.' });
  }
});

router.patch('/update/:company_ID', async (req, res) => {
  const id = req.params._id;
  const key_name = Object.keys(req.body)[0];
  if (Object.keys(req.body).length === 0) res.status(400).json({ data: req.body, message: 'Please provide valid data.' });
  else {
    const { error, value } = UpdateLeaveConfigValidation.validate(req.body);
    if (error) res.status(400).json({ error: value, message: error.details[0].message });
    else {
      try {
        const company_ID = req.params.company_ID;
        const config = await LeavesConfigModel.findOne({ company_ID: company_ID });

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
    const data = await LeavesConfigModel.findByIdAndDelete({ _id: id });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error, message: 'Failed delete leaves type.' });
  }
});

router.post('/getLeaveConfig', validateToken, async (req, res) => {
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
    const config = await LeavesConfigModel.aggregate(pipeline);
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
