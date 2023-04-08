import Role from '../model/Role.js'

// Hacer que solo los admins puedan asignar roles

export const checkRolesExisted = async (req, res, next) => {
  try {
    const { roles } = req.body

    if (roles) {
      const verifiedRoles = await Role.find()
      const nameOfRoles = verifiedRoles.map(({ name }) => name)
      const errMessages = []

      roles.forEach(role => {
        if (!nameOfRoles.includes(role)) {
          errMessages.push(`The role: '${role}' does not exist!`)
        }
      })

      if (errMessages.length > 0) {
        return res.status(404).send({
          success: false,
          message: errMessages
        })
      }
    }

    next()
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err
    })
  }
}
