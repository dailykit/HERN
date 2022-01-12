import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@apollo/react-hooks'
import { DashboardTile, Text, Flex, Spacer } from '@dailykit/ui'

import { QUERIES } from '../../graphql'
import { logger } from '../../../../shared/utils'
import { useTabs } from '../../../../shared/providers'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../shared/components'
import OrdersAccounts from '../Listing/OrdersAccounts'
import {
   OrdersSvg,
   PlannedSvg,
} from '../../../../shared/assets/illustrationTileSvg'
const address = 'apps.order.views.home.'
const Home = () => {
   const { t } = useTranslation()
   const { addTab } = useTabs()
   const { loading, error, data } = useSubscription(
      QUERIES.ORDERS.AGGREGATE.TOTAL
   )

   if (loading)
      return (
         <Flex>
            <InlineLoader />
         </Flex>
      )
   if (error) {
      toast.error('Failed to fetch total orders!')
      logger(error)
      return <ErrorState message="Failed to fetch total orders!" />
   }
   return (
      <Flex
         container
         padding="80px 32px"
         flexDirection="column"
         alignItems="flex-start"
         height="calc(100vh - 80px)"
      >
         <Banner id="order-app-home-top" />
         <Flex container alignItems="center" justifyContent="center">
            <Text as="h1">{t(address.concat('order app'))}</Text>
            <Tooltip identifier="app_order_home_heading" />
         </Flex>
         <Spacer size="32px" />
         <Flex as="section" container margin="0 auto" flexWrap="wrap">
            <DashboardTile
               title={t(address.concat('orders'))}
               conf="All available"
               count={data?.ordersAggregate?.aggregate?.count}
               onClick={() => addTab('Orders', '/order/orders')}
               tileSvg={<OrdersSvg />}
            />
            <Spacer size="16px" xAxis />
            <DashboardTile
               count={0}
               title="Planned"
               conf="All available"
               onClick={() => addTab('Planned', '/order/planned')}
               tileSvg={<PlannedSvg />}
            />
         </Flex>
         <Flex
            container
            width="100%"
            justifyContent="center"
            margin="10px 0px 10px 10px"
         >
            <OrdersAccounts />
         </Flex>
         <Banner id="order-app-home-bottom" />
      </Flex>
   )
}

export default Home
