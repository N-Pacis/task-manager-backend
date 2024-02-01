import express from 'express'
import { changeTaskStatus, createTask, getCompletionSummaryForDay, getTaskById, getTasks } from '../controllers/task.controller.js'
import { validateTaskCreation } from '../validators/task.validator.js'

const router = express.Router()

router.get("/", getTasks)

router.post("/create", validateTaskCreation,createTask)

router.get("/by-id/:id", getTaskById)

router.get("/completion-summary/by-day/:day", getCompletionSummaryForDay)

router.put("/change-status/:id/:status", changeTaskStatus)

export default router;