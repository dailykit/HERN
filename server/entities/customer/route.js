import express from 'express'
import { getCustomer, createReferralProgramScheduledEvent } from './controllers'

const router = express.Router()

router.route('/:email').get(getCustomer)
router.route('/referralProgram').post(createReferralProgramScheduledEvent)

export default router
