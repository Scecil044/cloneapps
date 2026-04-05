const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const { Token } = require('../models');

// function to find user by email and password
const findByCredentials = async (email, password) => {
  try {
    console.log(email, password, "from find by credentials")
    const isUser = await Users.findOne({ email, user_status: { $nin: ['offboarding'] } });
    if(!isUser) return null
    if(isUser && isUser.is_internal_staff && isUser.is_internal_staff ===false && isUser.hasPortalAccess === false){
      return null
    }
    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch) return null;

    return isUser;
  } catch (error) {
    console.log(error, "this is the error from find by credentials");
    throw new Error(error);
  }
};

// function to find user by email
const findByEmail = async (email) => {
  try {
    const isUser = await Users.findOne({ email, user_status: { $ne: 'inactive' } });

    if (!isUser) {
      throw new Error({ error: 'User not found!ßß' });
    }
    return isUser;
  } catch (error) {
    throw new Error({ error: 'Something went wrong, could not find user by email' });
  }
};

/*
  Use this service if requests take a lot of time
  controller implementations should parse user as function params
*/
const generateAuthTokens = async (user) => {
  /* Access token generation */
  const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
  const accessPayload = {
    _id: user._id,
    role_id: user.role_ID,
    iat: moment().unix(),
    exp: accessTokenExpires.unix(),
    type: 'access',
  };
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET_API);

  /* Refresh token generation */
  const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_HOURS, 'hours');

  const refreshPayload = {
    _id: user._id,
    role_id: user.role_ID,
    iat: moment().unix(),
    exp: refreshTokenExpires.unix(),
    type: 'refresh',
  };

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET_API);

  let token = {
    blacklisted: false,
    token: refreshToken,
    user: user._id,
    role: user.role_ID,
    expires: refreshTokenExpires,
    type: 'refresh',
  };

  const token_insert = new Token(token);
  let insertToken = await token_insert.save();
  // await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, false, isFreelancer);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

module.exports = {
  findByCredentials,
  findByEmail,
  generateAuthTokens,
};
