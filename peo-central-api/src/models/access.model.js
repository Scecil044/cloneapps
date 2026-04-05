const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const accessSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
    },
    authorize_roles: {
      type: [String],
      default: []
    },
    authorize_users: {
      type: [String],
      default: []
    },
    unauthorize_users: {
      type: [String],
      default: []
    },
    created_by: {
      type: String
    },
    updated_by: {
      type: String
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    created_date: {
      type: String
    },
    updated_date: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

accessSchema.plugin(toJSON);
accessSchema.plugin(paginate);
module.exports = mongoose.model('access', accessSchema);
