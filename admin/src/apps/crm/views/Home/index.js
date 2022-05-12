import React, { useContext, useEffect } from 'react'
import { DashboardTile, Text, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
// import BrandContext from '../../context/Brand'
// State
import { useTabs } from '../../../../shared/providers'
import { StyledHome, StyledCardList, StyledHeader } from './styled'
import { CUSTOMERS_COUNT, COUPON_TOTAL, CAMPAIGN_TOTAL } from '../../graphql'
import { Banner } from '../../../../shared/components'
import {
   CampaignSvg,
   CouponsSvg,
   CustomersSvg,
} from '../../../../shared/assets/illustrationTileSvg'
import { BrandContext } from '../../../../App'
import { BrandListing } from '../../components'

const Home = () => {
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [brandTunnels, openBrandTunnel, closeBrandTunnel] = useTunnel(1)
   const { addTab } = useTabs()
   // const { t } = useTranslation()
   const { data: customersCount } = useSubscription(CUSTOMERS_COUNT, {
      variables: {
         brandId: brandContext.brandId,
      },
   })
   const { data: couponTotal } = useSubscription(COUPON_TOTAL)
   const { data: campaignTotal } = useSubscription(CAMPAIGN_TOTAL)

   return (
      <StyledHome>
         <Banner id="crm-app-home-top" />
         <StyledHeader>
            <Text as="h1">Customer Relation Manager</Text>
         </StyledHeader>

         <StyledCardList>
            <DashboardTile
               title="Customers"
               count={customersCount?.customers_aggregate.aggregate.count || 0}
               onClick={() => {
                  brandContext.brandId
                     ? addTab(
                          'Customers',
                          `/crm/customers-${brandContext.brandName}-${brandContext.brandId}`
                       )
                     : openBrandTunnel(1)
               }}
               tileSvg={<CustomersSvg />}
            />
            <DashboardTile
               title="All Coupons"
               count={couponTotal?.couponsAggregate?.aggregate?.count || 0}
               onClick={() => addTab('Coupons', '/crm/coupons')}
               tileSvg={<CouponsSvg />}
            />
            <DashboardTile
               title="All Campaign"
               count={campaignTotal?.campaignsAggregate?.aggregate?.count || 0}
               onClick={() => addTab('Campaign', '/crm/campaign')}
               tileSvg={<CampaignSvg />}
            />
         </StyledCardList>
         <Banner id="crm-app-home-bottom" />

         <Tunnels tunnels={brandTunnels}>
            <Tunnel popup={true} layer={1} size="md">
               <BrandListing closeTunnel={closeBrandTunnel} />
            </Tunnel>
         </Tunnels>
      </StyledHome>
   )
}

export default Home
