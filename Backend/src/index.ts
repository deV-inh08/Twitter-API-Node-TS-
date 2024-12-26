import express from 'express'
import userRouter from './routes/users.routes'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouters from './routes/medias.routes'
import { initFolder } from './utils/file'
import path from 'path'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'
import cors from 'cors'
config()


const app = express()

app.use(cors())

initFolder()

// parse JSON => Javascript ( Object )
app.use(express.json())

// Mount the rourter on the "/api" path
app.use('/users', userRouter)
app.use('/medias', mediasRouters)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
// app.use('/static', express.static(UPLOAD_IMAGE_DIR))

// Connect MongoDb
// run().catch(console.dir) => connect function

// Connect Class
databaseServices.connect().catch(console.dir)

app.use(defaultErrorHandler)

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT}`)
})