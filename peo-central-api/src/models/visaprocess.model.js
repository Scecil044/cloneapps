const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');


const visaprocessScheme = new mongoose.Schema(
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
    unsuccessful_on:{
      type: Date
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
    assigned_escalation_manager: { type: mongoose.Schema.Types.ObjectId},
    assigned_insurance_agent: { type: mongoose.Schema.Types.ObjectId},
    assigned_hr_specialist: { type: mongoose.Schema.Types.ObjectId},
    assigned_support_agent: { type: mongoose.Schema.Types.ObjectId},
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
    visa_application_platform:{
      type: String,
      enum: ['Work Bundle', 'Manual Visa Process']
    },
    work_permit_number: { type: String, deefault:""},
    mol_wps_number: { type: String, deefault:""},
  },
  {
    timestamps: true,
  }
);

// Add this pre-save hook to your schema
visaprocessScheme.pre('save', function(next) {
  if (this.isModified('processes') && Array.isArray(this.processes)) {
    const processIdMap = new Map();
    let hasChanged = false;

    this.processes.forEach(process => {
      if (!process._id) {
        process._id = new mongoose.Types.ObjectId();
        hasChanged = true;
      } else {
        const idStr = process._id.toString();

        if (processIdMap.has(idStr)) {
          process._id = new mongoose.Types.ObjectId();
          hasChanged = true;
        } else {
          processIdMap.set(idStr, true);
        }
      }
    });

    if (hasChanged) {
      this.markModified('processes');
    }
  }

  next();
});

visaprocessScheme.plugin(toJSON);
visaprocessScheme.plugin(paginate);
visaprocessScheme.plugin(deletion);

// Add indexes for performance optimization
// Critical index for getAllUsersMols route optimization
visaprocessScheme.index({ user_id: 1, is_deleted: 1 }, { background: true });

// Additional optimization indexes
visaprocessScheme.index({ user_id: 1, _id: 1 }, { background: true });
visaprocessScheme.index({ company_id: 1, is_deleted: 1 }, { background: true });

const Visaprocess = mongoose.model('visa_process', visaprocessScheme);
module.exports = Visaprocess;
