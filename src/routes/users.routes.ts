import { Router } from 'express'
import { loginValidator } from '~/middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
const userRouter = Router()

// middleware || handler

// (path, middlewares, controller) || (path, controller)
userRouter.post('/login', loginValidator, loginController)
userRouter.post('/register', registerController)

export default userRouter