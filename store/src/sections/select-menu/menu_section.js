import React from 'react'
import { isEmpty } from 'lodash'

import { MenuProvider, useMenu } from './state'
import { WeekPicker } from './week_picker'
import { HelperBar, Loader, PageBanner, PlanInfo } from '../../components'
import { CartPanel } from './cart'
import { Menu } from './menu'
import { useConfig } from '../../lib'
import { get_env, isClient } from '../../utils'
import { useUser } from '../../context'

export const MenuSection = () => {
   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')
   const { user } = useUser()

   if (user?.subscription?.recipes?.count > 0) {
      return (
         <>
            <PlanInfo />
            <MenuProvider test="deepak" isCheckout={true}>
               <main className="hern-select-menu__main">
                  <div>
                     <WeekPicker isFixed />
                     <PageBanner
                        image={config?.header?.images?.value}
                        heading={config?.header?.heading?.value}
                        subHeading={config?.header?.subHeading?.value}
                     />
                  </div>
                  <MenuContent />
               </main>
            </MenuProvider>
         </>
      )
   } else {
      return (
         <section className="hern-select-menu__helper-bar">
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  No Plan has been selected yet!
               </HelperBar.SubTitle>
            </HelperBar>
         </section>
      )
   }
}
const MenuContent = () => {
   const { state } = useMenu()

   if (state?.isOccurencesLoading) {
      return (
         <section className="hern-select-menu__loading">
            <Loader inline />
         </section>
      )
   }
   if (!state?.week?.id)
      return (
         <section className="hern-select-menu__helper-bar">
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  No menu available for this week!
               </HelperBar.SubTitle>
            </HelperBar>
         </section>
      )
   return (
      <>
         <section className="hern-select-menu__content">
            <Menu />
            <CartPanel noSkip isCheckout />
         </section>
      </>
   )
}
