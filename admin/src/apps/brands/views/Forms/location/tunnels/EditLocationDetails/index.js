import { TunnelHeader } from '@dailykit/ui'
import React from 'react'

const EditLocationDetails = ({ state, locationId, close }) => {
   return (
      <TunnelHeader
         title="Edit Store Location"
         right={{
            title: 'Save',
            action: () => console.log('Save Clicked'),
         }}
         close={() => close(1)}
         nextAction="Done"
      />
   )
}

export default EditLocationDetails
