import {Response, Request, NextFunction} from 'express'

export const loginValidator = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if(!email || !password) {
        res.status(400).json({
            message: "Email and Password is require!"
        })
    }
    next()
}