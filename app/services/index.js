const MongoAdapter = require('./mongo-adapter').MongoAdapter

const mongoDB = new MongoAdapter()

module.exports = {
  db: mongoDB
}
