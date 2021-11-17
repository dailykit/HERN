import React from 'react'
import { isEmpty, groupBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from '@dailykit/ui'

import {
   Styles,
   StyledCount,
   StyledServings,
   StyledProductItem,
   StyledProductTitle,
} from './styled'
import { UserIcon } from '../../../assets/icons'
import { Spacer } from '../../OrderSummary/styled'

const address = 'apps.order.components.orderlistitem.'

export const Products = ({ order }) => {
   const { t } = useTranslation()

   if (order?.thirdPartyOrderId) {
      const { thirdPartyOrder: { products = [] } = {} } = order

      if (isEmpty(products)) {
         return (
            <Flex
               container
               as="section"
               padding="14px 0"
               justifyContent="center"
            >
               <Text as="h3">No products</Text>
            </Flex>
         )
      }
      return (
         <Styles.Products>
            <Styles.Tabs>
               <Styles.TabList>
                  <Styles.Tab>
                     {t(address.concat('all'))}{' '}
                     <StyledCount>
                        {isEmpty(products) ? 0 : products?.length}
                     </StyledCount>
                  </Styles.Tab>
               </Styles.TabList>
               <Styles.TabPanels>
                  <Styles.TabPanel>
                     {products.map((product, index) => (
                        <StyledProductItem key={index}>
                           <section>{product.label}</section>
                           <Flex as="section" container alignItems="center">
                              <span>
                                 <UserIcon size={16} color="#555B6E" />
                              </span>
                              <Spacer size="4px" xAxis />
                              <span>{product.quantity}</span>
                           </Flex>
                        </StyledProductItem>
                     ))}
                  </Styles.TabPanel>
               </Styles.TabPanels>
            </Styles.Tabs>
         </Styles.Products>
      )
   }

   const types = groupBy(
      order.cart.cartItems_aggregate.nodes,
      'productOptionType'
   )
   return (
      <Styles.Products>
         <Styles.Tabs>
            <Styles.TabList>
               <Styles.Tab>
                  {t(address.concat('all'))}{' '}
                  <StyledCount>
                     {order.cart.cartItems_aggregate.aggregate.count}
                  </StyledCount>
               </Styles.Tab>
               {Object.keys(types).map(key => (
                  <Styles.Tab key={key}>
                     {key}
                     <StyledCount>{types[key].length}</StyledCount>
                  </Styles.Tab>
               ))}
            </Styles.TabList>
            <Styles.TabPanels>
               <Styles.TabPanel>
                  {order.cart.cartItems_aggregate.nodes.map(item => (
                     <StyledProductItem key={item.id}>
                        <div>
                           <StyledProductTitle>
                              {item.displayName.split('->').pop().trim()}
                           </StyledProductTitle>
                        </div>
                        {/* <StyledServings>
                           <span>
                              <UserIcon size={16} color="#555B6E" />
                           </span>
                           <span>{item?.productOption?.label}</span>
                        </StyledServings> */}
                        <span>
                           {item.assembledSachets?.aggregate?.count || 0} /{' '}
                           {item.packedSachets?.aggregate?.count || 0} /{' '}
                           {item.totalSachets?.aggregate?.count || 0}
                        </span>
                     </StyledProductItem>
                  ))}
               </Styles.TabPanel>
               {Object.values(types).map((listing, index) => (
                  <Styles.TabPanel key={index}>
                     {listing.map(item => (
                        <StyledProductItem key={`${item.id}-${index}`}>
                           <div>
                              <StyledProductTitle>
                                 {item.displayName.split('->').pop().trim()}
                              </StyledProductTitle>
                           </div>
                           {/* <StyledServings>
                              <span>
                                 <UserIcon size={16} color="#555B6E" />
                              </span>
                              <span>{item.productOption?.label}</span>
                           </StyledServings> */}
                           <span>
                              {item.assembledSachets?.aggregate?.count || 0} /{' '}
                              {item.packedSachets?.aggregate?.count || 0} /{' '}
                              {item.totalSachets?.aggregate?.count || 0}
                           </span>
                        </StyledProductItem>
                     ))}
                  </Styles.TabPanel>
               ))}
            </Styles.TabPanels>
         </Styles.Tabs>
      </Styles.Products>
   )
}
