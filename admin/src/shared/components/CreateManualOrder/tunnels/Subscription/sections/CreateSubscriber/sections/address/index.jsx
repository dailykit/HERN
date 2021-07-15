import React from 'react'
import styled from 'styled-components'
import { Spacer, Text, Filler, Flex, IconButton, useTunnel } from '@dailykit/ui'

import { useSub } from '../../state'
import { useManual } from '../../../../../../state'
import { get_env, parseAddress } from '../../../../../../../../utils'
import * as Icon from '../../../../../../../../assets/icons'
import { AddressTunnel } from '../../../../../../../Address'
import EmptyIllo from '../../../../../../../../assets/illustrations/EmptyIllo'

export const SelectAddress = () => {
   const { customer } = useManual()
   const { itemCount, address, dispatch } = useSub()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   if (!itemCount.selected?.id)
      return (
         <>
            <Text as="text1">Select Address</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="Please select an item count to continue!"
            />
         </>
      )
   return (
      <>
         <Text as="text1">Select Address</Text>
         <Spacer size="8px" />
         <Styles.Card>
            <Header title="Address" onEdit={() => openTunnel(1)} />
            <Flex as="main" padding="0 8px 8px 8px">
               {address.selected ? (
                  <Text as="subtitle">{parseAddress(address.selected)}</Text>
               ) : (
                  <Filler
                     height="100px"
                     illustration={<EmptyIllo width="120px" />}
                     message="Please select an address to continue!"
                  />
               )}
            </Flex>
         </Styles.Card>
         <AddressTunnel
            tunnels={tunnels}
            closeTunnel={closeTunnel}
            keycloakId={customer.keycloakId}
            clientId={get_env('REACT_APP_KEYCLOAK_REALM') + '-subscription'}
            onSave={address =>
               dispatch({ type: 'SET_ADDRESS', payload: address })
            }
         />
      </>
   )
}

const Header = ({ title = '', onEdit = null }) => {
   return (
      <Flex
         container
         as="header"
         height="36px"
         padding="0 8px"
         alignItems="center"
         justifyContent="space-between"
      >
         <Text as="text2">{title}</Text>
         {onEdit && (
            <IconButton type="ghost" size="sm" onClick={onEdit}>
               <Icon.EditIcon size="12px" />
            </IconButton>
         )}
      </Flex>
   )
}

const Styles = {
   Card: styled.div`
      border-radius: 2px;
      background: #ffffff;
      border: 1px solid #ebebeb;
      > header {
         button {
            width: 28px;
            height: 28px;
         }
      }
   `,
   Filler: styled(Filler)`
      p {
         font-size: 14px;
         text-align: center;
      }
   `,
}
