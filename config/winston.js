const winston = require('winston')
const morgan = require('morgan')

/*
* Configures winston (logging)
* @param {Object} app - express application
* @param {Object} config - app env variables
*/
module.exports = (app, config) => {
  winston.clear()

  // Console logging
  winston.add(winston.transports.Console, {
    level: config.get('winston.logLevel'),
    prettyPrint: true,
    colorize: true,
    timestamp: false
  })

  // Production logging
  if (config.get('isProduction')) {
    // TODO: Add remote error pumping on prod
    winston.info('Winston: Added remote logger with level', config.get('winston.logLevel'))
  }

  // Route logging
  app.use(morgan('dev', {
    stream: {
      write: (message, encoding) => {
        winston.info(message)
      }
    }
  }))

  winston.info('Winston: Added Console logger with level', config.get('winston.logLevel'))
}
