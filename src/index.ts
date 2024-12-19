import express from 'express'
import userRouter from './routes/users.routes'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouters from './routes/medias.routes'
import { initFolder } from './utils/file'

const app = express()
const PORT = 3000

initFolder()

// parse JSON => Javascript ( Object )
app.use(express.json())

// Mount the rourter on the "/api" path
app.use('/users', userRouter)
app.use('/medias', mediasRouters)

// Connect MongoDb
// run().catch(console.dir) => connect function

// Connect Class
databaseServices.connect().catch(console.dir)

app.use(defaultErrorHandler)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})