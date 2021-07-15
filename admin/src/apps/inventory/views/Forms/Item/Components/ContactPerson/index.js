import { Avatar, TextButton } from '@dailykit/ui'
import { EditIcon } from '../../../../../../../shared/assets/icons'
import { TransparentIconButton } from '../../styled'
import React from 'react'

export default function ContactPerson({ formState, open }) {
   if (!formState.supplier)
      return (
         <TextButton type="outline" onClick={() => open(1)}>
            Add Supplier
         </TextButton>
      )

   return (
      <>
         <span>{formState.supplier.name}</span>
         {formState.supplier?.contactPerson?.firstName ? (
            <Avatar
               withName
               title={`${formState.supplier?.contactPerson.firstName} ${
                  formState.supplier?.contactPerson?.lastName || ''
               }`}
            />
         ) : null}
         <TransparentIconButton type="outline" onClick={() => open(1)}>
            <EditIcon size="18" color="#555B6E" />
         </TransparentIconButton>
      </>
   )
}
