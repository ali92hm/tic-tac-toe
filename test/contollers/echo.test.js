const echoController = require('../../app/controllers/echo')

describe('indexRequestValidator(method, query, body)', () => {
  var method
  var queryString
  var body
  beforeEach(() => {
    method = 'POST'
    queryString = '?name=you&&this=that'
    body = {
      a: 'somevalue',
      b: 2,
      c: true
    }
  })

  test('should undefined for complete params', () => {
    expect(echoController.indexRequestValidator(method, queryString, body))
      .toBeUndefined()
  })

  test('should undefined for missing optional param queryString', () => {
    expect(echoController.indexRequestValidator(method, undefined, body))
      .toBeUndefined()
  })

  test('should return error for missing method', () => {
    expect(echoController.indexRequestValidator(undefined, queryString, body))
      .toEqual(['No "method" was passed.'])
  })

  test('should return error for wrong method', () => {
    expect(echoController.indexRequestValidator('SOMEMETHOD', queryString, body))
      .toEqual(['"SOMEMETHOD" is not an allowed method.'])
  })
})

describe('echo(method, query, body)', () => {
  test('it should return everything that is passed to it', () => {
    let method = 'somemethod'
    let queryString = '?name=you&&this=that'
    let body = {
      a: 'somevalue',
      b: 2,
      c: true
    }

    let result = {
      message: `Recieved ${method}`,
      queryString: queryString,
      body: body
    }

    expect(echoController.echoRequestHandler(method, queryString, body))
      .resolves.toEqual(result)
  })
})
