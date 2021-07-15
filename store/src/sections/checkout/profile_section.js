import React from 'react'
import tw from 'twin.macro'

import { usePayment } from './state'
import { Form, Referral } from '../../components'
import { useUser } from '../../context'

export const ProfileSection = () => {
   const { user } = useUser()
   const { state, dispatch } = usePayment()

   React.useEffect(() => {
      const { lastName, firstName, phoneNumber } = state.profile
      dispatch({
         type: 'SET_PROFILE',
         payload: {
            lastName: lastName || user?.platform_customer?.lastName,
            firstName: firstName || user?.platform_customer?.firstName,
            phoneNumber: phoneNumber || user?.platform_customer?.phoneNumber,
         },
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [user, dispatch])

   const handleChange = e => {
      const { name, value } = e.target

      dispatch({
         type: 'SET_PROFILE',
         payload: {
            [name]: value,
         },
      })
   }
   return (
      <main css={tw`flex flex-col`}>
         <Form.Field tw="w-full md:w-3/12">
            <Form.Label>First Name*</Form.Label>
            <Form.Text
               required
               type="text"
               name="firstName"
               onChange={e => handleChange(e)}
               value={state.profile.firstName}
               placeholder="Enter your first name"
            />
         </Form.Field>
         <Form.Field tw="w-full md:w-3/12">
            <Form.Label>Last Name*</Form.Label>
            <Form.Text
               required
               type="text"
               name="lastName"
               onChange={e => handleChange(e)}
               value={state.profile.lastName}
               placeholder="Enter your last name"
            />
         </Form.Field>
         <Form.Field tw="w-full md:w-3/12">
            <Form.Label>Phone No.*</Form.Label>
            <Form.Text
               required
               type="text"
               name="phoneNumber"
               onChange={e => handleChange(e)}
               value={state.profile.phoneNumber}
               placeholder="Enter your phone no. eg. 987 987 9876"
            />
         </Form.Field>
         {!user?.isSubscriber && !user?.customerReferral?.referredByCode && (
            <Referral />
         )}
      </main>
   )
}
