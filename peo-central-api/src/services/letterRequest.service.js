const { Requests, Users, Companies, Approvals, Notification } = require('../models');
const { ObjectId } = require('mongodb');
const LogsHelper = require('../helpers/logs_helper');
const NotificationHelper = require('../helpers/notification_helper');
const { Letters } = require('../helpers/letter');
const LettersHelper = require('../helpers/letters_helper');
const { _, toLower } = require('lodash');
const { sendEmailUsingTemplateName } = require('../middlewares/email');
const moment = require('moment-timezone');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { capitalize, singular } = require('../helpers/common');
const {
  getNewLetterRequestParams,
  getLetterWithdrawParams,
  getNewLetterRequestApproverParams,
  getLetterApprovedParams,
  getLetterApprovedAdminParams,
  getLetterRejectedAdminParams
} = require('../emails/letter.email');
const letterConfigService = require('./letterConfig.service');
const dotenv = require('dotenv');
dotenv.config();
const { sendNotification } = require('../controllers/notifications');


// Create a new Letter Request
const createLetterRequest = async (reqBody, reqHeaderHost) => {
  try{
    let created_user = reqBody.created_user ? reqBody.created_user : reqBody.user_id;
  const appliedManager = await Users.findOne({ _id: ObjectId(created_user) }, { first_name: 1 });
  // console.log(appliedManager, "applied mgr")
  var letterType = reqBody.letter_type;
  // console.log(letterType, "this is the letter type")
  var letterSubType = reqBody.letter_sub_type || '';
  // console.log(letterSubType, "is the letter sub type")
  reqBody.letter_fields = reqBody.letter_fields || {};
  var user_id = reqBody.user_id;
  var claimsRequestFinal;
  var approverArray = [];
  let userDetails = await Users.find({ _id: user_id });
  // console.log(userDetails[0].first_name, "is the user first name")
  if (!userDetails || userDetails.length === 0) return { success: false, message: 'Unable to find the User', data: [] };
  if (!userDetails[0].reporting.manager)
    return { success: false, message: 'No reporting manager assigned to the user.', data: [] };
  // console.log(userDetails[0].reporting.manager, "is the reporting manager id+++++++++")
  // console.log(userDetails[0].company_id, "this is the company id to search")

  // check for limit
  const letterRequestsConfig = await letterConfigService.listLetterRequestsbyCompanyID({
    company_ID: userDetails[0].company_id
  });
  const letterRequestConfig = letterRequestsConfig.find(
    config => config.letterDescription.requestType == letterType && config.letterDescription.requestSubType == letterSubType
  );
  const { is_limit_required, request_limit, limit_period, limit_exceed_action } = letterRequestConfig;
  let isAction = false;

  if (is_limit_required) {
    const startDate =
      limit_period === 'ytd'
        ? new Date(new Date().getFullYear(), 0, 1)
        : new Date(new Date().setDate(new Date().getDate() - limit_period));
    const endDate = new Date();
    const requests = await Requests.find({
      user_id: userDetails[0]._id,
      request_type: 'letters',
      letter_type: letterType,
      letter_sub_type: letterSubType,
      date_created: { $gte: startDate, $lt: endDate }
    });
    if (requests.length >= request_limit) {
      if (limit_exceed_action === 'restrictCreation')
        return { success: false, message: 'Request limit reached per period.', data: [] };
      else if (limit_exceed_action === 'notifyLineManager') isAction = true;
    }
  }

  let applicant_approvals = await Approvals.find({ user_id: ObjectId(reqBody.user_id), module: 'letter' });
  if (!applicant_approvals || applicant_approvals.length === 0)
    return { success: false, message: 'Approval flow not set for this User', data: [] };
  const lineManager = await Users.findOne({ _id: ObjectId(userDetails[0].reporting.manager) }, { reporting: 1 });

  for (var index = 0; index < applicant_approvals[0].approvers.approver_levels; index++) {
    var total = index + 1;
    var level_no = 'level_' + total;
    applicant_approvals[0].approvers[level_no] = applicant_approvals[0].approvers[level_no].map(elem => {
      if (elem === 'line_manager_id') return userDetails[0].reporting.manager;
      else if (elem === 'senior_manager_id') return lineManager?.reporting.manager;
      else return elem;
    });
    const originalRequiredApprovers = applicant_approvals[0].required_approvers[level_no].required_number;
    const originalApproversLength = applicant_approvals[0].approvers[level_no].length;
    const uniqueApprovers = [...new Set(applicant_approvals[0].approvers[level_no])];
    const uniqueApproversLength = uniqueApprovers.length;
    const lengthDiference = originalApproversLength - uniqueApproversLength;
    applicant_approvals[0].approvers[level_no] = uniqueApprovers;
    applicant_approvals[0].required_approvers[level_no].required_number = Math.max(
      originalRequiredApprovers - (lengthDiference < 0 ? 0 : lengthDiference),
      1
    );
  }

  let employee_approvalflow = applicant_approvals[0]?.approvers;
  let required_approvers = applicant_approvals[0]?.required_approvers;

  for (let index = 0; index < employee_approvalflow.approver_levels; index++) {
    let total = index + 1;
    let level_no = 'level_' + total;

    let approval_obj = {
      approver_id: employee_approvalflow[level_no],
      status: '',
      approved_date: '',
      comments: [],
      reason: '',
      approved_by: [],
      required: required_approvers[level_no].required_number,
      team_name: required_approvers[level_no].team_name
    };

    index == 0 ? (approval_obj.status = 'Processing') : (approval_obj.status = 'Pending');
    approverArray.push(approval_obj);
  }

  let objLetterInfo = reqBody.letter_fields || {};
  reqBody.letter_fields || {};
  var hash = (+new Date()).toString(36);
  let random_key = (Math.random() + 1).toString(36).substring(7);
  const random_id = () => parseInt(Date.now() * Math.random());
  reqBody.foreign_key = hash + random_key + random_id();
  let response = await letterConfigService.listLetterConfigbyCompanyID({
    company_ID: userDetails[0].company_id,
    letterRequest: 1
  });
  
  let configData = response.data;
  // console.log(configData, "is the config data")
  // console.log(letterType, "is the letter type")
  // console.log(reqBody.letter_sub_type, "is the sub type")
  // console.log(configData.letterRequest, "list all")
  
  // console.log('==============================> proceeding with function execution')
  var FinalPayload = LettersHelper.getLetterRequestDetails(letterType, reqBody.letter_sub_type, configData);
  var PdfStyleData = await LettersHelper.getPdfStylesData(FinalPayload, reqBody.request_type, reqBody.letter_sub_type);
  var PreviewStyleData = await LettersHelper.getPreviewStylesData(
    FinalPayload,
    reqBody.request_type,
    reqBody.letter_sub_type
  );
  var LetterImageData = await LettersHelper.getLetterImagesData(reqBody.company_id);
  var LetterSignatoryData = await LettersHelper.getLetterSignatoryData(reqBody.company_id);
  var LetterTemplateData = await LettersHelper.getLetterTemplateData(FinalPayload);
  var LetterAditionalfieldData = await LettersHelper.getLetterAdditionalFieldData(reqBody);
  var LetterkeyUpdatewithValue = await LettersHelper.updateLetterDataWithLetterKeys(reqBody, FinalPayload);
  reqBody.letter_fields['date'] = moment(new Date()).format('YYYY-MM-DD');
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  reqBody.letter_fields['day'] = weekday[new Date().getDay()];
  reqBody.letter_fields['addressee'] = LetterTemplateData.addressee;
  reqBody.letter_fields['subject'] = LetterTemplateData.subject;
  reqBody.letter_fields['body'] = LetterTemplateData.body;
  // Custom Letter Type Data Fields
  if (
    FinalPayload?.letterDescription?.requestType &&
    FinalPayload.letterDescription.requestType === 'Custom Letter Requests'
  ) {
    reqBody.letter_fields['date'] = moment(new Date()).format('YYYY-MM-DD');
    reqBody.letter_fields['addressee'] = reqBody?.letter_keys?.other_requests_to_address_1;
    reqBody.letter_fields['subject'] = reqBody?.letter_keys?.other_requests_subject;
    reqBody.letter_fields['body'] = reqBody?.letter_keys?.other_requests_body_1;
    reqBody.letter_fields['other_requests_to_address_1'] = reqBody?.letter_keys?.other_requests_to_address_1;
    reqBody.letter_fields['other_requests_subject'] = reqBody?.letter_keys?.other_requests_subject;
    reqBody.letter_fields['other_requests_body_1'] = reqBody?.letter_keys?.other_requests_body_1;
  }
  reqBody.letter_fields['name'] = LetterAditionalfieldData?.user_name;
  reqBody.letter_fields['emp_id'] = LetterAditionalfieldData?.emp_id;
  reqBody.letter_fields['passport_number'] = LetterAditionalfieldData?.passport;
  reqBody.letter_fields['role'] = LetterAditionalfieldData?.role;
  reqBody.letter_fields['total_fixed'] = LetterAditionalfieldData?.total_fixed;
  reqBody.letter_fields['basic_salary'] = LetterAditionalfieldData?.basic_salary;
  reqBody.letter_fields['work_start_date'] = LetterAditionalfieldData?.work_start_date;
  reqBody.letter_fields['total_fixed_word'] = LetterAditionalfieldData?.total_fixed_word;
  reqBody.letter_fields['basic_salary_word'] = LetterAditionalfieldData?.basic_salary_word;
  reqBody.letter_fields['nationality'] = LetterAditionalfieldData?.nationality;
  reqBody.letter_fields['passport'] = LetterAditionalfieldData?.passport;
  reqBody.letter_fields['passportNumber'] = LetterAditionalfieldData?.passport;
  reqBody.letter_fields['passportIssueDate'] = LetterAditionalfieldData?.passportissue;
  reqBody.letter_fields['passportExpiryDate'] = LetterAditionalfieldData?.passportexpiry;
  reqBody.letter_fields['bank'] = LetterAditionalfieldData?.bank;
  reqBody.letter_fields['iban'] = LetterAditionalfieldData?.iban;
  reqBody.letter_fields['bankAccountNumber'] = LetterAditionalfieldData?.account_number;
  reqBody.letter_fields['gender'] = LetterAditionalfieldData?.gender;
  reqBody.letter_fields['department'] = LetterAditionalfieldData?.department;
  reqBody.letter_fields['marital_status'] = LetterAditionalfieldData?.marital_status;
  reqBody.letter_fields['title'] = LetterAditionalfieldData?.title;
  reqBody.letter_fields['hard_copy'] = reqBody?.hard_copy;
  reqBody.letter_fields['companyName'] = LetterAditionalfieldData?.company?.company_name;
  reqBody.letter_fields['dob'] = LetterAditionalfieldData?.dob;
  reqBody.letter_fields['accommodation_allowance'] = LetterAditionalfieldData?.accommodation_allowance;
  reqBody.letter_fields['medical_allowance'] = LetterAditionalfieldData?.medical_allowance;
  reqBody.letter_fields['transport_allowance'] = LetterAditionalfieldData?.transport_allowance;
  reqBody.letter_fields['other_allowance'] = LetterAditionalfieldData?.other_allowance;
  reqBody.letter_fields['managername'] = LetterAditionalfieldData?.managername;
  reqBody.letter_fields['manageremail'] = LetterAditionalfieldData?.manageremail;
  reqBody.letter_fields['managerphone'] = LetterAditionalfieldData?.managerphone;
  reqBody.letter_fields['managerheshe'] = LetterAditionalfieldData?.managerheshe;

  var application_log = await LogsHelper.getRequestsApplicationLog(user_id, 'Created');
  claimsRequestFinal = {
    appliction_log: application_log, //add application logs
    file: reqBody?.file,
    contentafter: FinalPayload?.content,
    contentbefore: FinalPayload?.contentbefore,
    approvals: approverArray,
    request_type: 'letters',
    letter_type: reqBody?.letter_type,
    letter_sub_type: reqBody?.letter_sub_type,
    status: 'Processing',
    pdfStyles: PdfStyleData,
    previewStyles: PreviewStyleData,
    letterImages: LetterImageData,
    letter_fields: reqBody?.letter_fields,
    signatory: LetterSignatoryData,
    addressee: LetterTemplateData.addressee,
    subject: LetterTemplateData.subject,
    body: LetterTemplateData?.body,
    user_keys: true,
    letter_keys: LetterkeyUpdatewithValue,
    admin_open_msg: 'closed',
    user_open_msg: 'closed',
    user_id: ObjectId(user_id),
    foreign_key: reqBody?.foreign_key,
    assigned_to: applicant_approvals?.approvers?.level_1,
    company_id: userDetails[0]?.company_ID
  };

  if (approverArray[0].status == 'Processing' && approverArray[0].approver_id.includes(String(created_user))) {
    if (approverArray[0].required === 1) {
      approverArray[0].approved_date = new Date() + '';
      approverArray[0].status = 'Approved by Admin';
      approverArray[0].reason = 'Auto Approved';
      if (approverArray.length - 1 == 0) claimsRequestFinal.status = 'Completed';
      else approverArray[1].status = 'Processing';
    } else {
      const approver = [{ _id: String(created_user), first_name: appliedManager?.first_name }];
      approverArray[0].approved_by = approver;
      claimsRequestFinal.appliction_log.push({
        approver_id: created_user,
        date_created: new Date(),
        status: 'Approved by Admin',
        reason: 'Auto Approved'
      });
    }

    if (reqBody.userType == 'MANAGER') {
      await sendEmailUsingTemplateName(
        'letter_request_auto_approved',
        getLetterApprovedParams(claimsRequestFinal, userDetails[0].company_id, userDetails[0]),
        userDetails[0].company_ID,
        reqBody.user_id,
        'letter'
      );
    } else if (reqBody.userType == 'ADMIN') {
      await sendEmailUsingTemplateName(
        'letter_request_auto_approved_admin',
        getLetterApprovedAdminParams(claimsRequestFinal, userDetails[0].company_id, userDetails[0]),
        userDetails[0].company_ID,
        reqBody.user_id,
        'letter'
      );
    }
  }

  const request = new Requests({ ...claimsRequestFinal });
  await request.save();

  if (isAction && limit_exceed_action === 'notifyLineManager') {
    const { first_name, last_name } = userDetails[0];
    await NotificationHelper.saveNotification(
      userDetails[0]._id.toString(),
      userDetails[0]._id.toString(),
      `You have exceeded the maximum number of ${letterType} request as per period.`,
      `Letter Request Limit Exceeded`,
      '/dashboards/myhr#requests',
      { type: 'letters', _id: request?._id?.toString() || request?.request_id?.toString(), status: request.status }
    );

    await sendNotification(
      userDetails[0]._id.toString(),
      `Letter Request Limit Exceeded`,
      `You have exceeded the maximum number of ${letterType} request as per period.`,
      process.env.NOTIFICATION_DB_PRODUCT_ID
    );
    await NotificationHelper.saveNotification(
      userDetails[0].reporting.manager,
      userDetails[0].reporting.manager,
      `${first_name} ${last_name} has exceeded the maximum number of ${letterType} request.`,
      `Letter Request Limit Exceeded`,
      '/dashboards/myhr#requests',
      { type: 'letters', _id: request?._id?.toString() || request?.request_id?.toString(), status: request.status }
    );
    await sendNotification(
      userDetails[0].reporting.manager,
      `Letter Request Limit Exceeded`,
      `${first_name} ${last_name} has exceeded the maximum number of ${letterType} request.`,
      process.env.NOTIFICATION_DB_PRODUCT_ID
    );
  }
  // BHE(1147) - further actions to be added here . . .

  // Applicant notification
  await NotificationHelper.saveNotification(
    claimsRequestFinal.user_id.toString(),
    claimsRequestFinal.user_id.toString(),
    `Your ${singular(
      capitalize(claimsRequestFinal.request_type)
    )} Request is Submitted. Please check your HR Self service for more details`,
    `New ${singular(capitalize(claimsRequestFinal.request_type))} Request Submitted`,
    '/dashboards/myhr#requests',
    { type: 'letters', _id: request?._id?.toString() || request?.request_id?.toString(), status: request.status }
  );
  await sendNotification(
    claimsRequestFinal.user_id.toString(),
    `New ${singular(capitalize(claimsRequestFinal.request_type))} Request Submitted`,
    `Your ${singular(
      capitalize(claimsRequestFinal.request_type)
    )} Request is Submitted. Please check your HR Self service for more details`,
    process.env.NOTIFICATION_DB_PRODUCT_ID
  );

  const processingApprovers = approverArray.filter(approver => approver.status.toLowerCase() === 'processing');

  for (let z = 0; z < processingApprovers[0]?.approver_id?.length || 0; z++) {
    const curApproverId = processingApprovers[0]?.approver_id[z];
    await NotificationHelper.saveNotification(
      curApproverId,
      curApproverId,
      `New ${singular(capitalize(claimsRequestFinal.request_type))} Request for ${userDetails[0].first_name} ${
        userDetails[0].last_name
      } is pending for your approval`,
      'Letter Request Pending Approval',
      '/dashboards/my-team#requests',
      { type: 'letters', _id: request?._id?.toString() || request?.request_id?.toString(), status: request.status }
    );
    await sendNotification(
      curApproverId,
      'Letter Request Pending Approval',
      `New ${singular(capitalize(claimsRequestFinal.request_type))} Request for ${userDetails[0].first_name} ${
        userDetails[0].last_name
      } is pending for your approval`,
      process.env.NOTIFICATION_DB_PRODUCT_ID
    );
  }
  if (claimsRequestFinal?.approvals?.length) {
    var list_of_approver = [];
    list_of_approver.push(String(claimsRequestFinal.user_id));
    claimsRequestFinal.approvals.forEach(ele => {
      ele?.approver_id.map(async item => {
        list_of_approver.push(ObjectId(item));
      });
    });
    const usersObjects = await Users.find({ _id: { $in: list_of_approver } });
    const companyObject = await Companies.findOne({ _id: userDetails[0].company_id });
    //console.log(companyObject.company_name, 'this is the new name &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    //var emailForUser = lettersEmail.funNewLetterRequest(claimsRequestFinal, companyObject, userDetails[0], usersObjects);
    processingApprovers[0]?.approver_id.forEach(async item => {
      const managerObject = await Users.findOne({ _id: ObjectId(item) });
      await sendEmailUsingTemplateName(
        'letter_request_new_approver',
        getNewLetterRequestApproverParams(claimsRequestFinal, companyObject, userDetails[0], managerObject),
        userDetails[0].company_id,
        reqBody.user_id,
        'letter'
      );
      /*var pendingEmailManager = lettersEmail.funLetterRequestApprovalManager(claimsRequestFinal, companyObject, userDetails[0], managerObject);
            let req_id = request._id.toString()
            let req_type = 'requests'
            let combinedReqIdAndType = req_id + '/' + req_type
            if (reqHeaderHost == 'localhost:4100') {
                pendingEmailManager.body = pendingEmailManager.body.replace('https://hrdirect-staging.devnhr.com', 'http://localhost:5102')
                pendingEmailManager.body = pendingEmailManager.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102')
            }
            pendingEmailManager.body = pendingEmailManager.body.replace('dashboards/my-team#requests', 'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64'))
            sendEmail([managerObject.email], pendingEmailManager.subject, pendingEmailManager.body);*/
    });
    //sendEmail([userDetails[0].email], emailForUsers.subject, emailForUsers.body);
    await sendEmailUsingTemplateName(
      'Employee Email For Letter Request',
      getNewLetterRequestParams(claimsRequestFinal, companyObject, userDetails[0], usersObjects),
      userDetails[0].company_id,
      reqBody.user_id,
      'letter'
    );
  }

  return {
    success: true,
    message: 'Success',
    data: { ...claimsRequestFinal, _id: request?._id, date_created: request?.date_created }
  };
  }catch(error){
    console.log(error)
    throw error
  }
};

// const createLetterRequest = async (reqBody, reqHeaderHost) => {
//     let created_user = reqBody.created_user ? reqBody.created_user : reqBody.user_id;
//     const appliedManager = await Users.findOne({ _id: ObjectId(created_user) }, { first_name: 1 });
//     const letterType = reqBody.letter_type;
//     const letterSubType = reqBody.letter_sub_type || "";
//     reqBody.letter_fields = reqBody.letter_fields || {};
//     const user_id = reqBody.user_id;
//     let claimsRequestFinal;
//     const approverArray = [];
//     const userDetails = await Users.find({ _id: user_id });
//     if (!userDetails || userDetails.length === 0) return { success: false, message: 'Unable to find the User', data: [] };
//     if (!userDetails[0].reporting.manager) return { success: false, message: 'No reporting manager assigned to the user.', data: [] };

//     // check for limit
//     const letterRequestsConfig = await letterConfigService.listLetterRequestsbyCompanyID({ company_ID: userDetails[0].company_ID });
//     const letterRequestConfig = letterRequestsConfig.find(config => (
//         config.letterDescription.requestType == letterType && config.letterDescription.requestSubType == letterSubType
//     ));
//     const { is_limit_required, request_limit, limit_period, limit_exceed_action } = letterRequestConfig;
//     let isAction = false;

//     if (is_limit_required) {
//         const startDate = limit_period === "ytd" ? new Date(new Date().getFullYear(), 0, 1) : new Date(new Date().setDate(new Date().getDate() - limit_period));
//         const endDate = new Date();
//         const requests = await Requests.find({
//             user_id: userDetails[0]._id,
//             request_type: "letters",
//             letter_type: letterType,
//             letter_sub_type: letterSubType,
//             date_created: { $gte: startDate, $lt: endDate }
//         });
//         if (requests.length >= request_limit) {
//             if (limit_exceed_action === "restrictCreation") return { success: false, message: 'Request limit reached per period.', data: [] };
//             else if (limit_exceed_action === "notifyLineManager") isAction = true;
//         }
//     }

//     const applicant_approvals = await Approvals.find({ user_id: ObjectId(reqBody.user_id), module: "letter" });
//     if (!applicant_approvals || applicant_approvals.length === 0) return { success: false, message: "Approval flow not set for this User", data: [] };
//     const lineManager = await Users.findOne({ _id: ObjectId(userDetails[0].reporting.manager) }, { reporting: 1 });

//     for (let index = 0; index < applicant_approvals[0].approvers.approver_levels; index++) {
//         const total = index + 1;
//         const level_no = "level_" + total;
//         applicant_approvals[0].approvers[level_no] = applicant_approvals[0].approvers[level_no].map(elem => {
//             if (elem === "line_manager_id") return userDetails[0].reporting.manager;
//             else if (elem === "senior_manager_id") return lineManager?.reporting.manager;
//             else return elem;
//         });
//         const originalRequiredApprovers = applicant_approvals[0].required_approvers[level_no].required_number;
//         const originalApproversLength = applicant_approvals[0].approvers[level_no].length;
//         const uniqueApprovers = [...new Set(applicant_approvals[0].approvers[level_no])];
//         const uniqueApproversLength = uniqueApprovers.length;
//         const lengthDifference = originalApproversLength - uniqueApproversLength;
//         applicant_approvals[0].approvers[level_no] = uniqueApprovers;
//         applicant_approvals[0].required_approvers[level_no].required_number = Math.max(originalRequiredApprovers - (lengthDifference < 0 ? 0 : lengthDifference), 1);
//     }

//     const employee_approvalflow = applicant_approvals[0]?.approvers;
//     const required_approvers = applicant_approvals[0]?.required_approvers;

//     for (let index = 0; index < employee_approvalflow.approver_levels; index++) {
//         const total = index + 1;
//         const level_no = "level_" + total;

//         const approval_obj = {
//             approver_id: employee_approvalflow[level_no],
//             status: "",
//             approved_date: "",
//             comments: [],
//             reason: '',
//             approved_by: [],
//             required: required_approvers[level_no].required_number,
//             team_name: required_approvers[level_no].team_name
//         };

//         index == 0 ? (approval_obj.status = "Processing") : (approval_obj.status = "Pending");
//         approverArray.push(approval_obj);
//     }

//     let objLetterInfo = reqBody.letter_fields || {};
//     reqBody.letter_fields || {};
//     const hash = (+new Date()).toString(36);
//     const random_key = (Math.random() + 1).toString(36).substring(7);
//     const random_id = () => parseInt(Date.now() * Math.random());
//     reqBody.foreign_key = hash + random_key + random_id();
//     const response = await letterConfigService.listLetterConfigbyCompanyID({
//         company_ID: userDetails[0].company_ID,
//         letterRequest: 1
//     });
//     const configData = response.data;
//     const FinalPayload = LettersHelper.getLetterRequestDetails(letterType, reqBody.letter_sub_type, configData);
//     const PdfStyleData = await LettersHelper.getPdfStylesData(FinalPayload, reqBody.request_type, reqBody.letter_sub_type);
//     const PreviewStyleData = await LettersHelper.getPreviewStylesData(FinalPayload, reqBody.request_type, reqBody.letter_sub_type);
//     const LetterImageData = await LettersHelper.getLetterImagesData(reqBody.company_id);
//     const LetterSignatoryData = await LettersHelper.getLetterSignatoryData(reqBody.company_id);
//     const LetterTemplateData = await LettersHelper.getLetterTemplateData(FinalPayload);
//     const LetterAdditionalFieldData = await LettersHelper.getLetterAdditionalFieldData(reqBody);
//     const LetterKeyUpdateWithValue = await LettersHelper.updateLetterDataWithLetterKeys(reqBody, FinalPayload);

//     reqBody.letter_fields["date"] = moment(new Date()).format("YYYY-MM-DD");
//     const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     reqBody.letter_fields["day"] = weekday[new Date().getDay()];
//     reqBody.letter_fields["addressee"] = LetterTemplateData.addressee;
//     reqBody.letter_fields["subject"] = LetterTemplateData.subject;
//     reqBody.letter_fields["body"] = LetterTemplateData.body;

//     // Custom Letter Type Data Fields
//     if (FinalPayload?.letterDescription?.requestType && FinalPayload.letterDescription.requestType === 'Custom Letter Requests') {
//         reqBody.letter_fields["date"] = moment(new Date()).format('YYYY-MM-DD');
//         reqBody.letter_fields["addressee"] = reqBody?.letter_keys?.other_requests_to_address_1;
//         reqBody.letter_fields["subject"] = reqBody?.letter_keys?.other_requests_subject;
//         reqBody.letter_fields["body"] = reqBody?.letter_keys?.other_requests_body_1;
//         reqBody.letter_fields["other_requests_to_address_1"] = reqBody?.letter_keys?.other_requests_to_address_1;
//         reqBody.letter_fields["other_requests_subject"] = reqBody?.letter_keys?.other_requests_subject;
//         reqBody.letter_fields["other_requests_body_1"] = reqBody?.letter_keys?.other_requests_body_1;
//     }

//     reqBody.letter_fields["name"] = LetterAdditionalFieldData?.user_name;
//     reqBody.letter_fields["emp_id"] = LetterAdditionalFieldData?.emp_id;
//     reqBody.letter_fields["passport_number"] = LetterAdditionalFieldData?.passport;
//     reqBody.letter_fields["role"] = LetterAdditionalFieldData?.role;
//     reqBody.letter_fields["total_fixed"] = LetterAdditionalFieldData?.total_fixed;
//     reqBody.letter_fields["basic_salary"] = LetterAdditionalFieldData?.basic_salary;
//     reqBody.letter_fields["work_start_date"] = LetterAdditionalFieldData?.work_start_date;
//     reqBody.letter_fields["total_fixed_word"] = LetterAdditionalFieldData?.total_fixed_word;
//     reqBody.letter_fields["basic_salary_word"] = LetterAdditionalFieldData?.basic_salary_word;
//     reqBody.letter_fields["nationality"] = LetterAdditionalFieldData?.nationality;
//     reqBody.letter_fields["passport"] = LetterAdditionalFieldData?.passport;
//     reqBody.letter_fields["passportNumber"] = LetterAdditionalFieldData?.passport;
//     reqBody.letter_fields["passportIssueDate"] = LetterAdditionalFieldData?.passportissue;
//     reqBody.letter_fields["passportExpiryDate"] = LetterAdditionalFieldData?.passportexpiry;
//     reqBody.letter_fields["bank"] = LetterAdditionalFieldData?.bank;
//     reqBody.letter_fields["iban"] = LetterAdditionalFieldData?.iban;
//     reqBody.letter_fields["address"] = LetterAdditionalFieldData?.address;
//     reqBody.letter_fields["address2"] = LetterAdditionalFieldData?.address2;
//     reqBody.letter_fields["address3"] = LetterAdditionalFieldData?.address3;
//     reqBody.letter_fields["address4"] = LetterAdditionalFieldData?.address4;
//     reqBody.letter_fields["letter_head_logo"] = LetterImageData.letter_head_logo;
//     reqBody.letter_fields["stamp"] = LetterImageData.stamp;
//     reqBody.letter_fields["signature"] = LetterSignatoryData.signature;
//     reqBody.letter_fields["footer"] = LetterImageData.footer;
//     reqBody.letter_fields["header"] = LetterImageData.header;

//     let dataObj = {
//         user_id: ObjectId(reqBody.user_id),
//         created_user: created_user,
//         request_type: reqBody.request_type,
//         letter_type: reqBody.letter_type,
//         letter_sub_type: reqBody.letter_sub_type || "",
//         date_created: new Date(),
//         request_status: reqBody?.request_status || "Pending",
//         request_fields: reqBody.letter_fields,
//         pdf_template: PdfStyleData,
//         approvers: approverArray,
//         random_key: reqBody.foreign_key,
//         letter_preview: PreviewStyleData
//     };

//     const appliedLetterRequests = await Requests.create(dataObj);
//     let approver, level_no, receiver_email, receiver_name, applicant_name, _id, request_id, user_name, pdf_payload;
//     if (appliedLetterRequests) {
//         ({ _id, request_id } = appliedLetterRequests);
//         // Notify initial approvers
//         for (let i = 0; i < applicant_approvals[0].approvers.approver_levels; i++) {
//             level_no = i + 1;
//             approver = applicant_approvals[0].approvers[`level_${level_no}`][0]; // Assuming single approver per level
//             if (approver) {
//                 const approverDetails = await Users.findOne({ _id: ObjectId(approver) }, { first_name: 1, email: 1 });
//                 receiver_email = approverDetails.email;
//                 receiver_name = approverDetails.first_name;
//                 applicant_name = userDetails[0].first_name;
//                 request_id = _id.toString();
//                 user_name = appliedManager.first_name;

//                 // Call notifications function for the approver
//                 await notifications('letter', 'Approver', receiver_email, receiver_name, applicant_name, request_id, reqHeaderHost, user_name);
//             }
//         }
//         // Notify the applicant
//         receiver_email = userDetails[0].email;
//         receiver_name = userDetails[0].first_name;
//         //await notifications('letter', 'Applicant', receiver_email, receiver_name, receiver_name, _id.toString(), reqHeaderHost);
//         await sendNotification(userDetails[0].user_id[0], 'Letter Request Submitted', 'Your Letter Request has succesfully neen submitted', process.env.NOTIFICATION_DB_PRODUCT_ID);
//     }

//     if (isAction) {
//         // Notify the manager if the request limit has been exceeded and action is to notify the line manager
//         const managerDetails = await Users.findOne({ _id: userDetails[0].reporting.manager }, { first_name: 1, email: 1 });
//         receiver_email = managerDetails.email;
//         receiver_name = managerDetails.first_name;
//         applicant_name = userDetails[0].first_name;
//         request_id = _id.toString();
//         user_name = appliedManager.first_name;
//         await notifications('letter', 'Manager', receiver_email, receiver_name, applicant_name, request_id, reqHeaderHost, user_name);
//     }

//     return { success: true, message: 'Letter Request Created successfully', data: appliedLetterRequests };
// };

// Withdraw Letter Request
const withdrawLetterRequest = async reqBody => {
  let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
  if (!applicant || applicant.length === 0) {
    return { success: false, message: 'Unable to find the Users.!', data: [] };
  }
  let logs = {
    approver_id: applicant._id,
    date_created: new Date(),
    status: 'Letter Request Withdrawn.',
    reason: ''
  };
  let update_data = {
    $set: {
      status: 'Withdrawn',
      app_status: 'Withdrawn',
      dateUpdated: new Date(),
      updatedBy: ObjectId(reqBody.user_id),
      'approvals.$[].status': 'Withdrawn by Employee'
    },
    $push: { appliction_log: logs }
  };
  let update_match = { _id: ObjectId(reqBody.letter_id) };
  let update_letter = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_letter || update_letter.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please Try Again Later.', data: [] };
  }
  let updateData = { $set: { 'approvals.$.status': 'Withdrawn by Employee' } };
  let updateMatch = { _id: ObjectId(reqBody.letter_id), 'approvals.status': 'Processing' };
  let update_letter_approval = await Requests.findOneAndUpdate(updateMatch, updateData, { new: true, lean: true }).exec();
  let applicants_company = await Companies.findOne({ _id: ObjectId(applicant.company_id) });
  await sendEmailUsingTemplateName(
    'letter_request_withdrawn',
    getLetterWithdrawParams(update_letter, applicants_company, applicant),
    applicant.company_id,
    reqBody.user_id,
    'letter'
  );
  notifications('applicant', 'withdrawn', update_letter, applicant, applicant);
  return { success: true, message: 'Success', data: update_letter };
};

// Reassign Letter Request
const reassignLetterRequest = async reqBody => {
  let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
  let approver = await Users.findOne({ _id: ObjectId(reqBody.manager_id) });
  const reassignManagerIds = reqBody.reassign_manager_id.map(id => ObjectId(id));
  const reassigned_manager = await Users.find({ _id: { $in: reassignManagerIds } });
  let letter_req = await Requests.findOne({ _id: ObjectId(reqBody.letter_id) });
  let letterFunctions = new Letters();
  if (reqBody?.approver_attachment?.length > 0) {
    if (letter_req.approvals && letter_req.approvals.length > 0) {
      for (let approval_index = 0; approval_index < letter_req.approvals.length; approval_index++) {
        const element = letter_req.approvals[approval_index];
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
    !letter_req ||
    letter_req.length === 0 ||
    !reassigned_manager ||
    reassigned_manager.length === 0
  ) {
    return { success: false, message: 'Unable to Find User / Manager / Request', data: [] };
  }
  let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) });
  let reassign_letter = letterFunctions.funReassignLetter(
    letter_req,
    reqBody.reason,
    approver,
    reassigned_manager,
    reqBody.admin
  );
  let update_match = { _id: ObjectId(reqBody.letter_id) };
  let update_data = { $set: reassign_letter };
  let update_letter = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_letter || update_letter.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  reassigned_manager.map(async item => {
    let approver_to_email = item.email;
    await sendEmailUsingTemplateName(
      'letter_request_reassigned',
      getNewLetterRequestApproverParams(update_letter, applicant_company, applicant, item),
      applicant_company._id,
      reqBody.user_id,
      'letter',
      [approver_to_email]
    );
    /*
        let approver_email = letterMails.funLetterRequestApprovalManager(letter_req, applicant_company, applicant, item)
        sendEmail([approver_to_email], approver_email.subject, approver_email.body);*/
    notifications('approver', 'approver', update_letter, item, applicant);
  });
  return { success: true, message: 'Success', data: update_letter };
};

// Approve Letter Request
const approveLetterRequest = async reqBody => {
  let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
  let approver = await Users.findOne({ _id: ObjectId(reqBody.manager_id) });
  let letter_req = await Requests.findOne({ _id: ObjectId(reqBody.letter_id) });
  let letterFunctions = new Letters();
  if (!applicant || applicant.length === 0 || !approver || approver.length === 0 || !letter_req || letter_req.length === 0) {
    return { success: false, message: 'Unable to Find the Users / Request', data: [] };
  }
  let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_id) });
  let arr_users_id = [];
  letter_req.approvals.forEach(element => {
    element?.approver_id.map(async item => {
      arr_users_id.push(ObjectId(item));
    });
  });
  if (letter_req.approvals[0].approver_attachment) {
    letter_req.approvals[0].approver_attachment.push(...reqBody.approver_attachment);
  } else {
    letter_req.approvals[0].approver_attachment = reqBody.approver_attachment;
  }
  letter_req.approvals[0].hide_attachment = reqBody.hide_attachment;
  arr_users_id.push(ObjectId(reqBody.user_id));
  let arr_users = await Users.aggregate([
    { $match: { _id: { $in: arr_users_id } } },
    { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } }
  ]);
  let approveLetter = {};
  if (reqBody.admin) {
    approveLetter = letterFunctions.funAdminLetterApprove(letter_req, reqBody.reason, approver, arr_users);
  } else {
    // update package to check with string Id
    TODO: approver._id = String(approver._id);
    approveLetter = letterFunctions.funManagerLetterApprove(letter_req, reqBody.reason, approver, arr_users);
  }
  if (!approveLetter || approveLetter.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  let obj_requestInfo = approveLetter.obj_requestInfo;
  let update_match = { _id: ObjectId(reqBody.letter_id) };
  let update_data = { $set: obj_requestInfo };
  let update_letter = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_letter || update_letter.length === 0) {
    return { success: false, message: 'Unable to Process this.! Please try Again Later.', data: [] };
  }
  if (obj_requestInfo.status == 'completed') {
    if (reqBody.admin) {
      await sendEmailUsingTemplateName(
        'letter_request_auto_approved_admin',
        getLetterApprovedAdminParams(letter_req, applicant_company, applicant),
        applicant_company._id,
        reqBody.user_id,
        'letter'
      );
      /*let applicant_email = letterMails.funLetterApprovedAdmin(letter_req, applicant_company, applicant)
            sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    } else {
      await sendEmailUsingTemplateName(
        'letter_request_auto_approved',
        getLetterApprovedParams(letter_req, applicant_company, applicant),
        applicant_company._id,
        reqBody.user_id,
        'letter'
      );
      /*let applicant_email = letterMails.funLetterApproved(letter_req, applicant_company, applicant, arr_users, reqBody.reason)
            sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    }
    notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
  } else {
    approveLetter.arr_user_email.map(async item => {
      await sendEmailUsingTemplateName(
        'letter_request_new_approver',
        getNewLetterRequestApproverParams(letter_req, applicant_company, applicant, item),
        applicant_company._id,
        reqBody.user_id,
        'letter',
        [item.email]
      );
      /*let approver_to_email = item.email;
            let approver_email = letterMails.funLetterRequestApprovalManager(letter_req, applicant_company, applicant, item)
            sendEmail([approver_to_email], approver_email.subject, approver_email.body);*/
      notifications('approver', 'approver', obj_requestInfo, item, applicant);
    });
  }
  return { success: true, message: 'Success', data: update_letter };
};

// Reject Letter Request
const rejectLetterRequest = async reqBody => {
  let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
  let obj_rejecter = await Users.findOne({ _id: ObjectId(reqBody.manager_id) });
  let rejecter = JSON.parse(JSON.stringify(obj_rejecter));
  let letter_req = await Requests.findOne({ _id: ObjectId(reqBody.letter_id) });
  let letterFunctions = new Letters();
  if (!applicant || applicant.length === 0 || !rejecter || rejecter.length === 0 || !letter_req || letter_req.length === 0) {
    return { success: false, message: 'Unable to Find User / Manager / Request', data: [] };
  }
  let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_ID) });
  let arr_users_id = [];
  letter_req.approvals.forEach(element => {
    element?.approver_id.map(async item => {
      arr_users_id.push(ObjectId(item));
    });
  });
  if (reqBody?.approver_attachment?.length > 0) {
    if (letter_req.approvals && letter_req.approvals.length > 0) {
      for (let approval_index = 0; approval_index < letter_req.approvals.length; approval_index++) {
        const element = letter_req.approvals[approval_index];
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
    { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } }
  ]);
  let rejectLetter = {};
  if (reqBody.admin) {
    rejectLetter = letterFunctions.funAdminLetterReject(
      letter_req,
      reqBody.reason,
      rejecter,
      arr_users,
      applicant_company.rejection_flow
    );
  } else {
    rejectLetter = letterFunctions.funManagerLetterReject(
      letter_req,
      reqBody.reason,
      rejecter,
      arr_users,
      applicant_company.rejection_flow
    );
  }
  if (!rejectLetter || rejectLetter.length === 0) {
    return { success: false, message: 'Unable to process this request.! Please try again later.', data: [] };
  }
  let obj_requestInfo = rejectLetter.obj_requestInfo;
  let update_match = { _id: ObjectId(reqBody.letter_id) };
  if (obj_requestInfo.status.toLowerCase() == 'cancelled') {
    obj_requestInfo.app_status = 'Rejected';
  } else {
    obj_requestInfo.app_status = 'Processing';
  }
  let update_data = { $set: obj_requestInfo };
  let update_letter = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_letter || update_letter.length === 0) {
    return { success: false, message: 'Unable to Reject this Letter Request.! Please try again later', data: [] };
  }
  if (obj_requestInfo.status == 'Cancelled') {
    if (reqBody.admin) {
      await sendEmailUsingTemplateName(
        'letter_request_rejected_admin',
        getLetterRejectedAdminParams(letter_req, applicant_company, applicant, reqBody.reason),
        applicant_company._id,
        reqBody.user_id,
        'letter'
      );
      /*let applicant_email = letterMails.funLetterRejectedAdmin(letter_req, applicant_company, applicant, arr_users, reqBody.reason)
            sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    } else {
      await sendEmailUsingTemplateName(
        'letter_request_rejected',
        getLetterRejectedParams(letter_req, applicant_company, applicant, reqBody.reason),
        applicant_company._id,
        reqBody.user_id,
        'letter'
      );
      /*let applicant_email = letterMails.funLetterRejected(letter_req, applicant_company, applicant, arr_users, reqBody.reason)
            sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    }
    notifications('applicant', 'rejected', obj_requestInfo, rejecter, applicant);
  } else {
    rejectLetter?.arr_user_email.map(async item => {
      await sendEmailUsingTemplateName(
        'letter_request_new_approver',
        getNewLetterRequestApproverParams(letter_req, applicant_company, applicant, item),
        applicant_company._id,
        reqBody.user_id,
        'letter',
        [item.email]
      );
      /*let approver_to_email = item.email;
            let approver_email = letterMails.funLetterRequestApprovalManager(letter_req, applicant_company, applicant, item)
            sendEmail([approver_to_email], approver_email.subject, approver_email.body);*/
      notifications('approver', 'approver', obj_requestInfo, item, applicant);
    });
  }
  return { success: true, message: 'Success', data: update_letter };
};

// Create notfification for Letter requests
async function notifications(type, subType, obj_request, approver, applicant) {
  try {
    if (type == 'approver') {
      let notification = {
        user_id: [String(approver._id)],
        read_by: [],
        notification_type: singular(capitalize(obj_request.request_type)) + ' Request Pending Approval',
        notification_text:
          'New ' +
          singular(capitalize(obj_request.request_type)) +
          ' Request from ' +
          applicant.first_name +
          ' ' +
          applicant.last_name +
          ' is pending your approval',
        created_by: approver._id,
        url: '/dashboards/my-team#requests',
        createdDate: new Date(),
        type: {
          type: 'letters',
          _id: obj_request?._id?.toString() || obj_request?.letter_id?.toString(),
          status: obj_request.status
        }
      };
      const notify = new Notification(notification);
      let insert_notification = await notify.save();
      await sendNotification(
        notification.user_id[0],
        notification.notification_type,
        notification.notification_text,
        notification.type
      );
    } else if (type == 'applicant') {
      if (subType == 'approved') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: singular(capitalize(obj_request.request_type)) + ' Request Approved',
          notification_text:
            'Your ' +
            singular(capitalize(obj_request.request_type)) +
            ' Request is Approved. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#requests',
          createdDate: new Date(),
          type: {
            type: 'letters',
            _id: obj_request?._id?.toString() || obj_request?.letter_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          notification.user_id[0],
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      } else if (subType == 'withdrawn') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: singular(capitalize(obj_request.request_type)) + ' Request Withdrawn',
          notification_text:
            'Your ' +
            singular(capitalize(obj_request.request_type)) +
            ' Request is Withdrawn. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#requests',
          createdDate: new Date(),
          type: {
            type: 'letters',
            _id: obj_request?._id?.toString() || obj_request?.letter_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          notification.user_id[0],
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      } else if (subType == 'rejected') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: singular(capitalize(obj_request.request_type)) + ' Request Rejected',
          notification_text:
            'Your ' +
            singular(capitalize(obj_request.request_type)) +
            ' Request is Rejected. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#requests',
          createdDate: new Date(),
          type: {
            type: 'letters',
            _id: obj_request?._id?.toString() || obj_request?.letter_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          notification.user_id[0],
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createLetterRequest,
  withdrawLetterRequest,
  reassignLetterRequest,
  approveLetterRequest,
  rejectLetterRequest
};
