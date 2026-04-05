const {
  Users,
  Onboardings,
  Renewals,
  Offboardings,
  Ticket,
  VisaProcess,
  Companies,
  Leads,
  Processes,
} = require('../models');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const fetchClientTasks = async (reqBody, reqQuery) => {
  try {
    const onboardingClientActions = [
      {
        stage_name: "Employer's Approval",
        action_message: "Waiting for employer's Approval",
      },
      {
        stage_name: 'Create Work Order',
        action_message: "Send Work Order for employer's approval sign",
      },
      {
        stage_name: 'Work Order Approval',
        action_message: "Waiting for employer's Approval",
      },
    ];
    const renewalClientActions=[
        {
        stage_name: "Create Work Order",
        action_message: "Waiting for employer's Response",
      },
        {
        stage_name: "Work Order Approval",
        action_message: "Waiting for Employer's approval",
      },
        {
        stage_name: "Work Order Sign",
        action_message: "Upload Signed Work Order",
      },
    ]
    const onboardingActionNames = onboardingClientActions.map((a) => a.stage_name);
    const onboardingFilter = {
      company_id: ObjectId(reqBody.companyId),
      status: { $in: onboardingActionNames },
      is_deleted: false,
    };
    const renewalFilter = {
      company_id: ObjectId(reqBody.companyId),
      status: { $in: renewalClientActions },
      is_deleted: false,
    };
    const options = {
      page: reqQuery.page ? parseInt(reqQuery.page, 10) : 1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10,
      sortBy: 'createdAt:-1',
    };

    
    const onboardingPipeline = [
      {
        $match: onboardingFilter,
      },
      {
        $unwind: {
          path: '$processes',
        },
      },
      {
        $match: {
          'processes.process_status': 'progress',
        },
      },
      {
        $unwind: {
          path: '$processes.actions',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $expr: {
            $let: {
              vars: {
                actionForStage: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: onboardingClientActions,
                        as: 'action',
                        cond: { $eq: ['$$action.stage_name', '$processes.stage_name'] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                $eq: ['$processes.actions.message', '$$actionForStage.action_message'],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails',
          pipeline: [
            {
              $match: {
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1, // Fixed typo: lasst_name -> last_name
                email: 1,
                image_url: 1,
                user_status: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userDetails',
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails',
          pipeline: [
            {
              $project: {
                company_name: 1,
                logo: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          stage_name: '$processes.stage_name',
          process_status: '$processes.process_status',
          action_message: '$processes.actions.message',
          action_status: '$processes.actions.status',
          button: '$processes.actions.button',
          previous_button: '$processes.actions.previous_button',
          reject_button: '$processes.actions.reject_button',
          userDetails: 1,
          companyDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    const renewalsPipeline = [
      {
        $match: renewalFilter,
      },
      {
        $unwind: {
          path: '$processes',
        },
      },
      {
        $match: {
          'processes.process_status': 'progress',
        },
      },
      {
        $unwind: {
          path: '$processes.actions',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $expr: {
            $let: {
              vars: {
                actionForStage: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: onboardingClientActions,
                        as: 'action',
                        cond: { $eq: ['$$action.stage_name', '$processes.stage_name'] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                $eq: ['$processes.actions.message', '$$actionForStage.action_message'],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails',
          pipeline: [
            {
              $match: {
                is_deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1, // Fixed typo: lasst_name -> last_name
                email: 1,
                image_url: 1,
                user_status: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userDetails',
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails',
          pipeline: [
            {
              $project: {
                company_name: 1,
                logo: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          stage_name: '$processes.stage_name',
          process_status: '$processes.process_status',
          action_message: '$processes.actions.message',
          action_status: '$processes.actions.status',
          button: '$processes.actions.button',
          previous_button: '$processes.actions.previous_button',
          reject_button: '$processes.actions.reject_button',
          userDetails: 1,
          companyDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    const onboardingDocuments = await Onboardings.paginateLookup(onboardingFilter, options, onboardingPipeline);
    const renewalDocuments = await Renewals.paginateLookup(renewalFilter, options, renewalsPipeline);
    // add a field named module:"onboarding" to all onboarding documents
    onboardingDocuments.results = onboardingDocuments.results.map((doc) => ({
      ...doc,
      module: 'onboarding',
    }));
    renewalDocuments.results = renewalDocuments.results.map((doc) => ({
      ...doc,
      module: 'renewal',
    }));
    //contact the two arrays and return
    const allTasks = onboardingDocuments.results.concat(renewalDocuments.results);
    return allTasks;

  } catch (error) {
    throw error;
  }
};

const fetchRecentEntities = async (Model, reqBody = {}) => {
  try {
    const options = {
      sortBy: '_id:-1',
      limit: 10,
      page: 1,
      skip: 0,
    };
    const filter = {
      is_deleted: false,
    };
    if (reqBody.companyId) {
      filter.company_id = ObjectId(reqBody.companyId);
    }
    const body = [
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'userDetails.company_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          userDetails: {
            first_name: '$userDetails.first_name',
            last_name: '$userDetails.last_name',
            middle_name: '$userDetails.middle_name',
            email: '$userDetails.email',
            image_url: {
              $cond: {
                if: {
                  $or: [{ $eq: ['$userDetails.image_url', null] }, { $eq: ['$userDetails.image_url', ''] }],
                },
                then: 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg',
                else: '$userDetails.image_url',
              },
            },
          },
          company_name: '$companyDetails.company_name',
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    const response = await Model.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    console.error('Error in fetchRecentEntities:', error);
    throw error;
  }
};

const recentOnboardings = (reqBody) => fetchRecentEntities(Onboardings, reqBody);
const recentRenewals = (reqBody) => fetchRecentEntities(Renewals, reqBody);
const fetchRecentVisaProcesses = (reqBody) => fetchRecentEntities(VisaProcess, reqBody);
const recentOffboardings = (reqBody) => fetchRecentEntities(Offboardings, reqBody);
const recentTickets = async (reqBody = {}) => {
  try {
    const options = {
      sortBy: 'createdAt:-1',
      limit: 10,
      page: 1,
      skip: 0,
    };
    const filter = {
      is_deleted: false,
    };
    if (reqBody.companyId) {
      filter.company_id = ObjectId(reqBody.companyId);
    }
    // Ticket-specific aggregation pipeline
    const body = [
      {
        $lookup: {
          from: 'users',
          localField: 'assignedToId',
          foreignField: '_id',
          as: 'assignedToDetails',
        },
      },
      {
        $unwind: {
          path: '$assignedToDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          incident_number: 1,
          type: 1,
          status: 1,
          priority: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          createdAt: 1,
          updatedAt: 1,
          assignedToId: 1,
          assignedToName: {
            $concat: [
              { $ifNull: ['$assignedToDetails.first_name', ''] },
              ' ',
              { $ifNull: ['$assignedToDetails.last_name', ''] },
            ],
          },
          company_name: '$companyDetails.company_name',
        },
      },
    ];
    const response = await Ticket.paginateLookup(filter, options, body);
    return response;
  } catch (error) {
    console.error('Error in recentTickets:', error);
    throw error;
  }
};

const ticketCounts = async (reqBody = {}) => {
  try {
    const filter = { is_deleted: false };
    if (reqBody.companyId) {
      filter.company_id = ObjectId(reqBody.companyId);
    }
    // Aggregate all possible counts for dashboard
    const pipeline = [
      { $match: filter },
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
          ],
          priorityCounts: [
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $project: { priority: '$_id', count: 1, _id: 0 } },
          ],
          typeCounts: [{ $group: { _id: '$type', count: { $sum: 1 } } }, { $project: { type: '$_id', count: 1, _id: 0 } }],
          anonymousCounts: [
            { $group: { _id: '$anonymous', count: { $sum: 1 } } },
            { $project: { anonymous: '$_id', count: 1, _id: 0 } },
          ],
          assignedCounts: [
            {
              $group: {
                _id: { $cond: [{ $ifNull: ['$assignedToId', false] }, 'Assigned', 'Unassigned'] },
                count: { $sum: 1 },
              },
            },
            { $project: { assignment: '$_id', count: 1, _id: 0 } },
          ],
          totalCount: [{ $count: 'count' }],
          completedToday: [
            { $match: { status: 'Completed', updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
            { $count: 'count' },
          ],
          newToday: [
            { $match: { status: 'New', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
            { $count: 'count' },
          ],
          ongoingToday: [
            { $match: { status: 'Ongoing', updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
            { $count: 'count' },
          ],
        },
      },
    ];
    const result = await Ticket.aggregate(pipeline);
    // Flatten single-item arrays for easier consumption
    const flatten = (arr) => (Array.isArray(arr) && arr.length === 1 ? arr[0] : arr);
    return {
      statusCounts: result[0].statusCounts,
      priorityCounts: result[0].priorityCounts,
      typeCounts: result[0].typeCounts,
      anonymousCounts: result[0].anonymousCounts,
      assignedCounts: result[0].assignedCounts,
      totalCount: flatten(result[0].totalCount)?.count || 0,
      completedToday: flatten(result[0].completedToday)?.count || 0,
      newToday: flatten(result[0].newToday)?.count || 0,
      ongoingToday: flatten(result[0].ongoingToday)?.count || 0,
    };
  } catch (error) {
    console.error('Error in ticketCounts:', error);
    throw error;
  }
};

const statsCard = async (reqBody) => {
  try {
    const userStages = ['active', 'onboarding', 'new visa process'];
    const companyFilter = reqBody.company_id ? { company_id: ObjectId(reqBody.company_id) } : {};
    // Users count
    const usersFilter = {
      is_deleted: false,
      ...companyFilter,
      user_status: { $in: userStages },
    };
    const usersCount = await Users.countDocuments(usersFilter);
    const leadsCount = await Leads.countDocuments({ is_deleted: false, ...companyFilter });

    // Onboardings count: count each onboarding only once if in progress in any stage, plus withdrawn and unsuccessful
    // 1. Get all onboarding IDs in progress in any stage
    let onboardingIdsInProgress = await Onboardings.aggregate([
      { $match: { is_deleted: false, ...companyFilter } },
      { $unwind: '$processes' },
      { $match: { 'processes.process_status': 'progress' } },
      { $group: { _id: '$_id' } },
    ]);
    const inProgressIds = onboardingIdsInProgress.map((o) => o._id.toString());
    const onboardingInProgressCount = inProgressIds.length;

    // 2. Count Withdrawn/Unsuccessful
    let withdrawCount = await Onboardings.countDocuments({ is_deleted: false, ...companyFilter, status: 'Withdraw' });
    let unsuccessfulCount = await Onboardings.countDocuments({
      is_deleted: false,
      ...companyFilter,
      status: 'unsuccessful',
    });

    // 3. Total onboardings as per getOnboardingStatusCount
    const onboardingsCount = onboardingInProgressCount + withdrawCount + unsuccessfulCount;

    // Helper for aggregation count (unchanged)
    const aggregateCount = async (Model) => {
      const pipeline = [
        { $match: { is_deleted: false, ...companyFilter } },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        { $match: { 'userDetails.user_status': { $in: userStages } } },
        { $count: 'count' },
      ];
      const result = await Model.aggregate(pipeline);
      return result[0]?.count || 0;
    };
    // Get counts for each model except Ticket
    const [renewalsCount, offboardingsCount, visaProcessCount] = await Promise.all([
      aggregateCount(Renewals),
      aggregateCount(Offboardings),
      aggregateCount(VisaProcess),
    ]);
    // Tickets count (no user_status filter)
    const ticketsCount = await Ticket.countDocuments({ is_deleted: false, ...companyFilter });
    return {
      users: usersCount,
      onboardings: onboardingsCount,
      renewals: renewalsCount,
      offboardings: offboardingsCount,
      visaProcesses: visaProcessCount,
      tickets: ticketsCount,
      leads: leadsCount,
    };
  } catch (error) {
    throw error;
  }
};
const getClientStatsWorking = async () => {
  try {
    // 1. User stats
    const industryCounts = await Companies.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$business_industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const userStatusCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$user_status', count: { $sum: 1 } } },
    ]);

    const employmentTypeCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$employment.employment_type', count: { $sum: 1 } } },
    ]);

    const visaSponsorTypeCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$employment.visa_sponsor_type', count: { $sum: 1 } } },
    ]);

    const nationalityCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$personal.nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 2. Company stats
    const companyStatusCounts = await Companies.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const activeClients = await Companies.countDocuments({ is_deleted: false, status: 'active' });
    const inactiveClients = await Companies.countDocuments({ is_deleted: false, status: { $ne: 'active' } });

    const employeesPerClient = await Users.aggregate([
      { $match: { is_deleted: false } },
      {
        $group: {
          _id: { company_id: '$company_id', user_status: '$user_status' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id.company_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          company_name: '$companyDetails.company_name',
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          company_name: 1,
        },
      },
    ]);

    const topIndustries = industryCounts.filter((i) => i._id).slice(0, 10);
    const topCountries = nationalityCounts.filter((n) => n._id).slice(0, 10);

    // 🔥 Highest Paying Client by combined serviceFee + total user salaries
    const highestPayingClientAgg = await Companies.aggregate([
      { $match: { is_deleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'company_id',
          as: 'userDetails',
        },
      },
      {
        $addFields: {
          serviceFee: {
            $cond: [
              { $isArray: ['$monthly_costs.Nathan & Nathan Service Fee'] },
              { $arrayElemAt: ['$monthly_costs.Nathan & Nathan Service Fee', 0] },
              '$monthly_costs.Nathan & Nathan Service Fee',
            ],
          },
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          company_name: { $first: '$company_name' },
          serviceFee: { $first: '$serviceFee' },
          totalUserSalary: {
            $sum: {
              $ifNull: ['$userDetails.salary.total_fixed', 0],
            },
          },
        },
      },
      {
        $addFields: {
          numericServiceFee: {
            $convert: {
              input: '$serviceFee',
              to: 'double',
              onError: 0,
              onNull: 0,
            },
          },
          numericUserSalary: {
            $convert: {
              input: '$totalUserSalary',
              to: 'double',
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $addFields: {
          totalCost: { $add: ['$numericServiceFee', '$numericUserSalary'] },
        },
      },
      { $sort: { totalCost: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          company_name: 1,
          serviceFee: '$numericServiceFee',
          totalUserSalary: '$numericUserSalary',
          totalCost: 1,
        },
      },
    ]);

    const topIndustry =
      industryCounts.find(
        (i) => i._id && i.count === Math.max(...industryCounts.filter((x) => x._id).map((x) => x.count))
      ) || null;

    return {
      industryCounts,
      userStatusCounts,
      employmentTypeCounts,
      visaSponsorTypeCounts,
      nationalityCounts,
      companyStatusCounts,
      activeClients,
      inactiveClients,
      employeesPerClient,
      topIndustries,
      topCountries,
      highestPayingClient: highestPayingClientAgg[0] || null,
      topIndustry,
    };
  } catch (error) {
    throw new Error(`Failed to get client stats: ${error.message}`);
  }
};

const getClientStats = async () => {
  try {
    // 1. User stats
    const industryCounts = await Companies.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$business_industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const userStatusCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$user_status', count: { $sum: 1 } } },
    ]);

    const employmentTypeCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$employment.employment_type', count: { $sum: 1 } } },
    ]);

    const visaSponsorTypeCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$employment.visa_sponsor_type', count: { $sum: 1 } } },
    ]);

    const nationalityCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$personal.nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 2. Company stats
    const companyStatusCounts = await Companies.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const activeClients = await Companies.countDocuments({ is_deleted: false, status: 'active' });
    const inactiveClients = await Companies.countDocuments({ is_deleted: false, status: { $ne: 'active' } });

    const employeesPerClient = await Users.aggregate([
      { $match: { is_deleted: false } },
      {
        $group: {
          _id: { company_id: '$company_id', user_status: '$user_status' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id.company_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          company_name: '$companyDetails.company_name',
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          company_name: 1,
        },
      },
    ]);

    const topIndustries = industryCounts.filter((i) => i._id).slice(0, 10);
    const topCountries = nationalityCounts.filter((n) => n._id).slice(0, 10);

    // 🔥 Highest Paying Client by combined serviceFee + total user salaries
    const highestPayingClientAgg = await Companies.aggregate([
      { $match: { is_deleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'company_id',
          as: 'userDetails',
        },
      },
      {
        $addFields: {
          serviceFee: {
            $cond: [
              { $isArray: ['$monthly_costs.Nathan & Nathan Service Fee'] },
              { $arrayElemAt: ['$monthly_costs.Nathan & Nathan Service Fee', 0] },
              '$monthly_costs.Nathan & Nathan Service Fee',
            ],
          },
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          company_name: { $first: '$company_name' },
          serviceFee: { $first: '$serviceFee' },
          totalUserSalary: {
            $sum: {
              $ifNull: ['$userDetails.salary.total_fixed', 0],
            },
          },
          employeeCount: { $sum: 1 }, // ✅ Count employees
        },
      },
      {
        $addFields: {
          numericServiceFee: {
            $convert: {
              input: '$serviceFee',
              to: 'double',
              onError: 0,
              onNull: 0,
            },
          },
          numericUserSalary: {
            $convert: {
              input: '$totalUserSalary',
              to: 'double',
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $addFields: {
          totalCost: { $add: ['$numericServiceFee', '$numericUserSalary'] },
        },
      },
      { $sort: { totalCost: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          company_name: 1,
          serviceFee: '$numericServiceFee',
          totalUserSalary: '$numericUserSalary',
          totalCost: 1,
          employeeCount: 1, // ✅ Include employee count
        },
      },
    ]);

    const topIndustry =
      industryCounts.find(
        (i) => i._id && i.count === Math.max(...industryCounts.filter((x) => x._id).map((x) => x.count))
      ) || null;

    return {
      industryCounts,
      userStatusCounts,
      employmentTypeCounts,
      visaSponsorTypeCounts,
      nationalityCounts,
      companyStatusCounts,
      activeClients,
      inactiveClients,
      employeesPerClient,
      topIndustries,
      topCountries,
      highestPayingClient: highestPayingClientAgg[0] || null,
      topIndustry,
    };
  } catch (error) {
    throw new Error(`Failed to get client stats: ${error.message}`);
  }
};

const getClientStatsworking = async () => {
  try {
    // 1. User stats
    // Business Industry count
    const industryCounts = await Companies.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$business_industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // User status counts
    const userStatusCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$user_status', count: { $sum: 1 } } },
    ]);
    // Employment type counts
    const employmentTypeCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$employment.employment_type', count: { $sum: 1 } } },
    ]);
    // Visa sponsor type counts
    const visaSponsorTypeCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$employment.visa_sponsor_type', count: { $sum: 1 } } },
    ]);
    // Nationality counts
    const nationalityCounts = await Users.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$personal.nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 2. Company stats
    // Company status counts
    const companyStatusCounts = await Companies.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    // Active/Inactive clients
    const activeClients = await Companies.countDocuments({ is_deleted: false, status: 'active' });
    const inactiveClients = await Companies.countDocuments({ is_deleted: false, status: { $ne: 'active' } });
    // With each client, how many employees placed (active/inactive)
    const employeesPerClient = await Users.aggregate([
      { $match: { is_deleted: false } },
      {
        $group: {
          _id: { company_id: '$company_id', user_status: '$user_status' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id.company_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          company_name: '$companyDetails.company_name',
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          company_name: 1,
        },
      },
    ]);
    // Top 10 industries (by user count)
    const topIndustries = industryCounts.filter((i) => i._id).slice(0, 10);
    // Top 10 countries (by user nationality)
    const topCountries = nationalityCounts.filter((n) => n._id).slice(0, 10);

    // Highest paying client by service fee
    const highestPayingClient = await Companies.aggregate([
      { $match: { is_deleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'company_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          serviceFee: {
            $cond: [
              { $isArray: ['$monthly_costs.Nathan & Nathan Service Fee'] },
              { $arrayElemAt: ['$monthly_costs.Nathan & Nathan Service Fee', 0] },
              '$monthly_costs.Nathan & Nathan Service Fee',
            ],
          },
        },
      },
      { $sort: { serviceFee: -1 } },
      { $limit: 1 },
      { $project: { company_name: 1, serviceFee: 1 } },
    ]);

    // Top industry (industry with highest number of users)
    const topIndustry =
      industryCounts.find(
        (i) => i._id && i.count === Math.max(...industryCounts.filter((x) => x._id).map((x) => x.count))
      ) || null;

    return {
      industryCounts,
      userStatusCounts,
      employmentTypeCounts,
      visaSponsorTypeCounts,
      nationalityCounts,
      companyStatusCounts,
      activeClients,
      inactiveClients,
      employeesPerClient,
      topIndustries,
      topCountries,
      highestPayingClient: highestPayingClient[0] || null,
      topIndustry, // add this to the returned object
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  statsCard,
  recentOnboardings,
  recentRenewals,
  fetchRecentVisaProcesses,
  recentOffboardings,
  recentTickets,
  ticketCounts,
  getClientStats,
  fetchClientTasks,
};
