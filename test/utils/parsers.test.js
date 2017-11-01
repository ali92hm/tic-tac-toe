const parser = require('../../app/utils/parsers')

describe('parseCommand(text)', () => {
  var defaultRetrun

  beforeEach(() => {
    defaultRetrun = {
      command: 'default',
      args: []
    }
  })

  test('should return default command and empty array if text is undefined', () => {
    expect(parser.parseCommand()).toEqual(defaultRetrun)
  })

  test('should return default command and empty array if text is empty', () => {
    let text = ''
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return default command and empty array if text is white space', () => {
    let text = '  '
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is one word', () => {
    let text = 'someComMand'
    defaultRetrun.command = text.toLowerCase()
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is one word', () => {
    let text = 'somecommand'
    defaultRetrun.command = text
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is one word with any number of spaces', () => {
    let text = 'somecommand    '
    defaultRetrun.command = 'somecommand'
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command challege and array of userId', () => {
    let text = 'challege @<@U7QP7APCL|username>'
    let expectedResult = {
      command: 'challege',
      args: ['@<@u7qp7apcl|username>']
    }
    expect(parser.parseCommand(text)).toEqual(expectedResult)
  })

  test('should return command name and empty array if text is multiple words', () => {
    let text = 'somecommand arg1 ARG2 arg3 44 a - :: @<@U7QP7APCL|username>'
    defaultRetrun.command = 'somecommand'
    defaultRetrun.args = ['arg1', 'arg2', 'arg3', '44', 'a', '-', '::', '@<@u7qp7apcl|username>']
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is multiple words with any number of spaces', () => {
    let text = 'somecommand    aRg1 arg2 arg3        44    A'
    defaultRetrun.command = 'somecommand'
    defaultRetrun.args = ['arg1', 'arg2', 'arg3', '44', 'a']
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })
})

describe('parseSlackUserId(token)', () => {
  var userId
  var userString

  beforeEach(() => {
    userId = 'u7qp7apcl'
    userString = '<@U7QP7APCL|username>'
  })

  test('should return toLowerCaseed userId from userString', () => {
    expect(parser.parseSlackUserId(userString)).toBe(userId)
  })

  test('should return toLowerCaseed userId from userString without usename', () => {
    userString = '<@U7QP7APCL>'
    expect(parser.parseSlackUserId(userString)).toBe(userId)
  })

  test('should return undefined if token empty string', () => {
    expect(parser.parseSlackUserId('')).toBeUndefined()
  })

  test('should return undefined if token is undefined', () => {
    expect(parser.parseSlackUserId()).toBeUndefined()
  })

  test('should return undefined if token is not a user string', () => {
    userString = 'sdlf@<23df>||'
    expect(parser.parseSlackUserId(userString)).toBeUndefined()
  })
})

describe('normalizeString(string)', () => {
  test('should return a lowercase string without trailing empty spaces', () => {
    let string = '   should RETURN a.   String. !'
    let output = 'should return a.   string. !'
    expect(parser.normalizeString(string)).toBe(output)
  })

  test('should return a lowercase token without trailing empty spaces', () => {
    let string = '  RETURN'
    let output = 'return'
    expect(parser.normalizeString(string)).toBe(output)
  })

  test('should return undefined if token empty string', () => {
    expect(parser.normalizeString('')).toBeUndefined()
  })

  test('should return undefined if token is undefined', () => {
    expect(parser.normalizeString()).toBeUndefined()
  })
})
