const SlackGame = require('../../models/slack-game')

const getAll = () => {
  return SlackGame.find().exec()
}

const getById = (_id) => {
  return SlackGame.findById(_id).exec()
}

const getByTeamCred = (teamId, channelId) => {
  return SlackGame.findOne({teamId: teamId, channelId: channelId}).exec()
}

const isGameInProgress = (teamId, channelId) => {
  return SlackGame.find({teamId: teamId, channelId: channelId}).populate('_gameId').exec()
}

// TODO: Implement update User
const update = (_id, fields) => {
  throw new Error('Not implemented')
}

const create = (teamId, channelId, _gameId) => {
  // Todo check doest exist on going
  return SlackGame.create({
    teamId: teamId,
    channelId: channelId,
    _gameId: _gameId
  })
}

module.exports = {
  getAll,
  getById,
  getByTeamCred,
  isGameInProgress,
  update,
  create
}
