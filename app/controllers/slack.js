const _ = require('lodash')
const services = require('../services')
const gameController = require('./game')
const parser = require('../utils/parsers')
const OUTLET = 'Slack'

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

const getOrCreateUser = async (teamId, userId) => {
  try {
    let uniqueId = `${OUTLET}|${teamId}|${userId}`
    let user = await services.db.users.getByUniqueId(uniqueId)
    if (!user) {
      console.log('need to create one')
      // Fetch users info from Slack
      user = await services.db.users.create(uniqueId, userId, OUTLET)
    }
    return user
  } catch (error) {
    console.error(error)
  }
}

const tttRequestHandler = async (teamId, channelId, userId, text) => {
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
  // TODO remove line
  console.log('challenge', args)
  let opponentUserId = parser.parseSlackUserId(_.first(args))
  if (!opponentUserId) {
    return {error: 'No opponent specified. Please use `/ttt challenge @username`'}
  }

  if (userId === opponentUserId) {
    return {error: 'You cant challenge yourself. Please pick someone else as opponent'}
  }

  try {
    let [user, opponentUser] = await Promise.all([
      getOrCreateUser(teamId, userId),
      getOrCreateUser(teamId, opponentUserId)
    ])

    await services.db.slackGame.create(teamId, channelId, user._id, opponentUser._id)
    return {text: `<@${userId}> (x) has challenge <@${opponentUserId}> (o) to a game of tick tack toe.\n`}
  } catch (error) {
    return {error: error.message}
  }
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

  let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
  if (!slackGame) {
    return {error: 'Opps no game in progress!!\n You can start one by saying `/ttt challenge @name`'}
  }

  return {text: renderForSalck(slackGame.game.board)}
}

const place = async (teamId, channelId, userId, args) => {
  // TODO remove line
  console.log('place', teamId, channelId, userId, args)
  let index = parseInt(_.first(args))
  if (index < 1 || index > 9) {
    return {error: `${index} is not a valid number. Place take numbers between 1-9`}
  }

  try {
    let user = await getOrCreateUser(teamId, userId)
    let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
    let game = await gameController.place(slackGame.game._id, user, index - 1)
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
