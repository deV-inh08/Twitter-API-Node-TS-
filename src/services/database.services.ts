import { MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'

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
    constructor() {
       this.client = new MongoClient(uri)
    }

    async connect() {
        try {
            await this.client.connect();
            await this.client.db("admin").command({ ping: 1 })
            console.log('Pinged your deployment. You success connect mongoDb')
        } finally {
            await this.client.close()
        }
    }
};

const databaseServices = new DatabaseServices().connect();
export default databaseServices;