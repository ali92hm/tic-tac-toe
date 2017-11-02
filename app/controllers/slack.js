const _ = require('lodash')
const config = require('config')
const services = require('../services')
const gameController = require('./game')
const parser = require('../utils/parsers')
const formatters = require('../utils/formatters')
const OUTLET = 'Slack'
const BACK_TICK_BLOCK = '```'

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

  let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
  let user = await getOrCreateUser(teamId, userId)
  let {command, args} = parser.parseCommand(text)

  // Command is help or empty
  if (command === config.get('slack.commands.default') ||
      command === config.get('slack.commands.help')) {
    return helpMenue()
  }

  // Command is challenge
  if (command === config.get('slack.commands.challenge')) {
    return challenge(teamId, channelId, slackGame, user, args)
  }

  // command is display board
  if (command === config.get('slack.commands.displayBoard')) {
    return display(slackGame)
  }

  // command is place board
  if (command === config.get('slack.commands.place')) {
    return place(slackGame, user, args)
  }

  return unkownCommand(text)
}

const challenge = async (teamId, channelId, slackGame, user, args) => {
  // Game in progress for this channel
  if (slackGame) {
    return formatters.slackErrorFormatter(config.get('slack.messages.gameInProgress'))
  }

  try {
    let opponentUserId = parser.parseSlackUserId(_.first(args))
    // Make sure there is an opponent
    if (!opponentUserId) {
      return formatters.slackErrorFormatter(config.get('slack.messages.noOpponent'))
    }

    let opponentUser = await getOrCreateUser(teamId, opponentUserId)

    // Make sure opponent is not the user
    if (user.equals(opponentUser)) {
      return formatters.slackErrorFormatter(config.get('slack.messages.challengeSelf'))
    }

    let game = await gameController.createGame(user, opponentUser)
    await services.db.slackGame.create(teamId, channelId, game)
    return render(game)
  } catch (error) {
    return formatters.slackErrorFormatter(error.message)
  }
}

const display = async (slackGame) => {
  if (!slackGame) {
    return formatters.slackErrorFormatter(config.get('slack.messages.noGameInProgress'))
  }

  try {
    let fullGame = await gameController.getGame(slackGame.game)
    return render(fullGame)
  } catch (error) {
    return formatters.slackErrorFormatter(error.message)
  }
}

const render = (game) => {
  let response = []
  response.push(`<@${game.xPlayer.externalId}> (X) :vs: <@${game.oPlayer.externalId}> (O)`)
  response.push(BACK_TICK_BLOCK + formatters.boardAsciiFormatter(game.board) + BACK_TICK_BLOCK)
  let turn = game.isXTurn ? `<@${game.xPlayer.externalId}> (X)` : `<@${game.oPlayer.externalId}> (O)`
  response.push(`It's ${turn}'s turn.`)
  response.push('Type `/ttt place 1-9` to make a move.')
  return formatters.slackResponseFormatter(response)
}

const place = async (slackGame, user, args) => {
  if (!slackGame) {
    return formatters.slackErrorFormatter(config.get('slack.messages.noGameInProgress'))
  }

  let index = parseInt(_.first(args))
  if (!index || index < 1 || index > 9) {
    return formatters.slackErrorFormatter([
      `${index} is not a valid number.`,
      'Place take numbers between 1-9'])
  }

  let game
  try {
    game = await gameController.place(slackGame.game, user, index - 1)
  } catch (error) {
    return formatters.slackErrorFormatter(error.message)
  }

  let response = []
  response.push(BACK_TICK_BLOCK + formatters.boardAsciiFormatter(game.board) + BACK_TICK_BLOCK)
  // If we have a winner
  if (game.winner) {
    if (game.winner === config.get('game.drawSymbole')) {
      response.push('What a shame. The no one won the game')
    } else {
      let winner = game.winner === config.get('game.xSymbole') ? `<@${game.xPlayer.externalId}> (X)` : `<@${game.oPlayer.externalId}> (O)`
      response.push(`${winner} won the game :tada:`)
    }

    return formatters.slackResponseFormatter(response)
  }

  // if we dont have a winner
  let turn = game.isXTurn ? `<@${game.xPlayer.externalId}> (X)` : `<@${game.oPlayer.externalId}> (O)`
  response.push(`It's ${turn}'s turn.`)
  response.push('Type `/ttt place 1-9` to make a move.')
  return formatters.slackResponseFormatter(response)
}

const unkownCommand = (command) => {
  let message = [
    `Opps \`${command}\` is not a command.`,
    'Type `/ttt help` to see the available options.']

  return formatters.slackErrorFormatter(message)
}

const helpMenue = () => {
  return formatters.slackResponseFormatter(config.get('slack.messages.helpMessage'))
}

module.exports = {
  tttRequestValidator,
  tttRequestHandler
}
