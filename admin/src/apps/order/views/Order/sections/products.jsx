import React from 'react'
import styled from 'styled-components'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@reach/tabs'
import { Flex, Text, Spacer, Filler } from '@dailykit/ui'
import { Tree, Button } from 'antd'

import Sachets from './sachets'
import { useOrder } from '../../../context'
import { Legend, Styles, StyledProductTitle } from '../styled'
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import {
   ChevronDown,
   ChevronRight,
   ChevronLeft,
} from '../../../../../shared/assets/icons'

const address = 'apps.order.views.order.'

export const Products = ({ loading, error, products }) => {
   const { t } = useTranslation()
   const { state, dispatch } = useOrder()
   console.log('=>>>looking for products', products)
   const [selectedProduct, setSelectedProduct] = React.useState(null)
   const selectProduct = product => {
      setSelectedProduct(product)
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
   const backToProductItems = () => {
      dispatch({
         type: 'SELECT_PRODUCT',
         payload: { ...state.current_product, showSachets: false },
      })
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
                        isActive={selectedProduct?.id === product?.id}
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
                        {state.current_product?.id &&
                           state.current_product.showSachets && (
                              <Button
                                 type="link"
                                 icon={
                                    <ChevronLeft color="#1890ff" size="18" />
                                 }
                                 onClick={backToProductItems}
                                 size="large"
                                 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                 }}
                              >
                                 Back
                              </Button>
                           )}
                        {!isEmpty(selectedProduct) &&
                           !state.current_product?.showSachets && (
                              <TreeComponent
                                 nodes={selectedProduct.childNodes ?? []}
                                 key={selectedProduct.id}
                              />
                           )}
                        {state.current_product?.id &&
                           state.current_product?.showSachets && <Sachets />}
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
            <div className="flex-wrap">
               {product?.isAddOn && <span>[Add On] </span>}
               <StyledProductTitle title={product?.displayName}>
                  {product?.displayName.split('->').pop().trim()}
               </StyledProductTitle>
               {product?.label && <StyledBadge>{product?.label}</StyledBadge>}
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

const TreeContainer = styled(Tree)`
   margin: 0 1rem;
   .ant-tree-treenode,
   .ant-tree-switcher {
      display: flex;
      align-items: center;
   }
   ${
      '' /* .ant-tree-list-holder-inner .ant-tree-treenode {
      width: 100%;
   } */
   }
   .ant-tree-list-holder-inner .ant-tree-treenode .ant-tree-switcher {
      background: #f5f5f5;
   }
   .ant-tree-node-content-wrapper {
      ${'' /* width: 100%; */}
      padding: 1rem;
      background: #f5f5f5;
   }
`
const TreeNode = styled(Tree.TreeNode)`
   padding: 0;
`

const StyledTitle = styled.div`
   display: flex;
   align-items: center;
   width: 100%;
   justify-content: space-between;
   .view_sachets {
      cursor: pointer;
      color: #367bf5;
      font-weight: 500;
      &:hover {
         color: #2a6df0;
         text-decoration: underline;
      }
   }
   .flex-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
   }
`
const StyledBadge = styled.span`
   background: #aaa;
   color: #fff;
   font-weight: 400;
   font-size: 12px;
   line-height: 14px;
   padding: 4px 6px;
   border-radius: 4px;
`
const Title = ({ node }) => {
   const { state, dispatch, selectSachet, switchView } = useOrder()
   const viewSachetHandler = e => {
      e.stopPropagation()
      dispatch({
         type: 'SELECT_PRODUCT',
         payload: { ...node, showSachets: true },
      })
      // selectSachet(node, {
      //    name: node?.displayName?.split('->')?.pop()?.trim() || 'N/A',
      // })
   }
   return (
      <StyledTitle>
         <div className="flex-wrap">
            <span>{node.displayName}</span>
            {node.isModifier && <StyledBadge>MOD</StyledBadge>}
         </div>
         {node.simpleRecipeYieldId && (
            <span className="view_sachets" onClick={viewSachetHandler}>
               View Sachets
            </span>
         )}
      </StyledTitle>
   )
}

const TreeComponent = ({ nodes = [], key }) => {
   const { state, dispatch, selectSachet, switchView } = useOrder()
   function flattenDeep(data, depth = 0, parentCartItemId = null, main = []) {
      return data.reduce((r, { childNodes, id, ...rest }) => {
         const obj = { ...rest, id, depth, parentCartItemId, main }
         r.push(obj)

         if (childNodes.length) {
            r.push(...flattenDeep(childNodes, depth + 1, id, [...main, id]))
         }

         return r
      }, [])
   }
   const flattenDeepNodes = flattenDeep(nodes)
   const onSelectHandler = (selectedKeys, { selectedNodes }) => {
      const selectedNode = flattenDeepNodes.find(
         node => node.id === +selectedKeys[0]
      )

      dispatch({
         type: 'SELECT_PRODUCT',
         payload: selectedNode,
      })
      // selectSachet(selectedNode, {
      //    name:
      //       state.current_product?.displayName?.split('->')?.pop()?.trim() ||
      //       'N/A',
      // })
   }
   const renderTreeNodes = node => {
      return (
         <TreeNode title={<Title node={node} />} key={node.id} dataRef={node}>
            {Array.isArray(node.childNodes) && !node.simpleRecipeYieldId
               ? node.childNodes.map(childNode => renderTreeNodes(childNode))
               : null}
         </TreeNode>
      )
   }

   return (
      <TreeContainer
         key={key}
         blockNode={true}
         defaultExpandAll={true}
         switcherIcon={({ expanded }) =>
            expanded ? <ChevronDown /> : <ChevronRight />
         }
         onSelect={onSelectHandler}
      >
         {nodes.map(node => renderTreeNodes(node))}
      </TreeContainer>
   )
}
