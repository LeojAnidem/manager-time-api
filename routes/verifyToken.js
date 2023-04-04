import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
  const token = req.header('auth-token')
  if (!token) {
    return res.status(401).send({
      success: false,
      message: 'Access Denied!, you dont have permission!'
    })
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY)
    req.user = verified
    next()
  } catch (err) {
    res.status(400).send({
      success: false,
      message: 'Invalid Token!'
    })
  }
}
