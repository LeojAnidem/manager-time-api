import User from '../model/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const register = async (req, res) => {
  const { name, lastName, email, password } = req.body

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

  // hash password
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt)

  // create new user
  const user = new User({ name, lastName, password: hashPassword, email })

  try {
    const savedUser = await user.save()
    res.status(201).send({
      success: true,
      message: 'user created successfully!',
      user: savedUser._id
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

  // checking if the email exist and password is correct
  const user = await User.findOne({ email })
  const validPass = await bcrypt.compare(password, user.password)

  if (!validPass && !user) {
    return res.status(400).send({
      success: false,
      message: 'Invalid email or password'
    })
  }

  const userForToken = {
    id: user._id,
    username: `${user.name} ${user.lastName}`
  }

  const token = jwt.sign(userForToken, process.env.SECRET_KEY)

  res
    .status(200)
    .header('auth-token', token)
    .send({
      success: true,
      message: 'Logged in!',
      data: {
        username: `${user.name} ${user.lastName}`,
        token
      }
    })
}

export default { register, login }
