const Users = require('./models/users')

const getAll = () => {
  return Users.find().exec()
}

const getById = (_id) => {
  return Users.findById(_id).exec()
}

const getByUniqueId = (uniqueId) => {
  return Users.findOne({uniqueId: uniqueId}).exec()
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

// TODO: Implement update User
const update = (_id, fields) => {
  throw new Error('Not implemented')
}

const remove = async (_id) => {
  return Users.remove({ _id: _id }).exec()
}

module.exports = {
  getAll,
  getById,
  getByUniqueId,
  create,
  update,
  remove
}
