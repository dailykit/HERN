import React from 'react'
import { Spacer, Text, TextButton } from '@dailykit/ui'

export default function DataCard({ title, quantity, actionText, action }) {
   return (
      <div
         style={{
            margin: '4px 16px',
            border: '1px solid #f3f3f3',
            padding: '16px',
            borderRadius: '4px',
            minWidth: '120px',
            height: '100%',
         }}
      >
         <Text as="title">{title}</Text>

         <Text as="h2">{quantity}</Text>
         {actionText && (
            <>
               <Spacer size="8px" />
               <hr style={{ border: '1px solid #f3f3f3' }} />
               <Spacer size="8px" />
               <TextButton
                  onClick={action}
                  style={{ color: '#00A7E1' }}
                  type="ghost"
               >
                  {actionText}
               </TextButton>
            </>
         )}
      </div>
   )
}
