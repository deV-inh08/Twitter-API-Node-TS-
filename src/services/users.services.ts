import { RegisterReqBody, UpdateMeReqBody } from "~/models/requests/user.request"
import databaseServices from "./database.services"
import { User } from "~/models/schema/User.schema"
import { hashPassword } from "~/utils/crypto"
import { signToken } from "~/utils/jwt"
import { TokenType, UserVerifyStatus } from "~/constants/enum"
import RefreshToken from "~/models/schema/RefreshToken.schema"
import { ObjectId } from "mongodb"
import { config } from "dotenv"
import USERS_MESSAGE from "~/constants/messages"
import Follower from "~/models/schema/Follower.schema"

config()
class UsersService {
  private signAccessToken({ user_id, verify }: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      option: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      }
    })
  }

  private signRefreshToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      option: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken({user_id, verify}: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      option: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  };

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ])
  };

  private signForgotPasswordToken({ user_id, verify }: {user_id: string, verify: UserVerifyStatus}) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.FotgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      option: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  };

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    await databaseServices.users.insertOne(new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    await databaseServices.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id), token: refresh_token}))
    console.log('email_verify_token:', email_verify_token)
    return {
      access_token,
      refresh_token
    }
  };

  async login({ user_id, verify }: { user_id: string, verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });
    await databaseServices.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id), token: refresh_token}))
    return {
      access_token,
      refresh_token
    }
  };

  async checkEmailExits(email: string) {
    const user = await databaseServices.users.findOne({ email });
    return Boolean(user)
  };

  async logout(refresh_token: string) {
    const result = await databaseServices.refreshTokens.deleteOne({ token: refresh_token });
    return result
  };

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Verified }),
      databaseServices.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        [
          {
            $set: {
              email_verify_token: '',
              verify: UserVerifyStatus.Verified,
              updated_at: "$$NOW"
            },
          }
        ]
        
      )
    ]);
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  };

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id: user_id.toString(), verify: UserVerifyStatus.Unverified })
    console.log('Resend verify email:', email_verify_token)

    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGE.RESEND_VERIFY_EMAIL_SUCCESS
    }
  };

  async forgotPassword({ user_id, verify }: {user_id: string, verify: UserVerifyStatus}) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify });
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
           forgot_password_token: forgot_password_token,
           updated_at: "$$NOW"
          }
        }
      ]
    )
    // Send email to email user
    console.log('forgot password token:', forgot_password_token)
    return {
      message: USERS_MESSAGE.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  };

  async resetPassword(user_id: string, password: string) {
    databaseServices.users.updateOne({
      _id: new ObjectId(user_id), 
    },
    {
      $set: {
        forgot_password_token: '',
        password: hashPassword(password),

      },
      $currentDate: {
        updated_at: true
      }
    }
  )
  };

  async getMe(user_id: string) {
    const user = databaseServices.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        }
      }
  )
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? {...payload, date_of_birth: new Date(payload.date_of_birth)}: payload;
    const user = await databaseServices.users.findOneAndUpdate({
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date }) 
        },
        $currentDate: {
          updated_at: true
        }
      },
      // change type ==> ModifyResult
      {
        returnDocument: 'after',
        includeResultMetadata: true
      }
    )
    return user.value
  }

  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseServices.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });
    if(follower === null) {
      databaseServices.followers.insertOne(new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      }));
      return {
        message: USERS_MESSAGE.FOLLOW_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGE.FOLLOWED
    }
  }

  async unFollow(user_id: string, followed_user_id: string) {
    const follower = await databaseServices.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if(follower === null) {
      return {
        message: USERS_MESSAGE.ALREADY_UNFOLLOWED
      }
    }
    await databaseServices.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGE.UNFOLLOW_SUCCESSS
    }
  }

}

const usersService = new UsersService();
export default usersService