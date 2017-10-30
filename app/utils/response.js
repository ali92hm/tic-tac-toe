exports.respondWithResult = (res, statusCode) => {
  statusCode = statusCode || 200
  return (entity) => {
    if (entity) {
      return res.status(statusCode).json(entity)
    }
  }
}

exports.respondWithSuccess = (res, statusCode) => {
  statusCode = statusCode || 202
  return () => {
    return res.status(statusCode).send({message: 'success'})
  }
}

exports.handleRequestError = (res, statusCode) => {
  statusCode = statusCode || 400
  return (message) => {
    return res.status(statusCode).send({
      type: 'Bad request',
      error: message
    })
  }
}

exports.handleInternalError = (res, statusCode) => {
  statusCode = statusCode || 500
  return (err) => {
    res.status(statusCode).send({
      type: 'Internal Error',
      error: err.message
    })
  }
}
