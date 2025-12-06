import { Router } from "express";
import { body } from "express-validator";
import * as authMiddleware from '../middlewares/auth.middleware.js'
import * as projectController from '../controllers/project.controller.js'

const router = Router()

router.post("/create", authMiddleware.authUser,
    body('name').notEmpty().withMessage('Name is required'),
    projectController.createProjectController
)

router.get("/all", authMiddleware.authUser,
    projectController.getAllProjectsController
)

router.put("/add-user", authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUsersToProjectController
)

router.get("/get-project/:projectId", authMiddleware.authUser,
    projectController.getProjectController
)

router.put("/update-file-tree", authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree must be an object'),
    projectController.updateFileTreeController
)

export default router