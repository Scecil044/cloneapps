const { SmsNotifications } = require("../models")


const createSms = async (reqBody) => {
    let sms = new SmsNotifications(reqBody)
    return await sms.save()
}

const updateSms = async (reqBody)=>{
//    console.log(reqBody , "reqBody")
   return await SmsNotifications.findOneAndUpdate({_id : reqBody._id} , {$set : reqBody})
}

const deleteSms = async (id)=>{
    return await SmsNotifications.findOneAndUpdate({_id : id} , {$set : { is_deleted : true }})
}


const getAllSms = async () => {
    const result = await SmsNotifications.find({is_deleted : false})
    return result
}

const getSmsById = async (id) => {
    const result = await SmsNotifications.findOne({_id : id})
    return result
}


module.exports = {
    createSms, 
    updateSms, 
    deleteSms, 
    getAllSms, 
    getSmsById
}