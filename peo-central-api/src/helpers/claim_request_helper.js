"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
exports.ClaimReqHelper = void 0;
var ClaimReqHelper = /** @class */ (function () {
    function ClaimReqHelper() { }
    /*  Function: Claim Approve All by Manager
      obj_requestInfo:  Claim request
      str_reason: ClaimReqHelper approve reason
      obj_manager: Approved manager details
      arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionManagerClaimApproveAll = function (obj_requestInfo, reason, obj_manager, arr_users) {
        try {
            var arr_user_email = [];
            const date_created = new Date().toISOString()
            obj_requestInfo?.claims.map((item) => {
                for (let index = 0; index < item.approvals.length; index++) {
                    if (item.approvals[index].status.toLowerCase() == 'processing' && item.approvals[index].approver_id.includes(String(obj_manager._id)) && !item.approvals[index].approved_by.includes(String(obj_manager._id))) {
                      item.approvals[index].approved_by.push({ _id: String(obj_manager._id), first_name: obj_manager.first_name });
                      let app_log = { approver_id: obj_manager._id, date_created, status: "Approved by " + obj_manager.first_name, reason, claim_id: item.id, };
                      obj_requestInfo.appliction_log.push(app_log);
              
                      if (item.approvals[index].approved_by.length === item.approvals[index].required) {
                        item.approvals[index].status = 'Approved by ' + obj_manager.first_name;
                        item.approvals[index].approved_date = date_created;
                        item.approvals[index].reason = reason;
              
                        if (item.approvals.length - 1 == index) {
                          item.status = 'Completed';
                          item.reason = reason;
              
                          let compltd_log = {
                            approver_id: obj_manager._id,
                            date_created,
                            status: "Claim Request Approved",
                            reason: "",
                            claim_id: item.id,
                          };
                          obj_requestInfo.appliction_log.push(compltd_log);
                        } else {
                          item.approvals[index + 1].status = 'Processing';
              
                          arr_user_email = arr_users.filter(function (ele) {
                            return item.approvals[index + 1].approver_id.includes(String(ele._id));
                          });
                        }
                    }
                    break;
                }
            }
        })
        
        for (let index = 0; index < obj_requestInfo.approvals.length; index++) {
            if (obj_requestInfo.approvals[index].status.toLowerCase() == 'processing' && obj_requestInfo.approvals[index].approver_id.includes(String(obj_manager._id)) && !obj_requestInfo.approvals[index].approved_by.includes(String(obj_manager._id))) {
                  obj_requestInfo.approvals[index].approved_by.push({ _id: String(obj_manager._id), first_name: obj_manager.first_name });
          
                  if (obj_requestInfo.approvals[index].approved_by.length === obj_requestInfo.approvals[index].required) {
                    obj_requestInfo.approvals[index].status = 'Approved by ' + obj_manager.first_name;
                    obj_requestInfo.approvals[index].approved_date = date_created;
                    obj_requestInfo.approvals[index].reason = reason;
          
                    if (obj_requestInfo.approvals.length - 1 == index) {
                      obj_requestInfo.status = 'Completed';
                      obj_requestInfo.reason = reason;
                    } else {
                      obj_requestInfo.approvals[index + 1].status = 'Processing';
                      arr_user_email = arr_users.filter(function (ele) {
                        return obj_requestInfo.approvals[index + 1].approver_id.includes(String(ele._id));
                      });
                    }
                  }
                  break;
                }
            }

            const allCompleted = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "completed");
            if (allCompleted) obj_requestInfo.status = "Completed"
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Approve Only Selected Claims by Manager
  obj_requestInfo:  Claim request
  str_reason: ClaimReqHelper approve reason
  obj_manager: Approved manager details
  arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionManagerClaimApproveSelected = function (obj_requestInfo, str_reason, obj_manager, arr_users, approve_claims) {
        try {
            var arr_user_email = []
            approve_claims.map((aprvlIds) => {
                obj_requestInfo?.claims.map((item) => {
                    for (var index = 0; index < item.approvals.length; index++) {
                        if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString())) && aprvlIds === item.id) {
                            item.approvals[index].status = "Approved";
                            item.approvals[index].approved_date = new Date().toISOString();
                            item.approvals[index].reason = str_reason;
                            var app_log = {
                                approver_id: obj_manager._id,
                                date_created: new Date().toISOString(),
                                status: "Approved",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            if (index != item.approvals.length - 1) {
                                item.approvals[index + 1].reason = "";
                                item.approvals[index + 1].status = "Processing";
                                /* Get User email --Approver*/
                                arr_user_email = arr_users.filter(function (ele) {
                                    return item.approvals[index + 1].approver_id.includes(String(ele._id));
                                });
                            } else {
                                var compltd_log = {
                                    approver_id: obj_manager._id,
                                    date_created: new Date().toISOString(),
                                    status: "Claim Request Approved",
                                    claim_id: item.id,
                                    reason: ""
                                };
                                obj_requestInfo.appliction_log.push(compltd_log);
                                item.status = "completed";
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                            }
                        }
                    }
                })
            })
            const allCompleted = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "completed");
            if (allCompleted) {
                obj_requestInfo.status = "completed"
            }
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Approve All by Admin
      obj_requestInfo:  Claim request
      str_reason: ClaimReqHelper approve reason
      obj_admin: Approved admin details
      arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionAdminClaimApproveAll = function (obj_requestInfo, reason, obj_admin, arr_users) {
        try {
            var arr_user_email = [];
            const date_created = new Date().toISOString()
            obj_requestInfo?.claims.map((item) => {
                for (let index = 0; index < item.approvals.length; index++) {
                    if (item.approvals[index].status.toLowerCase() == 'processing') {
                        item.approvals[index].approved_by.push({ _id: String(obj_admin._id), first_name: obj_admin.first_name });
                      let app_log = { approver_id: obj_admin._id, date_created, status: "Approved by Admin", reason };
                      obj_requestInfo.appliction_log.push(app_log);
                      
                      if (item.approvals[index].approved_by.length === item.approvals[index].required) {
                        item.approvals[index].status = 'Approved by Admin';
                        item.approvals[index].approved_date = date_created;
                        item.approvals[index].reason = reason;
              
                        if (item.approvals.length - 1 == index) {
                            item.status = 'Completed';
                            item.reason = reason;
              
                          let compltd_log = {
                            approver_id: obj_admin._id,
                            date_created,
                            status: "Claim Request Approved",
                            reason: "",
                          };
                          obj_requestInfo.appliction_log.push(compltd_log);
                        } else {
                          item.approvals[index + 1].status = 'Processing';
                          arr_user_email = arr_users.filter(function (ele) {
                            return item.approvals[index + 1].approver_id.includes(String(ele._id));
                        });
                        }
                    }
                      break;
                    }
                }
            })

            for (let index = 0; index < obj_requestInfo.approvals.length; index++) {
                if (obj_requestInfo.approvals[index].status.toLowerCase() == 'processing') {
                    obj_requestInfo.approvals[index].approved_by.push({ _id: String(obj_admin._id), first_name: obj_admin.first_name });
                  
                  if (obj_requestInfo.approvals[index].approved_by.length === obj_requestInfo.approvals[index].required) {
                    obj_requestInfo.approvals[index].status = 'Approved by Admin';
                    obj_requestInfo.approvals[index].approved_date = date_created;
                    obj_requestInfo.approvals[index].reason = reason;
          
                    if (obj_requestInfo.approvals.length - 1 == index) {
                        obj_requestInfo.status = 'Completed';
                        obj_requestInfo.reason = reason;
                    } else {
                      obj_requestInfo.approvals[index + 1].status = 'Processing';
                      arr_user_email = arr_users.filter(function (ele) {
                        return obj_requestInfo.approvals[index + 1].approver_id.includes(String(ele._id));
                    });
                    }
                  }
                  break;
                }
            }

            const allCompleted = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "completed");
            if (allCompleted) obj_requestInfo.status = "Completed"
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Approve Only Selected Claims by Admin
obj_requestInfo:  Claim request
str_reason: ClaimReqHelper approve reason
obj_admin: Approved Admin details
arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionAdminClaimApproveSelected = function (obj_requestInfo, str_reason, obj_admin, arr_users, approve_claims) {
        try {
            var arr_user_email = []
            approve_claims.map((aprvlIds) => {
                obj_requestInfo?.claims.map((item) => {
                    for (var index = 0; index < item.approvals.length; index++) {
                        if (item.approvals[index].status.toLowerCase() == "processing" && aprvlIds === item.id) {
                            item.approvals[index].status = "Approved by Admin";
                            item.approvals[index].approved_date = new Date().toISOString();
                            item.approvals[index].reason = str_reason;
                            var app_log = {
                                approver_id: obj_admin._id,
                                date_created: new Date().toISOString(),
                                status: "Approved",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            if (index != item.approvals.length - 1) {
                                item.approvals[index + 1].reason = "";
                                item.approvals[index + 1].status = "Processing";
                                /* Get User email --Approver*/
                                arr_user_email = arr_users.filter(function (ele) {
                                    return item.approvals[index + 1].approver_id.includes(String(ele._id));
                                });
                                return "break";
                            } else {
                                var compltd_log = {
                                    approver_id: obj_admin._id,
                                    date_created: new Date().toISOString(),
                                    status: "Claim Request Approved",
                                    claim_id: item.id,
                                    reason: ""
                                };
                                obj_requestInfo.appliction_log.push(compltd_log);
                                item.status = "completed";
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                                return "break";
                            }
                        }
                    }
                })
            })
            const allCompleted = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "completed");
            if (allCompleted) {
                obj_requestInfo.status = "completed"
            }
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Reject All by Admin
  obj_requestInfo:  Claim request
  str_reason: ClaimReqHelper Reject reason
  obj_admin: Rejected admin details
  arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionAdminClaimRejectAll = function (obj_requestInfo, str_reason, obj_admin, arr_users, obj_company_rejection_flow) {
        try {
            var arr_user_email = [];
            if (obj_company_rejection_flow?.claim?.reject) {
                obj_requestInfo?.claims.map((item) => {
                    const approvals = item.approvals ?? obj_requestInfo.approvals;
                    for (var index = 0; index < approvals.length; index++) {
                        approvals[index].status = "Rejected by Admin";
                        approvals[index].approved_date = new Date().toISOString();
                        approvals[index].reason = str_reason;
                        approvals[index].admin_id = obj_admin._id;
                        item.status = "Cancelled";
                        if (index == approvals.length - 1) {
                            var app_log = {
                                approver_id: obj_admin._id,
                                date_created: new Date().toISOString(),
                                status: "Rejected by Admin",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            var final_log = {
                                approver_id: obj_admin._id,
                                date_created: new Date().toISOString(),
                                status: "Claim Request Rejected",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(final_log);
                        }
                        /* Get User email */
                        arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                    }
                })

                for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
                    obj_requestInfo.approvals[index].status = "Rejected by Admin";
                    obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
                    obj_requestInfo.approvals[index].reason = str_reason;
                    obj_requestInfo.approvals[index].admin_id = obj_admin._id;
                }
                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) obj_requestInfo.status = "Cancelled"
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            } else {
                obj_requestInfo?.claims.map((item) => {
                    const approvals = item.approvals ?? obj_requestInfo.approvals;
                    for (var index = 0; index < approvals.length; index++) {
                        if (approvals[index].status.toLowerCase() == "processing") {
                            approvals[index].status = "Rejected by Admin";
                            approvals[index].approved_date = new Date().toISOString();
                            approvals[index].reason = str_reason;
                            var app_log = {
                                approver_id: obj_admin._id,
                                date_created: new Date().toISOString(),
                                status: "Rejected by Admin",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            if (index != 0) {
                                approvals[index - 1].status = "Processing";
                                /* Get User email */
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(approvals[index - 1].approver_id); });
                            } else {
                                var final_log = {
                                    approver_id: obj_admin._id,
                                    date_created: new Date().toISOString(),
                                    status: "Claim Request Rejected",
                                    claim_id: item.id,
                                    reason: str_reason
                                };
                                obj_requestInfo.appliction_log.push(final_log);
                                item.status = "Cancelled";
                                /* Get User email --obj_user*/
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                            }
                        }
                    }
                })

                for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
                    if (obj_requestInfo.approvals[index].status.toLowerCase() == "processing") {
                        obj_requestInfo.approvals[index].status = "Rejected by Admin";
                        obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
                        obj_requestInfo.approvals[index].reason = str_reason;
                        if (index != 0) obj_requestInfo.approvals[index - 1].status = "Processing";
                        else obj_requestInfo.status = "Cancelled"
                    }
                }
                const allRejected = obj_requestInfo?.claims?.every(item => item.status && item.status.toLowerCase() === "cancelled");
                if (allRejected) obj_requestInfo.status = "Cancelled"
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            }
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Reject Only Selected Claims by Admin
  obj_requestInfo:  Claim request
  str_reason: ClaimReqHelper Reject reason
  obj_admin: Rejected admin details
  arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionAdminClaimRejectSelected = function (obj_requestInfo, str_reason, obj_admin, arr_users, obj_company_rejection_flow, reject_claims) {
        try {
            var arr_user_email = [];
            if (obj_company_rejection_flow?.claim?.reject) {
                reject_claims.map((rejectIds) => {
                    obj_requestInfo?.claims.map((item) => {
                        for (var index = 0; index < item.approvals.length; index++) {
                            if (item.approvals[index].status.toLowerCase() == "processing" && rejectIds === item.id) {
                                item.approvals[index].status = "Rejected by Admin";
                                item.approvals[index].approved_date = new Date().toISOString();
                                item.approvals[index].reason = str_reason;
                                item.approvals[index].admin_id = obj_admin._id;
                                item.status = "Cancelled";
                                if (index == item.approvals.length - 1) {
                                    var app_log = {
                                        approver_id: obj_admin._id,
                                        date_created: new Date().toISOString(),
                                        status: "Rejected by Admin",
                                        claim_id: item.id,
                                        reason: str_reason
                                    };
                                    obj_requestInfo.appliction_log.push(app_log);
                                    var final_log = {
                                        approver_id: obj_admin._id,
                                        date_created: new Date().toISOString(),
                                        status: "Claim Request Rejected",
                                        claim_id: item.id,
                                        reason: str_reason
                                    };
                                    obj_requestInfo.appliction_log.push(final_log);
                                }
                                /* Get User email */
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                            }
                        }
                    })
                })
                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) {
                    obj_requestInfo.status = "Cancelled"
                }
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            } else {
                reject_claims.map((rejectIds) => {
                    obj_requestInfo?.claims.map((item) => {
                        for (var index = 0; index < item.approvals.length; index++) {
                            if (item.approvals[index].status.toLowerCase() == "processing" && rejectIds === item.id) {
                                item.approvals[index].status = "Rejected by Admin";
                                item.approvals[index].approved_date = new Date().toISOString();
                                item.approvals[index].reason = str_reason;
                                var app_log = {
                                    approver_id: obj_admin._id,
                                    date_created: new Date().toISOString(),
                                    status: "Rejected by Admin",
                                    claim_id: item.id,
                                    reason: str_reason
                                };
                                obj_requestInfo.appliction_log.push(app_log);
                                if (index != 0) {
                                    item.approvals[index - 1].status = "Processing";
                                    /* Get User email */
                                    arr_user_email = arr_users.filter(function (ele) { return ele._id == String(item.approvals[index - 1].approver_id); });
                                }
                                else {
                                    var final_log = {
                                        approver_id: obj_admin._id,
                                        date_created: new Date().toISOString(),
                                        status: "Claim Request Rejected",
                                        claim_id: item.id,
                                        reason: str_reason
                                    };
                                    obj_requestInfo.appliction_log.push(final_log);
                                    item.status = "Cancelled";
                                    /* Get User email --obj_user*/
                                    arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                                }
                            }
                        }
                    })
                })
                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) {
                    obj_requestInfo.status = "Cancelled"
                }
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            }
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Reject All by Manager
  obj_requestInfo:  Claim request
  str_reason: ClaimReqHelper Reject reason
  obj_manager: Rejected manager details
  arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionManagerClaimRejectAll = function (obj_requestInfo, str_reason, obj_manager, arr_users, obj_company_rejection_flow) {
        try {
            var arr_user_email = [];
            if (obj_company_rejection_flow?.claim?.reject) {
                obj_requestInfo?.claims.map((item) => {
                    for (var index = 0; index < item.approvals.length; index++) {
                        if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString()))) {
                            item.approvals[index].status = "Rejected";
                            item.approvals[index].approved_date = new Date().toISOString();
                            item.approvals[index].reason = str_reason;
                            item.status = "Cancelled";
                            if (index == item.approvals.length - 1) {
                                var app_log = {
                                    approver_id: obj_manager._id,
                                    date_created: new Date().toISOString(),
                                    status: "Rejected",
                                    claim_id: item.id,
                                    reason: str_reason
                                };
                                obj_requestInfo.appliction_log.push(app_log);
                                var final_log = {
                                    approver_id: obj_manager._id,
                                    date_created: new Date().toISOString(),
                                    status: "Claim Request Rejected",
                                    claim_id: item.id,
                                    reason: str_reason
                                };
                                obj_requestInfo.appliction_log.push(final_log);
                            }
                            /* Get User email */
                            arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                        }
                    }
                })

                for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
                    obj_requestInfo.approvals[index].status = "Rejected by " + obj_manager.first_name;
                    obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
                    obj_requestInfo.approvals[index].reason = str_reason;
                    obj_requestInfo.approvals[index].admin_id = obj_manager._id;
                }

                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) obj_requestInfo.status = "Cancelled"
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            } else {
                obj_requestInfo?.claims.map((item) => {
                    for (var index = 0; index < item.approvals.length; index++) {
                        if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString()))) {
                            item.approvals[index].status = "Rejected";
                            item.approvals[index].approved_date = new Date().toISOString();
                            item.approvals[index].reason = str_reason;
                            var app_log = {
                                approver_id: obj_manager._id,
                                date_created: new Date().toISOString(),
                                status: "Rejected",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            if (index != 0) {
                                item.approvals[index - 1].status = "Processing";
                                /* Get User email */
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(item.approvals[index - 1].approver_id); });
                            } else {
                                var final_log = {
                                    approver_id: obj_manager._id,
                                    date_created: new Date().toISOString(),
                                    status: "Claim Request Rejected",
                                    claim_id: item.id,
                                    reason: str_reason
                                };
                                obj_requestInfo.appliction_log.push(final_log);
                                item.status = "Cancelled";
                                /* Get User email --obj_user*/
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                            }
                        }
                    }
                })

                for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
                    if (obj_requestInfo.approvals[index].status.toLowerCase() == "processing" && ((obj_requestInfo.approvals[index].approver_id).includes((obj_manager._id).toString()))) {
                        obj_requestInfo.approvals[index].status = "Rejected by " + obj_manager.first_name;
                        obj_requestInfo.approvals[index].approved_date = new Date().toISOString();
                        obj_requestInfo.approvals[index].reason = str_reason;
                        if (index != 0) obj_requestInfo.approvals[index - 1].status = "Processing";
                        else obj_requestInfo.status = "Cancelled"
                    }
                }
                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) obj_requestInfo.status = "Cancelled"
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            }
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Reject Only Selected Claims by Manager
  obj_requestInfo:  Claim request
  str_reason: ClaimReqHelper Reject reason
  obj_manager: Rejected manager details
  arr_users: All user inside organization*/
    ClaimReqHelper.prototype.functionManagerClaimRejectSelected = function (obj_requestInfo, str_reason, obj_manager, arr_users, obj_company_rejection_flow, reject_claims) {
        try {
            var arr_user_email = [];
            if (obj_company_rejection_flow?.claim?.previous_approver) {
                reject_claims.map((rejectIds) => {
                    obj_requestInfo?.claims.map((item) => {
                        for (var index = 0; index < item.approvals.length; index++) {
                            if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString())) && rejectIds === item.id) {
                                item.approvals[index].status = "Rejected";
                                item.approvals[index].approved_date = new Date().toISOString();
                                item.approvals[index].reason = str_reason;
                                item.approvals[index].admin_id = obj_admin._id;
                                item.status = "Cancelled";
                                if (index == item.approvals.length - 1) {
                                    var app_log = {
                                        approver_id: obj_admin._id,
                                        date_created: new Date().toISOString(),
                                        status: "Rejected",
                                        claim_id: item.id,
                                        reason: str_reason
                                    };
                                    obj_requestInfo.appliction_log.push(app_log);
                                    var final_log = {
                                        approver_id: obj_admin._id,
                                        date_created: new Date().toISOString(),
                                        status: "Claim Request Rejected",
                                        claim_id: item.id,
                                        reason: str_reason
                                    };
                                    obj_requestInfo.appliction_log.push(final_log);
                                }
                                /* Get User email */
                                arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                            }
                        }
                    })
                })
                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) {
                    obj_requestInfo.status = "Cancelled"
                }
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            } else {
                reject_claims.map((rejectIds) => {
                    obj_requestInfo?.claims.map((item) => {
                        for (var index = 0; index < item.approvals.length; index++) {
                            if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString())) && rejectIds === item.id) {
                                item.approvals[index].status = "Rejected";
                                item.approvals[index].approved_date = new Date().toISOString();
                                item.approvals[index].reason = str_reason;
                                var app_log = {
                                    approver_id: obj_manager._id,
                                    date_created: new Date().toISOString(),
                                    status: "Rejected",
                                    claim_id: item.id,
                                    reason: str_reason
                                };
                                obj_requestInfo.appliction_log.push(app_log);
                                if (index != 0) {
                                    item.approvals[index - 1].status = "Processing";
                                    /* Get User email */
                                    arr_user_email = arr_users.filter(function (ele) { return ele._id == String(item.approvals[index - 1].approver_id); });
                                }
                                else {
                                    var final_log = {
                                        approver_id: obj_manager._id,
                                        date_created: new Date().toISOString(),
                                        status: "Claim Request Rejected",
                                        claim_id: item.id,
                                        reason: str_reason
                                    };
                                    obj_requestInfo.appliction_log.push(final_log);
                                    item.status = "Cancelled";
                                    /* Get User email --obj_user*/
                                    arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                                }
                            }
                        }
                    })
                })
                const allRejected = obj_requestInfo?.claims?.every(item => item.status.toLowerCase() === "cancelled");
                if (allRejected) {
                    obj_requestInfo.status = "Cancelled"
                }
                return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
            }
        } catch (error) {
            return error
        }
    }
    /*  Function: Claim Approve by Manager
    obj_requestInfo:  Claim request
    str_reason: Claim approve reason
    obj_manager: Reassigning manager details
    reassign_manager: Reassigned manager details
    bln_admin: Admin or Not*/
    ClaimReqHelper.prototype.funReassignClaim = function (obj_requestInfo, str_reason, obj_manager, reassign_manager, bln_admin) {
        try {
            var reassignedManagerIds = [];
            reassign_manager.map(item => reassignedManagerIds.push(String(item._id)))
            for (var index = 0; index < obj_requestInfo.approvals.length; index++) {
                var element = obj_requestInfo.approvals[index];
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
            if (obj_requestInfo.claims.length) {
                for (const claim of obj_requestInfo.claims) {
                    for (var index = 0; index < claim.approvals.length; index++) {
                        var element = claim.approvals[index];
                        if (element.status.toLowerCase() == 'processing') {
                            if (bln_admin) {
                                element.status = 'Reassigned by Admin';
                                element.approved_date = new Date();
                                element.reason = str_reason;
                                claim.approvals.splice(index + 1, 0, {
                                    approver_id: reassignedManagerIds,
                                    status: "Processing",
                                    approved_date: '',
                                    reason: '',
                                    approved_by: [],
                                    required: 1,
                                    team_name: ''
                                });
                                break;
                            } else {
                                element.status = 'Reassigned by ' + obj_manager.first_name;
                                element.approved_date = new Date();
                                element.reason = str_reason;
                                claim.approvals.splice(index + 1, 0, {
                                    approver_id: reassignedManagerIds,
                                    status: "Processing",
                                    approved_date: '',
                                    reason: '',
                                    approved_by: [],
                                    required: 1,
                                    team_name: ''
                                });
                                break;
                            }
                        }
                    }
                }
            }
            return obj_requestInfo;
        } catch (error) {
            return error;
        }
    };

    /* Create New Reference Number */
    ClaimReqHelper.prototype.generateReferenceNumber = function (claim_ref_number, ref_prefix) {
        try {
            /* Reference Number Generation */
            var month = new Date().getMonth() + 1 + '';
            var year = new Date().getFullYear().toString().slice(-2);
            ref_prefix = ref_prefix.toUpperCase();
            month.length > 1 ? month = month : month = '0' + month;
            var reference_number = ref_prefix.toUpperCase() + month + year + "0001";
            var nextReferenceNumber = parseInt(claim_ref_number) + 1 + "";
            if (nextReferenceNumber.length == 1) {
                nextReferenceNumber = "000" + nextReferenceNumber;
            }
            else if (nextReferenceNumber.length == 2) {
                nextReferenceNumber = "00" + nextReferenceNumber;
            }
            else if (nextReferenceNumber.length == 3) {
                nextReferenceNumber = "0" + nextReferenceNumber;
            }
            reference_number = ref_prefix.toUpperCase() + month + year + nextReferenceNumber;
            return reference_number;
        }
        catch (error) {
            return error;
        }
    };

    // Claim Request Admin Clarification All Claims
    ClaimReqHelper.prototype.functionAdminClaimRequestClarificationAll = function (obj_requestInfo, str_reason, obj_admin, arr_users) {
        try {
            var arr_user_email = [];
            obj_requestInfo?.claims.map((item) => {
                for (var index = 0; index < item.approvals.length; index++) {
                    if (item.approvals[index].status.toLowerCase() == "processing") {
                        item.approvals[index].status = "Requires Clarification";
                        item.approvals[index].approved_date = "";
                        item.approvals[index].reason = str_reason;
                        var app_log = {
                            approver_id: obj_admin._id,
                            date_created: new Date().toISOString(),
                            status: "Clarification requested by Admin",
                            claim_id: item.id,
                            reason: str_reason
                        };
                        obj_requestInfo.appliction_log.push(app_log);
                        arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                        return "break";
                    }
                }
            })
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }

    // Claim Request Admin Clarification Selected Claims
    ClaimReqHelper.prototype.functionAdminClaimRequestClarificationSelected = function (obj_requestInfo, str_reason, obj_admin, arr_users, clarification_claims) {
        try {
            var arr_user_email = [];
            clarification_claims.map((claimIds) => {
                obj_requestInfo?.claims.map((item) => {
                    for (var index = 0; index < item.approvals.length; index++) {
                        if (item.approvals[index].status.toLowerCase() == "processing" && claimIds === item.id) {
                            item.approvals[index].status = "Requires Clarification";
                            item.approvals[index].approved_date = "";
                            item.approvals[index].reason = str_reason;
                            var app_log = {
                                approver_id: obj_admin._id,
                                date_created: new Date().toISOString(),
                                status: "Clarification requested by Admin",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                            return "break";
                        }
                    }
                })
            })
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }

    // Claim Request Clarification All by Manager
    ClaimReqHelper.prototype.functionManagerClaimRequestClarificationAll = function (obj_requestInfo, str_reason, obj_manager, arr_users) {
        try {
            var arr_user_email = [];
            obj_requestInfo?.claims.map((item) => {
                for (var index = 0; index < item.approvals.length; index++) {
                    if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString()))) {
                        item.approvals[index].status = "Requires Clarification";
                        item.approvals[index].approved_date = "";
                        item.approvals[index].reason = str_reason;
                        var app_log = {
                            approver_id: obj_manager._id,
                            date_created: new Date().toISOString(),
                            status: "Clarification requested by Admin",
                            claim_id: item.id,
                            reason: str_reason
                        };
                        obj_requestInfo.appliction_log.push(app_log);
                        arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                    }
                }
            })
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }

    // Claim Request Clarification Selected Claims by Manager
    ClaimReqHelper.prototype.functionManagerClaimRequestClarificationSelected = function (obj_requestInfo, str_reason, obj_manager, arr_users, clarification_claims) {
        try {
            var arr_user_email = [];
            clarification_claims.map((claimIds) => {
                obj_requestInfo?.claims.map((item) => {
                    for (var index = 0; index < item.approvals.length; index++) {
                        if (item.approvals[index].status.toLowerCase() == "processing" && ((item.approvals[index].approver_id).includes((obj_manager._id).toString())) && claimIds === item.id) {
                            item.approvals[index].status = "Requires Clarification";
                            item.approvals[index].approved_date = "";
                            item.approvals[index].reason = str_reason;
                            var app_log = {
                                approver_id: obj_manager._id,
                                date_created: new Date().toISOString(),
                                status: "Clarification requested by Admin",
                                claim_id: item.id,
                                reason: str_reason
                            };
                            obj_requestInfo.appliction_log.push(app_log);
                            arr_user_email = arr_users.filter(function (ele) { return ele._id == String(obj_requestInfo.user_id); });
                        }
                    }
                })
            })
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }

    ClaimReqHelper.prototype.CreateClaimRequest = function (obj_user, obj_request, claim_ref_number, applied_manager, applicant_approvals) {
        try {
            /* Create claim array */
            var status_1 = 'Processing';
            var approval_array = [];
            var approvers = applicant_approvals[0].approvers;
            let required_approvers = applicant_approvals[0]?.required_approvers
            var approval_levels = approvers === null || approvers === void 0 ? void 0 : approvers.approver_levels;
            for (var index = 0; index < approval_levels; index++) {
                var level_no = "level_" + (index + 1);
                let approval_obj = {
                    approver_id: approvers[level_no],
                    status: "",
                    approved_date: "",
                    comments: [],
                    reason: '',
                    approved_by: [],
                    required: required_approvers[level_no].required_number,
                    team_name: required_approvers[level_no].team_name
                  };
                index == 0 ? (approval_obj.status = "Processing") : (approval_obj.status = "Pending");
                approval_array.push(approval_obj);
            }
            /* Create application log */
            var application_log = [
                {
                    approver_id: obj_request.user_id,
                    date_created: new Date(),
                    status: "Created",
                    reason: "",
                },
            ];
            if (obj_request.userType == 'ADMIN') {
                application_log = [
                    {
                        approver_id: obj_request.user_id,
                        date_created: new Date(),
                        status: "Created by Admin",
                        reason: "",
                    },
                ];
                if (applied_manager) {
                    if (approval_array[0].status == 'Processing' && ((approval_array[0].approver_id).includes((applied_manager._id).toString()))) {
                        if (approval_array[0].required === 1) {
                            approval_array[0].approved_date = new Date() + '';
                            approval_array[0].status = 'Approved by Admin';
                            approval_array[0].reason = "Auto Approved";
                            if (approval_array.length - 1 == 0) status_1 = 'Completed';
                            else approval_array[1].status = "Processing";
                        } else {
                            approval_array[0].approved_by.push({ _id: String(applied_manager._id), first_name: applied_manager.first_name })
                            application_log.push({ approver_id: applied_manager._id, date_created: new Date(), status: "Approved by Admin", reason: "Auto Approved" })
                        }
                    }
                }
            }
            else if (obj_request.userType == 'MANAGER') {
                application_log = [
                    {
                        approver_id: obj_request.user_id,
                        date_created: new Date(),
                        status: "Created by " + applied_manager.first_name,
                        reason: "",
                    },
                ];
                if (applied_manager) {
                    if (approval_array[0].status == 'Processing' && ((approval_array[0].approver_id).includes((applied_manager._id).toString()))) {
                        if (approval_array[0].required === 1) {
                            approval_array[0].approved_date = new Date() + '';
                            approval_array[0].status = 'Approved by ' + applied_manager.first_name;
                            approval_array[0].reason = "Auto Approved";
                            if (approval_array.length - 1 == 0) status_1 = 'Completed';
                            else approval_array[1].status = "Processing";
                        } else {
                            approval_array[0].approved_by.push({ _id: String(applied_manager._id), first_name: applied_manager.first_name })
                            application_log.push({ approver_id: applied_manager._id, date_created: new Date(), status: 'Approved by ' + applied_manager.first_name, reason: "Auto Approved" })
                        }
                    }
                }
            }
            var reference_number = this.generateReferenceNumber(claim_ref_number, obj_request.claims[0].claim_sub_type.ref_prefix);
            var claimDetailsArr = [];
            for (var i = 0; i < obj_request.claims.length; i++) {
                var claimDetailsObj = {
                    letter_type: obj_request.claims[i].claim_sub_type.claimType,
                    letter_sub_type: obj_request.claims[i].claim_sub_type.claimSubType,
                    payroll_process: obj_request.claims[i].claim_sub_type.payroll,
                    payroll_auto_approved: obj_request.claims[i].claim_sub_type.payroll_auto_approved,
                    details: {
                        sub_reference_number: "".concat(reference_number, "-0").concat(i),
                        files: obj_request.claims[i].receipts,
                    },
                    approvals: approval_array,
                    id: "".concat(((Date.now()) + i + i + i), "0").concat(i),
                    status: "Processing",
                    comments: ""
                };
                claimDetailsArr.push(claimDetailsObj);
            }
            var claim = {
                approvals: approval_array,
                appliction_log: application_log,
                request_type: "claims",
                status: status_1,
                letter_fields: {
                    name: obj_user?.first_name,
                    reference_number: reference_number,
                    date: obj_request.letter_fields.requested_date,
                    description: obj_request.letter_fields.claim_description,
                    amount: obj_request.letter_fields.total_claim_amount,
                    files: obj_request.letter_fields.files,
                },
                claims: claimDetailsArr,
                user_id: obj_request.user_id,
                assigned_to: obj_user.reporting.manager,
                company_id: obj_user.company_ID,
            };
            return claim;
        }
        catch (error) {
            return error;
        }
    };

    // Clarify Claim By Employee
    ClaimReqHelper.prototype.functionClaimClarifyUser = function (obj_requestInfo, str_reason, applicant, arr_users, reqBody) {
        try {
            var arr_user_email = [];
            obj_requestInfo?.claims.map((item) => {
                for (var index = 0; index < item.approvals.length; index++) {
                    if (item.approvals[index].status.toLowerCase() == "requires clarification" && reqBody.clarify_claim_id === item.id) {
                        item.approvals[index].status = "Processing";
                        item.approvals[index].approved_date = "";
                        item.approvals[index].reason = str_reason;
                        item.attachments = reqBody?.attachments;
                        if (reqBody?.claims[0]?.receipts) {
                            if (!item.details.files) {
                                item.details.files = [];
                            }
                            item.details.files = item.details.files.concat(reqBody.claims[0].receipts);
                        }
                        for (let i = 0; i < reqBody.claims.length; i++) {
                            let details = item.details
                            for (let j = 0; j < reqBody.claims[i]?.claim_sub_type?.claim_keys?.length; j++) {
                                if (reqBody.claims[i].claim_sub_type.claim_keys[j].type === "Number Field" && reqBody.claims[i].claim_sub_type.claim_keys[j].isCalculationNeeded === true) {
                                    details[`${reqBody.claims[i].claim_sub_type.claim_keys[j].name.toLowerCase().replace(/\s/g, "_")}`] = reqBody.claims[i].claim_sub_type.claim_keys[j].inputvalue
                                    details[`calculated_amount`] = reqBody.claims[i].claim_sub_type.claim_keys[j].value
                                } else if (reqBody.claims[i].claim_sub_type.claim_keys[j].type !== "Attachments") {
                                    details[`${reqBody.claims[i].claim_sub_type.claim_keys[j].name.toLowerCase().replace(/\s/g, "_")}`] = reqBody.claims[i].claim_sub_type.claim_keys[j].value
                                }
                            }
                            item.details = details
                        }
                        var app_log = {
                            approver_id: applicant._id,
                            date_created: new Date().toISOString(),
                            status: "Employee Clarified the Claim Request",
                            claim_id: item.id,
                            attachments: reqBody.attachments,
                            reason: str_reason
                        };
                        obj_requestInfo.appliction_log.push(app_log);
                        arr_user_email = arr_users.filter(function (ele) {
                            return item.approvals[index + 1].approver_id.includes(String(ele._id));
                        });
                    }
                }
            })
            return { obj_requestInfo: obj_requestInfo, arr_user_email: arr_user_email };
        } catch (error) {
            return error
        }
    }

    //----------------------------------------------------------------------------------------

    // Email for the Claim Requires Clarification
    ClaimReqHelper.prototype.claimRequiresClarificationMail = function (obj_requestInfo, obj_companyInfo, obj_userInfo) {
        var subject = "Claim Request Requires Clarification";
        var body = "Dear " + this.funGetUserTitle(obj_userInfo) + ' ' + obj_userInfo.first_name + ", <br><br>" +
            "Your Claim request has been requested for Clarification: <br><br>" +
            "Reference Number: " + obj_requestInfo.letter_fields.reference_number + "<br>" +
            "Amount: " + obj_requestInfo.letter_fields.amount + "<br>" +
            "Date: " + obj_requestInfo.letter_fields.date + "<br>" +
            "Requested Date: " + moment(obj_requestInfo.date_created).format('D MMMM YYYY') + " <br>" +
            "Please visit our HR Direct portal for more details.<br><br>" +
            "Regards,<br>" +
            obj_companyInfo.company_name + " HR Team<br>" +
            "<p style='vertical-align:middle; margin: 0px'><img width='18' height='18' style='vertical-align:middle' src='https://nn-hr-extra.s3.eu-central-1.amazonaws.com/hr-direct/loc-icon.png' alt=''>: " + obj_companyInfo.company_address + "</p>" +
            "<p style='vertical-align:middle; margin: 0px'><img  width='18' height='18' style='vertical-align:middle' src='https://nn-hr-extra.s3.eu-central-1.amazonaws.com/hr-direct/phone-icon.png' alt=''>: " + obj_companyInfo.company_phone + "</p>" +
            "<img height='auto' width='15%' src='" + obj_companyInfo.letterDetail.companyLogoLink + "'><br><br><br><br>" +
            "<i>Note: you are receiving this system-generated e-mail since you are listed as a user in HR Direct software. For questions, please contact your HR Department.</i>";
        return { subject: subject, body: body };
    };
    ClaimReqHelper.prototype.getClaimRequiresClarificationMailParams = function (obj_requestInfo, obj_companyInfo, obj_userInfo) {
        return {
            employeeTitle: this.funGetUserTitle(obj_userInfo),
            employeeName: obj_userInfo.first_name,
            referenceNumber: obj_requestInfo.letter_fields.reference_number,
            claimAmount: obj_requestInfo.letter_fields.amount,
            claimDate: obj_requestInfo.letter_fields.date,
            requestedDate: moment(obj_requestInfo.date_created).format('D MMMM YYYY'),
            companyName: obj_companyInfo.company_name,
            companyAddress: obj_companyInfo.company_address,
            companyPhone: obj_companyInfo.company_phone,
            companyLogo: obj_companyInfo.letterDetail.companyLogoLink
        }
    }

    ClaimReqHelper.prototype.funGetUserTitle = function (obj_userInfo) {
        if (obj_userInfo?.personal?.gender == 'Male') {
            return 'Mr.';
        }
        else if (obj_userInfo?.personal?.gender == 'Female') {
            if (obj_userInfo?.personal?.marital_status == 'Married') {
                return 'Mrs.';
            }
            else {
                return 'Ms.';
            }
        }
        else {
            return '';
        }
    };

    return ClaimReqHelper;
}());

exports.ClaimReqHelper = ClaimReqHelper;
