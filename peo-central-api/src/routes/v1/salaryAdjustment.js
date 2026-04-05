const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
const SalaryAdjustmentModel = require("../../models/salaryAdjustment");
// const PayrollModel = require('../models/payroll')
// const PayrollProcessModel = require("../models/payrollprocess");
const configurationModel = require("../../models/configuration.model");
const UsersModel = require('../../models/users.model');
const validateToken = require("../../../utils").validateAccessToken;
const moment = require('moment')
// const FixedSalaryLogModel = require('../models/fixedsalarylog')
const { request } = require("express");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/all", validateToken, async (req, res) => {
    try {
        const data = await SalaryAdjustmentModel.find();
        res.json(data);
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message });
    }
});
router.post("/add-item", validateToken, async (req, res) => {

    try {
        let adjustment = { ...req.body }
        let arr = []
        let daysInMonth = moment(adjustment.effective_date).daysInMonth()
        let dayOnNumber = Number(moment(adjustment.effective_date).format('DD'))
        for (const [key1, value1] of Object.entries(adjustment.new_salary)) {
            for (const [key2, value2] of Object.entries(adjustment.old_salary)) {
                if (key1 == key2) {
                    let diff = Math.abs(Number(value2) - Number(value1))
                    let obj = {}
                    obj.noDays = daysInMonth - dayOnNumber + 1
                    let text = key1.replace(/_/g, " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
                    obj.category = text
                    obj.amount = Number((Number(diff) / (Number(daysInMonth) / obj.noDays)).toFixed(2))
                    arr.push(obj)
                }
            }
        }
        adjustment.proratingCalculation = arr
        const SalaryAdjustment = new SalaryAdjustmentModel(adjustment);

        const newProcess = await SalaryAdjustment.save();
        res.status(201).json(newProcess);
    } catch (error) {
        console.log("#log", error);
        res.status(400).json({ message: error.message });
    }
});

router.get("/user/:user_id", validateToken, async (req, res) => {
    const id = req.params.user_id;
    try {
        const result = await SalaryAdjustmentModel.find({ "user_id": id }).sort({ date_created: -1 })
        res.json(result)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});

router.put("/:_id", validateToken, (req, res, next) => {
    const id = req.params._id;
    const process = SalaryAdjustmentModel.findByIdAndUpdate(
        id,
        req.body,
        function (err, post) {
            if (err) return next(err);
            res.json(post);
        }
    );
});

router.get("/pending/:_id", validateToken, async (req, res, next) => {
    const id = req.params._id;
    try {
        const result = await SalaryAdjustmentModel.countDocuments({ "user_id": id, status: "pending" })
        res.json(result)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});

router.get("/pay_month/:company_id/:pay_month", validateToken, async (req, res, next) => {
    const company_id = req.params.company_id;
    const pay_month = req.params.pay_month;
    try {
        const result = await SalaryAdjustmentModel.find({ "company_id": company_id, "pay_month": pay_month }).sort({ date_created: -1 })
        res.json(result)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});

router.get("/get_latest/:id", validateToken, async (req, res, next) => {
    const id = req.params.id;
    try {
        const result = await SalaryAdjustmentModel.findOne({ "user_id": id }).sort({ date_created: -1 })
        res.json(result)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});
router.get("/pay_month/count/:company_id/:pay_month", validateToken, async (req, res, next) => {
    const company_id = req.params.company_id;
    const pay_month = req.params.pay_month;
    try {
        console.log(company_id, pay_month)
        const active = await SalaryAdjustmentModel.countDocuments({ "company_id": company_id, "pay_month": pay_month, "status": "active" }).sort({ date_created: -1 })
        const pending = await SalaryAdjustmentModel.countDocuments({ "company_id": company_id, "pay_month": pay_month, "status": "pending" }).sort({ date_created: -1 })
        const withdrawn = await SalaryAdjustmentModel.countDocuments({ "company_id": company_id, "pay_month": pay_month, "status": "withdrawn" }).sort({ date_created: -1 })
        let total = active + pending + withdrawn
        res.json({ active, pending, withdrawn, total })
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});

router.post("/get_all_requests", validateToken, async (req, res, next) => {
    try {

        let history = req.body.history
        if (history == false) {
            const process = await SalaryAdjustmentModel.find({ status: "pending" })
            res.json(process)
        } else {
            const process = await SalaryAdjustmentModel.find({ status: { $nin: ["pending"] } })
            res.json(process)
        }
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});

router.post("/get_all_requests/:createdBy", validateToken, async (req, res, next) => {
    try {
        const id = req.params.createdBy;

        let history = req.body.history
        if (history == false) {
            const process = await SalaryAdjustmentModel.find({ status: "pending", $or: [ { createdBy: id }, { approvals: {$elemMatch: {approver_id:id}} } ] })
            res.json(process)
        } else {
            const process = await SalaryAdjustmentModel.find({ status: { $nin: ["pending"] }, $or: [ { createdBy: id }, { approvals: {$elemMatch: {approver_id:id}} } ] })
            res.json(process)
        }
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});
router.post("/get_all_requests_count", validateToken, async (req, res, next) => {
    try {
        let history = req.body.history
        if (history == false) {
            const countPending = await SalaryAdjustmentModel.countDocuments({ status: "pending" })
            res.json(countPending)
        } else {
            const countPending = await SalaryAdjustmentModel.countDocuments({ status: { $nin: ["pending"] } })
            res.json(countPending)
        }
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});
router.post("/get_all_requests_count/:createdBy", validateToken, async (req, res, next) => {
    try {
        const id = req.params.createdBy;
        let history = req.body.history
        if (history == false) {
            const countPending = await SalaryAdjustmentModel.countDocuments({ status: "pending", $or: [ { createdBy: id }, { approvals: {$elemMatch: {approver_id:id}} } ] })
            res.json(countPending)
        } else {
            const countPending = await SalaryAdjustmentModel.countDocuments({ status: { $nin: ["pending"] }, $or: [ { createdBy: id }, { approvals: {$elemMatch: {approver_id:id}} } ] })
            res.json(countPending)
        }
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
});


router.post("/approve", validateToken, async (req, res, next) => {

    try {
        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }

        function capitalize(str) {
            const words = str.split(" ");

            return words.map((word) => {
                return word[0].toUpperCase() + word.substring(1);
            }).join(" ");
        }

        var noOfDaysWorkedForWorkingDays = function (startDate, endDate, weekends) {
            var allDatesBetweenDates = getDaysArray(startDate, endDate);
            var DatesWorkedExcludingWeekends = [];
            if (allDatesBetweenDates.length > 0) {
                for (var i = 0; i < allDatesBetweenDates.length; i++) {
                    var element = allDatesBetweenDates[i];
                    if (!weekends.includes(moment(element).day())) {
                        DatesWorkedExcludingWeekends.push(element);
                    }
                }
                return DatesWorkedExcludingWeekends.length;
            }
            else
                return 0;
        };

        var getWorkingDaysInaMonth = function (payMonth, weekends) {
            function getDaysArrayByMonth(payMonth) {
                var daysInMonth = moment(payMonth).daysInMonth();
                var arrDays = [];
                while (daysInMonth) {
                    var current = moment(payMonth).date(daysInMonth);
                    arrDays.push(current);
                    daysInMonth--;
                }
                return arrDays;
            }
            var totalWorkdays = 0;
            var datesArray = [];
            var schedule = getDaysArrayByMonth(payMonth);
            schedule.forEach(function (item) {
                datesArray.push(item.format('YYYY-MM-DD'));
            });
            for (var i = 0; i < datesArray.length; i++) {
                var day = new Date(datesArray[i]).getDay();
                if (!weekends.includes(day)) {
                    totalWorkdays = totalWorkdays + 1;
                }
            }
            return totalWorkdays;
        };
        function getSumOfArrears(data) {
            const result = {};

            data.forEach(element => {
                for (let [key, value] of Object.entries(element)) {
                    if (result[key]) {
                        result[key] += value;
                    } else {
                        result[key] = value;
                    }
                }
            });
            return result;
        };
        let adjustment = req.body.adjustment;
        let userID = req.body.user._id;
        let user = req.body.user;
        let reason = req.body.reason;
        let isAdmin = "management";
        if (req.body.hasOwnProperty('admin')) {
            isAdmin = req.body.admin;
        }
        // if effective date is less than open payroll period then add payitems at the time of approval.
        let userApprovalObj = adjustment.approvals;
        for (let i = 0; i < userApprovalObj.length; i++) {
            if (
                userApprovalObj[i].status == "Processing" &&
                userApprovalObj[i].approver_id == userID
            ) {
                userApprovalObj[i].status = "Approved";
                userApprovalObj[i].approved_date = new Date().toISOString();
                userApprovalObj[i].comments = reason;
            } else if (isAdmin === true) {
                userApprovalObj[i].status = "Approved";
                userApprovalObj[i].approved_date = new Date().toISOString();
                userApprovalObj[i].comments = "Reason: " + reason + " | Admin Approves By " + (user.first_name+" "+ user.last_name).trim().replace(/\s+/g, ' ');
            }
            if (i != userApprovalObj.length - 1) {
                userApprovalObj[i + 1].status = "Processing";
            } else if (
                i == userApprovalObj.length - 1 &&
                userApprovalObj[i].status == "Approved"
            ) {
                adjustment.status = "active";
                if (isAdmin === true) {
                    userApprovalObj[i].comments = "Reason: " + reason + " | Admin Approves By " + (user.first_name+" "+ user.last_name).trim().replace(/\s+/g, ' ');
                }else{
                    userApprovalObj[i].comments = reason;
                }
            }
        }

        //TODO: GET OPEN PAYROLL PERIOd
        // if effective date is less than open payroll period then add payitems at the time of approval. and adjustment.status = active
        if (adjustment.status == "active") {


            // let configProject = {
            //     $project: {
            //         fixed: 1,
            //         payitemApprovals: 1,
            //         _id: 1
            //     },
            // };
            let configData = await configurationModel.find({});
            let proratingCalculations = configData[0].prorating_calculation
            let approval_array = []
            let app_log = []
            /* Create payitems approval flow*/
            if (configData[0].payitemApprovals.length > 0) {

                for (let index = 0; index < configData[0].payitemApprovals.length; index++) {
                    let approver = configData[0].payitemApprovals[index]
                    let approval_obj = {
                        approver_id: approver,
                        status: "",
                        approved_date: "",
                        comments: ""
                    };

                    index == 0
                        ? (approval_obj.status = "Processing")
                        : (approval_obj.status = "Pending");
                    approval_array.push(approval_obj);

                    let logs = {
                        created_by: approver,
                        status: 'Created',
                        date_created: new Date()
                    }
                    app_log.push(logs)
                }
            }


            const currentActivePaymonth = await PayrollProcessModel.findOne({
                company_id: adjustment.company_id,
                status: "active",
            }).select({ _id: 1, pay_month: 1, submit_for_approval: 1 });

            let effectivedate = new Date(new Date(adjustment.effective_date).toISOString().substr(0, 10))
            let currentdate = new Date(new Date(moment(currentActivePaymonth).endOf("month").format("YYYY-MM-DD")).toISOString().substr(0, 10))

            if (effectivedate <= currentdate) {



                let YearMonthEffectiveDate = new Date(moment(effectivedate, "YYYY-MM-DD").format('YYYY-MM'))
                let activePaymonth = new Date(moment(currentActivePaymonth.pay_month))
                let requestPaymonth = currentActivePaymonth.pay_month;
                // console.log("year month ->" + YearMonthEffectiveDate + "<->" + activePaymonth)
                if (YearMonthEffectiveDate < activePaymonth) {
                    //TODO Create arrears payitem
                    //? Only Go here if effective date is on closed payroll

                    //? Get paymonths and put it in array
                    let differenceMonth = monthDiff(YearMonthEffectiveDate, activePaymonth);
                    let paymonths = []

                    for (let i = 1; i <= differenceMonth; i++) {
                        activePaymonth.setMonth(activePaymonth.getMonth() - 1);
                        paymonths.push(moment(activePaymonth).format('YYYY-MM'))
                    }
                    // console.log(paymonths)

                    //? Get closed payroll filtering paymonths array
                    const closedPayrollList = await PayrollProcessModel.find({
                        company_id: adjustment.company_id,
                        pay_month: { "$in": paymonths }
                    })

                    //? Start Creating Arrears logic
                    let arrayOfArrears = []

                    for (let _cpl = 0; _cpl < closedPayrollList.length; _cpl++) {
                        const element = closedPayrollList[_cpl];
                        let arrears = {}

                        //? Get salary from the closed paymonth
                        let userSalary = element.salary.filter(e => e.user_id == adjustment.user_id)
                        //? Computing 2% of arrears category
                        let closedpaymonth = element.pay_month;
                        let noOfDaysInMonth = moment(closedpaymonth, 'YYYY-MM').daysInMonth();
                        for (const [key, value] of Object.entries(adjustment.new_salary)) {
                            if (userSalary && userSalary.length > 0 && (userSalary[0].hasOwnProperty(key) && adjustment.old_salary.hasOwnProperty(key))) {
                                if (adjustment.old_salary[key] != adjustment.new_salary[key] && key != "total_fixed") {
                                    if (arrears.hasOwnProperty(key + "_arrears")) {
                                        continue
                                    }
                                    if (String(moment(adjustment.effective_date).format("YYYY-MM")) == closedpaymonth) {
                                        let workDays = Number(noOfDaysInMonth) - Number(moment(adjustment.effective_date).format('D'))
                                        if (proratingCalculations && proratingCalculations.type) {
                                            if (proratingCalculations.type == '12dividedBy365') {
                                                arrears[key + "_arrears"] = (Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) * (12 / 365) * workDays).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == '12dividedBy260') {
                                                arrears[key + "_arrears"] = (Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) * (12 / 260) * workDays).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == '12dividedBy260WorkingDays') {
                                                lastDateOfMonth = moment(payMonth).endOf('month').format('YYYY-MM-DD');
                                                no_of_days_worked_for_woking_days = noOfDaysWorkedForWorkingDays(user.date_of_joining, lastDateOfMonth, proratingCalculations.weekends);
                                                arrears[key + "_arrears"] = (Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) * (12 / 260) * no_of_days_worked_for_woking_days).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == 'numberOfWorkingDaysInaMonth') {
                                                var workingDays = getWorkingDaysInaMonth(payMonth, proratingCalculations.weekends);
                                                var lastDateOfMonth_1 = moment(payMonth).endOf('month').format('YYYY-MM-DD');
                                                var no_of_days_worked_for_woking_days_1 = noOfDaysWorkedForWorkingDays(user.date_of_joining, lastDateOfMonth_1, proratingCalculations.weekends);
                                                arrears[key + "_arrears"] = ((Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) / workingDays) * no_of_days_worked_for_woking_days_1).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == 'calendarDaysInaMonth') {
                                                arrears[key + "_arrears"] = Number((((Number(adjustment.new_salary[key]) - Number(userSalary[0][key])) / noOfDaysInMonth) * workDays).toFixed(2))
                                            }
                                            else if (proratingCalculations.type == 'dividedBy28') {
                                                arrears[key + "_arrears"] = ((Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) / 28) * workDays).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == 'dividedBy29') {
                                                arrears[key + "_arrears"] = ((Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) / 29) * workDays).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == 'dividedBy30') {
                                                arrears[key + "_arrears"] = ((Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) / 30) * workDays).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == 'dividedBy31') {
                                                arrears[key + "_arrears"] = ((Number(adjustment.new_salary[key]) - Number(userSalary[0][key]) / 31) * workDays).toFixed(2);
                                            }
                                            else if (proratingCalculations.type == 'None') {
                                                arrears[key + "_arrears"] = Number(adjustment.new_salary[key]) - Number(userSalary[0][key]);
                                            }

                                        }
                                    } else {
                                        arrears[key + "_arrears"] = Number((Number(adjustment.new_salary[key]) - Number(userSalary[0][key])).toFixed(2))
                                    }
                                }
                            }
                        }
                        // console.log("arrears -->", arrears)

                        //? pushing arrear object in array of object arrear so it can easily summarized
                        arrayOfArrears.push(arrears)
                    }
                    //? End Creating Arrears logic

                    //? Summarized all array of arrear into 1 object
                    const mergedObject = getSumOfArrears(arrayOfArrears);
                    // console.log("Sums of Object -->", mergedObject)
                    //TODO : Create payitems
                    let employee = await UsersModel.findOne({ _id: ObjectId(adjustment.user_id) });
                    let payitemObj = {
                        pay_month: '',
                        user_id: employee._id,
                        first_name: employee.first_name,
                        last_name: employee.last_name,
                        approvals: approval_array,
                        earning_type: "Earning",
                        category: "",
                        remarks: "Arrears From Salary Adjustment",
                        logs: app_log,
                        amount: 0,
                        approved_by_id: '',
                        recursive_id: 'Non-Recursive',
                        status: 'pending',
                        unpaid: 0,
                        ot_type: "",
                        hours: "",
                        created_by_id: approval_array && approval_array.length > 0 ? approval_array[0].approver_id : '',
                        company_id: employee.company_ID
                    }


                    for (const [key, value] of Object.entries(mergedObject)) {
                        payitemObj.category = capitalize(key.replace(/_/g, " "))
                        payitemObj.amount = Number(value.toFixed(2))
                        let txt = payitemObj.category + " From"
                        for (let p_m = 0; p_m < paymonths.length; p_m++) {
                            if (p_m != 0) {
                                txt = txt.concat(", " + moment(paymonths[p_m], 'YYYY-MM').format('MMM YYYY'));

                            } else {
                                txt = txt.concat(" " + moment(paymonths[p_m], 'YYYY-MM').format('MMM YYYY'));
                            }
                        }
                        // Basic Salary Arrears - Jan 2022 Feb 2023 Mar 2023
                        payitemObj.remarks = txt
                        payitemObj.request_id = adjustment._id

                        if (Boolean(currentActivePaymonth.submit_for_approval)) {
                            payitemObj.pay_month = currentActivePaymonth.pay_month
                        } else {
                            let temp = currentActivePaymonth.pay_month.split('-')
                            temp[1] > 9 ? temp[1] = Number(temp[1]) + 1 : temp[1] = '0' + (Number(temp[1]) + 1);
                            payitemObj.pay_month = temp[0] + "-" + temp[1]
                            requestPaymonth = temp[0] + "-" + temp[1]
                        }
                        // console.log(payitemObj)
                        if (payitemObj.amount !== 0) {
                            if (!(configData[0].earning.includes(payitemObj.category))) {
                                configData[0].earning.push(payitemObj.category)
                                await configurationModel.findOneAndUpdate({ _id: configData[0]._id }, { earning: configData[0].earning })
                            }

                            const payroll = new PayrollModel(payitemObj);
                            await payroll.save();
                        }
                    };


                }


                //? Update Salary Object
                const updateUser = await UsersModel.findOneAndUpdate({ _id: adjustment.user_id }, { $set: { salary: adjustment.new_salary } })

                if (!Boolean(currentActivePaymonth.submit_for_approval)) {
                    let temp = currentActivePaymonth.pay_month.split('-')
                    temp[1] > 9 ? temp[1] = Number(temp[1]) + 1 : temp[1] = '0' + (Number(temp[1]) + 1);
                    requestPaymonth = temp[0] + "-" + temp[1]
                }
                adjustment.isUpdated = true;
                adjustment.pay_month = requestPaymonth;

                await SalaryAdjustmentModel.findByIdAndUpdate(
                    adjustment._id,
                    adjustment,
                );
                let compensation_obj = {
                    approved_by_id: adjustment.approvals[0].approver_id,
                    oldSalary: adjustment.old_salary,
                    newSalary: adjustment.new_salary,
                    user_id: adjustment.user_id
                }

                const logs = new FixedSalaryLogModel({ ...compensation_obj })
                const log = await logs.save()
            }


        }
        await SalaryAdjustmentModel.findByIdAndUpdate(
            adjustment._id,
            adjustment,
        );

        res.json({ success: true, message: "Success" });
    } catch (error) {
        console.log(error);
    }
});

router.post("/reject", validateToken, async (req, res, next) => {
    try {
        let adjustment = req.body.adjustment;
        let userID = req.body.user._id;
        let user = req.body.user;
        let reason = req.body.reason;
        let isAdmin = "management";
        if (req.body.hasOwnProperty('admin')) {
            isAdmin = req.body.admin;
        }
        console.log(adjustment)
        // if effective date is less than open payroll period then add payitems at the time of approval.
        let userApprovalObj = adjustment.approvals;
        for (let i = 0; i < userApprovalObj.length; i++) {
            if (
                userApprovalObj[i].status == "Processing" &&
                userApprovalObj[i].approver_id == userID
            ) {
                userApprovalObj[i].status = "Rejected";
                userApprovalObj[i].approved_date = new Date().toISOString();
                userApprovalObj[i].comments = reason;
            }else if(isAdmin === true){
                userApprovalObj[i].status = "Rejected";
                userApprovalObj[i].approved_date = new Date().toISOString();
                userApprovalObj[i].comments = "Reason: " + reason + " | Admin Rejection By " + (user.first_name+" "+ user.last_name).trim().replace(/\s+/g, ' ');
            }
        }

        adjustment.approvals = userApprovalObj;

        adjustment.status = "rejected";

        await SalaryAdjustmentModel.findByIdAndUpdate(
            adjustment._id,
            adjustment,
        );

        res.json({ success: true, message: "Success" });
    } catch (error) {
        console.log(error);
    }
});
module.exports = router;
