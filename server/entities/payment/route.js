import express from 'express'

import {
   initiatePaymentHandler,
   stripeWebhookEvents,
   handleCartPayment,
   createSetupIntent,
   listSetupIntent,
   getSetupIntent,
   updateSetupIntent,
   cancelSetupIntent,
   getPaymentMethod,
   listPaymentMethod
} from './controllers'

const router = express.Router()
// Handle cart payment
router.post('/handle-cart-payment', handleCartPayment)

// Initiate payment
router.post('/initiate-payment', initiatePaymentHandler)

// Stripe webhook events
router.post('/stripe-webhook', stripeWebhookEvents)

// Setup Intents
router.get('/setup-intent', listSetupIntent)
router.get('/setup-intent/:id', getSetupIntent)
router.post('/setup-intent', createSetupIntent)
router.patch('/setup-intent/:id', updateSetupIntent)
router.delete('/setup-intent/:id', cancelSetupIntent)

// Payment Methods
router.get('/payment-method', listPaymentMethod)
router.get('/payment-method/:id', getPaymentMethod)

export default router
