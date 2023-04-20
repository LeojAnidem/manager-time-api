import DaysNotes from '../model/DaysNotes.js'
import Role from '../model/Role.js'
import User from '../model/User.js'
import time from '../helpers/time.js'

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

    const { rangeTime, diff } = time.toStartAndEndTime(date, startTime, endTime)
    const { totalHours, timeObj } = time.toTotalHoursSchema(diff)
    const convertPrice = time.stringToNumber(price)

    // create dayNote
    const dayNote = new DaysNotes({
      ...time.toDateSchema(date),
      ...rangeTime,
      author: req.user.id,
      address: address ?? '',
      company: company ?? '',
      totalHours,
      price: convertPrice,
      expectedPayment: timeObj.asHours() * convertPrice
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
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const get = async (req, res, next) => {
  try {
    const daysNotes = await DaysNotes.find({ author: req.user.id }).select('-createdAt -updatedAt -author')

    if (daysNotes.length === 0) {
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
      message: 'Days notes get successfully!',
      data: {
        daysNotes: sortDate
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const modify = async (req, res) => {
  try {
    const { dayNoteId } = req.params

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

    if (!date && !startTime && !endTime && !price && !address && !company) {
      return res.status(400).send({
        success: false,
        message: 'Wrong parameters, modify unsuccessfully!'
      })
    }

    let objUpdate = {}

    if (date) {
      objUpdate = {
        ...objUpdate,
        ...time.toDateSchema(date)
      }
    }

    if (startTime || endTime || price) {
      const nDate = date ?? dayNote.date.dateString
      const nStart = startTime ?? dayNote.startTime
      const nEnd = endTime ?? dayNote.endTime
      const nPrice = price ?? dayNote.price.toString()

      const { rangeTime, diff } = time.toStartAndEndTime(nDate, nStart, nEnd)
      const { totalHours, timeObj } = time.toTotalHoursSchema(diff)
      const convertPrice = time.stringToNumber(nPrice)

      objUpdate = {
        ...objUpdate,
        ...rangeTime,
        totalHours,
        price: convertPrice,
        expectedPayment: timeObj.asHours() * convertPrice
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
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const remove = async (req, res) => {
  try {
    const { dayNoteId } = req.params

    const dayNote = await DaysNotes.findOneAndDelete({ author: req.user.id, _id: dayNoteId })
    if (!dayNote) {
      return res.status(404).send({
        success: false,
        message: 'Day Note not found!'
      })
    }

    res.status(200).send({
      success: true,
      message: 'Day Note deleted succesfully!'
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

// Agregar un parametro a la devolucion 'fromTo: 'Del 1 al 15 de Abril''
const getDaysOnRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params
    const pStartDate = time.stringToDate(startDate)
    const pEndDate = time.stringToDate(endDate).endOf('day')

    const daysNotes = await DaysNotes.find({
      'date.dateObj': {
        $gte: pStartDate,
        $lt: pEndDate
      }
    }).select('-createdAt -updatedAt')

    if (daysNotes.length === 0) {
      return res.status(404).send({
        success: false,
        message: 'Not days notes found!'
      })
    }

    const sortDays = daysNotes
      .sort((a, b) => a.date.day - b.date.day)
      .sort((a, b) => a.date.month - b.date.month)
      .sort((a, b) => a.date.year - b.date.year)

    const totalPayment = daysNotes.reduce((acc, { expectedPayment }) => acc + expectedPayment, 0)
    const totalMiliseconds = daysNotes.reduce((acc, { totalHours }) => acc + totalHours.time, 0)
    const totalHours = time.milisecondsToString(totalMiliseconds)

    res.status(200).send({
      success: true,
      message: 'Days within the established date range successfully obtained.',
      data: {
        daysNotes: sortDays,
        totalHours,
        totalPayment
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const getAll = async (req, res) => {
  try {
    const { roles } = await User.findOne({ _id: req.user.id }).select('roles -_id')
    const adminRoleId = await Role.findOne({ name: 'admin' }).select('_id')
    const moderatorRoleId = await Role.findOne({ name: 'moderator' }).select('_id')
    const rolesIdExclude = roles.includes(adminRoleId._id) ? [] : [adminRoleId._id, moderatorRoleId._id]

    const exludeObjIdS = await User.find({ roles: { $in: rolesIdExclude } }).select('_id')
    const usersIdsExclude = exludeObjIdS.map(({ _id }) => _id)
    const daysNotes = await DaysNotes.find({ author: { $not: { $in: usersIdsExclude } } })

    if (!daysNotes) {
      return res.status(404).send({
        success: false,
        message: 'Not Days Notes Found!'
      })
    }

    const sortDays = daysNotes
      .sort((a, b) => a.date.day - b.date.day)
      .sort((a, b) => a.date.month - b.date.month)
      .sort((a, b) => a.date.year - b.date.year)

    res.status(200).send({
      success: true,
      message: 'Days Notes get successfully!',
      data: {
        daysNotes: sortDays
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

export default { create, get, modify, remove, getDaysOnRange, getAll }
