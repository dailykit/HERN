import React from 'react'
import styled from 'styled-components'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@reach/tabs'
import { Flex, Text, Spacer, Filler } from '@dailykit/ui'

import Sachets from './sachets'
import { useOrder } from '../../../context'
import { Legend, Styles, StyledProductTitle } from '../styled'
import { ErrorState, InlineLoader } from '../../../../../shared/components'

const address = 'apps.order.views.order.'

export const Products = ({ loading, error, products }) => {
   const { t } = useTranslation()
   const { state, dispatch } = useOrder()
   console.log('=>>>looking for products', products)
   const selectProduct = product => {
      dispatch({
         type: 'SELECT_PRODUCT',
         payload: product,
      })
      // findAndSelectSachet({
      //    dispatch,
      //    product,
      //    isSuperUser,
      //    station: config.current_station,
      // })
   }

   if (loading) return <InlineLoader />
   if (error) return <ErrorState message="Failed to fetch mealkit products!" />
   if (isEmpty(products))
      return <Filler message="No mealkit products available!" />
   return (
      <>
         <Tabs>
            <ProductsList>
               {products.map(product => (
                  <Tab key={product.id} as="div">
                     <ProductCard
                        product={product}
                        onClick={() => selectProduct(product)}
                        isActive={state?.current_product?.id === product.id}
                     />
                  </Tab>
               ))}
            </ProductsList>
            <TabPanels>
               {products.map(product => (
                  <TabPanel key={product.id}>
                     <Spacer size="16px" />
                     <section id="sachets">
                        <Text as="h2">Sachets</Text>
                        <Legend>
                           <h2>{t(address.concat('legends'))}</h2>
                           <section>
                              <span />
                              <span>{t(address.concat('pending'))}</span>
                           </section>
                           <section>
                              <span />
                              <span>Ready</span>
                           </section>
                           <section>
                              <span />
                              <span>Packed</span>
                           </section>
                        </Legend>
                        {state.current_product?.id && <Sachets />}
                     </section>
                  </TabPanel>
               ))}
            </TabPanels>
         </Tabs>
      </>
   )
}

const ProductsList = styled(TabList)`
   display: grid;
   grid-gap: 16px;
   grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
`

const ProductCard = ({ product, isActive, onClick }) => {
   return (
      <Styles.ProductItem isActive={isActive} onClick={onClick}>
         {product?.displayImage && (
            <aside>
               <img
                  src={product?.displayImage}
                  alt={product?.displayName.split('->').pop().trim()}
               />
            </aside>
         )}
         <main>
            <div>
               {product?.isAddOn && <span>[Add On] </span>}
               <StyledProductTitle title={product?.displayName}>
                  {product?.displayName.split('->').pop().trim()} -{' '}
                  {product?.productOption?.label}
               </StyledProductTitle>
            </div>
            <Spacer size="14px" />
            <Flex container alignItems="center" justifyContent="space-between">
               <span>
                  {product.assembledSachets?.aggregate?.count} /{' '}
                  {product.packedSachets?.aggregate?.count} /{' '}
                  {product.totalSachets?.aggregate?.count}
               </span>
            </Flex>
         </main>
      </Styles.ProductItem>
   )
}
