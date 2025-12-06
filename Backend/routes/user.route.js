import * as userController from '../controllers/user.controller.js'
import { Router } from 'express'
import { body } from 'express-validator'
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = Router()

router.post("/register",
    body('email').isEmail().withMessage("Please Check The Email Properly"),
    body('password').isLength({ min: 3 }).withMessage("Password must be of 3 Characters")
    , userController.createUserController)

router.post("/login",
    body('email').isEmail().withMessage("Please Check The Email Properly"),
    body('password').isLength({ min: 3 }).withMessage("Password must be of 3 Characters"),
    userController.loginController)

router.get("/profile", authMiddleware.authUser, userController.profileController)

router.get('/logout' , authMiddleware.authUser , userController.logoutController)

router.get('/all' , authMiddleware.authUser , userController.getAllUserController)


export default router