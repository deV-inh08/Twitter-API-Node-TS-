import { Router } from 'express'
import { loginValidator } from '~/middlewares/users.middlewares'
import usersController from '~/controllers/users.controllers'
const userRouter = Router()

// middleware || handler

// (path, middlewares, controller)
userRouter.post('/login', loginValidator, usersController)

export default userRouter