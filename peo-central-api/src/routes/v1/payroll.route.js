const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { payItemsController } = require("../../controllers");
const PayrollprocessesModel = require('../../models/payrollprocess.model')
const PayrollModel = require('../../models/payroll.model')


router.get('/all', async (req, res) => {
    console.log("inside API --->", PayrollModel)
    try {
        const payroll = await PayrollModel.find().sort({ 'pay_month': 'desc' })
        res.json(payroll)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/all/:company_id', async (req, res) => {
    try {
        const company_id = req.params.company_id
        const payroll = await PayrollModel.find({ company_id: company_id }).sort({ 'pay_month': 'desc' })
        res.json(payroll)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/all-payitems/count/:company_id', async (req, res) => {
    const company_id = req.params.company_id

    try {
        const payroll = await PayrollModel.find({ company_id: company_id }).countDocuments()
        res.json(payroll)

    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/payitems/distinct', async (req, res) => {
    try {
        const payroll = await PayrollModel.distinct('pay_month')
        res.json(payroll)
    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/recursives/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        var user = [];
        const payroll = await PayrollModel.find({ "recursive_id": id }).sort({ pay_month: 1 })
        res.json(payroll)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/user/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        var user = [];
        const payroll = await PayrollModel.find({ "user_id": id }).sort({ createdDate: 1 })
        res.json(payroll)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/month/:_id', async (req, res) => {
    const id = req.params._id
    try {
        let month = await PayrollprocessesModel.find({ "_id": id })
        const process = await PayrollModel.find({ "pay_month": month[0].pay_month })
        res.json(process)
    } catch (error) {
        res.send(error)
    }
})

router.get('/month/:_id/:company_id', async (req, res) => {
    const id = req.params._id
    const company_id = req.params.company_id
    try {
        let month = await PayrollprocessesModel.find({ "_id": id })
        const process = await PayrollModel.find({ "pay_month": month[0].pay_month, company_id: company_id })
        res.json(process)
    } catch (error) {
        res.send(error)
    }
})

router.get('/:_id', async (req, res) => {
    const id = req.params._id

    try {
        const process = await PayrollModel.find({ "_id": id })
        res.json(process)
    } catch (error) {
        res.send(error)
    }
})

router.get('/active', async (req, res) => {
    try {
        const requests = await PayrollModel.find({ status: "active" })
        res.status(200).json(requests)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/pending/all', async (req, res) => {
    let pending = 'pending'
    try {
        const payroll = await PayrollModel.find({ "status": pending })
        res.json(payroll)

    } catch (error) {
        res.status(500).send(error)
    }
})

// pending-approval/month-wise/count/
router.get('/pending-approval/month-wise/count/:pay_month', async (req, res) => {
    const pay_month = req.params.pay_month
    try {
        const process = await PayrollModel.find({ pay_month: pay_month, status: "pending" }).countDocuments()
        res.json(process)
    } catch (error) {
        res.send(error)
    }
})

router.get('/pending-approval/count/:company_id', async (req, res) => {
    const company_id = req.params.company_id
    let pending = 'pending'
    try {
        const payroll = await PayrollModel.find({ "status": pending, company_id: company_id }).countDocuments()
        res.json(payroll)

    } catch (error) {
        res.status(500).send(error)
    }
})


router.put('/:_id', (req, res, next) => {
    const id = req.params._id;
    const process = PayrollModel.findByIdAndUpdate(id, req.body, function (err, post) {
        //const process = PayrollModel.findOneAndReplace({_id:id}, {process_name: req.body.process_name, process_status: req.body.process_status}, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
})

router.post('/add-item', async (req, res) => {

    const payroll = new PayrollModel({
        ...req.body
    })

    try {
        const newProcess = await payroll.save()
        res.status(201).json(newProcess)
        res.send('Request saved')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router