const _ = require('lodash')
const isUserRegx = /<@(U|W).+>/i

const parseCommand = (text) => {
  let output = {
    command: 'DEFAULT',
    args: []
  }

  if (!text || text === '') {
    return output
  }

  let delimitedText = text.trim().split(/[\s\t]+/)
  // Normalize string
  delimitedText = _.map(delimitedText, normalizeString)
  // Drop any undefined entries
  delimitedText = _.filter(delimitedText, (arg) => arg)

  if (delimitedText.length === 0) {
    return output
  }

  output.command = _.first(delimitedText)

  if (delimitedText.length > 1) {
    output.args = _.drop(delimitedText)
  }

  return output
}

const parseSlackUserId = (token) => {
  if (isUserRegx.test(token)) {
    return normalizeString(_.first(token.match(/[a-z0-9]+/i)))
  }
}

const normalizeString = (string) => {
  if (!string || string === '') {
    return
  }

  return string.trim().toUpperCase()
}

module.exports = {
  parseSlackUserId,
  normalizeString,
  parseCommand
}
