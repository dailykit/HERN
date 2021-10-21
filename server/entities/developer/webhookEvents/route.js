import { Router } from 'express'
import {handleIsActiveEventTrigger , sendWebhookEvents  , processWebhookEvents} from './controllers'

const router = Router();

router.post('/create-delete-event-trigger' , handleIsActiveEventTrigger)

router.post('/sendWebhookEvents' , sendWebhookEvents)

router.post('/processWebhookEvents' , processWebhookEvents)

export default router 

