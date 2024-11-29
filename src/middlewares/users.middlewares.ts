import { Response, Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import HTTP_STATUS from '~/constants/httpStatus'
import USERS_MESSAGE from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import validate from '~/utils/validation'
import { capitalize } from "lodash"

export const loginValidator = validate(checkSchema({
  email: {
    notEmpty: {
      errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED,
      
    },
    isEmail: {
      errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
    },
    trim: true,
    custom: {
      options: async (value, { req }) => {
        const user = await databaseServices.users.findOne({email: value, password: hashPassword(req.body.password)})
        if (user === null) {
          throw new Error(USERS_MESSAGE.EMAIL_OR_PASSWORD_INCORRECT)
        }
        req.user = user;
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
}, ['body']
))

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
        if (isExitsEmail) {
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
        if (value !== req.body.password) {
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
}, ['body']))


export const accessTokenValidator = validate(checkSchema({
  Authorization: {
    notEmpty: {
      errorMessage: USERS_MESSAGE.ACCESS_TOKEN_IS_REQUIRED
    },
    custom: {
      options: async (value: string, { req }) => {
        const access_token = value.split(' ')[1]
        if(!access_token) {
          throw new ErrorWithStatus({ 
            message: USERS_MESSAGE.ACCESS_TOKEN_IS_REQUIRED, 
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        const decoded_authorization = await verifyToken({ token: access_token, secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string });
        ;(req as Request).decoded_authorization = decoded_authorization;
        return true
      }
    }
  }
}, ['headers']
));

export const refreshTokenValidator = validate(checkSchema({
  refresh_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if(!value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        try {
          const [decoded_refresh_token, refresh_token] = await Promise.all([
            verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
            databaseServices.refreshTokens.findOne({token: value})
          ])
          if(refresh_token === null) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.USED_REFRESH_TOKEN_OR_NOT_EXITS,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          };
          ;(req as Request).decoded_refresh_token = decoded_refresh_token
        } catch (error) {
          if(error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          throw error
        }
        return true
      }
    }
  }
}));

export const emailTokenValidator = validate(checkSchema({
  email_verify_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if(!value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        try {
          const decoded_email_verify_token = await verifyToken({ 
            token: value, 
            secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
          });
          ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
        } catch (error) {
          if(error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          throw error
        }
        return true
      }
    }
  }
}))