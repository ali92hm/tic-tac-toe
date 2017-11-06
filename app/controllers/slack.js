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
    let response
    // Command is help or empty
    if (command === config.get('slack.commands.default') ||
        command === config.get('slack.commands.help')) {
      response = helpMenu()
    }

    // Command is challenge
    if (command === config.get('slack.commands.challenge')) {
      response = await challenge(teamId, channelId, userId, args)
    }

    // command is display board
    if (command === config.get('slack.commands.displayBoard')) {
      response = await display(teamId, channelId)
    }

    // command is place board
    if (command === config.get('slack.commands.place')) {
      response = await place(teamId, channelId, userId, args)
    }

    if (!response) {
      throw new Errors.SlackUknownCommandError(`${command} is not a command`)
    }

    return formatter.slackResponseFormatter(response)
  } catch (error) {
    let errorMessage = getErrorMessage(error, text, args)
    return formatter.slackErrorFormatter(errorMessage)
  }
}

/*
* Handles the challenge command - Creates a game for a channel if one doesn't exist
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} channelId - normalizeStringt channelId
* @param {string} userId - normalizeString userId
* @param {[(string|Array)]} args - list of command arguments. Should contain only 1 slack mention string
* @returns {Promise<[(string|Array)]>} message - resulting message: mention players + board + mention whose turn + instructions
*/
const challenge = async (teamId, channelId, userId, args) => {
  winston.verbose('challenge', teamId, channelId, userId, args)
  // Registering or retrieving users
  let opponentUserId = parser.parseSlackUserId(parser.getOnlyItem(args))
  let user = await getOrCreateUser(teamId, userId)
  let opponentUser = await getOrCreateUser(teamId, opponentUserId)

  // Create a game
  let slackGame = await services.db.slackGame.create(teamId, channelId, user, opponentUser)
  // Render the board, mention all players, mention whose turn it is, give hits)
  return render(slackGame.game, true, true, true)
}

/*
* Handles the display command - renders a game if exits
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} channelId - normalizeStringt channelIds
* @returns {Promise<[(string|Array)]>} message - resulting message: mention players + board + mention whose turn + instructions
*/
const display = async (teamId, channelId) => {
  winston.verbose('display', teamId, channelId)
  // get the in progress game
  let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
  // Render the board, mention all players, mention whose turn it is, give hits)
  return render(slackGame.game, true, true, true)
}

/*
* Handles the place command - make a move for a userId
* @async
* @param {string} teamId - normalizeString teamId
* @param {string} channelId - normalizeStringt channelId
* @param {string} userId - normalizeString userId
* @param {[(string|Array)]} args - list of command arguments. Should contain only 1 integer string
* @returns {Promise<[(string|Array)]>} message - resulting message: board + winners or mention whose turn + instructions
*/
const place = async (teamId, channelId, userId, args) => {
  winston.verbose('place', teamId, channelId, userId, args)
  // Get index from args
  let index = parser.parseWholeNumber(parser.getOnlyItem(args)) - 1
  // Get the user
  let user = await getOrCreateUser(teamId, userId)
  // get the game in progress from db
  let slackGame = await services.db.slackGame.getInProgress(teamId, channelId)
  // update the game
  let game = await gameController.place(slackGame.game, user, index)
  // Render the board, don't mention all players, mention whose turn it is, give hits)
  return render(game, false, true, true)
}

/*
* Handles default (empty) and help command - shows help menu
* @returns {string} message - help menu
*/
const helpMenu = () => {
  return config.get('slack.messages.helpMessage')
}

/*
* Returns error message for a given error
* @param {Error} error - custom or system error object
* @param {string} originalText - The original text sent by slack
* @param {[(string|Array)]} args - parsed arguments
* @returns {[(string|Array)]} message - help menu
*/
const getErrorMessage = (error, originalText, args) => {
  winston.info(error, originalText)

  // Handle Unknown Errors and show help command
  if (error instanceof Errors.SlackUknownCommandError) {
    return [`Opps, \`${originalText}\` is not a command.`]
      .concat(config.get('slack.messages.help'))
  }

  // Handle Argument error - when user passes less or more arguments to a command
  if (error instanceof Errors.ArgumentError) {
    return [`Invalid number of agruments was passed to \`/ttt ${originalText}\``]
      .concat(config.get('slack.messages.help'))
  }

  // Handle SlackNotUserIdError - when mentions are not actual users
  if (error instanceof Errors.SlackNotUserIdError) {
    return [error.message].concat(config.get('slack.messages.notUserId'))
  }

  // Handles SlackGameInProgressError - when there is a game in progress for a given channel in a team
  if (error instanceof Errors.SlackGameInProgressError) {
    return config.get('slack.messages.gameInProgress')
  }

  // Handles SlacNoGameInProgressError - when there is no game in progress for a given channel in a team
  if (error instanceof Errors.SlacNoGameInProgressError) {
    return config.get('slack.messages.noGameInProgress')
  }

  // Handles SamePlayersError - when a user challenges themselves
  if (error instanceof Errors.SamePlayersError) {
    return config.get('slack.messages.challengeSelf')
  }

  // Handles WrongPlayerError - when a user tries to make a move on a game they are not apart of
  if (error instanceof Errors.WrongPlayerError) {
    return config.get('slack.messages.wrongPlayer')
  }

  // Handles NotTurnError - when a user tries to make a move when it's not their turn
  if (error instanceof Errors.NotTurnError) {
    return config.get('slack.messages.notTurn')
  }

  // Handles CellTakenError - when a user selects a board position that is already filled
  if (error instanceof Errors.CellTakenError) {
    return `Cell "${_.first(args)}" already taken`
  }

  // Handles NotIntegerError and InvalidMoveError - when a user tries to make a move with wrong parameter
  // (i.e string, negative number, floating point number)
  if (error instanceof Errors.NotIntegerError ||
      error instanceof Errors.InvalidMoveError) {
    return [`"${_.first(args)}" is not a valid number.`]
    .concat(config.get('slack.messages.invalidMove'))
  }

  // Unknown error or system error
  winston.error(error, originalText)
  return config.get('slack.messages.catchAllMessage')
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
      response.push(config.get('slack.messages.draw').pop())
    } else {
      let winner = game.winner === config.get('game.xSymbole') ? xPlayerMention : oPlayerMention
      response.push(`${winner} ${config.get('slack.messages.winner').pop()}`)
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
      response.push(config.get('slack.messages.nextMoveHint').pop())
    }
  }

  return response
}

module.exports = {
  tttRequestValidator,
  tttRequestHandler
}
