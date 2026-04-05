const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const msAuthToken = new mongoose.Schema({
    accessToken: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    user_id:{
        type: mongoose.Types.ObjectId,
        required: true
    },
    idToken:{
        type: String,
        required: true
    },
    accountObject:{
        type:Object,
        required: true
    }
})

msAuthToken.plugin(toJSON);
msAuthToken.plugin(paginate);
const MsAuthToken = mongoose.model('msAuthToken', msAuthToken);
module.exports = MsAuthToken