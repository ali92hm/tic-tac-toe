const _ = require('lodash')
const Errors = require('./errors')
const isUserRegx = /<@(U|W).+>/i

const parseCommand = (text, defaultCommand = '') => {
  let output = {
    command: defaultCommand,
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
  if (!isUserRegx.test(token)) {
    throw new Errors.SlackNotUserIdError(`"${token}" is not a slack userId`)
  }

  return normalizeString(_.first(token.match(/[a-z0-9]+/i)))
}

const getOnlyItem = (array) => {
  if (array.length !== 1) {
    throw new Errors.ArgumentError('More than one argument was passed')
  }

  return _.first(array)
}

const parseWholeNumber = (string) => {
  // TODO: Turn this into regex
  if (string.indexOf('.') !== -1) {
    throw new Errors.NotIntegerError(`"${string}" is not a whole number`)
  }

  return parseInt(string)
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
  getOnlyItem,
  parseCommand,
  parseWholeNumber
}
