const { Requests, Users, Companies, Notification, Approvals, PayrollProcess, Payrolls } = require('../models');
const { ObjectId } = require('mongodb');
const moment = require('moment-timezone');
const NotificationHelper = require('../helpers/notification_helper');
const dotenv = require("dotenv");
dotenv.config();
const { sendNotification } = require("../controllers/notifications");
// const {
//   getLieuApprovedAdminParams,
//   getLieuApprovedParams,
//   getLieuRejectedAdminParams,
//   getLieuRejectedParams,
//   getLieuRequestApproverParams,
//   getLieuWithdrawParams,
//   getNewLieuRequestParams,  
// } = require('../emails/leave.email')User

// Create a new Lieu Request
const createLieuRequest = async (reqBody, reqHeaderHost) => {
    const applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) }, { reporting: 1, personal: 1, first_name: 1, last_name: 1, company_ID: 1, email: 1, leaves: 1 })
    const applied_manager = await Users.findOne({ _id: ObjectId(reqBody.applied_manager) }, { personal: 1, first_name: 1, last_name: 1 })
    let applicant_approvals = await Approvals.find({ user_id: ObjectId(reqBody.user_id), module: 'time in lieu' })
  
    if (!applicant_approvals || applicant_approvals.length === 0) return { success: false, message: 'Approval flow not set for this User', data: [] }
    if (!applicant.reporting.manager) return { success: false, message: 'You do not have an assigned manager. Please check with your HR Department about that.', data: [] }
  
    const lineManager = await Users.findOne({ _id: ObjectId(applicant.reporting.manager)}, { reporting: 1 })
  
    for (var index = 0; index < applicant_approvals[0].approvers.approver_levels; index++) {
      var total = index + 1;
      var level_no = "level_" + total;
  
      applicant_approvals[0].approvers[level_no] = applicant_approvals[0].approvers[level_no].map(elem => {
        if (elem === "line_manager_id") return applicant.reporting.manager;
        else if (elem === "senior_manager_id") return lineManager?.reporting.manager
        else return elem;
      });
  
      const originalRequiredApprovers = applicant_approvals[0].required_approvers[level_no].required_number
      const originalApproversLength = applicant_approvals[0].approvers[level_no].length
      const uniqueApprovers = [...new Set(applicant_approvals[0].approvers[level_no])]
      const uniqueApproversLength = uniqueApprovers.length
      const lengthDiference = originalApproversLength - uniqueApproversLength
      applicant_approvals[0].approvers[level_no] = uniqueApprovers
      applicant_approvals[0].required_approvers[level_no].required_number = Math.max(originalRequiredApprovers - (lengthDiference < 0 ? 0 : lengthDiference), 1)
    }
  
    if (!applicant || applicant.length === 0 || !applied_manager || applied_manager.length === 0) return { success: false, message: 'Unable to find the Users.', data: [] }
  
    let applicants_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) })
    let leaveType = reqBody.leave_type?.toLowerCase().replace(/\s/g, '_')
    let leaveIndex = applicant.leaves.findIndex((leave) => leave.key === leaveType)
  
    if (leaveIndex === -1) return { success: false, message: 'Leave Type not found.', data: [] }
  
    let insert_lieu = getAddLieuRequest(reqBody, applicant, applied_manager, applicant_approvals)
  
    if (!insert_lieu || insert_lieu.length === 0) return { success: false, message: 'Unable to Process this Request.! Please try again Later.', data: [] }
  
    const lieus = new Requests({ ...insert_lieu.obj_lieu, payroll_process: reqBody?.payroll_process, request_type: 'lieu' })
  
    if (lieus.approvals[0].reason == 'Auto Approved') {
      lieus.appliction_log.push({
        approver_id: lieus.approvals[0].approver_id,
        date_created: new Date(),
        status: 'Approved',
        reason: 'Auto Approved',
      });
      let updated_lieu = { $set: { lieus: insert_lieu.lieus }}
      let update_user_lieu = await Users.updateOne({ _id: ObjectId(reqBody.user_id) }, updated_lieu)
    }
  
    const apply_lieu = await lieus.save();
  
    if (!apply_lieu || apply_lieu.length === 0) return { success: false, message: 'Unable to apply for lieu.! Please try again later.', data: [] }
  
    let arr_users_id = []
    apply_lieu.approvals.forEach((element) => element?.approver_id.map(async (item) => arr_users_id.push(ObjectId(item))))
    arr_users_id.push(ObjectId(reqBody.user_id))
    let arr_users = await Users.aggregate([{ $match: { _id: { $in: arr_users_id }}}, { $project: { first_name: 1, last_name: 1, middle_name: 1 }}])
    let approver_id = []
  
    for (let i = 0; i < apply_lieu.approvals.length; i++) {
      if (apply_lieu.approvals[i].status.toLowerCase() == 'processing') apply_lieu?.approvals[i]?.approver_id.map(async (item) => approver_id.push(item))
    }
  
    if (approver_id.length > 0) {
      approver_id.forEach(async (item) => {
        let first_approver = await Users.findOne({ _id: ObjectId(item) }, { email: 1, personal: 1, first_name: 1, last_name: 1, middle_name: 1 })
        // await sendEmailUsingTemplateName(
        //   'lieu_request_new_approver',
        //   getLieuRequestApproverParams(apply_lieu, applicants_company, applicant, first_approver),
        //   applicant.company_ID,
        //   reqBody.user_id,
        //   "lieu"
        // )
        notifications('approver', 'approver', apply_lieu, first_approver, applicant);
      })
    }
  
    // await sendEmailUsingTemplateName(
    //   'lieu_request_email_employee',
    //   getNewLieuRequestParams(apply_lieu, applicants_company, applicant, arr_users),
    //   applicant.company_ID,
    //   reqBody.user_id,
    //   "lieu"
    // )
    notifications('applicant', 'created', apply_lieu, applicant, applicant)
  
    if (["Completed", "completed"].includes(insert_lieu.obj_lieu.status)) {
      if (reqBody.userType == "MANAGER") {
        // await sendEmailUsingTemplateName(
        //   'lieu_request_auto_approved',
        //   getLieuApprovedParams(apply_lieu, applicants_company, applicant, arr_users, "Auto Approved"),
        //   applicant.company_ID,
        //   reqBody.user_id,
        //   "lieu"
        // )
      } else if (reqBody.userType == "ADMIN") {
        // await sendEmailUsingTemplateName(
        //   'lieu_request_auto_approved_admin',
        //   getLieuApprovedAdminParams(insert_lieu.obj_lieu, applicants_company, applicant, arr_users, "Auto Approved"),
        //   applicant.company_ID,
        //   reqBody.user_id,
        //   "lieu"
        // )
      }
      notifications("applicant", "approved", insert_lieu.obj_lieu, applied_manager, applicant);
    }
    return { success: true, message: 'Success', data: { ...apply_lieu._doc, id: apply_lieu._doc._id }}
  };
  
  // Withdraw a Lieu Request
  const withdrawLieuRequest = async (reqBody) => {
    let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) })
  
    if (!applicant || applicant.length === 0) return { success: false, message: 'User Not Found.!', data: [] }
  
    let logs = { approver_id: applicant._id, date_created: new Date(), status: 'Lieu Request Withdrawn.', reason: '' }
    let update_data = {
      $set: { status: 'Withdrawn', app_status: 'Withdrawn', dateUpdated: new Date(), updatedBy: ObjectId(reqBody.user_id)},
      $push: { appliction_log: logs },
    };
    let update_match = { _id: ObjectId(reqBody.req_id) }
    let update_lieu = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec()
  
    if (!update_lieu || update_lieu.length === 0) return { success: false, message: 'Failed to Process this Request.! Please try again Later.', data: [] }
  
    let leaveType = update_lieu.leave_type?.toLowerCase().replace(/\s/g, '_');
    let leaveTypeIndex = applicant.leaves.findIndex((leave) => leave.key === leaveType);
  
    if (leaveTypeIndex === -1) return { success: false, message: 'Lieu Type not found.!', data: [] };
  
    let updateData = { $set: { 'approvals.$.status': 'Withdrawn by Employee' } };
    let updateMatch = { _id: ObjectId(reqBody.req_id), 'approvals.status': 'Processing' };
    let update_lieu_approval = await Requests.findOneAndUpdate(updateMatch, updateData, { new: true, lean: true }).exec();
    let applicants_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) });
    // await sendEmailUsingTemplateName(
    //   'lieu_request_withdrawn',
    //   getLieuWithdrawParams(update_lieu_approval, applicants_company, applicant),
    //   applicant.company_ID,
    //   reqBody.user_id,
    //   "lieu"
    // );
    notifications('applicant', 'withdrawn', update_lieu_approval, applicant, applicant);
    return { success: true, message: 'Success', data: update_lieu_approval };
  };
  
  // Approve a Lieu Request
  const approveLieuRequest = async (reqBody, reqHeaderHost) => {
    let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) })
    let obj_approver = await Users.findOne({ _id: ObjectId(reqBody.manager_id) })
    let approver = JSON.parse(JSON.stringify(obj_approver))
    let lieu_req = await Requests.findOne({ _id: ObjectId(reqBody.req_id) })
  
    if (!applicant || applicant.length === 0 || !approver || approver.length === 0) return { success: false, message: 'Unable to find User / Approver', data: [] }
  
    let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) });
    let arr_users_id = [];
    lieu_req.approvals.forEach((element) => element?.approver_id.map(async (item) => arr_users_id.push(ObjectId(item))));
  
    if (reqBody?.approver_attachment?.length > 0) {
      if (lieu_req.approvals && lieu_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < lieu_req.approvals.length; approval_index++) {
          const element = lieu_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = reqBody.hide_attachment;
            element.approver_attachment = reqBody.approver_attachment;
            break;
          }
        }
      }
    }
  
    arr_users_id.push(ObjectId(reqBody.user_id));
    let arr_users = await Users.aggregate([
      { $match: { _id: { $in: arr_users_id } } },
      { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
    ]);
    let approveLieu = {}
  
    if (reqBody.admin) {
      approveLieu = funAdminLieuApprove(lieu_req, reqBody.reason, approver, arr_users);
    } else {
      approver._id = String(approver._id)
      approveLieu = funManagerLieuApprove(lieu_req, reqBody.reason, approver, arr_users);
    }
  
    if (!approveLieu || approveLieu.length === 0) return { success: false, message: 'Unable to Process this Request.! Please Try Again Later!', data: [] };
  
    let obj_requestInfo = approveLieu.obj_requestInfo;
    let update_match = { _id: ObjectId(reqBody.req_id) };
  
    if (obj_requestInfo.status.toLowerCase() == 'completed') obj_requestInfo.app_status = 'Approved';
    else obj_requestInfo.app_status = 'Processing';
  
    let approvals = obj_requestInfo.approvals;
  
    for (let key = 0; key < approvals.length; key++) {
      let element = approvals[key];
  
      if (element.status == 'Processing') {
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
        await Requests.aggregate([approval_match])
          .then(async (approval_lieus) => {
            if (approval_lieus && approval_lieus.length > 0) {
              let approval_obj = {
                approver_id: approval_lieus[0].approval_substitute,
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
              approvals[key] = approval_obj_update;
              approvals.splice(key + 1, 0, approval_obj);
            }
          })
          .catch((approval_lieus_error) => console.log(approval_lieus_error));
      }
  
      if (approvals.length == key + 1) {
        let update_data = { $set: obj_requestInfo };
        let update_lieu = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  
        if (!update_lieu || update_lieu.length === 0) return { success: false, message: 'Unable to process this Request.! Please try again later', data: [] };
        if (obj_requestInfo.status == 'Completed') {
          if (reqBody.admin) {
            // await sendEmailUsingTemplateName(
            //   'lieu_request_approved_admin',
            //   getLieuApprovedAdminParams(lieu_req, applicant_company, applicant, arr_users, reqBody.reason),
            //   applicant.company_ID,
            //   reqBody.user_id,
            //   "lieu"
            // );
          } else {
            // await sendEmailUsingTemplateName(
            //   'lieu_request_approved',
            //   getLieuApprovedParams(lieu_req, applicant_company, applicant, arr_users, reqBody.reason),
            //   applicant.company_ID,
            //   reqBody.user_id,
            //   "lieu"
            // );
          }
  
          // if (obj_requestInfo.payroll_process) await createNewPayItems(obj_requestInfo, obj_approver, applicant);
          const leaveTypeIndex = applicant.leaves.findIndex(leave => leave.name === update_lieu.leave_type)
          applicant.leaves[leaveTypeIndex].balance += Number(update_lieu.no_of_days)
          const userUpdated = await Users.updateOne({ _id: applicant._id }, { $set: { leaves: applicant.leaves }})
          if (!userUpdated.nModified) return { success: false, message: "Unable to update leave balance.", data: userUpdated }
  
          notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
        } else {
          approveLieu?.arr_user_email.map(async (item) => {
            // let approver_to_email = item.email;
            // await sendEmailUsingTemplateName(
            //   'lieu_request_new_approver',
            //   getLieuRequestApproverParams(lieu_req, applicant_company, applicant, item),
            //   applicant.company_ID,
            //   reqBody.user_id,
            //   "lieu"
            //   [approver_to_email],
            // );
            notifications('approver', 'approver', obj_requestInfo, item, applicant);
          });
        }
        return { success: true, message: 'Success', data: update_lieu };
      }
    }
  };
  
  // Reject a Lieu Request
  const rejectLieuRequest = async (reqBody, reqHeaderHost) => {
    let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
    let obj_rejecter = await Users.findOne({ _id: ObjectId(reqBody.manager_id) });
    let rejecter = JSON.parse(JSON.stringify(obj_rejecter));
    let lieu_req = await Requests.findOne({ _id: ObjectId(reqBody.req_id) });
  
    if (!applicant || applicant.length === 0 || !rejecter || rejecter.length === 0 || !lieu_req || lieu_req.length === 0) return { success: false, message: 'Unable to find User / Request / Rejeceter', data: [] };
  
    let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) });
    let arr_users_id = [];
    lieu_req.approvals.forEach((element) => element?.approver_id.map(async (item) => arr_users_id.push(ObjectId(item))));
  
    if (reqBody?.approver_attachment?.length > 0) {
      if (lieu_req.approvals && lieu_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < lieu_req.approvals.length; approval_index++) {
          const element = lieu_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = reqBody.hide_attachment;
            element.approver_attachment = reqBody.approver_attachment;
            break;
          }
        }
      }
    }
  
    arr_users_id.push(ObjectId(reqBody.user_id));
    let arr_users = await Users.aggregate([
      { $match: { _id: { $in: arr_users_id } } },
      { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
    ]);
    let rejectLieu = {};
  
    if (reqBody.admin) rejectLieu = funAdminLieuReject(lieu_req, reqBody.reason, rejecter, arr_users, applicant_company.rejection_flow);
    else rejectLieu = funManagerLieuReject(lieu_req, reqBody.reason, rejecter, arr_users, applicant_company.rejection_flow);
    if (!rejectLieu || rejectLieu.length === 0) return { success: false, message: 'Unable to Process this Request.! Please check your Inputs.', data: [] };
  
    let obj_requestInfo = rejectLieu.obj_requestInfo;
    let update_match = { _id: ObjectId(reqBody.req_id)};
  
    if (obj_requestInfo.status.toLowerCase() == 'cancelled') obj_requestInfo.app_status = 'Rejected';
    else obj_requestInfo.app_status = 'Processing';
  
    let update_data = { $set: obj_requestInfo };
    let update_lieu = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  
    if (!update_lieu || update_lieu.length === 0) return { success: false, message: 'Unable to Process this Request.! Please try again Later.', data: [] };
    if (obj_requestInfo.status == 'Cancelled') {
      if (reqBody.admin) {
        // await sendEmailUsingTemplateName(
        //   'lieu_request_rejected_admin',
        //   getLieuRejectedAdminParams(lieu_req, applicant_company, applicant, arr_users, reqBody.reason),
        //   applicant.company_ID,
        //   reqBody.user_id,
        //   "lieu"
        // );
      } else {
        // await sendEmailUsingTemplateName(
        //   'lieu_request_rejected',
        //   getLieuRejectedParams(lieu_req, applicant_company, applicant, arr_users, reqBody.reason),
        //   applicant.company_ID,
        //   reqBody.user_id,
        //   "lieu"
        // );
      }
      notifications('applicant', 'rejected', obj_requestInfo, rejecter, applicant);
    } else {
      rejectLieu?.arr_user_email.map(async (item) => {
        // let approver_to_email = item.email;
        // await sendEmailUsingTemplateName(
        //   'lieu_request_new_approver',
        //   getLieuRequestApproverParams(lieu_req, applicant_company, applicant, item),
        //   applicant.company_ID,
        //   reqBody.user_id,
        //   "lieu",
        //   [approver_to_email]
        // );
        notifications('approver', 'approver', obj_requestInfo, item, applicant);
      });
    }
    return { success: true, message: 'Success', data: update_lieu };
  };
  
  // Reassign a Lieu Request
  const reassignLieuRequest = async (reqBody, reqHeaderHost) => {
    let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
    let obj_approver = await Users.findOne({ _id: ObjectId(reqBody.manager_id) });
    let approver = JSON.parse(JSON.stringify(obj_approver));
    const reassignManagerIds = reqBody.reassign_manager_id.map((id) => ObjectId(id));
    const reassigned_manager = await Users.find({ _id: { $in: reassignManagerIds } });
    let lieu_req = await Requests.findOne({ _id: ObjectId(reqBody.req_id) });
  
    if (
      !applicant || applicant.length === 0 ||
      !approver || approver.length === 0 ||
      !reassigned_manager || reassigned_manager.length === 0 ||
      !lieu_req || lieu_req.length === 0
    ) {
      return { success: false, message: 'Unable to Find Users / Request.!', data: [] };
    }
  
    if (reqBody?.approver_attachment?.length > 0) {
      if (lieu_req.approvals && lieu_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < lieu_req.approvals.length; approval_index++) {
          const element = lieu_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = reqBody.hide_attachment;
            element.approver_attachment = reqBody.approver_attachment;
            break;
          }
        }
      }
    }
  
    let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) });
    let reassign_lieu = funReassignLieu(lieu_req, reqBody.reason, approver, reassigned_manager, reqBody.admin);
    let update_match = { _id: ObjectId(reqBody.req_id) };
    let update_data = { $set: reassign_lieu };
    let update_lieu = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  
    if (!update_lieu || update_lieu.length === 0) return { success: false, message: 'Unable to Process this Request.! Please Try Again Later', data: [] };
  
    reassigned_manager.map(async (item) => {
      // await sendEmailUsingTemplateName(
      //   'lieu_request_reassigned',
      //   getLieuRequestApproverParams(lieu_req, applicant_company, applicant, item),
      //   applicant.company_ID,
      //   reqBody.user_id,
      //   "lieu",
      //   [item.email]
      // );
      notifications('approver', 'approver', update_lieu, item, applicant);
    });
    return { success: true, message: 'Success', data: update_lieu };
  };
  
  // Create Notification for Lieu Request
  async function notifications(type, subType, obj_request, approver, applicant) {
    try {
      if (type == 'approver') {
        let notification = {
          user_id: [String(approver._id)],
          read_by: [],
          notification_type: 'Lieu Request Pending Approval',
          notification_text:
            'New Lieu Request from ' + applicant.first_name + ' ' + applicant.last_name + ' is pending your approval',
          created_by: approver._id,
          url: '/dashboards/my-team#requests',
          createdDate: new Date(),
          type: {
            type: 'lieu',
            _id: obj_request?._id?.toString() || obj_request?.lieu_id?.toString(),
            status: obj_request.status,
          },
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(approver._id, notification.notification_type, notification.notification_text, notification.type);
      } else if (type == 'applicant') {
        if (subType == 'approved') {
          let notification = {
            user_id: [String(applicant._id)],
            read_by: [],
            notification_type: 'Lieu Request Approved',
            notification_text: 'Your Lieu Request is Approved. Please check your HR Self service for more details.',
            created_by: approver._id,
            url: '/dashboards/myhr#lieu',
            createdDate: new Date(),
            type: {
              type: 'lieu',
              _id: obj_request?._id?.toString() || obj_request?.lieu_id?.toString(),
              status: obj_request.status,
            },
          };
          const notify = new Notification(notification);
          let insert_notification = await notify.save();
          await sendNotification(applicant._id, notification.notification_type, notification.notification_text, notification.type);
        } else if (subType == 'withdrawn') {
          let notification = {
            user_id: [String(applicant._id)],
            read_by: [],
            notification_type: 'Lieu Request Withdrawn',
            notification_text: 'Your Lieu Request is Withdrawn. Please check your HR Self service for more details.',
            created_by: approver._id,
            url: '/dashboards/myhr#lieu',
            createdDate: new Date(),
            type: {
              type: 'lieu',
              _id: obj_request?._id?.toString() || obj_request?.lieu_id?.toString(),
              status: obj_request.status,
            },
          };
          const notify = new Notification(notification);
          let insert_notification = await notify.save();
          await sendNotification(applicant._id, notification.notification_type, notification.notification_text, notification.type);
        } else if (subType == 'rejected') {
          let notification = {
            user_id: [String(applicant._id)],
            read_by: [],
            notification_type: 'Lieu Request Rejected',
            notification_text: 'Your Lieu Request is Rejected. Please check your HR Self service for more details',
            created_by: approver._id,
            url: '/dashboards/myhr#lieu',
            createdDate: new Date(),
            type: {
              type: 'lieu',
              _id: obj_request?._id?.toString() || obj_request?.lieu_id?.toString(),
              status: obj_request.status,
            },
          };
          const notify = new Notification(notification);
          let insert_notification = await notify.save();
          await sendNotification(applicant._id, notification.notification_type, notification.notification_text, notification.type);
        } else if (subType == 'created') {
          let notification = {
            user_id: [String(applicant._id)],
            read_by: [],
            notification_type: 'New Lieu Request Submitted',
            notification_text: 'Your Lieu Request is Submitted. Please check your HR Self service for more details',
            created_by: String(applicant._id),
            url: '/dashboards/myhr#lieu',
            createdDate: new Date(),
            type: {
              type: 'lieu',
              _id: obj_request?._id?.toString() || obj_request?.lieu_id?.toString(),
              status: obj_request.status,
            },
          };
          const notify = new Notification(notification);
          let insert_notification = await notify.save();
          await sendNotification(applicant._id, notification.notification_type, notification.notification_text, notification.type);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  // Create Lieu PayItems
  async function createNewPayItems(lieu, approver, applicant) {
    try {
      if (
        lieu.lieu_type == 'Unpaid Lieus' &&
        (lieu.status.toLowerCase() == 'completed' || lieu.status == 'Approved by Admin')
      ) {
        let payitemObj = {
          pay_month: '',
          user_id: lieu?.user_id,
          company_id: applicant?.company_ID,
          first_name: '',
          last_name: '',
          earning_type: 'Deduction',
          category: 'Loss of Pay UL',
          remarks: lieu?.reason,
          amount: '',
          created_by_id: approver?._id,
          approved_by_id: approver?._id,
          recursive_id: 'Non-Recursive',
          status: 'active',
          unpaid: 0,
          ot_type: '',
          hours: '',
          lieu_id: lieu._id,
          logs: [],
          approvals: [
            {
              approver_id: (approver?._id).toString(),
              status: 'Approved',
              approved_date: new Date(),
              comments: 'Approved - Lieu',
            },
          ],
        };
        let logs_obj = {
          created_by: (approver?._id).toString(),
          status: 'Created',
          createdDate: new Date(),
        };
        payitemObj.logs.push(logs_obj);
        const user = await Users.find({ _id: lieu.user_id });
        const payrollprocess = await PayrollProcess.find({ status: 'active' }).sort({ createdDate: -1 });
        let LieuFromDateMonth = lieu.from_date.getMonth() + 1;
        let LieuToDateMonth = lieu.to_date.getMonth() + 1;
        let firstName = '';
        let lastName = '';
        let total_fixed = 0;
        if (user.length > 0) {
          firstName = user[0]?.first_name;
          lastName = user[0]?.last_name;
          total_fixed = user[0]?.salary.get('total_fixed');
        }
        payitemObj.first_name = firstName;
        payitemObj.last_name = lastName;
        if (LieuFromDateMonth == LieuToDateMonth) {
          let month = lieu.from_date.getMonth() + 1;
          let year = lieu.from_date.toISOString().substr(0, 4);
          let number_of_days_in_a_month = new Date(year, month, 0).getDate();
  
          if (payrollprocess.length > 0) {
            if (payrollprocess[0].pay_month == lieu.from_date.toISOString().substr(0, 7)) {
              payitemObj.pay_month = lieu.from_date.toISOString().substr(0, 7);
            } else if (payrollprocess[0].pay_month != lieu.from_date.toISOString().substr(0, 7)) {
              if (lieu.from_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj.pay_month = payrollprocess[0].pay_month;
              }
              if (lieu.from_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj.pay_month = lieu.from_date.toISOString().substr(0, 7);
              }
            }
          }
          payitemObj.amount = Math.ceil((total_fixed / number_of_days_in_a_month) * Number(lieu.no_of_days) * 100) / 100;
          const payroll = new Payrolls({ ...payitemObj });
          const newProcess = await payroll.save();
        } else if (LieuFromDateMonth != LieuToDateMonth) {
          let monthsBetweenDates = await enumerateMonths(lieu.from_date, lieu.to_date);
          if (monthDiff(lieu.from_date, lieu.to_date) == 1) {
            let payitemObj1 = {
              pay_month: '',
              user_id: lieu?.user_id,
              company_id: applicant?.company_ID,
              first_name: '',
              last_name: '',
              earning_type: 'Deduction',
              category: 'Loss of Pay UL',
              remarks: lieu?.reason,
              amount: '',
              created_by_id: approver?._id,
              approved_by_id: approver?._id,
              recursive_id: 'Non-Recursive',
              status: 'active',
              unpaid: 0,
              ot_type: '',
              hours: '',
              lieu_id: lieu?._id,
              logs: [],
              approvals: [
                {
                  approver_id: (approver?._id).toString(),
                  status: 'Approved',
                  approved_date: new Date(),
                  comments: 'Approved - Lieu',
                },
              ],
            };
            let logs_obj = {
              created_by: (approver?._id).toString(),
              status: 'Created',
              createdDate: new Date(),
            };
            payitemObj1.logs.push(logs_obj);
  
            let date = lieu.from_date.getDate();
            let month = lieu.from_date.getMonth() + 1;
            let year = lieu.from_date.toISOString().substr(0, 4);
            let number_of_days_in_a_month = new Date(year, month, 0).getDate();
  
            let date1 = lieu.to_date.getDate();
            let month1 = lieu.to_date.getMonth() + 1;
            let year1 = lieu.to_date.toISOString().substr(0, 4);
            let number_of_days_in_a_month1 = new Date(year1, month1, 0).getDate();
  
            let payrollDaysFirstMonth = number_of_days_in_a_month - date + 1;
  
            let daily_rate = total_fixed / number_of_days_in_a_month;
  
            let payrollDaysSecondMonth = date1;
  
            let daily_rate1 = total_fixed / number_of_days_in_a_month1;
  
            payitemObj1.first_name = firstName;
            payitemObj1.last_name = lastName;
            if (payrollprocess.length > 0) {
              if (payrollprocess[0].pay_month == lieu.from_date.toISOString().substr(0, 7)) {
                payitemObj1.pay_month = lieu.from_date.toISOString().substr(0, 7);
              } else {
                if (lieu.from_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                  payitemObj1.pay_month = payrollprocess[0].pay_month;
                }
                if (lieu.from_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                  payitemObj1.pay_month = lieu.from_date.toISOString().substr(0, 7);
                }
              }
            }
  
            let total_amount = Math.abs(
              parseFloat(Number(payrollDaysFirstMonth) * daily_rate + Number(payrollDaysSecondMonth) * daily_rate1).toFixed(2)
            );
            payitemObj1.amount = total_amount;
            const payroll = new PayrollModel({ ...payitemObj1 });
            const newProcess = await payroll.save();
          }
          if (monthDiff(lieu.from_date, lieu.to_date) > 1) {
            for (let i = 0; i < monthsBetweenDates.length; i++) {
              let newPayItems = {
                pay_month: '',
                user_id: lieu?.user_id,
                company_id: user[0]?.company_ID,
                first_name: firstName,
                last_name: lastName,
                earning_type: 'Deduction',
                category: 'Loss of Pay UL',
                remarks: lieu?.reason,
                amount: '',
                created_by_id: approver?._id,
                approved_by_id: approver?._id,
                recursive_id: 'Non-Recursive',
                status: 'active',
                unpaid: 0,
                ot_type: '',
                hours: '',
                lieu_id: lieu?._id,
                logs: [],
                approvals: [
                  {
                    approver_id: (approver?._id).toString(),
                    status: 'Approved',
                    approved_date: new Date(),
                    comments: 'Approved - Lieu',
                  },
                ],
              };
              let logs_obj = {
                created_by: (approver?._id).toString(),
                status: 'Created',
                createdDate: new Date(),
              };
              newPayItems.logs.push(logs_obj);
  
              if (payrollprocess[0].pay_month <= monthsBetweenDates[i] == false) {
                if (payrollprocess[0].pay_month <= monthsBetweenDates[i + 1] == true) {
                  newPayItems.pay_month = monthsBetweenDates[i + 1];
                }
                if (payrollprocess[0].pay_month <= monthsBetweenDates[i + 1] == false) {
                  if (payrollprocess[0].pay_month <= monthsBetweenDates[i + 2] == true) {
                    newPayItems.pay_month = monthsBetweenDates[i + 2];
                  }
                }
  
                let no_of_days_calc = 0;
  
                if (new Date(lieu.from_date).toISOString().substr(0, 7) == monthsBetweenDates[i]) {
                  no_of_days_calc = new Date(
                    new Date(lieu.from_date).getFullYear(),
                    new Date(lieu.from_date).getMonth() + 1,
                    0
                  ).getDate();
  
                  let lieu_days_in_a_month = no_of_days_calc - new Date(lieu.from_date).getDate() + 1;
                  newPayItems.amount = Math.ceil((total_fixed / no_of_days_calc) * lieu_days_in_a_month * 100) / 100;
                }
              }
              if (
                payrollprocess[0].pay_month <= monthsBetweenDates[i] == true &&
                new Date(lieu.from_date).toISOString().substr(0, 7) != new Date(lieu.to_date).toISOString().substr(0, 7)
              ) {
                newPayItems.pay_month = monthsBetweenDates[i];
  
                let no_of_days_calc = new Date(
                  new Date(monthsBetweenDates[i]).getFullYear(),
                  new Date(monthsBetweenDates[i]).getMonth() + 1,
                  0
                ).getDate();
  
                let lieu_days_in_a_month = no_of_days_calc;
  
                newPayItems.amount = Math.ceil((total_fixed / no_of_days_calc) * lieu_days_in_a_month * 100) / 100;
              }
              if (
                payrollprocess[0].pay_month <= monthsBetweenDates[i] == true &&
                new Date(lieu.to_date).toISOString().substr(0, 7) == monthsBetweenDates[i]
              ) {
                newPayItems.pay_month = monthsBetweenDates[i];
  
                let no_of_days_calc = new Date(
                  new Date(lieu.to_date).getFullYear(),
                  new Date(lieu.to_date).getMonth() + 1,
                  0
                ).getDate();
  
                let lieu_days_in_a_month = new Date(lieu.to_date).getDate();
  
                newPayItems.amount = Math.ceil((total_fixed / no_of_days_calc) * lieu_days_in_a_month * 100) / 100;
              }
              const payroll = new PayrollModel({ ...newPayItems });
              const newProcess = await payroll.save();
            }
          }
        }
      }
      if (
        (lieu.lieu_type == 'Medical Lieus' || lieu.lieu_type == 'Maternity Lieus') &&
        Number(lieu.remaining_lieus) < 0 &&
        (lieu.status == 'Completed' || lieu.status == 'completed' || lieu.status == 'Approved by Admin')
      ) {
        let payitemObj = {
          pay_month: '',
          user_id: lieu?.user_id,
          company_id: applicant?.company_ID,
          first_name: '',
          earning_type: 'Deduction',
          category: '',
          remarks: lieu?.reason,
          amount: '',
          created_by_id: approver?._id,
          approved_by_id: approver?._id,
          recursive_id: 'Non-Recursive',
          status: 'active',
          unpaid: 0,
          ot_type: '',
          hours: '',
          lieu_id: lieu._id,
          logs: [],
          approvals: [
            {
              approver_id: (approver?._id).toString(),
              status: 'Approved',
              approved_date: new Date(),
              comments: 'Approved - Lieu',
            },
          ],
        };
        payitemObj.category = lieu.lieu_type == 'Medical Lieus' ? 'Loss of Pay SL' : 'Loss of Pay ML';
  
        let logs_obj = {
          created_by: (approver?._id).toString(),
          status: 'Created',
          createdDate: new Date(),
        };
        payitemObj.logs.push(logs_obj);
  
        let LieuFromDateMonth = lieu.from_date.getMonth() + 1;
        let LieuToDateMonth = lieu.to_date.getMonth() + 1;
  
        const user = await Users.find({ _id: lieu.user_id });
  
        let firstname = '';
        let total_fixed = 0;
  
        if (user.length > 0) {
          firstname = user[0].first_name + ' ' + user[0].last_name;
          total_fixed = user[0].salary.get('total_fixed');
        }
        let payMonth = lieu.from_date.toISOString().substr(0, 7);
        const payrollprocess = await PayrollProcess.find({ status: 'active' }).sort({ createdDate: -1 });
  
        if (LieuFromDateMonth == LieuToDateMonth) {
          let month = lieu.from_date.getMonth() + 1;
          let year = lieu.from_date.toISOString().substr(0, 4);
          let number_of_days_in_a_month = new Date(year, month, 0).getDate();
  
          let daily_rate = total_fixed / number_of_days_in_a_month;
  
          payitemObj.first_name = firstname;
  
          if (payrollprocess.length > 0) {
            if (payrollprocess[0].pay_month == lieu.from_date.toISOString().substr(0, 7)) {
              payitemObj.pay_month = lieu.from_date.toISOString().substr(0, 7);
            } else if (payrollprocess[0].pay_month != lieu.from_date.toISOString().substr(0, 7)) {
              if (lieu.from_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj.pay_month = payrollprocess[0].pay_month;
              }
              if (lieu.from_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj.pay_month = lieu.from_date.toISOString().substr(0, 7);
              }
            }
          }
          payitemObj.amount = Math.abs(parseFloat(Number(lieu.no_of_days) * (daily_rate / 2)).toFixed(2));
  
          const payroll = new Payrolls({
            ...payitemObj,
          });
          const newProcess = await payroll.save();
        } else if (LieuFromDateMonth != LieuToDateMonth) {
          let payitemObj1 = {
            pay_month: '',
            user_id: lieu?.user_id,
            company_id: applicant?.company_ID,
            first_name: '',
            earning_type: 'Deduction',
            category: '',
            remarks: lieu?.reason,
            amount: '',
            created_by_id: approver?._id,
            approved_by_id: approver?._id,
            recursive_id: 'Non-Recursive',
            status: 'active',
            unpaid: 0,
            ot_type: '',
            hours: '',
            lieu_id: lieu._id,
            logs: [],
            approvals: [
              {
                approver_id: (approver?._id).toString(),
                status: 'Approved',
                approved_date: new Date(),
                comments: 'Approved - Lieu',
              },
            ],
          };
          payitemObj1.category = lieu.lieu_type == 'Medical Lieus' ? 'Loss of Pay SL' : 'Loss of Pay ML';
          let logs_obj1 = {
            created_by: (approver?._id).toString(),
            status: 'Created',
            createdDate: new Date(),
          };
          payitemObj1.logs.push(logs_obj1);
          let date = lieu.from_date.getDate();
          let month = lieu.from_date.getMonth() + 1;
          let year = lieu.from_date.toISOString().substr(0, 4);
          let number_of_days_in_a_month = new Date(year, month, 0).getDate();
  
          let payrollDaysFirstMonth = number_of_days_in_a_month - date + 1; //28
  
          let daily_rate = total_fixed / number_of_days_in_a_month;
  
          payitemObj1.first_name = firstname;
          if (payrollprocess.length > 0) {
            if (payrollprocess[0].pay_month == lieu.from_date.toISOString().substr(0, 7)) {
              payitemObj1.pay_month = lieu.from_date.toISOString().substr(0, 7);
            } else {
              if (lieu.from_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj1.pay_month = payrollprocess[0].pay_month;
              }
              if (lieu.from_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj1.pay_month = lieu.from_date.toISOString().substr(0, 7);
              }
            }
          }
          payitemObj1.amount = Math.abs(parseFloat(Number(payrollDaysFirstMonth) * (daily_rate / 2)).toFixed(2));
          const payroll = new Payrolls({
            ...payitemObj1,
          });
          const newProcess = await payroll.save();
  
          let payitemObj2 = {
            pay_month: '',
            user_id: lieu?.user_id,
            first_name: '',
            earning_type: 'Deduction',
            category: '',
            remarks: lieu?.reason,
            amount: '',
            company_id: applicant?.company_ID,
            created_by_id: approver?._id,
            approved_by_id: approver?._id,
            recursive_id: 'Non-Recursive',
            status: 'active',
            unpaid: 0,
            ot_type: '',
            hours: '',
            lieu_id: lieu._id,
            logs: [],
            approvals: [
              {
                approver_id: (approver?._id).toString(),
                status: 'Approved',
                approved_date: new Date(),
                comments: 'Approved - Lieu',
              },
            ],
          };
          payitemObj2.category = lieu.lieu_type == 'Medical Lieus' ? 'Loss of Pay SL' : 'Loss of Pay ML';
  
          let logs_obj2 = {
            created_by: (approver?._id).toString(),
            status: 'Created',
            createdDate: new Date(),
          };
          payitemObj2.logs.push(logs_obj2);
  
          let date1 = lieu.to_date.getDate();
          let month1 = lieu.to_date.getMonth() + 1;
          let year1 = lieu.to_date.toISOString().substr(0, 4);
          let number_of_days_in_a_month1 = new Date(year1, month1, 0).getDate();
  
          let payrollDaysSecondMonth = date1;
  
          let daily_rate1 = total_fixed / number_of_days_in_a_month1;
  
          payitemObj2.first_name = firstname;
          if (payrollprocess.length > 0) {
            if (payrollprocess[0].pay_month == lieu.to_date.toISOString().substr(0, 7)) {
              payitemObj2.pay_month = lieu.to_date.toISOString().substr(0, 7);
            } else {
              if (lieu.to_date.getTime() < new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj2.pay_month = payrollprocess[0].pay_month;
              }
              if (lieu.to_date.getTime() > new Date(payrollprocess[0].pay_month + '-01').getTime()) {
                payitemObj2.pay_month = lieu.to_date.toISOString().substr(0, 7);
              }
            }
          }
          payitemObj2.amount = Math.abs(parseFloat(Number(payrollDaysSecondMonth) * (daily_rate1 / 2)).toFixed(2));
          const payroll1 = new Payrolls({
            ...payitemObj2,
          });
          const newProcess1 = await payroll1.save();
        }
      }
    } catch (error) {
      console.log('#error', error);
    }
  }
  
  // If the Lieu request is for more than a month
  async function enumerateMonths(from, to) {
    const current = new Date(from);
    current.setUTCDate(1);
    current.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(to);
    const months = [];
    while (current.getTime() <= toDate.getTime()) {
      months.push(current.getUTCFullYear() + '-' + `${current.getUTCMonth() + 1}`.padStart(2, '0'));
      current.setUTCMonth(current.getUTCMonth() + 1);
    }
    return months;
  }
  
  function getAddLieuRequest(obj_request, applicant, obj_manager, applicant_approvals) {
    var _a, _b, _c, _d, _e;
    try {
      var status_1 = "Processing";
      var user_id = applicant._id;
      var approver_id = applicant.reporting.manager;
      var leave_type = obj_request.leave_type;
      var no_of_days = obj_request.no_of_days;
      /* Employee leave approval flow */
      var approvals = [];
      var employee_approvalflow = (_d = applicant_approvals[0]) === null || _d === void 0 ? void 0 : _d.approvers;
      var required_approvers = (_e = applicant_approvals[0]) === null || _e === void 0 ? void 0 : _e.required_approvers;
      for (var index = 0; index < employee_approvalflow.approver_levels; index++) {
        var total = index + 1;
        var level_no = "level_" + total;
        var approval_obj = {
          approver_id: employee_approvalflow[level_no],
          status: "",
          approved_date: "",
          comments: [],
          reason: '',
          approved_by: [],
          required: required_approvers[level_no].required_number,
          team_name: required_approvers[level_no].team_name
        };
        index == 0 ? (approval_obj.status = "Processing") : (approval_obj.status = "Pending");
        approvals.push(approval_obj);
      }
      /* Create application log */
      var appliction_log = [{
        approver_id: obj_request.user_id,
        date_created: new Date(),
        status: "Created",
        reason: ""
      }];
      if (obj_request.userType == 'ADMIN') {
        appliction_log = [{
          approver_id: obj_request.user_id,
          date_created: new Date(),
          status: "Created by Admin",
          reason: ""
        }];
        if (obj_manager) {
          if (approvals[0].status == 'Processing' && ((approvals[0].approver_id).includes((obj_manager._id).toString()))) {
            if (approvals[0].required === 1) {
              approvals[0].approved_date = new Date() + ''
              approvals[0].status = 'Approved by Admin'
              approvals[0].reason = "Auto Approved"
              if (approvals.length - 1 == 0) status_1 = "Completed"
              else approvals[1].status = "Processing"
            } else {
              var approver = [{ _id: String(obj_manager._id), first_name: obj_manager.first_name }]
              approvals[0].approved_by = approver
              appliction_log.push({ approver_id: obj_manager._id, date_created: new Date(), status: "Approved by Admin", reason: "Auto Approved" })
            }
          }
        }
      } else if (obj_request.userType == 'MANAGER') {
        appliction_log = [{
          approver_id: obj_request.user_id,
          date_created: new Date(),
          status: "Created by " + obj_manager.first_name,
          reason: ""
        }];
        if (obj_manager) {
          if (approvals[0].status == 'Processing' && ((approvals[0].approver_id).includes((obj_manager._id).toString()))) {
            if (approvals[0].required === 1) {
              approvals[0].approved_date = new Date() + ''
              approvals[0].status = 'Approved by ' + obj_manager.first_name
              approvals[0].reason = "Auto Approved"
              if (approvals.length - 1 == 0) status_1 = "Completed"
              else approvals[1].status = "Processing"
            } else {
              var approver = [{ _id: String(obj_manager._id), first_name: obj_manager.first_name }]
              approvals[0].approved_by = approver
              appliction_log.push({ approver_id: obj_manager._id, date_created: new Date(), status: 'Approved by ' + obj_manager.first_name, reason: "Auto Approved" })
            }
          }
        }
      }
      var obj_lieu = {
        certificate: obj_request.certificate,
        approvals: approvals,
        leave_type: leave_type,
        appliction_log: appliction_log,
        from_date: obj_request.from_date,
        to_date: obj_request.to_date,
        no_of_days: no_of_days,
        reason: obj_request.reason,
        status: status_1,
        user_id: user_id,
        app_status: 'Progress',
        user_name: applicant.first_name + " " + applicant.last_name,
        date_created: new Date()
      };
      return { obj_lieu: obj_lieu, leaves: applicant.leaves };
    } catch (error) {
      return error;
    }
  };
  
  function funAdminLieuApprove(obj_requestInfo, reason, obj_admin, arr_users) {
    try {
      var date_created = new Date().toISOString();
      var arr_user_email = [];
      var _loop_5 = function (index) {
        if (obj_requestInfo.approvals[index].status.toLowerCase() == 'processing') {
          obj_requestInfo.approvals[index].approved_by.push({ _id: String(obj_admin._id), first_name: obj_admin.first_name });
          var app_log = { approver_id: obj_admin._id, date_created: date_created, status: "Approved by Admin", reason: reason };
          obj_requestInfo.appliction_log.push(app_log);
          if (obj_requestInfo.approvals[index].approved_by.length >= obj_requestInfo.approvals[index].required) {
            obj_requestInfo.approvals[index].status = 'Approved by Admin';
            obj_requestInfo.approvals[index].approved_date = date_created;
            obj_requestInfo.approvals[index].reason = reason;
            if (obj_requestInfo.approvals.length - 1 == index) {
              obj_requestInfo.status = 'Completed';
              obj_requestInfo.reason = reason;
              var compltd_log = {
                approver_id: obj_admin._id,
                date_created: date_created,
                status: "Lieu Request Approved",
                reason: ""
              };
              obj_requestInfo.appliction_log.push(compltd_log);
            } else {
              obj_requestInfo.approvals[index + 1].status = 'Processing';
              arr_user_email = arr_users.filter(function (ele) {
                return obj_requestInfo.approvals[index + 1].approver_id.includes(String(ele._id));
              });
            }
          }
          return "break";
        }
      };
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        var state_2 = _loop_5(index);
        if (state_2 === "break") break;
      }
      return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
    } catch (error) {
      return error;
    }
  };
  
  function funManagerLieuApprove(obj_requestInfo, reason, obj_manager, arr_users) {
    try {
      var arr_user_email = [];
      var date_created = new Date().toISOString();
      var _loop_3 = function (index) {
        if (obj_requestInfo.approvals[index].status.toLowerCase() == 'processing' && obj_requestInfo.approvals[index].approver_id.includes(String(obj_manager._id)) && !obj_requestInfo.approvals[index].approved_by.includes(String(obj_manager._id))) {
          obj_requestInfo.approvals[index].approved_by.push({ _id: String(obj_manager._id), first_name: obj_manager.first_name });
          var app_log = { approver_id: obj_manager._id, date_created: date_created, status: "Approved by " + obj_manager.first_name, reason: reason };
          obj_requestInfo.appliction_log.push(app_log);
          if (obj_requestInfo.approvals[index].approved_by.length >= obj_requestInfo.approvals[index].required) {
            obj_requestInfo.approvals[index].status = 'Approved by ' + obj_manager.first_name;
            obj_requestInfo.approvals[index].approved_date = date_created;
            obj_requestInfo.approvals[index].reason = reason;
            if (obj_requestInfo.approvals.length - 1 == index) {
              obj_requestInfo.status = 'Completed';
              obj_requestInfo.reason = reason;
              var compltd_log = {
                approver_id: obj_manager._id,
                date_created: date_created,
                status: "Lieu Request Approved",
                reason: ""
              };
              obj_requestInfo.appliction_log.push(compltd_log);
            }
            else {
              obj_requestInfo.approvals[index + 1].status = 'Processing';
              arr_user_email = arr_users.filter(function (ele) {
                return obj_requestInfo.approvals[index + 1].approver_id.includes(String(ele._id));
              });
            }
          }
          return "break";
        }
      };
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        var state_1 = _loop_3(index);
        if (state_1 === "break") break;
      }
      return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
    } catch (error) {
      return error;
    }
  };
  
  function funManagerLieuReject(obj_requestInfo, str_reason, obj_manager, arr_users, obj_comapany_rejection_flow) {
    try {
      var arr_user_email = [];
      if (obj_comapany_rejection_flow.leave.previous_approver) {
        var _loop_4 = function (index) {
          if (obj_requestInfo.approvals[index].status.toLowerCase() == "processing" && ((obj_requestInfo.approvals[index].approver_id).includes((obj_manager._id).toString()))) {
            obj_requestInfo.approvals[index].status = "Rejected";
            obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
            obj_requestInfo.approvals[index].reason = str_reason;
            var app_log_1 = {
              approver_id: obj_manager._id,
              date_created: new Date().toISOString(),
              status: "Rejected by " + obj_manager.first_name,
              reason: str_reason
            };
            obj_requestInfo.appliction_log.push(app_log_1);
            if (index != 0) {
              obj_requestInfo.approvals[index - 1].status = "Processing";
              obj_requestInfo.approvals[index].approved_by = [];
              /* Get User email --Approver*/
              arr_user_email = arr_users.filter(function (ele) {
                return obj_requestInfo.approvals[index - 1].approver_id.includes(String(ele._id));
              });
            } else {
              var app_log_2 = {
                approver_id: obj_manager._id,
                date_created: new Date().toISOString(),
                status: "Lieu Request Rejected",
                reason: str_reason
              };
              obj_requestInfo.appliction_log.push(app_log_2);
              /* Get User email --obj_user*/
              obj_requestInfo.status = "Cancelled";
              arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
            }
          }
        };
        for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
          _loop_4(index);
        }
        return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
      } else {
        for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
          if (obj_requestInfo.approvals[index].status.toLowerCase() == "processing" && ((obj_requestInfo.approvals[index].approver_id).includes((obj_manager._id).toString()))) {
            obj_requestInfo.approvals[index].status = "Rejected";
            obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
            obj_requestInfo.approvals[index].reason = str_reason;
            obj_requestInfo.status = "Cancelled";
            if (index == obj_requestInfo.approvals.length - 1) {
              var app_log = {
                approver_id: obj_manager._id,
                date_created: new Date().toISOString(),
                status: "Rejected by " + obj_manager.first_name,
                reason: str_reason
              };
              obj_requestInfo.appliction_log.push(app_log);
              var final_log = {
                approver_id: obj_manager._id,
                date_created: new Date().toISOString(),
                status: "Lieu Request Rejected",
                reason: str_reason
              };
              obj_requestInfo.appliction_log.push(final_log);
            }
            /* Get User email --obj_user*/
            arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
          }
        }
        return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
      }
    } catch (error) {
      return error;
    }
  };
  
  function funAdminLieuReject(obj_requestInfo, str_reason, obj_admin, arr_users, obj_comapany_rejection_flow) {
    try {
      var arr_user_email = [];
      if (obj_requestInfo.status.toLowerCase() === "completed") {
        for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
          obj_requestInfo.status = "Cancelled";
          obj_requestInfo.approvals[index].status = "Rejected by Admin";
          obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
          obj_requestInfo.approvals[index].reason = str_reason;
          obj_requestInfo.approvals[index].admin_id = obj_admin._id;
          var app_log_3 = {
            approver_id: obj_admin._id,
            date_created: new Date().toISOString(),
            status: "Rejected by Admin",
            reason: str_reason
          };
          obj_requestInfo.appliction_log.pop();
          obj_requestInfo.appliction_log.push(app_log_3);
          var final_log_1 = {
              approver_id: obj_admin._id,
              date_created: new Date().toISOString(),
              status: "Lieu Request Rejected",
              reason: str_reason
          };
          obj_requestInfo.appliction_log.push(final_log_1);
          /* Get User email */
          arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
          return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        }
      } else {
        if (obj_comapany_rejection_flow.leave.reject) {
          for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
            obj_requestInfo.approvals[index].status = "Rejected by Admin";
            obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
            obj_requestInfo.approvals[index].reason = str_reason;
            obj_requestInfo.approvals[index].admin_id = obj_admin._id;
            obj_requestInfo.status = "Cancelled";
            if (index == obj_requestInfo.approvals.length - 1) {
              var app_log = {
                approver_id: obj_admin._id,
                date_created: new Date().toISOString(),
                status: "Rejected by Admin",
                reason: str_reason
              };
              obj_requestInfo.appliction_log.push(app_log);
              var final_log = {
                approver_id: obj_admin._id,
                date_created: new Date().toISOString(),
                status: "Lieu Request Rejected",
                reason: str_reason
              };
              obj_requestInfo.appliction_log.push(final_log);
            }
            /* Get User email */
            arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
          }
          return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } else {
          var _loop_6 = function (index) {
            if (obj_requestInfo.approvals[index].status.toLowerCase() == "processing") {
              obj_requestInfo.approvals[index].status = "Rejected by Admin";
              obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
              obj_requestInfo.approvals[index].reason = str_reason;
              var app_log_4 = {
                approver_id: obj_admin._id,
                date_created: new Date().toISOString(),
                status: "Rejected by Admin",
                reason: str_reason
              };
              obj_requestInfo.appliction_log.push(app_log_4);
              if (index != 0) {
                obj_requestInfo.approvals[index - 1].status = "Processing";
                /* Get User email */
                arr_user_email = arr_users.filter(function (ele) {
                  return obj_requestInfo.approvals[index - 1].approver_id.includes(String(ele._id));
                });
              }
              else {
                var final_log_2 = {
                  approver_id: obj_admin._id,
                  date_created: new Date().toISOString(),
                  status: "Lieu Request Rejected",
                  reason: str_reason
                };
                obj_requestInfo.appliction_log.push(final_log_2);
                obj_requestInfo.status = "Cancelled";
                /* Get User email --obj_user*/
                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
              }
            }
          };
          for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
            _loop_6(index);
          }
          return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        }
      }
    } catch (error) {
      return error;
    }
  };
  
  function funReassignLieu(obj_requestInfo, str_reason, obj_manager, reassign_manager, bln_admin) {
    try {
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        var element = obj_requestInfo.approvals[index];
        var reassignedManagerIds = [];
        reassign_manager.map(function (item) {
          reassignedManagerIds.push(String(item._id));
        });
        if (element.status.toLowerCase() == 'processing') {
          if (bln_admin) {
            element.status = 'Reassigned by Admin';
            element.approved_date = new Date();
            element.reason = str_reason;
            obj_requestInfo.approvals.splice(index + 1, 0, {
              approver_id: reassignedManagerIds,
              status: "Processing",
              approved_date: '',
              reason: '',
              approved_by: [],
              required: 1,
              team_name: ''
            });
            obj_requestInfo.appliction_log.push({
              "approver_id": obj_manager._id,
              "status": "Reassigned by Admin",
              "date_created": new Date(),
              reason: str_reason,
              assigned_to: reassignedManagerIds
            });
            break;
          } else {
            element.status = 'Reassigned by ' + obj_manager.first_name;
            element.approved_date = new Date();
            element.reason = str_reason;
            obj_requestInfo.approvals.splice(index + 1, 0, {
              approver_id: reassignedManagerIds,
              status: "Processing",
              approved_date: '',
              reason: '',
              approved_by: [],
              required: 1,
              team_name: ''
            });
            obj_requestInfo.appliction_log.push({
              "approver_id": obj_manager._id,
              "status": 'Reassigned by ' + obj_manager.first_name,
              "date_created": new Date(),
              reason: str_reason,
              assigned_to: reassignedManagerIds
            });
            break;
          }
        }
      }
      return obj_requestInfo;
    } catch (error) {
      return error;
    }
  };
  
  module.exports = {
    createLieuRequest,
    withdrawLieuRequest,
    approveLieuRequest,
    rejectLieuRequest,
    reassignLieuRequest
  };