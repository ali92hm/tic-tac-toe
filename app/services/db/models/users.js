const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
* Mongoose Schema for User
*/
const UserSchema = new Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true
  },
  externalId: {
    type: String,
    required: true
  },
  outlet: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  updated: {
    type: Date,
    required: true,
    default: Date.now()
  },
  email: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  }
})

module.exports = mongoose.model('User', UserSchema)
