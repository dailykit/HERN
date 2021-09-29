import express from 'express'

import { get, list, create, update } from './controllers'

const router = express.Router()

router.get('/', list)
router.get('/:id', get)
router.post('/', create)
router.patch('/:id', update)

export default router
