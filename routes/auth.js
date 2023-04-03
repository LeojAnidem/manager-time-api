import { Router } from 'express'
const router = Router()

router.post('/register', (req, res) => {
  res.send('register')
})

export default Router
