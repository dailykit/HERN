import express from "express"
import {WebhookEventRouter} from "./webhookEvents"
const router = express.Router()

router.use('/webhookEvents', WebhookEventRouter)

export default router