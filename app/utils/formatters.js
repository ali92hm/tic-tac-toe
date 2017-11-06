const BACK_TICK_BLOCK = '```'

/*
* Formats texts and attachment to be send to slack
* @param {[(string|Array)]} text - array of texts to be sent to user
* @param {[(string|Array)]} attachment - slack attachments
* @param {boolean} error - Indicated whether or not the response if an error
* @param {string} [join] - The character to use for joining strings in array
* @return {Object} response - slack response object
*/
const slackResponseFormatter = (text, attachments, error, join = '\n') => {
  if (Array.isArray(text)) {
    text = text.join(join)
  }

  let response = {
    text: text,
    attachments: attachments,
    response_type: 'in_channel'
  }

  if (error) {
    delete response.response_type
  }

  return response
}

/*
* Converts a slack userId to slack mention format
* @param {string} userId - normalized slack userId
* @returns {string} mention - mention string
*/
const slackUserMention = (userId) => {
  return `<@${userId}>`
}

/*
* Converts the game board into ascii board
* @param {[(string|Array)]} board - game board
* @returns {string}} board - ascii board
*/
const boardAsciiFormatter = (board) => {
  for (let i = 0; i < board.length; i++) {
    board[i] = board[i] || (i + 1)
  }
  let [ v1, v2, v3, v4, v5, v6, v7, v8, v9 ] = board

  let template = `
  +---+---+---+
  | ${v1} | ${v2} | ${v3} |
  |---+---+---|
  | ${v4} | ${v5} | ${v6} |
  |---+---+---|
  | ${v7} | ${v8} | ${v9} |
  +---+---+---+`

  return template
}

/*
* Formats errors to be send to slack
* @param {[(string|Array)]} messages - array of texts to be sent to user
* @param {string} [join] - The character to use for joining strings in array
* @return {Object} response - slack response object
*/
const slackErrorFormatter = (messages, join = '\n') => {
  return slackResponseFormatter(messages, undefined, true, join)
}

module.exports = {
  BACK_TICK_BLOCK,
  slackResponseFormatter,
  boardAsciiFormatter,
  slackUserMention,
  slackErrorFormatter
}
