import { Request, Response } from "express"
import usersService from "~/services/users.services";
import { NextFunction, ParamsDictionary } from "express-serve-static-core"
import { LogoutRequestBody, RegisterReqBody } from "~/models/requests/user.request";
import { ObjectId } from "mongodb";
import { User } from "~/models/schema/User.schema";
import USERS_MESSAGE from "~/constants/messages";

const loginController = async (req: Request, res: Response) => {
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
    } catch(err: any) {
        res.status(400).json({
            error: err.message
        })
    }    
}

const logOutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body;
  const result = await usersService.logout(refresh_token)
  return res.json({
    message: USERS_MESSAGE.LOGOUT_SUCCESS,
    result: result
  })
}

export { loginController, registerController, logOutController };