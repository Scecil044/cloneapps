const express = require('express');
const ConfigModel = require('../models/config');
const LeavesHelper = require('./leaves_helper');
const RequestsModel = require('../models/requests');
const UsersModel = require('../models/users.model');
const ConfigurationModel = require('../models/configuration.model');
const CompanyModel = require('../models/companies.model');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  updateApproverStatus: async function (LetterData, ApproverData) {
    let approver_id = ApproverData.approver_id;
    let reason = ApproverData.reason;
    let leave_status;
    let approver_object;
    let next_approver;
    let isapprover_found = false;
    let isNextapprover_found = false;
    let total_approvers = 0;
    let update_leave_status = false;
    let current_approver_rank = null;
    let send_email_notification_user = false;
    let send_email_notification_next_approver = false;
    var isoDate = new Date().toISOString();

    try {
      let Status = {
        isupdated: false,
        message: 'Whoops! Unable to Update Object',
      };

      let approvals = LetterData.approvals;
      total_approvers = approvals.length; //2

      for (i = 0; i < approvals.length; i++) {
        console.log('Total approver Length' + approvals.length);

        if (
          approver_id == approvals[i].approver_id &&
          (approvals[i].status == 'Pending' || approvals[i].status == 'Processing')
        ) {
          isapprover_found = true;
          current_approver_rank = i;
          //send_email_notification_user = true;

          //MODIFYING LEAVE OBJECT

          LetterData.approvals[i].status = 'Approved';
          approver_object = LetterData;
          LetterData.approvals[i].reason = reason;
          LetterData.approvals[i].approved_date = isoDate;

          //CHECK NEXT APPROVER
          let j = i + 1;

          if (
            LetterData.approvals[j] &&
            (LetterData.approvals[j].status == 'Pending' || approvals[j].status == 'Processing')
          ) {
            next_approver = LetterData.approvals[j];
            console.log('more approvers found');
            isNextapprover_found = true;
            send_email_notification_next_approver = true;
          } else {
            console.log('No more approvers found');
          }

          Status = {
            isupdated: true,
            message: approver_object,
          };

          break;
        }
      }

      if (isapprover_found == false) {
        Status = {
          isupdated: false,
          message: 'Woops ! No Approper Match with Existing ID',
        };
      }

      //UPDATE LEAVE STAUS

      /* if the current user is last approver then change status of leave to Approved */

      if (current_approver_rank == total_approvers - 1) {
        update_leave_status = true;
        send_email_notification_user = true;

        //MODIFYING LEAVE OBJECT
        LetterData.status = 'completed';

        //send_email_notification_user = true;
      }

      if (current_approver_rank == null) {
        Status = {
          isupdated: false,
          message: 'Woops ! No Approper Match with Existing ID OR it Already Approved',
        };
      }

      //UPDATE LEAVE OBJECT WITH NEWLY CONSTRCUTED OBJECT

      let isUpdatedApproverStatus = await RequestsModel.findOneAndUpdate({ _id: LetterData._id }, LetterData, {
        fields: { approvals: 1, status: 1 },
        new: true,
      });

      if (isUpdatedApproverStatus.length != 0 && current_approver_rank != null) {
        //send_email_notification_user = true;
        Status = {
          isupdated: true,
          message: 'Sucessfully Updated',
          update_leave_status: update_leave_status,
          current_approver_rank: current_approver_rank,
          send_email_notification_user: send_email_notification_user,
          send_email_notification_next_approver: send_email_notification_next_approver,
          isNextapprover_found: isNextapprover_found,
          next_approver: next_approver,
          data: isUpdatedApproverStatus,
        };
      } else {
        send_email_notification_user = false;
      }

      if (send_email_notification_user == true) {
        console.log('we can send the email now');
      } else {
        console.log("we can't send the email");
      }

      return Status;
    } catch (error) {
      console.log(err);
    }
  },

  updateApproverStatusAttendance: async function (LetterData, ApproverData) {
    let approver_id = ApproverData.approver_id;
    let reason = ApproverData.reason;
    let leave_status;
    let approver_object;
    let next_approver;
    let isapprover_found = false;
    let isNextapprover_found = false;
    let total_approvers = 0;
    let update_leave_status = false;
    let current_approver_rank = null;
    let send_email_notification_user = false;
    let send_email_notification_next_approver = false;
    var isoDate = new Date().toISOString();

    try {
      let Status = {
        isupdated: false,
        message: 'Whoops! Unable to Update Object',
      };

      let approvals = LetterData.approvals;
      total_approvers = approvals.length;

      for (i = 0; i < approvals.length; i++) {
        if (
          approver_id == approvals[i].approver_id &&
          (approvals[i].status == 'Pending' || approvals[i].status == 'Processing')
        ) {
          isapprover_found = true;
          current_approver_rank = i;
          //send_email_notification_user = true;

          //MODIFYING LEAVE OBJECT

          LetterData.approvals[i].status = 'Approved';
          approver_object = LetterData;
          LetterData.approvals[i].reason = reason;
          LetterData.approvals[i].approved_date = isoDate;

          //CHECK NEXT APPROVER
          let j = i + 1;

          if (
            LetterData.approvals[j] &&
            (LetterData.approvals[j].status == 'Pending' || approvals[j].status == 'Processing')
          ) {
            next_approver = LetterData.approvals[j];
            isNextapprover_found = true;
            send_email_notification_next_approver = true;
          } else {
            console.log('No more approvers found');
          }

          Status = {
            isupdated: true,
            message: approver_object,
          };

          break;
        }
      }

      if (isapprover_found == false) {
        Status = {
          isupdated: false,
          message: 'Woops ! No Approper Match with Existing ID',
        };
      }

      //UPDATE LEAVE STAUS

      /* if the current user is last approver then change status of leave to Approved */

      if (current_approver_rank == total_approvers - 1) {
        update_leave_status = true;
        send_email_notification_user = true;

        //MODIFYING LEAVE OBJECT
        LetterData.status = 'completed';

        //send_email_notification_user = true;
      }

      if (current_approver_rank == null) {
        Status = {
          isupdated: false,
          message: 'Woops ! No Approper Match with Existing ID OR it Already Approved',
        };
      }

      //UPDATE LEAVE OBJECT WITH NEWLY CONSTRCUTED OBJECT

      let isUpdatedApproverStatus = await RequestsModel.findOneAndUpdate({ _id: LetterData._id }, LetterData, {
        fields: { approvals: 1, status: 1 },
        new: true,
      });

      if (isUpdatedApproverStatus.length != 0 && current_approver_rank != null) {
        //send_email_notification_user = true;
        Status = {
          isupdated: true,
          message: 'Sucessfully Updated',
          update_leave_status: update_leave_status,
          current_approver_rank: current_approver_rank,
          send_email_notification_user: send_email_notification_user,
          send_email_notification_next_approver: send_email_notification_next_approver,
          isNextapprover_found: isNextapprover_found,
          next_approver: next_approver,
          data: isUpdatedApproverStatus,
        };
      } else {
        send_email_notification_user = false;
      }

      if (send_email_notification_user == true) {
        console.log('we can send the email now');
      } else {
        console.log("we can't send the email");
      }

      return Status;
    } catch (error) {
      console.log(err);
    }
  },

  updateApproverStatus_Reject: async function (LetterData, ApproverData) {
    let approver_id = ApproverData.approver_id;
    let reason = ApproverData.reason;
    let leave_status;
    let approver_object;
    let next_approver;
    let isapprover_found = false;
    let isNextapprover_found = false;
    let total_approvers = 0;
    let update_leave_status = false;
    let current_approver_rank = null;
    let send_email_notification_user = false;
    let send_email_notification_next_approver = false;
    var isoDate = new Date().toISOString();

    try {
      let Status = {
        isupdated: false,
        message: 'Whoops! Unable to Update Object',
      };

      let approvals = LetterData.approvals;
      total_approvers = approvals.length; //2
      for (i = 0; i < approvals.length; i++) {
        console.log('Total approver Length' + approvals.length);
        console.log('Reject Request From' + approver_id);
        if (
          approver_id == approvals[i].approver_id &&
          (approvals[i].status == 'Pending' ||
            approvals[i].status == 'pending' ||
            approvals[i].status == 'Processing' ||
            approvals[i].status == 'processing')
        ) {
          isapprover_found = true;
          current_approver_rank = i;
          //send_email_notification_user = true;

          //MODIFYING LEAVE OBJECT

          LetterData.approvals[i].status = 'Rejected';
          approver_object = LetterData;
          LetterData.approvals[i].reason = reason;
          LetterData.approvals[i].approved_date = isoDate;

          //CHECK NEXT APPROVER
          let j = i + 1;

          if (
            LetterData.approvals[j] &&
            (LetterData.approvals[j].status == 'Pending' || approvals[j].status == 'Processing')
          ) {
            next_approver = LetterData.approvals[j];
            console.log('more approvers found');
            isNextapprover_found = true;
            send_email_notification_next_approver = true;
          } else {
            console.log('No more approvers found');
          }

          Status = {
            isupdated: true,
            message: approver_object,
          };

          break;
        }
      }

      if (isapprover_found == false) {
        Status = {
          isupdated: false,
          message: 'Woops ! No Approper Match with Existing ID',
        };
      }

      //UPDATE LEAVE STAUS

      /* if any approver reject we need to change object.status */

      update_leave_status = true;
      send_email_notification_user = true;

      //MODIFYING LEAVE OBJECT
      LetterData.status = 'Cancelled';

      /* if (current_approver_rank == total_approvers - 1) {
         update_leave_status = true;
         send_email_notification_user = true;
 
         //MODIFYING LEAVE OBJECT
         LetterData.status = "Cancelled";
         console.log(total_approvers);
 
         //send_email_notification_user = true;
       }*/

      if (current_approver_rank == null) {
        Status = {
          isupdated: false,
          message: 'Woops ! No Approper Match with Existing ID OR it Already Approved',
        };
      }

      //UPDATE LEAVE OBJECT WITH NEWLY CONSTRCUTED OBJECT

      let isUpdatedApproverStatus = await RequestsModel.findOneAndUpdate({ _id: LetterData._id }, LetterData, {
        fields: { approvals: 1, status: 1 },
        new: true,
      });

      /* let isUpdatedApproverStatus = await RequestsModel.findOneAndUpdate(
         { _id: LetterData._id },
         LetterData
       );*/

      if (isUpdatedApproverStatus && current_approver_rank != null) {
        //send_email_notification_user = true;
        Status = {
          isupdated: true,
          message: 'Sucessfully Updated',
          update_leave_status: update_leave_status,
          current_approver_rank: current_approver_rank,
          send_email_notification_user: send_email_notification_user,
          send_email_notification_next_approver: send_email_notification_next_approver,
          isNextapprover_found: isNextapprover_found,
          next_approver: next_approver,
          data: isUpdatedApproverStatus,
        };
      } else {
        send_email_notification_user = false;
      }

      if (send_email_notification_user == true) {
        console.log('we can send the email now');
      } else {
        console.log("we can't send the email");
      }

      return Status;
    } catch (error) {
      console.log(err);
    }
  },

  /**
   * GET LETTER FIELDS ELECTRIC WAY
   * since Electric way using diffrent schema compare to other clients
   * so we need  to get needed fields
   *
   */

  getLetterRequestConfigurationData: async function (requestType, RequestSubType, LetterType) {
    var letterRequest;

    var FinalPayload;
    console.log('we are inside  getLetterRequestConfigurationData');

    try {
      var configData = await ConfigurationModel.find().select('letterRequest');

      if (configData.length > 0) {
        letterRequest = configData[0].letterRequest;
      }

      if (RequestSubType == 'Driving' || RequestSubType == 'Travel') {
        if (letterRequest) {
          for (i = 0; i < letterRequest.length; i++) {
            if (letterRequest[i].letterDescription.requestSubType == RequestSubType) {
              FinalPayload = letterRequest[i];
            }
          }
        }
      }

      if (LetterType == 'Salary Transfer Letter' || LetterType == 'Salary Certificate') {
        if (letterRequest) {
          for (i = 0; i < letterRequest.length; i++) {
            if (letterRequest[i].letterDescription.requestType == LetterType) {
              FinalPayload = letterRequest[i];
            }
          }
        }
      }

      console.log('TARGET ARRAY');
    } catch (e) {
      console.log(e);
    }
    return FinalPayload;
  },

  getPdfStylesData: async function (FinalPayload, requestType, RequestSubType) {
    var leftSidebarColValue;

    let pdfStylesPayload = {
      leftSidebarCol: leftSidebarColValue,
      bodyCol: FinalPayload.bodyCol,
      rightSidebarCol: FinalPayload.rightSidebarCol,
      header: FinalPayload.headerShow.pdf,
      date_format: FinalPayload.dateFormat,
      addressee_position: FinalPayload.formattedText.formatHeader,
      subject_position: FinalPayload.formattedText.formatStyle,
      body_position: FinalPayload.formattedText.formatStyle,
      left_sideBar: 'text_alignment_left',
      right_sideBar: FinalPayload.rightSideBar.pdf,
      signature: FinalPayload.signatureShow.pdf,
      stamp: FinalPayload.stampShow.pdf,
      watermark: FinalPayload.watermarkShow.pdf,
      footer: FinalPayload.footerShow.pdf,
      signatory: FinalPayload.signatory.pdf,
      date_position: FinalPayload.formattedText.formatDate,
    };

    return pdfStylesPayload;
  },

  getPreviewStylesData: async function (FinalPayload, requestType, RequestSubType) {
    try {
      var pdfStylesPayload = {
        leftSidebarCol: FinalPayload.leftSidebarCol,
        bodyCol: FinalPayload.bodyCol,
        rightSidebarCol: FinalPayload.rightSidebarCol,
        header: FinalPayload.headerShow.preview,
        date_format: FinalPayload.dateFormat,
        addressee_position: FinalPayload.formattedText.formatHeader,
        subject_position: FinalPayload.formattedText.formatStyle,
        body_position: 'text_alignment_left',
        left_sideBar: FinalPayload.leftSideBar.preview,
        right_sideBar: FinalPayload.rightSideBar.preview,
        signature: FinalPayload.signatureShow.preview,
        stamp: FinalPayload.stampShow.preview,
        watermark: FinalPayload.watermarkShow.preview,
        footer: FinalPayload.footerShow.preview,
        signatory: FinalPayload.signatory.preview,
        date_position: FinalPayload.formattedText.formatDate,
      };
    } catch (e) {
      console.log(e);
    }

    return pdfStylesPayload;
  },

  getLetterImagesData: async function (company_id) {
    var LetterDetails;
    var letterImagesPayload;

    try {
      LetterDetails = await CompanyModel.findById({ _id: company_id }).select('letterDetail').lean();
      letterImagesPayload = {
        headerImageLink: LetterDetails.letterDetail.headerImageLink,
        footerImageLink: LetterDetails.letterDetail.footerImageLink,
        companyStampLink: LetterDetails.letterDetail.companyStampLink,
        waterMarkLink: LetterDetails.letterDetail.waterMarkLink,
        signatureLink: LetterDetails.letterDetail.signatureLink,
      };
    } catch (e) {
      console.log(e);
    }

    return letterImagesPayload;
  },

  getLetterSignatoryData: async function (company_id) {
    var LetterSignatoryDetails;
    var letterSignatoryPayload;

    try {
      LetterSignatoryDetails = await CompanyModel.findById({
        _id: company_id,
      })
        .select('letterDetail')
        .lean();

      letterSignatoryPayload = {
        id: LetterSignatoryDetails.letterDetail?.manager?._id,
        name: LetterSignatoryDetails.letterDetail?.manager?.name,
        designation: LetterSignatoryDetails.letterDetail?.manager?.designation,
        signature: LetterSignatoryDetails.letterDetail?.manager?.signature,
      };
    } catch (e) {
      console.log(e);
    }

    return letterSignatoryPayload;
  },

  getLetterTemplateData: async function (FinalPayload) {
    var letterTemplatePayload;

    try {
      /*LetterTemplateDetails = await CompanyModel.findById({ _id: company_id }).select(
        "letterDetail"
      );*/

      letterTemplatePayload = {
        addressee: FinalPayload.letterDescription.header,
        subject: FinalPayload.letterDescription.subject,
        body: FinalPayload.letterDescription.body,
      };
    } catch (e) {
      console.log(e);
    }

    return letterTemplatePayload;
  },

  updateLetterDataWithLetterKeys: async function (lettersInfo, FinalPayload) {
    var response;
    try {
      var letter_key_from_config; //FROM DATABASE
      var letter_key_from_client; //FROM CLIENT REQUEST

      if (FinalPayload.letterKeys) {
        letter_key_from_config = FinalPayload.letterKeys;
      }

      if (lettersInfo.letter_keys) {
        letter_key_from_client = lettersInfo.letter_keys;

        for (let i = 0; i < letter_key_from_client.length; i++) {
          for (j = 0; j < letter_key_from_config.length; j++) {
            //FIND ELEMENT AND REPLACE

            var item = letter_key_from_config.find((x) => x.name.key == letter_key_from_client[i].id);
            if (item) {
              // console.log(item);
              //CHECK DATE PICKER OR NOT IF DATE PICER FORMATE DATE YYYY-MM-DD
              if (item.type == 'Date Picker') {
                item.value = letter_key_from_client[i].value.slice(0, 10);
              } else {
                item.value = letter_key_from_client[i].value;
                // console.log('find');
              }

              // const date="2022-06-29 00:00:00.000";
              //console.log(date.slice(0, 10));

              //Date Picker
            } else {
              console.log('not able to find');
            }

            if (letter_key_from_config[j].name.key == letter_key_from_client[i].id) {
              //LETTER KEY MATCH WITH CLIENT CONFIG DATA
            }
          }
        }

        response = letter_key_from_config;
      }
    } catch (e) {
      console.log(e);
    }

    return response;
  },

  getLetterAdditionalFieldData: async function (lettersInfo) {
    var ExtrafieldsPayload;

    try {
      // const UserDetails = await UsersModel.findById({
      //   _id: lettersInfo.user_id,
      // });
      let UserDetailselem = await UsersModel.aggregate([
        { $match: { _id: ObjectId(lettersInfo.user_id) } },
        { $addFields: { companyId_objId: { $toObjectId: '$company_id' } } },
        {
          $addFields: {
            companyId_objId: { $toObjectId: '$company_id' },
            managerId_objId: { $toObjectId: '$reporting.manager' },
          },
        },
        {
          $lookup: {
            from: 'companies',
            let: {
              companyId: '$companyId_objId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$companyId'] }],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  company_name: 1,
                  company_address: 1,
                  company_phone: 1,
                },
              },
            ],
            as: 'array_company',
          },
        },
        { $unwind: '$array_company' },
        {
          $lookup: {
            from: 'users',
            let: {
              managerId: '$managerId_objId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$_id', '$$managerId'] }],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  first_name: 1,
                  last_name: 1,
                  middle_name: 1,
                  email: 1,
                  'personal.phone': 1,
                  'personal.gender': 1,
                },
              },
            ],
            as: 'array_manager',
          },
        },
        { $unwind: '$array_manager' },
      ]);
      // console.log(UserDetailselem[0]);
      const UserDetails = UserDetailselem[0];
      //const obj = JSON.parse();

      let title = '';
      if (UserDetails.personal?.gender === 'Male') {
        title = 'Mr.';
      } else if (UserDetails.personal?.gender === 'Female') {
        title = UserDetails.personal.marital_status == 'Married' ? 'Mrs.' : 'Ms.';
      }

      let letter_keys = lettersInfo.letter_type.includes('Custom Letter') ? [] : lettersInfo.letter_keys;
      // totalFixedWord Data
      let filtered = letter_keys.filter((x) => x.id == '[totalFixedWord]');
      let total_fixed_word = filtered.length > 0 ? filtered[0].value : '';
      // totalFixedWord Data
      let filtered1 = letter_keys.filter((x) => x.id == '[basicSalaryInWords]');
      let basic_salary_word = filtered1.length > 0 ? filtered1[0].value : '';

      // loanAmountInWords Data
      let filtered2 = letter_keys.filter((x) => x.id == '[loanAmountInWords]');
      let loan_amount_word = filtered2.length > 0 ? filtered2[0].value : '';

      // personalLoanTable Data
      let filteredPer = letter_keys.filter((x) => x.id == '[personalLoanTable]');
      let personalLoan_table = filteredPer.length > 0 ? filteredPer[0].value : '';
      // personalLoanTable2 Data
      let filteredPer2 = letter_keys.filter((x) => x.id == '[personalLoanTable2]');
      let personalLoan_table2 = filteredPer2.length > 0 ? filteredPer2[0].value : '';
      // personalLoanTable3 Data
      let filteredPer3 = letter_keys.filter((x) => x.id == '[personalLoanTable3]');
      let personalLoan_table3 = filteredPer3.length > 0 ? filteredPer3[0].value : '';
      let funGetUserName = function (obj_userInfo) {
        var name = '';
        if (obj_userInfo.first_name != undefined) {
          name += obj_userInfo.first_name + ' ';
        }
        if (obj_userInfo.middle_name != undefined) {
          name += obj_userInfo.middle_name + ' ';
        }
        if (obj_userInfo.last_name != undefined) {
          name += obj_userInfo.last_name;
        }
        return name;
      };
      ExtrafieldsPayload = {
        nationality: UserDetails.personal?.nationality,
        emp_id: UserDetails.emp_id,
        dob: UserDetails.personal?.dob,
        user_name: UserDetails.first_name + ' ' + UserDetails.last_name,
        passport: UserDetails.documents.passport_number,
        passportexpiry: UserDetails.documents.passport_number,
        passportissue: UserDetails.documents.passport_number,
        role: UserDetails.personal?.designation,
        total_fixed: UserDetails.salary['total_fixed'],
        basic_salary: UserDetails.salary['basic_salary'],
        accommodation_allowance: UserDetails.salary['accommodation_allowance'],
        medical_allowance: UserDetails.salary['medical_allowance'],
        transport_allowance: UserDetails.salary['transport_allowance'],
        other_allowance: UserDetails.salary['other_allowance'],
        work_start_date: UserDetails.date_of_joining,
        gender: UserDetails.personal?.gender,
        bank: UserDetails.bank.bank_name,
        iban: UserDetails.bank.iban,
        account_number: UserDetails.bank.account_number,
        total_fixed_word: total_fixed_word,
        total_fixed_word: total_fixed_word,
        department: UserDetails.reporting.department,
        loan_amount_word: loan_amount_word,
        personalLoan_table: personalLoan_table,
        personalLoan_table2: personalLoan_table2,
        personalLoan_table3: personalLoan_table3,
        company: UserDetails.array_company,
        basic_salary_word: basic_salary_word,
        managername: funGetUserName(UserDetails.array_manager),
        manageremail: UserDetails.array_manager.email,
        managerphone: UserDetails.array_manager.personal?.phone,
        managerheshe: UserDetails.array_manager.personal?.gender == 'Male' ? 'he' : 'she',
        title: title,
      };
    } catch (e) {
      console.log(e);
    }

    console.log(ExtrafieldsPayload);
    return ExtrafieldsPayload;
  },

  getLetterRequestDetails(LeterType, LetterSubType, configData) {
    var response = [];
    var letterRequestDetails = [];
    // console.log(configData[0]._id);
    // console.log(configData[0].letterRequest);
    try {
      if(!Array.isArray(configData)){
        // console.log('running array condition for config data==============================')
        configData = [configData]
      }
      for (i = 0; i < configData[0].letterRequest.length; i++) {
        if (configData[0].letterRequest[i].letterDescription.requestType == LeterType) {
          if (
            (LetterSubType != '' || LetterSubType != undefined) &&
            configData[0].letterRequest[i].letterDescription.requestSubType == LetterSubType
          ) {
            letterRequestDetails.push(configData[0].letterRequest[i]);
            break;
          } else {
            if (LetterSubType == null || LetterSubType == '' || LetterSubType == undefined) {
              letterRequestDetails.push(configData[0].letterRequest[i]);
              break;
            }
          }
        }
      }
      // if (letterRequestDetails.length > 1) {
      //   for (i = 0; i < letterRequestDetails.length; i++) {
      //     if (
      //       letterRequestDetails[i].letterDescription.requestSubType ==
      //       LetterSubType
      //     ) {
      //       response.push(configData[0].letterRequest[i]);
      //     }
      //   }
      // }

      // if (letterRequestDetails.length == 1) {
      //   if (
      //     letterRequestDetails[0].letterDescription.requestType == LeterType
      //   ) {
      //     response.push(letterRequestDetails[0]);
      //   }
      // }

      return letterRequestDetails[0];
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * START
   * LETTER DYNALIC FUNCTION
   * Version Letter 2
   * This functions usefull for dynamic letter UI Generation and backends data mainipulations
   */

  fetcLetterKeysBasedonLetterType(letterRequestType, letter_sub_type, letterConfigurationData) {
    var response = '';
    var error = false;
    var error_message = '';
    var letter_requests = letterConfigurationData[0].letterRequest;
    var total_found_request_type = 0;
    var founded_request_sub_types = [];
    var founded_letter_types = [];
    var letter_sub_type_data = '';
    try {
      if (!letter_requests) {
        lerror = true;
        error_message = 'Not able to get letter request data from configuration';
      }

      if (letterRequestType && letter_sub_type == '') {
        for (var i = 0; i < letter_requests.length; i++) {
          if (letter_requests[i].letterDescription.requestType == letterRequestType) {
            total_found_request_type = total_found_request_type + 1;

            founded_request_sub_types.push(letter_requests[i].letterDescription.requestSubType);
            var letter_key_objetct = {
              letter_request_type: letter_requests[i].letterDescription.requestType,
              letter_request_sub_type: letter_requests[i].letterDescription.requestSubType,
              letter_keys: letter_requests[i].letterKeys,
            };
            founded_letter_types.push(letter_key_objetct);
          }
        }
      }

      if (total_found_request_type > 1) {
        letter_sub_type_data = {
          name: 'letter_sub_type',
          type: 'Select',
          selector_value: founded_request_sub_types,
        };
      }

      response = {
        letter_sub_type: letter_sub_type_data,
        founded_letter_types: founded_letter_types,
      };

      // response=founded_letter_types;

      //CHECK TOTAL FOUND REQUEST TYPE IS EQALS 1 OR MORE
      //if greater 1 means we need to send subtype details and  with letter keys
      //else need to send letter keys only
    } catch (e) {
      console.log(e);
    }

    return response;
  },

  /**
   * END
   * LETTER DYNALIC FUNCTION
   * Version Letter 2
   * This functions usefull for dynamic letter UI Generation and backends data mainipulations
   */
};
