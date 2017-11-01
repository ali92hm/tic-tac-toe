const Game = require('../../models/games')

const getAll = () => {
  return Game.find().exec()
}

const getById = (_id) => {
  return Game.findById(_id).exec()
}

const create = (teamId, channelId, xUserId, yUserId) => {
  return Game.create({
    xUser: xUserId,
    yUser: yUserId,
    board: new Array(9),
    isXTurn: true,
    created: Date.now()
  })
}

const update = (_id, isXTurn, board, winner) => {
  return Game.update({ _id: _id }, {
    isXTurn: isXTurn,
    updated: Date.now(),
    board: board
  })
}

const remove = async (_id) => {
  return Game.remove({ _id: _id })
}

module.exports = {
  getAll,
  getById,
  update,
  create,
  remove
}
