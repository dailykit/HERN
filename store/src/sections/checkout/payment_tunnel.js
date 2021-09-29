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
      if (user?.platform_customer?.paymentCustomerId && isClient && !intent) {
         ;(async () => {
            const setup_intent = await createSetupIntent(
               user?.platform_customer?.paymentCustomerId
            )
            console.log({ setup_intent })
            setIntent(setup_intent)
         })()
      }
   }, [user])

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

const createSetupIntent = async customer => {
   try {
      console.log({ customer })
      const origin = isClient ? window.location.origin : ''
      const url = `${origin}/server/api/payment/setup-intent`
      const { data } = await axios.post(url, {
         customer,
      })
      console.log({ data: data.data })
      return data.data
   } catch (error) {
      return error
   }
}
