import React from 'react'
import axios from 'axios'
import tw from 'twin.macro'

import { usePayment } from './state'
import { useUser } from '../../context'
import { Tunnel } from '../../components'
import { PaymentForm } from './payment_form'
import { CloseIcon } from '../../assets/icons'
import { isClient, get_env } from '../../utils'
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
      console.log({ user })
      if (user?.platform_customer?.paymentCustomerId && isClient) {
         ;(async () => {
            const intent = await createSetupIntent(
               user?.platform_customer?.paymentCustomerId,
               organization
            )
            console.log({ intent })
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
      console.log({ customer, organization })
      const DATAHUB = get_env('DATA_HUB_HTTPS')
      // const url = `${new URL(DATAHUB).origin}/api/setup-intent`
      const url = `https://dailyos-backend.ngrok.io/server/api/payment/setup-intent`
      const { data } = await axios.post(url, { customer, stripeAccountId })
      console.log({ data: data.data })
      return data.data
   } catch (error) {
      return error
   }
}
