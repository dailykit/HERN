import React from 'react'
import {
   Flex,
   SectionTab as Tab,
   SectionTabs as Tabs,
   SectionTabList as TabList,
   SectionTabPanel as TabPanel,
   SectionTabPanels as TabPanels,
} from '@dailykit/ui'

import { Container } from './styled'
import { useTabs } from '../../../../shared/providers'
import {
   Products,
   ProductOptions,
   SimpleRecipes,
   SubRecipes,
   Ingredients,
   SachetItems,
} from './sections'
import { Banner } from '../../../../shared/components'

const Planned = () => {
   const { tab, addTab } = useTabs()

   React.useEffect(() => {
      if (!tab) {
         addTab('Planned', '/order/planned')
      }
   }, [tab, addTab])
   return (
      <Container>
         <Banner id="orders-app-planned-top" />
         <Tabs>
            <TabList>
               <Tab>
                  <TabItem>Products</TabItem>
               </Tab>
               <Tab>
                  <TabItem>Product Options</TabItem>
               </Tab>
               <Tab>
                  <TabItem>Simple Recipes</TabItem>
               </Tab>
               <Tab>
                  <TabItem>Sub Recipes</TabItem>
               </Tab>
               <Tab>
                  <TabItem>Ingredients</TabItem>
               </Tab>
               <Tab>
                  <TabItem>Sachet Items</TabItem>
               </Tab>
            </TabList>
            <TabPanels>
               <TabPanel>
                  <Products />
               </TabPanel>
               <TabPanel>
                  <ProductOptions />
               </TabPanel>
               <TabPanel>
                  <SimpleRecipes />
               </TabPanel>
               <TabPanel>
                  <SubRecipes />
               </TabPanel>
               <TabPanel>
                  <Ingredients />
               </TabPanel>
               <TabPanel>
                  <SachetItems />
               </TabPanel>
            </TabPanels>
         </Tabs>
         <Banner id="orders-app-planned-bottom" />
      </Container>
   )
}

export default Planned

const TabItem = ({ children }) => {
   return (
      <Flex container height="40px" alignItems="center" justifyContent="center">
         {children}
      </Flex>
   )
}
