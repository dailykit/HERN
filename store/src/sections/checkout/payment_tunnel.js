import React from 'react'
import axios from 'axios'
import tw from 'twin.macro'

import { usePayment } from './state'
import { useUser } from '../../context'
import { Tunnel } from '../../components'
import { PaymentForm } from './payment_form'
import { CloseIcon } from '../../assets/icons'
import { isClient } from '../../utils'
import { useConfig } from '../../lib'

export const PaymentTunnel = () => {
   const { user } = useUser()
   const { organization } = useConfig()
   const { state, dispatch } = usePayment()
   const [intent, setIntent] = React.useState(null)

   const toggleTunnel = (value = false) => {
      dispatch({
         type: 'TOGGLE_TUNNEL',
         payload: {
            isVisible: value,
         },
      })
   }

   React.useEffect(() => {
      if (user?.platform_customer?.stripeCustomerId && isClient) {
         ;(async () => {
            const intent = await createSetupIntent(
               user?.platform_customer?.stripeCustomerId,
               organization
            )

            setIntent(intent)
         })()
      }
   }, [user, organization])

   return (
      <Tunnel
         size="sm"
         toggleTunnel={toggleTunnel}
         isOpen={state.tunnel.isVisible}
      >
         <Tunnel.Header title="Add Payment Method">
            <button
               onClick={() => toggleTunnel(false)}
               css={tw`border w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100`}
            >
               <CloseIcon size={20} tw="stroke-current text-green-800" />
            </button>
         </Tunnel.Header>
         <Tunnel.Body>
            <PaymentForm intent={intent} />
         </Tunnel.Body>
      </Tunnel>
   )
}

const createSetupIntent = async (customer, organization = {}) => {
   try {
      let stripeAccountId = null
      if (
         organization?.stripeAccountType === 'standard' &&
         organization?.stripeAccountId
      ) {
         stripeAccountId = organization?.stripeAccountId
      }
      const URL = `${get_env('DAILYKEY_URL')}/api/setup-intent`
      const { data } = await axios.post(URL, { customer, stripeAccountId })
      return data.data
   } catch (error) {
      return error
   }
}
