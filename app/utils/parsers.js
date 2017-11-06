const _ = require('lodash')
const Errors = require('./errors')
const isUserRegx = /<@(U|W).+>/i
const isWholeIntRegx = /^-?\d+$/i

/*
* Parses text in the "Command arg1 arg2 ag3 ..." format
* @param {string} text - input text
* @param {string} [defaultCommand] - String to use for command if nothing is provided
* @returns {Object} result - Object with command and an array of args
*/
const parseCommand = (text, defaultCommand = '') => {
  let output = {
    command: defaultCommand.toUpperCase(),
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

/*
* Parses a slack userId from mention that matches /<@(U|W).+>/i
* @param {string} token - mention userId
* @returns {string} userId - normalized slack userId
*/
const parseSlackUserId = (token) => {
  if (!isUserRegx.test(token)) {
    throw new Errors.SlackNotUserIdError(`"${token}" is not a slack userId`)
  }

  return normalizeString(_.first(token.match(/[a-z0-9]+/i)))
}

/*
* Returns the first item of the array and ensures there is at least/most one element
* @param {[Object]} array - input array
* @returns {Object} firstItem - First item of the array
*/
const getOnlyItem = (array) => {
  if (!Array.isArray(array)) {
    throw new Errors.ArgumentError(`"${array}" is not an array`)
  }

  if (array.length !== 1) {
    throw new Errors.ArgumentError('More than one argument was passed')
  }

  return _.first(array)
}

/*
* Parses a whole number from string to int
* @param {string} string - input string
* @returns {integer} number - parsed integer
*/
const parseWholeNumber = (string) => {
  if (!isWholeIntRegx.test(string)) {
    throw new Errors.NotIntegerError(`"${string}" is not a whole number`)
  }

  return parseInt(string)
}

/*
* Normalized the strings for this application.
*   i.e nulls and empty strings are turned into undefined. The rest is uppercased
* @param {string} string - input string
* @returns {string} string - normalized string
*/
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
