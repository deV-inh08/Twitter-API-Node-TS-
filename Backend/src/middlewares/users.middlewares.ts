import { Response, Request, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
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
import { ObjectId } from 'mongodb'
import { TokenPayload } from '~/models/requests/user.request'
import { UserVerifyStatus } from '~/constants/enum'
import { REGEX_USERNAME } from '~/constants/regex'

const passwordSchema: ParamSchema = {
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
};

const confirmPasswordSchema: ParamSchema = {
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
        throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_NOT_MATCH)
      } else {
        return true
      }
    }
  }
};


const confirmNewPasswordSchema: ParamSchema = {
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
      if (value !== req.body.new_password) {
        throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_NOT_MATCH)
      } else {
        return true
      }
    }
  }
};

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if(!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
        if(user === null) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if(user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
      } catch(error) {
        if(error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
};

const nameSchema: ParamSchema = {
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
};

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
};

const imageURLSchema: ParamSchema = {
  trim: true,
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGE.IMAGE_URL_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGE.IMAGE_URL_LENGTH
  }
};

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if(!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.INVALID_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseServices.users.findOne({
        _id: new ObjectId(value)
      })
      
      if(followed_user === null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}
 
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
  password: passwordSchema
}, ['body']
))

export const registerValidator = validate(checkSchema({
  name: nameSchema,
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
  password: passwordSchema,
  confirm_password: confirmPasswordSchema,
  date_of_birth: dateOfBirthSchema,
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
}));

export const forgotPasswordValidator = validate(checkSchema({
  email: {
    isEmail: {
    errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
    },
    trim: true,
    custom: {
      options: async (value, { req }) => {
        console.log(value)
        const user = await databaseServices.users.findOne({ email: value })
        if(user === null) {
          throw new Error (USERS_MESSAGE.USER_NOT_FOUND)
        }
        req.user = user
        return true
      }
    }
  }
}, ['body']
));

export const verifyForgotPasswordValidator = validate(checkSchema({
  forgot_password_token: {
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if(!value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        try {
          const decoded_forgot_password_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
          })
          const { user_id } = decoded_forgot_password_token
          const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
          if(user === null) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.USER_NOT_FOUND,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          if(user.forgot_password_token !== value) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
        } catch(error) {
          if(error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          throw error
        }
        return true
      }
    }
  }
}, ['body']
));

export const resetPasswordValidator = validate(checkSchema({
  password: passwordSchema,
  confirm_password: confirmPasswordSchema,
  forgot_password_token: forgotPasswordTokenSchema
},['body']
));

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload;
  if(verify !== UserVerifyStatus.Verified) {
   return next(new ErrorWithStatus({
    message: USERS_MESSAGE.USER_NOT_VERIFIED,
    status: HTTP_STATUS.FORBIDEN
   }))
  }
  next()
};

export const updateMeValidator = validate(checkSchema({
  name: {
    ...nameSchema,
    optional: true,
    notEmpty: undefined
  },
  date_of_birth: {
    ...dateOfBirthSchema,
    optional: true,
  },
  bio: {
    optional: true,
    isString: {
      errorMessage: USERS_MESSAGE.BIO_MUST_BE_A_STRING
    },
    isLength: {
      options: {
        min: 1,
        max: 200
      },
      errorMessage: USERS_MESSAGE.BIO_LENGTH_MUST_BE_FROM_1_TO_200
    },
    trim: true,

  },
  location: {
    optional: true,
    isString: {
      errorMessage: USERS_MESSAGE.LOCATION_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 200
      },
      errorMessage: USERS_MESSAGE.LOCATION_LENGTH
    }
  },
  website: {
    optional: true,
    isString: {
      errorMessage: USERS_MESSAGE.WEBSITE_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 200
      },
      errorMessage: USERS_MESSAGE.WEBSITE_LENGTH
    }
  },
  username: {
    optional: true,
    isString: {
      errorMessage: USERS_MESSAGE.USERNAME_MUST_BE_A_STRING
    },
    trim: true,
    custom: {
      options: async (value: string, { req }) => {
        if(!REGEX_USERNAME.test(value)) {
          throw Error(USERS_MESSAGE.USERNAME_INVALID)
        }
        const user = await databaseServices.users.findOne({username: value});
        if(user) {
          throw Error(USERS_MESSAGE.USERNAME_EXISTED)
        }
      }
    }
  },
  avatar: imageURLSchema,
  cover_photo: imageURLSchema
}, ['body']
));


export const followValidator = validate(checkSchema({
  followed_user_id: userIdSchema
}, ['body']
))

export const unFollowValidator = validate(checkSchema({
  user_id: userIdSchema
}, ['params']
));

export const changePasswordValidator = validate(checkSchema({
  old_password: {
    ...passwordSchema,
    custom: {
      options: async (value: string, { req }) => {
        const { user_id } = (req as Request).decoded_authorization as TokenPayload
        const user = await databaseServices.users.findOne({
          _id: new ObjectId(user_id)
        });

        if(!user) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const { password } = user;
        const isMatch = hashPassword(value) === password;
        if(!isMatch) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.OLD_PASSWORD_NOT_MATCH,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
      }
    }
  },
  new_password: passwordSchema,
  confirm_new_password: confirmNewPasswordSchema
}, ['body']
))