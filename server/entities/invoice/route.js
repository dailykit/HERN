import express from 'express'
import { getInvoice } from './controller'

const router = express.Router()
router.route('/:detail').get(getInvoice)

export default router
