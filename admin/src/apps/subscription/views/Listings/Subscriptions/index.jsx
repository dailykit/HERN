import React from 'react'
import { v4 as uuid } from 'uuid'
import { toast } from 'react-toastify'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { Text, ComboButton, PlusIcon, Flex,
         Spacer,
         ButtonGroup, } from '@dailykit/ui'
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

export const Subscriptions = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
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
         headerFilter: true,
         headerFilterPlaceholder: 'Search titles...',
         headerTooltip: column => {
            const identifier = 'listing_subscription_column_title'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 400,
      },
      {
         width: 150,
         title: 'Demo',
         field: 'isDemo',
         headerFilter: false,
         formatter: 'tickCross',
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


         <Flex
            container
            height="80px"
            padding="32px 0 0 0"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex
               container
               as="header"
               width="25%"
               alignItems="center"
               justifyContent="space-between"
             >
               <Text as="h2">
                  Subscriptions({titles.length})
               </Text>
               <Tooltip identifier="listing_subscription_heading" />
            </Flex>           
            <Flex
                container
                as="header"
                width="30%"
                alignItems="center"
                 justifyContent="flex-end"
               >
           <ButtonGroup>
           <ComboButton type="solid" onClick={() => createTab()}>
               <PlusIcon />
               Create Subscription
            </ComboButton>
            </ButtonGroup>
               </Flex>
            </Flex>
         <Spacer size="30px" />

         {loading && <InlineLoader />}
         {!loading && (
            <ReactTabulator
               data={titles}
               ref={tableRef}
               columns={columns}
               rowClick={rowClick}
               options={{ ...options, layout: 'fitColumns', maxHeight: 480 }}
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
