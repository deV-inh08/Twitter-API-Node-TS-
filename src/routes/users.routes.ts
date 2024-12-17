import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { loginController, registerController, logOutController, verifyEmailController, resendVerifyEmailController, forgotPasswordController, verifyForgotPasswordController, resetPasswordController, getMeController, updateMeController, followController, unfollowController } from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { registerValidator, loginValidator, accessTokenValidator, refreshTokenValidator, emailTokenValidator, forgotPasswordValidator, verifyForgotPasswordValidator, resetPasswordValidator, updateMeValidator, verifiedUserValidator, followValidator, unFollowValidator } from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/user.request'
import { wrapRequestHandler } from '~/utils/handlers'

const userRouter = Router()

// middleware || handler
// (path, middlewares, controller) || (path, controller)


// Login a new user
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


// Update my profile
// path: /me
// PATCH
// Body: { forgot_password_token : string, password: string, confirm_password: string }
userRouter.patch('/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    "name",
    "date_of_birth",
    "bio",
    "location",
    "website",
    "username",
    "avatar",
    "cover_photo"
  ]),
  wrapRequestHandler(updateMeController)
)



// Change Password
// path: /change-password
// PUT
// Body: { forgot_password_token : string, password: string, confirm_password: string }




// Follow user
// path: /follow
// POST
// Header: { Authorization: Bearer <access_token> }
// Body: { follow_user_id: string }
userRouter.post("/follow", accessTokenValidator, updateMeValidator, followValidator, wrapRequestHandler(followController))


// unFollow user
// path: /follow/:user_id
// DELETE
// Header: { Authorization: Bearer <access_token> }
// Body: { follow_user_id: string }
userRouter.delete("/follow/:user_id", accessTokenValidator, updateMeValidator, unFollowValidator, wrapRequestHandler(unfollowController))

export default userRouter