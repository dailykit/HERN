import React from 'react'
import { isEmpty } from 'lodash'

import { MenuProvider, useMenu } from './state'
import { WeekPicker } from './week_picker'
import { HelperBar, Loader } from '../../components'
import { CartPanel } from './cart'
import { Menu } from './menu'
import { useConfig } from '../../lib'
import { get_env, isClient } from '../../utils'

export const MenuSection = () => {
   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')
   return (
      <MenuProvider isCheckout>
         <main className="hern-select-menu__main">
            <div>
               <WeekPicker isFixed />
               <header className="hern-select-menu__header">
                  <div
                     className="hern-select-menu__header__before"
                     style={{
                        backgroundImage: `url(
                           ${
                              !isEmpty(config?.header?.images)
                                 ? config?.header?.images[0]?.url
                                 : ''
                           }
                        )`,
                     }}
                  />
                  {config?.header?.heading && (
                     <h1 className="hern-select-menu__header__heading">
                        {config?.header?.heading}
                     </h1>
                  )}
                  {config?.header?.subHeading && (
                     <h3 className="hern-select-menu__header__sub-heading">
                        {config?.header?.subHeading}
                     </h3>
                  )}
               </header>
            </div>
            <MenuContent />
         </main>
      </MenuProvider>
   )
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
      <section className="hern-select-menu__content">
         <Menu />
         <CartPanel noSkip isCheckout />
      </section>
   )
}
