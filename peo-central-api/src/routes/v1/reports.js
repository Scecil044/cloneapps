const express = require('express');
const router = express.Router();
const monthlyReportModel = require('../../models/monthly_report');
const validateToken = require('../../../utils').validateAccessToken;
const { ObjectId } = require('mongoose').Types;
const usersModel = require('../../models/users.model');
const configModel = require('../../models/configuration.model');
const requestsModel = require('../../models/requests');
const leavesModel = require('../../models/leaves');
const wfhModel = require('../../models/wfh');
const { toLower } = require('lodash');

router.get('/monthly-report-data/:_current_month', async (req, res) => {
  try {
    const currentMon = req.params._current_month.toString();
    const reportCollection = await monthlyReportModel.find();

    if (reportCollection.length > 0) {
      const [year, month] = currentMon.split('-');
      const result = reportCollection.filter((obj) => {
        const objYear = obj.dateCreated.toISOString().substring(0, 4);
        const objMonth = obj.dateCreated.toISOString().substring(5, 7);
        return objYear === year && objMonth === month;
      });
      //This below if condition will look for the record based on the params month in 'monthly reports collection' and return 'result'
      if (result.length > 0) {
        return res
          .status(200)
          .json({ success: true, message: 'Success and Record is available with this month', data: result });
      } else {
        //This if condition will generate new reports for the current month and return the reports but won't save in the 'monthly report collection'

        const paramsDate = new Date(currentMon);
        const paramsMonth = paramsDate.toLocaleString('default', { month: 'long' });
        const paramsYear = paramsDate.getFullYear(); // returns 2022

        const today = new Date();
        const currentMonth = today.toLocaleString('default', { month: 'long' });
        const currentYear = today.getFullYear();

        if (paramsMonth === currentMonth && paramsYear === currentYear) {
          // Create an array of promises for aggregation queries
          const aggregationPromises = [
            usersModel
              .aggregate([
                {
                  $project: {
                    user_status: 1,
                    personal: 1,
                    reporting: 1,
                    employment: 1,
                    documents: 1,
                    first_name: 1,
                    last_name: 1,
                    date_of_joining: 1,
                  },
                },
              ])
              .exec(),
            configModel.aggregate([{ $project: { dept: 1 } }]).exec(),
            requestsModel.aggregate([{ $project: { status: 1, request_type: 1 } }]).exec(),
            leavesModel.aggregate([{ $project: { status: 1, leave_type: 1 } }]).exec(),
            wfhModel.aggregate([{ $project: { status: 1 } }]).exec(),
          ];
          // Execute the aggregation queries in parallel using Promise.all
          const [users, config, requests, leaves, wfh] = await Promise.all(aggregationPromises);

          let newObj = {
            report: {
              expiryDocument: {
                passport: 0,
                emiratesId: 0,
                visa: 0,
                insurance: 0,
                information: { passport: [], emiratesId: [], visa: [], insurance: [] },
              },
              pendingRequest: { claims: 0, letters: 0, leave: 0, attendance: 0, wfh: 0 },
              allDepartment: [],
            },
            dateCreated: new Date(),
          };

          //Department Distribution
          newObj.report.totalEmployees = users.filter((a) => a.user_status == 'Active' || a.user_status == 'Hold').length;
          newObj.report.totalMaleEmployees = users.filter(
            (a) => a.personal.gender == 'Male' && (a.user_status == 'Active' || a.user_status == 'Hold')
          ).length;
          (newObj.report.totalFemaleEmployees = users.filter(
            (a) => a.personal.gender == 'Female' && (a.user_status == 'Active' || a.user_status == 'Hold')
          ).length),
            (newObj.report.totalMaleEmployeesInPercentage = (
              (users.filter((a) => a.personal.gender == 'Male' && (a.user_status == 'Active' || a.user_status == 'Hold'))
                .length *
                100) /
              users.filter((a) => a.user_status == 'Active' || a.user_status == 'Hold').length
            ).toFixed(2));
          newObj.report.totalFemaleEmployeesInPercentage = (
            (users.filter((a) => a.personal.gender == 'Female' && (a.user_status == 'Active' || a.user_status == 'Hold'))
              .length *
              100) /
            users.filter((a) => a.user_status == 'Active' || a.user_status == 'Hold').length
          ).toFixed(2);

          //allDepartments
          newObj.report.allDepartment = config[0].dept.map((department) => {
            const maleCount = users.reduce(
              (count, user) =>
                user.reporting.department === department.name && user.personal.gender === 'Male' ? count + 1 : count,
              0
            );
            const femaleCount = users.reduce(
              (count, user) =>
                user.reporting.department === department.name && user.personal.gender === 'Female' ? count + 1 : count,
              0
            );
            return { name: department.name, male: maleCount, female: femaleCount };
          });

          //Add Average Turnover Rate
          let startDate = '';
          let endDate = '';
          let totalMonthDot = '';
          let totalMonths = '';
          let result = '';
          let avgContractTenure = 0;
          for (let index = 0; index < config[0].dept.length; index++) {
            let totalCount = 0;
            let eachCount = 0;
            users.forEach((element) => {
              if (element.reporting.department == config[0].dept[index].name) {
                if (
                  element.date_of_joining != '' &&
                  element.date_of_joining != undefined &&
                  (element.employment.termination_date == '' || element.employment.termination_date == undefined)
                ) {
                  startDate = element.date_of_joining.toString().slice(0, 7);
                } else if (
                  element.date_of_joining != '' &&
                  element.date_of_joining != undefined &&
                  element.employment.termination_date != '' &&
                  element.employment.termination_date != undefined
                ) {
                  endDate = element.employment.termination_date.toString().slice(0, 7);
                }
                const doj = startDate;
                const today = new Date().toISOString().substring(0, 7);
                const dojDate = new Date(doj);
                const todayDate = new Date(today);
                totalMonths =
                  (todayDate.getFullYear() - dojDate.getFullYear()) * 12 + (todayDate.getMonth() - dojDate.getMonth());
                const date1 = new Date(startDate);
                const date2 = new Date(endDate);
                totalMonthDot = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
                if (isNaN(totalMonthDot)) {
                  totalMonthDot = 0;
                } else if (isNaN(totalMonths)) {
                  totalMonths = 0;
                }
                result = totalMonths + totalMonthDot;
                totalCount++;
                eachCount += result;
                avgContractTenure = eachCount / totalCount;
                if (newObj.report.allDepartment.map((a) => a.name == config[0].dept[index].name)) {
                  newObj.report.allDepartment.filter((a) => a.name == config[0].dept[index].name)[0].avgContractTenure =
                    avgContractTenure.toFixed(2);
                }
              }
            });
            startDate = '';
            endDate = '';
            eachCount = 0;
            avgContractTenure = 0;
          }

          //Month Wise Terminated Employees
          const today = new Date().toISOString().substring(0, 7);
          const exitedEmployees = users.filter(
            (element) => element.employment.termination_date && element.employment.termination_date.slice(0, 7) === today
          );
          newObj.report.totalExitedEmployeesLength = exitedEmployees.length;

          //New Employees
          const newEmployees = users.filter(
            (element) => element.date_of_joining && element.date_of_joining.slice(0, 7) === today
          );
          newObj.report.totalNewEmployess = newEmployees.length;

          //totalPercentExitedEmployees
          const currentMonth = new Date().toISOString().substring(0, 7);
          const currentMonthArray = users.filter(
            (element) =>
              element.employment.termination_date && element.employment.termination_date.slice(0, 7) === currentMonth
          );
          const currentDate = new Date(currentMon);
          const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          const formattedLastMonthDate = lastMonth.toISOString().slice(0, 7);
          const lastMonthArray = users.filter(
            (element) =>
              element.employment.termination_date &&
              element.employment.termination_date.slice(0, 7) === formattedLastMonthDate
          );
          const totalPercentExitedEmp = ((currentMonthArray.length - lastMonthArray.length) / lastMonthArray.length) * 100;
          newObj.report.totalPercentExitedEmployees = totalPercentExitedEmp;

          //Document Expiry
          function checkExpiryAndUpdateReport(documentType, expiryDate, firstName, lastName) {
            const today = new Date(currentMon);
            const documentExpiry = new Date(expiryDate);
            if (documentExpiry < today) {
              let docTypeName = toLower(documentType);
              if (documentType === 'Emirates Id') {
                docTypeName = 'emiratesId';
              }
              newObj.report.expiryDocument[docTypeName] += 1;
              newObj.report.expiryDocument.information[docTypeName].push({
                first_name: firstName,
                last_name: lastName,
                document: documentType,
                date: expiryDate,
              });
            }
          }

          users.forEach((user) => {
            checkExpiryAndUpdateReport('Passport', user.documents.passport_expiry, user.first_name, user.last_name);
            checkExpiryAndUpdateReport('Emirates Id', user.documents.emiratesID_expiry, user.first_name, user.last_name);
            checkExpiryAndUpdateReport('Visa', user.documents.visa_expiry, user.first_name, user.last_name);
            checkExpiryAndUpdateReport('Insurance', user.documents.insurance_expiry, user.first_name, user.last_name);
          });

          const pendingClaims = requests.filter(
            (request) => toLower(request.status) === 'processing' && request.request_type === 'claims'
          );
          newObj.report.pendingRequest.claims = pendingClaims.length;

          const pendingLetters = requests.filter(
            (request) => toLower(request.status) === 'processing' && request.request_type === 'letters'
          );
          newObj.report.pendingRequest.letters = pendingLetters.length;

          const pendingAttendance = requests.filter(
            (request) => toLower(request.status) === 'processing' && request.request_type === 'attendance'
          );
          newObj.report.pendingRequest.attendance = pendingAttendance.length;

          const pendingLeaves = leaves.filter(
            (leave) =>
              toLower(leave.status) === 'processing' &&
              (leave.leave_type === 'Annual Leave' || leave.leave_type === 'Medical Leave')
          );
          newObj.report.pendingRequest.leave = pendingLeaves.length;

          const pendingWFH = wfh.filter((request) => toLower(request.status) === 'processing');
          newObj.report.pendingRequest.wfh = pendingWFH.length;

          //Turnover Rate
          const searchDurationSliced = newObj.dateCreated.toISOString().slice(0, 7);
          const [year, month] = searchDurationSliced.split('-');
          const searchYear = year;
          const searchMonth = (parseInt(month) - 1).toString().padStart(2, '0');
          const filteredData = reportCollection.filter((obj) => {
            const objYear = new Date(obj.dateCreated).getFullYear().toString();
            const objMonth = (new Date(obj.dateCreated).getMonth() + 1).toString().padStart(2, '0');
            return objYear === searchYear && objMonth === searchMonth;
          });

          const turnoverStartTime = filteredData[0].report.totalEmployees;
          const turnoverTotalLeavers = newObj.report.totalExitedEmployeesLength;
          const turnoverEndTime = newObj.report.totalEmployees;
          const sum = (turnoverTotalLeavers / (turnoverStartTime + turnoverEndTime) / 2) * 100;
          newObj.report.turnoverRate = sum.toFixed(2);

          //finding Turnover Rate from previous month and this month and get percentage
          const previousMonthTurnOver = filteredData[0].report.turnoverRate;
          const thisMonthTurnOver = newObj.report.turnoverRate;
          const totalPercentageTurnOverRate = ((thisMonthTurnOver - previousMonthTurnOver) / previousMonthTurnOver) * 100;
          newObj.report.totalPercentageTurnOverRate = totalPercentageTurnOverRate.toFixed(2);

          return res
            .status(200)
            .json({ success: true, message: 'Success, And Created New Monthly report for this month', data: [newObj] });
        } else {
          return res.status(200).json({ success: false, message: 'There is no report for this month or year.', data: [] });
        }
      }
    }
  } catch (err) {
    console.log('#ERROR LOG - ', err);
    res.json({ message: err.message });
  }
});

router.get('/get-monthly-report/:_current_month', async (req, res) => {
  try {
    const currentMon = req.params._current_month.toString();
    const reportCollection = await monthlyReportModel.find();

    if (reportCollection.length > 0) {
      const [year, month] = currentMon.split('-');
      const result = reportCollection.filter((obj) => {
        const objYear = obj.dateCreated.toISOString().substring(0, 4);
        const objMonth = obj.dateCreated.toISOString().substring(5, 7);
        return objYear === year && objMonth === month;
      });
      //This below if condition will look for the record based on the params month in 'monthly reports collection' and return 'result'
      if (result.length > 0) {
        return res
          .status(200)
          .json({ success: true, message: 'Success and Record is available with this month', data: result });
      } else {
        //This if condition will generate new reports for the current month and return the reports but won't save in the 'monthly report collection'

        const paramsDate = new Date(currentMon);
        const paramsDateSliced = paramsDate.toISOString().slice(5, 7);
        const paramsMonth = paramsDate.toLocaleString('default', { month: 'long' });
        const paramsYear = paramsDate.getFullYear(); // returns 2022

        const today = new Date();
        const todaySliced = today.toISOString().slice(5, 7);
        const currentMonth = today.toLocaleString('default', { month: 'long' });
        const currentYear = today.getFullYear();

        if (paramsMonth === currentMonth && paramsYear === currentYear) {
          const users = await usersModel.find();
          const config = await configModel.find();
          const requests = await requestsModel.find();
          const leaves = await leavesModel.find();
          const wfh = await wfhModel.find();

          let newObj = {
            report: {
              expiryDocument: {
                passport: 0,
                emiratesId: 0,
                visa: 0,
                insurance: 0,
                information: {
                  passport: [],
                  emiratesId: [],
                  visa: [],
                  insurance: [],
                },
              },
              pendingRequest: {
                claims: 0,
                letters: 0,
                leave: 0,
                attendance: 0,
                wfh: 0,
              },
              allDepartment: [],
            },
            dateCreated: new Date(),
          };

          //Department Distribution
          newObj.report.totalEmployees = users.filter((a) => a.user_status == 'Active' || a.user_status == 'Hold').length;
          newObj.report.totalMaleEmployees = users.filter(
            (a) => a.personal.gender == 'Male' && (a.user_status == 'Active' || a.user_status == 'Hold')
          ).length;
          (newObj.report.totalFemaleEmployees = users.filter(
            (a) => a.personal.gender == 'Female' && (a.user_status == 'Active' || a.user_status == 'Hold')
          ).length),
            (newObj.report.totalMaleEmployeesInPercentage = (
              (users.filter((a) => a.personal.gender == 'Male' && (a.user_status == 'Active' || a.user_status == 'Hold'))
                .length *
                100) /
              users.filter((a) => a.user_status == 'Active' || a.user_status == 'Hold').length
            ).toFixed(2));
          newObj.report.totalFemaleEmployeesInPercentage = (
            (users.filter((a) => a.personal.gender == 'Female' && (a.user_status == 'Active' || a.user_status == 'Hold'))
              .length *
              100) /
            users.filter((a) => a.user_status == 'Active' || a.user_status == 'Hold').length
          ).toFixed(2);

          //allDepartments
          for (let index = 0; index < config[0].dept.length; index++) {
            newObj.report.allDepartment.push({
              name: config[0].dept[index].name,
              male: users.filter((a) => a.reporting.department == config[0].dept[index].name && a.personal.gender == 'Male')
                .length,
              female: users.filter(
                (a) => a.reporting.department == config[0].dept[index].name && a.personal.gender == 'Female'
              ).length,
            });
          }

          //Add Average Turnover Rate
          let startDate = '';
          let endDate = '';
          let totalMonthDot = '';
          let totalMonths = '';
          let result = '';
          let avgContractTenure = 0;
          for (let index = 0; index < config[0].dept.length; index++) {
            let totalCount = 0;
            let eachCount = 0;
            users.forEach((element) => {
              if (element.reporting.department == config[0].dept[index].name) {
                if (
                  element.date_of_joining != '' &&
                  element.date_of_joining != undefined &&
                  (element.employment.termination_date == '' || element.employment.termination_date == undefined)
                ) {
                  startDate = element.date_of_joining.toString().slice(0, 7);
                } else if (
                  element.date_of_joining != '' &&
                  element.date_of_joining != undefined &&
                  element.employment.termination_date != '' &&
                  element.employment.termination_date != undefined
                ) {
                  endDate = element.employment.termination_date.toString().slice(0, 7);
                }
                const doj = startDate;
                const today = new Date().toISOString().substr(0, 7);
                const dojDate = new Date(doj);
                const todayDate = new Date(today);
                totalMonths =
                  (todayDate.getFullYear() - dojDate.getFullYear()) * 12 + (todayDate.getMonth() - dojDate.getMonth());

                const date1 = new Date(startDate);
                const date2 = new Date(endDate);

                totalMonthDot = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());

                if (isNaN(totalMonthDot)) {
                  totalMonthDot = 0;
                } else if (isNaN(totalMonths)) {
                  totalMonths = 0;
                }

                result = totalMonths + totalMonthDot;
                totalCount++;
                eachCount += result;
                avgContractTenure = eachCount / totalCount;
                if (newObj.report.allDepartment.map((a) => a.name == config[0].dept[index].name)) {
                  newObj.report.allDepartment.filter((a) => a.name == config[0].dept[index].name)[0].avgContractTenure =
                    avgContractTenure.toFixed(2);
                }
              }
            });
            startDate = '';
            endDate = '';
            eachCount = 0;
            avgContractTenure = 0;
          }

          //Month Wise Terminated Employees
          let arr = [];
          for (let i = 0; i < users.length; i++) {
            const element = users[i];
            if (element.employment.termination_date != '' && element.employment.termination_date != undefined) {
              let today = new Date().toISOString().substr(0, 7);
              if (element.employment.termination_date.slice(0, 7) == today.toString()) {
                arr.push(element);
              }
            }
          }
          newObj.report.totalExitedEmployeesLength = arr.length;

          //New Employees
          let arr1 = [];
          for (let i = 0; i < users.length; i++) {
            const element = users[i];
            if (element.date_of_joining != '' && element.date_of_joining != undefined) {
              let today = new Date().toISOString().substr(0, 7);
              if (element.date_of_joining.slice(0, 7) == today.toString()) {
                arr1.push(element);
              }
            }
          }
          newObj.report.totalNewEmployess = arr1.length;

          //totalPercentExitedEmployees
          let currentMonthArray = [];
          for (let i = 0; i < users.length; i++) {
            const element = users[i];
            if (element.employment.termination_date != '' && element.employment.termination_date != undefined) {
              let currentMonth = new Date(currentMon).toISOString().substr(0, 7);
              if (element.employment.termination_date.slice(0, 7) == currentMonth.toString()) {
                currentMonthArray.push(element);
              }
            }
          }

          let lastMonthArray = [];
          let formattedLastMonthDate = '';
          const currentDate = new Date(currentMon);
          const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          formattedLastMonthDate = lastMonth.toISOString().slice(0, 7);
          for (let i = 0; i < users.length; i++) {
            const element = users[i];
            if (element.employment.termination_date != '' && element.employment.termination_date != undefined) {
              if (element.employment.termination_date.slice(0, 7) == formattedLastMonthDate.toString()) {
                lastMonthArray.push(element);
              }
            }
          }

          const totalPercentExitedEmp = ((currentMonthArray.length - lastMonthArray.length) / lastMonthArray.length) * 100;
          newObj.report.totalPercentExitedEmployees = totalPercentExitedEmp;

          //Document Expiry
          for (let index = 0; index < users.length; index++) {
            let today = new Date(currentMon);
            let passportExpiry = new Date(users[index].documents.passport_expiry);

            if (passportExpiry < today) {
              newObj.report.expiryDocument.passport += 1;
              newObj.report.expiryDocument.information.passport.push({
                first_name: users[index].first_name,
                last_name: users[index].last_name,
                document: 'Passport',
                date: users[index].documents.passport_expiry,
              });
            }

            let emiratesIdExpiry = new Date(users[index].documents.emiratesID_expiry);
            if (emiratesIdExpiry < today) {
              newObj.report.expiryDocument.emiratesId += 1;
              newObj.report.expiryDocument.information.emiratesId.push({
                first_name: users[index].first_name,
                last_name: users[index].last_name,
                document: 'Emirates Id',
                date: users[index].documents.emiratesID_expiry,
              });
            }

            let visaExpiry = new Date(users[index].documents.visa_expiry);
            if (visaExpiry < today) {
              newObj.report.expiryDocument.visa += 1;
              newObj.report.expiryDocument.information.visa.push({
                first_name: users[index].first_name,
                last_name: users[index].last_name,
                document: 'Visa',
                date: users[index].documents.visa_expiry,
              });
            }

            let insuranceExpiry = new Date(users[index].documents.insurance_expiry);
            if (insuranceExpiry < today) {
              newObj.report.expiryDocument.insurance += 1;
              newObj.report.expiryDocument.information.insurance.push({
                first_name: users[index].first_name,
                last_name: users[index].last_name,
                document: 'Insurance',
                date: users[index].documents.insurance_expiry,
              });
            }
          }

          for (index = 0; index < requests.length; index++) {
            if (
              (requests[index].status == 'Processing' || requests[index].status == 'processing') &&
              requests[index].request_type == 'claims'
            ) {
              newObj.report.pendingRequest.claims += 1;
            }
            if (
              (requests[index].status == 'Processing' || requests[index].status == 'processing') &&
              requests[index].request_type == 'letters'
            ) {
              newObj.report.pendingRequest.letters += 1;
            }
            if (
              (requests[index].status == 'Processing' || requests[index].status == 'processing') &&
              requests[index].request_type == 'attendance'
            ) {
              newObj.report.pendingRequest.attendance += 1;
            }
          }
          for (index = 0; index < leaves.length; index++) {
            if (
              (leaves[index].status == 'Processing' || leaves[index].status == 'processing') &&
              (leaves[index].leave_type == 'Annual Leave' || leaves[index].leave_type == 'Medical Leave')
            ) {
              newObj.report.pendingRequest.leave += 1;
            }
          }
          for (index = 0; index < wfh.length; index++) {
            if (wfh[index].status == 'Processing' || wfh[index].status == 'processing') {
              newObj.report.pendingRequest.wfh += 1;
            }
          }

          //Turnover Rate
          const searchDurationSliced = newObj.dateCreated.toISOString().slice(0, 7);
          const [year, month] = searchDurationSliced.split('-');
          const searchYear = year;
          const searchMonth = (parseInt(month) - 1).toString().padStart(2, '0');
          const filteredData = reportCollection.filter((obj) => {
            const objYear = new Date(obj.dateCreated).getFullYear().toString();
            const objMonth = (new Date(obj.dateCreated).getMonth() + 1).toString().padStart(2, '0');
            return objYear === searchYear && objMonth === searchMonth;
          });

          const turnoverStartTime = filteredData[0].report.totalEmployees;
          const turnoverTotalLeavers = newObj.report.totalExitedEmployeesLength;
          const turnoverEndTime = newObj.report.totalEmployees;
          const sum = (turnoverTotalLeavers / (turnoverStartTime + turnoverEndTime) / 2) * 100;
          newObj.report.turnoverRate = sum.toFixed(2);

          //finding Turnover Rate from previous month and this month and get percentage
          const previousMonthTurnOver = filteredData[0].report.turnoverRate;
          const thisMonthTurnOver = newObj.report.turnoverRate;
          const totalPercentageTurnOverRate = ((thisMonthTurnOver - previousMonthTurnOver) / previousMonthTurnOver) * 100;
          newObj.report.totalPercentageTurnOverRate = totalPercentageTurnOverRate.toFixed(2);

          return res
            .status(200)
            .json({ success: true, message: 'Success, And Created New Monthly report for this month', data: [newObj] });
        } else {
          return res.status(200).json({ success: false, message: 'There is no report for this month or year.', data: [] });
        }
      }
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post('/get-filtered-report', validateToken, async (req, res) => {
  try {
    console.log(req.body);
    const { type, sort = ['first_name', 1], ...rest } = req.body;
    if (!rest.date_range) throw new Error('Date range is required');
    let data = [];

    if (sort && !Array.isArray(sort)) throw Error('Sort is an array. Try [<user fieldname>, <1 or 0>]');
    const sortBy = querySort(sort);

    switch (type) {
      case 'New Joiner Report':
        data = await newJoiner(rest, sortBy);
        break;
      case 'Leaver Report':
        data = await leaver(rest, sortBy);
        break;
      case 'Absence Report':
        data = await absence(rest, sortBy);
        break;
      case 'Overtime Report':
        data = await overtime(rest, sortBy);
        break;
      case 'Attendance Report':
        data = await attendance(rest, sortBy);
        break;
      case 'Voluntary & Involuntary Leave Report':
        data = await voluntaryInvoluntaryLeave(rest, sortBy);
        break;
      case 'Leave Report':
        data = await leave(rest, sortBy);
        break;
      case 'Claims Reimbursement Report':
        data = await claimsReimbursement(rest, sortBy);
        break;
      case 'Employee Letters Report':
        data = await employeeLetters(rest, sortBy);
        break;
      case 'WFH Report':
        data = await wfh(rest, sortBy);
        break;
      case 'Employee Information Report':
        data = await employeeInformation(rest, sortBy);
        break;
      case 'Salary Adjustments Report':
        data = await salaryAdjustments(rest, sortBy);
        break;
      case 'Pending Requests Report (Employee-wise)':
        data = await requestsEmployee('Processing', rest, sortBy);
        break;
      case 'Pending Requests Report (Department-wise)':
        data = await requestsDepartment('Processing', rest, sortBy);
        break;
      case 'Approved & Rejected Requests Report (Employee-wise)':
        data = await approvedRejectedRequestEmployee(rest, sortBy);
        break;
      case 'Approved & Rejected Requests Report (Department-wise)':
        data = await approvedRejectedRequestDepartment(rest, sortBy);
        break;
      default:
        throw new Error('Invalid report type');
    }

    res.send({ message: 'Successfull get all reports', total: data.length, data });
  } catch (err) {
    res.status(400);
    res.send({ message: err.message, err });
  }
});

function querySort(sort) {
  const sortField = sort[0];
  let sortBy = sort[1];

  if (/^(ascending|asc|1|true)$/i.test(sortBy)) sortBy = 1;
  else sortBy = 0;

  return { [sortField]: sortBy };
}

function rootFilter(query) {
  const filters = {};
  Object.entries(query.filter).map((item) => {
    let key = item[0];
    const value = item[1];

    // date range -- array value
    if (Array.isArray(value) && value?.length === 2) {
      if (value[0] && value[1]) filters[key] = { $gte: value[0], $lte: value[1] };
      else if (value[0]) filters[key] = { $gte: value[0] };
      else if (value[1]) filters[key] = { $lte: value[1] };
    }
    // filter user IDs
    else if (key === '_id') {
      let userIds = value;
      if (!Array.isArray(userIds)) {
        if (userIds.includes(',')) userIds = userIds.split(',');
        else userIds = [userIds];
      }

      filters[key] = { $in: userIds.map((sub) => ObjectId(sub)) };
    } else if (key === 'user_status' && value)
      filters[key] = { $regex: new RegExp(`^${value}`, 'i') }; // user status case insensitive
    else if (!Array.isArray(value) && value) filters[key] = value; // users collection filter
  });

  const date_range =
    query.date_range[0] && query.date_range[1] ? { $gte: query.date_range[0], $lte: query.date_range[1] } : null;

  return { ...filters, date_range };
}

function groupArrayByKey(arr, key) {
  return arr.reduce((result, obj) => {
    const keyValue = obj[key];
    if (!result[keyValue]) result[keyValue] = [];
    result[keyValue].push(obj);
    return result;
  }, {});
}

function countOccurrences(legend, values) {
  const result = values.filter((val) => legend.includes(val)).length;
  return result;
}

async function newJoiner(body, sortBy) {
  const filters = rootFilter(body);
  if (filters.date_range) {
    filters.date_of_joining = filters.date_range;
    delete filters.date_range;
  }

  return await usersModel.aggregate([
    { $match: { ...filters } },
    {
      $lookup: {
        from: 'companies',
        let: {
          companyId: { $cond: { if: { $ne: ['$company_id', ''] }, then: { $toObjectId: '$company_id' }, else: null } },
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              managerId: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        employment: 1,
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        department: '$reporting.department',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        reporting: {
          type: '$reporting.type',
          department: '$reporting.department',
          team: '$reporting.team',
          manager: '$reporting.manager',
        },
        manager: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function leaver(body, sortBy) {
  const filters = rootFilter(body);
  if (filters.date_range) {
    filters['employment.termination_date'] = filters.date_range;
    delete filters.date_range;
  }

  return await usersModel.aggregate([
    { $match: { ...filters } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        employment: 1,
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        last_unsuccessful_login_time: 1,
        personal: {
          gender: '$personal.gender',
          designation: '$personal.designation',
          date_of_joining: '$personal.date_of_joining',
          ext: '$personal.ext',
          cost_center: '$personal.cost_center',
          work_schedule: '$personal.work_schedule',
        },
        department: '$reporting.department',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        reporting: {
          type: '$reporting.type',
          department: '$reporting.department',
          team: '$reporting.team',
          manager: '$reporting.manager',
        },
        manager: 1,
        exit_type: '$employment.exit_type',
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function absence(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'attendances',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$remarks', 'Absent'] }, 0] },
                  {
                    $and: [
                      { $gte: ['$date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'attendances_details',
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: {
          companyId: { $cond: { if: { $ne: ['$company_id', ''] }, then: { $toObjectId: '$company_id' }, else: null } },
        },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    { $match: { attendances_details: { $ne: [] } } },
    {
      $addFields: {
        attendance: {
          $map: {
            input: '$attendances_details',
            as: 'attendance',
            in: {
              id: '$$attendance._id',
              date: '$$attendance.date',
              startTime: '$$attendance.startTime',
              endTime: '$$attendance.endTime',
            },
          },
        },
      },
    },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        attendance: 1,
        department: '$reporting.department',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        reporting: {
          type: '$reporting.type',
          department: '$reporting.department',
          team: '$reporting.team',
          manager: '$reporting.manager',
        },
        manager: 1,
        work_schedule: '$personal.work_schedule',
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function overtime(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'attendances',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  { $ne: [{ $strcasecmp: ['$remarks', 'Absent'] }, 0] },
                  {
                    $and: [
                      { $gte: ['$date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$date', { $toDate: body.date_range[1] }] },
                      {
                        $gte: [
                          {
                            $divide: [
                              // computes consumed time
                              { $subtract: [{ $toDate: { $max: '$endTime' } }, { $toDate: { $min: '$startTime' } }] },
                              1000 * 60 * 60,
                            ],
                          },
                          9,
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'attendances_details',
      },
    },
    { $match: { attendances_details: { $ne: [] } } },
    {
      $addFields: {
        attendance: {
          $map: {
            input: '$attendances_details',
            as: 'attendance',
            in: {
              id: '$$attendance._id',
              date: '$$attendance.date',
              startTime: '$$attendance.startTime',
              endTime: '$$attendance.endTime',
              overTime: {
                $subtract: [
                  {
                    $divide: [
                      // computes consumed time
                      {
                        $subtract: [
                          { $toDate: { $max: '$$attendance.endTime' } },
                          { $toDate: { $min: '$$attendance.startTime' } },
                        ],
                      },
                      1000 * 60 * 60,
                    ],
                  },
                  9,
                ],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        attendance: 1,
        department: '$reporting.department',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        reporting: {
          type: '$reporting.type',
          department: '$reporting.department',
          team: '$reporting.team',
          manager: '$reporting.manager',
        },
        manager: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function attendance(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'attendances',
        let: { userId: { $toString: '$_id' } },
        as: 'attendances_details',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  {
                    $and: [
                      {
                        $gte: [
                          {
                            $cond: {
                              if: { $eq: [{ $type: '$date' }, 'string'] }, // Check if $date is a string
                              then: { $dateFromString: { dateString: '$date' } }, // Convert to date if it is a string
                              else: '$date', // If already a date, use the date directly
                            },
                          },
                          { $toDate: body.date_range[0] },
                        ],
                      },
                      {
                        $lte: [
                          {
                            $cond: {
                              if: { $eq: [{ $type: '$date' }, 'string'] }, // Check if $date is a string
                              then: { $dateFromString: { dateString: '$date' } }, // Convert to date if it is a string
                              else: '$date', // If already a date, use the date directly
                            },
                          },
                          { $toDate: body.date_range[1] },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            $facet: {
              total_attendance: [{ $group: { _id: null, count: { $sum: 1 } } }],
              total_absent: [
                {
                  $match: {
                    $expr: { $eq: [{ $strcasecmp: ['$remarks', 'Absent'] }, 0] },
                  },
                },
                { $group: { _id: null, count: { $sum: 1 } } },
              ],
              total_weekend: [
                {
                  $match: {
                    $expr: { $eq: [{ $strcasecmp: ['$remarks', 'Weekend'] }, 0] },
                  },
                },
                { $group: { _id: null, count: { $sum: 1 } } },
              ],
              total_present: [
                {
                  $match: {
                    $expr: { $and: [{ $ne: ['$startTime', null] }, { $ne: ['$endTime', null] }] },
                  },
                },
                { $group: { _id: null, count: { $sum: 1 } } },
              ],
              total_required: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: [{ $strcasecmp: ['$remarks', 'Weekend'] }, 0] },
                        { $ne: [{ $strcasecmp: ['$remarks', 'On Leave'] }, 0] },
                      ],
                    },
                  },
                },
                { $group: { _id: null, count: { $sum: 1 } } },
              ],
              attendances: [],
            },
          },
          {
            $project: {
              total_absent: { $arrayElemAt: ['$total_absent.count', 0] },
              total_weekend: { $arrayElemAt: ['$total_weekend.count', 0] },
              total_attendance: { $arrayElemAt: ['$total_attendance.count', 0] },
              total_present: { $arrayElemAt: ['$total_present.count', 0] },
              total_required: { $arrayElemAt: ['$total_required.count', 0] },
              attendances: '$attendances',
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        as: 'leaves_details',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $facet: {
              leaves_other_count: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: [{ $strcasecmp: ['$leave_type', 'Sick Leave'] }, 0] },
                        { $ne: [{ $strcasecmp: ['$leave_type', 'Annual Leave'] }, 0] },
                        { $ne: [{ $strcasecmp: ['$leave_type', 'Sick Leaves'] }, 0] },
                        { $ne: [{ $strcasecmp: ['$leave_type', 'Annual Leaves'] }, 0] },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              total_annual_leave: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Annual'] }, 0] },
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Annual Leaves'] }, 0] },
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Annual Leave'] }, 0] },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              total_sick_leave: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Sick'] }, 0] },
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Sick Leaves'] }, 0] },
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Sick Leave'] }, 0] },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              total_medical_leave: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Medical'] }, 0] },
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Medical Leaves'] }, 0] },
                        { $eq: [{ $strcasecmp: ['$leave_type', 'Medical Leave'] }, 0] },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              total_leaves: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
            },
          },
          {
            $project: {
              leaves_other_count: { $arrayElemAt: ['$leaves_other_count.count', 0] },
              total_annual_leave: { $arrayElemAt: ['$total_annual_leave.count', 0] },
              total_sick_leave: { $arrayElemAt: ['$total_sick_leave.count', 0] },
              total_medical_leave: { $arrayElemAt: ['$total_medical_leave.count', 0] },
              total_leaves: { $arrayElemAt: ['$total_leaves.count', 0] },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        attendances: {
          $map: {
            input: { $arrayElemAt: ['$attendances_details.attendances', 0] },
            as: 'attendance_details',
            in: {
              id: '$$attendance_details._id',
              date: '$$attendance_details.date',
              clockInDate: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', ''] },
                      { $eq: ['$$attendance_details.startTime', null] },
                    ],
                  },
                  then: null,
                  else: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$$attendance_details.startTime' } } },
                },
              },
              clockInDay: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', null] },
                      { $eq: ['$$attendance_details.startTime', ''] },
                    ],
                  },
                  then: null,
                  else: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              1,
                            ],
                          },
                          then: 'Sunday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              2,
                            ],
                          },
                          then: 'Monday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              3,
                            ],
                          },
                          then: 'Tuesday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              4,
                            ],
                          },
                          then: 'Wednesday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              5,
                            ],
                          },
                          then: 'Thursday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              6,
                            ],
                          },
                          then: 'Friday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.startTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.startTime' } },
                                    else: '$$attendance_details.startTime',
                                  },
                                },
                              },
                              7,
                            ],
                          },
                          then: 'Saturday',
                        },
                      ],
                      default: '$$attendance_details.startTime',
                    },
                  },
                },
              },
              clockInTime: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', ''] },
                      { $eq: ['$$attendance_details.startTime', null] },
                    ],
                  },
                  then: null,
                  else: { $dateToString: { format: '%H:%M:%S', date: { $toDate: '$$attendance_details.startTime' } } },
                },
              },
              startTime: '$$attendance_details.startTime',
              in_latitude: '$$attendance_details.in_latitude',
              in_longitude: '$$attendance_details.in_longitude',
              in_address: '$$attendance_details.in_address',
              out_address: '$$attendance_details.out_address',
              clockOutDate: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$$attendance_details.endTime', ''] }, { $eq: ['$$attendance_details.endTime', null] }],
                  },
                  then: null,
                  else: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$$attendance_details.endTime' } } },
                },
              },
              clockOutDay: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$$attendance_details.endTime', null] }, { $eq: ['$$attendance_details.endTime', ''] }],
                  },
                  then: null,
                  else: {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              1,
                            ],
                          },
                          then: 'Sunday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              2,
                            ],
                          },
                          then: 'Monday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              3,
                            ],
                          },
                          then: 'Tuesday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              4,
                            ],
                          },
                          then: 'Wednesday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              5,
                            ],
                          },
                          then: 'Thursday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              6,
                            ],
                          },
                          then: 'Friday',
                        },
                        {
                          case: {
                            $eq: [
                              {
                                $dayOfWeek: {
                                  $cond: {
                                    if: { $eq: [{ $type: '$$attendance_details.endTime' }, 'string'] },
                                    then: { $dateFromString: { dateString: '$$attendance_details.endTime' } },
                                    else: '$$attendance_details.endTime',
                                  },
                                },
                              },
                              7,
                            ],
                          },
                          then: 'Saturday',
                        },
                      ],
                      default: '$$attendance_details.endTime',
                    },
                  },
                },
              },
              clockOutTime: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$$attendance_details.endTime', ''] }, { $eq: ['$$attendance_details.endTime', null] }],
                  },
                  then: null,
                  else: { $dateToString: { format: '%H:%M:%S', date: { $toDate: '$$attendance_details.endTime' } } },
                },
              },
              endTime: '$$attendance_details.endTime',
              out_latitude: '$$attendance_details.out_latitude',
              out_longitude: '$$attendance_details.out_longitude',
              late: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', null] },
                      { $eq: ['$$attendance_details.startTime', ''] },
                    ],
                  },
                  '00:00',
                  {
                    $let: {
                      vars: {
                        timeDiff: {
                          $subtract: [9, { $hour: { $toDate: '$$attendance_details.startTime' } }],
                        },
                      },
                      in: {
                        $cond: [
                          { $lt: ['$$timeDiff', 0] },
                          {
                            $concat: [
                              { $toString: { $abs: '$$timeDiff' } },
                              ':',
                              { $toString: { $minute: { $toDate: '$$attendance_details.startTime' } } },
                              ':',
                              { $toString: { $second: { $toDate: '$$attendance_details.startTime' } } },
                            ],
                          },
                          '00:00',
                        ],
                      },
                    },
                  },
                ],
              },
              early: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', null] },
                      { $eq: ['$$attendance_details.startTime', ''] },
                    ],
                  },
                  '00:00',
                  {
                    $let: {
                      vars: {
                        timeDiff: {
                          $subtract: [9, { $hour: { $toDate: '$$attendance_details.startTime' } }],
                        },
                      },
                      in: {
                        $cond: [
                          { $gt: ['$$timeDiff', 0] },
                          {
                            $concat: [
                              { $toString: { $abs: '$$timeDiff' } },
                              ':',
                              { $toString: { $minute: { $toDate: '$$attendance_details.startTime' } } },
                              ':',
                              { $toString: { $second: { $toDate: '$$attendance_details.startTime' } } },
                            ],
                          },
                          '00:00:00',
                        ],
                      },
                    },
                  },
                ],
              },
              totalHours: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', null] },
                      { $eq: ['$$attendance_details.startTime', ''] },
                      { $eq: ['$$attendance_details.endTime', null] },
                      { $eq: ['$$attendance_details.endTime', ''] },
                    ],
                  },
                  null,
                  {
                    $divide: [
                      // computes consumed time
                      {
                        $subtract: [
                          { $toDate: { $max: '$$attendance_details.endTime' } },
                          { $toDate: { $min: '$$attendance_details.startTime' } },
                        ],
                      },
                      1000 * 60 * 60,
                    ],
                  },
                ],
              },
              otHours: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$$attendance_details.startTime', null] },
                      { $eq: ['$$attendance_details.startTime', ''] },
                      { $eq: ['$$attendance_details.endTime', null] },
                      { $eq: ['$$attendance_details.endTime', ''] },
                    ],
                  },
                  null,
                  {
                    $subtract: [
                      {
                        $divide: [
                          // computes consumed time minus regular time
                          {
                            $subtract: [
                              { $toDate: { $max: '$$attendance_details.endTime' } },
                              { $toDate: { $min: '$$attendance_details.startTime' } },
                            ],
                          },
                          1000 * 60 * 60,
                        ],
                      },
                      9,
                    ],
                  },
                ],
              },
              is_auto_clock_out: '$$attendance_details.is_auto_clock_out',
              is_start_reminder: '$$attendance_details.is_start_reminder',
              is_end_reminder: '$$attendance_details.is_end_reminder',
              remarks: '$$attendance_details.remarks',
              attendance_type: {
                $cond: {
                  if: { $eq: ['$totalHours', null] },
                  then: '0',
                  else: {
                    $cond: {
                      if: { $gt: ['$totalHours', 7] },
                      then: '1',
                      else: {
                        $cond: {
                          if: { $and: [{ $gte: ['$totalHours', 5] }, { $lte: ['$totalHours', 7] }] },
                          then: '0.5',
                          else: '0',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        total_attendance: '$attendances_details.total_attendance',
        total_present: '$attendances_details.total_present',
        total_required: '$attendances_details.total_required',
        total_absent: '$attendances_details.total_absent',
        total_weekend: '$attendances_details.total_weekend',
        total_annual_leave: '$leaves_details.total_annual_leave',
        total_sick_leave: '$leaves_details.total_sick_leave',
        total_medical_leave: '$leaves_details.total_medical_leave',
        leaves_other_count: '$leaves_details.leaves_other_count',
        total_leaves: '$leaves_details.total_leaves',
      },
    },
    { $match: { attendances: { $ne: [] } } },
    {
      $lookup: {
        from: 'companies',
        let: {
          companyId: { $cond: { if: { $ne: ['$company_id', ''] }, then: { $toObjectId: '$company_id' }, else: null } },
        },
        as: 'company',
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        as: 'manager',
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        personal: {
          gender: '$personal.gender',
          designation: '$personal.designation',
          nationality: '$personal.nationality',
          date_of_joining: '$personal.date_of_joining',
          ext: '$personal.ext',
          work_schedule: '$personal.work_schedule',
          work_location: '$personal.work_location',
        },
        reporting: {
          team: '$reporting.team',
          department: '$reporting.department',
          type: '$reporting.type',
        },
        employment: {
          work_location: '$employment.work_location',
          work_schedule: '$employment.work_schedule',
        },
        designation: '$personal.designation',
        company_id: 1,
        company: 1,
        manager: 1,
        work_schedule: '$personal.work_schedule',
        attendances: 1,
        onDuty: '9:00:00',
        offDuty: '18:00:00',
        dutyHours: { $concat: [{ $toString: { $abs: { $subtract: [{ $toInt: '18' }, { $toInt: '9' }] } } }, ':00:00'] },
        total_present: {
          $ifNull: [{ $arrayElemAt: ['$total_present', 0] }, 0],
        },
        total_required: {
          $ifNull: [{ $arrayElemAt: ['$total_required', 0] }, 0],
        },
        total_attendance: {
          $ifNull: [{ $arrayElemAt: ['$total_attendance', 0] }, 0],
        },
        total_absent: {
          $ifNull: [{ $arrayElemAt: ['$total_absent', 0] }, 0],
        },
        total_weekend: {
          $ifNull: [{ $arrayElemAt: ['$total_weekend', 0] }, 0],
        },
        total_annual_leave: {
          $ifNull: [{ $arrayElemAt: ['$total_annual_leave', 0] }, 0],
        },
        total_sick_leave: {
          $ifNull: [{ $arrayElemAt: ['$total_sick_leave', 0] }, 0],
        },
        total_medical_leave: {
          $ifNull: [{ $arrayElemAt: ['$total_medical_leave', 0] }, 0],
        },
        total_other_leave: {
          $ifNull: [{ $arrayElemAt: ['$total_other_leave', 0] }, 0],
        },
        total_leaves: {
          $ifNull: [{ $arrayElemAt: ['$total_leaves', 0] }, 0],
        },
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function voluntaryInvoluntaryLeave(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;
  const voluntaryLeave = [
    'Annual Leave',
    'Comp Offs/Time in Lieu',
    'Hajj Leave',
    'Maternity Leave',
    'Parental Leave',
    'Paternal Leave',
    'Study Leave',
  ];
  const involuntaryLeave = ['Sick Leave', 'Unpaid Leave', 'Compassionate Leave'];

  const data = await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'companies_details',
      },
    },
    { $unwind: '$companies_details' },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'leaves_details',
      },
    },
    { $match: { leaves_details: { $ne: [] } } },
    {
      $project: {
        department: '$reporting.department',
        company: '$companies_details',
        leaves: '$leaves_details.leave_type',
      },
    },
    { $sort: { ...sortBy } },
  ]);

  return data.reduce((acc, item) => {
    const { company, department, leaves } = item;
    let involuntaryLeavesCount = countOccurrences(voluntaryLeave, leaves);
    let voluntaryLeavesCount = countOccurrences(involuntaryLeave, leaves);

    const foundCompanyIndex = acc.findIndex(({ _id }) => _id.toString() === company._id.toString());
    if (foundCompanyIndex !== -1) {
      const foundCompany = acc[foundCompanyIndex];
      const foundDepartmentIndex = foundCompany.departments.findIndex((sub) => sub.department === department);
      if (foundDepartmentIndex !== -1) {
        const newInvoluntaryLeaves =
          acc[foundCompanyIndex].departments[foundDepartmentIndex].involuntary_leaves + involuntaryLeavesCount;
        const newVoluntaryLeaves =
          acc[foundCompanyIndex].departments[foundDepartmentIndex].voluntary_leaves + voluntaryLeavesCount;

        // add leaves
        acc[foundCompanyIndex].departments[foundDepartmentIndex].involuntary_leaves = newInvoluntaryLeaves;
        acc[foundCompanyIndex].departments[foundDepartmentIndex].voluntary_leaves = newVoluntaryLeaves;
        acc[foundCompanyIndex].departments[foundDepartmentIndex].total = newInvoluntaryLeaves + newVoluntaryLeaves;
      } else
        acc[foundCompanyIndex].departments.push({
          department,
          involuntary_leaves: involuntaryLeavesCount,
          voluntary_leaves: voluntaryLeavesCount,
          total: involuntaryLeavesCount + voluntaryLeavesCount,
        });

      return acc;
    }

    return [
      ...acc,
      {
        ...company,
        departments: [
          {
            department,
            involuntary_leaves: involuntaryLeavesCount,
            voluntary_leaves: voluntaryLeavesCount,
            total: involuntaryLeavesCount + voluntaryLeavesCount,
          },
        ],
      },
    ];
  }, []);
}

async function leave(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'leaves_details',
      },
    },
    { $match: { leaves_details: { $ne: [] } } },
    {
      $addFields: {
        leaves: {
          $map: {
            input: '$leaves_details',
            as: 'leaves',
            in: {
              id: '$$leaves._id',
              from_date: '$$leaves.from_date',
              to_date: '$$leaves.to_date',
              leave_type: '$$leaves.leave_type',
              status: '$$leaves.status',
              approvals: '$$leaves.approvals',
              no_of_days: '$$leaves.no_of_days',
              remaining_leaves: '$$leaves.remaining_leaves',
              reason: '$$leaves.reason',
              status: '$$leaves.status',
              approver_id: '$$leaves.approver_id',
              user_id: '$$leaves.user_id',
              date_created: '$$leaves.date_created',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        reporting: {
          team: '$reporting.team',
          department: '$reporting.department',
          type: '$reporting.type',
          manager: '$reporting.manager',
        },
        employment: {
          work_location: '$employment.work_location',
          work_schedule: '$employment.work_schedule',
        },
        leaves: 1,
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function claimsReimbursement(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'requests',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$request_type', 'claims'] }, 0] },
                  { $gte: ['$letter_fields.date', body.date_range[0]] },
                  { $lte: ['$letter_fields.date', body.date_range[1]] },
                ],
              },
            },
          },
        ],
        as: 'requests_details',
      },
    },
    { $match: { requests_details: { $ne: [] } } },
    {
      $addFields: {
        requests: {
          $map: {
            input: '$requests_details',
            as: 'requests',
            in: {
              id: '$$requests._id',
              letter_type: '$$requests.letter_type',
              letter_sub_type: '$$requests.letter_sub_type',
              status: '$$requests.status',
              letter_fields: '$$requests.letter_fields',
              letter_keys: '$$requests.letter_keys',
              approvals: '$$requests.approvals',
              appliction_log: '$$requests.appliction_log',
              request_type: '$$requests.request_type',
              payroll_process: '$$requests.payroll_process',
              payroll_auto_approved: '$$requests.payroll_auto_approved',
              status: '$$requests.status',
              assigned_to: '$$requests.assigned_to',
              user_id: '$$requests.user_id',
              company_id: '$$requests.company_id',
              date_created: '$$requests.date_created',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        requests: 1,
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
        reporting: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function employeeLetters(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'requests',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$request_type', 'letters'] }, 0] },
                  { $gte: ['$date_created', { $toDate: body.date_range[0] }] },
                  { $lte: ['$date_created', { $toDate: body.date_range[1] }] },
                ],
              },
            },
          },
        ],
        as: 'requests_details',
      },
    },
    { $match: { requests_details: { $ne: [] } } },
    {
      $addFields: {
        requests: {
          $map: {
            input: '$requests_details',
            as: 'requests',
            in: {
              id: '$$requests._id',
              letter_type: '$$requests.letter_type',
              letter_sub_type: '$$requests.letter_sub_type',
              status: '$$requests.status',
              date_created: '$$requests.date_created',
              approvals: '$$requests.approvals',
              payroll_process: '$$requests.payroll_process',
              payroll_auto_approved: '$$requests.payroll_auto_approved',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        requests: 1,
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
        reporting: {
          team: '$reporting.team',
          department: '$reporting.department',
          type: '$reporting.type',
          manager: '$reporting.manager',
        },
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function wfh(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'wfhs',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'wfhs_details',
      },
    },
    { $match: { wfhs_details: { $ne: [] } } },
    {
      $addFields: {
        wfhs: {
          $map: {
            input: '$wfhs_details',
            as: 'wfhs',
            in: {
              id: '$$wfhs._id',
              no_of_days: '$$wfhs.no_of_days',
              from_date: '$$wfhs.from_date',
              to_date: '$$wfhs.to_date',
              reason: '$$wfhs.reason',
              status: '$$wfhs.status',
              approvals: '$$wfhs.approvals',
              attachments: '$$wfhs.attachments',
              date_created: '$$wfhs.date_created',
              created_by_id: '$$wfhs.created_by_id',
              user_id: '$$wfhs.user_id',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        wfhs: 1,
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
        reporting: '$reporting',
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function employeeInformation(body, sortBy) {
  const filters = rootFilter(body);
  if (filters.date_range) filters.date_of_joining = filters.date_range;
  delete filters.date_range;

  return await usersModel.aggregate([
    { $match: { ...filters } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        as: 'manager',
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$manager',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
      },
    },
    {
      $project: {
        salary: 0,
        bank: 0,
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function salaryAdjustments(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  return await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'salaryadjustments',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$userId'] },
                  {
                    $and: [
                      { $gte: ['$effective_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$effective_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $addFields: {
              createdByObjectId: { $toObjectId: '$createdBy' },
              total_salary_before: {
                $sum: [
                  '$old_salary.basic_salary',
                  '$old_salary.total_fixed',
                  '$old_salary.adhoc_allowance',
                  '$old_salary.house_rent_allowance',
                  '$old_salary.miscellaneous_allowance',
                  '$old_salary.housing_allowance',
                  '$old_salary.transport_allowance',
                  '$old_salary.air_ticket_allowance',
                  '$old_salary.other_allowance',
                ],
              },
              total_salary_after: {
                $sum: [
                  '$new_salary.basic_salary',
                  '$new_salary.total_fixed',
                  '$new_salary.adhoc_allowance',
                  '$new_salary.house_rent_allowance',
                  '$new_salary.miscellaneous_allowance',
                  '$new_salary.housing_allowance',
                  '$new_salary.transport_allowance',
                  '$new_salary.air_ticket_allowance',
                  '$new_salary.other_allowance',
                ],
              },
            },
          },
          {
            $addFields: {
              total_salary_difference: { $subtract: ['$total_salary_after', '$total_salary_before'] },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'createdByObjectId',
              foreignField: '_id',
              as: 'created_by',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    first_name: 1,
                    middle_name: 1,
                    last_name: 1,
                    emp_id: 1,
                    email: 1,
                    user_status: 1,
                    role_ID: 1,
                    company_id: 1,
                    personal: 1,
                    reporting: 1,
                    date_of_joining: 1,
                    employment: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              createdByObjectId: 0, // Remove the temporary field
            },
          },
        ],
        as: 'salaryadjustments_details',
      },
    },
    { $match: { salaryadjustments_details: { $ne: [] } } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        salaryadjustments: '$salaryadjustments_details',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
        reporting: {
          team: '$reporting.team',
          department: '$reporting.department',
          type: '$reporting.type',
        },
      },
    },
    { $sort: { ...sortBy } },
  ]);
}

async function requestsEmployee(status, body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  const data = await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'requests',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$status', status] }, 0] },
                  { $gte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[0] }] },
                  { $lte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[1] }] },
                ],
              },
            },
          },
        ],
        as: 'requests_details',
      },
    },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$status', status] }, 0] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'leaves_details',
      },
    },
    {
      $lookup: {
        from: 'wfhs',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$status', status] }, 0] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'wfhs_details',
      },
    },
    {
      $addFields: {
        leaves_details: {
          $map: {
            input: '$leaves_details',
            as: 'leave',
            in: { $mergeObjects: ['$$leave', { request_type: 'leave' }] },
          },
        },
        wfhs_details: {
          $map: {
            input: '$wfhs_details',
            as: 'wfh',
            in: { $mergeObjects: ['$$wfh', { request_type: 'wfh' }] },
          },
        },
      },
    },
    { $match: { $or: [{ requests_details: { $ne: [] } }, { leaves_details: { $ne: [] } }, { wfhs_details: { $ne: [] } }] } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        reporting: {
          team: '$reporting.team',
          department: '$reporting.department',
          type: '$reporting.type',
        },
        designation: '$personal.designation',
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        leaves_details: 1,
        wfhs_details: 1,
        employment: 1,
        requests: '$requests_details',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);

  return data.reduce((acc, item) => {
    const { requests, leaves_details, wfhs_details, ...rest } = item;
    const mergedRequests = [...requests, ...leaves_details, ...wfhs_details];
    return [...acc, { ...rest, requests: groupArrayByKey(mergedRequests, 'request_type') }];
  }, []);
}

async function requestsDepartment(status, body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  const data = await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'companies_details',
      },
    },
    { $unwind: '$companies_details' },
    {
      $lookup: {
        from: 'requests',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$status', status] }, 0] },
                  {
                    $and: [
                      { $gte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[0] }] },
                      { $lte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'requests_details',
      },
    },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$status', status] }, 0] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'leaves_details',
      },
    },
    {
      $lookup: {
        from: 'wfhs',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  { $eq: [{ $strcasecmp: ['$status', status] }, 0] },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'wfhs_details',
      },
    },
    {
      $addFields: {
        leaves_details: {
          $map: {
            input: '$leaves_details',
            as: 'leave',
            in: {
              $mergeObjects: [
                // Use $mergeObjects to include existing fields along with the new field
                '$$leave',
                { request_type: 'leave' },
              ],
            },
          },
        },
        wfhs_details: {
          $map: {
            input: '$wfhs_details',
            as: 'wfh',
            in: { $mergeObjects: ['$$wfh', { request_type: 'wfh' }] },
          },
        },
      },
    },
    { $match: { $or: [{ requests_details: { $ne: [] } }, { leaves_details: { $ne: [] } }, { wfhs_details: { $ne: [] } }] } },
    {
      $project: {
        department: '$reporting.department',
        company: '$companies_details',
        requests: '$requests_details',
        leaves_details: 1,
        wfhs_details: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);

  return data.reduce((acc, item) => {
    const { company, department, requests, leaves_details, wfhs_details } = item;
    const mergedRequests = [...requests, ...leaves_details, ...wfhs_details];
    const request = Object.entries(groupArrayByKey(mergedRequests, 'request_type')).map(([key, value]) => {
      return { request_type: key, count: value.length };
    });

    const foundCompanyIndex = acc.findIndex(({ _id }) => _id.toString() === company._id.toString());
    if (foundCompanyIndex !== -1) {
      const foundCompany = acc[foundCompanyIndex];
      const foundDepartmentIndex = foundCompany.departments.findIndex((sub) => sub.department === department);
      if (foundDepartmentIndex !== -1) acc[foundCompanyIndex].departments[foundDepartmentIndex].requests = request;
      else acc[foundCompanyIndex].departments.push({ department, requests: [...request] });
      return acc;
    }

    return [
      ...acc,
      {
        ...company,
        departments: [
          {
            department,
            requests: request,
          },
        ],
      },
    ];
  }, []);
}

async function approvedRejectedRequestEmployee(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  const data = await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'requests',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  {
                    $or: [
                      { $eq: [{ $strcasecmp: ['$status', 'Completed'] }, 0] },
                      { $eq: [{ $strcasecmp: ['$status', 'Cancelled'] }, 0] },
                    ],
                  },
                  {
                    $and: [
                      { $gte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[0] }] },
                      { $lte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'requests_details',
      },
    },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  {
                    $or: [
                      { $eq: [{ $strcasecmp: ['$status', 'Completed'] }, 0] },
                      { $eq: [{ $strcasecmp: ['$status', 'Cancelled'] }, 0] },
                    ],
                  },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'leaves_details',
      },
    },
    {
      $lookup: {
        from: 'wfhs',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  {
                    $or: [
                      { $eq: [{ $strcasecmp: ['$status', 'Completed'] }, 0] },
                      { $eq: [{ $strcasecmp: ['$status', 'Cancelled'] }, 0] },
                    ],
                  },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'wfhs_details',
      },
    },
    {
      $addFields: {
        leaves_details: {
          $map: {
            input: '$leaves_details',
            as: 'leave',
            in: {
              $mergeObjects: [
                // Use $mergeObjects to include existing fields along with the new field
                '$$leave',
                { request_type: 'leave' },
              ],
            },
          },
        },
        wfhs_details: {
          $map: {
            input: '$wfhs_details',
            as: 'wfh',
            in: { $mergeObjects: ['$$wfh', { request_type: 'wfh' }] },
          },
        },
      },
    },
    { $match: { $or: [{ requests_details: { $ne: [] } }, { leaves_details: { $ne: [] } }, { wfhs_details: { $ne: [] } }] } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $lookup: {
        from: 'users',
        let: { managerId: '$reporting.manager' },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: '$_id' }, '$$managerId'] } } },
          {
            $project: {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              emp_id: 1,
              email: 1,
              user_status: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'manager',
      },
    },
    { $unwind: '$manager' },
    {
      $project: {
        id: 1,
        emp_id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        date_of_joining: 1,
        gender: '$personal.gender',
        nationality: '$personal.nationality',
        reporting: {
          team: '$reporting.team',
          department: '$reporting.department',
          type: '$reporting.type',
        },
        designation: '$personal.designation',
        probation_end_date: {
          $cond: {
            if: { $ne: ['$employment.probation_days', ''] },
            then: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: {
                  $dateAdd: {
                    startDate: { $dateFromString: { dateString: '$date_of_joining' } },
                    unit: 'day',
                    amount: { $toInt: '$employment.probation_days' },
                  },
                },
              },
            },
            else: null,
          },
        },
        employment: 1,
        requests: '$requests_details',
        leaves_details: 1,
        wfhs_details: 1,
        department: '$reporting.department',
        designation: '$personal.designation',
        team: '$reporting.team',
        company_name: '$company.company_name',
        company: 1,
        cost_center: '$personal.cost_center',
        employment_type: 1,
        contract_type: 1,
        manager: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);

  return data.reduce((acc, item) => {
    const { requests, leaves_details, wfhs_details, ...rest } = item;
    const mergedRequests = [...requests, ...leaves_details, ...wfhs_details];
    return [...acc, { ...rest, requests: groupArrayByKey(mergedRequests, 'request_type') }];
  }, []);
}

async function approvedRejectedRequestDepartment(body, sortBy) {
  const filters = rootFilter(body);
  const { date_range, ...rest } = filters;

  const data = await usersModel.aggregate([
    { $match: { ...rest } },
    {
      $lookup: {
        from: 'companies',
        let: { companyId: { $toObjectId: '$company_id' } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$companyId'] } } },
          {
            $project: {
              _id: 1,
              company_name: 1,
              company_email: 1,
              company_phone: 1,
              U_ID: 1,
              logo: 1,
              info: 1,
              createdDate: 1,
            },
          },
        ],
        as: 'companies_details',
      },
    },
    { $unwind: '$companies_details' },
    {
      $lookup: {
        from: 'requests',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  {
                    $or: [
                      { $eq: [{ $strcasecmp: ['$status', 'Completed'] }, 0] },
                      { $eq: [{ $strcasecmp: ['$status', 'Cancelled'] }, 0] },
                    ],
                  },
                  {
                    $and: [
                      { $gte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[0] }] },
                      { $lte: [{ $toDate: '$letter_fields.date' }, { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'requests_details',
      },
    },
    {
      $lookup: {
        from: 'leaves',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  {
                    $or: [
                      { $eq: [{ $strcasecmp: ['$status', 'Completed'] }, 0] },
                      { $eq: [{ $strcasecmp: ['$status', 'Cancelled'] }, 0] },
                    ],
                  },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'leaves_details',
      },
    },
    {
      $lookup: {
        from: 'wfhs',
        let: { userId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$user_id' }, '$$userId'] },
                  {
                    $or: [
                      { $eq: [{ $strcasecmp: ['$status', 'Completed'] }, 0] },
                      { $eq: [{ $strcasecmp: ['$status', 'Cancelled'] }, 0] },
                    ],
                  },
                  {
                    $and: [
                      { $gte: ['$from_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$from_date', { $toDate: body.date_range[1] }] },
                      { $gte: ['$to_date', { $toDate: body.date_range[0] }] },
                      { $lte: ['$to_date', { $toDate: body.date_range[1] }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'wfhs_details',
      },
    },
    {
      $addFields: {
        leaves_details: {
          $map: {
            input: '$leaves_details',
            as: 'leave',
            in: {
              $mergeObjects: [
                // Use $mergeObjects to include existing fields along with the new field
                '$$leave',
                { request_type: 'leave' },
              ],
            },
          },
        },
        wfhs_details: {
          $map: {
            input: '$wfhs_details',
            as: 'wfh',
            in: { $mergeObjects: ['$$wfh', { request_type: 'wfh' }] },
          },
        },
      },
    },
    { $match: { $or: [{ requests_details: { $ne: [] } }, { leaves_details: { $ne: [] } }, { wfhs_details: { $ne: [] } }] } },
    {
      $project: {
        department: '$reporting.department',
        company: '$companies_details',
        requests: '$requests_details',
        leaves_details: 1,
        wfhs_details: 1,
      },
    },
    { $sort: { ...sortBy } },
  ]);

  return data.reduce((acc, item) => {
    const { company, department, requests, leaves_details, wfhs_details } = item;
    const mergedRequests = [...requests, ...leaves_details, ...wfhs_details];
    const requestStatus = groupArrayByKey(mergedRequests, 'status');
    const request = Object.entries(requestStatus).reduce((acs, [key, value]) => {
      const groupRequestType = groupArrayByKey(value, 'request_type');
      const requestTypeCount = Object.entries(groupRequestType).map(([k, v]) => {
        return { request_type: k, count: v.length };
      });
      return { ...acs, [key.toLowerCase()]: requestTypeCount };
    }, {});

    const foundCompanyIndex = acc.findIndex(({ _id }) => _id.toString() === company._id.toString());
    if (foundCompanyIndex !== -1) {
      const foundCompany = acc[foundCompanyIndex];
      const foundDepartmentIndex = foundCompany.departments.findIndex((sub) => sub.department === department);
      if (foundDepartmentIndex !== -1) {
        const foundDepartment = foundCompany.departments[foundDepartmentIndex];
        for (const [status, types] of Object.entries(request)) {
          for (const { request_type, count } of types) {
            if (foundDepartment.requests[status]) {
              const foundRequestTypeIndex = foundDepartment.requests[status].findIndex(
                (sub) => sub.request_type === request_type
              );
              if (foundRequestTypeIndex !== -1) {
                const foundRequestTypeCount = foundDepartment.requests[status][foundRequestTypeIndex].count;
                acc[foundCompanyIndex].departments[foundDepartmentIndex].requests[status][foundRequestTypeIndex].count =
                  foundRequestTypeCount + count;
              } else acc[foundCompanyIndex].departments[foundDepartmentIndex].requests[status].push({ request_type, count });
            } else acc[foundCompanyIndex].departments[foundDepartmentIndex].requests[status] = [{ request_type, count }];
          }
        }
      } else acc[foundCompanyIndex].departments.push({ department, requests: request });

      return acc;
    }

    return [
      ...acc,
      {
        ...company,
        departments: [{ department, requests: request }],
      },
    ];
  }, []);
}

module.exports = router;
