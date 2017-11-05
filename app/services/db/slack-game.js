const _ = require('lodash')
const SlackGame = require('./models/slack-game')
const Errors = require('../../utils/errors')

const getAll = (full = true) => {
  let query = SlackGame.find()
  return populate(query, populate).exec()
}

const getById = (_id, full = true) => {
  let query = SlackGame.findById(_id)
  return populate(query, populate).exec()
}

const findByQuery = (criteria, full = true) => {
  let query = SlackGame.find(criteria)
  return populate(query, populate).exec()
}

// God, why does mongo not have joins
const getInProgress = async (teamId, channelId) => {
  let slackGames = await findByQuery({teamId: teamId, channelId: channelId})
  let inProgressGames = _.filter(slackGames, (slackGame) => !slackGame.game.finished)
  if (inProgressGames.length > 1) {
    throw new Error('Multiple games in progress in a channel')
  }

  return _.first(inProgressGames)
}

const create = async (teamId, channelId, game) => {
  if (await getInProgress(teamId, channelId)) {
    throw new Errors.SlacGameInProgress(`There is already a game in progress
      for team ${teamId} and channel ${channelId}`)
  }

  return SlackGame.create({
    teamId: teamId,
    channelId: channelId,
    game: game
  })
}

// TODO: Implement update slack game
const update = (_id, fields, full = true) => {
  throw new Error('Not implemented')
}

const remove = (_id) => {
  return SlackGame.remove({ _id: _id }).exec()
}

const populate = (query, full) => {
  if (populate) {
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
