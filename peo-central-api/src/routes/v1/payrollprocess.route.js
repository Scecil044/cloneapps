const express = require("express")
const router = express.Router()
const validateToken = require('../../../utils').validateAccessToken
const validateRefreshToken = require('../../../utils').validateRefreshToken
const validateSecretKey = require('../../../utils').validateSecretKey;
const UsersModel = require("../../models/users.model");
const PayrollProcessModel = require("../../models/payrollprocess.model");
const PayslipsModel = require("../../models/payslips.model");
const { ObjectId } = require('mongodb');


//TODO: import payslip model here


router.get("/all", async (req, res) => {
    try {
        const payrollprocess = await PayrollProcessModel.find();
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/all/:company_id", async (req, res) => {
    const company_id = req.params.company_id;

    try {
        const payrollprocess = await PayrollProcessModel.find({
            company_id: company_id,
        });
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/all/keys/:company_id", async (req, res) => {
    const company_id = req.params.company_id;
    try {
        const payrollprocess = await PayrollProcessModel.find({
            company_id: company_id,
        }).select({
            _id: 1,
            pay_month: 1,
            approved_by_id: 1,
            createdDate: 1,
            status: 1,
            compensation: 1,
            submit_for_approval: 1,
            approvals: 1,
            closedDate: 1,
            company_id: 1,
            payrollRun: 1,
        });
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/active/all/keys", async (req, res) => {
    try {
        const payrollprocess = await PayrollProcessModel.find({
            status: "inactive",
        }).select({
            _id: 1,
            pay_month: 1,
            approved_by_id: 1,
            createdDate: 1,
            status: 1,
            compensation: 1,
            submit_for_approval: 1,
            approvals: 1,
            closedDate: 1,
        });
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/active/all/keys/:company_id", async (req, res) => {
    const company_id = req.params.company_id;
    try {
        const payrollprocess = await PayrollProcessModel.find({
            status: "inactive",
            company_id: company_id,
        }).select({
            _id: 1,
            pay_month: 1,
            approved_by_id: 1,
            createdDate: 1,
            status: 1,
            compensation: 1,
            submit_for_approval: 1,
            approvals: 1,
            closedDate: 1,
            company_id: 1,
        });
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/active/pay_month", async (req, res) => {
    try {
        const payrollprocess = await PayrollProcessModel.find({
            status: "active",
        }).select({ _id: 1, pay_month: 1 });
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get("/user/:_id", async (req, res) => {
    const id = req.params._id;
    try {
        var user = [];
        const payrollprocess = await PayrollProcessModel.find({ user_id: id }).sort(
            { createdDate: 1 }
        );
        res.json(payrollprocess);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/process/:_id", async (req, res) => {
    const id = req.params._id;

    try {
        const process = await PayrollProcessModel.find({ _id: id });
        res.json(process);
    } catch (error) {
        res.send(error);
    }
});

router.get("/closed", async (req, res) => {
    try {
        const requests = await PayrollProcessModel.find({ status: "Inactive" });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put("/update/:_id", async (req, res, next) => {
    const id = req.params._id;
    // const process = await PayrollProcessModel.findByIdAndUpdate(id, req.body, function (err, post) {
    //     if (err) return next(err);
    //     console.log(post)
    //     res.json(post);
    // });
    try {
        const process = await PayrollProcessModel.findByIdAndUpdate(id, {
            ...req.body,
        });
        res.json(process);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/update/:_id', async (req, res, next) => {
  const id = req.params._id;
  try {
    // Build update operations based on what's provided in req.body
    const updateOps = {};

    // Handle simple field updates
    const simpleFields = [
      'pay_month',
      'status',
      'approved_by_id',
      'compensation',
      'submit_for_approval',
      'closedDate',
      'company_id',
    ];

    simpleFields.forEach((field) => {
      if (req.body.hasOwnProperty(field)) {
        updateOps[field] = req.body[field];
      }
    });

    // Handle array operations for approvals
    if (req.body.approvals) {
      if (req.body.operation === 'push_approval') {
        updateOps.$push = { approvals: req.body.approvals };
      } else if (req.body.operation === 'set_approvals') {
        updateOps.approvals = req.body.approvals;
      } else {
        // Default behavior - replace approvals array
        updateOps.approvals = req.body.approvals;
      }
    }

    // Handle payrollRun array operations
    if (req.body.payrollRun) {
      if (req.body.operation === 'push_payroll_run') {
        updateOps.$push = updateOps.$push || {};
        updateOps.$push.payrollRun = req.body.payrollRun;
      } else if (req.body.operation === 'update_payroll_run_item') {
        // Update specific item in payrollRun array by index
        const { index, data } = req.body.payrollRunUpdate;
        if (index !== undefined && data) {
          Object.keys(data).forEach((key) => {
            updateOps[`payrollRun.${index}.${key}`] = data[key];
          });
        }
      } else if (req.body.operation === 'update_payroll_run_by_id') {
        // Update specific item in payrollRun array by _id
        const { runId, data } = req.body.payrollRunUpdate;
        if (runId && data) {
          Object.keys(data).forEach((key) => {
            updateOps[`payrollRun.$.${key}`] = data[key];
          });
        }
      } else if (req.body.operation === 'update_payroll_run_by_title') {
        // Update specific item in payrollRun array by title
        const { title, data } = req.body.payrollRunUpdate;
        if (title && data) {
          Object.keys(data).forEach((key) => {
            updateOps[`payrollRun.$.${key}`] = data[key];
          });
        }
      } else {
        // Default behavior - replace entire payrollRun array
        updateOps.payrollRun = req.body.payrollRun;
      }
    }

    // Handle nested object updates
    if (req.body.nestedUpdates) {
      Object.keys(req.body.nestedUpdates).forEach((path) => {
        updateOps[path] = req.body.nestedUpdates[path];
      });
    }

    // Set updatedDate
    updateOps.updatedDate = new Date();

    // Build query for array updates that use positional operator
    let query = { _id: id };
    if (req.body.operation === 'update_payroll_run_by_id' && req.body.payrollRunUpdate && req.body.payrollRunUpdate.runId) {
      query = { _id: id, 'payrollRun._id': req.body.payrollRunUpdate.runId };
    } else if (
      req.body.operation === 'update_payroll_run_by_title' &&
      req.body.payrollRunUpdate &&
      req.body.payrollRunUpdate.title
    ) {
      query = { _id: id, 'payrollRun.title': req.body.payrollRunUpdate.title };
    }

    const process = await PayrollProcessModel.findOneAndUpdate(query, updateOps, {
      new: true,
      runValidators: true,
    });

    if (!process) {
      return res.status(404).json({ message: 'Payroll process not found' });
    }

    res.json(process);
  } catch (error) {
    console.error('PATCH update error:', error);
    res.status(500).json({ message: 'Failed to update payroll process', error: error.message });
  }
});

router.post("/add-item", async (req, res) => {
    const payrollprocess = new PayrollProcessModel({
        ...req.body,
    });

    try {
        const newProcess = await payrollprocess.save();
        res.status(201).json(newProcess);
        res.send("Request saved");
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// get limited info for variance params - payrollprocessesall
router.post("/get-req-info-for-variance/:company_id", async (req, res) => {
    let body = req.body;
    const company_id = req.params.company_id;
    try {
        const process = await PayrollProcessModel.aggregate([
            { $match: { company_id: company_id } },
            { $project: body },
        ]);
        res.json(process);
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message });
    }
});

router.post("/getUsersSalaryPaidInfoFromMOLNumber/", async (req, res) => {
    try {
        let pay_month = req.body.data.pay_month;
        let molData = req.body.data.molData;
        let base_url = req.body.data.base_url;
        let actualUsersSalary = [];

        let PayslipsAllMOLS = await PayslipsModel.find({
            pay_month: pay_month,
        }).distinct("mol_wps_no");
        let salaryPaidAmount = await PayslipsModel.find({
            pay_month: pay_month,
        }).select({ mol_wps_no: 1, total_salary: 1 });
        let mol_data = molData;
        let match = {
            $match: {
                user_status: { $nin: ['inactive', 'Hold'] },
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
            },
        },
        };
        let unwindMOLWPSNO = {
        $unwind: {
            path: '$newDocument1.mol_wps_no',
            preserveNullAndEmptyArrays: true,
        },
        };
        let obj = {
        mol_wps_no: '$newDocument1.mol_wps_no.document_number',
        };
        let newBody = {
        "salary": 1,
        "documents": obj,
        "bank":1
        };
        let setDocumentsObj = {
        $set: {
            documents: '$newDocument',
        },
        };
        let project = {
        $project: newBody
        };  
        actualUsersSalary = await UsersModel.aggregate([
            match,
            documentsLookup,
            addFields,
            addFields2,
            unwindMOLWPSNO,
            setDocumentsObj,
            project
        ])
        if (mol_data && mol_data.length > 0) {
            for (let i = 0; i < mol_data.length; i++) {
                const element = mol_data[i];
                if (PayslipsAllMOLS.includes(element.person_code)) {
                    element.salary_status = "Paid";
                } else {
                    element.salary_status = "Not Paid";
                }
                if (actualUsersSalary && actualUsersSalary.length > 0) {
                    let filteredUser = actualUsersSalary.filter(
                        (a) => a.documents.mol_wps_no == element.person_code
                    );
                    if (filteredUser && filteredUser.length > 0) {
                        element.actual_total_fixed = filteredUser[0].salary.total_fixed;
                    } else element.actual_total_fixed = "";
                }
                if (salaryPaidAmount && salaryPaidAmount.length > 0) {
                    let filteredSalaryPaidUser = salaryPaidAmount.filter(
                        (a) => a.mol_wps_no == element.person_code
                    );
                    if (filteredSalaryPaidUser && filteredSalaryPaidUser.length > 0) {
                        element.paid_amount = filteredSalaryPaidUser[0].total_salary;
                    } else element.paid_amount = "";
                }
                if (
                    element &&
                    element.actual_total_fixed &&
                    Number(element.actual_total_fixed) >= 0 &&
                    element.paid_amount &&
                    Number(element.paid_amount) >= 0
                ) {
                    element.difference_in_salary =
                        Number(element.paid_amount) - Number(element.actual_total_fixed);
                }
                if (
                    element &&
                    element.hasOwnProperty("difference_in_salary") &&
                    element.difference_in_salary != undefined &&
                    element.difference_in_salary >= 0
                ) {
                    element.paid_status = "Paid Correct";
                } else if (
                    element &&
                    element.hasOwnProperty("difference_in_salary") &&
                    element.difference_in_salary != undefined &&
                    element.difference_in_salary < 0
                ) {
                    element.paid_status = "Paid Less";
                }
                if (mol_data.length == i + 1) {
                    res.status(200).json(mol_data);
                }
            }
        }
    } catch (error) {
        res.send(error);
    }
});

router.post('/get-users-salary-paid-info-from-mol-number', async (req, res) => {
    try {
        let pay_month = req.body.data.pay_month
        let molData = req.body.data.molData
        let base_url = req.body.data.base_url
        let actualUsersSalary = []

        let PayslipsAllMOLS = await PayslipsModel.find({ pay_month: pay_month }).distinct("mol_wps_no")
        let salaryPaidAmount = await PayslipsModel.find({ pay_month: pay_month }).select({ mol_wps_no: 1, total_salary: 1 })
        let mol_data = molData
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
            },
        },
        };
        let unwindMOLWPSNO = {
        $unwind: {
            path: '$newDocument1.mol_wps_no',
            preserveNullAndEmptyArrays: true,
        },
        };
        let obj = {
        mol_wps_no: '$newDocument1.mol_wps_no.document_number',
        };
        let newBody = {
        "salary": 1,
        "documents": obj,
        "bank":1
        };
        let setDocumentsObj = {
        $set: {
            documents: '$newDocument',
        },
        };
        let project = {
        $project: newBody
        };  
        actualUsersSalary = await UsersModel.aggregate([
            documentsLookup,
            addFields,
            addFields2,
            unwindMOLWPSNO,
            setDocumentsObj,
            project
        ])
        for (let i = 0; i < mol_data.length; i++) {
            const element = mol_data[i];
            if (PayslipsAllMOLS.includes(element.person_code)) {
                element.salary_status = "Paid"
            } else {
                element.salary_status = "Not Paid"
                element.paid_amount = 0
            }
            if (actualUsersSalary && actualUsersSalary.length > 0) {
                let filteredUser = actualUsersSalary.filter(a => a.documents.mol_wps_no == element.person_code)
                if (filteredUser && filteredUser.length > 0) {
                    element.actual_total_fixed = filteredUser[0].salary.total_fixed
                    element.user_id = filteredUser[0]._id
                    element.isRotation = filteredUser[0].bank && filteredUser[0].bank.isRotation ? 'Rotation' : "Actual"
                    element.iban = filteredUser[0].bank && filteredUser[0].bank.iban ? filteredUser[0].bank.iban : ""
                } else {
                    element.actual_total_fixed = ""
                    element.user_id = ""
                    element.isRotation = ""
                    element.iban = ""

                }
            }
            if (salaryPaidAmount && salaryPaidAmount.length > 0) {
                let filteredSalaryPaidUser = salaryPaidAmount.filter(a => a.mol_wps_no == element.person_code)
                if (filteredSalaryPaidUser && filteredSalaryPaidUser.length > 0) {
                    element.paid_amount = filteredSalaryPaidUser[0].total_salary
                } else element.paid_amount = 0
            } else element.paid_amount = 0
            if (element && element.actual_total_fixed && Number(element.actual_total_fixed) >= 0 && element.paid_amount && Number(element.paid_amount) >= 0) {
                element.difference_in_salary = Number(element.paid_amount) - Number(element.actual_total_fixed)
            }
            if (element && element.hasOwnProperty('difference_in_salary') && element.difference_in_salary != undefined && (element.difference_in_salary) >= 0) {
                element.paid_status = "Paid Correct"
            } else if (element && element.hasOwnProperty('difference_in_salary') && element.difference_in_salary != undefined && (element.difference_in_salary) < 0) {
                element.paid_status = "Paid Less"
            }
            if (mol_data.length == i + 1) {
                res.status(200).json(mol_data)
            }
        }



    } catch (error) {
        res.send(error)
    }
})
router.post('/getUpdatedMolDataPaidNotPaid', async (req, res) => {
    try {
        const pay_month = req.body.pay_month
        const molData = req.body.molData
        let PayslipsAllMOLS = await PayslipsModel.find({ pay_month: pay_month }).distinct("mol_wps_no")
        let salaryPaidAmount = await PayslipsModel.find({ pay_month: pay_month }).select({ mol_wps_no: 1, total_salary: 1 })
        let match = {
            $match: {
              user_status: { $nin: ['inactive', 'Hold'] },
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
            },
        },
        };
        let unwindMOLWPSNO = {
        $unwind: {
            path: '$newDocument1.mol_wps_no',
            preserveNullAndEmptyArrays: true,
        },
        };
        let obj = {
        mol_wps_no: '$newDocument1.mol_wps_no.document_number',
        };
        let newBody = {
        "salary": 1,
        "documents": obj
        };
        
        let setDocumentsObj = {
        $set: {
            documents: '$newDocument',
        },
        };
        let project = { $project: newBody };  
        let actualUsersSalary = await UsersModel.aggregate([
            match,
            documentsLookup,
            addFields,
            addFields2,
            unwindMOLWPSNO,
            setDocumentsObj,
            project
        ])
        if (molData && molData.length > 0) {
            for (let i = 0; i < molData.length; i++) {
                const element = molData[i];
                if (PayslipsAllMOLS.includes(element.person_code)) {
                    element.salary_status = "Paid"
                } else {
                    element.salary_status = "Not Paid"
                }
                if (actualUsersSalary && actualUsersSalary.length > 0) {
                    let filteredUser = actualUsersSalary.filter(a => a.documents.mol_wps_no == element.person_code)
                    if (filteredUser && filteredUser.length > 0) {
                        element.actual_total_fixed = filteredUser[0].salary.total_fixed
                        element.user_id = filteredUser[0]._id
                    } else {
                        element.actual_total_fixed = ""
                        element.user_id = ""
                    }
                }
                if (salaryPaidAmount && salaryPaidAmount.length > 0) {
                    let filteredSalaryPaidUser = salaryPaidAmount.filter(a => a.mol_wps_no == element.person_code)
                    if (filteredSalaryPaidUser && filteredSalaryPaidUser.length > 0) {
                        element.paid_amount = filteredSalaryPaidUser[0].total_salary
                    } else element.paid_amount = ""
                }
                if (element && element.actual_total_fixed && Number(element.actual_total_fixed) >= 0 && element.paid_amount && Number(element.paid_amount) >= 0) {
                    element.difference_in_salary = Number(element.paid_amount) - Number(element.actual_total_fixed)
                }
                if (element && element.hasOwnProperty('difference_in_salary') && element.difference_in_salary != undefined && (element.difference_in_salary) >= 0) {
                    element.paid_status = "Paid Correct"
                } else if (element && element.hasOwnProperty('difference_in_salary') && element.difference_in_salary != undefined && (element.difference_in_salary) < 0) {
                    element.paid_status = "Paid Less"
                }
                if (molData.length == i + 1) {
                    res.status(200).json(molData)
                }
            }
        }
    } catch (error) {
        res.send(error)
    }
})

router.post('/active/all/keys/selected/:company_id', async (req, res) => {
    let body = req.body
    const company_id = req.params.company_id;
    try {
      const payrollprocess = await PayrollProcessModel.find({
        status: "active",
        company_id: company_id,
      }).select(body);
      res.json(payrollprocess);
    } catch (error) {
      console.log("#log", error);
      res.status(500).json({ message: error.message });
    }
})



module.exports = router