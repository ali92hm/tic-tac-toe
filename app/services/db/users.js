const Users = require('../../models/users')

const getAll = () => {
  return Users.find().exec()
}

const getById = (_id) => {
  return Users.findById(_id).exec()
}

const getByUniqueId = (uniqueId) => {
  return Users.findOne({uniqueId: uniqueId}).exec()
}

// TODO: Implement update User
const update = (_id, fields) => {
  throw new Error('Not implemented')
}

const create = (uniqueId, externalId, outlet, email, firstName, lastName) => {
  return Users.create({
    uniqueId: uniqueId,
    externalId: externalId,
    outlet: outlet,
    email: email,
    firstName: firstName,
    lastName: lastName,
    created: Date.now()
  })
}

module.exports = {
  getAll,
  getById,
  getByUniqueId,
  update,
  create
}
