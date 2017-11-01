const _ = require('lodash')
const services = require('../services')

const createGame = async (teamId, channelId, userId, opponetId) => {
  console.log('createGame', teamId, channelId, userId, opponetId)

  return services.db.createGame(teamId, channelId, userId, opponetId)
}

const getGame = (channelId) => {
  return services.db.getGameByChannelId(channelId)
}

const place = async (teamId, channelId, userId, index) => {
  let game = await getGame(channelId)
  console.log(game)

  // // Ensure if userId is a player of this game
  if (userId !== game.xUser && userId !== game.yUser) {
    throw new Error('Sorry youre not one of the player :expressionless:')
  }

  // // Ensure its userId's turn
  if (game.isXTurn) {
    if (userId !== game.xUser) {
      throw new Error('Its not your turn yet')
    }
  } else if (userId !== game.yUser) {
    throw new Error('Its not your turn yet')
  }

  // CELL IS NOT EMPTY
  if (game.board[index]) {
    throw new Error('Cell already taken')
  }

  if (game.isXTurn) {
    game.board[index] = 'x'
  } else {
    game.board[index] = 'o'
  }

  game.isXTurn ^= true

  let winner = whoIsWinner(game.board)
  game.winner = winner
  await services.db.updateGame(game._id, game.isXTurn, game.board, winner)
  return game
}

const whoIsWinner = (board) => {
  for (let i = 0; i < 3; i++) {
    let j = i * 3
    // row check
    if (board[j] && board[j] === board[j + 1] && board[j] === board[j + 2]) {
      return board[j]
    }

    // col check
    if (board[i] && board[i] === board[i + 3] && board[i] === board[i + 6]) {
      return board[i]
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

  // Draw
  if (_.filter(board, (c) => { if (c) return c }).length === 9) {
    return 'Draw'
  }
}

module.exports = {
  createGame,
  getGame,
  place
}
