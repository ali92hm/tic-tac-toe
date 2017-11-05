const Game = require('./models/games')

/*
* Get all games
* @async
* @param {boolean} [full] - populate all the references with values
* @returns {Promise<[(Game|Array)]>} games - array of mongoose game object
*/
const getAll = (full = true) => {
  let query = Game.find()
  return populate(query, full).exec()
}

/*
* Get game by _id
* @async
* @param {string} _id - mongo id for game object
* @param {boolean} [full] - populate all the references with values
* @returns {Promise<Game>} game - mongoose game object
*/
const getById = (_id, full = true) => {
  let query = Game.findById(_id)
  return populate(query, full).exec()
}

/*
* Create a game
* @async
* @param {User} xPlayer - mongoose user object for player x
* @param {User} oPlayer - mongoose user object for player o
* @returns {Promise<Game>} game - mongoose game object
*/
const create = (xPlayer, oPlayer) => {
  return Game.create({
    xPlayer: xPlayer,
    oPlayer: oPlayer,
    board: new Array(9),
    isXTurn: true,
    created: Date.now()
  })
}

/*
* Update a game
* @async
* @param {string} _id - mongoose id for game object
* @param {boolean} isXTurn - true if its x turn otherwise false
* @param {[(string|Array)]} board - updated game board
* @param {string} [winner] - winner (if game is finished)
* @param {boolean} [full] - populate all the references with values
* @returns {Promise<Game>} game - updated game
*/
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

  return populate(query, full).exec()
}

/*
* Remove game
* @async
* @param {string} _id - mongoose id for game object
* @returns {Promise<Object>} confirmation - mongoose deletion confirmation
*/
const remove = async (_id) => {
  return Game.remove({ _id: _id })
}

/*
* Adds fields to be populated on a query
* @param {Object} query - mongoose query object
* @param {boolean} [full] - populate all the references with values
* @returns {Object} query - mongoose query object
*/
const populate = (query, full) => {
  if (full) {
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
