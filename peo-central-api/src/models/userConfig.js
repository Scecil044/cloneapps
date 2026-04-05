const mongoose = require('mongoose')

const UserConfigSchema = new mongoose.Schema({
    emp_type_key: Array,
    asset_count: Array,
    company_ID: { type: mongoose.Schema.Types.ObjectId }
})

module.exports = mongoose.model('userconfig', UserConfigSchema)