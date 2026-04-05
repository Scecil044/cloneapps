'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Letters = void 0;
var moment = require('moment');
var converter = require('number-to-words');
var Letters = /** @class */ (function () {
  function Letters() {}
  /*  Function: Compute the Addressee
        obj_userInfo : Contains user info
        obj_letterInfo : Contains Letter template info from Configuration
        obj_requestInfo : Contains Letter(existing/new) info
        bln_newLetter : Contains new Letter or existing Letter info
        arr_companies:  Contains All companies */
  Letters.prototype.computeLetterAddressee = function (
    obj_userInfo,
    obj_letterInfo,
    obj_requestInfo,
    bln_newLetter,
    arr_companies
  ) {
    try {
      var name_1 = this.funGetUserName(obj_userInfo);
      var title = this.funGetUserTitle(obj_userInfo.personal.gender, obj_userInfo.personal.marital_status);
      var adjective = 'her';
      if (title == 'Mr.') {
        adjective = 'his';
      }
      var pronoun = 'her';
      if (title == 'Mr.') {
        pronoun = 'him';
      }
      var user_data = this.funGetUserInfo(bln_newLetter, obj_userInfo, obj_requestInfo);
      var company_id = bln_newLetter ? obj_userInfo.company_ID : obj_requestInfo.company_id;
      var company_details = this.funGetCompanyDetails(company_id, arr_companies);
      var salary_to_words = converter.toWords(user_data.total_fixed_salary);
      if (obj_requestInfo.letter_type == 'Custom Letter Requests') {
        var addressee = obj_requestInfo.letter_fields.other_requests_to_address_1
          ? obj_requestInfo.letter_fields.other_requests_to_address_1
          : '' + obj_requestInfo.letter_fields.other_requests_to_address_2
          ? obj_requestInfo.letter_fields.other_requests_to_address_2
          : '' + obj_requestInfo.letter_fields.other_requests_to_address_3
          ? obj_requestInfo.letter_fields.other_requests_to_address_3
          : '';
        return this.splitString(addressee);
      } else {
        var letterAddressee = bln_newLetter
          ? obj_letterInfo.letterDescription.header
          : obj_requestInfo.letter_fields.addressee;
        var arr_letter_keys = obj_requestInfo.letter_keys;
        var user_keys = bln_newLetter ? obj_letterInfo.user_keys : obj_requestInfo.user_keys;
        if (user_keys) {
          letterAddressee = letterAddressee.split('[name]').join(bln_newLetter ? name_1 : user_data.user_name);
          letterAddressee = letterAddressee.split('[nationality]').join(user_data.nationality);
          letterAddressee = letterAddressee.split('[passport]').join(user_data.passport_no);
          letterAddressee = letterAddressee.split('[designation]').join(user_data.designation);
          letterAddressee = letterAddressee.split('[doj]').join(moment(user_data.date_of_joining).format('D MMMM YYYY'));
          letterAddressee = letterAddressee.split('[bank]').join(user_data.bank_name);
          letterAddressee = letterAddressee.split('[iban]').join(user_data.iban);
          letterAddressee = letterAddressee.split('[bankAccountNumber]').join(user_data.account_number);
          letterAddressee = letterAddressee.split('[totalFixed]').join(user_data.total_fixed_salary);
          letterAddressee = letterAddressee
            .split('[salaryInWords]')
            .join(salary_to_words.charAt(0).toUpperCase() + salary_to_words.slice(1));
          letterAddressee = letterAddressee.split('[title]').join(title);
          letterAddressee = letterAddressee.split('[companyName]').join(company_details.company_name);
          letterAddressee = letterAddressee.split('[gender]').join(obj_userInfo.personal.gender);
          letterAddressee = letterAddressee
            .split('[passportIssueDate]')
            .join(moment(obj_userInfo.documents.passport_issue).format('D MMMM YYYY'));
          letterAddressee = letterAddressee
            .split('[passportExpiryDate]')
            .join(moment(obj_userInfo.documents.passport_expiry).format('D MMMM YYYY'));
          letterAddressee = letterAddressee.split('[dob]').join(moment(obj_userInfo.personal.dob).format('D MMMM YYYY'));
          letterAddressee = letterAddressee.split('[her/his]').join(adjective);
          letterAddressee = letterAddressee.split('[him/her]').join(pronoun);
        }
        for (var index = 0; index < arr_letter_keys.length; index++) {
          var element = arr_letter_keys[index];
          if (element.type == 'Date Picker') {
            letterAddressee = letterAddressee
              .split(element.name.key)
              .join(element.value ? moment(element.value).format('D MMMM YYYY') : element.name.key);
          }
          letterAddressee = letterAddressee.split(element.name.key).join(element.value ? element.value : element.name.key);
        }
        return letterAddressee;
      }
    } catch (error) {
      return error;
    }
  };
  /* Function: Split string on \n for Addressee */
  Letters.prototype.splitString = function (string) {
    if (string) {
      var split_array = string.split('\n');
      var str = '';
      for (var i = 0; i < split_array.length; i++) {
        str = str + split_array[i] + '</br>';
      }
      return str;
    } else {
      return '';
    }
  };
  /* Function: Get user company details */
  Letters.prototype.funGetCompanyDetails = function (company_id, arr_companies) {
    var user_compnay = arr_companies.filter(function (ele) {
      return ele._id == company_id;
    });
    if (user_compnay.length > 0) return user_compnay[0];
    else return {};
  };
  /* Function: Return Username Title */
  Letters.prototype.funGetUserTitle = function (gender, marital_status) {
    var title = '';
    if (gender == 'Male') {
      title = 'Mr.';
    } else if (gender == 'Female') {
      if (marital_status == 'Married') {
        title = 'Mrs.';
      } else {
        title = 'Ms.';
      }
    }
    return title;
  };
  /* Function: Return Username */
  Letters.prototype.funGetUserName = function (obj_userInfo) {
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
  /* Function: Return User Basic Informations */
  Letters.prototype.funGetUserInfo = function (bln_newLetter, obj_userInfo, obj_requestInfo) {
    var obj_user = {
      first_name: '',
      last_name: '',
      user_name: '',
      nationality: '',
      passport_no: '',
      designation: '',
      department: '',
      date_of_joining: '',
      bank_name: '',
      iban: '',
      account_number: '',
      total_fixed_salary: '',
      salary_currency: ''
    };
    obj_user.user_name = bln_newLetter ? '' : obj_requestInfo.letter_fields.user_name;
    obj_user.nationality = bln_newLetter ? obj_userInfo.personal.nationality : obj_requestInfo.letter_fields.nationality;
    obj_user.first_name = bln_newLetter ? obj_userInfo.first_name : obj_requestInfo.letter_fields.first_name;
    obj_user.last_name = bln_newLetter ? obj_userInfo.last_name : obj_requestInfo.letter_fields.last_name;
    obj_user.passport_no = bln_newLetter ? obj_userInfo.documents.passport_number : obj_requestInfo.letter_fields.passport;
    obj_user.designation = bln_newLetter ? obj_userInfo.personal.designation : obj_requestInfo.letter_fields.role;
    obj_user.date_of_joining = bln_newLetter ? obj_userInfo.date_of_joining : obj_requestInfo.letter_fields.work_start_date;
    obj_user.bank_name = bln_newLetter ? obj_userInfo.bank.bank_name : obj_requestInfo.letter_fields.transfer_bank_name;
    obj_user.account_number = bln_newLetter
      ? obj_userInfo.bank.account_number
      : obj_requestInfo.letter_fields.account_number;
    obj_user.department = bln_newLetter ? obj_userInfo.reporting.department : obj_requestInfo.letter_fields.department;
    obj_user.iban = bln_newLetter ? obj_userInfo.bank.iban : obj_requestInfo.letter_fields.transfer_iban_number;
    obj_user.total_fixed_salary = bln_newLetter
      ? obj_userInfo.salary.total_fixed || obj_userInfo.salary.get('total_fixed')
      : obj_requestInfo.letter_fields.total_fixed;
    obj_user.salary_currency = bln_newLetter ? obj_userInfo.bank.salary_currency : obj_userInfo.bank.salary_currency;
    return obj_user;
  };
  /*  Function: Compute the Letter Content
    obj_userInfo : Contains user info
    obj_letterInfo : Contains Letter template info from Configuration
    obj_requestInfo : Contains Letter(existing/new) info
    bln_newLetter : Contains new Letter or existing Letter info
    arr_companies: Contain all companies */
  Letters.prototype.computeLetterContent = function (
    obj_userInfo,
    obj_letterInfo,
    obj_requestInfo,
    bln_newLetter,
    arr_companies
  ) {
    try {
      var name_2 = this.funGetUserName(obj_userInfo);
      var company_id = bln_newLetter ? obj_userInfo.company_ID : obj_requestInfo.company_id;
      var company_details = this.funGetCompanyDetails(company_id, arr_companies);
      var title = this.funGetUserTitle(obj_userInfo.personal.gender, obj_userInfo.personal.marital_status);
      var adjective = 'her';
      if (title == 'Mr.') {
        adjective = 'his';
      }
      var pronoun = 'her';
      if (title == 'Mr.') {
        pronoun = 'him';
      }
      var user_data = this.funGetUserInfo(bln_newLetter, obj_userInfo, obj_requestInfo);
      if (obj_requestInfo.letter_type == 'Custom Letter Requests') {
        var addressee = obj_requestInfo.letter_fields.other_requests_body_1
          ? obj_requestInfo.letter_fields.other_requests_body_1
          : '' + obj_requestInfo.letter_fields.other_requests_body_1
          ? obj_requestInfo.letter_fields.other_requests_body_1
          : '' + obj_requestInfo.letter_fields.other_requests_body_1
          ? obj_requestInfo.letter_fields.other_requests_body_1
          : '';
        return this.splitString(addressee);
      } else {
        var letterContent = bln_newLetter ? obj_letterInfo.letterDescription.body : obj_requestInfo.letter_fields.body;
        var arr_letter_keys = obj_requestInfo.letter_keys;
        var user_keys = bln_newLetter ? obj_letterInfo.user_keys : obj_requestInfo.user_keys;
        var salary_to_words = converter.toWords(user_data.total_fixed_salary);
        if (user_keys) {
          letterContent = letterContent.split('[name]').join(bln_newLetter ? name_2 : user_data.user_name);
          letterContent = letterContent.split('[nationality]').join(user_data.nationality);
          letterContent = letterContent.split('[passport]').join(user_data.passport_no);
          letterContent = letterContent.split('[designation]').join(user_data.designation);
          letterContent = letterContent.split('[doj]').join(moment(user_data.date_of_joining).format('D MMMM YYYY'));
          letterContent = letterContent.split('[bank]').join(user_data.bank_name);
          letterContent = letterContent.split('[iban]').join(user_data.iban);
          letterContent = letterContent.split('[bankAccountNumber]').join(user_data.account_number);
          letterContent = letterContent.split('[totalFixed]').join(parseFloat(user_data.total_fixed_salary).toFixed(2));
          letterContent = letterContent
            .split('[salaryInWords]')
            .join(salary_to_words.charAt(0).toUpperCase() + salary_to_words.slice(1));
          letterContent = letterContent.split('[title]').join(title);
          letterContent = letterContent.split('[companyName]').join(company_details.company_name);
          letterContent = letterContent.split('[gender]').join(obj_userInfo.personal.gender);
          letterContent = letterContent
            .split('[passportIssueDate]')
            .join(moment(obj_userInfo.documents.passport_issue).format('D MMMM YYYY'));
          letterContent = letterContent
            .split('[passportExpiryDate]')
            .join(moment(obj_userInfo.documents.passport_expiry).format('D MMMM YYYY'));
          letterContent = letterContent.split('[dob]').join(moment(obj_userInfo.personal.dob).format('D MMMM YYYY'));
          letterContent = letterContent.split('[her/his]').join(adjective);
          letterContent = letterContent.split('[him/her]').join(pronoun);
        }
        for (var index = 0; index < arr_letter_keys.length; index++) {
          var element = arr_letter_keys[index];
          if (element.type == 'Date Picker') {
            letterContent = letterContent
              .split(element.name.key)
              .join(element.value ? moment(element.value).format('D MMMM YYYY') : element.name.key);
          }
          letterContent = letterContent.split(element.name.key).join(element.value ? element.value : element.name.key);
        }
        return letterContent;
      }
    } catch (error) {
      return error;
    }
  };
  /* Function: Letter Withdraw by user
    obj_requestInfo: Letter request */
  Letters.prototype.funWithdrawLetter = function (obj_requestInfo) {
    try {
      obj_requestInfo.status = 'withdrawn';
      /*Changing the Processing status to Pending (Status in Rejected and Approved won't be changed) */
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        if (
          obj_requestInfo.approvals[index].status == 'Processing' ||
          obj_requestInfo.approvals[index].status == 'Pending'
        ) {
          obj_requestInfo.approvals[index].status = 'Withdrawn by Employee';
        }
      }
      return obj_requestInfo;
    } catch (error) {
      return error;
    }
  };
  /*  Function: Letter Approve by Manager
    obj_requestInfo:  Letter request
    str_reason: Letter approve reason
    obj_manager: Approved manager details
    arr_users: All user inside organization*/
  Letters.prototype.funManagerLetterApprove = function (obj_requestInfo, str_reason, obj_manager, arr_users) {
    var arr_user_email = [];
    var _loop_1 = function (index) {
      /* True when Approver is on Letter Request Approval flow and Approver Status is processing */
      if (
        obj_requestInfo.approvals[index].status.toLowerCase() == 'processing' &&
        obj_requestInfo.approvals[index].approver_id.includes(obj_manager._id.toString())
      ) {
        obj_requestInfo.approvals[index].status = 'Approved';
        obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
        obj_requestInfo.approvals[index].reason = str_reason;
        if (index != obj_requestInfo.approvals.length - 1) {
          obj_requestInfo.approvals[index + 1].reason = '';
          obj_requestInfo.approvals[index + 1].status = 'Processing';
          arr_user_email = arr_users.filter(function (ele) {
            return obj_requestInfo.approvals[index + 1].approver_id.includes(String(ele._id));
          });
        } else {
          obj_requestInfo.status = 'completed';
          arr_user_email = arr_users.filter(function (ele) {
            return ele._id == String(obj_requestInfo.user_id);
          });
        }
      }
    };
    for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
      _loop_1(index);
    }
    return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
  };
  /*  Function: Letter Approve by Manager
       obj_requestInfo:  Letter request
       str_reason: Letter approve reason
       obj_manager: Approved manager details
       arr_users: All user inside organization
       obj_comapany_rejection_flow: Contain value which check whether the Letter completly rejects or Go back to the previous approver  */
  Letters.prototype.funManagerLetterReject = function (
    obj_requestInfo,
    str_reason,
    obj_manager,
    arr_users,
    obj_comapany_rejection_flow
  ) {
    var arr_user_email = [];
    /* If true, the letter go backs to the previous approver only if its not the first approver. */
    if (obj_comapany_rejection_flow.letter.previous_approver) {
      var _loop_2 = function (index) {
        /* True when Approver is on Letter Request Approval flow and Approver Status is processing */
        if (
          obj_requestInfo.approvals[index].status.toLowerCase() == 'processing' &&
          obj_requestInfo.approvals[index].approver_id.includes(obj_manager._id.toString())
        ) {
          obj_requestInfo.approvals[index].status = 'Rejected';
          obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
          obj_requestInfo.approvals[index].reason = str_reason;
          if (index != 0) {
            obj_requestInfo.approvals[index - 1].status = 'Processing';
            arr_user_email = arr_users.filter(function (ele) {
              return obj_requestInfo.approvals[index - 1].approver_id.includes(String(ele._id));
            });
            arr_user_email = arr_users.filter(function (ele) {
              return ele._id == String(obj_requestInfo.approvals[index - 1].approver_id);
            });
          } else {
            obj_requestInfo.status = 'Cancelled';
            arr_user_email = arr_users.filter(function (ele) {
              return ele._id == String(obj_requestInfo.user_id);
            });
          }
        }
      };
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        _loop_2(index);
      }
      return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
    } else {
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        /* True when Approver is on Letter Request Approval flow and Approver Status is processing */
        if (
          obj_requestInfo.approvals[index].status.toLowerCase() == 'processing' &&
          obj_requestInfo.approvals[index].approver_id.includes(obj_manager._id.toString())
        ) {
          obj_requestInfo.approvals[index].status = 'Rejected';
          obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
          obj_requestInfo.approvals[index].reason = str_reason;
          obj_requestInfo.status = 'Cancelled';
          arr_user_email = arr_users.filter(function (ele) {
            return ele._id == String(obj_requestInfo.user_id);
          });
        }
      }
      return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
    }
  };
  /* Function: Letter Approve by Manager
    obj_requestInfo:  Letter request
    str_reason: Letter approve reason
    obj_admin: Approved Admin details
    arr_users: All user inside organization  */
  Letters.prototype.funAdminLetterApprove = function (obj_requestInfo, str_reason, obj_admin, arr_users) {
    var arr_user_email = [];
    var _loop_3 = function (index) {
      if (obj_requestInfo.approvals[index].status.toLowerCase() == 'processing') {
        obj_requestInfo.approvals[index].status = 'Approved by Admin';
        obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
        obj_requestInfo.approvals[index].reason = str_reason;
        obj_requestInfo.approvals[index].admin_id = obj_admin._id;
        if (obj_requestInfo.approvals.length - 1 == index) {
          obj_requestInfo.status = 'completed';
          /* Get User email */
          arr_user_email = arr_users.filter(function (ele) {
            return ele._id == String(obj_requestInfo.user_id);
          });
          return 'break';
        } else {
          obj_requestInfo.approvals[index + 1].status = 'Processing';
          obj_requestInfo.approvals[index + 1].reason = '';
          arr_user_email = arr_users.filter(function (ele) {
            return ele._id == String(obj_requestInfo.approvals[index + 1].approver_id);
          });
          return 'break';
        }
      }
    };
    for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
      var state_1 = _loop_3(index);
      if (state_1 === 'break') break;
    }
    return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
  };
  /* Function: Letter Approve by Manager
    obj_requestInfo:  Letter request
    str_reason: Letter approve reason
    obj_admin: Approved Admin details
    arr_users: All user inside organization
    obj_company_details: Get company details */
  Letters.prototype.funAdminLetterReject = function (
    obj_requestInfo,
    str_reason,
    obj_admin,
    arr_users,
    obj_company_details_rejection
  ) {
    var arr_user_email = [];
    /* True if the letter get completly rejected */
    if (obj_company_details_rejection.letter.reject) {
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        obj_requestInfo.approvals[index].status = 'Rejected by Admin';
        obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
        obj_requestInfo.approvals[index].reason = str_reason;
        obj_requestInfo.approvals[index].admin_id = obj_admin._id;
        obj_requestInfo.status = 'Cancelled';
        /* Get User email */
        arr_user_email = arr_users.filter(function (ele) {
          return ele._id == String(obj_requestInfo.user_id);
        });
      }
      return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
    } else {
      var _loop_4 = function (index) {
        /* True when Approver Status is processing */
        if (obj_requestInfo.approvals[index].status.toLowerCase() == 'processing') {
          obj_requestInfo.approvals[index].status = 'Rejected by Admin';
          obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
          obj_requestInfo.approvals[index].reason = str_reason;
          if (index != 0) {
            obj_requestInfo.approvals[index - 1].status = 'Processing';
            /* Get User email */

            arr_user_email = arr_users.filter(function (ele) {
              return ele._id == String(obj_requestInfo.approvals[index - 1].approver_id);
            });
          } else {
            obj_requestInfo.status = 'Cancelled';
            /* Get User email --Applicant*/
            arr_user_email = arr_users.filter(function (ele) {
              return ele._id == String(obj_requestInfo.user_id);
            });
          }
        }
      };
      for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
        _loop_4(index);
      }
      return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
    }
  };
  /*  Function: Letter Approve by Manager
obj_requestInfo:  Letter request
str_reason: Letter approve reason
obj_manager: Reassigning manager details
reassign_manager: Reassigned manager details
bln_admin: Admin or Not*/
  Letters.prototype.funReassignLetter = function (obj_requestInfo, str_reason, obj_manager, reassign_manager, bln_admin) {
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
              status: 'Processing',
              approved_date: '',
              reason: '',
              approved_by: [],
              required: 1,
              team_name: ''
            });
            obj_requestInfo.appliction_log.push({
              approver_id: obj_manager._id,
              status: 'Reassigned by Admin',
              date_created: new Date(),
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
              status: 'Processing',
              approved_date: '',
              reason: '',
              approved_by: [],
              required: 1,
              team_name: ''
            });
            obj_requestInfo.appliction_log.push({
              approver_id: obj_manager._id,
              status: 'Reassigned by ' + obj_manager.first_name,
              date_created: new Date(),
              reason: str_reason,
              assigned_to: reassignedManagerIds
            });
            break;
          }
        }
      }
      return obj_requestInfo;
    } catch (error) {
      console.log(error, 'ERROR');
      return error;
    }
  };

  return Letters;
})();
exports.Letters = Letters;
