const { ObjectId } = require('mongodb');
const { Stages } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { VisaProcess } = require('../models');
const queryService = require('./query.service');
const _ = require('lodash');

const createStages = async stageBody => {
  let newStage = new Stages(stageBody);
  return await newStage.save();
};

const stagesById = async stageId => {
  let stages = await Stages.findById({ _id: ObjectId(stageId) });
  if (!stages) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Stages');
  }
  return stages;
};

const updateStagesOnId = async (stageId, updateBody) => {
  const result = await stagesById(stageId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stages Not found');
  }
  return Stages.findOneAndUpdate({ _id: stageId }, { $set: updateBody }, { new: true });
};

const listAllStages = async () => {
  const result = await Stages.find({ is_deleted: false });
  if (result == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Stages');
  }
  return result;
};

const deleteStagesOnId = async stageId => {
  let result = await Stages.findByIdAndUpdate({ _id: ObjectId(stageId) }, { is_deleted: true });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Stage');
  }
  return result;
};

const updateUpdatedBy = async (stageId, userId) => {
  return Stages.findOneAndUpdate({ _id: stageId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (stageId, userId) => {
  return Stages.findOneAndUpdate({ _id: stageId }, { $set: { created_by: userId } });
};

const listVisaProcessStages = async (reqBody) => {
  console.log(reqBody, "the request body++++++++")
  console.log("99999999999")
  const parent_result = await Stages.find({ is_deleted: false, module: 'visaprocess', section_name: null });
  console.log(parent_result, "the parent result")
  console.log("011111111", parent_result.length)
  let parent_names = parent_result.map(a => a.stage_name);
  console.log("parent_names", parent_names);
  const result = await Stages.find({ is_deleted: false, module: 'visaprocess', section_name: { $in: parent_names } });
  console.log("02222222222", result.length)
  const stageNames = result.map(stage => stage.stage_name);
  console.log("0000033333333", stageNames.length)
  console.log("++++++++stage names",stageNames,"stage names");
  let pipeline = [
    {
      $match: {
        status: { $regex: new RegExp(stageNames.join('|'), 'i') },
        is_deleted: false
      },
    },
    {
      $lookup:{
        from:"users",
        localField:"user_id",
        foreignField:"_id",
        as:"userDetails"
      }
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        "userDetails.is_deleted": false,
        "userDetails.user_status": { $nin: ['withdrawn', 'inactive'] }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  if(reqBody.process_type){
    pipeline.unshift({
      $match: {
        process_type: reqBody.process_type,
      }
    })
  }
  if (reqBody.selected_company_id) {
    pipeline.unshift(...queryService(reqBody));
  }

  if (reqBody.selected_company_id) {
    pipeline.unshift(...queryService(reqBody));
  }
console.log(pipeline, "the pipline")
  const stageCounts = await VisaProcess.aggregate(pipeline);
  console.log("--------***********************", stageCounts.length)

  const stagesWithCounts = result.map(stage => {
    const stageCount = stageCounts.find(count => count._id.toLowerCase() === stage.stage_name.toLowerCase());
    return {
      ...stage._doc,
      count: stageCount ? stageCount.count : 0
    };
  });
  const results = _(stagesWithCounts)
    .groupBy('section_name')
    .map((platform, id) => ({
      stage_name: id,
      count: _.sumBy(platform, 'count')
    }))
    .value();
  console.log(results);
  return results;
};

// const listVisaProcessStages2 = async reqBody => {
//   const parentStages = await Stages.find({ is_deleted: false, module: 'visaprocess', section_name: null });
//   const parentNames = parentStages.map(a => a.stage_name);

//   const childStages = await Stages.find({ is_deleted: false, module: 'visaprocess', section_name: { $in: parentNames } });

//   let pipeline = [
//     {
//       $match: {
//         is_deleted: false,
//         process_type: /new visa process/i
//       }
//     },
//     {
//       $group: {
//         _id: '$status',
//         count: { $sum: 1 }
//       }
//     }
//   ];

//   if (reqBody.selected_company_id) {
//     pipeline.unshift(...queryService(reqBody));
//   }

//   const stageCounts = await VisaProcess.aggregate(pipeline);

//   const stageMap = new Map(childStages.map(stage => [stage.stage_name.toLowerCase(), stage]));

//   const stagesWithCounts = stageCounts
//     .map(count => {
//       const matchingStage =
//         stageMap.get(count._id.toLowerCase()) ||
//         Array.from(stageMap.values()).find(
//           stage =>
//             count._id.toLowerCase().includes(stage.stage_name.toLowerCase()) ||
//             stage.stage_name.toLowerCase().includes(count._id.toLowerCase())
//         );

//       if (matchingStage) {
//         return {
//           ...matchingStage._doc,
//           count: count.count
//         };
//       }
//       return null;
//     })
//     .filter(Boolean);

//   const results = _(stagesWithCounts)
//     .groupBy('section_name')
//     .map((stages, sectionName) => ({
//       stage_name: sectionName,
//       count: _.sumBy(stages, 'count'),
//       childStages: stages.map(({ stage_name, count }) => ({ stage_name, count }))
//     }))
//     .value();

//   return results;
// };

const listVisaProcessStagesOnSectionName = async (sectionName, reqBody) => {
  try {
    console.log(sectionName, "this is the name");
    let result = null;

    const queryBySectionName = {
      is_deleted: false,
      module: 'visaprocess',
      section_name: sectionName
    };

    result = await Stages.find(queryBySectionName).sort({ createdAt: 1 });

    if (result.length === 0) {
      console.log("running second condition to fetch=====================!");
      const queryByStageName = {
        is_deleted: false,
        module: 'visaprocess',
        stage_name: sectionName
      };
      result = await Stages.find(queryByStageName).sort({ createdAt: 1 });
    }

    if (result.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Stages');
    }

    const stageNames = result.map(stage => stage.stage_name);

    let pipeline = [
      {
        $match: {
          status: { $regex: new RegExp(stageNames.join('|'), 'i') },
          is_deleted: false
        }
      },
      {
      $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path:"$userDetails",
          preserveNullAndEmptyArrays:true
        }
      },
      {
        $match:{
          "userDetails.user_status": { $nin: ['withdrawn', 'inactive'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];
    if(reqBody.process_type){
      pipeline.unshift({
        $match: {
          process_type: reqBody.process_type.toLowerCase()
        }
      })
    }

    if (reqBody.selected_company_id) {
      pipeline.unshift(...queryService(reqBody));
    }

    const stageCounts = await VisaProcess.aggregate(pipeline);

    const stagesWithCounts = result.map(stage => {
      const stageCount = stageCounts.find(count => count._id.toLowerCase() === stage.stage_name.toLowerCase());
      return {
        ...stage._doc,
        count: stageCount ? stageCount.count : 0
      };
    });
   let formattedStageCounts = [];

const molOfferLetter = stagesWithCounts.find(
  stage => stage.stage_name.toLowerCase() === "mol offer letter"
);

const filteredStages = stagesWithCounts.filter(
  stage => stage.stage_name.toLowerCase() !== "mol offer letter"
);

if (molOfferLetter) {
  formattedStageCounts.push(molOfferLetter);
}

formattedStageCounts.push(...filteredStages);

return formattedStageCounts;


  } catch (error) {
    console.log(error);
    throw error;
  }
};


// const listVisaProcessStagesOnSectionNameTestOne = async (sectionName, reqBody) => {
//   const result = await Stages.find({ 
//     is_deleted: false, 
//     module: 'visaprocess', 
//     section_name: sectionName 
//   }).sort({ createdAt: 1 });

//   if (result.length === 0) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Stages');
//   }

//   const stageNames = result.map(stage => stage.stage_name);

//   let pipeline = [
//     {
//       $match: {
//         process_type: "new visa process",
//         is_deleted: false,
//       }
//     },
//     {
//       $unwind: "$processes",
//     },
//     {
//       $match: {
//         "processes.stage_name": { $in: stageNames },
//         "processes.process_status": { $ne: "completed" }
//       }
//     },
//     {
//       $group: {
//         _id: "$processes.stage_name",
//         count: { $sum: 1 }
//       }
//     }
//   ];

//   if (reqBody.selected_company_id) {
//     pipeline[0].$match.company_id = new mongoose.Types.ObjectId(reqBody.selected_company_id);
//   }

//   const stageCounts = await VisaProcess.aggregate(pipeline);

//   const stagesWithCounts = result.map(stage => {
//     const stageCount = stageCounts.find(count => count._id.toLowerCase() === stage.stage_name.toLowerCase());
//     return {
//       ...stage._doc,
//       count: stageCount ? stageCount.count : 0
//     };
//   });

//   return stagesWithCounts;
// };

module.exports = {
  createStages,
  stagesById,
  updateStagesOnId,
  listAllStages,
  deleteStagesOnId,
  updateUpdatedBy,
  updateCreatedBy,
  listVisaProcessStages,
  listVisaProcessStagesOnSectionName
};
