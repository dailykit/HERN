import express from 'express'
const { ApolloServer } = require('apollo-server-express')
const schema = require('./streaming/ohyay/src/schema/schema')
const depthLimit = require('graphql-depth-limit')
import get_env from '../get_env'
import {
   MOFRouter,
   MenuRouter,
   UserRouter,
   OrderRouter,
   sendMail,
   DeviceRouter,
   UploadRouter,
   RMKMenuRouter,
   initiatePayment,
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
   CustomerRouter,
   populate_env,
   ActionsRouter,
   OhyayRouter,
   ExperienceRouter
} from './entities'
import { PrintRouter } from './entities/print'
import {
   printKOT,
   getKOTUrls,
   printLabel,
   handleThirdPartyOrder
} from './entities/events'
import {
   handleCustomerSignup,
   handleSubscriptionCancelled
} from './entities/emails'

const router = express.Router()

const apolloserver = new ApolloServer({
   schema,
   playground: {
      endpoint: `${get_env('ENDPOINT')}/ohyay/graphql`
   },
   introspection: true,
   validationRules: [depthLimit(11)],
   formatError: err => {
      console.log(err)
      if (err.message.includes('ENOENT'))
         return isProd ? new Error('No such folder or file exists!') : err
      return isProd ? new Error(err) : err
   },
   debug: true,
   context: ({ req }) => {
      const ohyay_api_key = req.header('ohyay_api_key')
      return { ohyay_api_key }
   }
})

apolloserver.applyMiddleware({ app })

// Routes
router.get('/api/about', (req, res) => {
   res.json({ about: 'This is express server API!' })
})
router.use('/api/mof', MOFRouter)
router.use('/api/menu', MenuRouter)
router.use('/api/order', OrderRouter)
router.use('/api/assets', UploadRouter)
router.use('/api/printer', PrintRouter)
router.use('/api/rmk-menu', RMKMenuRouter)
router.use('/api/inventory', WorkOrderRouter)
router.post('/api/initiate-payment', initiatePayment)
router.get('/api/place/autocomplete/json', placeAutoComplete)
router.get('/api/place/details/json', placeDetails)
router.post('/api/distance-matrix', getDistance)
router.post('/api/sendmail', sendMail)
router.use('/api/rewards', RewardsRouter)
router.get('/api/kot-urls', getKOTUrls)
router.use('/api/modifier', ModifierRouter)
router.use('/api/parseur', ParseurRouter)
router.use('/api/occurences', GetFullOccurenceRouter)
router.use('/api/customer', CustomerRouter)
router.use('/api/actions', ActionsRouter)
router.use('/api/ohyay', OhyayRouter)
router.use('/api/experience', ExperienceRouter)

router.use('/webhook/user', UserRouter)
router.use('/webhook/devices', DeviceRouter)
router.use('/webhook/notification', NotificationRouter)
router.use('/webhook/occurence', OccurenceRouter)
router.post('/webhook/parse/email', emailParser)
router.post('/webhook/authorize-request', authorizeRequest)

router.post('/event/print-label', printLabel)
router.post('/event/print-kot', printKOT)
router.post('/event/order/third-party', handleThirdPartyOrder)

router.post('/webhook/emails/handle-customer-signup', handleCustomerSignup)
router.post(
   '/webhook/emails/handle-subscription-cancelled',
   handleSubscriptionCancelled
)

router.use('/api/store', StoreRouter)
router.post('/api/envs', populate_env)

router.get('/images/:url(*)', handleImage)

export default router
