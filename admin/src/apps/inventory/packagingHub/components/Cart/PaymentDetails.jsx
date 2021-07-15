import React from 'react'
import { TextButton } from '@dailykit/ui'

import { FlexContainer } from '../../../views/Forms/styled'

export default function PaymentDetails({ chargeAmount, handlePayment }) {
   return (
      <div>
         <FlexContainer
            style={{
               padding: '20px 28px',
               backgroundColor: '#F3F3F3',
               justifyContent: 'space-between',
               marginTop: '20px',
            }}
         >
            <p>Total Payable:</p>
            <p>$ {chargeAmount}</p>
         </FlexContainer>
         <TextButton
            style={{ width: '100%' }}
            type="solid"
            onClick={handlePayment}
         >
            Confirm and Pay
         </TextButton>
      </div>
   )
}
