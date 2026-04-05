const { ObjectId } = require("mongodb");
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const pagination = require('../middlewares/paginate');
const { FormTemplate, Configurations, Users, Renewals, Onboardings, VisaProcess, Offboardings, Companies } = require('../models');
const _ = require("lodash");
const axios = require('axios')
const fs = require('fs')
const userService = require('./users.service');
const {getInsuranceAgents, updateInsuranceAgentByModel} = require("../helpers/insurance_agents.helper");
const { sendRawEmail } = require("../middlewares/email")
const emailTemplateService = require("./email_template.service")

const getForm = async (form_id) => {
  let data = await FormTemplate.find({ _id: ObjectId(form_id) })
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Data Found")
  }
  return data
}

const getDropdownItems = async (keyword) => {
  if (keyword == "medicalcenters") {
    let conf = await Configurations.findOne({}).select({ "medical_centers": 1 })
    let configuration = JSON.parse(JSON.stringify(conf))
    let obj = configuration.medical_centers.map(a => { return { "key": a.name, value: a } })
    return obj
  }
  else if (keyword == "eidcenters") {
    let conf = await Configurations.findOne({}).select({ "eid_centers": 1 })
    let configuration = JSON.parse(JSON.stringify(conf))
    let obj = configuration.eid_centers.map(a => { return { "key": a.name, value: a } })
    return obj
  }
  else if (keyword == "tawjeehcenters") {
    let conf = await Configurations.findOne({}).select({ "tawjeeh_centers": 1 })
    let configuration = JSON.parse(JSON.stringify(conf))
    let obj = configuration.tawjeeh_centers.map(a => { return { "key": a.name, value: a } })
    return obj
  }
  else if (keyword == "prolist") {
    let users = await Users.find({ "role_ID": "640f1c93be01c2e00bd95084", "employment.designation": "PRO" }).select({ "first_name": 1, "last_name": 1, "_id": 1 })
    let parsedUsers = JSON.parse(JSON.stringify(users))
    let obj = parsedUsers.map(a => { return { "key": a.first_name + " " + a.last_name, value: a.id } })
    return obj
  }
  else if (keyword == "escalationManagers") {
    let role = 'escalation managers';
    let users = await userService.fetchSupportHrEscalationRoles(role);
    let parsedUsers = JSON.parse(JSON.stringify(users))
    let obj = parsedUsers.map(a => { return { "key": a.first_name + " " + a.last_name, value: a.id } })
    return obj
  }
  else if (keyword == "hrSpecialists") {
    let role = 'hr specialists';
    let users = await userService.fetchSupportHrEscalationRoles(role);
    let parsedUsers = JSON.parse(JSON.stringify(users))
    let obj = parsedUsers.map(a => { return { "key": a.first_name + " " + a.last_name, value: a.id } })
    return obj
  }
  else if (keyword == "insuranceAgents") {
    let role = 'insurance agents';
    let users = await userService.fetchSupportHrEscalationRoles(role);
    let parsedUsers = JSON.parse(JSON.stringify(users))
    let obj = parsedUsers.map(a => { return { "key": a.first_name + " " + a.last_name, value: a.id } })
    return obj
  }
  else if (keyword == "supportAgentandHrSpecialists") {
    let role = 'support agents';
    let users = await userService.fetchSupportHrEscalationRoles(role);
    let parsedUsers = JSON.parse(JSON.stringify(users))
    let obj = parsedUsers.map(a => { return { "key": a.first_name + " " + a.last_name, value: a.id } })
    return obj
  }
  else {
    return []
  }
}

const getAllList = async (formdata) => {
  let data = await FormTemplate.find({}).select({ name: 1, module: 1 })
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Data Found")
  }
  return data
}

const getAllFields = async (formdata) => {
  let relations = await Configurations.findOne({}).select({ "module_relations": 1 })
  let baserelation = JSON.parse(JSON.stringify(relations))

  let fieldsarr = []

  let tempSchema = require(`../models/${formdata.module}.model`)
  let tempData = await tempSchema.findOne({}).sort({ _id: -1 })
  fieldsarr.push({ module: formdata.module, keys: generateKeys(JSON.parse(JSON.stringify(tempData))) })

  let moduleRelations = baserelation.module_relations.filter(a => a.module == formdata.module)
  for (let index = 0; index < moduleRelations.length; index++) {
    const element = moduleRelations[index];
    let tempSchema = require(`../models/${element.foreign_module}.model`)
    let tempData = await tempSchema.findOne({}).sort({ _id: -1 })
    fieldsarr.push({ module: element.foreign_module, keys: generateKeys(JSON.parse(JSON.stringify(tempData))) })
  }
  return fieldsarr
}

const generateKeys = (Object) => {

  let arr = []
  let iterate = function (obj, stack) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (Array.isArray(obj[property])) {
        }
        else if (typeof obj[property] == "object") {
          if (stack != undefined) iterate(obj[property], stack + '.' + property);
          else iterate(obj[property], property);
        } else {
          if (stack != undefined) {
            arr.push(stack + '.' + property)
          }
          else {
            arr.push(property)
          }
        }
      }
    }
  }
  iterate(Object)
  return arr
}
const updateForm = async (formTemplate) => {
  // console.log(formTemplate.fields[0].header[0].fields, "printing value for support agents");
  console.log(typeof formTemplate.fields[0].header[0].fields, "the type---------->");

  for (const fieldGroup of formTemplate.fields) {
    for (const header of fieldGroup.header) {
      for (const element of header.fields) {
        let updatables = {
          [element.field]: element.value
        };
        let DBModel = require(`../models/${element.collection}.model`);
        await DBModel.updateOne({ _id: ObjectId(element.fk_id) }, { $set: updatables });
      }
    }
  }

  // Fetch insurance agents only when the assigned field exists
  const assignedAgentField = formTemplate.fields[0]?.header[0]?.fields?.find(
    field => field.field === "assigned_insurance_agent"
  );

  const assignedSupportAgentField = formTemplate.fields[0]?.header[0]?.fields?.find(
    field => field.field === "assigned_support_agent"
  )
  const assignedEscalationManagerField = formTemplate.fields[0]?.header[0]?.fields?.find(
    field => field.field === "assigned_escalation_manager"
  )
  const assignedHrSpecialistField = formTemplate.fields[0]?.header[0]?.fields?.find(
    field => field.field === "assigned_hr_specialist"
  )
  // let doc;
  // let targetModule;
  // let employeeDoc;
  // switch(formTemplate.module){
  //   case "onboardings":
  //     doc = await Onboardings.findById(assignedAgentField.fk_id);
  //     employeeDoc = await Users.findById(doc.user_id);
  //     targetModule= "onboardings"
  //     break;
  //   case "renewals":
  //     doc = await Renewals.findById(assignedAgentField.fk_id);
  //     employeeDoc = await Users.findById(doc.user_id);
  //     await updateInsuranceAgentByModel("renewals", selectedInsuranceAgent._id, employeeDoc._id );
  //   break;
  //   case "offboardings":
  //     doc = await Offboardings.findById(assignedAgentField.fk_id);
  //     employeeDoc = await Users.findById(doc.user_id);
  //     await updateInsuranceAgentByModel("offboardings", selectedInsuranceAgent._id, employeeDoc._id );
  //     break;
  //   default:
  //     console.log("Invalid module");
  // }
  // if(assignedSupportAgentField && assignedSupportAgentField.value && typeof assignedSupportAgentField.value =="string" && assignedSupportAgentField.value.trim !=="") {
  //   await updateUtilityRolesByModule(targetModule, assignedSupportAgentField.value, assignedSupportAgentField.fk_id);
  // }

  if (assignedAgentField && assignedAgentField.value && typeof assignedAgentField.value === "string" && assignedAgentField.value.trim() !== "") {
    const insuranceAgents = await getInsuranceAgents();
    
    if (insuranceAgents?.data?.length > 0) {
      const selectedInsuranceAgent = insuranceAgents.data.find(
        agent => agent._id === assignedAgentField.value
      );

      const emailTemplt = await emailTemplateService.getEmailTemplateByName({ templateName: 'Notify Assigned Insurance Agent' });
      let dbDoc;
      let userDetails;
      console.log(formTemplate.module, "the module->");
      switch (formTemplate.module) {
        case "onboardings":
          dbDoc = await Onboardings.findById(assignedAgentField.fk_id);
          userDetails = await Users.findById(dbDoc.user_id);
          await updateInsuranceAgentByModel("users", selectedInsuranceAgent._id,  userDetails._id);
          break;
        case "renewals":
          dbDoc = await Renewals.findById(assignedAgentField.fk_id);
          userDetails = await Users.findById(dbDoc.user_id);
          await updateInsuranceAgentByModel("renewals", selectedInsuranceAgent._id, userDetails._id );
        break;
        case "offboardings":
          dbDoc = await Offboardings.findById(assignedAgentField.fk_id);
          userDetails = await Users.findById(dbDoc.user_id);
          await updateInsuranceAgentByModel("offboardings", selectedInsuranceAgent._id, userDetails._id );
          break;
        default:
          console.log("Invalid module");
      }

      if (userDetails) {
        const companyDoc = await Companies.findById(userDetails.company_id)

        emailTemplt.content = emailTemplt.content.replace('[assigned_insurance_agent]', selectedInsuranceAgent?.full_name);
        emailTemplt.content = emailTemplt.content.replace('[employee_first_name]', userDetails?.first_name);
        emailTemplt.content = emailTemplt.content.replace('[employee_last_name]', userDetails?.last_name);
        emailTemplt.content = emailTemplt.content.replace('[employee_email]', userDetails?.email);
        emailTemplt.content = emailTemplt.content.replace('[company_name]', companyDoc?.company_name);
        emailTemplt.content = emailTemplt.content.replace('[employment_type]', userDetails?.employment.employment_type);
        emailTemplt.content = emailTemplt.content.replace('[visa_sponsor_type]', userDetails?.employment.visa_sponsor_type);
        // do not send email for employees on mission visa
        if(userDetails.employment.employment_type !== "Mission Visa (3 Months Single Entry)"){
          await sendRawEmail(selectedInsuranceAgent.email, emailTemplt.subject, emailTemplt.content, [], [] );
        }
      }
    }
  }
};


const getFilledForm = async (formdata) => {
 try {
  let formTemplate = await FormTemplate.findOne({ _id: formdata._id })
  // console.log(formTemplate.module, "the form template module")
  const confResult = await Configurations.findOne({}).select({ 'module_relations': 1 })
  const relations = confResult.module_relations
  let form = {
    fields: []
  }
  form['foreign_id'] = formTemplate.module_id
  let replaceKeys = formTemplate.fields.map(element => element.header.map(headerelement => headerelement.fields)).flat(2);
  let count=0;
  for (let i = 0; i < replaceKeys.length; i++) {
    const element = replaceKeys[i];
    if (element.collection == formTemplate.module) {
      form.fields.push(
        {
          connection_type: "default",
          module: formTemplate.module,
          foreign_id: "",
          primiary_connection: "",
          value: "",
          field: element.field

        }
      )
    }
    else {
      form.fields.push(
        {
          connection_type: "primary",
          module: element.collection,
          foreign_id: relations.filter(a => { return a.module == formTemplate.module && a.foreign_module == element.collection })[0].foreign_key,
          primiary_connection: "",
          value: "",
          field: element.field

        }
      )
    }
  }
  form['foreign_id'] = formdata.foreign_id
  const model = require(`../models/${formTemplate.module}.model`)
  let query = await generateGetQuery(form, formTemplate.module)
  let data = await model.aggregate(query)
  let result = data[0]
  let itemCount=0
  for (let index = 0; index < formTemplate.fields.length; index++) {
    for (let i = 0; i < formTemplate.fields[index].header.length; i++) {
      for (let j = 0; j < formTemplate.fields[index].header[i].fields.length; j++) {
        const element = formTemplate.fields[index].header[i].fields[j];
        itemCount+=1;
        console.log("starting count============")
        if (element && element.item && typeof element.item == 'string') {
          element.item = await getDropdownItems(element.item)
          console.log(itemCount, "-->",element.item)
        }
        let project = {};
        project[element.field] = 1;
        moduleName = element.collection
        let getDoc = result[moduleName]
        element.fk_id = getDoc._id
        let nestedFieldValue = _.get(getDoc, element.field);
        let fieldValue
        fieldValue = nestedFieldValue;
        if (Array.isArray(fieldValue)) {
          fieldValue = fieldValue.join(', ');
        }
        element.value = fieldValue
      }
      // for (let j = 0; j < formTemplate.fields[index].header[i].fields.length; j++) {
      //   formTemplate.fields[index].header[i].fields[j]["value"] = data[0][formTemplate.fields[index].header[i].fields[j]['collection']][formTemplate.fields[index].header[i].fields[j]["field"]]
      // }
    }
  }
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Data Found")
  }
  // ====================================================================================================
  /**
   * The block of code below is meant to remove specific objects from fill form
   * This is effected based on the employment visa sponsor type of employees
   * If EES (Abu Dhabi), medical test center and Tawjeeh Test Locations are removed from this object.
   */
  // ====================================================================================================
  
  const module = formTemplate.module;
  let user ={};
  // console.log(module, "this is the module", formdata.foreign_id)
  switch (module.toLowerCase()) {
    case 'onboardings':
      const onboardingDoc = await Onboardings.findById(formdata.foreign_id);
      if (!onboardingDoc) throw new Error(`Could not find onboarding document with the provided id`);
      user = await Users.findById(onboardingDoc.user_id);
      if (!user) throw new Error(`Could not find user with the provided id`);

      if (user.employment.visa_sponsor_type == 'Executive Employment Services') {
        // Get the fields array of the first header
      let fieldsArray = formTemplate.fields[0].header[0].fields;
      
      // Filter out the "Medical Test Location"
      formTemplate.fields[0].header[0].fields = fieldsArray.filter(field => field.label !== "Medical Test Location");

      // If you also want to remove EID Center and Twajee Center, you can do the same:
      formTemplate.fields[0].header[0].fields = formTemplate.fields[0].header[0].fields.filter(field => 
        field.label !== "Medical Test Location"
      );
      }
      break;
      case 'renewals':
      const renewalDoc = await Renewals.findById(formdata.foreign_id);
      if(renewalDoc){
        user = await Users.findById(renewalDoc.user_id);
      }
      case 'offboardings':
        const offboardingDoc = await Offboardings.findById(formdata.foreign_id)
        if(offboardingDoc){
          // console.log("found the offboarding document")
          user = await Users.findById(offboardingDoc.user_id);
        }
      break;
  }
  // console.log(user?._id, "this is the user id from get filled form")
  // Get insurance agents
  const insuranceAgents = await getInsuranceAgents();

  let reconstructedData = insuranceAgents.data.map((agent) => ({
    key: agent.full_name,
    value: agent._id,
    email:agent.email
  }));
  // console.log(user.employment, "this is the isers employment object")
    if(user.employment.employment_type == 'Mission Visa (3 Months Single Entry)'){
     reconstructedData = [{ key: 'Not Applicable', value: 'Not Applicable', email: 'Not Applicable' }];
    }
  switch (formTemplate.module) {
    case "onboardings":
         formTemplate.fields[0].header[0].fields.push({
        label: "Assigned Insurance Agent",
        field: "assigned_insurance_agent",
        collection: "onboardings",
        fk_id: formdata.foreign_id,
        field_type: "select",
        required: false,
        item: reconstructedData,
      });
      break;
  
    case "renewals":
      formTemplate.fields[0].header[0].fields.push({
        label: "Assigned Insurance Agent",
        field: "assigned_insurance_agent",
        collection: "renewals",
        fk_id: formdata.foreign_id,
        field_type: "select",
        required: false,
        item: reconstructedData,
      });
      break;

    case "offboardings":
      formTemplate.fields[0].header[0].fields.push({
        label: "Assigned Insurance Agent",
        field: "assigned_insurance_agent",
        collection: "offboardings",
        fk_id: formdata.foreign_id,
        field_type: "select",
        required: false,
        item: reconstructedData,
      });
      break;
  
    default:
      console.log("No action");
  }
 
  
  // formTemplate.fields[0].header[0].fields.push(
  //   {
  //     "label": "Assigned Insurance Agent",
  //     "field": "assigned_insurance_agent",
  //     "collection": "onboardings",
  //     "fk_id":formdata.foreign_id,
  //     "field_type": "select",
  //     "required": false,
  //     "item": reconstructedData,
  //   },
  // )
  const lastItem = formTemplate.fields[0].header[0].fields[formTemplate.fields[0].header[0].fields.length - 1];
    if (formTemplate.name == "New Visa Process PRO Form" && user.employment.employment_type === "Mission Visa (3 Months Single Entry)") {
      // console.log("this is has been approved--->")
      formTemplate.fields[0].header[0].fields = formTemplate.fields[0].header[0].fields.filter(field => field.label !== "Finger Print Date" && field.label !== "Finger Print Time");
    }
  return formTemplate;
 } catch (error){
  console.log(error, "error from get fill form");
  throw new Error(error)
 }
}


const generateGetQuery = async (form, module) => {
  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  defualtfields = form.fields.filter(a => a.connection_type == 'default')
  primaryfields = form.fields.filter(a => a.connection_type == 'primary')
  secondaryfields = form.fields.filter(a => a.connection_type == 'secondary')

  // secondary looksup collection
  let secondarylookups = []
  let filteredsecondaryfields = groupBy(secondaryfields, "module")
  for (let [collectionkey, value] of Object.entries(filteredsecondaryfields)) {
    let primiryconnectionsort = groupBy(value, "primiary_connection")
    for (let [key, value] of Object.entries(primiryconnectionsort)) {
      const element = value
      let project = {}
      for (let i = 0; i < element.length; i++) {
        const i_element = element[i];
        project[i_element.field] = `$${i_element.field}`
      }
      let lookup = {
        from: collectionkey,
        localField: element[0].foreign_id,
        foreignField: '_id',
        as: collectionkey,
        pipeline: [
          {
            '$project': project
          },
        ]
      }
      secondarylookups.push({ "collection": key, "lookup": lookup })
    }
  }

  // primary looksup collection
  let primarylookups = []

  let filteredprimaryfields = groupBy(primaryfields, "module")
  for (let [key, value] of Object.entries(filteredprimaryfields)) {
    const primaryelement = value
    let lookup = {
      from: key,
      localField: primaryelement[0].foreign_id,
      foreignField: '_id',
      as: key,
      pipeline: []
    }
    let project = {}
    for (let i = 0; i < primaryelement.length; i++) {
      const i_element = primaryelement[i];
      project[i_element.field] = `$${i_element.field}`
    }
    if (secondarylookups.filter(a => a.collection == key).length > 0) {
      for (let index = 0; index < secondarylookups.filter(a => a.collection == key).length; index++) {
        const element = secondarylookups.filter(a => a.collection == key)[index];
        lookup.pipeline.push({ $lookup: element.lookup })
        lookup.pipeline.push({ $unwind: `$${element.lookup.as}` })
        for (let [projectionkey, value] of Object.entries(element.lookup.pipeline[0]['$project'])) {
          project[projectionkey] = `$${element.lookup.as}.${projectionkey}`
        }
      }
    }
    lookup.pipeline.push({ $project: project })
    primarylookups.push(lookup)
  }

  // creating main aggregate
  let aggregate = []
  aggregate.push({
    $match: { "_id": ObjectId(form.foreign_id) }
  }
  )

  let project = {}

  for (let index = 0; index < defualtfields.length; index++) {
    const element = defualtfields[index];
    project[module + '.' + element.field] = `$${element.field}`
  }
  project[module + '.' + "_id"] = `$_id`

  if (primarylookups.length > 0) {
    for (let index = 0; index < primarylookups.length; index++) {
      const element = primarylookups[index];
      aggregate.push({ "$lookup": element })
      aggregate.push({ "$unwind": `$${element.as}` })
      for (let [projectionkey, value] of Object.entries(element.pipeline.filter(a => a.hasOwnProperty('$project'))[0]['$project'])) {
        project[element.as + '.' + projectionkey] = `$${element.as}.${projectionkey}`
      }
      project[element.as + '.' + "_id"] = `$${element.as}._id`
    }
  }
  aggregate.push({ '$project': project })
  console.log('===============start of aggregate', JSON.stringify(aggregate), '=========================aggregate result end')
  return aggregate
}


const fillForm = async (formdata) => {
  let form = formdata
  // var mongoose = require("mongoose");
  // let schema = await generateMongooseSchema(form.fields.filter(a => a.connection_type == 'default'))
  // var model = mongoose.model(form.module, schema)
  console.log(formdata, "formdata")
  const model = require(`../models/${form.module}.model`)

  let query = await generateDocumentQuery(form)

  let data = await model.aggregate(query)
  let updateArray = await generateUpdateArray(data[0], form)

  for (let index = 0; index < updateArray.length; index++) {
    const element = updateArray[index];
    var indexmodel = require(`../models/${element.module}.model`)
    await indexmodel.updateMany(element.match, { $set: element.set })
  }
  return 'OK'
}

const generateUpdateArray = async (raw, form) => {
  let updateArray = []
  let data = JSON.parse(JSON.stringify(raw))
  let flatObjArr = []
  iterate = function (obj, stack) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] == "object") {
          if (stack != undefined) iterate(obj[property], stack + '.' + property);
          else iterate(obj[property], property);
        } else {
          if (stack != undefined) {
            flatObjArr.push({ 'key': stack + '.' + property, 'value': obj[property] })
          }
          else {
            flatObjArr.push({ 'key': property, 'value': obj[property] })
          }
        }
      }
    }
  }
  iterate(data)
  let uniqIds = _.uniq(flatObjArr.map(a => a.value))
  for (let index = 0; index < uniqIds.length; index++) {
    const element = uniqIds[index];
    let keys = flatObjArr.filter(a => a.value == element)
    for (let i = 0; i < keys.length; i++) {
      const arrelement = keys[i];
      modulesplit = arrelement.key.split('.')
      let obj = {
        module: modulesplit[modulesplit.length - 2],
        match: { _id: ObjectId(arrelement.value) },
        fields: [],
        set: {}
      }
      if (modulesplit.length == 3) {
        let fields = form.fields.filter(a => { return a.connection_type == 'secondary' && a.primiary_connection == modulesplit[modulesplit.length - 3] && a.module == modulesplit[modulesplit.length - 2] })
        for (let j = 0; j < fields.length; j++) {
          const fieldelement = fields[j];
          obj.fields.push({ 'field': fieldelement.field, 'type': fieldelement.type })
          obj.set[fieldelement.field] = fieldelement.value
        }
      } else {
        let fields = form.fields.filter(a => { return a.connection_type != 'secondary' && a.module == modulesplit[modulesplit.length - 2] })
        for (let j = 0; j < fields.length; j++) {
          const fieldelement = fields[j];
          obj.fields.push({ 'field': fieldelement.field, 'type': fieldelement.type })
          obj.set[fieldelement.field] = fieldelement.value
        }
      }
      updateArray.push(obj)
    }
  }
  return updateArray
}


const generateDocumentQuery = async (form) => {

  let aggregate = [
    { $match: { _id: ObjectId(form.foreign_id) } }
  ]
  defualtfields = form.fields.filter(a => a.connection_type == 'default')
  primaryfields = form.fields.filter(a => a.connection_type == 'primary')
  secondaryfields = form.fields.filter(a => a.connection_type == 'secondary')

  let updateFields = []
  for (let index = 0; index < defualtfields.length; index++) {
    const element = defualtfields[index];
    let obj = {
      _id: form.foreign_id,
      field: element.field,
      value: element.value,
      module: element.module
    }
    updateFields.push(obj)
  }
  let secondaryproject = []
  if (secondaryfields.length > 0) {
    let primiryconnectionsort = groupBy(secondaryfields, "primiary_connection")
    for (let [key, value] of Object.entries(primiryconnectionsort)) {
      let obj = {
        'module': key,
        'project': {}
      }
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        obj.project[`${element.module}._id`] = `$${element.foreign_id}`
      }
      secondaryproject.push(obj)
    }
  }

  let project = {}
  if (primaryfields.length > 0) {
    let uniqprimary = arrayUniqueByKey(primaryfields, 'foreign_id')
    for (let index = 0; index < uniqprimary.length; index++) {
      const element = uniqprimary[index];
      project[`${element.module}._id`] = `$${element.foreign_id}`
    }
  }

  if (primaryfields.length > 0) {
    let uniqprimary = arrayUniqueByKey(primaryfields, 'module')
    for (let index = 0; index < uniqprimary.length; index++) {
      const primaryelement = uniqprimary[index]
      let lookup = {
        from: primaryelement.module,
        localField: primaryelement.foreign_id,
        foreignField: '_id',
        as: primaryelement.module,
      }
      if (secondaryproject.filter(a => a.module == primaryelement.module).length > 0) {
        lookup['pipeline'] = [{ '$project': secondaryproject.filter(a => a.module == primaryelement.module)[0].project }]
        for (let [projectionkey, value] of Object.entries(secondaryproject.filter(a => a.module == primaryelement.module)[0].project)) {
          project[`${lookup.as}.${projectionkey}`] = `$${lookup.as}.${projectionkey}`
        }
      }
      project[`${form.module}._id`] = "$_id"
      project[`_id`] = 0
      aggregate.push({ $lookup: lookup })
      aggregate.push({ $unwind: `$${primaryelement.module}` })
      aggregate.push({ $project: project })
    }
  }


  return (aggregate)
}

//Common Functions

const generateMongooseSchema = async (form) => {

  const getType = function (value) {
    if (value == 'TextField') {
      return String
    }
    else if (value == 'Link') {
      return String
    }
    else if (value == 'SingleSelection') {
      return String
    }
    else if (value == 'MultipleSelection') {
      return String
    }
    else if (value == 'Checkbox') {
      return Boolean
    }
    else if (value == 'NumberField') {
      return Number
    }
    else if (value == 'Email') {
      return String
    }
    else if (value == 'Phone') {
      return String
    }
    else if (value == 'TextArea') {
      return String
    }
    else if (value == 'RadioButton') {
      return Boolean
    }
    else if (value == 'DateField') {
      return Date
    }
    else if (value == 'TimeField') {
      return Date
    }
    else {
      return String
    }

  }
  let obj = {}
  for (let index = 0; index < form.length; index++) {
    const element = form[index];
    obj[element.field] = { type: getType(element.type) }
  }
  var mongoose = require("mongoose");
  var Schema = await new mongoose.Schema(obj, { strict: false })
  return Schema
}

const arrayUniqueByKey = function (array, key) {
  return [...new Map(array.map(item => [item[key], item])).values()]
}

var groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

module.exports = {
  getDropdownItems,
  getFilledForm,
  fillForm,
  getAllList,
  getForm,
  getAllFields,
  updateForm
}