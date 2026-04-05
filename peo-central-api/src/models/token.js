const mongoose = require('mongoose')
const tokensSchema = new mongoose.Schema({
    blacklisted: {
        type: Boolean, 
        required: true
    },
    token: {
        type: String, 
        required: true
    },
    user: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    type: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date, 
        default: Date.now,
        required: true
    }
  })

  module.exports = mongoose.model('tokens', tokensSchema)

//   {
//     "_id" : ObjectId("626ba80eb55704789074b87e"),
//     "blacklisted" : false,
//     "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjYyNjNjOGUwYmYyZGZlNzMzMDI0NDQiLCJhdXRoSUQiOiJhNDRlZmEzNzM0NzA4ZmNiNTI0MDFjZTQyNDJjYTAyNDE2NTA2MTUyNDAyNjQiLCJpYXQiOjE2NTEyMjI1NDIsImV4cCI6MTY1MzgxNDU0MiwidHlwZSI6InJlZnJlc2gifQ.PNTz0HND0l7C5EeaoOh6ILDyEK3N4Srka1cWtunSO_I",
//     "user" : ObjectId("626263c8e0bf2dfe73302444"),
//     "isFreelancer" : true,
//     "ate" : ISODate("2022-05-29T08:55:42.252Z"),
//     "type" : "refresh",
//     "createdAt" : ISODate("2022-04-29T08:55:42.267Z"),
//     "updatedAt" : ISODate("2022-04-29T08:55:42.267Z"),
//     "__v" : 0
// }