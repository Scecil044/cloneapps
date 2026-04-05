const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const FaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: false,
      enum: [
        'Application Status',
        'Invoice',
        'Letter Request',
        'Clients',
        'Referrals',
        'Renewal',
        'Medical Insurance',
        'Modification',
        'Sponsorship',
        'Agreement',
        'Miscellaneous',
        'Cancellation',
        'Other'
      ]
    },
    tags: {
      type: [String],
      required: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

FaqSchema.plugin(toJSON);
FaqSchema.plugin(paginate);
FaqSchema.plugin(deletion);

const Faq = mongoose.model('Faq', FaqSchema);
module.exports = Faq;
