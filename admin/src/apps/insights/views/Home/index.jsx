import React from 'react'
import { Text, DashboardTile } from '@dailykit/ui'

import { useTabs } from '../../../../shared/providers'
import { StyledHome, StyledCardList, StyledHeader } from './styled'
import { Banner } from '../../../../shared/components'

const Home = () => {
   const { addTab } = useTabs()

   return (
      <StyledHome>
         <Banner id="insights-app-home-top" />
         <StyledHeader>
            <Text as="h1">Insights</Text>
         </StyledHeader>

         <StyledCardList>
            <DashboardTile
               title="Recipe Insights"
               count={22}
               onClick={() => addTab('Recipe Insights', '/insights/recipe')}
            />
         </StyledCardList>
         <Banner id="insights-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
