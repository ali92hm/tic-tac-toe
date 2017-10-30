const Game = require('../models/Games')

exports.MongoAdapter = class {
  getAllGames () {
    return Game.find().exec()
  }

  getGameById (id) {
    return Game.findById(id).exec()
  }

  getGameByChannelId (channelId) {
    return Game.find({ channelId: channelId }).exec()
  }

  async exists (channelId) {
    let count = await Game.count({ channelId: channelId, winner: undefined }).exec()
    return count > 0
  }

  createGame (address, img) {
    return Game.create({ })
  }
}
