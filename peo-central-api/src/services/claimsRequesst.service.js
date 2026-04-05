const {
  Requests,
  Companies,
  Notification,
  ClaimConfig,
  Approvals,
  Payroll,
  payrollConfigModel,
  Users,
  PayrollProcess,
  CoreConfig
} = require('../models');
const dotenv = require('dotenv');
dotenv.config();
const PDFKitDocument = require('pdfkit');

const request = require('request');
const { sendNotification } = require('../controllers/notifications.js');
const claimHelper = require('../helpers/claims_helper.js');
const NotificationHelper = require('../helpers/notification_helper.js');
const { ObjectId } = require('mongodb');
const claimsHelper = require('../helpers/claims_helper.js');
const { ClaimReqHelper } = require('../helpers/claim_request_helper');
const { Claims } = require('@nathangroup/claim');
const { _, toLower } = require('lodash');
const { sendEmailUsingTemplateName } = require('../middlewares/email');
const moment = require('moment-timezone');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const axios = require('axios');
const {
  getClaimAmendUserParams,
  getClaimApprovedAdminParams,
  getClaimApprovedParams,
  getClaimRejectedAdminParams,
  getClaimRejectedParams,
  getClaimRequestApproverParams,
  getClaimRequiresClarificationMailParams,
  getClaimWithdrawParams,
  getNewClaimRequestParams
} = require('../emails/claim.email.js');

const AWS = require('aws-sdk');
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;
const util = require('util');
const reqPromise = util.promisify(request);
const { getMIMEType } = require('node-mime-types');

// Notifications for Claim Request
async function notifications(type, subType, obj_request, approver, applicant) {
  // console.log("processing pusher notification")
  try {
    if (type == 'approver') {
      let notification = {
        user_id: [String(approver._id)],
        read_by: [],
        notification_type: 'Claim Request Pending Approval',
        notification_text:
          'New Claim Request from ' + applicant.first_name + ' ' + applicant.last_name + ' is pending your approval',
        created_by: approver._id,
        url: '/dashboards/my-team#requests',
        createdDate: new Date(),
        type: {
          type: 'claims',
          _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
          status: obj_request.status
        }
      };
      const notify = new Notification(notification);
      let insert_notification = await notify.save();
      // console.log(insert_notification._id, "is the notification id")
      await sendNotification(
        approver._id,
        notification.notification_type,
        notification.notification_text,
        notification.type
      );
    } else if (type == 'applicant') {
      if (subType == 'approved') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Request Approved',
          notification_text: 'Your Claim Request is Approved. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
          createdDate: new Date(),
          type: {
            type: 'claims',
            _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          applicant._id,
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      } else if (subType == 'withdrawn') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Request Withdrawn',
          notification_text: 'Your Claim Request is Withdrawn. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
          createdDate: new Date(),
          type: {
            type: 'claims',
            _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          applicant._id,
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      } else if (subType == 'rejected') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Request Rejected',
          notification_text: 'Your Claim Request is Rejected. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
          createdDate: new Date(),
          type: {
            type: 'claims',
            _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          applicant._id,
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      } else if (subType == 'created') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Request Submitted',
          notification_text: 'Your Claim Request is Submitted. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
          createdDate: new Date(),
          type: {
            type: 'claims',
            _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          applicant._id,
          notification.notification_type,
          notification.notification_text,
          notification.type
        );
      } else if (subType == 'requires clarificatrion') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Requires Clarification',
          notification_text: 'Your Claim Request Requires Clarification. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
          createdDate: new Date(),
          type: {
            type: 'claims',
            _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
            status: obj_request.status
          }
        };
        const notify = new Notification(notification);
        let insert_notification = await notify.save();
        await sendNotification(
          applicant._id,
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
// Create a new Claim Request
const createClaimRequest = async reqBody => {
  let claimKeysArr = reqBody.letter_fields;
  const validate = claimHelper.commonFieldsValidation(claimKeysArr);
  if (!validate?.status) {
    return { success: false, validate: false, message: 'Validate', data: validate };
  }
  const claimsArr = reqBody?.claims;
  for (let i = 0; i < claimsArr.length; i++) {
    let detailsValidate = claimHelper.dynamicFieldsValidation(claimsArr[i]?.claim_sub_type?.claim_keys);
    if (!detailsValidate?.status) {
      return { success: false, validate: false, message: 'Validate', data: detailsValidate };
    }
  }
  let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
  // console.log('this is the applicants first name', applicant.first_name, 'end applicants first name');
  // console.log(reqBody.applied_manager, "this is the applied manager id")
  let applied_manager = await Users.findOne(
    { _id: new ObjectId(reqBody.applied_manager) },
    { first_name: 1, last_name: 1, reporting: 1 }
  );
  // console.log(Object.keys(applied_manager).length)
  if(!applied_manager) throw new Error('could not find applied manager');
  // console.log('This', applied_manager.first_name, 'is the applied managers first name');

  let Claim = new ClaimReqHelper();
  // console.log(applicant.reporting.manager, "the reporting manager=============")
  // console.log(applied_manager.length)
  if (
    !applicant ||
    applicant.length === 0 ||
    !applied_manager ||
    !applicant.reporting.manager
  ) {
    return { success: false, message: 'Unable to find the User / Manager', data: [] };
  }
  let applicant_approvals = await Approvals.find({ user_id: new ObjectId(reqBody.user_id), module: 'claim' });
  console.log('&&&&&&&&&&&&&', applicant_approvals, 'is the applicants approvals');
  if (!applicant_approvals || applicant_approvals.length === 0) {
    return { success: false, message: 'Approval flow not set for this User', data: [] };
  }
  const lineManager = await Users.findOne({ _id: ObjectId(applicant.reporting.manager) }, { reporting: 1 });

  for (var index = 0; index < applicant_approvals[0].approvers.approver_levels; index++) {
    var total = index + 1;
    var level_no = 'level_' + total;
    applicant_approvals[0].approvers[level_no] = applicant_approvals[0].approvers[level_no].map(elem => {
      if (elem === 'line_manager_id') return applicant.reporting.manager;
      else if (elem === 'senior_manager_id') return lineManager?.reporting.manager;
      else return elem;
    });
    const originalRequiredApprovers = applicant_approvals[0].required_approvers[level_no].required_number;
    // console.log("######################",originalRequiredApprovers, "original required approvals")
    const originalApproversLength = applicant_approvals[0].approvers[level_no].length;
    // console.log("######################",originalApproversLength, "original  approvers length")
    const uniqueApprovers = [...new Set(applicant_approvals[0].approvers[level_no])];
    console.log(uniqueApprovers, 'unique approvers');
    const uniqueApproversLength = uniqueApprovers.length;
    console.log(uniqueApproversLength, 'length of unique approvers');
    const lengthDiference = originalApproversLength - uniqueApproversLength;
    console.log(lengthDiference, 'is the length difference');
    applicant_approvals[0].approvers[level_no] = uniqueApprovers;
    applicant_approvals[0].required_approvers[level_no].required_number = Math.max(
      originalRequiredApprovers - (lengthDiference < 0 ? 0 : lengthDiference),
      1
    );
  }
  let applicants_company = await Companies.findOne({ _id: new ObjectId(applicant.company_id) });
  // console.log(applicants_company.company_name, "is the applicants company name")
  // console.log(applicant.company_id, "the company id")
  let claim_ref_number = await ClaimConfig.findOne({ company_ID: new ObjectId(applicant.company_id) }, { claim_ref_no: 1 });
  // console.log(claim_ref_number, "is the ref no############")

  let insert_claim = Claim.CreateClaimRequest(
    applicant,
    reqBody,
    claim_ref_number.claim_ref_no,
    applied_manager,
    applicant_approvals
  );
  if (!insert_claim || typeof insert_claim !== 'object') {
    return { success: false, message: 'Unable to Process this Request.! Please try again later', data: [] };
  }
  if (insert_claim?.letter_fields?.mode_of_payment) {
    insert_claim.letter_fields.mode_of_payment = reqBody?.letter_fields?.mode_of_payment;
    if (reqBody.letter_fields.mode_of_payment.toLowerCase() == 'payroll') {
      insert_claim.payroll_process = true;
    }
  }
  for (let i = 0; i < claimsArr.length; i++) {
    let details = insert_claim?.claims[i]?.details;
    for (let j = 0; j < claimsArr[i]?.claim_sub_type?.claim_keys?.length; j++) {
      if (
        claimsArr[i].claim_sub_type.claim_keys[j].type === 'Number Field' &&
        claimsArr[i].claim_sub_type.claim_keys[j].isCalculationNeeded === true
      ) {
        details[`${claimsArr[i].claim_sub_type.claim_keys[j].name.toLowerCase().replace(/\s/g, '_')}`] =
          claimsArr[i].claim_sub_type.claim_keys[j].inputvalue;
        details[`calculated_amount`] = claimsArr[i].claim_sub_type.claim_keys[j].value;
      } else if (claimsArr[i].claim_sub_type.claim_keys[j].type !== 'Attachments') {
        details[`${claimsArr[i].claim_sub_type.claim_keys[j].name.toLowerCase().replace(/\s/g, '_')}`] =
          claimsArr[i].claim_sub_type.claim_keys[j].value;
      }
    }
    insert_claim.claims[i].details = details;
  }

  const letterTypes = [];
  const letterSubTypes = [];
  insert_claim.claims.map(item => {
    const letter_type = item?.letter_type || item?.claim_type || item?.claimType;
    const letter_sub_type = item?.letter_sub_type || item?.claim_sub_type || item?.claimSubType;
    if (letter_type) letterTypes.push(letter_type);
    if (letter_sub_type) letterSubTypes.push(letter_sub_type);
  });
  insert_claim.letter_type = letterTypes.join(', ');
  insert_claim.letter_sub_type = letterSubTypes.join(', ');

  if (typeof insert_claim === 'object') {
    let newClaim = false;
    if ((reqBody?.type).toLowerCase() == 'draft') {
      insert_claim.status = 'Draft';
      if (reqBody?.id !== '') {
        await Requests.findOneAndUpdate({ _id: new ObjectId(reqBody.id) }, insert_claim, { upsert: true });
      } else {
        const claim = new Requests({ ...insert_claim });
        await claim.save();
      }
      await ClaimConfig.updateOne(
        { company_ID: new ObjectId(applicant.company_id) },
        { $inc: { claim_ref_no: 1 } },
        { new: true }
      );
      return { success: true, validate: true, message: 'Success', data: insert_claim };
    } else if (reqBody?.id !== '') {
      newClaim = await Requests.findOneAndUpdate({ _id: new ObjectId(reqBody.id) }, insert_claim, {
        upsert: true,
        new: true
      });
      insert_claim._id = newClaim?._id || newClaim?.id;
    } else {
      newClaim = new Requests({ ...insert_claim });
      await newClaim.save();
      insert_claim._id = newClaim?._id || newClaim?.id;
    }
    if (newClaim) {
      let update_claim_ref_number = await ClaimConfig.updateOne(
        { company_ID: new ObjectId(applicant.company_id) },
        { $inc: { claim_ref_no: 1 } },
        { new: true }
      );
      let approver_id = [];
      insert_claim.claims.forEach(claim => {
        claim.approvals.forEach(approval => {
          if (approval.status.toLowerCase() === 'processing') {
            approver_id.push(...approval.approver_id);
          }
        });
      });
      let arr_users_id = [];
      insert_claim.claims.forEach(claimItem => {
        claimItem.approvals.forEach(approvalItem => {
          approvalItem?.approver_id.map(async item => {
            arr_users_id.push(new ObjectId(item));
          });
        });
      });
      arr_users_id.push(new ObjectId(reqBody.user_id));
      let arr_users = await Users.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { first_name: 1, last_name: 1, middle_name: 1 } }
      ]);
      arr_users = arr_users.map(item => ({ ...item, _id: item._id.toString() }));

      insert_claim.approvals = insert_claim.claims.reduce((acc, item) => [...acc, ...item.approvals], []); // Assigning Approval Values
      if (approver_id.length > 0 && insert_claim.status.toLowerCase() == 'processing') {
        approver_id.map(async item => {
          let first_approver = await Users.findOne({ _id: new ObjectId(item) });
          await sendEmailUsingTemplateName(
            'claim_request_new_approver',
            getClaimRequestApproverParams(insert_claim, applicants_company, applicant, first_approver),
            first_approver.company_id,
            reqBody.user_id,
            'claim',
            [first_approver.email]
          );

          notifications('approver', 'approver', insert_claim, first_approver, applicant);
        });
      } else if (approver_id.length > 0 && insert_claim.status.toLowerCase() == 'completed') {
        if (reqBody.admin) {
          await sendEmailUsingTemplateName(
            'claim_request_auto_approved_admin',
            getClaimApprovedAdminParams(insert_claim, applicants_company, applicant),
            applicant.company_id,
            reqBody.user_id,
            'claim'
          );
          /*let applicant_email = ClaimsEmail.funClaimApprovedAdmin(insert_claim, applicants_company, applicant);
          sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
        } else {
          // console.log("Sending email%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
          await sendEmailUsingTemplateName(
            'claim_request_auto_approved',
            getClaimApprovedParams(insert_claim, applicants_company, applicant, arr_users),
            applicant.company_id,
            reqBody.user_id,
            'claim'
          );
          /*let applicant_email = ClaimsEmail.funClaimApproved(
            insert_claim,
            applicants_company,
            applicant,
            arr_users,
            'Auto Approved'
          );
          sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
        }
        insert_claim.claims.forEach(claimItem => {
          if (claimItem?.payroll_process && claimItem?.details?.reimbursement_amount_in_aed) {
            createPayitems(claimItem, applicant, newClaim);
          }
        });
        notifications('applicant', 'approved', insert_claim, applied_manager, applicant);
      }
      await sendEmailUsingTemplateName(
        'claim_request_email_employee',
        getNewClaimRequestParams(insert_claim, applicants_company, applicant, arr_users),
        applicant.company_id,
        reqBody.user_id,
        'claim'
      );

      /*let applicant_email = ClaimsEmail.funNewClaimRequest(insert_claim, applicants_company, applicant, arr_users);
      sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
      notifications('applicant', 'created', newClaim, applicant, applicant);

      // Function to fetch and attach approver details
      async function getApproverDetails(approverIds) {
        return await Promise.all(
          approverIds.map(async approverId => {
            const approverDoc = await Users.findOne({ _id: approverId });

            if (approverDoc) {
              return {
                approver_id: approverId,
                first_name: approverDoc.first_name,
                last_name: approverDoc.last_name,
                image_url: approverDoc.image_url
              };
            } else {
              return {
                approver_id: approverId
              };
            }
          })
        );
      }

      // Process the main approvals array
      const updatedApprovals = await Promise.all(
        newClaim._doc.approvals.map(async approval => {
          const approverDetails = await getApproverDetails(approval.approver_id);

          return {
            ...approval,
            approver_details: approverDetails
          };
        })
      );

      // Process the claims array to update each claim's approvals
      const updatedClaims = await Promise.all(
        newClaim._doc.claims.map(async claim => {
          const updatedClaimApprovals = await Promise.all(
            claim.approvals.map(async approval => {
              const approverDetails = await getApproverDetails(approval.approver_id);

              return {
                ...approval,
                approver_details: approverDetails
              };
            })
          );

          return {
            ...claim,
            approvals: updatedClaimApprovals
          };
        })
      );

      // Return the modified response including updated approvals and claims
      return {
        success: true,
        validate: true,
        message: 'Success',
        data: {
          ...newClaim._doc,
          id: newClaim._doc._id,
          approvals: updatedApprovals, // Updated top-level approvals array
          claims: updatedClaims // Updated claims array
        }
      };

      // return { success: true, validate: true, message: 'Success', data: { ...newClaim._doc, id: newClaim._doc._id } };
    } else {
      return { success: false, message: 'Unable to Process this Request.! Please Try Again Later.', data: [] };
    }
  } else {
    return { success: false, message: 'Unable to Process this Claim Request.! Please Try Again Later', data: [] };
  }
};

// Delete Claim Draft Request
const deleteClaimDraftRequest = async draftId => {
  const deleteDraft = await Requests.findByIdAndDelete({ _id: ObjectId(draftId) });
  if (deleteDraft) {
    return { success: true, message: 'Draft deleted successfully' };
  } else {
    return { success: false, message: 'Unable to delete the draft', data: {} };
  }
};

// Withdraw a Claim Request
const withdrawClaimRequest = async reqBody => {
  // console.log('withdrawing claim #############');
  let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
  // console.log(applicant.first_name, 'is applicants first name');
  if (!applicant || applicant.length === 0) {
    return { success: false, message: 'Unable to find the User', data: [] };
  }
  let logs = {
    approver_id: applicant._id,
    date_created: new Date(),
    status: 'Claim Request Withdrawn.',
    reason: ''
  };
  let update_data = {
    $set: {
      status: 'Withdrawn',
      dateUpdated: new Date(),
      updatedBy: new ObjectId(reqBody.user_id),
      'approvals.$[].status': 'Withdrawn by Employee',
      'claims.$[].approvals.$[].status': 'Withdrawn by Employee',
      'claims.$[].status': 'Request Withdrawn'
    },
    $push: { appliction_log: logs }
  };
  let update_match = {
    _id: new ObjectId(reqBody.claim_id),
    status: 'Processing'
  };
  // console.log('updating claim $$$$$$$$$');
  let update_claim = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true });
  if (!update_claim || update_claim.length === 0) {
    return { success: false, message: 'Failed to withdraw claim request.! Please try again later.', data: [] };
  }
  update_claim = update_claim.claims.reduce((acc, item) => {
    const letter_types = [item.letter_type];
    const letter_sub_types = [item.letter_sub_type];

    if (acc.letter_type) letter_types.push(acc.letter_type);
    if (acc.letter_sub_type) letter_sub_types.push(acc.letter_sub_type);
    return {
      ...acc,
      letter_type: letter_types.join(', '),
      letter_sub_type: letter_sub_types.join(', '),
      date_created: update_claim.date_created
    };
  }, {});
  let applicants_company = await Companies.findOne({ _id: new ObjectId(applicant.company_id) });
  // console.log(applicants_company, 'is applicants company333');
  // console.log(applicants_company, 'applicants company333333333');
  await sendEmailUsingTemplateName(
    'claim_request_withdrawn',
    getClaimWithdrawParams(update_claim, applicants_company, applicant),
    applicant.company_id,
    reqBody.user_id,
    'claim'
  );
  /*let applicant_email = ClaimsEmail.funClaimWithdraw(update_claim, applicants_company, applicant);
  sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
  notifications('applicant', 'withdrawn', update_claim, applicant, applicant);
  return { success: true, message: 'Success', data: update_claim };
};

// Multiple Claim Request Approval
const approveClaimRequest = async (reqBody, reqHeaderHost) => {
  let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
  let approver = await Users.findOne({ _id: new ObjectId(reqBody.manager_id) });
  let claim_req = await Requests.findOne({ _id: new ObjectId(reqBody.claim_id) });
  let claimRequestHelper = new ClaimReqHelper();
  if (!applicant || applicant.length === 0 || !approver || approver.length === 0 || !claim_req || claim_req.length === 0) {
    return { success: false, message: 'Unable to find the User / Manager / Request', data: [] };
  }

  if (reqBody.approver_attachment.length > 0) {
    if (claim_req.approvals && claim_req.approvals.length > 0) {
      for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
        const element = claim_req.approvals[approval_index];
        if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
          element.hide_attachment = reqBody.hide_attachment;
          element.approver_attachment = reqBody.approver_attachment;
          break;
        }
      }
    }
  }

  let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_id) });
  let arr_users_id = [];
  claim_req.claims.forEach(claimItem => {
    claimItem.approvals.forEach(approvalItem => {
      approvalItem?.approver_id.map(async item => {
        arr_users_id.push(new ObjectId(item));
      });
    });
  });
  arr_users_id.push(new ObjectId(reqBody.user_id));
  let arr_users = await Users.aggregate([
    { $match: { _id: { $in: arr_users_id } } },
    { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } }
  ]);
  let approveClaim = {};
  if (reqBody.admin) {
    if (toLower(reqBody.approvalType) === 'all') {
      approveClaim = claimRequestHelper.functionAdminClaimApproveAll(claim_req, reqBody.reason, approver, arr_users);
    } else if (toLower(reqBody.approvalType) === 'few') {
      approveClaim = claimRequestHelper.functionAdminClaimApproveSelected(
        claim_req,
        reqBody.reason,
        approver,
        arr_users,
        reqBody.approve_claims
      );
    }
  } else {
    // Manager Claim Approval
    if (toLower(reqBody.approvalType) === 'all') {
      approveClaim = claimRequestHelper.functionManagerClaimApproveAll(claim_req, reqBody.reason, approver, arr_users);
    } else if (toLower(reqBody.approvalType) === 'few') {
      approveClaim = claimRequestHelper.functionManagerClaimApproveSelected(
        claim_req,
        reqBody.reason,
        approver,
        arr_users,
        reqBody.approve_claims
      );
    }
  }
  if (!approveClaim || approveClaim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again Later', data: [] };
  }
  let obj_requestInfo = approveClaim.obj_requestInfo;
  let update_match = { _id: new ObjectId(reqBody.claim_id) };
  let update_data = { $set: obj_requestInfo };
  let update_claim = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_claim || update_claim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  if (obj_requestInfo.status == 'completed') {
    if (reqBody.admin) {
      await sendEmailUsingTemplateName(
        'claim_request_approved_admin',
        getClaimApprovedAdminParams(claim_req, applicant_company, applicant),
        applicant_company._id,
        reqBody.user_id,
        'claim'
      );
      /*let applicant_email = ClaimsEmail.funClaimApprovedAdmin(claim_req, applicant_company, applicant);
      sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    } else {
      await sendEmailUsingTemplateName(
        'claim_request_approved',
        getClaimApprovedParams(claim_req, applicant_company, applicant, arr_users, reqBody.reason),
        applicant_company._id,
        reqBody.user_id,
        'claim'
      );
      /*let applicant_email = ClaimsEmail.funClaimApproved(claim_req, applicant_company, applicant, arr_users, reqBody.reason);
      sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    }
    update_claim.claims.forEach(claimItem => {
      if (claimItem?.payroll_process && claimItem?.details?.reimbursement_amount_in_aed) {
        createPayitems(claimItem, approver, update_claim);
      }
    });
    notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
  } else {
    if (approveClaim?.arr_user_email && approveClaim?.arr_user_email.length > 0) {
      approveClaim?.arr_user_email.map(async item => {
        let approver_to_email = item.email;
        await sendEmailUsingTemplateName(
          'claim_request_new_approver',
          getClaimRequestApproverParams(claim_req, applicant_company, applicant, item),
          applicant_company._id,
          reqBody.user_id,
          'claim',
          [approver_to_email]
        );
        notifications('approver', 'approver', obj_requestInfo, item, applicant);
      });
    } else {
      update_claim.approvals.forEach(approval => {
        if (approval.status.toLowerCase() === 'processing') {
          approval.approver_id.map(async item => {
            let first_approver = await Users.findOne({ _id: new ObjectId(item) });
            await sendEmailUsingTemplateName(
              'claim_request_new_approver',
              getClaimRequestApproverParams(update_claim, applicant_company, applicant, first_approver),
              applicant_company._id,
              reqBody.user_id,
              'claim',
              [first_approver.email]
            );
            notifications('approver', 'approver', obj_requestInfo, first_approver, applicant);
          });
        }
      });
    }
  }
  return { success: true, message: 'Success', data: update_claim };
};

// Multiple Claim Request Rejection
const rejectClaimRequest = async (reqBody, reqHeaderHost) => {
  let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
  let obj_rejecter = await Users.findOne({ _id: new ObjectId(reqBody.manager_id) });
  let rejecter = JSON.parse(JSON.stringify(obj_rejecter));
  let claim_req = await Requests.findOne({ _id: new ObjectId(reqBody.claim_id) });
  let claimRequestHelper = new ClaimReqHelper();
  if (!applicant || applicant.length === 0 || !rejecter || rejecter.length === 0 || !claim_req || claim_req.length === 0) {
    return { success: false, message: 'Unable to find User / Manager / Request', data: [] };
  }

  if (reqBody.approver_attachment.length > 0) {
    if (claim_req.approvals && claim_req.approvals.length > 0) {
      for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
        const element = claim_req.approvals[approval_index];
        if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
          element.hide_attachment = reqBody.hide_attachment;
          element.approver_attachment = reqBody.approver_attachment;
          break;
        }
      }
    }
  }

  let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_id) });
  let arr_users_id = [];
  claim_req.claims.forEach(claimItem => {
    if (claimItem?.approvals && claimItem?.approvals.length > 0) {
      claimItem?.approvals.forEach(approvalItem => {
        approvalItem?.approver_id.map(async item => {
          arr_users_id.push(new ObjectId(item));
        });
      });
    }
  });
  arr_users_id.push(new ObjectId(reqBody.user_id));
  let arr_users = await Users.aggregate([
    { $match: { _id: { $in: arr_users_id } } },
    { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } }
  ]);
  let rejectClaim = {};
  if (reqBody.admin) {
    if (toLower(reqBody.rejectType) === 'all') {
      rejectClaim = claimRequestHelper.functionAdminClaimRejectAll(
        claim_req,
        reqBody.reason,
        rejecter,
        arr_users,
        applicant_company.rejection_flow
      );
    } else if (toLower(reqBody.rejectType) === 'few') {
      rejectClaim = claimRequestHelper.functionAdminClaimRejectSelected(
        claim_req,
        reqBody.reason,
        rejecter,
        arr_users,
        applicant_company.rejection_flow,
        reqBody.reject_claims
      );
    }
  } else {
    if (toLower(reqBody.rejectType) === 'all') {
      rejectClaim = claimRequestHelper.functionManagerClaimRejectAll(
        claim_req,
        reqBody.reason,
        rejecter,
        arr_users,
        applicant_company.rejection_flow
      );
    } else if (toLower(reqBody.rejectType) === 'few') {
      rejectClaim = claimRequestHelper.functionManagerClaimRejectSelected(
        claim_req,
        reqBody.reason,
        rejecter,
        arr_users,
        applicant_company.rejection_flow,
        reqBody.reject_claims
      );
    }
  }
  if (!rejectClaim || rejectClaim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  let obj_requestInfo = rejectClaim.obj_requestInfo;
  let update_match = { _id: new ObjectId(reqBody.claim_id) };
  let update_data = { $set: obj_requestInfo };
  let update_claim = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_claim || update_claim.length === 0) {
    return { success: false, message: 'Unable to Reject this Request.! Please Try Again Later', data: [] };
  }
  if (obj_requestInfo.status == 'Cancelled') {
    if (reqBody.admin) {
      await sendEmailUsingTemplateName(
        'claim_request_rejected_admin',
        getClaimRejectedAdminParams(claim_req, applicant_company, applicant, reqBody.reason),
        applicant_company._id,
        reqBody.user_id,
        'claim'
      );
      /*let applicant_email = ClaimsEmail.funClaimRejectedAdmin(claim_req, applicant_company, applicant);
      sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    } else {
      await sendEmailUsingTemplateName(
        'claim_request_rejected',
        getClaimRejectedParams(claim_req, applicant_company, applicant, arr_users, reqBody.reason),
        applicant_company._id,
        reqBody.user_id,
        'claim'
      );
      /*let applicant_email = ClaimsEmail.funClaimRejected(claim_req, applicant_company, applicant, arr_users, reqBody.reason);
      sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
    }
    notifications('applicant', 'rejected', obj_requestInfo, rejecter, applicant);
  } else {
    rejectClaim?.arr_user_email.map(async item => {
      let approver_to_email = item.email;
      await sendEmailUsingTemplateName(
        'claim_request_new_approver',
        getClaimRequestApproverParams(claim_req, applicant_company, applicant, item),
        applicant_company._id,
        reqBody.user_id,
        'claim',
        [approver_to_email]
      );
      /*let approver_email = ClaimsEmail.funClaimRequestApprovalManager(claim_req, applicant_company, applicant, item);
      let req_id = update_claim._id.toString();
      let req_type = 'requests';
      let combinedReqIdAndType = req_id + '/' + req_type;
      if (reqHeaderHost == 'localhost:4100') {
        approver_email.body = approver_email.body.replace('https://hrdirect-staging.devnhr.com', 'http://localhost:5102');
        approver_email.body = approver_email.body.replace('https://hrdirect.devnhr.com', 'http://localhost:5102');
      }
      approver_email.body = approver_email.body.replace(
        'dashboards/my-team#requests',
        'request-info/' + Buffer.from(combinedReqIdAndType.toString(), 'binary').toString('base64')
      );
      sendEmail([approver_to_email], approver_email.subject, approver_email.body);*/
      notifications('approver', 'approver', obj_requestInfo, item, applicant);
    });
  }
  return { success: true, message: 'Success', data: update_claim };
};

// Reassign Claim Request
const reassignClaimRequest = async (reqBody, reqHeaderHost) => {
  let applicant = await Users.findOne({ _id: ObjectId(reqBody.user_id) });
  let obj_approver = await Users.findOne({ _id: ObjectId(reqBody.manager_id) });
  let approver = JSON.parse(JSON.stringify(obj_approver));
  const reassignManagerIds = reqBody.reassign_manager_id.map(id => ObjectId(id));
  const reassigned_manager = await Users.find({ _id: { $in: reassignManagerIds } });
  let claim_req = await Requests.findOne({ _id: ObjectId(reqBody.claim_id) });
  let claimRequestHelper = new ClaimReqHelper();

  if (!applicant || !approver || !claim_req || reassigned_manager.length === 0) {
    return { success: false, message: 'Unable to Find Users / Request.!', data: [] };
  }

  if (reqBody.approver_attachment.length > 0) {
    if (claim_req.approvals && claim_req.approvals.length > 0) {
      for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
        const element = claim_req.approvals[approval_index];
        if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
          element.hide_attachment = reqBody.hide_attachment;
          element.approver_attachment = reqBody.approver_attachment;
          break;
        }
      }
    }
  }

  let applicant_company = await Companies.findOne({ _id: ObjectId(applicant.company_id) });
  let reassign_claim = claimRequestHelper.funReassignClaim(
    claim_req,
    reqBody.reason,
    approver,
    reassigned_manager,
    reqBody.admin
  );
  let update_match = { _id: ObjectId(reqBody.claim_id) };
  let update_data = { $set: reassign_claim };
  let update_claim = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();

  if (!update_claim || update_claim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please Try Again Later', data: [] };
  }

  reassigned_manager.map(async item => {
    await sendEmailUsingTemplateName(
      'claim_request_reassigned',
      getClaimRequestApproverParams(claim_req, applicant_company, applicant, item),
      applicant.company_id,
      reqBody.user_id,
      'claim',
      [item.email]
    );
    notifications('approver', 'approver', update_claim, item, applicant);
  });

  return { success: true, message: 'Success', data: update_claim };
};

// Requires Clarification Claim Request
const requiresClarificationClaimRequest = async reqBody => {
  let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
  let clarification_requester = await Users.findOne({ _id: new ObjectId(reqBody.manager_id) });
  let claim_req = await Requests.findOne({ _id: new ObjectId(reqBody.claim_id) });
  let claimRequestHelper = new ClaimReqHelper();
  if (
    !applicant ||
    applicant.length === 0 ||
    !clarification_requester ||
    clarification_requester.length === 0 ||
    !claim_req ||
    claim_req.length === 0
  ) {
    return { success: false, message: 'Unable to find the User / Manager / Request', data: [] };
  }

  if (reqBody.approver_attachment.length > 0) {
    if (claim_req.approvals && claim_req.approvals.length > 0) {
      for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
        const element = claim_req.approvals[approval_index];
        if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
          element.hide_attachment = reqBody.hide_attachment;
          element.approver_attachment = reqBody.approver_attachment;
          break;
        }
      }
    }
  }
  let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_id) });
  let arr_users_id = [];
  claim_req.claims.forEach(claimItem => {
    claimItem.approvals.forEach(approvalItem => {
      approvalItem?.approver_id.map(async item => {
        arr_users_id.push(new ObjectId(item));
      });
    });
  });
  arr_users_id.push(new ObjectId(reqBody.user_id));
  let arr_users = await Users.aggregate([
    { $match: { _id: { $in: arr_users_id } } },
    { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } }
  ]);
  let clarifyClaim = {};
  if (reqBody.admin) {
    if (toLower(reqBody.clarificationType) === 'all') {
      clarifyClaim = claimRequestHelper.functionAdminClaimRequestClarificationAll(
        claim_req,
        reqBody.reason,
        clarification_requester,
        arr_users
      );
    } else if (toLower(reqBody.clarificationType) === 'few') {
      clarifyClaim = claimRequestHelper.functionAdminClaimRequestClarificationSelected(
        claim_req,
        reqBody.reason,
        clarification_requester,
        arr_users,
        reqBody.clarification_claims
      );
    }
  } else {
    if (toLower(reqBody.clarificationType) === 'all') {
      clarifyClaim = claimRequestHelper.functionManagerClaimRequestClarificationAll(
        claim_req,
        reqBody.reason,
        clarification_requester,
        arr_users
      );
    } else if (toLower(reqBody.clarificationType) === 'few') {
      clarifyClaim = claimRequestHelper.functionManagerClaimRequestClarificationSelected(
        claim_req,
        reqBody.reason,
        clarification_requester,
        arr_users,
        reqBody.clarification_claims
      );
    }
  }
  if (!clarifyClaim || clarifyClaim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  let obj_requestInfo = clarifyClaim.obj_requestInfo;
  let update_match = { _id: new ObjectId(reqBody.claim_id) };
  let update_data = { $set: obj_requestInfo };
  let update_claim = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_claim || update_claim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  await sendEmailUsingTemplateName(
    'claim_request_requires_clarification',
    getClaimRequiresClarificationMailParams(update_claim, applicant_company, applicant),
    applicant_company._id,
    reqBody.user_id,
    'claim'
  );
  /*let applicant_email = claimRequestHelper.claimRequiresClarificationMail(update_claim, applicant_company, applicant);
  sendEmail([applicant.email], applicant_email.subject, applicant_email.body);*/
  notifications('applicant', 'requires clarificatrion', update_claim, applicant, applicant);
  return { success: true, message: 'Success', data: update_claim };
};

// Request to Clarify the Request Being send for Clarification
const clarifyClaimRequest = async reqBody => {
  let claimKeysArr = reqBody?.letter_fields;
  const validate = claimHelper.commonFieldsValidation(claimKeysArr);
  if (!validate?.status) {
    return { success: false, message: 'Validate', data: validate };
  }
  const claimsArr = reqBody?.claims;
  for (let i = 0; i < claimsArr.length; i++) {
    let detailsValidate = claimHelper.dynamicFieldsValidation(claimsArr[i]?.claim_sub_type?.claim_keys);
    if (!detailsValidate?.status) {
      return { success: false, message: 'Validate', data: detailsValidate };
    }
  }
  let applicant = await Users.findOne({ _id: new ObjectId(reqBody.user_id) });
  let applicant_company = await Companies.findOne({ _id: new ObjectId(applicant.company_id) });
  let claim_req = await Requests.findOne({ _id: new ObjectId(reqBody.claim_id) });
  let claimRequestHelper = new ClaimReqHelper();
  if (!applicant || applicant.length === 0 || !claim_req || claim_req.length === 0) {
    return { success: false, message: 'Unable to find the User / Request', data: [] };
  }
  let arr_users_id = [];
  claim_req.claims.forEach(claimItem => {
    claimItem.approvals.forEach(approvalItem => {
      approvalItem?.approver_id.map(async item => {
        arr_users_id.push(new ObjectId(item));
      });
    });
  });
  arr_users_id.push(new ObjectId(reqBody.user_id));
  let arr_users = await Users.aggregate([
    { $match: { _id: { $in: arr_users_id } } },
    { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } }
  ]);
  let clarifyClaim = {};
  clarifyClaim = claimRequestHelper.functionClaimClarifyUser(claim_req, reqBody.reason, applicant, arr_users, reqBody);
  let obj_requestInfo = clarifyClaim.obj_requestInfo;
  let update_match = { _id: new ObjectId(reqBody.claim_id) };
  let update_data = { $set: obj_requestInfo };
  let update_claim = await Requests.findOneAndUpdate(update_match, update_data, { new: true, lean: true }).exec();
  if (!update_claim || update_claim.length === 0) {
    return { success: false, message: 'Unable to Process this Request.! Please try again later.', data: [] };
  }
  clarifyClaim?.arr_user_email.map(async item => {
    await sendEmailUsingTemplateName(
      'claim_request_new_approver',
      getClaimRequestApproverParams(update_claim, applicant_company, applicant, item),
      applicant_company._id,
      reqBody.user_id,
      'claim',
      [item.email]
    );
    /*let approver_to_email = item.email;
    let approver_email = ClaimsEmail.funClaimRequestApprovalManager(claim_req, applicant_company, applicant, item);
    sendEmail([approver_to_email], approver_email.subject, approver_email.body);*/
    notifications('approver', 'approver', obj_requestInfo, item, applicant);
  });
  return { success: true, message: 'Success', data: update_claim };
};

// Get Claim Types
const getClaimtypes = async (userId, queries, isSubtype = false) => {
  const { type } = queries;
  let { isArray } = queries;
  isArray = JSON.parse(isArray);

  // console.log(userId, 'this is the user id you are looking for');
  const applicant = await Users.findOne({ _id: new ObjectId(userId) });
  const claimTypes = await ClaimConfig.findOne({ company_ID: applicant.company_id });
  if (!applicant || !claimTypes) return { success: false, message: 'User Not Found', data: [] };

  let data = await claimsHelper.funEligibleclaimTypes(applicant, claimTypes.ClaimSubTypes);
  if (!data || data.length === 0) return { success: false, message: 'Not eligible for any Claims', data: [] };

  if (type) data = data.filter(item => item.claimType === type);
  if (isArray)
    data = data
      .map(item => (isSubtype ? item.claimSubType : item.claimType))
      .reduce((acc, item) => {
        if (!acc.includes(item)) return [...acc, item];
        return acc;
      }, []);

  return { success: true, message: 'Success', data };
};

// Create PayItems
async function createPayitems(obj_request, approver, claim_req) {
  try {
    const payrol_approvals = await payrollConfigModel
      .findOne({ company_ID: claim_req?.company_id })
      .select({ payitemApprovals: 1 });
    let app_log = [];
    let logs = {
      created_by: approver?._id,
      status: 'Created',
      createdDate: new Date(),
      type: {
        type: 'claims',
        _id: obj_request?._id?.toString() || obj_request?.claim_id?.toString() || obj_request?.claims_id?.toString(),
        status: obj_request.status
      }
    };
    app_log.push(logs);
    let month = new Date().getMonth() + 1 + '';
    let year = new Date().getFullYear();
    month.length > 1 ? (month = month) : (month = '0' + month);
    let approval_levels = payrol_approvals?.payitemApprovals?.length;
    let approvers = payrol_approvals?.payitemApprovals;
    let approval_array = [];
    /* Create payitems approval flow*/
    for (let index = 0; index < approval_levels; index++) {
      if (obj_request?.payroll_auto_approved) {
        let logs = {
          created_by: approver?._id,
          status: 'Auto approved',
          createdDate: new Date()
        };
        app_log.push(logs);
        let approval_obj = {
          approver_id: approvers[index],
          status: 'Auto approved',
          approved_date: new Date(),
          reason: 'Auto approved'
        };
        approval_array.push(approval_obj);
      } else {
        let approval_obj = {
          approver_id: approvers[index],
          status: '',
          approved_date: '',
          reason: ''
        };
        index == 0 ? (approval_obj.status = 'Processing') : (approval_obj.status = 'Pending');
        approval_array.push(approval_obj);
      }
    }
    let payrollprocess = await PayrollProcess.findOne({ status: 'active', company_id: claim_req.company_id });
    let PayitemPaymonth = '';
    if (payrollprocess?.submit_for_approval == 'false' || payrollprocess?.submit_for_approval == false) {
      //? If pay month is not yet submitted for approval then add payitem to the current paymonth
      PayitemPaymonth = payrollprocess.pay_month;
    } else {
      //? else if the  pay month is submitted then add payitem to the next paymonth
      PayitemPaymonth = moment(payrollprocess.pay_month, 'YYYY-MM').add(1, 'M').format('YYYY-MM');
    }
    let payitemObj = {
      pay_month: PayitemPaymonth,
      user_id: claim_req?.user_id,
      first_name: obj_request?.letter_fields?.name,
      last_name: '',
      approvals: approval_array,
      earning_type: 'Earning',
      category: 'Claims',
      remarks: obj_request?.letter_type + '-' + obj_request?.letter_sub_type,
      logs: app_log,
      amount: parseFloat(obj_request?.details?.reimbursement_amount_in_aed),
      approved_by_id: approvers[0],
      recursive_id: 'Non-Recursive',
      status: 'active',
      unpaid: 0,
      ot_type: '',
      hours: '',
      claim_id: claim_req?._id,
      created_by_id: approver?._id,
      company_id: claim_req.company_id
    };
    const payroll = new Payroll(payitemObj);
    let insert_payitem = await payroll.save();
  } catch (error) {
    console.log(error);
  }
}

const getClaimReceipt = async claim_id => {
  function AmountFormatter(value) {
    if (value && Number(value) !== 0) {
      let newValue = parseFloat(value).toFixed(2);
      const numberFormatter = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });
      const formatted = numberFormatter.format(newValue);
      return formatted;
    } else if (Number(value) == 0) {
      return 0.0;
    } else return 0.0;
  }
  const requestObj = await Requests.findOne({ _id: new ObjectId(claim_id) });
  if (!requestObj) return { success: false, message: 'Claim not found', data: [] };
  const requester_id = requestObj.user_id;
  const company_id = requestObj.company_id;
  const approvers_id = requestObj.approvals.map(approval => approval.approver_id).flat();
  const claims = requestObj.claims;
  let attachments = requestObj?.letter_fields?.files || [];

  let companyObj = await Companies.findById(company_id).select({ company_name: 1, logo: 1 });
  let defaultLogo = 'https://nathanhrerp.s3.amazonaws.com/companies/NN-Logo.png';
  if (companyObj && companyObj.logo && companyObj.logo != '' && companyObj.logo != null) {
    defaultLogo = companyObj.logo;
  }
  const approvers = await Users.find({ _id: { $in: approvers_id } }).select({ first_name: 1, last_name: 1 });
  const user = await Users.findById(requestObj?.user_id).select({
    first_name: 1,
    last_name: 1,
    email: 1,
    personal: 1,
    reporting: 1,
    company_ID: 1
  });
  const coreConfig = await CoreConfig.find({ company_ID: user?.company_id }, { designations: 1 });
  let designation = coreConfig?.[0]?.designations?.find(designation => designation.id == users.personal.designation);

  const doc = new PDFKitDocument({ size: 'A4' });
  const requestPromise = new Promise((resolve, reject) => {
    request(
      {
        url: defaultLogo,
        encoding: null // Prevents Request from converting response to string
      },
      async (err, response, body) => {
        if (err) reject(err);
        let title = 14;
        let title_ref = 12;
        let bodyFont = 10;
        let claimBundleTotal = 0;
        let headerFont = 7;

        doc.image(body, 40, 15, { fit: [200, 75] });
        doc
          .fontSize(headerFont)
          .font('Helvetica')
          .text('Classification : ', 449, 30, { lineBreak: false, align: 'right' })
          .font('Helvetica-Bold')
          .text('Confidential', { lineBreak: false, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(title).text('Reference Number ', 330, 40, { lineBreak: false, align: 'right' });
        doc
          .font('Helvetica')
          .fontSize(title_ref)
          .text(requestObj.letter_fields.reference_number, 470, 43, { lineBreak: false, align: 'right' });
        doc.font('Helvetica').fontSize(title).text('Created on', 380, 60, { lineBreak: false, align: 'right' });
        doc
          .font('Helvetica')
          .fontSize(title_ref)
          .text(moment(requestObj.date_created).format('DD MMM, YYYY'), 470, 63, { lineBreak: false, align: 'right' });
        doc.rect(40, 100, 500, 0);
        doc.stroke();
        doc
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text('Employee Name ', 40, 120, { lineBreak: false, align: 'left' })
          .text(':', 120, 120, { lineBreak: false, align: 'left' })
          .font('Helvetica')
          .text(user.first_name + ' ' + user.last_name, 130, 120, { lineBreak: false, align: 'left' });
        doc
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text('Designation ', 40, 134, { lineBreak: false, align: 'left' })
          .text(':', 120, 134, { lineBreak: false, align: 'left' })
          .font('Helvetica')
          .text(designation ? designation.name : user.personal.designation, 130, 134, { lineBreak: false, align: 'left' });

        doc
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text('DOJ', 40, 148, { lineBreak: false, align: 'left' })
          .text(':', 120, 148, { lineBreak: false, align: 'left' })
          .font('Helvetica')
          .text(moment(user.date_of_joining).format('DD MMM, YYYY'), 130, 148, { lineBreak: false, align: 'left' });

        doc
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text('Approved By', 40, 162, { lineBreak: false, align: 'left' })
          .text(':', 120, 162, { lineBreak: false, align: 'left' })
          .font('Helvetica')
          .text(approvers.map(approver => approver.first_name + ' ' + approver.last_name).join(', '), 130, 162, {
            lineBreak: false,
            align: 'left'
          });

        doc.rect(35, 200, 510, 20).fillAndStroke('#f0f0f0', '#f0f0f0');

        doc
          .fillColor('black')
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text('Claims (in AED)', 40, 206, { lineBreak: false, align: 'right' });

        const headers = ['Claim ID', 'Claim Type', 'Claim Sub Type', 'Claim Date', 'Amount'];
        const headerWidths = [100, 100, 100, 100, 100];
        const headerY = 230;
        const headerX = 40;
        const rowHeight = 20;

        function drawCell(text, x, y, width, type = 'cell') {
          doc.font(type == 'header' ? 'Helvetica-Bold' : 'Helvetica').text(text, x, y, { width: width, align: 'left' });
        }

        function sum(arr) {
          return arr.reduce((a, b) => a + b, 0);
        }

        headers.forEach((header, index) => {
          drawCell(header, headerX + sum(headerWidths.slice(0, index)), headerY, headerWidths[index], 'header');
        });

        claims.forEach((claim, index) => {
          const rowY = headerY + rowHeight + index * rowHeight;
          drawCell(claim.id, headerX + sum(headerWidths.slice(0, 0)), rowY, headerWidths[0]);
          drawCell(claim.letter_type, headerX + sum(headerWidths.slice(0, 1)), rowY, headerWidths[1]);
          drawCell(claim.letter_sub_type, headerX + sum(headerWidths.slice(0, 2)), rowY, headerWidths[2]);
          drawCell(
            moment(claim.details.request_date).format('DD MMM, YYYY'),
            headerX + sum(headerWidths.slice(0, 3)),
            rowY,
            headerWidths[3]
          );
          const amount = AmountFormatter(
            claim.details.hasOwnProperty('amount') ? claim.details.amount : claim.details.reimbursement_amount
          );
          claimBundleTotal += Number(amount);
          drawCell(amount, headerX + sum(headerWidths.slice(0, 4)), rowY, headerWidths[4]);
        });

        doc.rect(35, headerY + 20 * (claims.length + 1), 510, 20).fillAndStroke('#f0f0f0', '#f0f0f0');

        doc
          .fillColor('black')
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text('Total', headerX, headerY + 20 * (claims.length + 1) + 5, { lineBreak: false, align: 'right' });

        function parseCommaSeparatedFloat(str) {
          return parseFloat(str.replace(/,/g, ''));
        }

        doc
          .fillColor('black')
          .fontSize(bodyFont)
          .font('Helvetica')
          .text(
            AmountFormatter(claimBundleTotal),
            headerX + sum(headerWidths.slice(0, 4)),
            headerY + 20 * (claims.length + 1) + 5,
            { lineBreak: false, align: 'right' }
          );

        doc.text(
          '*Note: This is a computer generated claims request receipt and does not require signature.',
          98,
          doc.page.height - 50,
          {
            lineBreak: false,
            align: 'center'
          }
        );

        //attach all the attachments to th pdf. each attachment will be on a new page
        await insertAttachments(doc, attachments);

        doc.end();
        let file_name = 'Claim_Receipt_' + requestObj.letter_fields.reference_number + '.pdf';
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          const pdfData = Buffer.concat(buffers);
          const s3 = new AWS.S3({
            // accessKeyId: ID,
            // secretAccessKey: SECRET,
            // region: 'eu-central-1'
          });
          const params = {
            Bucket: BUCKET_NAME + '/claims',
            Key: file_name,
            Body: pdfData,
            ACL: 'public-read'
          };
          const data = await s3.upload(params).promise();
          const updatedClaimRequest = await Requests.findOneAndUpdate(
            { _id: new ObjectId(claim_id) },
            { $set: { receipt_url: data.Location } },
            { new: true }
          );
          resolve(updatedClaimRequest);
        });
      }
    );
  });

  const result = await requestPromise;
  if (result) return { success: true, message: 'Success', data: result };
  return { success: false, message: 'Failed to generate claim receipt', data: [] };
};
async function insertAttachments(doc, attachments) {
  var pdf2img = require('pdf-img-convert');
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    const mimetype = getMIMEType(attachment.link);
    if (mimetype == 'application/pdf') {
      try {
        const pdfBytes = await axios
          .get(attachment.link, {
            responseType: 'arraybuffer'
          })
          .then(response => response.data)
          .catch(error => {
            console.log('Error in generating attachment', error);
            return null;
          });
        if (!pdfBytes) continue;
        var pages = await pdf2img.convert(pdfBytes);
        for (let j = 0; j < pages.length; j++) {
          const image = pages[j];
          doc.addPage();
          doc.text(
            `Attachment ${i + 1}: ${attachment.name} - ${attachment.filename} - Page ${j + 1}/${pages.length}`,
            40,
            20,
            { lineBreak: false, align: 'left' }
          );
          const buffer = Buffer.from(image);
          doc.image(buffer, 50, 100, {
            fit: [500, 500],
            align: 'center',
            valign: 'center'
          });
        }
      } catch (error) {
        console.log('Error in generating attachment', error);
      }
    }
    if (!mimetype.includes('image')) continue; //TODO - handle attachments other than images and pdfs
    doc.addPage();
    doc.text(`Attachment ${i + 1}: ${attachment.name} - ${attachment.filename}`, 40, 20, {
      lineBreak: false,
      align: 'left'
    });
    try {
      const response = await reqPromise({
        url: attachments[i].link,
        encoding: null
      });
      doc.image(response.body, 40, 40);
    } catch (e) {
      console.log('Error in generating attachment', e);
    }
  }
}

module.exports = {
  createClaimRequest,
  deleteClaimDraftRequest,
  withdrawClaimRequest,
  approveClaimRequest,
  rejectClaimRequest,
  reassignClaimRequest,
  requiresClarificationClaimRequest,
  clarifyClaimRequest,
  getClaimtypes,
  getClaimReceipt
};
