const config = require('config')
const _ = require('lodash')
const services = require('../services')
const BACK_TICK_BLOCK = '```'

exports.tttHandler = async (teamId, channelId, userId, text) => {
  let delimitedText = text.split(' ')
  let command = _.first(delimitedText)
  let subCommands = _.drop(delimitedText)
  console.log(command)
  console.log(subCommands)

  switch (command) {
    case '':
      return help()
    case config.get('gameCommands').displayBoard:
      return displayBoard(teamId, channelId, userId)
    case config.get('gameCommands').challenge:
      return createGame(teamId, channelId, userId, subCommands)
    case config.get('gameCommands').place:
      return place(teamId, channelId, userId, subCommands)
    case config.get('gameCommands').reset:
      return resetGame(teamId, channelId, userId, subCommands)
    case config.get('gameCommands').help:
      return help()
  }
}

services.db.createGame('sdaf', 'sdaf', 'dsaf', 'dsaf')
.then(console.log)

const help = () => {
  return 'Help commands'
}

const turns = ['x', 'o']
var board = []
var currentTurn = 0

const displayBoard = (teamId, channelId, userId) => {
  let line = BACK_TICK_BLOCK
  for (var i = 0; i < 9; i++) {
    line += (board[i] || ' ') + ((i % 3 === 2) ? '\n' : ' | ')
  }

  return line + BACK_TICK_BLOCK
}

const createGame = (teamId, channelId, userId, subCommands) => {

}

const place = (teamId, channelId, userId, subCommands) => {
  let index = parseInt(_.first(subCommands))

  // CELL IS NOT EMPTY
  if (board[index]) {
    return 'Cell already taken'
  }

  board[index] = turns[currentTurn]
  currentTurn ^= 1

  let result = displayBoard(board)
  let winner = whoIsWinner(board)

  if (winner) {
    result += '\nThe winner is: ' + winner
    resetGame()
  }

  return result
}

const resetGame = (teamId, channelId, userId, subCommands) => {
  board = []
  currentTurn = 0
  return displayBoard(board)
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

  // tie
}
