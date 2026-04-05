const mongoose = require('mongoose')
const moment = require('moment');
const logSchema = new mongoose.Schema({
  logType: String,
  createdBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
  },
  createdFor: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
},
  data: Object, 
  status: String, 
  read: Array,
  modelType: String,
  message: String
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform(_doc, ret) {
      ret.created_for_human = moment(ret.createdAt).format("LLL");
      return ret;
    }
  }
})

const Logging = mongoose.model('Logging', logSchema)
module.exports = Logging