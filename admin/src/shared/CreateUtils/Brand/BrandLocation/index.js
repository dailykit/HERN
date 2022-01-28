import { TunnelHeader } from '@dailykit/ui'
import React from 'react'

const CreateBrandLocation = ({ closeTunnel }) => {
   const close = () => {
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader title="Add Location" close={close} />
      </>
   )
}

export default CreateBrandLocation
