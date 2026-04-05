const express = require('express');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { usersController, azureController, authController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { usersValidation } = require('../../validations');
const {
  Access,
  Companies,
  Documents,
  Onboardings,
  Users,
  Configurations,
  Customer,
  PointOfContact,
} = require('../../models');
const { authorizeRoleUserAndUnauth } = require('../../middlewares/authorize');
const validateToken = require('../../../utils').validateAccessToken;
const validateRefreshToken = require('../../../utils').validateRefreshToken;
const validateSecretKey = require('../../../utils').validateSecretKey;
const UsersModel = require('../../models/users.model');
const RolesModel = require('../../models/roles.model');
const Logging = require('../../models/logging');
const { authLimiter } = require('../../middlewares/rateLimiter');
const config = require('../../config/config');
const CryptoJS = require('crypto-js');
const Redis = require('ioredis');
const redis = new Redis({
  host: config.redis.REDIS_HOST,
  port: config.redis.REDIS_PORT,
  no_ready_check: true,
  auth_pass: 'Q+Aa/sEmu39maIa5nw5tG/dg3gi8qfp75dmUTsrR/o69GryVdBFW14g00+wrUsQlsdQDkKqzgZ9GoWsJ'
});
const { parse } = require('csv-parse');
const fs = require('fs');
const AWS = require('aws-sdk');
const { ObjectID } = require('mongodb');
const ID = process.env.SECRET_ID_AWS;
const SECRET = process.env.SECRET_KEY_AWS;
const BUCKET_NAME = process.env.BUCKET_NAME;
const ENCRYPTSECRET_KEY = process.env.ENCRYPTSECRET_KEY;

const { transform, isObject, isEqual, isArray, forEach } = require('lodash');

router.route('/getLogin').all(verifyToken).get(usersController.getLogin);

// Temporary login route for mobile
router.route('/otp/login').post(authLimiter, usersController.mobileLogin);
async function roleAndUserAndUnauthAuthorization(req, res, next) {
  try {
    const authorize_data = await Access.findOne({ module: 'users' })
      .select(['authorize_roles', 'authorize_users', 'unauthorize_users'])
      .exec();
    if (authorize_data && authorize_data.authorize_roles) {
      var authorize_roles = authorize_data.authorize_roles;
    }
    if (authorize_data && authorize_data.authorize_users) {
      var authorize_users = authorize_data.authorize_users;
    }
    if (authorize_data && authorize_data.unauthorize_users) {
      var unauthorize_users = authorize_data.unauthorize_users;
    }
    const authorize_fn_array = authorizeRoleUserAndUnauth(authorize_roles, authorize_users, unauthorize_users);
    const authorize_fn = authorize_fn_array[0];
    await authorize_fn(req, res, next);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
}
router.get('/get-authenticated-user', usersController.getAuthenticatedUserInfo);
router.get('/getAllUsersMOLNumbers', async (req, res) => {
  try {
    let match = {
      $match: {
        user_status: 'active',
      },
    };
    let documentsLookup = {
      $lookup: {
        from: 'documents',
        let: {
          userID: '$_id',
          unDefined: 'undefined',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$foreign_id', '$$userID'] }, { $ne: ['$document_number', '$$unDefined'] }],
              },
            },
          },
        ],
        as: 'document',
      },
    };
    let addFields = {
      $addFields: {
        document: {
          $ifNull: [
            '$document',
            {
              name: '',
            },
          ],
        },
      },
    };
    let addFields2 = {
      $addFields: {
        newDocument1: {
          mol_wps_no: {
            $filter: {
              input: '$document',
              as: 'item',
              cond: {
                $eq: ['$$item.type', ObjectId('64ec534ca721df8c76728541')],
              },
            },
          },
        },
      },
    };
    let unwindMOLWPSNO = {
      $unwind: {
        path: '$newDocument1.mol_wps_no',
        preserveNullAndEmptyArrays: true,
      },
    };

    let project = {
      $project: {
        mol_wps_no: '$newDocument1.mol_wps_no.document_number',
      },
    };
    const users = await UsersModel.aggregate([match, documentsLookup, addFields, addFields2, unwindMOLWPSNO, project]);
    let usersMolList = [];
    users.forEach((a, index) => {
      if (a && a.hasOwnProperty('mol_wps_no') && !['', null, '0', 'NA'].includes(a.mol_wps_no)) {
        usersMolList.push(a.mol_wps_no);
      }
      if (index + 1 == users.length) {
        res.status(200).json(usersMolList);
      }
    });

    // const users = await UsersModel.find({ user_status: 'active' }).distinct('documents.mol_wps_no', { "documents.mol_wps_no": { $nin: ["", null, "0"] } })
  } catch (error) {
    res.send(error);
  }
});
router.get('/getAllUsersMols', async (req, res) => {
  try {
    let match = {
      $match: {
        user_status:{$in: ['active', 'new visa process', 'onboarding']},
        is_deleted: false
      },
    };

    let getAllDocParents = [
      {
        $lookup: {
          from: "visa_processes",
          localField: "_id",
          foreignField: "user_id",
          as: "visa",
          pipeline: [
            {
              $project: {
                _id: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$visa",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          document_checkup_ids: {
            $cond: {
              if: { $gt: [{ $type: "$visa._id" }, "missing"] },  // Check if visa._id exists
              then: ["$_id", "$visa._id"],
              else: ["$_id"]
            }
          }
        }
      }
    ]
    let documentsLookup = {
      $lookup: {
        from: 'documents',
        let: {
          checkupIDs: '$document_checkup_ids',
          unDefined: 'undefined',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$foreign_id', '$$checkupIDs'] }, // Check if foreign_id is in documents_checkup_ids
                  { $ne: ['$document_number', '$$unDefined'] },
                  { $eq: ['$type', ObjectId('64ec534ca721df8c76728541')] }, // Early filter for MOL document type
                  { $ne: ['$is_deleted', true] } // Exclude deleted documents
                ],
              },
            },
          },
          // {
          //   $limit: 1
          // }
        ],
        as: 'document',
      },
    };
    let addFields = {
      $addFields: {
        document: {
          $ifNull: [
            '$document',
            {
              name: '',
            },
          ],
        },
      },
    };
    let addFields2 = {
      $addFields: {
        newDocument1: {
          mol_wps_no: {
            $filter: {
              input: '$document',
              as: 'item',
              cond: {
                $eq: ['$$item.type', ObjectId('64ec534ca721df8c76728541')],
              },
            },
          },
        },
      },
    };
    let unwindMOLWPSNO = {
      $unwind: {
        path: '$newDocument1.mol_wps_no',
        preserveNullAndEmptyArrays: true,
      },
    };

    let project = {
      $project: {
        mol_wps_no: '$newDocument1.mol_wps_no.document_number',
      },
    };
    let usersMOLandCompanyInfo = [];
    const users = await UsersModel.aggregate([match, ...getAllDocParents, documentsLookup, addFields, addFields2, unwindMOLWPSNO, project]);
    users.forEach((a, index) => {
      if (a && a.hasOwnProperty('mol_wps_no') && !['', null, '0', 'NA'].includes(a.mol_wps_no)) {
        let obj = {
          mol_wps_no: a.mol_wps_no,
          company_id: '63984a6ea6e12c5484eeb2d6',
          company_name: 'Dynamic PEO',
        };

        usersMOLandCompanyInfo.push(obj);
      }
      if (index + 1 == users.length) {
        res.status(200).json(usersMOLandCompanyInfo);
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/manager', async (req, res) => {
  try {
    //res.send('Hello Employee')
    const users = await UsersModel.find({ role_ID: { $ne: '5e438bda1c9d4400000db544' }, user_status: { $ne: 'Inactive' } });
    res.json(users);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

/** Upload files in AWS */
router.post('/upload-files', async (req, res) => {
  try {
    const s3 = new AWS.S3({
      // accessKeyId: ID,
      // secretAccessKey: SECRET,
    });
    const fileContent = fs.readFileSync(req.files.a.tempFilePath);

    const params = {
      Bucket: BUCKET_NAME + '/' + req.body.folder,
      Key: req.files.a.name,
      Body: fileContent,
      ACL: 'public-read',
      ContentType: req.files.a.mimetype,
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      } else {
        // console.log(res)
        res.json({ name: params.Key, url: data.Location });
      }
      console.log(`File uploaded successfully. ${data.Location}`);
    });
  } catch (error) {
    console.log('#log', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/setup', async (req, res) => {
  try {
    console.log(config.redis.REDIS_HOST);
    console.log(config.redis.REDIS_PORT);
    console.log("redis configurations from env")
    // console.log("Hits")
    // if (validateSecretKey(req.body.enc)) {
    const users = await Users.find();

    if (users && users.length > 0) {
      let userEncrypted = CryptoJS.AES.encrypt(JSON.stringify(users), ENCRYPTSECRET_KEY).toString();
      await redis.set('users', userEncrypted);
    }

    res.status(200).json({ message: 'success' });
    // }
    // else {
    //     res.status(500).json({ message: 'failed' })
    // }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/team/:_id', async (req, res) => {
  const id = req.params._id;

  try {
    //res.send('Hello Employee')
    const users = await UsersModel.find({ 'reporting.manager': id, user_status: 'active' });
    res.json(users);
    // console.log(users)
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/info/:_id', async (req, res) => {
  const id = req.params._id;
  try {
    const user = await UsersModel.find({ _id: id });
    res.json(user);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.route('/syncdocuments').all(verifyToken).get(usersController.syncDocs);

router.route('/callback').post(azureController.callback);



// router.route('/non/employees').all(verifyToken).get(usersController.getAllNonEmployees);

router.route("/getAllSupportAgents")
  .all(verifyToken)
  .get(usersController.getAllSupportAgents);

router
  .route('/')
  .all(verifyToken)
  .post(validate(usersValidation.createUser), usersController.createUser)
  .get(/*roleAndUserAndUnauthAuthorization,*/ usersController.getAllUser);

// User profile update endpoint (for users updating their own profile)
router
  .route('/profile')
  .all(verifyToken)
  .put(usersController.updateUserProfile);

router
  .route('/:userId')
  .all(verifyToken)
  .get(validate(usersValidation.usersById), usersController.getUserById)
  .patch(usersController.updateUserOnId)
  .delete(validate(usersValidation.deleteUserById), usersController.deleteUserOnId);

router.route('/company/:companyId/employees').all(verifyToken).get(validate(usersValidation.fetchEmployeesByCompanyIdAndEmployment), usersController.fetchEmployeesByCompanyIdAndEmployment);

router.route('/email/:email').all(verifyToken).get(validate(usersValidation.usersByEmail), usersController.getUserByEmail);

router.route('/validate/login').post(authLimiter, usersController.validateLogin);

router.route('/client-otp/login').post(authLimiter, usersController.ClientLoginFlow);

// router.route('/send/insurance/email').all(verifyToken).post(usersController.sendInsurancePlanEmail);

router.route('/validate/centralValidation').post(usersController.validateCentralValidation);

router.route('/validate/centralLogin').post(usersController.validateCentralLogin);

router.route('/get/status/distribution').all().post(usersController.userStatusDistribution);

router.route('/details/listing/page').all(verifyToken).post(usersController.userDetailsForEmpListingPage);

router.route('/mobile/login/stats').all(verifyToken).get(usersController.mobileStats);

router.route('/update/bulk-users').get(usersController.exportDataForBulkUpload);

router.route('/employee/details/:userId').all(verifyToken).post(usersController.userDetailsForEmpPageOnId);

router.route('/add/costs/:userId').all(verifyToken).post(usersController.addAdditionalCostsToUserOnId);

router.route('/count/details').all(verifyToken).post(usersController.countsOfDifferentUsers);

router.route('/search').all(verifyToken).post(usersController.dynamicSearch);

router.route('/status/:status').all(verifyToken).post(usersController.usersOnStatus);

router.route('/employees/companyid/:companyId').all(verifyToken).get(usersController.usersOnCompanyID);

router.route('/employees/filter/dates/status').all(verifyToken).post(usersController.getUsersBetweenDatesAndStatus);

router.route('/collection/search').all(verifyToken).post(usersController.search);

router.route('/name/company/profile').all(verifyToken).post(usersController.allUsersNameCompanyImg);

router.route('/list/dropdown').all(verifyToken).post(usersController.listAllUsersDropDown);

router.route('/list/users/companyid/:companyId').all(verifyToken).post(usersController.usersOnCompanyIdListing);

router.route('/list/sort/filter').all(verifyToken).post(usersController.userListingSearchingFilteringAndPagination);

router.route('/list/status').all(verifyToken).post(usersController.listOfUsersStatus);

router.route('/counts/companyid/:companyId').all(verifyToken).get(usersController.countsOfDifferentUsersOnCompanyID);

router.route('/admin/users').all(verifyToken).get(usersController.listOfAdminUsers);

router.route('/payslip/password-Checker').post(usersController.UserPaySlipPasswordCHecker);

router.route('/payslip/userDetails/:id').post(usersController.getUserDetailsForPaySlips);

router.route('/excel').all(verifyToken).post(usersController.ExcelData);

router.route('/excelvisa').all(verifyToken).post(usersController.ExcelReportVisa);

router.route('/pro').all(verifyToken).post(usersController.AllProList);

router.post('/auth/refresh-tokens', authController.refreshClientTokens);

router.post('/auth/forgot-password', authController.forgotClientPassword);

router.post('/auth/reset-password', authController.resetClientPassword);

router.post('/update/missing-details', usersController.updateMissingUserDetails);

router.post('/update/tenancy-and-residence-details', usersController.tenancyAndResidenceAddressUpdate);

router.get('/export/tenancy-and-residence-details', usersController.exportTenancyAndResidenceAddressUpdateData);

router.get('/stats/tenancy-and-residence', usersController.getTenancyAndResidenceStats);

router.get('/export/tenancy/data', usersController.exportTenancyAndResidencyUpdates);

router.route("/system/pro/list").all(verifyToken).get(usersController.geSystemProList);

router.route("/update/salaries").all(verifyToken).post(usersController.updateSalary);

router.route("/generate/reference/numbers").all(verifyToken).post(usersController.generateUniqueReferenceNumbers);

router.route("/create/internal/staff").all(verifyToken).post(validate(usersValidation.createInternalStaff),usersController.createInternalStaff);
router.route("/update/internal/staff/:userId").all(verifyToken).put(validate(usersValidation.updateInternalStaff),usersController.updateInternalStaff);
router.route("/get/internal/staff").all(verifyToken).get(usersController.fetchInternalEmployees);



// ************* Payroll API'S Starts Here    *************

// get users for payroll id page,
router.post('/payrollUsers/req-info/', async (req, res) => {
  try {
    let body = req.body;
    let match = {
      $match: {
        user_status: { $nin: ['inactive', 'Hold'] },
      },
    };
    let getAllDocParents = [
      {
        $lookup: {
          from: "visa_processes",
          localField: "_id",
          foreignField: "user_id",
          as: "visa",
          pipeline: [
            {
              $project: {
                _id: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$visa",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          document_checkup_ids: {
            $cond: {
              if: { $gt: [{ $type: "$visa._id" }, "missing"] },  // Check if visa._id exists
              then: ["$_id", "$visa._id"],
              else: ["$_id"]
            }
          }
        }
      }
    ]

    let setDateOfJoining = {
      $set: {
        middle_name: { $ifNull: ['$middle_name', ''] },
        date_of_joining: { $ifNull: ['$date_of_joining', '2000-01-01'] },
      },
    };
    let documentsLookup = {
      $lookup: {
        from: 'documents',
        let: {
          checkupIDs: '$document_checkup_ids',
          unDefined: 'undefined',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$foreign_id', '$$checkupIDs'] }, // Check if foreign_id is in documents_checkup_ids
                  { $ne: ['$document_number', '$$unDefined'] },
                ],
              },
              is_deleted: false,
            },
          },
          // {
          //   $limit: 1
          // }
        ],
        as: 'document',
      },
    };

    let addFields = {
      $addFields: {
        document: {
          $ifNull: [
            '$document',
            {
              name: '',
            },
          ],
        },
      },
    };
    let addFields2 = {
      $addFields: {
        newDocument1: {
          passport_no: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$document',
                  as: 'item',
                  cond: {
                    $and: [
                      { $eq: ['$$item.type', ObjectId('64254208e92b0c35c0541ce8')] },
                      { $ne: ['$$item.document_number', null] },
                      { $ne: ['$$item.document_number', ''] },
                    ],
                  },
                },
              },
              0, // Get the first matching document (if it exists)
            ],
            // $filter: {
            //   input: '$document',
            //   as: 'item',
            //   cond: {
            //     $eq: ['$$item.type', ObjectId("64254208e92b0c35c0541ce8")]
            //   },
            // }
          },
          mol_wps_no: {
            // $filter: {
            //   input: '$document',
            //   as: 'item',
            //   cond: {
            //     $eq: ['$$item.type', ObjectId("64ec534ca721df8c76728541")]
            //   },
            // }
            $arrayElemAt: [
              {
                $filter: {
                  input: '$document',
                  as: 'item',
                  cond: {
                    $and: [
                      { $eq: ['$$item.type', ObjectId('64ec534ca721df8c76728541')] },
                      { $ne: ['$$item.document_number', null] },
                      { $ne: ['$$item.document_number', ''] },
                    ],
                  },
                },
              },
              0, // Get the first matching document (if it exists)
            ],
          },
          work_permit_no: {
            // $filter: {
            //   input: '$document',
            //   as: 'item',
            //   cond: {
            //     $eq: ['$$item.type', ObjectId("64d4b61527cb0f1cec7bba19")]
            //   },
            // }

            $arrayElemAt: [
              {
                $filter: {
                  input: '$document',
                  as: 'item',
                  cond: {
                    $and: [
                      { $eq: ['$$item.type', ObjectId('64d4b61527cb0f1cec7bba19')] },
                      { $ne: ['$$item.document_number', null] },
                      { $ne: ['$$item.document_number', ''] },
                    ],
                  },
                },
              },
              0, // Get the first matching document (if it exists)
            ],
          },
          emirates_id: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$document',
                  as: 'item',
                  cond: {
                    $and: [
                      { $eq: ['$$item.type', ObjectId('64229e20bf0f5a1ca8b5117d')] },
                      { $ne: ['$$item.document_number', null] },
                      { $ne: ['$$item.document_number', ''] },
                      { $ne: ['$$item.expiry', null] },
                      { $ne: ['$$item.expiry', ''] },
                    ],
                  },
                },
              },
              0, // Get the first matching document (if it exists)
            ],
          },
        },
      },
    };
    let unwindPassportNo = {
      $unwind: {
        path: '$newDocument1.passport_no',
        preserveNullAndEmptyArrays: true,
      },
    };
    let unwindMOLWPSNO = {
      $unwind: {
        path: '$newDocument1.mol_wps_no',
        preserveNullAndEmptyArrays: true,
      },
    };
    let unwindWorkPermitNo = {
      $unwind: {
        path: '$newDocument1.work_permit_no',
        preserveNullAndEmptyArrays: true,
      },
    };
    let unwindEmiratesIdNo = {
      $unwind: {
        path: '$newDocument1.emirates_id',
        preserveNullAndEmptyArrays: true,
      },
    };
    let obj = {
      passport_no: '$newDocument1.passport_no.document_number',
      mol_wps_no: '$newDocument1.mol_wps_no.document_number',
      work_permit_no: '$newDocument1.work_permit_no.document_number',
      emirates_id: '$newDocument1.emirates_id.document_number',
      emirates_id_expiry: '$newDocument1.emirates_id.expiry',
    };
    body.documents = obj;
    body['personal'] = {
      gender: 1,
      address: 1,
      phone: 1,
      email: 1,
      marital_status: 1,
      nationality: 1,
      cost_center: 1,
      dob: 1,
      designation: '$employment.designation',
      work_schedule: 1,
      ext: 1,
      speed_dial: 1,
      nick_name: 1,
      allergies: 1,
      personal_phone: 1,
      whatsapp: 1,
      personal_whatsapp: 1,
      bio: 1,
      showPhone: 1,
      showEmail: 1,
      showWhatsapp: 1,
      showDob: 1,
      speciality: 1,
      skills: 1,
    };
    let setDocumentsObj = {
      $set: {
        documents: '$newDocument',
      },
    };
    let project = { $project: body };
    let sort = { $sort: { first_name: 1 } };
    const users = await UsersModel.aggregate([
      match,
      setDateOfJoining,
      ...getAllDocParents,
      documentsLookup,
      addFields,
      addFields2,
      unwindPassportNo,
      unwindMOLWPSNO,
      unwindWorkPermitNo,
      unwindEmiratesIdNo,
      setDocumentsObj,
      project,
      sort
    ]);


    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get users count for payroll id page,
router.get('/payrollUsers/count/', async (req, res) => {
  try {
    const users = await UsersModel.count({
      user_status: { $nin: ['inactive', 'Hold'] },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/remainingPayslipsUsers/:pay_month', async (req, res) => {
  let pay_month = req.params.pay_month;
  try {
    let lookupPayslips = {
      $lookup: {
        from: 'payslips',
        let: {
          objID_id: '$objID_id',
          pay_month: pay_month,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$user_id', '$$objID_id'] }, { $eq: ['$pay_month', '$$pay_month'] }],
              },
            },
          },
        ],
        as: 'details',
      },
    };
    const users = await UsersModel.aggregate([
      { $addFields: { objID_id: { $toString: '$_id' } } },
      lookupPayslips,
      { $match: { details: { $eq: [] } } },
      {
        $project: {
          _id: 1,
          first_name: 1,
          middle_name: 1,
          last_name: 1,
          email: 1,
          emp_id: 1,
        },
      },
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ************* Payroll API'S Ends Here    *************

//************* Data Upload API's    *************

// router.post("/uploadUsers", async (req, res) => {
//   try {
//     await getData("./PEO Latest.csv")
//       .then(async response => {
//         let companies = await Companies.find({}).select({ company_name: 1 })
//         for (let index = 0; index < response.length; index++) {
//           let user = response[index]
//           let company = companies.filter(a => a.company_name.trim().toLowerCase() == user['company'].trim().toLowerCase())
//           if (company.length > 0) {
//             console.log(index)
//             let user_id = ''
//             let filter_id = user['_id'].trim()
//             let userObj = {
//               "user_status": user['Employee Status '].toLowerCase(),
//               "first_name": user['First Name'].trim(),
//               "middle_name": user['Middle Name'].trim(),
//               "last_name": user['Last Name'].trim(),
//               "email": user['Email'].trim(),
//               "date_of_joining": moment(new Date(user['Date of Joining'])).format('YYYY-MM-DD'),
//               "personal.gender": user['Gender'].trim(),
//               // "personal.address": user['Address'].trim(),
//               "personal.phone": user['Phone'].trim(),
//               // "personal.marital_status": user['Marital Status'],
//               "personal.nationality": user['Nationality'],
//               "dob": moment(new Date(user['Date of Birth'])).format('YYYY-MM-DD'),
//               "employment.designation": user['Designation'].trim(),
//               "employment.work_location": user['Work Location'].trim(),
//               "employment.visa_designation": user['Visa Designation'].trim(),
//               "employment.contract_type": user['Contract Type'].trim(),
//               "employment.employment_type": user['Employment Type'].trim(),
//               "employment.vis_sponsor_type": user['Visa Issuance Authority '].trim(),
//               "bank.salary_payment_mode": user['Salary Payment Mode'].trim(),
//               "bank.salary_currency": user['Salary Currency'].trim(),
//               "salary.basic_salary": user['Basic Salary'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.housing_allowance": user['Housing Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.transportation_allowance": user['Transportation'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.food_allowance": user['Food Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.other_allowance": user['Other Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.total_fixed": user['Total Fixed'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.hra_allowance": user['HRA Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.telephone_allowance": user['Telephone Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.delivery_lunch_allowance": user['Delivery Lunch Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.education_allowance": user['Education Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.fixed_food_allowance": user['Fixed Food Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.mobility_allowance": user['Mobility Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.transport_allowance": user['Transport Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "salary.fixed_overtime": user['Fixed Overtime'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//               "sub_company_ID": user['Sub-Client '] == 'Not Applicable' ? company[0].company_name : user['Sub-Client '],
//               "documents": [],
//             }
//             if (filter_id.length > 8) {
//               user_id = ObjectId(filter_id)
//               let userupdate = await UsersModel.updateMany({ _id: user_id }, { $set: userObj })
//             }
//             else {
//               let newUser = new UsersModel(userObj)
//               const createUser = await newUser.save()
//               console.log(createUser)
//               user_id = createUser._id
//             }
//             //passport
//             userObj.documents.push(
//               {
//                 "type": ObjectId('64254208e92b0c35c0541ce8'),
//                 "identifier": "users",
//                 "foreign_id": user_id,
//                 "doc_status": new Date(user['Passport Expiry']) > new Date() ? "valid" : "expired",
//                 "document_number": user['Passport Number '],
//                 "issuance": "",
//                 "expiry": moment(new Date(user['Passport Expiry'])).format('YYYY-MM-DD'),
//                 "module": "users",
//               }
//             )
//             //Visa
//             userObj.documents.push(
//               {
//                 "type": ObjectId('6412c9795d3c723a3cf939d6'),
//                 "identifier": "users",
//                 "foreign_id": user_id,
//                 "doc_status": new Date(user['Visa Expiry Date ']) > new Date() ? "valid" : "expired",
//                 "document_number": user['Visa UID Number '],
//                 "issuance": moment(new Date(user['Visa Issuance Date'])).format('YYYY-MM-DD'),
//                 "expiry": moment(new Date(user['Visa Expiry Date '])).format('YYYY-MM-DD'),
//                 "module": "users",
//               }
//             )
//             //Emirates ID
//             userObj.documents.push(
//               {
//                 "type": ObjectId('64229e20bf0f5a1ca8b5117d'),
//                 "identifier": "users",
//                 "foreign_id": user_id,
//                 "doc_status": new Date(user['Emirates ID Expiry']) > new Date() ? "valid" : "expired",
//                 "document_number": user['Emirates ID Number'],
//                 "issuance": "",
//                 "expiry": moment(new Date(user['Emirates ID Expiry'])).format('YYYY-MM-DD'),
//                 "module": "users",
//               }
//             )
//             //Labour Card
//             userObj.documents.push(
//               {
//                 "type": ObjectId('64d4b61527cb0f1cec7bba19'),
//                 "identifier": "users",
//                 "foreign_id": user_id,
//                 "doc_status": new Date(user['Mol Expiry']) > new Date() ? "valid" : "expired",
//                 "document_number": user['Labour Card Number '],
//                 "issuance": "",
//                 "expiry": moment(new Date(user['Mol Expiry'])).format('YYYY-MM-DD'),
//                 "module": "users",
//               }
//             )
//             for (let i = 0; i < userObj.documents.length; i++) {
//               const element = userObj.documents[i];
//               var newDocument = new Documents(element)
//               const DocCreated = await newDocument.save();
//             }
//           } else {
//             console.log(user['company'])
//           }
//           // break;
//         }
//         res.json(response);
//       })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }

// })

// router.post("/uploadUsersWPS", async (req, res) => {
//   try {
//     await getData("./PEO Central_Active_21082023 (002) 24082023.csv")
//       .then(async response => {
//         let companies = await Companies.find({}).select({ company_name: 1 })
//         for (let index = 0; index < response.length; index++) {
//           let user = response[index]

//           console.log(index)
//           let user_id = user['_id'].trim()
//           let userObj = {
//             documents: []
//           }
//           // let filter_id = user['_id'].trim()
//           // let userObj = {
//           //   "user_status": user['Employee Status '].toLowerCase(),
//           //   "first_name": user['First Name'].trim(),
//           //   "middle_name": user['Middle Name'].trim(),
//           //   "last_name": user['Last Name'].trim(),
//           //   "email": user['Email'].trim(),
//           //   "date_of_joining": moment(new Date(user['Date of Joining'])).format('YYYY-MM-DD'),
//           //   "personal.gender": user['Gender'].trim(),
//           //   // "personal.address": user['Address'].trim(),
//           //   "personal.phone": user['Phone'].trim(),
//           //   // "personal.marital_status": user['Marital Status'],
//           //   "personal.nationality": user['Nationality'],
//           //   "dob": moment(new Date(user['Date of Birth'])).format('YYYY-MM-DD'),
//           //   "employment.designation": user['Designation'].trim(),
//           //   "employment.work_location": user['Work Location'].trim(),
//           //   "employment.visa_designation": user['Visa Designation'].trim(),
//           //   "employment.contract_type": user['Contract Type'].trim(),
//           //   "employment.employment_type": user['Employment Type'].trim(),
//           //   "employment.vis_sponsor_type": user['Visa Issuance Authority '].trim(),
//           //   "bank.salary_payment_mode": user['Salary Payment Mode'].trim(),
//           //   "bank.salary_currency": user['Salary Currency'].trim(),
//           //   "salary.basic_salary": user['Basic Salary'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.housing_allowance": user['Housing Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.transportation_allowance": user['Transportation'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.food_allowance": user['Food Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.other_allowance": user['Other Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.total_fixed": user['Total Fixed'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.hra_allowance": user['HRA Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.telephone_allowance": user['Telephone Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.delivery_lunch_allowance": user['Delivery Lunch Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.education_allowance": user['Education Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.fixed_food_allowance": user['Fixed Food Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.mobility_allowance": user['Mobility Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.transport_allowance": user['Transport Allowance'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "salary.fixed_overtime": user['Fixed Overtime'].trim().split('.')[0].replace(/[^0-9]/g, ''),
//           //   "sub_company_ID": user['Sub-Client '] == 'Not Applicable' ? company[0].company_name : user['Sub-Client '],
//           //   "documents": [],
//           // }
//           // if (filter_id.length > 8) {
//           //   user_id = ObjectId(filter_id)
//           //   let userupdate = await UsersModel.updateMany({ _id: user_id }, { $set: userObj })
//           // }
//           // else {
//           //   let newUser = new UsersModel(userObj)
//           //   const createUser = await newUser.save()
//           //   console.log(createUser)
//           //   user_id = createUser._id
//           // }
//           // //passport
//           // userObj.documents.push(
//           //   {
//           //     "type": ObjectId('64254208e92b0c35c0541ce8'),
//           //     "identifier": "users",
//           //     "foreign_id": user_id,
//           //     "doc_status": new Date(user['Passport Expiry']) > new Date() ? "valid" : "expired",
//           //     "document_number": user['Passport Number '],
//           //     "issuance": "",
//           //     "expiry": moment(new Date(user['Passport Expiry'])).format('YYYY-MM-DD'),
//           //     "module": "users",
//           //   }
//           // )
//           // //Visa
//           // userObj.documents.push(
//           //   {
//           //     "type": ObjectId('6412c9795d3c723a3cf939d6'),
//           //     "identifier": "users",
//           //     "foreign_id": user_id,
//           //     "doc_status": new Date(user['Visa Expiry Date ']) > new Date() ? "valid" : "expired",
//           //     "document_number": user['Visa UID Number '],
//           //     "issuance": moment(new Date(user['Visa Issuance Date'])).format('YYYY-MM-DD'),
//           //     "expiry": moment(new Date(user['Visa Expiry Date '])).format('YYYY-MM-DD'),
//           //     "module": "users",
//           //   }
//           // )
//           // //Emirates ID
//           // userObj.documents.push(
//           //   {
//           //     "type": ObjectId('64229e20bf0f5a1ca8b5117d'),
//           //     "identifier": "users",
//           //     "foreign_id": user_id,
//           //     "doc_status": new Date(user['Emirates ID Expiry']) > new Date() ? "valid" : "expired",
//           //     "document_number": user['Emirates ID Number'],
//           //     "issuance": "",
//           //     "expiry": moment(new Date(user['Emirates ID Expiry'])).format('YYYY-MM-DD'),
//           //     "module": "users",
//           //   }
//           // )
//           // //Labour Card
//           // userObj.documents.push(
//           //   {
//           //     "type": ObjectId('64d4b61527cb0f1cec7bba19'),
//           //     "identifier": "users",
//           //     "foreign_id": user_id,
//           //     "doc_status": new Date(user['Mol Expiry']) > new Date() ? "valid" : "expired",
//           //     "document_number": user['Labour Card Number '],
//           //     "issuance": "",
//           //     "expiry": moment(new Date(user['Mol Expiry'])).format('YYYY-MM-DD'),
//           //     "module": "users",
//           //   }
//           // )
//           //WPS Number
//           if (user_id.length > 8) {
//             userObj.documents.push(
//               {
//                 "type": ObjectId('64ec534ca721df8c76728541'),
//                 "identifier": "users",
//                 "foreign_id": user_id,
//                 "doc_status": "valid",
//                 "document_number": user['Personal Number '],
//                 "issuance": "",
//                 "expiry": "",
//                 "module": "users",
//               }
//             )
//             for (let i = 0; i < userObj.documents.length; i++) {
//               const element = userObj.documents[i];
//               var newDocument = new Documents(element)
//               const DocCreated = await newDocument.save();
//             }
//           }
//           else {
//             console.log(user['Employee Name '])
//           }
//           // break;
//         }
//         res.json(response);
//       })
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }

// })

router.post('/uploadUsersOnboarding', async (req, res) => {
  try {
    await getData('./Copy of New Microsoft Excel Worksheet (3).csv').then(async (response) => {
      let companies = await Companies.find({}).select({ company_name: 1 });
      for (let index = 0; index < response.length; index++) {
        let user = response[index];
        let company = companies.filter((a) => a.company_name.trim().toLowerCase() == user['Company'].trim().toLowerCase());
        if (company.length > 0) {
          console.log(index);
          let user_id = '';
          let filter_id = '';
          let [year, month, day] = user['Date of Birth'].split('-');
          let [pyear, pmonth, pday] = user['Passport Expiry Date'].split('-');
          let [jyear, jmonth, jday] = user['Date of Joining'].split('-');
          let userObj = {
            company_id: ObjectId(company[0]._id),
            role_ID: ObjectId('640f064bbe01c2e00bd95082'),
            user_status: 'onboarding',
            first_name: user['First Name'].trim(),
            middle_name: user['Middle Name'].trim(),
            last_name: user['Last Name'].trim(),
            email: user['Email Address'].trim(),
            'personal.phone': user['Mobile Number'].trim(),
            'personal.nationality': user['Nationality'],
            'personal.dob': moment(new Date(+year, +month - 1, +day)).format('YYYY-MM-DD'),
            'employment.visa_designation': user['Visa Designation'].trim(),
            'employment.designation': user['Designation'].trim(),
            date_of_joining: moment(new Date(+jyear, +jmonth - 1, +jday)).format('YYYY-MM-DD'),
            'employment.contract_type': 'Limited',
            'employment.employment_type': user['Employment Type'].trim(),
            'employment.expected_arrival': user['Expected Date of Arrival'].trim(),
            'employment.visa_sponsor_type': user['Visa Issuance Authority'].trim(),
            'employment.work_location':
              user['Visa Issuance Authority'].trim() == 'Dynamic Employment Services' ? 'Dubai' : 'Abu Dhabi',
            'salary.basic_salary': 1,
            'salary.transportation_allowance': 0,
            'salary.food_allowance': 0,
            'salary.other_allowance': 0,
            'salary.total_fixed': 1,
            'salary.hra_allowance': 0,
            documents: [],
          };

          if (filter_id.length > 8) {
            user_id = ObjectId(filter_id);
            let userupdate = await UsersModel.updateMany({ _id: user_id }, { $set: userObj });
          } else {
            let newUser = new UsersModel(userObj);
            const createUser = await newUser.save();
            user_id = createUser._id;

            let MissionStages = [
              {
                _id: '64390973c989e363a2d8dd5f',
                stage_name: 'Employee Details',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '64390a45c989e363a2d8dd63',
                stage_name: 'Create Work Order',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'document',
                    template_id: '6479d98b21ea2a2b10a2d226',
                    button: 'Create Work Order',
                    reject_button: 'Withdraw',
                    message: 'Next Step',
                    status: 'completed',
                    preview: 'current',
                    uploadable_document: '64e3583b5e10fcff97f4becd',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '64390a63c989e363a2d8dd64',
                stage_name: 'Work Order Approval',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    button: 'Send for sign',
                    message: "Send Work Order for employer's approval sign",
                    status: 'completed',
                    action_type: 'no action',
                    preview: 'previous',
                  },
                  {
                    button: 'Mark as signed',
                    message: "Waiting for employer's approval sign",
                    status: 'completed',
                    action_type: 'no action',
                    preview: 'previous',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '64390a87c989e363a2d8dd65',
                stage_name: 'Invoice & Debit Note',
                process_status: 'progress',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'invoice creation',
                    button: 'Create Invoice',
                    message: 'Next Step',
                    status: 'completed',
                    invoice: [
                      {
                        header: 'Invoice',
                        items: ['Emiratization Cost', 'Onboarding Cost', 'Family Visa Cost'],
                      },
                    ],
                    preview: 'current',
                    uploadable_document: '65181e3ca9eb85168c8f4a12',
                  },
                  {
                    button: 'Send Invoice',
                    message: 'Next Step',
                    status: 'completed',
                    action_type: 'email',
                    template_id: '648c8d8fb23643fd26f0ba60',
                    preview: 'previous',
                  },
                  {
                    button: 'Record Payment',
                    message: 'Waiting for Payment',
                    status: 'completed',
                    template_id: '------',
                    action_type: 'record payment',
                    preview: 'previous',
                  },
                  {
                    button: 'Review Infomation',
                    message: 'All Payments Completed',
                    status: 'progress',
                    action_type: 'fill form',
                    template_id: '64528006d1c91c451222ceaa',
                    preview: 'none',
                  },
                  {
                    button: 'Start Visa Process',
                    message: 'All Payments Completed',
                    status: 'pending',
                    action_type: 'visa process',
                    process_type: 'new visa process',
                    preview: 'current',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
            ];

            let WorkPermitStages = [
              {
                _id: '64390973c989e363a2d8dd5f',
                stage_name: 'Employee Details',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '643909a8c989e363a2d8dd60',
                stage_name: 'Create Employment contract',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'document',
                    template_id: '6479c037a4947548d411337d',
                    button: 'Create Emp Contract',
                    message: 'Next Step',
                    reject_button: 'Withdraw',
                    status: 'completed',
                    preview: 'current',
                    uploadable_document: '64e3583b5e10fcff97f4becd',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '643909d2c989e363a2d8dd61',
                stage_name: "Employer's Approval",
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'no action',
                    button: 'Send for Approval',
                    message: "Send employment Contract for employer's approval?",
                    status: 'completed',
                    preview: 'previous',
                  },
                  {
                    button: 'Mark as approved',
                    message: "Waiting for employer's Approval",
                    status: 'completed',
                    action_type: 'no action',
                    preview: 'previous',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '643909fec989e363a2d8dd62',
                stage_name: "Employee's Sign",
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'no action',
                    button: 'Send for sign',
                    message: "Send employment contract for employee's sign?",
                    status: 'completed',
                    preview: 'previous',
                  },
                  {
                    button: 'Mark as signed',
                    message: "Waiting for Employee's sign",
                    status: 'completed',
                    action_type: 'no action',
                    preview: 'previous',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '64390a45c989e363a2d8dd63',
                stage_name: 'Create Work Order',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'document',
                    template_id: '6479d98b21ea2a2b10a2d226',
                    button: 'Create Work Order',
                    message: 'Next Step',
                    status: 'completed',
                    preview: 'current',
                    uploadable_document: '64e3583b5e10fcff97f4becd',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '64390a63c989e363a2d8dd64',
                stage_name: 'Work Order Approval',
                process_status: 'completed',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    button: 'Send for sign',
                    message: "Send Work Order for employer's approval sign",
                    status: 'completed',
                    action_type: 'no action',
                    preview: 'previous',
                  },
                  {
                    button: 'Mark as signed',
                    message: "Waiting for employer's approval sign",
                    status: 'completed',
                    action_type: 'no action',
                    preview: 'previous',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
              {
                _id: '64390a87c989e363a2d8dd65',
                stage_name: 'Invoice & Debit Note',
                process_status: 'progress',
                visibility: ['isSuperAdmin', 'isAdmin'],
                actions: [
                  {
                    action_type: 'invoice creation',
                    button: 'Create Invoice',
                    message: 'Next Step',
                    status: 'completed',
                    invoice: [
                      {
                        header: 'Invoice',
                        items: ['Emiratization Cost', 'Onboarding Cost', 'Family Visa Cost'],
                      },
                    ],
                    preview: 'current',
                    uploadable_document: '65181e3ca9eb85168c8f4a12',
                  },
                  {
                    button: 'Send Invoice',
                    message: 'Next Step',
                    status: 'completed',
                    action_type: 'email',
                    template_id: '648c8d8fb23643fd26f0ba60',
                    preview: 'previous',
                  },
                  {
                    button: 'Record Payment',
                    message: 'Waiting for Payment',
                    status: 'completed',
                    template_id: '------',
                    action_type: 'record payment',
                    preview: 'previous',
                  },
                  {
                    button: 'Review Infomation',
                    message: 'All Payments Completed',
                    status: 'progress',
                    action_type: 'fill form',
                    template_id: '64528006d1c91c451222ceaa',
                    preview: 'none',
                  },
                  {
                    button: 'Start Visa Process',
                    message: 'All Payments Completed',
                    status: 'pending',
                    action_type: 'visa process',
                    process_type: 'new visa process',
                    preview: 'current',
                  },
                ],
                permissions: [],
                documents_required: [],
                content_visibility: ['isSuperAdmin', 'isAdmin'],
                assigned_users: ['isSuperAdmin', 'isAdmin'],
                complete_condition: 'Sequential',
              },
            ];

            let onboardingObj = {
              processes:
                user['Employment Type'].trim() == 'Mission Visa (3 Months Single Entry)'
                  ? MissionStages
                  : user['Employment Type'].trim() == 'Work Permit (for UAE Resident visa holders)'
                    ? WorkPermitStages
                    : [],
              is_unsuccessful: false,
              reason_for_unsuccessful: '',
              attachments: [],
              comments: [],
              have_eid: '',
              vip: '',
              user_location: user['Current Location'],
              visa_type: '',
              is_deleted: false,
              status: 'Invoice & Debit Note',
              stage_type: 'onboarding',
              process_type: 'onboarding process',
              company_id: createUser.company_id,
              user_id: user_id,
            };
            let newOnboarding = new Onboardings(onboardingObj);
            await newOnboarding.save();
          }
          //passport
          userObj.documents.push({
            type: ObjectId('64254208e92b0c35c0541ce8'),
            identifier: 'users',
            foreign_id: user_id,
            doc_status: new Date(+pyear, +pmonth - 1, +pday) > new Date() ? 'valid' : 'expired',
            document_number: user['Passport Number'],
            issuance: '',
            expiry: moment(new Date(+pyear, +pmonth - 1, +pday)).format('YYYY-MM-DD'),
            module: 'users',
          });
          for (let i = 0; i < userObj.documents.length; i++) {
            const element = userObj.documents[i];
            var newDocument = new Documents(element);
            const DocCreated = await newDocument.save();
          }
        } else {
          console.log(user['Company']);
        }
      }
      res.json(response);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/createCustomers', async (req, res) => {
  try {
    await getData('./Book1.csv').then(async (response) => {
      let companies = await Companies.find({}).select({ company_name: 1 });
      for (let index = 0; index < response.length; index++) {
        // for (let index = 0; index < 1; index++) {
        let data = response[index];
        console.log(data['Consultant']);
        let customerObj = {
          logo: '',
          status: data['STATUS'],
          name: data['COMPANY NAME'],
          industry: data['INDUSTRY'],
          country: data['COUNTRY'],
          city: data['CITY'],
          notes: data['COMMENTS'],
          verification_status: data['VERIFICATION'],
          lead_source: data['LEAD SOURCE'],
          consultant: data['Consultant'],
        };
        let newCustomer = new Customer(customerObj);
        let customer = await newCustomer.save();
        let customer_id = customer._id;

        let poc = {
          salutation: '',
          name: data['CONTACT NAME'],
          email: data['COMPANY NAME'].replace(/\s/g, '').toLowerCase().trim() + '@company.com',
          phone: 'xxxxxxxxxxx',
          alt_phone: data['ALT NUMBER'],
          designation: data['DESIGNATION'],
          // "billing_contact": "",
          customer: ObjectId(customer_id),
        };
        let newPOC = new PointOfContact(poc);
        pocCreated = await newPOC.save();
        console.log(pocCreated);
        console.log(index);
      }
      res.json(response);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getData(filename) {
  return new Promise((resolve) => {
    const data = [];

    fs.createReadStream(filename)
      // fs.createReadStream("./FreelancersDependents.csv")
      .pipe(
        parse({
          delimiter: ',',
          columns: true,
          ltrim: true,
        })
      )
      .on('data', function (row) {
        data.push(row);
      })
      .on('error', function (error) {
        console.log(error.message);
      })
      .on('end', function () {
        resolve(data);
      });
  });
}

router.post('/reporting/bulkUpdate', async (req, res) => {
  try {
    const AllUsers = await UsersModel.find();
    // console.log("Hits")
    for (let index = 0; index < AllUsers.length; index++) {
      const element = AllUsers[index];

      const reporting = {
        team: 'Test',
        department: 'IT',
        manager: '647edf9856b4783e81c9805d',
        senior_manager: '',
        type: '',
        managed_teams: [],
        letters_approvals: {
          approver_levels: '1',
          level_1: '647edf9856b4783e81c9805d',
          level_2: '',
          level_3: '',
          level_4: '',
        },
        leaves_approvals: {
          approver_levels: '1',
          level_1: '647edf9856b4783e81c9805d',
          level_2: '',
          level_3: '',
          level_4: '',
        },
        claims_approvals: {
          approver_levels: '1',
          level_1: '647edf9856b4783e81c9805d',
          level_2: '',
          level_3: '',
          level_4: '',
        },
        attendance_approvals: {
          approver_levels: '1',
          level_1: '647edf9856b4783e81c9805d',
          level_2: '',
          level_3: '',
          level_4: '',
        },
        wfh_approvals: {
          approver_levels: '1',
          level_1: '647edf9856b4783e81c9805d',
          level_2: '',
          level_3: '',
          level_4: '',
        },
      };

      const Update = await UsersModel.updateOne({ _id: element._id }, { $set: { reporting: reporting } });
      console.log(Update, 'Update');

      // res.json("Updated")
    }
  } catch (error) {
    console.log(error.message);
  }
});

router.get('/team/:_id', async (req, res) => {
  const id = req.params._id;

  try {
    //res.send('Hello Employee')
    const users = await UsersModel.find({ 'reporting.manager': id, user_status: 'Active' });
    res.json(users);
    // console.log(users)
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/info/:_id', async (req, res) => {
  const id = req.params._id;
  try {
    const user = await UsersModel.find({ _id: id });
    res.json(user);
  } catch (error) {
    console.log('#log', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/approval/managers/:manager_id', async (req, res) => {
  try {
    const manager_id = req.params.manager_id;
    const users = await UsersModel.aggregate([
      {
        $match: {
          _id: { $ne: ObjectId(manager_id) },
          role_ID: {
            $in: [
              '640f064ebe01c2e00bd95083', // HR Manager
              '640ecdfc4118771fa8e57002', // Admin
              '640f061bbe01c2e00bd95081', // CEO
              '640f05febe01c2e00bd95080', // Manager
              '640ed141b3a9911d50a30729', // Finance Manager
              '640f1c93be01c2e00bd95084', // Super Admin

              ObjectId('640f064ebe01c2e00bd95083'), // HR Manager
              ObjectId('640ecdfc4118771fa8e57002'), // Admin
              ObjectId('640f061bbe01c2e00bd95081'), // CEO
              ObjectId('640f05febe01c2e00bd95080'), // Manager
              ObjectId('640ed141b3a9911d50a30729'), // Finance Manager
              ObjectId('640f1c93be01c2e00bd95084'), // Super Admin
            ],
          },
        },
      },
      {
        $project: {
          name: { $concat: ['$first_name', ' ', '$last_name'] },
          designation: '$personal.designation',
          signature: {
            $cond: {
              if: '$personal.empolyeeSignature',
              then: '$personal.empolyeeSignature',
              else: '',
            },
          },
        },
      },
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//
router.put('/update/:_id', validateToken, async (req, res, next) => {
  const id = req.params._id;
  const filter = { _id: ObjectId(id) };
  try {
    let originalObject = await UsersModel.findById(id);

    const updatedObject = req.body[0];
    const user = await UsersModel.findOneAndUpdate(filter, req.body[0], { new: true });
    /* To capture logs from employee management page only */
    // if (updatedObject.page == "emp-management") {
    const originalObjectSalary = {
      basic_salary: originalObject.salary.basic_salary,
      housing_allowance: originalObject.salary.housing_allowance,
      transport_allowance: originalObject.salary.transport_allowance,
      air_ticket_allowance: originalObject.salary.air_ticket_allowance,
      other_allowance: originalObject.salary.other_allowance,
      total_fixed: originalObject.salary.total_fixed,
    };
    const originalObjectReporting = {
      type: originalObject.reporting.type,
      department: originalObject.reporting.department,
      team: originalObject.reporting.team,
      manager: originalObject.reporting.manager,
    };

    const originalObjectSponsored = originalObject.sponsored_dependents;
    const updateObjectSponsored = updatedObject.sponsored_dependents;

    delete updatedObject._id;
    delete updatedObject.tokens;
    delete updatedObject.createdDate;
    delete updatedObject.last_unsuccessful_login_time;
    delete updatedObject.userStatusApproval;
    delete updatedObject.full_name;
    delete updatedObject.manager_name;
    delete updatedObject.department;
    delete updatedObject.fb_tokens;
    delete updatedObject.otp;
    delete updatedObject.otp_expiration;
    delete updatedObject.page;

    // keys should be only inside corresponding objects
    delete updatedObject.role_name;
    delete updatedObject.company_name;
    delete updatedObject.manager_name;
    delete updatedObject.specialty;
    delete updatedObject.skills;

    const objectsData = difference(originalObject, updatedObject);
    const message = [];

    let compareTwoArrayOfObjects = (first_array_of_objects, second_array_of_objects) => {
      return first_array_of_objects.forEach((element_1, key) => {
        let array_keys = Object.keys(element_1);
        array_keys.forEach((ele) => {
          if (element_1[ele] !== second_array_of_objects[key][ele]) {
            message.push(`Sponsored Data update from  ${second_array_of_objects[key][ele]} to ${element_1[ele]}`);
          }
        });
      });
    };

    const objectKeys = Object.keys(objectsData);

    if (objectKeys.includes('password')) {
      // req.body[0]['unsuccessful login attempts'] = 0;
      const numFail = user.unsuccessful_login_attempts;
      if (numFail && numFail > 0) {
        // objectsData['unsuccessful_login_attempts'] = 0;
        await UsersModel.findOneAndUpdate(filter, { unsuccessful_login_attempts: 0 });
        message.push(`Unsuccessful login attempts update from ${numFail} to 0`);
      }
    }

    if (isEqual(originalObjectSalary, updatedObject.salary)) {
      delete originalObject.salary;
      delete updatedObject.salary;
    }

    let roleInfo = '';
    let roleName = null;
    let roleNameOld = null;
    if (objectKeys.includes('role_ID')) {
      roleName = await RolesModel.findById(objectsData.role_ID).exec();
      const oldRoleID = originalObject.role_ID;
      roleNameOld = await RolesModel.findById(oldRoleID).exec();
    }

    objectKeys.map(async (key) => {
      if (typeof objectsData[key] === 'object' && objectsData[key] !== null) {
        Object.keys(objectsData[key]).map(async (innerKey) => {
          if (String(key) === 'salary') {
            if (originalObjectSalary[innerKey] !== objectsData[key][innerKey]) {
              message.push(
                `${key} - ${humanize(innerKey)} update from ${originalObjectSalary[innerKey]} to ${objectsData[key][innerKey]
                }`
              );
            }
          } else if (String(key) === 'sponsored_dependents') {
            compareTwoArrayOfObjects(updateObjectSponsored, originalObjectSponsored);
          } else if (String(key) === 'attachments') {
            let fileName = null;
            if (objectsData[key][innerKey]['filename']) {
              fileName = camelCaseToString(objectsData[key][innerKey]['filename']);
            }
            if (objectsData[key][innerKey]['documentType']) {
              console.log(
                `Attachments - ${camelCaseToString(
                  objectsData[key][innerKey]['documentType']
                )}: Uploaded a new file. Filename: ${fileName}`
              );
              message.push(
                `Attachments - ${camelCaseToString(
                  objectsData[key][innerKey]['documentType']
                )}: Uploaded a new file. Filename: ${fileName}`
              );
            }
          } else {
            if (String(key) === 'employment') {
              if (innerKey === 'probation_days') {
                let date_of_joining = new Date(originalObject.date_of_joining);
                let probation_date_before = new Date(
                  date_of_joining.getTime() + parseFloat(originalObject[key][innerKey]) * 24 * 60 * 60 * 1000
                ).toISOString();
                let probation_date_after = new Date(
                  date_of_joining.getTime() + parseFloat(objectsData[key][innerKey]) * 24 * 60 * 60 * 1000
                ).toISOString();
                message.push(
                  `${key} - probation end date update from ${probation_date_before.substring(
                    0,
                    10
                  )} to ${probation_date_after.substring(0, 10)}`
                );
                message.push(
                  `${key} - ${humanize(innerKey)} update from ${originalObject[key][innerKey]} to ${objectsData[key][innerKey]
                  }`
                );
              } else {
                let oldValue = originalObject[key][innerKey];
                if (originalObject[key][innerKey] == '') {
                  oldValue = 'Blank';
                }
                message.push(`${key} - ${humanize(innerKey)} update from ${oldValue} to ${objectsData[key][innerKey]}`);
              }
            } else if (String(key) === 'insurance') {
              if (innerKey === 'insurance_card' || innerKey === 'network_list' || innerKey === 'coverage_list') {
                let OldfileName = '';
                originalObject.attachments.forEach((attachment) => {
                  if (attachment.link == originalObject[key][innerKey]) {
                    OldfileName = attachment.filename;
                  }
                });

                let NewfileName = '';
                req.body[0].attachments.forEach((attachment) => {
                  if (attachment.link == req.body[0][key][innerKey]) {
                    NewfileName = attachment.filename;
                  }
                });
                message.push(`${key} - ${humanize(innerKey)} update from ${OldfileName} to ${NewfileName}`);
              } else {
                let oldValue = originalObject[key][innerKey];
                if (originalObject[key][innerKey] == '') {
                  oldValue = 'Blank';
                }
                message.push(`${key} - ${humanize(innerKey)} update from ${oldValue} to ${req.body[0][key][innerKey]}`);
              }
            } else if (String(key) === 'covid_details') {
              if (innerKey === 'vaccination_details') {
                for (let index = 0; index < objectsData[key][innerKey].length; index++) {
                  if (objectsData[key][innerKey][index]['vaccine_name']) {
                    message.push(
                      `${key} - ${humanize(innerKey)} update from ${originalObject[key][innerKey][index]['vaccine_name']
                      } to ${objectsData[key][innerKey][index]['vaccine_name']}`
                    );
                  } else if (objectsData[key][innerKey][index]['vaccination_date']) {
                    message.push(
                      `${key} - ${humanize(innerKey)} update from ${originalObject[key][innerKey][index]['vaccination_date']
                      } to ${objectsData[key][innerKey][index]['vaccination_date']}`
                    );
                  } else if (objectsData[key][innerKey][index]['vaccination_1_date']) {
                    message.push(
                      `${key} - ${humanize(innerKey)} update from ${originalObject[key][innerKey][index]['vaccination_1_date']
                      } to ${objectsData[key][innerKey][index]['vaccination_1_date']}`
                    );
                  } else if (objectsData[key][innerKey][index]['vaccination_2_date']) {
                    message.push(
                      `${key} - ${humanize(innerKey)} update from ${originalObject[key][innerKey][index]['vaccination_2_date']
                      } to ${objectsData[key][innerKey][index]['vaccination_2_date']}`
                    );
                  } else if (objectsData[key][innerKey][index]['booster']) {
                    message.push(
                      `${key} - ${humanize(innerKey)} update from ${originalObject[key][innerKey][index]['booster']} to ${objectsData[key][innerKey][index]['booster']
                      }`
                    );
                  }
                }
              } else if (innerKey === 'vaccination_card') {
                let fileName = null;
                if (req.body[0][key][innerKey]['filename']) {
                  fileName = camelCaseToString(req.body[0][key][innerKey]['filename']);
                }
                if (req.body[0][key][innerKey]['documentType']) {
                  console.log(
                    `Vaccination - ${camelCaseToString(
                      req.body[0][key][innerKey]['documentType']
                    )}: uploaded a file. Filename: ${fileName}`
                  );
                  message.push(
                    `Vaccination - ${camelCaseToString(
                      req.body[0][key][innerKey]['documentType']
                    )}: uploaded a file. Filename: ${fileName}`
                  );
                }
              }
            } else {
              if (String(key) === 'reporting' && innerKey == 'manager') {
                let oldValue = originalObject[key][innerKey];
                if (originalObject[key][innerKey] == '') {
                  oldValue = 'Blank';
                }
                message.push(
                  `${key} - ${humanize(innerKey)} update from ${await getManagerName(oldValue)} to ${await getManagerName(
                    objectsData[key][innerKey]
                  )}`
                );
              } else {
                let oldValue = originalObject[key][innerKey];
                if (originalObject[key][innerKey] == '') {
                  oldValue = 'Blank';
                }
                message.push(`${key} - ${humanize(innerKey)} update from ${oldValue} to ${objectsData[key][innerKey]}`);
              }
            }
          }
        });
      } else {
        if (checkIfCamelCase(String(key))) {
          if (String(key) === 'password') {
            message.push(`Password has been successfully updated.`);
          } else {
            message.push(
              `${camelCaseToString(key).toLowerCase()} update from ${originalObject[key]} to ${objectsData[key]}`
            );
          }
        } else {
          if (String(key) === 'image_url') {
            message.push(`Profile photo was successfully changed.`);
          } else if (String(key) === 'role_ID') {
            roleInfo = `role type update from ${roleNameOld.role_name} to ${roleName.role_name}`;
          } else if (String(key) === 'company_ID') {
            let oldValue = originalObject[key];
            if (originalObject[key] == '') {
              oldValue = 'Blank';
              let newCompany = await CompanyModel.findOne({ _id: objectsData[key] }).select('company_name');
              message.push(`Company name update from ${oldValue} to ${newCompany.company_name}`);
            } else {
              let oldCompany = await CompanyModel.findOne({ _id: originalObject[key] }).select('company_name');

              let newCompany = await CompanyModel.findOne({ _id: objectsData[key] }).select('company_name');

              message.push(`Company name update from ${oldCompany.company_name} to ${newCompany.company_name}`);
            }
          } else {
            message.push(`${humanize(key)} update from ${originalObject[key]} to ${objectsData[key]}`);
          }
        }
      }
    });

    let captureMessage;

    if (roleInfo !== '') {
      message.push(roleInfo);
    }

    if (String(req.user._id) === String(id)) {
      captureMessage = `${req.user.first_name} ${req.user.last_name} has updated the below  account information:`;
    } else {
      captureMessage = `${req.user.first_name} ${req.user.last_name} has updated ${user.first_name} ${user.last_name}'s below information:`;
    }
    setTimeout(async function () {
      if (message.length > 0) {
        await Logging.create({
          logType: 'USER_UPDATED_BY',
          createdBy: req.user._id,
          createdFor: req.user._id === originalObject._id ? req.user._id : originalObject._id,
          modelType: 'USER',
          message: captureMessage,
          read: message,
        });
      }
    }, 3000);
    // }
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

function difference(origObj, newObj) {
  function changes(newObj, origObj) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        result[resultKey] = isObject(value) && isObject(origObj[key]) ? changes(value, origObj[key]) : value;
      }
    });
  }
  return changes(newObj, origObj);
}

function checkIfCamelCase(name) {
  return !name.match(/[\s_-]/g);
}
async function getManagerName(manager_id) {
  try {
    const users = await UsersModel.findOne({
      _id: ObjectId(manager_id),
    }).select({ first_name: 1, last_name: 1 });

    if (users) {
      return users.first_name + ' ' + users.last_name;
    } else {
      return ' ';
    }
  } catch (error) {
    console.log(error);
  }
}

function humanize(str) {
  var i,
    frags = str.split('_');
  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toLowerCase() + frags[i].slice(1);
  }
}

function camelCaseToString(strs) {
  return strs.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase();
  });
}
module.exports = router;
