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

const slackUserMention = (userId) => {
  return `<@${userId}>`
}

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

const slackErrorFormatter = (messages, join = '\n') => {
  return slackResponseFormatter(messages, null, true, join)
}

module.exports = {
  slackResponseFormatter,
  boardAsciiFormatter,
  slackUserMention,
  slackErrorFormatter
}
