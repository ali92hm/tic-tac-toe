const Game = require('../models/games')

exports.MongoAdapter = class {
  getAllGames () {
    return Game.find().exec()
  }

  getGameById (id) {
    return Game.findById(id).exec()
  }

  getGameByChannelId (channelId) {
    return Game.findOne({ channelId: channelId, winner: undefined }).exec()
  }

  async exists (channelId) {
    let count = await Game.count({ channelId: channelId, winner: undefined }).exec()
    return count > 0
  }

  updateGame (gameId, isXTurn, board, winner) {
    return Game.update({ '_id': gameId }, {
      isXTurn: isXTurn,
      updated: Date.now(),
      board: board
    })
  }

  createGame (teamId, channelId, xUserId, yUserId) {
    return Game.create({
      teamId: teamId,
      channelId: channelId,
      xUser: xUserId,
      yUser: yUserId,
      board: new Array(9),
      isXTurn: true,
      created: Date.now()
    })
  }
}
