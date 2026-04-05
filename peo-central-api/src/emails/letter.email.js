var moment = require('moment');
var _ = require('lodash');
const { getApprovers, getUserName, getUserTitle } = require('../helpers/email_helper');

module.exports = {
  getNewLetterRequestParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users) => {
    return {
      employeeTitle: getUserTitle(obj_userInfo),
      employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type || 'N/A',
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      requestDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      approverName: getApprovers(obj_requestInfo.approvals, arr_users),
      websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  },
  getLetterWithdrawParams: (obj_requestInfo, obj_companyInfo, obj_userInfo) => {
    return {
      employeeTitle: getUserTitle(obj_userInfo),
      employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type,
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      withdrawDate: moment(new Date()).format('D MMMM YYYY'),
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  },
  getNewLetterRequestApproverParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, obj_approverInfo) => {
    return {
      approverTitle: getUserTitle(obj_approverInfo),
      approverFirstName: obj_approverInfo.first_name,
      employeeName: getUserName(obj_userInfo),
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type,
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  },
  getLetterApprovedParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
    return {
      employeeTitle: getUserTitle(obj_userInfo),
      employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type,
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      approverName: getApprovers(obj_requestInfo.approvals, arr_users),
      approvalReason: str_reason,
      processDate: moment(new Date()).format('D MMMM YYYY'),
      websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  },
  getLetterRejectedParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
    return {
      employeeTitle: getUserTitle(obj_userInfo),
      employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type,
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      approverName: getApprovers(obj_requestInfo.approvals, arr_users),
      rejectionReason: str_reason,
      processDate: moment(new Date()).format('D MMMM YYYY'),
      websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  },
  getLetterApprovedAdminParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users) => {
    return {
      employeeTitle: getUserTitle(obj_userInfo),
      employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type,
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      approverName: getApprovers(obj_requestInfo.approvals, arr_users),
      approvalReason: obj_requestInfo.approvals[0].reason,
      processDate: moment(new Date()).format('D MMMM YYYY'),
      websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  },
  getLetterRejectedAdminParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users) => {
    return {
      employeeTitle: getUserTitle(obj_userInfo),
      employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
      employeeFirstName: obj_userInfo.first_name,
      employeeLastName: obj_userInfo.last_name,
      requestType: obj_requestInfo.letter_type,
      requestSubType: obj_requestInfo.letter_sub_type,
      requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
      approverName: getApprovers(obj_requestInfo.approvals, arr_users),
      rejectionReason: obj_requestInfo.approvals[0].reason,
      processDate: moment(new Date()).format('D MMMM YYYY'),
      websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
      companyName: obj_companyInfo.company_name,
      companyAddress: obj_companyInfo.company_address,
      companyPhone: obj_companyInfo.company_phone,
      companyLogo: obj_companyInfo.letterDetail.companyLogoLink
    };
  }
};
