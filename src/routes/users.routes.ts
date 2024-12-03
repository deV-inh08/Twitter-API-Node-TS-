import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { loginController, registerController, logOutController, verifyEmailController, resendVerifyEmailController, forgotPasswordController, verifyForgotPasswordController, resetPasswordController, getMeController } from '~/controllers/users.controllers'
import { registerValidator, loginValidator, accessTokenValidator, refreshTokenValidator, emailTokenValidator, forgotPasswordValidator, verifyForgotPasswordValidator, resetPasswordValidator } from '~/middlewares/users.middlewares'
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
userRouter.post('/verify-email', emailTokenValidator, wrapRequestHandler(verifyEmailController))


// Resend Verify email
// path: /resend-verify-email
// POST
// Header: { Authorization: Bearer <access_token> }
// Body: { }
userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

// Forgot password
// path: /forgot-password
// POST
// Body: { email: string }
userRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

// Verify forgot password
// path: /verify-forgot-password
// POST
// Body: { forgot_password_token : string }
userRouter.post('/verify-forgot-password', verifyForgotPasswordValidator, wrapRequestHandler(verifyForgotPasswordController))


// Reset password
// path: /reset-password
// POST
// Body: { forgot_password_token : string, password: string, confirm_password: string }
userRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))


// Get my profile
// path: /me
// GET
// Body: { forgot_password_token : string, password: string, confirm_password: string }
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

export default userRouter