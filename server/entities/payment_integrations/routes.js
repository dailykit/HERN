import express from 'express'

import {
   discard,
   initiate,
   handleCart,
   processRequest,
   processTransaction
} from './controllers'

const router = express.Router()

router.post('/cart', handleCart)
router.post('/discard', discard)
router.post('/request/initiate', initiate)
router.post('/request/process', processRequest)
router.post('/transaction/process', processTransaction)

export default router
