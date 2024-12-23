import { Request, Response } from "express"
import usersService from "~/services/users.services";
import { NextFunction, ParamsDictionary } from "express-serve-static-core"
import { ChangePasswordReqBody, FollowRedBody, ForgotPasswordReqBody, LoginReqBody, LogoutRequestBody, RefreshTokenRequestBody, RegisterReqBody, TokenPayload, UnFollowRedParams, UpdateMeReqBody, VerifyEmailReqBody } from "~/models/requests/user.request";
import { ObjectId } from "mongodb";
import { User } from "~/models/schema/User.schema";
import USERS_MESSAGE from "~/constants/messages";
import databaseServices from "~/services/database.services";
import HTTP_STATUS from "~/constants/httpStatus";
import { UserVerifyStatus } from "~/constants/enum";
import { ResetPasswordReqBody } from "~/models/schema/RefreshToken.schema";
import { pick } from "lodash";

const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: UserVerifyStatus.Verified })
  return res.json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    result: result
  })
};

const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  try {
    // userServices --> Database
    const result = await usersService.register(req.body);
    res.json({
      message: USERS_MESSAGE.REGISTER_SUCCESS,
      data: result
    })
  } catch (err: any) {
    res.status(400).json({
      error: err.message
    })
  }
};

const logOutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body;
  const result = await usersService.logout(refresh_token)
  return res.json({
    message: USERS_MESSAGE.LOGOUT_SUCCESS,
    result: result
  })
};

const refreshTokenController = async (req: Request<ParamsDictionary, any, RefreshTokenRequestBody>, res: Response) => {
  const { refresh_token } = req.body;
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, verify, refresh_token })
  return res.json({
    message: USERS_MESSAGE.REFRESH_TOKEN_SUCCESS,
    result: result
  })
};

const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(user_id),
  })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
  }
  // Empty == Verified Success
  if(user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id);
  return res.json({
    message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESS,
    result
  })
};

const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(user_id)
  });

  if(!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
  }
  if(user.verify === UserVerifyStatus.Verified) {
    return res.json({message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}


const forgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response, next: NextFunction) => {
  const { _id, verify } = req.user as User;
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

const verifyForgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response, next: NextFunction) => {
 return res.json({
  message: USERS_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESS
 })
}

const resetPasswordController = async (req: Request<ParamsDictionary, any, ResetPasswordReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload;
  const { password } = req.body;
  const result = await usersService.resetPassword(user_id, password);
};

const getMeController =  async (req: Request<ParamsDictionary, any, ResetPasswordReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGE.GET_MY_PROFILE_SUCCESS,
    result: user
  });
};

const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody >, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { body } = req;
  const user = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGE.UPDATE_ME_SUCCESS,
    result: user
  });
};

const followController = async (req: Request<ParamsDictionary, any, FollowRedBody>, res: Response, next: NextFunction) => {
  const { user_id } = (req as Request).decoded_authorization as TokenPayload;
  const { followed_user_id } = req.body;
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

const unfollowController = async (req: Request<UnFollowRedParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: follwed_user_id } = req.params
  const result = await usersService.unFollow(user_id, follwed_user_id);
  return res.json(result)
};

const changePasswordController = async (req: Request<ParamsDictionary, any, ChangePasswordReqBody>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const { password } = req.body;
  const result = await usersService.changePassword(user_id, password);
  return res.json(result)
}


export { 
  loginController, 
  registerController, 
  logOutController,
  refreshTokenController,
  verifyEmailController, 
  resendVerifyEmailController, 
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  followController,
  unfollowController,
  changePasswordController
};
