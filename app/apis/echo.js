const express = require('express')
const router = express.Router()
const util = require('../utils/response')
const controller = require('../controllers/echo')

module.exports = (app) => {
  app.use('/api/echo', router)
}

router.all('/', (req, res, next) => {
  if (!req.method) {
    return util.handleRequestError(res)('No "method" was passed')
  }

  controller.echo(req.method, req.params, req.body)
    .then(util.respondWithResult(res))
    .catch(util.handleInternalError(res))
})
