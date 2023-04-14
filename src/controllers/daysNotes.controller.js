import DaysNotes from '../model/DaysNotes.js'
import moment from 'moment-timezone'

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

    // Parse date
    const configDate = {
      timeZone: 'America/New_York',
      formatFull: ['YYYY-MM-DD h:mm a', 'YYYY-MM-DD h:mm'],
      format: 'YYYY-MM-DD'
    }
    const parseDate = moment.tz(date, configDate.format, configDate.timeZone).toDate()
    const parseStart = moment.tz(`${date} ${startTime}`, configDate.formatFull, configDate.timeZone)
    const parseEnd = moment.tz(`${date} ${endTime}`, configDate.formatFull, configDate.timeZone)
    const parsePrice = price.includes('.') ? parseFloat(price) : parseInt(price)

    // Calculate de total hours
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

    // create dayNote
    const dayNote = new DaysNotes({
      date: {
        year: parseDate.getFullYear(),
        month: parseDate.getMonth() + 1,
        day: parseDate.getDate(),
        monthName: months[parseDate.getMonth()],
        dayName: daysOfWeek[parseDate.getDay()]
      },
      startTime: parseStart.format('h:mm a'),
      endTime: parseEnd.format('h:mm a'),
      price: parsePrice,
      author: req.user.id,
      address: address ?? '',
      company: company ?? '',
      totalHours: {
        text: totalHours,
        time: timeTotal
      },
      expectedPayment
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

const get = async (req, res) => {

}

const modify = async (req, res) => {

}

const remove = async (req, res) => {

}

const getDaysOnRange = async (req, res) => {

}

const getAll = (req, res) => {
  return res.status(200).send('Valid!')
}

export default { create, get, modify, remove, getDaysOnRange, getAll }
