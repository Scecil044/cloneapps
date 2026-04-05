const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require("./plugins");

const letterConfigSchema = new mongoose.Schema({
    company_ID : {
        type : mongoose.Schema.Types.ObjectId,
        required: true
    },
	letterRequest : {
        type: Array,
        default: []
    },
    letterKeyHint : {
        type : Array,
        default: []
    }
});

letterConfigSchema.plugin(toJSON);
letterConfigSchema.plugin(paginate);
letterConfigSchema.plugin(deletion);

module.exports = mongoose.model('LetterConfig', letterConfigSchema)

