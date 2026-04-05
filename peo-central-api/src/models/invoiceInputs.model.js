const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const invoiceInputItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  service_name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  receipts: [
    {
      filename: {
        type: String,
        required: true,
        trim: true
      },
      file_url: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String,
        required: false,
        trim: true
      },
      size: {
        type: Number,
        required: false,
        min: 0
      },
      type: {
        type: String,
        required: false,
        trim: true
      },
    }
  ]
}, { _id: true });

const invoiceInputsSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Companies',
      required: true,
      index: true
    },
    items: [invoiceInputItemSchema],
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'paid'],
      default: 'draft'
    },
    notes: {
      type: String,
      trim: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    approved_date: {
      type: Date
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    input_month: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}$/.test(v); // Format YYYY-MM
        }
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
invoiceInputsSchema.index({ company_id: 1, input_month: 1 }, { unique: true });
invoiceInputsSchema.index({ status: 1 });

// Pre-save middleware to calculate totals
invoiceInputsSchema.pre('save', function (next) {
  // Calculate total_amount for each item
  this.items.forEach(item => {
    item.total_amount = item.quantity * item.amount;
  });

  next();
});

invoiceInputsSchema.plugin(toJSON);
invoiceInputsSchema.plugin(paginate);
invoiceInputsSchema.plugin(deletion);

// Fix for old index issue - remove obsolete invoice_number index
invoiceInputsSchema.statics.fixObsoleteIndexes = async function () {
  try {
    const collection = this.collection;
    const indexes = await collection.indexes();

    // Find and drop the problematic index
    const problematicIndex = indexes.find(index =>
      index.name === 'company_id_1_invoice_number_1' ||
      (index.key.company_id && index.key.invoice_number)
    );

    if (problematicIndex) {
      console.log('🔧 Fixing obsolete index:', problematicIndex.name);
      await collection.dropIndex(problematicIndex.name);
      console.log('✅ Obsolete index removed successfully');
    }
  } catch (error) {
    if (error.code === 27 || error.message.includes('IndexNotFound')) {
      // Index doesn't exist, which is fine
      console.log('ℹ️ No obsolete index to remove');
    } else {
      console.error('⚠️ Error fixing obsolete indexes:', error.message);
    }
  }
};

const InvoiceInputs = mongoose.model('InvoiceInputs', invoiceInputsSchema);
module.exports = InvoiceInputs;
