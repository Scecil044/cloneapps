const { toLower } = require('lodash');
const {
  Leads,
  Onboardings,
  VisaProcess,
  Renewals,
  Offboardings,
  Companies,
  Users,
  UserBackUp,
  VisaprocessBackup,
  OffboardingBackUp,
  OnboardingsBackUp,
  Notification,
  Documents,
  DocumentTypes
} = require('../models');
const { ObjectId } = require('mongodb');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const queryService = require('./query.service');
const { Processes } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const awsService = require('./aws.service');
// const { Users } = require('../models');
const { DocumentTemplatesClone, DocumentTemplate, Configurations, Invoice } = require('../models');
const { sendNotification } = require('../controllers/notifications');
const emailTemplateService = require('./email_template.service');
const offboardingService = require('./offboardings.service');
const documentTemplateService = require('./document_template.service');
const documentTemplateCloneService = require('./document_template_clone.service');
const activityService = require('./activities.service');
const invoiceLogService = require('./invoice_logs.service');
const { sendRawEmail } = require('../middlewares/email');
const fs = require('fs');
const excelJs = require('exceljs');
const { updateChangeOfStatus } = require('../helpers/insurance_agents.helper');

function getConfig() {
  return require('../config/config');
}

const approveInvoice = async (reqBody, req) => {
  try {
    var today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const invoiceStatus = today > reqBody.dueDate ? 'Overdue' : 'Due';
    const UpdateInvoice = await Invoice.findOneAndUpdate(
      { _id: reqBody._id },
      { $set: { status: invoiceStatus, updatedBy: req.userId } }
    );

    const invoiceLogBody = {
      user_id: req.userId,
      document_id: reqBody._id,
      module: 'invoice',
      createdOrUpdateData: reqBody,
      logMessage: `${req?.userName} Approved(changed) Invoice status for invoice - ${UpdateInvoice?.invoice_number} from new to ${invoiceStatus}`
    };
    const addInvoiceLog = await invoiceLogService.createInvoiceLog(invoiceLogBody);
    return UpdateInvoice;
  } catch (error) {
    throw error;
  }
};
/**
 * Function to handle system notifications for critical steps requiring employee's attention
 * Note that the function triggers both web pusher notifications and firebase notifications
 */
async function notifications(type, subType, processDoc, approver, applicant, CurrentModule) {
  try {
    console.log('--------------->sending notification for generic process move forward---------------------->');
    let notification = {
      user_id: [String(applicant)],
      read_by: [],
      notification_type: 'Process Approval',
      notification_text: `The next stage on onboarding process requires your intervention. Please check your account to append your signature or upload the required document(s)`,
      created_by: approver,
      url: '',
      createdDate: new Date(),
      type: {
        type: 'Process Flow',
        _id: processDoc?._id?.toString(),
        status: processDoc.status
      },
      flashNotifications: [
        {
          title: 'Process Approval',
          text: `The next stage on ${CurrentModule} process requires your intervention. Please check your account to append your signature or upload the required document(s)`,
          module: CurrentModule
        }
      ]
    };
    const notify = new Notification(notification);
    const savedNotification = await notify.save();
    // web push notification
    await sendNotification();
    return {
      notificationId: savedNotification._id,
      flashNotificationId: savedNotification.flashNotifications[0]._id
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

const updateFlashNotificationStatus = async (notificationId, flashNotificationId) => {
  try {
    console.log(
      '------------------->Runnung condition to update flash notification status------------------------------------------------>'
    );
    await Notification.updateOne(
      {
        _id: ObjectId(notificationId),
        'flashNotifications._id': ObjectId(flashNotificationId)
      },
      {
        $set: {
          'flashNotifications.$.isRead': true
        }
      }
    );
  } catch (error) {
    console.log('Error updating flash notification status:', error);
  }
};

const searchLeadsOnboardingVisProcessOffboardingsRenewalRequest = async (query, reqBody) => {
  try {
    let result;
    const searchTerm = query.search || reqBody.search || '';
    const searchRegex = new RegExp(searchTerm, 'i');
    let filter = {
      is_deleted: false
    };
    let body = [
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'userDetails.user_status': { $nin: ['inactive', 'withdrawn'] }
        }
      },
      {
        $addFields: {
          userAssignedSupportAgent: '$userDetails.assigned_support_agent'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userAssignedSupportAgent',
          foreignField: '_id',
          as: 'supportAgentDetails'
        }
      },
      {
        $unwind: {
          path: '$supportAgentDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'onboardings',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'onboardingDetails'
        }
      },
      {
        $project: {
          _id: 1,
          exit_reason: 1,
          status: 1,
          createdAt: 1,
          user_id: 1,
          company_id: 1,
          process_type: 1,
          processes: 1,
          companyDetails: 1,
          company_name: '$companyDetails.company_name',
          company_logo: '$companyDetails.logo',
          first_name: '$userDetails.first_name',
          middle_name: '$userDetails.middle_name',
          last_name: '$userDetails.last_name',
          designation: '$userDetails.designation',
          work_location: '$userDetails.employment.work_location',
          employment_type: '$userDetails.employment.employment_type',
          visa_sponsor_type: '$userDetails.employment.visa_sponsor_type',
          user_status: '$userDetails.user_status',
          employment: '$userDetails.employment',
          user_location: {
            $cond: {
              if: { $ne: [{ $size: '$onboardingDetails' }, 0] },
              then: { $arrayElemAt: ['$onboardingDetails.user_location', 0] },
              else: ''
            }
          },
          user_image_url: {
            $cond: {
              if: { $gt: ['$userDetails.image_url', null] },
              then: '$userDetails.image_url',
              else: ''
            }
          },
          is_unsuccessful: 1,
          reason_for_unsuccessful: {
            $ifNull: ['$reason_for_unsuccessful', '']
          },
          inquiry_date: {
            $ifNull: ['$inquiry_date', '']
          },
          user_name: {
            $concat: [
              '$userDetails.first_name',
              {
                $cond: {
                  if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                  then: '',
                  else: { $concat: [' ', '$userDetails.middle_name'] }
                }
              },
              {
                $cond: {
                  if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                  then: '',
                  else: { $concat: [' ', '$userDetails.last_name'] }
                }
              }
            ]
          },
          support_agent: {
            $cond: {
              if: { $ne: ['$supportAgentDetails', null] },
              then: {
                $concat: [
                  { $ifNull: ['$supportAgentDetails.first_name', ''] },
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ['$supportAgentDetails.middle_name', null] },
                          { $ne: ['$supportAgentDetails.middle_name', ''] }
                        ]
                      },
                      then: { $concat: [' ', '$supportAgentDetails.middle_name'] },
                      else: ''
                    }
                  },
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ['$supportAgentDetails.last_name', null] },
                          { $ne: ['$supportAgentDetails.last_name', ''] }
                        ]
                      },
                      then: { $concat: [' ', '$supportAgentDetails.last_name'] },
                      else: ''
                    }
                  }
                ]
              },
              else: 'No Support Agent Assigned'
            }
          },
          work_permit_number: 1,
          mol_wps_number: 1,
          visa_application_platform: 1,
          // Lead scoring fields
          timeline_to_hire: 1,
          engagement_level: 1,
          decision_maker_involvement: 1,
          lead_details: 1
        }
      }
    ];

    // Add search filter only if search term is provided
    if (searchTerm && searchTerm.trim() !== '') {
      body.push({
        $match: {
          $or: [
            { company_name: searchRegex },
            { status: searchRegex },
            { user_name: searchRegex },
            { first_name: searchRegex },
            { middle_name: searchRegex },
            { last_name: searchRegex },
            { designation: searchRegex },
            { employment_type: searchRegex }
          ]
        }
      });
    }
    if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
      const endDate = new Date(reqBody.end_date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
    }
    if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
      if (Array.isArray(reqBody.status)) {
        // Map "Withdraw" to both "Withdraw" and "unsuccessful" for proper filtering
        const mappedStatuses = reqBody.status.flatMap(status => {
          if (status.toLowerCase() === 'withdraw') {
            return ['Withdraw', 'unsuccessful'];
          }
          return [status];
        });
        // Create case-insensitive regex patterns for each status
        const statusRegex = mappedStatuses.map(status => new RegExp(`^${status}$`, 'i'));
        filter.status = { $in: statusRegex };
      } else {
        // Handle single status - map "Withdraw" to both "Withdraw" and "unsuccessful"
        if (reqBody.status.toLowerCase() === 'withdraw') {
          filter.status = { $in: [new RegExp(`^Withdraw$`, 'i'), new RegExp(`^unsuccessful$`, 'i')] };
        } else {
          filter.status = new RegExp(`^${reqBody.status}$`, 'i');
        }
      }
    }
    if (Array.isArray(reqBody.selected_company_id) && reqBody.selected_company_id.length > 0) {
      body.unshift(...queryService(reqBody));
    }
    if (Array.isArray(reqBody.user_id) && reqBody.user_id.length > 0) {
      const selectedUsers = reqBody.user_id.map(user => ObjectId(user));
      body.unshift({
        $match: {
          user_id: { $in: selectedUsers }
        }
      });
    }
    if (Array.isArray(reqBody.selected_pro) && reqBody.selected_pro.length > 0) {
      const proIds = reqBody.selected_pro.map(pro => ObjectId(pro));
      body.unshift({
        $match: {
          assigned_pro: { $in: proIds }
        }
      });
    }
    let options = {
      limit: query.limit,
      page: query.page,
      sortBy: query.sortBy
    };
    console.log(reqBody.module);
    switch (reqBody.module.toLowerCase()) {
      case 'leads':
        const status = reqBody.status?.toLowerCase();
        if (status === 'unsuccessful') {
          filter.is_unsuccessful = true;
          filter.status = { $in: ['Unsuccessful', 'unsuccessful'] };
        }
        result = await Leads.paginateLookup(filter, options, body);
        break;
      case 'onboarding':
        result = await Onboardings.paginateLookup(filter, options, body);
        console.log(result?.results?.length, 'length of results');
        break;
      case 'visa process':
        filter.process_type = 'new visa process';
        body.unshift({
          $match: {
            'userDetails.user_status': { $nin: ['offboarding'] }
          }
        });
        result = await VisaProcess.paginateLookup(filter, options, body);
        break;
      case 'visa renewal process':
        filter.process_type = 'visa renewal';
        body.unshift({
          $match: {
            'userDetails.user_status': { $nin: ['offboarding'] }
          }
        });
        result = await VisaProcess.paginateLookup(filter, options, body);
        break;
      case 'visa cancellation':
        filter.process_type = 'visa cancellation';
        body.unshift({
          $match: {
            'userDetails.user_status': { $nin: ['offboarding'] }
          }
        });
        result = await VisaProcess.paginateLookup(filter, options, body);
        break;
      case 'renewal request':
        body.unshift({
          $match: {
            'userDetails.user_status': { $nin: ['offboarding'] }
          }
        });
        result = await Renewals.paginateLookup(filter, options, body);
        break;
      case 'offboarding':
        result = await Offboardings.paginateLookup(filter, options, body);
        break;
    }
    result.results = result.results
      .filter(a => a.user_status !== 'inactive')
      .map(item => ({
        ...item,
        processes: item.processes.map(process => ({
          ...process,
          comments: process.comments?.filter(comment => comment.is_deleted === false)
        }))
      }));
    //  if (result.results.length > 0) {
    //     console.log("first length found");

    //     for (let i = 0; i < result.results.length; i++) {
    //       console.log(
    //         `Checking result ${i}: ID ${result.results[i]._id}, Processes count: ${result.results[i].processes.length}`
    //       );

    //       if (result.results[i].processes.length > 0) {
    //         for (let j = 0; j < result.results[i].processes.length; j++) {
    //           console.log(
    //             `  Checking process ${j}: ID ${result.results[i].processes[j]._id}, Actions count: ${result.results[i].processes[j].actions.length}`
    //           );

    //           if (result.results[i].processes[j].actions.length > 0) {
    //             for (let k = 0; k < result.results[i].processes[j].actions.length; k++) {
    //               console.log(
    //                 `    Checking action ${k}: ID ${result.results[i].processes[j].actions[k]._id}`
    //               );

    //               if (
    //                 result.results[i].processes[j].actions[k].documents_required &&
    //                 result.results[i].processes[j].actions[k].documents_required.length > 0
    //               ) {
    //                 console.log(
    //                   `    Condition met -------------------> Action ${k} has ${result.results[i].processes[j].actions[k].documents_required.length} document(s) required`
    //                 );

    //                 let documentTypeIds = result.results[i].processes[j].actions[k].documents_required.map(
    //                   (id) => (ObjectId.isValid(id) ? ObjectId(id) : id)
    //                 );

    //                 console.log(`    Document Type IDs:`, documentTypeIds);

    //                 try {
    //                   const documents = await Documents.find({
    //                     type: { $in: documentTypeIds },
    //                     foreign_id: ObjectId(result.results[i]._id),
    //                     is_deleted: false,
    //                   });

    //                   console.log(
    //                     `    Found ${documents.length} documents for action ${k}`
    //                   );

    //                   result.results[i].processes[j].actions[k].documents = documents;
    //                 } catch (error) {
    //                   console.error(
    //                     `    Error fetching documents for action ${k}:`,
    //                     error
    //                   );
    //                 }
    //               } else {
    //                 console.log(
    //                   `    Skipping action ${k} as it has no required documents`
    //                 );
    //               }
    //             }
    //           } else {
    //             console.log(`  Skipping process ${j} as it has no actions`);
    //           }
    //         }
    //       } else {
    //         console.log(`Skipping result ${i} as it has no processes`);
    //       }
    //     }
    //   } else {
    //     console.log("No results found after filtering");
    //   }
    return result;
  } catch (error) {
    console.log('search Error: ', error.message);
    throw error;
  }
};

const filterLeadsOnboardingVisProcessOffboardingsRenewalRequest = async (query, reqBody) => {
  var year = moment().year();
  let result;
  let filter = {
    is_deleted: false
  };
  let cancelbody = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $match: {
        'userDetails.user_status': { $nin: ['inactive', 'withdrawn'] }
      }
    },
    {
      $lookup: {
        from: 'offboardings',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'onboardingDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$onboardingDetails'
    },
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        user_id: 1,
        company_id: 1,
        process_type: 1,
        assigned_pro: 1,
        Process_first: { $first: '$processes' },
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        last_name: '$userDetails.last_name',
        work_location: '$userDetails.employment.work_location',
        employment_type: '$userDetails.employment.employment_type',
        visa_sponsor_type: '$userDetails.employment.visa_sponsor_type',
        user_location: '$onboardingDetails.user_location',
        Process_first: { $first: '$processes' },
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        user_status: '$userDetails.user_status',
        last_name: '$userDetails.last_name',
        work_location: '$userDetails.employment.work_location',
        employment: '$userDetails.employment',
        user_location: '$onboardingDetails.user_location',
        user_image_url: {
          $cond: {
            if: { $gt: ['$userDetails.image_url', null] },
            then: '$userDetails.image_url',
            else: ''
          }
        },
        is_unsuccessful: 1,
        user_name: {
          $concat: [
            '$userDetails.first_name',
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.middle_name'] }
              }
            },
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.last_name'] }
              }
            }
          ]
        },
        work_permit_number: 1,
        mol_wps_number: 1,
        visa_application_platform: 1,
        // Lead scoring fields
        timeline_to_hire: 1,
        engagement_level: 1,
        decision_maker_involvement: 1,
        lead_details: 1
      }
    }
  ];
  let body = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'onboardingDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$onboardingDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        user_id: 1,
        company_id: 1,
        process_type: 1,
        assigned_pro: 1,
        Process_first: { $first: '$processes' },
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        last_name: '$userDetails.last_name',
        user_status: '$userDetails.user_status',
        work_location: '$userDetails.employment.work_location',
        employment_type: '$userDetails.employment.employment_type',
        employment: '$userDetails.employment',
        user_location: '$onboardingDetails.user_location',
        user_image_url: {
          $cond: {
            if: { $gt: ['$userDetails.image_url', null] },
            then: '$userDetails.image_url',
            else: ''
          }
        },
        is_unsuccessful: 1,
        user_name: {
          $concat: [
            '$userDetails.first_name',
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.middle_name'] }
              }
            },
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.last_name'] }
              }
            }
          ]
        }
      }
    }
  ];
  if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    console.log('🔍 Filter Status Debug (filterLeadsOnboardingVisProcessOffboardingsRenewalRequest):', {
      originalStatus: reqBody.status,
      isArray: Array.isArray(reqBody.status),
      module: reqBody.module
    });

    if (Array.isArray(reqBody.status)) {
      // Map "Withdraw" to both "Withdraw" and "unsuccessful" for proper filtering
      const mappedStatuses = reqBody.status.flatMap(status => {
        if (status.toLowerCase() === 'withdraw') {
          console.log('🔄 Mapping Withdraw to [Withdraw, unsuccessful]');
          return ['Withdraw', 'unsuccessful'];
        }
        return [status];
      });
      // Create case-insensitive regex patterns for each status
      const statusRegex = mappedStatuses.map(status => new RegExp(`^${status}$`, 'i'));
      filter.status = { $in: statusRegex };
      console.log('✅ Final filter status:', filter.status);
    } else {
      // Handle single status - map "Withdraw" to both "Withdraw" and "unsuccessful"
      if (reqBody.status.toLowerCase() === 'withdraw') {
        console.log('🔄 Single Withdraw mapping to [Withdraw, unsuccessful]');
        filter.status = { $in: [new RegExp(`^Withdraw$`, 'i'), new RegExp(`^unsuccessful$`, 'i')] };
      } else {
        filter.status = new RegExp(`^${reqBody.status}$`, 'i');
      }
      console.log('✅ Final filter status:', filter.status);
    }
  }
  if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
  }
  if (reqBody.company_id && ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')) {
    if (Array.isArray(reqBody.company_id)) {
      let compID = reqBody.company_id.map(id => ObjectId(id));
      filter.company_id = { $in: compID };
    } else {
      filter.company_id = ObjectId(reqBody.company_id);
    }
  }
  if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
    if (Array.isArray(reqBody.user_id)) {
      let usrID = reqBody.user_id.map(id => ObjectId(id));
      filter.user_id = { $in: usrID };
    } else {
      filter.user_id = ObjectId(reqBody.user_id);
    }
  }

  // console.log("Hit Here")
  const condition =
    reqBody.module.toLowerCase() == 'new visa process' ||
    reqBody.module.toLowerCase() == 'visa renewal' ||
    reqBody.module.toLowerCase() == 'visa renewal';

  if (reqBody.filterStatus && reqBody.filterStatus.length > 0 && condition) {
    const filtering = {
      $addFields: {
        NewStatus: {
          $cond: {
            if: { $ne: [{ $toLower: '$Process_first.process_status' }, 'completed'] },
            then: 'New',
            else: {
              $cond: {
                if: { $eq: ['$status', 'completed'] },
                then: 'Completed',
                else: {
                  $cond: {
                    if: { $eq: ['$status', 'cancelled'] },
                    then: 'Cancelled',
                    else: 'In Progress'
                  }
                }
              }
            }
          }
        }
      }
    };
    body.push(filtering);
    cancelbody.push(filtering);

    const match = {
      $match: {
        NewStatus: { $in: reqBody.filterStatus }
      }
    };
    body.push(match);
    cancelbody.push(match);
  }

  if (reqBody.selectedPro && reqBody.selectedPro.length > 0 && condition) {
    let pro = {
      $match: {
        assigned_pro: { $in: reqBody.selectedPro }
      }
    };
    body.push(pro);
    cancelbody.push(pro);
  }

  /// Filter for Add Month
  if (reqBody.selectedMonth && reqBody.selectedMonth.length > 0 && condition) {
    let matchCurrentYear = {
      $match: {
        createdAt: {
          $gte: new Date(moment().startOf('year').format('YYYY-MM-DD')),
          $lte: new Date(moment().endOf('year').format('YYYY-MM-DD'))
        }
      }
    };

    body.push(matchCurrentYear);
    cancelbody.push(matchCurrentYear);

    let addFieldMonth = {
      $addFields: {
        month: { $month: '$createdAt' }
      }
    };
    body.push(addFieldMonth);
    cancelbody.push(addFieldMonth);

    let matchAddFields = {
      $match: {
        month: { $in: reqBody.selectedMonth }
      }
    };

    body.push(matchAddFields);
    cancelbody.push(matchAddFields);
  }

  // optionally filter by user id
  if (reqBody.user_id && reqBody.user_id.length > 0 && condition) {
    const matchUser = {
      $match: {
        user_id: ObjectId(reqBody.user_id)
      }
    };

    body.push(matchUser);
    console.log(body);
    cancelbody.push(matchUser);
  }
  let options = {
    limit: query.limit,
    page: query.page,
    sortBy: query.sortBy ? (query.sortBy.endsWith(':') ? `${query.sortBy}-1` : query.sortBy) : 'createdAt:-1'
  };

  switch (reqBody.module.toLowerCase()) {
    case 'leads':
      filter.is_unsuccessful = false;
      result = await Leads.paginateLookup(filter, options, body);
      break;
    case 'onboarding':
      result = await Onboardings.paginateLookup(filter, options, body);
      break;
    case 'new visa process':
      filter.process_type = 'new visa process';
      result = await VisaProcess.paginateLookup(filter, options, body);
      break;
    case 'visa renewal':
      filter.process_type = 'visa renewal';
      result = await VisaProcess.paginateLookup(filter, options, body);
      break;
    case 'visa cancellation':
      filter.process_type = 'visa cancellation';
      result = await VisaProcess.paginateLookup(filter, options, cancelbody);
      break;
    case 'renewal request':
      result = await Renewals.paginateLookup(filter, options, body);
      break;
    case 'offboarding':
      result = await Offboardings.paginateLookup(filter, options, body);
      break;
  }
  result.results = result.results.filter(a => a.user_status != 'inactive');
  return result;
};

const getAllDetailsProcessFlow = async reqBody => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(reqBody.id),
        is_deleted: false
      }
    },
    {
      $project: {
        _id: 1,
        processes: 1,
        status: 1,
        upfront_costs: 1,
        salary_payable: 1,
        leave_encashment: 1,
        gratuity: 1
      }
    }
  ];
  const model = require(`../models/${reqBody.module}.model`);

  let result = await model.aggregate(pipeline);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Data');
  }
  return result;
};

function logOffboardingProcessCreation(userId, offboarding) {
  const logMsg = `User ${userId} Created offboarding Process ${offboarding._id}`;
  return logMsg;
}
const processFlowMarkUnsuccessful = async (reqBody, req) => {
  const model = require(`../models/${reqBody.module}.model`);
  console.log('model starto', model, 'this is the model');
  let result = await model.findById({ _id: ObjectId(reqBody.id) });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to mark Unsuccessful');
  }
  /**
   * =================================================================================================================
   * Start offboarding creation process
   * This implementation should consequently create a new offboarding for the user
   *  =================================================================================================================
   */
  console.log('======================? starting new offboarding request---------------------------------------?');
  let docCloneIds = [];
  let employment_type = reqBody.employment_type;
  let processArray = [];

  if (employment_type == 'Employment Visa (2-Year)') {
    processArray = await Processes.find({ process_name: 'offboarding' });
  } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
    processArray = await Processes.find({ process_name: 'mission visa offboarding' });
  } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
    processArray = await Processes.find({ process_name: 'work permit offboarding' });
  }
  let offboardingBody = {
    user_id: reqBody.user_id,
    company_id: reqBody.company_id,
    process_type: reqBody.process_type,
    attachments: reqBody.attachments,
    comments: reqBody.comments,
    status: 'resignation received',
    last_working_day: reqBody.last_working_day,
    exit_reason: reqBody.exit_reason,
    salary_payable: reqBody.salary_payable,
    leave_encashment: reqBody.leave_encashment,
    gratuity: reqBody.gratuity,
    processes: []
  };

  for (const process of processArray[0].stages) {
    const updatedProcess = { ...process };
    updatedProcess.actions = [];

    for (const action of process.actions) {
      let updatedAction = { ...action };

      if (action.action_type === 'document') {
        const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
        if (document_template && document_template.auto_replace_keys) {
          const template = {
            ...document_template._doc, // ensure to use ._doc here
            auto_replace_keys: document_template.auto_replace_keys.map(replaceKey => ({
              ...replaceKey,
              fk_id: ''
            }))
          };
          let templateBody = {
            auto_replace_keys: template.auto_replace_keys,
            user_input_keys: template.user_input_keys,
            name: template.name,
            content: template.content,
            module: template.module
          };
          const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
            templateBody
          );
          updatedAction.template_id = create_document_template_clone._id;
          docCloneIds.push({ _id: create_document_template_clone._id });
        } else {
          console.warn(`Document template or auto_replace_keys not found for action: ${action._id}`);
        }
      }

      updatedProcess.actions.push(updatedAction);
    }

    offboardingBody.processes.push(updatedProcess);
  }
  const isUser = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  isUser.user_status = 'offboarding';
  if (reqBody.date_of_joining) {
    isUser.date_of_joining = reqBody.date_of_joining;
    isUser.employment.date_of_joining = reqBody.date_of_joining;
  }
  await isUser.save();

  // const updatedUser = await Users.findOneAndUpdate(
  //   { _id: ObjectId(reqBody.user_id) },
  //   { $set: { user_status: 'offboarding' } },
  //   { new: true }
  // );
  // console.log(updatedUser.user_status, 'this is the updated status now---------------->');
  const offboarding = await offboardingService.createOffboardings(offboardingBody);
  if (!offboarding) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Failed to initiate offboarding process. Exiting transaction-------->');
  }
  console.log(offboarding._id, 'this is the created offboarding process id');
  const logMessage = logOffboardingProcessCreation(req.userId, offboarding);
  await activityService.createActivity(req.userId, offboarding._id, 'offboarding', {}, offboarding, {}, logMessage);
  await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: offboarding._id } });
  /**
   * =================================================================================================================
   * End Offboarding creation process
   *  =================================================================================================================
   */
  const updateFields = {
    is_unsuccessful: true,
    reason_for_unsuccessful: reqBody.reason_for_unsuccessful,
    unsuccessful_on: moment.tz('UTC').tz('Asia/Dubai').format(),
    status: 'unsuccessful'
  };
  const response = await model.findOneAndUpdate({ _id: reqBody.id }, { $set: updateFields }, { new: true });
  // send ou email to admins notifying them about this action
  const templt = await emailTemplateService.getEmailTemplateByName({
    templateName: 'Renewal Request Rejected (New Offboarding Process)'
  });
  const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
    templt._id,
    response._id,
    { rejectionReason: reqBody.reason_for_unsuccessful },
    null
  );
  await sendRawEmail(replacedTemplate.to, replacedTemplate.subject, replacedTemplate.content, replacedTemplate.cc, []);
  return response;
};

const RejectApplication = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);

  let result = await model.findOne({ _id: ObjectId(reqBody.id) });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to mark Unsuccessful');
  }

  const updateFields = {
    is_unsuccessful: true,
    reason_for_unsuccessful: reqBody.reason_for_unsuccessful,
    unsuccessful_on: moment.tz('UTC').tz('Asia/Dubai').format(),
    status: 'unsuccessful'
  };

  // console.log("Hits here" , reqBody.module , result.user_id)
  if (reqBody.module == 'onboardings' || reqBody.module == 'renewals') {
    const user = await Users.findOneAndUpdate({ _id: result.user_id }, { $set: { user_status: 'withdrawn' } });
  }

  var VisaProcessDetails = await VisaProcess.findOne({ user_id: result.user_id, module: reqBody.module });
  if (VisaProcessDetails) {
    await VisaProcess.updateOne({ user_id: result.user_id, module: reqBody.module }, { $set: { is_deleted: true } });
  }

  return model.findOneAndUpdate({ _id: reqBody.id }, { $set: updateFields }, { new: true });
};

const processFlowMoveForwardWorking = async (reqBody, userId) => {
  try {
    const model = require(`../models/${reqBody.module}.model`);
    let moduleResult = await model.findById({ _id: ObjectId(reqBody.id) });

    if (!moduleResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
    }

    const filter_progress_process_status = {
      _id: ObjectId(reqBody.id),
      'processes.process_status': 'progress'
    };

    const docs = await model.find(filter_progress_process_status);
    let result = [];

    for (const doc of docs) {
      // First pass: Handle document attachments for the process with `process_status === 'progress'`
      for (const process of doc.processes) {
        if (process.process_status === 'progress') {
          console.log('Processing current process:', process.stage_name);
          if (process.actions && process.actions.length > 0) {
            let count = 0;
            for (const action of process.actions) {
              count += 1;
              console.log(count, '---------->checking documents for action---------->', action?.message);

              if (action.required_documents && action.required_documents.length > 0) {
                console.log(action.message, 'this is the action message');
                console.log(action.required_documents, '--------------------------> found documents to process');

                const documentTypeIds = action.required_documents.map(id => (ObjectId.isValid(id) ? ObjectId(id) : id));
                console.log('processing document type ids', documentTypeIds, 'print for document type ids ============>');

                const documents = await Documents.find({
                  type: { $in: documentTypeIds },
                  foreign_id: ObjectId(reqBody.id),
                  is_deleted: false
                });
                console.log('-------> here is documents ', documents, 'print for documents');

                if (!Array.isArray(process.attachments)) {
                  process.attachments = [];
                }

                for (const document of documents) {
                  if (document.url && !process.attachments.includes(document.url)) {
                    process.attachments.push(document.url);
                  }
                }
              }
            }
          }
        }
      }

      // Second pass: Handle process flow progression
      for (let index = 0; index < doc.processes.length; index++) {
        const process = doc.processes[index];

        // Updated Notification Logic
        if (
          process.assigned_users &&
          Array.isArray(process.assigned_users) &&
          process.assigned_users.includes('isEmployee') &&
          process.process_status === 'progress' &&
          !process.notificationId
        ) {
          const notificationIds = await notifications(
            'applicant',
            'approver',
            moduleResult,
            userId,
            moduleResult.user_id,
            reqBody.module
          );

          // Store notification IDs in the process for later reference
          if (notificationIds) {
            process.notificationId = notificationIds.notificationId;
            process.flashNotificationId = notificationIds.flashNotificationId;
          }
        }

        if (process.process_status === 'progress' && process.actions.length > 0) {
          let allActionsCompleted = true;

          for (const action of process.actions) {
            if (action.status === 'progress') {
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }
            if (action.status !== 'completed') {
              allActionsCompleted = false;
            }
          }

          if (allActionsCompleted && doc.processes.length === index + 1) {
            // Mark notifications as read if they exist for this process
            if (process.notificationId && process.flashNotificationId) {
              await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
            }

            process.process_status = 'completed';
            process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
            doc.status = 'completed';
            if (reqBody.module === 'leads') {
              await Companies.updateOne({ _id: ObjectId(moduleResult.company_id) }, { $set: { status: 'active' } });
            }
          }

          if (allActionsCompleted && doc.processes.length !== index + 1) {
            // Mark notifications as read if they exist for this process
            if (process.notificationId && process.flashNotificationId) {
              await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
            }

            process.process_status = 'completed';
            process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
            doc.processes[index + 1].process_status = 'progress';

            if (doc.processes[index + 1].actions.length > 0) {
              doc.processes[index + 1].actions[0].status = 'progress';
            }
          } else {
            for (const action of process.actions) {
              if (action.status === 'pending') {
                action.status = 'progress';
                break;
              }
            }
          }

          break;
        }

        if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
          // Mark notifications as read if they exist for this process
          if (process.notificationId && process.flashNotificationId) {
            await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
          }

          process.process_status = 'completed';
          doc.status = toLower(process.stage_name);
          process.actions = [
            {
              updated_by: userId,
              updated_date_time: moment.tz('UTC').tz('Asia/Dubai').format(),
              status: 'completed'
            }
          ];

          if (doc.processes.length !== index + 1) {
            doc.processes[index + 1].process_status = 'progress';

            if (doc.processes[index + 1].actions.length > 0) {
              doc.processes[index + 1].actions[0].status = 'progress';
            }
          }

          break;
        }
      }

      result = doc;

      // Update the model with the modified processes and status
      await model.updateOne({ _id: ObjectId(reqBody.id) }, { $set: { processes: doc.processes, status: doc.status } });
    }

    return result;
  } catch (error) {
    console.error('Error in processFlowMoveForward:', error);
    throw error;
  }
};
const processFlowMoveForward = async (reqBody, userId) => {
  try {
    const model = require(`../models/${reqBody.module}.model`);
    let moduleResult = await model.findById({ _id: ObjectId(reqBody.id) });

    if (!moduleResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
    }

    const filter_progress_process_status = {
      _id: ObjectId(reqBody.id),
      'processes.process_status': 'progress'
    };

    const docs = await model.find(filter_progress_process_status);
    let result = [];

    for (const doc of docs) {
      // First pass: Handle document attachments for the process with `process_status === 'progress'`
      for (const process of doc.processes) {
        if (process.process_status === 'progress') {
          console.log('Processing current process:', process.stage_name);
          if (process.actions && process.actions.length > 0) {
            let count = 0;
            for (const action of process.actions) {
              count += 1;
              console.log(count, '---------->checking documents for action---------->', action?.message);

              if (action.required_documents && action.required_documents.length > 0) {
                console.log(action.message, 'this is the action message');
                console.log(action.required_documents, '--------------------------> found documents to process');

                const documentTypeIds = action.required_documents.map(id => (ObjectId.isValid(id) ? ObjectId(id) : id));
                console.log('processing document type ids', documentTypeIds, 'print for document type ids ============>');

                const documents = await Documents.find({
                  type: { $in: documentTypeIds },
                  foreign_id: ObjectId(reqBody.id),
                  is_deleted: false
                });
                console.log('-------> here is documents ', documents, 'print for documents');

                if (!Array.isArray(process.attachments)) {
                  process.attachments = [];
                }

                for (const document of documents) {
                  if (document.url && !process.attachments.includes(document.url)) {
                    process.attachments.push(document.url);
                  }
                }
              }
            }
          }
        }
      }

      // Second pass: Handle process flow progression
      for (let index = 0; index < doc.processes.length; index++) {
        const process = doc.processes[index];

        // Updated Notification Logic
        if (
          process.assigned_users &&
          Array.isArray(process.assigned_users) &&
          process.assigned_users.includes('isEmployee') &&
          process.process_status === 'progress' &&
          !process.notificationId
        ) {
          const notificationIds = await notifications(
            'applicant',
            'approver',
            moduleResult,
            userId,
            moduleResult.user_id,
            reqBody.module
          );

          // Store notification IDs in the process for later reference
          if (notificationIds) {
            process.notificationId = notificationIds.notificationId;
            process.flashNotificationId = notificationIds.flashNotificationId;
          }
        }

        if (process.process_status === 'progress' && process.actions.length > 0) {
          let allActionsCompleted = true;

          for (const action of process.actions) {
            if (action.status === 'progress') {
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }
            if (action.status !== 'completed') {
              allActionsCompleted = false;
            }
          }

          if (allActionsCompleted && doc.processes.length === index + 1) {
            // Mark notifications as read if they exist for this process
            if (process.notificationId && process.flashNotificationId) {
              await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
            }

            process.process_status = 'completed';
            process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
            doc.status = 'completed';
            if (reqBody.module === 'leads') {
              await Companies.updateOne({ _id: ObjectId(moduleResult.company_id) }, { $set: { status: 'active' } });
            }
          }

          if (allActionsCompleted && doc.processes.length !== index + 1) {
            // Mark notifications as read if they exist for this process
            if (process.notificationId && process.flashNotificationId) {
              await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
            }

            process.process_status = 'completed';
            process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
            doc.processes[index + 1].process_status = 'progress';

            // Check if the next process being activated is "change of status"
            if (doc.processes[index + 1].stage_name === 'change of status') {
              console.log('========================> process initiation launched for insurance call');
            }

            if (doc.processes[index + 1].actions.length > 0) {
              doc.processes[index + 1].actions[0].status = 'progress';
            }
          } else {
            for (const action of process.actions) {
              if (action.status === 'pending') {
                action.status = 'progress';
                break;
              }
            }
          }

          break;
        }

        if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
          // Mark notifications as read if they exist for this process
          if (process.notificationId && process.flashNotificationId) {
            await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
          }

          process.process_status = 'completed';
          doc.status = toLower(process.stage_name);
          process.actions = [
            {
              updated_by: userId,
              updated_date_time: moment.tz('UTC').tz('Asia/Dubai').format(),
              status: 'completed'
            }
          ];

          if (doc.processes.length !== index + 1) {
            doc.processes[index + 1].process_status = 'progress';

            // Check if the next process being activated is "change of status"
            if (doc.processes[index + 1].stage_name === 'change of status') {
              console.log(
                '========================> process initiation launched for insurance call^^^^^^^^^^^^^^^^^^^^^^^^^^^^'
              );
              /**
               * ======================================================================================
               * Implementation for insurance portal
               * ======================================================================================
               */
              let userDoc = await Users.findOne({ _id: doc.user_id });
              if (!userDoc) {
                throw new ApiError('User not found.Exiting process for insurance');
              }
              if (userDoc.employment.visa_sponsor_type == 'Dynamic Employment Services') {
                if (
                  userDoc.employment.employment_type == 'Employment Visa (2-Year)' ||
                  userDoc.employment.employment_type == 'Work Permit (for UAE Resident visa holders)'
                ) {
                  let constructedBody = {
                    parent_company_id: getConfig().parentCompanyIds.dynamicEmploymentServices,
                    change_date: new Date(),
                    user_id: doc.user_id
                  };
                  const insuranceResponse = await updateChangeOfStatus(constructedBody);
                  console.log('console after creating response on insurance  portal---------->');
                }
              }
            }

            if (doc.processes[index + 1].actions.length > 0) {
              doc.processes[index + 1].actions[0].status = 'progress';
            }
          }

          break;
        }
      }

      result = doc;

      // Update the model with the modified processes and status
      await model.updateOne({ _id: ObjectId(reqBody.id) }, { $set: { processes: doc.processes, status: doc.status } });
    }

    return result;
  } catch (error) {
    console.error('Error in processFlowMoveForward:', error);
    throw error;
  }
};

const processFlowMoveBackward = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);
  console.log(model, 'the model');
  console.log(ObjectId(reqBody.id), 'new id');

  const filter_progress_process_status = { _id: ObjectId(reqBody.id), 'processes.process_status': 'progress' };
  let result = [];
  await model
    .find(filter_progress_process_status)
    .then(docs => {
      console.log('the doc', docs);
      docs.forEach(async doc => {
        for (let index = doc.processes.length - 1; index >= 0; index--) {
          const process = doc.processes[index];
          if (process.process_status === 'progress' && process.actions.length > 0) {
            console.log('start here');
            let allActionsCompleted = true;
            for (let action_index = 0; action_index < process.actions.length; action_index++) {
              const action = process.actions[action_index];
              console.log(action);
              if (action.status === 'progress') {
                console.log('is progress');
                if (action_index == 0) {
                  action.status = 'pending';
                  process.process_status = 'pending';
                  doc.status = doc.processes[index - 1].stage_name;
                  doc.processes[index - 1].process_status = 'progress';
                  console.log(doc.processes[index - 1].actions.length - 1);
                  doc.processes[index - 1].actions[doc.processes[index - 1].actions.length - 1].status = 'progress';
                } else {
                  doc.processes[index].actions[action_index].status = 'pending';
                  doc.processes[index].actions[action_index - 1].status = 'progress';
                }
              }
            }
          }
        }

        // Update the root status based on processes
        let hasProgressProcess = false;
        let allProcessesCompleted = true;

        for (const process of doc.processes) {
          if (process.process_status === 'progress') {
            hasProgressProcess = true;
            doc.status = process.stage_name;
            break;
          }
          if (process.process_status !== 'completed') {
            allProcessesCompleted = false;
          }
        }

        if (!hasProgressProcess && allProcessesCompleted) {
          doc.status = 'completed';
        }

        result = doc.processes;
        console.log(result, 'the final result');
        const test = await model.findOne({ _id: ObjectId(reqBody.id) });
        console.log(test.status, 'this is the status');
        const updated_process = await model.updateOne(
          { _id: ObjectId(reqBody.id) },
          {
            $set: {
              processes: doc.processes,
              status: doc.status // Add status to the update
            }
          },
          { new: true }
        );
        console.log(doc.status, 'this is the updated process status');
      });
    })
    .catch(error => {
      console.log(error);
    });

  // Rest of your email notification code remains the same
  for (let stage of result) {
    const createEmploymentStage = result.find(item => item.stage_name === 'Create Employment contract');

    const employersApprovalStage = result.find(item => item.stage_name === "Employer's Approval");
    if (employersApprovalStage && createEmploymentStage) {
      if (createEmploymentStage.process_status === 'progress' && employersApprovalStage.process_status === 'pending') {
        // Trigger email notification to administrators
        const searchQuery = { templateName: 'Employment Contract Rejected' };
        const emailTemplt = await emailTemplateService.getEmailTemplateByName(searchQuery);
        if (emailTemplt) {
          const body = {
            rejectionReason: reqBody.rejectionReason
          };
          const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
            emailTemplt._id,
            reqBody.id,
            body,
            null,
            null
          );
          if (replacedTemplate) {
            await sendRawEmail(
              replacedTemplate.to,
              replacedTemplate.subject,
              replacedTemplate.content,
              replacedTemplate.cc,
              []
            );
          }
        }
        break; // Exit loop after sending email
      }
    }
  }
  return result;
};

const processFlowUpdate = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);
  // const updated_process = await model.updateOne({ "_id": ObjectId(reqBody.id) }, { $set: { processes: doc.processes } });
  return model;
};

const processActionDocument = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);
  let pipeline = {};
  pipeline[`processes.${reqBody.processIndex}.actions.${reqBody.actionIndex}.uploaded_document_id`] = reqBody.document_id;
  const updated_process = await model.updateOne({ _id: ObjectId(reqBody.id) }, { $set: pipeline });
  return updated_process;
};
const processActionGenerateDocument = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);
  let pipeline = {};
  pipeline[`processes.${reqBody.processIndex}.actions.${reqBody.actionIndex}.generated_document_id`] = reqBody.document_id;
  const updated_process = await model.updateOne({ _id: ObjectId(reqBody.id) }, { $set: pipeline });
  return updated_process;
};

const getModuleData = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);
  let moduleResult = await model.find(reqBody.filter, reqBody.project);

  if (!moduleResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  return moduleResult;
};

const updateModuleData = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);

  let moduleResult = await model.updateMany(reqBody.filter, { $set: reqBody.update });

  if (!moduleResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  return moduleResult;
};

const getInvoiceByProcessID = async reqBody => {
  const model = require(`../models/${reqBody.module}.model`);
  console.log(reqBody.identifier);
  let result = await model.aggregate([
    { $unwind: '$processes' },
    { $match: { _id: ObjectId(reqBody.id), 'processes._id': reqBody.identifier } },
    { $project: { invoice_id: '$processes.invoice_id' } }
  ]);
  let invoice_id = result[0].invoice_id;

  let moduleResult = await Invoice.findOne({ _id: ObjectId(invoice_id) }).select({
    invoice_number: 1,
    customer: 1,
    total: 1
  });
  if (!moduleResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  return moduleResult;
};

const getInvoiceDetails = async reqBody => {
  let relations = await Configurations.findOne({}).select({ module_relations: 1 });
  let baserelation = JSON.parse(JSON.stringify(relations));
  let moduleRelations = baserelation.module_relations.filter(a => {
    return a.module == reqBody.module && a.foreign_module == 'companies';
  })[0].foreign_key;
  console.log('===================> This is the result of module relations', moduleRelations, '------------------>');
  const model = require(`../models/${reqBody.module}.model`);
  console.log('===========>', model, 'this is the model--------------->');
  let aggragate = [
    { $match: { _id: ObjectId(reqBody.id) } },
    {
      $lookup: {
        from: 'companies',
        localField: moduleRelations,
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' }
  ];
  let invoiceResult = await model.aggregate(aggragate);
  var duedate = new Date();
  duedate.setDate(duedate.getDate() + 30);
  function add(accumulator, a) {
    return accumulator + parseFloat(a);
  }
  // reconstruct billing and shipping addresses
  const billingAddress =
    invoiceResult[0].customer.billing_address?.address_line1 +
    ' ' +
    invoiceResult[0].customer.billing_address?.address_line2 +
    ' ' +
    invoiceResult[0].customer.billing_address?.city +
    ' ' +
    invoiceResult[0].customer.billing_address?.state +
    ' ' +
    invoiceResult[0].customer.billing_address?.country;
  const shippingAddress =
    invoiceResult[0].customer.shipping_address?.address_line1 +
    ' ' +
    invoiceResult[0].customer.shipping_address?.address_line2 +
    ' ' +
    invoiceResult[0].customer.shipping_address?.city +
    ' ' +
    invoiceResult[0].customer.shipping_address?.state +
    ' ' +
    invoiceResult[0].customer.shipping_address?.country;
  var total_invoice_amount = reqBody.data.invoice.map(elem => elem.amount).reduce(add, 0);
  let invoiceObject = {
    customer: invoiceResult[0].customer._id,
    customer_name: invoiceResult[0].customer.company_name,
    customer_address: invoiceResult[0].customer.company_address,
    email: invoiceResult[0].customer.email,
    billing_address: billingAddress || invoiceResult[0].customer.company_address,
    shipping_address: shippingAddress || 'Dubai',
    terms: '644a5e16e60f06ccb37e9716',
    terms_name: 'Custom',
    invoice_date: new Date().toISOString().substring(0, 10),
    due_date: duedate.toISOString().substring(0, 10),
    sale_location: 'Dubai',
    sub_total: total_invoice_amount.toFixed(2),
    vat_total: ((5 / 100) * total_invoice_amount).toFixed(2),
    total: (parseFloat(total_invoice_amount) + (5 / 100) * total_invoice_amount).toFixed(2),
    customer_notes: '',
    terms_condition: '',
    is_recurring: false,
    is_draft: false,
    user_id: invoiceResult[0].user_id,
    items: []
  };
  const user = await Users.findOne({ _id: ObjectId(invoiceResult[0].user_id) });
  console.log(user.first_name, 'us the name of the user============================>');
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' }); // Get full month name
  const currentYear = currentDate.getFullYear(); // Get the full year

  const monthAndYear = `${currentMonth} ${currentYear}`;
  let service;
  switch (model) {
    case 'Onboardings':
      service = 'Onboarding Invoice';
      break;
    case 'offboardings':
      service = 'offboarding invoice';
      break;
    case 'renewals':
      service = 'Renewal invoice';
      break;
    default:
      console.log('unknown service for invoice');
  }
  let randomId;
  for (let index = 0; index < reqBody.data.invoice.length; index++) {
    const element = reqBody.data.invoice[index];
    randomId = new ObjectId();
    invoiceObject.items.push({
      id: randomId,
      service: service || 'System Invoice',
      service_name: element.text,
      description:
        `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name} - ${monthAndYear}` ||
        element.text,
      quantity: 1,
      rate: element.amount,
      amount: ((5 / 100) * parseFloat(element.amount) + parseFloat(element.amount)).toFixed(2),
      discount: 0,
      tax_name: 'INVAT',
      tax_code: '63c8f8f58e693f40f81c1c98',
      vat_rate: 0,
      vat_amount: ((5 / 100) * parseFloat(element.amount)).toFixed(2),
      net_total: element.text,
      type: 'Service',
      date: new Date().toISOString().substring(0, 10),
      isInventory: 'false',
      city: 'Dubai'
    });
  }
  if (!invoiceObject) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  return invoiceObject;
};

const updateProcess = async (reqBody, invoice_id) => {
  const model = require(`../models/${reqBody.module}.model`);
  console.log(reqBody.process_id);
  console.log(reqBody.id);
  const result = await model.updateMany(
    { _id: ObjectId(reqBody.id) },
    {
      $set: {
        'processes.$[abc].invoice_id': invoice_id
      }
    },
    {
      arrayFilters: [{ 'abc._id': reqBody.process_id }]
    }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  return result;
};

// const createVisaProcess = async (reqBody, userId) => {
//   // console.log('================================================= %%%%%%%%%%%% creating visa process %%%%%%%%%%%% ============================')
//   const model = require(`../models/${reqBody.module}.model`);
//   let moduleResult = await model.aggregate([
//     { $match: { _id: ObjectId(reqBody.id) } },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'user_id',
//         foreignField: '_id',
//         as: 'userDetails'
//       }
//     },
//     { $unwind: '$userDetails' }
//   ]);

//   let processArray = [];
//   if (reqBody.process_type == 'new visa process') {
//     let conditions = {};
//     if (moduleResult[0].userDetails.employment.employment_type == 'Work Permit (for UAE Resident visa holders)') {
//       console.log("employment types is work permit------------------------------> ")
//       conditions = {
//         employment_type: moduleResult[0].userDetails.employment.employment_type
//       };
//       console.log("added condition for work permit", conditions)
//     } else {
//       console.log("executing else condition for work permit")
//       conditions = {
//         employment_type: moduleResult[0].userDetails.employment.employment_type,
//         have_eid: moduleResult[0].have_eid,
//         visa_type: moduleResult[0].visa_type,
//         user_location: moduleResult[0].user_location
//       };
//     }
//     let match = {};
//     for (const [key, value] of Object.entries(conditions)) {
//       match[`conditions.` + key] = value;
//     }
//     processArray = await Processes.find(match);
//     /**
//      * ========================================================================================================
//      * Handle cases for employment visa and work permit employees
//      * If an employee's employment type is any of these, process array should be modified in this sense:
//      * Loss of Employment Insurance  should be moved to the second last step
//      * Labour Card and Contract  should be moved to last step
//      * ========================================================================================================
//      */
//     if (moduleResult[0].userDetails.employment.employment_type == 'Employment Visa (2-Year)' ||
//         moduleResult[0].userDetails.employment.employment_type == 'Work Permit (for UAE Resident visa holders)') {

//       if (processArray && processArray.length > 0 && processArray[0].stages) {
//         let newProcessArray = [];

//         let filteredArray = processArray[0].stages.filter(item => {
//           return item.stage_name.toLowerCase() !== 'loss of employment insurance' &&
//                  item.stage_name.toLowerCase() !== 'labour card and contract';
//         });

//         newProcessArray = [...filteredArray];
//         const lossOfEmploymentStage = processArray[0].stages.find(item =>
//           item.stage_name.toLowerCase() === 'loss of employment insurance'
//         );
//         const labourCardStage = processArray[0].stages.find(item =>
//           item.stage_name.toLowerCase() === 'labour card and contract'
//         );

//         if (lossOfEmploymentStage) {
//           newProcessArray.push(lossOfEmploymentStage);
//         }
//         if (labourCardStage) {
//           newProcessArray.push(labourCardStage);
//         }
//         processArray[0].stages = newProcessArray;
//       } else {
//         console.log("processArray is not properly structured or empty:", processArray);
//       }
//     }
//     /**
//      * ========================================================================================================
//      * End of condition to reverse the order of stages for employment visa and work permit employees
//      * ========================================================================================================
//      */
//   }
//   if (reqBody.process_type == 'visa cancellation') {
//     let employment_type = moduleResult[0].userDetails.employment.employment_type;
//     if (employment_type == 'Employment Visa (2-Year)') {
//       processArray = await Processes.find({ process_name: 'visa cancellation' });
//     } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
//       processArray = await Processes.find({ process_name: 'mission visa cancellation' });
//     } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
//       processArray = await Processes.find({ process_name: 'work permit cancellation' });
//     }
//   }
//   if (reqBody.process_type == 'visa renewal') {
//     let employment_type = moduleResult[0].userDetails.employment.employment_type;
//     if (employment_type == 'Employment Visa (2-Year)') {
//       processArray = await Processes.find({ process_name: 'visa renewal' });
//     } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
//       processArray = await Processes.find({ process_name: 'mission visa renewal' });
//     } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
//       processArray = await Processes.find({ process_name: 'work permit renewal' });
//     }
//   }
//   // console.log(processArray)
//   let visaProcessBody = {
//     user_id: moduleResult[0].user_id,
//     company_id: moduleResult[0].company_id,
//     process_type: reqBody.process_type,
//     status: processArray[0].stages[0].stage_name.toLowerCase(),
//     attachments: moduleResult[0].attachments,
//     comments: moduleResult[0].comments,
//     processes: processArray[0].stages,
//     created_by: userId,
//     foreign_id: ObjectId(reqBody.foreign_id),
//     identifier: reqBody.identifier,
//     module: reqBody.module,
//     assigned_pro: reqBody.assigned_pro
//   };

//   let newVisaProcess = await new VisaProcess(visaProcessBody).save();
//   if (reqBody.process_type == 'new visa process') {
//     console.log('updating user status to new visa process=====================>');
//     let user = await Users.findOne({ _id: ObjectId(moduleResult[0].user_id) });
//     user.user_status = 'new visa process';
//     await user.save();
//   }
//   const result = await model.updateOne(
//     { _id: ObjectId(reqBody.id) },
//     {
//       $set: {
//         'processes.$[abc].actions.$[e].visa_process_id': newVisaProcess.id
//       }
//     },
//     {
//       arrayFilters: [
//         {
//           'abc._id': reqBody.process_id
//         },
//         {
//           'e.action_type': 'visa process'
//         }
//       ]
//     }
//   );
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
//   }
//   return result;
// };
const createVisaProcess = async (reqBody, userId) => {
  // console.log('================================================= %%%%%%%%%%%% creating visa process %%%%%%%%%%%% ============================')
  const model = require(`../models/${reqBody.module}.model`);
  let moduleResult = await model.aggregate([
    { $match: { _id: ObjectId(reqBody.id) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' }
  ]);

  let processArray = [];
  if (reqBody.process_type == 'new visa process') {
    let conditions = {};
    if (moduleResult[0].userDetails.employment.employment_type == 'Work Permit (for UAE Resident visa holders)') {
      console.log('employment types is work permit------------------------------> ');
      conditions = {
        employment_type: moduleResult[0].userDetails.employment.employment_type
      };
      console.log('added condition for work permit', conditions);
    } else {
      console.log('executing else condition for work permit');
      conditions = {
        employment_type: moduleResult[0].userDetails.employment.employment_type,
        have_eid: moduleResult[0].have_eid,
        visa_type: moduleResult[0].visa_type,
        user_location: moduleResult[0].user_location
      };
    }
    let match = {};
    for (const [key, value] of Object.entries(conditions)) {
      match[`conditions.` + key] = value;
    }
    processArray = await Processes.find(match);
    /**
     * ========================================================================================================
     * Handle cases for employment visa and work permit employees
     * If an employee's employment type is any of these, process array should be modified in this sense:
     * Loss of Employment Insurance  should be moved to the second last step
     * Labour Card and Contract  should be moved to last step
     * ========================================================================================================
     */
    if (
      moduleResult[0].userDetails.employment.employment_type == 'Employment Visa (2-Year)' ||
      moduleResult[0].userDetails.employment.employment_type == 'Work Permit (for UAE Resident visa holders)'
    ) {
      if (processArray && processArray.length > 0 && processArray[0].stages) {
        let newProcessArray = [];

        let filteredArray = processArray[0].stages.filter(item => {
          return (
            item.stage_name.toLowerCase() !== 'loss of employment insurance' &&
            item.stage_name.toLowerCase() !== 'labour card and contract'
          );
        });

        newProcessArray = [...filteredArray];
        const lossOfEmploymentStage = processArray[0].stages.find(
          item => item.stage_name.toLowerCase() === 'loss of employment insurance'
        );
        const labourCardStage = processArray[0].stages.find(
          item => item.stage_name.toLowerCase() === 'labour card and contract'
        );

        if (lossOfEmploymentStage) {
          newProcessArray.push(lossOfEmploymentStage);
        }
        if (labourCardStage) {
          newProcessArray.push(labourCardStage);
        }
        processArray[0].stages = newProcessArray;
      } else {
        console.log('processArray is not properly structured or empty:', processArray);
      }
    }
    /**
     * ========================================================================================================
     * End of condition to reverse the order of stages for employment visa and work permit employees
     * ========================================================================================================
     */
  }
  if (reqBody.process_type == 'visa cancellation') {
    let employment_type = moduleResult[0].userDetails.employment.employment_type;
    if (employment_type == 'Employment Visa (2-Year)') {
      processArray = await Processes.find({ process_name: 'visa cancellation' });
    } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
      processArray = await Processes.find({ process_name: 'mission visa cancellation' });
    } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
      processArray = await Processes.find({ process_name: 'work permit cancellation' });
    }

    if (employment_type == 'Employment Visa (2-Year)' || employment_type == 'Work Permit (for UAE Resident visa holders)') {
      if (processArray && processArray.length > 0 && processArray[0].stages) {
        let newProcessArray = [];

        let filteredArray = processArray[0].stages.filter(item => {
          return (
            item.stage_name.toLowerCase() !== 'loss of employment insurance' &&
            item.stage_name.toLowerCase() !== 'labour card and contract'
          );
        });

        newProcessArray = [...filteredArray];
        const lossOfEmploymentStage = processArray[0].stages.find(
          item => item.stage_name.toLowerCase() === 'loss of employment insurance'
        );
        const labourCardStage = processArray[0].stages.find(
          item => item.stage_name.toLowerCase() === 'labour card and contract'
        );

        if (lossOfEmploymentStage) {
          newProcessArray.push(lossOfEmploymentStage);
        }
        if (labourCardStage) {
          newProcessArray.push(labourCardStage);
        }
        processArray[0].stages = newProcessArray;
      } else {
        console.log('processArray for visa cancellation is not properly structured or empty:', processArray);
      }
    }
  }
  if (reqBody.process_type == 'visa renewal') {
    let employment_type = moduleResult[0].userDetails.employment.employment_type;
    if (employment_type == 'Employment Visa (2-Year)') {
      processArray = await Processes.find({ process_name: 'visa renewal' });
    } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
      processArray = await Processes.find({ process_name: 'mission visa renewal' });
    } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
      processArray = await Processes.find({ process_name: 'work permit renewal' });
    }

    if (employment_type == 'Employment Visa (2-Year)' || employment_type == 'Work Permit (for UAE Resident visa holders)') {
      if (processArray && processArray.length > 0 && processArray[0].stages) {
        let newProcessArray = [];

        let filteredArray = processArray[0].stages.filter(item => {
          return (
            item.stage_name.toLowerCase() !== 'loss of employment insurance' &&
            item.stage_name.toLowerCase() !== 'labour card and contract'
          );
        });

        newProcessArray = [...filteredArray];
        const lossOfEmploymentStage = processArray[0].stages.find(
          item => item.stage_name.toLowerCase() === 'loss of employment insurance'
        );
        const labourCardStage = processArray[0].stages.find(
          item => item.stage_name.toLowerCase() === 'labour card and contract'
        );

        if (lossOfEmploymentStage) {
          newProcessArray.push(lossOfEmploymentStage);
        }
        if (labourCardStage) {
          newProcessArray.push(labourCardStage);
        }
        processArray[0].stages = newProcessArray;
      } else {
        console.log('processArray for visa renewal is not properly structured or empty:', processArray);
      }
    }
  }

  // console.log(processArray)
  let visaProcessBody = {
    user_id: moduleResult[0].user_id,
    company_id: moduleResult[0].company_id,
    process_type: reqBody.process_type,
    status: processArray[0].stages[0].stage_name.toLowerCase(),
    attachments: moduleResult[0].attachments,
    comments: moduleResult[0].comments,
    processes: processArray[0].stages,
    created_by: userId,
    foreign_id: ObjectId(reqBody.foreign_id),
    identifier: reqBody.identifier,
    module: reqBody.module,
    assigned_pro: reqBody.assigned_pro
  };

  let newVisaProcess = await new VisaProcess(visaProcessBody).save();
  if (reqBody.process_type == 'new visa process') {
    console.log('updating user status to new visa process=====================>');
    let user = await Users.findOne({ _id: ObjectId(moduleResult[0].user_id) });
    user.user_status = 'new visa process';
    await user.save();
  }
  const result = await model.updateOne(
    { _id: ObjectId(reqBody.id) },
    {
      $set: {
        'processes.$[abc].actions.$[e].visa_process_id': newVisaProcess.id
      }
    },
    {
      arrayFilters: [
        {
          'abc._id': reqBody.process_id
        },
        {
          'e.action_type': 'visa process'
        }
      ]
    }
  );
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  return result;
};

const getProDetails = async (module, processId) => {
  const model = require(`../models/${module}.model`);

  const result = await model.findOne({ _id: processId });
  return result;
};

const updateUserDetailsAndCompanyDetails = async userIds => {
  try {
    const usersToCheck = Array.isArray(userIds) ? userIds : [userIds];

    const users = await Users.find({ _id: { $in: usersToCheck } });
    return usersToCheck;
    // const backedUpUsers = await UserBackUp.insertMany(users);

    // for (let user of users) {
    //   user.user_status = "inactive";
    //   await user.save();
    // }
    // const userIds = users.map(user => user._id);
    // const visaProcesses = await VisaProcess.find({ user_id: { $in: userIds } });
    // const backedUpVisaProcesses = await VisaprocessBackup.insertMany(visaProcesses);

    // // Update visa process statuses to "cancelled"
    // for (let doc of visaProcesses) {
    //   doc.status = "cancelled";
    //   doc.processes[0].reason_for_unsuccessfull = "End of Contract";
    //   await doc.save();
    // }

    // return visaProcesses;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
/**
 *
 * This is a one-time function to get users without onboarding
 * Note that the function can be phased out when needed
 */
const getUsersWithoutOffBoarding = async () => {
  const pipeline = [
    {
      $match: {
        is_deleted: false,
        'employment.employment_type': 'Mission Visa (3 Months Single Entry)',
        user_status: 'inactive'
      }
    },
    {
      $lookup: {
        from: 'offboardings', // Replace with your offboardings collection name
        localField: '_id',
        foreignField: 'user_id',
        as: 'offboardings'
      }
    },
    {
      $match: {
        offboardings: { $size: 0 } // Filter users without onboardings
      }
    },
    {
      $project: {
        fullName: {
          $concat: ['$first_name', ' ', { $ifNull: ['$middle_name', ''] }, ' ', '$last_name']
        }
      }
    }
  ];

  const result = await Users.aggregate(pipeline);

  const userNames = result.map(user => user.fullName);
  return userNames;
};

const missinVisaDeleteFunction = async () => {
  try {
    const pipeline = [
      {
        $match: {
          is_deleted: false,
          'employment.employment_type': 'Mission Visa (3 Months Single Entry)',
          user_status: 'inactive'
        }
      }
    ];

    const usersOnMissionVisa = await Users.aggregate(pipeline);
    let count = 0;
    for (const user of usersOnMissionVisa) {
      const userExists = await UserBackUp.findOne({ _id: user._id });
      if (userExists) {
        console.log(`User with ID: ${user._id} already exists in the backup`);
        continue; // Skip this user
      }
      await UserBackUp.create(user);
      console.log('inserted--->', (count += 1));
    }

    const userIds = usersOnMissionVisa.map(user => user._id);

    const allVisaProcesses = await VisaProcess.find({ user_id: { $in: userIds } });
    console.log(allVisaProcesses, 'the visa processes');
    // Array to track already backed up visa processes
    const alreadyBackedUpVisaProcessIds = [];
    console.log(alreadyBackedUpVisaProcessIds, 'backed up ids');
    // Inserting new visa processes to backup
    for (let visaProcess of allVisaProcesses) {
      try {
        // Check if this visa process is already backed up
        const existingVisaProcess = await VisaprocessBackup.findOne({ _id: visaProcess._id });
        if (existingVisaProcess) {
          console.log(`Visa process with _id ${visaProcess._id} already exists in backup. Skipping...`);
          alreadyBackedUpVisaProcessIds.push(visaProcess._id);
          continue;
        }
        await VisaprocessBackup.create(visaProcess);
      } catch (error) {
        if (error instanceof mongoose.Error.VersionError) {
          // Handle VersionError: retry logic or other error handling
          console.error('VersionError:', error.message);
          // Retry update or handle the error appropriately
          // For now, logging and skipping
          console.log(`Error backing up visa process with _id ${visaProcess._id}: ${error.message}. Skipping...`);
          continue;
        }
        // Handle other errors
        console.error('Error backing up visa process with _id', visaProcess._id, ':', error.message);
      }
    }

    // Processing visa and offboarding cancellation for users
    for (let user of usersOnMissionVisa) {
      try {
        const userVisaProcess = await VisaProcess.findOne({ user_id: user._id });
        if (userVisaProcess) {
          userVisaProcess.status = 'cancelled';
          for (let process of userVisaProcess.processes) {
            process.process_status = 'completed';
          }
          userVisaProcess.markModified('processes');
          await userVisaProcess.save();
          console.log(`Cancelled visa process for user with _id ${user._id}`);
        }

        const userOffboardingProcess = await Offboardings.findOne({ user_id: user._id });
        console.log(userOffboardingProcess, 'the onboarding process');
        if (userOffboardingProcess) {
          console.log('found onboarding process');
          for (let process of userOffboardingProcess.processes) {
            process.process_status = 'cancelled';
          }
          userOffboardingProcess.markModified('processes');
          await userOffboardingProcess.save();
          console.log(`Cancelled offboarding process for user with _id ${user._id}`);
        }
      } catch (error) {
        console.error(`Error cancelling processes for user with _id ${user._id}:`, error.message);
        // You can choose to throw an error or handle it based on your application's logic
      }
    }

    console.log('Successfully backed up visa processes and cancelled processes.');
    return userIds;
  } catch (error) {
    console.error('General error:', error.message);
    throw new Error(error.message); // Re-throw the error if necessary
  }
};

const newFunction = async companyId => {
  try {
    const companyToUpdate = await Companies.findById(ObjectId(companyId));
    if (!companyToUpdate) {
      throw new Error('Company not found');
    }
    console.log(companyToUpdate.company_name, 'company name');

    const pipeline = [
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: '$companyDetails'
      },
      {
        $match: {
          'companyDetails.company_name': companyToUpdate.company_name
        }
      }
    ];

    const users = await Users.aggregate(pipeline);
    const backupReason = 'mission visa deactivation';

    await Promise.all(
      users.map(async user => {
        const userId = user._id;

        // Find user in UserBackUp
        const backedUpUser = await UserBackUp.findOne({ _id: userId, backup_reason: backupReason });

        if (backedUpUser) {
          console.log(`found ${userId} on user backup, changing status on user model to ${backedUpUser.user_status}`);
          // Update user in Users collection with the status from UserBackUp
          await Users.findByIdAndUpdate(userId, {
            $set: {
              user_status: backedUpUser.user_status,
              backup_reason: ''
            }
          });
          console.log(`Updated user ${userId} with status ${backedUpUser.user_status} from backup`);

          // Remove from UserBackUp
          await UserBackUp.findByIdAndUpdate(backedUpUser._id, { $set: { is_deleted: true } });

          // Update Onboardings
          await Onboardings.findOneAndUpdate({ user_id: userId }, { $set: { is_deleted: false } });
          console.log(`Restored onboarding for user ${userId}`);

          // Update VisaProcess and remove from VisaprocessBackup
          await VisaProcess.findOneAndUpdate({ user_id: userId }, { $set: { is_deleted: false } });
          // await VisaprocessBackup.findOneAndDelete({ user_id: userId, backup_reason: backupReason });
          await VisaprocessBackup.findOneAndUpdate(
            { user_id: userId, backup_reason: backupReason },
            { $set: { is_deleted: true } }
          );

          console.log(`Restored visa process for user ${userId} and removed from backup`);

          // Remove from OffboardingBackUp
          // await OffboardingBackUp.findOneAndDelete({ user_id: userId, backup_reason: backupReason });
          await OffboardingBackUp.findOneAndUpdate(
            { user_id: userId, backup_reason: backupReason },
            { $set: { is_deleted: true } }
          );

          console.log(`Removed offboarding backup for user ${userId}`);
        } else {
          console.log(`No backup found for user ${userId}`);
        }
      })
    );

    return users;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const markEmployeesOnMissionVisaAsInactiveByUserId = async userIds => {
  try {
    if (!Array.isArray(userIds)) {
      userIds = [userIds];
    }

    // Convert all userIds to ObjectId instances
    userIds = userIds.map(id => (ObjectId.isValid(id) ? ObjectId(id) : null)).filter(id => id !== null);
    const users = await Users.find({ _id: { $in: userIds } });

    const backupReason = 'mission visa deactivation';

    await Promise.all(
      users.map(async user => {
        const userId = user._id;

        // Backup the user or update backup reason if already exists
        const existingUserBackup = await UserBackUp.findOne({ _id: userId });
        if (existingUserBackup) {
          await UserBackUp.findByIdAndUpdate(userId, { $set: { backup_reason: backupReason } });
          console.log(`Updated backup reason for user ${userId} in UserBackUp`);
        } else {
          await UserBackUp.create({ ...user.toObject(), backup_reason: backupReason });
          console.log(`Inserted user ${userId} into UserBackUp`);
        }

        // Mark user as inactive in Users collection
        await Users.findByIdAndUpdate(userId, { $set: { user_status: 'inactive' } });
        console.log(`Marked user ${userId} as inactive in Users collection`);

        // Handle Onboardings
        const onboarding = await Onboardings.findOne({ user_id: userId });
        if (onboarding) {
          const existingOnboardingBackup = await OnboardingsBackUp.findOne({ user_id: userId });
          if (existingOnboardingBackup) {
            await OnboardingsBackUp.findByIdAndUpdate(existingOnboardingBackup._id, {
              $set: { backup_reason: backupReason }
            });
            console.log(`Updated backup reason for onboarding ${userId} in OnboardingsBackUp`);
          } else {
            await OnboardingsBackUp.create({ ...onboarding.toObject(), backup_reason: backupReason });
            console.log(`Inserted onboarding ${userId} into OnboardingsBackUp`);
          }
          await Onboardings.findByIdAndUpdate(onboarding._id, { $set: { is_deleted: true } });
          console.log(`Marked onboarding ${userId} as deleted in Onboardings collection`);
        }

        // Handle Offboardings
        const offboarding = await Offboardings.findOne({ user_id: userId });
        if (offboarding) {
          const existingOffboardingBackup = await OffboardingBackUp.findOne({ user_id: userId });
          if (existingOffboardingBackup) {
            await OffboardingBackUp.findByIdAndUpdate(existingOffboardingBackup._id, {
              $set: { backup_reason: backupReason }
            });
            console.log(`Updated backup reason for offboarding ${userId} in OffboardingBackUp`);
          } else {
            await OffboardingBackUp.create({ ...offboarding.toObject(), backup_reason: backupReason });
            console.log(`Inserted offboarding ${userId} into OffboardingBackUp`);
          }
          await Offboardings.findByIdAndUpdate(offboarding._id, { $set: { is_deleted: true } });
          console.log(`Marked offboarding ${userId} as deleted in Offboardings collection`);
        }

        // Handle VisaProcess
        const visaProcess = await VisaProcess.findOne({ user_id: userId });
        if (visaProcess) {
          const existingVisaProcessBackup = await VisaprocessBackup.findOne({ user_id: userId });
          if (existingVisaProcessBackup) {
            await VisaprocessBackup.findByIdAndUpdate(existingVisaProcessBackup._id, {
              $set: { backup_reason: backupReason }
            });
            console.log(`Updated backup reason for visa process ${userId} in VisaProcessBackUp`);
          } else {
            await VisaprocessBackup.create({ ...visaProcess.toObject(), backup_reason: backupReason });
            console.log(`Inserted visa process ${userId} into VisaProcessBackUp`);
          }
          await VisaProcess.findByIdAndUpdate(visaProcess._id, { $set: { is_deleted: true } });
          console.log(`Marked visa process ${userId} as deleted in VisaProcess collection`);
        }
      })
    );

    return users;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

/**
 * ======================================================================
 * This function is the implementation of internal resources space
 * This is essential for PEO documents shared with insurance Portal
 * ======================================================================
 */
const fetcgDocumentsFromSharedResource = async reqQuery => {
  try {
    return true;
  } catch (error) {
    throw new Error(error);
  }
};

const sendRamadhanEmailForClients = async () => {
  try {
    const clients = await Companies.find({ status: { $in: ['active', 'new'] } });
    console.log(clients.length, 'is the length of clients');
    const query = {
      templateName: 'RamadhanEmail (Clients)'
    };
    let templt = await emailTemplateService.getEmailTemplateByName(query);
    if (templt) {
      if (Array.isArray(clients) && clients.length > 0) {
        let count = 0;
        for (let client of clients) {
          count += 1;
          const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
            templt._id,
            client._id,
            null,
            null
          );
          replacedTemplate.to = [client.company_email];
          console.log(
            '-----------------------------------------------------------sending email to',
            client.company_name,
            'witth email',
            client.company_email
          );
          await sendRawEmail(
            replacedTemplate.to,
            replacedTemplate.subject,
            replacedTemplate.content,
            replacedTemplate.cc,
            []
          );
        }
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

const sendRamadhanEmailForEmployees = async () => {
  try {
    const users = await Users.find({ user_status: { $in: ['onboarding', 'new visa process', 'active'] } });
    // const users = await Users.find({ email:"testberry@gmail.com" });
    // const users = await Users.find({email:"cecil@nathandigital.com"});
    console.log(users.length, 'is the total length of users');

    const query = {
      templateName: 'Eid-al-Adha Email'
    };

    let templt = await emailTemplateService.getEmailTemplateByName(query);
    if (templt) {
      if (Array.isArray(users) && users.length > 0) {
        // Deduplicate users by email (ensuring only unique emails are processed)
        const uniqueEmails = Array.from(new Set(users.map(user => user.email))).map(email =>
          users.find(user => user.email === email)
        );

        console.log(uniqueEmails.length, 'is the total number of unique emails');

        let count = 0;
        for (let user of uniqueEmails) {
          count += 1;
          console.log(user._id, 'got it now');

          const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
            templt._id,
            user._id,
            null,
            null
          );

          replacedTemplate.to = [user.email];
          console.log(
            '-------------------------------------------------------->sending email to',
            user.first_name,
            'with email:',
            user.email,
            '--------->',
            count
          );

          await sendRawEmail(
            replacedTemplate.to,
            replacedTemplate.subject,
            replacedTemplate.content,
            replacedTemplate.cc,
            []
          );

          // Log a message each time an email is sent
          console.log(`Email sent to ${user.email} (${count}/${uniqueEmails.length})`);
        }

        // Final message when all emails have been sent
        console.log(`All ${uniqueEmails.length} emails have been sent successfully!`);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
};

const sendResidentsUpdateEmailForEmployees = async () => {
  try {
    const users = await Users.find({
      user_status: { $in: ['onboarding', 'new visa process', 'active'] }
    });
    // const users = await Users.find({email: {$in:['cecil@nathandigital.com', 'sehrish@nathanhr.com']}})

    console.log('starting----------------->');

    const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Deduplicate by email and filter valid emails
    const emailSet = new Set();
    const uniqueUsers = users.filter(user => {
      if (user.email && validEmailRegex.test(user.email) && !emailSet.has(user.email)) {
        emailSet.add(user.email);
        return true;
      }
      return false;
    });

    if (uniqueUsers.length === 0) {
      console.log('No valid unique emails found.');
      return;
    }
    console.log(uniqueUsers.length);
    // return

    const mailBody = `Dear Employee,<br><br>
      Hope you are well.<br><br>

      In accordance with the UAE Ministry of Labour guidelines, we are required to periodically update your information to maintain your residential status.<br><br>

      Kindly complete the necessary details by clicking the link below:<br><br>
      🔗 <a href="https://forms.office.com/r/dK6kCneUam">https://forms.office.com/r/dK6kCneUam</a><br><br>

      In addition, please reply to this email with a copy of the following documents:<br>
      - Your Tenancy Contract (EJARI) or Title Deed<br>
      - Your latest Electricity Bill (DEWA)<br><br>

      📅 <strong>Deadline for submission: 27 June 2025</strong><br><br>

      <strong>Note:</strong> This request is only applicable to employees holding a valid UAE residency visa. If you are on a mission visa, kindly disregard this message.<br><br>

      We thank you in advance for your cooperation.<br><br>

      Regards,<br>
      Support Team<br><br>

      Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>
      Ph: +971 4 354 4466<br><br>
      `;

    let sentCount = 0;
    for (const user of uniqueUsers) {
      await sendRawEmail([user.email], 'Residential Update Required 2025', mailBody, ['sehrish@nathanhr.com'], []);
      sentCount++;
      console.log(`Sent email to ${user.first_name || 'Unknown'} (${user.email})`);
    }

    console.log(`Successfully sent email to ${sentCount} unique addresses`);
  } catch (error) {
    console.error('Error sending emails:', error);
    throw new Error(error);
  }
};

/**
 * Move process flow to a specific stage_name, updating process_status and actions accordingly.
 * @param {Object} reqBody - Should contain { module, id, stage_name }
 * @param {String} userId
 * @returns {Object} Updated document
 */
const processFlowMoveToStage = async (reqBody, userId) => {
  try {
    console.log(reqBody.stage_name, 'the stage name');
    console.log(reqBody.module, 'the module name');
    const model = require(`../models/${reqBody.module}.model`);
    let moduleResult = await model.findById({ _id: ObjectId(reqBody.id) });
    if (!moduleResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
    }
    const processes = moduleResult.processes;
    const targetIndex = processes.findIndex(p => p.stage_name === reqBody.stage_name);
    if (targetIndex === -1) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Stage name not found');
    }
    // Update all previous processes to completed
    for (let i = 0; i < targetIndex; i++) {
      processes[i].process_status = 'completed';
      if (Array.isArray(processes[i].actions)) {
        processes[i].actions.forEach(action => {
          action.status = 'completed';
          action.updated_by = userId;
          action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
        });
      }
    }
    // Update the target process to progress
    processes[targetIndex].process_status = 'progress';
    if (Array.isArray(processes[targetIndex].actions) && processes[targetIndex].actions.length > 0) {
      processes[targetIndex].actions.forEach((action, idx) => {
        action.status = idx === 0 ? 'progress' : 'pending';
        action.updated_by = userId;
        action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
      });
    }
    // Update all following processes to pending
    for (let i = targetIndex + 1; i < processes.length; i++) {
      processes[i].process_status = 'pending';
      if (Array.isArray(processes[i].actions)) {
        processes[i].actions.forEach(action => {
          action.status = 'pending';
          action.updated_by = userId;
          action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
        });
      }
    }
    // Update the document status
    moduleResult.status = processes[targetIndex].stage_name;
    // Save changes
    await model.updateOne({ _id: ObjectId(reqBody.id) }, { $set: { processes, status: moduleResult.status } });
    return moduleResult;
  } catch (error) {
    console.error('Error in processFlowMoveToStage:', error?.message);
    throw error;
  }
};

module.exports = {
  sendRamadhanEmailForClients,
  sendRamadhanEmailForEmployees,
  getInvoiceByProcessID,
  searchLeadsOnboardingVisProcessOffboardingsRenewalRequest,
  filterLeadsOnboardingVisProcessOffboardingsRenewalRequest,
  getAllDetailsProcessFlow,
  processFlowMarkUnsuccessful,
  processFlowMoveForward,
  processFlowMoveBackward,
  getModuleData,
  updateModuleData,
  getInvoiceDetails,
  updateProcess,
  createVisaProcess,
  processFlowUpdate,
  processActionDocument,
  getProDetails,
  RejectApplication,
  processActionGenerateDocument,
  updateUserDetailsAndCompanyDetails,
  getUsersWithoutOffBoarding,
  missinVisaDeleteFunction,
  newFunction,
  markEmployeesOnMissionVisaAsInactiveByUserId,
  fetcgDocumentsFromSharedResource,
  approveInvoice,
  processFlowMoveToStage,
  sendResidentsUpdateEmailForEmployees
  // eidEmail
};
