const { toJSON, paginate, deletion } = require("./plugins");

const mongoose = require('mongoose');
const OtpSchema = new mongoose.Schema({
    user:{ type: mongoose.Schema.Types.ObjectId, ref:"users"},
    is_verified: {
        type: Boolean,
        default: false,
    },
    verified_date: {
        type: String,
    },
    expiry: {
        type: String,
    },
    otp: {
        type: String,
        required: true
    },
    date: {
        type: String,
    },
}, {timestamps: true});

OtpSchema.plugin(toJSON);
OtpSchema.plugin(paginate);
OtpSchema.plugin(deletion);

/**
 * ====================================================
 * Consider adding TTL indexes for otps
 * tHIS WILL DELETE THE OTP AFTER A CERTAIN TIME
 * ====================================================
 */
const Otp = mongoose.model('Otp', OtpSchema);
module.exports = Otp;