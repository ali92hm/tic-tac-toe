const _ = require('lodash')
const config = require('config')
const winston = require('winston')
const services = require('../services')
const gameController = require('./game')
const parser = require('../utils/parsers')
const formatter = require('../utils/formatters')
const Errors = require('../utils/errors')

/*
* Validates parameters for ttt "/slack/ttt" api
* @param {Object} body - Body if the http method
* @returns {[(string|Array)]} - List of errors or undefined if there are no errors
*/
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

/*
* /slack/ttt request handler
* @async
* @param {string} teamId - slack request teamId
* @param {string} channelId - slack request channelId
* @param {string} userId - slack request userId
* @param {string} text - slack request text
* @returns {Promise<string>} message - resulting message
*/
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
      return helpMenu()
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

/*
* Handles the challenge command - Creates a game for a channel if one doesn't exist
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} channelId - normalizeStringt channelId
* @param {string} userId - normalizeString userId
* @param {[(string|Array)]} args - list of command arguments. Should contain only 1 slack mention string
* @returns {Promise<string>} message - resulting message: mention players + board + mention whose turn + instructions
*/
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

/*
* Handles the display command - renders a game if exits
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} channelId - normalizeStringt channelIds
* @returns {Promise<string>} message - resulting message: mention players + board + mention whose turn + instructions
*/
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

/*
* Handles the place command - make a move for a userId
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} channelId - normalizeStringt channelId
* @param {string} userId - normalizeString userId
* @param {[(string|Array)]} args - list of command arguments. Should contain only 1 integer string
* @returns {Promise<string>} message - resulting message: board + winners or mention whose turn + instructions
*/
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

/*
* Handles default (empty) and help command - shows help menu
* @returns {string} message - help menu
*/
const helpMenu = () => {
  return formatter.slackResponseFormatter(config.get('slack.messages.helpMessage'))
}

/*
* Handles Errors based on the type of the error
* @param {Error} error - custom or system error object
* @param {string} originalText - The original text sent by slack
* @returns {string} message - help menu
*/
const handleError = (error, originalText) => {
  winston.info(error, originalText)

  // Handle Unknown Errors and show help command
  if (error instanceof Errors.SlackUknownCommandError) {
    return formatter.slackErrorFormatter([
      `Opps, \`${originalText}\` is not a command.`,
      'Type `/ttt help` to see the available options.'])
  }

  // Handle Argument error - when user passes less or more arguments to a command
  if (error instanceof Errors.ArgumentError) {
    return formatter.slackErrorFormatter([
      `Invalid number of agruments was passed to \`/ttt ${originalText}\``,
      'Type `/ttt help` to see the available options.'])
  }

  // Handle SlackNotUserIdError - when mentions are not actual users
  if (error instanceof Errors.SlackNotUserIdError) {
    return formatter.slackErrorFormatter([error.message,
      'Please try selecting someone using `@username`'])
  }

  // Handles SlackGameInProgressError - when there is a game in progress for a given channel in a team
  if (error instanceof Errors.SlackGameInProgressError) {
    return formatter.slackErrorFormatter(config.get('slack.messages.gameInProgress'))
  }

  // Handles SlacNoGameInProgressError - when there is no game in progress for a given channel in a team
  if (error instanceof Errors.SlacNoGameInProgressError) {
    return formatter.slackErrorFormatter(config.get('slack.messages.gameInProgress'))
  }

  // Handles SamePlayersError - when a user challenges themselves
  if (error instanceof Errors.SamePlayersError) {
    return formatter.slackErrorFormatter(config.get('slack.messages.challengeSelf'))
  }

  // Handles WrongPlayerError - when a user tries to make a move on a game they are not apart of
  if (error instanceof Errors.WrongPlayerError) {
    return formatter.slackErrorFormatter('Sorry, you\'re not one of the players :expressionless:')
  }

  // Handles NotTurnError - when a user tries to make a move when it's not their turn
  if (error instanceof Errors.NotTurnError) {
    return formatter.slackErrorFormatter('It\'s not your turn :stuck_out_tongue_closed_eyes:')
  }

  // Handles CellTakenError - when a user selects a board position that is already filled
  if (error instanceof Errors.CellTakenError) {
    return formatter.slackErrorFormatter(`Cell "${originalText}" already taken`)
  }

  // Handles CellTakenError - when a user tries to make a move with wrong parameter
  // (i.e string, negative number, floating point number)
  if (error instanceof Errors.InvalidMoveError) {
    return formatter.slackErrorFormatter([`"${originalText}" is not a valid number.`,
      'Place numbers between 1-9'])
  }

  // Unknown error or system error
  winston.error(error, originalText)
  return formatter.slackErrorFormatter('Oops, something went wrong.')
}

/*
* Finds or registers a user a user given teamId and userId
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} userId - normalizeString userId
* @returns {Promise<User>} user - Mongoose User object
*/
const getOrCreateUser = async (teamId, userId) => {
  let outlet = config.get('slack.outletName')
  // Form the unique id for slack users
  let uniqueId = `${outlet}|${teamId}|${userId}`
  let user = await services.db.users.getByUniqueId(uniqueId)
  // Create a user if no user is found
  if (!user) {
    // Fetch user info from slack
    let slackUser = await services.slack.api.getUserInfo(teamId, userId)
    user = await services.db.users.create(uniqueId, userId, outlet,
        slackUser.email, slackUser.firstName, slackUser.lastName)
  }
  return user
}

/*
* Render a game for slack
* @param {Object} game - Mongoose Game object
* @param {boolean} mentionPlayer - slack mention the players of this game
* @param {boolean} mentionTurn - slack mention whose turn it is
* @param {boolean} hint - give hint on how to place next move
* @returns {[(string|Array)]} response - list of messages to be send to user
*/
const render = (game, mentionPlayer, mentionTurn, hint) => {
  let response = []

  // Get players string in from: <@userId> (X or O)
  let xPlayerMention = formatter.slackUserMention(game.xPlayer.externalId) +
    ` (${config.get('game.xSymbole')})`
  let oPlayerMention = formatter.slackUserMention(game.oPlayer.externalId) +
    ` (${config.get('game.oSymbole')})`

  // Mention players if mentionPlayer is true
  if (mentionPlayer) {
    response.push(`${xPlayerMention} :vs: ${oPlayerMention}`)
  }

  // Render board
  response.push(formatter.BACK_TICK_BLOCK +
    formatter.boardAsciiFormatter(game.board) +
    formatter.BACK_TICK_BLOCK)

  // If we have a winner
  if (game.winner) {
    // Game was a draw
    if (game.winner === config.get('game.drawSymbole')) {
      response.push('What a shame. No one won the game :scream:')
    } else {
      let winner = game.winner === config.get('game.xSymbole') ? xPlayerMention : oPlayerMention
      response.push(`${winner} won the game :tada:`)
    }
  }

  // If don't have a winner
  if (!game.winner) {
    // Mention whose turn it is if mentionTurn is true
    if (mentionTurn) {
      response.push(`It's ${game.isXTurn ? xPlayerMention : oPlayerMention}'s turn.`)
    }
    // Mention give user hint if hint is true
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
