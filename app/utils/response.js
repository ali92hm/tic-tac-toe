exports.respondWithResult = (res, statusCode) => {
  statusCode = statusCode || 200
  return (entity) => {
    if (entity) {
      return res.status(statusCode).json(entity)
    }
  }
}

exports.formatSlackResult = () => {
  return (message) => {
    return {
      response_type: 'in_channel',
      text: message.toString()
    }
  }
}

exports.respondWithSuccess = (res, statusCode) => {
  statusCode = statusCode || 202
  return () => {
    return res.status(statusCode).send({message: 'success'})
  }
}

exports.handleRequestError = (res, message, statusCode) => {
  statusCode = statusCode || 400
  return res.status(statusCode).send({
    type: 'Bad request',
    error: message
  })
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
