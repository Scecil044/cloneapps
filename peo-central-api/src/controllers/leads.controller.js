const httpStatus = require("http-status");
const { leadsService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService, inquiryService } = require('../services');
const { processesService } = require("../services");
const { documentTemplateService } = require("../services")
const { documentTemplateCloneService } = require("../services")
const { companiesService } = require("../services")
const { toLower } = require("lodash");
const { ChartOfAccounts } = require('../models');
const { ObjectId } = require("mongodb");
const { DocumentTemplatesClone, EmailTemplateClone } = require("../models")
const { emailTemplateCloneService, emailTemplateService } = require("../services")
const { Processes } = require("../models")

const createLeads = catchAsync(async (req, res) => {
  try {
        const inquiryId = req.query.inquiryId;
        const {  companyDetails, lead, contactPerson } = req.body
        // if (!req.body.company_id || toLower(req.body.client_type) === "new client") {
        let companyBody = {
          ...companyDetails,
          legal_name: companyDetails?.company_name,
          registration_number: companyDetails?.registration_number || '',
          phone: companyDetails?.company_phone,
          email: companyDetails?.company_email,
          contact_person: [{ ...contactPerson }],
          bank_details: [
            {
              bank_name: '',
              account_number: '',
              bank_address: '',
              iban: '',
              salary_payment_mode: '',
            },
          ],
          status: 'new',
          // add flag to indicate this is a company created from leads
          is_lead: true,
        };

        console.log('company body: ', companyBody);
        // create company
        const company_created = await companiesService.createCompany(companyBody, req?.userId);
        const companyID = company_created._id;
        const data = await ChartOfAccounts.find({ code: "AR" });
        const count = data.length;
        const { account_type, company, details_type, name, _id, is_balance_sheet, account_id, isDebitAccount, trialBalanceDebitType, isReportValuePositive, city } = data[0];
        const accountObj = {
          name: `AR-${companyDetails?.company_name}`,
          company: ObjectId(company),
          account_id: account_id + '-' + count.toString().padStart(3, '0'),
          account_type: account_type,
          details_type: details_type,
          base_view: true,
          description: '',
          parent_account_id: _id,
          parent_account_name: name,
          is_balance_sheet: is_balance_sheet,
          customer: companyID,
          isDebitAccount: isDebitAccount,
          trialBalanceDebitType: trialBalanceDebitType,
          isReportValuePositive: isReportValuePositive,
          is_sub: true,
          city: city,
        };
        const accRcvblCrt = await ChartOfAccounts.create(accountObj);
        // }
        let processArray = await Processes.find({ process_name: "lead process" });
        let leadsBody = {
          lead_name: companyDetails?.lead_name,
          company_id: companyID,
          user_id: lead.user_id,
          client_type: lead.client_type,
          service_type: lead.service_type,
          contact_person: contactPerson,
          lead_details: lead.lead_details,
          processes: [],
          status: lead?.lead_details?.status || 'Lead Received',
          decision_maker_involvement: lead.decision_maker_involvement || '',
        };
        let docCloneIds = [];
        const documents = await Promise.all(
            processArray[0].stages.map(async (process) => {
                const documentActions = await Promise.all(
                    process.actions.map(async (action) => {
                        if (action.action_type === "document") {
                            const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
                            const template = document_template;
                            template.auto_replace_keys.forEach((replaceKeys) => {
                                replaceKeys.fk_id = "";
                            });
                            let templateBody = {
                                auto_replace_keys: template.auto_replace_keys,
                                user_input_keys: template.user_input_keys,
                                name: template.name,
                                content: template.content,
                                module: template.module
                            };
                            const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(templateBody);
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

        const newCreatedLead = await leadsService.creationOfLeads(leadsBody, companyID);
        const created_by = await leadsService.updateCreatedBy(newCreatedLead._id, req.userId);
        const logMessage = logLeadsCreation(req.userId, newCreatedLead);
        const addActivityLog = await activityService.createActivity(req.userId, newCreatedLead._id, "leads", {}, newCreatedLead, {}, logMessage);
        const logString = logger.info(`${req.userName} Created a Leads with ID ${newCreatedLead._id}`).transports[0].logString;
        await loggerService.createLogger("leads", req.userId, logString);
        await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: newCreatedLead._id } });

    // notify assignees and mark inquiry as assigned if exists
        // if (inquiryId) {
          await inquiryService.assignToPRO({ inquiryID: inquiryId, proID: lead?.user_id }, req, {
            skipLead: true,
            emailOnly: inquiryId ? false : true,
            emailData: {
              inquiryName: companyDetails?.company_name,
              inquiryPhone: companyDetails?.company_phone,
              inquiryEmail: companyDetails?.company_email,
              inquiryType: lead?.service_type,
            },
          });
        // }

        res.status(httpStatus.CREATED).send(newCreatedLead);
    } catch (error) {
        const logString = logger.error(`${req.userName} Failed to Create Leads, encountered following error => ${error}`).transports[0].logString;
        await loggerService.createLogger("leads", req.userId, logString);
        throw error;
        // res.status(400).json({ message: "Failed to create Leads. Please Check the Input", details: error?.message, });
    }
})

function logLeadsCreation(userId, leads) {
    const logMsg = `User ${userId} Created Lead ${leads._id}`;
    return logMsg
}

const updateLeadsOnId = catchAsync(async (req, res) => {
    try {

        const { companyDetails, lead } = req.body
        if(companyDetails.contact_person && companyDetails.contact_persons){
            companyDetails.contact_persons = companyDetails.contact_person
        }
        delete companyDetails.contact_person;
        const existingLeadsbyID = await leadsService.leadsById(req.params.leadsId)

        const updatedLeads = await leadsService.updateLeadsOnId(req.params.leadsId, lead)
        const updatedBy = await leadsService.updateUpdatedBy(req.params.leadsId, req.userId);

        // update company
        await companiesService.updateCompaniesOnId(lead?.company_id, companyDetails);

        const updatedFields = diff(existingLeadsbyID.toJSON(), updatedLeads.toJSON());
        const logMessage = logLeadsUpdates(req.userId, existingLeadsbyID, updatedLeads, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.leadsId, "leads", existingLeadsbyID, updatedLeads, updatedFields, logMessage);
        if (!updatedLeads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Leads');
        }
        const logString = (logger.info(`${req.userName} Updated Leads with LeadID - ${req.params.leadsId}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(updatedLeads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Leads with LeadID - ${req.params.leadsId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to update Leads. Please Check the Input', details: error });
    }
});

const reassignLeadById = catchAsync(async (req, res) => {
    try {
        const updatedLeads = await leadsService.updateLeadsOnId(req.params.leadsId, {
            user_id: req.body.user_id,
        })

        await inquiryService.assignToPRO({ inquiryID: false, proID: updatedLeads?.user_id }, req, {
            skipLead: true,
            emailOnly: true,
            emailData: {
              inquiryName: updatedLeads?.lead_name,
              inquiryPhone: updatedLeads?.contact_person?.phone,
              inquiryEmail: updatedLeads?.contact_person?.email,
              inquiryType: updatedLeads?.service_type,
            },
          });

        const logString = (logger.info(`${req.userName} Reassigned Leads with LeadID - ${req.params.leadsId} ro userId - ${req.body.user_id}` )).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        return res.status(httpStatus.OK).send(updatedLeads)

    } catch(error) {
        const logString = (logger.error(`${req.userName} Failed to Reassign Leads with LeadID - ${req.params.leadsId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        throw error;
    }
})

function logLeadsUpdates(userId, oldDoc, updatedLeads, updatedFields) {
    const logMsg = `User ${userId} updated Lead ${updatedLeads._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedLeads[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const listAllLeads = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const leads = await leadsService.listAllLeads(page, limit)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Leads');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Leads`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Leads, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch all the Leads', details: error });
    }
});

const leadsOnCompanyID = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const leads = await leadsService.leadsOnCompanyID(req.params.companyId, page, limit)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Leads on CompanyID');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Leads with CompanyID - ${req.params.companyId}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Leads with CompanyID - ${req.params.companyId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch Leads for the Provided CompanyID', details: error });
    }
});

const leadsById = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.leadsById(req.params.leadsId)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Leads');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Leads with LeadsID - ${req.params.leadsId}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Leads with LeadsID - ${req.params.leadsId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch Leads for the given ID', details: error });
    }
});

const deleteLeads = catchAsync(async (req, res) => {
    try {
        const existingLeadsbyID = await leadsService.leadsById(req.params.leadsId)
        const updatedLeads = await leadsService.deleteLeads(req.params.leadsId)
        const updatedBy = await leadsService.updateUpdatedBy(req.params.leadsId, req.userId);
        const logMessage = logLeadsDeletion(req.userId, updatedLeads);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.leadsId, "leads", existingLeadsbyID, {}, {}, logMessage);
        if (!updatedLeads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete Leads');
        }
        const logString = (logger.info(`${req.userName} Deleted the Leads with LeadsID - ${req.params.leadsId}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(updatedLeads);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete Leads with LeadsID - ${req.params.leadsId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete the Leads fo the provided ID', details: error });
    }
});

function logLeadsDeletion(userId, updatedLeads) {
    const logMsg = `User ${userId} Deleted Leads ${updatedLeads._id}`;
    return logMsg
}

const leadsOnStatus = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const leads = await leadsService.leadsOnStatus(req.params.status, page, limit)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Leads');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Leads with Status - ${req.params.status}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the Leads with Status - ${req.params.status}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Leads for the Given Status', details: error });
    }
});

const leadsFilterAndSearch = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const leads = await leadsService.leadsFilterAndSearch(req.body, page, limit)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Leads');
        }
        const logString = (logger.info(`${req.userName} Accessed Leads by Filtering / Searching `)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Leads by Filtering / Searching, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Leads by Filtering / Searching', details: error });
    }
});

const leadsDetailsOnLeadsId = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.leadsDetailsOnLeadsId(req.body)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Leads');
        }
        const logString = (logger.info(`${req.userName} Fetched the Leads Details on Lead ID - ${req.body.leads_id}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Details of the Leads for the provided Leads ID - ${req.body.leads_id}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Details of the Leads for the provided lead ID ', details: error });
    }
});

const markUnsuccessful = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.markUnsuccessful(req.params.leadsId, req.body)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to mark Unsuccessful');
        }
        const logString = (logger.info(`${req.userName} marked the lead with leadId - ${req.params.leadsId} Unsuccessful for the following reason - ${req.body.reason_for_unsuccessful}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to mark the lead with leadId - ${req.params.leadsId} Unsuccessful`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to mark Unsuccessful ', details: error });
    }
})

const listOfUnsuccessfulLeads = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const leads = await leadsService.listOfUnsuccessfulLeads(page, limit)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Unsuccessful Leads');
        }
        const logString = (logger.info(`${req.userName} Fetched all the Unsuccessful Leads`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Fetch all the Unsuccessful Leads, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch all the Unsuccessful Leads', details: error });
    }
});

const getUnsuccessfulLeadsDetailsOnID = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.getUnsuccessfulLeadsDetailsOnID(req.params.leadsId)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Leads');
        }
        const logString = (logger.info(`${req.userName} Fetched the Leads with LeadsID - ${req.params.leadsId}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Fetch the Leads with LeadsID - ${req.params.leadsId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch Leads for the given ID', details: error });
    }
});

const leadProgressStageMoveForward = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.leadProgressStageMoveForward(req.params.leadsId, req.userId, req.body)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update');
        }
        const logString = (logger.info(`${req.userName} Updated the Leads Process from one Stage to next (Moved Forward)`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Leads Process from one Stage to next (Move Forward), encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Leads Process ', details: error });
    }
})

const leadProgressStageMoveBackward = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.leadProgressStageMoveBackward(req.params.leadsId)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update');
        }
        const logString = (logger.info(`${req.userName} Updated the Leads Proccess from one stage to Other (Moved Backward)`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Leads Process from one stage to Other (Move Backward)`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Leads Process ', details: error });
    }
})

const getLeadsPipeline = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.getLeadsPipeline()
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the leads Pipeline');
        }
        const logString = (logger.info(`${req.userName} Fetched all the leads Data on Status PipeLineAPI`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Fetch all the leads Data on Status PipeLineAPI, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch all the leads Data on Status PipeLineAPI', details: error });
    }
});

const getDiffPipelineList = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.getDiffPipelineList(req.query, req.query.page, req.query.limit)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the leads Pipeline');
        }
        const logString = (logger.info(`${req.userName} Fetched all the leads Data on Status PipeLineAPI`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Fetch all the leads Data on Status PipeLineAPI, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch all the leads Data on Status PipeLineAPI', details: error });
    }
});

const leadsFilterAndSearchForUnsuccessuful = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const leads = await leadsService.leadsFilterAndSearchForUnsuccessuful(req.query, req.body)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Leads');
        }
        const logString = (logger.info(`${req.userName} Accessed Unsuccessfull Leads by Filtering / Searching `)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Unsuccessfull Leads by Filtering / Searching, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Unsuccessfull Leads by Filtering / Searching', details: error });
    }
});

const removeFromUnsuccessful = catchAsync(async (req, res) => {
    try {
        const leads = await leadsService.removeFromUnsuccessful(req.params.leadsId, req.body)
        if (!leads) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot Remove the Lead from unsuccessful');
        }
        const logString = (logger.info(`${req.userName} Removed the Leads from Unsuccessful `)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(leads)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Remove the Lead from unsuccessful, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to Remove the Lead from unsuccessful', details: error });
    }
});

const listOfLeadsStatus = catchAsync(async (req, res) => {
    try {
        const result = await leadsService.listOfLeadsStatus(req.query, req.body)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
        }
        const logString = (logger.info(`${req.userName} Accesses the list of Status of Leads `)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Status of Leads, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Status of Leads ', details: error });
    }
})

const getLeadsCounts = catchAsync(async (req, res) => {
    try {
        const result = await leadsService.getLeadsCounts()
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Counts');
        }
        const logString = (logger.info(`${req.userName} Accesses the Counts Leads `)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Counts of Leads, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Counts of Leads ', details: error });
    }
})

const getConversionRate = catchAsync(async (req, res) => {
    try {
        const result = await leadsService.getConversionRate()
        if (result === null || result === undefined) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Conversion Rate');
        }
        const logString = (logger.info(`${req.userName} Accessed the Conversion Rate`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Conversion Rate, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Conversion Rate', details: error });
    }
})

const holdLeads = catchAsync(async (req, res) => {
    try {
        const result = await leadsService.holdLeads(req.params.leadId)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to mark Hold');
        }
        const logString = (logger.info(`${req.userName} Marked a Lead status to Hold `)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to mark a Lead to Hold, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to mark a lead Hold ', details: error });
    }
})

const getLeadStatusCount = catchAsync(async (req, res) => {
    try {
        const response = await leadsService.getLeadStatusCount();
        const logString = logger.info(`${req.userName} Accessed lead status count`).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(httpStatus.OK).send(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} Failed to get lead status count, encountered following error => ${error}`).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({ message: 'Failed to get lead status count', details: error });
    }
});

const bulkUploadLeads = catchAsync(async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
        }

        const result = await leadsService.bulkUploadLeads(req);

        const logString = logger.info(`${req.userName} Bulk uploaded leads - ${result.added} added, ${result.duplicates.length} duplicates, ${result.companiesReused.length} companies reused, ${result.errors.length} errors`).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);

        res.status(httpStatus.OK).json({
            success: true,
            message: result.message,
            data: {
                added: result.added,
                duplicates: result.duplicates,
                companiesReused: result.companiesReused,
                errors: result.errors,
                totalProcessed: result.totalProcessed
            }
        });
    } catch (error) {
        const logString = logger.error(`${req.userName} Failed to bulk upload leads, encountered following error => ${error}`).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({
            success: false,
            message: 'Failed to bulk upload leads',
            details: error.message
        });
    }
});

const exportBulkUploadTemplate = catchAsync(async (req, res) => {
    try {
        const buffer = await leadsService.exportBulkUploadTemplate();

        if (!buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to generate bulk upload template!');
        }

        const logString = logger.info(`${req.userName} Downloaded leads bulk upload template`).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Leads_Bulk_Upload_Template.xlsx');
        res.send(buffer);
    } catch (error) {
        const logString = logger.error(`${req.userName} Failed to download bulk upload template, encountered following error => ${error}`).transports[0].logString;
        await loggerService.createLogger('leads', req.userId, logString);
        res.status(400).json({
            success: false,
            message: 'Failed to download template',
            details: error.message
        });
    }
});

module.exports = {
    createLeads,
    updateLeadsOnId,
    listAllLeads,
    leadsById,
    deleteLeads,
    leadsOnCompanyID,
    leadsOnStatus,
    leadsFilterAndSearch,
    leadsDetailsOnLeadsId,
    markUnsuccessful,
    leadProgressStageMoveForward,
    leadProgressStageMoveBackward,
    listOfUnsuccessfulLeads,
    getUnsuccessfulLeadsDetailsOnID,
    getLeadsPipeline,
    getDiffPipelineList,
    leadsFilterAndSearchForUnsuccessuful,
    removeFromUnsuccessful,
    listOfLeadsStatus,
    getLeadsCounts,
    getConversionRate,
    holdLeads,
    getLeadStatusCount,
    bulkUploadLeads,
    exportBulkUploadTemplate,
    reassignLeadById
}
