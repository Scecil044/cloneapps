const express = require('express')
const router = express.Router();
const config = require('../config/config');
const Redis = require("ioredis");
const redis = Redis.createClient({
    host : config.redis.REDIS_HOST,
    port : config.redis.REDIS_PORT,
    // host: '127.0.0.1',
    no_ready_check: true,
    auth_pass: 'Q+Aa/sEmu39maIa5nw5tG/dg3gi8qfp75dmUTsrR/o69GryVdBFW14g00+wrUsQlsdQDkKqzgZ9GoWsJ'
})
// const validateToken = require('../utils').validateAccessToken;
const jwt = require('jsonwebtoken')
/**
 * * SET CONFIGURATION
 */
router.get('/getConf', async (req, res) => {
    try {
        const conf = await redis.get("configuration")
        // console.log(conf , "Conference")        
        return res.json(conf)

    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/getCompanies', async (req, res) => {
    try {
        const conf = await redis.get("companies")
        // console.log(conf , "Conference")        
        return res.json(conf)

    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/getUsers', async (req, res) => {
    try {
        const conf = await redis.get("users")
        res.json(conf)

    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/getLogin', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        // console.log(token , "|Token")
        const option = {
            expiresIn: '2d'
        }
        let result = jwt.verify(token, process.env.JWT_SECRET, option);
        let userId = result._id
        console.log(userId, "userId")
        const loginData = await redis.get(userId)
        console.log(loginData, "loginData")
        res.json(JSON.parse(loginData))

    } catch (err) {
        res.json({ message: err.message })
    }
})

router.get('/updateLogin', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const option = {
            expiresIn: '2d'
        }
        let result = jwt.verify(token, process.env.JWT_SECRET, option);
        let userId = result._id

        const loginData = await redis.get(userId)
        let loginRes = JSON.parse(loginData)
        loginRes.firstLogin = true
        loginRes.user.firstLogin = true
        const conf = await redis.set(userId, JSON.stringify(loginRes))
        res.json(JSON.parse(loginData))

    } catch (err) {
        res.json({ message: err.message })
    }
})


module.exports = router