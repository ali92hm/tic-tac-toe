const express = require('express')
const router = express.Router()
const controller = require('../controllers/health')

module.exports = (app) => {
  app.use('/api/health', router)
}

/*
* Handles all HTTP method api calls to /api/health and reposts the health of the system
* @param {Object} req - express req object
* @param {Object} res - express res object
* @param {Object} next - express next object
*/
router.get('/', (req, res, next) => {
  let result = controller.healthRequestHandler()
  res.status(result.status).send(result)
})
