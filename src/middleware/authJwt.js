import User from '../model/User.js'
import Role from '../model/Role.js'
import jwt from 'jsonwebtoken'

export const verifyToken = async (req, res, next) => {
  const token = req.header('auth-token')
  if (!token) {
    return res.status(401).send({
      success: false,
      message: 'Access Denied!, No Token Provided!'
    })
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY)
    const user = await User.findById(verified.id)

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'Access Denied!, User not found!'
      })
    }

    req.user = verified
    next()
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: 'Access Denied!, you dont have permission!'
    })
  }
}

export const isModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const roles = await Role.find({ _id: { $in: user.roles } })
    const isModerator = roles.filter(({ name }) => name === 'moderator' || name === 'admin')

    if (isModerator.length === 0) {
      return res.status(401).send({
        success: false,
        message: 'Access Denied: You need moderator role for access here!'
      })
    }

    next()
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const roles = await Role.find({ _id: { $in: user.roles } })
    const isAdmin = roles.filter(({ name }) => name === 'admin')

    if (isAdmin.length === 0) {
      return res.status(401).send({
        success: false,
        message: 'Access Denied: You need admin role for access here!'
      })
    }

    next()
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}
