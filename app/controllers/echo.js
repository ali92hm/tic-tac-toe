const allowedMethods = {
  GET: true,
  POST: true,
  PUT: true,
  DELETE: true
}

/*
* Validates parameters for echo "/" api
* @param {string} method - HTTP method name
* @param {Object} query - HTTP parsed query string
* @param {Object} body - HTTP request body
* @returns {[(string|Array)]} - List of errors or undefined if there are no errors
*/
const indexRequestValidator = (method, query, body) => {
  let errors = []

  if (!method) {
    errors.push((`No "method" was passed.`))
  }

  if (method && !allowedMethods[method]) {
    errors.push((`"${method}" is not an allowed method.`))
  }

  // Add more validating according to your program

  if (errors.length !== 0) {
    return errors
  }
}

/*
* Echoes a request method, query sting and body back
* @async
* @param {string} method - HTTP method name
* @param {Object} query - HTTP parsed query string
* @param {Object} body - HTTP request body
* @returns {Promise<Object>}
*/
const echoRequestHandler = async (method, query, body) => {
  let result = {
    message: `Recieved ${method}`,
    queryString: query,
    body: body
  }

  return result
}

module.exports = {
  indexRequestValidator,
  echoRequestHandler
}
