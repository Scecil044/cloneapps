const mongoose = require('mongoose');

const supportLogSchema = new mongoose.Schema({
  action: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportLog', supportLogSchema);
