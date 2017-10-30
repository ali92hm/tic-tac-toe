const path = require('path')
const env = process.env.NODE_ENV || 'development'

module.exports = {
  root: path.normalize(path.join(__dirname, '..')),
  env: env,
  isProduction: env === 'production',
  port: process.env.PORT || 3000
}
