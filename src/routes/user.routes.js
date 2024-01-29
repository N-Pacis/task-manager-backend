import express from 'express'
import {validateLogin, validateRegistration } from '../validators/user.validator.js'
import authenticate from '../middlewares/auth.middleware.js'
import {getProfile,register, login} from "../controllers/user.controller.js"

const router = express.Router()

router.get("/profile", authenticate, getProfile)

router.post("/register",validateRegistration,register)

router.post("/login", validateLogin, login)

export default router;