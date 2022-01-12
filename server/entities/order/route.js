import express from 'express'
import { handleStatusChange, posistOrderPush } from './controllers'

const router = express.Router()

router.route('/status').post(handleStatusChange)
router.route('/posist-order-push').post(posistOrderPush)

export default router
