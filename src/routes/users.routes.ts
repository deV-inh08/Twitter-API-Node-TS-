import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { loginController, registerController, logOutController, emailVerifyValidator } from '~/controllers/users.controllers'
import { registerValidator, loginValidator, accessTokenValidator, refreshTokenValidator, emailTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

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


userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logOutController))


// Verify email
// path: /verify-email
// POST
// Body: {verify_email_token: string }

userRouter.post('/verify-email', emailTokenValidator, wrapRequestHandler(emailVerifyValidator))

export default userRouter