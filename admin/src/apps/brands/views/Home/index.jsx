import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'

import { BRANDS, LOCATIONS, KIOSK } from '../../graphql'
import { StyledCardList, StyledHome } from './styled'
import { useTabs } from '../../../../shared/providers'
import { Banner } from '../../../../shared/components'
import { BrandLocationsSvg, BrandsSvg, KioskLocationsSvg } from '../../../../shared/assets/illustrationTileSvg'

export const Home = () => {
   const { addTab } = useTabs()
   const {
      loading: loadingBrands,
      data: { brandsAggregate = {} } = {},
   } = useSubscription(BRANDS.AGGREGATE)

   const {
      loading: loadingLocations,
      data: { brands_location_aggregate = {} } = {}
   } = useSubscription(LOCATIONS.AGGREGATE)
   
   const {
      loading: loadingLocationKiosk,
      data: { brands_locationKiosk_aggregate = {} } = {}
   } = useSubscription(KIOSK.AGGREGATE)

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
               count={
                  loadingLocations ? '...' : brands_location_aggregate?.aggregate?.count || 0
               }
               onClick={() => addTab('Locations', '/brands/locations')}
               tileSvg={<BrandLocationsSvg />}
            />
            <DashboardTile
               title="Kiosk"
               conf="All available"
               count={
                  loadingLocationKiosk ? '...' : brands_locationKiosk_aggregate?.aggregate?.count || 0
               }
               onClick={() => addTab('kiosk', '/brands/kiosks')}
               tileSvg={<KioskLocationsSvg />}
            />
         </StyledCardList>
         <Banner id="brands-app-home-bottom" />
      </StyledHome>
   )
}
