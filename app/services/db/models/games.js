const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GameSchema = new Schema({
  xPlayer: {
    type: Schema.Types.ObjectId,
    required: true
  },
  oPlayer: {
    type: Schema.Types.ObjectId,
    required: true
  },
  board: {
    type: [String],
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
    default: Date.now()
  },
  finished: {
    type: Date
  },
  winner: {
    type: String
  }
})

module.exports = mongoose.model('Game', GameSchema)
