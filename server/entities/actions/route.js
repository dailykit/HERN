import express from 'express'
import {
   forgotPassword,
   nutritionInfo,
   resetPassword,
   verifyResetPasswordToken
} from './controllers'

const router = express.Router()

router.route('/calculate-nutritional-info').post(nutritionInfo)
router.route('/forgot-password').post(forgotPassword)
router.route('/verify-reset-password-token').post(verifyResetPasswordToken)
router.route('/reset-password').post(resetPassword)

export default router
