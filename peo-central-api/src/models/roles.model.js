const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const rolesScheme = new mongoose.Schema({
    role_name: {
        type: String,
        required: true,
        trim: true
    },
    hierarchy: {
        type: Number,
        required: true,
    },
    permissions: {
        type: Array
    },
    created_by: {
        type: String
    },
    updated_by: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_date: {
        type: String
    },
    updated_date: {
        type: String
    }
},
    {
        timestamps: true
    });



rolesScheme.plugin(toJSON);
rolesScheme.plugin(paginate);
rolesScheme.plugin(deletion);

const Roles = mongoose.model("Roles", rolesScheme)
module.exports = Roles
