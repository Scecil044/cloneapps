const express = require('express');
const router = express.Router();
/**
 * Get all models
 */
const ReportBuilderModel = require('../../models/reportbuilder');
const UsersModel = require('../../models/users.model');
// const TasksModel = require('../models/tasks
// const ProjectsModel = require('../models/projects')
// const FixedSalaryLog = require('../models/fixedsalarylog')
const CompaniesModel = require('../../models/companies.model');
const RolesModel = require('../../models/roles.model');
// const PayslipsModel = require('../models/payslips')
// const PayrollModel = require('../models/payroll')
// const PayrollProcessModel = require('../models/payrollprocess')
// const RecursiveModel = require('../models/recursive')
const RequestsModel = require('../../models/requests');
// const TicketingModel = require('../models/ticketing')
// const LoggingModel = require('../models/logging')
// const SettingsModel = require('../models/settings')
const LeavesModel = require('../../models/leaves');
// const AttendanceModel = require('../models/attendance')
// const OnboardingModel = require('../models/onboardings')
// const SurveysModel = require('../models/survey')
const ConfigurationModel = require('../../models/configuration.model');
// const TodolistModel = require('../models/todolist')
const SocialsModel = require('../../models/socials');
// const ShiftsModel = require('../../models/shifts');

/**
 * * GET COLLECTIONS AND ITS OBJECTS
 */

router.get('/collections', async (req, res) => {
  /**
   * Loop all the models available for this client
   *  then get all object keys
   */
  // By findOne, we get an entry with all the objects and sub objects keys
  const leaves = await LeavesModel.findOne();
  const roles = await RolesModel.findOne();
  const tasks = await TasksModel.findOne();
  const requests = await RequestsModel.findOne();
  const users = await UsersModel.findOne();
  const projects = await ProjectsModel.findOne();
  const fixedsalarylog = await FixedSalaryLog.findOne();
  const companies = await CompaniesModel.findOne();
  const payslips = await PayslipsModel.findOne();
  const payroll = await PayrollModel.findOne();
  const payrollprocess = await PayrollProcessModel.findOne();
  const recursive = await RecursiveModel.findOne();
  const ticketing = await TicketingModel.findOne();
  const logging = await LoggingModel.findOne();
  const attendance = await AttendanceModel.findOne();
  const onboardings = await OnboardingModel.findOne();
  const survey = await SurveysModel.findOne();
  const configuration = await ConfigurationModel.findOne();
  const todolist = await TodolistModel.findOne();
  const socials = await SocialsModel.findOne();
  // const shifts = await ShiftsModel.findOne();
  const settings = await SettingsModel.findOne();
  console.log(
    leaves != null,
    '--',
    roles != null,
    '--',
    tasks != null,
    '--',
    requests != null,
    '--',
    users != null,
    '--',
    projects != null,
    '--',
    fixedsalarylog != null,
    '--',
    companies != null,
    '--',
    payslips != null,
    '--',
    payroll != null,
    '--',
    payrollprocess != null,
    '--',
    onboardings != null,
    '--',
    survey != null,
    '--',
    configuration != null,
    '--',
    todolist != null,
    '--',
    socials != null,
    '--',
    shifts != null,
    '--',
    settings != null
  );
  const modelList = [
    { attendance },
    { companies },
    { configuration },
    { fixedsalarylog },
    { leaves },
    { logging },
    { onboardings },
    { payroll },
    { payrollprocess },
    { payslips },
    { projects },
    { recursive },
    { requests },
    { roles },
    // { settings },
    { shifts },
    { socials },
    // { survey },
    { tasks },
    { ticketing },
    { todolist },
    { users },
  ];

  let modelData = [];
  modelList.map((modelItem) => {
    const collectionName = Object.keys(modelItem)[0];
    const modelObject = modelItem[collectionName];
    if (modelObject == null) {
      return;
    }
    let data = JSON.parse(JSON.stringify(modelObject._doc));
    let container = [];

    for (const item in data) {
      const value = data[item];
      const isArray = Array.isArray(value);
      const dataType = isArray ? 'array' : typeof value;
      const isObject = dataType === 'object';
      // We don't want to return these fields
      if (['password', 'tokens', '__v', 'unique_token'].includes(item)) {
        continue;
      }
      let collectionData = {
        field: item,
        type: dataType,
        secondLevelObjects: [], // first level objects under schema (declared in models)
        secondLevelArray: [], // first level keys that are array, not an object
        thirdLevelObjects: {}, //for second level with child objects
        thirdLevelArray: {}, // if second level keys that are array type
      };
      if (isObject) {
        // second level with child objects
        const keys = Object.keys(value);
        collectionData = {
          ...collectionData,
          secondLevelObjects: keys,
        };
        let thirdLevelObjects = {};
        let thirdLevelArray = {};
        keys.map((key) => {
          // Check if the second level is an object or array
          const obj = value[key];
          const type = Array.isArray(obj) ? 'array' : typeof obj;
          if (type === 'object') {
            thirdLevelObjects = {
              ...thirdLevelObjects,
              [key]: Object.keys(obj),
            };
          } else if (type === 'array') {
            // if a second  thirdlevelArray
            const firstItem = obj[0];
            if (typeof firstItem === 'object') {
              // second_level_item: [...keys]
              const keys = Object.keys(firstItem);
              // [key] means the parent object that's listed in secondLevelObjects
              thirdLevelArray = {
                ...thirdLevelArray,
                [key]: keys,
              };
            }
          }
        });
        // Add the thirdlevel object and array keys
        collectionData = {
          ...collectionData,
          thirdLevelObjects: thirdLevelObjects,
          thirdLevelArray: thirdLevelArray,
        };
      } else if (isArray) {
        const firstItem = value[0];
        if (typeof firstItem === 'object') {
          const keys = Object.keys(firstItem);
          collectionData = {
            ...collectionData,
            secondLevelArray: keys,
          };
        }
      }
      container = [...container, collectionData];
    }
    const newObj = {
      collection: collectionName,
      objects: container.sort((a, b) => (a.field > b.field ? 1 : -1)),
    };
    modelData = [...modelData, newObj];
  });
  res.send(modelData);
});

// Getting all reports report
router.get('/all', async (req, res) => {
  try {
    // const report = await ReportBuilderModel.find({}).sort({created_date: -1})
    const report = await ReportBuilderModel.find({});
    res.status(200).json({
      report,
      message: 'Successfully fetched',
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get specific fields from collection, to match ids and cross collection
 */
router.get('/collection', async (req, res) => {
  //  Reqs params
  const id = req.params._id;
  if (req.query.fields) {
    let { fields, model } = req.query;
    // Get the fields we only want to get from the collection
    let results = {};
    fields = fields.split(',').reduce((acc, item) => {
      acc = {
        ...acc,
        [item]: 1,
      };
      return acc;
    }, {});
    const modelInstance = {
      users: UsersModel,
      companies: CompaniesModel,
      roles: RolesModel,
      tasks: TasksModel,
    };
    // Get the model to query based on query param
    const queryModel = modelInstance[model];
    results = await queryModel.find({}).select(fields);
    if (model === 'users') {
      results = results.map((item) => {
        const { _id, first_name, last_name } = item;
        return {
          _id,
          name: `${first_name || ''} ${last_name || ''}`,
        };
      });
    } else {
    }
    res.json({
      model,
      results,
    });
  } else {
    res.json({
      res: 'No results',
    });
  }
});

// Getting single report
router.get('/info/:_id', async (req, res) => {
  const id = req.params._id;
  try {
    const report = await ReportBuilderModel.findOne({ _id: id });
    res.status(200).json({
      ...report._doc,
      message: 'Successfully fetched',
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/new', async (req, res) => {
  const report = new ReportBuilderModel({ ...req.body });

  try {
    const newReport = await report.save();
    res.status(201).json({
      report: newReport,
      message: 'Successfully added reports.',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/update/:_id', async (req, res, next) => {
  const id = req.params._id;
  const filter = { _id: id };
  try {
    const report = await ReportBuilderModel.findOneAndUpdate(filter, { ...req.body });
    res.send(report);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.delete('/delete/:_id', async (req, res) => {
  const id = req.params._id;
  try {
    const report = await ReportBuilderModel.findByIdAndRemove({ _id: id });
    const response = {
      message: 'Successfully deleted',
      id: report._id,
    };
    return res.send(response);
  } catch (err) {
    res.json({ message: err.message });
  }
});

/**
 * Accepts @params array of group of conditions
 *  Each condition group has a base condition
 *    Then it has sub conditions
 *    each sub condition has a logic field: AND/OR
 * Each conditions has boolean is_parent: true/false
 *    is_parent means it's the base condition of the total conditions,
 *    meaning all the following condition groups will each have AND/OR logic field
 *
 */
router.post('/query/:collection', async (req, res) => {
  // api for query with conditions
  const collection = req.params.collection;
  const conditions = req.body;

  const modelList = {
    attendance: AttendanceModel,
    companies: CompaniesModel,
    configuration: ConfigurationModel,
    fixedsalarylog: FixedSalaryLog,
    leaves: LeavesModel,
    logging: LoggingModel,
    onboardings: OnboardingModel,
    payroll: PayrollModel,
    payrollprocess: PayrollProcessModel,
    payslips: PayslipsModel,
    projects: ProjectsModel,
    recursive: RecursiveModel,
    requests: RequestsModel,
    roles: RolesModel,
    // 'settings': SettingsModel,
    // shifts: ShiftsModel,
    socials: SocialsModel,
    // 'survey': SurveysModel,
    tasks: TasksModel,
    ticketing: TicketingModel,
    todolist: TodolistModel,
    users: UsersModel,
  };

  const queryModel = modelList[collection];
  const operatorsList = {
    equals: '$in',
    'is not equal': '$ne',
    'greater than': '$gt',
    'less than': '$lt',
  };
  // loop conditions to formulate the match aggregate
  let conditionsQuery = conditions.reduce((acc, item, idx) => {
    // We have a different way to match base conditions
    if (item.sub_conditions.length) {
      let matchStr = '';
      const sub = item.sub_conditions;
      // Loop the sub conditions as array of or
      // this should be appended, not replaced
      if (sub.length === 1) {
        // If there's only one sub condition, we will combine them based on the logic of the sub condition
        const logic = sub[0].logic == 'OR' ? '$or' : '$and';
        // We'll have different query for gt, lt, starts ends, not equal
        matchStr = {
          [logic]: [
            {
              [item.field]: { [operatorsList[item.operator]]: item.match_value },
            },
            {
              [sub[0].field]: { [operatorsList[sub[0].operator]]: sub[0].match_value },
            },
          ],
        };
      } else {
        // If there are 2 or more sub conditions, we filter out the ANDs and the ORs
        const formatConditions = (logic) => {
          const conditionList = sub.filter((cond) => cond.logic == logic);
          // !# This is only for equals
          // configure for gt, lt, ne
          let formatted = conditionList.reduce((acc, condItem) => {
            condItem = {
              [condItem.field]: { [operatorsList[condItem.operator]]: condItem.match_value },
            };
            acc.push(condItem);
            return acc;
          }, []);
          return formatted;
        };
        // We have to dissect the sub conditions and append it to the base
        // Get all condiitons with AND, get all with OR
        let formattedAndConditions = formatConditions('AND');
        let formattedOrConditions = formatConditions('OR');
        if (formattedAndConditions.length) {
          matchStr = {
            $and: [...formattedAndConditions, { [item.field]: { [operatorsList[item.operator]]: item.match_value } }],
          };
        }
        if (formattedOrConditions.length) {
          matchStr = {
            ...matchStr,
            $or: [...formattedOrConditions],
          };
        }
        if (!formattedAndConditions.length) {
          // We assume that everything is an OR, so we'll add the base conditions to the OR
          matchStr['$or'].push({
            [item.field]: { [operatorsList[item.operator]]: item.match_value },
          });
        }
      }
      acc.push(matchStr);
    } else {
      // Base condition
      acc.push({
        [item.field]: { [operatorsList[item.operator]]: item.match_value },
      });
    }
    return acc;
  }, []);
  // If there's only one condition group
  let combined = {
    $match: {
      ...conditionsQuery[0],
    },
  };
  // After having them grouped, we'll get each and/or per group, and refactor the matchstr
  let logicList = conditions.map((cond) => {
    if (cond.logic === 'AND') {
      return '$and';
    } else if (cond.logic === 'OR') {
      return '$or';
    }
    return '';
  });

  // Use this for more than 1 condition groups
  let refactoredConditions = {};
  if (conditionsQuery.length > 1) {
    if (conditionsQuery.length === 2) {
      refactoredConditions = {
        $match: {
          [logicList[1]]: conditionsQuery,
        },
      };
    } else {
      // For 3 or more conditions group
      conditionsQuery.forEach((item, idx) => {
        // Save the last and add it to new ones
        if (idx > 0) {
          if (idx == 1) {
            let prev = conditionsQuery[0];
            refactoredConditions = {
              [logicList[idx]]: [prev, item],
            };
          } else {
            // for third and up condition
            refactoredConditions = {
              [logicList[idx]]: [refactoredConditions, item],
            };
          }
        }
      });
      refactoredConditions = {
        $match: refactoredConditions,
      };
    }
  }
  const matchQuery = conditions.length > 1 ? refactoredConditions : combined;
  try {
    let report = await queryModel.aggregate([matchQuery]);
    res.json(report);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
