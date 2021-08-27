import React from 'react'
import { Text, DashboardTile, Flex } from '@dailykit/ui'

import { useTabs } from '../../../../shared/providers'
import { StyledHome, StyledCardList, StyledHeader } from './styled'
import { Banner } from '../../../../shared/components'
import Main from '../../sections/Main'
import {
   AcceptedAndRejectedAnalytics,
   OrderReceivedAnalytics,
   RegisteredCustomerAnalytics,
   SubscribedCustomerAnalytics,
   TotalEarningAnalytics,
} from '../../../../shared/components/DashboardAnalytics/Analytics'
import DashboardAnalytics from '../../../../shared/components/DashboardAnalytics'
import ReferralPlansListing from '../RecipeInsight'

const Home = () => {
   const { addTab } = useTabs()

   return (
      <StyledHome>
         <Banner id="insights-app-home-top" />
         <StyledHeader>
            <Text as="h1">Insights</Text>
         </StyledHeader>

         {/* <StyledCardList>
            <DashboardTile
               title="Recipe Insights"
               count={22}
               onClick={() => addTab('Recipe Insights', '/insights/recipe')}
            />
         </StyledCardList> */}
         <Flex>
            <Flex padding="0px 42px">
               <Text as="h2">Dashboard</Text>
            </Flex>
            <DashboardAnalytics>
               <TotalEarningAnalytics />
               <OrderReceivedAnalytics />
               <AcceptedAndRejectedAnalytics />
               <SubscribedCustomerAnalytics />
               <RegisteredCustomerAnalytics />
            </DashboardAnalytics>
         </Flex>
         <ReferralPlansListing />
         <Banner id="insights-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
