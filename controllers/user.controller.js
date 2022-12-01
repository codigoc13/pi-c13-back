const { DateTime } = require('luxon')
const { request, response } = require('express')
const bcryptjs = require('bcryptjs')

const { serverErrorHandler } = require('../helpers')
const { User } = require('../models')

const create = async (req = request, res = response) => {
  try {
    const { firstName, lastName, password, ...rest } = req.body

    const data = {
      ...rest,
      createdAt: DateTime.now(),
      lastName: lastName.toLowerCase(),
      firstName: firstName.toLowerCase(),
      password: bcryptjs.hashSync(password, bcryptjs.genSaltSync()),
    }

    const user = new User(data)
    await user.save()

    res.status(201).json({
      user,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

const findAll = async (req = request, res = response) => {
  try {
    let { from = 0, lot = 5 } = req.query
    from = from <= 0 || isNaN(from) ? 0 : from - 1
    lot = lot <= 0 || isNaN(lot) ? 10 : lot

    const query = { status: true }

    const [users, total] = await Promise.all([
      User.find(query).skip(from).limit(lot),
      User.countDocuments(query),
    ])

    res.json({
      total,
      quantity: users.length,
      pagination: {
        from: Number(from + 1),
        lot: Number(lot),
      },
      users,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

const update = async (req = request, res = response) => {
  try {
    const { id } = req.params
    const {
      address,
      email,
      firstName,
      lastName,
      numberDocument,
      password,
      phoneNumbers,
      role,
      typeDocument,
      username,
    } = req.body

    const data = {}
    if (address) data.address = address
    if (firstName) data.email = email
    if (firstName) data.firstName = firstName.toLowerCase()
    if (firstName) data.phoneNumbers = phoneNumbers
    if (lastName) data.lastName = lastName.toLowerCase()
    if (numberDocument) data.numberDocument = numberDocument
    if (password)
      data.password = bcryptjs.hashSync(password, bcryptjs.genSaltSync())
    if (role) data.role = role
    if (typeDocument) data.typeDocument = typeDocument
    if (username) data.username = username

    const user = await User.findByIdAndUpdate(id, data, { new: true })

    res.status(200).json({
      user,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

const deleteUser = async (req = request, res = response) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: false,
        updatedAt: DateTime.now(),
      },
      { new: true }
    )
    res.json({
      deletedUser,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

const findById = async (req = request, res = response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      res.status(400).json({
        msg: `Usuario con id '${id}' no existe en la base de datos`,
      })
    }
    res.json({
      user,
    })
  } catch (error) {}
}

const search = async (req = request, res = response) => {
  try {
    const { term } = req.params
    const regex = new RegExp(term, 'i')

    const users = await User.find({
      $or: [{ firstName: regex }, { lastName: regex }, { username: regex }],
      $and: [{ status: true }],
    })
    res.status(200).json({
      queriedFields: ['firstName', 'lastName', 'username'],
      quantity: users.length,
      results: users,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

module.exports = {
  create,
  deleteUser,
  findAll,
  findById,
  search,
  update,
}
