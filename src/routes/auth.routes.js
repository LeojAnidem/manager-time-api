import { Router } from 'express'
import { authJwt } from '../middleware/index.js'
import authController from '../controllers/auth.controller.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh-token', authJwt.verifyRefreshToken, authController.refreshToken)

export default router
