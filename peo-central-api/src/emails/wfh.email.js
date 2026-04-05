var moment = require("moment");
var _ = require('lodash');
const { getApprovers, getUserName, getUserTitle} = require('../helpers/email_helper');

module.exports = {
    getNewWFHRequestParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            approvers: getApprovers(obj_requestInfo.approvals, arr_users),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
    getWFHWithdrawParams: (obj_requestInfo, obj_companyInfo, obj_userInfo) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            withdrawDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
    getWFHRequestApproverParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, obj_approverInfo) => {
        return {
            approverTitle: getUserTitle(obj_approverInfo),
            approverName: obj_approverInfo.first_name,
            employeeName: getUserName(obj_userInfo),
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
    getWFHApprovedParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),            
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            approvers: getApprovers(obj_requestInfo.approvals, arr_users),
            comments: str_reason || 'No remarks',
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
    getWFHRejectedParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            approvers: getApprovers(obj_requestInfo.approvals, arr_users),
            comments: str_reason || 'No remarks',
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
    getWFHApprovedAdminParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            approvers: getApprovers(obj_requestInfo.approvals, arr_users),
            comments: str_reason || 'No remarks',
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
    getWFHRejectedAdminParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestStartDate: moment(obj_requestInfo.from_date).format('D MMMM YYYY'),
            requestEndDate: moment(obj_requestInfo.to_date).format('D MMMM YYYY'),
            requestNoOfDays: obj_requestInfo.no_of_days,
            requestCreatedDate: moment(obj_requestInfo.created_date).format('D MMMM YYYY'),
            approvers: getApprovers(obj_requestInfo.approvals, arr_users),
            comments: str_reason || 'No remarks',
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    }
};