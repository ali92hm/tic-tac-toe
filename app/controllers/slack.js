const _ = require('lodash')
const parser = require('../utils/parsers')

const tttRequestValidator = (body) => {
  let errors = []
  let requiredFields = {
    team_id: body.team_id,
    channel_id: body.channel_id,
    user_id: body.user_id
  }

  // The requiredFields have to be passed and not be empty
  _.forEach(requiredFields, (value, key) => {
    if (!value) {
      errors.push((`No "${key}" was passed.`))
    }
  })

  // Allow for text field to have empty string
  if (!body.text && body.text !== '') {
    errors.push(('No "text" was passed.'))
  }

  if (errors.length !== 0) {
    return errors
  }
}

const tttRequestHandler = async (teamId, channelId, userId, text) => {
  // TODO remove line
  console.log('tttHandler', teamId, channelId, userId, text)

  teamId = parser.normalizeString(teamId)
  channelId = parser.normalizeString(channelId)
  userId = parser.normalizeString(userId)
  let {command, args} = parser.commandParser(text)

  // TODO remove line
  console.log('tttHandler', teamId, channelId, userId, command, args)

  let output = 'default command'
  if (command === 'challenge') {
    // TODO Fix this more than one user or user not the first arg
    let opponentUserId = parser.getSlackUserId(_.first(args))
    output = challenge(opponentUserId)
  }

  if (command === 'display') {
    output = display(teamId, channelId)
  }

  if (command === 'place') {
    output = place(teamId, channelId, userId)
  }

  return responseFormatter(output, undefined, true)
}

const responseFormatter = (text, attachments, isError) => {
  let response = {}

  if (!isError) {
    response.response_type = 'in_channel'
  }

  if (text) {
    response.text = text
  }

  if (attachments) {
    response.attachments = attachments
  }

  return response
}

const challenge = (opponentUserId) => {
  return 'challenging some'
}

const display = (teamId, channelId) => {
  return 'display board'
}

const place = (teamId, channelId, userId) => {
  return 'place'
}

module.exports = {
  tttRequestValidator,
  tttRequestHandler
}
