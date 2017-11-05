const express = require('express')
const winston = require('winston')
const config = require('config')

const app = express()

// Configure winston
require('./config/winston')(app, config)
// Configure mongo
let connection = require('./config/mongo')(app, config)
// Configure
require('./config/express')(app, config)

// Start accepting http calls after mongoose is connected
connection.on('connected', () => {
  app.listen(config.get('port'), () => {
    winston.info('Express server listening on port:', config.get('port'))
  })
})

exports = module.exports = app
