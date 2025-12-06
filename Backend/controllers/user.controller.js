import * as userService from '../services/user.service.js'
import { validationResult } from 'express-validator'
import userModel from '../models/user.model.js'
import redisClient from '../services/redis.service.js'

export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        const user = await userService.createUser(req.body)
        const token = await user.generateJWT()

        delete user._doc.password

        res.status(200).json({ user, token })
    } catch (err) {
        res.status(400).send(err.message)
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            res.status(404).send("User Not Found")
        }

        const isCorrect = await user.isValidPassword(password)
        if (!isCorrect) {
            res.status(401).send("Invalid Credentials")
        } else {
            const token = await user.generateJWT()

            delete user._doc.password
            res.status(200).json({ user, token })
        }
    } catch (err) {
        res.status(400).send(err.message)
    }
}

export const profileController = async (req, res) => {
    res.status(200).json({
        user: req.user
    })
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1]

        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24)

        res.status(200)
            .json({
                message: 'Logged Out Successfully'
            })

    } catch (error) {
        console.log(error)
        res.status(400).send(error.message)
    }
}

export const getAllUserController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const userId = loggedInUser._id

        const users = await userService.getAllUsers({ userId })

        res.status(200).json({ users })
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message)
    }
}