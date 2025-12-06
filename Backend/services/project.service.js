import projectModel from '../models/project.model.js'
import mongoose from 'mongoose'


export const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error("Name is required")
    }

    if (!userId) {
        throw new Error("User ID is required")
    }

    let project
    try {
        project = await projectModel.create({
            name,
            users: userId
        })
    } catch (err) {
        if (err.code === 11000) {
            throw new Error("Project with this name already exists.")
        }
        throw new Error("Failed to create project.")
    }

    return project
}

export const getAllProjects = async ({ userId }) => {
    try {
        const projects = await projectModel.find({ users: userId })
        return projects
    } catch (error) {
        return (error.message)
    }
}

export const addUsersToProject = async ({ projectId, users, userId }) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID format");
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
        throw new Error("Users array is required and must not be empty");
    }

    for (const userToAddId of users) {
        if (!mongoose.Types.ObjectId.isValid(userToAddId)) {
            throw new Error(`Invalid user ID format in users array: ${userToAddId}`);
        }
    }

    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID format");
    }

    try {
        const project = await projectModel.findOne({
            _id: projectId,
            users: userId
        })

        if (!project) {
            throw new Error("Project not found")
        }

        const updateProject = await projectModel.findOneAndUpdate({
            _id: projectId,
        }, {
            $addToSet: {
                users: {
                    $each: users
                }
            }
        }, {
            new: true
        })
        return updateProject
    } catch (error) {
        return (error.message)
    }
}

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("Project ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID format")
    }

    try {
        const project = await projectModel.findOne({ _id: projectId }).populate('users')
        return project
    } catch (error) {
        return (error.message)
    }
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    console.log("updateFileTree service result:", project)

    return project;
}
