import { Schema, model } from 'mongoose'

const dateSchema = new Schema({
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  monthName: {
    type: String,
    required: true
  },
  dayName: {
    type: String,
    required: true
  },
  dateString: {
    type: String,
    required: true
  },
  _id: false
})

const totalHours = new Schema({
  text: {
    type: String,
    require: true
  },
  time: {
    type: Number,
    required: true
  },
  _id: false
})

const daysNotesSchema = new Schema(
  {
    date: {
      type: dateSchema,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    address: {
      type: String
    },
    company: {
      type: String
    },
    author: {
      ref: 'User',
      type: Schema.Types.ObjectId
    },
    totalHours: {
      type: totalHours,
      required: true
    },
    expectedPayment: {
      type: Number,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model('Days_Notes', daysNotesSchema)
