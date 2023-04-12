import { Router } from 'express'
import userController from '../controllers/user.controller.js'
import { verifySignUp, authJwt } from '../middleware/index.js'

const router = Router()

router.get('/', authJwt.verifyToken, userController.get)
router.put('/', authJwt.verifyToken, userController.modify)
router.put('/change-password', authJwt.verifyToken, userController.changePassword)

router.post('/send-verification-code', userController.sendVerificationCode)
router.post('/reset-password', userController.resetPassword)

router.get('/all', [
  authJwt.verifyToken,
  authJwt.isModerator
], userController.getAll)

router.put('/roles/:userId', [
  authJwt.verifyToken,
  authJwt.isAdmin,
  verifySignUp.checkRolesExisted
], userController.modifyRoles)

router.delete('/roles/:userId', [
  authJwt.verifyToken,
  authJwt.isAdmin,
  verifySignUp.checkRolesExisted
], userController.removeRoles)

router.delete('/:userId', [
  authJwt.verifyToken,
  authJwt.isAdmin
], userController.remove)

export default router
