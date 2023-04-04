import { Router } from 'express'
import { auth } from './verifyToken.js'
import daysNotesController from '../controllers/daysNotesController.js'

const router = Router()

router.post('/', auth, daysNotesController.create)
router.get('/', auth, daysNotesController.getAll)

export default router
