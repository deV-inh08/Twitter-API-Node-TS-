import { Request } from "express"
import { User } from "./models/schema/User.schema"
import { TokenPayload } from "./models/requests/user.request"
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}