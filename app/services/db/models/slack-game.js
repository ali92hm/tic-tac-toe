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
  _gameId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  inProgress: {
    type: Boolean,
    required: true,
    default: false
  }
})

module.exports = mongoose.model('SlackGame', SlackGameSchema)
