import express from 'express'
import {
   MOFRouter,
   MenuRouter,
   UserRouter,
   OrderRouter,
   sendMail,
   DeviceRouter,
   UploadRouter,
   RMKMenuRouter,
   NewPaymentRouter,
   OccurenceRouter,
   WorkOrderRouter,
   NotificationRouter,
   RewardsRouter,
   ModifierRouter,
   emailParser,
   ParseurRouter,
   placeAutoComplete,
   placeDetails,
   StoreRouter,
   getDistance,
   authorizeRequest,
   handleImage,
   GetFullOccurenceRouter,
   populate_env,
   ActionsRouter,
   DeveloperRouter, // for hadling webhook events
   OhyayRouter,
   ExperienceRouter,
   LogRouter,
   CardRouter,
   RefundRouter,
   createStripeCustomer,
   sendStripeInvoice,
   sendSMS,
   updateDailyosStripeStatus,
   getAccountDetails,
   SSLRouter,
   AuthRouter
} from './entities'

import { PrintRouter } from './entities/print'
import {
   printKOT,
   getKOTUrls,
   printLabel,
   handleThirdPartyOrder,
   createCronEvent,
   createScheduledEvent,
   sendOtp
} from './entities/events'
import { emailTemplateHandler } from './entities/emails'

import './lib/stripe'
import { InvoiceRouter } from './entities/invoice'

const router = express.Router()

// Routes
router.get('/api/about', (req, res) => {
   res.json({ about: 'This is express server API!' })
})
router.use('/api/logs', LogRouter)
router.use('/api/mof', MOFRouter)
router.use('/api/menu', MenuRouter)
router.use('/api/order', OrderRouter)
router.use('/api/assets', UploadRouter)
router.use('/api/printer', PrintRouter)
router.use('/api/rmk-menu', RMKMenuRouter)
router.use('/api/inventory', WorkOrderRouter)

router.get('/api/place/autocomplete/json', placeAutoComplete)
router.get('/api/place/details/json', placeDetails)
router.post('/api/distance-matrix', getDistance)
router.post('/api/sendmail', sendMail)
router.use('/api/rewards', RewardsRouter)
router.get('/api/kot-urls', getKOTUrls)
router.use('/api/modifier', ModifierRouter)
router.use('/api/parseur', ParseurRouter)
router.use('/api/occurences', GetFullOccurenceRouter)
router.use('/api/actions', ActionsRouter)
router.use('/api/ohyay', OhyayRouter)
router.use('/api/experience', ExperienceRouter)

// NEW
router.use('/api/cards', CardRouter)
router.use('/api/refund', RefundRouter)
router.use('/api/payment', NewPaymentRouter)
router.use('/api/invoice', InvoiceRouter)

router.get('/api/account-details/:id', getAccountDetails)

router.post('/api/webhooks/dailyos-stripe-status', updateDailyosStripeStatus)
router.post('/api/webhooks/stripe/customer', createStripeCustomer)
router.post('/api/webhooks/stripe/send-invoice', sendStripeInvoice)
router.post('/api/webhooks/stripe/send-sms', sendSMS)
// NEW

router.use('/webhook/user', UserRouter)
router.use('/webhook/devices', DeviceRouter)
router.use('/webhook/notification', NotificationRouter)
router.use('/webhook/occurence', OccurenceRouter)
router.post('/webhook/parse/email', emailParser)
router.post('/webhook/authorize-request', authorizeRequest)

router.post('/event/print-label', printLabel)
router.post('/event/print-kot', printKOT)
router.post('/event/order/third-party', handleThirdPartyOrder)
router.post('/event/create-cron-event', createCronEvent)
router.post('/event/create-new-scheduled-event', createScheduledEvent)
router.post('/event/send-otp', sendOtp)

router.use('/api/developer', DeveloperRouter)

router.post('/webhook/email-template-handler', emailTemplateHandler)

router.use('/api/store', StoreRouter)
router.post('/api/envs', populate_env)

router.get('/images/:url(*)', handleImage)

router.use('/api/ssl', SSLRouter)
router.use('/api/auth', AuthRouter)

export default router
