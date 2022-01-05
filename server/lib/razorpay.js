import Razorpay from 'razorpay'
import get_env from '../../get_env'

const stripe = async () => {
   const RAZORPAY_SECRET_KEY = await get_env('RAZORPAY_SECRET_KEY')
   const RAZORPAY_ID = await get_env('RAZORPAY_KEY_ID')
   return new Razorpay({
      key_id: RAZORPAY_ID,
      key_secret: RAZORPAY_SECRET_KEY
   })
}

export default stripe
