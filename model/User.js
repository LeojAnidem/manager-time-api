import mongoose from 'mongoose'

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const userSchema = new mongoose.Schema(
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
      unique: true,
      match: [
        emailRegex,
        'Invalid Email!'
      ]
    },
    password: {
      select: false,
      type: String,
      required: [true, 'Please add a password'],
      match: [
        passwordRegex,
        'Must be content: Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
      ],
      min: 8,
      max: 1024
    },
    role: {
      type: String,
      default: 'user'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model('User', userSchema)
