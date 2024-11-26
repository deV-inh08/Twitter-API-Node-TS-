import { RegisterReqBody } from "~/models/requests/user.request"
import databaseServices from "./database.services"
import { User } from "~/models/schema/User.schema"
import { hashPassword } from "~/utils/crypto"
import { signToken } from "~/utils/jwt"
import { TokenType } from "~/constants/enum"

console.log(process.env.ACCESS_TOKEN_EXPIRES_IN)
console.log(process.env.REFRESH_TOKEN_EXPIRES_IN)

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      option: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      option: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
    async register(payload: RegisterReqBody) {
        const result = await databaseServices.users.insertOne(new User({
            ...payload,
            date_of_birth: new Date(payload.date_of_birth),
            password: hashPassword(payload.password)
          })
        )
        const user_id = result.insertedId.toString()
        const [access_token, refresh_token] = await Promise.all([
          this.signAccessToken(user_id),
          this.signRefreshToken(user_id)
        ])
        return {
          access_token,
          refresh_token
        }
    }

    async checkEmailExits(email: string) {
        const user = await databaseServices.users.findOne({ email });
        return Boolean(user)
    }
}

const usersService = new UsersService();
export default usersService