const express = require('express')
const router = express.Router()
const util = require('../utils/response')
const controller = require('../controllers/echo')

module.exports = (app) => {
  app.use('/api/echo', router)
}

/*
* Handles all HTTP method api calls to /api/echo and echoes the passed params
* @param {Object} req - express req object
* @param {Object} res - express res object
* @param {Object} next - express next object
*/
router.all('/', (req, res, next) => {
  let errors = controller.indexRequestValidator(req.method, req.query, req.body)
  if (errors) {
    return util.handleRequestError(res, errors)
  }

  controller.echoRequestHandler(req.method, req.query, req.body)
    .then(util.respondWithResult(res))
    .catch(util.handleInternalError(res))
})
