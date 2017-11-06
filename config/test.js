module.exports = {
  db: {
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://db/test'
    }
  }
}
