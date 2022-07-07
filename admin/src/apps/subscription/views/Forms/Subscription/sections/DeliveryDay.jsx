import React from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Tag,
   Flex,
   Form,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   IconButton,
   TunnelHeader,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'

import Customers from './Customers'
import Occurences from './Occurences'
import DeliveryAreas from './DeliveryAreas'
import { logger } from '../../../../../../shared/utils'
import { EditIcon } from '../../../../../../shared/assets/icons'
import { UPDATE_SUBSCRIPTION, SUBSCRIPTION } from '../../../../graphql'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   ErrorBoundary,
   Banner,
} from '../../../../../../shared/components'

const DeliveryDay = ({ id }) => {
   const [endDate, setEndDate] = React.useState('')
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [areasTotal, setAreasTotal] = React.useState(0)
   const [customersTotal, setCustomersTotal] = React.useState(0)
   const [occurencesTotal, setOccurencesTotal] = React.useState(0)
   const {
      error,
      loading,
      data: { subscription = {} } = {},
   } = useSubscription(SUBSCRIPTION, {
      variables: {
         id,
      },
   })

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch the list of delivery days!')
      logger(error)
      return <ErrorState message="Failed to fetch the list of delivery days!" />
   }
   return (
      <>
         <Flex
            container
            as="header"
            height="48px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex as="section" container alignItems="center">
               <Text as="title">Subscription</Text>
               <Tooltip identifier="form_subscription_section_delivery_day_heading" />
               {subscription?.isDemo && <Tag>Demo</Tag>}
            </Flex>
            <IconButton size="sm" type="outline" onClick={() => openTunnel(1)}>
               <EditIcon />
            </IconButton>
         </Flex>
         <Text as="subtitle">
            Ends on - {moment(subscription?.endDate).format('MMM DD, YYYY')}
         </Text>
         <HorizontalTabs id="subscriptionTabs">
            <HorizontalTabList>
               <HorizontalTab>Occurences ({occurencesTotal})</HorizontalTab>
               <HorizontalTab>Delivery Areas ({areasTotal})</HorizontalTab>
               <HorizontalTab>Customers ({customersTotal})</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels id="subscriptionTabPanels">
               <HorizontalTabPanel>
                  <Occurences
                     id={subscription?.id}
                     setOccurencesTotal={setOccurencesTotal}
                  />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <DeliveryAreas
                     id={subscription?.id}
                     setAreasTotal={setAreasTotal}
                  />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Customers
                     id={subscription?.id}
                     setCustomersTotal={setCustomersTotal}
                  />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
         <Banner id="subscription-app-subscription-details-servings-subscription-listing-bottom" />
         <ErrorBoundary rootRoute="/subscription/subscriptions">
            <Tunnels tunnels={tunnels}>
               <Tunnel layer="1">
                  <EditSubscriptionTunnel
                     id={subscription?.id}
                     closeTunnel={closeTunnel}
                     lastFulifillmentDate={subscription?.subscriptionOccurences?.[0]?.fulfillmentDate}
                  />
               </Tunnel>
            </Tunnels>
         </ErrorBoundary>
      </>
   )
}

export default DeliveryDay

const EditSubscriptionTunnel = ({ id, closeTunnel, lastFulifillmentDate }) => {
   const [endDate, setEndDate] = React.useState('')
   const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION, {
      onCompleted: () => {
         closeTunnel(1)
      },
      onError: error => {
         console.log(error)
      },
   })

   const close = () => {
      closeTunnel(1)
      setEndDate(null)
   }
   const save = () => {
      if (endDate < lastFulifillmentDate){
         toast.error('selected date is less than last fulfillment date')
      }
      else{
      updateSubscription({
         variables: {
            id,
            _set: {
               endDate,
            },
         },
      })
   }
   }
   return (
      <>
         <TunnelHeader
            title="Edit Subscription"
            close={() => close()}
            right={{
               title: 'Save',
               disabled: !endDate,
               action: () => save(),
            }}
            tooltip={
               <Tooltip identifier="form_subscription_tunnel_subscription_field_date" />
            }
         />
         <Banner id="subscription-app-create-subscription-edit-subscription-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label htmlFor="endDate" title="endDate">
                  <Flex container alignItems="center">
                     End Date*
                     <Tooltip identifier="form_subscription_tunnel_edit_subscription_field_end_date" />
                  </Flex>
               </Form.Label>
               <Form.Date
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
               />
            </Form.Group>
         </Flex>
         <Banner id="subscription-app-create-subscription-edit-subscription-tunnel-bottom" />
      </>
   )
}
