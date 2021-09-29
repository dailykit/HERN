import express from 'express'
import {
   experienceBookingEmail,
   storeWorkspaceMetaDetails
} from './controllers'

const router = express.Router()

router.route('/booking/sendUrl').post(experienceBookingEmail)
router.route('/workspace/store-metadata').post(storeWorkspaceMetaDetails)

export default router
