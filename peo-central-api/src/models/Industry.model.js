const mongoose = require("mongoose");
const {paginate} = require("./plugins")


const industrySchema = new mongoose.Schema({
    industry_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    deleted_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {timestamps: true});

industrySchema.plugin(paginate);
const Industry = mongoose.model("Industry", industrySchema);

module.exports = Industry;