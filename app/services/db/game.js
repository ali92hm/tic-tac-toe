const Game = require('./models/games')

const getAll = (full = true) => {
  let query = Game.find()
  return populate(query, populate).exec()
}

const getById = (_id, full = true) => {
  let query = Game.findById(_id)
  return populate(query, populate).exec()
}

const create = (xPlayer, oPlayer, full = true) => {
  return Game.create({
    xPlayer: xPlayer,
    oPlayer: oPlayer,
    board: new Array(9),
    isXTurn: true,
    created: Date.now()
  })
}

const update = (_id, isXTurn, board, winner, full = true) => {
  let query = Game.findByIdAndUpdate(_id, {
    $set: {
      isXTurn: isXTurn,
      board: board,
      updated: Date.now(),
      winner: winner,
      finished: winner ? Date.now() : undefined
    }
  }, { new: true })

  return populate(query, populate).exec()
}

const remove = async (_id) => {
  return Game.remove({ _id: _id })
}

const populate = (query, full) => {
  if (populate) {
    query
      .populate('xPlayer')
      .populate('oPlayer')
  }

  return query
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
}
