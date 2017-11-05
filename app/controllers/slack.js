const _ = require('lodash')
const config = require('config')
const winston = require('winston')
const services = require('../services')
const gameController = require('./game')
const parser = require('../utils/parsers')
const formatter = require('../utils/formatters')
const Errors = require('../utils/errors')

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
  winston.verbose('tttRequestHandler', teamId, channelId, userId, text)
  teamId = parser.normalizeString(teamId)
  channelId = parser.normalizeString(channelId)
  userId = parser.normalizeString(userId)
  let {command, args} = parser.parseCommand(text, config.get('slack.commands.default'))

  try {
    // Command is help or empty
    if (command === config.get('slack.commands.default') ||
        command === config.get('slack.commands.help')) {
      return helpMenue()
    }

    // Command is challenge
    if (command === config.get('slack.commands.challenge')) {
      return await challenge(teamId, channelId, userId, args)
    }

    // command is display board
    if (command === config.get('slack.commands.displayBoard')) {
      return await display(teamId, channelId)
    }

    // command is place board
    if (command === config.get('slack.commands.place')) {
      return await place(teamId, channelId, userId, args)
    }

    throw new Errors.SlackUknownCommandError(`${command} is not a command`)
  } catch (error) {
    return handleError(error, text)
  }
}

const challenge = async (teamId, channelId, userId, args) => {
  winston.verbose('challenge', teamId, channelId, userId, args)
  // Registering or retrieving users
  let opponentUserId = parser.parseSlackUserId(parser.getOnlyItem(args))
  let user = await getOrCreateUser(teamId, userId)
  let opponentUser = await getOrCreateUser(teamId, opponentUserId)

  // TODO: fix this
  let game = await gameController.createGame(user, opponentUser)
  await services.db.slackGame.create(teamId, channelId, game)
  // Render the board, mention all players, mention whose turn it is, give hits)
  let result = render(game, true, true, true)
  return formatter.slackResponseFormatter(result)
}

const display = async (teamId, channelId) => {
  winston.verbose('display', teamId, channelId)
  // get the in progress game
  let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
  // retrieve the full game
  let fullGame = await gameController.getGame(slackGame.game)
  // Render the board, mention all players, mention whose turn it is, give hits)
  let result = render(fullGame, true, true, true)
  return formatter.slackResponseFormatter(result)
}

const place = async (teamId, channelId, userId, args) => {
  winston.verbose('place', teamId, channelId, userId, args)
  // Get index from args
  let index = parseInt(parser.getOnlyItem(args)) - 1
  // Get the user
  let user = await getOrCreateUser(teamId, userId)
  // get the game in progress from db
  let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
  // update the game
  let game = await gameController.place(slackGame.game, user, index)
  // Render the board, don't mention all players, mention whose turn it is, give hits)
  let result = render(game, false, true, true)
  return formatter.slackResponseFormatter(result)
}

const helpMenue = () => {
  return formatter.slackResponseFormatter(config.get('slack.messages.helpMessage'))
}

const handleError = (error, originalText) => {
  winston.info(error, originalText)

  if (error instanceof Errors.SlackUknownCommandError) {
    return formatter.slackErrorFormatter([
      `Opps, \`${originalText}\` is not a command.`,
      'Type `/ttt help` to see the available options.'])
  }

  if (error instanceof Errors.ArgumentError) {
    return formatter.slackErrorFormatter([
      `Invalid number of agruments was passed to \`/ttt ${originalText}\``,
      'Type `/ttt help` to see the available options.'])
  }

  if (error instanceof Errors.SlackNotUserIdError) {
    return formatter.slackErrorFormatter([error.message,
      'Please try selecting someone using `@username`'])
  }

  if (error instanceof Errors.SlacGameInProgress) {
    return formatter.slackErrorFormatter(config.get('slack.messages.gameInProgress'))
  }

  if (error instanceof Errors.SamePlayersError) {
    return formatter.slackErrorFormatter(config.get('slack.messages.challengeSelf'))
  }

  // if (!slackGame) {
  //   return formatter.slackErrorFormatter(config.get('slack.messages.noGameInProgress'))
  // }

  if (error instanceof Errors.WrongPlayerError) {
    return formatter.slackErrorFormatter('Sorry, you\'re not one of the players :expressionless:')
  }

  if (error instanceof Errors.NotTurnError) {
    return formatter.slackErrorFormatter('It\'s not your turn :stuck_out_tongue_closed_eyes:')
  }

  if (error instanceof Errors.CellTakenError) {
    return formatter.slackErrorFormatter(`Cell "${originalText}" already taken`)
  }

  if (error instanceof Errors.InvalidMove) {
    return formatter.slackErrorFormatter([`"${originalText}" is not a valid number.`,
      'Place numbers between 1-9'])
  }

  winston.error(error, originalText)
  return formatter.slackErrorFormatter('Oops, something went wrong.')
}

const getOrCreateUser = async (teamId, userId) => {
  let outlet = config.get('slack.outletName')
  let uniqueId = `${outlet}|${teamId}|${userId}`
  let user = await services.db.users.getByUniqueId(uniqueId)
  // Create a user if no user is found
  if (!user) {
    // Fetch user info from slack
    let slackUser = await services.slack.api.getUserInfo(teamId, userId)
    // Create a user
    user = await services.db.users.create(uniqueId, userId, outlet,
        slackUser.email, slackUser.firstName, slackUser.lastName)
  }
  return user
}

const render = (game, mentionPlayer, mentionTurn, hint) => {
  let response = []
  let xPlayerMention = formatter.slackUserMention(game.xPlayer.externalId) +
    ` (${config.get('game.xSymbole')})`
  let oPlayerMention = formatter.slackUserMention(game.oPlayer.externalId) +
    ` (${config.get('game.oSymbole')})`

  if (mentionPlayer) {
    response.push(`${xPlayerMention} :vs: ${oPlayerMention}`)
  }

  response.push(formatter.BACK_TICK_BLOCK +
    formatter.boardAsciiFormatter(game.board) +
    formatter.BACK_TICK_BLOCK)

  // If we have a winner
  if (game.winner) {
    if (game.winner === config.get('game.drawSymbole')) {
      response.push('What a shame. No one won the game :scream:')
    } else {
      let winner = game.winner === config.get('game.xSymbole') ? xPlayerMention : oPlayerMention
      response.push(`${winner} won the game :tada:`)
    }
  }

  // If don't have a winner
  if (!game.winner) {
    // Mention whose turn it is
    if (mentionTurn) {
      response.push(`It's ${game.isXTurn ? xPlayerMention : oPlayerMention}'s turn.`)
    }
    // Mention give user hint
    if (hint) {
      response.push('Type `/ttt place 1-9` to make a move.')
    }
  }

  return response
}

module.exports = {
  tttRequestValidator,
  tttRequestHandler
}
