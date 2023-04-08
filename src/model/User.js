import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      min: 6,
      max: 255
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a lastName'],
      min: 6,
      max: 255
    },
    email: {
      type: String,
      required: [true, 'Please provide a email'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      min: 8,
      max: 1024
    },
    roles: [{
      ref: 'Role',
      type: Schema.Types.ObjectId
    }]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

userSchema.statics.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

userSchema.statics.comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword)
}

userSchema.statics.generateToken = async (user) => {
  // payload for token (req.user in middleware verifyToken)
  const userForToken = {
    id: user._id,
    username: `${user.name} ${user.lastName}`
  }

  return await jwt.sign(userForToken, process.env.SECRET_KEY, {
    expiresIn: 86400
  })
}

export default model('User', userSchema)
