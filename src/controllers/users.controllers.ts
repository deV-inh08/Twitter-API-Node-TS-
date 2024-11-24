import { Request, Response } from "express"
const usersController = (req: Request, res: Response) => {
    const { email, password } = req.body
    if(email === 'abc123@gmail.com' && password === '123456') {
        res.json({
            message: 'Login success'
        })
    }
    return res.status(400).json({
        error: 'Login failed'
    })
    
}

export default usersController;