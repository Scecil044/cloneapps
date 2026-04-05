const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const { all_services } = require('../constants/leads.constant');
const { toJSON, paginate } = require('./plugins');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    company_name: {
      type: String,
    },
    type: {
      type: String,
      enum: [...all_services],
    },
    lead_handler: {
      type: Object,
      email: {
        type: Array,
      },
      cc: {
        type: Array,
      },
    },
    details: {
      type: Object,
    },
    message: {
      type: String,
    },
    date_created: {
      type: Date,
      default: Date.now,
    },
    is_assign: {
      type: Boolean,
      default: false,
    },
    enquiry_status: {
      type: String,
      enum: ['waiting', 'in-progress', 'closed', 'follow-up'],
      default: 'waiting',
    },

    keyword: {
      type: String,
    },
    source: {
      type: String,
    },
    lead_id: {
      type: Schema.Types.ObjectId,
      ref: 'leads',
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    assigned_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    assign_logger: {
      type: Array,
    },
    promo_code: {
      type: String,
    },
    package: {
      type: String,
    },
    // Startup DXB extra details
    costingData: {
      freezone: {
        type: String,
      },
      // costingData
      startupTimeline: {
        type: String,
      },
      shareholderCount: {
        type: Number,
      },
      shareholdersNationalities: {
        type: [String],
      },
      businessActivities: {
        type: [String],
      },
      businessActivityDescription: {
        type: String,
      },
      visaCount: {
        type: Number,
      },
      calculationCost: {
        type: Number,
      },
      all_inclusive_calculation: {
        calculationCost: Number,
        immigrationCardCost: Number,
        eChannelCost: Number,
        visaAllocationCost: Number,
        licenseCost: Number,
        serviceFee: Number,
        totalRoundedCost: Number,
      },
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    country_residence: {
      type: String,
    },
    country_code: {
      type: Schema.Types.Mixed,
    },
    archived_data: {
      status: {
        type: Boolean,
        default: false,
      },
      archived_at: {
        type: Date,
      },
      archived_by: {
        type: String,
      },
      reason: {
        type: String,
      },
    },
    // For managed services where users need to create the lead from the inquiries page
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  { timestamps: true }
);

inquirySchema.plugin(toJSON);
inquirySchema.plugin(paginate);

inquirySchema.index({ assigned_to: 1 });

module.exports = mongoose.model('inquiry', inquirySchema);
