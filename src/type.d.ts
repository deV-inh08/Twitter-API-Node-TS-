import { Request } from "express"
import { User } from "./models/schema/User.schema"
declare module 'express' {
  interface Request {
    user?: User
  }
}