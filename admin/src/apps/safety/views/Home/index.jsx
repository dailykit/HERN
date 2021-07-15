import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@apollo/react-hooks'

import { SAFETY_CHECKS_COUNT } from '../../graphql'
import { StyledCardList, StyledHome } from './styled'
import { useTabs } from '../../../../shared/providers'
import { Banner } from '../../../../shared/components'

const address = 'apps.safety.views.home.'

const Home = () => {
   const { t } = useTranslation()

   const { addTab } = useTabs()

   const {
      data: {
         safety_safetyCheck_aggregate: { aggregate: { count = 0 } = {} } = {},
      } = {},
      loading,
   } = useSubscription(SAFETY_CHECKS_COUNT)

   return (
      <StyledHome>
         <Banner id="safety-app-home-top" />
         <h1>{t(address.concat('safety and precautions app'))}</h1>
         <StyledCardList>
            <DashboardTile
               title={t(address.concat('safety checks'))}
               count={loading ? '...' : count}
               conf="All available"
               onClick={() => addTab('Safety Checks', '/safety/checks')}
            />
         </StyledCardList>
         <Banner id="safety-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
