const _ = require('lodash')
const SlackGame = require('./models/slack-game')
const gameController = require('../../controllers/game')
const Errors = require('../../utils/errors')

/*
* Get all slackGames
* @async
* @param {boolean} [full] - populate all the references with values
* @returns {Promise<[(SlackGame|Array)]>} slackGames - array of mongoose slackGame object
*/
const getAll = (full = true) => {
  let query = SlackGame.find()
  return populate(query, full).exec()
}

/*
* Get slackGame by _id
* @async
* @param {string} _id - mongo id for slackGame object
* @param {boolean} [full] - populate all the references with values
* @returns {Promise<SlackGame>} slackGame - mongoose slackGame object
*/
const getById = (_id, full = true) => {
  let query = SlackGame.findById(_id)
  return populate(query, full).exec()
}

/*
* Get slackGame query
* @async
* @param {Object} criteria - json of values as criteria
* @param {boolean} [full] - populate all the references with values
* @returns {Promise<[(SlackGame|Array)]>} slackGames - mongoose slackGame object
*/
const findByQuery = (criteria, full = true) => {
  let query = SlackGame.find(criteria)
  return populate(query, full).exec()
}

/*
* Get slackGame that is in progress for a given teamId and channelId
* @async
* @param {string} teamId - normalized slack teamId
* @param {string} channelId - normalized slack channelId
* @returns {Promise<SlackGame>} slackGame - mongoose slackGame object
*/
const getInProgress = async (teamId, channelId) => {
  let inProgressGame = await _getInProgress(teamId, channelId)
  if (!inProgressGame) {
    throw new Errors.SlacNoGameInProgressError(`No game in progress
      for team ${teamId} and channel ${channelId}`)
  }

  // Retrieve the full populated object
  inProgressGame.game = await gameController.getGame(inProgressGame.game)
  return inProgressGame
}

/*
* Private Get slackGame that is in progress for a given teamId and channelId
* @async
* @param {string} teamId - normalized slack teamId
* @param {string} channelId - normalized slack channelId
* @returns {Promise<SlackGame>} slackGame - mongoose slackGame object
*/
const _getInProgress = async (teamId, channelId) => {
  // God, why does mongo not have joins
  let slackGames = await findByQuery({teamId: teamId, channelId: channelId})
  let inProgressGames = _.filter(slackGames, (slackGame) => !slackGame.game.finished)
  if (inProgressGames.length > 1) {
    throw new Error('Multiple games in progress in a channel')
  }

  return _.first(inProgressGames)
}

/*
* Create a slackGame
* @param {string} teamId - normalized slack teamId
* @param {string} channelId - normalized slack channelId
* @param {User} user - mongo user object for xPlayer
* @param {User} opponent - mongo user object for oPlayer
* @returns {Promise<SlackGame>} slackGame - mongoose slackGame object
*/
const create = async (teamId, channelId, user, opponent) => {
  if (await _getInProgress(teamId, channelId)) {
    throw new Errors.SlackGameInProgressError(`There is already a game in progress
      for team ${teamId} and channel ${channelId}`)
  }

  let game = await gameController.createGame(user, opponent)
  return SlackGame.create({
    teamId: teamId,
    channelId: channelId,
    game: game
  })
}

/*
* Update a game
* @async
* @param {string} _id - mongoose id for slackGame object
* @param {Object} fields - the fields on the user to update
* @returns {Promise<SlackGame>} slackGame - updated slackGame
*/
const update = (_id, fields, full = true) => {
  // TODO: Implement update slack game
  throw new Error('Not implemented')
}

/*
* Remove game
* @async
* @param {string} _id - mongoose id for game object
* @returns {Promise<Object>} confirmation - mongoose deletion confirmation
*/
const remove = (_id) => {
  return SlackGame.remove({ _id: _id }).exec()
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
      .populate('game')
  }

  return query
}

module.exports = {
  getAll,
  getById,
  getInProgress,
  create,
  update,
  remove
}
