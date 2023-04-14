import { Router } from 'express'
import { authJwt } from '../middleware/index.js'
import daysNotesController from '../controllers/daysNotes.controller.js'

const router = Router()

router.get('/', authJwt.verifyToken, daysNotesController.get)
router.post('/', authJwt.verifyToken, daysNotesController.create)
router.put('/:dayNoteId', authJwt.verifyToken, daysNotesController.modify)
router.delete('/:dayNoteId', authJwt.verifyToken, daysNotesController.remove)

// 'el formato debe ser YYYY-MM-DD'
router.get('/:startDate/:endDate', authJwt.verifyToken, daysNotesController.getDaysOnRange)

// Moderator rules
router.get('/all', [
  authJwt.verifyToken,
  authJwt.isModerator
], daysNotesController.getAll)

export default router
