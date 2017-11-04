const mongoose = require('mongoose')
const winston = require('winston')

module.exports = (app, config) => {
  mongoose.connect(config.get('db').mongo.uri, config.get('db').mongo.options)
  mongoose.Promise = Promise
  mongoose.connection.on('error', (err) => {
    winston.error(`MongoDB connection error: ${err}`)
    process.exit(1)
  })
}
