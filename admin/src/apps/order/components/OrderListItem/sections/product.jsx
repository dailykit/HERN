import React from 'react'
import isEmpty from 'lodash/isEmpty'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from '@dailykit/ui'

import {
   Styles,
   StyledCount,
   StyledServings,
   StyledProductItem,
   StyledProductTitle,
   StyledBadge,
} from './styled'
import { UserIcon } from '../../../assets/icons'
import { Spacer } from '../../OrderSummary/styled'
import { getRecursiveProducts } from '../../../utils'

const address = 'apps.order.components.orderlistitem.'

export const Products = React.memo(function ProductsComp({ order }) {
   const { t } = useTranslation()
   const [orderedProducts, setOrderedProducts] = React.useState([])

   React.useEffect(() => {
      if (!isEmpty(order.cart.cartItems_aggregate.nodes)) {
         const refinedProducts = getRecursiveProducts(
            order.cart.cartItems_aggregate.nodes
         )
         setOrderedProducts(refinedProducts)
      }
   }, [])

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

   return (
      <Styles.Products>
         <Styles.Tabs>
            <Styles.TabPanels>
               <Styles.TabPanel>
                  {orderedProducts.map(item => (
                     <StyledProductItem key={item.id}>
                        <div className="flex-wrap">
                           <StyledProductTitle>
                              {item.displayName.split('->').pop().trim()}
                           </StyledProductTitle>
                           {item?.label && (
                              <StyledBadge>{item?.label}</StyledBadge>
                           )}
                        </div>

                        <span>
                           {item.assembledSachets?.aggregate?.count || 0} /{' '}
                           {item.packedSachets?.aggregate?.count || 0} /{' '}
                           {item.totalSachets?.aggregate?.count || 0}
                        </span>
                     </StyledProductItem>
                  ))}
               </Styles.TabPanel>
            </Styles.TabPanels>
         </Styles.Tabs>
      </Styles.Products>
   )
})
