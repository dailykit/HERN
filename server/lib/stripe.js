import Stripe from 'stripe'
import { isConnectedIntegration } from '../utils'
import get_env from '../../get_env'

const stripe = async () => {
   const STRIPE_SECRET_KEY = await get_env('STRIPE_SECRET_KEY')
   const STRIPE_ACCOUNT_ID = await get_env('STRIPE_ACCOUNT_ID')
   const isConnected = await isConnectedIntegration()
   return new Stripe(STRIPE_SECRET_KEY, {
      ...(isConnected && {
         stripeAccount: STRIPE_ACCOUNT_ID
      })
   })
}

export default stripe
