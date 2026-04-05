const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require("./plugins");

const dependentSchema = new mongoose.Schema({
    first_name: {
        type: String,
    },
    middle_name: {
        type: String
    },
    last_name: {
        type: String,
    },
    principal_id: {
        type: String,
    },
    email: {
        type: String
    },
    image_url: {
        type: String,
    },
    principal_id: {
        type: String,
    },
    relation_to_principal: {
        type: String,
    },
    documents: {
        type: Object
    },
    personal: {
        type: Object,
        default: {
            address: '',
            gender:"",
            phone:"",
            designation:"",
            marital_status:"",
            nationality:"",
            dob:"",
            cost_center:""
        }
    },
    attachments: {
        type: Array
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
},{timestamps:true});

dependentSchema.plugin(toJSON);
dependentSchema.plugin(paginate);
dependentSchema.plugin(deletion);

const Dependents= mongoose.model('Dependents', dependentSchema);

module.exports = Dependents