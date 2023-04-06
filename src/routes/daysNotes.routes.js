import { Router } from 'express'
import { auth } from '../middleware/verifyToken.js'
import daysNotesController from '../controllers/daysNotes.controller.js'

const router = Router()

router.post('/', auth, daysNotesController.create)
router.get('/', auth, daysNotesController.getAll)

export default router
