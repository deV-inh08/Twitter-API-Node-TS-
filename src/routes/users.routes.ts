import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { registerValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

// middleware || handler

// (path, middlewares, controller) || (path, controller)
userRouter.post('/login', loginValidator, loginController)


// Register a new user
// POST
// Body { name: string, email: string, password: string, confirm_password: string, date_of_birth: Date().ISO8601string }
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))


export default userRouter