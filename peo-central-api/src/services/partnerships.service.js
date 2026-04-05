const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Partner, Users } = require('../models');
const { ObjectId } = require('mongodb');
const { uploadFilesToS3, mimeTypeUpload } = require('./aws.service');
const cron = require('node-cron');
const { sendRawEmail } = require('../middlewares/email');
const XLSX = require('xlsx');
const excelReader = require('../helpers/excel-reader');
// const moment = require('moment');
const { formatDate } = require('../helpers/common');

// function formatDate(val) {
//   return val ? moment(val).format('DD-MMM-YYYY') : '';
// }
// function to fetch partner by id
const getPartnerById = async partnerId => {
  const response = await Partner.findOne({ is_deleted: false, _id: ObjectId(partnerId) });
  if (response && response.follow_up_date) {
    response.follow_up_date = formatDate(response.follow_up_date);
  }
  return response;
};

// function to create a new partner
const createPartner = async (reqBody, userId) => {
  let attachments;
  const body = { ...reqBody, createdBy: userId };
  const newPartner = await Partner.create(body);

  // if (files && files.attachments) {

  //   const uploadedFiles = await mimeTypeUpload(files.attachments, newPartner._id);

  //   attachments = uploadedFiles.map(file => ({
  //     url: file.url,
  //     file_name: file.file_name,
  //     mime_type: file.mime_type,
  //     size_in_bytes: file.size_in_bytes
  //   }));

  //   newPartner.documents = attachments;
  // }

  newPartner.documents = reqBody.attachments;
  await newPartner.save();

  return newPartner;
};

/**
 * Explanation for what this function does: {updatePartnership}
 * Retrieves the partner document by ID. If not found, throws an error.
 *Flattens the updateBody object into a new object updatableFields, handling nested objects.
 *If updateBody contains new points of contact, adds them to the partner document without duplicates.
 *Sets the updatedBy field to the logUserId.
 *Updates the partner document in the database using findOneAndUpdate.
 */
 const updatePartnership = async (partnerId, updateBody, logUserId) => {
  // First check if partner exists
  const partnerResult = await getPartnerById(partnerId);
  if (!partnerResult) {
    throw new Error('Partner not found');
  }

  // Initialize update object
  const updatableFields = {};

  // Handle attachments if present
  if (updateBody.attachments) {
    const existingAttachments = partnerResult.documents || [];
    const newAttachments = Array.isArray(updateBody.attachments) 
      ? updateBody.attachments 
      : [updateBody.attachments];

    delete updateBody.attachments;
    updatableFields.documents = [
      ...existingAttachments,
      ...newAttachments.map((attachment) => ({
        file_name: attachment.file_name,
        file_type: attachment.mime_type,
        file_size: attachment.size_in_bytes,
        url: attachment.url,
        updatedAt: new Date()
      }))
    ];
  }

  // Handle points of contact separately
  if (updateBody.points_of_contact?.additional_pocs) {
    const existingPOCs = partnerResult.points_of_contact.additional_pocs || [];
    const newPOCs = updateBody.points_of_contact.additional_pocs.filter(
      newPoc => !existingPOCs.some(existingPoc => existingPoc.email === newPoc.email)
    );

    delete updateBody.points_of_contact;
    if (newPOCs.length > 0) {
      updatableFields['points_of_contact.additional_pocs'] = [
        ...existingPOCs,
        ...newPOCs
      ];
    }
  }

  // Handle date fields specifically
  if (updateBody.follow_up_date) {
    updatableFields.follow_up_date = new Date(updateBody.follow_up_date);
    delete updateBody.follow_up_date;
  }

  // Handle remaining fields
  for (const [key, value] of Object.entries(updateBody)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle nested objects
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== null && nestedValue !== undefined) {
          updatableFields[`${key}.${nestedKey}`] = nestedValue;
        }
      });
    } else {
      updatableFields[key] = value;
    }
  }

  // Add updatedBy field
  updatableFields.updatedBy = logUserId;

  // Perform the update
  return await Partner.findOneAndUpdate(
    { _id: partnerId },
    { $set: updatableFields },
    { 
      new: true, 
      runValidators: true 
    }
  );
};

// Function to remove a partner doc
const removePartnerDocument = async (partnerId, documentId, logUserId) => {
  const partnerResult = await getPartnerById(partnerId);

  if (!partnerResult) {
    throw new Error('Partner not found');
  }

  const updatedAttachments = partnerResult.attachments.filter(
    attachment => attachment._id.toString() !== documentId
  );

  return await Partner.findOneAndUpdate(
    { _id: partnerId },
    {
      $set: {
        attachments: updatedAttachments,
        updatedBy: logUserId
      }
    },
    { new: true, runValidators: true }
  );
};

// function to mark partner as deleted
const deletePartnerById = async (partnerId, userId) => {
  const isPartner = await getPartnerById(partnerId);
  if (!isPartner) throw new ApiError(httpStatus.NOT_FOUND, `Could not find partner with provided id ${partnerId}`);
  isPartner.is_deleted = true;
  isPartner.deletedBy = userId;
  await isPartner.save();

  return { message: `Partner deleted succesfully!` };
};

// function to retun count of partners based on stage names
const getPartners = async (reqQuery) => {
  const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 30;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  let search;

  if (reqQuery.search) {
    search = new RegExp(reqQuery.search, 'i'); // Ensure partial match with case insensitivity
  }

  const peoServicesCountries = Array.isArray(reqQuery.peo_services_countries)
    ? reqQuery.peo_services_countries
    : reqQuery.peo_services_countries
    ? reqQuery.peo_services_countries.split(',')
    : [];

  const eorServicesCountries = Array.isArray(reqQuery.eor_services_countries)
    ? reqQuery.eor_services_countries
    : reqQuery.eor_services_countries
    ? reqQuery.eor_services_countries.split(',')
    : [];

  const eorServicesForExpats = Array.isArray(reqQuery.eor_services_for_expats)
    ? reqQuery.eor_services_for_expats
    : reqQuery.eor_services_for_expats
    ? reqQuery.eor_services_for_expats.split(',')
    : [];

  const ownEntityCountries = Array.isArray(reqQuery.own_entity_countries)
    ? reqQuery.own_entity_countries
    : reqQuery.own_entity_countries
    ? reqQuery.own_entity_countries.split(',')
    : [];

  const peoServicesRegex = peoServicesCountries.map(country => new RegExp(`^${country}$`, 'i'));
  const eorServicesRegex = eorServicesCountries.map(country => new RegExp(`^${country}$`, 'i'));
  const eorServicesForExpatsRegex = eorServicesForExpats.map(country => new RegExp(`^${country}$`, 'i'));
  const ownEntityRegex = ownEntityCountries.map(country => new RegExp(`^${country}$`, 'i'));

  let followUpDateFilter;
  if (reqQuery.follow_up_date) {
    const date = new Date(reqQuery.follow_up_date);
    if (!isNaN(date.getTime())) {
      followUpDateFilter = date;
    }
  }

  const baseMatch = {
    is_deleted: false,
    $and: [
      search
        ? {
            $or: [
              { company_name: search },
              { company_email: search },
              { peo_services_countries: search },
              { eor_services_countries: search },
              { eor_services_for_expats: search },
              { own_entity_countries: search }
            ]
          }
        : {},
      reqQuery.partnership_stage ? { partnership_stage: reqQuery.partnership_stage } : {},
      reqQuery.company_name ? { company_name: new RegExp(reqQuery.company_name, 'i') } : {},
      reqQuery.company_email ? { company_email: new RegExp(reqQuery.company_email, 'i') } : {},
      reqQuery.headquarters ? { headquarters: new RegExp(reqQuery.headquarters, 'i') } : {},
      followUpDateFilter ? { follow_up_date: followUpDateFilter } : {},
      peoServicesCountries.length ? { peo_services_countries: { $elemMatch: { $in: peoServicesRegex } } } : {},
      eorServicesCountries.length ? { eor_services_countries: { $elemMatch: { $in: eorServicesRegex } } } : {},
      eorServicesForExpats.length ? { eor_services_for_expats: { $elemMatch: { $in: eorServicesForExpatsRegex } } } : {},
      ownEntityCountries.length ? { own_entity_countries: { $elemMatch: { $in: ownEntityRegex } } } : {}
    ]
  };

  const pipeline = [
    {
      $match: baseMatch
    },
    {
      $sort: { [sortBy]: sort }
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit
    }
  ];

  // Pipeline to count total matching documents
  const totalPipeline = [
    {
      $match: baseMatch
    },
    {
      $count: 'totalCount'
    }
  ];

  const [response, totalCountResult] = await Promise.all([Partner.aggregate(pipeline), Partner.aggregate(totalPipeline)]);

  const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

  return {
    data: response,
    totalCount: totalCount,
    page: page,
    limit: limit
  };
};

// const getPartnershipStats = async () => {
//   // Define all possible stages
//   const stages = [
//     'Contacted',
//     'Discussion In Process',
//     'Signed Partnership',
//     'Successful Partnership',
//     'Unsuccessful Partnership'
//   ];

//   const result = await Partner.aggregate([
//     {
//       $match: { is_deleted: false }
//     },
//     {
//       $group: {
//         _id: '$partnership_stage',
//         count: { $sum: 1 }
//       }
//     },
//     {
//       $project: {
//         stage: '$_id',
//         count: 1,
//         _id: 0
//       }
//     },
//     {
//       $facet: {
//         stats: [
//           { $sort: { stage: 1 } } // Sort by stage if needed
//         ],
//         totalCount: [
//           {
//             $count: 'total'
//           }
//         ]
//       }
//     },
//     {
//       $addFields: {
//         stats: {
//           $map: {
//             input: stages,
//             as: 'stage',
//             in: {
//               stage: '$$stage',
//               count: {
//                 $ifNull: [
//                   {
//                     $arrayElemAt: [
//                       {
//                         $filter: {
//                           input: '$stats',
//                           cond: { $eq: ['$$this.stage', '$$stage'] }
//                         }
//                       },
//                       0
//                     ]
//                   },
//                   0
//                 ]
//               }
//             }
//           }
//         }
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         stats: { $arrayToObject: { $map: { input: '$stats', as: 's', in: { k: '$$s.stage', v: '$$s.count' } } } },
//         totalCount: { $arrayElemAt: ['$totalCount.total', 0] }
//       }
//     }
//   ]);

//   return result[0];
// };

const getPartnershipStats = async () => {
  // Define all possible stages
  const stages = [
    'Contacted',
    'Discussion In Process',
    'Signed Partnership',
    'Successful Partnership',
    'Unsuccessful Partnership'
  ];

  const result = await Partner.aggregate([
    {
      $match: { is_deleted: false }
    },
    {
      $group: {
        _id: '$partnership_stage',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        stage: '$_id',
        count: 1,
        _id: 0
      }
    },
    {
      $facet: {
        stats: [
          { $sort: { stage: 1 } } // Sort by stage if needed
        ],
        totalCount: [
          {
            $count: 'total'
          }
        ]
      }
    },
    {
      $addFields: {
        stats: {
          $map: {
            input: stages,
            as: 'stage',
            in: {
              k: '$$stage',
              v: {
                $let: {
                  vars: {
                    stageData: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$stats',
                            cond: { $eq: ['$$this.stage', '$$stage'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    count: { $ifNull: ['$$stageData.count', 0] },
                    stage: '$$stage'
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        stats: { $arrayToObject: '$stats' },
        totalCount: { $arrayElemAt: ['$totalCount.total', 0] }
      }
    }
  ]);

  return result[0];
};

const splitAndTrim = value => {
  if (!value || value.trim() === '') {
    return [];
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
};

const getData = data => {
  const header = data[0];
  return new Promise(resolve => {
    const temp = [];
    const partnershipData = data.filter(item => item.length > 0);

    let currentPartner = null;

    partnershipData.forEach((row, i) => {
      if (i > 0) {
        const formatted = formatRow(row, header);

        if (formatted['company_name']) {
          // New partner entry
          if (currentPartner) {
            temp.push(currentPartner);
          }

          const primaryPOC = {
            name: formatted['primary_poc_name'],
            email: formatted['primary_poc_email'],
            phone: formatted['primary_poc_phone']
          };
          const secondaryPOC = {
            name: formatted['secondary_poc_name'],
            email: formatted['secondary_poc_email'],
            phone: formatted['secondary_poc_phone']
          };
          const additionalPOCs = [];
          if (formatted['additional_poc_name']) {
            additionalPOCs.push({
              name: formatted['additional_poc_name'],
              email: formatted['additional_poc_email'],
              phone: formatted['additional_poc_phone']
            });
          }

          currentPartner = {
            company_name: formatted['company_name'],
            company_logo: formatted['company_logo'],
            company_url: formatted['company_url'],
            company_email: formatted['company_email'],
            headquarters: formatted['headquarters'],
            points_of_contact: {
              primary: primaryPOC,
              secondary: secondaryPOC,
              additional_pocs: additionalPOCs
            },
            partnership_stage: formatted['partnership_stage'],
            peo_services_countries: splitAndTrim(formatted['peo_services_countries']),
            eor_services_countries: splitAndTrim(formatted['eor_services_countries']),
            eor_services_for_expats: splitAndTrim(formatted['eor_services_for_expats']),
            own_entity_countries: splitAndTrim(formatted['own_entity_countries']),
            global_eor_provider_countries: splitAndTrim(formatted['global_eor_provider_countries']),
            pricing_details: {
              service_fees: formatted['pricing_details_service_fees'],
              contract_length: formatted['pricing_details_contract_length']
            },
            remarks: formatted['remarks'],
            // documents: splitAndTrim(formatted['documents']),
            follow_up_date: formatted['follow_up_date'] ? new Date(formatted['follow_up_date']) : null,
            reason_for_unsuccessful: formatted['reason_for_unsuccessful'],
            contacted_via: formatted['contacted_via']
            // is_deleted: formatted['is_deleted'].toLowerCase() === 'true'
          };
        } else if (currentPartner && formatted['additional_poc_name']) {
          // Additional POC for the current partner
          currentPartner.points_of_contact.additional_pocs.push({
            name: formatted['additional_poc_name'],
            email: formatted['additional_poc_email'],
            phone: formatted['additional_poc_phone']
          });
        }
      }
    });

    // Push the last partner
    if (currentPartner) {
      temp.push(currentPartner);
    }

    resolve(temp);
  });
};

const formatRow = (row, header) => {
  return header.reduce((acc, key, index) => {
    acc[key] = row[index] !== undefined ? row[index].toString() : '';
    return acc;
  }, {});
};

const bulkUploadPartners = async req => {
  let result = { message: null, error: null, duplicates: [], added: 0, errors: [] };

  try {
    console.log('Start of req files:', req.files);

    const filename = req.files.file.tempFilePath;
    console.log('Reading file:', filename);

    const workbook = XLSX.readFile(filename);

    // Loop through all sheets in the workbook
    for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
      const sheetName = workbook.SheetNames[sheetIndex];
      console.log(`Processing sheet: ${sheetName}`);

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log('Parsed data from sheet:', sheetName, data);

      const items = await getData(data);

      console.log('Processed items:', items);

      for (let i = 0; i < items.length; i++) {
        const info = items[i];
        console.log('Checking for existing partner:', info.company_name);

        const existing = await Partner.findOne({ company_name: info.company_name });

        if (existing) {
          result.duplicates.push(info.company_name);
        } else {
          try {
            await Partner.create(info);
            result.added++;
          } catch (error) {
            console.error(`Error adding partner ${info.company_name}:`, error);
            result.errors.push({ company: info.company_name, error: error.message });
          }
        }
      }
    }

    if (result.added > 0) {
      result.message = `Successfully added ${result.added} partnerships.`;
    } else {
      result.message = 'No new partnerships were added.';
    }

    if (result.duplicates.length > 0) {
      result.message += ` ${result.duplicates.length} duplicate(s) found.`;
    }

    if (result.errors.length > 0) {
      result.message += ` ${result.errors.length} error(s) occurred.`;
    }

    return result;
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return { message: `Error: ${error.message}`, error: true };
  }
};


cron.schedule(
  '0 2 * * *', // Schedule to run daily at 2 AM
  async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of the day

    console.log('Running task at 2 AM to send follow-up emails', today);

    try {
      // Find partnerships with follow_up_date set to today and not deleted
      const partnerships = await Partner.find({
        follow_up_date: { $gte: startOfDay, $lte: endOfDay },
        is_deleted: false
      }).populate('createdBy');
      const internalContactPerson = await Users.findOne({'employment.isPartershipContact': true, is_deleted: false}).select('email first_name last_name');
      if (partnerships.length > 0) {
        for (const partnership of partnerships) {
          // Prepare email details
          const primaryPOC = partnership.points_of_contact.primary;
          const emailSubject = `Follow-up Reminder for ${partnership.company_name}`;
          const emailBody = `
            <p>Dear ${internalContactPerson.first_name} ${internalContactPerson.last_name},</p><br/>
            <p>This is a friendly reminder to follow up on the partnership with ${partnership.company_name}.
            Please check the status and take any necessary actions.</p>

            <p>Regards,</p>
            <p>PEO Central Team</p>
            <p>Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates</p>
          `;

          // Construct mail body
          const mailbody = {
            to: [internalContactPerson.email],
            subject: emailSubject,
            text: emailBody,
            cc: [],
            attachments: []
          };

          // Send email
          await sendRawEmail(mailbody.to, mailbody.subject, mailbody.text, mailbody.cc, mailbody.attachments);

          console.log(`Email sent to ${primaryPOC.email} for partnership: ${partnership.company_name}`);
        }
      } else {
        console.log('No partnerships require follow-up today.');
      }
    } catch (error) {
      console.error('Error running follow-up email cron job:', error);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Dubai'
  }
);

module.exports = {
  updatePartnership,
  deletePartnerById,
  getPartnerById,
  getPartners,
  createPartner,
  getPartnershipStats,
  bulkUploadPartners
};
/**
 * ===================================================================
 *
 * Note that the option to upload files has some commented code
 * The commented code can optionally save these attachments in a different format capturing the mime tyoes
 * However, for this to work, this has to be reflected on the model
 * Specifically, the documents field should be re-adjusted.
 *
 * ===================================================================
 */
