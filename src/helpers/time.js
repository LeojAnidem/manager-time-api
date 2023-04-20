import moment from 'moment-timezone'

const timeConfig = {
  timezone: 'America/New_York',
  formatFull: ['dddd, MMMM D, YYYY h:mm a', 'YYYY-MM-DD h:mm a', 'YYYY-MM-DD h:mm'],
  format: 'YYYY-MM-DD',
  months: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo',
    'Junio', 'Julio', 'Agosto', 'Septiembre',
    'Octubre', 'Noviembre', 'Diciembre'
  ],
  daysOfWeek: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ]
}
const stringToDate = (string, isFormatFull = false) => {
  const format = isFormatFull ? timeConfig.formatFull : timeConfig.format
  return moment.tz(string, format, timeConfig.timeZone)
}

const stringToNumber = (string) => string.includes('.') ? parseFloat(string) : parseInt(string)

const milisecondsToString = (miliseconds) => {
  const milisecondsTime = moment.duration(miliseconds)
  const days = milisecondsTime.days() !== 0 ? `${milisecondsTime.days()} dia ` : ''
  const hours = milisecondsTime.hours() !== 0 ? `${milisecondsTime.hours()} hora(s) ` : ''
  const minutes = milisecondsTime.minutes() !== 0 ? `${milisecondsTime.minutes()} minuto(s)` : ''

  return `${days}${hours}${minutes}`.trim()
}

const toTotalHoursSchema = (diffTimeMiliseconds) => {
  const milisecondsTime = moment.duration(diffTimeMiliseconds)

  return {
    totalHours: {
      text: milisecondsToString(diffTimeMiliseconds),
      time: milisecondsTime.asMilliseconds()
    },
    timeObj: milisecondsTime
  }
}

const toDateSchema = (string) => {
  const date = stringToDate(string)

  return {
    date: {
      year: date.year(),
      month: date.month() + 1,
      day: date.date(),
      monthName: timeConfig.months[date.month()],
      dayName: timeConfig.daysOfWeek[date.day()],
      dateString: date.format('dddd, MMMM D, YYYY'),
      dateObj: date
    }
  }
}

const toStartAndEndTime = (stringDate, stringStart, stringEnd) => {
  const dateStart = stringToDate(`${stringDate} ${stringStart}`, true)
  const dateEnd = stringToDate(`${stringDate} ${stringEnd}`, true)

  if (dateEnd.isBefore(dateStart) || dateEnd.isSame(dateStart)) {
    dateEnd.add(1, 'day')
  }

  return {
    rangeTime: {
      startTime: dateStart.format('h:mm a'),
      endTime: dateEnd.format('h:mm a')
    },
    diff: dateEnd.diff(dateStart)
  }
}

export default { stringToDate, stringToNumber, milisecondsToString, toTotalHoursSchema, toDateSchema, toStartAndEndTime }
