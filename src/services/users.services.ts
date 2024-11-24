import databaseServices from "./database.services"
import { User } from "~/models/schema/User.schema"

class UsersService {
    async register(payload: { email: string, password: string }) {
        const { email, password } = payload
        const result = await databaseServices.users.insertOne(new User({
            email,
            password
        }))
        return result
    }
}

const userService = new UsersService();
export default userService