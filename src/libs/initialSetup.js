import Role from '../model/Role.js'

export const createRoles = async () => {
  try {
    const countRole = await Role.estimatedDocumentCount()
    if (countRole > 0) return

    const values = await Promise.all([
      new Role({ name: 'user' }).save(),
      new Role({ name: 'moderator' }).save(),
      new Role({ name: 'admin' }).save()
    ])
    console.log(values)
  } catch (err) {
    console.error(err)
  }
}
