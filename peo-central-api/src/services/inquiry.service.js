const {
  freelancerVisaEmails,
  managed_hr_emails,
  tech_services,
  nathanhr_services,
  service_mapping,
  all_services
} = require('../constants/leads.constant');
const logger = require('../middlewares/logger');
const cron = require('node-cron');

const { Inquiry, Companies, ChartOfAccounts, Processes, DocumentTemplatesClone, Users } = require('../models');
const companiesService = require('./companies.service');
const leadsService = require('./leads.service');
const activityService = require('./activities.service');
const loggerService = require('./loggers.service');
const pick = require('../utils/pick');
const { ObjectId } = require('mongodb');
const { sendRawEmail } = require('../middlewares/email');
const documentTemplateService = require('./document_template.service');
const documentTemplateCloneService = require('./document_template_clone.service');
const emailTemplateService = require('./email_template.service');

// TODO: add activity logs

const findInquiryById = async (inquiryId = null) => {
  if (!inquiryId) {
    console.log('Invalid ObjectId:', inquiryId);
    return null; // Invalid ID, just return null
  }

  try {
    return await Inquiry.findOne({ _id: new ObjectId(inquiryId) });
  } catch (error) {
    // Only throw if the database query fails for valid ObjectId
    throw new Error(`Failed to fetch inquiry: ${error.message}`);
  }
};

const createInquiry = async signupData => {
  try {
    const today = new Date();

    if (all_services.includes(signupData?.type)) {
      signupData.lead_handler = {
        email: signupData.lead_handler,
        cc: []
      };
    }

    const formattedPhone = signupData?.phone ? signupData?.phone.replace(/\s+/g, '') : '';

    const inquiryData = {
      name: signupData?.name,
      country: signupData?.country,
      phone: formattedPhone,
      company_name: signupData?.details?.company_name || '',
      country_code: signupData?.countryCode ?? signupData?.country_code,
      email: signupData?.email,
      type: signupData?.type,
      lead_handler: {
        email: signupData.lead_handler,
        cc: []
      },
      message: signupData?.message ?? '',
      date_created: today,
      details: signupData?.details,
      keyword: signupData?.source ?? '',
      city: signupData?.city ?? '',
      country_residence: signupData?.country,
      source: signupData?.source,
      costingData: signupData.costingData ?? signupData.costingData,
      promo_code: signupData.promo_code ?? 0
    };

    const result = await Inquiry.create(inquiryData);

    return result;
  } catch (error) {
    throw error;
  }
};

const filterInquiriesTest = async (filterPayload, queryOptions) => {
  try {
    const params = pick(queryOptions, [('limit', 'page', 'sortBy', 'end_date', 'start_date', 'search')]);

    const options = {
      limit: params.limit || 10,
      page: params.page || 1,
      sortBy: params.sortBy || 'date_created:asc'
    };
    let filter = {};

    // if (filterPayload?.inquiry_module) {
    //   const module = filterPayload.inquiry_module;
    //   filter = {
    //     ...filter,
    //     'archived_data.status': module === 'archived-inquiries',
    //     ...(module === 'new-inquiries' && { is_assign: false }),
    //     ...(module === 'assigned-inquiries' && { is_assign: true })
    //   };
    // }
    if (filterPayload?.inquiry_module) {
        const moduleFilters = {
          'archived-inquiries': { 'archived_data.status': true },
          'new-inquiries': { 'archived_data.status': false, is_assign: false },
          'assigned-inquiries': { 'archived_data.status': false, is_assign: true }
        };
        Object.assign(filter, moduleFilters[filterPayload.inquiry_module] || {});
      }
    if (filterPayload.start_date) {
      filter = {
        ...filter,
        date_created: {
          $gte: new Date(filterPayload.start_date)
        }
      };
    }
    if (filterPayload.end_date) {
      filter = {
        ...filter,
        date_created: {
          $lte: new Date(filterPayload.end_date)
        }
      };
    }

    const matchStage = {};

    // Add start_date filter if provided
    if (params?.start_date) {
      matchStage.date_created = {
        ...matchStage.date_created,
        $gte: new Date(params.start_date)
      };
    }

    // Add end_date filter if provided
    if (params?.end_date) {
      matchStage.date_created = {
        ...matchStage.date_created,
        $lte: new Date(params.end_date)
      };
    }

    // Add search filter if non-empty string
    if (params?.search && typeof params.search === 'string' && params.search.trim() !== '') {
      matchStage.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { phone: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { company_name: { $regex: params.search, $options: 'i' } },
      ];
    }

    const aggregation = [];

    if (Object.keys(matchStage).length > 0) {
      aggregation.push({ $match: matchStage });
    }

    // Lookup user details
    aggregation.push(
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Lookup lead details
    aggregation.push(
      {
        $lookup: {
          from: 'leads',
          localField: 'lead_id',
          foreignField: '_id',
          as: 'lead'
        }
      },
      {
        $unwind: {
          path: '$lead',
          preserveNullAndEmptyArrays: true
        }
      }
    );

    console.log('aggregation filter: ', aggregation);
    console.log('options filter: ', options);
    console.log(' filter: ', filter);

    return Inquiry.paginateLookup(filter, options, aggregation);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch inquiries');
  }
};
const filterInquiries = async (filterPayload, queryOptions) => {
  try {
    const params = pick(queryOptions, ['limit', 'page', 'sortBy', 'end_date', 'start_date', 'search']);

    const options = {
      limit: params.limit || 10,
      page: params.page || 1,
      sortBy: params.sortBy || '_id:-1'
    };

    const matchStage = {};

    // Add inquiry_module filter
    if (filterPayload?.inquiry_module) {
      const moduleFilters = {
        'archived-inquiries': { 'archived_data.status': true },
        'new-inquiries': { 'archived_data.status': false, is_assign: false },
        'assigned-inquiries': { 'archived_data.status': false, is_assign: true }
      };
      Object.assign(matchStage, moduleFilters[filterPayload.inquiry_module] || {});
    }

    // Add date filters (check both filterPayload and params)
    if (filterPayload?.start_date || params?.start_date) {
      const startDate = filterPayload.start_date || params.start_date;
      matchStage.date_created = {
        ...matchStage.date_created,
        $gte: new Date(startDate)
      };
    }

    if (filterPayload?.end_date || params?.end_date) {
      const endDate = filterPayload.end_date || params.end_date;
      matchStage.date_created = {
        ...matchStage.date_created,
        $lte: new Date(endDate)
      };
    }

    // Add search filter
    if (params?.search && typeof params.search === 'string' && params.search.trim() !== '') {
      matchStage.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { phone: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { company_name: { $regex: params.search, $options: 'i' } },
      ];
    }

    const aggregation = [];

    // Add match stage first if we have any filters
    if (Object.keys(matchStage).length > 0) {
      aggregation.push({ $match: matchStage });
    }

    // Lookup user details
    aggregation.push(
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Lookup lead details
    aggregation.push(
      {
        $lookup: {
          from: 'leads',
          localField: 'lead_id',
          foreignField: '_id',
          as: 'lead'
        }
      },
      {
        $unwind: {
          path: '$lead',
          preserveNullAndEmptyArrays: true
        }
      }
    );

    console.log('matchStage: ', matchStage);
    console.log('aggregation filter: ', aggregation);
    console.log('options filter: ', options);

    // Pass empty filter object since all conditions are now in the aggregation pipeline
    return Inquiry.paginateLookup({}, options, aggregation);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch inquiries');
  }
};

const getInquiryCounts = async () => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          new_inquiries: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$is_assign', false] }, { $eq: ['$archived_data.status', false] }]
                },
                1,
                0
              ]
            }
          },
          assigned_inquiries: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ['$is_assign', true] }, { $eq: ['$archived_data.status', false] }]
                },
                1,
                0
              ]
            }
          },
          archived_inquiries: {
            $sum: {
              $cond: [{ $eq: ['$archived_data.status', true] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          new_inquiries: 1,
          assigned_inquiries: 1,
          archived_inquiries: 1
        }
      }
    ];

    const result = await Inquiry.aggregate(pipeline);
    return result[0];
  } catch (error) {
    throw error;
  }
};

function logLeadsCreation(userId, leads) {
  const logMsg = `User ${userId} Created Lead ${leads._id}`;
  return logMsg;
}

/**
 * ===================================================================================================
 * Function to create lead from inquiry doc
 * ===================================================================================================
 */
const createLead = async (leadData, req) => {
  try {
    console.log(leadData, 'and this is the name', leadData.name);
    let created_company_id;
    // if (!leadData.company_id || toLower(leadData.client_type) === 'new client') {

    const formattedPhone = leadData?.phone ? leadData?.phone.replace(/\s+/g, '') : '';
    const company_name = leadData?.details?.company_name || '';

    // add user as first contact person
    const contact_person = {
      name: leadData.name || '',
      phone: formattedPhone,
      email: leadData?.email || '',
      designation: 'HR Point of Contact'
    };

    const companyBody = {
      legal_name: company_name,
      company_name: company_name,
      registration_number: '',
      trn_number: '',
      logo: '',
      company_phone: leadData.phone,
      company_address: '',
      country: leadData.country,
      city: leadData.city || '',
      company_email: leadData.email,
      unique_code: '',
      company_details: {},
      reference_number: '',
      phone: formattedPhone,
      email: leadData.email,
      website: '',
      contact_person: [contact_person],
      business_industry: '',
      no_of_employees: 0,
      company_notes: '',
      bank_details: [
        {
          bank_name: '',
          account_number: '',
          bank_address: '',
          iban: '',
          salary_payment_mode: ''
        }
      ],
      billing_address: {
        company_name: company_name,
        address_line1: '',
        address_line2: '',
        city: leadData.city || '',
        state: '',
        zip: '',
        country: leadData.country || '',
        phone: leadData.phone || '',
        email: ''
      },
      shipping_address: {
        company_name: company_name,
        address_line1: '',
        address_line2: '',
        city: leadData.city || '',
        state: '',
        zip: '',
        country: leadData.country || '',
        phone: formattedPhone,
        special_instructions: ''
      },
      status: 'new',
      isDraft: true
    };
    console.log(companyBody.company_name, 'the company name now------------>');
    const company_created = await companiesService.createCompany(companyBody, req?.userId);
    created_company_id = company_created._id;
    const data = await ChartOfAccounts.find({ code: 'AR' });
    const count = data.length;
    const {
      account_type,
      company,
      details_type,
      name,
      _id,
      is_balance_sheet,
      account_id,
      isDebitAccount,
      trialBalanceDebitType,
      isReportValuePositive,
      city
    } = data[0];
    // const accountObj = {
    //   name: `AR-${leadData.company_details.company_name}`,
    //   company: ObjectId(company),
    //   account_id: account_id + '-' + count.toString().padStart(3, '0'),
    //   account_type: account_type,
    //   details_type: details_type,
    //   base_view: true,
    //   description: '',
    //   parent_account_id: _id,
    //   parent_account_name: name,
    //   is_balance_sheet: is_balance_sheet,
    //   customer: created_company_id,
    //   isDebitAccount: isDebitAccount,
    //   trialBalanceDebitType: trialBalanceDebitType,
    //   isReportValuePositive: isReportValuePositive,
    //   is_sub: true,
    //   city: city
    // };
    // const accRcvblCrt = await ChartOfAccounts.create(accountObj);
    // }
    let processArray = await Processes.find({ process_name: 'lead process' });
    let leadsBody = {
      lead_name: leadData.company_name,
      company_id: leadData.company_id,
      user_id: req.body.proID, // assigned PRO
      client_type: leadData.client_type || 'New Client',
      service_type: leadData?.type || 'PEO/EOR Services',
      contact_person: contact_person,
      decision_maker_involvement: leadData.decision_maker_involvement || '',
      lead_details: {
        inquiry_type: '',
        lead_rating: '',
        lead_action: '',
        // opportunity_type: '',
        status: '',
        overall_total_order_value: 0,
        deal_size: '',
        eor_requirements: '',
        requirements: leadData?.message || '',
        // service_location: leadData?.country || '',
      },
      processes: [],
      status: 'Lead Received',
    };
    let docCloneIds = [];
    const documents = await Promise.all(
      processArray[0].stages.map(async process => {
        const documentActions = await Promise.all(
          process.actions.map(async action => {
            if (action.action_type === 'document') {
              const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
              const template = document_template;
              template.auto_replace_keys.forEach(replaceKeys => {
                replaceKeys.fk_id = '';
              });
              let templateBody = {
                auto_replace_keys: template.auto_replace_keys,
                user_input_keys: template.user_input_keys,
                name: template.name,
                content: template.content,
                module: template.module
              };
              const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
                templateBody
              );
              action.template_id = create_document_template_clone._id;
              leadsBody.processes = processArray[0].stages;
              docCloneIds.push({ _id: create_document_template_clone._id });
              return true;
            }
            leadsBody.processes = processArray[0].stages;
            return false;
          })
        );
        if (documentActions.some(Boolean)) {
          return process;
        }
      })
    );
    const newCreatedLead = await leadsService.creationOfLeads(leadsBody, created_company_id);
    const created_by = await leadsService.updateCreatedBy(newCreatedLead._id, req.userId);
    const logMessage = logLeadsCreation(req.userId, newCreatedLead);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      newCreatedLead._id,
      'leads',
      {},
      newCreatedLead,
      {},
      logMessage
    );
    const logString = logger.info(`${req.userName} Created a Leads with ID ${newCreatedLead._id}`).transports[0].logString;
    await loggerService.createLogger('leads', req.userId, logString);
    await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: newCreatedLead._id } });
    return newCreatedLead;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch inquiries');
  }
};

/**
 * ===================================================================================================
 * Function to assign leed to public relations officer
 * Updates Inquiry doe:
 * Sets inquiry owner to the assigned PRO and updates is_assigned to true
 * Then creates a leed on leads model
 * ===================================================================================================
 */
// const assignToPRO = async (payload, req) => {
//   try {
//     const { inquiryID, proID } = payload;
//     // await Inquiry.updateOne({ _id: inquiryID }, { $set: { inquiry_owner: proID, is_assign: true } });
//     const proDoc = await Users.findById(proID);
//     if (!proDoc) {
//       throw new Error('PRO not found');
//     }
//     const inquiryDoc = await findInquiryById(inquiryID);

//     const lead = await createLead(inquiryDoc, req);
//     const assign_logger = {
//       assigned_by: req.userId,
//       user_id: proID,
//       date: new Date()
//     };
//     await Inquiry.updateOne(
//       { _id: ObjectId(inquiryID) },
//       {
//         $set: {
//           ownerId: proID,
//           assigned_by: req.userId,
//           assign_logger,
//           is_assign: true,
//           lead_id: ObjectId(lead._id),
//           user_id: ObjectId(proID)
//         }
//       }
//     );

//     const emailTemp = await emailTemplateService.getEmailTemplateByName({
//       templateName: 'Inquiry Assigned to PRO'
//     });
//     if (!emailTemp) {
//       throw new Error('Email template not found');
//     }
//     const body = {
//       isInquiryEmail: true,
//       inquiryName: inquiryDoc.name,
//       inquiryType: inquiryDoc.type,
//       inquiryEmail: inquiryDoc.email,
//       inquiryPhone: inquiryDoc.phone
//     };
//     const replacedTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
//       emailTemp._id,
//       proID,
//       body,
//       null,
//       null,
//       false
//     );
//     if (!replacedTemplt) {
//       throw new Error('Replaced template not found for PRO assignment');
//     }
//     await sendRawEmail([proDoc.email], replacedTemplt.subject, replacedTemplt.content, replacedTemplt.cc, []);
//     return inquiryDoc;
//   } catch (error) {
//     throw error;
//   }
// };


const assignToPRO = async (payload, req, options = {}) => {
  try {
    const { inquiryID, proID } = payload;
    const { skipLead = false, emailOnly = false, emailData = {} } = options;

    const proDoc = await Users.findById(proID);
    if (!proDoc) throw new Error('PRO not found');

    const inquiryDoc = await findInquiryById(inquiryID || null);
    let lead = null;

    // 🔁 Create lead only if not skipping and not emailOnly
    if (!skipLead && !emailOnly && inquiryDoc) {
      lead = await createLead(inquiryDoc, req);
    }

    // 🔁 Assign only if not emailOnly
    if (!emailOnly) {
      const assign_logger = {
        assigned_by: req.userId,
        user_id: proID,
        date: new Date(),
      };

      const updatePayload = {
        $set: {
          ownerId: proID,
          assigned_by: req.userId,
          assign_logger,
          is_assign: true,
          user_id: ObjectId(proID),
        },
      };

      if (lead) updatePayload.$set.lead_id = ObjectId(lead._id);

      await Inquiry.updateOne({ _id: ObjectId(inquiryID) }, updatePayload);
    }

    // 📧 Always send email
    const emailTemp = await emailTemplateService.getEmailTemplateByName({
      templateName: 'Inquiry Assigned to PRO',
    });

    if (!emailTemp) throw new Error('Email template not found');

    // 🧩 Merge email body with overrides
    const defaultBody = {
      isInquiryEmail: true,
      inquiryName: inquiryDoc?.name || '',
      inquiryType: inquiryDoc?.type || '',
      inquiryEmail: inquiryDoc?.email || '',
      inquiryPhone: inquiryDoc?.phone || '',
    };

    const body = { ...defaultBody, ...emailData };

    const replacedTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
      emailTemp._id,
      proID,
      body,
      null,
      null,
      false
    );

    if (!replacedTemplt) throw new Error('Replaced template not found for PRO assignment');

    await sendRawEmail([proDoc.email], replacedTemplt.subject, replacedTemplt.content, replacedTemplt.cc, []);

    return inquiryDoc;
  } catch (error) {
    throw error;
  }
};


const deleteEnquiry = async (inquiryId, userId, reason = '') => {
  try {
    const isExistingInquiry = await findInquiryById(inquiryId);
    if (!isExistingInquiry) {
      throw new Error('Inquiry not found');
    }
    isExistingInquiry.archived_data = {
      status: true,
      reason,
      archivedAt: new Date(),
      archivedBy: userId
    };
    isExistingInquiry.is_deleted = true;
    isExistingInquiry.deletedBy = userId;
    await isExistingInquiry.save();
  } catch (error) {
    throw error;
  }
};

const restoreArchivedInquiry = async (inquiryId, userId, reason = '') => {
  try {
    const isExistingInquiry = await findInquiryById(inquiryId);
    if (!isExistingInquiry) {
      throw new Error('Inquiry not found');
    }

    // Preserve the original archive data and add restoration info
    const originalArchiveReason = isExistingInquiry.archived_data?.reason || '';

    isExistingInquiry.archived_data = {
      status: false,
      reason: originalArchiveReason, // Keep original archive reason
      restoreReason: reason, // Add restoration reason
      restoreBy: userId,
      restoredAt: new Date()
    };
    isExistingInquiry.is_deleted = false;
    isExistingInquiry.deletedBy = userId;
    await isExistingInquiry.save();
  } catch (error) {
    throw error;
  }
};

const reassignToPRO = async (payload, req) => {
  try {
    const { inquiryID, reassignTo } = payload;

    const newProDoc = await Users.findById(reassignTo);
    if (!newProDoc) {
      throw new Error('New PRO not found');
    }

    const inquiryDoc = await findInquiryById(inquiryID);
    if (!inquiryDoc) {
      throw new Error('Inquiry not found');
    }

    // Add to assignment history (assign_logger)
    const newLog = {
      user_id: reassignTo,
      assigned_by: req.userId,
      date: new Date(),
      note: 'Reassigned to new PRO'
    };

    await Inquiry.updateOne(
      { _id: ObjectId(inquiryID) },
      {
        $set: {
          ownerId: reassignTo,
          assigned_by: req.userId,
          is_assign: true,
          user_id: ObjectId(reassignTo),
          enquiry_status: 'in-progress'
        },
        $push: {
          assign_logger: newLog
        }
      }
    );

    // update lead owner
    await leadsService.updateLeadOwnership(inquiryDoc?.lead_id, reassignTo);

    // Send email notification to the new PRO
    const emailTemp = await emailTemplateService.getEmailTemplateByName({
      templateName: 'Inquiry Assigned to PRO'
    });
    if (!emailTemp) {
      throw new Error('Email template not found');
    }
    const body = {
      isInquiryEmail: true,
      inquiryName: inquiryDoc?.name,
      inquiryType: inquiryDoc?.type,
      inquiryEmail: inquiryDoc?.email,
      inquiryPhone: inquiryDoc?.phone
    };
    const replacedTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
      emailTemp._id,
      reassignTo,
      body,
      null,
      null,
      false
    );
    if (!replacedTemplt) {
      throw new Error('Replaced template not found for PRO reassignment');
    }

    await sendRawEmail([newProDoc.email], replacedTemplt.subject, replacedTemplt.content, replacedTemplt.cc, []);

    return { message: 'Inquiry successfully reassigned', inquiry: inquiryDoc };
  } catch (error) {
    throw error;
  }
};

// create cron job to run everyday at 1:00pm and console something
cron.schedule(
  '0 2 * * *',
  async () => {
    console.log('Running cron job at 1:00 PM');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    try {
      const dueInquiries = await Inquiry.find({
        due_date: {
          $gte: startOfToday,
          $lte: endOfToday
        },
        status: {
          $in:['in progress', 'pending']
        }
      });

      if (!dueInquiries || dueInquiries.length === 0) {
        console.log('No due inquiries for today.');
        return;
      }

      const taskReminderTemplate = await emailTemplateService.getEmailTemplateByName({
        templateName: 'Inquiry Task Reminder Email'
      });

      if (!taskReminderTemplate) {
        console.error('PRO Task reminder Email template not found');
        return;
      }

      await Promise.allSettled(
        dueInquiries.map(async (inquiry, i) => {
          try {
            const assignedPro = await Users.findById(inquiry.user_id);
            if (!assignedPro) {
              console.warn(`User not found for inquiry ${inquiry._id}`);
              return;
            }

            const body = {
              leadName: `${assignedPro.first_name} ${assignedPro.last_name}`,
              taskTitle: inquiry.title,
              taskDescription: inquiry.description,
              isReminderEmail: true
            };

            const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
              taskReminderTemplate._id,
              assignedPro._id,
              body,
              null,
              null,
              false
            );

            if (replacedTemplate) {
              await sendRawEmail(
                [assignedPro.email],
                replacedTemplate.subject,
                replacedTemplate.content,
                replacedTemplate.cc,
                []
              );
              console.log(`Email sent to ${assignedPro.email} for inquiry ${inquiry._id}`);
            } else {
              console.warn(`Failed to generate email content for inquiry ${inquiry._id}`);
            }
          } catch (error) {
            console.error(`Error processing inquiry ${inquiry._id}:`, error);
          }
        })
      );
    } catch (err) {
      console.error('Error in cron job:', err);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Kolkata' // adjust if needed
  }
);

module.exports = {
  createInquiry,
  filterInquiries,
  assignToPRO,
  deleteEnquiry,
  getInquiryCounts,
  reassignToPRO,
  restoreArchivedInquiry
};
