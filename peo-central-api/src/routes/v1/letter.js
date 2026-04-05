const express = require('express')
const router = express.Router()
const validateToken = require('../../../utils').validateAccessToken;
const requestsModel = require('../../models/requests')
const configurationModel = require('../../models/configuration.model')
const usersModel = require('../../models/users.model')
const companyModel = require('../../models/companies.model')
const pdf = require("pdf-creator-node");
const { Letters } = require("@nathangroup/letter");
const moment = require("moment");
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const AWS = require('aws-sdk');
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;
const letterConfigModel = require('../../models/letterConfig')

router.post('/letter_download', validateToken, async (req, res) => {
    try {
        const body = req.body

        const bln_newLetter = body.bln_newLetter

        const applicant = await usersModel.findOne({ _id: body.user_id }).select('personal company_ID first_name middle_name last_name documents date_of_joining bank salary')

        const applicant_company = await companyModel.find({ _id: ObjectId(applicant.company_id) }).select('company_name')
        const letter_request = await requestsModel.findOne({ _id: ObjectId(body.req_id) })
        const letter_request_styling = await letterConfigModel.findOne({ company_ID: req.user.company_ID }).select('letterRequest');
        let checking;

        for (const element of letter_request_styling.letterRequest) {
            if (element.letterDescription.requestType === letter_request.letter_type) {
                if (letter_request.letter_sub_type) {
                    if (element.letterDescription.requestSubType === letter_request.letter_sub_type) {
                        checking = element;
                    }
                } else {
                    checking = element;
                }
            }
        }

        if (applicant && applicant_company && letter_request && checking) {
            let preview_content = await combineHtmlPDF(applicant, checking, letter_request, applicant_company, bln_newLetter)

            let letter_header = await toBase64(letter_request.letterImages.headerImageLink)

            let letter_footer = await toBase64(letter_request.letterImages.footerImageLink)


            let header = "<img style='margin-top: -10px !important; padding:-10px; !important' width='100%' src='" + letter_header + "'><br><br>"
            let footer = "<img style='margin-top: 25px !important; padding:25px; !important' width='100%' src='" + letter_footer + "'><br><br>"

            var options = {
                format: "A4",
                orientation: "portrait",
                border: {
                    "top": "0px",            // default is 0, units: mm, cm, in, px
                    "right": "5mm",
                    "bottom": "5mm",
                    "left": "0px"
                },
                header: {
                    contents: header,
                    height: "25mm"
                },
                footer: {
                    contents: footer,
                    height: "33mm"
                }
            };

            var document = {
                html: addTinymceClass(`<div style='display:none'>` + header + `</div>` + `<div style='display:none'>` + footer + `</div>` + preview_content),
                data: {

                },
                path: "./output.pdf",
                type: "",
            };

            pdf.create(document, options).then((pdf_res) => {

                uploadLetter(pdf_res, letter_request, applicant)
                // res.download(pdf_res['filename'])
                res.status(200).json({ success: true, message: 'Success.', data: [] })
            }).catch((error) => {
                console.log("#log", error);
                res.status(200).json({ success: false, message: 'Unable to process letter pdf.', data: error })
            });

        } else {
            res.status(200).json({ success: false, message: 'Unable to process letter pdf.', data: [] })
        }

    } catch (error) {
        console.log("#log", error);
        res.status(500).send(error)
    }
})

async function toBase64(url) {
    // Required 'request' module
    const axios = require('axios')

    // Make request to our image url
    const image = await axios.get(url, {
        responseType: 'arraybuffer'
    });

    let type = image.headers["content-type"],
        prefix = "data:" + type + ";base64,"    
    const returnedB64 = prefix + Buffer.from(image.data).toString('base64')
    return returnedB64
}

router.post('/letter_preview', validateToken, async (req, res) => {
    try {
        const body = req.body

        const bln_newLetter = body.bln_newLetter

        const applicant = await usersModel.findOne({ _id: body.user_id }).select('personal company_ID first_name middle_name last_name documents date_of_joining bank salary')
        const applicant_company = await companyModel.find({ _id: ObjectId(applicant.company_id) }).select('company_name')

        const letter_request = await requestsModel.findOne({ _id: ObjectId(body.req_id) })

        const letter_request_styling = await letterConfigModel.findOne({ company_ID: req.user.company_id }).select('letterRequest');
        let checking;

        for (const element of letter_request_styling.letterRequest) {
            if (element.letterDescription.requestType === letter_request.letter_type) {
                if (letter_request.letter_sub_type) {
                    if (element.letterDescription.requestSubType === letter_request.letter_sub_type) {
                        checking = element;
                    }
                } else {
                    checking = element;
                }
            }
        }
        if (applicant && applicant_company && checking) {
            let preview_content = await combineHtmlPreview(applicant, checking, letter_request, applicant_company, bln_newLetter)
            res.status(200).json({ success: true, message: 'Letter preview', data: preview_content })
        } else {
            res.status(200).json({ success: false, message: 'Unable to process preview', data: [] })
        }

    } catch (error) {
        console.log("#log", error);
        res.status(500).send(error)
    }
})

async function combineHtmlPreview(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
    try {

        let LetterAddresseRepalce = await computeLetterAddressee(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter)
        let LetterContentRepalce = await computeLetterContent(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter)
        let combined = "";

        let footer = ""
        let signature = ""
        let stamp = ""
        let companyLogo = ""
        let signatory = {
            name: '',
            designation: ''
        }

        if (letter_request.previewStyles) {
            if (!letter_request.previewStyles.signature) {
                signature = ""
            } else {
                signature = ''
            }

            if (!letter_request.previewStyles.stamp) {
                stamp = ""
            } else {
                stamp = ''
            }

            if (!letter_request.previewStyles.header) {
                companyLogo = ""
            } else {
                companyLogo = letter_request.letterImages.headerImageLink
            }

            if (!letter_request.previewStyles.signatory) {
                signatory.name = ""
                signatory.designation = ""
            } else {
                signatory.name = letter_request.signatory.name
                signatory.designation = letter_request.signatory.designation
            }

            if (!letter_request.previewStyles.footer) {
                footer = ""
            } else {
                footer = letter_request.letterImages.footerImageLink
            }
        }

        /* This is Header */
        combined = combined.concat("<img src='" + companyLogo + "'><br><br>")

        /* This is Date */
        if (letter_request.previewStyles) {
            let date = "";
            if (letter_request.previewStyles.date_position == "text_alignment_left") {
                date = "<div style='text-align: left; font-size: 15px; color: black !important;'>Date : " + moment(String(letter_request.date_created)).format(letter_request.previewStyles.date_format) + "</div><br><br>";
                combined = combined.concat(date)

            } else if (letter_request.previewStyles.date_position == "text_alignment_right") {
                date = "<div style='text-align: right; font-size: 15px; color: black !important;'>Date : " + moment(String(letter_request.date_created)).format(letter_request.previewStyles.date_format) + "</div><br><br>"
                combined = combined.concat(date)

            } else {
                date = "<div style='text-align: center; font-size: 15px; color: black !important;'>Date : " + moment(String(letter_request.date_created)).format(letter_request.previewStyles.date_format) + "</div><br><br>"
                combined = combined.concat(date)

            }

        }

        /* This is Addressee */
        if (letter_request.previewStyles) {
            if (letter_request.previewStyles.addressee_position == "text_alignment_left") {
                combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important;'>" + LetterAddresseRepalce.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important;'") + "</p><br>")
            } else if (letter_request.previewStyles.addressee_position == "text_alignment_right") {
                combined = combined.concat("<p style='text-align: right; font-size: 15px; color: black !important;'>" + LetterAddresseRepalce.split('<p').join("<p style='text-align: right; font-size: 15px; color: black !important;'") + "</p><br>")
            }
        }

        /* This is Subject */
        if (letter_request.previewStyles) {
            if (letter_request.previewStyles.subject_position == "text_alignment_left") {
                combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important;'>" + letter_request.letter_fields.subject.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important;'") + "</p><br><br>")
            } else if (letter_request.previewStyles.subject_position == "text_alignment_right") {
                combined = combined.concat("<p style='text-align: right; font-size: 15px; color: black !important;'>" + letter_request.letter_fields.subject.split('<p').join("<p style='text-align: right; font-size: 15px; color: black !important;'") + "</p><br><br>")
            } else {
                combined = combined.concat("<p style='text-align: center; font-size: 15px; color: black !important;'>" + letter_request.letter_fields.subject.split('<p').join("<p style='text-align: center; font-size: 15px; color: black !important;'") + "</p><br><br>")
            }
        }

        /* This is Body */
        combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important;'>" + LetterContentRepalce.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important;'") + "</p><br>")

        /* This is Signature and Stamp */
        combined = combined.concat("<div style='display: grid; grid-template-columns: 150px 150px 150px;'><div>" + "<img width='100%' height='100%' src='" + signature + "'>" + "</div><div>" + "<img width='80%' height='80%' src='" + stamp + "'>" + "</div></div><br>")

        /* This is signatory */
        if (letter_request.previewStyles.signatory) {
            /* Name and Designation */
            combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important;'>" + signatory.name + "<br>" + signatory.designation + "</p>")

        }

        /* This is Header */
        combined = combined.concat("<br><br><img src='" + footer + "'>")

        return combined
    } catch (error) {
        console.log("#log", error);
        return error
    }
}

async function combineHtmlPDF(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
    try {
        let LetterAddresseRepalce = await computeLetterAddressee(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter)
        let LetterContentRepalce = await computeLetterContent(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter)

        LetterAddresseRepalce = LetterAddresseRepalce.split('</p><p>').join("<br>")
        LetterContentRepalce = LetterContentRepalce.split('<p><br></p>').join("<br><br>")
        LetterContentRepalce = LetterContentRepalce.split('</p><br><p>').join("</p><p>")

        let combined = "";

        let footer = ""
        let signature = ""
        let stamp = ""
        let companyLogo = ""
        let signatory = {
            name: '',
            designation: ''
        }

        // signature = 

        // stamp = await toBase64(letter_request.letterImages.footerImageLink)

        if (letter_request.pdfStyles) {
            if (!letter_request.pdfStyles.signature) {
                signature = ""
            } else {
                signature = await toBase64(letter_request.letterImages.signatureLink)
            }

            if (!letter_request.pdfStyles.stamp) {
                stamp = ""
            } else {
                stamp = await toBase64(letter_request.letterImages.companyStampLink)
            }

            if (!letter_request.pdfStyles.header) {
                companyLogo = ""
            } else {
                companyLogo = await toBase64(letter_request.letterImages.companyStampLink)
            }

            if (!letter_request.pdfStyles.signatory) {
                signatory.name = ""
                signatory.designation = ""
            } else {
                signatory.name = letter_request.signatory.name
                signatory.designation = letter_request.signatory.designation
            }

            // if (!letter_request.pdfStyles.footer) {
            //     footer = ""
            // } else {
            //     footer = await toBase64(letter_request.letterImages.footerImageLink)
            // }
        }

        combined = combined.concat(`<link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,700&display=swap" rel="stylesheet">`)

        /* This is Header */
        // combined = combined.concat("<img src='" + companyLogo + "'><br><br>")

        /* This is Date */
        if (letter_request.pdfStyles) {
            let date = "";
            if (letter_request.pdfStyles.date_position == "text_alignment_left") {
                date = "<br><br><div style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>Date : " + moment(String(letter_request.date_created)).format(letter_request.pdfStyles.date_format) + "</div>";
                combined = combined.concat(date)

            } else if (letter_request.pdfStyles.date_position == "text_alignment_right") {
                date = "<br><br><div style='text-align: right; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>Date : " + moment(String(letter_request.date_created)).format(letter_request.pdfStyles.date_format) + "</div>"
                combined = combined.concat(date)

            } else {
                date = "<br><br><div style='text-align: center; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>Date : " + moment(String(letter_request.date_created)).format(letter_request.pdfStyles.date_format) + "</div>"
                combined = combined.concat(date)

            }

        }

        LetterAddresseRepalce = LetterAddresseRepalce.split('<p').join("<p style='font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'")
        /* This is Addressee */
        if (letter_request.pdfStyles) {
            if (letter_request.pdfStyles.addressee_position == "text_alignment_left") {
                combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important;'>" + LetterAddresseRepalce + "</p>")
            } else if (letter_request.pdfStyles.addressee_position == "text_alignment_right") {
                combined = combined.concat("<p style='text-align: right; font-size: 15px; color: black !important;'>" + LetterAddresseRepalce + "</p>")
            }
        }

        /* This is Subject */
        if (letter_request.pdfStyles) {
            if (letter_request.pdfStyles.subject_position == "text_alignment_left") {
                letter_request.letter_fields.subject = letter_request.letter_fields.subject.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'") || letter_request.letter_fields.other_requests_subject.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'")
                combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" + letter_request.letter_fields.subject + "</p>")
            } else if (letter_request.pdfStyles.subject_position == "text_alignment_right") {
                letter_request.letter_fields.subject = letter_request.letter_fields.subject.split('<p').join("<p style='text-align: right; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'")
                combined = combined.concat("<p style='text-align: right; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" + letter_request.letter_fields.subject + "</p>")
            } else {
                letter_request.letter_fields.subject = letter_request.letter_fields.subject.split('<p').join("<p style='text-align: center; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'")
                combined = combined.concat("<p style='text-align: center; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" + letter_request.letter_fields.subject + "</p>")
            }
        }

        LetterContentRepalce = LetterContentRepalce.split('<p').join("<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0;'")
        /* This is Body */
        combined = combined.concat("<p style='text-align: left; font-size: 15px; color: black !important; margin:0; padding: 0; font-family: 'EB Garamond', serif;'>" + LetterContentRepalce + "</p>")

        /* This is Signature and Stamp */
        combined = combined.concat((`<p><table style="border-collapse: collapse; width: 66.0938%; height: 40px; border-width: 1px; border-style: hidden; margin-left: 0px; margin-right: auto;" border="0px"><colgroup><col style="width: 33.4375%;"><col style="width: 33.4375%;"><col style="width: 33.125%;"></colgroup>
                    <tbody>
                    <tr style="height: 40px;">
                    <td style="border-width: 1px; height: 40px;">`+ ((signature != '' && signature != undefined) ? `<img style="float: left;" src="${signature}" width="100%">` : '') + `</td>
                    <td style="border-width: 1px; height: 40px; text-align: right;">`+ ((stamp != '' && stamp != undefined) ? `<img style="float: left;" src="${stamp}" width="100%">` : '') + `</td>
                    <td style="border-width: 1px; height: 40px; text-align: left;">&nbsp;</td>
                    </tr>
                    </tbody>
                    </table><p>` + ((letter_request.pdfStyles.signatory) ? "<p style='text-align: left; font-size:13px; color: black !important; font-family: 'EB Garamond', serif;'>" + signatory.name + "<br>" + signatory.designation + "</p>" : '')).replace(/[\r\n]/gm, ''))


        /* This is Header */
        // combined = combined.concat("<br><br><img src='" + footer + "'>")


        return `<div style="padding-left: 30px !important; zoom: 0.65;">${combined}</div>`
    } catch (error) {
        console.log("#log", error);
        return error
    }
}

function addTinymceClass(val) {
    let tinycssString = `<html><head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link rel="stylesheet" type="text/css" id="mce-u0" crossorigin="anonymous" referrerpolicy="origin" href="https://cdn.tiny.cloud/1/no-api-key/tinymce/5.10.5-131/skins/ui/oxide/content.min.css">
    <link rel="stylesheet" type="text/css" id="mce-u1" crossorigin="anonymous" referrerpolicy="origin" href="//fonts.googleapis.com/css?family=Lato:300,300i,400,400i">
    <style type="text/css">body { font-family:Helvetica,Arial,sans-serif; font-size:14px }</style>
    </head>
    <body id="tinymce" class="mce-content-body " contenteditable="true" spellcheck="false">`

    return val.replace(/[\r\n]/gm, '').replace('<html><head></head><body>', tinycssString)
}

async function computeLetterAddressee(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
    try {

        const letterClass = new Letters()

        let body = await letterClass.computeLetterAddressee(applicant, obj_letterInfo, letter_request, bln_newLetter, applicant_company);

        return body

    } catch (error) {
        console.log("#log", error);
        return error
    }
}

async function computeLetterContent(applicant, obj_letterInfo, letter_request, applicant_company, bln_newLetter) {
    try {

        const letterClass = new Letters()

        let body = await letterClass.computeLetterContent(applicant, obj_letterInfo, letter_request, bln_newLetter, applicant_company);

        return body
    } catch (error) {
        console.log("#log", error);
        return error
    }
}

async function uploadLetter(file, letter_request, applicant) {
    try {

        const s3 = new AWS.S3({
            // accessKeyId: ID,
            // secretAccessKey: SECRET,
            // region: "eu-central-1",
        });

        const fileContent = fs.readFileSync(file.filename);

        let name = applicant.first_name + " " + letter_request.letter_type + "-" + new Date().getTime() / 1000 + ".pdf"

        const params = {
            Bucket: BUCKET_NAME + '/' + 'letters',
            Key: name,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: file.mimetype
        };

        /* Uploading files to the bucket */
        s3.upload(params, async function (err, data) {
            if (err) {
                throw err;
            }
            else {
                console.log(data.Location, "--data.Location")
                let update_req = await requestsModel.updateOne({ _id: ObjectId(letter_request._id) }, { $set: { pdf_url: data.Location } })
                return { name: params.Key, url: data.Location }
            }
        });
    } catch (error) {
        return error
    }
}

module.exports = router