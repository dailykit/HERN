import express from 'express'

import { get, list, create, update, cancel, retry } from './controllers'

const router = express.Router()

router.get('/', list)
router.get('/:id', get)
router.post('/', create)
router.post('/retry', retry)
router.patch('/:id', update)
router.delete('/:id', cancel)

export default router
