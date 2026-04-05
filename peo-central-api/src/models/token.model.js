/**
 * ===================================================================================================
 * 
 * note that while user field is required on this model, it is not always a user id
 * There are instances when onboarding tokens will be generated as well for companies
 * In such a case, this field will store company Id's
 * A check should therefore be made to see if the user is a company by checking the isOnboarding field
 * 
 * ===================================================================================================
 */

const mongoose = require('mongoose');
const tokensSchema = new mongoose.Schema({
  blacklisted: {
    type: Boolean,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  isOnboardingToken: { 
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('tokens', tokensSchema);
