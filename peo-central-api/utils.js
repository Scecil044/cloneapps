const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const User = require('./src/models/users.model');
const axios = require('axios');
const Token = require('./src/models/token.model');

module.exports = {
  validateToken: async (req, res, next) => {
    let result;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      const token = req.headers.authorization.split(' ')[1] || req.headers.Authorization.split(' ')[1];
      const option = {
        expiresIn: '2d',
        //issuer: 'https://client.nathanhr.ae'
      };

      try {
        result = jwt.verify(token, process.env.JWT_KEY, option);
        // console.log('result -->', result);
        if (result._id) {
          req.user = await User.findById(result._id).select('_id first_name last_name').exec();
        }
        req.decode = result;
        next();
      } catch (err) {
        res.status(500).send(err);
      }
    } else {
      result = {
        error: `Authentication error. Token required`,
        status: 401,
      };
      res.status(500).send(result);
    }
  },
  validateAccessToken: async (req, res, next) => {
    // console.log('inside ValidateToken');

    let payload;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader) {
      const token = req.headers.authorization.split(' ')[1] || req.headers.Authorization.split(' ')[1];

      try {
        payload = jwt.verify(token, process.env.JWT_SECRET_API);

        // console.log('payload -->', payload);
        // console.log('User -->', User);

        const user = await User.findById(payload._id).select('_id first_name last_name').exec();
        // console.log('user -->', user);

        req.decode = payload;
        if (user) {
          req.user = user;
          next();
        } else {
          res.status(500).send('User not found');
        }
      } catch (err) {
        res.status(401).send(err);
      }
    } else {
      payload = {
        error: `Authentication error. Token required`,
        status: 401,
      };
      res.status(500).send(payload);
    }
  },
  validateRefreshToken: async (req, res, next) => {
    let payload;
    const authHeader = req.body.refreshToken;

    if (authHeader) {
      const token = req.body.refreshToken;

      try {
        const type = 'refresh';
        const refreshTokenDoc = await verifyToken(token, type);

        if (!refreshTokenDoc) {
          res.status(401).send('User not found');
        } else {
          req.user = refreshTokenDoc.user;
          next();
        }
      } catch (err) {
        res.status(401).send(err);
      }
    } else {
      payload = {
        error: `Authentication error. Token required`,
        status: 401,
      };
      res.status(401).send(payload);
    }
  },
  validateSecretKey: (val) => {
    let id = CryptoJS.SHA256(process.env.Crypto_Val).toString(CryptoJS.enc.Hex);
    try {
      if (id == val) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  },
  sms: async (num, message, token) => {
    num = num.replace('+', '');

    const date = new Date();
    date.setHours(date.getHours() + 1);
    const expiryDt = date.toISOString();
    const resMessage = await axios({
      method: 'post',
      url: 'https://smartmessaging.etisalat.ae:5676/campaigns/submissions/sms/nb',
      headers: { Authorization: `Bearer ${token}` },
      data: {
        msgCategory: '4.2',
        contentType: '3.1',
        senderAddr: 'TEAMNATHAN', //DYNAMICFREE , Hello
        dndCategory: 'Campaign',
        priority: 1,
        schTime: '',
        expiryDt: expiryDt,
        desc: 'This is the description for campaign',
        campaignName: 'test campaign',
        recipient: num,
        msg: message,
      },
    });
    // console.log(resMessage, "resMessage")
  },
  smsSendProvider: async (num, message, token) => {

    num.map( async (number) => {
      number = number.replace('+', '');
      const date = new Date();  
      date.setHours(date.getHours() + 1);
      const expiryDt = date.toISOString();
      const resMessage = await axios({
        method: 'post',
        url: 'https://smartmessaging.etisalat.ae:5676/campaigns/submissions/sms/nb',
        headers: { Authorization: `Bearer ${token}` },
        data: {
          msgCategory: '4.2',
          contentType: '3.1',
          senderAddr: 'TEAMNATHAN', //DYNAMICFREE , Hello
          dndCategory: 'Campaign',
          priority: 1,
          schTime: '',
          expiryDt: expiryDt,
          desc: 'This is the description for campaign',
          campaignName: 'test campaign',
          recipient: number,
          msg: message,
        },
      });
      // console.log(resMessage, "resMessage")
    })


    
  },
  generateSmsToken: async () => {
    const resToken = await axios({
      method: 'post',
      url: 'https://smartmessaging.etisalat.ae:9093/marvel/login/user',
      data: { "username": "voltaire", "password": "voltaire@123" },
    })
    // console.log(resToken , 'resToken')
    return resToken.data.token;
  },
  logout: async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
    if (!refreshTokenDoc) {
      return 'Not found';
    }
    await refreshTokenDoc.remove();
  },
};
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, process.env.JWT_KEY);
  const tokenDoc = await Token.findOne({ token, type, user: payload._id, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};
