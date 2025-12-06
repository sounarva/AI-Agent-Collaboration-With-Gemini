import * as projectService from '../services/project.service.js'
import userModel from '../models/user.model.js'
import { validationResult } from 'express-validator'



export const createProjectController = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400)
            .json({
                errors: errors.array()
            })
    }

    try {

        const { name } = req.body
        const loggedInUser = await userModel.findOne({ email: req.user.email })
        const userId = loggedInUser

        const newPrj = await projectService.createProject({ name, userId })
        res.status(201)
            .json(newPrj)

    } catch (error) {

        console.error(error)
        res.status(400).json({ message: error.message })

    }
}

export const getAllProjectsController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email })
        const userId = loggedInUser._id
        const projects = await projectService.getAllProjects({ userId })
        return res.status(200).json(projects)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

export const addUsersToProjectController = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400)
            .json({
                errors: errors.array()
            })
    }

    try {
        const { projectId, users } = req.body
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const userId = loggedInUser._id

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId
        })

        return res.status(200).json(project)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

export const getProjectController = async (req, res) => {
    try {
        const { projectId } = req.params
        const project = await projectService.getProjectById({ projectId })
        return res.status(200).json(project)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

export const updateFileTreeController = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400)
            .json({
                errors: errors.array()
            })
    }

    try {
        const { projectId, fileTree } = req.body
        console.log("updateFileTreeController request body:", req.body)


        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json(project)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
