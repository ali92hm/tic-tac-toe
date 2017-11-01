const echoController = require('../../app/controllers/echo')

describe('requestValidatorIndex(method, query, body)', () => {
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
    expect(echoController.requestValidatorIndex(method, queryString, body))
      .toBeUndefined()
  })

  test('should undefined for missing optional param queryString', () => {
    expect(echoController.requestValidatorIndex(method, undefined, body))
      .toBeUndefined()
  })

  test('should return error for missing method', () => {
    expect(echoController.requestValidatorIndex(undefined, queryString, body))
      .toEqual(['No "method" was passed.'])
  })

  test('should return error for wrong method', () => {
    expect(echoController.requestValidatorIndex('SOMEMETHOD', queryString, body))
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

    expect(echoController.echo(method, queryString, body)).resolves.toEqual(result)
  })
})
