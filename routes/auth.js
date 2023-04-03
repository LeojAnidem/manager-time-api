import { Router } from 'express'
import User from '../model/User.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  const { name, lastName, email, password } = req.body

  try {
    const isUniqueEmail = await User.findOne({ email })
    if (isUniqueEmail) {
      return next(res.status(400).send({
        success: false,
        message: 'There is already a user with this email!'
      }))
    }

    const user = new User({ name, lastName, password, email })
    const savedUser = await user.save()
    res.status(201).send({
      success: true,
      message: 'user created successfully!',
      dataSend: savedUser
    })
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    })
  }
})

export default router
