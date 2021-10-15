import React, { useEffect, useState } from 'react'
import { Wrapper } from './styles'
import { Input, Error, Spacer } from '../../../components'
import { useRsvp, useUser } from '../../../Providers'
import { IsEmailValid, isPhoneNumberValid } from '../../../utils'

export default function ResponseForm({ decodedToken }) {
   const { state: rsvpState, setResponseDetails } = useRsvp()
   const { responseDetails } = rsvpState
   const { state: userState } = useUser()
   const { user } = userState
   const [form, setForm] = useState({
      email: {
         value:
            responseDetails?.email?.value ||
            user?.email ||
            decodedToken?.invitee?.email ||
            '',
         error: ''
      },
      phone: {
         value:
            responseDetails?.phone?.value ||
            user?.phone ||
            decodedToken?.invitee?.phone ||
            '',
         error: ''
      }
   })
   const inputHandler = e => {
      const { name, value } = e.target

      setForm(prev => {
         return { ...prev, [name]: { ...prev[name], value, error: '' } }
      })
      if (name === 'email') {
         if (!IsEmailValid(value)) {
            setForm(prev => {
               return {
                  ...prev,
                  [name]: {
                     ...prev[name],
                     error: 'Please Provide a valid input!'
                  }
               }
            })
         }
      } else {
         if (!isPhoneNumberValid(value)) {
            setForm(prev => {
               return {
                  ...prev,
                  [name]: {
                     ...prev[name],
                     error: 'Please Provide a valid input!'
                  }
               }
            })
         }
      }
   }

   useEffect(() => {
      setResponseDetails(form)
   }, [form])

   return (
      <Wrapper>
         <p className="League-Gothic text6 normal_heading">
            Please enter your details below and accept the invitation
         </p>

         <Input
            className="custom-response-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form?.email?.value}
            onChange={inputHandler}
         />
         {form?.email?.error ? (
            <Error margin="8px 0 1rem 0">{form?.email?.error}</Error>
         ) : (
            <Spacer yAxis="0.5rem" />
         )}
         <Input
            className="custom-response-input"
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form?.phone?.value}
            onChange={inputHandler}
         />
         {form?.phone?.error && (
            <Error margin="8px 0 1rem 0">{form?.phone?.error}</Error>
         )}
      </Wrapper>
   )
}
