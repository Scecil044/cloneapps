const { ObjectId } = require("mongodb");
const { smsTemplate } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const _ = require('lodash')
const { Users, Role, Companies, smss, Leads } = require('../models');
const { Configurations, Documents } = require('../models');
const moment = require('moment-timezone');

const utils = require("../../utils")



const getSMSTemplate = async (companyBody) => {

    const smsTemplate = await smsTemplate.findOne({ _id: companyBody._id })

    let content = smsTemplate.content
    if (smsTemplate) {

        let autoReplacedContent = await getReplacedTemplate(smsTemplate, content)

        smsTemplate.user_input_keys.forEach(async ele => {
            autoReplacedContent = autoReplacedContent.split(ele.key).join(ele.value);
        })

        return autoReplacedContent
    } else {
        return []
    }

}

// async function getReplacedTemplate(smsTemplate, content) {
//     let replaceKeys = smsTemplate.auto_replace_keys

//     for (let index = 0; index < replaceKeys.length; index++) {
//         const element = replaceKeys[index];
//         let project = {}
//         let DBModel
//         project[element.field] = 1

//         if (element.collection == 'users') {
//             DBModel = Users
//         } else if (element.collection == 'companies') {
//             DBModel = Companies
//         } else if (element.collection == 'leads') {
//             DBModel = Leads
//         }

//         let getDoc = await DBModel.findOne({ _id: element.fk_id }).select(project)

//         if (getDoc) {
//             content = content.split(element.key).join(getDoc ? getDoc[element.field] : element.key);

//         }

//         if (replaceKeys.length == index + 1) {
//             return content
//         }
//     }


//     // let sadf = false
//     // let grouped = _.mapValues(_.groupBy(smsTemplate.auto_replace_keys, 'collection'),
//     //     templates => templates.map(car => _.omit(car)));

//     // for (const key in grouped) {

//     //     if (Object.hasOwnProperty.call(grouped, key)) {
//     //         const element = grouped[key];

//     //         let project = {}

//     //         let DBModel

//     //         element.forEach(async (ele, index) => {
//     //             project[ele.field] = 1

//     //             if (ele.collection == 'users') {
//     //                 DBModel = Users
//     //             } else if (ele.collection == 'companies') {
//     //                 DBModel = Companies
//     //             } else if (ele.collection == 'leads') {
//     //                 DBModel = Leads
//     //             }

//     //             let getDoc = await DBModel.findOne({ _id: ele.fk_id }).select(project)
//     //             if (getDoc) {
//     //                 content = content.split(ele.key).join(getDoc ? getDoc[ele.field] : 'hadhi');
//     //                 sadf = true
//     //             }
//     //         })

//     //     }
//     // }
//     // if (sadf) return content
//     // console.log(sadf, "--", content)
// }

const addNewSMSTemplate = async (body) => {
    const newTemplate = new smsTemplate(body)
    return await newTemplate.save()
}

const listAllSMSTemplates = async () => {
    const result = await smsTemplate.find({ is_deleted: false }).select({ _id: 1, name: 1, module: 1, flag: 1 });
    if (result == []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find SMS Templates")
    }
    return result
}

const updateUpdatedBy = async (smsTempltId, userId) => {
    return smsTemplate.findOneAndUpdate({ _id: smsTempltId }, { $set: { updated_by: userId } });
}

const updateCreatedBy = async (smsTempltId, userId) => {
    return smsTemplate.findOneAndUpdate({ _id: smsTempltId }, { $set: { created_by: userId } });
}

const getSMSTemplatesOnID = async (smsTempltId) => {
    let result = await smsTemplate.findById({ "_id": ObjectId(smsTempltId) })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find SMS Template for the given ID")
    }
    return result
}

const updateSMSTemplateOnId = async (smsTempltId, updateBody) => {
    const result = await getSMSTemplatesOnID(smsTempltId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'SMS Template Not found');
    }
    return smsTemplate.findOneAndUpdate({ _id: smsTempltId }, { $set: updateBody }, { new: true });
}

const deleteSMSTemplateOnId = async (smsTempltId) => {
    let result = await smsTemplate.findByIdAndUpdate({ "_id": ObjectId(smsTempltId) }, { is_deleted: true })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete SMS Template")
    }
    return result
}

const getSMSTemplateOnIDWithoutContentArchived = async (SMSTempltCloneID, moduleID) => {
    let replacedTo = [];
    let replacedCc = [];
    let pipeline = [{
        $match: {
            _id: ObjectId(SMSTempltCloneID),
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
    let result = await smsTemplate.aggregate(pipeline);
    let smsTempt = result[0]

    if (smsTempt.to || smsTempt.cc) {
        const model = require(`../models/${smsTempt.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(moduleID) });
        let mappingArray = [];
        mappingArray.push(smsTempt.to)
        mappingArray.push(smsTempt.cc)
        for (let i = 0; i < mappingArray.length; i++) {
            const innerArray = mappingArray[i];
            await Promise.all(innerArray.map(async (value) => {
                const query = {
                    module_relations: {
                        $elemMatch: {
                            module: smsTempt.module,
                            foreign_module: value
                        }
                    }
                };
                const projection = { 'module_relations.$': 1 };
                const result = await Configurations.findOne(query, projection);
                if (result && result.module_relations && result.module_relations[0] && result.module_relations[0].foreign_key) {
                    forignKey = result.module_relations[0].foreign_key
                    const valueModel = require(`../models/${value}.model`)
                    let getSMSId = await valueModel.findOne({ _id: moduleData[forignKey] });
                    if (i === 0) {
                        replacedTo.push(getSMSId.sms)
                    } else if (i === 1) {
                        replacedCc.push(getSMSId.sms)
                    }
                } else {
                    if (i === 0) {
                        replacedTo.push(value)
                    } else if (i === 1) {
                        replacedCc.push(value)
                    }
                }
            }));
        }
    }
    smsTempt.to = replacedTo;
    smsTempt.cc = replacedCc;

    let replaceKeys = smsTempt.auto_replace_keys;
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        const model = require(`../models/${smsTempt.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(moduleID) });

        let DBModel = require(`../models/${element.collection}.model`)
        const query = {
            module_relations: {
                $elemMatch: {
                    module: smsTempt.module,
                    foreign_module: element.collection
                }
            }
        };
        const projection = { 'module_relations': 1 };
        const result = await Configurations.findOne(query, projection);

        forignKey = result.module_relations[0].foreign_key
        element.fk_id = moduleData[forignKey]

        let getSMSTmplt = await DBModel.findOne({ _id: element.fk_id }).select(project);
        let str = element.key;
        let updatedArr = [str.slice(1, -1)];
        let fieldValue
        if (getSMSTmplt && getSMSTmplt[element.field] && getSMSTmplt[element.field][updatedArr]) {
            fieldValue = getSMSTmplt ? getSMSTmplt[element.field][updatedArr] : '';
        } else {
            fieldValue = getSMSTmplt ? getSMSTmplt[element.field] : '';
        }
        element.value = fieldValue
        if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ');
        }
    }

    let autoReplacedContent = await getReplacedTemplate(moduleID, smsTempt, smsTempt.content)
    const updatedTemplate = {
        _id: smsTempt._id,
        to: smsTempt.to,
        cc: smsTempt.cc,
        subject: smsTempt.subject,
        name: smsTempt.name,
        user_input_keys: smsTempt.user_input_keys,
        autoReplacedContent: autoReplacedContent
    };
    return updatedTemplate
}

const getSMSTemplateOnIDWithoutContent = async (SMSTempltCloneID, moduleID) => {
    let replacedTo = [];
    let replacedCc = [];
    let pipeline = [{
        $match: {
            _id: ObjectId(SMSTempltCloneID),
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
    let result = await smsTemplate.aggregate(pipeline);
    let smsTempt = result[0]

    if (smsTempt.to || smsTempt.cc) {
        const confResult = await Configurations.findOne({}).select({ 'module_relations': 1 })
        const relations = confResult.module_relations
        let form = {
            fields: []
        }
        form['foreign_id'] = moduleID
        let replaceKeys = smsTempt.auto_replace_keys
        for (let i = 0; i < replaceKeys.length; i++) {
            const element = replaceKeys[i];
            if (element.collection == smsTempt.module) {
                form.fields.push(
                    {
                        connection_type: "default",
                        module: smsTempt.module,
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
                        foreign_id: relations.filter(a => { return a.module == smsTempt.module && a.foreign_module == element.collection })[0].foreign_key,
                        primiary_connection: "",
                        value: "",
                        field: element.field
                    }
                )
            }
        }
        const regexExp = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/gi;
        var smsarray = smsTempt.to.concat(smsTempt.cc)
        for (let index = 0; index < smsarray.length; index++) {
            const element = smsarray[index];
            if (element && element != '' && !regexExp.test(element)) {
                let foreignElementId = relations.filter(a => { return a.module == smsTempt.module && a.foreign_module == element })
                if (foreignElementId && foreignElementId[0] && foreignElementId[0].foreign_key) {
                    form.fields.push({
                        connection_type: "primary",
                        module: element,
                        foreign_id: relations.filter(a => { return a.module == smsTempt.module && a.foreign_module == element })[0].foreign_key,
                        primiary_connection: "",
                        value: "",
                        field: element == 'users' ? 'personal.phone' : 'phone'
                    })
                }
            }
        }

        ticketingDateFormatter = function (value) {
            if (value) {
                return moment(String(value)).format('MMM DD, YYYY')
            }
        }
        const model = require(`../models/${smsTempt.module}.model`)
        let query = await generateGetQuery(form, smsTempt.module)
        let data = await model.aggregate(query)
        let result = data[0]
        let returnObj = {
            to: [],
            cc: [],
            content: [],
            subject: smsTempt.subject,
            name: smsTempt.name,
            add_attachments: smsTempt.add_attachments,
        }
        for (let index = 0; index < smsTempt.to.length; index++) {
            const element = smsTempt.to[index];
            if (element && element != '' && !regexExp.test(element) && (result && result[element] && result[element].personal.phone)) {
                returnObj.to.push(result[element].personal.phone)
            }
            else {
                returnObj.to.push(element)
            }
        }
        for (let index = 0; index < smsTempt.cc.length; index++) {
            const element = smsTempt.cc[index];
            if (element && element != '' && !regexExp.test(element) && (result && result[element] && result[element].sms)) {
                returnObj.cc.push(result[element].sms)
            }
            else {
                returnObj.cc.push(element)
            }
        }
        returnObj.content = smsTempt.content.toString();
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        }

        for (let i = 0; i < replaceKeys.length; i++) {
            const element = replaceKeys[i];
            returnObj.content = replaceAll(returnObj.content, element.key, result[element.collection][element.field])
        }
        let user_id = await model.findOne({ _id: ObjectId(moduleID) }).select({ 'user_id': 1 })
        eVisa = await Documents.findOne({ type: ObjectId('64db904b987bf13670b42980'), module: "visa process", "foreign_id": ObjectId(user_id), "expiry": { $exists: true }, "expiry": { $ne: "" } }).select({ 'expiry': 1 })
        if (eVisa) {
            returnObj.content = returnObj.content.replace("evisExpiry", ticketingDateFormatter(new Date(eVisa.expiry)))
        } else {
            returnObj.content = returnObj.content.replace("evisExpiry", "")
        }
        if (!data) {
            throw new ApiError(httpStatus.NOT_FOUND, "No Data Found")
        }
        return returnObj
    }
    else {
        throw new ApiError(httpStatus.NOT_FOUND, "No Data Found")
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
            from: key == 'pro' ? 'users' : key,
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
    if (primarylookups.length > 0) {
        for (let index = 0; index < primarylookups.length; index++) {
            const element = primarylookups[index];
            aggregate.push({ "$lookup": element })
            aggregate.push({ "$unwind": `$${element.as}` })
            for (let [projectionkey, value] of Object.entries(element.pipeline.filter(a => a.hasOwnProperty('$project'))[0]['$project'])) {
                project[element.as + '.' + projectionkey] = `$${element.as}.${projectionkey}`
            }
        }
    }
    aggregate.push({ '$project': project })

    return aggregate
}


async function getReplacedTemplate(moduleID, smsTempt, content) {
    let replaceKeys = smsTempt.auto_replace_keys;
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        const model = require(`../models/${smsTempt.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(moduleID) });

        let DBModel = require(`../models/${element.collection}.model`)
        const query = {
            module_relations: {
                $elemMatch: {
                    module: smsTempt.module,
                    foreign_module: element.collection
                }
            }
        };
        const projection = { 'module_relations.$': 1 };
        const result = await Configurations.findOne(query, projection);

        forignKey = result.module_relations[0].foreign_key
        element.fk_id = moduleData[forignKey]

        let getDoc = await DBModel.findOne({ _id: element.fk_id }).select(project);
        let str = element.key;
        let updatedArr = [str.slice(1, -1)];
        let fieldValue
        if (getDoc && getDoc[element.field] && getDoc[element.field][updatedArr]) {
            fieldValue = getDoc ? getDoc[element.field][updatedArr] : '';
        } else {
            fieldValue = getDoc ? getDoc[element.field] : '';
        }
        if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ');
        }
        element.value = fieldValue
        content = content.replace(element.key, fieldValue);

        if (replaceKeys.length == index + 1) {
            return content;
        }
    }
}


const smsSend = async(body) => {
    const token = await utils.generateSmsToken()
    console.log(token , "token")
    console.log(body , "Body")

    const result = utils.smsSendProvider(body.to , body.content, token)

    return "Send Success fully"
    
}

module.exports = {
    getSMSTemplate,
    addNewSMSTemplate,
    listAllSMSTemplates,
    updateUpdatedBy,
    updateCreatedBy,
    getSMSTemplatesOnID,
    updateSMSTemplateOnId,
    deleteSMSTemplateOnId,
    getSMSTemplateOnIDWithoutContent, 
    smsSend
}