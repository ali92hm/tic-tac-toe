/*
* Handles responding to api call with result
* @param {Object} res - express result object
* @param {integer} [statusCode] - http status code
*/
const respondWithResult = (res, statusCode = 200) => {
  return (entity) => {
    if (entity) {
      return res.status(statusCode).json(entity)
    }
    return res.status(statusCode).send()
  }
}

/*
* Handles responding to api call with 400 for bad requests
* @param {Object} res - express result object
* @param {integer} [statusCode] - http status code
*/
const handleRequestError = (res, message, statusCode = 400) => {
  return res.status(statusCode).send({
    type: 'Bad request',
    error: message
  })
}

/*
* Handles responding to api call with 500 for internal errors
* @param {Object} res - express result object
* @param {integer} [statusCode] - http status code
*/
const handleInternalError = (res, statusCode = 500) => {
  return (err) => {
    res.status(statusCode).send({
      type: 'Internal Error',
      error: err ? err.message : 'unknown error'
    })
  }
}

module.exports = {
  respondWithResult,
  handleRequestError,
  handleInternalError
}
