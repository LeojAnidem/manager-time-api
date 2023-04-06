import { Schema, model } from 'mongoose'

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

export default model('User', userSchema)
