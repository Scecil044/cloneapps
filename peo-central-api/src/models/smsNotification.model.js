const mongoose = require('mongoose');
const conn = require('../utils/queueingDb').getConnection();

const smsNotificationSchema = new mongoose.Schema({
  type: Number,
  gateway: Number,
  from: String,
  to: String,
  status: Number,
  // sender_id: {
  //   type: String,
  //   enum: [process.env.SENDER_ID_DYNAMIC, process.env.SENDER_ID_EXECUTIVE, process.env.SENDER_ID_FREELANCER],
  // },
  name : String, 
  reference_id: String,
  collection_name: String,
  options: Object,
  subject: String,
  body: String,
  content: String,
  date_to_release: Date,
  error_msg: String,
  module : String, 
  auto_replace_keys : {
    type : Array , 
    default : [], 
  }, 
  user_input_keys : {
    type : Array , 
    default : [], 
  }, 
  date_created: {
    type: Date,
    default: Date.now,
  },
  date_updated: {
    type: Date,
    default: Date.now,
  },
  is_deleted : {
    type : Boolean, 
    default : false
  }
});


module.exports = mongoose.model('SMS_Notification', smsNotificationSchema)
