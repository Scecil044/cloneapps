const express = require('express');
const router = express.Router();
const WfhModel = require('../../models/wfh');
const UsersModel = require('../../models/users.model');
const RequestsModel = require('../../models/requests');
const LeavesModel = require('../../models/leaves');
const validateToken = require('../../../utils').validateAccessToken;
const dateNow = new Date().toISOString().substr(0, 10);
const ObjectId = require('mongoose').Types.ObjectId;
const ConfigurationModel = require('../../models/configuration.model');
// const notificationModel = require("../../models/notifications");
const CompaniesModel = require('../../models/companies.model');
const leaveConfigModel = require('../../models/leavesConfig'); 
const { Leave } = require('@nathangroup/leave');
const { Wfh } = require('@nathangroup/wfh');
// const { Wfh } = require("../temppckg/index");

const { WfhEmail } = require('@nathangroup/wfh_email');
// const NotificationHelper = require("../helper/notification_helper");

const wfhConfigModel = require('../../models/wfhConfig');

// for sending email
const AWS = require('aws-sdk');
const ses = new AWS.SES({
  // accessKeyId: process.env.ACCESS_KEY,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1',
});

// get wfh for the teams calendar
router.post('/get_all_requests', validateToken, async (req, res) => {
  let user_id = req.body.user_id;

  try {
    let lookup_wfhs = {
      $lookup: {
        from: 'wfhs',
        let: {
          userid: '$user_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$status', ['Completed', 'completed', 'Processing', 'processing']] },
                  { $in: ['$user_id', '$$userid'] },
                ],
              },
            },
          },
          {
            $project: {
              user_id: 1,
              status: 1,
              reason: 1,
              no_of_days: 1,
              to_date: 1,
              request_type: 1,
              from_date: 1,
              date_created: 1,
            },
          },
        ],
        as: 'users_wfhs',
      },
    };

    const requestsData = await UsersModel.aggregate([
      {
        $match: {
          'reporting.manager': user_id,
          user_status: { $nin: ['Inactive'] },
        },
      },
      {
        $addFields: { employee_id: { $toString: '$_id' } },
      },
      {
        $group: { _id: null, array: { $push: { user_id: '$employee_id' } } },
      },
      {
        $project: { _id: 0, user_id: '$array.user_id' },
      },
      lookup_wfhs,
    ]);
    //   console.log(result.results.length,"---getUsers.data.results.length")
    if (requestsData) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: requestsData });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: {} });
    }
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

// ui upgrade starts

//all active wfh

// get team wgh for today

// get reporting wfh for required date
router.post('/get-reporting-wfh', async (req, res) => {
  try {
    let required_date = req.body.date;
    let user_reporting = req.body.id;
    let userType = req.body.userType;
    let arr = [];

    if (userType == 'ADMIN') {
      match = { $match: { user_status: 'Active' } };
    } else if (userType == 'MANAGER') {
      match = { $match: { 'reporting.manager': user_reporting, user_status: 'Active' } };
    }

    const users = await UsersModel.aggregate([match, { $project: { _id: 1, first_name: 1, last_name: 1, image_url: 1 } }]);
    let wfh = {};
    for (let i = 0; i < users.length; i++) {
      wfh = await WfhModel.find({
        user_id: users[i]._id,
        from_date: { $lte: required_date },
        to_date: { $gte: required_date },
      });
      arr.push(...wfh);
    }

    res.json(arr);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post('/wfhByDate/', async (req, res) => {
  /*
        {
            id: ""
            user_type: "ADMIN"|"MANAGER"|"USER"
            fromdate: ""
            todate: ""
        }
    */
  const body = req.body;
  let str_from_date = new Date(req.body.str_from_date);
  let str_to_date = new Date(req.body.str_to_date);
  let locations;
  let match;

  if (body.user_type == 'MANAGER') {
    match = {
      $match: {
        'approvals.approver_id': body.id,
      },
    };
  } else if (body.user_type == 'USER') {
    match = {
      $match: {
        user_id: body.id,
      },
    };
  } else if (body.user_type == 'ADMIN') {
    match = {
      $match: {},
    };
  }

  try {
    await WfhModel.aggregate([
      {
        $match: {
          status: { $in: ['Completed', 'completed'] },
          from_date: {
            $gte: str_from_date,
            $lte: str_to_date,
          },
        },
      },
      match,
      {
        $addFields: {
          string_id: { $toObjectId: '$user_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'string_id',
          foreignField: '_id',
          as: 'usersData',
        },
      },
      {
        $project: {
          'usersData.image_url': 1,
          'usersData.first_name': 1,
          'usersData.middle_name': 1,
          'usersData.last_name': 1,
          request_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          date_created: 1,
          company_id: 1,
        },
      },
      { $sort: { 'usersData.first_name': 1 } },
    ]).exec((err, locations) => {
      if (err) throw err;
      console.log(locations);
      res.json(locations);
    });
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

// get team wfh processing only
router.post('/get_all_team_wfh', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let requestType = req.body.requestType;
    let userType = req.body.userType;
    let user_id = req.body.user_id;
    let history = req.body.history;

    let match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }] } };

    match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }] } };

    if (userType == 'ADMIN') {
      if (history == false) {
        match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }], requestType: requestType } };
        if (requestType == 'ALL') match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }] } };
      } else {
        match = { $match: { status: { $nin: ['processing', 'Processing'] }, requestType: requestType } };
        if (requestType == 'ALL') match = { $match: { status: { $nin: ['processing', 'Processing'] } } };
      }
    } else if (userType == 'MANAGER') {
      if (history == false) {
        match = {
          $match: {
            $or: [{ status: 'processing' }, { status: 'Processing' }],
            requestType: requestType,
            approvals: { $elemMatch: { approver_id: user_id, status: 'Processing' } },
          },
        };
        if (requestType == 'ALL') {
          match = {
            $match: {
              $or: [{ status: 'processing' }, { status: 'Processing' }],
              approvals: { $elemMatch: { approver_id: user_id } },
            },
          };
        }
      } else {
        match = {
          $match: {
            status: { $nin: ['processing', 'Processing'] },
            requestType: requestType,
            approvals: { $elemMatch: { approver_id: user_id } },
          },
        };
        if (requestType == 'ALL') {
          match = {
            $match: { status: { $nin: ['processing', 'Processing'] }, approvals: { $elemMatch: { approver_id: user_id } } },
          };
        }
      }
    } else {
      if (history == false) {
        match = {
          $match: { $or: [{ status: 'processing' }, { status: 'Processing' }], requestType: requestType, user_id: user_id },
        };
        if (requestType == 'ALL')
          match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }], user_id: user_id } };
      } else {
        match = { $match: { status: { $nin: ['processing', 'Processing'] }, requestType: requestType, user_id: user_id } };
        if (requestType == 'ALL') match = { $match: { status: { $nin: ['processing', 'Processing'] }, user_id: user_id } };
      }
    }
    const requests = await WfhModel.aggregate([match, { $sort: { date_created: -1 } }]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get dept wfh //
router.post('/dept', validateToken, async (req, res) => {
  try {
    console.log('in');
    let dept = req.body.dept;
    let user_id = req.body.user_id;
    let arr = [];
    const users = await UsersModel.find({ 'reporting.department': dept, user_status: 'active' });
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      leave = await WfhModel.find({ user_id: users[i]._id, $or: [{ status: 'Completed' }, { status: 'Processing' }] });
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get reporting leave for all reporting users - completed and processing
router.post('/get-reporting-wfh/all', async (req, res) => {
  try {
    let user_reporting = req.body.id;
    let arr_userId = [];
    let arr = [];

    let match = { $match: { 'reporting.manager': user_reporting, user_status: 'Active' } };

    const users = await UsersModel.aggregate([match, { $project: { _id: 1 } }]);
    users.forEach((ele) => {
      arr_userId.push(ele._id.toString());
    });

    const wfh = await WfhModel.aggregate([
      {
        $match: {
          user_id: { $in: arr_userId },
          status: { $in: ['Completed', 'completed', 'Processing', 'processing'] },
        },
      },
      {
        $project: {
          request_type: 1,
          request_sub_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          date_created: 1,
        },
      },
    ]);

    arr.push(...wfh);

    res.json(arr);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/team/:team', validateToken, async (req, res) => {
  let team = req.params.team;
  let todayDate = new Date().setHours(0, 0, 0, 0);
  todayDate = new Date(todayDate);
  try {
    let arr = [];
    //res.send('Hello Employee')
    const users = await UsersModel.find({ 'reporting.team': team, user_status: 'Active' });
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      leave = await WfhModel.find({ user_id: users[i]._id, from_date: { $lte: todayDate }, to_date: { $gte: todayDate } });
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bydate/user', validateToken, async (req, res) => {
  let fromDate = new Date().setHours(0, 0, 0, 0);
  fromDate = new Date(fromDate);
  let toDate = new Date().setHours(0, 0, 0, 0);
  toDate = new Date(fromDate);
  const id = req.body.id;
  try {
    const wfh = await WfhModel.aggregate([
      {
        $match: {
          user_id: id,
          from_date: { $gte: fromDate },
          to_date: { $gte: toDate },
          status: { $in: ['completed', 'Completed'] },
        },
      },
      { $project: { _id: 1 } },
    ]);
    res.json(wfh);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// get wgh for today
router.get('/today/all', async (req, res) => {
  let todayDate = new Date().setHours(0, 0, 0, 0);
  todayDate = new Date(todayDate);
  try {
    const wfh = await WfhModel.find({
      from_date: { $lte: todayDate },
      to_date: { $gte: todayDate },
      status: { $nin: ['Cancelled', 'Withdrawn'] },
    });
    res.json(wfh);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// get teams leave
router.post('/team', validateToken, async (req, res) => {
  try {
    let team = req.body.team;
    let user_id = req.body.user_id;
    let arr = [];
    const users = await UsersModel.find({ 'reporting.team': team, user_status: 'Active', _id: { $ne: user_id } });
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      leave = await WfhModel.find({ user_id: users[i]._id });
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ui upgrade ends

router.post('/get_all_wfh', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let userType = req.body.userType;
    let user_id = req.body.user_id;

    let match = { $match: {} };

    match = { $match: {} };

    if (userType == 'ADMIN') {
      match = { $match: {} };
    } else if (userType == 'MANAGER') {
      match = { $match: { approvals: { $elemMatch: { approver_id: user_id } } } };
    } else {
      match = { $match: { user_id: user_id } };
    }

    const requests = await WfhModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      { $skip: skipCount },
      { $limit: pageLimit },
      {
        $project: {
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          remaining_leaves: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          approvals: 1,
          created_by_id: 1,
          attachments: 1,
          half_day: 1,
          date_created: 1,
          appliction_log: 1,
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/get_user_wfh_count', validateToken, async (req, res) => {
  try {
    let year_now = dateNow.slice(0, 4);
    let count = 0;
    let user_id = req.body.user_id;
    const requests = await WfhModel.find({ user_id: user_id });
    for (let i = 0; i < requests.length; i++) {
      let from_date = new Date(requests[i].from_date).getFullYear();
      if (from_date == year_now) {
        count += 1;
      }
    }
    res.status(200).json(count);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/all', validateToken, async (req, res) => {
  try {
    const wfh = await WfhModel.find();
    res.json(wfh);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.get('/no-withdrawn/all', validateToken, async (req, res) => {
  try {
    const wfh = await WfhModel.find({ status: { $ne: 'withdrawn' } });
    res.json(wfh);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.get('/non-completed/all', validateToken, async (req, res) => {
  try {
    const wfh = await WfhModel.find({ status: 'Processing' });
    res.json(wfh);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.get('/users/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const wfh = await WfhModel.find({ user_id: id });
    res.json(wfh);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});
//
router.get('/user_wfh/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    let match = {
      $match: {
        user_id: id,
        status: { $nin: ['Cancelled', 'Withdrawn'] },
      },
    };
    let project = {
      $project: {
        _id: 0,
        from_date: 1,
        to_date: 1,
        user_id: 1,
        no_of_days: 1,
        //   leave_type:1
      },
    };
    const leaves = await WfhModel.aggregate([match, project]);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  try {
    const leave = await WfhModel.find({ _id: id });
    res.json(leave);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.delete('/delete/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  try {
    const leave = await WfhModel.findByIdAndRemove({ _id: id });
    const response = {
      message: 'Successfully deleted',
      id: leave._id,
    };
    return res.send(response);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.put('/update/:_id', validateToken, async (req, res, next) => {
  const id = req.params._id;
  const filter = { _id: ObjectId(id) };
  try {
    const ticket = await WfhModel.updateOne(filter, { $set: req.body[0] });
    res.send('Successfuly Updated');
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.post('/new', validateToken, async (req, res) => {
  const wfh = new WfhModel({
    ...req.body,
  });

  try {
    const leave = await wfh.save();
    res.status(200).json(leave);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

//  get wfh list
router.post('/requestslist/', validateToken, async (req, res) => {
  /* 
        {
            id: ""
            user_type: "ADMIN"|"MANAGER"|"USER"
            skip: 0
            pagelimit: 100
        }
    */
  const body = req.body;
  const id = req.params._id;
  let locations;
  let match;

  if (body.user_type == 'MANAGER') {
    match = { $match: { 'approvals.approver_id': body.id } };
  } else if (body.user_type == 'USER') {
    match = { $match: { user_id: body.id } };
  } else if (body.user_type == 'ADMIN') {
    match = { $match: {} };
  }

  try {
    const followers_count = 30;
    await WfhModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      { $skip: body.skip },
      { $limit: body.pageLimit },
      {
        $addFields: {
          string_id: { $toObjectId: '$user_id' },

          sortNum: {
            $switch: {
              branches: [
                {
                  case: {
                    //$eq: ["$status", "Processing"]
                    $in: ['$status', ['processing', 'Processing']],
                  },
                  then: 4,
                },
                {
                  case: {
                    //$eq: ["$status", "Approved"]
                    $in: ['$status', ['Approved', 'approved']],
                  },
                  then: 3,
                },
                {
                  case: {
                    //$eq: ["$status", "Completed"]
                    $in: ['$status', ['Completed', 'completed']],
                  },
                  then: 2,
                },
                {
                  case: {
                    //$eq: ["$status", "Cancelled"]
                    $in: ['$status', ['Cancelled', 'cancelled']],
                  },
                  then: 1,
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'string_id',
          foreignField: '_id',
          as: 'usersData',
        },
      },
      {
        $project: {
          'usersData.email': 1,
          'usersData.first_name': 1,
          'usersData.middle_name': 1,
          'usersData.last_name': 1,
          sortNum: 1,
          approvals: 1,
          request_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          date_created: 1,
          company_id: 1,
          tracks: {
            $map: {
              input: '$approvals',
              as: 't',
              in: {
                $toObjectId: '$$t.approver_id',
              },
            },
          },
        },
      },

      {
        $lookup: {
          from: 'users',
          let: {
            users: '$tracks',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ['$_id', '$$users'] }],
                },
              },
            },
            {
              $project: {
                _id: 0,
                first_name: 1,
                middle_name: 1,
                last_name: 1,
                image_url: 1,
              },
            },
          ],
          as: 'approval_array',
        },
      },

      { $sort: { sortNum: -1, date_created: -1 } },
    ]).exec((err, locations) => {
      if (err) throw err;
      console.log(locations);

      res.json(locations);
    });
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

//  get wfh list by dates
router.post('/wfhByDate/', validateToken, async (req, res) => {
  /* 
        {
            id: ""
            user_type: "ADMIN"|"MANAGER"|"USER"
            fromdate: ""
            todate: ""
        }
    */
  const body = req.body;
  let str_from_date = new Date(req.body.str_from_date);
  let str_to_date = new Date(req.body.str_to_date);
  let locations;
  let match;

  if (body.user_type == 'MANAGER') {
    match = {
      $match: {
        'approvals.approver_id': body.id,
      },
    };
  } else if (body.user_type == 'USER') {
    match = {
      $match: {
        user_id: body.id,
      },
    };
  } else if (body.user_type == 'ADMIN') {
    match = {
      $match: {},
    };
  }

  try {
    await WfhModel.aggregate([
      {
        $match: {
          status: { $in: ['Completed', 'completed'] },
          from_date: {
            $gte: str_from_date,
            $lte: str_to_date,
          },
        },
      },
      match,
      {
        $addFields: {
          string_id: { $toObjectId: '$user_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'string_id',
          foreignField: '_id',
          as: 'usersData',
        },
      },
      {
        $project: {
          'usersData.email': 1,
          'usersData.first_name': 1,
          'usersData.middle_name': 1,
          'usersData.last_name': 1,
          request_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          date_created: 1,
          company_id: 1,
        },
      },
      { $sort: { 'usersData.first_name': 1 } },
    ]).exec((err, locations) => {
      if (err) throw err;
      console.log(locations);
      res.json(locations);
    });
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

/* Apply for new WFH 
{
    "request_type": "wfh",
    "from_date": "2022-09-02",
    "to_date": "2022-09-02",
    "no_of_days": 1,
    "user_id": "632d552a0e852a48808bb8d6",
    "userType": "SELF",
    "applied_manager": "632d552a0e852a48808bb8d6",
    "reason": "Test",
     "obj_wfh_type": {        
        "wfh_type": "Working day"        
    }
}
*/
router.post('/apply_wfh', validateToken, async (req, res) => {
  try {
    const body = req.body;

    const applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) })
      .select({
        reporting: 1,
        personal: 1,
        first_name: 1,
        last_name: 1,
        company_ID: 1,
        email: 1,
      })
      .lean();

    const applied_manager = await UsersModel.findOne({ _id: ObjectId(body.applied_manager) })
      .select({
        personal: 1,
        first_name: 1,
        last_name: 1,
      })
      .lean();

    const WfhObj = new Wfh();
    const Emails = new WfhEmail();

    if (applicant) {
      let applicants_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) });
      // from WFH packging
      let insert_wfh = WfhObj.getAddWfhRequest(body, applicant, body.obj_wfh_type, applied_manager);

      //If wfh request gets auto approved from 1st approver, generating a log
      if (insert_wfh.obj_wfh.approvals[0].reason == 'Auto Approved') {
        insert_wfh.obj_wfh.appliction_log.push({
          approver_id: insert_wfh.obj_wfh.approvals[0].approver_id,
          date_created: new Date(),
          status: 'Approved',
          reason: 'Auto Approved',
        });
      }

      if (insert_wfh) {
        const wfh = new WfhModel({
          ...insert_wfh.obj_wfh,
        });

        const apply_wfh = await wfh.save();

        if (apply_wfh) {
          /* Store the approval */
          let arr_users_id = [];

          apply_wfh.approvals.forEach((element) => {
            arr_users_id.push(ObjectId(element.approver_id));
          });

          arr_users_id.push(ObjectId(body.user_id));

          let arr_users = await UsersModel.aggregate([
            { $match: { _id: { $in: arr_users_id } } },
            { $project: { first_name: 1, last_name: 1, middle_name: 1 } },
          ]);

          let approver_id = '';

          for (let i = 0; i < apply_wfh.approvals.length; i++) {
            if (apply_wfh.approvals[i].status.toLowerCase() == 'processing') {
              approver_id = apply_wfh.approvals[i].approver_id;
            }
          }

          //This will send the portal notifications to Approvers

          // await NotificationHelper.saveNotification(
          //     req.body.applied_manager,
          //     req.body.applied_manager,
          //     "New " +
          //         req.body.request_type +
          //         " Request for " +
          //         applicant.first_name +
          //         "  " +
          //         applicant.last_name,
          //     "WFH Request Has Been Submitted",
          //     "/admin-central#requests",
          // )

          // let UserDetails = await UsersModel.find({ _id: req.body.user_id });

          await NotificationHelper.saveNotification(
            body.user_id,
            body.user_id,
            'Your WFH Request is Created. Please check your HR Self service for more details',
            'WFH Request Created',
            '/dashboards/myhr#wfh'
          );

          if (approver_id != '') {
            /* Email to first Approver */
            let first_approver = await UsersModel.findOne({ _id: ObjectId(approver_id) }).select({
              email: 1,
              personal: 1,
              first_name: 1,
              last_name: 1,
              middle_name: 1,
            });

            /* Send email to approver */
            // email packaging

            /* changing email content to route it to request info page on click of the link */
            let approver_email = Emails.funWFHRequestApprovalManager(
              apply_wfh,
              applicants_company,
              applicant,
              first_approver
            );
            let req_id = apply_wfh._id.toString();
            let req_type = 'wfh';
            let combinedReqIdAndType = req_id + '/' + req_type;
            if (req.headers.host == 'localhost:4001') {
              approver_email.body = approver_email.body.replace(
                'https://hrdirect-staging.devnhr.com',
                'http://localhost:5102'
              );
              approver_email.body = approver_email.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102');
            }
            approver_email.body = approver_email.body.replace(
              'dashboards/my-team#requests',
              'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
            );

            sendEmail(first_approver.email, approver_email.subject, approver_email.body);

            /* Send notifications to approver */
            notifications('approver', 'approver', apply_wfh, first_approver, applicant);
          } else {
            /* Send Email to applicant */

            let applicant_email = Emails.funWFHApproved(apply_wfh, applicants_company, applicant, arr_users);
            sendEmail(applicant.email, applicant_email.subject, applicant_email.body);

            let approver = await UsersModel.findOne({ _id: ObjectId(apply_wfh.approvals[0].approver_id) });

            /* Send Notification to Applicant */
            notifications('applicant', 'approved', apply_wfh, approver, applicant);
          }

          /* Send Email to applicant */
          let applicant_email = Emails.funNewWFHRequest(apply_wfh, applicants_company, applicant, arr_users);
          sendEmail(applicant.email, applicant_email.subject, applicant_email.body);

          res.json({ success: true, message: 'Success', data: apply_wfh });
        } else {
          res.json({ success: false, message: 'Unbale to apply for leave. Please try again later.', data: [] });
        }
      } else {
        res.json({ success: false, message: 'Unbale to apply for leave. Please try again later.', data: [] });
      }
      console.log(insert_wfh, 'insert_wfh');
      res.send(insert_wfh);
    } else {
      res.json({ success: false, message: 'User not found.', data: [] });
    }
  } catch (error) {
    console.log(error, '--error');
    res.json({ success: false, message: error.message, data: [] });
  }
});

/* Approve WFH request */
router.post('/approve_wfh', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    let obj_approver = await UsersModel.findOne({ _id: ObjectId(body.manager_id) });

    let approver = JSON.parse(JSON.stringify(obj_approver));

    let wfh_req = await WfhModel.findOne({ _id: ObjectId(body.wfh_id) });

    let WFHObj = new Wfh();
    let WFHEmail = new WfhEmail();

    if (applicant && approver) {
      let applicant_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      let arr_users_id = [];

      wfh_req.approvals.forEach((element) => {
        arr_users_id.push(ObjectId(element.approver_id));
      });
      if (body.approver_attachment.length > 0) {
        if (wfh_req.approvals && wfh_req.approvals.length > 0) {
          for (let approval_index = 0; approval_index < wfh_req.approvals.length; approval_index++) {
            const element = wfh_req.approvals[approval_index];
            if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
              element.hide_attachment = body.hide_attachment;
              element.approver_attachment = body.approver_attachment;
              break;
            }
          }
        }
      }
      // if(wfh_req.approvals[0].approver_attachment){
      //     wfh_req.approvals[0].approver_attachment.push(...body.approver_attachment)
      // }else{
      //     wfh_req.approvals[0].approver_attachment = body.approver_attachment
      // }
      // wfh_req.approvals[0].hide_attachment = body.hide_attachment

      arr_users_id.push(ObjectId(body.user_id));

      let arr_users = await UsersModel.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
      ]);

      let approveWfh = {};

      if (body.admin) {
        approveWfh = WFHObj.funAdminWFHApprove(wfh_req, body.reason, approver, arr_users);
      } else {
        approveWfh = WFHObj.funManagerWFHApprove(wfh_req, body.reason, approver, arr_users);
      }

      if (approveWfh) {
        let obj_requestInfo = approveWfh.obj_requestInfo;

        let update_match = {
          _id: ObjectId(body.wfh_id),
        };

        if (obj_requestInfo.status.toLowerCase() == 'Completed') {
          obj_requestInfo.app_status = 'Approved';
        } else {
          obj_requestInfo.app_status = 'Processing';
        }

        let update_data = {
          $set: obj_requestInfo,
        };

        let update_wfh = await WfhModel.findOneAndUpdate(update_match, update_data, { new: true });

        if (update_wfh) {
          if (obj_requestInfo.status == 'Completed') {
            /* Email to Applicant */
            if (body.admin) {
              let applicant_email = WFHEmail.funWFHApprovedAdmin(
                wfh_req,
                applicant_company,
                applicant,
                arr_users,
                body.reason
              );
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            } else {
              let applicant_email = WFHEmail.funWFHApproved(wfh_req, applicant_company, applicant, arr_users, body.reason);
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            }

            //   if (obj_requestInfo.payroll_process) createPayitems(obj_requestInfo, approver);

            /* Send Notification to Applicant */
            notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
          } else {
            /* Email to Next approver */
            let approver_to_email = approveWfh.arr_user_email[0].email;
            let approver_email = WFHEmail.funWFHRequestApprovalManager(
              wfh_req,
              applicant_company,
              applicant,
              approveWfh.arr_user_email[0]
            );

            /* changing email content to route it to request info page on click of the link */
            let req_id = update_wfh._id.toString();
            let req_type = 'wfh';
            let combinedReqIdAndType = req_id + '/' + req_type;
            if (req.headers.host == 'localhost:4001') {
              approver_email.body = approver_email.body.replace(
                'https://hrdirect-staging.devnhr.com',
                'http://localhost:5102'
              );
              approver_email.body = approver_email.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102');
            }
            approver_email.body = approver_email.body.replace(
              'dashboards/my-team#requests',
              'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
            );

            sendEmail(approver_to_email, approver_email.subject, approver_email.body);

            /* Send Notification to next Approver */
            notifications('approver', 'approver', obj_requestInfo, approveWfh.arr_user_email[0], applicant);
          }
          return res.status(200).json({ success: true, message: 'Success.', data: update_wfh });
        } else {
          return res
            .status(200)
            .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
        }
      } else {
        return res
          .status(200)
          .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
      }
    } else {
      return res
        .status(200)
        .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

/* Reject WFH request */
router.post('/reject_wfh', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    let obj_rejecter = await UsersModel.findOne({ _id: ObjectId(body.manager_id) });

    let rejecter = JSON.parse(JSON.stringify(obj_rejecter));

    let wfh_req = await WfhModel.findOne({ _id: ObjectId(body.wfh_id) });

    let WfhObj = new Wfh();
    let WFHEmail = new WfhEmail();

    if (applicant && rejecter && wfh_req) {
      let applicant_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      let arr_users_id = [];

      wfh_req.approvals.forEach((element) => {
        arr_users_id.push(ObjectId(element.approver_id));
      });
      if (body.approver_attachment.length > 0) {
        if (wfh_req.approvals && wfh_req.approvals.length > 0) {
          for (let approval_index = 0; approval_index < wfh_req.approvals.length; approval_index++) {
            const element = wfh_req.approvals[approval_index];
            if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
              element.hide_attachment = body.hide_attachment;
              element.approver_attachment = body.approver_attachment;
              break;
            }
          }
        }
      }
      // if(wfh_req.approvals[0].approver_attachment){
      //     wfh_req.approvals[0].approver_attachment.push(...body.approver_attachment)
      // }else{
      //     wfh_req.approvals[0].approver_attachment = body.approver_attachment
      // }
      // wfh_req.approvals[0].hide_attachment = body.hide_attachment

      arr_users_id.push(ObjectId(body.user_id));

      let arr_users = await UsersModel.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
      ]);

      let rejectWfh = {};

      if (body.admin) {
        rejectWfh = WfhObj.funAdminWFHReject(wfh_req, body.reason, rejecter, arr_users, applicant_company.rejection_flow);
      } else {
        rejectWfh = WfhObj.funManagerWFHReject(wfh_req, body.reason, rejecter, arr_users, applicant_company.rejection_flow);
      }

      if (rejectWfh) {
        let obj_requestInfo = rejectWfh.obj_requestInfo;

        let update_match = {
          _id: ObjectId(body.wfh_id),
        };

        if (obj_requestInfo.status.toLowerCase() == 'cancelled') {
          obj_requestInfo.app_status = 'Rejected';
        } else {
          obj_requestInfo.app_status = 'Processing';
        }

        let update_data = {
          $set: obj_requestInfo,
        };

        let update_wfh = await WfhModel.findOneAndUpdate(update_match, update_data, { new: true });

        if (update_wfh) {
          if (obj_requestInfo.status == 'Cancelled') {
            if (body.admin) {
              let applicant_email = WFHEmail.funWFHRejectedAdmin(
                wfh_req,
                applicant_company,
                applicant,
                arr_users,
                body.reason
              );
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            } else {
              let applicant_email = WFHEmail.funWFHRejected(wfh_req, applicant_company, applicant, arr_users, body.reason);
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            }

            /* Send Notification to Applicant */
            notifications('applicant', 'rejected', obj_requestInfo, rejecter, applicant);
          } else {
            /* Email to Next approver */
            let approver_to_email = rejectWfh.arr_user_email[0].email;
            let approver_email = WFHEmail.funWFHRequestApprovalManager(
              wfh_req,
              applicant_company,
              applicant,
              rejectWfh.arr_user_email[0]
            );
            /* changing email content to route it to request info page on click of the link */
            let req_id = update_wfh._id.toString();
            let req_type = 'wfh';
            let combinedReqIdAndType = req_id + '/' + req_type;
            if (req.headers.host == 'localhost:4001') {
              approver_email.body = approver_email.body.replace(
                'https://hrdirect-staging.devnhr.com',
                'http://localhost:5102'
              );
              approver_email.body = approver_email.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102');
            }
            approver_email.body = approver_email.body.replace(
              'dashboards/my-team#requests',
              'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
            );

            sendEmail(approver_to_email, approver_email.subject, approver_email.body);

            /* Send Notification to next Approver */
            notifications('approver', 'approver', obj_requestInfo, rejectWfh.arr_user_email[0], applicant);
          }
          return res.status(200).json({ success: true, message: 'Success.', data: update_wfh });
        } else {
          return res
            .status(200)
            .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
        }
      } else {
        return res
          .status(200)
          .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
      }
    } else {
      return res
        .status(200)
        .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

/* Reassign WFH request */
router.post('/reassign_wfh', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });
    /* Reassigning manager */
    let approver = await UsersModel.findOne({ _id: ObjectId(body.manager_id) });

    let reassigned_manager = await UsersModel.findOne({ _id: ObjectId(body.reassign_manager_id) });

    let wfh_req = await WfhModel.findOne({ _id: ObjectId(body.wfh_id) });

    let WFHObj = new Wfh();
    let WFHEmail = new WfhEmail();

    if (body.approver_attachment.length > 0) {
      if (wfh_req.approvals && wfh_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < wfh_req.approvals.length; approval_index++) {
          const element = wfh_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = body.hide_attachment;
            element.approver_attachment = body.approver_attachment;
            break;
          }
        }
      }
    }
    // if(wfh_req.approvals[0].approver_attachment){
    //     wfh_req.approvals[0].approver_attachment.push(...body.approver_attachment)
    // }else{
    //     wfh_req.approvals[0].approver_attachment = body.approver_attachment
    // }
    // wfh_req.approvals[0].hide_attachment = body.hide_attachment

    if (applicant && approver && reassigned_manager) {
      let applicant_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      /* Reassign leave request */
      let reassign_wfh = WFHObj.funReassignWFH(wfh_req, body.reason, approver, reassigned_manager, body.admin);

      let update_match = {
        _id: ObjectId(body.wfh_id),
      };

      let update_data = {
        $set: reassign_wfh,
      };

      let update_wfh = await WfhModel.findOneAndUpdate(update_match, update_data, { new: true });

      console.log(wfh_req);

      if (update_wfh) {
        /* Send email to apporver */
        let approver_to_email = reassigned_manager.email;
        let approver_email = WFHEmail.funWFHRequestApprovalManager(
          wfh_req,
          applicant_company,
          applicant,
          reassigned_manager
        );
        /* changing email content to route it to request info page on click of the link */
        let req_id = update_wfh._id.toString();
        let req_type = 'wfh';
        let combinedReqIdAndType = req_id + '/' + req_type;
        if (req.headers.host == 'localhost:4001') {
          approver_email.body = approver_email.body.replace('https://hrdirect-staging.devnhr.com', 'http://localhost:5102');
          approver_email.body = approver_email.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102');
        }
        approver_email.body = approver_email.body.replace(
          'dashboards/my-team#requests',
          'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
        );
        sendEmail(approver_to_email, approver_email.subject, approver_email.body);
        /* Send Notification to next Approver */
        notifications('approver', 'approver', update_wfh, reassigned_manager, applicant);

        res.status(200).json({ success: true, message: 'Success.', data: update_wfh });
      } else {
        res
          .status(200)
          .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
      }
    } else {
      res.status(200).json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

/* Withdraw WFH request */
router.post('/withdraw_wfh', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    let WFHEmail = new WfhEmail();

    if (applicant) {
      let logs = {
        approver_id: applicant._id,
        date_created: new Date(),
        status: 'WFH Request Withdrawn.',
        reason: '',
      };

      let update_data = {
        $set: {
          status: 'Withdrawn',
          app_status: 'Withdrawn',
          dateUpdated: new Date(),
          updatedBy: ObjectId(body.user_id),
          'approvals.$[].status': 'Withdrawn by Employee',
        },
        $push: { appliction_log: logs },
      };

      let update_match = {
        _id: ObjectId(body.wfh_id),
        // "approvals.status": "Processing",
      };

      let update_wfh = await WfhModel.findOneAndUpdate(update_match, update_data, { new: true });

      // console.log(update_wfh, '------wfh');

      if (update_wfh != null) {
        let update_data = {
          $set: {
            'approvals.$.status': 'Withdrawn by Employee',
          },
        };

        let update_match = {
          _id: ObjectId(body.wfh_id),
          'approvals.status': 'Processing',
        };

        let update_wfh_approval = await WfhModel.findOneAndUpdate(update_match, update_data, { new: true });

        /* Email to Applicant */
        let applicants_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
        let applicant_email = WFHEmail.funWFHWithdraw(update_wfh, applicants_company, applicant);
        /* Send Email to Applicant */
        sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
        /* Send Notification to Applicant */
        notifications('applicant', 'withdrawn', update_wfh, applicant, applicant);

        res.status(200).json({ success: true, message: 'Success', data: update_wfh });
      } else {
        res.status(200).json({ success: false, message: 'Failed to Withdraw request, Please try again later...', data: [] });
      }
    } else {
      res.status(200).json({ success: false, message: 'User not found', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

/* Check the existing wfh for the applied period*/
hasExistingWfhCheck = function (user_wfh, fromDate, toDate) {
  let flag = [];

  if (user_wfh.length > 0) {
    for (let i = 0; i < user_wfh.length; i++) {
      let currentWfh = user_wfh[i];
      if (
        (new Date(currentWfh.from_date) <= new Date(fromDate) && new Date(fromDate) <= new Date(currentWfh.to_date)) ||
        (new Date(currentWfh.from_date) <= new Date(toDate) && new Date(toDate) <= new Date(currentWfh.to_date)) ||
        (new Date(fromDate) <= new Date(currentWfh.from_date) && new Date(currentWfh.from_date) <= new Date(toDate)) ||
        (new Date(fromDate) <= new Date(currentWfh.to_date) && new Date(currentWfh.to_date) <= new Date(toDate))
      ) {
        /**
         * Push true value to indicate that there is an existing leave.
         * If all array values are false, then there is no exisiting leave.
         * Else, if all array values has at least one true value, then there is exisiting leave.
         * */
        flag.push(true);
      }
    }
  }

  if (flag.length > 0 && flag.includes(true)) {
    this.snack = true;
    this.snackColor = 'red';
    this.snackText = 'There is already a Wfh application for this period!';
  }
  const result = flag.length < 1 || !flag.includes(true) ? false : true;

  return result;
};

/* Get company holiday calendar by dates */
function getDeclaredHolidays(holiday_calendar) {
  try {
    let getDays = function (startDate, endDate) {
      const duration = endDate - startDate;
      const interval = 1000 * 60 * 60 * 24; // calculation for a day
      const steps = duration / interval;
      return Array.from({ length: steps + 1 }, (v, i) => new Date(startDate.valueOf() + interval * i));
    };

    let declared_holidays = [];

    for (let index = 0; index < holiday_calendar.length; index++) {
      if (holiday_calendar[index].from_date == holiday_calendar[index].to_date) {
        declared_holidays.push(holiday_calendar[index].from_date);
      } else {
        let holidays = getDays(new Date(holiday_calendar[index].from_date), new Date(holiday_calendar[index].to_date));
        for (let i = 0; i < holidays.length; i++) {
          declared_holidays.push(holidays[i].toISOString().substr(0, 10));
        }
      }
    }

    return declared_holidays;
  } catch (e) {
    return e;
  }
}

/* Get employees weekend */
function getEmployeesWeekend(work_schedule) {
  try {
    let employee_weekends = [];

    if (work_schedule.name != 'Shift Based' && work_schedule.name != 'Alternate Weekends') {
      work_schedule.off_days.forEach((off) => {
        employee_weekends.push(off.value);
      });
    }

    return employee_weekends;
  } catch (e) {
    return e;
  }
}

/* Get wfh for shift for Alternate weekend based employees */
async function getShiftandAlternateEmployees(work_schedule, wfh_info, applicant) {
  try {
    if (work_schedule.toLowerCase() == 'shift based') {
      let scheduletype = 'shift';
      const listDate = [];
      const startDate = wfh_info.from_date;
      const endDate = wfh_info.to_date;
      const dateMove = new Date(startDate);
      let strDate = startDate;

      while (strDate < endDate) {
        strDate = dateMove.toISOString().slice(0, 10);
        listDate.push(strDate);
        dateMove.setDate(dateMove.getDate() + 1);
      }

      if (listDate.length == 0) {
        listDate.push(wfh_info.from_date);
      }

      let getShiftsCount = await getOffDays(scheduletype, wfh_info.user_id, listDate);

      let no_of_days = listDate.length - getShiftsCount;
      wfh_info.no_of_days = parseFloat(no_of_days);
      return {
        no_of_days: no_of_days,
      };
    } else if (work_schedule.toLowerCase() == 'alternate weekends') {
      let scheduletype = 'alternate week';
      const listDate = [];
      const startDate = leave_info.from_date;
      const endDate = leave_info.to_date;
      const dateMove = new Date(startDate);
      let strDate = startDate;

      while (strDate < endDate) {
        strDate = dateMove.toISOString().slice(0, 10);
        listDate.push(strDate);
        dateMove.setDate(dateMove.getDate() + 1);
      }
      if (listDate.length == 0) {
        listDate.push(leave_info.from_date);
      }

      let getShiftsCount = await getOffDays(scheduletype, wfh_info.user_id, listDate);
      let no_of_days = listDate.length - getShiftsCount;
      wfh_info.no_of_days = parseFloat(no_of_days);
      return {
        no_of_days: no_of_days,
      };
    }
  } catch (error) {
    return error;
  }
}

/* No.of days of WFH */
router.post('/get_number_of_days', validateToken, async (req, res) => {
  const moment = require('moment');

  /*
        {
            "user_id": "616e6d5195ae5b3f1adc87dc",
            "from_date": "2022-09-02",
            "to_date": "2022-09-02",
            "obj_wfh_type":{
                "wfh_type": "Working day"
            }
        }
    */
  try {
    const body = req.body;

    const applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) }).select({
      personal: 1,
      reporting: 1,
      employment: 1,
      date_of_joining: 1,
    });

    /* Get holiday calendar of the organization */
    // const configuration = await leaveConfigModel.findOne({}).select({ holiday_calendar: 1 });
    const configuration = await ConfigurationModel.findOne({}).select({ holiday_calendar: 1 }).lean();
    // const wfhconfiguration = await wfhConfigModel.findOne({ company_ID: req.company_id }).select({ wfhConds: 1 });
    const wfhconfiguration = await ConfigurationModel.findOne({}).select({ wfhConds: 1 }).lean();

    // console.log(configuration, '---conf');

    let WfhObj = new Wfh();

    // console.log(wfhconfiguration, '------wfhcond');
    /*
     * Loop through wfh conditions
     * Check the eligibility
     * check the access / probabtion
     * check the max number of days
     * -> call the already exisiting function
     *
     */
    for (let index = 0; index < wfhconfiguration.wfhConds.length; index++) {
      var wfh_condition = wfhconfiguration.wfhConds[index];
      let match = {};
      let project = {};

      // based on the lapse condition get the max number of days allowed to apply for wfh
      if (wfh_condition.lapse_condition) {
        var lapse_date_end = new Date(wfh_condition.lapse_date);
        var lapse_date_begin = new Date(lapse_date_end.getTime() - 365 * 24 * 60 * 60 * 1000);

        // console.log(lapse_date_end,"-------lapse_date_end",lapse_date_begin,"------lapse_date_begin")

        match = {
          $match: {
            user_id: body.user_id,
            status: { $nin: ['Cancelled', 'Withdrawn'] },
            from_date: { $gte: lapse_date_begin, $lt: lapse_date_end },
            to_date: { $gt: lapse_date_begin, $lte: lapse_date_end },
          },
        };
      } else {
        match = {
          $match: {
            user_id: body.user_id,
            status: { $nin: ['Cancelled', 'Withdrawn'] },
          },
        };
      }

      let users_wfh_total_prevdays = await WfhModel.aggregate([
        match,
        {
          $addFields: { days: { $toDouble: '$no_of_days' } },
        },
        {
          $group: {
            _id: null,
            total_days: { $sum: '$days' },
          },
        },
      ]);

      let eligibilityCheck = WfhObj.funCheckUserEligibility(wfh_condition, applicant);

      if (eligibilityCheck) {
        // check for wfh access duration
        let accessCheck = WfhObj.funCheckUserAccess(wfh_condition, applicant);

        if (accessCheck) {
          // console.log("max number of days")
          if (users_wfh_total_prevdays.length == 0) {
            // console.log(users_wfh_interval_prevdays,"-------users_wfh_interval_prevdays")
            users_wfh_total_prevdays = [{ _id: null, total_days: 0 }];
          }
          let maxdayCheck = WfhObj.funCheckUserMaxDays(wfh_condition, applicant, users_wfh_total_prevdays);

          if (maxdayCheck) {
            let match = {
              $match: {
                user_id: body.user_id,
                status: { $nin: ['Cancelled', 'Withdrawn'] },
              },
            };

            let project = {
              $project: {
                _id: 0,
                from_date: 1,
                to_date: 1,
                user_id: 1,
                no_of_days: 1,
              },
            };

            const user_wfh = await WfhModel.aggregate([match, project]);
            let from_date = new Date(body.from_date);
            // from_date.setHours(from_date.getHours() + 4)
            let to_date = new Date(body.to_date);
            // to_date.setHours(to_date.getHours() + 4)

            let existing_wfhs = hasExistingWfhCheck(user_wfh, from_date, to_date);

            if (!existing_wfhs) {
              if (applicant && configuration) {
                let holiday_calendar = configuration.holiday_calendar;

                let declared_holidays = getDeclaredHolidays(holiday_calendar);
                /* Employee work schedule */
                const applicants_work_schedule = await ConfigurationModel.aggregate([
                  { $match: { 'company_work_schedules.name': applicant.personal.work_schedule } },
                  {
                    $project: {
                      weekends: {
                        $filter: {
                          input: '$company_work_schedules',
                          as: 'schedule',
                          cond: { $eq: ['$$schedule.name', applicant.personal.work_schedule] },
                        },
                      },
                    },
                  },
                ]);

                let weekends = [];

                if (
                  applicants_work_schedule &&
                  applicants_work_schedule.length > 0 &&
                  applicants_work_schedule[0].weekends &&
                  applicants_work_schedule[0].weekends.length > 0
                ) {
                  weekends = getEmployeesWeekend(applicants_work_schedule[0].weekends[0]);
                }

                if (
                  applicant.personal.work_schedule?.toLowerCase() == 'shift based' ||
                  applicant.personal.work_schedule?.toLowerCase() == 'alternate weekends'
                ) {
                  let wfhs_info = await getShiftandAlternateEmployees(applicant.personal.work_schedule, body, applicant);
                  res.json({ success: true, message: 'Success', data: wfhs_info });
                } else {
                  // wfh package to get the number of days.
                  let number_of_days = WfhObj.getNumberofDays(body, declared_holidays, weekends, body.obj_wfh_type);
                  if (body.half_day) number_of_days.no_of_days = number_of_days.no_of_days / 2;
                  // check the restriction condition if it's false then return the number of days directly
                  if (wfh_condition.restriction_conditional && number_of_days) {
                    let startdate;
                    let endtdate;
                    let start_number;
                    let end_number;
                    let start_year = moment(body.from_date, 'YYYY-MM-DD').year();
                    let end_year = moment(body.to_date, 'YYYY-MM-DD').year();

                    if (wfh_condition.restriction_type == 'weekly') {
                      start_number = moment(body.from_date, 'YYYY-MM-DD').isoWeek();
                      end_number = moment(body.to_date, 'YYYY-MM-DD').isoWeek();

                      end_number = end_number + (end_year - start_year) * 52;

                      startdate = moment().isoWeek(start_number).year(start_year).startOf('week').toDate();
                      endtdate = moment().isoWeek(end_number).year(end_year).endOf('week').toDate();
                    } else if (wfh_condition.restriction_type == 'monthly') {
                      start_number = moment(body.from_date, 'YYYY-MM-DD').month();
                      end_number = moment(body.to_date, 'YYYY-MM-DD').month();

                      end_number = end_number + (end_year - start_year) * 12;

                      startdate = moment().month(start_number).year(start_year).startOf('month').toDate();
                      endtdate = moment().month(end_number).year(end_year).endOf('month').toDate();
                    }

                    match = {
                      $match: {
                        user_id: body.user_id,
                        status: { $nin: ['Cancelled', 'Withdrawn'] },
                        from_date: { $gte: startdate, $lt: endtdate },
                        to_date: { $gt: startdate, $lte: endtdate },
                      },
                    };

                    let users_wfh_interval_prevdays = await WfhModel.aggregate([
                      match,
                      {
                        $addFields: { days: { $toDouble: '$no_of_days' } },
                      },
                      {
                        $group: {
                          _id: null,
                          total_days: { $sum: '$days' },
                        },
                      },
                    ]);

                    if (users_wfh_interval_prevdays.length == 0) {
                      users_wfh_interval_prevdays = [{ _id: null, total_days: 0 }];
                    }

                    // restriction check
                    let restrictionCheck = WfhObj.funCheckUserRestrictionCheck(
                      wfh_condition,
                      number_of_days,
                      users_wfh_interval_prevdays,
                      start_number,
                      end_number
                    );

                    if (restrictionCheck) {
                      res.json({ success: true, message: 'Success1', data: number_of_days });
                    } else {
                      if (wfhconfiguration.wfhConds.length == index + 1) {
                        res.json({
                          success: false,
                          message: 'You already reach the max restriction for this duration to apply Work From Home.',
                          data: [],
                        });
                      }
                    }
                  } else {
                    // check if we got number of days from the pacakge
                    if (number_of_days) {
                      res.json({ success: true, message: 'Success2', data: number_of_days });
                    }
                  }
                }
              } else {
                res.json({ success: false, message: 'User not found.', data: [] });
              }
            } else {
              res.json({ success: false, message: 'You already applied for WFH within this period.', data: [] });
            }
          } else {
            if (wfhconfiguration.wfhConds.length == index + 1) {
              res.json({ success: false, message: 'You reach the max Work From Home days limit.', data: [] });
            }
          }
        } else {
          if (wfhconfiguration.wfhConds.length == index + 1) {
            res.json({
              success: false,
              message: 'You are not eligible for this duration to apply Work From Home.',
              data: [],
            });
          }
        }
      } else {
        if (wfhconfiguration.wfhConds.length == index + 1) {
          res.json({ success: false, message: 'You are not eligible for applying Work From Home.', data: [] });
        }
      }
    }
  } catch (e) {
    console.log('#log', e);
    res.json({ success: false, message: e.message, data: [] });
  }
});

/* Create notfification for WFH requests */
async function notifications(type, subType, obj_request, approver, applicant) {
  try {
    if (type == 'approver') {
      let notification = {
        user_id: [String(approver._id)],
        read_by: [],
        notification_type: 'WFH Request Pending Approval',
        notification_text:
          'New WFH Request from ' + applicant.first_name + ' ' + applicant.last_name + ' is pending for your approval',
        created_by: approver._id,
        url: '/dashboards/my-team#requests',
        createdDate: new Date(),
      };

      const notify = new notificationModel(notification);
      let insert_notification = await notify.save();
    } else if (type == 'applicant') {
      if (subType == 'approved') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'WFH Request Approved',
          notification_text: 'Your WFH Request is Approved. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#wfh',
          createdDate: new Date(),
        };

        const notify = new notificationModel(notification);
        let insert_notification = await notify.save();
      } else if (subType == 'withdrawn') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'WFH Request Withdrawn',
          notification_text: 'Your WFH Request is Withdrawn. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#wfh',
          createdDate: new Date(),
        };

        const notify = new notificationModel(notification);
        let insert_notification = await notify.save();
      } else if (subType == 'rejected') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'WFH Request Rejected',
          notification_text: 'Your WFH Request is Rejected. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#wfh',
          createdDate: new Date(),
        };

        const notify = new notificationModel(notification);
        let insert_notification = await notify.save();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/* Send email to approvers and applicant */
function sendEmail(toEmail, subject, body) {
  try {
    const msg = {
      Source: 'donotreply@nathanhr.ae',
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Data: body,
            Charset: 'UTF-8',
          },
          Text: {
            Data: body,
            Charset: 'UTF-8',
          },
        },
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
      },
    };
    ses.sendEmail(msg, async (err, data) => {
      if (err) {
        throw err;
      }
    });
  } catch (error) {}
}

/* Only for mobile get the approval array */

router.get('/fetch_approver_details/:_id', validateToken, async (req, res) => {
  const request_id = req.params._id;
  //let approvals = req.body;
  //let approvals = req.body;

  //const request_id=req.body[0].id;

  let ids = [];

  let result = [];

  var resultFinal = [];

  try {
    let lookUpAssetsinfo = {
      $lookup: {
        from: 'users',
        localField: 'string_id',
        foreignField: '_id',
        as: 'approver_info',
      },
    };

    await WfhModel.aggregate([
      { $match: { _id: ObjectId(request_id) } },
      { $unwind: '$approvals' },
      { $addFields: { string_id: { $toObjectId: '$approvals.approver_id' } } },

      lookUpAssetsinfo,

      {
        $project: {
          approvals: 1,
          'approver_info._id': 1,
          'approver_info.first_name': 1,
          'approver_info.last_name': 1,
          'approver_info.image_url': 1,
        },
      },
    ]).exec((err, result) => {
      if (err) throw err;
      console.log(result);

      if (result.length != 0) {
        for (let i = 0; i < result.length; i++) {
          let data = {
            _id: result[i].approvals.approver_id,
            first_name: result[i].approver_info[0].first_name,
            last_name: result[i].approver_info[0].last_name,
            image_url: result[i].approver_info[0].image_url,
            status: result[i].approvals.status,
            approved_date: result[i].approvals.approved_date,
            // date_created: result[i].approvals.date_created,
            reason: result[i].approvals.reason,
          };
          resultFinal.push(data);
        }
      }
      res.status(200).send(resultFinal);
    });

    //res.status(200).send(resultFinal);
  } catch (err) {
    console.log(err, '#log');
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
