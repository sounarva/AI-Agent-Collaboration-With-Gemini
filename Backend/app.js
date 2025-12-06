import express, { urlencoded } from 'express'
import morgan from 'morgan'
import connection from './database/db.js'
import userRouter from './routes/user.route.js'
import projectRouter from './routes/project.route.js'
import aiRouter from './routes/ai.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express()
app.use(morgan("dev"))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())

connection()

app.use("/users", userRouter)
app.use("/projects", projectRouter)
app.use("/ai", aiRouter)

app.get("/", (req, res) => {
    res.send("Hello World")
})

export default app