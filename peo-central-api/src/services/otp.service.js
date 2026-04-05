const axios = require("axios");
const crypto = require('crypto');
const { Otp } = require('../models');
const { ObjectId } = require('mongodb');
const moment = require('moment-timezone');
const config = require('../config/config');
/**
 * Generate a secure OTP
 * @returns {number} A 6-digit random OTP
 */
const GenerateOtp = () => {
    return crypto.randomInt(100000, 1000000); // Generates a number between 100000 and 999999
};

const verifyOtp = async (otp, id) => {
    try {
      const otpDoc = await Otp.findOne({ _id: ObjectId(id) });
      console.log(id, "the id")
      console.log(otpDoc,"00000000000000")
      if (!otpDoc) throw new Error(`Could not verify OTP!`);
  
      const nowTime = moment();
      const timeSpan = nowTime.diff(otpDoc.date, 'minutes');
  
      if (timeSpan > config.otp.otpCodeExpirationMinutes) {
        throw new Error('OTP Expired!');
      } else if (otpDoc.is_verified) {
        throw new Error('OTP has already been used');
      } else if (otpDoc.otp !== otp) {
        throw new Error('Wrong OTP');
      } else {
        await Otp.findOneAndUpdate(
          { _id: ObjectId(id) },
          {
            $set: {
              is_verified: true,
              verified_date: nowTime,
              expiry: nowTime,
            },
          }
        );
      }
  
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };



module.exports = { GenerateOtp, verifyOtp };