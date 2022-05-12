import React, { useContext } from 'react'
import { Tunnels, Tunnel, TunnelHeader, Text } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { STATUS } from '../../../../graphql'
import { TunnelHeaderContainer, StyledDiv } from './styled'
import { logger } from '../../../../../../shared/utils'
import {
   Banner,
   Tooltip,
   InlineLoader,
} from '../../../../../../shared/components'
import { useTabs } from '../../../../../../shared/providers'
import { BrandContext } from '../../../../../../App'
import { useParams } from 'react-router-dom'
// import BrandContext from '../../../../context/Brand'

const OrderStatus = ({ tunnels, closeTunnel }) => {
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const params = useParams()

   const { tab } = useTabs()
   const {
      loading: listLoading,
      data: { brand: { brand_Orders: statusData = [] } = {} } = {},
   } = useQuery(STATUS, {
      variables: {
         oid: tab.data.oid,
         brandId: params.brandId,
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
               title="Order Status"
               close={() => closeTunnel(1)}
               tooltip={
                  <Tooltip identifier="customer_order_status_tunnelHeader" />
               }
            />
            <Banner id="crm-app-customers-customer-details-order-status-tunnel-top" />

            <TunnelHeaderContainer>
               <StyledDiv>
                  <Text as="h2">
                     {`Order Id: ${statusData[0]?.id || 'N/A'}`}
                  </Text>
               </StyledDiv>
               <StyledDiv>
                  <Text as="h2">
                     {`Status: ${statusData[0]?.cart?.status || 'N/A'}`}
                  </Text>
               </StyledDiv>
            </TunnelHeaderContainer>
            <Banner id="crm-app-customers-customer-details-order-status-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

export default OrderStatus
