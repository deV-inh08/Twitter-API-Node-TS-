import { Request, Response } from "express"
import usersService from "~/services/users.services";
import { NextFunction, ParamsDictionary } from "express-serve-static-core"
import { LoginReqBody, LogoutRequestBody, RegisterReqBody, TokenPayload, VerifyEmailReqBody } from "~/models/requests/user.request";
import { ObjectId } from "mongodb";
import { User } from "~/models/schema/User.schema";
import USERS_MESSAGE from "~/constants/messages";
import databaseServices from "~/services/database.services";
import HTTP_STATUS from "~/constants/httpStatus";
import { UserVerifyStatus } from "~/constants/enum";

const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGE.LOGIN_SUCCESS,
    result: result
  })
};

const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  try {
    // userServices --> Database
    const result = await usersService.register(req.body)
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
    return res.json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}

export { loginController, registerController, logOutController, verifyEmailController, resendVerifyEmailController };