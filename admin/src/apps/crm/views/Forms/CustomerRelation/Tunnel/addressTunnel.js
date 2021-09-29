import React, { useContext } from 'react'
import {
   Flex,
   Tunnels,
   Tunnel,
   TunnelHeader,
   Text,
   IconButton,
   useTunnel,
} from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { ALL_DATA } from '../../../../graphql'
import { TunnelHeaderContainer, CustomerAddress } from './styled'
import { logger, parseAddress } from '../../../../../../shared/utils'
import { toast } from 'react-toastify'
import BrandContext from '../../../../context/Brand'
import { EditIcon } from '../../../../../../shared/assets/icons'
import {
   Tooltip,
   InlineLoader,
   AddressTunnel as EditAddress,
   Banner,
} from '../../../../../../shared/components'

const AddressTunnel = ({ id, tunnels, closeTunnel }) => {
   const [context, setContext] = useContext(BrandContext)
   const [address, setAddress] = React.useState(null)
   const [editTunnels, openEditTunnel, closeEditTunnel] = useTunnel(1)
   const {
      loading: listLoading,
      data: { brand: { brand_customers = [] } = {} } = {},
   } = useQuery(ALL_DATA, {
      variables: {
         keycloakId: id,
         brandId: context.brandId,
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   if (listLoading) return <InlineLoader />

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <TunnelHeader
                  title={`Address Cards(${
                     brand_customers[0]?.customer?.platform_customer
                        ?.customerAddresses?.length || 0
                  })`}
                  close={() => closeTunnel(1)}
                  tooltip={
                     <Tooltip identifier="customer_address_list_tunnelHeader" />
                  }
               />
               <Banner id="crm-app-customers-customer-details-address-tunnel-top" />
               <TunnelHeaderContainer>
                  {brand_customers[0]?.customer?.platform_customer?.customerAddresses?.map(
                     address => {
                        return (
                           <CustomerAddress key={address.id}>
                              <Flex>
                                 <Text as="subtitle">Delivery Address</Text>
                                 <Text as="text1">
                                    {parseAddress(address || {})}
                                 </Text>
                              </Flex>
                              <IconButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setAddress(address)
                                    openEditTunnel(1)
                                 }}
                              >
                                 <EditIcon />
                              </IconButton>
                           </CustomerAddress>
                        )
                     }
                  )}
               </TunnelHeaderContainer>
               <Banner id="crm-app-customers-customer-details-address-tunnel-bottom" />
            </Tunnel>
         </Tunnels>
         <EditAddress
            address={address}
            tunnels={editTunnels}
            closeTunnel={closeEditTunnel}
            onSave={() => setAddress(null)}
         />
      </>
   )
}

export default AddressTunnel
