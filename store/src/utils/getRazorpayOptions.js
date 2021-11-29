import { get_env } from './get_env'
export const getRazorpayOptions = ({
   orderDetails = null,
   paymentInfo = null,
   profileInfo = null,
   ondismissHandler = () => null,
   eventHandler = () => null,
}) => {
   if (orderDetails && paymentInfo) {
      const RAZORPAY_KEY_ID = get_env('RAZORPAY_KEY_ID')
      const {
         id: razorpay_order_id,
         notes,
         amount,
         status,
         receipt,
         currency,
      } = orderDetails
      const options = {
         key: RAZORPAY_KEY_ID,
         amount: amount.toString(),
         currency,
         name: 'Test Hern',
         order_id: razorpay_order_id,
         notes,
         prefill: {
            name: `${profileInfo?.firstName} ${profileInfo?.lastName}`,
            email: `${profileInfo?.email}`,
            contact: `${profileInfo?.phone}`,
            method: paymentInfo?.method,
            bank: paymentInfo?.bank,
         },
         theme: {
            hide_topbar: true,
         },
         readonly: {
            email: '1',
            contact: '1',
            name: '1',
         },
         config: {
            display: {
               blocks: {
                  banks: {
                     name: 'Google Pay',
                     instruments: [
                        {
                           method: 'upi',
                           flows: ['collect'],
                           apps: ['google_pay'],
                        },
                     ],
                  },
               },
               sequence: ['block.banks'],
               preferences: {
                  show_default_blocks: false,
               },
            },
         },
         modal: {
            ondismiss: ondismissHandler,
         },
         handler: eventHandler,
      }
      return options
   }
   return null
}
