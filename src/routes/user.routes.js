import { Router } from 'express'
import userController from '../controllers/user.controller.js'
import { verifySignUp, authJwt } from '../middleware/index.js'

const router = Router()

router.get('/', authJwt.verifyToken, userController.get)
router.put('/', authJwt.verifyToken, userController.modify)

router.get('/all', [
  authJwt.verifyToken,
  authJwt.isModerator
], userController.getAll)

router.put('/:userID/roles', [
  authJwt.verifyToken,
  authJwt.isAdmin,
  verifySignUp.checkRolesExisted
], userController.modifyRoles)

router.delete('/:userID', [
  authJwt.verifyToken,
  authJwt.isAdmin
], userController.remove)

export default router
