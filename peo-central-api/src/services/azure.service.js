const { msalClient } = require("../config/azureADConfig")
const msal = require("@azure/msal-node")
const cryptoProvider = new msal.CryptoProvider();
const { MsAuthToken, Users } = require("../models");
const usersService = require('./users.service')
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const config = require("../config/config")
const axios = require('axios')
const { tokenService } = require("../services")

var { verifier, challenge } = "";

async function generatePKCEToken() {
    let a = await cryptoProvider.generatePkceCodes()
    verifier = a.verifier
    challenge = a.challenge
}

const redirectToMSLoginPage = async () => {
    try {
        await generatePKCEToken()
        const url = await msalClient.getAuthCodeUrl({
            redirectUri: config.azure.redirect_url,
            scopes: config.azure.scopes.split(','),
            responseMode: 'form_post',
            codeChallenge: challenge,
            codeChallengeMethod: "S256"
        })
        return url
    } catch (error) {
        throw error
    }
}

const getTokenFromAuthCode = async (body) => {
    let code = await msalClient.acquireTokenByCode({
        code: body.code,
        redirectUri: process.env.MSAZURE_REDIRECT_URI,
        codeVerifier: verifier,
    })
    return code
}

const authenticateUser = async (email, accessToken, idToken, accountObject) => {
    try {
        let user = await Users.findOne({ email: email })

        if (user === null) {
            throw new Error("User Not found")
        }

        const user_access = (await getUserByEmailErp(email?.toLowerCase()))[0];

        if (!user_access) {
            throw new Error("Access Restricted")
        }

        let storedToken = await MsAuthToken.updateOne({
            email: email,
        }, {
            email: email,
            accessToken: accessToken,
            idToken: idToken,
            user_id: mongoose.Types.ObjectId(user._id),
            accountObject: accountObject
        }, { upsert: true })

        return idToken

    } catch (error) {
        return null
    }
}

const authorizeUser = async (idToken) => {
    try {
        const storedToken = await MsAuthToken.findOne({ idToken: idToken })

        if (!storedToken) {
            return null
        }

        let user = await Users.findOne({ email: storedToken.email?.toLowerCase() })
        let userLogin = await usersService.userLoginAzure(user)

        let response = userLogin
        return response

    } catch (error) {
        throw error
    }
}

const getToken = async (username, password) => {
    const base_url = config.logins.base_url_erp + "/get_token";
    const token = await axios.post(base_url, {
        username,
        password
    })

    return token.data.token
}


const getUserByEmailErp = async (email) => {

    const token = await getToken(config.logins.username, config.logins.password)
    let headers = {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
    const users = await axios.get(`${config.logins.base_url_erp}/app/access?email=${email}&app_id=664cabe0b7234e2037802bd0`, headers)

    return users.data
}

generatePKCEToken()

module.exports = {
    getUserByEmailErp,
    redirectToMSLoginPage,
    getTokenFromAuthCode,
    authenticateUser,
    authorizeUser
}