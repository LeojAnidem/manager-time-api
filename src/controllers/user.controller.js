import Role from '../model/Role.js'
import User from '../model/User.js'

const get = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.status(200).send({
      success: true,
      message: 'Success!, info obtained!',
      data: { user }
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const modify = async (req, res, next) => {
  try {
    // Check if the params are empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Missing request params!'
      })
    }

    const { name, lastname } = req.body
    const newUserData = { name, lastname }

    const updateUser = await User.findByIdAndUpdate(
      req.user.id, newUserData, { new: true }
    )

    if (!updateUser) {
      return res.status(304).send({
        success: false,
        message: 'Failed to update User'
      })
    }

    res.status(200).send({
      success: true,
      message: 'Successfully Update!',
      data: { updateUser }
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: `Error: ${err}`
    })
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body
    const user = await User.findById(req.user.id).select('+password')

    // Check if the params are empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Missing request params!'
      })
    }

    const isCorrectPassword = await User.comparePassword(password, user.password)
    if (!isCorrectPassword) {
      return res.status(401).send({
        success: false,
        message: 'The password you entered is incorrect!'
      })
    }

    // checking if the password is valid
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    const isValidPassword = newPassword.match(passwordRegex)
    if (!isValidPassword) {
      return res.status(400).send({
        success: false,
        message: 'The password must be content: Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
      })
    }

    // Update the user's password
    user.password = await User.encryptPassword(newPassword)
    await user.save()

    res.status(200).send({
      success: true,
      message: 'Change Password Successfully!'
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const getAll = async (req, res, next) => {
  try {
    const users = await User.find()
    const userReq = await User.findById(req.user.id)
    const adminRole = await Role.findOne({ name: 'admin' })
    const moderatorRole = await Role.findOne({ name: 'moderator' })

    if (!userReq.roles.includes(adminRole.id)) {
      const filterUsers = users
        .filter(({ roles }) =>
          !roles.includes(adminRole.id && moderatorRole.id)
        )

      return res.status(200).send({
        success: true,
        message: 'Succesfully Request!',
        data: {
          users: filterUsers
        }
      })
    }

    res.status(200).send({
      success: true,
      message: 'Succesfully Request!',
      data: { users }
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const modifyRoles = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { roles } = req.body
    const user = await User.findById(userId)

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: 'UserId Not provided!'
      })
    }

    // Check if the params are empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Missing request params!'
      })
    }

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found!'
      })
    }

    const rolesObject = await Role.find({ name: { $in: roles } })
    const rolesId = rolesObject.map(roles => roles._id.toString())

    const isAlreadyUserRole = rolesId.some(id => user.roles.includes(id))

    if (isAlreadyUserRole) {
      return res.status(422).send({
        success: false,
        message: 'This role has already been assigned!'
      })
    }

    user.roles.push(...rolesId)
    await user.save()

    res.status(200).send({
      success: true,
      message: 'Role added to user successfully!'
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const removeRoles = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { roles } = req.body
    const user = await User.findById(userId)

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: 'UserId Not provided!'
      })
    }

    // Check if the params are empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Missing request params!'
      })
    }

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found!'
      })
    }

    const rolesObject = await Role.find({ name: { $in: roles } })
    const rolesId = rolesObject.map(roles => roles._id)
    const isRoleExist = rolesId.some(id => user.roles.includes(id))

    if (!isRoleExist) {
      return res.status(422).send({
        success: false,
        message: 'The user does not contain the role you want to delete'
      })
    }

    rolesId.forEach(id => user.roles.pull(id))
    await user.save()

    res.status(200).send({
      success: true,
      message: 'Role removed from user successfully'
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

const remove = async (req, res, next) => {
  try {
    const { userId } = req.params
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: 'UserId Not provided!'
      })
    }

    const user = await User.findByIdAndRemove(userId)
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found!'
      })
    }

    res.status(200).send({
      success: true,
      message: 'User successfully deleted'
    })
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}

export default { get, modify, changePassword, getAll, modifyRoles, removeRoles, remove }
