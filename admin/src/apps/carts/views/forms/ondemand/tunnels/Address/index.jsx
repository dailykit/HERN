import React from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useParams } from 'react-router'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
   Text,
   Flex,
   Tunnel,
   Filler,
   Spacer,
   Tunnels,
   useTunnel,
   ButtonTile,
   TunnelHeader,
} from '@dailykit/ui'

import { useManual } from '../../state'
import { QUERIES, MUTATIONS } from '../../../../../graphql'
import EmptyIllo from '../../../../../assets/svgs/EmptyIllo'
import {
   logger,
   parseAddress,
   get_env,
} from '../../../../../../../shared/utils'
import {
   InlineLoader,
   AddressTunnel as AddTunnel,
} from '../../../../../../../shared/components'

export const AddressTunnel = ({ panel }) => {
   const [tunnels] = panel
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="md">
            <Content panel={panel} />
         </Tunnel>
      </Tunnels>
   )
}

const Content = ({ panel }) => {
   const params = useParams()
   const [, , closeTunnel] = panel
   const { customer } = useManual()
   const [address, setAddress] = React.useState(null)
   const [addTunnels, openAddTunnel, closeAddTunnel] = useTunnel(1)
   const [update, { loading: updatingCart }] = useMutation(
      MUTATIONS.CART.UPDATE,
      {
         onCompleted: () => {
            closeTunnel(1)
            toast.success('Successfully updated address.')
         },
         onError: error => {
            logger(error)
            toast.error('Failed to update the address.')
         },
      }
   )
   const {
      loading,
      data: { addresses = [] } = {},
      refetch,
   } = useQuery(QUERIES.CUSTOMER.ADDRESS.LIST, {
      skip: !customer?.id,
      variables: {
         where: {
            keycloakId: { _eq: customer.keycloakId },
         },
      },
      onError: () => {
         toast.error('Failed to load addresses, please try again.')
      },
   })
   return (
      <>
         <TunnelHeader
            title="Select Address"
            close={() => closeTunnel(1)}
            right={{
               title: 'Save',
               disabled: !address?.id,
               isLoading: updatingCart,
               action: () => {
                  update({
                     variables: { id: params.id, _set: { address } },
                  })
               },
            }}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            <ButtonTile
               noIcon
               type="secondary"
               text="Add Address"
               onClick={() => openAddTunnel(1)}
            />
            <Spacer size="16px" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {addresses.length === 0 ? (
                     <Filler
                        height="280px"
                        illustration={<EmptyIllo />}
                        message="No addressess linked to this customer yet!"
                     />
                  ) : (
                     <ul>
                        {addresses.map(node => (
                           <Styles.Address
                              key={node.id}
                              onClick={() => setAddress(node)}
                              className={
                                 node.id === address?.id ? 'active' : ''
                              }
                           >
                              <Text as="p">{parseAddress(node)}</Text>
                           </Styles.Address>
                        ))}
                     </ul>
                  )}
               </>
            )}
         </Flex>
         <AddTunnel
            tunnels={addTunnels}
            onSave={() => refetch()}
            closeTunnel={closeAddTunnel}
            keycloakId={customer?.keycloakId}
         />
      </>
   )
}

const Styles = {
   Address: styled.li`
      padding: 14px;
      list-style: none;
      border-radius: 2px;
      border: 1px solid #ebebeb;
      + li {
         margin-top: 14px;
      }
      &.active {
         border-color: #5d41db;
      }
   `,
}
