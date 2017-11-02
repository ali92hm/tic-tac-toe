const _ = require('lodash')
const services = require('../services')

const createGame = async (userId, opponetId) => {
  return services.db.game.create(userId, opponetId)
}

const getGame = (_id, populate) => {
  return services.db.game.getById(_id, populate)
}

const place = async (gameId, user, index) => {
  console.log(user)
  let game = await getGame(gameId)
  console.log('Retrieved game:', game)

  // // Ensure if userId is a player of this game
  if (!user.equals(game.xPlayer) && !user.equals(game.oPlayer)) {
    throw new Error('Sorry you\'re not one of the players :expressionless:')
  }

  // // Ensure its userId's turn
  if ((game.isXTurn && !user.equals(game.xPlayer)) ||
      (!game.isXTurn && !user.equals(game.oPlayer))) {
    throw new Error('Its not your turn yet')
  }

  // Ensure Cell is not empty
  if (game.board[index]) {
    throw new Error('Cell already taken')
  }

  // Place the move
  game.board[index] = game.isXTurn ? 'x' : 'o'
  // Flip the turn
  game.isXTurn ^= true
  // Check for game status
  game.winner = whoIsWinner(game.board)
  console.log('Saving game:', game)
  return services.db.game.update(game._id, game.isXTurn, game.board, game.winner)
}

const whoIsWinner = (board) => {
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

  // diag check
  let i = 0
  if (board[i] && board[i] === board[i + 4] && board[i] === board[i + 4 + 4]) {
    return board[i]
  }

  i = 2
  if (board[i] && board[i] === board[i + 2] && board[i] === board[i + 2 + 2]) {
    return board[i]
  }

  // Board is full and no winner
  if (_.filter(board, (c) => { if (c) return c }).length === 9) {
    return 'Draw'
  }
}

module.exports = {
  createGame,
  getGame,
  place
}
