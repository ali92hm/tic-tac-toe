const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SlackGameSchema = new Schema({
  teamId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  }
})

module.exports = mongoose.model('SlackGame', SlackGameSchema)
