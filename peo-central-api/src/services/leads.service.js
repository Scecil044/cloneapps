const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { toLower } = require('lodash');
const XLSX = require('xlsx');
const { ObjectId } = require('mongodb');
const { Leads, Companies, Processes, ChartOfAccounts } = require('../models');
const ApiError = require('../utils/ApiError');
const pagination = require('../middlewares/paginate');
const queryService = require('./query.service');
const excelReader = require('../helpers/excel-reader');
const companiesService = require('./companies.service');
const documentTemplateService = require('./document_template.service');
const documentTemplateCloneService = require('./document_template_clone.service');
const activityService = require('./activities.service');
const userService = require('./users.service');

const creationOfLeads = async (reqBody, companyId) => {
  try {
    let leadBody = {
      lead_name: reqBody.lead_name,
      user_id: reqBody.user_id,
      client_type: reqBody.client_type,
      service_type: reqBody.service_type,
      contact_person: reqBody.contact_person,
      lead_details: reqBody.lead_details,
      processes: reqBody.processes,
      status: reqBody.status || 'Lead Received',
      inquiry_date: reqBody.inquiry_date || new Date(),
      decision_maker_involvement: reqBody.decision_maker_involvement || ''
    };

    if (reqBody.is_unsuccessful === true) {
      console.log('found condition for isunsuccessful true---marking as unsuccessful', reqBody.lead_name);
      leadBody.reason_for_unsuccessful = reqBody.reason_for_unsuccessful;
      leadBody.is_unsuccessful = true;
    } else {
      if (Array.isArray(leadBody.processes)) {
        if (reqBody.status === 'Lead Received') {
          console.log('found condition for status Lead Received---> retaining processes');
          leadBody.status = 'Lead Received';
        } else {
          let stageIndex = leadBody.processes.findIndex(
            stage => stage.stage_name && stage.stage_name.toLowerCase().trim() === reqBody.status.toLowerCase().trim()
          );
          if (stageIndex === -1) stageIndex = 0;

          leadBody.processes.forEach((process, idx) => {
            if (idx < stageIndex) {
              process.process_status = 'completed';
              process.status = 'completed';
              if (Array.isArray(process.actions)) {
                process.actions.forEach(action => {
                  action.status = 'completed';
                });
              }
            } else if (idx === stageIndex) {
              process.process_status = 'progress';
              process.status = 'progress';
              if (Array.isArray(process.actions) && process.actions.length > 0) {
                process.actions.forEach((action, aidx) => {
                  action.status = aidx === 0 ? 'progress' : 'pending';
                });
              }
            } else {
              process.process_status = 'pending';
              process.status = 'pending';
              if (Array.isArray(process.actions)) {
                process.actions.forEach(action => {
                  action.status = 'pending';
                });
              }
            }
          });
        }
      }
    }

    if (reqBody && reqBody.company_id) {
      leadBody.company_id = reqBody.company_id;
    } else if (companyId) {
      leadBody.company_id = companyId;
    }

    const createdLead = new Leads(leadBody);
    return createdLead.save();
  } catch (error) {
    throw error;
  }
};

const bulkUploadLeads = async req => {
  console.log('bulkUploadLeads called with req:=================>');
  let result = {
    message: null,
    error: null,
    duplicates: [],
    added: 0,
    errors: [],
    totalProcessed: 0,
    companiesReused: []
  };

  // Helper function to clean "NA" values
  const cleanValue = value => {
    if (!value) return '';
    const trimmedValue = value.toString().trim().toLowerCase();
    const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
    return naValues.includes(trimmedValue) ? '' : value.toString().trim();
  };

  const validServiceTypes = [
    'Mission Visa',
    'COP 29 Visa',
    'PRO Services',
    'Payroll Outsourcing',
    'HR Consulting & Advisory',
    'Job Applicant',
    'HR Outsourcing',
    'Staffing/Recruitment Service',
    'HR Technology',
    'EOR/PEO Service'
  ];

  const validInquiryTypes = ['Referral', 'Website', 'Walk In', 'BD', 'Tender', 'Other', 'Phone Call'];

  const validLeadRatings = ['Qualified', 'Not Qualified'];

  const validLeadActions = ['None', 'Follow Up', 'Need to Action'];

  const validLeadStatuses = [
    'Lead Received',
    'Contact Client',
    'Proposal Sent',
    'In Discussion',
    'Onboard Client',
    'Verify Client',
    'Service Agreement',
    // 'Cancelled',
    'On Hold',
    'Unsuccessful'
  ];

  const validDealSizes = ['1 to 10', '11 to 50', '51 to 200', '200+'];

  const validEORRequirements = ['UAE EOR', 'GCC EOR', 'Mission Visa UAE', 'Various'];

  // NEW: Valid Decision Maker Involvement options
  const validDecisionMakerInvolvement = ['Direct Contact With Decision Maker', 'Indirect or Unsure'];

  const parseInquiryDate = dateValue => {
    if (!dateValue) return new Date(); // Default to current date if empty

    try {
      let parsedDate = null;

      if (typeof dateValue === 'number') {
        // Excel date serial number (days since 1900-01-01, with Excel's leap year bug)
        const excelEpoch = new Date(1900, 0, 1);
        const daysOffset = dateValue - 2; // Adjust for Excel's 1900 leap year bug
        parsedDate = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      } else if (typeof dateValue === 'string') {
        // Try to parse string date
        const trimmedDate = dateValue.trim();

        // Handle various date formats
        if (trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // YYYY-MM-DD format
          parsedDate = new Date(trimmedDate + 'T00:00:00.000Z');
        } else if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          // MM/DD/YYYY format
          parsedDate = new Date(trimmedDate);
        } else if (trimmedDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
          // DD-MM-YYYY format
          const parts = trimmedDate.split('-');
          parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00.000Z`);
        } else {
          // Try generic date parsing
          parsedDate = new Date(trimmedDate);
        }
      } else if (dateValue instanceof Date) {
        parsedDate = dateValue;
      }

      // Validate the parsed date
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        // Ensure date is not in the future and not too far in the past (reasonable business date)
        const currentDate = new Date();
        const minDate = new Date('2020-01-01'); // Reasonable minimum business date

        if (parsedDate <= currentDate && parsedDate >= minDate) {
          return parsedDate;
        } else {
          console.warn('Date out of valid range:', parsedDate);
          return new Date(); // Default to current date if out of range
        }
      } else {
        console.warn('Invalid date parsed:', parsedDate);
        return new Date(); // Default to current date if invalid
      }
    } catch (error) {
      console.error('Error parsing inquiry date:', error);
      return new Date(); // Default to current date on error
    }
  };

  const isValidEmail = email => {
    if (!email) return true; // Allow empty emails

    // Handle common "not applicable" values
    const trimmedEmail = email.toString().trim().toLowerCase();
    const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
    if (naValues.includes(trimmedEmail)) return true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  try {
    console.log('Start of req files:', req.files);

    const filename = req.files.file.tempFilePath;
    console.log('Reading file:', filename);

    const workbook = XLSX.readFile(filename);

    let leadOwners = [];
    try {
      const filter = { module: 'leads' };
      const leadPros = await userService.getAllPro(filter);
      if (leadPros && leadPros.length > 0) {
        leadOwners = leadPros.map(pro => ({
          id: pro._id,
          fullName: `${pro.first_name} ${pro.last_name}`,
          firstName: pro.first_name,
          lastName: pro.last_name
        }));
      }
    } catch (error) {
      console.error('Error fetching lead owners:', error);
    }

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
        result.totalProcessed++;

        try {
          console.log('Processing lead:', info.lead_name || info.company_name);

          if (!info.company_name || info.company_name.trim() === '') {
            result.errors.push({
              row: i + 3, // Excel row number (accounting for title and header)
              company: info.company_name || 'Unknown',
              error: 'Company Name is required'
            });
            continue;
          }

          if (!info.lead_owner || info.lead_owner.trim() === '') {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: 'Lead Owner is required'
            });
            continue;
          }

          const leadOwner = leadOwners.find(
            owner => owner.fullName === info.lead_owner || owner.fullName.toLowerCase() === info.lead_owner.toLowerCase()
          );

          if (!leadOwner) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid Lead Owner: ${info.lead_owner}. Please select from available lead owners.`
            });
            continue;
          }

          if (!info.service_type || !validServiceTypes.includes(info.service_type)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid service type. Must be one of: ${validServiceTypes.join(', ')}`
            });
            continue;
          }

          if (info.client_type && info.client_type !== 'new client') {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: 'Client Type must be "new client"'
            });
            continue;
          }

          if (info.company_email && !isValidEmail(info.company_email)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: 'Invalid company email format'
            });
            continue;
          }

          if (info.contact_person_email && !isValidEmail(info.contact_person_email)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: 'Invalid contact person email format'
            });
            continue;
          }

          if (info.inquiry_type && !validInquiryTypes.includes(info.inquiry_type)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid inquiry type. Must be one of: ${validInquiryTypes.join(', ')}`
            });
            continue;
          }

          if (info.lead_rating && !validLeadRatings.includes(info.lead_rating)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid lead rating. Must be one of: ${validLeadRatings.join(', ')}`
            });
            continue;
          }

          if (info.lead_action && !validLeadActions.includes(info.lead_action)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid lead action. Must be one of: ${validLeadActions.join(', ')}`
            });
            continue;
          }

          if (info.lead_status && !validLeadStatuses.includes(info.lead_status)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid lead status. Must be one of: ${validLeadStatuses.join(', ')}`
            });
            continue;
          }

          if (info.deal_size && !validDealSizes.includes(info.deal_size)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid deal size. Must be one of: ${validDealSizes.join(', ')}`
            });
            continue;
          }

          if (info.eor_requirements && !validEORRequirements.includes(info.eor_requirements)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid EOR requirements. Must be one of: ${validEORRequirements.join(', ')}`
            });
            continue;
          }

          // NEW: Validation for decision_maker_involvement
          if (info.decision_maker_involvement && !validDecisionMakerInvolvement.includes(info.decision_maker_involvement)) {
            result.errors.push({
              row: i + 3,
              company: info.company_name,
              error: `Invalid Decision Maker Involvement. Must be one of: ${validDecisionMakerInvolvement.join(', ')}`
            });
            continue;
          }

          let inquiryDate = parseInquiryDate(info.inquiry_date);

          const existingCompany = await Companies.findOne({
            company_name: { $regex: new RegExp(`^${info.company_name.trim()}$`, 'i') },
            is_deleted: false
          });

          let companyID;
          let company_created;
          let company_email = '';

          if (existingCompany) {
            // Use existing company for the lead
            companyID = existingCompany._id;
            company_created = existingCompany;
            company_email = existingCompany.email || '';
            console.log('Using existing company with ID:', companyID);

            // Track company reuse for reporting
            result.companiesReused.push({
              row: i + 3,
              company_name: info.company_name,
              company_id: companyID,
              action: 'Used existing company'
            });
          } else {
            // Create new company
            const companyBody = {
              company_name: info.company_name.trim(),
              legal_name: info.company_name.trim(),
              registration_number: info.registration_number ? info.registration_number.toString().trim() : '',
              phone: cleanValue(info.company_phone),
              email: cleanValue(info.company_email) ? cleanValue(info.company_email).toLowerCase() : '',
              business_industry: info.business_industry ? info.business_industry.trim() : '',
              country: info.country ? info.country.trim() : '',
              website: cleanValue(info.website),
              is_lead: true,
              contact_person: [
                {
                  name: info.contact_person_name ? info.contact_person_name.trim() : '',
                  phone: cleanValue(info.contact_person_phone),
                  email: cleanValue(info.contact_person_email) ? cleanValue(info.contact_person_email).toLowerCase() : '',
                  designation: info.contact_person_designation ? info.contact_person_designation.trim() : ''
                }
              ],
              bank_details: [
                {
                  bank_name: '',
                  account_number: '',
                  bank_address: '',
                  iban: '',
                  salary_payment_mode: ''
                }
              ],
              status: 'new'
            };

            company_created = await companiesService.createCompany(companyBody, req && req.userId);
            companyID = company_created._id;
            company_email = companyBody.email;
            console.log('Company created with ID:', companyID);
          }

          // Only create Chart of Accounts for new companies
          if (!existingCompany) {
            const data = await ChartOfAccounts.find({ code: 'AR' });
            const count = data.length;
            if (data.length > 0) {
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
              const accountObj = {
                name: `AR-${info.company_name.trim()}`,
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
                city: city
              };
              // await ChartOfAccounts.create(accountObj);
            }
          }

          // Check for existing lead with the same name
          const leadName = info.lead_name || info.company_name.trim();
          const existingLead = await Leads.findOne({
            lead_name: { $regex: new RegExp(`^${leadName.trim()}$`, 'i') },
            is_deleted: false
          });

          if (existingLead) {
            result.duplicates.push({
              row: i + 3,
              company_name: info.company_name,
              lead_name: leadName,
              reason: 'Lead with this name already exists'
            });
            continue;
          }

          let processArray = await Processes.find({ process_name: 'lead process' });

          const isUnsuccessful = info.lead_rating === 'Not Qualified';
          const reasonForUnsuccessful = isUnsuccessful
            ? info.reason_for_unsuccessful || 'Lead rating marked as Not Qualified'
            : '';

          let totalOrderValue = 0;
          if (info.overall_total_order_value) {
            const parsedValue = parseFloat(info.overall_total_order_value);
            if (!isNaN(parsedValue)) {
              totalOrderValue = parsedValue;
            }
          }

          let leadsBody = {
            lead_name: info.lead_name || info.company_name.trim(),
            company_id: companyID,
            company_email: company_email,
            user_id: ObjectId(leadOwner.id),
            client_type: info.client_type || 'new client',
            service_type: info.service_type || '',
            inquiry_date: inquiryDate,
            contact_person: {
              name: info.contact_person_name ? info.contact_person_name.trim() : '',
              phone: cleanValue(info.contact_person_phone),
              email: cleanValue(info.contact_person_email) ? cleanValue(info.contact_person_email).toLowerCase() : ''
            },
            lead_details: {
              inquiry_type: info.inquiry_type || '',
              lead_rating: info.lead_rating || '',
              lead_action: info.lead_action || '',
              status: info.lead_status || 'Lead Received',
              overall_total_order_value: totalOrderValue,
              deal_size: info.deal_size || '',
              eor_requirements: info.eor_requirements || '',
              requirements: info.requirements || ''
            },
            processes: [],
            status: info.lead_status || 'Lead Received',
            is_unsuccessful: isUnsuccessful,
            reason_for_unsuccessful: reasonForUnsuccessful,
            unsuccessful_on: isUnsuccessful ? new Date().toISOString() : '',
            // NEW: Add decision_maker_involvement field
            decision_maker_involvement: info.decision_maker_involvement || '',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
          };

          if (leadsBody.is_unsuccessful === true && !existingCompany) {
            // Only mark new companies as deleted if lead is unsuccessful
            company_created.is_deleted = true;
            await company_created.save();
            const companyChartOfAccounts = await ChartOfAccounts.findOne({ customer: companyID });
            if (companyChartOfAccounts) {
              companyChartOfAccounts.is_deleted = 1;
              await companyChartOfAccounts.save();
              console.log(
                companyChartOfAccounts.is_deleted,
                'company chart of accounts deleted successfully, and this is the new status'
              );
            }
          }

          let docCloneIds = [];
          if (processArray && processArray.length > 0) {
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
          }

          const newCreatedLead = await creationOfLeads(leadsBody, companyID);

          await updateCreatedBy(newCreatedLead._id, req.userId);

          if (docCloneIds.length > 0) {
            const { DocumentTemplatesClone } = require('../models');
            await DocumentTemplatesClone.updateMany(
              { _id: { $in: docCloneIds.map(doc => doc._id) } },
              { $set: { module_id: newCreatedLead._id } }
            );
          }

          const logMessage = `Bulk upload: Created Lead ${newCreatedLead._id} for company ${info.company_name}`;
          await activityService.createActivity(req.userId, newCreatedLead._id, 'leads', {}, newCreatedLead, {}, logMessage);

          result.added++;
          console.log(`Successfully created lead for: ${info.company_name}`);
        } catch (error) {
          console.error(`Error processing lead ${info.company_name}:`, error);
          result.errors.push({
            row: i + 3,
            company: info.company_name,
            error: error.message
          });
        }
      }
    }

    if (result.added > 0) {
      result.message = `Successfully added ${result.added} leads.`;
    } else {
      result.message = 'No new leads were added.';
    }

    if (result.duplicates.length > 0) {
      result.message += ` ${result.duplicates.length} duplicate(s) found.`;
    }

    if (result.companiesReused.length > 0) {
      result.message += ` ${result.companiesReused.length} existing company(ies) reused.`;
    }

    if (result.errors.length > 0) {
      result.message += ` ${result.errors.length} error(s) occurred.`;
    }

    return result;
  } catch (error) {
    console.error('Bulk upload error:', error);
    return {
      message: error.message,
      error: true,
      totalProcessed: result.totalProcessed,
      added: result.added,
      duplicates: result.duplicates,
      companiesReused: result.companiesReused,
      errors: result.errors
    };
  }
};

const getData = async data => {
  // Helper function to clean "NA" values
  const cleanValue = value => {
    if (!value) return '';
    const trimmedValue = value.toString().trim().toLowerCase();
    const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
    return naValues.includes(trimmedValue) ? '' : value.toString().trim();
  };

  const header = data[1]; // Use the second row as the header (row 2 in Excel, accounting for title row)
  const temp = [];
  const leadData = data.filter(item => item.length > 0); // Filter out empty rows
  console.log('Header row:', header);
  console.log('Filtered leadData:', leadData);

  for (const [i, row] of leadData.entries()) {
    if (i > 1 && row.length > 0) {
      // Skip title (row 0), header (row 1), and empty rows
      console.log(`Processing row ${i}:`, row);
      try {
        const formatted = await excelReader.formatRow(row, header);
        console.log('Formatted row:', formatted);

        const item = {
          inquiry_date: formatted['Date of Inquiry'] || formatted['inquiry_date'] || '',
          lead_owner: formatted['Lead Owner'] || formatted['lead_owner'] || '',
          client_type: formatted['Client Type'] || formatted['client_type'] || 'new client',
          service_type: formatted['Service Type'] || formatted['service_type'] || '',
          company_name: formatted['Company Name'] || formatted['company_name'] || '',
          company_phone: cleanValue(formatted['Company Phone'] || formatted['company_phone']),
          company_email: cleanValue(formatted['Company Email'] || formatted['company_email']),
          business_industry: formatted['Business Industry'] || formatted['business_industry'] || '',
          country: formatted['Country'] || formatted['country'] || '',
          website: cleanValue(formatted['Website'] || formatted['website']),
          contact_person_name: formatted['Contact Person Name'] || formatted['contact_person_name'] || '',
          contact_person_phone: cleanValue(formatted['Contact Person Phone'] || formatted['contact_person_phone']),
          contact_person_email: cleanValue(formatted['Contact Person Email'] || formatted['contact_person_email']),
          contact_person_designation: formatted['Contact Person Designation'] || formatted['contact_person_designation'] || '',
          // NEW: Add decision_maker_involvement field mapping
          decision_maker_involvement: formatted['Decision Maker Involvement'] || formatted['decision_maker_involvement'] || '',
          inquiry_type: formatted['Inquiry Type'] || formatted['inquiry_type'] || '',
          lead_rating: formatted['Lead Rating'] || formatted['lead_rating'] || '',
          lead_action: formatted['Lead Action'] || formatted['lead_action'] || '',
          lead_status: formatted['Lead Status'] || formatted['lead_status'] || 'Lead Received',
          overall_total_order_value: formatted['Total Order Value'] || formatted['overall_total_order_value'] || 0,
          deal_size: formatted['Employee Count'] || formatted['deal_size'] || '',
          eor_requirements: formatted['EOR Requirements'] || formatted['eor_requirements'] || '',
          requirements: formatted['Client Requirements'] || formatted['requirements'] || '',
          reason_for_unsuccessful: formatted['Reason For Unsuccessful'] || formatted['reason_for_unsuccessful'] || '',
          lead_name: formatted['Lead Name'] || formatted['lead_name'] || ''
        };

        console.log('Item created:', item);

        if (item.company_name && item.company_name.trim() !== '') {
          temp.push(item);
          console.log('Item pushed to temp:', item);
        } else {
          console.log('Item skipped, missing company name:', item);
        }
      } catch (error) {
        console.error('Error formatting row:', row, error);
      }
    }
  }

  console.log('Final temp array:', temp);
  return temp;
};

const exportBulkUploadTemplate = async () => {
  try {
    const excelJs = require('exceljs');
    const moment = require('moment');
    const workbook = new excelJs.Workbook();
    workbook.creator = 'PEO Central';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Leads Bulk Upload Template', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    // Define header columns in exact order with proper keys - UPDATED with Decision Maker Involvement
    const columns = [
      { header: 'Date of Inquiry', key: 'inquiry_date', width: 25 }, // Column A
      { header: 'Lead Owner', key: 'lead_owner', width: 25 }, // Column B
      { header: 'Client Type', key: 'client_type', width: 20 }, // Column C
      { header: 'Service Type', key: 'service_type', width: 25 }, // Column D
      { header: 'Company Name', key: 'company_name', width: 30 }, // Column E
      { header: 'Company Phone', key: 'company_phone', width: 20 }, // Column F
      { header: 'Company Email', key: 'company_email', width: 30 }, // Column G
      { header: 'Business Industry', key: 'business_industry', width: 25 }, // Column H
      { header: 'Country', key: 'country', width: 20 }, // Column I
      { header: 'Website', key: 'website', width: 30 }, // Column J
      { header: 'Contact Person Name', key: 'contact_person_name', width: 30 }, // Column K
      { header: 'Contact Person Phone', key: 'contact_person_phone', width: 30 }, // Column L
      { header: 'Contact Person Email', key: 'contact_person_email', width: 30 }, // Column M
      { header: 'Contact Person Designation', key: 'contact_person_designation', width: 35 }, // Column N
      { header: 'Decision Maker Involvement', key: 'decision_maker_involvement', width: 35 }, // Column O
      { header: 'Inquiry Type', key: 'inquiry_type', width: 20 }, // Column P (was O)
      { header: 'Lead Rating', key: 'lead_rating', width: 15 }, // Column Q (was P)
      { header: 'Lead Action', key: 'lead_action', width: 20 }, // Column R (was Q)
      { header: 'Lead Status', key: 'lead_status', width: 15 }, // Column S (was R)
      { header: 'Total Order Value', key: 'overall_total_order_value', width: 20 }, // Column T (was S)
      { header: 'Employee Count', key: 'deal_size', width: 20 }, // Column U (was T)
      { header: 'EOR Requirements', key: 'eor_requirements', width: 25 }, // Column V (was U)
      { header: 'Client Requirements', key: 'requirements', width: 50 }, // Column W (was V)
      { header: 'Reason For Unsuccessful', key: 'reason_for_unsuccessful', width: 50 } // Column X (was W)
    ];

    // Add title row first
    const title = `Leads Bulk Upload Template - ${moment().format('MMMM YYYY')}`;
    sheet.addRow([title]);
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(1).alignment = { horizontal: 'center' };
    sheet.mergeCells(1, 1, 1, columns.length);

    // Add header row with proper column mapping
    const headerValues = columns.map(col => col.header);
    const headerRow = sheet.addRow(headerValues);

    // Set column widths
    columns.forEach((col, index) => {
      sheet.getColumn(index + 1).width = col.width;
    });

    // Style header row (row 2)
    headerRow.height = 28;
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Get Lead Owner data dynamically
    let leadOwners = ['Default User'];
    try {
      const filter = { module: 'leads' };
      const leadPros = await userService.getAllPro(filter);
      if (leadPros && leadPros.length > 0) {
        leadOwners = leadPros.map(pro => `${pro.first_name} ${pro.last_name}`);
      }
    } catch (error) {
      console.warn('Could not fetch lead owners, using default:', error.message);
    }

    // Format specific columns as text to preserve leading zeros and prevent auto-formatting
    const textColumns = [6, 7, 12]; // Company Phone (F), Company Email (G), Contact Person Phone (L)
    for (let row = 3; row <= 1002; row++) {
      textColumns.forEach(colIndex => {
        sheet.getCell(row, colIndex).numFmt = '@';
      });
    }

    // Date validation and formatting for Column A (Inquiry Date)
    sheet.dataValidations.add('A3:A1002', {
      type: 'date',
      operator: 'greaterThanOrEqual',
      formulae: [new Date(2020, 0, 1)],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'Invalid Date',
      error: 'Please enter a valid date (YYYY-MM-DD format)',
      showInputMessage: true,
      inputTitle: 'Date Format',
      inputMessage: 'Enter date in YYYY-MM-DD format or use the date picker'
    });

    // Format date column to display dates properly
    for (let row = 3; row <= 1002; row++) {
      sheet.getCell(row, 1).numFmt = 'yyyy-mm-dd';
    }

    // Email validation helper function
    const addEmailValidation = (range, fieldName) => {
      sheet.dataValidations.add(range, {
        type: 'textLength',
        operator: 'greaterThan',
        formulae: [5],
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: 'Invalid Email',
        error: `Please enter a valid ${fieldName.toLowerCase()}.`
      });
    };

    // Dropdown validation helper function
    const addDropdownValidation = (range, options, title, allowBlank = true) => {
      sheet.dataValidations.add(range, {
        type: 'list',
        allowBlank: allowBlank,
        formulae: [`"${options.join(',')}"`],
        showErrorMessage: true,
        errorTitle: `Invalid ${title}`,
        error: `Please select a valid ${title.toLowerCase()} from the dropdown`,
        showDropDown: true
      });
    };

    // Apply all validations with correct column references (UPDATED for new column positions)

    // Column B - Lead Owner (Required)
    addDropdownValidation('B3:B1002', leadOwners, 'Lead Owner', false);

    // Column C - Client Type
    addDropdownValidation('C3:C1002', ['new client'], 'Client Type');

    // Column D - Service Type
    addDropdownValidation(
      'D3:D1002',
      [
        'Mission Visa',
        'COP 29 Visa',
        'PRO Services',
        'Payroll Outsourcing',
        'HR Consulting & Advisory',
        'Job Applicant',
        'HR Outsourcing',
        'Staffing/Recruitment Service',
        'HR Technology',
        'EOR/PEO Service'
      ],
      'Service Type'
    );

    // Column G - Company Email
    addEmailValidation('G3:G1002', 'Company Email');

    // Column M - Contact Person Email
    addEmailValidation('M3:M1002', 'Contact Person Email');

    // NEW: Column O - Decision Maker Involvement
    addDropdownValidation('O3:O1002', ['Direct Contact With Decision Maker', 'Indirect or Unsure'], 'Decision Maker Involvement');

    // Column P - Inquiry Type (was O)
    addDropdownValidation('P3:P1002', ['Referral', 'Website', 'Walk In', 'BD', 'Tender', 'Other', 'Phone Call'], 'Inquiry Type');

    // Column Q - Lead Rating (was P)
    addDropdownValidation('Q3:Q1002', ['Qualified', 'Not Qualified'], 'Lead Rating');

    // Column R - Lead Action (was Q)
    addDropdownValidation('R3:R1002', ['None', 'Follow Up', 'Need to Action'], 'Lead Action');

    // Column S - Lead Status (was R)
    addDropdownValidation(
      'S3:S1002',
      [
        'Lead Received',
        'Contact Client',
        'Proposal Sent',
        'In Discussion',
        'Onboard Client',
        'Verify Client',
        'Service Agreement',
        // 'Cancelled',
        'On Hold',
        'Unsuccessful'
      ],
      'Lead Status'
    );

    // Column U - Deal Size (was T)
    addDropdownValidation('U3:U1002', ['1 to 10', '11 to 50', '51 to 200', '200+'], 'Employee Count');

    // Column V - EOR Requirements (was U)
    addDropdownValidation('V3:V1002', ['UAE EOR', 'GCC EOR', 'Mission Visa UAE', 'Various'], 'EOR Requirements');

    // Add instructions section
    const instructionRow = 25;
    sheet.getCell(`A${instructionRow}`).value = 'INSTRUCTIONS:';
    sheet.getCell(`A${instructionRow}`).font = { bold: true, size: 12, color: { argb: 'FF0000' } };

    const instructions = [
      '1. Date of Inquiry: Use YYYY-MM-DD format (e.g., 2024-01-15)',
      '2. Lead Owner: Select from dropdown - this field is required',
      '3. Email fields: Must be valid email format, or use "NA" for not applicable',
      '4. Phone numbers: Will be treated as text to preserve formatting',
      '5. All dropdown fields: Select only from provided options',
      '6. Decision Maker Involvement: Select whether you have direct contact with decision maker',
      '7. Optional fields: Use "NA", "N/A", or leave empty if not applicable',
      '8. Required fields: Date of Inquiry, Lead Owner, Company Name, Contact Person Name',
      '9. Maximum 1000 rows of data can be uploaded',
      '10. Do not modify column headers or their order'
    ];

    instructions.forEach((instruction, index) => {
      sheet.getCell(`A${instructionRow + index + 1}`).value = instruction;
      sheet.getCell(`A${instructionRow + index + 1}`).font = { italic: true, size: 10 };
    });

    // Convert workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error generating bulk upload template:', error);
    throw new Error(`Failed to generate Excel template: ${error.message}`);
  }
};



const updateLeadsOnId = async (leadId, updateLeadBody) => {
  const leadResult = await leadsById(leadId);
  if (!leadResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Leads Not found');
  }
  return Leads.findOneAndUpdate({ _id: ObjectId(leadId) }, { $set: updateLeadBody }, { new: true });
};

const updateUpdatedBy = async (leadId, userId) => {
  return Leads.findOneAndUpdate({ _id: leadId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (leadId, userId) => {
  return Leads.findOneAndUpdate({ _id: leadId }, { $set: { created_by: userId } });
};

const updateLeadOwnership = async (leadId, proID) => {
  return Leads.findOneAndUpdate({ _id: leadId }, { $set: { user_id: ObjectId(proID) } });
};

const listAllLeads = async (page, limit) => {
  const query = { is_deleted: false };
  const options = { limit, skip: page };
  const leads = await Leads.find(query, null, options).lean();
  if (leads.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  const leadsResult = pagination(leads, page, limit, ['_id']);
  return leadsResult;
};

const leadsOnCompanyID = async (companyId, page, limit) => {
  const leads = await Leads.find({ is_deleted: false, company_id: companyId });
  const leadsResult = pagination(leads, page, limit, ['_id']);
  if (leads.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  return leadsResult;
};

const leadsById = async leadId => {
  const leads = await Leads.findById({ _id: ObjectId(leadId) });
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  return leads;
};

const deleteLeads = async leadId => {
  const leads = await Leads.findByIdAndUpdate({ _id: ObjectId(leadId) }, { is_deleted: true });
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Leads');
  }
  return leads;
};

const leadsOnStatus = async (status, page, limit) => {
  let leads = await Leads.find({ status: status });
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  let leadsResult = pagination(leads, page, limit, ['_id']);
  return leadsResult;
};

const leadsFilterAndSearch = async (reqBody, page, limit) => {
  let pipeline = [
    {
      $match: {
        is_deleted: false
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        lead_name: 1,
        timeline_to_hire:1,
        engagement_level:1,
        decision_maker_involvement:1,
        user_id: 1,
        company_id: 1,
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        user_name: {
          $concat: [
            '$userDetails.first_name',
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.middle_name'] }
              }
            },
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.last_name'] }
              }
            }
          ]
        }
      }
    }
  ];
  if (reqBody.selected_company_id) {
    pipeline.unshift(...queryService(reqBody));
  }
  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      pipeline.push({ $match: { status: { $in: reqBody.status } } });
    } else {
      pipeline.push({ $match: { status: reqBody.status } });
    }
  }
  if (reqBody.start_date && reqBody.end_date) {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    pipeline.push({
      $match: {
        createdAt: { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) }
      }
    });
  }
  if (reqBody.user_id) {
    if (Array.isArray(reqBody.user_id)) {
      pipeline.push({ $match: { user_id: { $in: reqBody.user_id.map(id => ObjectId(id)) } } });
    } else {
      pipeline.push({ $match: { user_id: ObjectId(reqBody.user_id) } });
    }
  }
  if (reqBody.search) {
    const searchRegex = new RegExp(reqBody.search, 'i');
    pipeline.push({
      $match: {
        $or: [{ company_name: searchRegex }, { status: searchRegex }, { user_name: searchRegex }]
      }
    });
  }
  let leads = await Leads.aggregate(pipeline);
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  let leadsResult = pagination(leads, page, limit, ['_id']);
  return leadsResult;
};

const leadsDetailsOnLeadsId = async reqBody => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(reqBody.leads_id),
        is_deleted: false
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $lookup: {
        from: 'documents',
        let: { leadId: '$_id', companyId: '$company_id' },
        pipeline:  [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$is_deleted', false] },
                  {
                    $or: [
                      { $eq: ['$foreign_id', '$$leadId'] },
                      { $eq: ['$foreign_id', '$$companyId'] } // or another field name if different
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'documents'
      }
    },
    {
      $project: {
        _id: 1,
        lead_name: 1,
        timeline_to_hire:1,
        engagement_level:1,
        decision_maker_involvement:1,
        processes: 1,
        status: 1,
        createdAt: 1,
        user_id: 1,
        company_id: 1,
        client_type: 1,
        service_type: 1,
        inquiry_date: 1,
        contact_person: 1,
        lead_details: 1,
        kyc_details: 1,
        process: 1,
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        last_name: '$userDetails.last_name',
        user_image_url: '$userDetails.image_url',
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        company_website: '$companyDetails.website',
        company_email: '$companyDetails.email',
        company_phone: '$companyDetails.company_phone',
        registration_number: '$companyDetails.registration_number',
        business_industry: '$companyDetails.business_industry',
        type_of_business: '$companyDetails.type_of_business',
        no_of_employees: '$companyDetails.no_of_employees',
        company_notes: '$companyDetails.company_notes',
        days_since_lead_received: { $floor: { $divide: [{ $subtract: [new Date(), '$createdAt'] }, 24 * 60 * 60 * 1000] } },
        documents: {
          $map: {
            input: '$documents',
            as: 'doc',
            in: {
              _id: '$$doc._id',
              name: '$$doc.name',
              type: '$$doc.type',
              url: '$$doc.url',
              createdAt: '$$doc.createdAt',
              status: '$$doc.status',
              foreign_id: '$$doc.foreign_id',
            }
          }
        }
      }
    }
  ];
  let leads = await Leads.aggregate(pipeline);
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  return leads;
};

const listOfUnsuccessfulLeads = async (page, limit) => {
  let pipeline = [
    {
      $match: {
        is_deleted: false,
        is_unsuccessful: true
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        lead_name: 1,
        timeline_to_hire:1,
        engagement_level:1,
        decision_maker_involvement:1,
        user_id: 1,
        company_id: 1,
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        user_name: {
          $concat: [
            '$userDetails.first_name',
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.middle_name'] }
              }
            },
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.last_name'] }
              }
            }
          ]
        }
      }
    }
  ];
  let leads = await Leads.aggregate(pipeline);
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  let leadsResult = pagination(leads, page, limit, ['_id']);
  return leadsResult;
};

const getUnsuccessfulLeadsDetailsOnID = async leadId => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(leadId),
        is_unsuccessful: true
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $project: {
        _id: 1,
        lead_name: 1,
        timeline_to_hire:1,
        engagement_level:1,
        decision_maker_involvement:1,
        reason_for_unsuccessful: 1,
        unsuccessful_on: 1,
        lead_details: 1,
        contact_person: 1,
        company_name: '$companyDetails.company_name',
        no_of_employees: '$companyDetails.no_of_employees',
        company_email: '$companyDetails.email',
        company_phone: '$companyDetails.phone',
        company_notes: '$companyDetails.company_notes'
      }
    }
  ];
  let leads = await Leads.aggregate(pipeline);
  if (!leads) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Leads');
  }
  return leads;
};

const markUnsuccessful = async (leadsId, reqBody) => {
  const leadsResult = await leadsById(leadsId);
  if (!leadsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to mark Unsuccessful');
  }
  const updateFields = {
    is_unsuccessful: true,
    reason_for_unsuccessful: reqBody.reason_for_unsuccessful,
    unsuccessful_on: moment.tz('UTC').tz('Asia/Dubai').format(),
    status: 'unsuccessful'
  };
  return Leads.findOneAndUpdate({ _id: leadsId }, { $set: updateFields }, { new: true });
};

const leadProgressStageMoveForward = async (leadsId, userId, reqBody) => {
  const leadsResult = await leadsById(leadsId);
  if (!leadsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }

  const filter_progress_process_status = {
    _id: ObjectId(leadsId),
    'processes.process_status': 'progress'
  };

  const docs = await Leads.find(filter_progress_process_status);

  let result = [];

  for (const doc of docs) {
    for (let index = 0; index < doc.processes.length; index++) {
      const process = doc.processes[index];

      if (process.process_status === 'progress' && process.actions.length > 0) {
        let allActionsCompleted = true;

        for (const action of process.actions) {
          if (action.status === 'progress') {
            if (toLower(action.action_type) === 'no action') {
              console.log('action type NO ACTION ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }

            if (toLower(action.action_type) === 'email') {
              console.log('action type EMAIL ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }

            if (toLower(action.action_type) === 'document') {
              console.log('action type DOCUMENT ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }

            if (toLower(action.action_type) === 'document upload') {
              console.log('action type NO DOCUMENT UPLOAD ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }
          }

          if (action.status !== 'completed') {
            allActionsCompleted = false;
          }
        }

        if (allActionsCompleted && doc.processes.length == index + 1) {
          process.process_status = 'completed';
          doc.status = 'active';
          const companyStatusUpdate = await Companies.updateOne(
            { _id: ObjectId(leadsResult.company_id) },
            { $set: { status: 'active', is_lead: false } }
          );
        }

        if (allActionsCompleted && doc.processes.length != index + 1) {
          process.process_status = 'completed';
          doc.processes[index + 1].process_status = 'progress';

          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        } else {
          for (const action of process.actions) {
            if (action.status === 'pending') {
              action.status = 'progress';
              break;
            }
          }
        }

        break;
      }

      if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
        process.process_status = 'completed';
        doc.status = toLower(process.stage_name);
        process.actions = [
          {
            updated_by: userId,
            updated_date_time: moment.tz('UTC').tz('Asia/Dubai').format(),
            status: 'completed'
          }
        ];

        if (doc.processes.length != index + 1) {
          doc.processes[index + 1].process_status = 'progress';

          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        }

        break;
      }
    }

    result = doc;
    const updated_process = await Leads.updateOne(
      { _id: ObjectId(leadsId) },
      { $set: { processes: doc.processes, status: doc.status } }
    );
  }

  return result;
};

const leadProgressStageMoveBackward = async leadsId => {
  const filter_progress_process_status = { _id: ObjectId(leadsId), 'processes.process_status': 'progress' };
  let result = [];
  await Leads.find(filter_progress_process_status)
    .then(docs => {
      docs.forEach(async doc => {
        for (let index = doc.processes.length - 1; index >= 0; index--) {
          const process = doc.processes[index];
          if (process.process_status === 'progress' && process.actions.length > 0) {
            let allActionsCompleted = true;
            // for (let action_index = process.actions.length - 1; action_index >= 0; action_index--) {
            for (let action_index = 0; action_index < process.actions.length; action_index++) {
              const action = process.actions[action_index];
              if (action.status === 'completed') {
                // ACTION TO BE PERFORMED HERE
                action.status = 'progress';
                break; // Exit the loop after updating the status of one action
              }
              if (action.status !== 'pending') {
                allActionsCompleted = false;
              }
            }

            if (allActionsCompleted && doc.processes.length != index - 1) {
              process.process_status = 'pending';
              doc.processes[index - 1].process_status = 'progress';
              // if (doc.processes && doc.processes[index - 1] && doc.processes[index - 1].actions && doc.processes[index - 1].actions.length > 0) {
              //     const action_length = doc.processes[index - 1].actions.length
              //     doc.processes[index - 1].actions[action_length - 1].status = 'progress'
              // }
              if (doc.processes[index - 1].actions.length > 0) {
                doc.processes[index - 1].actions[0].status = 'progress';
              }
            } else {
              // for (let i = process.actions.length - 1; i >= 0; i--) {
              for (let i = 0; i < process.actions.length; i++) {
                const action = process.actions[i];
                if (action.status === 'progress') {
                  action.status = 'pending';
                  break;
                }
              }
            }
            break;
          }
          if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
            process.process_status = 'pending';
            if (doc.processes.length != index - 1) {
              doc.processes[index - 1].process_status = 'progress';
              if (doc.processes[index - 1].actions.length > 0) {
                const action_length = doc.processes[index - 1].actions.length;
                doc.processes[index - 1].actions[action_length - 1].status = 'progress';
              }
            }
            break;
          }
        }
        result = doc.processes;
        const updated_process = await Leads.updateOne({ _id: ObjectId(leadsId) }, { $set: { processes: doc.processes } });
      });
    })
    .catch(error => {
      console.log(error);
    });
  return result;
};

const getLeadsPipeline = async () => {
  // let pipeline_ = ['Lead Received', 'Contact Client', 'Send Proposal', 'Waiting for Approval', 'Collect Documents', 'Service Agreement']
  let stageList = await Processes.find({ module: 'leads' });
  const pipeline_ = stageList[0].stages.map(stage => stage.stage_name);
  let diff_status = [];
  for (let index = 0; index < pipeline_.length; index++) {
    const stage = pipeline_[index];
    let project = {
      $project: {
        _id: 0,
        days_since: {
          $toInt: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24] }
        },
        processes: 1
      }
    };
    let unwind = { $unwind: '$processes' };
    let match_ = {
      $match: {
        'processes.stage_name': stage,
        'processes.process_status': 'progress'
      }
    };
    let group_ = {
      $group: {
        _id: '$processes.stage_name',
        count: { $sum: 1 },
        avgDays: { $avg: '$days_since' }
      }
    };

    let floorAvgDays = {
      $addFields: {
        avgDays: { $floor: '$avgDays' }
      }
    };
    let pipeline_status = await Leads.aggregate([unwind, match_, project, group_, floorAvgDays]);
    if (pipeline_status && pipeline_status.length) {
      diff_status.push(pipeline_status[0]);
    } else {
      let obj = {
        _id: stage,
        count: 0,
        avgDays: 0
      };
      diff_status.push(obj);
    }
  }
  return diff_status;
};

const getDiffPipelineList = async (query, page, limit) => {
  // let pipeline_ = ['Lead Received', 'Contact Client', 'Send Proposal', 'Waiting for Approval', 'Collect Documents', 'Service Agreement']
  let filter = {
    processes: {
      $elemMatch: {
        stage_name: query.stage_name,
        process_status: 'progress'
      }
    }
  };
  let options = {
    page,
    limit
  };
  let body = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $project: {
        _id: 0,
        days_since: {
          $toInt: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24] }
        },
        user_id: 1,
        company_name: '$companyDetails.company_name'
      }
    },
    {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userid'] }]
              }
            }
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
              image_url: 1
            }
          }
        ],
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    }
  ];
  let leads = await Leads.paginateLookup(filter, options, body);
  return leads;
};

const leadsFilterAndSearchForUnsuccessuful = async (query, reqBody) => {
  let result;
  const searchRegex = new RegExp(reqBody.search, 'i');
  let filter = {
    is_deleted: false,
    is_unsuccessful: true
  };
  let body = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        status: 1,
        createdAt: 1,
        lead_name: 1,
        timeline_to_hire:1,
        engagement_level:1,
        decision_maker_involvement:1,
        user_id: 1,
        company_id: 1,
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        user_name: {
          $concat: [
            '$userDetails.first_name',
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.middle_name'] }
              }
            },
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.last_name'] }
              }
            }
          ]
        }
      }
    },
    {
      $match: {
        $or: [{ company_name: searchRegex }, { status: searchRegex }, { user_name: searchRegex }]
      }
    }
  ];
  let options = {
    limit: query.limit,
    page: query.page,
    sortBy: query.sortBy
  };
  if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    if (Array.isArray(reqBody.status)) {
      filter.status = { $in: reqBody.status };
    } else {
      filter.status = reqBody.status;
    }
  }
  if (reqBody.start_date && reqBody.end_date && reqBody.start_date != '' && reqBody.end_date != '') {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
  }
  if (reqBody.company_id && ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')) {
    if (Array.isArray(reqBody.company_id)) {
      let compID = reqBody.company_id.map(id => ObjectId(id));
      filter.company_id = { $in: compID };
    } else {
      filter.company_id = ObjectId(reqBody.company_id);
    }
  }
  if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
    if (Array.isArray(reqBody.user_id)) {
      let usrID = reqBody.user_id.map(id => ObjectId(id));
      filter.user_id = { $in: usrID };
    } else {
      filter.user_id = ObjectId(reqBody.user_id);
    }
  }
  result = await Leads.paginateLookup(filter, options, body);
  return result;
};

const removeFromUnsuccessful = async (leadsId, reqBody) => {
  const leadsResult = await leadsById(leadsId);
  if (!leadsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to mark Unsuccessful');
  }
  const filter_progress_process_status = { _id: ObjectId(leadsId), 'processes.process_status': 'progress' };
  let process_status = 'active';
  await Leads.find(filter_progress_process_status).then(docs => {
    docs.forEach(async doc => {
      for (let index = 0; index < doc.processes.length; index++) {
        const process = doc.processes[index];
        if (process.process_status === 'progress') {
          process_status = process.stage_name;
        }
      }
    });
  });
  const updateFields = {
    is_unsuccessful: false,
    status: process_status,
    reason_for_unsuccessful: ''
  };
  return Leads.findOneAndUpdate({ _id: leadsId }, { $set: updateFields }, { new: true });
};

const listOfLeadsStatus = async (query, reqBody) => {
  let stageList = await Processes.find({ module: 'leads' });
  const pipeline_ = stageList[0].stages.map(stage => stage.stage_name);
  const distinctStatuses = await Leads.distinct('status').exec();
  const statArr = ['active', 'new'];
  let combinedArray = [...pipeline_, ...distinctStatuses, ...statArr];
  const stringsToRemove = ['inactive', 'hold', 'unsuccessful'];
  combinedArray = combinedArray.filter(item => !stringsToRemove.includes(item));
  const uniqueArray = Array.from(new Set(combinedArray));
  return uniqueArray;
};

const getLeadsCounts = async () => {
  const result = await Leads.aggregate([
    {
      $project: {
        not_contacted_clients: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Contact Client'] }, { $eq: ['$$this.process_status', 'progress'] }]
              }
            }
          }
        },
        qualified_leads: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Send Proposal'] }, { $eq: ['$$this.process_status', 'progress'] }]
              }
            }
          }
        },
        proposal_sent: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [
                  { $eq: ['$$this.stage_name', 'Waiting for Approval'] },
                  { $eq: ['$$this.process_status', 'progress'] }
                ]
              }
            }
          }
        },
        document_collection: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Collect Documents'] }, { $eq: ['$$this.process_status', 'progress'] }]
              }
            }
          }
        },
        agreement_signed: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Service Agreement'] }, { $eq: ['$$this.process_status', 'completed'] }]
              }
            }
          }
        },
        avg_response_days: {
          $avg: {
            $toInt: {
              $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24]
            }
          }
        },
        total_leads_count: {
          $sum: 1
        }
      }
    },
    {
      $group: {
        _id: null,
        not_contacted_clients: { $sum: '$not_contacted_clients' },
        qualified_leads: { $sum: '$qualified_leads' },
        proposal_sent: { $sum: '$proposal_sent' },
        document_collection: { $sum: '$document_collection' },
        agreement_signed: { $sum: '$agreement_signed' },
        avg_response_days: { $avg: '$avg_response_days' },
        total_leads_count: { $sum: '$total_leads_count' }
      }
    },
    {
      $project: {
        counts: [
          {
            name: 'Not Contacted Leads',
            count: '$not_contacted_clients'
          },
          {
            name: 'Qualified Leads',
            count: '$qualified_leads'
          },
          {
            name: 'Proposal Sent',
            count: '$proposal_sent'
          },
          {
            name: 'Document Collection',
            count: '$document_collection'
          },
          {
            name: 'Agreement Signed',
            count: '$agreement_signed'
          },
          {
            name: 'Average Response Days',
            count: { $floor: '$avg_response_days' }
          },
          {
            name: 'Total Leads Count',
            count: '$total_leads_count'
          }
        ]
      }
    }
  ]);
  return result[0].counts;
};

const getConversionRate = async () => {
  const result = await Leads.aggregate([
    {
      $match: {
        is_deleted: false // Only count non-deleted leads
      }
    },
    {
      $group: {
        _id: null,
        total_leads: { $sum: 1 },
        unsuccessful_leads: {
          $sum: {
            $cond: [{ $eq: ['$is_unsuccessful', true] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        total_leads: 1,
        unsuccessful_leads: 1,
        successful_leads: { $subtract: ['$total_leads', '$unsuccessful_leads'] },
        conversion_rate: {
          $cond: [
            { $gt: ['$total_leads', 0] }, // Avoid division by zero
            {
              $multiply: [
                { $divide: [{ $subtract: ['$total_leads', '$unsuccessful_leads'] }, '$total_leads'] },
                100
              ]
            },
            0 // Return 0 if no leads exist
          ]
        }
      }
    }
  ]);

  // Return default values if no leads exist
  if (!result || result.length === 0) {
    return {
      total_leads: 0,
      unsuccessful_leads: 0,
      successful_leads: 0,
      conversion_rate: 0
    };
  }

  return result[0];
};

const holdLeads = async leadId => {
  return Leads.findOneAndUpdate(
    { _id: leadId },
    { $set: { status: 'hold', is_unsuccessful: true, reason_for_unsuccessful: 'Lead On Hold' } }
  );
};

const getLeadStatusCount = async () => {
  try {
    const leadProcesses = await Processes.findOne({ module: /leads/i });
    if (!leadProcesses) {
      throw new Error('lead_processes not found');
    }

    const additionalStatuses = ['completed', 'Unsuccessful'];

    // Get stages from leadProcesses
    const knownStageNames = leadProcesses.stages.map(stage => stage.stage_name);

    // Merge and deduplicate
    const allStagesSet = new Set([...knownStageNames, ...additionalStatuses]);
    const allStages = Array.from(allStagesSet);

    let getCount = await Leads.aggregate([
      {
        $match: {
          is_deleted: false
          // is_unsuccessful: false,
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'userDetails.user_status': { $nin: ['inactive', 'withdrawn', 'offboarding'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_order_value: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$lead_details.overall_total_order_value', null] },
                    {
                      $ne: [{ $type: '$lead_details.overall_total_order_value' }, 'missing']
                    }
                  ]
                },
                {
                  $cond: [
                    {
                      $eq: [{ $type: '$lead_details.overall_total_order_value' }, 'string']
                    },
                    {
                      $convert: {
                        input: {
                          $replaceAll: {
                            input: '$lead_details.overall_total_order_value',
                            find: ',',
                            replacement: ''
                          }
                        },
                        to: 'double',
                        onError: 0,
                        onNull: 0
                      }
                    },
                    {
                      $convert: {
                        input: '$lead_details.overall_total_order_value',
                        to: 'double',
                        onError: 0,
                        onNull: 0
                      }
                    }
                  ]
                },
                0
              ]
            }
          }
        }
      }
    ]);

    // Ensure all stages are represented
    for (let stage of allStages) {
      if (!getCount.some(item => item._id === stage)) {
        getCount.push({ _id: stage, count: 0, total_order_value: 0 });
      }
    }

    // Filter and sort based on known stages
    getCount = getCount
      .filter(item => item._id && allStages.includes(item._id))
      .sort((a, b) => allStages.indexOf(a._id) - allStages.indexOf(b._id));

    // Compute totals
    const total = getCount.reduce(
      (acc, item) => {
        acc.count += item.count;
        acc.total_order_value += item.total_order_value;
        return acc;
      },
      { count: 0, total_order_value: 0 }
    );

    // Append total row
    getCount.push({
      _id: 'Total',
      count: total.count,
      total_order_value: total.total_order_value
    });

    return getCount;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  getLeadStatusCount,
  creationOfLeads,
  updateLeadsOnId,
  updateUpdatedBy,
  updateCreatedBy,
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
  updateLeadOwnership,
  bulkUploadLeads,
  exportBulkUploadTemplate
};
