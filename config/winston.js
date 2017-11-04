const winston = require('winston')
const morgan = require('morgan')

module.exports = (app, config) => {
  winston.clear()

  winston.add(winston.transports.Console, {
    level: config.get('winston.logLevel'),
    prettyPrint: true,
    colorize: true,
    timestamp: false
  })

  if (config.get('isProduction')) {
    // TODO: Add remote error pumping on prod
  }

  winston.info('Winston: Added Console logger with level', config.get('winston.logLevel'))

  app.use(morgan('dev', {
    stream: {
      write: (message, encoding) => {
        winston.info(message)
      }
    }
  }))
}
