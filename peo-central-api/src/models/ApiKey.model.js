const mongoose = require('mongoose');
const { paginate } = require('./plugins');

const apiKeySchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    appName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    is_deleted: {
      type: Boolean,
      default: false
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    }
  },
  { timestamps: true }
);

apiKeySchema.plugin(paginate);
module.exports = mongoose.model('ApiKey', apiKeySchema);
