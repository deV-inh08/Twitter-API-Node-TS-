import { Request, Response } from "express"
import databaseServices from "~/services/database.services"
import userService from "~/services/users.services";


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

const registerController = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        const result = userService.register({ email, password })
        res.json({
            message: "Register success",
            data: result
        })

    } catch(err) {
        res.status(400).json({
            error: err
        })
    }    
}

export { loginController, registerController };