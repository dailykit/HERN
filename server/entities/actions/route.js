import express from 'express'
import {
   forgotPassword,
   nutritionInfo,
   resetPassword,
   verifyResetPasswordToken,
   sendSMS
} from './controllers'

const router = express.Router()

router.route('/calculate-nutritional-info').post(nutritionInfo)
router.route('/forgot-password').post(forgotPassword)
router.route('/verify-reset-password-token').post(verifyResetPasswordToken)
router.route('/reset-password').post(resetPassword)
router.route('/reset-password').post(resetPassword)
router.post('/send-sms', sendSMS)
export default router
