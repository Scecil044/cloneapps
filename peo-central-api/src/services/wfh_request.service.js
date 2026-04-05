const {
  Users,
  Companies,
  Requests,
  Notification,
  Approvals,
  Configurations,
  WorkFromHome,
  WfhConfigModel
} = require('../models');
const NotificationHelper = require('../helpers/notification_helper');
const { ObjectId } = require('mongodb');
const { Wfh } = require('@nathangroup/wfh');
const { sendEmailUsingTemplateName } = require('../middlewares/email');
const moment = require('moment-timezone');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();
const { sendNotification, sendEmailfromMs } = require('../controllers/notifications');
const {
  getNewWFHRequestParams,
  getWFHApprovedAdminParams,
  getWFHApprovedParams,
  getWFHRejectedAdminParams,
  getWFHRejectedParams,
  getWFHRequestApproverParams,
  getWFHWithdrawParams
} = require('../emails/wfh.email');

const createWfhRequest = async (reqBody) => {
  console.log("created work from home request=================")
    const uniqueId = crypto.randomBytes(12).toString('hex')
    if (reqBody.is_recurring_required) {
      const { recurring_option, recurring_pattern, recurring_repeat_week } = reqBody
      const startDate = new Date(reqBody.from_date)
      const endDate = new Date(reqBody.to_date)
      const datesInRange = []
      let currentDate = startDate
  
      while (currentDate <= endDate) {
        const currentDayOfWeek = currentDate.toLocaleString('en-us', { weekday: 'long' })
        if (['Daily', 'Weekly'].includes(recurring_option) && recurring_pattern.includes(currentDayOfWeek)) datesInRange.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
        if (recurring_option === 'Weekly' && currentDate.getDay() === 1) currentDate.setDate(currentDate.getDate() + (7 * (recurring_repeat_week - 1)))
      }
  
      const wfHRequests = []
      for (const date of datesInRange) {
        const wfhRequestPayload = { ...reqBody }
        wfhRequestPayload.from_date = date.toISOString().split('T')[0]
        wfhRequestPayload.to_date = date.toISOString().split('T')[0]
        const wfhRequest = await createSingleWfhRequest(wfhRequestPayload, uniqueId)
        wfHRequests.push(wfhRequest)
      }
  
      return { success: true, message: 'Success', data: wfHRequests }
    } else {
      return await createSingleWfhRequest(reqBody)
    }
  }
  
  // Create new WFH Request
  const createSingleWfhRequest = async (reqBody, uniqueId = null, reqHeaderHost) => {
    const applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) }).select({
      reporting: 1,
      personal: 1,
      first_name: 1,
      last_name: 1,
      company_ID: 1,
      email: 1,
    });
    const applied_manager = await Users.findOne({ _id: new ObjectId(reqBody.applied_manager) }).select({
      personal: 1,
      first_name: 1,
      last_name: 1,
    });
    let applicant_approvals = await Approvals.find({ user_id: new ObjectId(reqBody.user_id), module: 'wfh' });
    if (!applicant_approvals || applicant_approvals.length === 0) {
      return { success: false, message: 'Approval flow not set for this User', data: [] };
    }
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
      const lengthDifference = originalApproversLength - uniqueApproversLength
      applicant_approvals[0].approvers[level_no] = uniqueApprovers
      applicant_approvals[0].required_approvers[level_no].required_number = Math.max(originalRequiredApprovers - (lengthDifference < 0 ? 0 : lengthDifference), 1)
    }
  
    const WfhObj = new Wfh();
    if (!applicant || applicant.length === 0 || !applied_manager || applied_manager.length === 0) {
      return { success: false, message: 'Unable to find the User / Manager', data: [] };
    }
    let applicants_company = await Companies.findOne({ _id: new ObjectId(applicant.company_ID) });
    let insert_wfh = WfhObj.getAddWfhRequest(reqBody, applicant, reqBody.obj_wfh_type, applied_manager, applicant_approvals);
    if (insert_wfh.obj_wfh.approvals[0].reason == 'Auto Approved') {
      insert_wfh.obj_wfh.appliction_log.push({
        approver_id: insert_wfh.obj_wfh.approvals[0].approver_id,
        date_created: new Date(),
        status: 'Approved',
        reason: 'Auto Approved',
      });
    }
  
    if (!insert_wfh || insert_wfh.length === 0) return { success: false, message: 'Unable to Process this request.! Please try again later.', data: [] };
    let recurringObj = {}
    if (uniqueId) recurringObj = { 'letter_fields.unique_id': uniqueId, 'letter_fields.is_recurring_required': true }
    const wfh = new Requests({ ...insert_wfh.obj_wfh, request_type: 'wfh', ...recurringObj });
    const apply_wfh = await wfh.save();
    if (!apply_wfh || apply_wfh.length === 0) {
      return { success: false, message: 'Unable to Apply WFH.! Please Try Again Later', data: [] };
    }
    let arr_users_id = [];
    apply_wfh.approvals.forEach((element) => {
      element?.approver_id.map(async (item) => {
        arr_users_id.push(new ObjectId(item));
      });
    });
    arr_users_id.push(new ObjectId(reqBody.user_id));
    let arr_users = await Users.aggregate([
      { $match: { _id: { $in: arr_users_id } } },
      { $project: { first_name: 1, last_name: 1, middle_name: 1 } },
    ]);
    let approver_id = [];
    for (let i = 0; i < apply_wfh.approvals.length; i++) {
      if (apply_wfh.approvals[i].status.toLowerCase() == 'processing') {
        apply_wfh?.approvals[i]?.approver_id.map(async (item) => {
          approver_id.push(item);
        });
      }
    }
    await NotificationHelper.saveNotification(
      reqBody.user_id,
      reqBody.user_id,
      'Your WFH Request is Submitted. Please check your HR Self service for more details',
      'New WFH Request Submitted',
      '/dashboards/myhr#wfh',
      {
        type: apply_wfh.request_type,
        _id: apply_wfh?._id?.toString() || apply_wfh?.wfh_id?.toString(),
        status: apply_wfh.status,
      }
    );
    await sendNotification(reqBody.user_id, 'New WFH Request Submitted', 'Your WFH Request is Submitted. Please check your HR Self service for more details', process.env.NOTIFICATION_DB_PRODUCT_ID);
    
    
    if (approver_id.length > 0) {
      approver_id.map(async (item) => {
        let first_approver = await Users.findOne({ _id: new ObjectId(item) }).select({
          email: 1,
          personal: 1,
          first_name: 1,
          last_name: 1,
          middle_name: 1,
        });
        await sendEmailUsingTemplateName(
          'wfh_request_email_approver',
          getWFHRequestApproverParams(apply_wfh, applicants_company, applicant, first_approver),
          applicants_company._id,
          reqBody.user_id,
          "wfh",
          [first_approver.email]
        )
  
        const emailDetails = {
      
          email_address: "donotreply@nathanhr.ae",
          receiver_email: "david@nathandigital.com",
          subject: "New Work From home Request awaits your approval",
          text: "New Work From home Request awaits your approval",
          html: "New Work From home Request awaits your approval",
          cc: ""
          // "attachments": [
          //     {
          //         "filename": "image.jpg",
          //         "path": "https://nathanhr.com"
          //     }
          // ]
      
    };
  
        sendEmailfromMs();
        /*let approver_email = Emails.funWFHRequestApprovalManager(apply_wfh, applicants_company, applicant, first_approver);
        let req_id = apply_wfh._id.toString();
        let req_type = 'wfh';
        let combinedReqIdAndType = req_id + '/' + req_type;
        if (reqHeaderHost == 'localhost:4100') {
          approver_email.body = approver_email.body.replace('https://hrdirect-staging.devnhr.com', 'http://localhost:5102');
          approver_email.body = approver_email.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102');
        }
        approver_email.body = approver_email.body.replace(
          'dashboards/my-team#requests',
          'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
        );
        sendEmail([first_approver.email], approver_email.subject, approver_email.body);*/
        notifications('approver', 'approver', apply_wfh, first_approver, applicant);
      });
    } else {
      await sendEmailUsingTemplateName(
        'wfh_request_approved',
        getWFHApprovedParams(apply_wfh, applicants_company, applicant, arr_users),
        applicants_company._id,
        reqBody.user_id,
        "wfh"
      );
        
      /*let applicant_email = Emails.funWFHApproved(apply_wfh, applicants_company, applicant, arr_users);
      sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
      let approver = await Users.findOne({ _id: new ObjectId(apply_wfh.approvals[0].approver_id) });
      notifications('applicant', 'approved', apply_wfh, approver, applicant);
    }
    await sendEmailUsingTemplateName(
      'wfh_request_email_employee',
      getNewWFHRequestParams(apply_wfh, applicants_company, applicant, arr_users),
      applicants_company._id,
      reqBody.user_id,
      "wfh"
    );
    /*let applicant_email = Emails.funNewWFHRequest(apply_wfh, applicants_company, applicant, arr_users);
    sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    return { success: true, message: 'Success', data: { ...apply_wfh._doc, id: apply_wfh._doc._id } };
  };
  
  // Withdraw WFH Request
  const withdrawWfhRequest = async (reqBody) => {
    let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
    if (!applicant || applicant.length === 0) {
      return { success: false, message: 'Unable to find the User.!', data: [] };
    }
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
        updatedBy: new ObjectId(reqBody.user_id),
        'approvals.$[].status': 'Withdrawn by Employee',
      },
      $push: { appliction_log: logs },
    };
    let update_match = { _id: new ObjectId(reqBody.wfh_id) };
    let update_wfh = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
    if (!update_wfh || update_wfh.length === 0) {
      return { success: false, message: 'Unable to Process this Request.! Please Try Again Later.', data: [] };
    }
    let updateData = { $set: { 'approvals.$.status': 'Withdrawn by Employee' } };
    let updateMatch = { _id: new ObjectId(reqBody.wfh_id), 'approvals.status': 'Processing' };
    let update_wfh_approval = await Requests.findOneAndUpdate(updateMatch, updateData, { new: true });
    let applicants_company = await Companies.findOne({ _id: new ObjectId(applicant.company_ID) });
    await sendEmailUsingTemplateName(
      'wfh_request_withdrawn',
      getWFHWithdrawParams(update_wfh, applicants_company, applicant),
      applicants_company._id,
      reqBody.user_id,
      "wfh"
    );
    notifications('applicant', 'withdrawn', update_wfh, applicant, applicant);
    return { success: true, message: 'Success', data: update_wfh };
  };
  
  // Approve WFH Request
  const approveWfhRequest = async (reqBody, reqHeaderHost) => {
    let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
    let obj_approver = await Users.findOne({ _id: new ObjectId(reqBody.manager_id) });
    let approver = JSON.parse(JSON.stringify(obj_approver));
    let wfh_req = await Requests.findOne({ _id: new ObjectId(reqBody.wfh_id) });
    let WFHObj = new Wfh();
    if (!applicant || applicant.length === 0 || !approver || approver.length === 0 || !wfh_req || wfh_req.length === 0) {
      return { success: false, message: 'Unable to find User / Approver / Request.', data: [] };
    }
    const pending_approvals = wfh_req.approvals.filter(
      (approval) =>
        (approval.approver_id.some(approver => approver.toString() == reqBody.manager_id) || reqBody.admin)
        && (approval.status.toLowerCase() === 'processing' || approval.status.toLowerCase() === 'pending')
    );
    if (pending_approvals.length === 0) {
      return { success: false, message: 'Request already approved/rejected', data: [] }
    }
    let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_ID) });
    let arr_users_id = [];
    wfh_req.approvals.forEach((element) => {
      element?.approver_id.map(async (item) => {
        arr_users_id.push(new ObjectId(item));
      });
    });
    if (reqBody?.approver_attachment?.length > 0) {
      if (wfh_req.approvals && wfh_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < wfh_req.approvals.length; approval_index++) {
          const element = wfh_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = reqBody.hide_attachment;
            element.approver_attachment = reqBody.approver_attachment;
            break;
          }
        }
      }
    }
  
    let arr_users = await Users.aggregate([
      { $match: { _id: { $in: arr_users_id } } },
      { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
    ]);
    let approveWfh = {};
    if (reqBody.admin) {
      approveWfh = WFHObj.funAdminWFHApprove(wfh_req, reqBody.reason, approver, arr_users);
    } else {
     // TODO: update package to check with string Id
      approver._id = String(approver._id)
      approveWfh = WFHObj.funManagerWFHApprove(wfh_req, reqBody.reason, approver, arr_users);
    }
    if (!approveWfh || approveWfh.length === 0) {
      return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
    }
    let obj_requestInfo = approveWfh.obj_requestInfo;
    let update_match = { _id: new ObjectId(reqBody.wfh_id) };
    if (obj_requestInfo.status.toLowerCase() == 'completed') {
      obj_requestInfo.app_status = 'Approved';
    } else {
      obj_requestInfo.app_status = 'Processing';
    }
    let update_data = { $set: obj_requestInfo };
    let update_wfh = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
    if (!update_wfh || update_wfh.length === 0) {
      return { success: false, message: 'Unable to Approve this WFH Request.! Please try again Later.', data: [] };
    }
    applicant._id = applicant.id;
    if (obj_requestInfo.status == 'Completed') {
      if (reqBody.admin) {
        await sendEmailUsingTemplateName(
          'wfh_request_approved_admin',
          getWFHApprovedAdminParams(wfh_req, applicant_company, applicant, arr_users, reqBody.reason),
          applicant_company._id,
          reqBody.user_id,
          "wfh"
        );
      } else {
        await sendEmailUsingTemplateName(
          'wfh_request_approved',
          getWFHApprovedParams(wfh_req, applicant_company, applicant, arr_users),
          applicant_company._id,
          reqBody.user_id,
          "wfh"
        );
      }
      notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
    } else {
      approveWfh?.arr_user_email.map(async (item) => {
        let approver_to_email = item.email;
        await sendEmailUsingTemplateName(
          'wfh_request_email_approver',
          getWFHRequestApproverParams(wfh_req, applicant_company, applicant, item),
          applicant_company._id,
          reqBody.user_id,
          "wfh",
          [approver_to_email]
        );
        notifications('approver', 'approver', obj_requestInfo, item, item);
      });
    }
    return { success: true, message: 'Success', data: update_wfh };
  };
  
  // Reject WFH Request
  const rejectWfhRequest = async (reqBody, reqHeaderHost) => {
    let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
    let obj_rejecter = await Users.findOne({ _id: new ObjectId(reqBody.manager_id) });
    let rejecter = JSON.parse(JSON.stringify(obj_rejecter));
    let wfh_req = await Requests.findOne({ _id: new ObjectId(reqBody.wfh_id) });
    let WfhObj = new Wfh();
    if (!applicant || applicant.length === 0 || !rejecter || rejecter.length === 0 || !wfh_req || wfh_req.length === 0) {
      return { success: false, message: 'Unable to Find User / Manager / Request', data: [] };
    }
    const pending_approvals = wfh_req.approvals.filter(
      (approval) =>
        (approval.approver_id.some(approver => approver.toString() == reqBody.manager_id) || reqBody.admin)
        && (approval.status.toLowerCase() === 'processing' || approval.status.toLowerCase() === 'pending')
    );
    if (pending_approvals.length === 0) {
      return { success: false, message: 'Request already approved/rejected', data: [] }
    }
    let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_ID) });
    let arr_users_id = [];
    wfh_req.approvals.forEach((element) => {
      element?.approver_id.map(async (item) => {
        arr_users_id.push(new ObjectId(item));
      });
    });
    if (reqBody?.approver_attachment?.length > 0) {
      if (wfh_req.approvals && wfh_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < wfh_req.approvals.length; approval_index++) {
          const element = wfh_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = reqBody.hide_attachment;
            element.approver_attachment = reqBody.approver_attachment;
            break;
          }
        }
      }
    }
    arr_users_id.push(new ObjectId(reqBody.user_id));
    let arr_users = await Users.aggregate([
      { $match: { _id: { $in: arr_users_id } } },
      { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
    ]);
    let rejectWfh = {};
    if (reqBody.admin) {
      rejectWfh = WfhObj.funAdminWFHReject(wfh_req, reqBody.reason, rejecter, arr_users, applicant_company.rejection_flow);
    } else {
      rejectWfh = WfhObj.funManagerWFHReject(wfh_req, reqBody.reason, rejecter, arr_users, applicant_company.rejection_flow);
    }
    if (!rejectWfh || rejectWfh.length === 0) {
      return { success: false, message: 'Unable to process this request.! Please try again later.', data: [] };
    }
    let obj_requestInfo = rejectWfh.obj_requestInfo;
    let update_match = { _id: new ObjectId(reqBody.wfh_id) };
    if (obj_requestInfo.status.toLowerCase() == 'cancelled') {
      obj_requestInfo.app_status = 'Rejected';
    } else {
      obj_requestInfo.app_status = 'Processing';
    }
    let update_data = { $set: obj_requestInfo };
    let update_wfh = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
    if (!update_wfh || update_wfh.length === 0) {
      return { success: false, message: 'Unable to Reject this WFH Request.! Please try again later', data: [] };
    }
    if (obj_requestInfo.status == 'Cancelled') {
      if (reqBody.admin) {
        await sendEmailUsingTemplateName(
          'wfh_request_rejected_admin',
          getWFHRejectedAdminParams(wfh_req, applicant_company, applicant, arr_users, reqBody.reason),
          applicant_company._id,
          reqBody.user_id,
          "wfh"
        );
      } else {
        await sendEmailUsingTemplateName(
          'wfh_request_rejected',
          getWFHRejectedParams(wfh_req, applicant_company, applicant, arr_users, reqBody.reason),
          applicant_company._id,
          reqBody.user_id,
          "wfh"
        );
      }
      notifications('applicant', 'rejected', obj_requestInfo, rejecter, applicant);
    } else {
      rejectWfh?.arr_user_email.map(async (item) => {
        let approver_to_email = item.email;
        await sendEmailUsingTemplateName(
          'wfh_request_email_approver',
          getWFHRequestApproverParams(wfh_req, applicant_company, applicant, item),
          applicant_company._id,
          reqBody.user_id,
          "wfh",
          [approver_to_email]
        );
        notifications('approver', 'approver', obj_requestInfo, item, applicant);
      });
    }
    //FIXME - Rejecting WFH Request does not send notification to the applicant
    return { success: true, message: 'Success', data: update_wfh };
  };
  
  // Reassign WFH Request
  const reassignWfhRequest = async (reqBody, reqHeaderHost) => {
    let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
    let approver = await Users.findOne({ _id: new ObjectId(reqBody.manager_id) });
    const reassignManagerIds = reqBody.reassign_manager_id.map((id) => new ObjectId(id));
    const reassigned_manager = await Users.find({ _id: { $in: reassignManagerIds } });
    let wfh_req = await Requests.findOne({ _id: new ObjectId(reqBody.wfh_id) });
    let WFHObj = new Wfh();
    if (reqBody?.approver_attachment?.length > 0) {
      if (wfh_req.approvals && wfh_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < wfh_req.approvals.length; approval_index++) {
          const element = wfh_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = reqBody.hide_attachment;
            element.approver_attachment = reqBody.approver_attachment;
            break;
          }
        }
      }
    }
    if (
      !applicant ||
      applicant.length === 0 ||
      !approver ||
      approver.length === 0 ||
      !wfh_req ||
      wfh_req.length === 0 ||
      !reassigned_manager ||
      reassigned_manager.length === 0
    ) {
      return { success: false, message: 'Unable to Find User / Manager / Request', data: [] };
    }
    let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_ID) });
    let reassign_wfh = WFHObj.funReassignWFH(wfh_req, reqBody.reason, approver, reassigned_manager, reqBody.admin);
    let update_match = { _id: new ObjectId(reqBody.wfh_id) };
    let update_data = { $set: reassign_wfh };
    let update_wfh = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
    if (!update_wfh || update_wfh.length === 0) {
      return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
    }
    reassigned_manager.map(async (item) => {
      let approver_to_email = item.email;
      await sendEmailUsingTemplateName(
        'wfh_request_reassigned',
        getWFHRequestApproverParams(wfh_req, applicant_company, applicant, item),
        applicant_company._id,
        reqBody.user_id,
        "wfh",
        [approver_to_email]
      );
      notifications('approver', 'approver', update_wfh, item, applicant);
    });
    return { success: true, message: 'Success', data: update_wfh };
  };
  
  // Create Notification for WFH Request
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
          type: {
            type: obj_request.request_type,
            _id: obj_request?._id?.toString() || obj_request?.wfh_id?.toString(),
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
            notification_type: 'WFH Request Approved',
            notification_text: 'Your WFH Request is Approved. Please check your HR Self service for more details.',
            created_by: approver._id,
            url: '/dashboards/myhr#wfh',
            createdDate: new Date(),
            type: {
              type: obj_request.request_type,
              _id: obj_request?._id?.toString() || obj_request?.wfh_id?.toString(),
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
            notification_type: 'WFH Request Withdrawn',
            notification_text: 'Your WFH Request is Withdrawn. Please check your HR Self service for more details.',
            created_by: approver._id,
            url: '/dashboards/myhr#wfh',
            createdDate: new Date(),
            type: {
              type: obj_request.request_type,
              _id: obj_request?._id?.toString() || obj_request?.wfh_id?.toString(),
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
            notification_type: 'WFH Request Rejected',
            notification_text: 'Your WFH Request is Rejected. Please check your HR Self service for more details',
            created_by: approver._id,
            url: '/dashboards/myhr#wfh',
            createdDate: new Date(),
            type: {
              type: obj_request.request_type,
              _id: obj_request?._id?.toString() || obj_request?.wfh_id?.toString(),
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
  
  // Get the Total WorkFrom Home Counts of the User
  const getUserWfhCount = async (reqBody) => {
    const dateNow = new Date().toISOString().substr(0, 10);
    let year_now = dateNow.slice(0, 4);
    let count = 0;
    const requests = await Requests.find({ request_type: 'wfh', user_id: new ObjectId(reqBody?.user_id) });
    for (let i = 0; i < requests.length; i++) {
      let from_date = new Date(requests[i].from_date).getFullYear();
      if (from_date == year_now && requests[i].status === 'Completed') {
        count += parseFloat(requests[i].no_of_days);
      }
    }
    return { success: true, message: 'Success', data: count };
  };
  
  // Get All Work From Home
  const getAllWFHRequests = async (reqBody) => {
    let skipCount = parseInt(reqBody?.skip);
    let pageLimit = parseInt(reqBody?.limit);
    let userType = reqBody?.userType;
    let user_id = reqBody?.user_id;
    let match = { $match: {} };
    if (userType == 'ADMIN') {
      match = { $match: { request_type: 'wfh' } };
    } else if (userType == 'MANAGER') {
      match = {
        $match: {
          request_type: 'wfh',
          approvals: {
            $elemMatch: { approver_id: user_id },
          },
        },
      };
    } else {
      match = {
        $match: {
          request_type: 'wfh',
          user_id: new ObjectId(user_id),
        },
      };
    }
    const requests = await Requests.aggregate([
      match, // The $match stage based on userType and user_id
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
  
    if (!requests) {
      return { success: false, message: 'Unable to find WFH Request', data: [] };
    }
    return { success: true, message: 'Success', data: requests };
  };
  
  // Get WFH on Department
  const wfhDept = async (reqBody) => {
    const users = await Users.find({ 'reporting.department': reqBody?.dept, 'company_ID': reqBody?.company_ID, user_status: 'Active' });
    if (!users || users.length === 0) {
      return { success: false, message: 'No active users found in the department', data: [] };
    }
    const userIds = users.map((user) => user._id);
    const wfhRequests = await Requests.find({
      request_type: 'wfh',
      user_id: { $in: userIds },
      $or: [{ status: 'Completed' }, { status: 'Processing' }],
    });
    if (!wfhRequests || wfhRequests.length === 0) {
      return { success: false, message: 'No WFH requests found for the specified criteria', data: [] };
    }
    return { success: true, message: 'Success', data: wfhRequests };
  };
  
  // Get Number of WFH Days
  const getNumOfWfhDays = async (reqBody) => {
  
    const applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) }).select({
      personal: 1,
      reporting: 1,
      employment: 1,
      date_of_joining: 1,
      company_ID: 1,
    });
    const configuration = await Companies.findOne({ _id: ObjectId(applicant.company_id)}).select({ holiday_calendar: 1 });
    const wfhconfiguration = await WfhConfigModel.findOne({ company_ID: applicant.company_id }).select({ wfhConds: 1 });
    let WfhObj = new Wfh();
    for (let index = 0; index < wfhconfiguration?.wfhConds?.length; index++) {
      var wfh_condition = wfhconfiguration.wfhConds[index];
      let match = {};
      let project = {};
      if (wfh_condition.lapse_condition) {
        var lapse_date_end = new Date(wfh_condition.lapse_date);
        var lapse_date_begin = new Date(lapse_date_end.getTime() - 365 * 24 * 60 * 60 * 1000);
        match = {
          $match: {
            request_type: 'wfh',
            user_id: new ObjectId(reqBody.user_id),
            status: { $nin: ['Cancelled', 'Withdrawn'] },
            from_date: { $gte: lapse_date_begin, $lt: lapse_date_end },
            to_date: { $gt: lapse_date_begin, $lte: lapse_date_end },
          },
        };
      } else {
        match = {
          $match: {
            request_type: 'wfh',
            user_id: new ObjectId(reqBody.user_id),
            status: { $nin: ['Cancelled', 'Withdrawn'] },
          },
        };
      }
      let users_wfh_total_prevdays = await Requests.aggregate([
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
        let accessCheck = WfhObj.funCheckUserAccess(wfh_condition, applicant);
        if (accessCheck) {
          if (users_wfh_total_prevdays.length == 0) {
            users_wfh_total_prevdays = [{ _id: null, total_days: 0 }];
          }
          let maxdayCheck = WfhObj.funCheckUserMaxDays(wfh_condition, applicant, users_wfh_total_prevdays);
          if (maxdayCheck) {
            let match = {
              $match: {
                request_type: 'wfh',
                user_id: new ObjectId(reqBody.user_id),
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
            const user_wfh = await Requests.aggregate([match, project]);
            let from_date = new Date(reqBody.from_date);
            let to_date = new Date(reqBody.to_date);
            let existing_wfhs = hasExistingWfhCheck(user_wfh, from_date, to_date);
            if (!existing_wfhs) {
              if (applicant && configuration) {
                let holiday_calendar = configuration?.holiday_calendar.filter(holiday => !holiday.deleted);
                let declared_holidays = getDeclaredHolidays(holiday_calendar);
                const applicants_work_schedule = await Configurations.aggregate([
                  { $match: { 'company_work_schedules.id': applicant.personal.work_schedule } },
                  {
                    $project: {
                      weekends: {
                        $filter: {
                          input: '$company_work_schedules',
                          as: 'schedule',
                          cond: { $eq: ['$$schedule.id', applicant.personal.work_schedule] },
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
                  applicant?.personal?.work_schedule &&
                  (applicant.personal.work_schedule.toLowerCase() == 'shift based' ||
                    applicant.personal.work_schedule.toLowerCase() == 'alternate weekends')
                ) {
                  let wfhs_info = await getShiftandAlternateEmployees(applicant.personal.work_schedule, reqBody, applicant);
                  return { success: true, message: 'Success', data: wfhs_info };
                } else {
                  let number_of_days = WfhObj.getNumberofDays(reqBody, declared_holidays, weekends, reqBody.obj_wfh_type);
                  if (reqBody.half_day) number_of_days.no_of_days = number_of_days.no_of_days / 2;
                  if (wfh_condition.restriction_conditional && number_of_days) {
                    let startdate;
                    let endtdate;
                    let start_number;
                    let end_number;
                    let start_year = moment(reqBody.from_date, 'YYYY-MM-DD').year();
                    let end_year = moment(reqBody.to_date, 'YYYY-MM-DD').year();
                    if (wfh_condition.restriction_type == 'weekly') {
                      start_number = moment(reqBody.from_date, 'YYYY-MM-DD').isoWeek();
                      end_number = moment(reqBody.to_date, 'YYYY-MM-DD').isoWeek();
                      end_number = end_number + (end_year - start_year) * 52;
                      startdate = moment().isoWeek(start_number).year(start_year).startOf('week').toDate();
                      endtdate = moment().isoWeek(end_number).year(end_year).endOf('week').toDate();
                    } else if (wfh_condition.restriction_type == 'monthly') {
                      start_number = moment(reqBody.from_date, 'YYYY-MM-DD').month();
                      end_number = moment(reqBody.to_date, 'YYYY-MM-DD').month();
                      end_number = end_number + (end_year - start_year) * 12;
                      startdate = moment().month(start_number).year(start_year).startOf('month').toDate();
                      endtdate = moment().month(end_number).year(end_year).endOf('month').toDate();
                    }
                    match = {
                      $match: {
                        user_id: reqBody.user_id,
                        status: { $nin: ['Cancelled', 'Withdrawn'] },
                        from_date: { $gte: startdate, $lt: endtdate },
                        to_date: { $gt: startdate, $lte: endtdate },
                      },
                    };
                    let users_wfh_interval_prevdays = await Requests.aggregate([
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
                    let restrictionCheck = WfhObj.funCheckUserRestrictionCheck(
                      wfh_condition,
                      number_of_days,
                      users_wfh_interval_prevdays,
                      start_number,
                      end_number
                    );
                    if (restrictionCheck) {
                      return { success: true, message: 'Success', data: number_of_days };
                    } else {
                      if (wfhconfiguration.wfhConds.length == index + 1) {
                        return {
                          success: false,
                          message: 'You already reach the max restriction for this duration to apply Work From Home.',
                          data: [],
                        };
                      }
                    }
                  } else {
                    if (number_of_days) {
                      return { success: true, message: 'Success', data: number_of_days };
                    }
                  }
                }
              } else {
                return { success: false, message: 'User not found.', data: [] };
              }
            } else {
              return { success: false, message: 'You already applied for WFH within this period.', data: [] };
            }
          } else {
            if (wfhconfiguration.wfhConds.length == index + 1) {
              return { success: false, message: 'You reach the max Work From Home days limit.', data: [] };
            }
          }
        } else {
          if (wfhconfiguration.wfhConds.length == index + 1) {
            return { success: false, message: 'You are not eligible for this duration to apply Work From Home.', data: [] };
          }
        }
      } else {
        if (wfhconfiguration.wfhConds.length == index + 1) {
          let periodStart, periodEnd;
          const fromDate = new Date(reqBody.from_date);
          const toDate = new Date(reqBody.to_date);
          if (wfh_condition.restriction_type == 'weekly') {
            periodStart = new Date(fromDate);
            periodEnd = new Date(toDate);
            periodStart.setDate(periodStart.getDate() - periodStart.getDay()); // Start of the week (Sunday)
            periodEnd.setDate(periodEnd.getDate() + (6 - periodEnd.getDay())); // End of the week (Saturday)
          } else if (wfh_condition.restriction_type == 'monthly') {
            periodStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1); // Start of the month
            periodEnd = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0); // End of the month
          }
          // Match the WFH days taken by the user within the period
          const match = {
            $match: {
              user_id: reqBody.user_id,
              status: { $nin: ['Cancelled', 'Withdrawn'] },
              from_date: { $gte: periodStart, $lt: periodEnd },
              to_date: { $gt: periodStart, $lte: periodEnd },
            },
          };
          // Aggregate to count the WFH days within the period
          const aggregationPipeline = [
            match,
            {
              $project: {
                dayDifference: {
                  $divide:
                  [
                    { $subtract: ["$to_date", "$to_date"] },
                    1000 * 60 * 60 * 24
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalDays: { $sum: "$dayDifference" }
              }
            }
          ];
          const result = await Requests.aggregate(aggregationPipeline);
          const takenDays = result.length > 0 ? result[0].totalDays : 0;
          const balanceDays = wfh_condition.restriction_days - takenDays;
          const number_of_days = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;
          return { success: false, message: `Your ${balanceDays} days balance is insufficient for a ${number_of_days} work from home request. Your company limits you to a ${wfh_condition.restriction_days}-day ${wfh_condition.restriction_type} restriction`, data: [] };
        }
      }
    }
  };
  
  // Get All WFH Requests on UserID
  const getAllWfhRequestsOnUserId = async (reqBody) => {
    const user_id = reqBody?.user_id;
    const company_wise = reqBody?.company_wise;
  
    
    // Fetch the company ID of the requesting user
    const requestingUser = await Users.findById(user_id);
    if (!requestingUser) {
      return { success: false, message: 'User not found', data: [] };
    }
    const company_id = requestingUser.company_ID;
  
    let lookup_wfhs = {
      $lookup: {
        from: 'requests',
        let: {
          userid: '$user_id',
        },
        pipeline: [
          {
            $match: {
              request_type: 'wfh',
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
  
    let matchStage = company_wise ?
      {
        $match: {
          user_status: { $nin: ['Inactive'] },
          company_ID: company_id,
        }
      } :
      {
        $match: {
          'reporting.manager': user_id,
          user_status: { $nin: ['Inactive'] },
        }
      };
  
    const requestsData = await Users.aggregate([
      matchStage,
      {
        $addFields: { employee_id: { $toString: '$_id' } },
      },
      {
        $group: { _id: null, array: { $push: { user_id: '$_id' } } },
      },
      {
        $project: { _id: 0, user_id: '$array.user_id' },
      },
      lookup_wfhs,
    ]);
    if (!requestsData) {
      return { success: false, message: 'End of Request Data', data: [] };
    }
    return { success: true, message: 'Successfully displaying Request', data: requestsData };
  };
  
  // Supporting Functions
  
  // Get wfh for shift for Alternate weekend based employees
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
  
  function getDeclaredHolidays(holiday_calendar) {
    try {
      let getDays = function (startDate, endDate) {
        const duration = endDate - startDate;
        const interval = 1000 * 60 * 60 * 24;
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
      return [...new Set(declared_holidays)];
    } catch (e) {
      return e;
    }
  }
  
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
  
  async function getAllWfhRequestsToday(reqBody) {
    let match = {
      $match: {
        request_type: 'wfh',
        status: { $nin: ['Cancelled', 'Withdrawn'] },
        from_date: { $lte: new Date() },
        to_date: { $gte: new Date() },
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
    const user_wfh = await Requests.aggregate([match, project]);
    return { success: true, message: 'Success', data: user_wfh };
  }
  
  const getUserWfhRequests = async (userId, date) => {
    const requests = await Requests.find({
      user_id: ObjectId(userId),
      request_type: 'wfh',
      status: { $nin: ['Cancelled', 'Withdrawn'] },
      $or: [{ from_date: { $lte: date }, to_date: { $gte: date } }],
    });
    return {
      success: true,
      message: 'Success',
      data: requests.length > 0,
    };
  }
  
  module.exports = {
    createWfhRequest,
    withdrawWfhRequest,
    approveWfhRequest,
    rejectWfhRequest,
    reassignWfhRequest,
    getUserWfhCount,
    getAllWFHRequests,
    wfhDept,
    getNumOfWfhDays,
    getAllWfhRequestsOnUserId,
    getAllWfhRequestsToday,
    getUserWfhRequests
  };
  
