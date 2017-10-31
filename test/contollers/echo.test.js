const echoController = require('../../app/controllers/echo')

describe('testing functions in echo controller', () => {
  test('Vienna <3 sausage', () => {
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
