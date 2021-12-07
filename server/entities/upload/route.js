import express from 'express'
import { upload, list, remove } from './controllers'

const router = express.Router()

router.route('/').post(upload)
router.route('/').get(list)
router.route('/').delete(remove)

export default router
