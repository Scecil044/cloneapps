const axios = require("axios");
const UserModel = require("../models/users.model");
//const ConfigModel = require("../models/configuration");
const ConfigModel = require("../models/config");
// const LeavesHelper = require("../../helper/leaves_helper");
const LeavesModel = require("../models/leaves");

const moment = require("moment-timezone")
//moment().format();
moment().tz("Asia/Dubai").format();

module.exports = {
  //CALCULATE REMAING LEAVES FRI & SAT
  getRemainingLeaves: async function (
    dt_start,
    dt_end,
    userObj,
    leave_type,
    calculation_method,
    half_day,
    delcared_holidays
  ) {
    let current_leave_bal = 0;
    let no_of_days = 0.0;
    let weekend_counter = 0;
    let delcared_counter = 0;
    let dt1 = new Date(dt_start);
    let dt2 = new Date(dt_end);
    let db_user = userObj;
    let remaing_leaves = 0;
    let num_of_days_of = 0;

    let LeaveobjectData = {
      num_of_days_of: "0",
      remaing_leaves: "0",
    };

    // Getting leave balance
    if (
      userObj.leaves == null ||
      userObj.leaves == undefined ||
      userObj.leaves == ""
    ) {
      current_leave_bal = 0;
    } else {
      //let leaveUpdate = _.lowerCase(userObj.leavesleave.leave_type).replace(/\s/g, "_") // converting name to object name - String
      current_leave_bal = userObj.leaves[leave_type]; // updating with the user values
    }

    // Calculating number of days
    no_of_days =
      Math.floor(
        (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
          Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    var getDaysArray = function (s, e) {
      for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        a.push(new Date(d));
      }
      return a;
    };
    var daylist = getDaysArray(dt1, dt2);

    num_of_days_of = no_of_days;

    var dateFormat = function (value) {
      let abc = new Date(value);
      return (
        abc.getDate() + "/" + (abc.getMonth() + 1) + "/" + abc.getFullYear()
      );
    };

    //WORKING DAYS LEAVE CALCULATION STARTED

    if (calculation_method == "working_leave_type") {
      // Calculating Weekend Off

      daylist.map((v) => v.toISOString().slice(0, 10)).join("");

      //CALCULATE OFF DAYS

      for (let index = 0; index < daylist.length; index++) {
        // select which day is off. 1-Monday, 2-Tuesday, 3- Wednesday etc. Here Fri and Saturday is considered off. hence 5 and 6
        if (daylist[index].getDay() == 5 || daylist[index].getDay() == 6) {
          weekend_counter += 1;
        }
      }

      console.log("WEEKEND COUNTER DATA" + weekend_counter);

      //CALCULATE PUBLIC HOLIDAYS DATES

      if (delcared_holidays.length != 0) {
        console.log("INSIDE DECLARED HOLIDAYS");

        for (let i = 0; i < delcared_holidays.length; i++) {
          console.log("***");
          for (let j = 0; j < daylist.length; j++) {

            if (dateFormat(delcared_holidays[i]) == dateFormat(daylist[j])) {
              delcared_counter += 1;
            }
          }
        }
      }
    }

    console.log("weekend_counter");

    //REMOVE WEEKEND AND PUBLIC HOLIDAYS FROM NUM OF DAYS
    num_of_days_of = no_of_days - delcared_counter - weekend_counter;

    if (half_day == "true") {
      num_of_days_of = no_of_days / 2;
    }

    if (calculation_method == "calender_based") {
      // exclude holidays  --- need to add conditions for unpaid leaves etc
    }

    // Half Day Leave
    if (half_day == "true") {
      no_of_days = parseFloat(no_of_days - delcared_counter);
      no_of_days = parseFloat(no_of_days / 2);

      console.log("HALF DAY TRUE");
    } else {
      no_of_days = parseFloat(no_of_days) - weekend_counter - delcared_counter;
      console.log("HALF DAY FALSE");
    }

    // total remaining leaves
    remaing_leaves = parseFloat(current_leave_bal) - parseFloat(no_of_days);

    if (isNaN(remaing_leaves)) {
      return "0";
    } else {
      LeaveobjectData.num_of_days_of = num_of_days_of;
      LeaveobjectData.remaing_leaves = remaing_leaves;

      return LeaveobjectData;
    }
  },

  //Calculate Remaing Leaves SAT & SUN

  getRemainingLeavesBySatSunWeekOff: async function (
    dt_start,
    dt_end,
    userObj,
    leave_type,
    calculation_method,
    half_day,
    delcared_holidays
  ) {
    let current_leave_bal = 0;
    let no_of_days = 0.0;
    let weekend_counter = 0;
    let delcared_counter = 0;
    let dt1 = new Date(dt_start);
    let dt2 = new Date(dt_end);
    let db_user = userObj;
    let remaing_leaves = 0;
    let num_of_days_of = 0;

    let LeaveobjectData = {
      num_of_days_of: "0",
      remaing_leaves: "0",
    };

    // Getting leave balance
    if (
      userObj.leaves == null ||
      userObj.leaves == undefined ||
      userObj.leaves == ""
    ) {
      current_leave_bal = 0;
    } else {
      //let leaveUpdate = _.lowerCase(userObj.leavesleave.leave_type).replace(/\s/g, "_") // converting name to object name - String
      current_leave_bal = userObj.leaves[leave_type]; // updating with the user values
    }

    console.log("CURRENT LEAVE Remaing");

    // Calculating number of days
    no_of_days =
      Math.floor(
        (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
          Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    var getDaysArray = function (s, e) {
      for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        a.push(new Date(d));
      }
      return a;
    };
    var daylist = getDaysArray(dt1, dt2);

    console.log("NUM OF DAYS" + no_of_days);

    num_of_days_of = no_of_days;

    var dateFormat = function (value) {
      let abc = new Date(value);
      return (
        abc.getDate() + "/" + (abc.getMonth() + 1) + "/" + abc.getFullYear()
      );
    };

    //WORKING DAYS LEAVE CALCULATION STARTED

    if (calculation_method == "working_leave_type") {
      // Calculating Weekend Off

      console.log("DAYS LIST");
      daylist.map((v) => v.toISOString().slice(0, 10)).join("");

      //CALCULATE OFF DAYS

      for (let index = 0; index < daylist.length; index++) {
        // select which day is off. 1-Monday, 2-Tuesday, 3- Wednesday etc. Here Sunday and Saturday is considered off. hence 5 and 6
        // if (daylist[index].getDay() == 7 || daylist[index].getDay() == 6) {
        //console.log("DAYLIST");

        //console.log(daylist);
        if (daylist[index].getDay() == 6 || daylist[index].getDay() == 0) {
          weekend_counter += 1;
        }
      }

      console.log("WEEKEND COUNTER DATA" + weekend_counter);

      //CALCULATE PUBLIC HOLIDAYS DATES

      if (delcared_holidays.length != 0) {
        console.log("INSIDE DECLARED HOLIDAYS");

        for (let i = 0; i < delcared_holidays.length; i++) {
          console.log("***");
          for (let j = 0; j < daylist.length; j++) {

            if (dateFormat(delcared_holidays[i]) == dateFormat(daylist[j])) {
              delcared_counter += 1;
            }
          }
        }
      }
    }

    //REMOVE WEEKEND AND PUBLIC HOLIDAYS FROM NUM OF DAYS
    num_of_days_of = no_of_days - delcared_counter - weekend_counter;

    if (half_day == "true") {
      num_of_days_of = no_of_days / 2;
    }

    if (calculation_method == "calender_based") {
      // exclude holidays  --- need to add conditions for unpaid leaves etc
    }

    // Half Day Leave
    if (half_day == "true") {
      no_of_days = parseFloat(no_of_days - delcared_counter);
      no_of_days = parseFloat(no_of_days / 2);

    } else {
      no_of_days = parseFloat(no_of_days) - weekend_counter - delcared_counter;
    }

    // total remaining leaves
    remaing_leaves = parseFloat(current_leave_bal) - parseFloat(no_of_days);

    if (isNaN(remaing_leaves)) {
      return "0";
    } else {
      LeaveobjectData.num_of_days_of = num_of_days_of;
      LeaveobjectData.remaing_leaves = remaing_leaves;

      return LeaveobjectData;
    }
  },


  getFirstApproverEmailID: async function (approvals) {
    let ids = [];

    let result = [];

    try {
      for (i = 0; i < approvals.length; i++) {
        ids.push(approvals[i].approver_id);
      }

      const records = await UsersModel.find(
        { _id: { $in: ids } },
        {
          email: 1,
          first_name: 1,
          last_name: 1,
        }
      );

      for (j = 0; j < records.length; j++) {
        /* let data = {
          first_name: records[j].email
        
        };*/

        result.push(records[j].email);
      }

      //Return First Approver Email Id only
      return result[0];
    } catch (e) {
      console.log("error" + e);
    }
  },


  buildEmailDataTravelLetter: async function (
    LetterObject,
    approverDetails,
    userDetails
  ) {
    //get final approver date details

    let final_approver = LetterObject.approvals.length - 1;
    let approved_date = "";
    let requested_date = LetterObject.date_created;

    //if (LeaveObject.approvals[final_approver].approver_id == approverDetails._id) {
    approved_date = LetterObject.approvals[final_approver].approved_date;
    //}

    let LetterDatesFormated = {
      requested_date: formatDate(requested_date),
      user: {
        email: userDetails.email,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
      },
      approver: {
        email: approverDetails.email,
        first: approverDetails.first_name,
      },
    };

    LetterDatesFormated.letter = LetterObject;

    return LetterDatesFormated;
  },

  getHolidays: async function (configuration) {
    //HELPER FUNCTION

    /* var dateFormat = function (value) {
             let abc = new Date(value)
             return abc.getDate() + '/' + (abc.getMonth() + 1) + '/' + abc.getFullYear()
         };*/

    var getDays = function (startDate, endDate) {
      const duration = endDate - startDate;
      const interval = 1000 * 60 * 60 * 24; // calculation for a day
      const steps = duration / interval;
      return Array.from(
        { length: steps + 1 },
        (v, i) => new Date(startDate.valueOf() + interval * i)
      );
    };

    let abc = configuration[0].holiday_calendar;
    let arr = [];

    for (let index = 0; index < abc.length; index++) {
      if (abc[index].from_date == abc[index].to_date) {
        arr.push(abc[index].from_date);
      } else {
        let a = getDays(
          new Date(abc[index].from_date),
          new Date(abc[index].to_date)
        );
        for (let i = 0; i < a.length; i++) {
          arr.push(a[i].toISOString().substr(0, 10));
        }
      }
    }

    return arr;
  },

  getLeaveCalculationMethod: async function (userData, leave_type) {
    //This is Function will return the Leave calculation method
    //Calander Days OR Working Days  based on configuration
    //ROLL ID Based Calculation Method
    //come companies they are uysing Roll ID Based Calculation method
    //

    let roll_id;
    let method;
    let calender_day_method = false;
    let working_day_method = false;
    let default_calculation_mehtod = false;
    let default_calculation_method_name = "Default";
    let company_id;

    console.log("Hey we are inside the helper :)");

    if ("role_ID" in userData[0]) {
      roll_id = userData[0].role_ID;
      company_id = userData[0].company_ID;

      let configData = await ConfigModel.find({
        "leaveTypes.name": leave_type,
        company_id: company_id,
      });

      if (configData) {
        console.log("Leave Types");

        for (let i = 0; i < configData[0].leaveTypes.length; i++) {
          console.log(configData[0].leaveTypes);

          if (configData[0].leaveTypes[i].name == leave_type) {
            console.log("LEAVE TYPE FOUND  :)");

            for (
              let j = 0;
              j < configData[0].leaveTypes[i].method.working_days.length;
              j++
            ) {
              console.log("INSIDE WORKING DAYS METHOD");
              if (
                configData[0].leaveTypes[i].method.working_days[j] == roll_id
              ) {
                working_day_method = true;

                console.log("ROLL ID MATCH FOUND IN WORKING DAYS");
              }
            }

            for (
              let j = 0;
              j < configData[0].leaveTypes[i].method.calender_days.length;
              j++
            ) {
              console.log("INSIDE CALENDER DAYS METHOD");
              if (
                configData[0].leaveTypes[i].method.calender_days[j] == roll_id
              ) {
                calender_day_method = true;

                console.log("ROLL ID MATCH FOUND CALENDER");
              }
            }

            //IF NOT ABLE TO FIND METHOD JUST PICK DEFAULT METHOD

            if (calender_day_method == false || working_day_method == false) {
              if (
                configData[0].leaveTypes[i].method.default == "working_days"
              ) {
                default_calculation_method_name = "working_leave_type";
              } else {
                default_calculation_method_name = "calender_based";
              }
            }
          } else {
            console.log("LEAVE TYPE NOT MATCH");
          }
        }

        /*for (let i = 0; i <= configData[0].leaveTypes.length; i++) {
                    console.log("config Leave Types fetched");
                    console.log(configData[0].leaveTypes[i]);
                    //FIND ROLL ID INSIDE WORKING DAYS METHOD
                    if (configData[0].leaveTypes[i].method.working_days) {

                        for (let j = 0; j <= configData[0].leaveTypes[i].method.working_days.length; j++) {

                            if (configData[0].leaveTypes[i].method.working_days == roll_id) {
                                working_day_method = true;
                            }
                        }

                    } else if (configData[0].leaveTypes[i].method.calender_days) {

                        //FIND ROLL ID INSIDE CALENDER DAYS METHOD
                        for (let j = 0; j <= configData[0].leaveTypes[i].method.calender_days.length; j++) {
                            if (configData[0].leaveTypes[i].method.calender_days == roll_id) {
                                calender_day_method = true;
                            }
                        }

                    } else {
                        console.log("Not able to find roll id inside method array so get default method");
                    }

                    console.log("FINAL CALCULATION METHOD");
                    console.log("WORKING DAY" + working_day_method);
                    console.log("CALENDER DAY" + calender_day_method);
                }
                */
      } else {
        console.log("No Leave Types Defined in conf Collection");
      }

      console.log("**********************************************");

      if (working_day_method == true) {
        method = "working_leave_type";
      } else if (calender_day_method == true) {
        method = "calender_based";
      } else {
        // if (configData[0].leaveTypes[i].method.default) {

        // }

        console.log("default_calculation_method_name");

        method = default_calculation_method_name;
      }

      /*  if (configData) {
                  console.log("Leave Data :)");
                 // console.log(configData);
              } else {
  
              }*/
    } else {
      console.log("Role ID Not Found");
    }

    return method;
  },

  getLeaveHistoryData: async function (user_id) {
    //const user_id = user_id;

    try {
      let match = {
        $match: {
          user_id: user_id,
          status: { $nin: ["Cancelled", "Withdrawn"] },
        },
      };
      let project = {
        $project: {
          _id: 0,
          from_date: 1,
          to_date: 1,
          user_id: 1,
          leave_type: 1,
          status: 1,
        },
      };
      const leaves = await LeavesModel.aggregate([match, project]);

      return leaves;
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getLeaveCalculationMethodByCategory: async function (userData, leave_type) {
    //This is Function will return the Leave calculation method
    //Calander Days OR Working Days  based on configuration
    //ROLL ID Based Calculation Method
    //come companies they are uysing Roll ID Based Calculation method
    //

    let category_name;
    let method;
    let calender_day_method = false;
    let working_day_method = false;
    let default_calculation_mehtod = false;
    let default_calculation_method_name = "Default";
    let company_id;

    console.log("Hey we are inside the helper :)");

    if ("role_ID" in userData[0]) {
      //Get Category ID From User Object
      category_name = userData[0].employment.category;
      company_id = userData[0].company_ID;
      console.log("RETRIVED CATEGORY NAME");

      let configData = await ConfigModel.find({
        "leaveTypes.name": leave_type,
        company_id: company_id,
      });

      if (configData) {
        console.log("Leave Types");

        for (let i = 0; i < configData[0].leaveTypes.length; i++) {
          console.log(configData[0].leaveTypes);

          if (configData[0].leaveTypes[i].name == leave_type) {
            console.log("LEAVE TYPE FOUND  :)");
            console.log(configData[0].leaveTypes[i].method.working_days);

            for (
              let j = 0;
              j < configData[0].leaveTypes[i].method.working_days.length;
              j++
            ) {
              console.log("INSIDE WORKING DAYS METHOD");
              if (
                configData[0].leaveTypes[i].method.working_days[j] ==
                category_name
              ) {
                working_day_method = true;

                console.log("ROLL ID MATCH FOUND IN WORKING DAYS");
              }
            }

            for (
              let j = 0;
              j < configData[0].leaveTypes[i].method.calender_days.length;
              j++
            ) {
              console.log("INSIDE CALENDER DAYS METHOD");
              if (
                configData[0].leaveTypes[i].method.calender_days[j] ==
                category_name
              ) {
                calender_day_method = true;

                console.log("ROLL ID MATCH FOUND CALENDER");
              }
            }

            //IF NOT ABLE TO FIND METHOD JUST PICK DEFAULT METHOD

            if (calender_day_method == false || working_day_method == false) {
              if (
                configData[0].leaveTypes[i].method.default == "working_days"
              ) {
                default_calculation_method_name = "working_leave_type";
              } else {
                default_calculation_method_name = "calender_based";
              }
            }
          } else {
            console.log("LEAVE TYPE NOT MATCH Contine....");
          }
        }

        /*for (let i = 0; i <= configData[0].leaveTypes.length; i++) {
                    console.log("config Leave Types fetched");
                    console.log(configData[0].leaveTypes[i]);
                    //FIND ROLL ID INSIDE WORKING DAYS METHOD
                    if (configData[0].leaveTypes[i].method.working_days) {

                        for (let j = 0; j <= configData[0].leaveTypes[i].method.working_days.length; j++) {

                            if (configData[0].leaveTypes[i].method.working_days == category_name) {
                                working_day_method = true;
                            }
                        }

                    } else if (configData[0].leaveTypes[i].method.calender_days) {

                        //FIND ROLL ID INSIDE CALENDER DAYS METHOD
                        for (let j = 0; j <= configData[0].leaveTypes[i].method.calender_days.length; j++) {
                            if (configData[0].leaveTypes[i].method.calender_days == category_name) {
                                calender_day_method = true;
                            }
                        }

                    } else {
                        console.log("Not able to find roll id inside method array so get default method");
                    }

                    console.log("FINAL CALCULATION METHOD");
                    console.log("WORKING DAY" + working_day_method);
                    console.log("CALENDER DAY" + calender_day_method);
                }
                */
      } else {
        console.log("No Leave Types Defined in conf Collection");
      }

      //console.log("**********************************************",'#logs');
      console.log("WORKING DAY" + working_day_method);
      console.log("CALENDER DAY" + calender_day_method);

      if (working_day_method == true) {
        method = "working_leave_type";
      } else if (calender_day_method == true) {
        method = "calender_based";
      } else {
        // if (configData[0].leaveTypes[i].method.default) {

        // }
        console.log("default_calculation_method_name");

        method = default_calculation_method_name;
        console.log(default_calculation_method_name);

        //method = 'Default';
      }

      /*  if (configData) {
                  console.log("Leave Data :)");
                 // console.log(configData);
              } else {
  
              }*/
    } else {
      console.log("Role ID Not Found");
    }

    return method;
  },

  async leaveTypeChanger(leaveType) {
    let leave_type;

    leave_type = leaveType.toLowerCase();
    leave_type = leave_type.replace(/\s/g, "_");

    return leave_type;
  },

  async leaveTypeChangerMethod2(leaveType) {
    let new_converted_leave_type = null;
    console.log("We are inside Method 2");
    console.log("received leave type is" + leaveType);

    let leave_update_map = {
      "Annual Leave": "annual_leaves",
      "Medical Leave": "medical_leaves",
      "Emergency Leave": "emergency_leaves",
      "Maternity Leave": "maternity_leaves",
      "Compassionate Leave": "comp_off",
      "Pending Off": "comp_off",
      "Parental Leave": "paternal_leaves",
      "Casual Leave": "priviledge_leaves",
    };

    if (leave_update_map[leaveType]) {
      console.log(leave_update_map[leaveType]);
      new_converted_leave_type = leave_update_map[leaveType];
    } else {
      console.log("leave type not found");
    }

    return new_converted_leave_type;
  },

  /*(leaveType, config_details, userData, is_user_applied_for_hujj_leave) {

        let AcessType;
        let probation_days;
        let date_of_joining;
        var now = moment().format('YYYY-MM-DD');
        var eligible_leave_date;
        var allow_acess = false;


        console.log("ACESS VALIDATION STARTED");
        console.log(userData);

        try {

            //GET ACESS TYPE OF CURRENT LEAVE TYPE

            if (config_details.length != 0) {

                for (let i = 0; i < config_details[0].leaveTypes.length; i++) {

                    console.log(config_details[0].leaveTypes);

                    if (config_details[0].leaveTypes[i].name == leaveType) {
                        console.log("LEAVE TYPE FOUND FOR ACESS VALIDATION " + leaveType);

                        if (config_details[0].leaveTypes[i].access) {
                            AcessType = config_details[0].leaveTypes[i].access;
                        }

                    }
                }

                //ACESS TYPE VALIDATION START

                if (AcessType) {

                    //AFTER PROBATION STARTED

                    if (AcessType == 'After Probation') {
                        console.log("WE INSIDE PROBATION AFTER");

                        if (userData.employment.probation_days && userData.date_of_joining) {

                            probation_days = userData.employment.probation_days;
                            date_of_joining = userData.date_of_joining;

                            console.log("PROBATION" + probation_days);
                            console.log("DOJ" + date_of_joining);
                            eligible_leave_date = moment(date_of_joining, "YYYY-MM-DD").add('days', probation_days);

                            var status = moment(eligible_leave_date).isBefore(now);
                            console.log(status);
                            if (status == true) {
                                console.log("USER CAN APPLY LEAVE");
                                allow_acess = true;
                            } else {
                                console.log("USER CAN'T APPLY LEAVE");
                            }

                            //date_of_join + joindate  < CurrentDate

                        } else {
                            console.log("PROBATION & DOJ NOT FOUND");
                        }

                        //AFTER After 6 Months  STARTED

                    } else if (AcessType == 'After 6 Months') {

                        console.log("WE INSIDE AFTER 6 MONTHS ");

                        if (userData.date_of_joining) {

                            probation_days = userData.employment.probation_days;
                            date_of_joining = userData.date_of_joining;

                            console.log("PROBATION" + probation_days);
                            console.log("DOJ" + date_of_joining);
                            eligible_leave_date = moment(date_of_joining, "YYYY-MM-DD").add(180, 'days');

                            var status = moment(eligible_leave_date).isBefore(now);
                            console.log(status);
                            if (status == true) {
                                console.log("USER CAN APPLY LEAVE");
                                allow_acess = true;
                            } else {
                                console.log("USER CAN'T APPLY LEAVE");
                            }

                            //date_of_join + joindate  < CurrentDate

                        } else {
                            console.log("PROBATION & DOJ NOT FOUND");
                        }
                        //AFTER After 1 YEAR  STARTED

                    } else if (AcessType == 'After 1 Year') {

                        console.log("WE INSIDE AFTER 1 YEAR ");

                        if (userData.date_of_joining) {

                            probation_days = userData.employment.probation_days;
                            date_of_joining = userData.date_of_joining;

                            console.log("PROBATION" + probation_days);
                            console.log("DOJ" + date_of_joining);
                            eligible_leave_date = moment(date_of_joining, "YYYY-MM-DD").add(365, 'days');

                            var status = moment(eligible_leave_date).isBefore(now);
                            console.log(status);
                            if (status == true) {
                                console.log("USER CAN APPLY LEAVE");
                                allow_acess = true;
                            } else {
                                console.log("USER CAN'T APPLY LEAVE");
                            }

                            //date_of_join + joindate  < CurrentDate

                        } else {
                            console.log("PROBATION & DOJ NOT FOUND");
                        }

                    } else if (AcessType == 'Once') {
                        console.log("INSIDE HAII LEAVES");
                        console.log(is_user_applied_for_hujj_leave);

                        if (is_user_applied_for_hujj_leave == true) {
                            allow_acess = false;
                        } else {
                            allow_acess = true;
                        }

                    } else if (AcessType == 'Always') {
                        allow_acess = true;
                    }

                }


            }

            console.log("FOUNDED ACESS TYPE" + AcessType);
            console.log("Given ACESS TYPE" + allow_acess);

            return allow_acess;

        } catch (err) {
            console.log(err, "#log");
            res.json({ message: err.message })
        }

    },
*/

  getRemainingLeaves_of_user: async function (leave_type, leaveData) {
    let remaing_leave = 0;
    console.log(leave_type);

    // Getting leave balance
    if (leaveData == null || leaveData == undefined || leaveData == "") {
      remaing_leave = 0;
    } else {
      if (leaveData[leave_type]) {
        remaing_leave = leaveData[leave_type]; // updating with the user values
      } else {
        console.log("Sorry Leave Type not Found in users collection");

        remaing_leave = -12;
      }
    }

    return remaing_leave;
  },

  CheckCompanyisAmap(company_id) {
    let status = false;

    var data = {
      companies: [
        { id: "61272f607bd5c02878cb8893" },
        { id: "612731c77bd5c02878cb8894" },
        { id: "5fa397eb1ddd3b46d8e756ac" },

        //NOT AMAP ID

        // {"id":"6159716d7707aa283cadbfce"}
      ],
    };

    let CompanyData = data;
    let Arry = CompanyData.companies;

    var obj = null;
    for (var i = 0; i < Arry.length; i++) {
      if (Arry[i].id == company_id) {
        obj = Arry[i];
        status = true;
        break;
      }
    }

    return status;
  },

  /**
   * NEW FUNCTIONS
   *
   */

  ValidateLeaveAcess(
    leaveType,
    config_details,
    userData,
    is_user_applied_for_hujj_leave
  ) {
    let AcessType;
    let probation_days;
    let date_of_joining;
    var now = moment().format("YYYY-MM-DD");
    var eligible_leave_date;
    var allow_acess = false;

    let status_details = {
      status: "1",
      message: "success",
      allow_acess: false,
    };
    //Not yet entitled since probation period has not been completed.

    console.log("ACESS VALIDATION STARTED");
    console.log(userData);

    try {
      //GET ACESS TYPE OF CURRENT LEAVE TYPE

      if (config_details.length != 0) {
        for (let i = 0; i < config_details[0].leaveTypes.length; i++) {
          console.log(config_details[0].leaveTypes);

          if (config_details[0].leaveTypes[i].name == leaveType) {
            console.log("LEAVE TYPE FOUND FOR ACESS VALIDATION " + leaveType);

            if (config_details[0].leaveTypes[i].access) {
              AcessType = config_details[0].leaveTypes[i].access;
            }
          }
        }

        //ACESS TYPE VALIDATION START

        if (AcessType) {
          //AFTER PROBATION STARTED

          if (AcessType == "After Probation") {
            console.log("WE INSIDE PROBATION AFTER");

            if (
              userData.employment.probation_days &&
              userData.date_of_joining
            ) {
              probation_days = userData.employment.probation_days;
              date_of_joining = userData.date_of_joining;

              console.log("PROBATION" + probation_days);
              console.log("DOJ" + date_of_joining);
              eligible_leave_date = moment(date_of_joining, "YYYY-MM-DD").add(
                "days",
                probation_days
              );

              var status = moment(eligible_leave_date).isBefore(now);
              console.log(status);
              if (status == true) {
                console.log("USER CAN APPLY LEAVE");
                allow_acess = true;
              } else {
                console.log("USER CAN'T APPLY LEAVE");

                status_details = {
                  status: "0",
                  message:
                    "Not yet entitled since probation period has not been completed",
                };
              }

              //date_of_join + joindate  < CurrentDate
            } else {
              console.log("PROBATION & DOJ NOT FOUND");

              status_details = {
                status: "0",
                message: "PROBATION & DOJ NOT FOUND",
              };
            }

            //AFTER After 6 Months  STARTED
          } else if (AcessType == "After 6 Months") {
            console.log("WE INSIDE AFTER 6 MONTHS ");

            if (userData.date_of_joining) {
              probation_days = userData.employment.probation_days;
              date_of_joining = userData.date_of_joining;

              console.log("PROBATION" + probation_days);
              console.log("DOJ" + date_of_joining);
              eligible_leave_date = moment(date_of_joining, "YYYY-MM-DD").add(
                180,
                "days"
              );

              var status = moment(eligible_leave_date).isBefore(now);
              console.log(status);
              if (status == true) {
                console.log("USER CAN APPLY LEAVE");
                allow_acess = true;
              } else {
                console.log("USER CAN'T APPLY LEAVE");

                status_details = {
                  status: "0",
                  message:
                    "Not yet entitled since probation period has not been completed ",
                };
              }

              //date_of_join + joindate  < CurrentDate
            } else {
              console.log("PROBATION & DOJ NOT FOUND");
            }
            //AFTER After 1 YEAR  STARTED
          } else if (AcessType == "After 1 Year") {
            console.log("WE INSIDE AFTER 1 YEAR ");

            if (userData.date_of_joining) {
              probation_days = userData.employment.probation_days;
              date_of_joining = userData.date_of_joining;

              console.log("PROBATION" + probation_days);
              console.log("DOJ" + date_of_joining);
              eligible_leave_date = moment(date_of_joining, "YYYY-MM-DD").add(
                365,
                "days"
              );

              var status = moment(eligible_leave_date).isBefore(now);
              console.log(status);
              if (status == true) {
                console.log("USER CAN APPLY LEAVE");
                allow_acess = true;
              } else {
                console.log("USER CAN'T APPLY LEAVE");

                status_details = {
                  status: "0",
                  message:
                    "Not yet entitled since probation period has not been completed ",
                };
              }

              //date_of_join + joindate  < CurrentDate
            } else {
              console.log("PROBATION & DOJ NOT FOUND");
            }
          } else if (AcessType == "Once") {
            console.log("INSIDE HAII LEAVES");
            console.log(is_user_applied_for_hujj_leave);

            if (is_user_applied_for_hujj_leave == true) {
              allow_acess = false;

              status_details = {
                status: "0",
                message: "Not yet entitled since Hajj Leaves Already Applied ",
              };
            } else {
              allow_acess = true;
            }
          } else if (AcessType == "Always") {
            allow_acess = true;
          }
        }
      }

      console.log("FOUNDED ACESS TYPE" + AcessType);
      console.log("Given ACESS TYPE" + allow_acess);

      status_details.allow_acess = allow_acess;

      return status_details;
    } catch (err) {
      console.log(err, "#log");
      res.json({ message: err.message });
    }
  },

  updateApproverStatus: async function (LeaveData, ApproverData) {
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
        message: "Whoops! Unable to Update Object",
      };

      let approvals = LeaveData.approvals;
      total_approvers = approvals.length; //2
      for (i = 0; i < approvals.length; i++) {
        //console.log("Total approver Length" + approvals.length);
        
        if (
          approver_id == approvals[i].approver_id &&
          (approvals[i].status == "Pending" ||
            approvals[i].status == "Processing")
        ) {
          isapprover_found = true;
          current_approver_rank = i;
          //send_email_notification_user = true;

          //MODIFYING LEAVE OBJECT

          LeaveData.approvals[i].status = "Approved";
          approver_object = LeaveData;
          LeaveData.approvals[i].reason = reason;
          LeaveData.approvals[i].approved_date = isoDate;

          //CHECK NEXT APPROVER
          let j = i + 1;

          if (
            LeaveData.approvals[j] &&
            (LeaveData.approvals[j].status == "Pending" ||
              approvals[j].status == "Processing")
          ) {
            next_approver = LeaveData.approvals[j];
            isNextapprover_found = true;
            send_email_notification_next_approver = true;
          } else {
            console.log("No more approvers found");
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
          message: "Woops ! No Approper Match with Existing ID",
        };
      }

      //UPDATE LEAVE STAUS

      /* if the current user is last approver then change status of leave to Approved */

      if (current_approver_rank == total_approvers - 1) {
        update_leave_status = true;
        send_email_notification_user = true;

        //MODIFYING LEAVE OBJECT
        LeaveData.status = "Approved";

        //send_email_notification_user = true;
      }

      if (current_approver_rank == null) {
        Status = {
          isupdated: false,
          message:
            "Woops ! No Approper Match with Existing ID OR it Already Approved",
        };
      }

      //UPDATE LEAVE OBJECT WITH NEWLY CONSTRCUTED OBJECT

      /*let isUpdatedApproverStatus = await LeavesModel.findOneAndUpdate(
        { _id: LeaveData._id },
        LeaveData
      );*/

      let isUpdatedApproverStatus = await LeavesModel.findOneAndUpdate(
        { _id: LeaveData._id },
        LeaveData,{ "fields": { "approvals":1, "status": 1 },new: true}
      );

      if (
        isUpdatedApproverStatus.length != 0 &&
        current_approver_rank != null
      ) {
        //send_email_notification_user = true;
        Status = {
          isupdated: true,
          message: "Sucessfully Updated",
          update_leave_status: update_leave_status,
          current_approver_rank: current_approver_rank,
          send_email_notification_user: send_email_notification_user,
          send_email_notification_next_approver:
            send_email_notification_next_approver,
          isNextapprover_found: isNextapprover_found,
          next_approver: next_approver,
          data:isUpdatedApproverStatus
        };
      } else {
        send_email_notification_user = false;
      }

      return Status;
    } catch (err) {
      console.log(err);
    }
  },

  updateApproverStatus_Reject: async function (LeaveData, ApproverData) {
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
        message: "Whoops! Unable to Update Object",
      };

      let approvals = LeaveData.approvals;
      total_approvers = approvals.length; //2
      for (i = 0; i < approvals.length; i++) {
        //console.log("Total approver Length" + approvals.length);
       /* if (
          approver_id == approvals[i].approver_id &&
          (approvals[i].status == "Pending" ||
            approvals[i].status == "Processing")
        ) {*/

          if (
            approvals[i].status == "Pending" ||
              approvals[i].status == "Processing"
          ) {
          isapprover_found = true;
          current_approver_rank = i;
          send_email_notification_user = true;
          update_leave_status = true;

          //MODIFYING LEAVE OBJECT

          LeaveData.approvals[i].status = "Rejected";
          approver_object = LeaveData;
          LeaveData.approvals[i].reason = reason;
          LeaveData.approvals[i].approved_date = isoDate;
          LeaveData.status = "Cancelled";

          //CHECK NEXT APPROVER

          /* let j = i + 1;
 
                     if (LeaveData.approvals[j] && (LeaveData.approvals[j].status == 'Pending' || approvals[j].status == 'Processing')) {
 
                         next_approver = LeaveData.approvals[j];
                         console.log("more approvers found");
                         isNextapprover_found = true;
                         send_email_notification_next_approver = true;
                     } else {
                         console.log("No more approvers found");
                     }
 
                     Status = {
                         "isupdated": true,
                         "message": approver_object
                     }*/

          //  break;
        } else {
          Status = {
            isupdated: false,
            message:
              "Woops ! No Approper Match with Existing ID   OR it Already Approved",
          };
        }
      }

      if (isapprover_found == false) {
        Status = {
          isupdated: false,
          message:
            "Woops ! No Approper Match with Existing ID   OR it Already Approved",
        };
      }

      //UPDATE LEAVE STAUS

      /* if the current user is last approver then change status of leave to Approved */

      /*  if (current_approver_rank == total_approvers - 1) {
                  update_leave_status = true;
                  send_email_notification_user = true;
  
                  //MODIFYING LEAVE OBJECT
                  LeaveData.status = "Approved";
                  console.log(total_approvers);
  
                  //send_email_notification_user = true;
  
              }*/

      if (current_approver_rank == null) {
        Status = {
          isupdated: false,
          message:
            "Woops ! No Approper Match with Existing ID   OR it Already Approved",
        };
      }

      //UPDATE LEAVE OBJECT WITH NEWLY CONSTRCUTED OBJECT
      if (isapprover_found == true && current_approver_rank != null) {
        let leave_ids = LeaveData._id;

       /* let isUpdatedApproverStatus = await LeavesModel.findOneAndUpdate(
          { _id: leave_ids },
          LeaveData
        );*/

        let isUpdatedApproverStatus = await LeavesModel.findOneAndUpdate(
          { _id: leave_ids },
          LeaveData,{ "fields": { "approvals":1, "status": 1 },new: true}
        );

        if (
          isUpdatedApproverStatus.length != 0 &&
          current_approver_rank != null
        ) {
          //send_email_notification_user = true;
          Status = {
            isupdated: true,
            message: "Sucessfully Updated",
            update_leave_status: update_leave_status,
            current_approver_rank: current_approver_rank,
            send_email_notification_user: send_email_notification_user,
            send_email_notification_next_approver:
              send_email_notification_next_approver,
            isNextapprover_found: isNextapprover_found,
            next_approver: next_approver,
            data:isUpdatedApproverStatus


          };
        } else {
          send_email_notification_user = false;
        }

        if (send_email_notification_user == true) {
          console.log("we can send the email now");
        } else {
          console.log("we can't send the email");
        }
      }

      return Status;
    } catch (err) {
      console.log(err);
    }
  },

  updateRemaingLeaveOn_Reject: async function (
    LeaveObject,
    leave_type_modified
  ) {
    const num_of_days_off = LeaveObject.no_of_days;
    let leave_type = "leaves" + "." + leave_type_modified;
    const user_id = LeaveObject.user_id;
    let remaing_leaves = 0;

    try {
      let Status = {
        isupdated: false,
        message: "Whoops! Unable to Update Object",
      };

      const filter = { _id: user_id };

      let userDetailsRetrived = await UsersModel.findOne(filter);
      console.log("RETRIVED USER OBJECT");

      if (userDetailsRetrived) {
        remaing_leaves = userDetailsRetrived.leaves[leave_type_modified];

        let leaveObject = userDetailsRetrived.leaves;

        let total_leave_calculated = +remaing_leaves + +num_of_days_off;

        leaveObject[leave_type_modified] = total_leave_calculated.toString();

        let fidled = "leaves." + leave_type_modified;

        const update = { leaves: leaveObject };

        // `doc` is the document _before_ `update` was applied
        let userDetails = await UsersModel.findOneAndUpdate(filter, update);
        //console.log("USER OBJECT");
        //console.log(userDetails);
        if (userDetails) {
          Status = {
            isupdated: true,
            message: "SucessFully Updated The Leave Balance On User Object",
          };
        } else {
          Status = {
            isupdated: false,
            message:
              "Whoops! Unable to Update Object Leave Type or User Object Not Found",
          };
        }
      } else {
        Status = {
          isupdated: false,
          message: "User Object Not Found",
        };
      }

      return Status;
    } catch (error) {
      console.log(error);
    }
  },

  buildEmailData: async function (
    LeaveObject,
    approverDetails,
    userDetails,
    companyDetails
  ) {
    //get final approver date details

    let final_approver = LeaveObject.approvals.length - 1;
    let approved_date;
    let requested_date = LeaveObject.date_created;

    //if (LeaveObject.approvals[final_approver].approver_id == approverDetails._id) {
    approved_date = LeaveObject.approvals[final_approver].approved_date;
    //}

    let LeaveDatesFormated = {
      from_date: formatDate(LeaveObject.from_date),
      to_date: formatDate(LeaveObject.to_date),
      approved_date: formatDate(approved_date),
      requested_date: formatDate(requested_date),
      user: {
        email: userDetails.email,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
      },
      approver: {
        email: approverDetails.email,
        first: approverDetails.first_name,
        last: approverDetails.last_name,
      },
      companyName: companyDetails.info.name,
      companyAddress: companyDetails.info.address,
      companyPhone: companyDetails.info.phone,
      companyLogo: companyDetails.letterDetail.companyLogoLink
    };

    LeaveDatesFormated.leave = LeaveObject;

    return LeaveDatesFormated;
  },
  
  buildEmailDataOnReject: async function (
    LeaveObject,
    approverDetails,
    userDetails,
    companyDetails
  ) {
    let approved_date;
    let final_approver = LeaveObject.approvals.length - 1;
    approved_date = LeaveObject.approvals[final_approver].approved_date;
    if(!approved_date){
      const currentdate = new Date();
      let date = new Date(new Date(currentdate).setHours(currentdate.getHours() + 4));
      approved_date=date;
    }

    let requested_date = LeaveObject.date_created;

    let LeaveDatesFormated = {
      from_date: formatDate(LeaveObject.from_date),
      to_date: formatDate(LeaveObject.to_date),
      approved_date: formatDate(approved_date),
      requested_date: formatDate(requested_date),
      user: {
        email: userDetails.email,
        first_name: userDetails.first_name,
      },
      approver: {
        email: approverDetails.email,
        first: approverDetails.first_name,
        last: approverDetails.last_name,
      },
      companyName: companyDetails.info.name,
      companyAddress: companyDetails.info.address,
      companyPhone: companyDetails.info.phone,
      companyLogo: companyDetails.letterDetail.companyLogoLink
    };

    LeaveDatesFormated.leave = LeaveObject;

    return LeaveDatesFormated;
  },


  buildEmailDataOnRejectNOCDriving: async function (
    LeaveObject,
    approverDetails,
    userDetails,
    companyDetails
  ) {
    let approved_date;
    let final_approver = LeaveObject.approvals.length - 1;
    approved_date = LeaveObject.approvals[final_approver].approved_date;
    if(!approved_date){
      const currentdate = new Date();
      let date = new Date(new Date(currentdate).setHours(currentdate.getHours() + 4));
      approved_date = date;
    }

    let requested_date = LeaveObject.date_created;

    let comments;

    for(var i = 0; i < LeaveObject.approvals.length ; i++){
      if(approverDetails._id == LeaveObject.approvals[i].approver_id){
        comments = LeaveObject.approvals[i].reason
      }
    }

    let LeaveDatesFormated = {
      approved_date: formatDate(approved_date),
      requested_date: formatDate(requested_date),
      letter_type: LeaveObject.letter_type,
      letter_subtype: LeaveObject.letter_sub_type,
      comments: comments,
      user: {
        email: userDetails.email,
        first_name: userDetails.first_name,
      },
      approver: {
        email: approverDetails.email,
        name: approverDetails.first_name + " " +approverDetails.last_name,
      },
      companyName: companyDetails.info.name,
      companyAddress: companyDetails.info.address,
      companyPhone: companyDetails.info.phone,
      companyLogo: companyDetails.letterDetail.companyLogoLink
    };

    return LeaveDatesFormated;
  },

  buildEmailDataOnRequest: async function (lettersInfo, UserDetails) {
    let letterDataFormated = {
      user: {
        email: UserDetails.email,
        first_name: UserDetails.first_name,
        last_name: UserDetails.last_name,
    
      },
      request_type: lettersInfo,
    };

    return letterDataFormated;
  },


  buildNOCDrivingEmailData: async function (lettersInfo, UserDetails,letterObject,ApproverNames,companyInformation) {
    let letterDataFormated = {
      user: {
        email: UserDetails.email,
        first_name: UserDetails.first_name,
        last_name: UserDetails.last_name,
    
      },
      request_type: lettersInfo,
      letter_type: letterObject.letter_type,
      letter_subtype: letterObject.letter_sub_type,
      requested_data: formatDate(letterObject.date_created),
      approvers: ApproverNames,
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink,
    };

    return letterDataFormated;
  },


  buildNOCDrivingEmailDataForManager: async function (lettersInfo, UserDetails,letterObject,companyInformation,firstApprover) {
    let letterDataFormated = {
      user: {
        email: UserDetails.email,
        user_name: UserDetails.first_name + " " + UserDetails.last_name,
      },
      request_type: lettersInfo,
      letter_type: letterObject.letter_type,
      letter_subtype: letterObject.letter_sub_type,
      requested_data: formatDate(letterObject.date_created),
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink,
      approver: firstApprover
    };

    return letterDataFormated;
  },

  buildNOCDrivingEmailDataForManagerApprove: async function (lettersInfo, UserDetails,letterObject,companyInformation,firstApprover) {
    let letterDataFormated = {
      user: {
        // email: UserDetails.email,
        user_name: UserDetails.user_name,
      },
      request_type: lettersInfo,
      letter_type: letterObject.letter_type,
      letter_subtype: letterObject.letter_sub_type,
      requested_data: formatDate(letterObject.date_created),
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink,
      approver: firstApprover
    };

    return letterDataFormated;
  },


  buildEmailDataOnRequestWithComapany: async function (leaveObject, UserDetails,companyInformation,ApproverInfo) {
    let letterDataFormated = {
      user: {
        email: UserDetails.email,
        first_name: UserDetails.first_name,
        last_name: UserDetails.last_name,
    
      },
      leave_type: leaveObject.leave_type,
      leave_start_date: formatDate(leaveObject.from_date),
      leave_end_date: formatDate(leaveObject.to_date),
      leave_created: formatDate(leaveObject.date_created),
      no_of_days: leaveObject.no_of_days,
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink,
      approverNames: ApproverInfo
    };


    return letterDataFormated;
  },


  buildClaimDataOnRequestWithComapany: async function (leaveObject, UserDetails,companyInformation,ApproverInfo) {
    let letterDataFormated = {
      user: {
        email: UserDetails.email,
        first_name: UserDetails.first_name,
        last_name: UserDetails.last_name,
    
      },
      claim_type: leaveObject.letter_type,
      amount: leaveObject.letter_fields.amount,
      date_created: formatDate(leaveObject.letter_fields.date),
      details: leaveObject.letter_fields.description,
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink,
      approverNames: ApproverInfo
    };


    return letterDataFormated;
  },


  buildEmailDataForManagerClaim: async function (manager,leaveObject,UserDetails,companyInformation) {
    let letterDataFormated = {
      user: {
        first_name: manager,
      },
      user_name: UserDetails,
      claim_type: leaveObject.letter_type,
      amount: leaveObject.letter_fields.amount,
      date_created: formatDate(leaveObject.letter_fields.date),
      details: leaveObject.letter_fields.description,
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink
    };

    return letterDataFormated;
  },


  buildEmailDataForManager: async function (manager,leaveObject,UserDetails,companyInformation) {
    let letterDataFormated = {
      user: {
        first_name: manager,
      },
      user_name: UserDetails,
      leave_type: leaveObject.leave_type,
      leave_start_date: formatDate(leaveObject.from_date),
      leave_end_date: formatDate(leaveObject.to_date),
      leave_created: formatDate(leaveObject.date_created),
      no_of_days: leaveObject.no_of_days,
      leave_type: leaveObject.leave_type,
      companyName: companyInformation.info.name,
      companyAddress: companyInformation.info.address,
      companyPhone: companyInformation.info.phone,
      companyLogo: companyInformation.letterDetail.companyLogoLink
    };

    return letterDataFormated;
  },


  getApproverEmailIDs: async function(approvals){

  
    let ids = [];
  
    let result = [];
  
    try {
      for (i = 0; i < approvals.length; i++) {
        ids.push(approvals[i].approver_id);
      }
  
      const records = await UsersModel.find(
        { _id: { $in: ids } },
        {
          email: 1,
          first_name: 1,
          last_name: 1,
      
        }
      );

      for (j = 0; j < records.length; j++) {
       /* let data = {
          first_name: records[j].email
        
        };*/
  
        result.push(records[j].email);
      }

      return result;


    }catch(e){
      console.log("error"+e);
    }
  },


  getApproverDetailsForNotification(LeavesData) {
    /**
     * IT i will retrun current approver details if not approved by any approver
     * else it will return next approver details
     */
    var next_approver = [];
    var isNextapprover_found = false;
    var approver_id;
    let approvals = LeavesData.approvals;
    total_approvers = approvals.length; //2
    for (i = 0; i < total_approvers; i++) {
      if (approvals[i].status == "Approved") {
        //CHECK NEXT APPROVER
        let j = i + 1;

        if (
          LeavesData.approvals[j] &&
          (LeavesData.approvals[j].status == "Pending" ||
            approvals[j].status == "Processing")
        ) {
          next_approver.push(LeavesData.approvals[j]);
          console.log("more approvers found");
          break;
        } else {
          console.log("No more approvers found");
        }
      } else if (
        LeavesData.approvals[0].status == "Pending" ||
        approvals[0].status == "Processing"
      ) {
        next_approver = LeavesData.approvals[0];
      } else {
        console.log("approver not found");
      }
    }
    return next_approver;
  },



};




function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join("-");
}

//functions
