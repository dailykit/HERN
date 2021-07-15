import React from 'react'
import styled, { css } from 'styled-components'
import { useSubscription } from '@apollo/react-hooks'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'

import { Flex, Text, Filler, Spacer } from '@dailykit/ui'

import { useOrder } from '../../../../context'
import { QUERIES } from '../../../../graphql'
import { NewTabIcon } from '../../../../assets/icons'
import { logger } from '../../../../../../shared/utils'
import { useTabs } from '../../../../../../shared/providers'
import { ErrorState, InlineLoader } from '../../../../../../shared/components'

export const SubRecipes = () => {
   const [total, setTotal] = React.useState(0)
   const [servings, setServings] = React.useState(0)
   return (
      <div>
         <Spacer size="16px" />
         <Text as="h2">Simple Recipes</Text>
         <Flex container alignItems="center">
            <Text as="p">Total: {total}</Text>
            <Spacer size="24px" xAxis />
            <Text as="p">Servings: {servings}</Text>
         </Flex>
         <Spacer size="14px" />
         <Listing setTotal={setTotal} setServings={setServings} />
      </div>
   )
}

const Listing = ({ setTotal, setServings }) => {
   const { state } = useOrder()
   const { loading, error, data: { subRecipes = {} } = {} } = useSubscription(
      QUERIES.PLANNED.SUB_RECIPES,
      {
         variables: {
            cart: state.orders.where.cart,
         },

         onSubscriptionData: ({
            subscriptionData: { data: { subRecipes: recipes = {} } = {} } = {},
         }) => {
            const servings = recipes.nodes.reduce(
               (b, a) =>
                  b +
                  a.simpleRecipeYields_aggregate.nodes.reduce(
                     (y, x) =>
                        y +
                           x.subRecipeCartItems_aggregate.aggregate.sum
                              .displayServing || 0,
                     0
                  ),
               0
            )
            setServings(servings)
            const total = recipes.nodes.reduce(
               (b, a) =>
                  b +
                  a.simpleRecipeYields_aggregate.nodes.reduce(
                     (y, x) =>
                        y + x.subRecipeCartItems_aggregate.aggregate.count,
                     0
                  ),
               0
            )
            setTotal(total)
         },
      }
   )

   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      return (
         <ErrorState
            height="320px"
            message="Something went wrong, please refresh the page!"
         />
      )
   }

   if (subRecipes.aggregate.count === 0)
      return <Filler height="320px" message="There are no sub recipes yet!" />
   return (
      <ul>
         {subRecipes.nodes.map(node => (
            <Recipe key={node.id}>
               <aside>
                  <Text as="h3" title={node.name}>
                     {node.name}
                  </Text>
                  <Text as="subtitle">
                     Total:{' '}
                     {node.simpleRecipeYields_aggregate?.aggregate?.count}
                  </Text>
               </aside>
               <main>
                  <Yields nodes={node.simpleRecipeYields_aggregate.nodes} />
               </main>
            </Recipe>
         ))}
      </ul>
   )
}

const Yields = ({ nodes }) => {
   return (
      <>
         <StyledTabs>
            <StyledTabList>
               {nodes.map(node => (
                  <StyledTab key={node.id}>
                     <span>
                        {node.serving} Serving{' '}
                        <span title="Total Servings">
                           (
                           {
                              node.subRecipeCartItems_aggregate.aggregate.sum
                                 .displayServing
                           }
                           )
                        </span>
                     </span>
                     <span title="Total Quantity">
                        {
                           node.subRecipeCartItems_aggregate.aggregate.sum
                              .displayUnitQuantity
                        }
                     </span>
                  </StyledTab>
               ))}
            </StyledTabList>
            <StyledTabPanels>
               {nodes.map(node => (
                  <StyledTabPanel>
                     <Cards nodes={node.subRecipeCartItems_aggregate.nodes} />
                  </StyledTabPanel>
               ))}
            </StyledTabPanels>
         </StyledTabs>
      </>
   )
}

const Cards = ({ nodes = [] }) => {
   const { addTab } = useTabs()

   const openOrder = (e, id) => {
      e.stopPropagation()
      addTab(`ORD${id}`, `/order/orders/${id}`)
   }

   return (
      <List>
         {nodes.map(node => (
            <ListItem key={node.id} status={node.status}>
               <StyledButton
                  type="button"
                  onClick={e => openOrder(e, node.cart?.orderId)}
               >
                  ORD{node.cart?.orderId}
                  <NewTabIcon size={14} />
               </StyledButton>
               <span title={node.displayName}>
                  {node.displayName.split('->').pop().trim()}
               </span>
            </ListItem>
         ))}
      </List>
   )
}

const Recipe = styled.li`
   padding: 8px;
   overflow: hidden;
   max-height: 240px;
   border-radius: 2px;
   border: 1px solid #e1e1e1;
   + li {
      margin-top: 16px;
   }
   > aside {
      margin-bottom: 14px;
   }
`

const List = styled.ul`
   overflow-y: auto;
   max-height: calc(180px - 16px);
`

const ListItem = styled.li(
   ({ status }) => css`
      height: 40px;
      display: flex;
      list-style: none;
      padding-left: 8px;
      align-items: center;
      background: ${status === 'PACKED' ? '#79df54' : '#f9daa8'};
      + li {
         border-top: 1px solid rgba(128, 128, 128, 0.3);
      }
   `
)

const StyledButton = styled.button`
   border: 2px;
   height: 28px;
   display: flex;
   padding: 0 8px;
   color: #787d91;
   cursor: pointer;
   font-weight: 500;
   background: white;
   margin-right: 14px;
   align-items: center;
   text-transform: uppercase;
   border: 1px solid rgba(0, 0, 0, 0.2);
   svg {
      margin-left: 2px;
   }
`

export const StyledTabs = styled(Tabs)(
   () => css`
      display: grid;
      grid-template-columns: 180px 1fr;
   `
)

export const StyledTabList = styled(TabList)(
   () => css`
      overflow-y: auto;
      max-height: calc(180px - 16px);
      [data-selected] {
         background: #ebebeb;
      }
   `
)

export const StyledTab = styled(Tab)(
   () => css`
      width: 100%;
      color: #000;
      border: none;
      height: 40px;
      padding: 0 12px;
      text-align: left;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #cac7c7;
      :focus {
         outline: none;
         background: #ebebeb;
      }
   `
)

export const StyledTabPanels = styled(TabPanels)(
   () => css`
      overflow-y: auto;
      height: auto !important;
      max-height: 168px !important;
   `
)

export const StyledTabPanel = styled(TabPanel)(
   () => css`
      padding: 0 8px !important;
   `
)
