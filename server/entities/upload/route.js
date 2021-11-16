import express from 'express'
import { upload, list, remove , serveImage} from './controllers'

const router = express.Router()

router.route('/').post(upload)
router.route('/').get(list)
router.route('/').delete(remove)
router.route('/serve-image').get(serveImage)

export default router
