import React from 'react'
import { Text, Avatar, Form, Flex, TextButton } from '@dailykit/ui'
import {
   StyledCustomerCard,
   CustomerInfo,
   CustomerWallet,
   StyledDiv,
} from './styled'
import { capitalizeString } from '../../Utils'
import { Tooltip } from '../../../../shared/components'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { IMPERSONATE_USER_TOKEN } from '../../graphql/mutations'
import { logger, get_env } from '../../../../shared/utils'

const CustomerCard = ({
   brand,
   customer,
   walletAmount,
   toggle,
   toggleHandler,
}) => {
   const [impersonateUser, { loading }] = useMutation(IMPERSONATE_USER_TOKEN, {
      onCompleted: data => {
         const { token } = data.impersonateUser
         // window.open(
         //    `http://localhost:8000/subscription?imp-token=${token}`,
         //    '_blank'
         // )
         window.open(
            `https://${brand.domain}/subscription?imp-token=${token}`,
            '_blank'
         )
      },
      onError: error => {
         logger(error)
         toast.error('Something went wrong!')
      },
   })

   const impersonate = () => {
      const typedEmail = window.prompt(
         `We hope you know what you're about to do.\n\nType customer's email to confirm!`
      )
      if (typedEmail === customer?.email) {
         impersonateUser({
            variables: {
               keycloakId: customer?.keycloakId,
               clientId: get_env('REACT_APP_SUBSCRIPTION_CLIENT_ID'),
            },
         })
      } else {
         toast.error('Incorrect email!')
      }
   }

   return (
      <StyledCustomerCard>
         <CustomerInfo>
            <Avatar url="https://randomuser.me/api/portraits/girl/61.jpg" />
            <Text as="p">{`${customer?.platform_customer?.firstName || ''} ${
               customer?.platform_customer?.lastName || 'N/A'
            }`}</Text>
            <Flex container alignItems="center">
               <Text as="p">{capitalizeString(customer?.source || 'N/A')}</Text>
               <Tooltip identifier="source_info" />
            </Flex>
            <TextButton type="ghost" onClick={impersonate} isLoading={loading}>
               Impersonate Customer
            </TextButton>
         </CustomerInfo>
         <CustomerWallet>
            <Text as="p">Wallet amount</Text>
            <Text as="p">{walletAmount}</Text>
         </CustomerWallet>
         <StyledDiv>
            <Text as="p">Test Customer</Text>
            <Form.Group>
               <Form.Toggle
                  name="customer_isTest"
                  onChange={toggleHandler}
                  value={toggle}
               />
            </Form.Group>
         </StyledDiv>
      </StyledCustomerCard>
   )
}
export default CustomerCard
