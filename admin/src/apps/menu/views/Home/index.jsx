import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { useTranslation } from 'react-i18next'

import { StyledHome, StyledCardList } from './styled'
import { useTabs } from '../../../../shared/providers'
import { COLLECTIONS_COUNT } from '../../graphql'
import { Banner } from '../../../../shared/components'
import { CollectionsSvg } from '../../../../shared/assets/illustrationTileSvg'

const address = 'apps.menu.views.home.'

const Home = () => {
   const { t } = useTranslation()
   const { addTab } = useTabs()

   const { data: collectionsData } = useSubscription(COLLECTIONS_COUNT)

   return (
      <StyledHome>
         <Banner id="menu-app-home-top" />
         <h1>{t(address.concat('menu'))}</h1>
         <StyledCardList>
            <DashboardTile
               title={t(address.concat('collections'))}
               count={
                  collectionsData?.collectionsAggregate.aggregate.count || '...'
               }
               conf="All available"
               onClick={() => addTab('Collections', '/menu/collections')}
               tileSvg={<CollectionsSvg />}
            />
            <DashboardTile
               title='Pre-Order Delivery'
               onClick={() => addTab('Collections', '/menu/recurrences/PREORDER_DELIVERY')}
               conf="All available"
            />
            <DashboardTile
               title='Pre-Order PickUp'
               onClick={() => addTab('Collections', '/menu/recurrences/PREORDER_PICKUP')}
               conf="All available"
            />
            <DashboardTile
               title='On-Demand Delivery'
               onClick={() => addTab('Collections', '/menu/recurrences/ONDEMAND_DELIVERY')}
               conf="All available"
            />
            <DashboardTile
               title='On-Demand PickUp'
               onClick={() => addTab('Collections', '/menu/recurrences/ONDEMAND_PICKUP')}
               conf="All available"
            />
            <DashboardTile
               title='On-Demand Dinin'
               onClick={() => addTab('Collections', '/menu/recurrences/ONDEMAND_DININ')}
               conf="All available"
            />
            <DashboardTile
               title='Pre-Order Dinin'
               onClick={() => addTab('Collections', '/menu/recurrences/PREORDER_DININ')}
               conf="All available"
            />

         </StyledCardList>
         <Banner id="menu-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
