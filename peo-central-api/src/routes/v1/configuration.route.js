const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { configurationController } = require("../../controllers");
const validateToken = require('../../../utils').validateAccessToken
const validateRefreshToken = require('../../../utils').validateRefreshToken
const validateSecretKey = require('../../../utils').validateSecretKey;
const UsersModel = require('../../models/users.model')
const ConfigurationModel = require('../../models/configuration.model');
const validate = require('../../middlewares/validate');
const { configValidations } = require('../../validations')
const axios = require("axios");

router
    .route("/").all(verifyToken)
    .get(configurationController.getconfig)

router
    .route("/modules").all(verifyToken)
    .get(configurationController.getmodules)

router
    .route("/visasponsors").all(verifyToken)
    .get(configurationController.getVisaSponsors)

router
    .route("/medial/tawjeeh/eid/list").all(verifyToken)
    .get(configurationController.getMedicalTawheehAndEidCenters)

router
    .route("/update/products/and/services").all(verifyToken)
    .put(validate(configValidations.updateProductsAndServices),configurationController.updateProductsAndServices)


// ************* Payroll API'S Starts Here  *************
// new ui

// get limited config
router.post('/get-req-conf', async (req, res) => {
    let body = req.body
    try {
        const config = await ConfigurationModel.aggregate([{ $project: body }])
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/update_count', async (req, res) => {
    try {
        const config = await ConfigurationModel.aggregate([{ $project: { update_count: 1, config_update_count: 1 } }])
        res.status(200).json(config)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
// new ui ends

router.get('/NNCentralSalaryConfigurations', async (req, res) => {
    try {
        await axios.get(process.env.NN_CENTRAL_URL + "/salaryConfigurations")
            .then(async msgResp => {
                res.json(msgResp.data)
            })
            .catch((e) => {
                res.json([])
            })
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/NNCentralConfigurations/banks', async (req, res) => {
    try {
        await axios.get(process.env.NN_CENTRAL_URL + "/banks")
            .then(async msgResp => {
                res.json(msgResp.data)
            })
            .catch((e) => {
                res.json([])
            })
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/all', async (req, res) => {
    try {
        const config = await ConfigurationModel.find()
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})
router.get('/payrollConfiguration', async (req, res) => {
    try {
        const config = await ConfigurationModel.find({ "name": "Payroll Configuration" })
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

// get limited config
router.post('/payrollConfiguration/get-req-conf', async (req, res) => {

    let body = req.body
    try {
        const config = await ConfigurationModel.aggregate([{ $project: body }])
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})


router.get('/company/:_id', async (req, res) => {
    const id = req.params._id
    try {
        const config = await ConfigurationModel.find({ "comany_id": id })
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/all/encrypt', async (req, res) => {
    try {
        const config = await ConfigurationModel.find({})
        let confEncrypted = CryptoJS.AES.encrypt(JSON.stringify(config), SECRET_KEY).toString()
        res.json(confEncrypted)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/all/encrypt/:_category', async (req, res) => {
    const category = req.params._category
    try {
        const config = await ConfigurationModel.find({ 'category': category })
        let confEncrypted = CryptoJS.AES.encrypt(JSON.stringify(config), SECRET_KEY).toString()
        res.json(confEncrypted)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/:_id', async (req, res) => {
    const id = req.params._id
    try {
        const config = await ConfigurationModel.find({ "_id": id })
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/get-stories/:_id', async (req, res) => {
    const id = req.params._id
    try {
        const config = await ConfigurationModel.find({ "stories.id": id })
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

router.get('/user/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        var user = [];
        const config = await ConfigurationModel.find({ "user_id": id }).sort({ createdDate: 1 })
        res.json(config)
    } catch (error) {
        console.log("#log", error);
        res.status(500).json({ message: error.message })
    }
})

// router.put('/:_id', (req, res, next) => {
//     const id = req.params._id;
//     const process = ConfigurationModel.findByIdAndUpdate(id, req.body, function (err, post) {
//         if (err) return next(err);
//         res.json(post);
//     });
// })

router.put('/update/:_id', async (req, res, next) => {
    const id = req.params._id;
    const filter = { _id: id };
    try {
        const user = await ConfigurationModel.findOneAndUpdate(filter, { ...req.body[0] });
        res.status(200).send('Successfuly Updated');
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/add-item', async (req, res) => {

    const config = new ConfigurationModel({
        ...req.body
    })

    try {
        const newProcess = await config.save()
        res.status(201).json(newProcess)
        res.send('Request saved')
    } catch (error) {
        console.log("#log", error);
        res.status(400).json({ message: error.message })
    }
})

/** Upload files in AWS */
router.post('/upload-files', async (req, res) => {
    try {
        const s3 = new AWS.S3({
            // accessKeyId: ID,
            // secretAccessKey: SECRET
        });
        const fileContent = fs.readFileSync(req.files.a.tempFilePath);

        const params = {
            Bucket: BUCKET_NAME + '/' + req.body.folder,
            Key: req.files.a.name,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: req.files.a.mimetype
        };

        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
            if (err) {
                throw err;
            }
            else {
                // console.log(res)
                res.json({ name: params.Key, url: data.Location })
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });
    } catch (error) {
        console.log("#log", error);
        res.status(400).json({ message: error.message })
    }
})
// ************* Payroll API'S Ends Here    *************


module.exports = router
