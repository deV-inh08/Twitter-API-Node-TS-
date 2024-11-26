import { Request, Response } from "express"
import usersService from "~/services/users.services";
import { NextFunction, ParamsDictionary } from "express-serve-static-core"
import { RegisterReqBody } from "~/models/requests/user.request";

const loginController = (req: Request, res: Response) => {
    const { email, password } = req.body
    if(email === 'abc123@gmail.com' && password === '123456') {
        res.json({
            message: 'Login success'
        })
    }
    res.status(400).json({
        error: 'Login failed'
    })
};

const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
    try {
        // userServices --> Database
        // throw new Error("Loi roi")
        const result = await usersService.register(req.body)
        res.json({
            message: "Register success",
            data: result
        })
    } catch(err: any) {
        res.status(400).json({
            error: err.message
        })
    }    
}

export { loginController, registerController };