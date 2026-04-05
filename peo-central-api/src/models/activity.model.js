const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const activitiesSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    document_id: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    oldDoc: {
      type: Object,
    },
    newDoc: {
      type: Object,
    },
    updatedFields: {
      type: Object,
    },
    logMessage: {
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

activitiesSchema.plugin(toJSON);
activitiesSchema.plugin(paginate);
module.exports = mongoose.model('activities', activitiesSchema);
