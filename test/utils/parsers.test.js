const parser = require('../../app/utils/parsers')

describe('parseCommand(text)', () => {
  var defaultRetrun

  beforeEach(() => {
    defaultRetrun = {
      command: '',
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

  test('should return passed default command and empty array if text is empty', () => {
    let text = ''
    defaultRetrun.command = 'MYCOMMAND'
    expect(parser.parseCommand(text, 'MyCommand')).toEqual(defaultRetrun)
  })

  test('should return default command and empty array if text is white space', () => {
    let text = '  '
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is one word', () => {
    let text = 'someComMand'
    defaultRetrun.command = 'SOMECOMMAND'
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is one word with any number of spaces', () => {
    let text = 'somecommand    '
    defaultRetrun.command = 'SOMECOMMAND'
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command challenge and array of userId', () => {
    let text = 'challenge @<@U7QP7APCL|username>'
    let expectedResult = {
      command: 'CHALLENGE',
      args: ['@<@U7QP7APCL|USERNAME>']
    }
    expect(parser.parseCommand(text)).toEqual(expectedResult)
  })

  test('should return command name and empty array if text is multiple words', () => {
    let text = 'somecommand arg1 ARG2 arg3 44 a - :: @<@U7QP7APCL|username>'
    defaultRetrun.command = 'SOMECOMMAND'
    defaultRetrun.args = ['ARG1', 'ARG2', 'ARG3', '44', 'A', '-', '::', '@<@U7QP7APCL|USERNAME>']
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })

  test('should return command name and empty array if text is multiple words with any number of spaces', () => {
    let text = 'somecommand    aRg1 arg2 arg3        44    A'
    defaultRetrun.command = 'SOMECOMMAND'
    defaultRetrun.args = ['ARG1', 'ARG2', 'ARG3', '44', 'A']
    expect(parser.parseCommand(text)).toEqual(defaultRetrun)
  })
})

describe('parseSlackUserId(token)', () => {
  var userId
  var userString

  beforeEach(() => {
    userId = 'U7QP7APCL'
    userString = '<@U7QP7APCL|username>'
  })

  test('should return toLowerCaseed userId from userString', () => {
    expect(parser.parseSlackUserId(userString)).toBe(userId)
  })

  test('should return toLowerCaseed userId from userString without usename', () => {
    userString = '<@U7QP7APCL>'
    expect(parser.parseSlackUserId(userString)).toBe(userId)
  })

  test('should throw SlackNotUserIdError if token is empty string', () => {
    let fn = () => { parser.parseSlackUserId('') }
    expect(fn).toThrow()
  })

  test('should throw SlackNotUserIdError if token is undefined', () => {
    let fn = () => { parser.parseSlackUserId('') }
    expect(fn).toThrow()
  })

  test('should throw SlackNotUserIdError if token is not a user string', () => {
    let fn = () => { parser.parseSlackUserId('sdlf@<23df>||') }
    expect(fn).toThrow()
  })
})

describe('getOnlyItem(array)', () => {
  var obj
  beforeEach(() => {
    obj = {
      string: 'text1',
      bool: true,
      int: 34
    }
  })

  test('should return a the only string in array', () => {
    expect(parser.getOnlyItem([obj.string])).toBe(obj.string)
  })

  test('should return a the only object in array', () => {
    expect(parser.getOnlyItem([obj])).toEqual(obj)
  })

  test('should throw ArgumentError if array has more than 1 item', () => {
    let fn = () => { parser.getOnlyItem([obj, obj]) }
    expect(fn).toThrowError()
  })

  test('should throw ArgumentError if object if not array', () => {
    let fn = () => { parser.getOnlyItem(obj) }
    expect(fn).toThrowError()
  })

  test('should throw ArgumentError if array is empty', () => {
    let fn = () => { parser.getOnlyItem([]) }
    expect(fn).toThrow()
  })
})

describe('parseWholeNumber(string)', () => {
  test('should return a positive integer', () => {
    expect(parser.parseWholeNumber('234')).toBe(234)
  })

  test('should return a negative integer', () => {
    expect(parser.parseWholeNumber('-234')).toBe(-234)
  })

  test('should throw NotIntegerError if string has decimal point', () => {
    let fn = () => { parser.parseWholeNumber('1.45') }
    expect(fn).toThrow()
  })

  test('should throw NotIntegerError if string non number', () => {
    let fn = () => { parser.parseWholeNumber('a2134') }
    expect(fn).toThrow()
  })

  test('should throw NotIntegerError if string empty string', () => {
    let fn = () => { parser.parseWholeNumber('') }
    expect(fn).toThrow()
  })

  test('should throw NotIntegerError if string is undefined', () => {
    let fn = () => { parser.parseWholeNumber() }
    expect(fn).toThrow()
  })
})

describe('normalizeString(string)', () => {
  test('should return a uppercase string without trailing empty spaces', () => {
    let string = '   should return a.   String. !1234'
    let output = 'SHOULD RETURN A.   STRING. !1234'
    expect(parser.normalizeString(string)).toBe(output)
  })

  test('should return a uppercase token without trailing empty spaces', () => {
    let string = '  return'
    let output = 'RETURN'
    expect(parser.normalizeString(string)).toBe(output)
  })

  test('should return undefined if token empty string', () => {
    expect(parser.normalizeString('')).toBeUndefined()
  })

  test('should return undefined if token is undefined', () => {
    expect(parser.normalizeString()).toBeUndefined()
  })
})
