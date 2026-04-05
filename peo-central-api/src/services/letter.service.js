const { Letters } = require('@nathangroup/letter');
var moment = require('moment-timezone');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const AWS = require('aws-sdk');
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;
const { Users, Requests } = require('../models');
const he = require('he')

async function toBase64(url) {
  // Required 'request' module
  const axios = require('axios');

  // Make request to our image url
  const image = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  let type = image.headers['content-type'],
    prefix = 'data:' + type + ';base64,';
  const returnedB64 = prefix + Buffer.from(image.data).toString('base64');
  return returnedB64;
}

async function combineHtmlPreview(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
  try {
    // Add other letter_fields
    letter_request.letter_fields.user_name =
      applicant.user_name || `${applicant.first_name} ${applicant.middle_name} ${applicant.last_name}`;
    letter_request.letter_fields.company_id = applicant.company_ID;
    letter_request.letter_fields.company_ID = applicant.company_ID;
    applicant.company_ID = applicant.company_ID.toString();

    let LetterAddresseRepalce = await computeLetterAddressee(
      applicant,
      obj_letterInfo,
      letter_request,
      [applicant_company],
      bln_newLetter
    );
    let LetterContentRepalce = await computeLetterContent(
      applicant,
      obj_letterInfo,
      letter_request,
      [applicant_company],
      bln_newLetter
    );
    let combined = '';

    let footer = '';
    let signature = '';
    let stamp = '';
    let companyLogo = '';
    let signatory = {
      name: '',
      designation: '',
    };

    if (letter_request.previewStyles) {
      if (!letter_request.previewStyles.signature) {
        signature = '';
      } else {
        signature = '';
      }

      if (!letter_request.previewStyles.stamp) {
        stamp = '';
      } else {
        stamp = '';
      }

      if (!letter_request.previewStyles.header) {
        companyLogo = '';
      } else {
        companyLogo = letter_request?.letterImages?.headerImageLink;
      }

      if (!letter_request.previewStyles.signatory) {
        signatory.name = '';
        signatory.designation = '';
      } else {
        signatory.name = letter_request?.signatory?.name;
        signatory.designation = letter_request?.signatory?.designation;
      }

      if (!letter_request.previewStyles.footer) {
        footer = '';
      } else {
        footer = letter_request?.letterImages?.footerImageLink;
      }
    }

    /* This is Header */
    combined = combined.concat("<img src='" + companyLogo + "'><br><br>");

    /* This is Date */
    if (letter_request.previewStyles) {
      let date = '';
      if (letter_request.previewStyles.date_position == 'text_alignment_left') {
        date =
          "<div style='text-align: left; font-size: 15px; color: black !important;'>Date : " +
          moment(new Date(letter_request.date_created)).format(letter_request.previewStyles.date_format) +
          '</div><br><br>';
        combined = combined.concat(date);
      } else if (letter_request.previewStyles.date_position == 'text_alignment_right') {
        date =
          "<div style='text-align: right; font-size: 15px; color: black !important;'>Date : " +
          moment(new Date(letter_request.date_created)).format(letter_request.previewStyles.date_format) +
          '</div><br><br>';
        combined = combined.concat(date);
      } else {
        date =
          "<div style='text-align: center; font-size: 15px; color: black !important;'>Date : " +
          moment(new Date(letter_request.date_created)).format(letter_request.previewStyles.date_format) +
          '</div><br><br>';
        combined = combined.concat(date);
      }
    }

    /* This is Addressee */
    if (letter_request.previewStyles) {
      if (letter_request.previewStyles.addressee_position == 'text_alignment_left') {
        combined = combined.concat(
          "<p style='text-align: left; font-size: 15px; color: black !important;'>" +
            LetterAddresseRepalce.split('<p').join(
              "<p style='text-align: left; font-size: 15px; color: black !important;'"
            ) +
            '</p><br>'
        );
      } else if (letter_request.previewStyles.addressee_position == 'text_alignment_right') {
        combined = combined.concat(
          "<p style='text-align: right; font-size: 15px; color: black !important;'>" +
            LetterAddresseRepalce.split('<p').join(
              "<p style='text-align: right; font-size: 15px; color: black !important;'"
            ) +
            '</p><br>'
        );
      }
    }

    /* This is Subject */
    if (letter_request.previewStyles) {
      if (letter_request.previewStyles.subject_position == 'text_alignment_left') {
        combined = combined.concat(
          "<p style='text-align: left; font-size: 15px; color: black !important;'>" +
            letter_request.letter_fields.subject
              .split('<p')
              .join("<p style='text-align: left; font-size: 15px; color: black !important;'") +
            '</p><br><br>'
        );
      } else if (letter_request.previewStyles.subject_position == 'text_alignment_right') {
        combined = combined.concat(
          "<p style='text-align: right; font-size: 15px; color: black !important;'>" +
            letter_request.letter_fields.subject
              .split('<p')
              .join("<p style='text-align: right; font-size: 15px; color: black !important;'") +
            '</p><br><br>'
        );
      } else {
        combined = combined.concat(
          "<p style='text-align: center; font-size: 15px; color: black !important;'>" +
            letter_request.letter_fields.subject
              .split('<p')
              .join("<p style='text-align: center; font-size: 15px; color: black !important;'") +
            '</p><br><br>'
        );
      }
    }

    /* This is Body */
    combined = combined.concat(
      "<p style='text-align: left; font-size: 15px; color: black !important;'>" +
        LetterContentRepalce.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important;'") +
        '</p><br>'
    );

    /* This is Signature and Stamp */
    combined = combined.concat(
      "<div style='display: grid; grid-template-columns: 150px 150px 150px;'><div>" +
        "<img width='100%' height='100%' src='" +
        signature +
        "'>" +
        '</div><div>' +
        "<img width='80%' height='80%' src='" +
        stamp +
        "'>" +
        '</div></div><br>'
    );

    /* This is signatory */
    if (letter_request.previewStyles.signatory) {
      /* Name and Designation */
      combined = combined.concat(
        "<p style='text-align: left; font-size: 15px; color: black !important;'>" +
          signatory.name +
          '<br>' +
          signatory.designation +
          '</p>'
      );
    }

    /* This is Header */
    combined = combined.concat("<br><br><img src='" + footer + "'>");

    combined = ReplaceLetterKeys(combined, letter_request, applicant, applicant_company); // replace unreplaced keys
    return combined;
  } catch (error) {
    console.log('#log', error);
    return error;
  }
}

async function combineHtmlPDF(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
  try {
    // Add other letter_fields
    letter_request.letter_fields.user_name =
      applicant.user_name || `${applicant.first_name} ${applicant.middle_name} ${applicant.last_name}`;
    letter_request.letter_fields.company_id = applicant.company_id;
    letter_request.letter_fields.company_ID = applicant.company_id;
    applicant.company_id = applicant.company_id.toString();

    let LetterAddresseRepalce = await computeLetterAddressee(
      applicant,
      obj_letterInfo,
      letter_request,
      [applicant_company],
      bln_newLetter
    );
    LetterAddresseRepalce = he.decode(LetterAddresseRepalce)
    let LetterContentRepalce = await computeLetterContent(
      applicant,
      obj_letterInfo,
      letter_request,
      [applicant_company],
      bln_newLetter
    );
    LetterContentRepalce = he.decode(LetterContentRepalce)

    LetterAddresseRepalce = LetterAddresseRepalce.split('</p><p>').join('<br>');
    LetterContentRepalce = LetterContentRepalce.split('<p><br></p>').join('<br><br>');
    LetterContentRepalce = LetterContentRepalce.split('</p><br><p>').join('</p><p>');

    let combined = '';

    let footer = '';
    let signature = '';
    let stamp = '';
    let companyLogo = '';
    let signatory = {
      name: '',
      designation: '',
    };

    // signature =

    // stamp = await toBase64(letter_request.letterImages.footerImageLink)

    if (letter_request.pdfStyles) {
      if (!letter_request.pdfStyles.signature || !letter_request.letterImages.signatureLink) {
        signature = '';
      } else {
        signature = await toBase64(letter_request.letterImages.signatureLink);
      }

      if (!letter_request.pdfStyles.stamp || !letter_request.letterImages.companyStampLink) {
        stamp = '';
      } else {
        stamp = await toBase64(letter_request.letterImages.companyStampLink);
      }

      if (!letter_request.pdfStyles.header || !letter_request.letterImages.companyStampLink) {
        companyLogo = '';
      } else {
        companyLogo = await toBase64(letter_request.letterImages.companyStampLink);
      }

      if (!letter_request.pdfStyles.signatory) {
        signatory.name = '';
        signatory.designation = '';
      } else {
        signatory.name = letter_request.signatory.name;
        signatory.designation = letter_request.signatory.designation;
      }

      // if (!letter_request.pdfStyles.footer) {
      //     footer = ""
      // } else {
      //     footer = await toBase64(letter_request.letterImages.footerImageLink)
      // }
    }

    combined = combined.concat(`<link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,700&display=swap" rel="stylesheet">`);

    /* This is Header */
    // combined = combined.concat("<img src='" + companyLogo + "'><br><br>")

    /* This is Date */
    if (letter_request.pdfStyles) {
      let date = '';
      if (letter_request.pdfStyles.date_position == 'text_alignment_left') {
        date =
          "<br><br><div style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>Date : " +
          moment(new Date(letter_request.date_created)).format(letter_request.pdfStyles.date_format) +
          '</div>';
        combined = combined.concat(date);
      } else if (letter_request.pdfStyles.date_position == 'text_alignment_right') {
        date =
          "<br><br><div style='text-align: right; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>Date : " +
          moment(new Date(letter_request.date_created)).format(letter_request.pdfStyles.date_format) +
          '</div>';
        combined = combined.concat(date);
      } else {
        date =
          "<br><br><div style='text-align: center; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>Date : " +
          moment(new Date(letter_request.date_created)).format(letter_request.pdfStyles.date_format) +
          '</div>';
        combined = combined.concat(date);
      }
    }

    LetterAddresseRepalce = LetterAddresseRepalce.split('<p').join(
      "<p style='font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'"
    );
    /* This is Addressee */
    if (letter_request.pdfStyles) {
      if (letter_request.pdfStyles.addressee_position == 'text_alignment_left') {
        combined = combined.concat(
          "<p style='text-align: left; font-size: 15px; color: black !important;'>" + LetterAddresseRepalce + '</p>'
        );
      } else if (letter_request.pdfStyles.addressee_position == 'text_alignment_right') {
        combined = combined.concat(
          "<p style='text-align: right; font-size: 15px; color: black !important;'>" + LetterAddresseRepalce + '</p>'
        );
      }
    }

    /* This is Subject */
    if (letter_request.pdfStyles) {
      if (letter_request.pdfStyles.subject_position == 'text_alignment_left') {
        letter_request.letter_fields.subject = letter_request.letter_fields.subject
          .split('<p')
          .join(
            "<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'"
          );
        combined = combined.concat(
          "<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" +
            letter_request.letter_fields.subject +
            '</p>'
        );
      } else if (letter_request.pdfStyles.subject_position == 'text_alignment_right') {
        letter_request.letter_fields.subject = letter_request.letter_fields.subject
          .split('<p')
          .join(
            "<p style='text-align: right; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'"
          );
        combined = combined.concat(
          "<p style='text-align: right; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" +
            letter_request.letter_fields.subject +
            '</p>'
        );
      } else {
        letter_request.letter_fields.subject = letter_request.letter_fields.subject
          .split('<p')
          .join(
            "<p style='text-align: center; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'"
          );
        combined = combined.concat(
          "<p style='text-align: center; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" +
            letter_request.letter_fields.subject +
            '</p>'
        );
      }
    }

    LetterContentRepalce = LetterContentRepalce.split('<p').join(
      "<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0;'"
    );
    /* This is Body */
    combined = combined.concat(
      "<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" +
        LetterContentRepalce +
        '</p>'
    );

    /* This is Signature and Stamp */
    combined = combined.concat(
      (
        `<p><table style="border-collapse: collapse; width: 66.0938%; height: 40px; border-width: 1px; border-style: hidden; margin-left: 0px; margin-right: auto;" border="0px"><colgroup><col style="width: 33.4375%;"><col style="width: 33.4375%;"><col style="width: 33.125%;"></colgroup>
                    <tbody>
                    <tr style="height: 40px;">
                    <td style="border-width: 1px; height: 40px;">` +
        (signature != '' && signature != undefined ? `<img style="float: left;" src="${signature}" width="100%">` : '') +
        `</td>
                    <td style="border-width: 1px; height: 40px; text-align: right;">` +
        (stamp != '' && stamp != undefined ? `<img style="float: left;" src="${stamp}" width="100%">` : '') +
        `</td>
                    <td style="border-width: 1px; height: 40px; text-align: left;">&nbsp;</td>
                    </tr>
                    </tbody>
                    </table><p>` +
        (letter_request.pdfStyles.signatory
          ? "<p style='text-align: left; font-size:13px; color: black !important; font-family: 'EB Garamond', serif;'>" +
            signatory.name +
            '<br>' +
            signatory.designation +
            '</p>'
          : '')
      ).replace(/[\r\n]/gm, '')
    );

    /* This is Header */
    // combined = combined.concat("<br><br><img src='" + footer + "'>")

    combined = ReplaceLetterKeys(combined, letter_request, applicant, applicant_company); // replace unreplaced keys
    return `<div style="padding-left: 30px !important; zoom: 0.65;">${combined}</div>`;
  } catch (error) {
    console.log('#log', error);
    return error;
  }
}

function addTinymceClass(val) {
  let tinycssString = `<html><head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" type="text/css" id="mce-u0" crossorigin="anonymous" referrerpolicy="origin" href="https://cdn.tiny.cloud/1/no-api-key/tinymce/5.10.5-131/skins/ui/oxide/content.min.css">
    <link rel="stylesheet" type="text/css" id="mce-u1" crossorigin="anonymous" referrerpolicy="origin" href="//fonts.googleapis.com/css?family=Lato:300,300i,400,400i">
    <style type="text/css">body { font-family:Helvetica,Arial,sans-serif; font-size:14px }</style>
    </head>
    <body id="tinymce" class="mce-content-body " contenteditable="true" spellcheck="false">`;

  return val.replace(/[\r\n]/gm, '').replace('<html><head></head><body>', tinycssString);
}

async function computeLetterAddressee(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
  try {
    const letterClass = new Letters();

    let body = await letterClass.computeLetterAddressee(
      applicant,
      obj_letterInfo,
      letter_request,
      bln_newLetter,
      applicant_company
    );

    return body;
  } catch (error) {
    console.log('#log', error);
    return error;
  }
}

async function computeLetterContent(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
  try {
    const letterClass = new Letters();

    let body = await letterClass.computeLetterContent(
      applicant,
      obj_letterInfo,
      letter_request,
      bln_newLetter,
      applicant_company
    );

    return body;
  } catch (error) {
    console.log('#log', error);
    return error;
  }
}

function ReplaceLetterKeys(content, letter_request, applicant, company) {
  const isMale = applicant.personal.gender.toLowerCase() == 'male' ? true : false;
  const fields = [
    ...letter_request.letter_keys.map((item) => ({ key: item.name.key, value: item.value })),
    { key: '[he/she]', value: isMale ? 'he' : 'she' },
    { key: '[his/her]', value: isMale ? 'his' : 'her' },
    { key: '[companyName]', value: company.company_name },
    { key: '[company_id]', value: company.company_id },
    { key: '[company_ID]', value: company.company_ID },
    { key: '[airfareAllowance]', value: applicant.salary.air_ticket_allowance || applicant.salary.airfareAllowance || 0 },
    { key: '[name]', value: `${applicant.first_name} ${applicant.middle_name} ${applicant.last_name}` },
    { key: '[closingRemarks]', value: "" },
  ];

  let result = content;
  fields.map(({ key, value }) => {
    const regex = new RegExp(escapeRegExp(key), 'g');
    result = result.replace(regex, value);
  });

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return result;
}

async function uploadLetter(file, letter_request, applicant) {
  try {
    const s3 = new AWS.S3({
      // accessKeyId: ID,
      // secretAccessKey: SECRET,
      region: 'eu-central-1',
    });

    const fileContent = fs.readFileSync(file.filename);

    let name = applicant.first_name + ' ' + letter_request.letter_type + '-' + new Date().getTime() / 1000 + '.pdf';

    const params = {
      Bucket: BUCKET_NAME + '/' + 'letters',
      Key: name,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };

    /* Uploading files to the bucket */
    const data = await new Promise((resolve, reject) => {
      s3.upload(params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ result });
        }
      });
    });

    const { result } = data;
    await Requests.updateOne(
      { _id: ObjectId(letter_request._id) },
      { $set: { pdf_url: result.Location, pdf_name: params.Key } }
    );
    return { name: params.Key, url: result.Location };
  } catch (error) {
    return error;
  }
}

async function getLetterObject(data) {
  function thousandSeparator(value, sep) {
    if (value && Number(value) !== 0) {
      let newValue = parseFloat(value).toFixed(2);
      const numberFormatter = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
      const formatted = numberFormatter.format(newValue);
      return formatted;
    } else if (Number(value) == 0) {
      return 0.0;
    } else return 0.0;
  }

  function computeDateNewRequest(date) {
    const moment = require('moment');
    if (date == undefined || date == null || date == '') return '';
    else return moment(new Date(date).toISOString().substr(0, 10)).format('DD MMMM, YYYY');
  }
  // let data = this.data
  let textArray = [];
  for (const property in data.letter_fields) {
    if (property == 'date') {
      let iterationObj = {
        key: '[date]',
        value: computeDateNewRequest(data.letter_fields[property]),
      };
      textArray.push(iterationObj);
    } else if (property == 'transfer_bank_name') {
      // let iterationObj = {
      //     "key": '[transfer_bank_name]',
      //     "value": data.letter_fields.transfer_bank_name['bank_name']
      // }
      // textArray.push(iterationObj)
    } else {
      let iterationObj = {
        key: '[' + property + ']',
        value: data.letter_fields[property],
      };
      textArray.push(iterationObj);
      if (property == 'gender') {
        if (data.letter_fields[property] == 'Male') {
          let iterationObj1 = {
            key: '[him/her]',
            value: 'him',
          };
          textArray.push(iterationObj1);
        } else {
          let iterationObj1 = {
            key: '[him/her]',
            value: 'her',
          };
          textArray.push(iterationObj1);
        }

        if (data.letter_fields[property] == 'Male') {
          let iterationObj2 = {
            key: '[he/she]',
            value: 'he',
          };
          textArray.push(iterationObj2);
        } else {
          let iterationObj2 = {
            key: '[he/she]',
            value: 'she',
          };
          textArray.push(iterationObj2);
        }

        if (data.letter_fields[property] == 'Male') {
          let iterationObj3 = {
            key: '[his/her]',
            value: 'his',
          };
          textArray.push(iterationObj3);
        } else {
          let iterationObj3 = {
            key: '[his/her]',
            value: 'her',
          };
          textArray.push(iterationObj3);
        }
      }
      // if(property == 'user_name'){
      //     let iterationObj = {
      //         "key": '[name]',
      //         "value": data.letter_fields[property]
      //     }
      // textArray.push(iterationObj)
      // }
      else if (property == 'role') {
        let iterationObj = {
          key: '[designation]',
          value: data.letter_fields[property],
        };
        textArray.push(iterationObj);
      } else if (property == 'loan_amount_word') {
        let iterationObj = {
          key: '[loanAmountInWords]',
          value: data.letter_fields[property],
        };
        textArray.push(iterationObj);
      } else if (property == 'work_start_date') {
        let iterationObj = {
          key: '[doj]',
          value: computeDateNewRequest(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      } else if (property == 'total_fixed_word') {
        let iterationObj = {
          key: '[totalFixedWord]',
          value: data.letter_fields[property],
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[salaryInWords]',
          value: data.letter_fields[property],
        };
        textArray.push(iterationObj);
      } else if (property == 'total_fixed') {
        let iterationObj = {
          key: '[empTotalFixed]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[totalFixed]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      } else if (property == 'basic_salary_word') {
        let iterationObj = {
          key: '[basicSalaryInWords]',
          value: data.letter_fields[property],
        };
        textArray.push(iterationObj);
      } else if (property == 'basic_salary') {
        let iterationObj = {
          key: '[empBasicSalary]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[basicSalary]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      } else if (property == 'accommodation_allowance') {
        let iterationObj = {
          key: '[accommodation_allowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[accommodationallowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      } else if (property == 'medical_allowance') {
        let iterationObj = {
          key: '[medical_allowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[medicalallowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      } else if (property == 'transport_allowance') {
        let iterationObj = {
          key: '[transport_allowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[transportallowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      } else if (property == 'other_allowance') {
        let iterationObj = {
          key: '[other_allowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
        iterationObj = {
          key: '[otherallowance]',
          value: thousandSeparator(data.letter_fields[property]),
        };
        textArray.push(iterationObj);
      }
    }
  }
  for (let index = 0; index < data.letter_keys.length; index++) {
    const element = data.letter_keys[index];
    if (element.value) {
      if (element.name.key == '[newAllowance]') {
        let iterationObj = {
          key: element.name.key,
          value: thousandSeparator(parseFloat(element.value)),
        };
        textArray.push(iterationObj);
      } else if (element.name.key == '[currentAllowance]') {
        let iterationObj = {
          key: element.name.key,
          value: thousandSeparator(parseFloat(element.value)),
        };
        textArray.push(iterationObj);
      } else if (element.name.key == '[newEmpBasicSalary]') {
        let iterationObj = {
          key: element.name.key,
          value: thousandSeparator(parseFloat(element.value)),
        };
        textArray.push(iterationObj);
      } else if (element.type == 'Date Picker') {
        let iterationObj = {
          key: element.name.key,
          value: computeDateNewRequest(element.value),
        };
        textArray.push(iterationObj);
      } else {
        let iterationObj = {
          key: element.name.key,
          value: element.value,
        };
        textArray.push(iterationObj);
      }
    } else {
      let iterationObj = {
        key: element.name.key,
        value: '',
      };
      textArray.push(iterationObj);
    }
  }
  let obj = {
    replaceText: JSON.stringify(textArray),
    replaceTable: JSON.stringify([{ tablename: 'Products', table: [{ description: 'item1', quantity: '42' }] }]),
    replaceImage: JSON.stringify([
      {
        key: 'logo',
        value:
          data.letterImages && data.letterImages.signatureLink
            ? data.letterImages.signatureLink
            : 'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg',
      },
      {
        key: 'stamp',
        value:
          data.letterImages && data.letterImages.companyStampLink
            ? data.letterImages.companyStampLink
            : 'https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg',
      },
    ]),
    content: data.content,
  };
  return obj;
}

const getLetterAdditionalFieldData = async function (lettersInfo) {
  var ExtrafieldsPayload;

  try {
    // const UserDetails = await UsersModel.findById({
    //   _id: lettersInfo.user_id,
    // });
    let UserDetailselem = await Users.aggregate([
      { $match: { _id: ObjectId(lettersInfo.user_id) } },
      { $addFields: { companyId_objId: { $toObjectId: '$company_ID' } } },
      {
        $addFields: {
          companyId_objId: { $toObjectId: '$company_ID' },
          managerId_objId: { $toObjectId: '$reporting.manager' },
        },
      },
      {
        $lookup: {
          from: 'companies',
          let: {
            companyId: '$companyId_objId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$companyId'] }],
                },
              },
            },
            {
              $project: {
                _id: 0,
                company_name: 1,
                company_address: 1,
                company_phone: 1,
              },
            },
          ],
          as: 'array_company',
        },
      },
      { $unwind: '$array_company' },
      {
        $lookup: {
          from: 'users',
          let: {
            managerId: '$managerId_objId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$managerId'] }],
                },
              },
            },
            {
              $project: {
                _id: 0,
                attachments: {
                  $filter: {
                    input: '$attachments',
                    as: 'attachments',
                    cond: { $eq: ['$$attachments.documentType', 'signature'] },
                  },
                },
                first_name: 1,
                last_name: 1,
                middle_name: 1,
                email: 1,
                'personal.phone': 1,
                'personal.gender': 1,
              },
            },
          ],
          as: 'array_manager',
        },
      },
      { $unwind: '$array_manager' },
    ]);
    const UserDetails = UserDetailselem[0];
    const userSignatures = UserDetails.array_manager.attachments.length ? UserDetails.array_manager.attachments[0] : '';
    const signatureLinks = userSignatures ? userSignatures.link : '';
    //const obj = JSON.parse();

    let title = '';
    if (UserDetails.personal.gender === 'Male') {
      title = 'Mr.';
    } else if (UserDetails.personal.gender === 'Female') {
      title = UserDetails.personal.marital_status == 'Married' ? 'Mrs.' : 'Ms.';
    }

    let letter_keys = lettersInfo.letter_type.includes('Custom Letter') ? [] : lettersInfo.letter_keys;
    // totalFixedWord Data
    let filtered = letter_keys.filter((x) => x.id == '[totalFixedWord]');
    let total_fixed_word = filtered.length > 0 ? filtered[0].value : '';
    // totalFixedWord Data
    let filtered1 = letter_keys.filter((x) => x.id == '[basicSalaryInWords]');
    let basic_salary_word = filtered1.length > 0 ? filtered1[0].value : '';

    // loanAmountInWords Data
    let filtered2 = letter_keys.filter((x) => x.id == '[loanAmountInWords]');
    let loan_amount_word = filtered2.length > 0 ? filtered2[0].value : '';

    // personalLoanTable Data
    let filteredPer = letter_keys.filter((x) => x.id == '[personalLoanTable]');
    let personalLoan_table = filteredPer.length > 0 ? filteredPer[0].value : '';
    // personalLoanTable2 Data
    let filteredPer2 = letter_keys.filter((x) => x.id == '[personalLoanTable2]');
    let personalLoan_table2 = filteredPer2.length > 0 ? filteredPer2[0].value : '';
    // personalLoanTable3 Data
    let filteredPer3 = letter_keys.filter((x) => x.id == '[personalLoanTable3]');
    let personalLoan_table3 = filteredPer3.length > 0 ? filteredPer3[0].value : '';

    let funGetUserName = function (obj_userInfo) {
      var name = '';
      if (obj_userInfo.first_name != undefined) {
        name += obj_userInfo.first_name + ' ';
      }
      if (obj_userInfo.middle_name != undefined) {
        name += obj_userInfo.middle_name + ' ';
      }
      if (obj_userInfo.last_name != undefined) {
        name += obj_userInfo.last_name;
      }
      return name;
    };

    ExtrafieldsPayload = {
      nationality: UserDetails.personal.nationality,
      emp_id: UserDetails.emp_id,
      dob: UserDetails.personal.dob,
      first_name: UserDetails.first_name,
      last_name: UserDetails.last_name,
      user_name: UserDetails.first_name + ' ' + UserDetails.last_name,
      passport: UserDetails.documents.passport_number,
      passportexpiry: UserDetails.documents.passport_number,
      passportissue: UserDetails.documents.passport_number,
      role: UserDetails.personal.designation,
      total_fixed: UserDetails.salary['total_fixed'],
      totalFixed: UserDetails.salary.total_fixed, //creating another field for total fix base on how the letter  to avoid error in another letter
      basic_salary: UserDetails.salary['basic_salary'],
      accommodation_allowance: UserDetails.salary['accommodation_allowance'],
      medical_allowance: UserDetails.salary['medical_allowance'],
      transport_allowance: UserDetails.salary['transport_allowance'],
      other_allowance: UserDetails.salary['other_allowance'],
      housing_allowance: UserDetails.salary.housing_allowance,
      salaryTotalAmount:
        UserDetails.salary.housing_allowance + UserDetails.salary.basic_salary + UserDetails.salary.transport_allowance,
      work_start_date: UserDetails.date_of_joining,
      gender: UserDetails.personal.gender,
      bank: UserDetails.bank.bank_name,
      iban: UserDetails.bank.iban,
      account_number: UserDetails.bank.account_number,
      total_fixed_word: total_fixed_word,
      total_fixed_word: total_fixed_word,
      department: UserDetails.reporting.department,
      loan_amount_word: loan_amount_word,
      personalLoan_table: personalLoan_table,
      personalLoan_table2: personalLoan_table2,
      personalLoan_table3: personalLoan_table3,
      company: UserDetails.array_company,
      basic_salary_word: basic_salary_word,
      managername: funGetUserName(UserDetails.array_manager),
      manageremail: UserDetails.array_manager.email,
      managerphone: UserDetails.array_manager.personal.phone,
      managerheshe: UserDetails.array_manager.personal.gender == 'Male' ? 'he' : 'she',
      title: title,
      probationDate: moment(UserDetails.date_of_joining, 'YYYY-MM-DD')
        .add(UserDetails.employment.probation_days, 'days')
        .format('MMM DD, YYYY'),
      managerdesignation: UserDetails.array_manager.personal.designation,
      mobileNumber: UserDetails.personal.personal_phone,
      localAddress: UserDetails.personal.address,
      SGLAccomNo: UserDetails.personal.sglRoomNo,
      emiratesID: UserDetails.documents.emiratesID_number,
      emiratesExpiry: moment(UserDetails.documents.emiratesID_expiry).format('D MMMM YYYY'),
      empLastName: UserDetails.last_name,
      lineMangerSignature: signatureLinks,
      basicSalary: UserDetails.salary.basic_salary,
      transport_allowance: UserDetails.salary.transport_allowance,
      work_location: UserDetails.personal.work_location,
      visa_uid_number: UserDetails.documents.visa_uid_number,
      emiratesID_number: UserDetails.documents.emiratesID_number,
    };
  } catch (e) {
    console.log(e);
  }
  return ExtrafieldsPayload;
};

async function uploadLetterArrayBuffer(fileContent, type, letter_request, applicant) {
  try {
    const s3 = new AWS.S3({
      // accessKeyId: ID,
      // secretAccessKey: SECRET,
      region: 'eu-central-1',
    });

    let name = applicant.first_name + ' ' + letter_request.letter_type + '-' + new Date().getTime() / 1000 + '.pdf';

    const params = {
      Bucket: BUCKET_NAME + '/' + 'letters',
      Key: name,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: type,
    };

    /* Uploading files to the bucket */
    s3.upload(params, async function (err, data) {
      if (err) {
        throw err;
      } else {
        console.log(data.Location, '--data.Location');
        let update_req = await Requests.updateOne(
          { _id: ObjectId(letter_request._id) },
          { $set: { pdf_url: data.Location } }
        );
        return { name: params.Key, url: data.Location };
      }
    });
  } catch (error) {
    return error;
  }
}

module.exports = {
  toBase64,
  combineHtmlPreview,
  combineHtmlPDF,
  addTinymceClass,
  computeLetterAddressee,
  computeLetterContent,
  uploadLetter,
  getLetterObject,
  getLetterAdditionalFieldData,
  uploadLetterArrayBuffer,
  ReplaceLetterKeys,
};
