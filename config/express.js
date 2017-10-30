const glob = require('glob')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const compress = require('compression')
const cors = require('cors')

module.exports = (app, config) => {
  app.locals.ENV = config.get('env')
  app.locals.ENV_DEVELOPMENT = config.get('isProduction')

  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(cookieParser())
  app.use(compress())
  app.use(cors())

  let apis = glob.sync(path.join(config.get('root'), 'app', 'apis', '*.js'))
  apis.forEach((api) => {
    require(api)(app)
  })

  app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  if (!config.get('isProduction')) {
    app.use((err, req, res, next) => {
      res.status(err.status || 500)
      res.json({
        message: err.message,
        error: err
      })
    })
  }

  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
      message: err.message,
      error: {}
    })
  })

  return app
}
