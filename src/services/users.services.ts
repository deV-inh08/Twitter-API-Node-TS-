import { RegisterReqBody } from "~/models/requests/user.request"
import databaseServices from "./database.services"
import { User } from "~/models/schema/User.schema"
import { hashPassword } from "~/utils/crypto"
import { signToken } from "~/utils/jwt"
import { TokenType, UserVerifyStatus } from "~/constants/enum"
import RefreshToken from "~/models/schema/RefreshToken.schema"
import { ObjectId } from "mongodb"
import { config } from "dotenv"
import USERS_MESSAGE from "~/constants/messages"

config()
class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      option: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      option: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      option: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseServices.users.insertOne(new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    await databaseServices.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id), token: refresh_token}))
    console.log('email_verify_token:', email_verify_token)
    return {
      access_token,
      refresh_token
    }
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id);
    await databaseServices.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id), token: refresh_token}))
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExits(email: string) {
    const user = await databaseServices.users.findOne({ email });
    return Boolean(user)
  }

  async logout(refresh_token: string) {
    const result = await databaseServices.refreshTokens.deleteOne({ token: refresh_token });
    return result
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
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
            // $currentDate: {
            //   updated_at: true
            // }
          }
        ]
        
      )
    ]);
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
}

const usersService = new UsersService();
export default usersService