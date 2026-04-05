const config = require("../config/config");
const axios = require('axios');
const { Onboardings, Renewals, Users, VisaProcess, Configurations } = require("../models");
const { ObjectId } = require("mongoose");

const getInsuranceAgents = async()=>{
    try {
        const insuranceAgents = await axios.get('https://insurance-api.nathanhr.com/insurance/getinsuranceagents',{
            headers: {
              'x-api-key': config.insurance.unsurance_agents_xapi_key,
            }
          })
          return insuranceAgents;
    }catch(error){
        throw new Error(error);
    }
};

const updateInsuranceAgentByModel = async(model, insuranceAgentId, userId)=>{
  console.log("this is the print for model to check", model, "and this is the print for assigned insurance agent id", insuranceAgentId, "and this is the print for user id", userId);
  try {
    var renewalsDoc;
    var userDoc;
    userDoc = await Users.findById(userId);
    if(!userDoc) throw new Error("Could not find user with the provided id", userId);
    console.log(userDoc.first_name, "is the first name");
    const query= { user_id: userDoc._id}
    console.log(query, "the query")
    var onboardingDoc = await Onboardings.findOne(query);
    console.log(onboardingDoc?._id, "this is the onboarding id")
    switch(model){
      case "renewals":
        if(!onboardingDoc) console.log("Could not find onboarding with the provided id:", userId, "update for renewals");
       if(onboardingDoc){
        onboardingDoc.assigned_insurance_agent = insuranceAgentId;
        await onboardingDoc.save();
       }
        
        userDoc.assigned_insurance_agent = insuranceAgentId;
        await userDoc.save();
      break;

      case "onboardings":
        userDoc.assigned_insurance_agent = insuranceAgentId;
        await userDoc.save();
      break;

      case "offboardings":
        if(!onboardingDoc) console.log("Could not find onboarding with the provided id:", onboardingDoc?._id, "update for offboarding");
        if(onboardingDoc){
          onboardingDoc.assigned_insurance_agent = insuranceAgentId;
          await onboardingDoc.save();
        }
        
        userDoc.assigned_insurance_agent = insuranceAgentId;
        await userDoc.save();
        renewalsDoc = await Renewals.findOne({ user_id: userDoc._id});
        if(renewalsDoc){
          if(!onboardingDoc) console.log("Could not find onboarding with the provided id:", onboardingDoc?._id, "update for offboarding");
          if(onboardingDoc){
            onboardingDoc.assigned_insurance_agent = insuranceAgentId;
          await onboardingDoc.save();
          }
          userDoc.assigned_insurance_agent = insuranceAgentId;
          await userDoc.save();
        }
      break;

      case "users":
          userDoc.assigned_insurance_agent = insuranceAgentId;
          await userDoc.save();
      
      break;

      default:
        console.log('no action');

    }
  }catch(error){
    throw new Error(error);
  }
}

const updateChangeOfStatus = async(body)=>{
  try{
      const systemConfig = await Configurations.find({is_deleted: false}).sort({_id:-1}).limit(1);
      if(!systemConfig || systemConfig.length === 0) {throw new Error("Could not find system configuration");}
      let response;
      if(systemConfig[0].mailTrap.trap == true){
      response = await axios.post(`https://insurance-api-staging.devnhr.com/insurance/crm/updatestatuschange`, body);
      }else if(systemConfig[0].mailTrap.trap == false){
        response = await axios.post(`${config.insurancePortalUrl}insurance/crm/updatestatuschange`, body);
      }

    console.log(`response: ${response.data}`);
    return response.data;
  }catch(error){
    throw new Error(error);
  }
}

module.exports = {
  getInsuranceAgents,
  updateInsuranceAgentByModel,
  updateChangeOfStatus


};