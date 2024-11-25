import {Response, Request, NextFunction} from 'express'
import { checkSchema } from 'express-validator'
import databaseServices from '~/services/database.services'
import usersService from '~/services/users.services'
import validate from '~/utils/validation'

export const loginValidator = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if(!email || !password) {
        res.status(400).json({
            message: "Email and Password is require!"
        })
    }
    next()
}

export const registerValidator = validate(checkSchema({
    name: {
        notEmpty: true,
        isString: true,
        isLength: {
            options: {
                min: 2,
                max: 255
            }
        },
        trim: true
    },
    email: {
        notEmpty: true,
        isEmail: true,
        trim: true,
        custom: {
            options: async (value) => {
                const isExitsEmail = await usersService.checkEmailExits(value)
                if(isExitsEmail) {
                    throw new Error("Email already exits")
                }
                return true
            }
        }
    },
    password: {
        notEmpty: true,
        isString: true, 
        isLength: {
            options: {
                min: 6,
                max: 50
            }
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minSymbols: 1,
                minNumbers: 1
            }
        },
        errorMessage: "password must be ..."
    },
    confirm_password: {
        notEmpty: true,
        isString: true,
        isLength: {
            options: {
                min: 6,
                max: 50
            }
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minSymbols: 1,
                minNumbers: 1
            }
        },
        custom: {
            options: (value, { req }) => {
                if(value !== req.body.password) {
                    throw new Error("Password_confirm is not match password")
                } else {
                    return true
                }
            }
        }
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            }
        }
    }
}))