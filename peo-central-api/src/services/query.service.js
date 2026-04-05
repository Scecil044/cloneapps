const { ObjectId } = require("mongodb");

// module.exports = function(userBody) {
//     return [
//       {
//         $match: { company_id: ObjectId(userBody.company_id) }
//       }
//     ];
//   };

module.exports = function (userBody) {
  const companyIdArray = userBody.selected_company_id.map(id => ObjectId(id));

  if(!userBody.isCreditFilter || userBody.userFilter || userBody.visaProcessFilter || userBody.onboardingFilter){
    return [
      {
        $match: { company_id: { $in: companyIdArray } }
      }
    ];
  }else{
    return [
      {
        $match: { customer: { $in: companyIdArray } }
      }
    ];
  }
};