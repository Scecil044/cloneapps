const mongoose = require('mongoose')
const socialsSchema = new mongoose.Schema({
    feed:{
        type: Object
    },
    status:{
        type:String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Socials', socialsSchema)