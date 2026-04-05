const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

// To store News
const newsSchema = new mongoose.Schema(
  {
    header_image: { type: String, required: true },
    title: { type: String, required: true },
    company_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Companies' },
    short_desc: { type: String },
    category: { type: String },
    highlight: { type: String },
    status: { type: String, default: 'N' },
    from: { type: Date },
    to: { type: Date },
    permanent: { type: Boolean },
    created_date: { type: Date, default: Date.now },
    created_by: { type: String },
    updated_date: { type: Date },
    updated_by: { type: String },
    delete: { type: Boolean, default: false },
    attachments: { type: Array }
  },
  { timestamps: true }
);

newsSchema.plugin(toJSON);
newsSchema.plugin(paginate);

module.exports = mongoose.model('news', newsSchema);
