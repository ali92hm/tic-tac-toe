const config = require('config')
const services = require('../services')
const Errors = require('../utils/errors')

/*
* Creates a tic tac toe game
* @async
* @param {Object} player1 - Mongoose User object for player 1
* @param {Object} player2 - Mongoose User object for player 2
* @returns {Promise<Game>} game - Mongoose object for game
*/
const createGame = (player1, player2) => {
  if (!player1 || !player2) {
    throw new Errors.NoPlayerError(`Player1 ${player1} and/or Player2 ${player2} are not valid players`)
  }

  if (player1.equals(player2)) {
    throw new Errors.SamePlayersError(`Player1 ${player1} and Player2 ${player2} are the same user`)
  }

  return services.db.game.create(player1, player2)
}

/*
* Retrieves a tic tac toe game
* @async
* @param {string} _id - _id for a game object
* @returns {Promise<Game>} game - Mongoose object for game
*/
const getGame = (_id) => {
  return services.db.game.getById(_id)
}

/*
* Places a move for a player
* @async
* @param {string} _id - _id for a game object
* @param {Object} user - Mongoose User object for player taking action
* @returns {Promise<Game>} game - Mongoose object for updated game
*/
const place = async (_id, user, index) => {
  let game = await getGame(_id)

  // Ensure user is a player of this game
  if (!user.equals(game.xPlayer) && !user.equals(game.oPlayer)) {
    throw new Errors.WrongPlayerError(`User ${user} is not a part of this game`)
  }

  // Ensure it's user's turn
  if ((game.isXTurn && !user.equals(game.xPlayer)) ||
      (!game.isXTurn && !user.equals(game.oPlayer))) {
    throw new Errors.NotTurnError(`Its not ${user} turn`)
  }

  // Make sure index is not out of bounds
  if (index === undefined || index === null || isNaN(index) ||
       index < 0 || index > game.board.length - 1) {
    throw new Errors.InvalidMoveError(`${index} is not a valid index`)
  }

  // Ensure Cell is not empty
  if (game.board[index]) {
    throw new Errors.CellTakenError(`Cell ${index} aready taken`)
  }

  // Place the move
  game.board[index] = game.isXTurn ? config.get('game.xSymbole') : config.get('game.oSymbole')
  // Flip the turn
  game.isXTurn ^= true
  // Check for game status
  game.winner = getWinner(game.board)
  return services.db.game.update(game._id, game.isXTurn, game.board, game.winner)
}

/*
* Checks to see if there is a winner or game has ended
* @param {[(string|Array)]} board - array for game board
* @returns {string} winner - Returns constant strings for winner (x,o,draw)
*/
const getWinner = (board) => {
  for (let i = 0; i < 3; i++) {
    // col check
    if (board[i] && board[i] === board[i + 3] && board[i] === board[i + 6]) {
      return board[i]
    }

    // row check
    let j = i * 3
    if (board[j] && board[j] === board[j + 1] && board[j] === board[j + 2]) {
      return board[j]
    }
  }

  // diagonal check
  let i = 0
  if (board[i] && board[i] === board[i + 4] && board[i] === board[i + 4 + 4]) {
    return board[i]
  }

  // reverse diagonal check
  i = 2
  if (board[i] && board[i] === board[i + 2] && board[i] === board[i + 2 + 2]) {
    return board[i]
  }

  // Board is full and no winner
  if (board.indexOf(undefined) === -1) {
    return config.get('game.drawSymbole')
  }
}

module.exports = {
  createGame,
  getGame,
  place
}
