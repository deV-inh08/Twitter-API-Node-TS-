import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { registerValidator, loginValidator, accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
accessTokenValidator

const userRouter = Router()

// middleware || handler
// (path, middlewares, controller) || (path, controller)


// Register a new user
// POST
// Body { email: string, password: string }
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// Register a new user
// POST
// Body { name: string, email: string, password: string, confirm_password: string, date_of_birth: Date().ISO8601string }
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

// Logout a new user
// path: /logout
// POST
// Header: { Authorization: Bearer <access token> }
// Body { refresh_token }


userRouter.post('/logout', accessTokenValidator, wrapRequestHandler((req: Request, res: Response) => {
  res.json({
    message:"Logout successfully"
  })
}))

export default userRouter