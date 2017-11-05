const config = require('config')
const requests = require('../../utils/requests')
const Errors = require('../../utils/errors')

/*
* Get user info from slack api
* @async
* @param {string} teamId - normalized slack teamId
* @param {string} channelId - normalized slack channelId
* @returns {Promise<Object>} userInfo - retrieved user info from slack
*/
const getUserInfo = async (teamId, userId) => {
  let response = await slackRequestManaget(teamId, 'users.info', {user: userId})

  if (!response || !response.user || !response.user.profile) {
    throw new Error(`Could not fetch user ${userId} profile`)
  }

  let userProfile = response.user.profile
  return {
    firstName: userProfile.first_name,
    lastName: userProfile.last_name,
    fullName: userProfile.real_name,
    displayName: userProfile.display_name,
    email: userProfile.email
  }
}

/*
* Wrapper for making request to slack API
* @async
* @param {string} teamId - normalized slack teamId
* @param {string} urlExtension - the method extension url
* @param {Object} fields - web request fields
* @returns {Promise<Object>} result - result of the web request
*/
const slackRequestManaget = async (teamId, urlExtension, fields) => {
  let url = config.get('slack.baseApiUrl') + '/' + urlExtension

  // Fetch the token for teamId
  let token = config.get('slack.devBearerToken')

  let result = await requests.requestManager('POST', url, fields, token)
  if (!result.ok) {
    throw new Errors.SlackAPIError(result.error)
  }

  return result
}

module.exports = {
  getUserInfo
}
