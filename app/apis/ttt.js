const express = require('express')
const _ = require('lodash')
const router = express.Router()
const util = require('../utils/response')
const controller = require('../controllers/ttt')

module.exports = (app) => {
  app.use('/api/ttt', router)
}

router.post('/', (req, res, next) => {
  let fields = {
    team_id: req.body.team_id,
    channel_id: req.body.channel_id,
    user_id: req.body.user_id,
    text: req.body.text
  }

  // check to see all fields are provided
  _.forEach(fields, (value, key) => {
    if (!value) {
      return util.handleRequestError(res)(`No "${key}" was passed`)
    }
  })

  controller.tttHandler(fields.team_id, fields.channel_id, fields.user_id, fields.text)
    .then(util.formatSlackResult())
    .then(util.respondWithResult(res))
    .catch(util.handleInternalError(res))
})
