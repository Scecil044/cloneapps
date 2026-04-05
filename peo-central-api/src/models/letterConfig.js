const mongoose = require('mongoose');
const letterConfigSchema = new mongoose.Schema({
  company_ID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  letterRequest: {
    type: Array,
    required: true,
  },
  letterKeyHint: {
    type: Array,
    required: true,
  },
});
module.exports = mongoose.model('LetterConfig', letterConfigSchema);
