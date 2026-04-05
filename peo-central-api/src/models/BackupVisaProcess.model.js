const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');


const visaprocessBackupSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    processes: {
      type: Array,
    },
    process_type: {
      type: String,
    },
    is_unsuccessful: {
      type: Boolean,
      default: false,
    },
    reason_for_unsuccessful: {
      type: String,
      default: '',
    },
    attachments: {
      type: Array,
    },
    comments: {
      type: Array,
    },
    status: {
      type: String,
    },
    assigned_pro: {
      type: mongoose.Schema.Types.ObjectId,
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_date: {
      type: String,
    },
    module: {
      type: String,
    },
    identifier: {
      type: String,
    },
    foreign_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    updated_date: {
      type: String,
    },
    backup_reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

visaprocessBackupSchema.plugin(toJSON);
visaprocessBackupSchema.plugin(paginate);
visaprocessBackupSchema.plugin(deletion);

const VisaprocessBackup = mongoose.model('visa_process_backup', visaprocessBackupSchema);
module.exports = VisaprocessBackup;
