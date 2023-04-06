import Role from '../model/Role.js'
import User from '../model/User.js'

const isValidEmail = (email, res) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return email.match(emailRegex)
}

const register = async (req, res) => {
  const { name, lastName, email, password, roles } = req.body

  // checking if the valid email
  if (!isValidEmail(email)) {
    return res.status(400).send({
      success: false,
      message: 'The email is not valid!'
    })
  }

  // checking if the user is already in the database
  const isExistEmail = await User.findOne({ email })
  if (isExistEmail) {
    return res.status(400).send({
      success: false,
      message: 'There is already a user with this email!'
    })
  }

  // checking if the password is valid
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const isValidPassword = password.match(passwordRegex)
  if (!isValidPassword) {
    return res.status(400).send({
      success: false,
      message: 'The password must be content: Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
    })
  }

  // create new user
  const user = new User({
    name,
    lastName,
    password: await User.encryptPassword(password),
    email
  })

  // checking if send roles
  if (roles) {
    const foundRoles = await Role.find({ name: { $in: roles } })
    user.roles = foundRoles.map(role => role._id)
  } else {
    const role = await Role.find({ name: 'user' })
    user.roles = [role[0]._id]
  }

  const token = await User.generateToken(user)

  try {
    const savedUser = await user.save()
    res.status(201).send({
      success: true,
      message: 'user created successfully!',
      data: {
        user: savedUser._id,
        token
      }
    })
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  // checking if the email is valid
  if (!isValidEmail(email)) {
    return res.status(400).send({
      success: false,
      message: 'The email is not valid!'
    })
  }

  // checking if the email exist and password is correct
  const user = await User.findOne({ email }).populate('roles')
  const validPass = user ? await User.comparePassword(password, user.password) : false

  if (!validPass && !user) {
    return res.status(400).send({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const token = await User.generateToken(user)

  res
    .status(200)
    .send({
      success: true,
      message: 'Logged in!',
      data: {
        user,
        token
      }
    })
}

export default { register, login }
