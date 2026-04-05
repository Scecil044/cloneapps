const { Payslips, Companies, Users } = require("../models")
const PDFDocument = require('pdfkit');
const request = require('request');
const { ObjectId } = require("mongodb");
const moment = require("moment");
const AWS = require("aws-sdk");
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;


const getUserPayslipByIDService = async (user_id, company_id) => {
  return await Payslips.find({ user_id, company_id }).lean();
}

const getUserPayslipByMonthService = async (pay_month, options) => {
  const filter = { pay_month }
  if (Object.keys(options).length === 0) {
    return await Payslips.find(filter).lean();
  }
  return await Payslips.paginateLookup(filter, options);
}

const getUserPayslipByMonthAndCompanyService = async (pay_month, company_id, options) => {
  const filter = { pay_month, company_id }
  return await Payslips.paginateLookup(filter, options);
}

// Get PaySlip URL
const getPayslipURL = async (paySlipId) => {
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
      _id: ObjectId(paySlipId),
    },
  };
  const payslipprocess = await Payslips.aggregate([match]);
  let companyObj = await Companies.findById(payslipprocess[0]?.company_id).select({ company_name: 1, logo: 1 });
  let defaultLogo = 'https://payroll-central-nathanhr.s3.amazonaws.com/companies/1708415861275-dynamic-new-logo.png';
  if (companyObj && companyObj.logo && companyObj.logo != "" && companyObj.logo != null) {
    defaultLogo = companyObj.logo
  }
  const doc = new PDFDocument({ size: 'A4' });
  const requestPromise = new Promise((resolve, reject) => {
    request({
      url: defaultLogo, encoding: null // Prevents Request from converting response to string
    }, async (err, response, body) => {
      if (err) reject(err);
      let title = 18;
      let title_month = 14
      let bodyFont = 10;
      let footerFont = 7;
      let headerFont = 7;
      let extraMargin = 10;
      let rectHeight = 50
      let text = ''
      let height_var = 230;
      doc.image(body, 40, 30, { width: 200 });
      doc
        .fontSize(headerFont)
        .font('Helvetica')
        .text('Classification : ', 449, 30, { lineBreak: false, align: 'right' })
        .font('Helvetica-Bold')
        .text('Confidential', { lineBreak: false, align: 'right' });
      doc
        .font('Helvetica-Bold')
        .fontSize(title)
        .text('Payslip ', 405, 40, { lineBreak: false, align: 'right' })
      doc
        .font('Helvetica')
        .fontSize(title_month)
        .text(moment(payslipprocess[0].pay_month).format("MMM, YYYY"), 470, 43, { lineBreak: false, align: 'right' });
      doc.rect(40, 100, 500, 0);
      doc.stroke();
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Employee Name ', 40, 120, { lineBreak: false, align: 'left' })
        .text(':', 120, 120, { lineBreak: false, align: 'left' })
        .font('Helvetica')
        .text(payslipprocess[0].full_name, 130, 120, { lineBreak: false, align: 'left' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Designation ', 40, 134, { lineBreak: false, align: 'left' })
        .text(':', 120, 134, { lineBreak: false, align: 'left' })
        .font('Helvetica')
        .text(payslipprocess[0].designation, 130, 134, { lineBreak: false, align: 'left' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('DOJ', 40, 148, { lineBreak: false, align: 'left' })
        .text(':', 120, 148, { lineBreak: false, align: 'left' })
        .font('Helvetica')
        .text(moment(payslipprocess[0].date_of_joining).format("DD MMM, YYYY"), 130, 148, { lineBreak: false, align: 'left' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('IBAN ', 40, 162, { lineBreak: false, align: 'left' })
        .text(':', 120, 162, { lineBreak: false, align: 'left' })
        .font('Helvetica')
        .text(payslipprocess[0].iban, 130, 162, { lineBreak: false, align: 'left' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Bank Name ', 40, 176, { lineBreak: false, align: 'left' })
        .text(':', 120, 176, { lineBreak: false, align: 'left' })
        .font('Helvetica')
        .text(payslipprocess[0].bank_name, 130, 176, { lineBreak: false, align: 'left' });

      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Total no. of days ', 430, 120, { lineBreak: false, align: 'right' })
        .text(':', 520, 120, { lineBreak: false, align: 'right' })
        .font('Helvetica')
        .text(payslipprocess[0].days_in_month, 530, 120, { lineBreak: false, align: 'right' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Present Days ', 430, 134, { lineBreak: false, align: 'right' })
        .text(':', 520, 134, { lineBreak: false, align: 'right' })
        .font('Helvetica')
        .text(payslipprocess[0].present_days, 530, 134, { lineBreak: false, align: 'right' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Absent Days', 430, 148, { lineBreak: false, align: 'right' })
        .text(':', 520, 148, { lineBreak: false, align: 'right' })
        .font('Helvetica')
        .text(payslipprocess[0].absent_days, 530, 148, { lineBreak: false, align: 'right' });

      doc.rect(35, 200, 510, 20)
        .fillAndStroke("#f0f0f0", "#f0f0f0");

      doc
        .fillColor('black')
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Fixed Compensation (in AED)', 40, 206, { lineBreak: false, align: 'right' });
      let fixedSalaryObj = payslipprocess[0].fixed;
      let total_fixed = 0
      for (const [key, value] of Object.entries(fixedSalaryObj)) {
        if (value === "0" || value === 0 || value == NaN || value == null) {
          continue;
        }
        total_fixed = Number(total_fixed) + Number(value)
        let fixed_key = key.replace(/_+/g, " ");
        fixed_key = fixed_key.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
          letter.toUpperCase()
        );
        doc
          .fontSize(bodyFont)
          .font('Helvetica')
          .text(fixed_key, 40, height_var, { lineBreak: false, align: 'left' });
        doc
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text(AmountFormatter(value), 472, height_var, { width: 70, align: 'right' });
        height_var += 18
      }
      doc
        .fontSize(bodyFont)
        .font('Helvetica')
        .text("Total Fixed", 40, height_var, { lineBreak: false, align: 'left' });
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text(AmountFormatter(total_fixed), 472, height_var, { width: 70, align: 'right' });
      height_var += 16
      height_var = height_var + 10
      doc.rect(35, height_var, 510, 20)
        .fillAndStroke("#f0f0f0", "#f0f0f0");
      height_var = height_var + 6
      doc
        .fillColor('black')
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Additions and Deductions (in AED)', 40, height_var, { lineBreak: false, align: 'right' });
      height_var += 24
      let variableElementObj = payslipprocess[0].variable;
      for (const [key, value] of Object.entries(variableElementObj)) {
        if (value === "0" || value === 0 || value == NaN || value == null) {
          continue;
        }
        let variable_key = key.replace(/_+/g, " ");
        variable_key = variable_key.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
          letter.toUpperCase()
        );
        doc
          .fontSize(bodyFont)
          .font('Helvetica')
          .text(variable_key, 40, height_var, { lineBreak: false, align: 'left' });
        doc
          .fontSize(bodyFont)
          .font('Helvetica-Bold')
          .text(AmountFormatter(value), 472, height_var, { width: 70, align: 'right' });

        height_var += 18
      }
      height_var = height_var + 10
      let tempSize = 20
      if (payslipprocess[0].total_salary_text.length > 72) {
        tempSize = 30
      }
      doc.rect(35, height_var, 510, tempSize)
        .fillAndStroke("#f0f0f0", "#f0f0f0");
      height_var = height_var + 6;
      doc
        .fillColor('black')
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text('Net Pay AED ', 40, height_var, { lineBreak: false, align: 'left' })
        .text(':', 105, height_var, { lineBreak: false, align: 'left' });
      doc
        .fillColor('black')
        .fontSize(bodyFont)
        .font('Helvetica')
        .text(payslipprocess[0].total_salary_text, 115, height_var, { width: 370, align: 'left' })
      doc
        .fontSize(bodyFont)
        .font('Helvetica-Bold')
        .text(AmountFormatter(payslipprocess[0].total_salary), 472, height_var, { width: 70, align: 'right' });
      doc.text('*Note: This is a computer generated Payslip and does not require signature', 107.64, doc.page.height - 50, {
        lineBreak: false,
        align: 'center'
      });
      doc.end();
      let file_name =
        payslipprocess[0].full_name +
        new Date().getTime() / 1000 +
        ".pdf";
      const buffers = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", async () => {
        const pdfData = Buffer.concat(buffers)
        const s3 = new AWS.S3({
          // accessKeyId: ID,
          // secretAccessKey: SECRET,
          // region: "eu-central-1",
        });
        const params = {
          Bucket: BUCKET_NAME + "/" + "payslips",
          Key: file_name,
          Body: pdfData,
          ACL: "public-read",
        };
        const data = await s3.upload(params).promise();
        const updatePayslip = await Payslips.findOneAndUpdate(
          { _id: ObjectId(paySlipId) },
          { $set: { payslip_url: data.Location } },
          { new: true }
        );

        resolve(updatePayslip)
      })
    });
  })

  const result = await requestPromise
  if (result) return { message: 'Success', data: result }
  else return { message: 'Failed' }
}

const sendEmail = async (reqBody) => {
  const { email, hr_email, subjectMsg, eMessage } = reqBody;

  const msg = {
    to: email,
    from: hr_email,
    subject: subjectMsg,
    text: subjectMsg,
    html: eMessage,
  };

  if (email.length > 1) {
    sgMail
      .sendMultiple(msg)
      .then(() => {
        // console.log('emails sent successfully!');
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    sgMail.send(msg);
  }
  return { message: 'Success' }
}


const allCompanyPaySlips = async (companyId) => {

  const pipeline = [
    {
      '$match': {
        'company_id': ObjectId(companyId)
      }
    }, {
      '$addFields': {
        'userIdString': {
          '$toString': '$_id'
        }
      }
    }, {
      '$lookup': {
        'from': 'payslips',
        'localField': 'userIdString',
        'foreignField': 'user_id',
        'as': 'paySlips'
      }
    },
    {
      '$addFields': {
        'Total': {
          '$size': '$paySlips'
        }
      }
    },
    {
      $match: {
        "Total": { $gte: 1 }
      }
    }
  ]

  const data = await Users.aggregate(pipeline)
  return data

}



const MonthlyPaySlips = async (companyId) => {

  const pipeline = [
    {
      '$addFields': {
        'userObjectID': {
          '$toObjectId': '$user_id'
        }
      }
    },
    {
      '$lookup': {
        'from': 'users',
        'localField': 'userObjectID',
        'foreignField': '_id',
        pipeline: [
          {
            $project: {
              "full_name": { $concat: ["$first_name", " ", "$last_name"] },
              "CompanyID": "$company_ID",
              "total_fixed" : "$salary.total_fixed",
              "email" : "$email"
            }
          }
        ],
        'as': 'users'
      }
    },
    {
      $unwind: {
        path: "$users"
      }
    },
    {
      $match: {
        "users.CompanyID": ObjectId(companyId)
      }
    },
    {
      $group: {
        "_id": "$pay_month",
        "TotalEMployees": { $count: {} },
        "PaySlips": { $push: "$$ROOT" }
      }
    }, 
    {
      $sort : {
        "_id" : -1 
      }
    }
  ]

  const data = await Payslips.aggregate(pipeline)
  return data

}



const UserPaySlipsAll = async (userId) => {
  const pipeline = [
    {
      $match : {
        user_id : userId
      }
    },
    {
      '$addFields': {
        'userObjectID': {
          '$toObjectId': '$user_id'
        }
      }
    },
    {
      '$lookup': {
        'from': 'users',
        'localField': 'userObjectID',
        'foreignField': '_id',
        pipeline: [
          {
            $project: {
              "full_name": { $concat: ["$first_name", " ", "$last_name"] },
              "CompanyID": "$company_ID",
              "total_fixed" : "$salary.total_fixed",
              "email" : "$email"
            }
          }
        ],
        'as': 'users'
      }
    },
    {
      $unwind: {
        path: "$users"
      }
    },
    {
      $sort : {
        "pay_month" : -1
      }
    }
  ]

  const data = await Payslips.aggregate(pipeline)
  return data
}


module.exports = {
  getUserPayslipByIDService,
  getUserPayslipByMonthService,
  getUserPayslipByMonthAndCompanyService,
  getPayslipURL,
  sendEmail,
  allCompanyPaySlips,
  MonthlyPaySlips, 
  UserPaySlipsAll
}