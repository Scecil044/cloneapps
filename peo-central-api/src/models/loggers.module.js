const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const loggerSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    message: {
      type: String
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    created_date: {
      type: Date,
      expires: '7d',
      default: Date.now
    },
    updated_date: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

loggerSchema.plugin(toJSON);
loggerSchema.plugin(paginate);
module.exports = mongoose.model('loggers', loggerSchema);
