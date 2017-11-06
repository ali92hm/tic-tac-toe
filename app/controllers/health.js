const winston = require('winston')
const dbConnection = require('mongoose').connection

/*
* Checks to see if the service is operational
* @returns {Object} health
*/
const healthRequestHandler = () => {
  let health = {
    message: 'ok',
    status: 200,
    dbState: dbConnection.readyState
  }

  // Check database connection
  if (dbConnection.readyState !== dbConnection.states.connected) {
    health.message = 'db_failure'
    health.status = 500
    winston.error(health)
  }

  winston.info(health)
  return health
}

module.exports = {
  healthRequestHandler
}
