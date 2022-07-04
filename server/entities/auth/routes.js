import express from 'express'
import { authHandler } from './controllers'

const router = express.Router()

router.get('/', authHandler)

export default router
