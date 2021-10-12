import React from 'react'
import { v4 as uuid } from 'uuid'
import { toast } from 'react-toastify'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { Text, ComboButton, PlusIcon, Flex, IconButton, useTunnel, Tunnel, Tunnels } from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'

import options from '../../../tableOption'
import { logger } from '../../../../../shared/utils'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { TITLES, UPSERT_SUBSCRIPTION_TITLE } from '../../../graphql'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
   InsightDashboard,
} from '../../../../../shared/components'
import { ResponsiveFlex } from '../../../../../shared/components/ResponsiveFlex'
import { PublishIcon, UnPublishIcon } from '../../../assets/icons'
import CreateSubscription from '../../../../../shared/CreateUtils/subscription/createSubscriptions'

export const Subscriptions = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
   const [subscriptionTunnels, openSubscriptionTunnel, closeSubscriptionTunnel] = useTunnel(1)
   const {
      error,
      loading,
      data: { titles = [] } = {},
   } = useSubscription(TITLES)
   const [upsertTitle] = useMutation(UPSERT_SUBSCRIPTION_TITLE, {
      onCompleted: ({ upsertSubscriptionTitle = {} }) => {
         const { id, title } = upsertSubscriptionTitle
         addTab(title, `/subscription/subscriptions/${id}`)
         toast.success('Sucessfully created a subscription!')
      },
      onError: error => {
         toast.error('Failed to create a subscription!')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab) {
         addTab('Subscriptions', '/subscription/subscriptions')
      }
   }, [addTab, tab])

   if (!loading && error) {
      toast.error('Failed to fetch list of subscriptions!')
      logger(error)
      return (
         <ErrorState message="Failed to fetch the list of subscriptions, please refresh the page!" />
      )
   }

   const columns = [
      {
         title: 'Title',
         field: 'title',
         width: 350,
         cssClass: 'cell',
         headerFilter: true,
         headerFilterPlaceholder: 'Search titles...',
         headerTooltip: column => {
            const identifier = 'listing_subscription_column_title'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Demo',
         field: 'isDemo',
         formatter: reactFormatter(<DemoName />),
         headerTooltip: column => {
            const identifier = 'listing_subscription_column_isDemo'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   const rowClick = (e, row) => {
      e.preventDefault()
      addTab(
         row.getData().title,
         `/subscription/subscriptions/${row.getData().id}`
      )
   }

   const createTab = () => {
      const hash = `form-${uuid().split('-')[0]}`
      upsertTitle({
         variables: {
            object: {
               title: hash,
            },
         },
      })
   }

   return (
      <ResponsiveFlex maxWidth="1280px" margin="0 auto">
         <Banner id="subscription-app-subscriptions-listing-top" />
         <Tunnels tunnels={subscriptionTunnels}>
            <Tunnel layer={1} size="md">
               <CreateSubscription closeTunnel={closeSubscriptionTunnel} />
            </Tunnel>
         </Tunnels>
         <Flex
            container
            as="header"
            height="80px"
            alignItems="center"
            justifyContent="space-between"
            style={{ padding: '0px 7px' }}
         >
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0px' }}>
                  Subscriptions({titles.length})
               </Text>
               <Tooltip identifier="listing_subscription_heading" />
            </Flex>
            <ComboButton type="solid" onClick={() => openSubscriptionTunnel(1)}>
               <PlusIcon color="#fff" size={24} />
               Create Subscription
            </ComboButton>
         </Flex>
         {loading && <InlineLoader />}
         {!loading && (
            <ReactTabulator
               data={titles}
               ref={tableRef}
               columns={columns}
               rowClick={rowClick}
               options={{ ...options, layout: 'fitColumns', maxHeight: 480 }}
               style={{ padding: '0px 7px' }}
            />
         )}

         <InsightDashboard
            appTitle="Subscription App"
            moduleTitle="Subcription Listing"
            showInTunnel={false}
         />
         <Banner id="subscription-app-subscriptions-listing-bottom" />
      </ResponsiveFlex>
   )
}
function DemoName({ cell, addTab }) {
   const data = cell.getData()
   return (
      <>
         <IconButton type="ghost">
            {data.isDemo ? <PublishIcon /> : <UnPublishIcon />}
         </IconButton>
      </>
   )
}
