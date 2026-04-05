const express = require('express');
const router = express.Router();
const requestModel = require('../../models/requests');
const usersModel = require('../../models/users.model');
const claimsHelper = require('../../helpers/claims_helper');
const companiesModel = require('../../models/companies.model');
// const payrollModel = require("../models/payroll");
// const configurationModel = require("../models/configuration");
const ClaimsTypesModel = require('../../models/claimsConfig');

// const notificationModel = require('../../models/notifications');
// const PayrollProcessModel = require('../models/payrollprocess')
const claimHelper = require('../../helpers/claim_helper');
const validateToken = require('../../../utils').validateAccessToken;

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { Claims } = require('@nathangroup/claim');
const { ClaimEmail } = require('@nathangroup/claim-email');
// const { ClaimEmail } = require("../helper/claimEmailIndex");
const AWS = require('aws-sdk');
const ses = new AWS.SES({
  // accessKeyId: process.env.ACCESS_KEY,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1',
});
/* New Claim request */
// validateToken
router.post('/add_claim', async (req, res) => {
  try {
    // const {company_ID} = req.body;
    const body = req.body;
    let claimKeysArr = body.letter_fields;
    const validate = claimHelper.commonFieldsValidation(claimKeysArr);
    if (!validate.status) {
      res.status(200).send({ status: true, validate: false, message: validate.message, data: validate.data });
      return;
    }

    const claimsArr = body.claims;
    for (let i = 0; i < claimsArr.length; i++) {
      let detailsValidate = claimHelper.dynamicFieldsValidation(claimsArr[i].claim_sub_type.claim_keys);
      if (!detailsValidate.status) {
        res
          .status(200)
          .send({ status: true, validate: false, message: detailsValidate.message, data: detailsValidate.data });
        return;
      }
    }
    let applicant = await usersModel.findOne({ _id: ObjectId(body.user_id) });
    const company_ID = applicant.company_id;
    applicant.company_ID = company_ID;
    let applied_manager = await usersModel
      .findOne({ _id: ObjectId(body.applied_manager) })
      .select({ first_name: 1, last_name: 1 });
    let Claim = new Claims();
    let ClaimsEmail = new ClaimEmail();
    if (applicant) {
      let applicants_company = await companiesModel.findOne({ _id: ObjectId(applicant.company_id) });
      let claim_ref_number = await ClaimsTypesModel.findOne({ company_ID: applicant.company_id }).select({
        claim_ref_no: 1,
      });
      let applicant_approvals = [{ approvers: applicant.reporting.claims_approvals }];

      // let claim_ref_number = await configurationModel.findOne({ company_ID: company_ID }).select({ 'claim_ref_no': 1 });
      /* Get Claim insert body */
      let insert_claim = Claim.CreateClaimRequest(
        applicant,
        body,
        claim_ref_number.claim_ref_no,
        applied_manager,
        applicant_approvals
      );
      for (let i = 0; i < claimsArr.length; i++) {
        let details = insert_claim.claims[i].details;
        for (let j = 0; j < claimsArr[i].claim_sub_type.claim_keys.length; j++) {
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

      if (typeof insert_claim === 'object') {
        let newClaim = false;
        if (req.body.type.toLowerCase() == 'draft') {
          insert_claim.status = 'Draft';
          if (req.body.id && req.body.id !== '') {
            await requestModel.findOneAndUpdate({ _id: ObjectId(req.body.id) }, insert_claim, { upsert: true });
          } else {
            const claim = new requestModel({ ...insert_claim });
            await claim.save();
          }
          // await configurationModel.updateOne({}, { $inc: { claim_ref_no: 1 } }, { new: true });
          return res
            .status(200)
            .json({ success: true, validate: true, message: 'claim saved as draft', data: insert_claim });
        } else if (req.body.id && req.body.id !== '') {
          newClaim = await requestModel.findOneAndUpdate({ _id: ObjectId(req.body.id) }, insert_claim, { upsert: true });
        } else {
          newClaim = new requestModel({ ...insert_claim });
          await newClaim.save();
        }

        if (newClaim) {
          /* Increment reference number count */
          let update_claim_ref_number = await ClaimsTypesModel.updateOne(
            { company_ID: applicant.company_id },
            { $inc: { claim_ref_no: 1 } },
            { new: true }
          );

          /* Email to first Approver */
          let approver_id = '';

          for (let i = 0; i < insert_claim.approvals.length; i++) {
            if (insert_claim.approvals[i].status == 'Processing') {
              approver_id = insert_claim.approvals[i].approver_id;
            }
          }

          let arr_users_id = [];

          insert_claim.approvals.forEach((element) => {
            arr_users_id.push(ObjectId(element.approver_id));
          });

          arr_users_id.push(ObjectId(body.user_id));

          let arr_users = await usersModel.aggregate([
            { $match: { _id: { $in: arr_users_id } } },
            { $project: { first_name: 1, last_name: 1, middle_name: 1 } },
          ]);

          // if (approver_id != '' && insert_claim.status.toLowerCase() == 'processing') {
          //   let first_approver = await usersModel.findOne({ _id: ObjectId(approver_id) });
          //   /* Approval Email content */
          //   let approver_email = ClaimsEmail.funClaimRequestApprovalManager(
          //     insert_claim,
          //     applicants_company,
          //     applicant,
          //     first_approver
          //   );
          //   /* Send Email to first Approver */
          //   sendEmail(first_approver.email, approver_email.subject, approver_email.body);
          //   /* Send Notification to first Approver */
          //   notifications('approver', 'approver', insert_claim, first_approver, applicant);
          // } else if (approver_id != '' && insert_claim.status.toLowerCase() == 'completed') {
          //   let first_approver = await usersModel.findOne({ _id: ObjectId(approver_id) });
          //   /* Email to Applicant */
          //   if (body.admin) {
          //     let applicant_email = ClaimsEmail.funClaimApprovedAdmin(insert_claim, applicants_company, applicant);
          //     sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
          //   } else {
          //     let applicant_email = ClaimsEmail.funClaimApproved(
          //       insert_claim,
          //       applicants_company,
          //       applicant,
          //       arr_users,
          //       'Auto Approved'
          //     );
          //     sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
          //   }

          //   if (
          //     insert_claim.payroll_process &&
          //     insert_claim.letter_fields &&
          //     insert_claim.letter_fields.amount &&
          //     insert_claim.letter_fields.amount > 500
          //   ) {
          //     createPayitems(obj_requestInfo, approver);
          //   }
          //   /* Send Notification to Applicant */
          //   notifications('applicant', 'approved', insert_claim, approver, applicant);
          // }

          /* Email to Applicant */
          // let applicant_email = ClaimsEmail.funNewClaimRequest(insert_claim, applicants_company, applicant, arr_users);

          /* Send Email to Applicant */
          // sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
          /* Send notifications to applicant */
          // notifications('applicant', 'created', newClaim, applicant, applicant);

          return res.status(200).json({ success: true, validate: true, message: 'Success', data: insert_claim });
        } else {
          return res.status(200).json({ success: false, message: 'Please try again later', data: [] });
        }
      } else {
        return res.status(200).json({ success: false, message: 'Please try again later', data: [] });
      }
    } else {
      return res.status(200).json({ success: false, message: 'User not found', data: [] });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});
/* Delete Claim Draft */
router.delete('/delete_draft/:draftId', async (req, res) => {
  try {
    const { draftId } = req.params;
    const deleteDraft = await requestModel.findByIdAndDelete({ _id: ObjectId(draftId) });
    if (deleteDraft) {
      res.status(200).send({ success: true, message: 'Draft deleted successfully', data: deleteDraft });
    } else {
      res.status(200).send({ success: false, message: 'Unable to delete the draft', data: {} });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: 'Unable to proceed with the request', data: error });
  }
});
/* Update status of claims */
router.patch('/update_claims_status', async (req, res) => {
  try {
    const { claimId, claims } = req.body;
    const claim = await requestModel.findOneAndUpdate({ _id: ObjectId(claimId) }, { claims });
    if (claim) {
      res.status(200).send({ success: true, message: 'status updated of all claims', data: claim });
    } else {
      res.status(200).send({ success: true, message: 'unable to update status of claims', data: claim });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: 'unable to proceed with the request', data: {} });
  }
});
/* Withdraw Claim request */
router.post('/withdraw_claim', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await usersModel.findOne({ _id: ObjectId(body.user_id) });

    let ClaimsEmail = new ClaimEmail();

    console.log(body);
    console.log(applicant);

    if (applicant) {
      let logs = {
        approver_id: applicant._id,
        date_created: new Date(),
        status: 'Claim Request Withdrawn.',
        reason: '',
      };
      let update_data = {
        $set: {
          status: 'Withdrawn',
          dateUpdated: new Date(),
          updatedBy: ObjectId(body.user_id),
          'approvals.$.status': 'Withdrawn by Employee',
        },
        $push: { appliction_log: logs },
      };

      let update_match = {
        _id: ObjectId(body.claim_id),
        'approvals.status': 'Processing',
      };

      let update_claim = await requestModel.findOneAndUpdate(update_match, update_data, { new: true });
      console.log(update_claim);
      if (update_claim != null) {
        /* Email to Applicant */
        let applicants_company = await companiesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
        let applicant_email = ClaimsEmail.funClaimWithdraw(update_claim, applicants_company, applicant);
        /* Send Email to Applicant */
        // sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
        /* Send Notification to Applicant */
        // notifications('applicant', 'withdrawn', update_claim, applicant, applicant);

        return res.status(200).json({ success: true, message: 'Success', data: update_claim });
      } else {
        return res
          .status(200)
          .json({ success: false, message: 'Failed to Withdraw request, Please try again later.', data: [] });
      }
    } else {
      return res.status(200).json({ success: false, message: 'User not found', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
/* Approve Claim request */
router.post('/approve_claim', async (req, res) => {
  try {
    const body = req.body;

    let applicant = await usersModel.findOne({ _id: ObjectId(body.user_id) });

    let approver = await usersModel.findOne({ _id: ObjectId(body.manager_id) });

    let claim_req = await requestModel.findOne({ _id: ObjectId(body.claim_id) });

    let Claim = new Claims();
    let ClaimsEmail = new ClaimEmail();

    if (applicant && approver) {
      // console.log(applicant , "Applicanbt")
      let applicant_company = await companiesModel.findOne({ _id: applicant.company_id }).lean();
      // console.log(applicant_company , 'applicant_company')
      let arr_users_id = [];

      claim_req.approvals.forEach((element) => {
        arr_users_id.push(ObjectId(element.approver_id));
      });
      if (body.approver_attachment.length > 0) {
        if (claim_req.approvals && claim_req.approvals.length > 0) {
          for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
            const element = claim_req.approvals[approval_index];
            if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
              element.hide_attachment = body.hide_attachment;
              element.approver_attachment = body.approver_attachment;
              break;
            }
          }
        }
      }

      arr_users_id.push(ObjectId(body.user_id));

      let arr_users = await usersModel.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
      ]);

      let approveClaim = {};

      if (body.admin) {
        approveClaim = Claim.funAdminClaimApprove(claim_req, body.reason, approver, arr_users);
      } else {
        approveClaim = Claim.funManagerClaimApprove(claim_req, body.reason, approver, arr_users);
      }

      if (approveClaim) {
        let obj_requestInfo = approveClaim.obj_requestInfo;

        let update_match = {
          _id: ObjectId(body.claim_id),
        };

        let update_data = {
          $set: obj_requestInfo,
        };

        let update_claim = await requestModel.findOneAndUpdate(update_match, update_data, { new: true });

        if (update_claim) {
          if (obj_requestInfo.status == 'completed') {
            /* Email to Applicant */
            if (body.admin) {
              // console.log(applicant_company , "applicant_company")
              let applicant_email = ClaimsEmail.funClaimApprovedAdmin(claim_req, applicant_company, applicant);
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            } else {
              let applicant_email = ClaimsEmail.funClaimApproved(
                claim_req,
                applicant_company,
                applicant,
                arr_users,
                body.reason
              );
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            }

            if (
              obj_requestInfo.payroll_process &&
              obj_requestInfo.letter_fields &&
              obj_requestInfo.letter_fields.amount &&
              obj_requestInfo.letter_fields.amount > 500
            ) {
              createPayitems(obj_requestInfo, approver);
            }

            /* Send Notification to Applicant */
            notifications('applicant', 'approved', obj_requestInfo, approver, applicant);
          } else {
            /* Email to Next approver */

            // if(approveClaim.arr_user_email.length >0){
            let approver_to_email = approveClaim.arr_user_email[0].email;
            let approver_email = ClaimsEmail.funClaimRequestApprovalManager(
              claim_req,
              applicant_company,
              applicant,
              approveClaim.arr_user_email[0]
            );
            sendEmail(approver_to_email, approver_email.subject, approver_email.body);

            /* Send Notification to next Approver */
            notifications('approver', 'approver', obj_requestInfo, approveClaim.arr_user_email[0], applicant);
            notifications('approver', 'created', obj_requestInfo, approveClaim.arr_user_email[0], applicant);
            // }
          }
          return res.status(200).json({ success: true, message: 'Success.', data: update_claim });
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
/* Reject Claim request */
router.post('/reject_claim', async (req, res) => {
  try {
    const body = req.body;

    let applicant = await usersModel.findOne({ _id: ObjectId(body.user_id) });

    let obj_rejecter = await usersModel.findOne({ _id: ObjectId(body.manager_id) });

    let rejecter = JSON.parse(JSON.stringify(obj_rejecter));

    let claim_req = await requestModel.findOne({ _id: ObjectId(body.claim_id) });

    let Claim = new Claims();
    let ClaimsEmail = new ClaimEmail();

    if (applicant && rejecter) {
      let applicant_company = await companiesModel.findOne({ _id: applicant.company_id }).lean();
      let arr_users_id = [];

      claim_req.approvals.forEach((element) => {
        arr_users_id.push(ObjectId(element.approver_id));
      });
      if (body.approver_attachment.length > 0) {
        if (claim_req.approvals && claim_req.approvals.length > 0) {
          for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
            const element = claim_req.approvals[approval_index];
            if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
              element.hide_attachment = body.hide_attachment;
              element.approver_attachment = body.approver_attachment;
              break;
            }
          }
        }
      }

      arr_users_id.push(ObjectId(body.user_id));

      let arr_users = await usersModel.aggregate([
        { $match: { _id: { $in: arr_users_id } } },
        { $project: { email: 1, first_name: 1, last_name: 1, middle_name: 1, personal: 1 } },
      ]);

      let rejectClaim = {};
      // console.log(applicant_company , "applicant_company")
      if (body.admin && applicant_company && applicant_company.rejection_flow) {
        rejectClaim = Claim.funAdminClaimReject(
          claim_req,
          body.reason,
          rejecter,
          arr_users,
          applicant_company.rejection_flow
        );
      } else {
        rejectClaim = Claim.funManagerClaimReject(
          claim_req,
          body.reason,
          rejecter,
          arr_users,
          applicant_company.rejection_flow
        );
      }

      if (rejectClaim) {
        console.log(rejectClaim, 'rejectClaim');
        let obj_requestInfo = rejectClaim.obj_requestInfo;

        let update_match = {
          _id: ObjectId(body.claim_id),
        };

        let update_data = {
          $set: obj_requestInfo,
        };

        let update_claim = await requestModel.findOneAndUpdate(update_match, update_data, { new: true });

        if (update_claim) {
          console.log(obj_requestInfo, '--obj_requestInfo');
          if (obj_requestInfo.status == 'Cancelled') {
            /* Email to Applicant */
            if (body.admin) {
              let applicant_email = ClaimsEmail.funClaimRejectedAdmin(claim_req, applicant_company, applicant);
              sendEmail(applicant.email, applicant_email.subject, applicant_email.body);
            } else {
              let applicant_email = ClaimsEmail.funClaimRejected(
                claim_req,
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
            /* Email to Next approver */
            let approver_to_email = rejectClaim.arr_user_email[0].email;
            let approver_email = ClaimsEmail.funClaimRequestApprovalManager(
              claim_req,
              applicant_company,
              applicant,
              rejectClaim.arr_user_email[0]
            );
            sendEmail(approver_to_email, approver_email.subject, approver_email.body);

            /* Send Notification to next Approver */
            notifications('approver', 'approver', obj_requestInfo, rejectClaim.arr_user_email[0], applicant);
          }
          return res.status(200).json({ success: true, message: 'Success.', data: update_claim });
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
/* Reassign Claim request */
router.post('/reassign_claim', validateToken, async (req, res) => {
  try {
    const body = req.body;

    let applicant = await usersModel.findOne({ _id: ObjectId(body.user_id) });
    /* Reassigning manager */
    let obj_approver = await usersModel.findOne({ _id: ObjectId(body.manager_id) });

    let approver = JSON.parse(JSON.stringify(obj_approver));

    let reassigned_manager = await usersModel.findOne({ _id: ObjectId(body.reassign_manager_id) });

    let claim_req = await requestModel.findOne({ _id: ObjectId(body.claim_id) });

    let Claim = new Claims();
    let ClaimsEmail = new ClaimEmail();

    if (body.approver_attachment.length > 0) {
      if (claim_req.approvals && claim_req.approvals.length > 0) {
        for (let approval_index = 0; approval_index < claim_req.approvals.length; approval_index++) {
          const element = claim_req.approvals[approval_index];
          if (!element.hasOwnProperty('hide_attachment') && element.status.toLowerCase() == 'processing') {
            element.hide_attachment = body.hide_attachment;
            element.approver_attachment = body.approver_attachment;
            break;
          }
        }
      }
    }

    if (applicant && approver && reassigned_manager) {
      let applicant_company = await companiesModel.findOne({ _id: ObjectId(applicant.company_id) }).lean();
      /* Reassign claim request */
      let reassign_claim = Claim.funReassignClaim(claim_req, body.reason, approver, reassigned_manager, body.admin);

      let update_match = {
        _id: ObjectId(body.claim_id),
      };

      let update_data = {
        $set: reassign_claim,
      };

      let update_claim = await requestModel.findOneAndUpdate(update_match, update_data, { new: true });

      if (update_claim) {
        /* Send email to apporver */
        let approver_to_email = reassigned_manager.email;
        let approver_email = ClaimsEmail.funClaimRequestApprovalManager(
          claim_req,
          applicant_company,
          applicant,
          reassigned_manager
        );
        sendEmail(approver_to_email, approver_email.subject, approver_email.body);
        /* Send Notification to next Approver */
        notifications('approver', 'approver', update_claim, reassigned_manager, applicant);

        res.status(200).json({ success: true, message: 'Success.', data: update_claim });
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
/* Claims requests listing */
router.post('/get_all_claims_requests', validateToken, async (req, res) => {
  try {
    let skipCount = parseInt(req.body.skip);
    let pageLimit = parseInt(req.body.limit);
    let letterType = req.body.letterType;
    let userType = req.body.userType;
    let user_id = req.body.user_id;

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
      //if (letterType == 'ALL') match = { $match: { request_type: "claims", user_id: user_id } }
      if (letterType == 'ALL') match = { $match: { request_type: 'claims', user_id: ObjectId(user_id) } };
    }

    const requests = await requestModel.aggregate([
      match,
      { $skip: skipCount },
      { $limit: pageLimit },
      {
        $addFields: {
          objid_user_id: { $toObjectId: '$user_id' },
          sortNum: {
            $switch: {
              branches: [
                {
                  case: {
                    $in: ['$status', ['processing', 'Processing']],
                  },
                  then: 4,
                },
                {
                  case: {
                    $in: ['$status', ['Completed', 'completed']],
                  },
                  then: 3,
                },
                {
                  case: {
                    $in: ['$status', ['Approved', 'approved']],
                  },
                  then: 2,
                },
                {
                  case: {
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
          localField: 'objid_user_id',
          foreignField: '_id',
          as: 'user_data',
          pipeline: [
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
        },
      },
      { $sort: { sortNum: -1, date_created: -1 } },
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
          user_data: 1,
        },
      },
    ]);
    res.status(200).json(requests);
  } catch (error) {
    // log
    res.status(500).send(error.message);
  }
});

/* Get Claim types for user */
router.get('/get_claim_types/:_id', async (req, res) => {
  try {
    // const { company_ID } = req.body;
    const body = req.params;

    let applicant = await usersModel.findOne({ _id: ObjectId(body._id) });
    let claimTypes = await ClaimsTypesModel.findOne({ company_ID: ObjectId(applicant.company_id) }).select({
      ClaimSubTypes: 1,
    });
    let Claim = new Claims();

    if (applicant && claimTypes) {
      let claim_types = await claimsHelper.funEligibleclaimTypes(applicant, claimTypes.ClaimSubTypes);

      if (claim_types && claim_types.length > 0) {
        res.status(200).json({ success: true, message: 'Success.', data: claim_types });
      } else {
        res.status(200).json({ success: false, message: 'Not Eligible for any claims.', data: [] });
      }
    } else {
      return res.status(200).json({ success: false, message: 'User not found', data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

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
/* Create Payitems after claim request approved and claim is payroll processed */
async function createPayitems(obj_request, approver) {
  try {
    const { company_ID } = req.body;
    const payrol_approvals = await ClaimsTypesModel.findOne({ company_ID: company_ID }).select({ payitemApprovals: 1 });

    let app_log = [];
    let logs = {
      created_by: approver._id,
      status: 'Created',
      createdDate: new Date(),
    };
    app_log.push(logs);

    let month = new Date().getMonth() + 1 + '';
    let year = new Date().getFullYear();
    month.length > 1 ? (month = month) : (month = '0' + month);

    let approval_levels = payrol_approvals.payitemApprovals.length;
    let approvers = payrol_approvals.payitemApprovals;
    let approval_array = [];
    /* Create payitems approval flow*/
    for (let index = 0; index < approval_levels; index++) {
      if (obj_request.payroll_auto_approved) {
        let logs = {
          created_by: approver._id,
          status: 'Auto approved',
          createdDate: new Date(),
        };
        app_log.push(logs);

        let approval_obj = {
          approver_id: approvers[index],
          status: 'Auto approved',
          approved_date: new Date(),
          reason: 'Auto approved',
        };
        approval_array.push(approval_obj);
      } else {
        let approval_obj = {
          approver_id: approvers[index],
          status: '',
          approved_date: '',
          reason: '',
        };
        index == 0 ? (approval_obj.status = 'Processing') : (approval_obj.status = 'Pending');
        approval_array.push(approval_obj);
      }
    }
    let payrollprocess = await PayrollProcessModel.findOne({
      status: 'active',
      company_id: obj_request.company_id,
    });
    console.log('why', payrollprocess.submit_for_approval);
    let PayitemPaymonth = '';
    if (payrollprocess.submit_for_approval == 'false' || payrollprocess.submit_for_approval == false) {
      //? If pay month is not yet submitted for approval then add payitem to the current paymonth
      PayitemPaymonth = payrollprocess.pay_month;
    } else {
      //? else if the  pay month is submitted then add payitem to the next paymonth
      PayitemPaymonth = moment(payrollprocess.pay_month, 'YYYY-MM').add(1, 'M').format('YYYY-MM');
    }

    let payitemObj = {
      pay_month: PayitemPaymonth,
      user_id: obj_request.user_id,
      first_name: obj_request.letter_fields.name,
      last_name: '',
      approvals: approval_array,
      earning_type: 'Earning',
      category: 'Claims',
      remarks: obj_request.letter_type + '-' + obj_request.letter_sub_type,
      logs: app_log,
      amount: parseFloat(obj_request.letter_fields.amount),
      approved_by_id: approvers[0],
      recursive_id: 'Non-Recursive',
      status: 'active',
      unpaid: 0,
      ot_type: '',
      hours: '',
      claim_id: obj_request._id,
      created_by_id: approver._id,
      company_id: obj_request.company_id,
    };

    const payroll = new payrollModel(payitemObj);
    let insert_payitem = await payroll.save();
  } catch (error) {
    console.log(error);
  }
}
/* Create notfification for claim requests */
async function notifications(type, subType, obj_request, approver, applicant) {
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
      };

      const notify = new notificationModel(notification);
      let insert_notification = await notify.save();
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
        };

        const notify = new notificationModel(notification);
        let insert_notification = await notify.save();
      } else if (subType == 'withdrawn') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Request Withdrawn',
          notification_text: 'Your Claim Request is Withdrawn. Please check your HR Self service for more details.',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
          createdDate: new Date(),
        };

        const notify = new notificationModel(notification);
        let insert_notification = await notify.save();
      } else if (subType == 'rejected') {
        let notification = {
          user_id: [String(applicant._id)],
          read_by: [],
          notification_type: 'Claim Request Rejected',
          notification_text: 'Your Claim Request is Rejected. Please check your HR Self service for more details',
          created_by: approver._id,
          url: '/dashboards/myhr#claim',
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
module.exports = router;
