const express = require('express')
const router = express.Router()
const util = require('../utils/response')
const controller = require('../controllers/slack')
const auth = require('../auth/slack')

module.exports = (app) => {
  app.use('/api/slack', auth.verifySlackToken, router)
}

/*
* Handles POST calls to /api/slack/ttt
* @param {Object} req express req object
* @param {Object} res express res object
* @param {Object} next express next object
*/
router.post('/ttt', (req, res, next) => {
  let fields = req.body
  let errors = controller.tttRequestValidator(fields)
  if (errors) {
    return util.handleRequestError(res, errors)
  }

  controller.tttRequestHandler(fields.team_id, fields.channel_id, fields.user_id, fields.text)
    .then(util.respondWithResult(res))
    .catch(util.handleInternalError(res))
})
