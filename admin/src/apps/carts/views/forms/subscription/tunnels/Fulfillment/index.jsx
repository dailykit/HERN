import React from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import styled, { css } from 'styled-components'
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
   HorizontalTab as Tab,
   HorizontalTabs as Tabs,
   HorizontalTabList as TabList,
   HorizontalTabPanel as TabPanel,
   HorizontalTabPanels as TabPanels,
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
   AddressTunnel,
} from '../../../../../../../shared/components'
import { isEmpty } from 'lodash'

export const FulfillmentTunnel = ({ panel }) => {
   const [tunnels] = panel
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="md">
            <Content panel={panel} />
         </Tunnel>
      </Tunnels>
   )
}

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

const Content = ({ panel }) => {
   const params = useParams()
   const [, , closeTunnel] = panel
   const [address, setAddress] = React.useState(null)
   const [tabIndex, setTabIndex] = React.useState(0)
   const [pickupDetails, setPickupDetails] = React.useState({})
   const { customer, subscriptionOccurence } = useManual()
   const [addTunnels, openAddTunnel, closeAddTunnel] = useTunnel(1)
   const { loading: loadingZipcodes, data: { zipcodes = [] } = {} } = useQuery(
      QUERIES.SUBSCRIPTION.ZIPCODE.LIST,
      {
         variables: {
            where: { subscriptionId: { _eq: customer?.subscriptionId } },
         },
      }
   )
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

   const fallsInZipcodes = React.useCallback(
      zipcode => zipcodes.findIndex(node => zipcode === node.zipcode) !== -1,
      [zipcodes]
   )

   const setFulfillment = () => {
      let fulfillmentInfo = {}
      let mode = tabIndex === 0 ? 'PREORDER_DELIVERY' : 'PREORDER_PICKUP'
      const fulfillmentDate = subscriptionOccurence?.fulfillmentDate
      const addressIndex = addresses.findIndex(
         node => node.id === customer.subscriptionAddressId
      )
      if (addressIndex === -1) {
         toast.warn('Please add an address to begin with.')
         return
      }
      const defaultAddress = addresses[addressIndex]
      const zipcodeIndex = zipcodes.findIndex(
         node => node.zipcode === defaultAddress?.zipcode
      )

      if (zipcodeIndex === -1) {
         toast.warn(
            "There's no delivery/pickup available for the selected address."
         )
         return
      }

      const zipcode = zipcodes[zipcodeIndex]

      if (mode === 'PREORDER_DELIVERY') {
         const { from = '', to = '' } = zipcode?.deliveryTime
         if (from && to) {
            fulfillmentInfo = {
               type: mode,
               slot: {
                  from: evalTime(fulfillmentDate, from),
                  to: evalTime(fulfillmentDate, to),
               },
            }
         }
      } else if (mode === 'PREORDER_PICKUP') {
         const { from = '', to = '' } = zipcode?.pickupOption?.time
         if (from && to) {
            fulfillmentInfo = {
               type: mode,
               slot: {
                  from: evalTime(fulfillmentDate, from),
                  to: evalTime(fulfillmentDate, to),
               },
               address: zipcode?.pickupOption?.address,
            }
         }
      }

      update({
         variables: {
            id: params.id,
            _set: {
               ...(mode === 'PREORDER_DELIVERY'
                  ? { address }
                  : { address: defaultAddress }),
               fulfillmentInfo,
            },
         },
      })
   }

   React.useEffect(() => {
      if (!loadingZipcodes && !isEmpty(zipcodes)) {
         const fulfillmentDate = subscriptionOccurence?.fulfillmentDate
         const addressIndex = addresses.findIndex(
            node => node.id === customer.subscriptionAddressId
         )
         if (addressIndex !== -1) {
            const defaultAddress = addresses[addressIndex]
            const zipcodeIndex = zipcodes.findIndex(
               node => node.zipcode === defaultAddress?.zipcode
            )
            if (zipcodeIndex !== -1) {
               const zipcode = zipcodes[zipcodeIndex]
               const address = parseAddress(zipcode?.pickupOption?.address)
               const time = zipcode?.pickupOption?.time
               setPickupDetails({
                  time,
                  address,
               })
            }
         }
      }
   }, [loadingZipcodes, zipcodes])

   return (
      <>
         <TunnelHeader
            title="Select Fulfillment"
            close={() => closeTunnel(1)}
            right={{
               title: 'Save',
               isLoading: updatingCart,
               action: setFulfillment,
               disabled: tabIndex === 0 ? !address?.id : false,
            }}
         />
         <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
            <Tabs index={tabIndex} onChange={setTabIndex}>
               <TabList>
                  <Tab>Delivery</Tab>
                  <Tab>Pick Up</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel>
                     <ButtonTile
                        noIcon
                        type="secondary"
                        text="Add Address"
                        onClick={() => openAddTunnel(1)}
                     />
                     <Spacer size="16px" />
                     {loading || loadingZipcodes ? (
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
                                 {addresses.map(node => {
                                    const isAvailable = fallsInZipcodes(
                                       node.zipcode
                                    )
                                    const parsedAddress = parseAddress(node)
                                    const isSelected = node.id === address?.id
                                    return (
                                       <Styles.Address
                                          key={node.id}
                                          isAvailable={isAvailable}
                                          className={isSelected ? 'active' : ''}
                                          onClick={() =>
                                             isAvailable && setAddress(node)
                                          }
                                          title={
                                             isAvailable
                                                ? parsedAddress
                                                : 'This address is not deliverable on the customers selected plan.'
                                          }
                                       >
                                          <Text as="p">{parsedAddress}</Text>
                                       </Styles.Address>
                                    )
                                 })}
                              </ul>
                           )}
                        </>
                     )}
                  </TabPanel>
                  <TabPanel>
                     <Text as="text1">Address</Text>
                     <Spacer size="8px" />
                     <Text as="p">{pickupDetails?.address || 'N/A'}</Text>
                     <Spacer size="16px" />
                     <Text as="text1">Time</Text>
                     <Spacer size="8px" />
                     {pickupDetails?.time?.from && pickupDetails?.time?.to ? (
                        <Text as="p">
                           On{' '}
                           {moment(
                              subscriptionOccurence?.fulfillmentDate
                           ).format('MMM D')}{' '}
                           in between {pickupDetails?.time?.from} -{' '}
                           {pickupDetails?.time?.to}
                        </Text>
                     ) : (
                        <Text as="p">N/A</Text>
                     )}
                  </TabPanel>
               </TabPanels>
            </Tabs>
         </Flex>
         <AddressTunnel
            tunnels={addTunnels}
            onSave={() => refetch()}
            closeTunnel={closeAddTunnel}
            keycloakId={customer?.keycloakId}
         />
      </>
   )
}

const Styles = {
   Address: styled.li(
      ({ isAvailable }) => css`
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
         ${!isAvailable &&
         css`
            opacity: 0.5;
            cursor: not-allowed;
         `}
      `
   ),
}
