const request = require('request')

const requestManager = (method, url, form, token, contentType = 'application/x-www-form-urlencoded') => {
  let options = {}
  options.method = method
  options.url = url
  options.form = form
  options.headers = {}

  // Forming the header
  options.headers['Content-Type'] = contentType
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`
  }

  return makeRequest(options)
}

const makeRequest = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) {
        reject(error)
      }

      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Server responded with status code: ' + response.statusCode))
      }

      resolve(JSON.parse(response.body))
    })
  })
}

module.exports = {
  requestManager,
  makeRequest
}
