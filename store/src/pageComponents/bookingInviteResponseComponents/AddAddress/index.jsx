import React, { useState, useEffect } from 'react'
import { Flex } from '@dailykit/ui'
import { Wrapper } from './styles'
import { ChevronRight, AddressForm } from '../../../components'
import { useUser, useRsvp } from '../../../Providers'
import { theme } from '../../../theme'
import { capitalize } from '../../../utils'

export default function AddAddress() {
   const { state: rsvpState, setResponseDetails } = useRsvp()
   const { responseDetails } = rsvpState
   const { state: userState, toggleAddressModal } = useUser()
   const [isValid, setIsValid] = useState(false)
   const { user } = userState
   const handleAddressChange = address => {
      setResponseDetails({
         ...responseDetails,
         address
      })
   }

   useEffect(() => {
      if (!isValid) {
         console.log('valid', isValid)
         setResponseDetails({
            ...responseDetails,
            address: null
         })
      }
   }, [isValid])

   return (
      <Wrapper>
         <h1 className="Barlow-Condensed text3 address-header">
            Add Address Details
         </h1>
         <AddressForm
            defaultMutation={false}
            defaultActionButton={false}
            defaultAddress={responseDetails?.address}
            isValidFunc={valid => setIsValid(valid)}
            onChange={address => handleAddressChange(address)}
         />
      </Wrapper>
   )
}
