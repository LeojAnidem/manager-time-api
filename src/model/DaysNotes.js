import { Schema, model } from 'mongoose'

const daysNotesSchema = new Schema(
  {

  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model('Days_Notes', daysNotesSchema)
