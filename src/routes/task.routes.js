import express from 'express'
import { changeTaskStatus, createTask, deleteTask, getCompletionSummaryForDay, getTaskById, getTasks, updateTask } from '../controllers/task.controller.js'
import { validateTaskCreation } from '../validators/task.validator.js'

const router = express.Router()

router.get("/", getTasks)

router.post("/create", validateTaskCreation,createTask)

router.get("/by-id/:id", getTaskById)

router.get("/completion-summary/by-day/:day", getCompletionSummaryForDay)

router.put("/change-status/:id/:status", changeTaskStatus)

router.put("/edit/:id", validateTaskCreation, updateTask)

router.delete("/delete/:id", deleteTask)

export default router;