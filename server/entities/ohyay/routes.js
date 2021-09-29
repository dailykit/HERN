import express from 'express'
import { cloneWorkspace, createInvite } from './controllers'

const router = express.Router()

router.route('/cloneWorkspace').post(cloneWorkspace)
router.route('/createInvite').post(createInvite)

export default router
