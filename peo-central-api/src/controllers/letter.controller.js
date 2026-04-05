const express = require('express');

const { ObjectId } = require('mongodb');
const catchAsync = require('../utils/catchAsync');
const { usersService, companiesService, requestsService, letterService, letterConfigService } = require('../services');
const { Requests } = require('../models')
const pick = require('../utils/pick');
const he = require('he')
const pdf = require('pdf-creator-node');
const { Letters } = require('@nathangroup/letter');
const letterHelper = require('../helpers/letters_helper')
var moment = require('moment-timezone');
const fs = require('fs');
const AWS = require('aws-sdk');
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;
const axios = require('axios')

const letterDownload = async function (req, res) {
  try {
    const body = req.body;
    const bln_newLetter = body.bln_newLetter;

    const applicant = await usersService.getUserById(ObjectId(body.user_id), {
      personal: 1,
      company_id: 1,
      first_name: 1,
      middle_name: 1,
      last_name: 1,
      user_name: 1,
      documents: 1,
      date_of_joining: 1,
      bank: 1,
      salary: 1,
    });
    if (!applicant) return res.status(404).json({ success: false, message: 'User not found' });
    let applicant_company = await companiesService.getCompanyById(applicant.company_id, { company_name: 1 });

    applicant_company = { ...applicant_company.data, _id: applicant_company.data._id.toString() };
    const letter_request = await requestsService.getRequestById(body.req_id);
    if (!letter_request) return res.status(404).json({ success: false, message: 'Letter not found' });
    //if (letter_request.status.toLowerCase() !== 'completed') return res.status(400).json({ message: 'Forbidden' });
    if (letter_request.pdf_url) {
      res
        .status(200)
        .json({ success: true, message: 'Success.', data: { name: letter_request.pdf_name, url: letter_request.pdf_url } });
    }
    const letter_request_styling = await letterConfigService.getLetterRequestByTypes(
      applicant.company_id,
      letter_request.letter_type,
      letter_request.letter_sub_type
    );
    let checking = letter_request_styling[0];

    if (applicant && applicant_company && letter_request && checking) {
      let preview_content = await letterService.combineHtmlPDF(
        applicant,
        checking,
        letter_request,
        applicant_company,
        bln_newLetter
      );
      
      let header = {};
      if(!letter_request?.letterImages?.headerImageLink){
        header = {
          height: '25mm',
          contents: `<div style='display:none'></div>`,
        };
      } else {
        let letter_header = await letterService.toBase64(letter_request?.letterImages?.headerImageLink);
        header = {
          height: '25mm',
          contents: `<img style='margin-top: -10px !important; padding:-10px; !important' width='100%' src='${letter_header}'><br><br>`,
        };
      }

      let footer = {};
      if(!letter_request?.letterImages?.footerImageLink){
        footer = {
          height: '33mm',
          contents: `<div style='display:none'></div>`,
        };
      } else {
        let letter_footer = await letterService.toBase64(letter_request?.letterImages?.footerImageLink);
        footer = {
          height: '33mm',
          contents: `<img style='margin-top: 25px !important; padding:25px; !important' width='100%' src='${letter_footer}'><br><br>`,
        };
      }
      pdf.create({
        html: letterService.addTinymceClass(he.decode(preview_content)),
        data: {},
        path: './output.pdf',
        type: '',
      },{
        format: 'A4',
        orientation: 'portrait',
        border: {
          top: '0px', // default is 0, units: mm, cm, in, px
          right: '5mm',
          bottom: '5mm',
          left: '0px',
        },
        header,
        footer,
      })
      .then(async (pdf_res) => {
        const data = await letterService.uploadLetter(pdf_res, letter_request, applicant);
        res.status(200).json({ success: true, message: 'Success.', data });
      })
      .catch((error) => {
        console.log('#log', error);
        res.status(200).json({ success: false, message: 'Unable to process letter pdf.', data: error });
      });
    } else {
      res.status(200).json({ success: false, message: 'Unable to process letter pdf.', data: [] });
    }
  } catch (error) {
    console.log('#log', error);
    res.status(500).send(error);
  }
};

const letterPreview = async function (req, res) {
  try {
    const body = req.body;
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const request = await Requests.find({ _id: ObjectId(body.req_id)})
    const lettersInfo = request[0]
    var LetterAditionalfieldData = await letterHelper.getLetterAdditionalFieldData(lettersInfo)
    lettersInfo.letter_fields["day"] = weekday[new Date().getDay()]
    lettersInfo.letter_fields["name"] = LetterAditionalfieldData.user_name
    lettersInfo.letter_fields["emp_id"] = LetterAditionalfieldData.emp_id
    lettersInfo.letter_fields["passport_number"] = LetterAditionalfieldData.passport
    lettersInfo.letter_fields["role"] = LetterAditionalfieldData.role
    lettersInfo.letter_fields["total_fixed"] = LetterAditionalfieldData.total_fixed
    lettersInfo.letter_fields["totalFixed"] = LetterAditionalfieldData.totalFixed
    lettersInfo.letter_fields["basic_salary"] = LetterAditionalfieldData.basic_salary
    lettersInfo.letter_fields["work_start_date"] = LetterAditionalfieldData.work_start_date
    lettersInfo.letter_fields["total_fixed_word"] = LetterAditionalfieldData.total_fixed_word
    lettersInfo.letter_fields["basic_salary_word"] = LetterAditionalfieldData.basic_salary_word
    lettersInfo.letter_fields["nationality"] = LetterAditionalfieldData.nationality
    lettersInfo.letter_fields["designation"] = LetterAditionalfieldData.designation
    lettersInfo.letter_fields["doj"] = LetterAditionalfieldData.doj
    lettersInfo.letter_fields["empTotalFixed"] = LetterAditionalfieldData.empTotalFixed
    lettersInfo.letter_fields["totalFixedWord"] = LetterAditionalfieldData.totalFixedWord
    lettersInfo.letter_fields["passport"] = LetterAditionalfieldData.passport
    lettersInfo.letter_fields["passportNumber"] = LetterAditionalfieldData.passport
    lettersInfo.letter_fields["passportIssueDate"] = LetterAditionalfieldData.passportissue
    lettersInfo.letter_fields["passportExpiryDate"] = LetterAditionalfieldData.passportexpiry
    lettersInfo.letter_fields["bank"] = LetterAditionalfieldData.bank
    lettersInfo.letter_fields["iban"] = LetterAditionalfieldData.iban
    lettersInfo.letter_fields["bankAccountNumber"] = LetterAditionalfieldData.account_number
    lettersInfo.letter_fields["gender"] = LetterAditionalfieldData.gender
    lettersInfo.letter_fields["department"] = LetterAditionalfieldData.department
    lettersInfo.letter_fields["marital_status"] = LetterAditionalfieldData.marital_status
    lettersInfo.letter_fields["title"] = LetterAditionalfieldData.title
    lettersInfo.letter_fields["hard_copy"] = lettersInfo.hard_copy
    lettersInfo.letter_fields["companyName"] = LetterAditionalfieldData.company.company_name
    lettersInfo.letter_fields["dob"] = LetterAditionalfieldData.dob
    lettersInfo.letter_fields["accommodation_allowance"] = LetterAditionalfieldData.accommodation_allowance
    lettersInfo.letter_fields["medical_allowance"] = LetterAditionalfieldData.medical_allowance
    lettersInfo.letter_fields["transport_allowance"] = LetterAditionalfieldData.transport_allowance
    lettersInfo.letter_fields["other_allowance"] = LetterAditionalfieldData.other_allowance
    lettersInfo.letter_fields["managername"] = LetterAditionalfieldData.managername
    lettersInfo.letter_fields["manageremail"] = LetterAditionalfieldData.manageremail
    lettersInfo.letter_fields["managerphone"] = LetterAditionalfieldData.managerphone
    lettersInfo.letter_fields["managerheshe"] = LetterAditionalfieldData.managerheshe
    lettersInfo.letter_fields["date"] = LetterAditionalfieldData.date
    lettersInfo.content = lettersInfo.status == "completed" ? lettersInfo.contentafter : lettersInfo.contentbefore
    var letterObj = await letterService.getLetterObject(lettersInfo)

    await axios
    .post(`${process.env.documenturl}api/DocumentEditor/ReplaceContentToHTML`, JSON.stringify(letterObj), { headers: { "Content-Type": "application/json", Accept: "*/*" }})
    .then((response) => {
      if (response) res.status(200).json({ success: true, message: "Letter preview", data: response.data })
      else res.status(200).json({ success: false, message: "Unable to process preview", data: [] })
    })
    .catch(err => console.log(err))
  } catch (error) {
    console.log("#log", error)
    res.status(500).send(error)
  }
};

async function uploadLetterArrayBuffer(
  fileContent,
  type,
  letter_request,
  applicant
) {
  try {
    const s3 = new AWS.S3({
      // accessKeyId: ID,
      // secretAccessKey: SECRET,
      // region: "eu-central-1",
    })

    let name =
      "Sample" +
      " " +
      letter_request.letter_type +
      "-" +
      new Date().getTime() / 1000 +
      ".pdf"

    const params = {
      Bucket: BUCKET_NAME + "/" + "letters",
      Key: name,
      Body: fileContent,
      ACL: "public-read",
      ContentType: type,
    }

    /* Uploading files to the bucket */
    s3.upload(params, async function (err, data) {
      if (err) {
        throw err
      } else {
        // console.log(data.Location, "--data.Location")
        let update_req = await Requests.updateOne(
          { _id: ObjectId(letter_request._id) },
          { $set: { pdf_url: data.Location } }
        )
        return { name: params.Key, url: data.Location }
      }
    })
  } catch (error) {
    return error
  }
}

module.exports = {
  letterDownload,
  letterPreview,
};
