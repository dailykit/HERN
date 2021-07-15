import React from 'react'
import { TunnelHeader } from '@dailykit/ui'
const ApplyFilterTunnel = ({ close }) => {
   return (
      <>
         <TunnelHeader
            title="Apply Filter"
            right={{
               action: () => console.log('tunnel filter'),
               title: 'Done',
            }}
            close={() => close(2)}
         />
      </>
   )
}
export default ApplyFilterTunnel
