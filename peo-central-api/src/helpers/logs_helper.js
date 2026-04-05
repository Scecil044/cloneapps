const CommonHelper = require("./common");
module.exports = {
  async getLeaveApplicationLog(
    user_id,
    remaining_leaves,
    status,
    no_of_days,
    reason
  ) {
    var application_log = [];
    var remaing_leaves_parsed = parseFloat(remaining_leaves);
    var current_time_stamp = CommonHelper.getCurrentTimeStamp();
    var status_final;
    if (status == "Created") {
      status_final = "Created";
    } else if (status == "Withdrawn") {
      status_final = "Withdrawn";

      remaing_leaves_parsed = +remaing_leaves_parsed + +no_of_days;
    } else if (status == "Approved") {
      status_final = "Approved";
    } else if (status == "Rejected") {
      status_final = "Rejected";
    }

    let log_object = {
      approver_id: user_id,
      date_created: current_time_stamp,
      status: status_final,
      reason: reason,
      remaining_leave: remaing_leaves_parsed,
    };

    application_log.push(log_object);

    return application_log;
  },

  /**
   *
   * @param {*user data who is requesting } user_id
   * @param {*status like Created / Withdrawn} status
   * @returns application log data
   */
  async getRequestsApplicationLog(user_id, status, reason, managerObject) {
    var application_log = [];
    //var remaing_leaves_parsed = parseFloat(remaining_leaves);
    var current_time_stamp = CommonHelper.getCurrentTimeStamp();
    var status_final;
    if (status == "Created") {
      status_final = "Created";
    } else if (status == "Withdrawn") {
      status_final = "Withdrawn";

      //remaing_leaves_parsed = +remaing_leaves_parsed + +no_of_days;
    } else if (status == "Approved") {
      status_final = "Approved";
    } else if (status == "Rejected") {
      status_final = "Rejected";
    } else if (status == "Approved by") {
      status_final = "Approved by " + managerObject.first_name;
    } else if (status == "Letter Request Approved") {
      status_final = "Letter Request Approved";
    } else if (status == "Rejected by") {
      status_final = "Rejected by " + managerObject.first_name;
    }

    let log_object = {
      approver_id: user_id,
      date_created: current_time_stamp,
      status: status_final,
      reason: reason,
    };

    application_log.push(log_object);

    return application_log;
  },
};
