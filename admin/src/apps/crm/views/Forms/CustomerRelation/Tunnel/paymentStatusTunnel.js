import React, { useContext } from 'react'
import { Tunnels, Tunnel, TunnelHeader, Text } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { STATUS } from '../../../../graphql'
import { TunnelHeaderContainer, StyledDiv } from './styled'
import { logger } from '../../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import { useTabs } from '../../../../../../shared/providers'
import { toast } from 'react-toastify'
import BrandContext from '../../../../context/Brand'

const PaymentStatus = ({ tunnels, closeTunnel }) => {
   const [context, setContext] = useContext(BrandContext)
   const { tab } = useTabs()
   const {
      loading: listLoading,
      data: { brand: { brand_Orders: statusData = [] } = {} } = {},
   } = useQuery(STATUS, {
      variables: {
         oid: tab.data.oid,
         brandId: context.brandId,
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   if (listLoading) return <InlineLoader />
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1}>
            <TunnelHeader
               title="Payment Status"
               close={() => closeTunnel(1)}
               tooltip={
                  <Tooltip identifier="customer_payment_status_tunnelHeader" />
               }
            />
            <Banner id="crm-app-customers-customer-details-payment-status-tunnel-top" />
            <TunnelHeaderContainer>
               <StyledDiv>
                  <Text as="h2">
                     {`Transaction Id: ${
                        statusData[0]?.cart?.transactionId || 'N/A'
                     }`}
                  </Text>
               </StyledDiv>
               <StyledDiv>
                  <Text as="h2">
                     {`Status: ${statusData[0]?.cart?.paymentStatus || 'N/A'}`}
                  </Text>
               </StyledDiv>
            </TunnelHeaderContainer>
            <Banner id="crm-app-customers-customer-details-payment-status-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

export default PaymentStatus
