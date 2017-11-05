const config = require('config')

/*
* Express middleware for verifying slack request tokens
* @param {Object} req - express req object
* @param {Object} res - express res object
* @param {Object} next - express next object
*/
const verifySlackToken = (req, res, next) => {
  let token = req.body.token
  if (!token || !isvalidToken(token)) {
    return res.status(403).send({message: 'No auth or wrong token'})
  }
  next()
}

/*
* Verify the authenticity of slack toke
* @param {string} token - slack request token
* @returns {Boolean} true - if the request token matches the slack token
*/
const isvalidToken = (token) => {
  // TODO obtain the token from Slack after OAuth?
  return token === config.get('slack.reqToken')
}

module.exports = {
  verifySlackToken
}
