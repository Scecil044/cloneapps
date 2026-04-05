const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const formSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        module: {
            type: String,
        },
        fields: {
            type: Array,
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

formSchema.plugin(toJSON);
formSchema.plugin(paginate);

module.exports = mongoose.model('Form', formSchema);
