const Game = require('./models/games')

const getAll = () => {
  return Game.find().populate('xPlayer').populate('oPlayer').exec()
}

const getById = (_id) => {
  return Game.findById(_id).populate('xPlayer').populate('oPlayer').exec()
}

const create = (xPlayer, oPlayer) => {
  return Game.create({
    xPlayer: xPlayer,
    oPlayer: oPlayer,
    board: new Array(9),
    isXTurn: true,
    created: Date.now()
  })
}

const update = (_id, isXTurn, board, winner) => {
  let finished = winner ? Date.now() : undefined
  return Game.findByIdAndUpdate(_id, {
    $set: {
      isXTurn: isXTurn,
      board: board,
      updated: Date.now(),
      winner: winner,
      finished: finished
    }
  }, { new: true })
}

const remove = async (_id) => {
  return Game.remove({ _id: _id })
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}
