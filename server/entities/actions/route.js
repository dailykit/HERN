import express from 'express'
import { nutritionInfo } from './controllers'

const router = express.Router()

router.route('/calculate-nutritional-info').post(nutritionInfo)

export default router
