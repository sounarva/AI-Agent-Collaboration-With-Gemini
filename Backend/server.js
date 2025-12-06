import 'dotenv/config'
import app from './app.js'
import http from 'http'
import { Server } from "socket.io";
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import projectModel from './models/project.model.js'
import * as aiService from './services/ai.service.js'



const port = process.env.PORT || 5000
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
io.use(async (socket, next) => {
    try {
        const projectId = socket.handshake.query.projectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new Error("Invalid project id")
        }
        socket.project = await projectModel.findOne({ _id: projectId })
        if (!socket.project) throw new Error("Project not found")
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1]
        if (!token) throw new Error("Authentication error")

        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        if (!decoded) throw new Error("Authentication error")

        socket.user = decoded
        next()

    } catch (error) {
        next(error)
    }
})


io.on('connection', socket => {

    console.log('a user connected');
    socket.roomId = socket.project._id.toString()
    socket.join(socket.roomId)

    socket.on('project-message', async data => {
        // console.log(data)
        const aiIncludes = data.message.includes("@ai")
        socket.broadcast.to(socket.roomId).emit('project-message', data)
        if (aiIncludes) {
            const prompt = data.message.replace("@ai", "")
            const result = await aiService.generateAiContent(prompt)

            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    email: "AI",
                    _id: "AI"
                },
            })
            return
        }

    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId)
    });
});


server.listen(port, () => {
    console.log(`Server is listening on port : ${port}`)
})