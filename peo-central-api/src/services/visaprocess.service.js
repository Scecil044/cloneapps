const { ObjectId } = require('mongodb');
// const {  } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment-timezone');
const { toLower } = require('lodash');
const { DocumentTemplatesClone, Documents } = require('../models');
const { DocumentTemplate, Notification, Users, Companies, VisaProcess, Offboardings } = require('../models');
const { Processes } = require('../models');
const queryService = require('./query.service');
const userService = require('./users.service');
const { sendEmail, sendRawEmail } = require('../middlewares/email');
const { sendNotification } = require('../controllers/notifications');
const emailTemplateService = require("./email_template.service");
const {getInsuranceAgents} = require("../helpers/insurance_agents.helper")

const notifications = async (type, subType, processDoc, approver, applicant, CurrentModule) => {
  try {
    let notification = {
      user_id: [String(applicant)],
      read_by: [],
      notification_type: 'Process Approval',
      notification_text: `Action Needed: The next step in your progress requires your input. Please open the app to proceed`,
      created_by: approver,
      url: '',
      createdDate: new Date(),
      type: {
        type: 'Process Flow',
        _id: processDoc?._id?.toString(),
        status: processDoc.status,
      },
      flashNotifications: [
        {
          title: 'Action Needed',
          text: `The next step in your progress requires your input. Please open the app to proceed`,
          module: CurrentModule,
          isRead: false,
        }
      ]
    };

    const notify = new Notification(notification);
    const savedNotification = await notify.save();

     // web push notification
     await sendNotification();
    // Return the notification ID and the flash notification ID
    return {
      notificationId: savedNotification._id,
      flashNotificationId: savedNotification.flashNotifications[0]._id
    };

  } catch (error) {
    console.log(error);
    return null;
  }
};

// Add a function to update flash notification status
const updateFlashNotificationStatus = async (notificationId, flashNotificationId) => {
  try {
    await Notification.updateOne(
      {
        "_id": ObjectId(notificationId),
        "flashNotifications._id": ObjectId(flashNotificationId)
      },
      {
        $set: {
          "flashNotifications.$.isRead": true
        }
      }
    );
  } catch (error) {
    console.log('Error updating flash notification status:', error);
  }
};

const createVisaProcess = async reqBody => {
  let newVisaProcess = new VisaProcess(reqBody);
  return await newVisaProcess.save();
};
const getVisaProcessById = async (visaId) => {
  try{
      let visaProcess = await VisaProcess.findById({ _id: ObjectId(visaId) }).lean();
  if (!visaProcess) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process');
  }

  for (let process of visaProcess.processes) {
    if (!process.documents_required) process.documents_required = [];
    console.log(process.stage_name);
    if(Array.isArray(process.comments)){
      process.comments = process.comments.filter(comment => !comment.is_deleted)
    }
    // Handle case for document preview
    if (process.content_visibility && process.content_visibility.length > 0) {
      for (let user of process.content_visibility) {
        if (user == 'isEmployee') {
          if (process.documents_required.length > 0) {
            // Map and fetch documents in one step
            const documentTypeIds = process.documents_required.map(id =>
              ObjectId.isValid(id) ? ObjectId(id) : id
            );

            const documents = await Documents.find({
              type: { $in: documentTypeIds },
              foreign_id: ObjectId(visaId),
              is_deleted: false,
            });

            // Ensure process.attachments is an array
            if (!Array.isArray(process.attachments)) {
              process.attachments = [];
            }

            // Add documents to process.attachments (avoid duplicates)
            for (let document of documents) {
              if (!process.attachments.includes(document.url)) {
                process.attachments.push(document.url);
              }
            }
          }
        }
      }
    }
  }
  const userDoc = await Users.findById(visaProcess.user_id);

    console.log("in it----->");
    console.log(userDoc.employment)
    visaProcess.employment = userDoc.employment;
    // handle case for work bundle
    if (
  visaProcess.visa_application_platform &&
  visaProcess.visa_application_platform.toLowerCase() === "work bundle" &&
  Array.isArray(visaProcess.processes)
) {
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", visaProcess.processes.length, "this is the date", visaProcess.createdAt)
  const stageNames = visaProcess.processes.map(p => p.stage_name?.toLowerCase().trim());
  const hasTawjeehTraining = stageNames.includes("tawjeeh training");
  const hasTawjeehCompleted = stageNames.includes("tawjeeh training completed");

  if (hasTawjeehTraining || hasTawjeehCompleted) {
    console.log("first condition met")
      const targetDate = moment('2025-08-06T00:00:00.000+00:00');
      const isCreatedOnOrAfterTarget = moment(visaProcess.createdAt).isSameOrAfter(targetDate, 'day');
    if(isCreatedOnOrAfterTarget){
      const updatedProcesses = visaProcess.processes.filter(
      (p) => {
        const stage = p.stage_name?.toLowerCase().trim();
        return stage !== "tawjeeh training" && stage !== "tawjeeh training completed";
      }
    );

    // Save the updated processes if necessary
    await VisaProcess.findByIdAndUpdate(
      visaProcess._id,
      { processes: updatedProcesses },
      { new: true }
    );
    }
  }
}
  console.log(visaProcess.processes.length,  "is the new length")
   return visaProcess;
  }catch(error){
    throw error;
  }
};


const getVisaProcessOnUserId = async userId => {
  let visaProcess = await VisaProcess.find({ user_id: ObjectId(userId) });
  if (!visaProcess) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process on the provided UserID');
  }
  for (let process of visaProcess[0].processes) {
    if (!process.documents_required) process.documents_required = [];

    // Handle case for document preview
    if (process.content_visibility && process.content_visibility.length > 0) {
      for (let user of process.content_visibility) {
        if (user == 'isEmployee') {

          const documents = await Documents.find({
            identifier: process.stage_name,
            foreign_id: ObjectId(visaProcess[0]._id),
            is_deleted: false,
          });
          //  Ensure process.attachments is an array
          if (!Array.isArray(process.attachments)) {
            process.attachments = [];
          }

          // Add documents to process.attachments
          for (let document of documents) {
            process.attachments.push(document.url);
          }


          // console.log('user is employee');

          // if (process.documents_required && process.documents_required.length > 0) {
          //   for (let documentTypeIds of process.documents_required) {
          //     const documentTypeIds = process.documents_required.map(id =>
          //       ObjectId.isValid(id) ? ObjectId(id) : id
          //     );

          //     const documents = await Documents.find({
          //       type: { $in: documentTypeIds },
          //       foreign_id: ObjectId(visaProcess[0]._id),
          //       is_deleted: false,
          //     });

          //     // Ensure process.attachments is an array
          //     if (!Array.isArray(process.attachments)) {
          //       process.attachments = [];
          //     }

          //     // Add documents to process.attachments
          //     for (let document of documents) {
          //       process.attachments.push(document.url);
          //     }
          //   }
          // }
        }
      }
    }
  }
  return visaProcess;
};

const updateUpdatedBy = async (visaId, userId) => {
  return VisaProcess.findOneAndUpdate({ _id: visaId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (visaId, userId) => {
  return VisaProcess.findOneAndUpdate({ _id: visaId }, { $set: { created_by: userId } });
};

const updateVisaProcessOnId = async (visaId, updateBody) => {
  const result = await getVisaProcessById(visaId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Visa Process Not found');
  }
  return VisaProcess.findOneAndUpdate({ _id: visaId }, { $set: updateBody }, { new: true });
};

const listAllVisaProcess = async (page, limit) => {
  const result = await VisaProcess.find({ is_deleted: false });
  if (result == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process');
  }
  return result;
};

const visaProcessFlowForwardLastVersion = async (reqBody, visaId, userId) => {
  const visaProcessResult = await getVisaProcessById(visaId);
  if (!visaProcessResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }

  const filter_progress_process_status = { _id: ObjectId(visaId), 'processes.process_status': 'progress' };
  const docs = await VisaProcess.find(filter_progress_process_status);
  const result = [];

  for (const doc of docs) {
    for (let index = 0; index < doc.processes.length; index++) {
      const process = doc.processes[index];

      if (process.process_status === 'progress' && process.actions.length > 0) {
        let allActionsCompleted = true; // Logic for checking action completion remains unchanged.

        if (allActionsCompleted) {
          // If this process has a notification, mark it as read
          if (process.notificationId && process.flashNotificationId) {
            await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
          }

          process.process_status = 'completed';
          process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();

          let nextsequence = 0;
          for (let j = 0; j < doc.processes.slice(index + 1).length; j++) {
            nextsequence += 1;
            if (doc.processes.slice(index + 1)[j].complete_condition === 'Sequential') {
              break;
            }
          }

          if (nextsequence > 0 && doc.processes.length - 1 >= index + nextsequence) {
            const nextProcess = doc.processes[index + nextsequence];
            nextProcess.process_status = 'progress';
            doc.status = nextProcess.stage_name.toLowerCase();

            if (nextProcess.assigned_users.includes('isEmployee') && nextProcess.process_status == 'progress' && !nextProcess.notificationId) {
              const notificationIds = await notifications(
                'applicant',
                'approver',
                visaProcessResult,
                userId,
                visaProcessResult.user_id,
                reqBody?.module ||
                  (visaProcessResult.process_type === "new visa process" ? 'Onboarding Visa process' :
                  (visaProcessResult.process_type === "visa cancellation" ? 'Visa Cancellation' :
                  (visaProcessResult.process_type === "visa renewal" ? 'Visa Renewal' : '')))
              );

              // Store notification IDs in the process for later reference
              if (notificationIds) {
                nextProcess.notificationId = notificationIds.notificationId;
                nextProcess.flashNotificationId = notificationIds.flashNotificationId;
              }
            }

            if (nextProcess.actions.length > 0) {
              nextProcess.actions[0].status = 'progress';
            }
          }
        } else {
          for (const action of process.actions) {
            if (action.status === 'pending' && toLower(reqBody.button) !== 'create invoice') {
              action.status = 'progress';
              break;
            }
          }
        }

        break;
      }

      if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
        // If this process has a notification, mark it as read
        if (process.notificationId && process.flashNotificationId) {
          await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
        }

        process.process_status = 'completed';
        process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
        doc.status = toLower(process.stage_name);

        let nextsequence = 0;
        for (let j = 0; j < doc.processes.slice(index + 1).length; j++) {
          nextsequence += 1;
          if (doc.processes.slice(index + 1)[j].complete_condition === 'Sequential') {
            break;
          }
        }

        if (doc.processes.length !== index + nextsequence) {
          const nextProcess = doc.processes[index + nextsequence];
          nextProcess.process_status = 'progress';

          if (nextProcess.assigned_users.includes('isEmployee') && nextProcess.process_status == 'progress' && !nextProcess.notificationId) {
            const notificationIds = await notifications(
              'applicant',
              'approver',
              visaProcessResult,
              userId,
              visaProcessResult.user_id,
              reqBody?.module ||
                (visaProcessResult.process_type === "new visa process" ? 'Onboarding Visa process' :
                (visaProcessResult.process_type === "visa cancellation" ? 'Visa Cancellation' :
                (visaProcessResult.process_type === "visa renewal" ? 'Visa Renewal' : '')))
            );

            // Store notification IDs in the process for later reference
            if (notificationIds) {
              nextProcess.notificationId = notificationIds.notificationId;
              nextProcess.flashNotificationId = notificationIds.flashNotificationId;
            }
          }
        }

        break;
      }
    }

    if (doc.processes.length === doc.processes.filter(a => a.process_status === 'completed').length) {
      doc.status = 'completed';
    }

    const updated_visa_process = await VisaProcess.updateOne(
      { _id: ObjectId(visaId) },
      { $set: { processes: doc.processes, status: doc.status } }
    );
    result.push(doc.status);
  }

  return result;
};

/**
 * this is the rvamped version of the code to move visa process forward
 * it includes:
 * -Consolidated notification logic into a single helper function
 * -Simplified the process flow logic while maintaining all functionality
 * This version is more maintainable and maintains the previous flow.. Note:
 * The backups above will be removed if this flow is confirmed, and have been maintained for reference
 */
const visaProcessFlowForwardWorking = async (reqBody, visaId, userId) => {
  const visaProcessResult = await getVisaProcessById(visaId);
  if (!visaProcessResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  const filter_progress_process_status = { _id: ObjectId(visaId), 'processes.process_status': 'progress' };
  const docs = await VisaProcess.find(filter_progress_process_status);
  const result = [];

  // Helper function to handle notifications for next process
  const handleNextProcessNotification = async (nextProcess, visaProcessResult, userId, reqBody) => {
    if (nextProcess.assigned_users.includes('isEmployee') &&
        nextProcess.process_status === 'progress' &&
        !nextProcess.notificationId) {

      const notificationIds = await notifications(
        'applicant',
        'approver',
        visaProcessResult,
        userId,
        visaProcessResult.user_id,
        reqBody?.module ||
          (visaProcessResult.process_type === "new visa process" ? 'Onboarding Visa process' :
          (visaProcessResult.process_type === "visa cancellation" ? 'Visa Cancellation' :
          (visaProcessResult.process_type === "visa renewal" ? 'Visa Renewal' : '')))
      );

      if (notificationIds) {
        nextProcess.notificationId = notificationIds.notificationId;
        nextProcess.flashNotificationId = notificationIds.flashNotificationId;
      }
    }
  };

  for (const doc of docs) {
    for (let index = 0; index < doc.processes.length; index++) {
      const process = doc.processes[index];

      if (process.process_status === 'progress') {
        // If this process has a notification, mark it as read
        if (process.notificationId && process.flashNotificationId) {
          await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
        }

        let shouldComplete = false;

        if (process.actions && process.actions.length > 0) {
          let allActionsCompleted = true;

          if (allActionsCompleted) {
            shouldComplete = true;
          } else {
            for (const action of process.actions) {
              if (action.status === 'pending' && toLower(reqBody.button) !== 'create invoice') {
                action.status = 'progress';
                break;
              }
            }
          }
        } else {
          shouldComplete = true;
        }

        if (shouldComplete) {
          process.process_status = 'completed';
          process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();

          let nextsequence = 0;
          for (let j = 0; j < doc.processes.slice(index + 1).length; j++) {
            nextsequence += 1;
            if (doc.processes.slice(index + 1)[j].complete_condition === 'Sequential') {
              break;
            }
          }

          if (nextsequence > 0 && doc.processes.length - 1 >= index + nextsequence) {
            const nextProcess = doc.processes[index + nextsequence];
            nextProcess.process_status = 'progress';
            doc.status = nextProcess.stage_name.toLowerCase();

            // Handle notification for next process
            await handleNextProcessNotification(nextProcess, visaProcessResult, userId, reqBody);

            if (nextProcess.actions && nextProcess.actions.length > 0) {
              nextProcess.actions[0].status = 'progress';
            }
          }
        }
        // Effect notification email for assigned insurance agent
        if(process.stage_name == "Labour Card and Contract" && process.process_status == "completed"){
          const userDetails = await Users.findById(visaProcessResult.user_id);
          if(!userDetails){
            throw new Error(`Could not find user with associated id:${visaProcessResult.user_id}`);
          }
          const insuranceAgents = await getInsuranceAgents();
          // console.log(insuranceAgents.data, "these are the insurance agents on the system")
          const selectedInsuranceAgent = insuranceAgents.data.find((agent)=> agent?._id.toString() == userDetails.assigned_insurance_agent?.toString());

          const emailTemplt = await emailTemplateService.getEmailTemplateByName({ templateName: 'Notify Assigned Insurance Agent (Visa Process)' });

          if(selectedInsuranceAgent){
            const companyDoc = await Companies.findById(userDetails?.company_id);
            emailTemplt.content = emailTemplt.content.replace('[assigned_insurance_agent]', selectedInsuranceAgent?.full_name);
            emailTemplt.content = emailTemplt.content.replace('[employee_first_name]', userDetails?.first_name);
            emailTemplt.content = emailTemplt.content.replace('[employee_last_name]', userDetails?.last_name);
            emailTemplt.content = emailTemplt.content.replace('[employee_email]', userDetails?.email);
            emailTemplt.content = emailTemplt.content.replace('[company_name]', companyDoc?.company_name);
            emailTemplt.content = emailTemplt.content.replace('[employment_type]', userDetails?.employment.employment_type);
            emailTemplt.content = emailTemplt.content.replace('[visa_sponsor_type]', userDetails?.employment.visa_sponsor_type);
        // do not send email for employees on mission visa
        if(userDetails.employment.employment_type.startsWith("Work Permit")){
          await sendRawEmail(selectedInsuranceAgent.email, emailTemplt.subject, emailTemplt.content, [], [] );
        }
          }
        }
        break;
      }
    }

    if (doc.processes.length === doc.processes.filter(a => a.process_status === 'completed').length) {
      doc.status = 'completed';
      console.log(doc.status.process_type, "this is the process type----$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
      if(doc.process_type == "visa cancellation"){
        console.log("=================================== starting visa process censcellation ===================================>");
        userDetails.user_status = "inactive";
        await userDetails.save();
      }
    }

    const updated_visa_process = await VisaProcess.updateOne(
      { _id: ObjectId(visaId) },
      { $set: { processes: doc.processes, status: doc.status } }
    );
    result.push(doc.status);
  }

  return result;
};

const visaProcessFlowForward = async (reqBody, visaId, userId) => {
  const visaProcessResult = await getVisaProcessById(visaId);
  if (!visaProcessResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  const filter_progress_process_status = { _id: ObjectId(visaId), 'processes.process_status': 'progress' };
  const docs = await VisaProcess.find(filter_progress_process_status);
  const result = [];

  // Helper function to handle notifications for next process
  const handleNextProcessNotification = async (nextProcess, visaProcessResult, userId, reqBody) => {
    if (nextProcess.assigned_users.includes('isEmployee') &&
        nextProcess.process_status === 'progress' &&
        !nextProcess.notificationId) {

      const notificationIds = await notifications(
        'applicant',
        'approver',
        visaProcessResult,
        userId,
        visaProcessResult.user_id,
        reqBody?.module ||
          (visaProcessResult.process_type === "new visa process" ? 'Onboarding Visa process' :
          (visaProcessResult.process_type === "visa cancellation" ? 'Visa Cancellation' :
          (visaProcessResult.process_type === "visa renewal" ? 'Visa Renewal' : '')))
      );

      if (notificationIds) {
        nextProcess.notificationId = notificationIds.notificationId;
        nextProcess.flashNotificationId = notificationIds.flashNotificationId;
      }
    }
  };

  for (const doc of docs) {
    for (let index = 0; index < doc.processes.length; index++) {
      const process = doc.processes[index];

      if (process.process_status === 'progress') {
        // If this process has a notification, mark it as read
        if (process.notificationId && process.flashNotificationId) {
          await updateFlashNotificationStatus(process.notificationId, process.flashNotificationId);
        }

        let shouldComplete = false;

        if (process.actions && process.actions.length > 0) {
          let allActionsCompleted = true;

          if (allActionsCompleted) {
            shouldComplete = true;
          } else {
            for (const action of process.actions) {
              if (action.status === 'pending' && toLower(reqBody.button) !== 'create invoice') {
                action.status = 'progress';
                break;
              }
            }
          }
        } else {
          shouldComplete = true;
        }

        if (shouldComplete) {
          process.process_status = 'completed';
          process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();

          let nextsequence = 0;
          for (let j = 0; j < doc.processes.slice(index + 1).length; j++) {
            nextsequence += 1;
            if (doc.processes.slice(index + 1)[j].complete_condition === 'Sequential') {
              break;
            }
          }

          if (nextsequence > 0 && doc.processes.length - 1 >= index + nextsequence) {
            const nextProcess = doc.processes[index + nextsequence];
            nextProcess.process_status = 'progress';
            doc.status = nextProcess.stage_name.toLowerCase();

            // Handle notification for next process
            await handleNextProcessNotification(nextProcess, visaProcessResult, userId, reqBody);

            if (nextProcess.actions && nextProcess.actions.length > 0) {
              nextProcess.actions[0].status = 'progress';
            }
          }
        }
        // Effect notification email for assigned insurance agent
        if(process.stage_name == "Labour Card and Contract" && process.process_status == "completed"){
          const userDetails = await Users.findById(visaProcessResult.user_id);
          if(!userDetails){
            throw new Error(`Could not find user with associated id:${visaProcessResult.user_id}`);
          }
          const insuranceAgents = await getInsuranceAgents();
          // console.log(insuranceAgents.data, "these are the insurance agents on the system")
          const selectedInsuranceAgent = insuranceAgents.data.find((agent)=> agent?._id.toString() == userDetails.assigned_insurance_agent?.toString());

          const emailTemplt = await emailTemplateService.getEmailTemplateByName({ templateName: 'Notify Assigned Insurance Agent (Visa Process)' });

          if(selectedInsuranceAgent){
            const companyDoc = await Companies.findById(userDetails?.company_id);
            emailTemplt.content = emailTemplt.content.replace('[assigned_insurance_agent]', selectedInsuranceAgent?.full_name);
            emailTemplt.content = emailTemplt.content.replace('[employee_first_name]', userDetails?.first_name);
            emailTemplt.content = emailTemplt.content.replace('[employee_last_name]', userDetails?.last_name);
            emailTemplt.content = emailTemplt.content.replace('[employee_email]', userDetails?.email);
            emailTemplt.content = emailTemplt.content.replace('[company_name]', companyDoc?.company_name);
            emailTemplt.content = emailTemplt.content.replace('[employment_type]', userDetails?.employment.employment_type);
            emailTemplt.content = emailTemplt.content.replace('[visa_sponsor_type]', userDetails?.employment.visa_sponsor_type);
        // do not send email for employees on mission visa
        if(userDetails.employment.employment_type.startsWith("Work Permit")){
          await sendRawEmail(selectedInsuranceAgent.email, emailTemplt.subject, emailTemplt.content, [], [] );
        }
          }
        }
        break;
      }
    }

    if (doc.processes.length === doc.processes.filter(a => a.process_status === 'completed').length) {
      doc.status = 'completed';
      if(docs[0].process_type == "visa cancellation"){
        const userDetails = await Users.findById(docs[0].user_id);
        if(userDetails) {
          // console.log("found user detauls from visa procee$$$$$$", userDetails?.first_name)
          userDetails.user_status = "inactive";
          await userDetails.save();
          // console.log("user status updated to inactive", userDetails?.user_status, "is the new status")
        }
      }
    }

    doc.markModified('processes');
    const updated_visa_process = await VisaProcess.updateOne(
      { _id: ObjectId(visaId) },
      { $set: { processes: doc.processes, status: doc.status } }
    );
    result.push(doc.status);
  }

  return result;
};
const visaProcessFlowCompleteStep = async (reqBody, visaId, userId) => {
  const visaProcessResult = await getVisaProcessById(visaId);
  if (!visaProcessResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  const filter_progress_process_status = { _id: ObjectId(visaId) };
  const docs = await VisaProcess.find(filter_progress_process_status);
  const result = [];

  for (const doc of docs) {
    if (doc.processes[reqBody.index].complete_condition.toLowerCase() == 'anytime') {
      doc.processes[reqBody.index].process_status = 'completed';
      doc.processes[reqBody.index].completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
    }
    if (doc.processes.length == doc.processes.filter(a => a.process_status == 'completed').length) {
      doc.status = 'completed';
    }
    const updated_visa_process = await VisaProcess.updateOne(
      { _id: ObjectId(visaId) },
      { $set: { processes: doc.processes, status: doc.status } }
    );
    result.push(doc);
  }

  return result;
};

const visaRenewalProcessFlowBackward = async visaId => {
  const filter_progress_process_status = { _id: ObjectId(visaId), 'processes.process_status': 'progress' };
  let result = [];
  await VisaProcess.find(filter_progress_process_status).then(docs => {
    docs.forEach(async doc => {
      for (let index = doc.processes.length - 1; index >= 0; index--) {
        const process = doc.processes[index];
        if (process.process_status === 'progress' && process.actions.length > 0) {
          let allActionsCompleted = true;
          for (let action_index = 0; action_index < process.actions.length; action_index++) {
            const action = process.actions[action_index];
            if (action.status === 'completed') {
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
            if (doc.processes[index - 1].actions.length > 0) {
              doc.processes[index - 1].actions[0].status = 'progress';
            }
          } else {
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
      const updated_process = await VisaProcess.updateOne({ _id: ObjectId(visaId) }, { $set: { processes: doc.processes } });
    });
  });
  return result;
};

const getVisaProcessPipelineCount = async () => {
  // let pipeline_ = ['MOL Offer Letter', 'User Acceptance of Job Offer', 'MOL Pre Approval', 'E-Visa Application', 'Stamped E-Visa', 'Medical Test Application', 'Emirates ID Application',
  //   'Health Insurance Application', 'Passport Collections', 'Visa Stamping', 'Passport Stamped Collection', 'Emirates ID Issuance', 'Medical Card Issuance', 'Labour Card']
  let stageList = await Processes.find({ process_name: 'new visa process' });
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
    let pipeline_status = await VisaProcess.aggregate([unwind, match_, project, group_, floorAvgDays]);
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

const getVisaDiffPipelineList = async (query, page, limit) => {
  // let pipeline_ = ['MOL Offer Letter', 'User Accept of Job Offer', 'MOL Pre-Approval', 'E-Visa Application', 'Stamped E-Visa', 'Medical Test Application', 'E-ID Registration',
  // 'Health Insurance', 'Passport Collections', 'Visa Stamping', 'Passport Stamped Collection', 'Emirates ID Card Issuance', 'Medical Card Issuance', 'Labour card & Contract']
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
  let visa = await VisaProcess.paginateLookup(filter, options, body);
  return visa;
};

const listOfVisaProcessStatus = async (query, reqBody) => {
  const distinctStatuses = await VisaProcess.distinct('status').exec();
  return distinctStatuses;
};

const listOnProcessStatus = async (processType, stageName, query, reqBody) => {
  try{
    let filter = {
      process_type: toLower(processType),
      status: toLower(stageName),
      is_deleted: false
    };
    let body = [
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $match: {
          'userDetails.0.user_status': { $nin: ['inactive', 'withdrawn']}
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
          from: 'onboardings',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'onboardingDetails'
        }
      },
      {
        $lookup:{
          from: "users",
          localField:"assigned_pro",
          foreignField:"_id",
          as:"assignedProDetails"
        }
      },
      {
        $unwind:{
          path:"$assignedProDetails",
          preserveNullAndEmptyArrays:true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assigned_support_agent',
          foreignField: '_id',
          as: 'supportAgentDetails'
        }
      },
      {
        $unwind: {
          path: '$supportAgentDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          processes: 1,
          attachments: 1,
          comments: 1,
          user_id: 1,
          company_id: 1,
          process_type: 1,
          status: 1,
          createdAt: 1,
          first_name: { $arrayElemAt: ['$userDetails.first_name', 0] },
          middle_name: { $arrayElemAt: ['$userDetails.middle_name', 0] },
          last_name: { $arrayElemAt: ['$userDetails.last_name', 0] },
          user_image: { $arrayElemAt: ['$userDetails.image_url', 0] },
          work_location: { $arrayElemAt: ['$userDetails.employment.work_location', 0] },
          employment_type: { $arrayElemAt: ['$userDetails.employment.employment_type', 0] },
          employment: {
            $arrayElemAt: ['$userDetails.employment', 0]
          },
          user_location: { $arrayElemAt: ['$onboardingDetails.user_location', 0] },
          company_name: { $arrayElemAt: ['$companyDetails.company_name', 0] },
          company_logo: { $arrayElemAt: ['$companyDetails.logo', 0] },
          assigned_pro: {
            $ifNull: [
              {
                $concat: [
                  { $ifNull: ["$assignedProDetails.first_name", ""] },
                  " ",
                  { $ifNull: ["$assignedProDetails.last_name", ""] }
                ]
              },
              ""
            ]
          },
          support_agent: {
            $cond: {
              if: { $ne: ['$supportAgentDetails', null] },
              then: {
                $concat: [
                  { $ifNull: ['$supportAgentDetails.first_name', ''] },
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ['$supportAgentDetails.middle_name', null] },
                          { $ne: ['$supportAgentDetails.middle_name', ''] }
                        ]
                      },
                      then: { $concat: [' ', '$supportAgentDetails.middle_name'] },
                      else: ''
                    }
                  },
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ['$supportAgentDetails.last_name', null] },
                          { $ne: ['$supportAgentDetails.last_name', ''] }
                        ]
                      },
                      then: { $concat: [' ', '$supportAgentDetails.last_name'] },
                      else: ''
                    }
                  }
                ]
              },
              else: 'No Support Agent Assigned'
            }
          },
          visa_application_platform:1,

        }
      }
    ];
    let options = {
      limit: query.limit,
      page: query.page,
      sortBy: query.sortBy ? query.sortBy : 'createdAt:-1',
    };
    if (reqBody.selected_company_id) {
      reqBody.visaProcessFilter =true
      body.unshift(...queryService(reqBody));
    }
    // optionally filter by user id
    if (reqBody.user_id) {
      body.unshift({
        $match: {
          user_id: ObjectId(reqBody.user_id)
        }
      });
    }
    if(reqBody.assigned_pro){
      const proIds = reqBody.assigned_pro.map(id => ObjectId(id))
      body.unshift({
       $match:{
        assigned_pro: {$in:proIds}
       }
      })
    }
    if (reqBody.month) {
      const month = parseInt(reqBody.month); // Ensure month is a number
      const startDate = new Date(new Date().getFullYear(), month - 1, 1); // First day of the month
      const endDate = new Date(new Date().getFullYear(), month, 1); // First day of next month

      body.unshift({
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate
          }
        }
      });
    }
   console.log(filter, " the filter")
   console.log(options, "options")
   console.log(JSON.stringify(body), "body")
    let result = await VisaProcess.paginateLookup(filter, options, body);
    console.log(result,"result")
    return result;
  }catch(error){
    throw error;
  }
};

const createVisaRenewals = async (reqBody, userId) => {
  let docCloneIds = [];
  let processArray = await Processes.find({ process_name: 'visa renewal' });
  let visRenewalBody = {
    user_id: reqBody.user_id,
    company_id: reqBody.company_id,
    process_type: 'visa renewal',
    status: 'mol letter',
    processes: processArray[0].stages,
    created_by: userId
  };
  const documents = processArray[0].stages.map(async process => {
    const documentActions = process.actions.filter(async action => {
      if (action.action_type === 'document') {
        let document_template = await DocumentTemplate.findById({ _id: ObjectId(action.template_id) });
        const template = document_template;
        template.auto_replace_keys.forEach(async replaceKeys => {
          replaceKeys.fk_id = '';
        });
        let templateBody = {
          auto_replace_keys: template.auto_replace_keys,
          user_input_keys: template.user_input_keys,
          name: template.name,
          content: template.content,
          module: template.module
        };
        const create_document_template_clone = await new DocumentTemplatesClone(templateBody).save();
        action.template_id = create_document_template_clone._id;
        docCloneIds.push({ _id: create_document_template_clone._id });
        visRenewalBody.processes = processArray[0].stages;
        return true;
      }
      return false;
    });
    if (documentActions.length > 0) {
      return process;
    }
  });

  let newVisaRenewalProcess = await new VisaProcess(visRenewalBody).save();
  await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: newVisaRenewalProcess._id } });

  return visRenewalBody;
};

const createVisaCancellation = async (reqBody, userId) => {
  let docCloneIds = [];
  let processArray = await Processes.find({ process_name: 'visa cancellation' });
  let visaCancellationBody = {
    user_id: reqBody.user_id,
    company_id: reqBody.company_id,
    process_type: 'visa cancellation',
    status: 'labor cancellation typing',
    processes: processArray[0].stages,
    created_by: userId
  };
  const documents = processArray[0].stages.map(async process => {
    const documentActions = process.actions.filter(async action => {
      if (action.action_type === 'document') {
        let document_template = await DocumentTemplate.findById({ _id: ObjectId(action.template_id) });
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
        const create_document_template_clone = await new DocumentTemplatesClone(templateBody).save();
        action.template_id = create_document_template_clone._id;
        docCloneIds.push({ _id: create_document_template_clone._id });
        visaCancellationBody.processes = processArray[0].stages;
        return true;
      }
      return false;
    });
    if (documentActions.length > 0) {
      return process;
    }
  });

  let newVisaCancellationProcess = await new VisaProcess(visaCancellationBody).save();
  await DocumentTemplatesClone.updateMany(
    { _id: { $in: docCloneIds } },
    { $set: { module_id: newVisaCancellationProcess._id } }
  );

  return visaCancellationBody;
};

const createNewVisa = async (reqBody, userId) => {
  let docCloneIds = [];
  let processArray = await Processes.find({ process_name: 'new visa process' });
  let visaNewBody = {
    user_id: reqBody.user_id,
    company_id: reqBody.company_id,
    process_type: 'new visa process',
    status: 'mol offer letter',
    processes: processArray[0].stages,
    created_by: userId
  };
  const documents = processArray[0].stages.map(async process => {
    const documentActions = process.actions.filter(async action => {
      if (action.action_type === 'document') {
        let document_template = await DocumentTemplate.findById({ _id: ObjectId(action.template_id) });
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
        const create_document_template_clone = await new DocumentTemplatesClone(templateBody).save();
        action.template_id = create_document_template_clone._id;
        docCloneIds.push({ _id: create_document_template_clone._id });
        visaNewBody.processes = processArray[0].stages;
        return true;
      }
      return false;
    });
    if (documentActions.length > 0) {
      return process;
    }
  });

  let newVisaProcess = await new VisaProcess(visaNewBody).save();
  await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: newVisaProcess._id } });

  return visaNewBody;
};

const createProcessVisa = async (reqBody, userId) => {
  let docCloneIds = [];
  let processArray;
  if (reqBody.process_type === 'new visa process') {
    processArray = await Processes.find({ process_name: 'new visa process' });
  } else if (reqBody.process_type === 'visa cancellation') {
    processArray = await Processes.find({ process_name: 'visa cancellation' });
  } else if (reqBody.process_type === 'visa renewal') {
    processArray = await Processes.find({ process_name: 'visa renewal' });
  }
  let visaNewBody = {
    user_id: reqBody.user_id,
    company_id: reqBody.company_id,
    process_type: reqBody.process_type,
    status: 'mol offer letter',
    processes: processArray[0].stages,
    created_by: userId
  };
  const documents = processArray[0].stages.map(async process => {
    const documentActions = process.actions.filter(async action => {
      if (action.action_type === 'document') {
        let document_template = await DocumentTemplate.findById({ _id: ObjectId(action.template_id) });
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
        const create_document_template_clone = await new DocumentTemplatesClone(templateBody).save();
        action.template_id = create_document_template_clone._id;
        docCloneIds.push({ _id: create_document_template_clone._id });
        visaNewBody.processes = processArray[0].stages;
        return true;
      }
      return false;
    });
    if (documentActions.length > 0) {
      return process;
    }
  });

  let newVisaProcess = await new VisaProcess(visaNewBody).save();
  await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: newVisaProcess._id } });

  return visaNewBody;
};

const visaProcessPipelineListAndCount = async processName => {
  let pipeline_ = [];
  if (toLower(processName) === 'new visa process') {
    let stageList = await Processes.find({ process_name: 'new visa process' });
    pipeline_ = stageList[0].stages.map(stage => stage.stage_name);
  }
  if (toLower(processName) === 'visa renewal') {
    let stageList = await Processes.find({ process_name: 'visa renewal' });
    pipeline_ = stageList[0].stages.map(stage => stage.stage_name);
  }
  if (toLower(processName) === 'visa cancellation') {
    let stageList = await Processes.find({ process_name: 'visa cancellation' });
    pipeline_ = stageList[0].stages.map(stage => stage.stage_name);
  }
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
    let pipeline_status = await VisaProcess.aggregate([unwind, match_, project, group_, floorAvgDays]);
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

const findByProcess = async reqBody => {
  let visaProcess = await VisaProcess.findOne({ module: reqBody.module, foreign_id: reqBody.foreign_id });
  if (!visaProcess) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process');
  }
  return visaProcess;
};

const ApplicationDistribution = async reqBody => {
  try{
    let pipeline = [
      {
        $addFields: {
          FirstElement: { $first: '$processes' }
        }
      },
      {
        $addFields: {
          NewStatus: {
            $cond: {
              if: { $eq: [{ $toLower: '$FirstElement.stage_name' }, '$status'] },
              then: 'New',
              else: {
                $cond: {
                  if: { $eq: ['$status', 'completed'] },
                  then: 'Completed',
                  else: {
                    $cond: {
                      if: { $eq: ['$status', 'cancelled'] },
                      then: 'Cancelled',
                      else: 'In Progress'
                    }
                  }
                }
              }
            }
          }
        }
      },

      {
        $group: {
          _id: '$NewStatus',
          count: {
            $sum: 1
          }
        }
      }
    ];

    if (reqBody.selected_company_id) {
      reqBody.visaProcessFilter = true
      pipeline.unshift(...queryService(reqBody));
    }
    let getCount = await VisaProcess.aggregate(pipeline);
    let total = getCount.map(data => data.count).reduce((partialSum, a) => partialSum + a, 0);
    getCount.push({
      _id: 'Total',
      count: total
    });
    return getCount;
  }catch(error){
    throw new Error(error);
  }
};

/**
 * ==================================================================================
 * The implementation of this function -> addCommentToVisaProcess -> adds comments to visa process documents
 * It sends out emails to mentioned users on the comments
 * ==================================================================================
 */
const addCommentToVisaProcess = async (visaId, reqBody, userId, processId) => {
  try {
    const { text, mentionedUsers } = reqBody;
    console.log("this is the text", text, "and this is mentioned users", mentionedUsers);

    // Ensure mentionedUsers is an array
    const mentionedUsersArray = Array.isArray(mentionedUsers) ? mentionedUsers : (mentionedUsers ? [mentionedUsers] : []);

    // Get authenticated user
    const authenticatedUser = await Users.findById(userId);
    if (!authenticatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Create the new comment object
    const newComment = {
      text,
      mentionedUsers: mentionedUsersArray,
      author: {
        _id: authenticatedUser._id,
        first_name: authenticatedUser.first_name,
        last_name: authenticatedUser.last_name,
        email: authenticatedUser.email,
        image_url: authenticatedUser.image_url
      },
      created_at: new Date(),
      _id: new ObjectId(),
      is_deleted: false,
      is_read: false
    };
    console.log(newComment, "the comment body");

    // Find the visa process document
    const visa = await VisaProcess.findById(visaId);
    if (!visa) {
      throw new Error(`Visa process with ID ${visaId} not found`);
    }

    // Find the specific process
    const processIndex = visa.processes.findIndex(p => p._id.toString() === processId.toString());
    if (processIndex === -1) {
      throw new Error(`Process with ID ${processId} not found in visa process`);
    }

    // Ensure the process has a comments array
    if (!visa.processes[processIndex].comments) {
      visa.processes[processIndex].comments = [];
    }

    // Add the comment to the beginning of the array
    visa.processes[processIndex].comments.unshift(newComment);

    // Mark the processes array as modified
    visa.markModified('processes');

    // Save the document
    await visa.save();

    // Now handle email notifications
    if (mentionedUsersArray.length > 0) {
      const specificUser = await userService.getUserById(visa.user_id);
      const sender = await Users.findById(userId);

      // Get emails of mentioned users
      const userEmails = await Promise.all(
        mentionedUsersArray.map(async mentionedId => {
          if (!mentionedId) return null;
          const user = await Users.findById(mentionedId);
          if (user) {
            return user.email;
          } else {
            console.warn(`User with ID ${mentionedId} not found`);
            return null;
          }
        })
      ).then(emails => emails.filter(email => email !== null));

      if (userEmails.length > 0) {
        const mailBody = {
          to: userEmails,
          body: `Hello, <br><br>
            You have been mentioned in the remarks posted by ${sender?.first_name} ${sender?.last_name} on ${specificUser.first_name} ${specificUser.last_name}'s visa process
            <br><br>
            Remarks: "${text}"
          `,
          cc: [],
          subject: 'Visa Process Remarks'
        };

        await sendEmail(mailBody.to, mailBody.subject, mailBody.body, mailBody.cc);
      }
    }

    return visa;
  } catch (error) {
    console.error('Error in addCommentToVisaProcess:', error);
    throw new Error(error.message || 'Failed to add comment to visa process');
  }
};

const markCommentsAsRead = async(visaId, userId,  processId)=>{
  try{
    const visaProcessDoc = await VisaProcess.findById(visaId);
    if(!visaProcessDoc){
      throw new Error('Visa Process not found');
    };
    // find the exact process from processes
    const processToUpdate = visaProcessDoc.processes.find((process)=> process._id.toString() == processId);
    if(!processToUpdate){
      throw new Error('Process not found');
    }
    const userToChek = await Users.findById(userId);
    console.log(userToChek.first_name, userToChek.last_name)
    // loop through comments and mark them all as read
    if(Array.isArray(processToUpdate.comments) && processToUpdate.comments.length > 0){
      for(let comment of processToUpdate.comments){
       if(comment.author && comment.author_id){
        if(comment.author._id.toString() !== userId.toString()){
          comment.is_read = true;
        }
       }else if(comment.author.first_name !==userToChek.first_name && comment.author.last_name !== userToChek.last_name){
        comment.is_read = true;
       }
      }
    }
    visaProcessDoc.markModified('processes');
    await visaProcessDoc.save();
    return visaProcessDoc;
  }catch(error){
    console.log(error)
  }
};


const deleteCommentFromVisaProcess = async (visaId, processId, commentId, userId) => {
  try {
    console.log('Delete params:', { visaId, processId, commentId, userId });


    const visaObjectId = ObjectId(visaId);
    const processObjectId = ObjectId(processId);
    const commentObjectId = ObjectId(commentId);

    const visaProcess = await VisaProcess.findById(visaObjectId);
    if (!visaProcess) throw new Error('Visa process not found');

    const process = visaProcess.processes.find(p => p._id.toString() === processObjectId.toString());
    if (!process) throw new Error('Process not found');


    const comment = process.comments.find(c => c._id.toString() === commentObjectId.toString() && !c.is_deleted);
    if (!comment) throw new Error('Comment not found or has already been deleted');


    comment.is_deleted = true;
    comment.deleted_by = userId;
    comment.deleted_at = new Date();


    visaProcess.markModified('processes');

    await visaProcess.save();

    process.comments = process.comments.filter(c => !c.is_deleted);

    console.log('Updated VisaProcess:', visaProcess);
    return visaProcess;
  } catch (error) {
    console.error('Error details:', error);
    throw new Error(`Error deleting comment: ${error.message}`);
  }
};


const updateCommentInVisaProcess = async (visaId, processId, commentId, userId, reqBody) => {
  try {
    const { text, mentionedUsers } = reqBody;

    // Convert to ObjectId
    const visaObjectId = ObjectId(visaId);
    const processObjectId = ObjectId(processId);
    const commentObjectId = ObjectId(commentId);

    // Find the VisaProcess document
    const visaProcess = await VisaProcess.findById(visaObjectId);
    if (!visaProcess) throw new Error('Visa process not found');

    const process = visaProcess.processes.find(p => p._id.toString() === processObjectId.toString());
    if (!process) throw new Error('Process not found');

    const comment = process.comments.find(c => c._id.toString() === commentObjectId.toString() && !c.is_deleted);
    if (!comment) throw new Error('Comment not found or has been deleted');

    // Ensure only the author can edit their comment
    if (comment.author._id.toString() !== userId.toString()) {
      throw new Error('Unauthorized: You can only edit your own comments');
    }

    // Check for newly mentioned users
    const previousMentionedUsers = comment.mentionedUsers || [];
    const newMentions = mentionedUsers.filter(user => !previousMentionedUsers.includes(user));

    // Update comment fields
    comment.text = text;
    comment.mentionedUsers = mentionedUsers;
    comment.updated_by = userId;
    comment.updated_at = new Date();

    // Mark the nested field as modified
    visaProcess.markModified('processes');

    await visaProcess.save();

    // Send notifications to newly mentioned users
    if (newMentions.length > 0) {
      const specificUser = await userService.getUserById(visaProcess.user_id);
      const sender = await Users.findById(userId);

      const userEmails = await Promise.all(
        newMentions.map(async userId => {
          const user = await Users.findById(userId);
          return user ? user.email : null;
        })
      );

      const validUserEmails = userEmails.filter(email => email !== null);

      if (validUserEmails.length > 0) {
        const mailBody = {
          to: validUserEmails,
          body: `Hello, <br><br>
            You have been mentioned in the updated remarks by ${sender.email} on ${specificUser.first_name} ${specificUser.last_name}'s visa process.
            <br><br>
          `,
          cc: [],
          subject: 'Visa Process Remarks - Update'
        };
        await sendEmail(mailBody.to, mailBody.subject, mailBody.body, mailBody.cc);
      }
    }

    // Return only comments that are not deleted
    process.comments = process.comments.filter(c => !c.is_deleted);

    return visaProcess;
  } catch (error) {
    console.error('Error details:', error);
    throw new Error(`Error updating comment: ${error.message}`);
  }
};



const softDeleteCommentFromVisaProcess = async (visaId, processId, commentId, userId) => {
  try {
    // Update the visa process to set is_deleted to true and add deleted_by
    const update = {
      $set: {
        'processes.$[elem].comments.$[comment].is_deleted': true,
        'processes.$[elem].comments.$[comment].deleted_by': userId
      }
    };

    const arrayFilters = [
      { 'elem._id': processId },
      { 'comment._id': commentId }
    ];

    const updatedVisaProcess = await VisaProcess.findOneAndUpdate(
      { _id: visaId },
      update,
      { new: true, arrayFilters }
    );

    return updatedVisaProcess;
  } catch (error) {
    throw new Error(`Error soft deleting comment: ${error.message}`);
  }
};


// Function to get all  comments associated with specific visa processes
const getVisaProcessComments = async (visaId, processId) => {
  const result = await getVisaProcessById(visaId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process');
  }
  const process = result.processes.find(item => item._id.toString() === processId.toString());
  // Check if the process exists
  if (!process) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find matching process');
  }

  return process.comments;
};

const clearVisaProcessDocComments = async visaId => {
  const visaProcessDoc = await getVisaProcessById(visaId);
  if (!visaProcessDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process by the provided id');
  }
  visaProcessDoc.comments = [];
  await visaProcessDoc.save();

  return visaProcessDoc;
};

const clearCommentsOnVisaProcessByProcessId = async (visaId, processId) => {
  const visaProcessDoc = await getVisaProcessById(visaId);
  if (!visaProcessDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process');
  }

  let processFound = false;
  visaProcessDoc.processes.forEach(item => {
    if (item._id === processId) {
      item.comments = [];
      visaProcessDoc.markModified('processes');
      processFound = true;
    }
  });
  if (!processFound) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find the process specified by the passed process id');
  }
  await visaProcessDoc.save();
  return visaProcessDoc;
};

const addCommentstoVisaProcessDoc = async (visaId, reqBody, userId) => {
  const { text } = reqBody;
  const authenticatedUser = await userService.getUserById(userId);
  if (!text) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please type some text to accompany your intended comment');
  }

  const visaProcessDoc = await getVisaProcessById(visaId);
  const user = await userService.getUserById(visaProcessDoc.user_id);
  const newComment = {
    text,
    author: {
      first_name: authenticatedUser.first_name,
      last_name: authenticatedUser.last_name,
      email: authenticatedUser.email,
      image_url: authenticatedUser.image_url
    },
    created_at: new Date()
  };
  if (visaProcessDoc.comments.length < 1) {
    visaProcessDoc.comments.push(newComment);
  } else {
    visaProcessDoc.comments.unshift(newComment);
  }
  await visaProcessDoc.save();

  const mailBody = {
    to: user.email,
    cc: [],
    body: `Hello, <br></br>
      YA comment has been added to your visa process by ${authenticatedUser.first_name} ${authenticatedUser.last_name}
      <br></br>
    `,
    subject: 'Visa Process Comment'
  };
  await sendEmail(mailBody.to, mailBody.subject, mailBody.body, mailBody.cc);
  return visaProcessDoc;
};

const markAsUnsuccessful = async(reqBody)=>{
  try{
    const visaprocessDoc = await VisaProcess.findById(reqBody.visa_id);
    if(!visaprocessDoc){
      throw new ApiError(httpStatus.NOT_FOUND, 'Visa Process not found')
    }
    const userDoc = await Users.findById(visaprocessDoc.user_id);
    if(!userDoc){
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found! Terminating visa process withdrowal')
    }
    console.log(reqBody.process_type, "this is the process type==============>")

    visaprocessDoc.is_unsuccessful = true;
    visaprocessDoc.reason_for_unsuccessful = reqBody.reason_for_unsuccessful;
    visaprocessDoc.unsuccessful_on = new Date();
    visaprocessDoc.status = 'unsuccessful';
    for(let i = 0; i < visaprocessDoc.processes.length; i++){
      const process = visaprocessDoc.processes[i];
      process.process_status = 'completed';
      process.completed_date = moment.tz('UTC').tz('Asia/Dubai').format();
    }
    await visaprocessDoc.markModified('processes');
    await visaprocessDoc.save();

    switch(reqBody.process_type){
      case "visa renewal":
        // move user straight to offboarding
        console.log("this is a renewal process");
        userDoc.user_status = 'active';
        await userDoc.save();
        break;
      case "visa cancellation":
        // mark user status as active
        console.log("begining process of visa cancellation process---------------->");
        userDoc.user_status = 'active';
        await userDoc.save();
        break;
      case 'new visa process':
        console.log("condition for new visa process==============> setting user status to inactive");
        userDoc.user_status = 'inactive';
        await userDoc.save();
        break;
      default:
        console.log("this is a default process. terminating without modifying anything");
        break;
    }
    return visaprocessDoc;
  }catch(error){
    throw error;
  }
}
module.exports = {
  findByProcess,
  createVisaProcess,
  getVisaProcessById,
  updateVisaProcessOnId,
  listAllVisaProcess,
  updateUpdatedBy,
  updateCreatedBy,
  getVisaProcessOnUserId,
  visaProcessFlowForward,
  visaRenewalProcessFlowBackward,
  getVisaProcessPipelineCount,
  getVisaDiffPipelineList,
  listOfVisaProcessStatus,
  listOnProcessStatus,
  createVisaRenewals,
  createVisaCancellation,
  createNewVisa,
  createProcessVisa,
  visaProcessPipelineListAndCount,
  visaProcessFlowCompleteStep,
  ApplicationDistribution,
  addCommentToVisaProcess,
  getVisaProcessComments,
  clearCommentsOnVisaProcessByProcessId,
  clearVisaProcessDocComments,
  addCommentstoVisaProcessDoc,
  deleteCommentFromVisaProcess,
  softDeleteCommentFromVisaProcess,
  updateCommentInVisaProcess,
  markCommentsAsRead,
  markAsUnsuccessful
};
