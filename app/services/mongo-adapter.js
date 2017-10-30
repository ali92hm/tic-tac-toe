const Game = require('../models/games')

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

  createGame (teamId, channelId, xUser, yUser) {
    return Game.create({
      teamId: teamId,
      channelId: channelId,
      xUser: xUser,
      yUser: yUser,
      board: new Array(9),
      isXTurn: true,
      created: Date.now()
    })
  }
}
