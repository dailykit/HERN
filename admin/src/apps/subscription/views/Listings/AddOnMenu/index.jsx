import React from 'react'

import 'react-datepicker/dist/react-datepicker.css'

import { Wrapper } from './styled'
import { MenuProvider } from './state'
import DateSection from './DateSection'
import PlansSection from './PlansSection'
import ProductsSection from './ProductsSection'
import { useTabs } from '../../../../../shared/providers'
import { Banner } from '../../../../../shared/components'

export const AddOnMenu = () => {
   const { tab, addTab } = useTabs()

   React.useEffect(() => {
      if (!tab) {
         addTab('Add On Menu', '/subscription/addon-menu')
      }
   }, [tab, addTab])

   return (
      <MenuProvider>
         <Banner id="subscription-app-add-on-menu-listing-top" />
         <Wrapper>
            <div>
               <DateSection />
               <PlansSection />
               <ProductsSection />
            </div>
         </Wrapper>
         <Banner id="subscription-app-add-on-menu-listing-bottom" />
      </MenuProvider>
   )
}
