const express = require('express');
const router = express.Router();
const RequestsModel = require('../../models/requests');
const LeavesModel = require('../../models/leaves');
const WfhModel = require('../../models/wfh');
const validateToken = require('../../../utils').validateAccessToken;

const CompaniesModel = require('../../models/companies.model');
const fs = require('fs');
const AWS = require('aws-sdk');
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;
// const notificationModel = require("../../models/notifications");
const UsersModel = require('../../models/users.model');
// const PayrollModel = require('../../models/payroll');
// const PayrollProcessModel = require('../../models/payrollprocess');
const SalaryAdjustmentModel = require('../../models/salaryAdjustment');
const ObjectId = require('mongoose').Types.ObjectId;
var mongoose = require('mongoose');
const moment = require('moment');
const configurationModel = require('../../models/configuration.model');
const LettersHelper = require('../../helpers/letters_helper');
const LogsHelper = require('../../helpers/logs_helper');
const NotificationHelper = require('../../helpers/notification_helper');
const { Letters } = require('@nathangroup/letter');
const { LetterEmail } = require('@nathangroup/letter-email');
const emailHelper = require('../../helpers/email_helper');

// const RequestsMobileApi = require('./mobile/requests');
// const NotificationHelper = require('../helper/notification_helper');
// const LeavesHelper = require('../helper/leaves_helper');

// const { Loan } = require('../loan.js');
// const { LoanEmail } = require('../loanEmail.js');
const Users = require('../../models/users.model');
const ses = new AWS.SES({
  // accessKeyId: process.env.ACCESS_KEY,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1',
});

router.post('/substitute_approver', async (req, res) => {
  const { role_id, user_id } = req.body;
  try {
    const filter = {};
    if (role_id?.length) filter.role_ID = { $in: role_id };
    if (user_id?.length) filter._id = { $in: user_id.map((item) => ObjectId(item)) };

    const data = await Users.aggregate([
      { $match: { ...filter } },
      {
        $lookup: {
          from: 'users',
          let: { subApproverId: '$employment.substitute_approver' },
          as: 'substitute_approver',
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$subApproverId'] } } },
            {
              $project: {
                _id: 1,
                first_name: 1,
                middle_name: 1,
                last_name: 1,
                emp_id: 1,
                email: 1,
                user_status: 1,
                employment: 1,
                createdDate: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$substitute_approver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          middle_name: 1,
          last_name: 1,
          email: 1,
          emp_id: 1,
          user_status: 1,
          employment: 1,
          createdDate: 1,
          substitute_approver: 1,
        },
      },
    ]);

    res.status(200).json({ message: 'Successfully retrieve users', total: data.length, data });
  } catch (err) {
    throw err;
  }
});

//get loan requirements
router.post('/get_loan_requirements', async (req, res) => {
  const body = req.body;
  try {
    let match = {
      $match: {
        request_type: 'loan',
        'letter_fields.loan_type': body.loan_type,
        objid_user_id: ObjectId(body.user_id),
      },
    };

    let config_match = {
      $match: {
        loanTypes: { $elemMatch: { loan_type: body.loan_type } },
      },
    };

    let project_config = {
      $project: {
        _id: 0,
        loan_type: {
          $filter: {
            input: '$loanTypes',
            as: 'type',
            cond: { $eq: ['$$type.loan_type', body.loan_type] },
          },
        },
      },
    };

    let unwind_config = { $unwind: '$loan_type' };

    let project_loan_type = {
      $project: {
        loan_type: '$loan_type.loan_type',
        max_percentage: '$loan_type.max_percentage',
        max_months: '$loan_type.max_months',
      },
    };

    let group_requests = {
      $group: {
        _id: '$loan_type',
        total_loan_amount: { $sum: '$loan_amount' },
      },
    };

    let lookUpRequests = {
      $lookup: {
        from: 'requests',
        let: {
          user_id: ObjectId(body.user_id),
          loan_type: body.loan_type,
          request_type: 'loan',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$user_id'] },
                  { $eq: ['$request_type', '$$request_type'] },
                  // { $eq: ["$letter_fields.loan_type", "$$loan_type"] },
                ],
              },
            },
          },
          {
            $project: {
              loan_amount: { $toDouble: '$letter_fields.loan_amount' },
              loan_type: '$letter_fields.loan_type',
            },
          },
        ],
        as: 'array_requests',
      },
    };

    let lookUpUser = {
      $lookup: {
        from: 'users',
        let: {
          user_id: ObjectId(body.user_id),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$user_id'] }],
              },
            },
          },
          {
            $project: {
              salary_per_anum: { $multiply: [{ $toDouble: '$salary.total_fixed' }, 12] },
            },
          },
        ],
        as: 'array_user',
      },
    };

    let unwind_user = { $unwind: '$array_user' };

    let project_user = {
      $project: {
        loan_type: 1,
        max_percentage: 1,
        max_months: 1,
        array_requests: 1,
        salary_per_anum: '$array_user.salary_per_anum',
      },
    };

    let project = {
      $project: {},
    };

    const requests = await configurationModel.aggregate([
      config_match,
      project_config,
      unwind_config,
      project_loan_type,
      lookUpRequests,
      lookUpUser,
      unwind_user,
      project_user,
    ]);
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

//get loan requirements
router.post('/get_loan_requirements2', validateToken, async (req, res) => {
  const body = req.body;
  try {
    let match = {
      $match: {
        request_type: 'loan',
        'letter_fields.loan_type': body.loan_type,
        objid_user_id: ObjectId(body.user_id),
      },
    };
    let lookUpLoan = {
      $lookup: {
        from: 'configurations',
        let: {
          loanType: body.loan_type,
        },
        pipeline: [
          { $unwind: '$loanTypes' },
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$loanTypes.loan_type', '$$loanType'] }],
              },
            },
          },
          {
            $project: {
              _id: 0,
              loanTypes: 1,
            },
          },
        ],
        as: 'array_loan',
      },
    };
    let addField = {
      $addFields: {
        objid_user_id: {
          $toObjectId: '$user_id',
        },
      },
    };
    const requests = await RequestsModel.aggregate([addField, match, lookUpLoan]);
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

//get loan only for users
router.get('/users/loans/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  const ObjectId = require('mongoose').Types.ObjectId;
  try {
    const requests = await RequestsModel.find({ user_id: ObjectId(id), request_type: 'loan' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

/* New loan request */
router.post('/add_loan', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });
    let applied_manager = await UsersModel.findOne({ _id: ObjectId(body.applied_manager) }).select({
      first_name: 1,
      last_name: 1,
    });

    let loan = new Loan();
    let loanEmail = new LoanEmail();

    if (applicant) {
      let applicants_company = await CompaniesModel.findOne({ _id: ObjectId(applicant.company_ID) });
      /* Get loan insert body */
      let insert_loan = loan.CreateLoanRequest(applicant, body, applied_manager);

      if (typeof insert_loan === 'object') {
        /* Insert loan */
        const loan = new RequestsModel({
          ...insert_loan,
        });
        if (loan.approvals[0].reason == 'Auto Approved') {
          loan.appliction_log.push({
            approver_id: loan.approvals[0].approver_id,
            date_created: new Date(),
            status: 'Approved',
            reason: 'Auto Approved',
          });
        }
        const newLoan = await loan.save();

        if (newLoan) {
          /* Email to first Approver */
          let approver_id = '';

          for (let i = 0; i < insert_loan.approvals.length; i++) {
            if (insert_loan.approvals[i].status == 'Processing') {
              approver_id = insert_loan.approvals[i].approver_id;
            }
          }

          if (approver_id != '') {
            let first_approver = await UsersModel.findOne({ _id: ObjectId(approver_id) });
            /* Approval Email content */
            let approver_email = loanEmail.funLoanRequestApprovalManager(
              insert_loan,
              applicants_company,
              applicant,
              first_approver
            );
            /* Send Email to first Approver */
            sendEmail(first_approver.email, approver_email.subject, approver_email.body);
            /* Send Notification to first Approver */
            notifications('approver', 'approver', insert_loan, first_approver, applicant, 'Loan', '/dashboards/myhr#claim');
          }

          /* Email to Applicant */
          let arr_users_id = [];

          insert_loan.approvals.forEach((element) => {
            arr_users_id.push(ObjectId(element.approver_id));
          });

          arr_users_id.push(ObjectId(body.user_id));

          let arr_users = await UsersModel.aggregate([
            { $match: { _id: { $in: arr_users_id } } },
            { $project: { first_name: 1, last_name: 1, middle_name: 1 } },
          ]);

          let applicant_email = loanEmail.funNewLoanRequest(insert_loan, applicants_company, applicant, arr_users);

          /* Send Email to Applicant */
          sendEmail(applicant.email, applicant_email.subject, applicant_email.body);

          return res.status(200).json({ success: true, message: 'Success', data: insert_loan });
        } else {
          return res.status(200).json({ success: false, message: 'Please try again later - cant save', data: [] });
        }
      } else {
        return res.status(200).json({ success: false, message: 'Please try again later - not obj', data: [] });
      }
    } else {
      return res.status(200).json({ success: false, message: 'User not found', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// ui upgrade starts here
router.put('/update-request/add-claim/:_id/:flag', async (req, res, next) => {
  const id = req.params._id;
  const flag = req.params.flag;
  const filter = { _id: ObjectId(id) };

  try {
    const db_request = await RequestsModel.updateOne(filter, { $set: req.body[0] });
    if (flag != 'false') {
      console.log('itsd insidw');
      const requests = await RequestsModel.find({ _id: id });
      if (requests.length > 0 && requests[0].request_type === 'claims' && requests[0].status === 'Completed') {
        const user = await UsersModel.find({ _id: requests[0].user_id });
        let firstname = '';
        if (user.length > 0) {
          firstname = user[0].first_name;
        }
        let payitemObj = {
          pay_month: '',
          user_id: requests[0].user_id,
          first_name: firstname,
          earning_type: 'Earning',
          category: 'Other Allowances',
          remarks: requests[0].letter_sub_type,
          amount: requests[0].letter_fields.amount,
          approved_by_id: requests[0].approvals[0].approver_id,
          recursive_id: 'Non-Recursive',
          status: 'active',
          unpaid: 0,
          ot_type: '',
          hours: '',
        };
        const payrollprocess = await PayrollProcessModel.find({
          status: 'active',
          approved_by_finance: 'false',
          approved_by_hr: 'false',
        });
        if (payrollprocess.length > 0) {
          payitemObj['pay_month'] = payrollprocess[0].pay_month;
        } else {
          let now = new Date();
          let month = String(now.getMonth() + 1);
          month = month.padStart(2, '0');
          payitemObj['pay_month'] = now.getFullYear() + '-' + month;
        }

        const payroll = new PayrollModel({
          ...payitemObj,
        });
        const newProcess = await payroll.save();
      }
    }

    res.status(200).send('Successfuly Updated');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  next();
});

router.post('/get_all_attendance_requests', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let userType = req.body.userType;
    let user_id = mongoose.Types.ObjectId(req.body.user_id);
    let manager_id = req.body.manager_id;

    let match = { $match: { request_type: 'attendance' } };

    match = { $match: { request_type: 'attendance' } };

    if (userType == 'ADMIN') {
      match = { $match: { request_type: 'attendance' } };
    } else if (userType == 'MANAGER') {
      match = { $match: { request_type: 'attendance', approvals: { $elemMatch: { approver_id: manager_id } } } };
    } else {
      match = { $match: { request_type: 'attendance', user_id: user_id } };
    }

    let user_lookup = {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userid'] }],
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

    const requests = await RequestsModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      { $skip: skipCount },
      { $limit: pageLimit },
      user_lookup,
      {
        $project: {
          approvals: 1,
          appliction_log: 1,
          request_type: 1,
          status: 1,
          user_id: 1,
          date_created: 1,
          letter_fields: 1,
          letter_type: 1,
          array_user: '$array_user',
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    // log
    res.status(500).send(error.message);
  }
});

router.post('/new-request', validateToken, async (req, res) => {
  const request = new RequestsModel({
    ...req.body,
  });

  try {
    let savedRequest = await request.save();
    res.status(200).json(savedRequest);
    res.send('Request Saved');
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/get_all_letter_types', validateToken, async (req, res) => {
  try {
    const letterTypes = await RequestsModel.aggregate([
      { $match: { request_type: 'letters' } },
      { $group: { _id: '$letter_type' } },
      { $project: { _id: 1 } },
    ]);
    res.status(200).json(letterTypes);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get requests and leave count for reports
router.post('/each_request_count', async (req, res) => {
  let date = req.body.month;

  let month = new Date(date).getMonth(); // returns the current month

  let year = new Date(date).getFullYear(); // returns the current year

  let from_date = new Date(year, month, 1); // first day of current month

  let to_Date = new Date(year, month + 1, 0); // last day of current month
  from_date.setTime(from_date.getTime() + 4 * 60 * 60 * 1000);
  to_Date.setTime(to_Date.getTime() + 4 * 60 * 60 * 1000);
  to_Date.setHours(23, 59, 59, 59);
  try {
    // approvals:{$elemMatch:{approved_date:{$gte:from_date,$lt:to_Date}}}
    const letterRequests = await RequestsModel.aggregate([
      { $match: { request_type: 'letters', status: { $in: ['Processing', 'processing'] } } },
      { $count: 'count' },
    ]);
    // const letterRequests = await RequestsModel.aggregate([{ $match: { request_type: "letters", status: { $nin: ["Completed", "completed", "Cancelled"] } } }, { $count: "count" }])
    // const claimsRequests = await RequestsModel.aggregate([{ $match: { request_type: "claims", status: { $nin: ["Completed", "completed", "Cancelled"] } } }, { $count: "count" }])
    const claimsRequests = await RequestsModel.aggregate([
      { $match: { request_type: 'claims', status: { $in: ['Processing', 'processing'] } } },
      { $count: 'count' },
    ]);
    const attendanceRequests = await RequestsModel.aggregate([
      { $match: { request_type: 'attendance', status: { $in: ['Processing', 'processing'] } } },
      { $count: 'count' },
    ]);
    // const attendanceRequests = await RequestsModel.aggregate([{ $match: { request_type: "attendance", status: { $nin: ["Completed", "completed", "Cancelled"] } } }, { $count: "count" }])
    // const wfhRequests = await WfhModel.aggregate([{ $match: { status: { $nin: ["Completed", "completed", "Cancelled"] } } }, { $count: "count" }])
    const wfhRequests = await WfhModel.aggregate([
      { $match: { status: { $in: ['Processing', 'processing'] } } },
      { $count: 'count' },
    ]);
    // const leaveRequests = await LeavesModel.aggregate([{ $match: { status: { $nin: ["Completed", "completed", "Cancelled"] } } }, { $count: "count" }])
    const leaveRequests = await LeavesModel.aggregate([
      { $match: { status: { $in: ['Processing', 'processing'] } } },
      { $count: 'count' },
    ]);
    // const letterRequests = await RequestsModel.find({ $addFields: { "date_field": { $toDate: "$approvals.approved_date" } } },{ request_type: "letters" ,status:"Completed",date_field:{$gte:from_date,$lt:to_Date}}).count()

    // const claimsRequests = await RequestsModel.find({ request_type: "claims" ,status:"Completed"}).count()

    // const attendanceRequests = await RequestsModel.find({ request_type: "attendance" ,status:"Completed"}).count()

    // const wfhRequests = await WfhModel.find({status:"Completed"}).count()

    // const leaveRequests = await LeavesModel.find({status:"Completed"}).count()

    res.status(200).json({ letterRequests, claimsRequests, attendanceRequests, wfhRequests, leaveRequests });
  } catch (error) {
    res.status(500).send(error);
  }
});

// get leave type count for reports weekly
router.post('/each_leave_count_weekly', async (req, res) => {
  let date = req.body.month;
  let letter_type = req.body.letterType;
  let month = new Date(date).getMonth(); // returns the current month

  let year = new Date(date).getFullYear(); // returns the current year

  try {
    let arr = [];

    for (let i = 0; i < 4; i++) {
      let from_date = new Date(year, month);
      from_date.setDate(from_date.getDate() + 7 * [i]);
      from_date.setTime(from_date.getTime() + 4 * 60 * 60 * 1000);

      let to_Date = new Date(year, month);
      to_Date.setDate(to_Date.getDate() + 7 * [i + 1]);
      to_Date.setTime(to_Date.getTime() + 4 * 60 * 60 * 1000);

      const leaveWeekly = await LeavesModel.aggregate([
        { $addFields: { date_field: { $toDate: '$from_date' } } },
        { $match: { leave_type: letter_type, status: 'Completed', date_field: { $gte: from_date, $lt: to_Date } } },
        { $count: 'count' },
      ]);

      arr.push(leaveWeekly);
    }

    res.status(200).json({ arr });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/get_all_letters', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let letterType = req.body.letterType;
    let userType = req.body.userType;
    let user_id = req.body.user_id;
    user_id = ObjectId(user_id);

    let match = { $match: { request_type: 'letters' } };

    match = { $match: { request_type: 'letters' } };

    if (userType == 'ADMIN') {
      match = { $match: { request_type: 'letters', letter_type: letterType } };
      if (letterType == 'ALL') match = { $match: { request_type: 'letters' } };
    } else if (userType == 'MANAGER') {
      match = {
        $match: { request_type: 'letters', letter_type: letterType, approvals: { $elemMatch: { approver_id: user_id } } },
      };
      if (letterType == 'ALL')
        match = { $match: { request_type: 'letters', approvals: { $elemMatch: { approver_id: user_id } } } };
    } else {
      match = { $match: { request_type: 'letters', letter_type: letterType, user_id: user_id } };
      if (letterType == 'ALL') match = { $match: { request_type: 'letters', user_id: user_id } };
    }

    const requests = await RequestsModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      { $skip: skipCount },
      { $limit: pageLimit },
      {
        $project: {
          approvals: 1,
          letter_keys: 1,
          appliction_log: 1,
          request_type: 1,
          letterImages: 1,
          signatory: 1,
          user_keys: 1,
          letter_fields: 1,
          letter_type: 1,
          letter_sub_type: 1,
          status: 1,
          pdfStyles: 1,
          previewStyles: 1,
          user_id: 1,
          company_id: 1,
          date_created: 1,
          pdf_url: 1,
          content: {
            $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' },
          },
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/claims/all', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let letterType = req.body.letterType;
    let userType = req.body.userType;
    let user_id = req.body.user_id;
    user_id = ObjectId(user_id);

    let match = { $match: { request_type: 'claims' } };

    match = { $match: { request_type: 'claims' } };

    if (userType == 'ADMIN') {
      match = { $match: { request_type: 'claims', letter_type: letterType } };
      if (letterType == 'ALL') match = { $match: { request_type: 'claims' } };
    } else if (userType == 'MANAGER') {
      match = {
        $match: { request_type: 'claims', letter_type: letterType, approvals: { $elemMatch: { approver_id: user_id } } },
      };
      if (letterType == 'ALL')
        match = { $match: { request_type: 'claims', approvals: { $elemMatch: { approver_id: user_id } } } };
    } else {
      match = { $match: { request_type: 'claims', letter_type: letterType, user_id: user_id } };
      if (letterType == 'ALL') match = { $match: { request_type: 'claims', user_id: user_id } };
    }

    const requests = await RequestsModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      { $skip: skipCount },
      { $limit: pageLimit },
      {
        $project: {
          approvals: 1,
          letter_keys: 1,
          appliction_log: 1,
          request_type: 1,
          letterImages: 1,
          signatory: 1,
          user_keys: 1,
          letter_fields: 1,
          payroll_process: 1,
          letter_type: 1,
          letter_sub_type: 1,
          status: 1,
          pdfStyles: 1,
          previewStyles: 1,
          user_id: 1,
          company_id: 1,
          date_created: 1,
          pdf_url: 1,
          content: {
            $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' },
          },
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get team leave processing only
router.post('/get_all_team_leave', validateToken, async (req, res) => {
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
    const requests = await LeavesModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      {
        $project: {
          app_status: 1,
          user_open_msg: 1,
          admin_open_msg: 1,
          replies: 1,
          leave_fields: 1,
          user_name: 1,
          certificate: 1,
          reason: 1,
          remaining_leaves: 1,
          no_of_days: 1,
          to_date: 1,
          from_date: 1,
          from_date: 1,
          leave_condition: 1,
          leave_type: 1,
          approvals: 1,
          attachments: 1,
          appliction_log: 1,
          status: 1,
          user_id: 1,
          company_id: 1,
          date_created: 1,
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get team requests processing only
router.post('/get_all_request', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let requestType = req.body.requestType;
    let userType = req.body.userType;
    let user_id = req.body.user_id;
    let history = req.body.history;

    let match = { $match: {} };

    match = {
      $match: {
        $or: [{ status: { $ne: 'processing' } }, { status: { $ne: 'Processing' } }],
        approvals: { $elemMatch: { approver_id: user_id } },
      },
    };

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
    const requests = await RequestsModel.aggregate([
      match,
      { $sort: { date_created: -1 } },
      {
        $project: {
          approvals: 1,
          letter_keys: 1,
          appliction_log: 1,
          request_type: 1,
          letterImages: 1,
          signatory: 1,
          user_keys: 1,
          letter_fields: 1,
          payroll_process: 1,
          letter_type: 1,
          letter_sub_type: 1,
          status: 1,
          pdfStyles: 1,
          previewStyles: 1,
          user_id: 1,
          company_id: 1,
          date_created: 1,
          pdf_url: 1,
          content: {
            $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' },
          },
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Request Count for today which are already completed
 */

router.post('/get_all_requests_count_bydate/', async (req, res) => {
  let claimCount = 0;
  let lettersCount = 0;
  let attendanceCount = 0;
  let leaveCount = 0;
  let wfhCount = 0;
  let match = {};

  let userType = req.body.userType;
  let user_id = req.body.user_id;
  let str_from_date = new Date(new Date(req.body.date).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(req.body.date).setHours(23, 59, 59, 0));

  if (userType == 'ADMIN') {
    match = {
      $match: {
        status: { $in: ['Completed', 'completed'] },
      },
    };
  } else if (userType == 'MANAGER') {
    match = {
      $match: {
        status: { $in: ['Completed', 'completed'] },
        approvals: { $elemMatch: { approver_id: user_id } },
      },
    };
  }

  const requests = await RequestsModel.aggregate([
    match,
    {
      $match: {
        date_created: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    { $group: { _id: '$request_type', count: { $sum: 1 } } },
  ]);

  if (requests.length > 0) {
    for (let i in requests) {
      if (requests[i]._id == 'claims') claimCount = requests[i].count;
      else if (requests[i]._id == 'attendance') attendanceCount = requests[i].count;
      else if (requests[i]._id == 'letters') lettersCount = requests[i].count;
    }
  }

  const leave = await LeavesModel.aggregate([
    match,
    {
      $match: {
        from_date: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    {
      $project: {
        _id: 1,
        leave_type: 1,
      },
    },
    { $count: 'count' },
  ]);

  if (leave.length > 0) {
    leaveCount = leave[0].count;
  }

  const wfh = await WfhModel.aggregate([
    match,
    {
      $match: {
        from_date: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    { $count: 'count' },
  ]);
  if (wfh.length > 0) {
    wfhCount = wfh[0].count;
  }

  return res.status(200).json({
    success: true,
    message: 'Successfully displaying Request',
    data: {
      claimCount: claimCount,
      attendanceCount: attendanceCount,
      lettersCount: lettersCount,
      leaveCount: leaveCount,
      wfhCount: wfhCount,
      leaveData: leave,
    },
  });
  // res.status(200).json(requests)
});

router.post('/get_all_processing_requests_count/', async (req, res) => {
  let user_Active_Ids = await UsersModel.find({ user_status: { $ne: 'deleted' } }).select({ _id: 1 });
  let arr_Active = [];
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();

  let claimCount = 0;
  let lettersCount = 0;
  let attendanceCount = 0;
  let leaveCount = 0;
  let wfhCount = 0;
  let loanCount = 0;
  let educationCount = 0;
  let passportCount = 0;
  let totalCount = 0;

  let userType = req.body.userType;
  let user_id = req.body.user_id;

  if (userType == 'ADMIN') {
    match = {
      $match: {
        status: { $in: ['Processing', 'processing'] },
        user_id: { $in: arr_Active },
      },
    };
  } else if (userType == 'MANAGER') {
    match = {
      $match: {
        status: { $in: ['Processing', 'processing'] },
        approvals: {
          $elemMatch: {
            $or: [
              { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
              { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
            ],
          },
        },
        user_id: { $in: arr_Active },
      },
    };
  }

  let aggregator = [
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    match,
    { $group: { _id: '$request_type', count: { $sum: 1 } } },
  ];

  const requests = await RequestsModel.aggregate(aggregator);

  if (requests.length > 0) {
    for (let i in requests) {
      if (requests[i]._id == 'claims') claimCount = requests[i].count;
      else if (requests[i]._id == 'attendance') attendanceCount = requests[i].count;
      else if (requests[i]._id == 'letters') lettersCount = requests[i].count;
      else if (requests[i]._id == 'loan') loanCount = requests[i].count;
      else if (requests[i]._id == 'education') educationCount = requests[i].count;
      else if (requests[i]._id == 'passport release' || requests[i]._id == 'passport safekeep')
        passportCount += requests[i].count;
    }
  }

  let leave_aggregator = [
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    {
      $lookup: {
        from: 'users',
        localField: 'objid_user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    match,
    { $count: 'count' },
  ];

  const leave = await LeavesModel.aggregate(leave_aggregator);
  if (leave.length > 0) {
    leaveCount = leave[0].count;
  }

  let wfh_aggregator = [
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    {
      $lookup: {
        from: 'users',
        localField: 'objid_user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    match,
    { $count: 'count' },
  ];

  const wfh = await WfhModel.aggregate(wfh_aggregator);
  if (wfh.length > 0) {
    wfhCount = wfh[0].count;
  }

  totalCount =
    claimCount + attendanceCount + lettersCount + leaveCount + wfhCount + loanCount + educationCount + passportCount;

  return res.status(200).json({
    success: true,
    message: 'Successfully displaying Request',
    data: {
      claimCount: claimCount,
      attendanceCount: attendanceCount,
      lettersCount: lettersCount,
      leaveCount: leaveCount,
      wfhCount: wfhCount,
      loanCount: loanCount,
      educationCount: educationCount,
      passportCount: passportCount,
      totalCount: totalCount,
    },
  });
  // res.status(200).json(requests)
});

router.post('/get_all_requests_count/:user_id', async (req, res) => {
  let user_Active_Ids = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({ _id: 1 });
  let arr_Active = [];
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();
  let match = { $match: {} };

  let claimCount = 0;
  let lettersCount = 0;
  let attendanceCount = 0;
  let leaveCount = 0;
  let wfhCount = 0;
  let loanCount = 0;
  let educationCount = 0;
  let passportCount = 0;
  let salaryAdjustmentCount = 0;

  let str_search_tag = req.body.str_search_tag;
  let userType = req.body.userType;
  let req_user_id = req.body.req_user_id;
  let user_id = req.params.user_id;
  let history = req.body.history;
  let str_from_date = new Date(new Date(req.body.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(req.body.endDate).setHours(23, 59, 59, 0));

  if (req_user_id != '') {
    arr_Active = [req_user_id, ObjectId(req_user_id)];
  }

  if (userType == 'ADMIN') {
    if (history == false) {
      match = {
        $match: {
          status: { $in: ['Processing', 'processing', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          status: { $nin: ['Processing', 'processing', 'pending', 'Draft', 'draft'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'MANAGER') {
    if (history == false) {
      match = {
        $match: {
          status: { $in: ['Processing', 'processing', 'pending'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
              ],
            },
          },
          user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          status: { $nin: ['Processing', 'processing', 'pending'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
              ],
            },
          },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'SELF') {
    if (history == false) {
      match = {
        $match: {
          objid_user_id: ObjectId(user_id),
          status: { $in: ['Processing', 'processing', 'Draft', 'draft'] },
        },
      };
    } else {
      match = {
        $match: {
          objid_user_id: ObjectId(user_id),
          status: { $nin: ['Processing', 'processing', 'Draft', 'draft'] },
        },
      };
    }
  }

  let aggregator = [
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ['$associated_user.first_name', ' ', '$associated_user.last_name'],
            },
            regex: str_search_tag,
            options: 'i',
          },
        },
      },
    },
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    match,
    {
      $match: {
        date_created: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    { $group: { _id: '$request_type', count: { $sum: 1 } } },
  ];

  const requests = await RequestsModel.aggregate(aggregator);

  if (requests.length > 0) {
    for (let i in requests) {
      if (requests[i]._id == 'claims') claimCount = requests[i].count;
      else if (requests[i]._id == 'attendance') attendanceCount = requests[i].count;
      else if (requests[i]._id == 'letters') lettersCount = requests[i].count;
      else if (requests[i]._id == 'loan') loanCount = requests[i].count;
      else if (requests[i]._id == 'education') educationCount = requests[i].count;
      else if (requests[i]._id == 'passport release' || requests[i]._id == 'passport safekeep')
        passportCount += requests[i].count;
    }
  }

  let leave_aggregator = [
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    {
      $lookup: {
        from: 'users',
        localField: 'objid_user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ['$associated_user.first_name', ' ', '$associated_user.last_name'],
            },
            regex: str_search_tag,
            options: 'i',
          },
        },
      },
    },
    match,
    {
      $match: {
        date_created: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    { $count: 'count' },
  ];

  const leave = await LeavesModel.aggregate(leave_aggregator);
  if (leave.length > 0) {
    leaveCount = leave[0].count;
  }

  let wfh_aggregator = [
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    {
      $lookup: {
        from: 'users',
        localField: 'objid_user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ['$associated_user.first_name', ' ', '$associated_user.last_name'],
            },
            regex: str_search_tag,
            options: 'i',
          },
        },
      },
    },
    match,
    {
      $match: {
        date_created: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    { $count: 'count' },
  ];

  const wfh = await WfhModel.aggregate(wfh_aggregator);
  if (wfh.length > 0) {
    wfhCount = wfh[0].count;
  }

  let salary_adjustment_aggregator = [
    { $addFields: { objid_user_id: { $toObjectId: '$user_id' } } },
    {
      $lookup: {
        from: 'users',
        localField: 'objid_user_id',
        foreignField: '_id',
        as: 'associated_user',
      },
    },
    {
      $unwind: {
        path: '$associated_user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ['$associated_user.first_name', ' ', '$associated_user.last_name'],
            },
            regex: str_search_tag,
            options: 'i',
          },
        },
      },
    },
    match,
    {
      $match: {
        date_created: {
          $gte: str_from_date,
          $lte: str_to_date,
        },
      },
    },
    { $count: 'count' },
  ];

  const salary_adjustment = await SalaryAdjustmentModel.aggregate(salary_adjustment_aggregator);
  if (salary_adjustment.length > 0) {
    salaryAdjustmentCount = salary_adjustment[0].count;
  }

  return res.status(200).json({
    success: true,
    message: 'Successfully displaying Request',
    data: {
      claimCount: claimCount,
      attendanceCount: attendanceCount,
      lettersCount: lettersCount,
      leaveCount: leaveCount,
      wfhCount: wfhCount,
      loanCount: loanCount,
      educationCount: educationCount,
      passportCount: passportCount,
      salaryAdjustmentCount: salaryAdjustmentCount,
    },
  });
  // res.status(200).json(requests)
});

router.post('/get_request_info', async (req, res) => {
  let requestType = req.body.requestType;
  let req_id = req.body.req_id;
  let user_id = req.body.user_id;
  let user_type = req.body.user_type;
  let user_access = req.body.user_access;

  let match = {
    $match: {
      _id: ObjectId(req_id),
    },
  };

  try {
    let userLookup = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              company_ID: 1,
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };

    let leavesLookup = {
      $lookup: {
        from: 'leaves',
        localField: 'string_id',
        //   foreignField: "approvals.approver_id",
        foreignField: 'user_id',

        as: 'leaves_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              request_type: 'leaves',
              app_status: 1,
              user_open_msg: 1,
              admin_open_msg: 1,
              replies: 1,
              leave_fields: 1,
              user_name: 1,
              certificate: 1,
              reason: 1,
              remaining_leaves: 1,

              no_of_days: 1,
              to_date: 1,
              from_date: 1,
              leave_condition: 1,
              leave_type: 1,
              approvals: 1,
              attachments: 1,
              appliction_log: 1,

              status: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              user_data: 1,
            },
          },
          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let letterLookup = {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'user_id',
        as: 'letter_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              letter_keys: 1,
              appliction_log: 1,
              request_type: 1,
              letterImages: 1,
              signatory: 1,
              user_keys: 1,
              content: {
                $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' },
              },
              letter_fields: 1,
              payroll_process: 1,
              letter_type: 1,
              letter_sub_type: 1,
              status: 1,
              pdfStyles: 1,
              previewStyles: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              pdf_url: 1,
              user_data: 1,
            },
          },
          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let wfhLookup = {
      $lookup: {
        from: 'wfhs',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'wfh_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              request_type: 'wfh',
              from_date: 1,
              to_date: 1,
              status: 1,
              reason: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              letter_fields: 1,
              no_of_days: 1,
              created_by_id: 1,
              attachments: 1,
              date_created: 1,
              user_data: 1,
              appliction_log: 1,
            },
          },

          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let attendanceLookup = {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'user_id',
        as: 'attendance_requests',
        pipeline: [
          { $addFields: { user_id_as_object: '$user_id' } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              letter_fields: 1,
              approvals: 1,
              request_type: 'attendance',
              from_date: 1,
              to_date: 1,
              letter_type: 1,
              status: 1,
              reason: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              no_of_days: 1,
              created_by_id: 1,
              attachments: 1,
              date_created: 1,
              user_data: 1,
              appliction_log: 1,
            },
          },

          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let aggregator = [
      { $addFields: { string_id: { $toString: '$_id' } } },
      {},
      {},
      // Expand the requestInfo array into a stream of documents
      { $unwind: '$requestInfo' },

      {
        $project: {
          _id: '$requestInfo._id',
          status: '$requestInfo.status',
          request_type: '$requestInfo.request_type',
          app_status: '$requestInfo.request_type',
          user_open_msg: '$requestInfo.app_status',
          admin_open_msg: '$requestInfo.user_open_msg',
          replies: '$requestInfo.replies',
          leave_fields: '$requestInfo.leave_fields',
          user_name: '$requestInfo.user_name',
          certificate: '$requestInfo.certificate',
          reason: '$requestInfo.reason',
          remaining_leaves: '$requestInfo.remaining_leaves',
          no_of_days: '$requestInfo.no_of_days',
          to_date: '$requestInfo.to_date',
          from_date: '$requestInfo.from_date',
          leave_condition: '$requestInfo.leave_condition',
          leave_type: '$requestInfo.leave_type',
          approvals: '$requestInfo.approvals',
          attachments: '$requestInfo.attachments',
          appliction_log: '$requestInfo.appliction_log',
          user_id: '$requestInfo.user_id',
          company_id: '$requestInfo.company_id',
          date_created: '$requestInfo.date_created',
          user_data: '$requestInfo.user_data',
          letter_keys: '$requestInfo.letter_keys',
          appliction_log: '$requestInfo.appliction_log',
          request_type: '$requestInfo.request_type',
          letterImages: '$requestInfo.letterImages',
          signatory: '$requestInfo.signatory',
          user_keys: '$requestInfo.user_keys',
          letter_fields: '$requestInfo.letter_fields',
          payroll_process: '$requestInfo.payroll_process',
          letter_type: '$requestInfo.letter_type',
          letter_sub_type: '$requestInfo.letter_sub_type',
          pdfStyles: '$requestInfo.pdfStyles',
          previewStyles: '$requestInfo.previewStyles',
          approvals: '$requestInfo.approvals',
          reason: '$requestInfo.reason',
          no_of_days: '$requestInfo.no_of_days',
          created_by_id: '$requestInfo.created_by_id',
          pdf_url: '$requestInfo.pdf_url',
          content: '$requestInfo.content',
        },
      },
    ];

    if (requestType == 'Leave') {
      aggregator[1] = leavesLookup;
      aggregator[2] = {
        $project: {
          _id: 1,
          requestInfo: '$leaves_requests',
        },
      };
    } else if (requestType == 'wfh') {
      aggregator[1] = wfhLookup;
      aggregator[2] = {
        $project: {
          _id: 1,
          requestInfo: '$wfh_requests',
        },
      };
    } else if (requestType == 'requests') {
      aggregator[1] = letterLookup;
      aggregator[2] = {
        $project: {
          _id: 1,
          requestInfo: '$letter_requests',
        },
      };
    } else if (requestType == 'attendance') {
      aggregator[1] = attendanceLookup;
      aggregator[2] = {
        $project: {
          _id: 1,
          requestInfo: '$attendance_requests',
        },
      };
    }

    console.log(requestType, 'request type');

    const requestsData = await UsersModel.aggregate(aggregator);

    var result = requestsData;

    if (result && result.length > 0) {
      let user_type_admin = false;
      let access = false;
      if (user_type == '5e2ec39af3185a0b5036ef01') {
        user_type_admin = true;
        access = true;
      } else if (user_access == true) {
        user_type_admin = true;
        access = true;
      } else {
        let approver = result[0].approvals.filter((a) => a.approver_id == user_id || a.approver_id == ObjectId(user_id));
        if (approver.length > 0) {
          user_type_admin = false;
          access = true;
        }
      }
      if (access === true) {
        return res.status(200).json({
          success: true,
          message: 'Successfully displaying Request',
          data: result[0],
          user_type_admin: user_type_admin,
        });
      } else {
        return res.status(200).json({ success: false, message: 'Access Denied', data: {} });
      }
    } else {
      return res.status(200).json({ success: false, message: 'No data found', data: {} });
    }
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.post('/get_requests_all', async (req, res) => {
  try {
    const { skip, limit, history, requestType, userType, user_id, endDate, startDate, str_search_tag, req_user_id } =
      req.body;
    const activeUserIds = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
      _id: 1,
    });
    const arr_Active = activeUserIds.flatMap((a) => [a._id.toString(), a._id]);
    if (req_user_id !== '') {
      arr_Active.push(req_user_id, ObjectId(req_user_id));
    }
    const strFromDate = new Date(new Date(startDate || '2/1/2010').setHours(0, 0, 0, 0));
    const strToDate = new Date(new Date(endDate || new Date()).setHours(23, 59, 59, 0));

    const commonMatch = { date_created: { $gte: strFromDate, $lt: strToDate }, user_id: { $in: arr_Active } };

    const userTypeMatch = {
      ADMIN: {
        false: { status: { $in: ['Processing', 'processing'] } },
        true: { status: { $nin: ['processing', 'Processing', 'Draft', 'draft'] } },
      },
      MANAGER: {
        false: {
          status: { $in: ['Processing', 'processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
              ],
            },
          },
        },
        true: {
          status: { $nin: ['processing', 'Processing', 'Draft', 'draft'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
              ],
            },
          },
        },
      },
      SELF: {
        false: {
          request_type: { $ne: 'attendance' },
          status: { $in: ['Processing', 'processing', 'Draft', 'draft'] },
          user_id_as_object: ObjectId(user_id),
        },
        true: {
          request_type: { $ne: 'attendance' },
          user_id_as_object: ObjectId(user_id),
          status: { $nin: ['processing', 'Processing', 'Draft', 'draft'] },
        },
      },
    };

    const userTypeConditions = userTypeMatch[userType][history.toString()];
    const match = { $match: { ...commonMatch, ...userTypeConditions } };

    const userLookUp = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              company_ID: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };

    const leavesLookUp = {
      $lookup: {
        from: 'leaves',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'leaves_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookUp,
          { $unwind: '$user_data' },
          {
            $project: {
              request_type: 'leaves',
              app_status: 1,
              user_open_msg: 1,
              admin_open_msg: 1,
              replies: 1,
              leave_fields: 1,
              user_name: 1,
              certificate: 1,
              reason: 1,
              remaining_leaves: 1,
              no_of_days: 1,
              to_date: 1,
              from_date: 1,
              leave_condition: 1,
              leave_type: 1,
              approvals: 1,
              attachments: 1,
              appliction_log: 1,
              status: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              user_data: 1,
            },
          },
          { $sort: { date_created: -1 } },
        ],
      },
    };

    let request_type_match = { $match: {} };
    if (requestType !== 'ALL' && requestType !== 'Leave' && requestType !== 'wfh') {
      const req_type_arr =
        requestType === 'passport' ? ['passport', 'passport safekeep', 'passport release'] : [requestType];
      request_type_match = { $match: { request_type: { $in: req_type_arr } } };
    }

    const letterLookUp = {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'user_id',
        as: 'letter_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          request_type_match,
          match,
          userLookUp,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              letter_keys: 1,
              appliction_log: 1,
              request_type: 1,
              letterImages: 1,
              signatory: 1,
              user_keys: 1,
              content: { $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' } },
              letter_fields: 1,
              payroll_process: 1,
              letter_type: 1,
              letter_sub_type: 1,
              status: 1,
              pdfStyles: 1,
              previewStyles: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              pdf_url: 1,
              user_data: 1,
              claims: 1,
            },
          },
          { $sort: { date_created: -1 } },
        ],
      },
    };

    const wfhLookUp = {
      $lookup: {
        from: 'wfhs',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'wfh_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookUp,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              request_type: 'wfh',
              from_date: 1,
              to_date: 1,
              status: 1,
              reason: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              no_of_days: 1,
              created_by_id: 1,
              attachments: 1,
              date_created: 1,
              user_data: 1,
              appliction_log: 1,
            },
          },
          { $sort: { date_created: -1 } },
        ],
      },
    };

    let aggregator = [
      {
        $match: {
          $expr: {
            $regexMatch: { input: { $concat: ['$first_name', ' ', '$last_name'] }, regex: str_search_tag, options: 'i' },
          },
        },
      },
      { $addFields: { string_id: { $toString: '$_id' } } },
      leavesLookUp,
      letterLookUp,
      wfhLookUp,
      { $project: { _id: 1, requestInfo: { $concatArrays: ['$leaves_requests', '$letter_requests', '$wfh_requests'] } } },
      { $unwind: '$requestInfo' },
      {
        $project: {
          _id: '$requestInfo._id',
          status: '$requestInfo.status',
          request_type: '$requestInfo.request_type',
          app_status: '$requestInfo.request_type',
          user_open_msg: '$requestInfo.app_status',
          admin_open_msg: '$requestInfo.user_open_msg',
          replies: '$requestInfo.replies',
          leave_fields: '$requestInfo.leave_fields',
          user_name: '$requestInfo.user_name',
          certificate: '$requestInfo.certificate',
          reason: '$requestInfo.reason',
          remaining_leaves: '$requestInfo.remaining_leaves',
          no_of_days: '$requestInfo.no_of_days',
          to_date: '$requestInfo.to_date',
          from_date: '$requestInfo.from_date',
          leave_condition: '$requestInfo.leave_condition',
          leave_type: '$requestInfo.leave_type',
          approvals: '$requestInfo.approvals',
          attachments: '$requestInfo.attachments',
          appliction_log: '$requestInfo.appliction_log',
          user_id: '$requestInfo.user_id',
          company_id: '$requestInfo.company_id',
          date_created: '$requestInfo.date_created',
          user_data: '$requestInfo.user_data',
          letter_keys: '$requestInfo.letter_keys',
          appliction_log: '$requestInfo.appliction_log',
          request_type: '$requestInfo.request_type',
          claims: '$requestInfo.claims',
          letterImages: '$requestInfo.letterImages',
          signatory: '$requestInfo.signatory',
          user_keys: '$requestInfo.user_keys',
          letter_fields: '$requestInfo.letter_fields',
          payroll_process: '$requestInfo.payroll_process',
          letter_type: '$requestInfo.letter_type',
          letter_sub_type: '$requestInfo.letter_sub_type',
          pdfStyles: '$requestInfo.pdfStyles',
          previewStyles: '$requestInfo.previewStyles',
          approvals: '$requestInfo.approvals',
          reason: '$requestInfo.reason',
          no_of_days: '$requestInfo.no_of_days',
          created_by_id: '$requestInfo.created_by_id',
          pdf_url: '$requestInfo.pdf_url',
          content: '$requestInfo.content',
        },
      },
      { $sort: { date_created: -1 } },
      { $facet: { results: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }] } },
    ];

    const requestTypeMap = {
      Leave: { index: 5, projection: { $concatArrays: ['$leaves_requests'] } },
      wfh: { index: 5, projection: { $concatArrays: ['$wfh_requests'] } },
      ALL: {},
      default: { index: 5, projection: { $concatArrays: ['$letter_requests'] } },
    };

    const requestTypeObj = requestTypeMap[requestType] || requestTypeMap.default;
    const { index, projection } = requestTypeObj;

    if (index) {
      aggregator[index] = { $project: { _id: 1, requestInfo: projection } };
      aggregator.splice(index === 5 ? 3 : 2, 2);
    }

    const requestsData = await UsersModel.aggregate(aggregator);
    const responseData = requestsData[0];

    if (responseData && responseData.results.length > 0) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: responseData });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: [] });
    }
  } catch (error) {
    console.log('#Error Log', error);
    res.status(500).json({ success: false, message: 'An error occurred', data: [] });
  }
});

router.post('/get_all_leave_requests', async (req, res) => {
  try {
    const { skip, limit, history, requestType, userType, user_id, endDate, startDate, str_search_tag, req_user_id } =
      req.body;
    const activeUserIds = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
      _id: 1,
    });
    const arr_Active = activeUserIds.flatMap((a) => [a._id.toString(), a._id]);
    if (req_user_id !== '') {
      arr_Active.push(req_user_id, ObjectId(req_user_id));
    }
    const strFromDate = new Date(new Date(startDate || '2/1/2010').setHours(0, 0, 0, 0));
    const strToDate = new Date(new Date(endDate || new Date()).setHours(23, 59, 59, 0));
    const commonMatch = { date_created: { $gte: strFromDate, $lt: strToDate }, user_id: { $in: arr_Active } };
    const userTypeMatch = {
      ADMIN: {
        false: { status: { $in: ['Processing', 'processing'] } },
        true: { status: { $nin: ['processing', 'Processing'] } },
      },
      MANAGER: {
        false: {
          status: { $in: ['Processing', 'processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
              ],
            },
          },
        },
        true: {
          status: { $nin: ['processing', 'Processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
              ],
            },
          },
        },
      },
      SELF: {
        false: {
          request_type: { $ne: 'attendance' },
          status: { $in: ['Processing', 'processing'] },
          user_id_as_object: ObjectId(user_id),
        },
        true: {
          request_type: { $ne: 'attendance' },
          user_id_as_object: ObjectId(user_id),
          status: { $nin: ['processing', 'Processing'] },
        },
      },
    };
    const userTypeConditions = userTypeMatch[userType][history.toString()];
    const match = { $match: { ...commonMatch, ...userTypeConditions } };

    const userLookUp = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              company_ID: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };

    const leavesLookUp = {
      $lookup: {
        from: 'leaves',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'leaves_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookUp,
          { $unwind: '$user_data' },
          {
            $project: {
              request_type: 'leaves',
              app_status: 1,
              user_open_msg: 1,
              admin_open_msg: 1,
              replies: 1,
              leave_fields: 1,
              user_name: 1,
              certificate: 1,
              reason: 1,
              remaining_leaves: 1,
              no_of_days: 1,
              to_date: 1,
              from_date: 1,
              leave_condition: 1,
              leave_type: 1,
              approvals: 1,
              attachments: 1,
              appliction_log: 1,
              status: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              user_data: 1,
            },
          },
          { $sort: { date_created: -1 } },
        ],
      },
    };
    let aggregator = [
      {
        $match: {
          $expr: {
            $regexMatch: { input: { $concat: ['$first_name', ' ', '$last_name'] }, regex: str_search_tag, options: 'i' },
          },
        },
      },
      { $addFields: { string_id: { $toString: '$_id' } } },
      leavesLookUp,
      { $project: { _id: 1, requestInfo: { $concatArrays: ['$leaves_requests'] } } },
      { $unwind: '$requestInfo' },
      {
        $project: {
          _id: '$requestInfo._id',
          status: '$requestInfo.status',
          request_type: '$requestInfo.request_type',
          app_status: '$requestInfo.request_type',
          user_open_msg: '$requestInfo.app_status',
          admin_open_msg: '$requestInfo.user_open_msg',
          replies: '$requestInfo.replies',
          leave_fields: '$requestInfo.leave_fields',
          user_name: '$requestInfo.user_name',
          certificate: '$requestInfo.certificate',
          reason: '$requestInfo.reason',
          remaining_leaves: '$requestInfo.remaining_leaves',
          no_of_days: '$requestInfo.no_of_days',
          to_date: '$requestInfo.to_date',
          from_date: '$requestInfo.from_date',
          leave_condition: '$requestInfo.leave_condition',
          leave_type: '$requestInfo.leave_type',
          approvals: '$requestInfo.approvals',
          attachments: '$requestInfo.attachments',
          appliction_log: '$requestInfo.appliction_log',
          user_id: '$requestInfo.user_id',
          company_id: '$requestInfo.company_id',
          date_created: '$requestInfo.date_created',
          user_data: '$requestInfo.user_data',
          letter_keys: '$requestInfo.letter_keys',
          appliction_log: '$requestInfo.appliction_log',
          request_type: '$requestInfo.request_type',
          letterImages: '$requestInfo.letterImages',
          signatory: '$requestInfo.signatory',
          user_keys: '$requestInfo.user_keys',
          letter_fields: '$requestInfo.letter_fields',
          payroll_process: '$requestInfo.payroll_process',
          letter_type: '$requestInfo.letter_type',
          letter_sub_type: '$requestInfo.letter_sub_type',
          pdfStyles: '$requestInfo.pdfStyles',
          previewStyles: '$requestInfo.previewStyles',
          approvals: '$requestInfo.approvals',
          reason: '$requestInfo.reason',
          no_of_days: '$requestInfo.no_of_days',
          created_by_id: '$requestInfo.created_by_id',
          pdf_url: '$requestInfo.pdf_url',
          content: '$requestInfo.content',
        },
      },
      { $sort: { date_created: -1 } },
      { $facet: { results: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }] } },
    ];
    const requestsData = await UsersModel.aggregate(aggregator);
    const responseData = requestsData[0];

    if (responseData && responseData.results.length > 0) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: responseData });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: [] });
    }
  } catch (error) {
    console.log('#Error Log', error);
    res.status(500).json({ success: false, message: 'An error occurred', data: [] });
  }
});

router.post('/get_all_wfh_requests', async (req, res) => {
  try {
    const { skip, limit, history, requestType, userType, user_id, endDate, startDate, str_search_tag, req_user_id } =
      req.body;
    const activeUserIds = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
      _id: 1,
    });
    const arr_Active = activeUserIds.flatMap((a) => [a._id.toString(), a._id]);
    if (req_user_id !== '') {
      arr_Active.push(req_user_id, ObjectId(req_user_id));
    }
    const strFromDate = new Date(new Date(startDate || '2/1/2010').setHours(0, 0, 0, 0));
    const strToDate = new Date(new Date(endDate || new Date()).setHours(23, 59, 59, 0));

    const commonMatch = { date_created: { $gte: strFromDate, $lt: strToDate }, user_id: { $in: arr_Active } };

    const userTypeMatch = {
      ADMIN: {
        false: { status: { $in: ['Processing', 'processing'] } },
        true: { status: { $nin: ['processing', 'Processing'] } },
      },
      MANAGER: {
        false: {
          status: { $in: ['Processing', 'processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
              ],
            },
          },
        },
        true: {
          status: { $nin: ['processing', 'Processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
              ],
            },
          },
        },
      },
      SELF: {
        false: {
          request_type: { $ne: 'attendance' },
          status: { $in: ['Processing', 'processing'] },
          user_id_as_object: ObjectId(user_id),
        },
        true: {
          request_type: { $ne: 'attendance' },
          user_id_as_object: ObjectId(user_id),
          status: { $nin: ['processing', 'Processing'] },
        },
      },
    };

    const userTypeConditions = userTypeMatch[userType][history.toString()];
    const match = { $match: { ...commonMatch, ...userTypeConditions } };

    const userLookUp = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              company_ID: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };

    const wfhLookUp = {
      $lookup: {
        from: 'wfhs',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'wfh_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookUp,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              request_type: 'wfh',
              from_date: 1,
              to_date: 1,
              status: 1,
              reason: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              no_of_days: 1,
              created_by_id: 1,
              attachments: 1,
              date_created: 1,
              user_data: 1,
              appliction_log: 1,
            },
          },
          { $sort: { date_created: -1 } },
        ],
      },
    };

    let aggregator = [
      {
        $match: {
          $expr: {
            $regexMatch: { input: { $concat: ['$first_name', ' ', '$last_name'] }, regex: str_search_tag, options: 'i' },
          },
        },
      },
      { $addFields: { string_id: { $toString: '$_id' } } },
      wfhLookUp,
      { $project: { _id: 1, requestInfo: { $concatArrays: ['$wfh_requests'] } } },
      { $unwind: '$requestInfo' },
      {
        $project: {
          _id: '$requestInfo._id',
          status: '$requestInfo.status',
          request_type: '$requestInfo.request_type',
          app_status: '$requestInfo.request_type',
          user_open_msg: '$requestInfo.app_status',
          admin_open_msg: '$requestInfo.user_open_msg',
          replies: '$requestInfo.replies',
          leave_fields: '$requestInfo.leave_fields',
          user_name: '$requestInfo.user_name',
          certificate: '$requestInfo.certificate',
          reason: '$requestInfo.reason',
          remaining_leaves: '$requestInfo.remaining_leaves',
          no_of_days: '$requestInfo.no_of_days',
          to_date: '$requestInfo.to_date',
          from_date: '$requestInfo.from_date',
          leave_condition: '$requestInfo.leave_condition',
          leave_type: '$requestInfo.leave_type',
          approvals: '$requestInfo.approvals',
          attachments: '$requestInfo.attachments',
          appliction_log: '$requestInfo.appliction_log',
          user_id: '$requestInfo.user_id',
          company_id: '$requestInfo.company_id',
          date_created: '$requestInfo.date_created',
          user_data: '$requestInfo.user_data',
          letter_keys: '$requestInfo.letter_keys',
          appliction_log: '$requestInfo.appliction_log',
          request_type: '$requestInfo.request_type',
          letterImages: '$requestInfo.letterImages',
          signatory: '$requestInfo.signatory',
          user_keys: '$requestInfo.user_keys',
          letter_fields: '$requestInfo.letter_fields',
          payroll_process: '$requestInfo.payroll_process',
          letter_type: '$requestInfo.letter_type',
          letter_sub_type: '$requestInfo.letter_sub_type',
          pdfStyles: '$requestInfo.pdfStyles',
          previewStyles: '$requestInfo.previewStyles',
          approvals: '$requestInfo.approvals',
          reason: '$requestInfo.reason',
          no_of_days: '$requestInfo.no_of_days',
          created_by_id: '$requestInfo.created_by_id',
          pdf_url: '$requestInfo.pdf_url',
          content: '$requestInfo.content',
        },
      },
      { $sort: { date_created: -1 } },
      { $facet: { results: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }] } },
    ];

    const requestsData = await UsersModel.aggregate(aggregator);
    const responseData = requestsData[0];

    if (responseData && responseData.results.length > 0) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: responseData });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: [] });
    }
  } catch (error) {
    console.log('#Error Log ', error);
    res.status(500).json({ success: false, message: 'An error occurred ', data: [] });
  }
});

router.post('/get_all_letter_requests', async (req, res) => {
  try {
    const { skip, limit, history, requestType, userType, user_id, endDate, startDate, str_search_tag, req_user_id } =
      req.body;
    const activeUserIds = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
      _id: 1,
    });
    const arr_Active = activeUserIds.flatMap((a) => [a._id.toString(), a._id]);
    if (req_user_id !== '') {
      arr_Active.push(req_user_id, ObjectId(req_user_id));
    }
    const strFromDate = new Date(new Date(startDate || '2/1/2010').setHours(0, 0, 0, 0));
    const strToDate = new Date(new Date(endDate || new Date()).setHours(23, 59, 59, 0));

    const commonMatch = { date_created: { $gte: strFromDate, $lt: strToDate }, user_id: { $in: arr_Active } };

    const userTypeMatch = {
      ADMIN: {
        false: { status: { $in: ['Processing', 'processing'] } },
        true: { status: { $nin: ['processing', 'Processing'] } },
      },
      MANAGER: {
        false: {
          status: { $in: ['Processing', 'processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
              ],
            },
          },
        },
        true: {
          status: { $nin: ['processing', 'Processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
              ],
            },
          },
        },
      },
      SELF: {
        false: {
          request_type: { $ne: 'attendance' },
          status: { $in: ['Processing', 'processing'] },
          user_id_as_object: ObjectId(user_id),
        },
        true: {
          request_type: { $ne: 'attendance' },
          user_id_as_object: ObjectId(user_id),
          status: { $nin: ['processing', 'Processing'] },
        },
      },
    };

    const userTypeConditions = userTypeMatch[userType][history.toString()];
    const match = { $match: { ...commonMatch, ...userTypeConditions } };

    const userLookUp = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              company_ID: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };
    let request_type_match = { $match: {} };
    if (requestType !== 'ALL' && requestType !== 'Leave' && requestType !== 'wfh') {
      const req_type_arr =
        requestType === 'passport' ? ['passport', 'passport safekeep', 'passport release'] : [requestType];
      request_type_match = { $match: { request_type: { $in: req_type_arr } } };
    }

    const letterLookUp = {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'user_id',
        as: 'letter_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          request_type_match,
          match,
          userLookUp,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              letter_keys: 1,
              appliction_log: 1,
              request_type: 1,
              letterImages: 1,
              signatory: 1,
              user_keys: 1,
              content: { $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' } },
              letter_fields: 1,
              payroll_process: 1,
              letter_type: 1,
              letter_sub_type: 1,
              status: 1,
              pdfStyles: 1,
              previewStyles: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              pdf_url: 1,
              user_data: 1,
            },
          },
          { $sort: { date_created: -1 } },
        ],
      },
    };
    let aggregator = [
      {
        $match: {
          $expr: {
            $regexMatch: { input: { $concat: ['$first_name', ' ', '$last_name'] }, regex: str_search_tag, options: 'i' },
          },
        },
      },
      { $addFields: { string_id: { $toString: '$_id' } } },
      letterLookUp,
      { $project: { _id: 1, requestInfo: { $concatArrays: ['$letter_requests'] } } },
      { $unwind: '$requestInfo' },
      {
        $project: {
          _id: '$requestInfo._id',
          status: '$requestInfo.status',
          request_type: '$requestInfo.request_type',
          app_status: '$requestInfo.request_type',
          user_open_msg: '$requestInfo.app_status',
          admin_open_msg: '$requestInfo.user_open_msg',
          replies: '$requestInfo.replies',
          leave_fields: '$requestInfo.leave_fields',
          user_name: '$requestInfo.user_name',
          certificate: '$requestInfo.certificate',
          reason: '$requestInfo.reason',
          remaining_leaves: '$requestInfo.remaining_leaves',
          no_of_days: '$requestInfo.no_of_days',
          to_date: '$requestInfo.to_date',
          from_date: '$requestInfo.from_date',
          leave_condition: '$requestInfo.leave_condition',
          leave_type: '$requestInfo.leave_type',
          approvals: '$requestInfo.approvals',
          attachments: '$requestInfo.attachments',
          appliction_log: '$requestInfo.appliction_log',
          user_id: '$requestInfo.user_id',
          company_id: '$requestInfo.company_id',
          date_created: '$requestInfo.date_created',
          user_data: '$requestInfo.user_data',
          letter_keys: '$requestInfo.letter_keys',
          appliction_log: '$requestInfo.appliction_log',
          request_type: '$requestInfo.request_type',
          letterImages: '$requestInfo.letterImages',
          signatory: '$requestInfo.signatory',
          user_keys: '$requestInfo.user_keys',
          letter_fields: '$requestInfo.letter_fields',
          payroll_process: '$requestInfo.payroll_process',
          letter_type: '$requestInfo.letter_type',
          letter_sub_type: '$requestInfo.letter_sub_type',
          pdfStyles: '$requestInfo.pdfStyles',
          previewStyles: '$requestInfo.previewStyles',
          approvals: '$requestInfo.approvals',
          reason: '$requestInfo.reason',
          no_of_days: '$requestInfo.no_of_days',
          created_by_id: '$requestInfo.created_by_id',
          pdf_url: '$requestInfo.pdf_url',
          content: '$requestInfo.content',
        },
      },
      { $sort: { date_created: -1 } },
      { $facet: { results: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }] } },
    ];

    const requestsData = await UsersModel.aggregate(aggregator);
    const responseData = requestsData[0];

    if (responseData && responseData.results.length > 0) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: responseData });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: [] });
    }
  } catch (error) {
    console.log('#Error Log ', error);
    res.status(500).json({ success: false, message: 'An error occurred', data: [] });
  }
});

router.post('/get_all_attendance_and_claim_requests', async (req, res) => {
  try {
    const { skip, limit, history, requestType, userType, user_id, endDate, startDate, str_search_tag, req_user_id } =
      req.body;
    const activeUserIds = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
      _id: 1,
    });
    const arr_Active = activeUserIds.flatMap((a) => [a._id.toString(), a._id]);
    if (req_user_id !== '') {
      arr_Active.push(req_user_id, ObjectId(req_user_id));
    }
    const strFromDate = new Date(new Date(startDate || '2/1/2010').setHours(0, 0, 0, 0));
    const strToDate = new Date(new Date(endDate || new Date()).setHours(23, 59, 59, 0));

    const commonMatch = {
      date_created: { $gte: strFromDate, $lt: strToDate },
      user_id: { $in: arr_Active },
      request_type: requestType,
    };

    const userTypeMatch = {
      ADMIN: {
        false: { status: { $in: ['Processing', 'processing'] } },
        true: { status: { $nin: ['processing', 'Processing'] } },
      },
      MANAGER: {
        false: {
          status: { $in: ['Processing', 'processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
              ],
            },
          },
        },
        true: {
          status: { $nin: ['processing', 'Processing'] },
          approvals: {
            $elemMatch: {
              $or: [
                { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
              ],
            },
          },
        },
      },
      SELF: {
        false: {
          request_type: { $ne: 'attendance' },
          status: { $in: ['Processing', 'processing'] },
          user_id: ObjectId(user_id),
        },
        true: {
          request_type: { $ne: 'attendance' },
          user_id: ObjectId(user_id),
          status: { $nin: ['processing', 'Processing'] },
        },
      },
    };

    const userTypeConditions = userTypeMatch[userType][history.toString()];
    const match = { $match: { ...commonMatch, ...userTypeConditions } };

    let pipeline = [
      match,
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 1,
          status: 1,
          request_type: 1,
          app_status: '$request_type',
          user_open_msg: 1,
          admin_open_msg: '$user_open_msg',
          replies: 1,
          letter_type: 1,
          letter_sub_type: 1,
          letter_fields: 1,
          approvals: 1,
          user_id: 1,
          assigned_to: 1,
          company_id: 1,
          date_created: 1,
          pdfStyles: 1,
          previewStyles: 1,
          letterImages: 1,
          signatory: 1,
          letter_keys: 1,
          user_keys: 1,
          pdf_url: 1,
          appliction_log: 1,
          payroll_process: 1,
          user_data: {
            first_name: '$userDetails.first_name',
            _id: '$userDetails._id',
            last_name: '$userDetails.last_name',
            email: '$userDetails.email',
            image_url: '$userDetails.image_url',
            emp_id: '$userDetails.emp_id',
            date_of_joining: '$userDetails.date_of_joining',
            company_ID: '$userDetails.company_ID',
            designation: '$userDetails.personal.designation',
            department: '$userDetails.reporting.department',
            manager: '$userDetails.reporting.manager',
            gender: '$userDetails.personal.gender',
            marital_status: '$userDetails.personal.marital_status',
            department: '$userDetails.reporting.department',
          },
          user_name: {
            $concat: [
              '$userDetails.first_name',
              {
                $cond: {
                  if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                  then: '',
                  else: { $concat: [' ', '$userDetails.last_name'] },
                },
              },
            ],
          },
        },
      },
      { $sort: { date_created: -1 } },
      { $facet: { results: [{ $skip: parseInt(skip) }, { $limit: parseInt(limit) }] } },
    ];
    const requestsData = await RequestsModel.aggregate(pipeline);
    const responseData = requestsData[0];

    if (responseData && responseData.results.length > 0) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: responseData });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: [] });
    }
  } catch (error) {
    console.log('#Error Log ', error);
    res.status(500).json({ success: false, message: 'An error occured ', data: [] });
  }
});

router.post('/get_all_requests', async (req, res) => {
  let user_Active_Ids = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
    _id: 1,
  });
  let arr_Active = [];
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();

  let str_search_tag = req.body.str_search_tag;
  let skip = parseInt(req.body.skip);
  let limit = parseInt(req.body.limit);
  let requestType = req.body.requestType;
  let userType = req.body.userType;
  let req_user_id = req.body.req_user_id;
  let user_id = req.body.user_id;
  let history = req.body.history;
  let match = { $match: {} };

  // If no start date, set year ro 2010
  if (!req.body.startDate) {
    req.body.startDate = new Date('2/1/10');
  }

  // If no, end date, set to current date
  if (!req.body.endDate) {
    req.body.endDate = new Date();
  }

  let str_from_date = new Date(new Date(req.body.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(req.body.endDate).setHours(23, 59, 59, 0));

  if (req_user_id != '') {
    arr_Active = [req_user_id, ObjectId(req_user_id)];
  }

  try {
    if (userType == 'ADMIN') {
      if (history == false) {
        match = {
          $match: {
            date_created: {
              $gte: str_from_date,
              $lt: str_to_date,
            },
            status: { $in: ['Processing', 'processing', 'pending'] },
            user_id: { $in: arr_Active },
          },
        };
      } else {
        match = {
          $match: {
            date_created: {
              $gte: str_from_date,
              $lt: str_to_date,
            },
            status: { $nin: ['processing', 'Processing', 'pending', 'Draft', 'draft'] },
            user_id: { $in: arr_Active },
          },
        };
      }
    } else if (userType == 'MANAGER') {
      if (history == false) {
        match = {
          $match: {
            date_created: {
              $gte: str_from_date,
              $lt: str_to_date,
            },
            status: { $in: ['Processing', 'processing', 'pending'] },
            approvals: {
              $elemMatch: {
                $or: [
                  {
                    approver_id: user_id,
                    status: { $in: ['Processing', 'processing', 'pending'] },
                  },
                  {
                    approver_id: ObjectId(user_id),
                    status: { $in: ['Processing', 'processing', 'pending'] },
                  },
                ],
              },
            },
            user_id: { $in: arr_Active },
          },
        };
      } else {
        match = {
          $match: {
            date_created: {
              $gte: str_from_date,
              $lt: str_to_date,
            },
            status: { $nin: ['processing', 'Processing', 'pending', 'Draft', 'draft'] },
            approvals: {
              $elemMatch: {
                $or: [
                  { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                  { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
                ],
              },
            },
            user_id: { $in: arr_Active },
          },
        };
      }
    } else if (userType == 'SELF') {
      if (history == false) {
        match = {
          $match: {
            date_created: {
              $gte: str_from_date,
              $lt: str_to_date,
            },
            request_type: { $ne: 'attendance' },
            status: { $in: ['Processing', 'processing', 'Draft', 'draft'] },
            user_id_as_object: ObjectId(user_id),
          },
        };
      } else {
        match = {
          $match: {
            date_created: {
              $gte: str_from_date,
              $lt: str_to_date,
            },
            request_type: { $ne: 'attendance' },
            user_id_as_object: ObjectId(user_id),
            status: { $nin: ['processing', 'Processing', 'Draft', 'draft'] },
          },
        };
      }
    }
    // else{
    //     if(history == false){
    //         if (requestType == 'ALL') {
    //             match = { $match: {
    //                 status: { $in: ["Processing", "processing"] },
    //                 user_id: user_id
    //                 }
    //             }
    //         }
    //     }else{
    //         if (requestType == 'ALL'){
    //                 match = { $match: {
    //                     status:{$nin:['processing','Processing']} ,
    //                     user_id: user_id
    //                     }
    //                 }
    //             }
    //         }
    // }

    //   console.log(match,"-----match")

    let userLookup = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              company_ID: 1,
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };

    let leavesLookup = {
      $lookup: {
        from: 'leaves',
        localField: 'string_id',
        //   foreignField: "approvals.approver_id",
        foreignField: 'user_id',

        as: 'leaves_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              request_type: 'leaves',
              app_status: 1,
              user_open_msg: 1,
              admin_open_msg: 1,
              replies: 1,
              leave_fields: 1,
              user_name: 1,
              certificate: 1,
              reason: 1,
              remaining_leaves: 1,

              no_of_days: 1,
              to_date: 1,
              from_date: 1,
              leave_condition: 1,
              leave_type: 1,
              approvals: 1,
              attachments: 1,
              appliction_log: 1,

              status: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              user_data: 1,
            },
          },
          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let request_type_match = {
      $match: {},
    };
    if (requestType != 'ALL' && requestType != 'Leave' && requestType != 'wfh' && requestType != 'salary') {
      let req_type_arr = [requestType];
      if (requestType == 'passport') {
        req_type_arr.push('passport safekeep', 'passport release');
      }
      request_type_match = {
        $match: {
          request_type: { $in: req_type_arr },
        },
      };
    }

    let letterLookup = {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'user_id',
        as: 'letter_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          request_type_match,
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              letter_keys: 1,
              appliction_log: 1,
              request_type: 1,
              letterImages: 1,
              signatory: 1,
              user_keys: 1,
              content: {
                $cond: { if: { $eq: ['$status', 'completed'] }, then: '$contentafter', else: '$contentbefore' },
              },

              letter_fields: 1,
              claims: 1,
              payroll_process: 1,
              letter_type: 1,
              letter_sub_type: 1,
              status: 1,
              pdfStyles: 1,
              previewStyles: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              pdf_url: 1,
              user_data: 1,
            },
          },
          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let wfhLookup = {
      $lookup: {
        from: 'wfhs',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'wfh_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              request_type: 'wfh',
              from_date: 1,
              to_date: 1,
              status: 1,
              reason: 1,
              user_id: 1,
              company_id: 1,
              date_created: 1,
              no_of_days: 1,
              created_by_id: 1,
              attachments: 1,
              date_created: 1,
              user_data: 1,
              appliction_log: 1,
            },
          },

          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let salaryAdjustmentLookup = {
      $lookup: {
        from: 'salaryadjustments',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'salary_adjustment_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          userLookup,
          { $unwind: '$user_data' },
          {
            $project: {
              approvals: 1,
              salaryPercentageChanges: 1,
              logs: 1,
              user_id: 1,
              old_salary: 1,
              new_salary: 1,
              isPercentage: 1,
              isAmount: 1,
              isUpdated: 1,
              effective_date: 1,
              status: 1,
              company_id: 1,
              createdBy: 1,
              date_created: 1,
              pay_month: 1,
            },
          },

          {
            $sort: {
              date_created: -1,
            },
          },
        ],
      },
    };

    let aggregator = [
      {
        $match: {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ['$first_name', ' ', '$last_name'],
              },
              regex: str_search_tag,
              options: 'i',
            },
          },
        },
      },
      { $addFields: { string_id: { $toString: '$_id' } } },
      leavesLookup,
      letterLookup,
      wfhLookup,
      salaryAdjustmentLookup,
      {
        $project: {
          _id: 1,
          requestInfo: {
            $concatArrays: ['$leaves_requests', '$letter_requests', '$wfh_requests', '$salary_adjustment_requests'],
          },
        },
      },

      // Expand the requestInfo array into a stream of documents
      { $unwind: '$requestInfo' },

      {
        $project: {
          _id: '$requestInfo._id',
          status: '$requestInfo.status',
          request_type: '$requestInfo.request_type',
          app_status: '$requestInfo.request_type',
          user_open_msg: '$requestInfo.app_status',
          admin_open_msg: '$requestInfo.user_open_msg',
          replies: '$requestInfo.replies',
          leave_fields: '$requestInfo.leave_fields',
          user_name: '$requestInfo.user_name',
          certificate: '$requestInfo.certificate',
          reason: '$requestInfo.reason',
          remaining_leaves: '$requestInfo.remaining_leaves',
          no_of_days: '$requestInfo.no_of_days',
          to_date: '$requestInfo.to_date',
          from_date: '$requestInfo.from_date',
          leave_condition: '$requestInfo.leave_condition',
          leave_type: '$requestInfo.leave_type',
          approvals: '$requestInfo.approvals',
          attachments: '$requestInfo.attachments',
          appliction_log: '$requestInfo.appliction_log',
          user_id: '$requestInfo.user_id',
          company_id: '$requestInfo.company_id',
          date_created: '$requestInfo.date_created',
          user_data: '$requestInfo.user_data',
          letter_keys: '$requestInfo.letter_keys',
          appliction_log: '$requestInfo.appliction_log',
          request_type: '$requestInfo.request_type',
          letterImages: '$requestInfo.letterImages',
          signatory: '$requestInfo.signatory',
          user_keys: '$requestInfo.user_keys',
          letter_fields: '$requestInfo.letter_fields',
          claims: '$requestInfo.claims',
          payroll_process: '$requestInfo.payroll_process',
          letter_type: '$requestInfo.letter_type',
          letter_sub_type: '$requestInfo.letter_sub_type',
          pdfStyles: '$requestInfo.pdfStyles',
          previewStyles: '$requestInfo.previewStyles',
          approvals: '$requestInfo.approvals',
          reason: '$requestInfo.reason',
          no_of_days: '$requestInfo.no_of_days',
          created_by_id: '$requestInfo.created_by_id',
          pdf_url: '$requestInfo.pdf_url',
          salaryPercentageChanges: '$requestInfo.salaryPercentageChanges',
          logs: '$requestInfo.logs',
          old_salary: '$requestInfo.old_salary',
          new_salary: '$requestInfo.new_salary',
          isPercentage: '$requestInfo.isPercentage',
          isAmount: '$requestInfo.isAmount',
          isUpdated: '$requestInfo.isUpdated',
          effective_date: '$requestInfo.effective_date',
          createdBy: '$requestInfo.createdBy',
          pay_month: '$requestInfo.pay_month',
        },
      },

      { $sort: { date_created: -1 } },
      {
        $facet: {
          results: [{ $skip: skip }, { $limit: limit }],
        },
      },

      //{ $unwind: "$page_info" },
    ];

    if (requestType == 'Leave') {
      aggregator[6] = {
        $project: {
          _id: 1,
          requestInfo: {
            $concatArrays: ['$leaves_requests'],
          },
        },
      };
      aggregator.slice(3, 1);
      aggregator.slice(4, 1);
      aggregator.slice(5, 1);
    } else if (requestType == 'wfh') {
      aggregator[6] = {
        $project: {
          _id: 1,
          requestInfo: {
            $concatArrays: ['$wfh_requests'],
          },
        },
      };
      aggregator.slice(2, 1);
      aggregator.slice(3, 1);
      aggregator.slice(5, 1);
    } else if (requestType == 'salary') {
      aggregator[6] = {
        $project: {
          _id: 1,
          requestInfo: {
            $concatArrays: ['$salary_adjustment_requests'],
          },
        },
      };
      aggregator.slice(2, 1);
      aggregator.slice(3, 1);
      aggregator.slice(4, 1);
    } else if (requestType != 'ALL') {
      aggregator[6] = {
        $project: {
          _id: 1,
          requestInfo: {
            $concatArrays: ['$letter_requests'],
          },
        },
      };
      aggregator.slice(2, 1);
      aggregator.slice(4, 1);
      aggregator.slice(5, 1);
    }
    const requestsData = await UsersModel.aggregate(aggregator);
    // code for substitute approvers

    /*
        const today = new Date()
        //get all leave application that contains approval_substitute property
        const leavesRequests = await LeavesModel.aggregate([{ $match: {approval_substitute: { $exists: true, $ne:""  } } }])
        

        if(leavesRequests.length > 0){
            //loop over the leaves collection that contains approval_substitute property
            for (let index = 0; index < leavesRequests.length; index++) {
                const element = leavesRequests[index];
                const getRequesteeInfo = await UsersModel.find({ "_id": element.user_id })

                if(requestsData[0].results.length > 0){
                    //loop over the requests collection
                    for (let indexRequestsData = 0; indexRequestsData < requestsData[0].results.length; indexRequestsData++) {
                        const elementRequestsData = requestsData[0].results[indexRequestsData];
    
                        if(elementRequestsData.approvals.length > 0){
                            //loops the approval property to check if the approver_id match with the id who applied for leave
                            for (let approvalIndex = 0; approvalIndex < elementRequestsData.approvals.length; approvalIndex++) {
                                const elementApproval = elementRequestsData.approvals[approvalIndex];
                                //change the approver_id to the approver_substitute
                                if(elementApproval.approver_id == element.user_id && elementApproval.status == 'Processing' && element.status == 'Completed' && element.to_date > today && element.from_date < today){
                                    elementApproval.status = 'Auto reassigned'
                                    elementApproval.approved_date = new Date();
                                    elementApproval.reason = 'Auto reassigned due to ' + getRequesteeInfo[0].first_name + ' is on leave.'
                                    elementRequestsData.approvals.splice(approvalIndex + 1, 0, {
                                        "approver_id": element.approval_substitute,
                                        "status": "Processing",
                                        "approved_date": '',
                                        reason: ''
                                    });
                                    elementRequestsData.appliction_log.push({
                                        "approver_id": getRequesteeInfo[0]._id,
                                        "status": 'Reassigned by ' + getRequesteeInfo[0].first_name,
                                        "date_created": new Date(),
                                        reason: 'Auto reassigned due to ' + getRequesteeInfo[0].first_name + ' is on leave.',
                                        assigned_to: element.approval_substitute
                                    });
                                    //revert the approver_substitute to approver_id if the leave application was rejected
                                }else if(elementApproval.approver_id == element.approval_substitute && elementApproval.status == 'Processing' && element.status == 'Cancelled' && element.to_date < today){
                                    elementApproval.status = 'Reassigned'
                                    elementApproval.approved_date = new Date();
                                    elementApproval.reason = 'Reverted due to ' + getRequesteeInfo[0].first_name + ' leave was cancelled.'
                                    elementRequestsData.approvals.splice(approvalIndex + 1, 0, {
                                        "approver_id": element.user_id,
                                        "status": "Processing",
                                        "approved_date": '',
                                        reason: ''
                                    });
                                    elementRequestsData.appliction_log.push({
                                        "approver_id": element.approval_substitute,
                                        "status": 'Reverted',
                                        "date_created": new Date(),
                                        reason: 'Reverted due to ' + getRequesteeInfo[0].first_name + ' leave was cancelled.',
                                        assigned_to: element.user_id
                                    });
                                    //revert the approver_substitute to approver_id if the leave application was completed
                                }else if(elementApproval.approver_id == element.approval_substitute && elementApproval.status == 'Processing' && element.status == 'Completed' && element.to_date < today){
                                    elementApproval.status = 'Reassigned'
                                    elementApproval.approved_date = new Date();
                                    elementApproval.reason = 'Reverted due to ' + getRequesteeInfo[0].first_name + ' leave was completed.'
                                    elementRequestsData.approvals.splice(approvalIndex + 1, 0, {
                                        "approver_id": element.user_id,
                                        "status": "Processing",
                                        "approved_date": '',
                                        reason: ''
                                    });
                                    elementRequestsData.appliction_log.push({
                                        "approver_id": element.approval_substitute,
                                        "status": 'Reverted',
                                        "date_created": new Date(),
                                        reason: 'Reverted due to ' + getRequesteeInfo[0].first_name + ' leave was completed.',
                                        assigned_to: element.user_id
                                    });
                                }
                            }
                            let update_match = {
                                _id: ObjectId(elementRequestsData._id),
                              }
                        
                              let update_data = {
                                $set: elementRequestsData
                              }
                              //updates the requests if it has been changed or reverted
                            if(elementRequestsData.request_type == 'leaves'){
                                let update_leave = await LeavesModel.findOneAndUpdate(update_match, update_data, { new: true });
                            }
                            if(elementRequestsData.request_type == 'claims'){
                                let update_claim = await RequestsModel.findOneAndUpdate(update_match, update_data, { new: true });
                            }
                            if(elementRequestsData.request_type == 'wfh'){
                                let update_wfh = await WfhModel.findOneAndUpdate(update_match, update_data, { new: true });
                            }
                            if(elementRequestsData.request_type == 'attendance'){
                                let update_attendance = await RequestsModel.findOneAndUpdate(update_match, update_data, { new: true });
                            }
                            if(elementRequestsData.request_type == 'letters'){
                                let update_letters = await RequestsModel.findOneAndUpdate(update_match, update_data, { new: true });
                            }
                        }
                    }
                }
            }
        }
        */
    var result = requestsData[0];

    if (result.results && result.results.length > 0) {
      return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: result });
    } else {
      return res.status(200).json({ success: false, message: 'End of Request Data', data: {} });
    }
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

router.post('/get_requests_users_info', async (req, res) => {
  let user_Active_Ids = await UsersModel.find({ user_status: { $ne: 'inactive' } }).select({
    _id: 1,
  });
  let arr_Active = [];
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();

  let requestType = req.body.requestType;
  let userType = req.body.userType;

  let user_id = req.body.user_id;
  let history = req.body.history;
  let match = { $match: {} };

  let str_from_date = new Date(new Date(req.body.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(req.body.endDate).setHours(23, 59, 59, 0));

  try {
    if (userType == 'ADMIN') {
      if (history == false) {
        match = {
          $match: {
            status: { $in: ['Processing', 'processing', 'pending'] },
            user_id: { $in: arr_Active },
          },
        };
      } else {
        match = {
          $match: {
            status: { $nin: ['processing', 'Processing', 'pending'] },
            user_id: { $in: arr_Active },
          },
        };
      }
    } else if (userType == 'MANAGER') {
      if (history == false) {
        match = {
          $match: {
            status: { $in: ['Processing', 'processing', 'pending'] },
            approvals: {
              $elemMatch: {
                $or: [
                  { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
                  { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } },
                ],
              },
            },
            user_id: { $in: arr_Active },
          },
        };
      } else {
        match = {
          $match: {
            status: { $nin: ['processing', 'Processing', 'pending'] },
            approvals: {
              $elemMatch: {
                $or: [
                  { approver_id: user_id, status: { $nin: ['Processing', 'processing'] } },
                  { approver_id: ObjectId(user_id), status: { $nin: ['Processing', 'processing'] } },
                ],
              },
            },
            user_id: { $in: arr_Active },
          },
        };
      }
    } else if (userType == 'SELF') {
      if (history == false) {
        match = {
          $match: {
            request_type: { $ne: 'attendance' },
            user_id_as_object: ObjectId(user_id),
          },
        };
      } else {
        match = {
          $match: {
            request_type: { $ne: 'attendance' },
            user_id_as_object: ObjectId(user_id),
          },
        };
      }
    }

    let userLookup = {
      $lookup: {
        from: 'users',
        localField: 'user_id_as_object',
        foreignField: '_id',
        as: 'user_data',
        pipeline: [
          {
            $project: {
              first_name: 1,
              _id: 1,
              last_name: 1,
              email: 1,
              image_url: 1,
              emp_id: 1,
              date_of_joining: 1,
              designation: '$personal.designation',
              department: '$reporting.department',
              company_ID: 1,
              manager: '$reporting.manager',
              gender: '$personal.gender',
              marital_status: '$personal.marital_status',
              department: '$reporting.department',
            },
          },
        ],
      },
    };

    let leavesLookup = {
      $lookup: {
        from: 'leaves',
        localField: 'string_id',
        foreignField: 'user_id',

        as: 'leaves_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          {
            $match: {
              date_created: {
                $gte: str_from_date,
                $lt: str_to_date,
              },
            },
          },
          {
            $group: {
              _id: '$user_id',
              count: { $sum: 1 },
            },
          },
        ],
      },
    };

    let request_type_match = {
      $match: {},
    };
    if (requestType != 'ALL' && requestType != 'Leave' && requestType != 'wfh' && requestType != 'salary') {
      let req_type_arr = [requestType];
      if (requestType == 'passport') {
        req_type_arr.push('passport safekeep', 'passport release');
      }
      request_type_match = {
        $match: {
          request_type: { $in: req_type_arr },
        },
      };
    }

    let letterLookup = {
      $lookup: {
        from: 'requests',
        localField: '_id',
        foreignField: 'user_id',
        as: 'letter_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          request_type_match,
          match,
          {
            $match: {
              date_created: {
                $gte: str_from_date,
                $lt: str_to_date,
              },
            },
          },
          {
            $group: {
              _id: {
                userId: '$user_id',
                requestType: '$request_type',
              },
              count: { $sum: 1 },
            },
          },
        ],
      },
    };

    let wfhLookup = {
      $lookup: {
        from: 'wfhs',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'wfh_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          {
            $match: {
              date_created: {
                $gte: str_from_date,
                $lt: str_to_date,
              },
            },
          },
          {
            $group: {
              _id: '$user_id',
              count: { $sum: 1 },
            },
          },
        ],
      },
    };

    let salaryAdjustmentLookup = {
      $lookup: {
        from: 'salaryadjustments',
        localField: 'string_id',
        foreignField: 'user_id',
        as: 'salary_adjustment_requests',
        pipeline: [
          { $addFields: { user_id_as_object: { $toObjectId: '$user_id' } } },
          match,
          {
            $match: {
              date_created: {
                $gte: str_from_date,
                $lt: str_to_date,
              },
            },
          },
          {
            $group: {
              _id: '$user_id',
              count: { $sum: 1 },
            },
          },
        ],
      },
    };

    let aggregator = [
      { $addFields: { string_id: { $toString: '$_id' } } },
      leavesLookup,
      letterLookup,
      wfhLookup,
      salaryAdjustmentLookup,
      {
        $project: {
          user_name: '$first_name',
          wfh_requests: 1,
          letter_requests: 1,
          leaves_requests: 1,
          salary_adjustment_requests: 1,
        },
      },
      {
        $project: {
          user_name: 1,
          requests: {
            $sum: '$letter_requests.count',
          },
          leave: {
            $sum: '$leaves_requests.count',
          },
          wfh: {
            $sum: '$wfh_requests.count',
          },
          salary: {
            $sum: '$salary_adjustment_requests.count',
          },
        },
      },
      {
        $project: {
          user_name: 1,
          totalCount: {
            $add: ['$requests', '$leave', '$wfh', '$salary'],
          },
        },
      },
      {
        $match: {
          totalCount: { $ne: 0 },
        },
      },
    ];

    if (requestType == 'Leave') {
      aggregator[7] = {
        $project: {
          user_name: 1,
          totalCount: {
            $add: ['$leave'],
          },
        },
      };
    } else if (requestType == 'wfh') {
      aggregator[7] = {
        $project: {
          user_name: 1,
          totalCount: {
            $add: ['$wfh'],
          },
        },
      };
    } else if (requestType == 'salary') {
      aggregator[7] = {
        $project: {
          user_name: 1,
          totalCount: {
            $add: ['$salary'],
          },
        },
      };
    } else if (requestType != 'ALL') {
      aggregator[7] = {
        $project: {
          user_name: 1,
          totalCount: {
            $add: ['$requests'],
          },
        },
      };
    }

    const requestsData = await UsersModel.aggregate(aggregator);

    var result = requestsData;

    //   console.log(result.results.length,"---getUsers.data.results.length")
    // if (result.results && result.results.length > 0) {
    return res.status(200).json({ success: true, message: 'Successfully displaying Request', data: result });
    // } else {
    //     return res.status(200).json({ success: false, message: "End of Request Data", data: {} });
    // }
  } catch (error) {
    console.log('#log', error);
    res.json({ message: error.message });
  }
});

//get request count
router.post('/get_all_request/count', async (req, res) => {
  try {
    let userType = req.body.userType;
    let user_id = req.body.user_id;

    let match = { $match: {} };

    if (userType == 'ADMIN') {
      match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }] } };
    } else if (userType == 'MANAGER') {
      match = {
        $match: {
          $or: [{ status: 'processing' }, { status: 'Processing' }],
          approvals: { $elemMatch: { approver_id: user_id } },
        },
      };
    } else {
      match = { $match: { $or: [{ status: 'processing' }, { status: 'Processing' }], user_id: user_id } };
    }

    let project = {
      $project: {
        _id: 1,
        request_type: 1,
        approvals: 1,
      },
    };

    const requests = await RequestsModel.aggregate([match, { $count: 'count' }]);
    const leave = await LeavesModel.aggregate([match, { $count: 'count' }]);
    const wfh = await WfhModel.aggregate([match, { $count: 'count' }]);

    const reqLength = requests.length > 0 ? requests[0].count : 0;
    const leaveLength = leave.length > 0 ? leave[0].count : 0;
    const wfhLength = wfh.length > 0 ? wfh[0].count : 0;

    const count = reqLength + leaveLength + wfhLength;

    res.status(200).json(count);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get team requests processing only
// ui upgrade ends

router.get('/all', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find();
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

// all letter req
router.get('/letter-requests/all', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ request_type: 'letters' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

// all request per user
router.get('/users/:_id', validateToken, async (req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: ObjectId(req.params._id) });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

// all attendance req
router.get('/attendance-requests/all', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ request_type: 'attendance' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

// Status not completed and type not claims
router.get('/attendance/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, request_type: 'attendance' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/claims/user/:_id', validateToken, async (req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  const id = req.params._id;
  try {
    const requests = await RequestsModel.find({ user_id: ObjectId(req.params._id), request_type: 'claims' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/not-completed', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ status: 'processing' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/not-completed/letters', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ request_type: 'attendance', status: 'processing' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

// Status not completed and type is  claims
router.get('/not-completed/claims', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'Expense Claim', status: 'Processing' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/users/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  const ObjectId = require('mongoose').Types.ObjectId;
  try {
    const requests = await RequestsModel.find({ user_id: ObjectId(req.params._id), letter_type: { $ne: 'Expense Claim' } });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

//get letters only for users
router.get('/users/letters/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  const ObjectId = require('mongoose').Types.ObjectId;
  try {
    const requests = await RequestsModel.find({ user_id: ObjectId(req.params._id), request_type: 'letters' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

//get claims only for users
router.get('/users/claims/:_id', validateToken, async (req, res) => {
  const id = req.params._id;
  const ObjectId = require('mongoose').Types.ObjectId;
  try {
    const requests = await RequestsModel.find({ user_id: ObjectId(req.params._id), request_type: 'claims' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/noc', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'NOC' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/expense_claim', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ request_type: 'claims' }).populate(['user_id', 'assigned_to']);
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/noc/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, letter_type: 'NOC' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/noc/company/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ company_id: id, letter_type: 'NOC' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/salary-certificate', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'Salary Certificate' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/salary-certificate/company/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ company_id: id, letter_type: 'Salary Certificate' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/salary-certificate/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, letter_type: 'Salary Certificate' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/salary-transfer', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'Salary Transfer Letter' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/salary-transfer/company/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ company_id: id, letter_type: 'Salary Transfer Letter' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/salary-transfer/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, letter_type: 'Salary Transfer Letter' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/pay-slip', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'Pay Slip' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/pay-slip/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, letter_type: 'Pay Slip' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/payroll-report/count/:company_id/:pay_month', async (req, res) => {
  const id = req.params.company_id;
  const pay_month = req.params.pay_month;

  try {
    let match_request = { $match: { company_id: id, pay_month: pay_month, request_id: { $exists: true } } };
    let requestLookup = {
      $lookup: {
        from: 'requests',
        localField: 'objectids',
        foreignField: '_id',
        as: 'embeddeddata',
      },
    };
    let yearRequestPayitem = await PayrollModel.aggregate([
      match_request,
      { $addFields: { objectids: { $toObjectId: '$request_id' } } },
      requestLookup,
      {
        $unwind: '$embeddeddata',
      },
      {
        $project: {
          'embeddeddata.status': 1,
        },
      },
    ]);
    let yearRequest = {};
    for (let i_request = 0; i_request < yearRequestPayitem.length; i_request++) {
      const element = yearRequestPayitem[i_request];
      if (!yearRequest.hasOwnProperty(element.embeddeddata.status)) {
        yearRequest[element.embeddeddata.status] = 1;
      } else {
        yearRequest[element.embeddeddata.status] += 1;
      }
    }

    yearRequest.total = Object.values(yearRequest).reduce((accumulator, value) => {
      return accumulator + value;
    }, 0);
    res.status(200).json({ requests: yearRequest });
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/pay-slip/company/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ company_id: id, letter_type: 'Pay Slip' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/other-letter-requests', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'Other Letter Requests' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/other-letter-requests/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, letter_type: 'Other Letter Requests' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/other-letter-requests/company/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ company_id: id, letter_type: 'Other Letter Requests' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/custom-letter-requests', validateToken, async (req, res) => {
  try {
    const requests = await RequestsModel.find({ letter_type: 'Custom Letter Requests' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/custom-letter-requests/user/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ user_id: id, letter_type: 'Custom Letter Requests' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/custom-letter-requests/company/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ company_id: id, letter_type: 'Custom Letter Requests' });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.get('/find-request/:_id', validateToken, async (req, res) => {
  const id = req.params._id;

  try {
    const requests = await RequestsModel.find({ _id: id });
    res.status(200).json(requests);
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
});

router.put('/update-request/:_id', validateToken, async (req, res, next) => {
  const id = req.params._id;
  const filter = { _id: ObjectId(id) };

  try {
    const db_request = await RequestsModel.updateOne(filter, { $set: req.body });

    const requests = await RequestsModel.find({ _id: id });
    if (requests.length > 0 && requests[0].request_type === 'claims' && requests[0].status === 'Completed') {
      const user = await UsersModel.find({ _id: requests[0].user_id });
      let firstname = '';
      if (user.length > 0) {
        firstname = user[0].first_name;
      }
      let payitemObj = {
        pay_month: '',
        user_id: requests[0].user_id,
        first_name: firstname,
        earning_type: 'Earning',
        category: 'Other Allowances',
        remarks: requests[0].letter_sub_type,
        amount: requests[0].letter_fields.amount,
        approved_by_id: requests[0].approvals[0].approver_id,
        recursive_id: 'Non-Recursive',
        status: 'active',
        unpaid: 0,
        ot_type: '',
        hours: '',
      };
      const payrollprocess = await PayrollProcessModel.find({
        status: 'active',
        approved_by_finance: 'false',
        approved_by_hr: 'false',
      });

      if (payrollprocess.length > 0) {
        payitemObj['pay_month'] = payrollprocess[0].pay_month;
      } else {
        let now = new Date();
        let month = String(now.getMonth() + 1);
        month = month.padStart(2, '0');
        payitemObj['pay_month'] = now.getFullYear() + '-' + month;
      }

      const payroll = new PayrollModel({
        ...payitemObj,
      });
      const newProcess = await payroll.save();
    }
    res.status(200).send('Successfuly Updated');

    /**
        * SEND PUSH NOTIFICATION TO MOBILE APP START
        * What Below code Will Do
        * Send Notification to Mobile app
        * Add new Notification Details on Notification Collection
        * NOTE : Change Company Code in Notification Model.According to Company 
        * 
        * 
       "Letter Request Withdrawn Eway";
       "Letter Request Pending Approval Eway";
       "Letter Request Rejected Eway";
       "Letter Request - Rejected Eway";
       "Letter Request - Approved Eway";
       */

    // var obj = req.body[0];
    var obj = req.body;
    // const UserDetails = await UsersModel.find({ _id: req.body[0].user_id });
    const UserDetails = await UsersModel.find({ _id: req.body.user_id });

    var is_letter_request = false;
    var is_claim_true = false;

    if (obj.letter_type == 'Salary Transfer Letter' || obj.letter_type == 'Salary Certificate' || obj.letter_type == 'NOC') {
      is_letter_request = true;
    }

    if (obj.letter_type == 'Expense Claim') {
      is_claim_true = true;
    }

    if (is_letter_request == true) {
      if (req.body.status == 'Completed' || req.body.status == 'Approved') {
        await NotificationHelper.saveNotification(
          UserDetails[0]._id.toString(),
          UserDetails[0]._id.toString(),
          obj.letter_type + ' Approved',
          'Letter Request - Approved',
          'dashboards/myhr#letter'
        );
      }

      if (req.body.status == 'Rejected' || req.body.status == 'Cancelled') {
        await NotificationHelper.saveNotification(
          UserDetails[0]._id.toString(),
          UserDetails[0]._id.toString(),
          obj.letter_type + ' Rejected',
          'Letter Request Rejected',
          'dashboards/myhr#letter'
        );
      }

      if (req.body.status == 'Processing' || req.body.status == 'processing') {
        //IF LETTER REQUEST APPROVED SEND REQUEST TO FIRST OR NEXT APPROVER

        console.log('FIRST APPROVER TRIGGER');

        var next_approver = LeavesHelper.getApproverDetailsForNotification(obj);
        if (next_approver.length > 0) {
          await NotificationHelper.saveNotification(
            next_approver[0].approver_id.toString(),
            next_approver[0].approver_id.toString(),
            obj.letter_type + ' Request is Pending for Approval',
            'Letter Request Pending Approval',
            'dashboards/my-team#requests'
          );
        } else {
          console.log('next Approver not found');
        }
      }
    }

    if (req.body.status == 'Rejected' || req.body.status == 'Cancelled') {
      await NotificationHelper.saveNotification(
        UserDetails[0]._id.toString(),
        UserDetails[0]._id.toString(),
        obj.letter_type + ' Rejected',
        'Letter Request Rejected',
        'dashboards/myhr#letter'
      );
    }

    /**
         * CLAIM REQUEST STARTED
         * const NOTIFICATION_CLAIM_PENDING_EWAY = "Claim Request Pending Approval Eway";
         const NOTIFICATION_CLAIM_REJECTED_EWAY = "Claim Request - Rejected Eway";
        const NOTIFICATION_CLAIM_REQUEST_WITHDRAWN_EWAY = "Claim Request Withdrawn Eway";
        */

    if (is_claim_true) {
      if (req.body.status == 'Cancelled' || req.body.status == 'Rejected') {
        await NotificationHelper.saveNotification(
          UserDetails[0]._id.toString(),
          UserDetails[0]._id.toString(),
          obj.letter_type + ' Rejected',
          'Claim Request - Rejected Eway',
          'dashboards/myhr#letter'
        );
      }

      if (req.body.status == 'Completed') {
        await NotificationHelper.saveNotification(
          UserDetails[0]._id.toString(),
          UserDetails[0]._id.toString(),
          obj.letter_type + ' Approved',
          'Claim Request Pending Approval Eway',
          'dashboards/myhr#letter'
        );
      }

      if (req.body.status == 'Processing' || req.body.status == 'processing') {
        //IF LETTER REQUEST APPROVED SEND REQUEST TO FIRST OR NEXT APPROVER

        console.log('FIRST APPROVER TRIGGER');

        var next_approver = LeavesHelper.getApproverDetailsForNotification(obj);
        if (next_approver.length > 0) {
          await NotificationHelper.saveNotification(
            next_approver[0].approver_id.toString(),
            next_approver[0].approver_id.toString(),
            obj.letter_type + ' Request is Pending for Approval',
            'Claim Request Pending Approval',
            'dashboards/my-team#requests'
          );
        }
      }
    }

    /**
     * CLAIM REQUEST END
     */
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
  next();
});

router.post('/new-m', async (req, res) => {
  let lettersInfo = req.body;
  let created_user = req.body.created_user ? req.body.created_user : lettersInfo.user_id;
  var letterType = lettersInfo.letter_type;

  lettersInfo.letter_fields = lettersInfo.letter_fields || {};

  //console.log(lettersInfo.user_id);
  var user_id = lettersInfo.user_id;
  var UserDetails;
  var ClaimsRequestFinal;

  var approverArray = [];

  try {
    // let USer=Users.find({_id:lettersInfo.user_id});

    UserDetails = await UsersModel.find({ _id: user_id });

    if (UserDetails.length == 0) {
      res.status(406).json({ status: 'error', message: 'Something Went Wrong !' });
    } else {
      if (UserDetails[0].reporting.letters_approvals.length == 0) {
        res.status(406).json({ status: 'error', message: 'Something Went Wrong !' });
      }

      let tot_approver;
      let obj;
      let approver_id;

      //CUSTOME CODE FOR AMAP APPROVER FLOW

      tot_approver = UserDetails[0].reporting.letters_approvals.approver_levels;

      obj = UserDetails[0].reporting.letters_approvals;

      approver_id = UserDetails[0].reporting.manager;

      //GENERATE APPRUVARS ARRY

      for (var i = 1; i <= tot_approver; i++) {
        var foo = 'level_' + i;
        /*approverArray.push(obj[foo]);*/

        if (i == 1) {
          if (obj[foo]) {
            var temp = {
              approver_id: obj[foo],
              status: 'Processing',
              approved_date: '',
            };
          }
        } else {
          if (obj[foo]) {
            var temp = {
              approver_id: obj[foo],
              status: 'Pending',
              approved_date: '',
            };
          }
        }

        approverArray.push(temp);
      }

      //BUILDING LETTER FIELDS OBJECT

      /* let leterObject = {
                 "date": CurrentDate,
                 "amount": lettersInfo.letter_fields.amount,
                 "description": lettersInfo.letter_fields.description,
                 "files": [
                     {}
                 ],
                 "name": UserDetails[0].first_name + " " + UserDetails[0].last_name
             };*/

      let objLetterInfo = lettersInfo.letter_fields || {};
      //objLetterInfo.total_fixed = UserDetails[0].salary.total_fixed;

      lettersInfo.letter_fields || {};

      //GENERATE FOREIGN KEY FOR MOBILE APP

      //GENERATE  FOREIGN  KEY
      var hash = (+new Date()).toString(36);
      let random_key = (Math.random() + 1).toString(36).substring(7);
      const random_id = () => parseInt(Date.now() * Math.random());

      console.log('******************************');

      lettersInfo.foreign_key = hash + random_key + random_id();

      //GET EXTRA REQUIRED FIELDS START

      var configData = await configurationModel.find({}).select('letterRequest').lean();

      var FinalPayload = LettersHelper.getLetterRequestDetails(letterType, lettersInfo.letter_sub_type, configData);

      /* var FinalPayload = await LettersHelper.getLetterRequestConfigurationData(
         lettersInfo.request_type,
         lettersInfo.letter_sub_type
       );*/

      var PdfStyleData = await LettersHelper.getPdfStylesData(
        FinalPayload,
        lettersInfo.request_type,
        lettersInfo.letter_sub_type
      );
      var PreviewStyleData = await LettersHelper.getPreviewStylesData(
        FinalPayload,
        lettersInfo.request_type,
        lettersInfo.letter_sub_type
      );
      var LetterImageData = await LettersHelper.getLetterImagesData(lettersInfo.company_id);
      var LetterSignatoryData = await LettersHelper.getLetterSignatoryData(lettersInfo.company_id);
      var LetterTemplateData = await LettersHelper.getLetterTemplateData(FinalPayload);

      var LetterAditionalfieldData = await LettersHelper.getLetterAdditionalFieldData(lettersInfo);

      var LetterkeyUpdatewithValue = await LettersHelper.updateLetterDataWithLetterKeys(lettersInfo, FinalPayload);

      lettersInfo.letter_fields['date'] = moment(new Date()).format('YYYY-MM-DD');
      const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      lettersInfo.letter_fields['day'] = weekday[new Date().getDay()];
      lettersInfo.letter_fields['addressee'] = LetterTemplateData.addressee;
      lettersInfo.letter_fields['subject'] = LetterTemplateData.subject;
      lettersInfo.letter_fields['body'] = LetterTemplateData.body;

      // Custom Letter Type Data Fields
      if (FinalPayload.letterDescription.requestType === 'Custom Letter Requests') {
        lettersInfo.letter_fields['date'] = moment(new Date()).format('YYYY-MM-DD');
        lettersInfo.letter_fields['addressee'] = lettersInfo.letter_keys.other_requests_to_address_1;
        lettersInfo.letter_fields['subject'] = lettersInfo.letter_keys.other_requests_subject;
        lettersInfo.letter_fields['body'] = lettersInfo.letter_keys.other_requests_body_1;
        lettersInfo.letter_fields['other_requests_to_address_1'] = lettersInfo.letter_keys.other_requests_to_address_1;
        lettersInfo.letter_fields['other_requests_subject'] = lettersInfo.letter_keys.other_requests_subject;
        lettersInfo.letter_fields['other_requests_body_1'] = lettersInfo.letter_keys.other_requests_body_1;
      }

      lettersInfo.letter_fields['name'] = LetterAditionalfieldData.user_name;
      lettersInfo.letter_fields['emp_id'] = LetterAditionalfieldData.emp_id;
      lettersInfo.letter_fields['passport_number'] = LetterAditionalfieldData.passport;
      lettersInfo.letter_fields['role'] = LetterAditionalfieldData.role;
      lettersInfo.letter_fields['total_fixed'] = LetterAditionalfieldData.total_fixed;
      lettersInfo.letter_fields['basic_salary'] = LetterAditionalfieldData.basic_salary;
      lettersInfo.letter_fields['work_start_date'] = LetterAditionalfieldData.work_start_date;
      lettersInfo.letter_fields['total_fixed_word'] = LetterAditionalfieldData.total_fixed_word;
      lettersInfo.letter_fields['basic_salary_word'] = LetterAditionalfieldData.basic_salary_word;
      lettersInfo.letter_fields['nationality'] = LetterAditionalfieldData.nationality;
      lettersInfo.letter_fields['passport'] = LetterAditionalfieldData.passport;
      lettersInfo.letter_fields['passportNumber'] = LetterAditionalfieldData.passport;
      lettersInfo.letter_fields['passportIssueDate'] = LetterAditionalfieldData.passportissue;
      lettersInfo.letter_fields['passportExpiryDate'] = LetterAditionalfieldData.passportexpiry;
      lettersInfo.letter_fields['bank'] = LetterAditionalfieldData.bank;
      lettersInfo.letter_fields['iban'] = LetterAditionalfieldData.iban;
      lettersInfo.letter_fields['bankAccountNumber'] = LetterAditionalfieldData.account_number;
      lettersInfo.letter_fields['gender'] = LetterAditionalfieldData.gender;
      lettersInfo.letter_fields['department'] = LetterAditionalfieldData.department;
      lettersInfo.letter_fields['marital_status'] = LetterAditionalfieldData.marital_status;
      lettersInfo.letter_fields['title'] = LetterAditionalfieldData.title;
      lettersInfo.letter_fields['hard_copy'] = lettersInfo.hard_copy;
      lettersInfo.letter_fields['companyName'] = LetterAditionalfieldData.company.company_name;
      lettersInfo.letter_fields['dob'] = LetterAditionalfieldData.dob;
      lettersInfo.letter_fields['accommodation_allowance'] = LetterAditionalfieldData.accommodation_allowance;
      lettersInfo.letter_fields['medical_allowance'] = LetterAditionalfieldData.medical_allowance;
      lettersInfo.letter_fields['transport_allowance'] = LetterAditionalfieldData.transport_allowance;
      lettersInfo.letter_fields['other_allowance'] = LetterAditionalfieldData.other_allowance;
      lettersInfo.letter_fields['managername'] = LetterAditionalfieldData.managername;
      lettersInfo.letter_fields['manageremail'] = LetterAditionalfieldData.manageremail;
      lettersInfo.letter_fields['managerphone'] = LetterAditionalfieldData.managerphone;
      lettersInfo.letter_fields['managerheshe'] = LetterAditionalfieldData.managerheshe;

      //obj[keyname] = "c"; // dynamic - 'key3' can be a variable

      //GET EXTRA REQUIRED FIELDS END

      //ADD APPLICATION LOGS START

      var application_log = await LogsHelper.getRequestsApplicationLog(user_id, 'Created');
      //END APPLICATION LOGS START

      ClaimsRequestFinal = {
        appliction_log: application_log, //add application logs
        file: lettersInfo.file,
        contentafter: FinalPayload.content,
        contentbefore: FinalPayload.contentbefore,
        approvals: approverArray,
        request_type: lettersInfo.request_type,
        letter_type: lettersInfo.letter_type,
        letter_sub_type: lettersInfo.letter_sub_type,
        status: 'Processing',
        pdfStyles: PdfStyleData,
        previewStyles: PreviewStyleData,
        letterImages: LetterImageData,
        letter_fields: lettersInfo.letter_fields,
        signatory: LetterSignatoryData,
        addressee: LetterTemplateData.addressee,
        subject: LetterTemplateData.subject,
        body: LetterTemplateData.body,
        user_keys: true,
        letter_keys: LetterkeyUpdatewithValue,
        //letter_fields: objLetterInfo,
        admin_open_msg: 'closed',
        user_open_msg: 'closed',
        user_id: ObjectId(user_id),
        foreign_key: lettersInfo.foreign_key,
        assigned_to: UserDetails[0].reporting.letters_approvals.level_1,
        company_id: UserDetails[0].company_id,
      };

      if (approverArray[0].approver_id.toString() == created_user.toString()) {
        (approverArray[0].status = 'Approved'),
          (approverArray[0].approved_date = new Date()),
          (approverArray[0].reason = 'Auto Approved');

        ClaimsRequestFinal.appliction_log.push({
          approver_id: approverArray[0].approver_id,
          date_created: new Date(),
          status: 'Approved',
          reason: 'Auto Approved',
        });

        if (approverArray[1]) {
          await NotificationHelper.saveNotification(
            ClaimsRequestFinal.approvals[1].approver_id,
            ClaimsRequestFinal.approvals[1].approver_id,
            'New ' +
              ClaimsRequestFinal.letter_type +
              ' Request for ' +
              UserDetails[0].first_name +
              '  ' +
              UserDetails[0].last_name,
            'Letter Request Pending Approval',
            '/dashboards/my-team#requests'
          );
          approverArray[1].status = 'Processing';
        } else {
          ClaimsRequestFinal.status = 'completed';
        }
      } else {
        await NotificationHelper.saveNotification(
          ClaimsRequestFinal.approvals[0].approver_id,
          ClaimsRequestFinal.approvals[0].approver_id,
          'New ' +
            ClaimsRequestFinal.letter_type +
            ' Request for ' +
            UserDetails[0].first_name +
            '  ' +
            UserDetails[0].last_name,
          'Letter Request Pending Approval',
          '/dashboards/my-team#requests'
        );
      }

      //  //ADD DYNAMIC LATTER FIELDS START
      //  LettersPreviewGeneratorHelper.AddDynamicFieldsInLetterFields(ClaimsRequestFinal,LetterkeyUpdatewithValue);
      //  //ADD DYNAMIC LETTER FIELDS END

      const request = new RequestsModel({ ...ClaimsRequestFinal });
      await request.save();

      if (ClaimsRequestFinal.approvals.length) {
        var list_of_approver = [];

        const lettersEmail = new LetterEmail();

        list_of_approver.push(String(ClaimsRequestFinal.user_id));

        ClaimsRequestFinal.approvals.forEach((ele) => {
          list_of_approver.push(ele.approver_id);
        });

        const usersObjects = await UsersModel.find({
          _id: { $in: list_of_approver },
        });
        const companyObject = await CompaniesModel.findOne({
          _id: UserDetails[0].company_id,
        }).lean();
        const managerObject = await UsersModel.findOne({
          _id: ClaimsRequestFinal.approvals[0].approver_id,
        });

        var emailForUser = lettersEmail.funNewLetterRequest(ClaimsRequestFinal, companyObject, UserDetails[0], usersObjects);
        var pendingEmailManager = lettersEmail.funLetterRequestApprovalManager(
          ClaimsRequestFinal,
          companyObject,
          UserDetails[0],
          managerObject
        );

        // This will send notification to remaining approvers
        // for(let i = 1; i < ClaimsRequestFinal.approvals.length; i++ ){
        //   await NotificationHelper.saveNotification(
        //     ClaimsRequestFinal.approvals[i].approver_id,
        //     ClaimsRequestFinal.approvals[i].approver_id,
        //     "New " +
        //       ClaimsRequestFinal.letter_type +
        //       " Request for " +
        //       UserDetails[0].first_name +
        //       "  " +
        //       UserDetails[0].last_name,
        //     "Letter Request Pending Approval",
        //     "/dashboards/my-team#requests"
        //   );
        // }

        //This is will send notification to the employee when manager creates request on behalf of him

        // await NotificationHelper.saveNotification(
        //   lettersInfo.user_id,
        //   lettersInfo.user_id,
        //   "New " +
        //     lettersInfo.letter_type +
        //     " Request for " +
        //     UserDetails[0].first_name +
        //     "  " +
        //     UserDetails[0].last_name,
        //   "New Letter Request By Manager",
        //   "/dashboards/myhr#letter",
        // );
        let req_id = request._id.toString();
        let req_type = 'requests';
        let combinedReqIdAndType = req_id + '/' + req_type;
        if (req.headers.host == 'localhost:4001') {
          pendingEmailManager.body = pendingEmailManager.body.replace(
            'https://hrdirect-staging.devnhr.com',
            'http://localhost:5102'
          );
          pendingEmailManager.body = pendingEmailManager.body.replace(
            'https://hrdirect.devnhr.com',
            'http://localhost:5102'
          );
        }
        pendingEmailManager.body = pendingEmailManager.body.replace(
          'dashboards/my-team#requests',
          'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
        );

        emailHelper.sendEmail([managerObject.email], pendingEmailManager.subject, pendingEmailManager.body);

        emailHelper.sendEmail([UserDetails[0].email], emailForUser.subject, emailForUser.body);
      }

      res.status(200).json({ status: 'ok', message: 'Sucessfully Added' });
    }
  } catch (error) {
    console.log(error, '#log new-m');
    res.status(500).send(error);
  }
});

router.put('/update-letters/:_id', validateToken, async (req, res, next) => {
  const id = req.params._id;
  const filter = { _id: ObjectId(id) };

  let obj = req.body.length > 0 ? req.body[0] : req.body;

  try {
    const user = await RequestsModel.updateOne(filter, { $set: obj });
    res.status(200).send('Successfuly Updated');
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

/*Withdraw Letter Request */
router.post('/withdraw_letter', async (req, res) => {
  try {
    const body = req.body;

    let applicant = await UsersModel.findOne({ _id: ObjectId(body.user_id) });

    if (applicant) {
      let logs = {
        approver_id: applicant._id,
        date_created: new Date(),
        status: 'Letter Request Withdrawn by Employee.',
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
        _id: ObjectId(body.letter_id),
      };

      let update_leave = await RequestsModel.findOneAndUpdate(update_match, update_data, { new: true });

      await NotificationHelper.saveNotification(
        body.user_id,
        body.user_id,
        // "New " + body.letter_type + " Request for " + applicant.first_name + "  " + applicant.last_name,
        'Your ' + body.letter_type + ' Request is Withdrawn. Please check your HR Self service for more details.',
        'Letter Request Withdrawn',
        '/dashboards/myhr#letter'
      );

      res.status(200).json({ success: true, message: 'Success', data: update_leave });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

/** Upload files in AWS */
router.post('/upload-file', validateToken, async (req, res) => {
  try {
    const s3 = new AWS.S3({
      // accessKeyId: ID,
      // secretAccessKey: SECRET,
    });
    const fileContent = fs.readFileSync(req.files.a.tempFilePath);

    const params = {
      Bucket: BUCKET_NAME + '/' + req.body.folder,
      Key: req.body.b,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: req.files.a.mimetype,
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      } else {
        // console.log(res)
        res.json({ name: params.Key, url: data.Location });
      }
      console.log(`File uploaded successfully. ${data.Location}`);
    });
  } catch (error) {
    console.log('#log', error);
    res.status(400).json({ message: error.message });
  }
});

// router.use('', RequestsMobileApi);

module.exports = router;
