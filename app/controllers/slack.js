const _ = require('lodash')
const gameController = require('./game')
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
  let {command, args} = parser.parseCommand(text)

  // TODO remove line
  console.log('tttHandler', teamId, channelId, userId, command, args)

  let output = unkownCommand(command)

  if (command === 'challenge') {
    output = await challenge(teamId, channelId, userId, args)
  } else if (command === 'display') {
    output = await display(teamId, channelId)
  } else if (command === 'place') {
    output = await place(teamId, channelId, userId, args)
  } else if (command === 'help' || command === 'default') {
    output = helpMenue()
  }

  console.log(output)
  return responseFormatter(output.text, output.attachments, output.error)
}

const responseFormatter = (text, attachments, error) => {
  let response = {
    text: text,
    attachments: attachments,
    response_type: 'in_channel'
  }

  if (error) {
    delete response.response_type
    response.text = error
  }

  return response
}

const unkownCommand = (command) => {
  return {
    error: `Opps \`${command}\` is not a command.\n Type \`/ttt help\` to see the avalible options.`
  }
}

const helpMenue = () => {
  return {
    text: ['Hello!! Welcome to Tic-Tac-Toe slack slash game.',
      'You can start a game by typing `/ttt challenge @name`',
      'You see the current ongoing game by typing `/ttt display`',
      'If it\'s your turn to play you can say `/ttt place`'].join('\n')
  }
}

const challenge = async (teamId, channelId, userId, args) => {
  var result = {}
  // TODO remove line
  console.log('challenge', args)

  var opponentUserId = parser.parseSlackUserId(_.first(args))
  if (!opponentUserId) {
    result.error = 'No opponent specified. Please use `/ttt challenge @username`'
    return result
  }

  if (userId === opponentUserId) {
    result.error = 'You cant challenge yourself. Please pick someone else as opponent'
    return result
  }

  let game = await gameController.createGame(teamId, channelId, userId, opponentUserId)
  return {text: renderForSalck(game.board)}
}

const renderForSalck = (board) => {
  const BACK_TICK_BLOCK = '```'

  let line = BACK_TICK_BLOCK
  for (var i = 0; i < board.length; i++) {
    line += (board[i] || ' ') + ((i % 3 === 2) ? '\n' : ' | ')
  }

  return line + BACK_TICK_BLOCK
}

const display = async (teamId, channelId) => {
  // TODO remove line
  console.log('display', teamId, channelId)
  let game = await gameController.getGame(channelId)
  return {text: renderForSalck(game.board)}
}

const place = async (teamId, channelId, userId, args) => {
  // TODO remove line
  console.log('place', teamId, channelId, userId, args)
  let index = parseInt(_.first(args))
  if (index < 1 || index > 9) {
    return {error: `${index} is not a valid number. Place take numbers between 1-9`}
  }

  try {
    console.log('a')
    let game = await gameController.place(teamId, channelId, userId, index - 1)
    console.log('b')
    let winnerText = ''
    if (game.winner) {
      winnerText = `\nYayy ${game.winner} is the winner`
    }
    return {text: renderForSalck(game.board) + winnerText}
  } catch (error) {
    return {'error': error.message}
  }
}

module.exports = {
  tttRequestValidator,
  tttRequestHandler
}
