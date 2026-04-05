const mongoose = require('mongoose')

const reportBuilderModel = new mongoose.Schema({
  report_title: {
    type: String
  },
  collection_name: {
    type: String
  },
  fields: {
    type: Array
  },
  conditions: {
    type: Array
  },
  created_by: {
    type: String
  },
  created_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  updated_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('ReportsBuilder', reportBuilderModel)