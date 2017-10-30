const express = require('express')
const config = require('config')

const app = express()

require('./config/mongo')(app, config)
require('./config/express')(app, config)

app.listen(config.get('port'), () => {
  console.log('Express server listening on port ' + config.get('port'))
})

exports = module.exports = app
