import express from 'express'

import { get, list } from './controllers'

const router = express.Router()

router.get('/', list)
router.get('/:id', get)

export default router
