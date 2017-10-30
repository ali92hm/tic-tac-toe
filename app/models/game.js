const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GameSchema = new Schema({
  teamId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  xUser: {
    type: String,
    required: true
  },
  yUser: {
    type: String,
    required: true
  },
  board: {
    type: [Number],
    required: true
  },
  isXTurn: {
    type: Boolean,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now
  },
  finished: {
    type: Date
  },
  winner: {
    type: String
  }
})

module.exports = mongoose.model('Game', GameSchema)
