const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const formFieldSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        module: {
            type: String,
        },
        field: {
            type: String,
        },
        field: {
            type: String,
        },
        calculation:{
            type: String,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        }
    },
    {
        timestamps: {
            createdAt: 'created_at', // Use `date_created` to store the created date
            updatedAt: 'updated_at', // and `date_updated` to store the last updated date
        },
    }
);

formFieldSchema.plugin(toJSON);
formFieldSchema.plugin(paginate);

module.exports = mongoose.model('Form_field', formFieldSchema);
