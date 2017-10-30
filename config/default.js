const path = require('path')
const env = process.env.NODE_ENV || 'development'

module.exports = {
  root: path.normalize(path.join(__dirname, '..')),
  env: env,
  isProduction: env === 'production',
  port: process.env.PORT || 3000,
  db: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://db/default',
      options: {
        useMongoClient: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500,
        poolSize: 5
      }
    }
  },
  gameCommands: {
    displayBoard: 'display',
    challenge: 'challenge',
    place: 'place',
    reset: 'reset',
    help: 'help'
  }
}
