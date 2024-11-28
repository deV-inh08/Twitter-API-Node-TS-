import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
import { UserType } from '~/models/schema/User.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'

config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@twitter.47hsd.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`


// const client = new MongoClient(uri);

// export async function run() {
//     try {
//         // Connect the client to the server
//         await client.connect()
//         // Send a ping to confirm a successful connection
//         await client.db('admin').command({ ping: 1 }) n
//         console.log('Pinged your deployment. You successful connect mongoDb')
//     } finally {
//         await client.close()
//     } 
// }

// Conver from function to Class
class DatabaseServices {
    private client: MongoClient
    private db: Db
    constructor() {
       this.client = new MongoClient(uri)
       this.db = this.client.db(process.env.DB_NAME)
    }

    async connect() {
        try {
            await this.db.command({ ping: 1 })
            console.log('Pinged your deployment. You success connect mongoDb')
        } catch(error) { 
            console.log("Error", error)
            throw error
        } 
    }

    get users(): Collection<UserType> {
        // get collection "users"
        return this.db.collection(process.env.DB_USERS_COLLECTIONS as string)
    }

    get refreshTokens(): Collection<RefreshToken>{
      return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
    }
};

const databaseServices = new DatabaseServices();
export default databaseServices;