const mongoose = require('mongoose');
const {
  Types: { ObjectId }
} = mongoose;
const emailConfigSchema = new mongoose.Schema(
  {
    company_ID: {
      type: ObjectId
    },
    key_hints: {
      type: Array,
      default: []
    },
    templates: {
      type: Array,
      default: [] // _id, title, subject, body
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('emailconfigs', emailConfigSchema);
