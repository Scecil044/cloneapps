const { EmailTemplateClone } = require('../models')
const { ObjectId } = require("mongodb");
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const { Configurations } = require('../models');

const createEmailTemplateClone = async (reqBody) => {
    let newResult = new EmailTemplateClone(reqBody)
    return await newResult.save()
}

const getEmailTemplateCloneById = async (cloneID) => {
    let result = await EmailTemplateClone.findById({ "_id": ObjectId(cloneID) })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Template")
    }
    return result
}

const updateEmailTemplateCloneOnId = async (cloneID, updateTemplateBody) => {
    const result = await getEmailTemplateCloneById(cloneID);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Email Template Not found');
    }
    return EmailTemplateClone.findOneAndUpdate({ _id: cloneID }, { $set: updateTemplateBody }, { new: true });
}

const listAllEmailTemplateClone = async (page, limit) => {
    const result = await EmailTemplateClone.find({ is_deleted: false });
    if (result.length == 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Email Template")
    }
    return result
}

const deleteEmailTemplateClone = async (cloneID) =>{
    let result = await EmailTemplateClone.findByIdAndUpdate({"_id":ObjectId(cloneID)},{is_deleted:true})
    if(!result){
        throw new ApiError(httpStatus.NOT_FOUND,"Cannot delete Data")
    }
    return result
}

const getEmailTemplateOnIDWithoutContent = async (EmailTempltCloneID) => {
    let replacedTo = [];
    let replacedCc = [];
    let pipeline = [{
        $match: {
            _id: ObjectId(EmailTempltCloneID),
            is_deleted: false
        }
    },
    {
        $project: {
            content: 0,
            is_deleted: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0
        }
    }];
    let result = await EmailTemplateClone.aggregate(pipeline);
    let emailTemplate = result[0]

    if(emailTemplate.to || emailTemplate.cc) {
        const model = require(`../models/${emailTemplate.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(emailTemplate.module_id) });
        emailTemplate.to = await Promise.all(emailTemplate.to.map(async (value) => {
            const query = {
                module_relations: {
                    $elemMatch: {
                        module: emailTemplate.module,
                        foreign_module: value
                    }
                }
            };
            const projection = { 'module_relations.$': 1 };
            const result = await Configurations.findOne(query, projection);
            if(result && result.module_relations && result.module_relations[0] && result.module_relations[0].foreign_key) {
                forignKey = result.module_relations[0].foreign_key
                const valueModel = require(`../models/${value}.model`)
                let getEmailId = await valueModel.findOne({ _id: moduleData[forignKey] });
                replacedTo.push(getEmailId.email)
            } else {
                replacedTo.push(value)
            }
          }));

          emailTemplate.cc = await Promise.all(emailTemplate.cc.map(async (value) => {
            const query = {
                module_relations: {
                    $elemMatch: {
                        module: emailTemplate.module,
                        foreign_module: value
                    }
                }
            };
            const projection = { 'module_relations.$': 1 };
            const result = await Configurations.findOne(query, projection);
            if(result && result.module_relations && result.module_relations[0] && result.module_relations[0].foreign_key) {
                forignKey = result.module_relations[0].foreign_key
                const valueModel = require(`../models/${value}.model`)
                let getEmailId = await valueModel.findOne({ _id: moduleData[forignKey] });
                replacedCc.push(getEmailId.email)
            } else {
                replacedCc.push(value)
            }
          }));
    }
    emailTemplate.to = replacedTo;
    emailTemplate.cc = replacedCc;

    let replaceKeys = emailTemplate.auto_replace_keys;
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        const model = require(`../models/${emailTemplate.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(emailTemplate.module_id) });

        let DBModel = require(`../models/${element.collection}.model`)
        const query = {
            module_relations: {
                $elemMatch: {
                    module: emailTemplate.module,
                    foreign_module: element.collection
                }
            }
        };
        const projection = { 'module_relations.$': 1 };
        const result = await Configurations.findOne(query, projection);

        forignKey = result.module_relations[0].foreign_key
        element.fk_id = moduleData[forignKey]

        let getEmailTmplt = await DBModel.findOne({ _id: element.fk_id }).select(project);
        let str = element.key;
        let updatedArr = [str.slice(1, -1)];
        let fieldValue
        if (getEmailTmplt && getEmailTmplt[element.field] && getEmailTmplt[element.field][updatedArr]) {
            fieldValue = getEmailTmplt ? getEmailTmplt[element.field][updatedArr] : '';
        } else {
            fieldValue = getEmailTmplt ? getEmailTmplt[element.field] : '';
        }
        element.value = fieldValue
        if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ');
        }
    }
    return emailTemplate
}

const getEmailTemplate = async (EmailTempltCloneID, reqBody) => {
    const emailTemplate = await EmailTemplateClone.findOne({ _id: EmailTempltCloneID })
    let content = emailTemplate.content
    let replacedTo = [];
    let replacedCc = [];
    if (emailTemplate) {
        const model = require(`../models/${emailTemplate.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(emailTemplate.module_id) });
        if(emailTemplate.to || emailTemplate.cc) {
            emailTemplate.to = await Promise.all(emailTemplate.to.map(async (value) => {
                const query = {
                    module_relations: {
                        $elemMatch: {
                            module: emailTemplate.module,
                            foreign_module: value
                        }
                    }
                };
                const projection = { 'module_relations.$': 1 };
                const result = await Configurations.findOne(query, projection);
                if(result && result.module_relations && result.module_relations[0] && result.module_relations[0].foreign_key) {
                    forignKey = result.module_relations[0].foreign_key
                    const valueModel = require(`../models/${value}.model`)
                    let getEmailId = await valueModel.findOne({ _id: moduleData[forignKey] });
                    replacedTo.push(getEmailId.email)
                } else {
                    replacedTo.push(value)
                }
              }));

              emailTemplate.cc = await Promise.all(emailTemplate.cc.map(async (value) => {
                const query = {
                    module_relations: {
                        $elemMatch: {
                            module: emailTemplate.module,
                            foreign_module: value
                        }
                    }
                };
                const projection = { 'module_relations.$': 1 };
                const result = await Configurations.findOne(query, projection);
                if(result && result.module_relations && result.module_relations[0] && result.module_relations[0].foreign_key) {
                    forignKey = result.module_relations[0].foreign_key
                    const valueModel = require(`../models/${value}.model`)
                    let getEmailId = await valueModel.findOne({ _id: moduleData[forignKey] });
                    replacedCc.push(getEmailId.email)
                } else {
                    replacedCc.push(value)
                }
              }));
        }
        emailTemplate.to = replacedTo;
        emailTemplate.cc = replacedCc;
        await EmailTemplateClone.updateOne({ _id: EmailTempltCloneID }, { $set: { to: emailTemplate.to, cc: emailTemplate.cc } }, { new: true })

        emailTemplate.auto_replace_keys.forEach(async element => {
            let key = element.key;
            key = key.slice(1, -1)
            if (reqBody[key]) {
                let DBModel = require(`../models/${element.collection}.model`)
                const query = {
                    module_relations: {
                        $elemMatch: {
                            module: emailTemplate.module,
                            foreign_module: element.collection
                        }
                    }
                };
                const projection = { 'module_relations.$': 1 };
                const result = await Configurations.findOne(query, projection);
                forignKey = result.module_relations[0].foreign_key
                element.fk_id = moduleData[forignKey]
                await DBModel.updateOne({ _id: ObjectId(element.fk_id) }, { $set: reqBody })
            } else {
                // console.log("NO---------");
            }
        });

        let autoReplacedContent = await getReplacedTemplate(emailTemplate, content, reqBody)

        emailTemplate.user_input_keys.forEach(async ele => {
            let key = ele.key;
            key = key.slice(1, -1)
            if (reqBody[key]) {
                autoReplacedContent = autoReplacedContent.split(ele.key).join(reqBody[key]);
                ele.value = reqBody[key];
            } else {
                autoReplacedContent = autoReplacedContent.split(ele.key).join(ele.value);
            }
        })
        await EmailTemplateClone.updateOne({ _id: EmailTempltCloneID }, { $set: { user_input_keys: emailTemplate.user_input_keys } }, { new: true })
        const Template = await EmailTemplateClone.findOne({ _id: EmailTempltCloneID })
        const updatedTemplate = {
            ...Template.toObject(),
            autoReplacedContent: autoReplacedContent
        };
        return updatedTemplate;
    } else {
        return []
    }
}

async function getReplacedTemplate(emailTemplate, content) {
    let replaceKeys = emailTemplate.auto_replace_keys;
    for (let index = 0; index < replaceKeys.length; index++) {
        const element = replaceKeys[index];
        let project = {};
        project[element.field] = 1;
        const model = require(`../models/${emailTemplate.module}.model`)
        let moduleData = await model.findOne({ _id: ObjectId(emailTemplate.module_id) });

        let DBModel = require(`../models/${element.collection}.model`)
        const query = {
            module_relations: {
                $elemMatch: {
                    module: emailTemplate.module,
                    foreign_module: element.collection
                }
            }
        };
        const projection = { 'module_relations.$': 1 };
        const result = await Configurations.findOne(query, projection);

        forignKey = result.module_relations[0].foreign_key
        element.fk_id = moduleData[forignKey]

        let getEmailTmplt = await DBModel.findOne({ _id: element.fk_id }).select(project);
        let str = element.key;
        let updatedArr = [str.slice(1, -1)];
        let fieldValue
        if (getEmailTmplt && getEmailTmplt[element.field] && getEmailTmplt[element.field][updatedArr]) {
            fieldValue = getEmailTmplt ? getEmailTmplt[element.field][updatedArr] : '';
        } else {
            fieldValue = getEmailTmplt ? getEmailTmplt[element.field] : '';
        }
        if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(', ');
        }
        element.value = fieldValue
        content = content.replace(element.key, fieldValue);

        if (replaceKeys.length == index + 1) {
            await EmailTemplateClone.updateOne({ _id: emailTemplate._id }, { $set: { auto_replace_keys: replaceKeys } }, { new: true })
            return content;
        }
    }
}

module.exports = {
    createEmailTemplateClone,
    getEmailTemplateCloneById,
    updateEmailTemplateCloneOnId,
    listAllEmailTemplateClone,
    deleteEmailTemplateClone,
    getEmailTemplateOnIDWithoutContent,
    getEmailTemplate
}
