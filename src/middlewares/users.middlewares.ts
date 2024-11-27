import {Response, Request, NextFunction} from 'express'
import { checkSchema } from 'express-validator'
import USERS_MESSAGE from '~/constants/messages'
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
        notEmpty: {
          errorMessage: USERS_MESSAGE.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGE.NAME_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 2,
                max: 255
            },
            errorMessage: USERS_MESSAGE.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true
    },
    email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
            options: async (value) => {
                const isExitsEmail = await usersService.checkEmailExits(value)
                if(isExitsEmail) {
                    throw new Error(USERS_MESSAGE.EMAIL_ALREADY_EXITS)
                }
                return true
            }
        }
    },
    password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_A_STRING
        }, 
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: USERS_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_6_TO_150
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
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
    },
    confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGHT_MUST_BE_FROM_6_TO_150
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minSymbols: 1,
                minNumbers: 1
            },
            errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
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
            },
            errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
    }
}))