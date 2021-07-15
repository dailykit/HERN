import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { FlexContainer } from '../../../views/Forms/styled'
import { BalanceCard } from './styled'

export default function StripeBalance({
   availableBalance,
   checked,
   setChecked,
}) {
   const totalBalance = availableBalance.reduce(
      (acc, curr) => acc + curr.amount,
      0
   )

   return (
      <BalanceCard selectable={totalBalance} onClick={setChecked}>
         <FlexContainer>
            {totalBalance ? (
               <Checkbox checked={checked} onChange={() => {}} />
            ) : null}
            <span style={{ width: '14px' }} />
            <h1>Payout Balance</h1>
         </FlexContainer>
         <div>
            <span style={{ fontSize: '14px', fontStyle: 'italic' }}>
               Available
            </span>
            <h1 style={{ color: '#53C22B' }}>$ {totalBalance / 100}</h1>
         </div>
      </BalanceCard>
   )
}
