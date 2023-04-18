import DaysNotes from '../model/DaysNotes.js'
import moment from 'moment-timezone'

const configDate = {
  timeZone: 'America/New_York',
  formatFull: ['YYYY-MM-DD h:mm a', 'YYYY-MM-DD h:mm'],
  format: 'YYYY-MM-DD'
}

const convertAtDateObj = (dateString) => {
  const parseDate = moment.tz(dateString, configDate.format, configDate.timeZone).toDate()
  return {
    date: {
      year: parseDate.getFullYear(),
      month: parseDate.getMonth() + 1,
      day: parseDate.getDate(),
      monthName: months[parseDate.getMonth()],
      dayName: daysOfWeek[parseDate.getDay()],
      dateString: parseDate.toDateString()
    }
  }
}

const obtainedTimeAndPay = (date, startTime, endTime, price) => {
  const parseStart = moment.tz(`${date} ${startTime}`, configDate.formatFull, configDate.timeZone)
  const parseEnd = moment.tz(`${date} ${endTime}`, configDate.formatFull, configDate.timeZone)
  const parsePrice = price.includes('.') ? parseFloat(price) : parseInt(price)

  if (parseEnd.isBefore(parseStart) || parseEnd.isSame(parseStart)) parseEnd.add(1, 'day')

  const timeTotal = moment.duration(parseEnd.toDate().getTime() - parseStart.toDate().getTime())
  const days = timeTotal.days() !== 0 ? `${timeTotal.days()} dia ` : ''
  const hours = timeTotal.hours() !== 0 ? `${timeTotal.hours()} hora(s) ` : ''
  const minutes = timeTotal.minutes() !== 0 ? `${timeTotal.minutes()} minuto(s)` : ''
  const totalHours = `${days}${hours}${minutes}`

  const daysToHour = timeTotal.days() !== 0 ? 24 : 0
  const minutesToHour = timeTotal.minutes() > 0
    ? (timeTotal.minutes() <= 30 ? 0.5 : 1)
    : 0

  const expectedPayment = (
    daysToHour + timeTotal.hours() + minutesToHour
  ) * parsePrice

  return {
    startTime: parseStart.format('h:mm a'),
    endTime: parseEnd.format('h:mm a'),
    totalHours: {
      text: totalHours,
      time: timeTotal.asMilliseconds()
    },
    expectedPayment,
    price: parsePrice
  }
}

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

const daysOfWeek = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
]

const create = async (req, res, next) => {
  try {
    const {
      date, startTime, endTime,
      price, address, company
    } = req.body

    // Check if the params are empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Missing request params!'
      })
    }

    // check if the required params are undefined
    const missingParams = []
    const requiredKeys = {
      date, startTime, endTime, price
    }

    Object.keys(requiredKeys).forEach(key => {
      if (!requiredKeys[key]) missingParams.push(key)
    })

    if (missingParams.length > 0) {
      return res.status(400).send({
        success: false,
        message: `The following mandatory parameters are empty:\n ${missingParams.join(', ')}`,
        data: {
          missingParams
        }
      })
    }

    // create dayNote
    const dayNote = new DaysNotes({
      ...convertAtDateObj(date),
      author: req.user.id,
      address: address ?? '',
      company: company ?? '',
      ...obtainedTimeAndPay(date, startTime, endTime, price)
    })

    await dayNote.save()

    res.status(200).send({
      success: true,
      message: 'DayNote create successfully',
      data: {
        dayNote
      }
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const get = async (req, res, next) => {
  try {
    const daysNotes = await DaysNotes.find({ author: req.user.id }).select('-createdAt -updatedAt -author')
    if (daysNotes.length > 0) {
      return res.status(404).send({
        success: false,
        message: 'No days Notes Found!'
      })
    }

    // Sort the notes obtained from the earliest date to the latest.
    const sortDate = daysNotes
      .sort((a, b) => a.date.day - b.date.day)
      .sort((a, b) => a.date.month - b.date.month)
      .sort((a, b) => a.date.year - b.date.year)

    res.status(200).send({
      success: true,
      message: '',
      data: {
        sortDate
      }
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const modify = async (req, res) => {
  try {
    const { dayNoteId } = req.params
    if (!dayNoteId) {
      return res.status(400).send({
        success: false,
        message: 'dayNoteId not provided!'
      })
    }

    // Check if the params are empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Missing request params!'
      })
    }

    const dayNote = await DaysNotes.findOne({ author: req.user.id, _id: dayNoteId })
    if (!dayNote) {
      return res.status(400).send({
        success: false,
        message: 'Day note doesnt exist for this user'
      })
    }

    const {
      date, startTime, endTime,
      price, address, company
    } = req.body

    let objUpdate = {}

    if (date) {
      objUpdate = {
        ...objUpdate,
        ...convertAtDateObj(date)
      }
    }

    if (startTime || endTime || price) {
      const nDate = date ?? dayNote.date.dateString
      const nStart = startTime ?? dayNote.startTime
      const nEnd = endTime ?? dayNote.endTime
      const nPrice = price ?? dayNote.price.toString()

      objUpdate = {
        ...objUpdate,
        ...obtainedTimeAndPay(nDate, nStart, nEnd, nPrice)
      }
    }

    if (address) objUpdate = { ...objUpdate, address }
    if (company) objUpdate = { ...objUpdate, company }

    const updateDate = await DaysNotes.findOneAndUpdate({ author: req.user.id, _id: dayNoteId }, objUpdate, { new: true })

    res.status(200).send({
      success: true,
      message: 'DayNote updated successfully!',
      data: {
        dayNote: updateDate
      }
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const remove = async (req, res) => {

}

const getDaysOnRange = async (req, res) => {

}

const getAll = (req, res) => {
  return res.status(200).send('Valid!')
}

export default { create, get, modify, remove, getDaysOnRange, getAll }
