import express from 'express'
import { getCustomer } from './controllers'

const router = express.Router()

router.route('/:email').get(getCustomer)

export default router
