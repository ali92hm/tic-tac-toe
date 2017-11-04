const config = require('config')

const verifySlackToken = (req, res, next) => {
  let token = req.body.token
  if (!token || !isvalidToken(token)) {
    return res.status(403).send({message: 'No auth or wrong token'})
  }
  next()
}

const isvalidToken = (token) => {
  // TODO obtain the token from Slack after OAuth?
  return token === config.get('slack.reqToken')
}

module.exports = {
  verifySlackToken
}
