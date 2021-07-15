import React from 'react'
import { Text, Flex } from '@dailykit/ui'
import {
   ContactCard,
   CustomerAddress,
   ContactInfo,
   StyledHeading,
   SmallText,
} from './styled'
import { MailIcon, PhoneIcon } from '../../../../shared/assets/icons'
import { concatAddress } from '../../Utils'
import { Tooltip } from '../../../../shared/components'

const ContactInfoCard = ({
   defaultTag1,
   onClick,
   defaultTag2,
   customerData,
}) => (
   <ContactCard>
      <StyledHeading>
         <Flex container alignItems="center">
            <Text as="p">Contact Details{defaultTag1}</Text>
            <Tooltip identifier="contact_info" />
         </Flex>
      </StyledHeading>
      <ContactInfo>
         <Text as="p">{customerData?.email || 'N/A'}</Text>
         <MailIcon color="#00a7e1" />
      </ContactInfo>
      <ContactInfo>
         <Text as="p">{customerData?.phoneNumber || 'N/A'}</Text>
         <PhoneIcon color="#00a7e1" />
      </ContactInfo>
      <CustomerAddress>
         <Text as="p">Delivery Address{defaultTag2}</Text>
         <Text as="p">
            {concatAddress(customerData?.defaultCustomerAddress || 'N/A')}
         </Text>
         <SmallText onClick={onClick}>view all address</SmallText>
      </CustomerAddress>
   </ContactCard>
)
export default ContactInfoCard
