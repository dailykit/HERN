import React from 'react'
import { Flex } from '@dailykit/ui'
import { Wrapper } from './styles'
import { useUser, usePayment } from '../../../../Providers'
import Input from '../../../Input'

export default function ProfileSection() {
   const { state: userState } = useUser()
   const { user } = userState
   const { state, dispatch } = usePayment()

   React.useEffect(() => {
      const { lastName, firstName, phoneNumber } = state.profile
      dispatch({
         type: 'SET_PROFILE',
         payload: {
            lastName: lastName || user?.lastName,
            firstName: firstName || user?.firstName,
            phoneNumber: phoneNumber || user?.phoneNumber
         }
      })
   }, [user, dispatch])

   const handleChange = e => {
      const { name, value } = e.target

      dispatch({
         type: 'SET_PROFILE',
         payload: {
            [name]: value
         }
      })
   }
   return (
      <Wrapper>
         <form className="address_form_div">
            <Flex container flexDirection="column">
               <label>First Name*</label>
               <Input
                  name="firstName"
                  className="customAddressInput"
                  type="text"
                  placeholder="Enter first name"
                  value={state?.profile?.firstName || ''}
                  onChange={handleChange}
                  required
               />
            </Flex>
            <Flex container flexDirection="column">
               <label>Last Name*</label>
               <Input
                  name="lastName"
                  className="customAddressInput"
                  type="text"
                  placeholder="Enter last name"
                  value={state?.profile?.lastName || ''}
                  onChange={handleChange}
                  required
               />
            </Flex>
            <Flex container flexDirection="column">
               <label>Phone Number* </label>
               <Input
                  name="phoneNumber"
                  className="customAddressInput"
                  type="text"
                  placeholder="Enter phone number"
                  value={state?.profile?.phoneNumber || ''}
                  onChange={handleChange}
                  required
               />
            </Flex>
         </form>
      </Wrapper>
   )
}
