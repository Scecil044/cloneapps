const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const TaskSchema = new mongoose.Schema(
  {
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Leads',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    title: {
      type: String,
    },
    start_time: {
      type: String,
    },
    description: { type: String },
    follow_up: { type: String },
    due_date: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in progress', 'completed'],
      default: 'pending',
    },
    processName: {
      type: String,
      // enum: [
      //   'Contact Client',
      //   'Lead Received',
      //   'Send Proposal',
      //   'Waiting for Approval',
      //   'Collect Documents',
      //   'Service Agreement',
      // ],
      default: 'Lead Received',
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
  },
  { timestamps: true }
);

// Add plugin that converts mongoose to json
TaskSchema.plugin(toJSON);
TaskSchema.plugin(paginate);
TaskSchema.plugin(deletion);

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
