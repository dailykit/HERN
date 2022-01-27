import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'

import { BRANDS } from '../../graphql'
import { StyledCardList, StyledHome } from './styled'
import { useTabs } from '../../../../shared/providers'
import { Banner } from '../../../../shared/components'
import { BrandsSvg } from '../../../../shared/assets/illustrationTileSvg'

export const Home = () => {
   const { addTab } = useTabs()
   const {
      loading: loadingBrands,
      data: { brandsAggregate = {} } = {},
   } = useSubscription(BRANDS.AGGREGATE)

   return (
      <StyledHome>
         <Banner id="brands-app-home-top" />
         <h1>Brands</h1>
         <StyledCardList>
            <DashboardTile
               title="Brands"
               conf="All available"
               count={
                  loadingBrands ? '...' : brandsAggregate?.aggregate?.count || 0
               }
               onClick={() => addTab('Brands', '/brands/brands')}
               tileSvg={<BrandsSvg />}
            />
            <DashboardTile
               title="Locations"
               conf="All available"
               // count={
               //    loadingBrands ? '...' : brandsAggregate?.aggregate?.count || 0
               // }
               onClick={() => addTab('Locations', '/brands/locations')}
               tileSvg={<BrandsSvg />}
            />
         </StyledCardList>
         <Banner id="brands-app-home-bottom" />
      </StyledHome>
   )
}
