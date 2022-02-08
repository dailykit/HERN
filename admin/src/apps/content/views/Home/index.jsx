import React, { useContext } from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   BRAND_TOTAL_PAGES,
   FOLD_AGGREGATE,
   MENU_AGGREGATE,
} from '../../graphql'
import BrandContext from '../../context/Brand'
import { StyledCardList, StyledHome } from './styled'
import { Banner, InlineLoader } from '../../../../shared/components'
import { logger } from '../../../../shared/utils'
import { useTabs } from '../../../../shared/providers'
import {
   BlocksSvg,
   NavbarMenuSvg,
   PagesSvg,
   SettingsSvg,
   SubscriptionSvg,
} from '../../../../shared/assets/illustrationTileSvg'

export const Home = () => {
   const { addTab } = useTabs()
   const [context, setContext] = useContext(BrandContext)
   const { brandId } = context

   // page count subscription
   const {
      data: {
         brands_brandPages_aggregate: {
            aggregate: { count: pageCount = 0 } = {},
         } = {},
      } = {},
      loading: pageLoading,
      error: pageError,
   } = useSubscription(BRAND_TOTAL_PAGES, {
      variables: {
         brandId: brandId,
      },
   })

   // fold count subscription
   const {
      data: {
         content_subscriptionDivIds_aggregate: {
            aggregate: { count: foldCount = 0 } = {},
         } = {},
      } = {},
      loading: foldLoading,
      error: foldError,
   } = useSubscription(FOLD_AGGREGATE, {})

   // menu count subscription
   const {
      data: {
         brands_navigationMenu_aggregate: {
            aggregate: { count: menuCount = 0 } = {},
         } = {},
      } = {},
      loading: menuLoading,
      error: menuError,
   } = useSubscription(MENU_AGGREGATE, {})

   if (foldLoading || pageLoading || menuLoading) {
      return <InlineLoader />
   }
   if (foldError || pageError || menuError) {
      toast.error('Something Went Wrong!')
      logger(foldError || pageError || menuError)
   }

   return (
      <StyledHome>
         <Banner id="content-app-home-top" />
         <h1>Content App</h1>
         <StyledCardList>
            <DashboardTile
               title="Pages"
               count={pageCount}
               onClick={() => addTab('Pages', '/content/pages')}
               tileSvg={<PagesSvg />}
            />
            {/* <DashboardTile
               title="Subscription"
               count={foldCount}
               onClick={() => addTab('Subscription', '/content/subscription')}
               tileSvg={<SubscriptionSvg />}
            /> */}
            <DashboardTile
               title="Navbar Menu"
               count={menuCount}
               onClick={() => addTab('Navbar Menu', '/content/navbarMenu')}
               tileSvg={<NavbarMenuSvg />}
            />
            {/* <DashboardTile
               title="Settings"
               onClick={() => addTab('Settings', '/content/settings')}
               tileSvg={<SettingsSvg />}
            />
            <DashboardTile
               title="Blocks"
               onClick={() => addTab('Blocks', '/content/blocks')}
               tileSvg={<BlocksSvg />}
            /> */}
         </StyledCardList>
         <Banner id="content-app-home-bottom" />
      </StyledHome>
   )
}
