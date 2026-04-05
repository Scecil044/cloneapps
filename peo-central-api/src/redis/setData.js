const express = require('express')
const router = express.Router();
const config = require('../config/config');
const Redis = require("ioredis");
const redis = new Redis({
    host : config.redis.REDIS_HOST,
    port : config.redis.REDIS_PORT,
    no_ready_check: true,
    auth_pass: 'Q+Aa/sEmu39maIa5nw5tG/dg3gi8qfp75dmUTsrR/o69GryVdBFW14g00+wrUsQlsdQDkKqzgZ9GoWsJ'
})
const ConfigurationModel = require('../models/configuration.model')
const userModel = require('../models/users.model')
const {  Companies, Configurations} = require('../models');

// const validateToken = require('../utils').validateAccessToken;
const jwt = require('jsonwebtoken')
const CryptoJS = require('crypto-js');
const ENCRYPTSECRET_KEY = process.env.ENCRYPTSECRET_KEY;

/**
 * * SET LOGGEDIN  USER
 */
router.post('/setLogin', async (req, res) => {
    try {
        let body = req.body
        const conf = await redis.set(body._id, JSON.stringify(body))
        res.json(conf)

    } catch (err) {
        res.json({ message: err.message })
    }
})


router.get('/update_user_count', async (req, res) => {

    try {

        const token = req.headers.authorization.split(' ')[1]
        const option = {
            expiresIn: '2d'
        }
        let result = jwt.verify(token, process.env.JWT_SECRET, option);
        let userId = result._id
        const loginData = await redis.get(userId)
        let loginRes = JSON.parse(loginData)

        const userCount = await ConfigurationModel.aggregate([{ $project: { update_count: 1 } }])
        const userData = await userModel.find({_id: ObjectId(userId)})
        loginRes.userCount = userCount[0].update_count
        loginRes.user = userData[0]

        const conf = await redis.set(userId, JSON.stringify(loginRes))
        res.json(JSON.parse(loginData))
    } catch (err) {

        res.json({ message: err.message })

    }

})

router.get('/update_config_count', async (req, res) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        const option = {
            expiresIn: '2d'
        }
        let result = jwt.verify(token, process.env.JWT_SECRET, option);
        let userId = result._id

        const loginData = await redis.get(userId)
        let loginRes = JSON.parse(loginData)

        const configCount = await ConfigurationModel.aggregate([{ $project: { config_update_count: 1 } }])

        loginRes.configCount = configCount[0].config_update_count

        const conf = await redis.set(userId, JSON.stringify(loginRes))
        res.json(JSON.parse(loginData))

    } catch (err) {
        res.json({ message: err.message })
    }
})

router.post('/selected_company', async (req, res) => {
    try {
        const body = req.body

        const token = req.headers.authorization.split(' ')[1]
        const option = {
            expiresIn: '2d'
        }
        let result = jwt.verify(token, process.env.JWT_SECRET, option);
        let userId = result._id

        const loginData = await redis.get(userId)
        let loginRes = JSON.parse(loginData)

        loginRes.selected_company = body

        const conf = await redis.set(userId, JSON.stringify(loginRes))
        res.json(JSON.parse(loginData))

    } catch (err) {
        res.json({ message: err.message })
    }
})


router.post('/setConfiguration' , async (req , res) => {
    try {

        const conf = await Configurations.find();

        if (conf && conf.length > 0) {
            let confEncrypted = CryptoJS.AES.encrypt(JSON.stringify(conf), ENCRYPTSECRET_KEY).toString();
            await redis.set('configuration', confEncrypted);
          }
          res.json("Success")
      
    } catch (error) {
        console.log(error)
    }
})


router.post('/setCompanies' , async (req , res) => {
    try {

        const AllCompanies = await Companies.find();

        if (AllCompanies && AllCompanies.length > 0) {
            let confEncrypted = CryptoJS.AES.encrypt(JSON.stringify(AllCompanies), ENCRYPTSECRET_KEY).toString();
            await redis.set('companies', confEncrypted);
          }

          res.json("Success")
      
    } catch (error) {
        console.log(error)
    }
})


module.exports = router