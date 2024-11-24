import express from 'express'
import userRouter from './routes/users.routes'
import databaseServices from './services/database.services'

const app = express()
const PORT = 3001

// parse JSON => Javascript ( Object )
app.use(express.json())

// Mount the rourter on the "/api" path
app.use('/users', userRouter)

// Connect MongoDb
// run().catch(console.dir) => connect function

// Connect Class
databaseServices.connect().catch(console.dir)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})