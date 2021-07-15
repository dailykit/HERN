import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import {
   PaymentCard,
   BillingAddress,
   CardInfo,
   CardInfo2,
   SmallText,
} from './styled'
import { MaestroIcon } from '../../../../shared/assets/icons'
import { capitalizeString } from '../../Utils'
import { Tooltip } from '../../../../shared/components'

const ContactInfoCard = ({
   bgColor,
   margin,
   smallText,
   defaultTag,
   onClick,
   linkedTo,
   cardData,
   billingAddDisplay,
   identifier,
}) => {
   console.log('🚀 ~ file: index.js ~ line 25 ~ cardData', cardData)
   return (
      <PaymentCard bgColor={bgColor} margin={margin}>
         <CardInfo2>
            <Flex container alignItems="center">
               <Text as="p">Payment Card {defaultTag}</Text>
               <Tooltip identifier={identifier} />
            </Flex>
         </CardInfo2>
         <CardInfo>
            <MaestroIcon size="25" />
            <Text as="p">
               &nbsp;&nbsp;{capitalizeString(cardData?.brand || 'N/A')}
            </Text>
         </CardInfo>
         <CardInfo>
            <Text as="p">{`XXXX XXXX XXXX ${cardData?.last4 || 'N/A'}`}</Text>
         </CardInfo>

         <CardInfo2>
            <Text as="p" className="date">
               {`${cardData?.expMonth || 'N'}/${cardData?.expYear || 'A'}`}
            </Text>
            <SmallText onClick={onClick}>{linkedTo}</SmallText>
            {smallText && <SmallText onClick={onClick}>{smallText}</SmallText>}
         </CardInfo2>
         <BillingAddress display={billingAddDisplay}>
            <Text as="p">Billing Address</Text>
            <Text as="p">N/A</Text>
         </BillingAddress>
      </PaymentCard>
   )
}
export default ContactInfoCard
