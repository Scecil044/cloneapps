const express = require('express');
const router = express.Router();
const WfhModel = require('../../models/wfh');
const LeavesModel = require('../../models/leaves');
const UsersModel = require('../../models/users.model');
const CompaniesModel = require('../../models/companies.model');
const ConfigurationModel = require('../../models/configuration.model');
const LeavesTypesModel = require('../../models/leavesConfig');
// const ShiftsModel = require('../../models/shifts');
const notificationMessageModel = require('../../models/notificationsmessage');
const sgMail = require('@sendgrid/mail');
const validateToken = require('../../../utils').validateAccessToken;
const ObjectId = require('mongoose').Types.ObjectId;
// const NotificationHelper = require('../helper/notification_helper');
const { Leave } = require('@nathangroup/leave');
const { LeaveEmail } = require('@nathangroup/leave_email');
// const LeavesMobileApi = require('./mobile/leaves');
const _ = require('lodash');

var moment = require('moment-timezone');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const dateNow = new Date().toISOString().substr(0, 10);

const AWS = require('aws-sdk');
const ses = new AWS.SES({
  // accessKeyId: process.env.ACCESS_KEY,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1',
});

// new company config

router.post('/company/users_active_leave/all', async (req, res) => {
  let company_ID = req.body.company_ID;
  try {
    let users = await UsersModel.distinct('_id', { company_ID: company_ID });

    // console.log(users)
    let match = {
      $match: {
        user_id: { $in: users },
        status: { $nin: ['Cancelled', 'Withdrawn'] },
      },
    };
    const leaves = await LeavesModel.aggregate([{ $set: { user_id: { $toObjectId: '$user_id' } } }, match]);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ui upgrade starts

router.post('/get-team-leaves', async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(new Date(req.body.end_date).setHours(23, 59, 59));

    let user = await UsersModel.findById(user_id);

    let aggregator = [
      {
        $match: {
          from_date: {
            $gte: startDate,
            $lte: endDate,
          },
          to_date: {
            $gte: startDate,
            $lte: endDate,
          },
          status: {
            $in: ['Completed', 'completed', 'Processing'],
          },
        },
      },
      {
        $set: {
          user_id: {
            $convert: {
              input: '$user_id',
              to: 'objectId',
              onError: '',
              onNull: '',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'user.reporting.team': user.reporting.team,
        },
      },
      {
        $project: {
          certificate: 1,
          approvals: 1,
          appliction_log: 1,
          leave_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          remaining_leaves: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          app_status: 1,
          user_name: 1,
          date_created: 1,
          leave_fields: 1,
          'user.first_name': 1,
          'user.last_name': 1,
          'user.email': 1,
          'user.image_url': 1,
        },
      },
    ];

    let leaves = await LeavesModel.aggregate(aggregator);

    // if (leaves.length === 0) {
    //   throw new Error("No records found")
    // }

    res.status(200).send({
      status: 'OK',
      data: leaves,
    });
  } catch (error) {
    res.status(404).send({
      status: 'FAIL',
      error: error,
    });
  }
});

router.get('/get-upcoming-leaves-by-manager/:managerId', async (req, res) => {
  try {
    let today = new Date();
    today.setHours(00, 00, 00, 00);
    let postDate = new Date();
    postDate.setMonth(postDate.getMonth() + 2);

    let aggregator = [
      {
        $addFields: {
          user_id: {
            $toObjectId: '$user_id',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'user.reporting.manager': req.params.managerId,
        },
      },
      {
        $match: {
          $or: [
            {
              from_date: {
                $gte: today,
                $lte: postDate,
              },
            },
            {
              to_date: {
                $gte: today,
                $lte: postDate,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          leave_condition: 1,
          certificate: 1,
          approvals: 1,
          appliction_log: 1,
          leave_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          remaining_leaves: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          app_status: 1,
          user_name: 1,
          date_created: 1,
          no_of_hours: 1,
          reference_number: 1,
          'user.first_name': 1,
          'user.last_name': 1,
          'user.image_url': 1,
        },
      },
      {
        $sort: {
          from_date: 1,
        },
      },
    ];
    let leaves = await LeavesModel.aggregate(aggregator);
    res.send(leaves);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/category/:eligibility', validateToken, async (req, res) => {
  try {
    const { company_id } = req.body.company_id;
    const eligibility = req.params.eligibility;
    const findWithCompanyId = { company_ID: company_id };
    if (eligibility == 'Department') {
      const departments = await ConfigurationModel.aggregate([
        { $match: findWithCompanyId },
        { $project: { _id: 0, departments: '$dept.name' } },
      ]);
      res.json(departments);
    } else if (eligibility == 'Company name') {
      const companies = await /*  */
      CompaniesModel.aggregate([{ $match: findWithCompanyId }, { $project: { company_name: 1 } }]);
      res.json(companies);
    } else if (eligibility == 'Teams') {
      const teams = await ConfigurationModel.aggregate([
        { $match: findWithCompanyId },
        // {$unwind:"$dept.teams"},
        { $project: { _id: 0, teams: '$dept.teams.name' } },
      ]);
      res.json(teams);
    } else if (eligibility == 'Employee type') {
      let array_employee_type = ['Employee', 'Manager'];
      res.json(array_employee_type);
    } else if (eligibility === 'Cost center') {
      const costCenters = await ConfigurationModel.aggregate([
        { $match: findWithCompanyId },
        { $project: { _id: 0, costCenters: '$costCenterOptions' } },
      ]);
      res.json(costCenters);
    } else if (eligibility == 'Gender') {
      let array_gender = ['Male', 'Female', 'Not Disclosed'];
      res.json(array_gender);
    } else if (eligibility == 'Religion') {
      const religions = await ConfigurationModel.aggregate([
        { $match: findWithCompanyId },
        { $project: { _id: 0, religions: '$religion' } },
      ]);
      res.json(religions);
    } else if (eligibility == 'Designation') {
      const designations = await ConfigurationModel.aggregate([
        { $match: findWithCompanyId },
        { $project: { _id: 0, designations: '$designations' } },
      ]);
      res.json(designations);
    } else {
      res.end();
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post('/get_leave_history', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let userType = req.body.userType;
    let user_id = req.body.user_id;
    let applied_user_id = req.body.applied_user_id;

    let match = { $match: {} };

    if (userType == 'ADMIN') {
      match = { $match: { user_id: applied_user_id } };
    } else if (userType == 'MANAGER') {
      match = { $match: { user_id: applied_user_id, approvals: { $elemMatch: { approver_id: user_id } } } };
    } else {
      match = { $match: { user_id: user_id } };
    }

    const requests = await LeavesModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      {
        $project: {
          approvals: 1,
          certificate: 1,
          approvals: 1,
          appliction_log: 1,
          leave_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          remaining_leaves: 1,
          reason: 1,
          status: 1,
          user_id: 1,
          date_created: 1,
          approver_id: 1,
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/get_leave_buddy', validateToken, async (req, res, next) => {
  try {
    let str_dept = req.body.str_dept;
    let str_team = req.body.str_team;
    let str_from_date = new Date(req.body.str_from_date);
    let str_to_date = new Date(req.body.str_to_date);
    let str_applied_user_id = req.body.str_applied_user_id;

    let lookUpUser = {
      $lookup: {
        from: 'users',
        let: {
          userid: '$objid_user_id',
          team: str_team,
          department: str_dept,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$userid'] },
                  { $or: [{ $eq: ['$reporting.team', '$$team'] }, { $eq: ['$reporting.department', '$$department'] }] },
                ],
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
        as: 'array_user',
      },
    };

    let match = {
      $or: [
        { $and: [{ from_date: { $lte: str_from_date } }, { to_date: { $gte: str_from_date } }] },
        { $and: [{ from_date: { $lte: str_to_date } }, { to_date: { $gte: str_to_date } }] },
      ],
      status: { $nin: ['Cancelled', 'Withdrawn'] },
      user_id: { $ne: str_applied_user_id },
    };

    let project = {
      $project: {
        leave_type: 1,
        from_date: 1,
        to_date: 1,
        no_of_days: 1,
        app_status: 1,
        remaining_leaves: 1,
        reason: 1,
        status: 1,
        user_id: 1,
        date_created: 1,
        approver_id: 1,
        user_name: { $concat: ['$array_user.first_name', ' ', '$array_user.middle_name', ' ', '$array_user.last_name'] },
        user_image_url: '$array_user.image_url',
      },
    };

    const getLeaveBuddy = await LeavesModel.aggregate([
      { $match: match },
      { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
      lookUpUser,
      { $unwind: '$array_user' },
      project,
    ]);
    res.status(200).json(getLeaveBuddy);
  } catch (err) {
    res.json({ message: err.message });
  }
});

// get reporting leave for required date
router.post('/get-reporting-leave', async (req, res) => {
  try {
    let required_date = req.body.date;
    let user_reporting = req.body.id;
    let userType = req.body.userType;
    let arr = [];

    let match = { $match: {} };

    if (userType == 'ADMIN') {
      match = { $match: { user_status: 'Active' } };
    } else if (userType == 'MANAGER') {
      match = { $match: { 'reporting.manager': user_reporting, user_status: 'Active' } };
    }

    const users = await UsersModel.aggregate([match, { $project: { _id: 1 } }]);
    let leave = {};

    for (let i = 0; i < users.length; i++) {
      leave = await LeavesModel.find({
        user_id: users[i]._id,
        from_date: { $lte: required_date },
        to_date: { $gte: required_date },
      });
      arr.push(...leave);
    }

    res.json(arr);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get leaves with status date and list of users
  {
    status: ['Completed'],
    date:'2022-10-18',
    userListIds: [],
    userType: "ADMIN",
    userID:"60e03ef5a52790ddeab89cc5"
  }
 */
router.post('/users_leaves', async (req, res) => {
  try {
    let reqStatus = req.body.status;
    let req_date = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
    let checkUser = req.body.userListIds;
    let userType = req.body.userType;
    let user_id = req.body.user_id;

    let match = {};

    if (userType == 'ADMIN') {
      match = {
        $match: {
          status: { $in: reqStatus },
          user_id: { $in: checkUser },
          from_date: { $gte: req_date },
        },
      };
    } else if (userType == 'MANAGER') {
      match = {
        $match: {
          status: { $in: reqStatus },
          user_id: { $in: checkUser },
          from_date: { $gte: req_date },
        },
      };
    }

    const leaves = await LeavesModel.aggregate([
      match,
      {
        $project: {
          no_of_days: 1,
          leave_type: 1,
          status: 1,
          to_date: 1,
          from_date: 1,
          user_id: 1,
        },
      },
      {
        $sort: {
          from_date: 1,
        },
      },
    ]);
    // const leaves = await LeavesModel.aggregate([match])
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//all active leaves
router.get('/users_active_leave/all', async (req, res) => {
  try {
    // let match = {
    //     $match: {
    //         status: { $nin: ['Cancelled', 'Withdrawn'] },
    //     }
    // }
    const leaves = await LeavesModel.find({
      status: { $nin: ['Cancelled', 'Withdrawn'] },
    });
    // const leaves = await LeavesModel.aggregate([match])
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get today leave
router.get('/today/all', async (req, res) => {
  let todayDate = new Date(new Date().setHours(0, 0, 0, 0));
  try {
    const leave = await LeavesModel.aggregate([
      {
        $match: {
          from_date: { $lte: todayDate },
          to_date: { $gte: todayDate },
          status: { $nin: ['Cancelled', 'Withdrawn'] },
        },
      },
      { $project: { leave_type: 1, user_id: 1 } },
    ]);
    res.json(leave);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// get teams leave today
router.get('/team/today/:team', validateToken, async (req, res) => {
  let team = req.params.team;
  let todayDate = new Date().setHours(0, 0, 0, 0);

  try {
    let arr = [];
    //res.send('Hello Employee')
    const users = await UsersModel.find({
      'reporting.team': team,
      user_status: 'Active',
    });
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      leave = await `LeavesModel`.find({
        user_id: users[i]._id,
        from_date: { $lte: todayDate },
        to_date: { $gte: todayDate },
      });
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/department-paginated', validateToken, async (req, res) => {
  let dept = req.body.dept;
  let str_from_date = new Date(req.body.str_from_date);
  let str_to_date = new Date(req.body.str_to_date);

  try {
    let match_leave = {
      $match: {
        $or: [{ status: 'Completed' }, { status: 'Processing' }],
        $or: [
          { $and: [{ from_date: { $lte: str_from_date } }, { to_date: { $gte: str_from_date } }] },
          { $and: [{ from_date: { $lte: str_to_date } }, { to_date: { $gte: str_to_date } }] },
        ],
      },
    };

    let lookUpUser = {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id',
          dept: dept,
          userStatus: 'Active',
        },
        pipeline: [
          { $addFields: { _id_to_string: { $toString: '$_id' } } },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id_to_string', '$$userid'] },
                  { $eq: ['$reporting.department', '$$dept'] },
                  { $eq: ['$user_status', '$$userStatus'] },
                ],
              },
            },
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
              image_url: 1,
            },
          },
        ],
        as: 'array_user',
      },
    };

    let match_user = {
      $match: {
        array_user: {
          $ne: [],
        },
      },
    };

    let unwind_user = {
      $unwind: '$array_user',
    };

    let project_leave = {
      $project: {
        leave_type: 1,
        status: 1,
        from_date: 1,
        to_date: 1,
        user_name: { $concat: ['$array_user.first_name', ' ', '$array_user.last_name'] },
        image_url: '$array_user.image_url',
        user_id: '$array_user._id',
      },
    };

    let leaves = await LeavesModel.aggregate([match_leave, lookUpUser, match_user, unwind_user, project_leave]);

    res.json(leaves);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//  get wfh list by dates

router.post('/leavesByDate/', async (req, res) => {
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
    await LeavesModel.aggregate([
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
          leave_type: 1,
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
// get department leave //
router.get('/department/:dept', validateToken, async (req, res) => {
  let dept = req.params.dept;

  let monthYear = req.query.monthYear || null;
  let dateStart = null;
  let dateEnd = null;

  if (monthYear) {
    monthYear = moment(new Date(monthYear)).format('YYYY-MM');
    let initialDate = new Date(monthYear);
    let lastDay = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0);

    dateStart = new Date(initialDate.setHours(0, 0, 0, 0));
    dateEnd = new Date(lastDay.setHours(23, 59, 59, 0));

    console.log('dateStart', dateStart);
    console.log('dateEnd', dateEnd);
  }

  try {
    let arr = [];
    //res.send('Hello Employee')
    const users = await UsersModel.find({
      'reporting.department': dept,
      user_status: 'active',
    });
    // console.log('users', users);
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      let leavesCond = {
        user_id: users[i]._id,
        $or: [{ status: 'Completed' }, { status: 'Processing' }],
      };

      if (monthYear) {
        leavesCond.to_date = { $gte: dateStart, $lte: dateEnd };
      }
      // console.log('leavesCond', leavesCond);

      leave = await LeavesModel.find(leavesCond);
      // console.log('leave', leave);
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get leaves for the teamcalendar
router.post('/get_all_requests', validateToken, async (req, res) => {
  let user_id = req.body.user_id;

  try {
    let lookup_leaves = {
      $lookup: {
        from: 'leaves',
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
              leave_type: 1,
              from_date: 1,
              date_created: 1,
            },
          },
        ],
        as: 'users_leaves',
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
      lookup_leaves,
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

// get active all leave
router.get('/all/active', validateToken, async (req, res) => {
  try {
    let arr = [];
    //res.send('Hello Employee')
    const users = await UsersModel.find({ user_status: 'Active' });
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      leave = await LeavesModel.find({
        user_id: users[i]._id,
        $or: [{ status: 'Completed' }, { status: 'Processing' }],
      });
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get teams leave
router.get('/team/:team', validateToken, async (req, res) => {
  let team = req.params.team;

  try {
    let arr = [];
    //res.send('Hello Employee')
    const users = await UsersModel.find({
      'reporting.team': team,
      user_status: 'Active',
    });
    let leave = {};
    for (let i = 0; i < users.length; i++) {
      leave = await LeavesModel.find({
        user_id: users[i]._id,
        $or: [{ status: 'Completed' }, { status: 'Processing' }],
      });
      arr.push(...leave);
    }
    res.json(arr);
    // console.log(users)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//
router.get('/user_leaves/:_id', validateToken, async (req, res) => {
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
        leave_type: 1,
        no_of_days: 1,
      },
    };
    const leaves = await LeavesModel.aggregate([match, project]);
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ui upgrade ends

router.get('/all', validateToken, async (req, res) => {
  try {
    const leaves = await LeavesModel.find();
    res.json(leaves);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.get('/non-completed/all', validateToken, async (req, res) => {
  try {
    const leaves = await LeavesModel.find({ status: 'Processing' });
    res.json(leaves);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.post('/hrself/users/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  let skipCount = parseInt(req.body.skipCount);
  let pageLimit = parseInt(req.body.pageLimit);

  try {
    const leaves = await LeavesModel.aggregate([
      {
        $match: { user_id: id },
      },
      {
        $sort: { date_created: -1 },
      },
      { $skip: skipCount },
      { $limit: pageLimit },
      {
        $project: {
          leave_type: 1,
          status: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          _id: 1,
        },
      },
    ]);
    res.json(leaves);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const leaves = await LeavesModel.find({ user_id: id });
    res.json(leaves);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

// router.get('/team/:_id', async (req, res) => {
//     const id = req.params._id;

//     try {
//         //const employees = await EmployeesModel.find({ status: "saved" })
//         // const user = await UsersModel.find({"_id":id})
//         const leaves = await LeavesModel.find({"user_id":id})
//         res.json(leaves)
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// })

router.get('/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  try {
    const leave = await LeavesModel.find({ _id: id });
    res.json(leave);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.get('/active-processing/all', async (req, res) => {
  const id = req.params._id;
  try {
    const leave = await LeavesModel.find({
      $or: [{ status: 'Completed' }, { status: 'Processing' }],
    });
    res.json(leave);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.delete('/delete/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  try {
    const leave = await LeavesModel.findByIdAndRemove({ _id: id });
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
    const ticket = await LeavesModel.updateOne(filter, { $set: req.body[0] });
    // const ticket = await LeavesModel.findOneAndUpdate(filter, ...req.body, { new: true });
    console.log(ticket);
    const requests = await LeavesModel.find({ _id: ObjectId(id) });
    if (
      requests[0].leave_type == 'Medical Leaves' &&
      Number(requests[0].remaining_leaves) < 0 &&
      (requests[0].status == 'Completed' || requests[0].status == 'completed' || requests[0].status == 'Approved by Admin')
    ) {
      let payitemObj = {
        pay_month: '',
        // pay_month: requests[0].from_date.toISOString().substr(0,7),
        user_id: requests[0].user_id,
        first_name: '',
        earning_type: 'Deduction',
        category: 'Loss of Pay SL',
        remarks: requests[0].reason,
        amount: '',
        approved_by_id: requests[0].approvals[0].approver_id,
        recursive_id: 'Non-Recursive',
        status: 'active',
        unpaid: 0,
        ot_type: '',
        hours: '',
        leave_id: requests[0]._id,
      };
      let LeaveFromDateMonth = requests[0].from_date.getMonth() + 1;
      let LeaveToDateMonth = requests[0].to_date.getMonth() + 1;

      const user = await UsersModel.find({ _id: requests[0].user_id });

      let usersCompany_id = user[0].company_ID;

      const company = await CompaniesModel.find({ _id: ObjectId(usersCompany_id) });

      let firstname = '';
      let total_fixed = 0;

      if (user.length > 0) {
        firstname = user[0].first_name + ' ' + user[0].last_name;
        total_fixed = user[0].salary.get('total_fixed');
      }
      let payMonth = requests[0].from_date.toISOString().substr(0, 7);
      const payrollprocess = await PayrollProcessModel.find({
        status: 'active',
        country: company[0].country,
      }).sort({ createdDate: -1 });

      if (LeaveFromDateMonth == LeaveToDateMonth) {
        let month = requests[0].from_date.getMonth() + 1;
        let year = requests[0].from_date.toISOString().substr(0, 4);
        let number_of_days_in_a_month = new Date(year, month, 0).getDate();

        let daily_rate = total_fixed / number_of_days_in_a_month;

        payitemObj.first_name = firstname;

        if (payrollprocess.length > 0) {
          if (payrollprocess[0].pay_month == requests[0].from_date.toISOString().substr(0, 7)) {
            payitemObj.pay_month = requests[0].from_date.toISOString().substr(0, 7);
          } else if (payrollprocess[0].pay_month != requests[0].from_date.toISOString().substr(0, 7)) {
            // leave start date < payroll month or greate than payroll month
            // less than
            // pay item paymonth should be - current open payroll month

            if (requests[0].from_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
              payitemObj.pay_month = payrollprocess[0].pay_month;
            }
            if (requests[0].from_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
              payitemObj.pay_month = requests[0].from_date.toISOString().substr(0, 7);
            }
          }
        }
        payitemObj.amount = Math.abs(parseFloat(Number(requests[0].no_of_days) * (daily_rate / 2)).toFixed(2));
        const payroll = new PayrollModel({
          ...payitemObj,
        });
        const newProcess = await payroll.save();
      } else if (LeaveFromDateMonth != LeaveToDateMonth) {
        let payitemObj1 = {
          pay_month: '',
          // pay_month: requests[0].from_date.toISOString().substr(0,7),
          user_id: requests[0].user_id,
          first_name: '',
          earning_type: 'Deduction',
          category: 'Loss of Pay SL',
          remarks: requests[0].reason,
          amount: '',
          approved_by_id: requests[0].approvals[0].approver_id,
          recursive_id: 'Non-Recursive',
          status: 'active',
          unpaid: 0,
          ot_type: '',
          hours: '',
          leave_id: requests[0]._id,
        };
        let date = requests[0].from_date.getDate();
        let month = requests[0].from_date.getMonth() + 1;
        let year = requests[0].from_date.toISOString().substr(0, 4);
        let number_of_days_in_a_month = new Date(year, month, 0).getDate();

        let payrollDaysFirstMonth = number_of_days_in_a_month - date + 1; //28

        let daily_rate = total_fixed / number_of_days_in_a_month;

        payitemObj1.first_name = firstname;
        if (payrollprocess.length > 0) {
          if (payrollprocess[0].pay_month == requests[0].from_date.toISOString().substr(0, 7)) {
            payitemObj1.pay_month = requests[0].from_date.toISOString().substr(0, 7);
          } else {
            if (requests[0].from_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
              payitemObj1.pay_month = payrollprocess[0].pay_month;
            }
            if (requests[0].from_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
              payitemObj1.pay_month = requests[0].from_date.toISOString().substr(0, 7);
            }
          }
        }
        payitemObj1.amount = Math.abs(parseFloat(Number(payrollDaysFirstMonth) * (daily_rate / 2)).toFixed(2));
        const payroll = new PayrollModel({
          ...payitemObj1,
        });
        const newProcess = await payroll.save();

        let payitemObj2 = {
          pay_month: '',
          user_id: requests[0].user_id,
          first_name: '',
          earning_type: 'Deduction',
          category: 'Loss of Pay SL',
          remarks: requests[0].reason,
          amount: '',
          approved_by_id: requests[0].approvals[0].approver_id,
          recursive_id: 'Non-Recursive',
          status: 'active',
          unpaid: 0,
          ot_type: '',
          hours: '',
          leave_id: requests[0]._id,
        };

        let date1 = requests[0].to_date.getDate();
        let month1 = requests[0].to_date.getMonth() + 1;
        let year1 = requests[0].to_date.toISOString().substr(0, 4);
        let number_of_days_in_a_month1 = new Date(year1, month1, 0).getDate();

        let payrollDaysSecondMonth = date1;

        let daily_rate1 = total_fixed / number_of_days_in_a_month1;

        payitemObj2.first_name = firstname;
        if (payrollprocess.length > 0) {
          if (payrollprocess[0].pay_month == requests[0].to_date.toISOString().substr(0, 7)) {
            payitemObj2.pay_month = requests[0].to_date.toISOString().substr(0, 7);
          } else {
            if (requests[0].to_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
              payitemObj2.pay_month = payrollprocess[0].pay_month;
            }
            if (requests[0].to_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
              payitemObj2.pay_month = requests[0].to_date.toISOString().substr(0, 7);
            }
          }
        }
        payitemObj2.amount = Math.abs(parseFloat(Number(payrollDaysSecondMonth) * (daily_rate1 / 2)).toFixed(2));
        const payroll1 = new PayrollModel({
          ...payitemObj2,
        });
        const newProcess1 = await payroll1.save();
      }
    }
    res.send('Successfuly Updated');

    /**
     * SEND PUSH NOTIFICATION TO MOBILE APP START
     * What Below code Will Do
     * Send Notification to Mobile app
     * Add new Notification Details on Notification Collection
     * NOTE : Change Company Code in Notification Model.According to Company 
     * 
     * 
     * "Leave Request Withdrawn Eway";
     "Leave Request Pending Approval Eway";
    "Leave Request - Approved Eway";
    "Leave Request Rejected Eway";
    "Leave Request - Rejected Eway";
     */

    //const UserDetails = await UsersModel.find({ _id: req.body[0].user_id });

    //console.log(UserDetails);

    if (req.body[0].status == 'Completed') {
      await NotificationHelper.saveNotification(
        user._id.toString(),
        user._id.toString(),
        'Leave Request' + ' Approved',
        'Leave Request - Approved',
        '/dashboards/myhr#leave'
      );
    }

    if (req.body[0].status == 'Rejected') {
      await NotificationHelper.saveNotification(
        user._id.toString(),
        user._id.toString(),
        'Leave Request' + ' Rejected',
        'Leave Request Rejected',
        '/dashboards/myhr#leave'
      );
    }

    if (req.body[0].status == 'Cancelled') {
      console.log('cancell triggered');

      await NotificationHelper.saveNotification(
        user._id.toString(),
        user._id.toString(),
        'Leave Request' + ' Rejected',
        'Leave Request Rejected',
        '/dashboards/myhr#leave'
      );
    }

    /* SEND PUSH NOTIFICATION TO MOBILE APP END*/
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.post('/new', validateToken, async (req, res) => {
  const leaves = new LeavesModel({
    ...req.body,
  });

  try {
    const leave = await leaves.save();
    res.status(200).json(leave);
    res.send('Request Saved');
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

hasExistingLeaveCheck = function (user_leaves, fromDate, toDate) {
  let flag = [];

  if (user_leaves.length > 0) {
    for (let i = 0; i < user_leaves.length; i++) {
      let currentleave = user_leaves[i];
      if (
        (new Date(currentleave.from_date) <= new Date(fromDate) && new Date(fromDate) <= new Date(currentleave.to_date)) ||
        (new Date(currentleave.from_date) <= new Date(toDate) && new Date(toDate) <= new Date(currentleave.to_date)) ||
        (new Date(fromDate) <= new Date(currentleave.from_date) && new Date(currentleave.from_date) <= new Date(toDate)) ||
        (new Date(fromDate) <= new Date(currentleave.to_date) && new Date(currentleave.to_date) <= new Date(toDate))
      ) {
        /**
         * Push true value to indicate that there is an existing leave.
         * If all array values are false, then there is no existing leave.
         * Else, if all array values has at least one true value, then there is existing leave.
         * */
        flag.push(true);
      }
    }
  }

  if (flag.length > 0 && flag.includes(true)) {
    this.snack = true;
    this.snackColor = 'red';
    this.snackText = 'There is already a leave application for this period!';
  }
  //console.log(flag , 'flag')
  const result = flag.length < 1 || !flag.includes(true) ? false : true;
  return result;
};

/* New Leave Request CRUD starts here */

/* Get Remaining Leaves and No.of days of Leave */ //
router.post('/get_remaining_leaves', validateToken, async (req, res) => {
  try {
    // const user = {
    //   company_ID: '5fa397eb1ddd3b46d8e756ac'
    // }
    // req.user = user;
    // const { company_ID } = req.user;
    const body = req.body;
    const company_ID = body.company_id;

    const applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) }).select({ leaves: 1, personal: 1 });

    /* Get holiday calendar of the organization */
    // console.log(body);
    // const configuration = await LeavesTypesModel.findOne({ company_ID: ObjectId(body.company_id) }).select({
    //   holiday_calendar: 1,
    // });
    const configuration = await ConfigurationModel.findOne()
      .select({
        holiday_calendar: 1,
      })
      .lean();
    // console.log('applicant', applicant);
    // console.log('configuration', configuration);

    let Leaves = new Leave();

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
        leave_type: 1,
        no_of_days: 1,
      },
    };
    const user_leaves = await LeavesModel.aggregate([match, project]);

    let from_date = new Date(body.from_date);
    from_date.setHours(from_date.getHours() + 4);
    let to_date = new Date(body.to_date);
    to_date.setHours(to_date.getHours() + 4);

    let existing_leaves = hasExistingLeaveCheck(user_leaves, from_date, to_date);
    if (!existing_leaves) {
      if (applicant && configuration) {
        let holiday_calendar = configuration.holiday_calendar;

        let declared_holidays = getDeclaredHolidays(holiday_calendar);
        // console.log('declared_holidays', declared_holidays);
        /* Employee work schedule */
        const applicants_work_schedule = await ConfigurationModel.aggregate([
          {
            $match: { 'company_work_schedules.name': applicant.personal.work_schedule, company_ID: company_ID },
          },
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
          let leaves_info = await getShiftandAlternateEmployees(applicant.personal.work_schedule, body, applicant);
          res.json({ success: true, message: 'Success', data: leaves_info });
        } else {
          let remaining_leaves = Leaves.getRemainingLeave(
            body,
            applicant,
            body.half_day,
            declared_holidays,
            weekends,
            body.obj_leave_type
          );

          if (
            (remaining_leaves && remaining_leaves.remaining_leaves_count) ||
            (remaining_leaves && remaining_leaves.remaining_leaves_count == 0)
          ) {
            res.json({ success: true, message: 'Success', data: remaining_leaves });
          } else {
            res.json({ success: false, message: 'Insufficient balance.', data: [] });
          }
        }
      } else {
        res.json({ success: false, message: 'User not found.', data: [] });
      }
    } else {
      res.json({ success: false, message: 'You already applied for leaves within this period.', data: [] });
    }
  } catch (e) {
    console.log('#log', e);
    res.json({ success: false, message: e.message, data: [] });
  }
});

/* Apply for new Leave */
router.post('/apply_leave', async (req, res) => {
  try {
    console.log('here');
    const body = req.body;

    const applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) }).select({
      leaves: 1,
      reporting: 1,
      personal: 1,
      first_name: 1,
      last_name: 1,
      company_id: 1,
      email: 1,
    });

    const applied_manager = await UsersModel.findOne({ _id: ObjectId(body.applied_manager) }).select({
      personal: 1,
      first_name: 1,
      last_name: 1,
    });

    const Leaves = new Leave();
    const Emails = new LeaveEmail();

    if (applicant) {
      let applicants_company = await CompaniesModel.findOne({ _id: applicant.company_id });
      console.log('applicants_company', applicants_company);
      let leaveType = _.lowerCase(body.leave_type).replace(/\s/g, '_');

      let leave_count = parseFloat(applicant.leaves[leaveType]) - parseFloat(body.no_of_days);

      let balance_check = false;

      if (body.obj_leave_type.leave_name.toLowerCase() == 'unpaid leaves') {
        leave_count = parseFloat(applicant.leaves[leaveType]) + parseFloat(body.no_of_days);
        balance_check = true;
      } else {
        if (body.obj_leave_type.apply_below_zero) {
          if (leave_count >= body.obj_leave_type.max_allowed) {
            balance_check = true;
          } else {
            balance_check = false;
          }
        } else {
          if (leave_count >= 0) {
            balance_check = true;
          } else {
            balance_check = false;
          }
        }
      }

      let half_day_elegibilty = false;

      if (body.no_of_days == 0.5) {
        if (leaveType != 'hajj_leaves' && leaveType != 'maternity_leaves') {
          half_day_elegibilty = true;
        } else {
          half_day_elegibilty = false;
        }
      } else {
        half_day_elegibilty = true;
      }

      if (balance_check) {
        if (half_day_elegibilty) {
          let insert_leave = Leaves.getAddLeaveRequest(body, applicant, body.obj_leave_type, applied_manager);
          // console.log(insert_leave.obj_leave,"--------------obj_leave")
          if (insert_leave) {
            const leaves = new LeavesModel({
              ...insert_leave.obj_leave,
            });
            if (leaves && leaves.approvals) {
              // console.log(leaves.approvals,"---------approvals")
              /**
               * check any applied leaves of the first approval from_date and to_date falls under today
               * if found anything push the new approval substitute object and update as auto approved
               * {"approver_id":"64539b5e965e71164dd031fb","status":"Processing","approved_date":"","comments":[],"reason":""}
               */
              let leave_id = leaves._id;
              let approval = leaves.approvals[0];
              let approvals = leaves.approvals;
              let today = new Date();
              // console.log(new Date())

              let approval_match = {
                $match: {
                  user_id: approval.approver_id,
                  status: 'Completed',
                  $and: [
                    { from_date: { $lte: new Date(today.setHours(4, 0, 0, 0)) } },
                    { to_date: { $gte: new Date(today.setHours(4, 0, 0, 0)) } },
                  ],
                },
              };
              // console.log(approval_match,"-----------approval_match")
              // console.log(approval_match.$match.$and,"-----------approval_match")
              let approval_leaves = await LeavesModel.aggregate([approval_match]);
              // console.log(approval_leaves,"---------------approval_leaves")
              if (approval_leaves && approval_leaves.length > 0) {
                let approval_obj = {
                  approver_id: approval_leaves[0].approval_substitute,
                  status: 'Processing',
                  approved_date: '',
                  comments: [],
                  reason: '',
                };
                let approval_obj_update = {
                  approver_id: approval.approver_id,
                  status: 'Auto Approved',
                  approved_date: new Date().toISOString(),
                  comments: [],
                  reason: 'Auto Approved',
                };
                // console.log(approval_obj,"-----------")
                approvals[0] = approval_obj_update;
                approvals.splice(1, 0, approval_obj);
                // console.log(approvals,"------------------updatedd approvals")
              }
            }
            if (leaves.approvals[0].reason == 'Auto Approved') {
              leaves.appliction_log.push({
                approver_id: leaves.approvals[0].approver_id,
                date_created: new Date(),
                status: 'Approved',
                reason: 'Auto Approved',
              });
            }
            //inserted approval_substitute property
            leaves.approval_substitute = body.approval_substitute;
            const apply_leave = await leaves.save();

            if (apply_leave) {
              let updated_leave = {
                $set: {
                  leaves: insert_leave.leaves,
                },
              };
              // console.log(body.user_id, 'body.user_id');
              // console.log(insert_leave.leaves, 'insert_leave.leaves');
              let update_user_leave = await UsersModel.updateOne({ _id: ObjectId(body.user_id) }, updated_leave);

              if (update_user_leave.nModified == 1) {
                let arr_users_id = [];

                apply_leave.approvals.forEach((element) => {
                  arr_users_id.push(ObjectId(element.approver_id));
                });

                arr_users_id.push(ObjectId(body.user_id));

                let arr_users = await UsersModel.aggregate([
                  { $match: { _id: { $in: arr_users_id } } },
                  { $project: { first_name: 1, last_name: 1, middle_name: 1 } },
                ]);

                let approver_id = '';

                for (let i = 0; i < apply_leave.approvals.length; i++) {
                  if (apply_leave.approvals[i].status.toLowerCase() == 'processing') {
                    approver_id = apply_leave.approvals[i].approver_id;
                  }
                }

                // if (approver_id != '') {
                //   /* Email to first Approver */
                //   let first_approver = await UsersModel.findOne({ _id: ObjectId(approver_id) }).select({
                //     email: 1,
                //     personal: 1,
                //     first_name: 1,
                //     last_name: 1,
                //     middle_name: 1,
                //   });

                //   /* Send email to approver */
                //   let approver_email = Emails.funLeaveRequestApprovalManager(
                //     apply_leave,
                //     applicants_company,
                //     applicant,
                //     first_approver
                //   );

                //   /* changing email content to route it to request info page on click of the link */
                //   let req_id = apply_leave._id.toString();
                //   let req_type = 'Leave';
                //   let combinedReqIdAndType = req_id + '/' + req_type;
                //   if (req.headers.host == 'localhost:4001') {
                //     approver_email.body = approver_email.body.replace(
                //       'https://hrdirect-staging.devnhr.com',
                //       'http://localhost:5102'
                //     );
                //     approver_email.body = approver_email.body.replace(
                //       'https://hrdirect.devnhr.com',
                //       'http://localhost:5102'
                //     );
                //   }
                //   approver_email.body = approver_email.body.replace(
                //     'dashboards/my-team#requests',
                //     'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
                //   );

                //   sendEmail(first_approver.email, approver_email.subject, approver_email.body);

                //   /* Send notifications to approver */
                //   notifications('approver', 'approver', apply_leave, first_approver, applicant);
                // }

                console.log('arr_users', arr_users);
                /* Send Email to applicant */
                // let applicant_email = Emails.funNewLeaveRequest(apply_leave, applicants_company, applicant, arr_users);
                // sendEmail(applicant.email, applicant_email.subject, applicant_email.body);

                res.json({ success: true, message: 'Success', data: apply_leave });
              } else {
                let delete_leave = await LeavesModel.deleteOne({ _id: ObjectId(apply_leave._id) });

                res.json({ success: false, message: 'Unbale to apply for leave. Please try again later.', data: [] });
              }
            } else {
              res.json({ success: false, message: 'Unbale to apply for leave. Please try again later.', data: [] });
            }
          } else {
            res.json({ success: false, message: 'Unbale to apply for leave. Please try again later.', data: [] });
          }
        } else {
          res.json({
            success: false,
            message: 'You cannot apply for half day leave in this leave type, Please select Annual leave.',
            data: [],
          });
        }
      } else {
        res.json({ success: false, message: 'Insufficient leave balance.', data: [] });
      }
    } else {
      res.json({ success: false, message: 'User not found.', data: [] });
    }
  } catch (error) {
    console.log(error, '--error');
    res.json({ success: false, message: error.message, data: [] });
  }
});

/* Withdraw Leave request */ //
router.post('/withdraw_leave', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    let LeavesEmail = new LeaveEmail();

    if (applicant) {
      let logs = {
        approver_id: applicant._id,
        date_created: new Date(),
        status: 'Leave Request Withdrawn.',
        reason: '',
      };

      let update_data = {
        $set: {
          status: 'Withdrawn',
          app_status: 'Withdrawn',
          dateUpdated: new Date(),
          updatedBy: ObjectId(body.user_id),
        },
        $push: { appliction_log: logs },
      };

      let update_match = {
        _id: ObjectId(body.leave_id),
      };

      let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

      if (update_leave != null) {
        let leaveType = _.lowerCase(update_leave.leave_type).replace(/\s/g, '_');

        if (update_leave.leave_type.toLowerCase() == 'unpaid leaves') {
          if (update_leave.leave_condition[0].unpaid_leave_capped) {
            applicant.leaves[leaveType] = parseFloat(applicant.leaves[leaveType]) + parseFloat(update_leave.no_of_days);
          } else {
            applicant.leaves[leaveType] -= parseFloat(update_leave.no_of_days);
          }
        } else {
          applicant.leaves[leaveType] = parseFloat(applicant.leaves[leaveType]) + parseFloat(update_leave.no_of_days);
        }

        let user_leave_update = {
          $set: {
            leaves: applicant.leaves,
          },
        };

        let user_match = {
          _id: ObjectId(body.user_id),
        };

        let user_update = await UsersModel.updateOne(user_match, user_leave_update);

        let update_data = {
          $set: {
            'approvals.$.status': 'Withdrawn by Employee',
          },
        };

        let update_match = {
          _id: ObjectId(body.leave_id),
          'approvals.status': 'Processing',
        };

        let update_leave_approval = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

        if (user_update.nModified == 1) {
          /* Email to Applicant */
          let applicants_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) });
          // let applicant_email = LeavesEmail.funLeaveWithdraw(update_leave, applicants_company, applicant);
          /* Send Email to Applicant */
          // sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
          /* Send Notification to Applicant */
          // notifications('applicant', 'withdrawn', update_leave, applicant, applicant);

          res.status(200).json({ success: true, message: 'Success', data: update_leave });
        } else {
          /* If failed tp credit back leave to employee, Then reverting back the status */
          let update_data = {
            $set: {
              status: 'Processing',
              dateUpdated: new Date(),
              updatedBy: ObjectId(body.user_id),
              'approvals.$.status': 'Processing',
            },
            $pop: { appliction_log: 1 },
          };

          let update_match = {
            _id: ObjectId(body.leave_id),
            'approvals.status': 'Withdrawn by Employee',
          };

          let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

          res
            .status(200)
            .json({ success: false, message: 'Failed to Withdraw request, Please try again later.', data: update_leave });
        }
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
/* Approve Leave request */
router.post('/approve_leave', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    let obj_approver = await UsersModel.findOne({ _id: ObjectId(body.manager_id) });

    let approver = JSON.parse(JSON.stringify(obj_approver));

    let leave_req = await LeavesModel.findOne({ _id: ObjectId(body.leave_id) });

    let Leaves = new Leave();
    let LeavesEmail = new LeaveEmail();

    if (applicant && approver) {
      let applicant_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      let arr_users_id = [];

      leave_req.approvals.forEach((element) => {
        arr_users_id.push(ObjectId(element.approver_id));
      });
      if (body.approver_attachment.length > 0) {
        if (leave_req.approvals && leave_req.approvals.length > 0) {
          for (let approval_index = 0; approval_index < leave_req.approvals.length; approval_index++) {
            const element = leave_req.approvals[approval_index];
            if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
              element.hide_attachment = body.hide_attachment;
              element.approver_attachment = body.approver_attachment;
              break;
            }
          }
        }
      }
      // if(leave_req.approvals[0].approver_attachment){
      //     leave_req.approvals[0].approver_attachment.push(...body.approver_attachment)
      // }else{
      //     leave_req.approvals[0].approver_attachment = body.approver_attachment
      // }
      // leave_req.approvals[0].hide_attachment = body.hide_attachment

      arr_users_id.push(ObjectId(body.user_id));

      let arr_users = await UsersModel.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
      ]);

      let approveLeave = {};

      if (body.admin) {
        approveLeave = Leaves.funAdminLeaveApprove(leave_req, body.reason, approver, arr_users);
      } else {
        approveLeave = Leaves.funManagerLeaveApprove(leave_req, body.reason, approver, arr_users);
      }

      if (approveLeave) {
        let obj_requestInfo = approveLeave.obj_requestInfo;

        let update_match = {
          _id: ObjectId(body.leave_id),
        };

        if (obj_requestInfo.status.toLowerCase() == 'Completed') {
          obj_requestInfo.app_status = 'Approved';
        } else {
          obj_requestInfo.app_status = 'Processing';
        }

        let approvals = obj_requestInfo.approvals;

        for (let key = 0; key < approvals.length; key++) {
          let element = approvals[key];
          if (element.status == 'Processing') {
            /**
             * get the approval id and find the leave
             */
            // console.log(key,"-------------------------key")
            let today = new Date();

            let approval_match = {
              $match: {
                user_id: element.approver_id,
                status: 'Completed',
                $and: [
                  { from_date: { $lte: new Date(today.setHours(4, 0, 0, 0)) } },
                  { to_date: { $gte: new Date(today.setHours(4, 0, 0, 0)) } },
                ],
              },
            };
            // console.log(approval_match,"-----------approval_match")
            // console.log(approval_match.$match.$and,"-----------approval_match")
            await LeavesModel.aggregate([approval_match])
              .then(async (approval_leaves) => {
                // console.log(approval_leaves,"---------------approval_leaves")
                if (approval_leaves && approval_leaves.length > 0) {
                  let approval_obj = {
                    approver_id: approval_leaves[0].approval_substitute,
                    status: 'Processing',
                    approved_date: '',
                    comments: [],
                    reason: '',
                  };
                  let approval_obj_update = {
                    approver_id: element.approver_id,
                    status: 'Auto Approved',
                    approved_date: new Date().toISOString(),
                    comments: [],
                    reason: 'Auto Approved',
                  };
                  // console.log(approval_obj,"-----------")
                  approvals[key] = approval_obj_update;
                  approvals.splice(key + 1, 0, approval_obj);
                }
                // console.log(approvals,"------------------updatedd approvals")
              })
              .catch((approval_leaves_error) => console.log(approval_leaves_error));
          }
          if (approvals.length == key + 1) {
            let update_data = {
              $set: obj_requestInfo,
            };

            let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

            if (update_leave) {
              if (obj_requestInfo.status == 'Completed') {
                /* Email to Applicant */
                if (body.admin) {
                  let applicant_email = LeavesEmail.funLeaveApprovedAdmin(
                    leave_req,
                    applicant_company,
                    applicant,
                    arr_users,
                    body.reason
                  );
                  sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
                } else {
                  let applicant_email = LeavesEmail.funLeaveApproved(
                    leave_req,
                    applicant_company,
                    applicant,
                    arr_users,
                    body.reason
                  );
                  sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
                }

                if (obj_requestInfo.payroll_process) createPayitems(obj_requestInfo, approver);

                /* Send Notification to Applicant */
                notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
              } else {
                /* Email to Next approver */
                console.log(approveLeave, 'approveLeave');
                let approver_to_email = approveLeave.arr_user_email[0].email;
                let approver_email = LeavesEmail.funLeaveRequestApprovalManager(
                  leave_req,
                  applicant_company,
                  applicant,
                  approveLeave.arr_user_email[0]
                );
                let req_id = update_leave._id.toString();
                let req_type = 'Leave';
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
                notifications('approver', 'approver', obj_requestInfo, approveLeave.arr_user_email[0], applicant);
              }
              return res.status(200).json({ success: true, message: 'Success.', data: update_leave });
            } else {
              return res
                .status(200)
                .json({ success: false, message: 'Unable to process the request, Please try again later.', data: [] });
            }
          }
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
/* Reject Leave request */
router.post('/reject_leave', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    let obj_rejecter = await UsersModel.findOne({ _id: ObjectId(body.manager_id) });

    let rejecter = JSON.parse(JSON.stringify(obj_rejecter));

    let leave_req = await LeavesModel.findOne({ _id: ObjectId(body.leave_id) });

    var Leaves = new Leave();
    var LeavesEmail = new LeaveEmail();

    if (applicant && rejecter && leave_req) {
      var applicant_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      let arr_users_id = [];

      leave_req.approvals.forEach((element) => {
        arr_users_id.push(ObjectId(element.approver_id));
      });
      if (body.approver_attachment.length > 0) {
        if (leave_req.approvals && leave_req.approvals.length > 0) {
          for (let approval_index = 0; approval_index < leave_req.approvals.length; approval_index++) {
            const element = leave_req.approvals[approval_index];
            if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
              element.hide_attachment = body.hide_attachment;
              element.approver_attachment = body.approver_attachment;
              break;
            }
          }
        }
      }
      // if(leave_req.approvals[0].approver_attachment){
      //     leave_req.approvals[0].approver_attachment.push(...body.approver_attachment)
      // }else{
      //     leave_req.approvals[0].approver_attachment = body.approver_attachment
      // }
      // leave_req.approvals[0].hide_attachment = body.hide_attachment

      arr_users_id.push(ObjectId(body.user_id));

      let arr_users = await UsersModel.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
      ]);

      let rejectLeave = {};

      if (body.admin) {
        rejectLeave = Leaves.funAdminLeaveReject(
          leave_req,
          body.reason,
          rejecter,
          arr_users,
          applicant_company.rejection_flow
        );
      } else {
        rejectLeave = Leaves.funManagerLeaveReject(
          leave_req,
          body.reason,
          rejecter,
          arr_users,
          applicant_company.rejection_flow
        );
      }

      if (rejectLeave) {
        let obj_requestInfo = rejectLeave.obj_requestInfo;

        let update_match = {
          _id: ObjectId(body.leave_id),
        };

        if (obj_requestInfo.status.toLowerCase() == 'cancelled') {
          obj_requestInfo.app_status = 'Rejected';
        } else {
          obj_requestInfo.app_status = 'Processing';
        }

        let update_data = {
          $set: obj_requestInfo,
        };

        let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

        if (update_leave) {
          if (obj_requestInfo.status == 'Cancelled') {
            /* Crediting back leave count to the employee */
            let leaveType = _.lowerCase(update_leave.leave_type).replace(/\s/g, '_');

            if (update_leave.leave_type.toLowerCase() == 'unpaid leaves') {
              if (update_leave.leave_condition[0].unpaid_leave_capped) {
                applicant.leaves[leaveType] = parseFloat(applicant.leaves[leaveType]) + parseFloat(update_leave.no_of_days);
              } else {
                applicant.leaves[leaveType] -= parseFloat(update_leave.no_of_days);
              }
            } else {
              applicant.leaves[leaveType] = parseFloat(applicant.leaves[leaveType]) + parseFloat(update_leave.no_of_days);
            }

            let user_leave_update = {
              $set: {
                leaves: applicant.leaves,
              },
            };

            let user_match = {
              _id: ObjectId(body.user_id),
            };

            let user_update = await UsersModel.updateOne(user_match, user_leave_update);

            if (user_update.nModified == 1) {
              /* Email to Applicant */
              if (body.admin) {
                let applicant_email = LeavesEmail.funLeaveRejectedAdmin(
                  leave_req,
                  applicant_company,
                  applicant,
                  arr_users,
                  body.reason
                );
                sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
              } else {
                let applicant_email = LeavesEmail.funLeaveRejected(
                  leave_req,
                  applicant_company,
                  applicant,
                  arr_users,
                  body.reason
                );
                sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
              }

              /* Send Notification to Applicant */
              notifications('applicant', 'rejected', obj_requestInfo, rejecter, applicant);
            } else {
              /* If failed ,reverting request status */
              let update_data = {
                $set: {
                  status: 'Processing',
                  dateUpdated: new Date(),
                  updatedBy: ObjectId(body.user_id),
                  'approvals.$.status': 'Processing',
                },
                $pop: { appliction_log: 1 },
              };

              let update_match = {
                _id: ObjectId(body.leave_id),
                'approvals.status': 'Rejected',
              };

              if (body.admin) {
                update_match = {
                  _id: ObjectId(body.leave_id),
                  'approvals.status': 'Rejected by Admin',
                };
              }

              let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

              res
                .status(200)
                .json({ success: false, message: 'Failed to Reject request, Please try again later.', data: update_leave });
            }
          } else {
            /* Email to Next approver */
            let approver_to_email = rejectLeave.arr_user_email[0].email;
            let approver_email = LeavesEmail.funLeaveRequestApprovalManager(
              leave_req,
              applicant_company,
              applicant,
              rejectLeave.arr_user_email[0]
            );
            let req_id = update_leave._id.toString();
            let req_type = 'Leave';
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
            notifications('approver', 'approver', obj_requestInfo, rejectLeave.arr_user_email[0], applicant);
          }
          return res.status(200).json({ success: true, message: 'Success.', data: update_leave });
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
/* Reassign Leave request */
router.post('/reassign_leave', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });
    /* Reassigning manager */
    let obj_approver = await UsersModel.findOne({ _id: ObjectId(body.manager_id) });

    let approver = JSON.parse(JSON.stringify(obj_approver));

    let reassigned_manager = await UsersModel.findOne({ _id: ObjectId(body.reassign_manager_id) });

    let leave_req = await LeavesModel.findOne({ _id: ObjectId(body.leave_id) });

    let Leaves = new Leave();
    let LeavesEmail = new LeaveEmail();

    if (body.approver_attachment.length > 0) {
      if (leave_req.approvals && leave_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < leave_req.approvals.length; approval_index++) {
          const element = leave_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = body.hide_attachment;
            element.approver_attachment = body.approver_attachment;
            break;
          }
        }
      }
    }
    // if(leave_req.approvals[0].approver_attachment){
    //   leave_req.approvals[0].approver_attachment.push(...body.approver_attachment)
    // }else{
    //   leave_req.approvals[0].approver_attachment = body.approver_attachment
    // }
    // leave_req.approvals[0].hide_attachment = body.hide_attachment

    if (applicant && approver && reassigned_manager) {
      let applicant_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      /* Reassign leave request */
      let reassign_leave = Leaves.funReassignLeave(leave_req, body.reason, approver, reassigned_manager, body.admin);

      let update_match = {
        _id: ObjectId(body.leave_id),
      };

      let update_data = {
        $set: reassign_leave,
      };

      let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });

      if (update_leave) {
        /* Send email to apporver */
        let approver_to_email = reassigned_manager.email;
        let approver_email = LeavesEmail.funLeaveRequestApprovalManager(
          leave_req,
          applicant_company,
          applicant,
          reassigned_manager
        );
        let req_id = update_leave._id.toString();
        let req_type = 'Leave';
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
        notifications('approver', 'approver', update_leave, reassigned_manager, applicant);

        res.status(200).json({ success: true, message: 'Success.', data: update_leave });
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

router.post('/leave_event/', async (req, res) => {
  const id = req.body.user_id;
  const leave_id = req.body.leave_id;

  var leaveDetails = await LeavesModel.findOne({ _id: ObjectId(leave_id) });
  var subject = leaveDetails.leave_type;

  var user = await UsersModel.findOne({ _id: id });

  res.send(leaveDetails);
});

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
/* Get leaves for shift for Alternate weekend based employees */
async function getShiftandAlternateEmployees(work_schedule, leave_info, applicant) {
  try {
    if (work_schedule.toLowerCase() == 'shift based') {
      let scheduletype = 'shift';
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

      let leaveType = _.lowerCase(leave_info.obj_leave_type.leave_name).replace(/\s/g, '_');

      let getShiftsCount = await getOffDays(scheduletype, leave_info.user_id, listDate);

      let no_of_days = listDate.length - getShiftsCount;

      let remainingCount = parseFloat(applicant.leaves[leaveType]) - parseFloat(no_of_days);

      leave_info.remaining_leaves = parseFloat(remainingCount);

      leave_info.no_of_days = parseFloat(no_of_days);

      if (leave_info.half_day) {
        leave_info.remaining_leaves = parseFloat(remainingCount) - 0.5;

        leave_info.no_of_days = parseFloat(no_of_days) / 2;
      }

      return {
        remaining_leaves_count: remainingCount,
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

      let leaveType = _.lowerCase(leave_info.obj_leave_type.leave_name).replace(/\s/g, '_');

      let getShiftsCount = await getOffDays(scheduletype, leave_info.user_id, listDate);

      let no_of_days = listDate.length - getShiftsCount;

      let remainingCount = parseFloat(applicant.leaves[leaveType]) - parseFloat(no_of_days);

      leave_info.remaining_leaves = parseFloat(remainingCount);

      leave_info.no_of_days = parseFloat(no_of_days);

      if (leave_info.half_day) {
        leave_info.remaining_leaves = parseFloat(remainingCount) - 0.5;

        leave_info.no_of_days = parseFloat(no_of_days) / 2;
      }

      return {
        remaining_leaves_count: remainingCount,
        no_of_days: no_of_days,
      };
    }
  } catch (error) {
    return error;
  }
}
/* Get shift based and alternate weekends based employees off days */
async function getOffDays(scheduleType, str_user_id, arr_dates) {
  try {
    let match = {};

    if (scheduleType == 'shift') {
      match = { scheduleType: scheduleType, 'shifts.users.user_id': str_user_id, 'shifts.date': { $in: arr_dates } };
    } else {
      match = { scheduleType: scheduleType, user_id: str_user_id, date: { $in: arr_dates } };
    }
    /* if count is zero that means those days are off days for the employee */
    // let getCount = await ShiftsModel.find(match).countDocuments();
    let getCount = 0;
    return getCount;
  } catch (error) {
    return error;
  }
}
/* Create notfification for Leave requests */
async function notifications(type, subType, obj_request, approver, applicant) {
  try {
    if (type == 'approver') {
      let notification = {
        user_id: [String(approver._id)],
        read_by: [],
        notification_type: 'Leave Request Pending Approval',
        notification_text:
          'New Leave Request from ' + applicant.first_name + ' ' + applicant.last_name + ' is pending your approval',
        created_by: approver._id,
        url: '/dashboards/my-team#requests',
        createdDate: new Date(),
      };

      const notify = new notificationMessageModel(notification);
      let insert_notification = await notify.save();
    } else if (type == 'applicant') {
      if (subType == 'approved') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Leave Request Approved',
          notification_text: 'Your Leave Request is Approved. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#leave',
          createdDate: new Date(),
        };

        const notify = new notificationMessageModel(notification);
        let insert_notification = await notify.save();
      } else if (subType == 'withdrawn') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Leave Request Withdrawn',
          notification_text: 'Your Leave Request is Withdrawn. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#leave',
          createdDate: new Date(),
        };

        const notify = new notificationMessageModel(notification);
        let insert_notification = await notify.save();
      } else if (subType == 'rejected') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Leave Request Rejected',
          notification_text: 'Your Leave Request is Rejected. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#leave',
          createdDate: new Date(),
        };

        const notify = new notificationMessageModel(notification);
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

/* New Leave Request CRUD ends here */

// Yearly Leave Plan
router.post('/yearly', validateToken, async (req, res, next) => {
  try {
    let str_from_date = new Date(req.body.str_from_date);
    let str_to_date = new Date(req.body.str_to_date);
    let department = req.body.department;
    let arr_userId = [];
    let userMatch = { $match: {} };
    let leaveMatch = {
      $match: {
        from_date: { $gte: str_from_date },
        to_date: { $lte: str_to_date },
        status: { $in: ['Completed', 'Processing'] },
      },
    };

    if (department != 'All') {
      userMatch = { $match: { 'reporting.department': department } };

      const users = await UsersModel.aggregate([userMatch, { $project: { _id: 1 } }]);

      users.forEach((ele) => {
        arr_userId.push(ele._id.toString());
      });

      leaveMatch = {
        $match: {
          user_id: { $in: arr_userId },
          from_date: { $gte: str_from_date },
          to_date: { $lte: str_to_date },
          status: { $in: ['Completed', 'Processing'] },
        },
      };
    }

    const leaves = await LeavesModel.aggregate([
      leaveMatch,
      {
        $project: {
          leave_type: 1,
          from_date: 1,
          to_date: 1,
          no_of_days: 1,
          status: 1,
          user_id: 1,
        },
      },
    ]);

    res.json(leaves);
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

// router.use('', LeavesMobileApi);

module.exports = router;
