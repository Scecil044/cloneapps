const { ObjectId } = require('mongodb');
const {
  Documents,
  emailTemplate,
  Leads,
  Users,
  Onboardings,
  Offboardings,
  VisaProcess,
  DocumentTypes,
  Role,
  Poc,
  DocumentFolder
} = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const queryService = require('./query.service');
const { uploadFilesToS3, uploadFilesToS3base64, mimeTypeUpload, getFileStreamFromS3 } = require('./aws.service');
const { sendEmail, sendRawEmail } = require('../middlewares/email');
const activityService = require('./activities.service');
const { Activity } = require('../models');
const pagination = require('../middlewares/paginate');
const moment = require('moment-timezone');
const mongoose = require('mongoose');

const documentById = async (documentId, module = null) => {
  // For leads module, use aggregation to get resolved document type names
  if (module === 'leads') {
    let documents = await Documents.aggregate([
      { $match: { _id: ObjectId(documentId), is_deleted: false } },
      {
        $lookup: {
          from: 'document_types',
          localField: 'type',
          foreignField: '_id',
          as: 'documentTypeNames'
        }
      },
      {
        $unwind:{
          path:"$documentTypeNames",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          type: '$documentTypeNames.name',
          type_id: '$documentTypeNames._id',
          name: 1,
          foreign_id: 1,
          url: '$url',
          expiry: 1,
          issuance: 1,
          document_number: 1,
          doc_status: 1,
          createdAt: 1,
          created_date: 1
        }
      }
    ]);

    if (!documents || documents.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Documents');
    }

    // Decode the document name
    documents[0].name = decodeURIComponent(documents[0].name);
    return documents[0];
  }

  // For other modules, use the original simple findById
  let documents = await Documents.findById({ _id: ObjectId(documentId) });
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Documents');
  }
  return documents;
};
const createDocument = async (documentBody, files, userId) => {
  if (files && files.documents) {
    console.log('Files attached:', files.documents);
    var uploadedFile = await uploadFilesToS3(files.documents, documentBody.foreign_id);
  }

  try {
    if (documentBody.module == 'visa process') {
      const visaProcessDoc = await VisaProcess.findById(documentBody.foreign_id).select('user_id processes');
      if (!visaProcessDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Visa Process');
      }
      // if (documentBody.visa_application_platform && documentBody.visa_application_platform.trim() !== '') {
      //   visaProcessDoc.visa_application_platform = documentBody.visa_application_platform;
      //   if(documentBody.visa_application_platform.toLowerCase() == 'work bundle'){
      //     visaProcessDoc.processes = visaProcessDoc.processes.filter((process)=>{
      //       const stage = process.stage_name.toLowerCase().trim();
      //       return stage !== "tawjeeh training" && stage !== "tawjeeh training completed";
      //     })
      //   }

      //   await visaProcessDoc.save();
      // }
      if (documentBody.visa_application_platform && documentBody.visa_application_platform.trim() !== '') {
        visaProcessDoc.visa_application_platform = documentBody.visa_application_platform;

        if(documentBody.visa_application_platform.toLowerCase() == 'work bundle'){
          console.log("--> begining transaction")
          const originalLength = visaProcessDoc.processes.length;

          visaProcessDoc.processes = visaProcessDoc.processes.filter((process)=>{
            const stage = process.stage_name.toLowerCase().trim();
            return stage !== "tawjeeh training" && stage !== "tawjeeh training completed";
          });

          // Mark as modified only if the array actually changed
          if(visaProcessDoc.processes.length !== originalLength){
            visaProcessDoc.markModified('processes');
          }
        }

        await visaProcessDoc.save();
      }
      const onboardingDoc = await Onboardings.findOne({ user_id: visaProcessDoc.user_id });

      if (!onboardingDoc) {
        // throw new ApiError(httpStatus.NOT_FOUND, 'Could not find onboarding document attached to this employee');
        console.log("Could not find onboarding document attached to this employee. Exiting process to check onboarding documents")
      }
      // handle saving of document numbers
      const documentTypes = await DocumentTypes.find({ is_deleted: false });
      if (documentTypes.length > 0) {
        for (let i = 0; i < documentTypes.length; i++) {
          const element = documentTypes[i];
          switch (element.name) {
            case 'Temporary Labour Card':
              if (documentBody && documentBody.type == '651aae5c9be4dd5c56491544') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.temporaryLbourCardNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.temporaryLbourCardExpiry', documentBody.expiry);
                }
                // onboardingDoc.markModified('attachedDocumentNumbers');
              }
              break;
            case 'Visa':
              if (documentBody && documentBody.type == '6412c9795d3c723a3cf939d6') {
                if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.visaNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.VisaExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Medical Test Result':
              if (documentBody && documentBody.type == '64db904c987bf13670b4298a') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.medicalTestResultNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.medicalTestResultExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Medical Test Application':
              if (documentBody && documentBody.type == '64db904c987bf13670b42988') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.medApplicationReferenceNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.medApplicationReferenceExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Labour Contract':
              if (documentBody && documentBody.type == '65bb97219e918c9841a77835') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.labourCardAndContractNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.labourCardAndContractNumberExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Health Insurance Application':
              if (documentBody && documentBody.type == '64db904c987bf13670b4298c') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.healthInsuranceNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.healthInsuranceExpiry', documentBody.expiry);
                }
              }
              break;
            case 'eVisa':
              if (documentBody && documentBody.type == '64db904b987bf13670b42980') {
                if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.eVisaNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.eVisaExpiry', documentBody.expiry);
                }
              }
              break;
            case 'MOL Cancellation Application':
              if (documentBody && documentBody.type == '66daf20d178c14a1722faf4a') {
                if (onboardingDoc)
                  onboardingDoc.set(
                    'attachedDocumentNumbers.molCancellationApplicationNumber',
                    documentBody.document_number
                  );
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.molCancellationApplicationExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Stamped E-Visa':
              if (documentBody && documentBody.type == '64db904c987bf13670b42992') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.stampedVisaNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.stampedVisaExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Change of Status':
              if (documentBody && documentBody.type == '64db904c987bf13670b42986') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.changeOfStatusNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.changeOfStatusExpiry', documentBody.expiry);
                }
              }
              break;
            case 'MOL WPS Number':
              if (documentBody && documentBody.type == '64ec534ca721df8c76728541') {
                if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.molWPSNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.molWPSExpiry', documentBody.expiry);
                }
              }
              break;
            case 'MOL Signed':
              if (documentBody && documentBody.type == '64db904b987bf13670b4297e') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.molSignedNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.MolSignedExpiry', documentBody.expiry);
                }
              }
              break;
            case 'MOL Offer Letter':
              if (documentBody && documentBody.type == '64db904b987bf13670b42984') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.molOfferLetterNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.molOfferLetterExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Tawjeeh Training':
              if (documentBody && documentBody.type == '64db904d987bf13670b4299a') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.tawjeehTrainingNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.tawjeehTrainingExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Residency Cancellation':
              if (documentBody && documentBody.type == '66daf22f178c14a1722faf71') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.residencyCancellationNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.residencyCancellationExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Stamped Residence Visa':
              if (documentBody && documentBody.type == '64db904d987bf13670b42998') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.stampedResidenceVisaNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.stampedResidenceVisaExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Labour Card':
              if (documentBody && documentBody.type == '650dba596a348a1a1022945f') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.labourCardNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.labourCardExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Emirates ID Capture':
              if (documentBody && documentBody.type == '64db904d987bf13670b42996') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.emiratesIdCaptureNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.emiratesIdCaptureExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Emirates ID':
              if (documentBody && documentBody.type == '64229e20bf0f5a1ca8b5117d') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.emiratesIdNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc) onboardingDoc.set('attachedDocumentNumbers.emiratesIdExpiry', documentBody.expiry);
                }
              }
              break;
            case 'Emirates ID Application':
              if (documentBody && documentBody.type == '64db904c987bf13670b4298e') {
                if (onboardingDoc)
                  onboardingDoc.set('attachedDocumentNumbers.emiratesIdApplicationNumber', documentBody.document_number);
                if (documentBody.expiry) {
                  if (onboardingDoc)
                    onboardingDoc.set('attachedDocumentNumbers.emiratesIdApplicationExpiry', documentBody.expiry);
                }
              }
              break;
            default:
              console.log(`Unknown document type: ${element.name}`);
              break;
          }
        }
      }

      onboardingDoc?.markModified('attachedDocumentNumbers');
      await onboardingDoc?.save();
    }

    let docArr = [];
    if (uploadedFile && uploadedFile.length) {
      for (const url of uploadedFile) {
        let newDocument = new Documents(documentBody);
        /**
         * ==============================================================================================
         * Handle case for salary transfer and clearance letters
         * Invalidate previously uploaded records each time a new document is uploaded
         * ==============================================================================================
         */
        console.log(documentBody, "this is the document body")
        const salaryTransferType = await DocumentTypes.findOne({ name: 'Salary Transfer Letter', is_deleted: false });
        const salaryClearanceType = await DocumentTypes.findOne({ name: 'Salary Clearance Letter', is_deleted: false });
        if (!salaryTransferType) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Transfer Letter Document Type');
        }
        if (!salaryClearanceType) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Clearance Letter Document Type');
        }
        const isExistingTransferDoc = await Documents.find({ type: salaryTransferType._id, is_deleted: false, foreign_id: ObjectId(documentBody.foreign_id) });
        const isExistingClearanceDoc = await Documents.find({ type: salaryClearanceType._id, is_deleted: false, foreign_id: ObjectId(documentBody.foreign_id) });
        // if(isExistingTransferDoc){
        //   await Documents.updateMany(
        //     { type: salaryClearanceType._id, is_deleted: false, foreign_id: ObjectId(documentBody.foreign_id) },
        //     { $set: { is_deleted: true } }
        //   );
        // }
        // await Documents.updateMany(
        //   { type: salaryTransferType._id, is_deleted: false, foreign_id: ObjectId(documentBody.foreign_id) },
        //   { $set: { is_deleted: true } }
        // );
        let isUser = await Users.findById(documentBody.foreign_id);
        if(isExistingTransferDoc && isExistingTransferDoc.length > 0){
          if(isUser){
            isUser.uploadedSalaryTransfer = true;
            await isUser.save();
          }
        }
        if(isExistingClearanceDoc && isExistingClearanceDoc.length > 0){
          if(isUser){
            isUser.uploadedSalaryClearance = true;
            await isUser.save();
          }
        }


        const DocCreated = await newDocument.save();

        const lastPart = url.substring(url.lastIndexOf('/') + 1);
        const filenameWithoutExt = lastPart.substring(0, lastPart.lastIndexOf('.')).replace(/%20/g, ' ');

         await Documents.findOneAndUpdate(
          { _id: newDocument._id },
          { $set: { url: url, name: filenameWithoutExt } }
        );

        const created_by = await updateCreatedBy(newDocument._id, userId);
        const logMessage = logDocumentCreation(userId, DocCreated);
        let docById = await documentById(newDocument._id, documentBody.module);

        // get document type
        const uploadedDocumentType = await DocumentTypes.findOne({ _id: docById.type_id });
        docById.type_name = uploadedDocumentType ? uploadedDocumentType.name : '';
        docArr.push(docById);
        console.log(docArr, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        await activityService.createActivity(userId, newDocument._id, 'Documents', {}, docById, {}, logMessage);
      }
      console.log('Documents created and activities logged');
      return docArr;
    } else {
      const newDocument = new Documents(documentBody);
      let savedDocument = await newDocument.save();
      savedDocument = savedDocument.toObject();
      //fetch document type
      const uploadedDocumentType = await DocumentTypes.findOne({ _id: savedDocument.type });
      savedDocument.type_name = uploadedDocumentType ? uploadedDocumentType.name : '';
      return [savedDocument];
    }
  } catch (error) {
    console.error('Error in createDocument function:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating document: ' + error.message);
  }
};
const createRecord = async (documentBody, userId) => {
  const newDocument = new Documents(documentBody);
  return await newDocument.save();
};

function logDocumentCreation(userId, document) {
  const logMsg = `User ${userId} Created Document ${document._id}`;
  return logMsg;
}

const updateDocumentOnId = async (documentId, updateDocumentBody, userId) => {
  try {
    const documentResult = await documentById(documentId);
    if (!documentResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Document Not found');
    }
    // console.log(updateDocumentBody, "this is the body")
    if (updateDocumentBody.documents) {
      const uploadedUrls = await uploadFilesToS3(updateDocumentBody.documents, documentResult.foreign_id);
      const updateObject = {
        updated_by: userId,
        url: documentResult.url,
        doc_status: documentResult.doc_status,
        updated_date: moment.tz('UTC').tz('Asia/Dubai').format(),
        expiry: documentResult.expiry,
        name: documentResult.name,
        type: documentResult.type,
        module: documentResult.module,
        identifier: documentResult.identifier
      };
      if (documentResult.update_logs.length < 1) {
        if (!documentResult.update_logs) documentResult.update_logs = [];
        documentResult.update_logs.push(updateObject);
      } else {
        documentResult.update_logs.unshift(updateObject);
      }
      documentResult.url = uploadedUrls[0];
      const updatedDocument = await documentResult.save();
      return updatedDocument;
    } else {
      if (!documentResult.history) documentResult.history = [];
      documentResult.history.push(updateDocumentBody);
      if (updateDocumentBody.document_number) {
        // console.log("==============================> found document number in request body")
        // fetch documents witht similar foreign id and identified
        const docsToUpdate = await Documents.find({
          foreign_id: documentResult.foreign_id,
          identifier: documentResult.identifier
        });
        if (docsToUpdate.length > 0) {
          for (const doc of docsToUpdate) {
            doc.document_number = updateDocumentBody.document_number;
            await doc.save();
          }
        }
        // return the last document in the array
        return docsToUpdate[docsToUpdate.length - 1];
      } else {
        return Documents.findOneAndUpdate({ _id: documentId }, { $set: updateDocumentBody }, { new: true });
      }
    }
  } catch (error) {
    // console.log(error)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Could not update document: An error ocurred with the following details: ' + error.message
    );
  }
};

const updateUpdatedBy = async (documentId, userId) => {
  return Documents.findOneAndUpdate({ _id: documentId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (documentId, userId) => {
  return Documents.findOneAndUpdate({ _id: documentId }, { $set: { created_by: userId } });
};

const listAllDocuments = async reqQuery => {
  const filter = {
    is_deleted: false
  };
  if (reqQuery && reqQuery.foreign_id) {
    filter.foreign_id = ObjectId(reqQuery.foreign_id);
  }
  const documents = await Documents.find(filter);

  if (documents == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Documents');
  }
  return documents;
};

const deleteDocument = async (documentId, deletionData = {}) => {
  const updateData = {
    is_deleted: true,
    deleted_at: new Date(),
    ...deletionData
  };

  let documents = await Documents.findByIdAndUpdate(
    { _id: ObjectId(documentId) },
    updateData,
    { new: true }
  );

  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Document');
  }
  return documents;
};

const documentOnForeignId = async (foreignId, reqQuery) => {
  let documents = await Documents.aggregate([
    { $match: { is_deleted: false, foreign_id: ObjectId(foreignId) } },
    {
      $lookup: {
        from: 'document_types',
        localField: 'type',
        foreignField: '_id',
        as: 'documentTypeNames'
      }
    },
    {
      $unwind:{
        path:"$documentTypeNames",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        type: {
          $cond: {
            if: { $eq: [reqQuery.module, "leads"] },
            then: "$documentTypeNames._id",
            else: "$documentTypeNames.name"
          }
        },
        type_name: '$documentTypeNames.name',
        name: 1,
        foreign_id: 1,
        url: '$url',
        expiry: 1,
        issuance: 1,
        document_number: 1,
        doc_status: 1,
        createdAt: 1,
        created_date: 1,
      }
    }
  ]);
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Documents');
  }
  documents.map((doc)=>{
    //// some document.name show like this "Company%20Incorporation%20Certificate.pdf" replace the prcentages to have a clean name
    doc.name = decodeURIComponent(doc.name);
  })
  return documents;
};

const documentOnForeignIdAndIdentifier = async (foreignId, identifier) => {
  let documents = await Documents.aggregate([
    { $match: { is_deleted: false, foreign_id: ObjectId(foreignId), identifier: identifier } },
    {
      $lookup: {
        from: 'document_types',
        localField: 'type',
        foreignField: '_id',
        as: 'documentTypeNames'
      }
    },
    { $unwind: '$documentTypeNames' },
    {
      $project: {
        _id: 1,
        type: 1,
        type_name: '$documentTypeNames.name',
        name: 1,
        foreign_id: 1,
        url: '$url',
        expiry: 1,
        issuance: 1,
        document_number: 1,
        doc_status: 1,
        identifier: 1,
        createdAt: 1,
        created_date: 1
      }
    }
  ]);
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Documents');
  }
  return documents;
};

// const uploadDocumentsOnDocIdAndForeignId = async (documentId, foreignId, file, reqBody, userId) => {
//   // const key = Object.keys(file);
//   try {
//     //documents is the Key Value of the formData
//     let docById;
//     if (file && file.documents) {
//       if (file && file.documents && file.documents.length) {
//         throw new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to Upload Multiple Files');
//       } else {
//         const existingDoc = await Documents.find({ _id: ObjectId(documentId), foreign_id: ObjectId(foreignId) });
//         const previouslyUploadedDoc = existingDoc[0].update_logs;
//         previouslyUploadedDoc.push({
//           url: existingDoc[0].url,
//           updated_date: moment.tz('UTC').tz('Asia/Dubai').format(),
//           updated_by: userId,
//           doc_status: existingDoc[0].doc_status,
//           expiry: existingDoc[0].expiry,
//           name: existingDoc[0].name,
//           type: existingDoc[0].type,
//           identifier: existingDoc[0].identifier,
//           module: existingDoc[0].module,
//         });
//         let uploadedFile = await uploadFilesToS3(file.documents, foreignId);
//         for (const url of uploadedFile) {
//           // Get the last part of the URL after the last slash
//           const lastPart = url.substring(url.lastIndexOf('/') + 1);
//           // Remove the ".pdf" extension from the last part
//           const filenameWithoutExt = lastPart.substring(0, lastPart.lastIndexOf('.')).replace(/%20/g, ' ');
//           // await Documents.findOneAndUpdate({ "_id": ObjectId(documentId), foreign_id: foreignId}, { $set: {url: url} });
//           // const docs = await Documents.findOneAndUpdate({ _id: ObjectId(documentId), foreign_id: foreignId }, { $set: { url: url, name: filenameWithoutExt, expiry: reqBody.expiry, module: reqBody.module, previously_uploaded_docs: previouslyUploadedDoc } });
//           const docs = await Documents.findOneAndUpdate(
//             { _id: ObjectId(documentId), foreign_id: foreignId },
//             {
//               $set: {
//                 url: url || existingDoc[0].url,
//                 name: filenameWithoutExt || existingDoc[0].name,
//                 expiry: reqBody.expiry || existingDoc[0].expiry,
//                 module: reqBody.module || existingDoc[0].module,
//                 identifier: reqBody.identifier || existingDoc[0].identifier,
//                 document_number: reqBody.document_number || existingDoc[0].document_number,
//                 type: reqBody.type || existingDoc[0].type,
//                 update_logs: previouslyUploadedDoc || existingDoc[0].update_logs,
//               },
//             },
//             { returnOriginal: false }
//           );
//           docById = await documentById(ObjectId(documentId));
//         }
//         if (docById) {
//           return docById;
//         } else {
//           return ApiError(httpStatus.BAD_REQUEST, 'Could not update ');
//         }
//       }
//     } else {
//       return Documents.findOneAndUpdate({ _id: documentId }, { $set: reqBody }, { new: true });
//     }
//   } catch (error) {
//     console.log('#AWS S3 Error: ', error);
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Could not upload file');
//   }
// };

const uploadDocumentsOnDocIdAndForeignId = async (documentId, foreignId, file, reqBody, userId) => {
  try {
    console.log('listening ans presenting+++++++++++++++++');
    let docById;

    if (file && file.documents) {
      if (file.documents.length > 1) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to upload multiple files');
      } else {
        const existingDoc = await Documents.findOne({ _id: ObjectId(documentId), foreign_id: ObjectId(foreignId) });

        if (!existingDoc) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
        }

        let previouslyUploadedDoc = existingDoc.update_logs || [];

        const logEntry = {
          url: existingDoc.url,
          updated_date: moment.tz('UTC').tz('Asia/Dubai').format(),
          updated_by: userId,
          doc_status: existingDoc.doc_status,
          expiry: existingDoc.expiry,
          name: existingDoc.name,
          type: existingDoc.type,
          identifier: existingDoc.identifier,
          module: existingDoc.module
        };

        if (previouslyUploadedDoc.length === 0) {
          previouslyUploadedDoc.push(logEntry);
        } else {
          previouslyUploadedDoc.unshift(logEntry);
        }

        let uploadedFile = await uploadFilesToS3(file.documents, foreignId);
        for (const url of uploadedFile) {
          const lastPart = url.substring(url.lastIndexOf('/') + 1);
          const filenameWithoutExt = lastPart.substring(0, lastPart.lastIndexOf('.')).replace(/%20/g, ' ');

          const updatedDoc = await Documents.findOneAndUpdate(
            { _id: ObjectId(documentId), foreign_id: foreignId },
            {
              $set: {
                url: url || existingDoc.url,
                name: filenameWithoutExt || existingDoc.name,
                expiry: reqBody.expiry || existingDoc.expiry,
                module: reqBody.module || existingDoc.module,
                identifier: reqBody.identifier || existingDoc.identifier,
                document_number: reqBody.document_number || existingDoc.document_number,
                type: reqBody.type || existingDoc.type,
                update_logs: previouslyUploadedDoc
              }
            },
            { new: true }
          );
          docById = await documentById(ObjectId(documentId), reqBody.module);
        }

        if (docById) {
          return docById;
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Could not update document');
        }
      }
    } else {
      return Documents.findOneAndUpdate({ _id: documentId }, { $set: reqBody }, { new: true });
    }
  } catch (error) {
    console.log('#AWS S3 Error: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not upload file');
  }
};

const simpleDocumentUpload = async (userId, file, reqBody = null) => {
  try {
    if (file && file.documents && file.documents.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to Upload Multiple Files');
    } else {
      console.log(JSON.stringify(file.documents));
      let uploadedFile = await uploadFilesToS3(file.documents, userId);
      // if(reqBody && reqBody.folder_ref){
      //   console.log("handling ref")
      //   const folder = await DocumentFolder.findOne({is_deleted: false, _id:ObjectId(reqBody.folder_ref)});
      //   if(!folder){
      //     throw new ApiError(httpStatus.BAD_REQUEST, 'Could not find folder with provided id');
      //   }
      //   if(!folder.files){
      //     folder.files = [];
      //   }
      //   console.log(folder.folder_name, "is the name")
      //   uploadedFile.forEach((url)=>{
      //       folder.files.push(url);
      //     })
      //     await folder.save()
      // }
      return uploadedFile;
    }
  } catch (error) {
    console.log('#AWS S3 Error: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, `Could not upload file: ${error?.message}`);
  }
};

// to be deleted once tests are done
const simpleDocumentUploadWithMimeTypesoNE = async (userId, file) => {
  try {
    if (file && file.attachments && file.attachments.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to Upload Multiple Files');
    } else {
      let uploadedFile = await mimeTypeUpload(file.attachments, userId);
      return uploadedFile;
    }
  } catch (error) {
    console.log('#AWS S3 Error: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not upload file');
  }
};

const simpleDocumentUploadWithMimeTypes = async (userId, file) => {
  try {
    // Remove the multiple files check to allow multiple uploads
    if (!file || !file.attachments) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No files provided');
    }

    // Handle both single file and array of files
    const attachments = Array.isArray(file.attachments) ? file.attachments : [file.attachments];

    // Upload all files
    const uploadedFiles = await mimeTypeUpload(attachments, userId);

    // Return array for multiple files, single object for single file
    return Array.isArray(file.attachments) ? uploadedFiles : uploadedFiles[0];
  } catch (error) {
    console.log('#AWS S3 Error: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not upload file');
  }
};
const simpleDocumentUploadBase64 = async (base64, name, mimetype, userId) => {
  try {
    if (!base64) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to Upload Multiple Files');
    } else {
      let uploadedFile = await uploadFilesToS3base64(base64, name, mimetype, userId);
      return uploadedFile;
    }
  } catch (error) {
    console.log('#AWS S3 Error: ', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Could not upload file');
  }
};

const documentsFilterOnCompanyidAndUseridAndStatus = async (query, reqBody, page, limit, authtenticatedUserId) => {
  let result;
  const searchRegex = new RegExp(reqBody.search, 'i');

  let filter = {};
  if (reqBody.module == 'companies') {
    filter = {
      is_deleted: false,
      module: { $in: ['companies', 'leads'] }
    };
  } else {
    filter = {
      is_deleted: false,
      module: { $in: ['users', 'onboardings', 'offboardings', 'visa process'] }
    };
  }

  const _limit = query.limit && parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;
  const _page = query.page && parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
  const skip = (_page - 1) * _limit;

  let body = [
    {
      $match: {
        $or: [{ doc_status: searchRegex }, { name: searchRegex }, { type: searchRegex }]
      }
    },
    {
      $skip: skip
    },
    {
      $limit: _limit
    },
    {
      $lookup: {
        from: 'users',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$first_name', logo: '$image_url', type: 'user' } }
        ],
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'companies',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$company_name', logo: 'logo', type: 'company' } }
        ],
        as: 'company'
      }
    },
    {
      $lookup: {
        from: 'document_types',
        localField: 'type',
        foreignField: '_id',
        as: 'documentTypeNames'
      }
    },
    {
      $lookup: {
        from: 'leads',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'companies', localField: 'company_id', foreignField: '_id', as: 'leadcompany' } },
          { $unwind: '$leadcompany' },
          { $project: { _id: 0, name: '$leadcompany.company_name', logo: '$leadcompany.logo', type: 'leads' } }
        ],
        as: 'leads'
      }
    },
    {
      $lookup: {
        from: 'visa_processes',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'visaProcessUser' } },
          { $unwind: '$visaProcessUser' },
          {
            $project: {
              _id: 0,
              name: '$visaProcessUser.first_name',
              logo: '$visaProcessUser.image_url',
              type: 'visa_processes'
            }
          }
        ],
        as: 'visa_processes'
      }
    },
    {
      $lookup: {
        from: 'renewals',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'renewalsUser' } },
          { $unwind: '$renewalsUser' },
          { $project: { _id: 0, name: '$renewalsUser.first_name', logo: '$renewalsUser.image_url', type: 'renewals' } }
        ],
        as: 'renewals'
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'onboardingsUser' } },
          { $unwind: '$onboardingsUser' },
          {
            $project: {
              _id: 0,
              name: '$onboardingsUser.first_name',
              logo: '$onboardingsUser.image_url',
              type: 'onboardings'
            }
          }
        ],
        as: 'onboardings'
      }
    },
    {
      $lookup: {
        from: 'offboardings',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'offboardingsUser' } },
          { $unwind: '$offboardingsUser' },
          {
            $project: {
              _id: 0,
              name: '$offboardingsUser.first_name',
              logo: '$offboardingsUser.image_url',
              type: 'offboardings'
            }
          }
        ],
        as: 'offboardings'
      }
    },
    {
      $addFields: {
        user: { $ifNull: ['$user', []] },
        company: { $ifNull: ['$company', []] },
        leads: { $ifNull: ['$leads', []] },
        visa_processes: { $ifNull: ['$visa_processes', []] },
        renewals: { $ifNull: ['$renewals', []] },
        onboardings: { $ifNull: ['$onboardings', []] },
        offboardings: { $ifNull: ['$offboardings', []] }
      }
    },
    {
      $project: {
        _id: 1,
        type: 1,
        type_name: { $arrayElemAt: ['$documentTypeNames.name', 0] },
        name: 1,
        module: 1,
        identifier: 1,
        foreign_id: 1,
        url: 1,
        document_number: 1,
        days_left: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: ['$expiry', null] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: '-',
            else: {
              $toInt: {
                $divide: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 1000 * 60 * 60 * 24]
              }
            }
          }
        },
        doc_status: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: ['$expiry', null] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: 'valid',
            else: {
              $cond: {
                if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 0] },
                then: 'expired',
                else: {
                  $cond: {
                    if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 60 * 24 * 60 * 60 * 1000] },
                    then: 'soon expiring',
                    else: 'valid'
                  }
                }
              }
            }
          }
        },
        expiry: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', null] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: '',
            else: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$expiry' } } }
          }
        },
        owner_name: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.name', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.name', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.name', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.name', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.name', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.name', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.name', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_logo: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.logo', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.logo', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.logo', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.logo', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.logo', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.logo', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.logo', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_type: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.type', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.type', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.type', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.type', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.type', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.type', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.type', 0] },
                                    else: '$module'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ];
  if (reqBody.company_id && ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')) {
    let array = [];
    if (Array.isArray(reqBody.company_id)) {
      array = reqBody.company_id.map(id => ObjectId(id));
    } else {
      array = [ObjectId(reqBody.company_id)];
    }
    let leads = await Leads.find({ company_id: { $in: array } }).select({ _id: 1 });
    let foreign_ids = leads.map(doc => ObjectId(doc._id));
    filter.foreign_id = { $in: array.concat(foreign_ids) };
  }
  if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
    let array = [];
    if (Array.isArray(reqBody.user_id)) {
      array = reqBody.user_id.map(id => ObjectId(id));
    } else {
      array = [ObjectId(reqBody.user_id)];
    }
    let users = await Users.find({ user_id: { $in: array } }).select({ _id: 1 });
    let onboardings = await Onboardings.find({ user_id: { $in: array } }).select({ _id: 1 });
    let offboardings = await Offboardings.find({ user_id: { $in: array } }).select({ _id: 1 });
    let visaprocess = await VisaProcess.find({ user_id: { $in: array } }).select({ _id: 1 });
    let foreign_ids = users
      .concat(onboardings)
      .concat(offboardings)
      .concat(visaprocess)
      .map(doc => ObjectId(doc._id));
    filter.foreign_id = { $in: array.concat(foreign_ids) };
  }
  if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    if (Array.isArray(reqBody.status)) {
      body.push({ $match: { doc_status: { $in: reqBody.status } } });
    } else {
      body.push({ $match: { doc_status: { $in: reqBody.status } } });
    }
  }
  if (reqBody.type && (reqBody.type != '' || (reqBody.type.length > 0 && reqBody.type[0] !== ''))) {
    if (Array.isArray(reqBody.type)) {
      let typeID = reqBody.type.map(id => ObjectId(id));
      filter.type = { $in: typeID };
    } else {
      filter.type = ObjectId(reqBody.type);
    }
  }
  let options = {
    limit: query.limit,
    page: query.page,
    sortBy: query.sortBy
  };
  if (reqBody.selected_company_id) {
    const companyIdArray = reqBody.selected_company_id.map(id => ObjectId(id));
    let leads = await Leads.find({ company_id: { $in: companyIdArray } }).select({ _id: 1 });
    let users = await Users.find({ company_id: { $in: companyIdArray } }).select({ _id: 1 });
    let onboardings = await Onboardings.find({ company_id: { $in: companyIdArray } }).select({ _id: 1 });
    let offboardings = await Offboardings.find({ company_id: { $in: companyIdArray } }).select({ _id: 1 });
    let visaprocess = await VisaProcess.find({ company_id: { $in: companyIdArray } }).select({ _id: 1 });
    let foreign_ids = leads
      .concat(users)
      .concat(onboardings)
      .concat(offboardings)
      .concat(visaprocess)
      .map(doc => ObjectId(doc._id));
    body.unshift({
      $match: { foreign_id: { $in: companyIdArray.concat(foreign_ids) } }
    });
  }
  // get user to determine role
  const userDetails =
    (await Users.findOne({ _id: new ObjectId(authtenticatedUserId) })) ||
    (await Poc.findOne({ _id: new ObjectId(authtenticatedUserId) }));

  if (!userDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found. Could not complete documents filter.');
  }
  const userRole = await Role.findById(userDetails.role_ID);
  console.log(userRole, 'this is the role------------>');
  const allowedTypes = [
    '64254208e92b0c35c0541ce8', // passport
    '65bb97219e918c9841a77835', // Labour Contract
    '650dba596a348a1a1022945f', // labourcard
    '64229e20bf0f5a1ca8b5117d', // emiratesid
    '64db904b987bf13670b4297a', // insurance
    '6412c9795d3c723a3cf939d6', // visa
    '65a108aa7cf880904125b315' //Signed Internal Employment Contract
  ];

  result = await Documents.paginateLookup(filter, options, body);
  // if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '' && userRole.role_name !== 'Super Admin')) {
  //      // Filter results to include only documents with a type in the allowedTypes array
  //      console.log("condition has been met==============================>")
  // result.results = result.results.filter(doc => {
  //   console.log("Document Name:", doc.name, "Type:", doc.type); // Log each document name and type
  //   return allowedTypes.includes(String(doc.type)); // Ensure type is compared as a string
  // });

  // return {
  //   ...result, // Preserve other properties from the result object
  //   results: result.results, // Include only the filtered results
  // };
  //   }else{
  //     console.log("executing thee else condition of the document filter")
  //     return result
  //   }
  if (
    reqBody.user_id &&
    ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') ||
      (reqBody.user_id !== '' && userRole.role_name !== 'Super Admin'))
  ) {
    // Only filter if user is not "Super Admin" and the conditions on user_id are met
    if (userRole.role_name !== 'Super Admin') {
      console.log('Condition has been met =============================>');

      result.results = result.results.filter(doc => {
        console.log('Document Name:', doc.name, 'Type:', doc.type);
        return allowedTypes.includes(String(doc.type));
      });

      return {
        ...result,
        results: result.results
      };
    } else {
      console.log('Executing the else condition of the document filter for Super Admin');
      return result;
    }
  } else {
    // If the user_id condition is not met, return the original result as well
    console.log('User ID condition not met, returning result as is');
    return result;
  }
};

const getDocumentsByForeignIdAndIdentifier = async (foreignid, identifier) => {
  try {
    const query = { foreign_id: ObjectId(foreignid), identifier: identifier };
    console.log(JSON.stringify(query));
    const response = await Documents.find(query);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

const getDocumentsByForeignIdAndType = async (foreignId, type) => {
  try {
    // Handle foreign_id - always convert to ObjectId
    const foreignIdQuery = ObjectId(foreignId);

    // Set up possible type conditions
    let typeQuery;

    // Check if type is a valid ObjectId string
    if (mongoose.Types.ObjectId.isValid(type)) {
      // Use $or to match either as string or ObjectId
      typeQuery = {
        $or: [
          { type: type.toString() },  // Match as string
          { type: ObjectId(type) }    // Match as ObjectId
        ]
      };
    } else {
      typeQuery = { type: type };
    }

    // Combine the queries
    const query = {
      foreign_id: foreignIdQuery,
      ...typeQuery
    };

    console.log(JSON.stringify(query));
    const response = await Documents.find(query);
    return response;
  } catch (error) {
    console.error('Error in getDocumentsByForeignIdAndType:', error);
    throw new Error(error.message || 'Failed to get documents');
  }
};

const getAllDocumentsForListingPage = async userBody => {
  let documents = await Documents.aggregate([
    {
      $lookup: {
        from: 'users',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$first_name', logo: '$image_url', type: 'user' } }
        ],
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'companies',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$company_name', logo: 'logo', type: 'company' } }
        ],
        as: 'company'
      }
    },
    {
      $lookup: {
        from: 'document_types',
        localField: 'type',
        foreignField: '_id',
        as: 'documentTypeNames'
      }
    },
    {
      $lookup: {
        from: 'leads',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'companies', localField: 'company_id', foreignField: '_id', as: 'leadcompany' } },
          { $unwind: '$leadcompany' },
          { $project: { _id: 0, name: '$leadcompany.company_name', logo: '$leadcompany.logo', type: 'leads' } }
        ],
        as: 'leads'
      }
    },
    {
      $addFields: {
        user: { $ifNull: ['$user', []] },
        company: { $ifNull: ['$company', []] },
        leads: { $ifNull: ['$leads', []] }
      }
    },
    {
      $project: {
        _id: 1,
        type: { $arrayElemAt: ['$documentTypeNames.name', 0] },
        name: 1,
        identifier: 1,
        foreign_id: 1,
        url: 1,
        expiry: {
          $cond: {
            if: {
              $or: [{ $eq: ['$expiry', ''] }, { $eq: ['$expiry', null] }, { $eq: [{ $type: '$expiry' }, 'undefined'] }]
            },
            then: 0,
            else: { $toDate: '$expiry' }
          }
        },
        module: 1,
        days_left: {
          $cond: {
            if: {
              $or: [{ $eq: ['$expiry', ''] }, { $eq: ['$expiry', null] }, { $eq: [{ $type: '$expiry' }, 'undefined'] }]
            },
            then: '-',
            else: {
              $toInt: {
                $divide: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 1000 * 60 * 60 * 24]
              }
            }
          }
        },
        doc_status: {
          $cond: {
            if: {
              $or: [{ $eq: ['$expiry', ''] }, { $eq: ['$expiry', null] }, { $eq: [{ $type: '$expiry' }, 'undefined'] }]
            },
            then: 'valid',
            else: {
              $cond: {
                if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 0] },
                then: 'expired',
                else: {
                  $cond: {
                    if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 60 * 24 * 60 * 60 * 1000] },
                    then: 'soon expiring',
                    else: 'valid'
                  }
                }
              }
            }
          }
        },
        owner_name: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.name', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.name', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.name', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.name', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.name', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.name', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.name', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_logo: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.logo', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.logo', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.logo', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.logo', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.logo', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.logo', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.logo', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_type: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.type', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.type', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.type', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.type', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.type', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.type', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.type', 0] },
                                    else: '$module'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);

  return documents;
};

const listOfDocumentStatus = async (query, reqBody) => {
  // const distinctStatuses = await Documents.distinct('doc_status').exec();
  const distinctStatuses = ['valid', 'soon expiring', 'expired'];
  return distinctStatuses;
};

const triggerExpiry = async () => {
  let reqBody = {
    company_id: [],
    user_id: [],
    type: [],
    status: []
  };
  let filter = { is_deleted: false };
  let body = [
    {
      $lookup: {
        from: 'users',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$first_name', logo: '$image_url', type: 'user' } }
        ],
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'companies',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$company_name', logo: 'logo', type: 'company' } }
        ],
        as: 'company'
      }
    },
    {
      $lookup: {
        from: 'document_types',
        localField: 'type',
        foreignField: '_id',
        as: 'documentTypeNames'
      }
    },
    {
      $lookup: {
        from: 'leads',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'companies', localField: 'company_id', foreignField: '_id', as: 'leadcompany' } },
          { $unwind: '$leadcompany' },
          { $project: { _id: 0, name: '$leadcompany.company_name', logo: '$leadcompany.logo', type: 'leads' } }
        ],
        as: 'leads'
      }
    },
    {
      $lookup: {
        from: 'visa_processes',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'visaProcessUser' } },
          { $unwind: '$visaProcessUser' },
          {
            $project: {
              _id: 0,
              name: '$visaProcessUser.first_name',
              logo: '$visaProcessUser.image_url',
              type: 'visa_processes'
            }
          }
        ],
        as: 'visa_processes'
      }
    },
    {
      $lookup: {
        from: 'renewals',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'renewalsUser' } },
          { $unwind: '$renewalsUser' },
          { $project: { _id: 0, name: '$renewalsUser.first_name', logo: '$renewalsUser.image_url', type: 'renewals' } }
        ],
        as: 'renewals'
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'onboardingsUser' } },
          { $unwind: '$onboardingsUser' },
          {
            $project: {
              _id: 0,
              name: '$onboardingsUser.first_name',
              logo: '$onboardingsUser.image_url',
              type: 'onboardings'
            }
          }
        ],
        as: 'onboardings'
      }
    },
    {
      $lookup: {
        from: 'offboardings',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'offboardingsUser' } },
          { $unwind: '$offboardingsUser' },
          {
            $project: {
              _id: 0,
              name: '$offboardingsUser.first_name',
              logo: '$offboardingsUser.image_url',
              type: 'offboardings'
            }
          }
        ],
        as: 'offboardings'
      }
    },
    {
      $addFields: {
        user: { $ifNull: ['$user', []] },
        company: { $ifNull: ['$company', []] },
        leads: { $ifNull: ['$leads', []] },
        visa_processes: { $ifNull: ['$visa_processes', []] },
        renewals: { $ifNull: ['$renewals', []] },
        onboardings: { $ifNull: ['$onboardings', []] },
        offboardings: { $ifNull: ['$offboardings', []] }
      }
    },
    {
      $project: {
        _id: 1,
        type: 1,
        type_name: { $arrayElemAt: ['$documentTypeNames.name', 0] },
        name: 1,
        module: 1,
        identifier: 1,
        foreign_id: 1,
        url: 1,
        document_number: 1,
        days_left: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: ['$expiry', null] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: '-',
            else: {
              $toInt: {
                $divide: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 1000 * 60 * 60 * 24]
              }
            }
          }
        },
        doc_status: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: ['$expiry', null] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: 'valid',
            else: {
              $cond: {
                if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 0] },
                then: 'expired',
                else: {
                  $cond: {
                    if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 60 * 24 * 60 * 60 * 1000] },
                    then: 'soon expiring',
                    else: 'valid'
                  }
                }
              }
            }
          }
        },
        expiry: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', null] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: '',
            else: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$expiry' } } }
          }
        },
        owner_name: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.name', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.name', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.name', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.name', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.name', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.name', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.name', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_logo: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.logo', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.logo', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.logo', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.logo', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.logo', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.logo', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.logo', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_type: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.type', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.type', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.type', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.type', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.type', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.type', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.type', 0] },
                                    else: '$module'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ];
  if (reqBody.company_id && ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')) {
    if (Array.isArray(reqBody.company_id)) {
      let compID = reqBody.company_id.map(id => ObjectId(id));
      filter.foreign_id = { $in: compID };
    } else {
      filter.foreign_id = ObjectId(reqBody.company_id);
    }
  }
  if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
    if (Array.isArray(reqBody.user_id)) {
      let usrID = reqBody.user_id.map(id => ObjectId(id));
      filter.foreign_id = { $in: usrID };
    } else {
      filter.foreign_id = ObjectId(reqBody.user_id);
    }
  }
  if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    if (Array.isArray(reqBody.status)) {
      body.push({ $match: { doc_status: { $in: reqBody.status } } });
    } else {
      body.push({ $match: { doc_status: { $in: reqBody.status } } });
    }
  }
  if (reqBody.type && (reqBody.type != '' || (reqBody.type.length > 0 && reqBody.type[0] !== ''))) {
    if (Array.isArray(reqBody.type)) {
      let typeID = reqBody.type.map(id => ObjectId(id));
      filter.type = { $in: typeID };
    } else {
      filter.type = ObjectId(reqBody.type);
    }
  }
  let options = {
    limit: 999999,
    page: 0
  };
  if (reqBody.selected_company_id) {
    body.unshift(...queryService(reqBody));
  }
  result = await Documents.paginateLookup(filter, options, body);
  let now = new Date();
  now.setDate(now.getDate() + 90);
  let expiry_date = new Date(now).toISOString().substr(0, 10);
  let expired_documents = [];

  for (let index = 0; index < result.results.length; index++) {
    let element = result.results[index];
    if (element.expiry && new Date(element.expiry).toISOString().substr(0, 10) == expiry_date) {
      let details = {
        document_type: element.type_name,
        document_number: element.document_number,
        document_expiry_date: new Date(element.expiry).toISOString().substr(0, 10)
      };
      expired_documents.push(details);
    }
  }

  if (expired_documents.length > 0) {
    let eContent = [];
    for (let index = 0; index < expired_documents.length; index++) {
      let content =
        'Document: ' +
        expired_documents[index].document_type +
        '<br/>' +
        'Document Number: ' +
        expired_documents[index].document_number +
        '<br/>' +
        'Expiry Date: ' +
        expired_documents[index].document_expiry_date +
        '<br/>' +
        '<br/>';
      eContent.push(content);
    }
    let email = await emailTemplate.findOne({ name: 'Bulk Document Expiry' });

    eContent = eContent.join('\n');
    email.content = email.content.replaceAll('[content]', eContent);

    sendEmail(email.to, email.subject, email.content, email.cc).then(async result => {});
  }

  return 'success';
};

const triggerIndividualExpiry = async () => {
  let reqBody = {
    company_id: [],
    user_id: [],
    type: [],
    status: []
  };
  let filter = { is_deleted: false };
  let body = [
    {
      $lookup: {
        from: 'users',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$first_name', logo: '$image_url', email: '$email', type: 'user' } }
        ],
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'companies',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $project: { _id: 0, name: '$company_name', logo: 'logo', email: '$email', type: 'company' } }
        ],
        as: 'company'
      }
    },
    {
      $lookup: {
        from: 'document_types',
        localField: 'type',
        foreignField: '_id',
        as: 'documentTypeNames'
      }
    },
    {
      $lookup: {
        from: 'leads',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'companies', localField: 'company_id', foreignField: '_id', as: 'leadcompany' } },
          { $unwind: '$leadcompany' },
          {
            $project: {
              _id: 0,
              name: '$leadcompany.company_name',
              logo: '$leadcompany.logo',
              email: '$leadcompany.email',
              type: 'leads'
            }
          }
        ],
        as: 'leads'
      }
    },
    {
      $lookup: {
        from: 'visa_processes',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'visaProcessUser' } },
          { $unwind: '$visaProcessUser' },
          {
            $project: {
              _id: 0,
              name: '$visaProcessUser.first_name',
              logo: '$visaProcessUser.image_url',
              email: '$visaProcessUser.email',
              type: 'visa_processes'
            }
          }
        ],
        as: 'visa_processes'
      }
    },
    {
      $lookup: {
        from: 'renewals',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'renewalsUser' } },
          { $unwind: '$renewalsUser' },
          {
            $project: {
              _id: 0,
              name: '$renewalsUser.first_name',
              logo: '$renewalsUser.image_url',
              email: '$renewalsUser.email',
              type: 'renewals'
            }
          }
        ],
        as: 'renewals'
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'onboardingsUser' } },
          { $unwind: '$onboardingsUser' },
          {
            $project: {
              _id: 0,
              name: '$onboardingsUser.first_name',
              logo: '$onboardingsUser.image_url',
              email: '$onboardingsUser.email',
              type: 'onboardings'
            }
          }
        ],
        as: 'onboardings'
      }
    },
    {
      $lookup: {
        from: 'offboardings',
        let: { foreign_id: '$foreign_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$foreign_id'] } } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'offboardingsUser' } },
          { $unwind: '$offboardingsUser' },
          {
            $project: {
              _id: 0,
              name: '$offboardingsUser.first_name',
              logo: '$offboardingsUser.image_url',
              email: 'offboardingsUser.email',
              type: 'offboardings'
            }
          }
        ],
        as: 'offboardings'
      }
    },
    {
      $addFields: {
        user: { $ifNull: ['$user', []] },
        company: { $ifNull: ['$company', []] },
        leads: { $ifNull: ['$leads', []] },
        visa_processes: { $ifNull: ['$visa_processes', []] },
        renewals: { $ifNull: ['$renewals', []] },
        onboardings: { $ifNull: ['$onboardings', []] },
        offboardings: { $ifNull: ['$offboardings', []] }
      }
    },
    {
      $project: {
        _id: 1,
        type: 1,
        type_name: { $arrayElemAt: ['$documentTypeNames.name', 0] },
        type_UID: { $arrayElemAt: ['$documentTypeNames.type', 0] },
        name: 1,
        module: 1,
        identifier: 1,
        foreign_id: 1,
        url: 1,
        document_number: 1,
        days_left: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: ['$expiry', null] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: '-',
            else: {
              $toInt: {
                $divide: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 1000 * 60 * 60 * 24]
              }
            }
          }
        },
        doc_status: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: ['$expiry', null] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: 'valid',
            else: {
              $cond: {
                if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 0] },
                then: 'expired',
                else: {
                  $cond: {
                    if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 60 * 24 * 60 * 60 * 1000] },
                    then: 'soon expiring',
                    else: 'valid'
                  }
                }
              }
            }
          }
        },
        expiry: {
          $cond: {
            if: {
              $or: [
                { $eq: ['$expiry', ''] },
                { $eq: ['$expiry', null] },
                { $eq: ['$expiry', 'undefined'] },
                { $eq: [{ $type: '$expiry' }, 'undefined'] }
              ]
            },
            then: '',
            else: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$expiry' } } }
          }
        },
        owner_name: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.name', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.name', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.name', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.name', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.name', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.name', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.name', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_logo: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.logo', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.logo', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.logo', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.logo', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.logo', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.logo', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.logo', 0] },
                                    else: 'n/a'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_type: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.type', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.type', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.type', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.type', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.type', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.type', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.type', 0] },
                                    else: '$module'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        owner_email: {
          $cond: {
            if: { $ne: [{ $size: '$user' }, 0] },
            then: { $arrayElemAt: ['$user.email', 0] },
            else: {
              $cond: {
                if: { $ne: [{ $size: '$company' }, 0] },
                then: { $arrayElemAt: ['$company.email', 0] },
                else: {
                  $cond: {
                    if: { $ne: [{ $size: '$leads' }, 0] },
                    then: { $arrayElemAt: ['$leads.email', 0] },
                    else: {
                      $cond: {
                        if: { $ne: [{ $size: '$visa_processes' }, 0] },
                        then: { $arrayElemAt: ['$visa_processes.email', 0] },
                        else: {
                          $cond: {
                            if: { $ne: [{ $size: '$renewals' }, 0] },
                            then: { $arrayElemAt: ['$renewals.email', 0] },
                            else: {
                              $cond: {
                                if: { $ne: [{ $size: '$onboardings' }, 0] },
                                then: { $arrayElemAt: ['$onboardings.email', 0] },
                                else: {
                                  $cond: {
                                    if: { $ne: [{ $size: '$offboardings' }, 0] },
                                    then: { $arrayElemAt: ['$offboardings.email', 0] },
                                    else: '$module'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ];
  if (reqBody.company_id && ((reqBody.company_id.length > 0 && reqBody.company_id[0] !== '') || reqBody.company_id != '')) {
    if (Array.isArray(reqBody.company_id)) {
      let compID = reqBody.company_id.map(id => ObjectId(id));
      filter.foreign_id = { $in: compID };
    } else {
      filter.foreign_id = ObjectId(reqBody.company_id);
    }
  }
  if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== '') || reqBody.user_id != '')) {
    if (Array.isArray(reqBody.user_id)) {
      let usrID = reqBody.user_id.map(id => ObjectId(id));
      filter.foreign_id = { $in: usrID };
    } else {
      filter.foreign_id = ObjectId(reqBody.user_id);
    }
  }
  if (reqBody.status && (reqBody.status != '' || (reqBody.status.length > 0 && reqBody.status[0] !== ''))) {
    if (Array.isArray(reqBody.status)) {
      body.push({ $match: { doc_status: { $in: reqBody.status } } });
    } else {
      body.push({ $match: { doc_status: { $in: reqBody.status } } });
    }
  }
  if (reqBody.type && (reqBody.type != '' || (reqBody.type.length > 0 && reqBody.type[0] !== ''))) {
    if (Array.isArray(reqBody.type)) {
      let typeID = reqBody.type.map(id => ObjectId(id));
      filter.type = { $in: typeID };
    } else {
      filter.type = ObjectId(reqBody.type);
    }
  }
  let options = {
    limit: 999999,
    page: 0
  };
  if (reqBody.selected_company_id) {
    body.unshift(...queryService(reqBody));
  }
  result = await Documents.paginateLookup(filter, options, body);
  let now = new Date();
  now.setDate(now.getDate() + 5);
  let expiry_date = new Date(now).toISOString().substr(0, 10);
  let expired_documents = [];

  for (let index = 0; index < result.results.length; index++) {
    let element = result.results[index];
    if (
      element.expiry &&
      new Date(element.expiry).toISOString().substr(0, 10) == expiry_date &&
      element.type_UID == 'stampede-visa'
    ) {
      let details = {
        document_type: element.type_name,
        owner_name: element.owner_name,
        type: element.type,
        type_name: element.type_UID,
        email: element.owner_email,
        document_number: element.document_number,
        document_expiry_date: new Date(element.expiry).toISOString().substr(0, 10)
      };
      expired_documents.push(details);
      let email = await emailTemplate.findOne({ name: 'E-visa Expiry Notification' });

      email.content = email.content.replaceAll('[date]', details.document_expiry_date);
      email.content = email.content.replaceAll('[name]', element.owner_name);

      sendEmail(details.email, email.subject, email.content, email.cc).then(async result => {});
    } else if (
      element.expiry &&
      new Date(element.expiry).toISOString().substr(0, 10) == expiry_date &&
      element.type_UID == 'labourcard'
    ) {
      let details = {
        document_type: element.type_name,
        owner_name: element.owner_name,
        type: element.type,
        type_name: element.type_UID,
        email: element.owner_email,
        document_number: element.document_number,
        document_expiry_date: new Date(element.expiry).toISOString().substr(0, 10)
      };
      expired_documents.push(details);
      let email = await emailTemplate.findOne({ name: 'Labour Card Expiry Notification' });

      email.content = email.content.replaceAll('[date]', details.document_expiry_date);
      email.content = email.content.replaceAll('[name]', element.owner_name);

      sendEmail(details.email, email.subject, email.content, email.cc).then(async result => {});
    }
  }

  // if (expired_documents.length > 0) {
  //     let eContent = []
  //     for (let index = 0; index < expired_documents.length; index++) {
  //         let content = "Document: " + expired_documents[index].document_type + "<br/>" +
  //             "Document Number: " + expired_documents[index].document_number + "<br/>" +
  //             "Expiry Date: " + expired_documents[index].document_expiry_date + "<br/>" + "<br/>"
  //         eContent.push(content)
  //     }
  //     let email = await emailTemplate.findOne({ name: "Bulk Document Expiry" })

  //     eContent = eContent.join('\n');
  //     email.content = email.content.replaceAll('[content]', eContent)

  //     sendEmail(email.to, email.subject, email.content, email.cc).then(async (result) => {
  //     })
  // }

  return expired_documents;
};
const getFileStream = async (fileKey) => {
  try {
    return await getFileStreamFromS3(fileKey);
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      `Error retrieving file: ${error.message}`
    );
  }
};

/**
 * ================================================================================================
 * Function to update employment contract
 * This functionn is used to update employment contract for employees on onboarding stage
 * This implementation is essential, just before employment contracts are sent out to employees
 * ================================================================================================
 */
module.exports = {
  createRecord,
  triggerExpiry,
  createDocument,
  updateDocumentOnId,
  updateUpdatedBy,
  updateCreatedBy,
  listAllDocuments,
  documentById,
  deleteDocument,
  documentOnForeignId,
  uploadDocumentsOnDocIdAndForeignId,
  simpleDocumentUpload,
  documentsFilterOnCompanyidAndUseridAndStatus,
  getAllDocumentsForListingPage,
  listOfDocumentStatus,
  documentOnForeignIdAndIdentifier,
  simpleDocumentUploadBase64,
  triggerIndividualExpiry,
  simpleDocumentUploadWithMimeTypes,
  getDocumentsByForeignIdAndIdentifier,
  getDocumentsByForeignIdAndType,
  getFileStream
};
