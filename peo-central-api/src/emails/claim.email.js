var moment = require("moment");
var _ = require('lodash');
const {getApprovers, getUserName, getUserTitle} = require("../helpers/email_helper");

module.exports = {
    getNewClaimRequestParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(new Date()).format('D MMMM YYYY'),
            approverName: getApprovers(obj_requestInfo.approvals, arr_users),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimWithdrawParams: (obj_requestInfo, obj_companyInfo, obj_userInfo) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            withdrawDate: moment(new Date()).format('D MMMM YYYY'),
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimRequestApproverParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, obj_approverInfo) => {
        return {
            approverTitle: getUserTitle(obj_approverInfo),
            approverName: obj_approverInfo.first_name,
            employeeName: getUserName(obj_userInfo),
            employeeFirstName: obj_userInfo.first_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimApprovedParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            approverName: getApprovers(obj_requestInfo.approvals, arr_users),
            comments: str_reason,
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimRejectedParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users, str_reason) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            approverName: getApprovers(obj_requestInfo.approvals, arr_users),
            comments: str_reason,
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimApprovedAdminParams: (obj_requestInfo, obj_companyInfo, obj_userInfo) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            comments: obj_requestInfo.approvals[0].reason,
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimRejectedAdminParams: (obj_requestInfo, obj_companyInfo, obj_userInfo) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            comments: obj_requestInfo.approvals[0].reason,
            processDate: moment(new Date()).format('D MMMM YYYY'),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimAmendUserParams: (obj_requestInfo, obj_companyInfo, obj_userInfo, arr_users) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            requestType: obj_requestInfo.letter_type,
            requestSubType: obj_requestInfo.letter_sub_type,
            requestDetails: getClaimFieldsData(obj_requestInfo),
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            approverName: getApprovers(obj_requestInfo.approvals, arr_users),
            websiteUrl: obj_companyInfo.letterDetail.websiteUrl,
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        };
    },
    getClaimRequiresClarificationMailParams: (obj_requestInfo, obj_companyInfo, obj_userInfo) => {
        return {
            employeeTitle: getUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name + ' ' + obj_userInfo.last_name,
            employeeFirstName: obj_userInfo.first_name,
            employeeLastName: obj_userInfo.last_name,
            referenceNumber: obj_requestInfo.letter_fields.reference_number,
            claimAmount: obj_requestInfo.letter_fields.amount,
            claimDate: obj_requestInfo.letter_fields.date,
            requestCreatedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    },
}
function getClaimFieldsData(obj_requestInfo) {
    var claimFields = obj_requestInfo.letter_fields;
    var claimDetails = '';
    for (var key in claimFields) {
        if (key !== 'files' && typeof (claimFields[key]) !== 'number' && claimFields[key] !== "" && claimFields[key] !== null) {
            if (claimFields.hasOwnProperty("value")) {
                console.log(claimFields[key]);
                var capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
                var capitalValue = "<li>" + claimFields[key].charAt(0).toUpperCase() + claimFields[key].slice(1);
                claimDetails += "".concat(capitalKey, ": ").concat(capitalValue, " </li>");
            }
        }
    }
    return claimDetails;
}