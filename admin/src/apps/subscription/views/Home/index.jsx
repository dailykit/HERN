import React from 'react'
import { DashboardTile, Text, Flex } from '@dailykit/ui'

import { StyledHome, StyledCardList } from './styled'
import { Banner, Tooltip } from '../../../../shared/components'
import { useTabs } from '../../../../shared/providers'
import { useSubscription } from '@apollo/react-hooks'
import { TITLES } from '../../graphql'
import { AddOnMenuSvg, MenuSvg, SubscriptionOccurencesSvg, SubscriptionsSvg } from '../../../../shared/assets/illustrationTileSvg'

export const Home = () => {
   const { addTab } = useTabs()
   const {
      data: { titles = [] } = {},
   } = useSubscription(TITLES)
   return (
      <StyledHome>
         <Banner id="subscription-app-home-top" />
         <Flex container alignItems="center">
            <h1>Subscription App</h1>
            <Tooltip identifier="app_subscription_heading" />
         </Flex>
         <StyledCardList>
            <DashboardTile
               title="Menu"
               count="0"
               conf=""
               onClick={() => addTab('Menu', '/subscription/menu')}
               tileSvg={<MenuSvg />}
            />
            <DashboardTile
               title="Subscriptions"
               count={titles ? titles.length : "..."}
               conf=""
               onClick={() =>
                  addTab('Subscriptions', '/subscription/subscriptions')
               }
               tileSvg={<SubscriptionsSvg />}
            />
            <DashboardTile
               title="Add On Menu"
               count="0"
               conf=""
               onClick={() => addTab('Add On Menu', '/subscription/addon-menu')}
               tileSvg={<AddOnMenuSvg />}
            />
            <DashboardTile
               title="Subscription Occurrences"
               count="0"
               conf=""
               onClick={() =>
                  addTab(
                     'Subs. Occurrences',
                     '/subscription/subscription-occurrences'
                  )
               }
               tileSvg={<SubscriptionOccurencesSvg />}
            />
         </StyledCardList>
         <Banner id="subscription-app-home-bottom" />
      </StyledHome>
   )
}
