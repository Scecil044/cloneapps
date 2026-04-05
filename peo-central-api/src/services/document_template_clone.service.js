const { ObjectId } = require("mongodb");
const { DocumentTemplatesClone, Documents, Users, Companies } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const { Configurations } = require('../models');
const _ = require('lodash');
const axios = require('axios');
const fs = require('fs');
const AWS = require('aws-sdk');
const moment = require('moment');

const getFlattenedField = (el) => {//first_name //contact_persons.0.
  console.log("x split++++++++"+ el + el?.split(''))
  const x = el.split('.')//['first_name']

  
  if(!isNaN(x[1])) {
    console.log("before x return --> ", x)
    return `${x[0]}`
  }
  
  console.log("before return --> ", el)
  return el
}

const mongoToJSAccessor = (mongoString) => {
  return mongoString.replace(/\.(\d+)(?=\.)/g, '[$1]');
}

const isMongoAccessorPattern = (inputString) => {
  const regex = /\.\d+(\.|$)/;
  return regex.test(inputString);
}


const createDocumentTemplateClone = async (reqBody) => {
    try{
      let newDocTempltClone = new DocumentTemplatesClone(reqBody);
      return await newDocTempltClone.save();
    }catch(error){
        console.log(error)
        throw new Error(error);
    }
};

const getDocumentTemplateCloneById = async (cloneID) => {
    console.log('+++++++++++', cloneID);
    let docTempltClone = await DocumentTemplatesClone.findById({ _id: ObjectId(cloneID) });
    if (!docTempltClone) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Document Template');
    }
    return docTempltClone;
};

const updateDocumentTemplateCloneOnId = async (cloneID, updateTemplateBody) => {
    const result = await getDocumentTemplateCloneById(cloneID);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document Template Not found');
    }
    return DocumentTemplatesClone.findOneAndUpdate({ _id: cloneID }, { $set: updateTemplateBody }, { new: true });
};

const listAllDocumentTemplateClone = async (page, limit) => {
    const result = await DocumentTemplatesClone.find({ is_deleted: false });
    if (result == []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Document Template")
    }
    return result
}

async function getReplacedTemplatePast(documentTemplate, content) {
    let replaceKeys = documentTemplate.auto_replace_keys;
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        const model = require(`../models/${documentTemplate.module}.model`);
        let moduleData = await model.findOne({ _id: ObjectId(documentTemplate.module_id) });

        let DBModel = require(`../models/${element.collection}.model`);
        if (documentTemplate.module === element.collection) {
            let nestedFieldValue = _.get(moduleData, element.field);
            let fieldValue;
            fieldValue = nestedFieldValue;
            if (Array.isArray(fieldValue)) {
                fieldValue = fieldValue.join(', ');
            }
            element.value = fieldValue;
            content = content.replace(element.key, fieldValue);
        } else {
            const query = {
                module_relations: {
                    $elemMatch: {
                        module: documentTemplate.module,
                        foreign_module: element.collection,
                    },
                },
            };
            const projection = { 'module_relations.$': 1 };
            const result = await Configurations.findOne(query, projection);
            forignKey = result.module_relations[0].foreign_key;
            element.fk_id = moduleData[forignKey];
            let getDoc = await DBModel.findOne({ _id: element.fk_id }).select(project);
            let nestedFieldValue = _.get(getDoc, element.field);
            let fieldValue;
            fieldValue = nestedFieldValue;
            if (Array.isArray(fieldValue)) {
                fieldValue = fieldValue.join(', ');
            }
            element.value = fieldValue;
            content = content.replace(element.key, fieldValue);
        }
        if (replaceKeys.length == index + 1) {
            await DocumentTemplatesClone.updateOne(
                { _id: documentTemplate._id },
                { $set: { auto_replace_keys: replaceKeys } },
                { new: true }
            );
            return content;
        }
    }
}

const getDocTemplateOnIDWithoutContentPast = async (DocTempltCloneID) => {
    let pipeline = [
        {
            $match: {
                _id: ObjectId(DocTempltCloneID),
                is_deleted: false,
            },
        },
        {
            $project: {
                content: 0,
                is_deleted: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            },
        },
    ];
    let result = await DocumentTemplatesClone.aggregate(pipeline);
    let documentTemplate = result[0];
    let replaceKeys = documentTemplate.auto_replace_keys;
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        const model = require(`../models/${documentTemplate.module}.model`);
        let moduleData = await model.findOne({ _id: ObjectId(documentTemplate.module_id) });
        let DBModel = require(`../models/${element.collection}.model`);

        if (documentTemplate.module === element.collection) {
            let nestedFieldValue = _.get(moduleData, element.field);
            let fieldValue;
            fieldValue = nestedFieldValue;
            if (Array.isArray(fieldValue)) {
                fieldValue = fieldValue.join(', ');
            }
            element.value = fieldValue;
        } else {
            const query = {
                module_relations: {
                    $elemMatch: {
                        module: documentTemplate.module,
                        foreign_module: element.collection,
                    },
                },
            };
            const projection = { 'module_relations.$': 1 };
            const result = await Configurations.findOne(query, projection);
            forignKey = result.module_relations[0].foreign_key;
            element.fk_id = moduleData[forignKey];
            let getDoc = await DBModel.findOne({ _id: element.fk_id }).select(project);
            let nestedFieldValue = _.get(getDoc, element.field);
            let fieldValue;
            fieldValue = nestedFieldValue;
            if (Array.isArray(fieldValue)) {
                fieldValue = fieldValue.join(', ');
            }
            element.value = fieldValue;
        }
    }
    return documentTemplate;
};

const getDocumentTemplatePast = async (DocTemplateCloneId, reqBody) => {
    const documentTemplate = await DocumentTemplatesClone.findOne({ _id: DocTemplateCloneId._id });
    let content = documentTemplate.content;
    if (documentTemplate) {
        const model = require(`../models/${documentTemplate.module}.model`);
        let moduleData = await model.findOne({ _id: ObjectId(documentTemplate.module_id) });

        documentTemplate.auto_replace_keys.forEach(async (element) => {
            let key = element.key;
            key = key.slice(1, -1);
            if (reqBody) {
                if (documentTemplate.module === element.collection) {
                    element.fk_id = moduleData._id;
                    await model.updateOne({ _id: ObjectId(element.fk_id) }, { $set: reqBody });
                } else {
                    let DBModel = require(`../models/${element.collection}.model`);
                    const query = {
                        module_relations: {
                            $elemMatch: {
                                module: documentTemplate.module,
                                foreign_module: element.collection,
                            },
                        },
                    };
                    const projection = { 'module_relations.$': 1 };
                    const result = await Configurations.findOne(query, projection);
                    forignKey = result.module_relations[0].foreign_key;
                    element.fk_id = moduleData[forignKey];
                    await DBModel.updateOne({ _id: ObjectId(element.fk_id) }, { $set: reqBody });
                }
            }
        });

        let autoReplacedContent = await getReplacedTemplate(documentTemplate, content, reqBody);

        documentTemplate.user_input_keys.forEach(async (ele) => {
            let key = ele.key;
            key = key.slice(1, -1);
            if (reqBody[key]) {
                let nestedFieldValue = _.get(reqBody, ele.key);
                autoReplacedContent = autoReplacedContent.split(ele.key).join(ele.value);
                ele.value = nestedFieldValue;
            } else {
                autoReplacedContent = autoReplacedContent.split(ele.key).join(ele.value);
            }
        });
        await DocumentTemplatesClone.updateOne(
            { _id: DocTemplateCloneId._id },
            { $set: { user_input_keys: documentTemplate.user_input_keys } },
            { new: true }
        );
        const Template = await DocumentTemplatesClone.findOne({ _id: DocTemplateCloneId._id });
        const updatedTemplate = {
            ...Template.toObject(),
            autoReplacedContent: autoReplacedContent,
        };
        return updatedTemplate;
    } else {
        return [];
    }
};

const getDocumentTemplate = async (DocTemplateCloneId, reqBody) => {
 try {
  console.log(DocTemplateCloneId._id, "is the template id")
  const documentTemplate = await DocumentTemplatesClone.findOne({ _id: DocTemplateCloneId._id });
  if (!documentTemplate) {
    return [];
  }

  let content = documentTemplate.content;
  let modifiedAutoReplace = [];
  let modifiedUserInputKeys = [];

  const model = require(`../models/${documentTemplate.module}.model`);
  console.log('=-------------->',model, 'here is the model---------->')
  let moduleData = await model.findOne({ _id: ObjectId(documentTemplate.module_id) });
  let contact_person = {};
  console.log('these are the entires', documentTemplate.auto_replace_keys.entries(), '------->end entries')
  for (const [index, docObj] of documentTemplate.auto_replace_keys.entries()) {
    const reqObj = reqBody.auto_replace_keys[index];
    console.log(reqBody.auto_replace_keys[index], 'the replace key at index')
    if (documentTemplate.module === docObj.collection) {
      docObj.fk_id = moduleData._id;
    }
    if (reqObj && reqObj.value !== null && reqObj.value !== undefined && reqObj.value !== '') {
      if (reqObj.collection === 'companies') {
        // Handle contact person fields
        if (!contact_person.hasOwnProperty("name") && reqObj.key.includes("person_name")) {
          contact_person["name"] = reqObj.value;
        }
        if (!contact_person.hasOwnProperty("phone") && reqObj.key.includes("person_phone")) {
          contact_person["phone"] = reqObj.value;
        }
        if (!contact_person.hasOwnProperty("email") && reqObj.key.includes("person_email")) {
          contact_person["email"] = reqObj.value;
        }
        if (!contact_person.hasOwnProperty("designation") && reqObj.key.includes("person_designation")) {
          contact_person["designation"] = reqObj.value;
        }

        console.log("contact person++++++==", contact_person)

        // Only update contact_persons if all fields are present
        if (contact_person.name && contact_person.phone && contact_person.email && contact_person.designation) {
          let DBModel = require(`../models/${reqObj.collection}.model`);
          console.log(DBModel, "++++dbModel")
          console.log("1+++++")
          let companyDoc = await DBModel.findOne({ _id: ObjectId(reqObj.fk_id) });

          companyDoc.contact_persons = [contact_person];
          console.log("2+++++")
          await companyDoc.save();
          console.log("Contact persons saved successfully")
        }

        // Handle other company fields (non-contact_person fields)
        if (!reqObj.key.includes("person_name") && !reqObj.key.includes("person_phone") && 
            !reqObj.key.includes("person_email") && !reqObj.key.includes("person_designation")) {
          let DBModel = require(`../models/${reqObj.collection}.model`);
          let updatables = { [reqObj.field]: reqObj.value };
          console.log("++++++= updatables for company", updatables)
          await DBModel.updateOne({ _id: ObjectId(reqObj.fk_id) }, { $set: updatables });
        }
        
        modifiedAutoReplace.push(reqObj);
      } else {
        // Handle non-company collections
        let DBModel = require(`../models/${reqObj.collection}.model`);
        let updatables = { [reqObj.field]: reqObj.value };
        console.log(DBModel, 'this is the model to update--->')
        console.log('=====> start of updatables',updatables, '------> end of updatables')
        console.log("1 alt+++++")
        await DBModel.updateOne({ _id: ObjectId(reqObj.fk_id) }, { $set: updatables });
        modifiedAutoReplace.push(reqObj);
      }
    } else {
      // If value is null, undefined, or empty, just push the docObj without updating
      modifiedAutoReplace.push(docObj);
    }
  }

  // console.log("cont3ent --> ", content)

  let autoReplacedContent = await getReplacedTemplate(documentTemplate, content, reqBody);

  for (const [index, docObj] of documentTemplate.user_input_keys.entries()) {
    const reqObj = reqBody.user_input_keys[index];
    if (reqObj && reqObj.value) {
      modifiedUserInputKeys.push(reqObj);
    } else {
      modifiedUserInputKeys.push(docObj);
    }
  }

  await DocumentTemplatesClone.updateOne(
    { _id: DocTemplateCloneId._id },
    { $set: { user_input_keys: modifiedUserInputKeys } }
  );

  const Template = await DocumentTemplatesClone.findOne({ _id: DocTemplateCloneId._id });
  const updatedTemplate = {
    ...Template.toObject(),
    autoReplacedContent: autoReplacedContent,
  };

  return updatedTemplate;
 }catch(error){
  console.log(error)
  throw new Error(error);
 }
};

const editDocumentTemplate = async (DocTemplateCloneId, reqBody) => {
    try {
        // Validate required fields
        if (!reqBody.document_details) {
            throw new Error('document_details is required in request body');
        }
        
        const { processIndex, actionIndex } = reqBody.document_details;
        
        // Log the received values for debugging
        console.log('Received processIndex:', processIndex, 'type:', typeof processIndex);
        console.log('Received actionIndex:', actionIndex, 'type:', typeof actionIndex);
        
        // Validate processIndex and actionIndex
        const numProcessIndex = Number(processIndex);
        const numActionIndex = Number(actionIndex);
        
        if (processIndex === undefined || processIndex === null || isNaN(numProcessIndex) || numProcessIndex < 0) {
            throw new Error(`processIndex must be a valid non-negative number, received: ${processIndex} (${typeof processIndex})`);
        }
        
        if (actionIndex === undefined || actionIndex === null || isNaN(numActionIndex) || numActionIndex < 0) {
            throw new Error(`actionIndex must be a valid non-negative number, received: ${actionIndex} (${typeof actionIndex})`);
        }

        let newDocTemplateClone = new DocumentTemplatesClone(reqBody)
        const documentTemplate = await newDocTemplateClone.save()
        let module = reqBody.module
        let module_id = reqBody.module_id

        if (documentTemplate) {
            let document_id = documentTemplate._id
            const model = require(`../models/${documentTemplate.module}.model`)
            
            // Create the update object with validated indices
            let obj = {}
            obj[`processes.${numProcessIndex}.actions.${numActionIndex}.template_id`] = ObjectId(document_id)
            
            let moduleUpdate = await model.findOneAndUpdate(
                { _id: ObjectId(module_id) }, 
                { $set: obj },
                { new: true }
            )
            
            if (!moduleUpdate) {
                throw new Error(`Failed to update ${module} with ID ${module_id}`);
            }
            
            return documentTemplate._id
        } else {
            throw new Error('Failed to create document template clone');
        }
    } catch (error) {
        console.error('Error in editDocumentTemplate:', error);
        throw error;
    }
}

const PdfGenerateContentFile = async (DocTempltCloneID) => {
    const documentTemplate = await DocumentTemplatesClone.findOne({ _id: DocTempltCloneID });

    // console.log(documentTemplate , "documentTemplate")

    let obj = {
        // "replaceText": "",
        // "replaceTable": JSON.stringify([{ tablename: "Products", table: [{ description: "item1", quantity: "42" }] }]),
        // "replaceImage": "",
        "content": documentTemplate.autoReplacedContent
    }
    // return obj
    let response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContentToPDF', JSON.stringify(obj), { headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf' }, responseType: 'arraybuffer', })
    fs.writeFileSync('test.pdf', response.data);
    const fileName = `${documentTemplate.module.trim() + '-' + documentTemplate.name.trim() + new Date().toISOString()}` + '.pdf'

    const AWSresp = await uploadFileToS3({ filePath: './test.pdf', fileName, fileMimeType: 'application/pdf', folderName: "Document" });
    // fs.rmSync('./' + `${documentTemplate.name.trim()}` + '.pdf', {
    //     force: true,
    // });

    documentTemplate.fileUrl &&
        documentTemplate.fileUrl.forEach((path) => {
            path.status = 0;
            path.url = path.url;
        });

    documentTemplate.fileUrl.push({ url: AWSresp.Location, status: 1 });
    await DocumentTemplatesClone.updateOne({ _id: DocTempltCloneID }, { $set: { fileUrl: documentTemplate.fileUrl } });
    console.log('PDF Created');
    // return response.data
};

const uploadFileToS3 = async ({ filePath, fileName, fileMimeType, folderName }) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.SECRET_ID_AWS,
        secretAccessKey: process.env.SECRET_KEY_AWS,
    });
    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Body: fileStream,
        Key: fileName,
        ACL: 'public-read',
        ContentType: fileMimeType,
    };

    return s3.upload(uploadParams).promise();
};

async function getReplacedTemplate(documentTemplate, content) {
  const confResult = await Configurations.findOne({}).select({ module_relations: 1 });
  const relations = confResult.module_relations;
  let form = {
    fields: [],
  };
  form['foreign_id'] = documentTemplate.module_id;
  let replaceKeys = documentTemplate.auto_replace_keys;
  for (let i = 0; i < replaceKeys.length; i++) {
    const element = replaceKeys[i];
    if (element.collection === documentTemplate.module) {
      form.fields.push({
        connection_type: 'default',
        module: documentTemplate.module,
        foreign_id: '',
        primiary_connection: '',
        value: '',
        field: getFlattenedField(element.field)
      });
    } else {
      form.fields.push({
        connection_type: 'primary',
        module: element.collection,
        foreign_id: relations.find(a => a.module === documentTemplate.module && a.foreign_module === element.collection).foreign_key,
        primiary_connection: '',
        value: '',
        field: getFlattenedField(element.field)
      });
    }
  }
  
  
  const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
  const model = require(`../models/${documentTemplate.module}.model`);
  // console.log("form is ", form)
  console.log("document te mod ", documentTemplate.module)
  let query = await generateGetQuery(form, documentTemplate.module);
  // console.log("query is ", JSON.stringify(query))
  let data = await model.aggregate(query);
  let result = data[0];
  console.log("replaceKeys.length", replaceKeys.length)
  for (let index = 0; index < replaceKeys.length; index++) {
    const element = replaceKeys[index];
    let project = {};
    project[element.field] = 1;
    moduleName = element.collection;
    let getDoc = result[moduleName];
    element.fk_id = getDoc._id;

    // Check if the field is in MongoDB accessor format
    let fieldPath = element.field;
    if (isMongoAccessorPattern(fieldPath)) {
      fieldPath = mongoToJSAccessor(fieldPath);
    }

    let nestedFieldValue = _.get(getDoc, fieldPath);
    let fieldValue = nestedFieldValue;
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.join(', ');
    }
    element.value = fieldValue;
    
    content = content.replace(element.key, fieldValue);
    if (replaceKeys.length == index + 1) {
      await DocumentTemplatesClone.updateOne(
        { _id: documentTemplate._id },
        { $set: { auto_replace_keys: replaceKeys } },
        { new: true }
      );
      return content;
    }
  }
  return content;
}



const getDocTemplateOnIDWithoutContent = async (DocTempltCloneID) => {
  //  console.log('------------------->getting document template without content-------------------->')
  //  console.log(DocTempltCloneID, 'the template clone id is this------>')
  let pipeline = [
    {
      $match: {
        _id: ObjectId(DocTempltCloneID),
        is_deleted: false,
      },
    },
    {
      $project: {
        content: 0,
        is_deleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];
  let docData = await DocumentTemplatesClone.aggregate(pipeline);
  let documentTemplate = docData[0];
  // console.log('------->start document template',documentTemplate, '-------->end document template')
  // console.log('---------------------->',documentTemplate._id, 'the id for the document template----------------->')
  // console.log('start doc template',documentTemplate, 'end doc template')
  const model = require(`../models/${documentTemplate.module}.model`);
  // console.log('------------------------>',documentTemplate.module, 'the document template module-------------->')
  // find the document from models to get user id
  const moduleResult = await model.findOne({_id:ObjectId(documentTemplate.module_id)})


  // get user from user model
  const systemUser = await Users.findOne({_id:ObjectId(moduleResult.user_id)});

  const confResult = await Configurations.findOne({}).select({ module_relations: 1 });

  const relations = confResult.module_relations;

    let form = {
        fields: [],
    };
    form['foreign_id'] = documentTemplate.module_id;
    let replaceKeys = documentTemplate.auto_replace_keys;

  for (let i = 0; i < replaceKeys.length; i++) {
    const element = replaceKeys[i];
    

    if (element.collection == documentTemplate.module) {
      form.fields.push({
        connection_type: 'default',
        module: documentTemplate.module,
        foreign_id: '',
        primiary_connection: '',
        value: '',
        field: getFlattenedField(element.field),
      });
    } else {
      const relation = relations.filter((a) => {
        return a.module == documentTemplate.module && a.foreign_module == element.collection;
      })[0];
      if (relation) {
        form.fields.push({
          connection_type: 'primary',
          module: element.collection,
          foreign_id: relation.foreign_key,
          primiary_connection: '',
          value: '',
          field: getFlattenedField(element.field),
        });
      } else {
        console.error(`No relation found for module ${documentTemplate.module} and collection ${element.collection}`);
      }
    }
  }

  const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
 
  let query = await generateGetQuery(form, documentTemplate.module);
  // console.log(JSON.stringify('-
  // ------------------------>',query), '------->this is the stirngified query result')
  let data = await model.aggregate(query);
  let result = data[0];
  for (let index = 0; index < replaceKeys.length; index++) {
    const element = replaceKeys[index];
    let project = {};
    project[element.field] = 1;
    let moduleName = element.collection;
    let getDoc = result[moduleName];
    if (getDoc) {
      element.fk_id = getDoc._id;
      // Check if the field is in MongoDB accessor format
      let fieldPath = element.field;
      if (isMongoAccessorPattern(fieldPath)) {
        fieldPath = mongoToJSAccessor(fieldPath);
      }
      let nestedFieldValue = _.get(getDoc, fieldPath);

      let fieldValue = nestedFieldValue;
      if (Array.isArray(fieldValue)) {
        fieldValue = fieldValue.join(', ');
      }
      element.value = fieldValue;
    } else {
      console.error(`No document found for module ${moduleName}`);
    }
  }
  const Process = await model.findOne({ _id: documentTemplate.module_id })
  const user = await Users.findOne({ _id: Process.user_id })
  
  const companyToCheck = await Companies.findById(user.company_id);

  if(user?.onboarding_replace_keys && documentTemplate.module === "renewals") {
    if(documentTemplate.auto_replace_keys) {
      documentTemplate.auto_replace_keys = documentTemplate.auto_replace_keys.map(auto_replace_key => {
        //if value exists, skip and return the object as it is without modification
        if(auto_replace_key.value) return auto_replace_key;
        
        //else, add value from onboarding_replace_keys
        const _onboarding_replace_key = user.onboarding_replace_keys.find(onboarding_replace_key => onboarding_replace_key.key === auto_replace_key.key && onboarding_replace_key.label === auto_replace_key.label);

        if(!_onboarding_replace_key || !_onboarding_replace_key.value ) return auto_replace_key

        return { ...auto_replace_key, value: _onboarding_replace_key.value }
      });
    }
  }
  if (documentTemplate.module !== 'leads') {
    for(let element of documentTemplate.auto_replace_keys){
      const split = element.field.split(".")//upfrohbn.security_deposit
      console.log(split, 'is the value of split')
    if(element.field.includes("upfront_costs.") || element.field.includes("monthly_costs.") ) {
      if(user.employment.visa_sponsor_type == 'Dynamic Employment Services') {
        console.log("processing dynamic employment services");
        if(split.length <= 2) {
          element.value = companyToCheck[split[0]]?.[split[1]]
          // c['upfront_costs']['security_deposit']
        }
      }
  
      if(user.employment.visa_sponsor_type == 'Executive Employment Services') {
        if(split.length <= 2) {
          element.value = companyToCheck[`${split[0]}_ees`]?.[split[1]]
          // c['upfront_costs_ees']['security_deposit']
        }
      }
    }
  
      if(element.value == undefined || !element.value){
        element.value =""
      }
    }
  }
  documentTemplate.salaryFields =systemUser.salary
    return documentTemplate;
};

const getReplacedContent = async (DocTempltCloneID) => {
  console.log("called at getReplacedContent")
  let pipeline = [
    {
      $match: {
        _id: ObjectId(DocTempltCloneID),
        is_deleted: false,
      },
    },
    {
      $project: {
        is_deleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];
  let docData = await DocumentTemplatesClone.aggregate(pipeline);
  let documentTemplate = docData[0];
  const confResult = await Configurations.findOne({}).select({ module_relations: 1 });
  const relations = confResult.module_relations;
  let form = {
    fields: [],
  };
  form['foreign_id'] = documentTemplate.module_id;
  let replaceKeys = documentTemplate.auto_replace_keys;
  for (let i = 0; i < replaceKeys.length; i++) {
    const element = replaceKeys[i];
    if (element.collection == documentTemplate.module) {
      form.fields.push({
        connection_type: 'default',
        module: documentTemplate.module,
        foreign_id: '',
        primiary_connection: '',
        value: '',
        field: element.field,
      });
    } else {
      form.fields.push({
        connection_type: 'primary',
        module: element.collection,
        foreign_id: relations.filter((a) => {
          return a.module == documentTemplate.module && a.foreign_module == element.collection;
        })[0].foreign_key,
        primiary_connection: '',
        value: '',
        field: element.field,
      });
    }
  }
  const model = require(`../models/${documentTemplate.module}.model`);
  let query = await generateGetQuery(form, documentTemplate.module);
  let data = await model.aggregate(query);
  let result = data[0];
  for (let index = 0; index < replaceKeys.length; index++) {
    const element = replaceKeys[index];
    let project = {};
    project[element.field] = 1;
    moduleName = element.collection;
    let getDoc = result[moduleName];
    element.fk_id = getDoc._id;
    let nestedFieldValue = _.get(getDoc, element.field);
    let fieldValue;
    fieldValue = nestedFieldValue;
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.join(', ');
    }
    element.value = fieldValue;
  }
  let array = [];
  for (let index = 0; index < documentTemplate.auto_replace_keys.length; index++) {
    const element = documentTemplate.auto_replace_keys[index];
    if (element && element.value && element.value != '') {
      array.push({
        key: element.key,
        value: element.value,
      });
    } else {
      array.push({
        key: element.key,
        value: '',
      });
    }
  }
  for (let index = 0; index < documentTemplate.user_input_keys.length; index++) {
    const element = documentTemplate.user_input_keys[index];
    if (element && element.value && element.value != '') {
      array.push({
        key: element.key,
        value: element.value,
      });
    } else {
      array.push({
        key: element.key,
        value: '',
      });
    }
  }
  let obj = {
    replaceText: JSON.stringify(array),
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
    content: documentTemplate.content,
  };
  let response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContent', JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
  });
  return response.data;
};

const getReplacedContentFile = async (DocTempltCloneID) => {
  console.log("called at getReplacedConntentFile")
  let pipeline = [
    {
      $match: {
        _id: ObjectId(DocTempltCloneID),
        is_deleted: false,
      },
    },
    {
      $project: {
        is_deleted: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];
  let docData = await DocumentTemplatesClone.aggregate(pipeline);
  let documentTemplate = docData[0];
  const confResult = await Configurations.findOne({}).select({ module_relations: 1 });
  const relations = confResult.module_relations;
  let form = {
    fields: [],
  };
  form['foreign_id'] = documentTemplate.module_id;
  let replaceKeys = documentTemplate.auto_replace_keys;
  for (let i = 0; i < replaceKeys.length; i++) {
    const element = replaceKeys[i];
    if (element.collection == documentTemplate.module) {
      form.fields.push({
        connection_type: 'default',
        module: documentTemplate.module,
        foreign_id: '',
        primiary_connection: '',
        value: '',
        field: element.field,
      });
    } else {
      form.fields.push({
        connection_type: 'primary',
        module: element.collection,
        foreign_id: relations.filter((a) => {
          return a.module == documentTemplate.module && a.foreign_module == element.collection;
        })[0].foreign_key,
        primiary_connection: '',
        value: '',
        field: element.field,
      });
    }
  }
  const model = require(`../models/${documentTemplate.module}.model`);
  let query = await generateGetQuery(form, documentTemplate.module);
  let data = await model.aggregate(query);
  let result = data[0];
  for (let index = 0; index < replaceKeys.length; index++) {
    const element = replaceKeys[index];
    let project = {};
    project[element.field] = 1;
    moduleName = element.collection;
    let getDoc = result[moduleName];
    element.fk_id = getDoc._id;
    let nestedFieldValue = _.get(getDoc, element.field);
    let fieldValue;
    fieldValue = nestedFieldValue;
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue.join(', ');
    }
    element.value = fieldValue;
  }
  let array = [];
  for (let index = 0; index < documentTemplate.auto_replace_keys.length; index++) {
    const element = documentTemplate.auto_replace_keys[index];
    if (element && element.value && element.value != '') {
      array.push({
        key: element.key,
        value: element.value,
      });
    } else {
      array.push({
        key: element.key,
        value: '',
      });
    }
  }
  for (let index = 0; index < documentTemplate.user_input_keys.length; index++) {
    const element = documentTemplate.user_input_keys[index];
    if (element && element.value && element.value != '') {
      array.push({
        key: element.key,
        value: element.value,
      });
    } else {
      array.push({
        key: element.key,
        value: '',
      });
    }
  }
  let obj = {
    replaceText: JSON.stringify(array),
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
    content: documentTemplate.content,
  };
  let response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContentToPDF', JSON.stringify(obj), {
    headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
  });
  const fs = require('fs');
  fs.writeFile('./test.pdf', response.data, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
  return response.data;
};

const generateGetQuery = async (form, module) => {
    var groupBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    defualtfields = form.fields.filter((a) => a.connection_type == 'default');
    primaryfields = form.fields.filter((a) => a.connection_type == 'primary');
    secondaryfields = form.fields.filter((a) => a.connection_type == 'secondary');

    // secondary looksup collection
    let secondarylookups = [];
    let filteredsecondaryfields = groupBy(secondaryfields, 'module');
    for (let [collectionkey, value] of Object.entries(filteredsecondaryfields)) {
        let primiryconnectionsort = groupBy(value, 'primiary_connection');
        for (let [key, value] of Object.entries(primiryconnectionsort)) {
            const element = value;
            let project = {};
            for (let i = 0; i < element.length; i++) {
                const i_element = element[i];
                project[i_element.field] = `$${i_element.field}`;
            }
            let lookup = {
                from: collectionkey,
                localField: element[0].foreign_id,
                foreignField: '_id',
                as: collectionkey,
                pipeline: [
                    {
                        $project: project,
                    },
                ],
            };
            secondarylookups.push({ collection: key, lookup: lookup });
        }
    }

    // primary looksup collection
    let primarylookups = [];

    let filteredprimaryfields = groupBy(primaryfields, 'module');
    for (let [key, value] of Object.entries(filteredprimaryfields)) {
        const primaryelement = value;
        let lookup = {
            from: key,
            localField: primaryelement[0].foreign_id,
            foreignField: '_id',
            as: key,
            pipeline: [],
        };
        let project = {};
        for (let i = 0; i < primaryelement.length; i++) {
            const i_element = primaryelement[i];
            project[i_element.field] = `$${i_element.field}`;
        }
        if (secondarylookups.filter((a) => a.collection == key).length > 0) {
            for (let index = 0; index < secondarylookups.filter((a) => a.collection == key).length; index++) {
                const element = secondarylookups.filter((a) => a.collection == key)[index];
                lookup.pipeline.push({ $lookup: element.lookup });
                lookup.pipeline.push({ $unwind: `$${element.lookup.as}` });
                for (let [projectionkey, value] of Object.entries(element.lookup.pipeline[0]['$project'])) {
                    project[projectionkey] = `$${element.lookup.as}.${projectionkey}`;
                }
            }
        }
        lookup.pipeline.push({ $project: project });
        primarylookups.push(lookup);
    }

    // creating main aggregate
    let aggregate = [];
    aggregate.push({
        $match: { _id: ObjectId(form.foreign_id) },
    });

    let project = {};

    for (let index = 0; index < defualtfields.length; index++) {
        const element = defualtfields[index];
        project[module + '.' + element.field] = `$${element.field}`;
    }
    project[module + '.' + '_id'] = `$_id`;

    if (primarylookups.length > 0) {
        for (let index = 0; index < primarylookups.length; index++) {
            const element = primarylookups[index];
            aggregate.push({ $lookup: element });
            aggregate.push({ $unwind: `$${element.as}` });
            for (let [projectionkey, value] of Object.entries(
                element.pipeline.filter((a) => a.hasOwnProperty('$project'))[0]['$project']
            )) {
                project[element.as + '.' + projectionkey] = `$${element.as}.${projectionkey}`;
            }
            project[element.as + '.' + '_id'] = `$${element.as}._id`;
        }
    }
    aggregate.push({ $project: project });
    return aggregate;
};

const getReplacedContentSavePDF = async (DocTempltCloneID, reqBody) => {
    // console.log("Hits here")
    let pipeline = [{
        $match: {
            _id: ObjectId(DocTempltCloneID),
            is_deleted: false
        }
    },
    {
        $project: {
            is_deleted: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0
        }
    }];
    let docData = await DocumentTemplatesClone.aggregate(pipeline);
    let documentTemplate = docData[0]
    const confResult = await Configurations.findOne({}).select({ 'module_relations': 1 })
    const relations = confResult.module_relations
    let form = {
        fields: []
    }
    form['foreign_id'] = documentTemplate.module_id
    let replaceKeys = documentTemplate.auto_replace_keys;
    for (let i = 0; i < replaceKeys.length; i++) {
        const element = replaceKeys[i];
        if (element.collection == documentTemplate.module) {
            form.fields.push(
                {
                    connection_type: "default",
                    module: documentTemplate.module,
                    foreign_id: "",
                    primiary_connection: "",
                    value: "",
                    field: getFlattenedField(element.field)

                }
            )
        }
        else {     
            form.fields.push(
                {
                    connection_type: "primary",
                    module: element.collection,
                    foreign_id: relations.filter(a => { return a.module == documentTemplate.module && a.foreign_module == element.collection })[0].foreign_key,
                    primiary_connection: "",
                    value: "",
                    field: getFlattenedField(element.field)

                }
            )
        }
    }
    const model = require(`../models/${documentTemplate.module}.model`)
    let query = await generateGetQuery(form, documentTemplate.module)
    let data = await model.aggregate(query)
    let result = data[0]
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        moduleName = element.collection
        let getDoc = result[moduleName]
        element.fk_id = getDoc._id

        // Check if the field is in MongoDB accessor format
        let fieldPath = element.field;
        if (isMongoAccessorPattern(fieldPath)) {
          fieldPath = mongoToJSAccessor(fieldPath);
        }
        let nestedFieldValue = _.get(getDoc, fieldPath);
        console.log(`replaced --> $  ${nestedFieldValue}`, )
        let fieldValue = nestedFieldValue;

        if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ');
        }
        element.value = fieldValue
    }
    let array = []
    for (let index = 0; index < documentTemplate.auto_replace_keys.length; index++) {
        const element = documentTemplate.auto_replace_keys[index];
        if (element && element.value && element.value != '') {
            array.push(
                {
                    key: element.key,
                    value: element.value
                }
            )
        }
        else {
            array.push(
                {
                    key: element.key,
                    value: ""
                }
            )
        }
    }
    for (let index = 0; index < documentTemplate.user_input_keys.length; index++) {
        const element = documentTemplate.user_input_keys[index];
        if (element && element.value && element.value != '') {
            array.push(
                {
                    key: element.key,
                    value: element.value
                }
            )
        }
        else {
            array.push(
                {
                    key: element.key,
                    value: ""
                }
            )
        }
    }
    let tableArray = [{ tablename: "Products", table: [{ description: "item1", quantity: "42" }] }]
    if (documentTemplate.additional_input_keys) {
        let additionalTable = { tablename: "additiontable", table: [] }
        for (let index = 0; index < documentTemplate.additional_input_keys.length; index++) {
            const element = documentTemplate.additional_input_keys[index];
            additionalTable.table.push({ adDescription: element.type + " - " + element.label, adAmount: parseFloat(element.value).toFixed(2) })
        }
        array.push(
            {
                key: "totalADAmount",
                value: documentTemplate.additional_input_keys.reduce((a, b) => parseFloat(a) + parseFloat(b.value), 0).toFixed(2)
            }
        )
        tableArray.push(additionalTable)
    }
    let obj = {
        "replaceText": JSON.stringify(array),
        "replaceTable": JSON.stringify(tableArray),
        "replaceImage": JSON.stringify([{ key: "logo", value: data.letterImages && data.letterImages.signatureLink ? data.letterImages.signatureLink : "https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg" }, { key: "stamp", value: data.letterImages && data.letterImages.companyStampLink ? data.letterImages.companyStampLink : "https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg" }]),
        "content": documentTemplate.content
    }
    let response = await axios.post(process.env.documenturl + 'api/DocumentEditor/ReplaceContentToPDF', JSON.stringify(obj), { headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf' }, responseType: 'arraybuffer' })
    fs.writeFileSync('test.pdf', response.data);

    const Process = await model.findOne({ _id: documentTemplate.module_id })
    const user = await Users.findOne({ _id: Process.user_id }).select({ "first_name": 1, "last_name": 1 })
    const fileName = `${documentTemplate.name.replace(/ /g, "_") + '_' + user.first_name + '_' + user.last_name + '_' + moment(Date.now()).format("DD-MM-YYYY")}` + '.pdf'

    const AWSresp = await uploadFileToS3({ filePath: './test.pdf', fileName, fileMimeType: 'application/pdf', folderName: "Document" });


    const documentObject = {
        type: reqBody.document_details.uploadable_document,
        identifier: documentTemplate.module,
        foreign_id: documentTemplate.module_id,
        name: `${documentTemplate.name.replace(/ /g, "_") + '_' + user.first_name + '_' + user.last_name + '_' + moment(Date.now()).format("DD-MM-YYYY")}`,
        module: documentTemplate.module,
        doc_status: "valid",
        expiry: "",
        url: AWSresp.Location
    }

    const CreateDocument = await new Documents(documentObject).save();


    Process.processes[reqBody.document_details.processIndex].actions[reqBody.document_details.actionIndex].generated_document_id = CreateDocument._id
    const updateModule = await model.updateOne({ _id: documentTemplate.module_id }, { $set: { "processes": Process.processes } })
    await DocumentTemplatesClone.updateOne({ _id: DocTempltCloneID }, { $set: { "fileUrl": AWSresp.Location } })
    return CreateDocument._id
}

const CalculateWorkOrder = async (type, reqBody) => {

    const model = require(`../models/${reqBody.module}.model`)
    const CompanyId = await model.findOne({ _id: reqBody.module_id }).select({ "company_id": 1 })
    const workOrderCount = await model.find({ "company_id": CompanyId.company_id })
    const Company = await Companies.findOne({ _id: CompanyId.company_id }).select({ "unique_code": 1 })

    return { "Total": (Company.unique_code ? Company.unique_code : 'PEO') + '-' + (workOrderCount.length + 1) }
}



module.exports = {
    getReplacedContentSavePDF,
    getDocumentTemplate,
    createDocumentTemplateClone,
    getDocumentTemplateCloneById,
    updateDocumentTemplateCloneOnId,
    listAllDocumentTemplateClone,
    getDocTemplateOnIDWithoutContent,
    getReplacedContent,
    getReplacedContentFile,
    PdfGenerateContentFile,
    uploadFileToS3,
    CalculateWorkOrder,
    editDocumentTemplate
}