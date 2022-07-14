import express from 'express'
import { sendNotification } from './controllers'

const router = express.Router()

router.post('/', sendNotification)

export default router
