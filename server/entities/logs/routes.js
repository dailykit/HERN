import express from 'express'

import { requests, errors } from './controllers'

const router = express.Router()

router.get('/requests', requests)
router.get('/errors', errors)

export default router
