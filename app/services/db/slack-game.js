const _ = require('lodash')
const SlackGame = require('./models/slack-game')

const getAll = () => {
  return SlackGame.find().populate('game').exec()
}

const getById = (_id) => {
  return SlackGame.findById(_id).populate('game').exec()
}

const findByQuery = (query) => {
  return SlackGame.find(query)
    .populate('game')
    .exec()
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
    throw new Error('Game in progress')
  }

  return SlackGame.create({
    teamId: teamId,
    channelId: channelId,
    game: game
  })
}

// TODO: Implement update slack game
const update = (_id, fields) => {
  throw new Error('Not implemented')
}

const remove = (_id) => {
  return SlackGame.remove({ _id: _id }).exec()
}

module.exports = {
  getAll,
  getById,
  getInProgress,
  create,
  update,
  remove
}
