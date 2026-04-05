const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb");
const moment = require("moment")

const AWS = require("aws-sdk");
const fs = require("fs");
const {payslipsController} = require('../../controllers')
const PayslipsModel = require('../../models/payslips.model')
const verifyToken = require('../../middlewares/verifyToken');

const Email = require('../../middlewares/email');
const pdf = require("pdf-creator-node");



router.get("/downloadPaySlip/:payslip_id", async (req, res) => {
    const payslip_id = req.params.payslip_id;
    try {
      function AmountFormatter(value) {
  
        if (value && Number(value) !== 0) {
          let newValue = parseFloat(value).toFixed(2)
          const numberFormatter = Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
          const formatted = numberFormatter.format(newValue);
          return formatted
        } else if (Number(value) == 0) {
          return 0.00
        } else return 0.00
      }
      let match = {
        $match: {
          _id: ObjectId(payslip_id),
        },
      };
      const payslipprocess = await PayslipsModel.aggregate([match]);
      console.log("payslipprocess", payslipprocess)
      let htmlData = `
      <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
          * {
              font-family: 'Roboto', sans-serif;
          }
      </style>
  
  </head>
  
  <body>
      <div style="position: relative; margin-left: 20px; margin-right: 20px;">
          <div style=" width: 100%; height: 100px; margin-bottom: 0; ">
              <div style=" width: 60%; float: left;">
                  <img src="https://payroll-central-nathanhr.s3.amazonaws.com/companies/1708415861275-dynamic-new-logo.png" height="50px" style="padding: 40px; padding-bottom: 20px;">
              </div>
              <div style=" width: 40%; float: left;">
                  <div style="padding:40px; padding-bottom: 20px; line-height: 5px; text-align: right;">
                      <p style="font-size: 4pt;">Classification : <span style="font-weight: bold;">Confidential</span></p>
                      <p> <span style="font-size: 14pt; font-weight: 700;">Payslip </span><span style="font-size: 10pt; font-weight: 400;">PayslipPayMonth</span></p>
                  </div>
              </div>
          </div>
          <hr style="width: 95%;" />
          <div style=" height: fit-content; padding-left: 20px; padding-right: 20px;">
              <div style="  width: 70%; line-height: 8px; float: left;">
                  <p style="font-size: 10pt;"><span style="font-weight: bold; ">Employee Name :</span> &ensp;EmployeeName</p>
                  <p style="font-size: 10pt;"><span style="font-weight: bold; ">Designation :</span> &ensp;EmpDesigantion</p>
                  <p style="font-size: 10pt;"><span style="font-weight: bold; ">DOJ :</span>&ensp;EmpDOJ</p>
                  <p style="font-size: 10pt;"><span style="font-weight: bold; ">IBAN :</span> &ensp;EmpIBan</p>
                  <p style="font-size: 10pt;"><span style="font-weight: bold; ">Bank Name :</span>&ensp;EmpBankName</p>
              </div>
              <div style="  width: 30%; line-height: 8px; float: left;">
                  <p style="font-size: 10pt;text-align: right;"><span style="font-weight: bold; ">Total no. of days :</span> &ensp; PaysipTotalNoOfDays</p>
                  <p style="font-size: 10pt;text-align: right;"><span style="font-weight: bold; ">Present Days :</span>&ensp; PayslipPresentDays</p>
                  <p style="font-size: 10pt;text-align: right;"><span style="font-weight: bold; ">Absent Days :</span>&ensp; PayslipAbsentDays</p>
              </div>
          </div>
          <div style="width: 100%; background-color: #f0f0f0; float: left; ">
              <p style="text-align: left; padding-left: 20px;font-size: 10pt; font-weight: bold;"> Fixed Compensation (in AED) </p>
          </div>
          <div style="height: fit-content; padding-left: 20px; padding-right: 20px;">
              <div style="  width: 70%; line-height: 12px; float:left">
                  EmployeefixedSalaryKeys
              </div>
              <div style="width: 30%; line-height: 12px; float:left; text-align: right;">
                  EmployeefixedSalaryAmount
              </div>
          </div>
  
          <div style="width: 100%; background-color: #f0f0f0; float:left;">
              <p style="text-align: left; padding-left: 20px;font-size: 10pt; font-weight: bold;"> Additions and Deductions (in AED) </p>
          </div>
  
          <div style="height: fit-content; padding-left: 20px; padding-right: 20px;">
              <div style="width: 70%; line-height: 12px; float:left">
                  EmployeeVariableElementKeys
              </div>
              <div style="  width: 30%; line-height: 12px; float:left; text-align: right;">
                  EmployeeVariableElementAmount
              </div>
          </div>
          <div style="width: 100%; background-color: #f0f0f0; float:left; margin-top:20px">
              <div style="width:70%;">
                  <div style=" width: 20%; float:left; ">
                      <p style="font-weight:bold; text-align:center;font-size: 10pt;">Net Pay AED : </p>
                  </div>
                  <div style="width: 70%; float:left">
                      <p style="font-size: 10pt;">PayslipTotalSalaryText</p>
                  </div>
              </div>
              <div style="width:30%; margin-right:20px; height: 100%; margin-top: 10px; float:right; text-align: right;">
                  <b style="text-align:center;font-size: 10pt;">AED: PayslipTotalSalary</b>
              </div>
          </div>
      </div>
  </body>
  
  </html>
                              `;
      var options = {
        orientation: "portrait",
        // border: {
        //   top: "0px", // default is 0, units: mm, cm, in, px
        //   right: "10mm",
        //   bottom: "5mm",
        //   left: "10mm",
        // },
        footer: {
          contents: `<p style="text-align:center; font-size: 16px;">*Note: This is a computer generated Payslip and does not require signature</p>`,
          height: "30px",
        },
      };
      htmlData = htmlData.replace("EmployeeName", payslipprocess[0].full_name);
      htmlData = htmlData.replace(
        "EmpDesigantion",
        payslipprocess[0].designation
      );
      htmlData = htmlData.replace(
        "EmpDOJ",
        moment(payslipprocess[0].date_of_joining).format("DD MMM, YYYY")
      );
  
      htmlData = htmlData.replace(
        "EmpIBan",
        payslipprocess[0].iban
      );
  
      htmlData = htmlData.replace(
        "EmpBankName",
        payslipprocess[0].bank_name
      );
      htmlData = htmlData.replace(
        "PaysipTotalNoOfDays",
        payslipprocess[0].days_in_month
      );
      htmlData = htmlData.replace(
        "PayslipPresentDays",
        payslipprocess[0].present_days
      );
      htmlData = htmlData.replace(
        "PayslipAbsentDays",
        payslipprocess[0].absent_days
      );
      htmlData = htmlData.replace(
        "PayslipTotalSalaryText",
        payslipprocess[0].total_salary_text
      );
      htmlData = htmlData.replace(
        "PayslipTotalSalary",
        AmountFormatter(payslipprocess[0].total_salary)
      );
      htmlData = htmlData.replace(
        "PayslipPayMonth",
        moment(payslipprocess[0].pay_month).format("MMM, YYYY")
      );
  
      let fixedSalaryObj = payslipprocess[0].fixed;
  
      let fixedSalaryKeys = [];
      let fixedSalaryValueAmount = [];
      for (const [key, value] of Object.entries(fixedSalaryObj)) {
        if (value === "0" || value === 0 || value == NaN || value == null) {
          continue;
        }
        let fixed_key = key.replace(/_+/g, " ");
        fixed_key = fixed_key.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
          letter.toUpperCase()
        );
        fixedSalaryKeys.push(fixed_key);
        fixedSalaryValueAmount.push(parseFloat(value).toFixed(2));
      }
      let _p = "";
      fixedSalaryKeys.forEach(function (fixed) {
        _p += '<p style="font-size: 10pt;">' + fixed + "</p>";
      });
      _p += '<p style="font-size: 10pt;">Total Fixed</p>';
      htmlData = htmlData.replace("EmployeefixedSalaryKeys", _p);
      let __p = "";
      let totalFixAmount = 0
      fixedSalaryValueAmount.forEach(function (fixed) {
        totalFixAmount = Number(totalFixAmount) + Number(fixed)
        __p += '<p style="font-size: 10pt;">' + AmountFormatter(fixed) + "</p>";
      });
      __p += '<p style="font-size: 10pt;">' + AmountFormatter(totalFixAmount) + "</p>";
      htmlData = htmlData.replace("EmployeefixedSalaryAmount", __p);
  
      let variableElementObj = payslipprocess[0].variable;
  
      let variableElementKeys = [];
      let variableElementAmount = [];
  
      for (const [key, value] of Object.entries(variableElementObj)) {
        if (value === "0" || value === 0 || value == NaN || value == null) {
          continue;
        }
        let variable_key = key.replace(/_+/g, " ");
        variable_key = variable_key.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
          letter.toUpperCase()
        );
        variableElementKeys.push(variable_key);
        variableElementAmount.push(parseFloat(value).toFixed(2));
      }
      let _p1 = "";
      variableElementKeys.forEach(function (fixed) {
        _p1 += '<p style="font-size: 10pt;">' + fixed + "</p>";
      });
      htmlData = htmlData.replace("EmployeeVariableElementKeys", _p1);
      let __p1 = "";
      variableElementAmount.forEach(function (fixed) {
        __p1 += '<p style="font-size: 10pt;">' + AmountFormatter(fixed) + "</p>";
      });
      htmlData = htmlData.replace("EmployeeVariableElementAmount", __p1);
      var document = {
        html: htmlData,
        data: {
          payslips: payslipprocess,
        },
        path: "./output.pdf",
        type: "",
      };
  
      pdf
        .create(document, options)
        .then(async (pdf_res) => {
          let file_name =
            payslipprocess[0].full_name +
            "-" +
            new Date().getTime() / 1000 +
            ".pdf";
          const payslip_url = await uploadPayslipAWS(pdf_res, file_name);
          console.log(payslip_url , "payslip_url")
          const updatePayslip = await PayslipsModel.findOneAndUpdate(
            { _id: ObjectId(payslip_id) },
            { $set: { payslip_url: payslip_url } },
            { new: true }
          );
          res.status(200).json(updatePayslip);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.log("#log", error);
      res.status(500).json({ message: error.message });
    }
  });


  async function uploadPayslipAWS(file, name) {
    try {
      const s3 = new AWS.S3({
        // accessKeyId: process.env.SECRET_ID_AWS,
        // secretAccessKey: process.env.SECRET_KEY_AWS,
        // region: "eu-central-1",
      });
  
      const fileContent = fs.readFileSync(file.filename);
      const params = {
        Bucket: process.env.BUCKET_NAME + "/" + "payslips",
        Key: name,
        Body: fileContent,
        ACL: "public-read",
        ContentType: file.mimetype,
      };
      /* Uploading files to the bucket */
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      return error;
    }
  }

router.get('/all', async (req, res) => {
    try {
        const payslips = await PayslipsModel.find()
        res.json(payslips)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/distinct', async (req, res) => {
    try {
        const payslips = await PayslipsModel.distinct('pay_month')
        res.json(payslips)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        const payslip = await PayslipsModel.find({ "_id": id })
        res.json(payslip)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        const payslip = await PayslipsModel.find({ "_id": id })
        res.json(payslip)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/pay-month/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        const payslip = await PayslipsModel.find({ "pay_month": id })
        res.json(payslip)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/pay-month/:_id/:company_id', async (req, res) => {
    const id = req.params._id;
    const company_id = req.params.company_id;
    try {
        const payslip = await PayslipsModel.find({ "pay_month": id, company_id: company_id })
        res.json(payslip)
    } catch (err) {
        res.json({ message: err.message })
    }
})

// get payslip of a particular user
router.get('/user/pay-month/:_id/:company_id/:user_id', async (req, res) => {
    const id = req.params._id;
    const company_id = req.params.company_id;
    const user_id = req.params.user_id;
    try {
        const payslip = await PayslipsModel.find({ "pay_month": id, company_id: company_id, user_id: user_id })
        res.json(payslip)
    } catch (err) {
        res.json({ message: err.message })
    }
})

// get payslip of a particular user
router.get('/user/pay-month/:_id/:company_id/:user_id', async (req, res) => {
    const id = req.params._id;
    const company_id = req.params.company_id;
    const user_id = req.params.user_id;
    try {
        const payslip = await PayslipsModel.find({ "pay_month": id, company_id: company_id, user_id: user_id })
        res.json(payslip)
    } catch (err) {
        res.json({ message: err.message })
    }
})

// update the payslip
router.put('/update/:_id', async (req, res, next) => {
    const id = req.params._id;
    const filter = { _id: id };
    try {
        const payslip = await PayslipsModel.findOneAndUpdate(filter, { ...req.body });
        res.status(200).send(payslip);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
router.post('/user/crypto-val/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        if (validateSecretKey(req.body.enc)) {
            const payslipprocess = await PayslipsModel.find({ "_id": id })
            res.json(payslipprocess)
        }
        else {
            res.status(500).json({ message: 'Error' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/user/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        const payslipprocess = await PayslipsModel.find({ "user_id": id })
        res.json(payslipprocess)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/user/:_id/:company_id', async (req, res) => {
    const id = req.params._id;
    const company_id = req.params.company_id;
    try {
        const payslipprocess = await PayslipsModel.find({ "user_id": id, company_id: company_id })
        res.json(payslipprocess)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/delete/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        const payslip = await PayslipsModel.findByIdAndRemove({ "_id": id })
        const response = {
            message: "Successfully deleted",
            id: payslip._id
        };
        return res.send(response);

    } catch (err) {
        res.json({ message: err.message })
    }
})

router.post('/add', async (req, res) => {

    const payroll = new PayslipsModel({
        ...req.body
    })

    try {
        const newProcess = await payroll.save()
        res.status(201).json(newProcess)
        res.send('Request saved')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/new', async (req, res) => {
    const { company, employee, date_time, message, file } = req.body

    const payslips = new PayslipsModel({
        company,
        employee,
        date_time,
        message,
        file
    })

    try {
        const payslip = await payslips.save()
        //res.json(payslip)
        res.send('Request saved')
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.post('/send-email', async (req, res) => {
    const { email, hr_email, subjectMsg, eMessage } = req.body

    try {
    
        await Email.sendEmail(email , subjectMsg, eMessage , [])
       
        res.send('Email Sent')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/addBulk', async (req, res) => {
    try {
        const payslipArrayforBulkInsert = req.body.payslipArrayforBulkInsert
        const insertPayslips = await PayslipsModel.insertMany(payslipArrayforBulkInsert)
        res.status(201).json(insertPayslips)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.get('/get-all-payslip-data/:pay_month', async (req, res) => {
    try {
        const pay_month = req.params.pay_month
        const payslips = await PayslipsModel.find({ pay_month: pay_month }).select({ mol_wps_no: 1, total_salary: 1 })
        res.json(payslips)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/get-from-mol/:mol_wps_no/:pay_month', async (req, res) => {
    try {
        const mol_wps_no = req.params.mol_wps_no
        const pay_month = req.params.pay_month
        const payslips = await PayslipsModel.find({ pay_month: pay_month, mol_wps_no: mol_wps_no }).select({ mol_wps_no: 1, total_salary: 1 })
        res.json(payslips)
    } catch (err) {
        res.json({ message: err.message })
    }
})




router
  .route('/:id/:company_id')
  .get(payslipsController.getUserPayslipByID)

router
  .route('/pay-month/:month')
  .get(payslipsController.getUserPayslipByMonth)

router.route('/pay-month/:month/:company_id')
  .get(payslipsController.getUserPayslipByMonthAndCompany)

router
  // ....../getPayslipURL/:payslip_id
  .route('/url/get/new/:payslipId').all(verifyToken)
  .get(payslipsController.getPayslipURL)

// router
//   .route('/send-email')
//   .post(payslipsController.sendEmail)

router
  .route('/getPlaySlips/:company_id')
  .post(payslipsController.getPaySlips)


  router
  .route('/monthlyPaySlips/:company_id')
  .post(payslipsController.getPaySlipsMonthly)


  router
  .route('/payslipsUser/:userId')
  .post(payslipsController.AllPayslipsForUser)


module.exports = router