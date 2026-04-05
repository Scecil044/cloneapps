const moment = require('moment');
const { Token } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Roles = require('./roles.model');
const { toJSON, paginate, deletion } = require('./plugins');

const mongoose = require('mongoose');

const PocSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      // required: 
    },
    designation: {
      type: String,
      // required: true
    },
    department: {
      type: String,
      // required: true
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Companies'
    },
    role_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roles'
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive']
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    image_url: {
        type: String,
        default: "https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1737012110228_download.png/download.png"
      },
      created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
  },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
  },
  },
  { timestamps: true }
);

PocSchema.methods.generateAuthTokens = async function () {
  const user = this;
  /* Access token generation */
  const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
  const accessPayload = {
    _id: user._id,
    role_id: user.role_ID,
    iat: moment().unix(),
    exp: accessTokenExpires.unix(),
    type: 'access'
  };
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET_API);

  /* Refresh token generation */
  const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_HOURS, 'hours');

  const refreshPayload = {
    _id: user._id,
    role_id: user.role_ID,
    iat: moment().unix(),
    exp: refreshTokenExpires.unix(),
    type: 'refresh'
  };

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET_API);

  let token = {
    blacklisted: false,
    token: refreshToken,
    user: user._id,
    role: user.role_ID,
    expires: refreshTokenExpires,
    type: 'refresh'
  };

  const token_insert = new Token(token);
  let insertToken = await token_insert.save();
  // await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, false, isFreelancer);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate()
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate()
    }
  };
};

PocSchema.plugin(toJSON);
PocSchema.plugin(paginate);
PocSchema.plugin(deletion);

PocSchema.index({is_deleted: 1});

const Poc = mongoose.model('Poc', PocSchema);
module.exports = Poc;
