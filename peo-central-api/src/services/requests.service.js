const { ObjectId } = require('mongodb');
const { Requests, Attendance, Users, Payitems, PayrollProcess, PayrollConfig, Configuration, CoreConfig } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { _, cloneDeep } = require('lodash');
const NotificationHelper = require('../helpers/notification_helper');
const LeavesHelper = require('../helpers/leaves_helper');
const moment = require('moment')

const getRequestsCount = async (userType, user_id, company_id, date) => {
  const str_from_date = new Date(new Date(date).setUTCHours(0, 0, 0, 0));
  const str_to_date = new Date(new Date(date).setUTCHours(23, 59, 59, 0));
  let match = {};
  let requests_match = {};
  if (userType == 'ADMIN') {
    match = {
      $match: {
        status: { $in: ['Completed', 'completed'] },
        $or: [
          { from_date: { $lte: str_from_date }, to_date: { $gte: str_from_date } },
          { from_date: { $lte: str_to_date }, to_date: { $gte: str_to_date } },
          { from_date: { $gte: str_from_date }, to_date: { $lte: str_to_date } },
        ],
      },
    };
    requests_match = {
      $match: {
        status: { $in: ['Processing', 'processing', 'Pending', 'pending'] },
      },
    };
  } else if (userType == 'MANAGER') {
    match = {
      $match: {
        status: { $in: ['Completed', 'completed'] },
        // approvals: {
        //     $elemMatch: { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
        // },
        $or: [
          {
            'approvals.approver_id': { $in: [user_id] },
            'approvals.status': { $in: ['Processing', 'processing', 'pending'] },
          },
          {
            'approvals.approver_id': { $in: [ObjectId(user_id)] },
            'approvals.status': { $in: ['Processing', 'processing', 'pending'] },
          },
        ],
        $or: [
          { from_date: { $lte: str_from_date }, to_date: { $gte: str_from_date } },
          { from_date: { $lte: str_to_date }, to_date: { $gte: str_to_date } },
          { from_date: { $gte: str_from_date }, to_date: { $lte: str_to_date } },
        ],
      },
    };
    requests_match = {
      $match: {
        status: { $in: ['Processing', 'processing', 'pending'] },
        // approvals: {
        //     $elemMatch: { approver_id: user_id, status: { $in: ['Processing', 'processing'] } },
        // },
        $or: [
          {
            'approvals.approver_id': { $in: [user_id] },
            'approvals.status': { $in: ['Processing', 'processing', 'pending'] },
          },
          {
            'approvals.approver_id': { $in: [ObjectId(user_id)] },
            'approvals.status': { $in: ['Processing', 'processing', 'pending'] },
          },
        ],
      },
    };
  }
  if (company_id) {
    match.$match.company_id = company_id;
  }
  let requests_count = [requests_match, { $count: 'count' }];
  match.$match.request_type = 'leave';
  let total_leave_count = [match, { $count: 'count' }];
  let wfh_count_match = cloneDeep(match);
  wfh_count_match.$match.request_type = 'wfh';
  let total_wfh_count = [wfh_count_match, { $count: 'count' }];
  let facet_requests = {
    $facet: {
      requests_count,
      total_leave_count,
      total_wfh_count,
    },
  };
  /* All requests count on selected */
  let requestCount = await Requests.aggregate([facet_requests]);
  let att_date = new Date(str_from_date.setUTCHours(0, 0, 0, 0));
  let absent_employees = [
    {
      $match: {
        date: att_date,
        startTime: null,
        remarks: { $nin: ['Weekend', 'On Leave'] },
      },
    },
    { $count: 'absentEmployees' },
  ];
  let after_9 = new Date(str_from_date.setHours(9, 0, 0, 0));
  let late_employees = [
    {
      $match: {
        date: att_date,
        startTime: { $gte: after_9 },
        remarks: { $nin: ['Weekend', 'On Leave'] },
      },
    },
    { $count: 'lateEmployees' },
  ];
  let attendance_facet = {
    $facet: {
      absent_employees,
      late_employees,
    },
  };
  /* Absent and Late employees count */
  let absent_late_count = await Attendance.aggregate([attendance_facet]);
  return { requestCount, absent_late_count };
};

const upcomingRequests = async (leave_type) => {
  let pipeline = [
    {
      $match: {
        request_type: 'leave',
        status: 'completed',
        // from_date:{$gte: new Date("2022-01-01")}
        from_date: { $gte: new Date() },
      },
    },
    {
      $project: {
        user_name: 1,
        leave_type: 1,
        no_of_days: 1,
        from_date: 1,
        to_date: 1,
      },
    },
  ];
  if (leave_type != 'All') {
    pipeline[0].$match.leave_type = leave_type;
  }
  let requests = await Requests.aggregate(pipeline);
  if (!requests) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to find requests');
  }
  return requests;
};

const getRequestById = async function (reqId, projection = {}) {
  //VULN - No validation on reqId or check if the user has access to the request
  return await Requests.findOne({ _id: new ObjectId(reqId) }, projection).lean();
};

const getRequestUsersInfo = async function (reqBody) {
  let userType = reqBody.userType;
  let user_id = reqBody.user_id;
  let user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding'] } }).select({ _id: 1, reporting: 1 });
  let arr_Active = [];
  if(userType == "MANAGER") {
    user_Active_Ids = user_Active_Ids.filter((user) => user.reporting.manager == user_id || user._id.toString() == user_id);
  }
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();
  let requestType = reqBody.requestType;
  let history = reqBody.history;
  let match = { $match: {} };
  let filter = { $match: {} };
  let companyFilter = reqBody.company?.toLowerCase() !== "all" ? { $match: { company_ID: String(reqBody.company)}} : { $match: {}}
  let str_from_date = new Date(new Date(reqBody.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(reqBody.endDate).setHours(23, 59, 59, 0));

  let customDateRangeFilter = [
    { $and: [{ from_date: { $gte: str_from_date } }, { from_date: { $lte: str_to_date } }]},
    { $and: [{ to_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]},
    { $and: [{ from_date: { $lte: str_from_date } }, { to_date: { $gte: str_to_date } }]},
    { $and: [{ from_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]}
  ]

  if (userType == 'ADMIN') {
    if (history == false) {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          status: { $in: ['Processing', 'processing', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          status: { $nin: ['processing', 'Processing', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'MANAGER') {
    if (history == false) {
      match = {
        $match: {
          $and: [
            {
              $or: [
                { request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }},
                { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }
              ],
            },
            {
              $or: [
                { approvals: {
                  $elemMatch: {
                    approver_id: { $in: [user_id, ObjectId(user_id)]},
                    status: { $in: ["Processing", "processing", "Pending", "pending"] }
                  }
                }},
                {'claims.approvals.approver_id': {
                  $in: [user_id, new ObjectId(user_id)] },
                  'claims.approvals.status': { $in: ['Processing', 'processing', 'Pending', 'pending']
                }}
              ],
            }
          ],
          status: { $in: ['Processing', 'processing', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          $and: [
            {
              $or: [
                { request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }},
                { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }
              ],
            },
            {
              $or: [
                {
                  'approvals.approver_id': { $in: [user_id] },
                  'approvals.status': { $nin: ['Processing', 'processing', 'pending'] },
                },
                {
                  'approvals.approver_id': { $in: [ObjectId(user_id)] },
                  'approvals.status': { $nin: ['Processing', 'processing', 'pending'] },
                },
                {
                  'claims.approvals.approver_id': { $nin: [user_id, new ObjectId(user_id)] },
                  'claims.approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] }
                },
              ],
            }
          ],
          status: { $nin: ['processing', 'Processing', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'SELF') {
    if (history == false) {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          request_type: { $ne: 'attendance' },
          user_id: ObjectId(user_id),
        },
      };
    } else {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          request_type: { $ne: 'attendance' },
          user_id: ObjectId(user_id),
        },
      };
    }
  }
  let userLookup = {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user_data',
      pipeline: [
        companyFilter,
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
  if (requestType !== 'ALL') {
    filter = { $match: { request_type: requestType } };
  }
  let unwindUser = { $unwind: '$user_data' };
  let aggregator = [
    { $addFields: { string_id: { $toString: '$_id' } } },
    match,
    userLookup,
    filter,
    unwindUser,
    {
      $project: {
        username: '$user_data.first_name',
        user_id: 1,
        date_created: 1,
      },
    },
    {
      $project: {
        username: 1,
        user_id: 1,
        date_created: 1,
      },
    },
    {
      $match: {
        totalCount: { $ne: 0 },
      },
    },
    {
      $group: {
        _id: '$user_id',
        username: { $first: '$username' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        username: 1,
        'totalCount': '$count',
      },
    },
  ];
  const requestsData = await Requests.aggregate(aggregator);
  return requestsData;
};

const getAllRequestone = async function (reqBody) {
  let company = reqBody.company;
  let str_search_tag = reqBody.str_search_tag;
  let skip = parseInt(reqBody.skip);
  let limit = parseInt(reqBody.limit);
  let requestType = reqBody.requestType;
  let userType = reqBody.userType;
  let req_user_id = reqBody.req_user_id;
  let user_id = reqBody.user_id;
  let history = reqBody.history;
  let match = { $match: {} };
  let filter = { $match: {} };
  let user_Active_Ids = [];
  const searchRegex = new RegExp(str_search_tag, 'i');
  const allUsers = await Users.find({ user_status: { $in: ['active', 'Onboarding']}}, { _id: 1, reporting: 1 });

  if (company == 'All') user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding']}}, { _id: 1, reporting: 1 });
  else user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding']}/*, company_ID: company*/ }, { _id: 1, reporting: 1 });
  if(userType == "MANAGER") user_Active_Ids = user_Active_Ids.filter((user) => {
    return user.reporting.manager == user_id || user._id.toString() == user_id; //FIXME - Add user that are approvals included here (Recursive)
  });
  let arr_Active = user_Active_Ids.reduce((acc, item) => [...acc, item._id, item._id.toString(), ObjectId(item._id)], []);
  if (!reqBody.startDate) reqBody.startDate = new Date('2/1/10'); // If no start date, set year ro 2010
  if (!reqBody.endDate) reqBody.endDate = new Date('2050-12-01'); // If no, end date, set to current date
  let str_from_date = new Date(new Date(reqBody.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(reqBody.endDate).setHours(23, 59, 59, 0));

  let customDateRangeFilter = [
    { $and: [{ from_date: { $gte: str_from_date } }, { from_date: { $lte: str_to_date } }]},
    { $and: [{ to_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]},
    { $and: [{ from_date: { $lte: str_from_date } }, { to_date: { $gte: str_to_date } }]},
    { $and: [{ from_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]}
  ]

  if (userType == 'ADMIN') {
    if (history == false) {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          status: { $in: ['Processing', 'processing', 'Pending', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          status: { $nin: ['processing', 'Processing', 'Pending', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'MANAGER') {
    if (history == false) {
      match = {
        $match: {
          $and: [
            { $or: [
              { request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }},
              { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }
            ]},
            { $or: [
              { approvals: { $elemMatch: { approver_id: { $in: [user_id, ObjectId(user_id)]}, status: { $in: ["Processing", "processing", "Pending", "pending"]}}}},
              { 'claims.approvals.approver_id': { $in: [user_id, new ObjectId(user_id)] }, 'claims.approvals.status': { $in: ['Processing', 'processing', 'Pending', 'pending']}},
            ]}
          ],
          status: { $in: ['Processing', 'processing', 'Pending', 'pending'] },
          //user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          $and: [
            { $or: [
              { request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }},
              { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }
            ]},
            { $or: [
              { 'approvals.approver_id': { $in: [user_id] }, 'approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] }},
              { 'approvals.approver_id': { $in: [ObjectId(user_id)] }, 'approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] }},
              { 'claims.approvals.approver_id': { $nin: [user_id, new ObjectId(user_id)] }, 'claims.approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] }},
            ]}
          ],
          status: { $nin: ['processing', 'Processing', 'Pending', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'SELF') {
    if (history == false) {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          request_type: { $ne: 'attendance' },
          status: { $in: ['Processing', 'processing', 'Pending', 'pending', 'Draft', 'draft'] },
          user_id: ObjectId(user_id),
        },
      };
    } else {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          request_type: { $ne: 'attendance' },
          user_id: new ObjectId(user_id),
          status: { $nin: ['processing', 'Processing', 'Pending', 'pending', 'Draft', 'draft'] },
        },
      };
    }
  }
  if (req_user_id) match.$match.user_id = new ObjectId(req_user_id);

  let userLookup = {
    $lookup: {
      from: 'users',
      localField: 'user_id',
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
            probation_days: '$employment.probation_days',
          },
        },
      ],
    },
  };

  switch (requestType.toLowerCase()) {
    case 'attendance': filter = { $match: { request_type: 'attendance' }}; break;
    case 'claims': filter = { $match: { request_type: 'claims' }}; break;
    case 'letters': filter = { $match: { request_type: 'letters' }}; break;
    case 'loan': filter = { $match: { request_type: 'loan' }}; break;
    case 'education': filter = { $match: { request_type: 'education' }}; break;
    case 'passport': filter = { $match: { request_type: { $in: ['passport', 'passport safekeep', 'passport release'] }}}; break;
    case 'leave': filter = { $match: { request_type: 'leave', $or: customDateRangeFilter }}; break;
    case 'wfh': filter = { $match: { request_type: 'wfh', $or: customDateRangeFilter }}; break;
    case 'salary': filter = { $match: { request_type: 'salary adjustment' } }; break;
    default: if (requestType.toLowerCase() !== 'all') filter = { $match: { request_type: requestType }};
  }

  let unwindUser = { $unwind: '$user_data' };
  let aggregator = [
    { $sort: { date_created: -1 } },
    match,
    userLookup,
    filter,
    unwindUser,
    {
      $project: {
        _id: 1,
        status: 1,
        request_type: 1,
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
        to_date1: 1,
        from_date: 1,
        to_date: 1,
        leave_condition: 1,
        leave_type: 1,
        approvals: 1,
        attachments: 1,
        appliction_log: 1,
        user_id: 1,
        company_id: 1,
        date_created: 1,
        user_data: 1,
        letter_keys: 1,
        appliction_log: 1,
        request_type: 1,
        letterImages: 1,
        signatory: 1,
        user_keys: 1,
        letter_fields: 1,
        claims: 1,
        payroll_process: 1,
        letter_type: 1,
        letter_sub_type: 1,
        pdfStyles: 1,
        previewStyles: 1,
        approvals: 1,
        reason: 1,
        no_of_days: 1,
        created_by_id: 1,
        pdf_url: 1,
        salaryPercentageChanges: 1,
        logs: 1,
        old_salary: 1,
        new_salary: 1,
        isPercentage: 1,
        isAmount: 1,
        isUpdated: 1,
        effective_date: 1,
        createdBy: 1,
        pay_month: 1,
      },
    },
    {
      $addFields: {
        sortNumber: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: '$status', regex: /^draft$/i } }, then: 1 },
              { case: { $regexMatch: { input: '$status', regex: /^processing$/i } }, then: 2 },
              { case: { $regexMatch: { input: '$status', regex: /^completed$/i } }, then: 3 },
              { case: { $regexMatch: { input: '$status', regex: /^cancelled$/i } }, then: 4 },
              { case: { $regexMatch: { input: '$status', regex: /^withdrawn$/i } }, then: 5 },
            ],
            default: 6,
          },
        },
      },
    },
  ];
  if (str_search_tag) {
    aggregator.push({
      $match: {
        $or: [{ 'user_data.first_name': searchRegex }, { 'user_data.last_name': searchRegex },{ 'user_data.emp_id': searchRegex }],
      },
    });
  }
  aggregator.push({ $sort: { sortNumber: 1 }});
  aggregator.push({
    $facet: {
      results: [{ $skip: skip }, { $limit: limit }],
    },
  })

  let requestsData = await Requests.aggregate(aggregator);
  const coreConfigs = await CoreConfig.find({}, { company_ID: 1, designations: 1, dept: 1, employment_types: 1 })

  const getKeyValue = (coreConfig, fieldValue, fieldName) => {
    const fieldData = coreConfig[fieldName]
    if (!fieldData) return fieldValue
    const match = fieldData.find((item) => item.id === fieldValue)
    return match ? match.name : fieldValue
  }

  requestsData[0].results.forEach((request) => {
    const { company_ID, designation, department } = request.user_data
    const coreConfig = coreConfigs.find((config) => String(config.company_ID) === company_ID)

    if (coreConfig) {
      request.user_data.designation = getKeyValue(coreConfig, designation, 'designations')
      request.user_data.department = getKeyValue(coreConfig, department, 'dept')
    }
  })

  return requestsData[0];
};
const getAllRequest = async function (reqBody) {
  let company = reqBody.company;
  let str_search_tag = reqBody.str_search_tag;
  let skip = parseInt(reqBody.skip);
  let limit = parseInt(reqBody.limit);
  let requestType = reqBody.requestType;
  let userType = reqBody.userType;
  let req_user_id = reqBody.req_user_id;
  let user_id = reqBody.user_id;
  let history = reqBody.history;
  let match = { $match: {} };
  let filter = { $match: {} };
  let user_Active_Ids = [];
  const searchRegex = new RegExp(str_search_tag, 'i');
  const allUsers = await Users.find({ user_status: { $in: ['active', 'Onboarding']}}, { _id: 1, reporting: 1 });

  if (company == 'All') user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding']}}, { _id: 1, reporting: 1 });
  else user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding']}/*, company_ID: company*/ }, { _id: 1, reporting: 1 });
  if(userType == "MANAGER") user_Active_Ids = user_Active_Ids.filter((user) => {
    return user.reporting.manager == user_id || user._id.toString() == user_id; //FIXME - Add user that are approvals included here (Recursive)
  });
  let arr_Active = user_Active_Ids.reduce((acc, item) => [...acc, item._id, item._id.toString(), ObjectId(item._id)], []);
  if (!reqBody.startDate) reqBody.startDate = new Date('2/1/10'); // If no start date, set year ro 2010
  if (!reqBody.endDate) reqBody.endDate = new Date('2050-12-01'); // If no, end date, set to current date
  let str_from_date = new Date(new Date(reqBody.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(reqBody.endDate).setHours(23, 59, 59, 0));

  let customDateRangeFilter = [
    { $and: [{ from_date: { $gte: str_from_date } }, { from_date: { $lte: str_to_date } }]},
    { $and: [{ to_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]},
    { $and: [{ from_date: { $lte: str_from_date } }, { to_date: { $gte: str_to_date } }]},
    { $and: [{ from_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]}
  ]

  // ... (rest of the match conditions remain the same)

  let userLookup = {
    $lookup: {
      from: 'users',
      localField: 'user_id',
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
            probation_days: '$employment.probation_days',
          },
        },
      ],
    },
  };

  // ... (rest of the filter conditions remain the same)

  let unwindUser = { $unwind: '$user_data' };
  let aggregator = [
    match,
    userLookup,
    filter,
    unwindUser,
    {
      $project: {
        _id: 1,
        status: 1,
        request_type: 1,
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
        to_date1: 1,
        from_date: 1,
        to_date: 1,
        leave_condition: 1,
        leave_type: 1,
        approvals: 1,
        attachments: 1,
        appliction_log: 1,
        user_id: 1,
        company_id: 1,
        date_created: 1,
        user_data: 1,
        letter_keys: 1,
        appliction_log: 1,
        request_type: 1,
        letterImages: 1,
        signatory: 1,
        user_keys: 1,
        letter_fields: 1,
        claims: 1,
        payroll_process: 1,
        letter_type: 1,
        letter_sub_type: 1,
        pdfStyles: 1,
        previewStyles: 1,
        approvals: 1,
        reason: 1,
        no_of_days: 1,
        created_by_id: 1,
        pdf_url: 1,
        salaryPercentageChanges: 1,
        logs: 1,
        old_salary: 1,
        new_salary: 1,
        isPercentage: 1,
        isAmount: 1,
        isUpdated: 1,
        effective_date: 1,
        createdBy: 1,
        pay_month: 1,
      },
    },
  ];
  if (str_search_tag) {
    aggregator.push({
      $match: {
        $or: [{ 'user_data.first_name': searchRegex }, { 'user_data.last_name': searchRegex },{ 'user_data.emp_id': searchRegex }],
      },
    });
  }
  aggregator.push({ $sort: { _id: -1 } });
  aggregator.push({
    $facet: {
      results: [{ $skip: skip }, { $limit: limit }],
    },
  });

  let requestsData = await Requests.aggregate(aggregator);
  const coreConfigs = await CoreConfig.find({}, { company_ID: 1, designations: 1, dept: 1, employment_types: 1 })

  const getKeyValue = (coreConfig, fieldValue, fieldName) => {
    const fieldData = coreConfig[fieldName]
    if (!fieldData) return fieldValue
    const match = fieldData.find((item) => item.id === fieldValue)
    return match ? match.name : fieldValue
  }

  requestsData[0].results.forEach((request) => {
    const { company_ID, designation, department } = request.user_data
    const coreConfig = coreConfigs.find((config) => String(config.company_ID) === company_ID)

    if (coreConfig) {
      request.user_data.designation = getKeyValue(coreConfig, designation, 'designations')
      request.user_data.department = getKeyValue(coreConfig, department, 'dept')
    }
  })

  return requestsData[0];
};
const getRequestsByDepartment = async (reqBody, dept, monthYear, reqType) => {
  let dateStart = null;
  let dateEnd = null;
  if (monthYear) {
    monthYear = moment(new Date(monthYear)).format('YYYY-MM');
    let initialDate = new Date(monthYear);
    let lastDay = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0);
    dateStart = new Date(initialDate.setHours(0, 0, 0, 0));
    dateEnd = new Date(lastDay.setHours(23, 59, 59, 0));
  }
  let arr = [];
  const users = await Users.find({
    'reporting.department': dept,
    user_status: 'Active',
  });
  let leave = {};
  for (let i = 0; i < users.length; i++) {
    let leavesCond = {
      user_id: users[i]._id,
      request_type: reqType,
      $or: [{ status: 'Completed' }, { status: 'Processing' }],
    };
    if (monthYear) {
      leavesCond.to_date = { $gte: dateStart, $lte: dateEnd };
    }
    leave = await Requests.find(leavesCond);
    arr.push(...leave);
  }
  return arr;
};

const getPayrollReportCountByCompanyId = async (id, pay_month) => {
  let payrollConfig = await PayrollConfig.findOne({
    company_ID: {
      $elemMatch: {
        _id: id
      }
    }
  });
  if (!payrollConfig) {
    return { message: 'Unable to Get the Data', data: [] };
  }

  let yearRequestPayitem = await Payitems.find({ company_id: payrollConfig.id, pay_month: pay_month })
  let yearRequest = {};
  for (let i_request = 0; i_request < yearRequestPayitem.length; i_request++) {
    const element = yearRequestPayitem[i_request];
    if (!yearRequest.hasOwnProperty(element.status)) {
      yearRequest[element.status] = 1;
    } else {
      yearRequest[element.status] += 1;
    }
  }
  yearRequest.total = Object.values(yearRequest).reduce((accumulator, value) => {
    return accumulator + value;
  }, 0);
  return (data = { requests: yearRequest });
};

// All the Request Of a User
// const userRequest = async (userId, query, reqBody) => {
//   let skipCount = parseInt(query?.skip);
//   let pageLimit = parseInt(query?.limit);
//   const pipeline = [
//     {
//       $addFields: {
//         sortNumber: {
//           $switch: {
//             branches: [
//               { case: { $regexMatch: { input: '$status', regex: /^draft$/i } }, then: 1 },
//               { case: { $regexMatch: { input: '$status', regex: /^processing$/i } }, then: 2 },
//               { case: { $regexMatch: { input: '$status', regex: /^completed$/i } }, then: 3 },
//               { case: { $regexMatch: { input: '$status', regex: /^cancelled$/i } }, then: 4 },
//               { case: { $regexMatch: { input: '$status', regex: /^withdrawn$/i } }, then: 5 },
//             ],
//             default: 6,
//           },
//         },
//       },
//     },
//     { $match: { user_id: ObjectId(userId)}},
//   ];

//   if (reqBody?.reqType !== '' && reqBody?.reqType) pipeline.push({ $match: { request_type: reqBody.reqType }});
//   pipeline.push({ $sort: { sortNumber: 1, date_created: -1 } });
//   if (!isNaN(skipCount) && skipCount >= 0) pipeline.push({ $skip: skipCount });
//   if (!isNaN(pageLimit) && pageLimit > 0) pipeline.push({ $limit: pageLimit });
//   const requests = await Requests.aggregate(pipeline);

//   if (!requests) {
//     return { message: 'Unable to Get the Data', data: [] };
//   }
//   return { message: 'Success', data: { requests, pipeline } };
// };
const userRequest = async (userId, query, reqBody) => {
  let skipCount = parseInt(query?.skip) || 0;
  let pageLimit = parseInt(query?.limit) || 10;

  const pipeline = [
    {
      $addFields: {
        sortNumber: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: '$status', regex: /^draft$/i } }, then: 1 },
              { case: { $regexMatch: { input: '$status', regex: /^processing$/i } }, then: 2 },
              { case: { $regexMatch: { input: '$status', regex: /^completed$/i } }, then: 3 },
              { case: { $regexMatch: { input: '$status', regex: /^cancelled$/i } }, then: 4 },
              { case: { $regexMatch: { input: '$status', regex: /^withdrawn$/i } }, then: 5 },
            ],
            default: 6,
          },
        },
      },
    },
    { $match: { user_id: ObjectId(userId) } },
  ];

  if (reqBody?.reqType !== '' && reqBody?.reqType) {
    pipeline.push({ $match: { request_type: reqBody.reqType } });
  }

  pipeline.push({ $sort: { sortNumber: 1, date_created: -1 } });
  if (!isNaN(skipCount) && skipCount >= 0) pipeline.push({ $skip: skipCount });
  if (!isNaN(pageLimit) && pageLimit > 0) pipeline.push({ $limit: pageLimit });

  const requests = await Requests.aggregate(pipeline);

  // Get total count of matching documents
  const totalCountPipeline = [
    { $match: { user_id: ObjectId(userId) } },
    ...(reqBody?.reqType !== '' && reqBody?.reqType ? [{ $match: { request_type: reqBody.reqType } }] : []),
    { $count: 'totalCount' },
  ];
  const totalCountResult = await Requests.aggregate(totalCountPipeline);
  const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

  if (!requests) {
    return { message: 'Unable to Get the Data', data: [] };
  }

  return {
    message: 'Success',
    data: {
      requests,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
        currentPage: Math.floor(skipCount / pageLimit) + 1,
        pageSize: pageLimit,
      },
      pipeline
    },
  };
};

// Get All Requests
const getAllRequestsAndSpecificRequests = async (reqBody, query) => {
  let skipCount = parseInt(query?.skip);
  let pageLimit = parseInt(query?.limit);
  const configuration = await Configuration.find({}).select({ requestTypes: 1 });
  const pipeline = [
    {
      $match: {
        request_type: { $in: configuration[0].requestTypes },
      },
    },
    { $sort: { date_created: -1 } },
  ];
  // Conditionally add $skip and $limit stages if skipCount and pageLimit are valid
  if (!isNaN(skipCount) && skipCount >= 0) {
    pipeline.push({ $skip: skipCount });
  }
  if (!isNaN(pageLimit) && pageLimit > 0) {
    pipeline.push({ $limit: pageLimit });
  }
  if (reqBody?.reqType && reqBody?.reqType !== '') {
    pipeline[0].$match.request_type = reqBody.reqType;
  }
  const requests = await Requests.aggregate(pipeline);
  if (!requests) {
    return { message: 'Unable to Get the Data', data: [] };
  }
  return { message: 'Success', data: { requests, pipeline } };
};

// Get All Request Counts On Date
const getAllRequestCountsOnDate = async (reqBody) => {
  let company_ID = reqBody?.company_ID;
  let user_Active_Ids = [];
  let user_id = reqBody?.user_id;
  if(reqBody.userType == 'MANAGER') {
    user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding'] }, "reporting.manager": user_id }).select({ _id: 1 });
  } else {
    if (company_ID == 'All') {
      user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding'] } }).select({ _id: 1 });
    } else {
      user_Active_Ids = await Users.find({
        user_status: { $in: ['active', 'Onboarding'] },
        company_ID: company_ID,
      }).select({ _id: 1 });
    }
  }
  let arr_Active = [];
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();
  let claimCount = 0;
  let lettersCount = 0;
  let attendanceCount = 0;
  let leaveCount = 0;
  let wfhCount = 0;
  let match = {};
  let userType = reqBody?.userType;
  let str_from_date = new Date(new Date(reqBody?.date).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(reqBody?.date).setHours(23, 59, 59, 0));
  if (userType == 'ADMIN') {
    match = {
      $match: {
        status: { $in: ['Completed', 'completed'] },
        user_id: { $in: arr_Active },
      },
    };
  } else if (userType == 'MANAGER') {
    match = {
      $match: {
        status: { $in: ['Completed', 'completed'] },
        'approvals.approver_id': { $in: [user_id] },
        user_id: { $in: arr_Active },
      },
    };
  }
  const requests = await Requests.aggregate([
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
      else if (requests[i]._id == 'leave') leaveCount = requests[i].count;
      else if (requests[i]._id == 'wfh') wfhCount = requests[i].count;
    }
  }
  return {
    message: 'Successfully displaying Data',
    data: {
      claimCount: claimCount,
      attendanceCount: attendanceCount,
      lettersCount: lettersCount,
      leaveCount: leaveCount,
      wfhCount: wfhCount,
    },
  };
};

// Get All Pending Request Counts
const getAllPendingRequestCounts = async (reqBody) => {
  let company_ID = reqBody?.company_ID;
  let user_id = reqBody?.user_id;
  let user_Active_Ids = [];
  if(reqBody.userType == 'MANAGER') {
    user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding'] }, "reporting.manager": user_id }).select({ _id: 1 });
  } else {
    if (company_ID == 'All') {
      user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding'] } }).select({ _id: 1 });
    } else {
      user_Active_Ids = await Users.find({
        user_status: { $in: ['active', 'Onboarding'] },
        company_ID: company_ID,
      }).select({ _id: 1 });
    }
  }
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
  let userType = reqBody?.userType;
  if (userType == 'ADMIN') {
    match = {
      $match: {
        status: { $in: ['Processing', 'processing', 'pending'] },
        user_id: { $in: arr_Active },
      },
    };
  } else if (userType == 'MANAGER') {
    match = {
      $match: {
        status: { $in: ['Processing', 'processing', 'pending'] },
        $or: [
          {
            'approvals.approver_id': { $in: [user_id] },
            'approvals.status': { $in: ['Processing', 'processing', 'pending'] },
          },
          {
            'approvals.approver_id': { $in: [ObjectId(user_id)] },
            'approvals.status': { $in: ['Processing', 'processing', 'pending'] },
          },
        ],
        // approvals: { $elemMatch: { "$or": [{ approver_id: user_id, status: { $in: ['Processing', 'processing'] } }, { approver_id: ObjectId(user_id), status: { $in: ['Processing', 'processing'] } }] } },
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
  const requests = await Requests.aggregate(aggregator);
  if (requests.length > 0) {
    for (let i in requests) {
      if (requests[i]._id == 'claims') claimCount = requests[i].count;
      else if (requests[i]._id == 'attendance') attendanceCount = requests[i].count;
      else if (requests[i]._id == 'letters') lettersCount = requests[i].count;
      else if (requests[i]._id == 'loan') loanCount = requests[i].count;
      else if (requests[i]._id == 'education') educationCount = requests[i].count;
      else if (requests[i]._id == 'leave') leaveCount = requests[i].count;
      else if (requests[i]._id == 'wfh') wfhCount = requests[i].count;
      else if (requests[i]._id == 'passport release' || requests[i]._id == 'passport safekeep')
        passportCount += requests[i].count;
    }
  }
  totalCount =
    claimCount + attendanceCount + lettersCount + leaveCount + wfhCount + loanCount + educationCount + passportCount;
  return {
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
  };
};

// Get All Request Counts On User ID
const getRequestCountsOnUserId = async (userId, reqBody) => {
  let company = reqBody?.company;
  let user_Active_Ids = [];
  if(reqBody.userType == 'MANAGER') {
    user_Active_Ids = await Users.find({
      user_status: { $in: ['active', 'Onboarding'] }, $or: [{"reporting.manager": userId}, { _id: userId }]
    }).select({ _id: 1 });
  } else {
    if (company == 'All') {
      user_Active_Ids = await Users.find({ user_status: { $in: ['active', 'Onboarding'] } }).select({ _id: 1 });
    } else {
      user_Active_Ids = await Users.find({
        user_status: { $in: ['active', 'Onboarding'] },
        company_ID: company,
      }).select({ _id: 1 });
    }
  }
  let arr_Active = [];
  arr_Active.push(user_Active_Ids.map((a) => a._id.toString()));
  arr_Active.push(user_Active_Ids.map((a) => a._id));
  arr_Active = arr_Active.flat();
  let claimCount = 0;
  let lettersCount = 0;
  let attendanceCount = 0;
  let leaveCount = 0;
  let lieuCount = 0;
  let wfhCount = 0;
  let loanCount = 0;
  let educationCount = 0;
  let passportCount = 0;
  let salaryAdjustmentCount = 0;
  let str_search_tag = reqBody?.str_search_tag;
  let userType = reqBody?.userType;
  let req_user_id = reqBody?.req_user_id;
  let user_id = userId;
  let history = reqBody?.history;
  let str_from_date = new Date(new Date(reqBody?.startDate).setHours(0, 0, 0, 0));
  let str_to_date = new Date(new Date(reqBody?.endDate).setHours(23, 59, 59, 0));
  if (req_user_id != '') arr_Active = [req_user_id, new ObjectId(req_user_id)];

  let customDateRangeFilter = [
    { $and: [{ from_date: { $gte: str_from_date } }, { from_date: { $lte: str_to_date } }]},
    { $and: [{ to_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]},
    { $and: [{ from_date: { $lte: str_from_date } }, { to_date: { $gte: str_to_date } }]},
    { $and: [{ from_date: { $gte: str_from_date } }, { to_date: { $lte: str_to_date } }]}
  ]

  if (userType == 'ADMIN') {
    if (history == false) {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          status: { $in: ['Processing', 'processing', 'Pending', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          status: { $nin: ['Processing', 'processing', 'Pending', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'MANAGER') {
    if (history == false) {
      match = {
        $match: {
          $and: [
            {
              $or: [
                { request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }},
                { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }
              ],
            },
            {
              $or: [
                {
                  approvals: {
                    $elemMatch: {
                      approver_id: { $in: [user_id, ObjectId(user_id)]},
                      status: { $in: ["Processing", "processing", "Pending", "pending"] }
                    }
                  }
                },
                {
                  'claims.approvals.approver_id': { $in: [user_id, new ObjectId(user_id)] },
                  'claims.approvals.status': { $in: ['Processing', 'processing', 'Pending', 'pending'] },
                },
              ],
            }
          ],
          status: { $in: ['Processing', 'processing', 'Pending', 'pending'] },
          //user_id: { $in: arr_Active },
        },
      };
    } else {
      match = {
        $match: {
          $and: [
            {
              $or: [
                { request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }},
                { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }
              ],
            },
            {
              $or: [
                {
                  'approvals.approver_id': { $in: [user_id] },
                  'approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] },
                },
                {
                  'approvals.approver_id': { $in: [ObjectId(user_id)] },
                  'approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] },
                },
                {
                  'claims.approvals.approver_id': { $nin: [user_id, new ObjectId(user_id)] },
                  'claims.approvals.status': { $nin: ['Processing', 'processing', 'Pending', 'pending'] },
                },
              ],
            }
          ],
          status: { $nin: ['processing', 'Processing', 'Pending', 'pending'] },
          user_id: { $in: arr_Active },
        },
      };
    }
  } else if (userType == 'SELF') {
    if (history == false) {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          objid_user_id: ObjectId(user_id),
          status: { $in: ['Processing', 'processing', 'Pending', 'pending', 'Draft', 'draft'] },
        },
      };
    } else {
      match = {
        $match: {
          $or: [{ request_type: { $nin: ['leave', 'wfh']}, date_created: { $gte: str_from_date, $lt: str_to_date }}, { request_type: { $in: ['leave', 'wfh']}, $or: customDateRangeFilter }],
          objid_user_id: ObjectId(user_id),
          status: { $nin: ['Processing', 'processing', 'Pending', 'pending', 'Draft', 'draft'] },
        },
      };
    }
  }
  let aggregator = [{
    $addFields: { objid_user_id: { $toObjectId: '$user_id' } }
  },{
    $lookup: {
      from: 'users',
      localField: 'objid_user_id',
      foreignField: '_id',
      as: 'associated_user',
    },
  },{
    $unwind: {
      path: '$associated_user',
      preserveNullAndEmptyArrays: true,
    },
  },match];
  
  if (str_search_tag) {
    aggregator.push({
      $match: {
        $expr: {
          $regexMatch: {
            input: {
              $concat: ['$associated_user.emp_id', ' ', '$associated_user.first_name', ' ', '$associated_user.last_name'],
            },
            regex: str_search_tag,
            options: 'i',
          },
        },
      },
    });
  }

  aggregator.push({ $group: { _id: '$request_type', count: { $sum: 1 } } });

  const requests = await Requests.aggregate(aggregator);
  
  if (requests.length > 0) {
    for (let i in requests) {
      if (requests[i]._id == 'claims') claimCount = requests[i].count;
      else if (requests[i]._id == 'attendance') attendanceCount = requests[i].count;
      else if (requests[i]._id == 'letters') lettersCount = requests[i].count;
      else if (requests[i]._id == 'loan') loanCount = requests[i].count;
      else if (requests[i]._id == 'education') educationCount = requests[i].count;
      else if (requests[i]._id == 'leave') leaveCount = requests[i].count;
      else if (requests[i]._id == 'lieu') lieuCount = requests[i].count;
      else if (requests[i]._id == 'wfh') wfhCount = requests[i].count;
      else if (requests[i]._id == 'salary adjustment') salaryAdjustmentCount = requests[i].count;
      else if (
        requests[i]._id == 'passport release' ||
        requests[i]._id == 'passport safekeep' ||
        requests[i]._id == 'passport'
      )
        passportCount += requests[i].count;
    }
  }
  return {
    message: 'Successfully displaying Request',
    data: {
      claimCount: claimCount,
      attendanceCount: attendanceCount,
      lettersCount: lettersCount,
      leaveCount: leaveCount,
      lieuCount: lieuCount,
      wfhCount: wfhCount,
      loanCount: loanCount,
      educationCount: educationCount,
      passportCount: passportCount,
      salaryAdjustmentCount: salaryAdjustmentCount,
    },
  };
};

// Get Leave History
const getLeaveAndWfhHistory = async (reqBody) => {
  const skipCount = parseInt(reqBody?.skip);
  const pageLimit = parseInt(reqBody?.limit);
  const requestType = reqBody?.request_type;
  const userType = reqBody?.userType;
  const user_id = reqBody?.user_id;
  const applied_user_id = reqBody?.applied_user_id;
  let match = { $match: {} };
  if (userType == 'ADMIN') {
    match = { $match: { user_id: ObjectId(applied_user_id), request_type: requestType } };
  } else if (userType == 'MANAGER') {
    match = {
      $match: {
        request_type: requestType,
        user_id: ObjectId(applied_user_id),
        // approvals: { $elemMatch: { approver_id: user_id } }
        'approvals.approver_id': { $in: [user_id] },
      },
    };
  } else {
    match = { $match: { user_id: ObjectId(user_id), request_type: requestType } };
  }
  const aggregationPipeline = [
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
  ];
  if (!isNaN(skipCount) && skipCount >= 0) {
    aggregationPipeline.push({ $skip: skipCount });
  }
  if (!isNaN(pageLimit) && pageLimit > 0) {
    aggregationPipeline.push({ $limit: pageLimit });
  }
  const requests = await Requests.aggregate(aggregationPipeline);
  if (!requests) {
    return { message: 'Unable to get Data', data: [] };
  }
  return { message: 'Success', data: requests };
};

// Update Request
const updateRequests = async (requestId, reqBody) => {
  const id = requestId;
  const filter = { _id: ObjectId(id) };
  const db_request = await Requests.updateOne(filter, { $set: reqBody });
  const requests = await Requests.find({ _id: ObjectId(id) });
  if (requests.length > 0 && requests[0].request_type === 'claims' && requests[0].status === 'Completed') {
    const user = await Users.find({ _id: ObjectId(requests[0].user_id) });
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
      approved_by_id: requests[0].approvals[0].approver_id[0],
      recursive_id: 'Non-Recursive',
      status: 'active',
      unpaid: 0,
      ot_type: '',
      hours: '',
      claim_id: requestId,
      created_by_id: requests[0].user_id,
      company_id: requests[0].company_id,
    };
    const payrollprocess = await PayrollProcess.find({
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
    const payroll = new Payitems({ ...payitemObj });
    const newProcess = await payroll.save();
  }
  var obj = reqBody;
  const UserDetails = await Users.find({ _id: ObjectId(reqBody.user_id) });
  var is_letter_request = false;
  var is_claim_true = false;
  if (obj.letter_type == 'Salary Transfer Letter' || obj.letter_type == 'Salary Certificate' || obj.letter_type == 'NOC') {
    is_letter_request = true;
  }
  if (obj.letter_type == 'Expense Claim') {
    is_claim_true = true;
  }
  if (is_letter_request == true) {
    if (reqBody.status == 'Completed' || reqBody.status == 'Approved') {
      await NotificationHelper.saveNotification(
        UserDetails[0]._id.toString(),
        UserDetails[0]._id.toString(),
        obj.letter_type + ' Approved',
        'Letter Request - Approved',
        'dashboards/myhr#requests',
        { type: requests[0].request_type, _id: requestId, status: reqBody.status }
      );
    }
    if (reqBody.status == 'Rejected' || reqBody.status == 'Cancelled') {
      await NotificationHelper.saveNotification(
        UserDetails[0]._id.toString(),
        UserDetails[0]._id.toString(),
        obj.letter_type + ' Rejected',
        'Letter Request Rejected',
        'dashboards/myhr#requests',
        { type: requests[0].request_type, _id: requestId, status: reqBody.status }
      );
    }
    if (reqBody.status == 'Processing' || reqBody.status == 'processing' || reqBody.status == 'pending') {
      var next_approver = LeavesHelper.getApproverDetailsForNotification(obj);
      if (next_approver.length > 0) {
        await NotificationHelper.saveNotification(
          next_approver[0].approver_id.toString(),
          next_approver[0].approver_id.toString(),
          obj.letter_type + ' Request is Pending for Approval',
          'Letter Request Pending Approval',
          'dashboards/my-team#requests',
          { type: requests[0].request_type, _id: requestId, status: reqBody.status }
        );
      } else {
        console.log('next Approver not found');
      }
    }
  }
  if (reqBody.status == 'Rejected' || reqBody.status == 'Cancelled') {
    await NotificationHelper.saveNotification(
      UserDetails[0]._id.toString(),
      UserDetails[0]._id.toString(),
      obj.letter_type + ' Rejected',
      'Letter Request Rejected',
      'dashboards/myhr#requests',
      { type: requests[0].request_type, _id: requestId, status: reqBody.status }
    );
  }
  if (is_claim_true) {
    if (reqBody.status == 'Cancelled' || reqBody.status == 'Rejected') {
      await NotificationHelper.saveNotification(
        UserDetails[0]._id.toString(),
        UserDetails[0]._id.toString(),
        obj.letter_type + ' Rejected',
        'Claim Request - Rejected Eway',
        'dashboards/myhr#requests',
        { type: requests[0].request_type, _id: requestId, status: reqBody.status }
      );
    }
    if (reqBody.status == 'Completed') {
      await NotificationHelper.saveNotification(
        UserDetails[0]._id.toString(),
        UserDetails[0]._id.toString(),
        obj.letter_type + ' Approved',
        'Claim Request Pending Approval Eway',
        'dashboards/myhr#requests',
        { type: requests[0].request_type, _id: requestId, status: reqBody.status }
      );
    }
    if (reqBody.status == 'Processing' || reqBody.status == 'processing' || reqBody.status == 'pending') {
      var next_approver = LeavesHelper.getApproverDetailsForNotification(obj);
      if (next_approver.length > 0) {
        await NotificationHelper.saveNotification(
          next_approver[0].approver_id.toString(),
          next_approver[0].approver_id.toString(),
          obj.letter_type + ' Request is Pending for Approval',
          'Claim Request Pending Approval',
          'dashboards/my-team#requests',
          { type: requests[0].request_type, _id: requestId, status: reqBody.status }
        );
      }
    }
  }
};

// Retrieve request details
const getRequestDetails = async (requestId) => {
  const data = await Requests.aggregate([
    { $match: { _id: new ObjectId(requestId) } },
    {
      $lookup: {
        from: 'users',
        let: { userId: { $toString: '$user_id' } },
        as: 'user_data',
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: [{ $toString: '$_id' }, '$$userId'] }] },
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
              image_url: 1,
              banner_photo: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$user_data',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        flattenedApproverIds: {
          $cond: {
            if: { $eq: ['$request_type', 'claims'] },
            then: {
              $reduce: {
                input: '$claims',
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    {
                      $reduce: {
                        input: '$$this.approvals',
                        initialValue: [],
                        in: {
                          $concatArrays: [
                            '$$value',
                            {
                              $cond: {
                                if: { $eq: [{ $type: '$$this.approver_id' }, 'string'] },
                                then: ['$$this.approver_id'],
                                else: '$$this.approver_id',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
            else: {
              $reduce: {
                input: '$approvals',
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    {
                      $cond: {
                        if: { $eq: [{ $type: '$$this.approver_id' }, 'string'] },
                        then: ['$$this.approver_id'],
                        else: '$$this.approver_id',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { approverIds: '$flattenedApproverIds' },
        as: 'approver_details',
        pipeline: [
          {
            $match: {
              $expr: { $in: [{ $toString: '$_id' }, '$$approverIds'] },
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
              image_url: 1,
              banner_photo: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        approvals: {
          $cond: {
            if: { $eq: ['$request_type', 'claims'] },
            then: {
              $map: {
                input: '$claims',
                as: 'claim',
                in: {
                  approvals: {
                    $map: {
                      input: '$$claim.approvals',
                      as: 'approval',
                      in: {
                        $mergeObjects: [
                          '$$approval',
                          {
                            approver_details: {
                              $filter: {
                                input: '$approver_details',
                                as: 'details',
                                cond: {
                                  $in: [
                                    { $toString: '$$details._id' },
                                    {
                                      $cond: {
                                        if: {
                                          $eq: [{ $type: '$$approval.approver_id' }, 'string'],
                                        },
                                        then: ['$$approval.approver_id'],
                                        else: '$$approval.approver_id',
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            else: {
              $map: {
                input: '$approvals',
                as: 'approval',
                in: {
                  $mergeObjects: [
                    '$$approval',
                    {
                      approver_details: {
                        $filter: {
                          input: '$approver_details',
                          as: 'details',
                          cond: {
                            $in: [
                              { $toString: '$$details._id' },
                              {
                                $cond: {
                                  if: {
                                    $eq: [{ $type: '$$approval.approver_id' }, 'string'],
                                  },
                                  then: ['$$approval.approver_id'],
                                  else: '$$approval.approver_id',
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        flattenedApproverIds: 0,
      },
    },
  ]);

  let approvers;
  if (data[0].request_type === 'claims') {
    approvers = data[0].approvals.reduce((ac, item) => {
      const approver = item.approvals.reduce((acc, sub) => {
        const { approver_details, status, reason, approver_id } = sub;
        const approvers = approver_id.map((sub) => {
          const details = approver_details.find((x) => x._id == sub);
          return { status, reason, ...details };
        });
        return [...acc, ...approvers];
      }, []);

      return [...ac, ...approver];
    }, []);
  } else {
    approvers = data[0].approvals.reduce((acc, item) => {
      const { approver_details, status, reason, approver_id } = item;
      const approvers = approver_id.map((sub) => {
        const details = approver_details.find((x) => x._id == sub);
        return { status, reason, ...details };
      });
      return [...acc, ...approvers];
    }, []);
  }
  return {
    data: data[0],
    approvers: approvers || [],
  };
};

// Get Each Leave Count Weekly
const getEachLeaveCountWeekly = async (date, request_type, letter_type) => {
  let month = new Date(date).getMonth(); // returns the current month

  let year = new Date(date).getFullYear(); // returns the current year

  let arr = []

  for (let i = 0; i < 4; i++) {
      let from_date = new Date(year, month);
      from_date.setDate(from_date.getDate() + (7 * [i]))
      from_date.setTime(from_date.getTime() + (4 * 60 * 60 * 1000))

      let to_Date = new Date(year, month)
      to_Date.setDate(to_Date.getDate() + (7 * [i + 1]))
      to_Date.setTime(to_Date.getTime() + (4 * 60 * 60 * 1000))
      const leaveWeekly = await Requests.aggregate([{
          $addFields: {
              "date_field": {
                  $toDate: "$from_date"
              }
          }
      }, {
          $match: {
              request_type,
              leave_type: letter_type,
              status: "Completed",
              date_field: {
                  $gte: from_date,
                  $lt: to_Date
              }
          }
      }, {
          $count: "count"
      }])

      arr.push(leaveWeekly)
  }


  return {
      message: 'Successfully displaying Request',
      data: arr
  };
}

// Generate reference number
const generateReferenceNumber = async ({ user_id }) => {
  try {
    const startOfYear = new Date(moment().startOf('year'))
    const currentYear = moment().year()
    const currentMonth = moment().month()
    const applicant = await Users.findOne({ _id: ObjectId(user_id)}, { emp_id: 1 })
    const request = await Requests.aggregate([
      { $match: {
        request_type: "letters",
        //user_id: { $in: [user_id, ObjectId(user_id)] },
        date_created: { $gte: startOfYear }
      }}
    ])

    let referenceNumber = `PEO/${applicant?.emp_id || ""}/`
    const reqLength = request?.length ?? 0
    const serialNumber = reqLength > 0 ? `${reqLength.toString().padStart(4, '0')}` : '0001'
    referenceNumber += `${serialNumber}/${currentMonth + 1}/${currentYear}`

    return { success: true, message: "Reference number generated successfully.", data: referenceNumber }
  } catch (error) {
    return { success: true, message: error.message }
  }
}

/*const { Client } = require('ssh2');

router.get('/retrieve-stream', async (req, res) => {
  const conn = new Client();

  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP connection error:', err);
        res.status(500).send('SFTP connection error');
        return;
      }
      const remoteFilePath = extendedPath;
      sftp.open(remoteFilePath, 'r', (err, handle) => {
        if (err) {
          console.error('SFTP open file error:', err);
          res.status(500).send('SFTP open file error');
          conn.end();
          return;
        }
        sftp.fstat(handle, (err, stats) => {
          if (err) {
            console.error('SFTP stat file error:', err);
            res.status(500).send('SFTP stat file error');
            sftp.close(handle, () => conn.end());
            return;
          }

          console.log('Stats of the file:', stats.size);
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': stats.size,
          });
          const readStream = sftp.createReadStream(remoteFilePath);
          readStream.pipe(res);
          readStream.on('end', () => {
            sftp.close(handle, () => conn.end());
          });
          readStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).send('Stream error');
            sftp.close(handle, () => conn.end());
          });
        });
      });
    });
  }).connect(config)
})

app.get('/stream-pdf', (req, res) => {
  const conn = new Client();

  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP connection error:', err);
        res.status(500).send('SFTP connection error');
        return;
      }

      const remoteFilePath = '/path/to/your/large.pdf';
      sftp.open(remoteFilePath, 'r', (err, handle) => {
        if (err) {
          console.error('SFTP open file error:', err);
          res.status(500).send('SFTP open file error');
          conn.end();
          return;
        }

        sftp.fstat(handle, (err, stats) => {
          if (err) {
            console.error('SFTP stat file error:', err);
            res.status(500).send('SFTP stat file error');
            sftp.close(handle, () => conn.end());
            return;
          }
          console.log('Stats of the file:', stats);
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': stats.size,
          });

          const readStream = sftp.createReadStream(remoteFilePath);
          readStream.pipe(res);

          readStream.on('end', () => {
            sftp.close(handle, () => conn.end());
          });

          readStream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).send('Stream error');
            sftp.close(handle, () => conn.end());
          });
        });
      });
    });
  }).connect(sftpConfig);
});*/

module.exports = {
  getRequestsCount,
  upcomingRequests,
  getRequestById,
  getRequestUsersInfo,
  getAllRequest,
  getRequestsByDepartment,
  getPayrollReportCountByCompanyId,
  userRequest,
  getAllRequestsAndSpecificRequests,
  getAllRequestCountsOnDate,
  getAllPendingRequestCounts,
  getRequestCountsOnUserId,
  getLeaveAndWfhHistory,
  updateRequests,
  getRequestDetails,
  getEachLeaveCountWeekly,
  generateReferenceNumber
};
