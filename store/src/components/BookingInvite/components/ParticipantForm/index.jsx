import React, { useState, useEffect, useMemo } from 'react'
import { Wrapper } from './styles'
import AddressForm from '../../../AddressForm'
import Error from '../../../Error'
import Input from '../../../Input'

export default function ParticipantForm({
   defaultAddress = null,
   form,
   onChange,
   isValidFunc
}) {
   const filteredAddress = useMemo(() => {
      if (defaultAddress) {
         const { id, _typename, ...rest } = defaultAddress
         return rest
      } else {
         return defaultAddress
      }
   }, [defaultAddress])

   return (
      <Wrapper>
         {/* <h1 className="edit-tunnel-header text2">Edit Participant Details</h1> */}
         <div className="main_container">
            <p className="input-label text8">Email*</p>
            <Input
               name="email"
               type="email"
               placeholder="Enter email"
               className="address-form-input"
               value={form.email.value}
               onChange={onChange}
               required
            />
            {form.email.error && (
               <Error margin="0 0 16px 0">{form.email.error}</Error>
            )}
            <p className="input-label text8">Phone*</p>
            <Input
               name="phone"
               type="text"
               placeholder="Enter phone number"
               className="address-form-input"
               value={form.phone.value}
               onChange={onChange}
               required
            />
            {form.phone.error && (
               <Error margin="0 0 16px 0">{form.phone.error}</Error>
            )}
            <p className="input-label text8">Address</p>
            <AddressForm
               defaultMutation={false}
               defaultActionButton={false}
               defaultAddress={filteredAddress}
               isValidFunc={isValidFunc}
               onChange={address => onChange('address', address)}
            />
         </div>
      </Wrapper>
   )
}
