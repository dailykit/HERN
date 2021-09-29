import React from 'react'

import 'react-datepicker/dist/react-datepicker.css'

import { Wrapper } from './styled'
import { MenuProvider } from './state'
import DateSection from './DateSection'
import PlansSection from './PlansSection'
import ProductsSection from './ProductsSection'
import { useTabs } from '../../../../../shared/providers'
import { Banner } from '../../../../../shared/components'
import MenuProductTables from './MenuProductTable'

export const Menu = () => {
   const { tab, addTab } = useTabs()

   React.useEffect(() => {
      if (!tab) {
         localStorage.removeItem('serving_size')
         addTab('Menu', '/subscription/menu')
      }
   }, [tab, addTab])

   return (
      <MenuProvider>
         <Banner id="subscription-app-menu-listing-top" />
         <Wrapper>
            <div>
               <DateSection />
               <PlansSection />
               <ProductsSection />
            </div>
         </Wrapper>
         <MenuProductTables />
         <Banner id="subscription-app-menu-listing-bottom" />
      </MenuProvider>
   )
}
