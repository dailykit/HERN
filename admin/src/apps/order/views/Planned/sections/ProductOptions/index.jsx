import React from 'react'
import { toast } from 'react-toastify'
import styled, { css } from 'styled-components'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import {
   Text,
   Filler,
   HorizontalTab as Tab,
   HorizontalTabs as Tabs,
   HorizontalTabList as TabList,
   HorizontalTabPanel as TabPanel,
   HorizontalTabPanels as TabPanels,
} from '@dailykit/ui'

import { useOrder } from '../../../../context'
import { QUERIES } from '../../../../graphql'
import { NewTabIcon } from '../../../../assets/icons'
import { logger } from '../../../../../../shared/utils'
import { useTabs } from '../../../../../../shared/providers'
import { Spacer } from '../../../../components/OrderSummary/styled'
import { ErrorState, InlineLoader } from '../../../../../../shared/components'

export const ProductOptions = () => {
   const [total, setTotal] = React.useState({})
   const { loading, error, data: { productOptionTypes = [] } = {} } = useQuery(
      QUERIES.PRODUCT_OPTION_TYPES
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

   if (productOptionTypes.length === 0)
      return (
         <Filler
            height="320px"
            message="There are no product option types yet!"
         />
      )
   return (
      <Tabs>
         <TabList>
            {productOptionTypes.map(type => (
               <Tab key={type.title}>{type.title}</Tab>
            ))}
         </TabList>
         <TabPanels>
            {productOptionTypes.map(type => (
               <TabPanel key={type.title}>
                  <Spacer size="16px" />
                  <Text as="h2">{type.title}</Text>
                  <Text as="p">Total: {total[type.title]}</Text>
                  <Spacer size="14px" />
                  <Listing type={type} setTotal={setTotal} />
               </TabPanel>
            ))}
         </TabPanels>
      </Tabs>
   )
}

const Listing = ({ type, setTotal }) => {
   const { state } = useOrder()
   const {
      loading,
      error,
      data: { productOptions = {} } = {},
   } = useSubscription(QUERIES.PLANNED.PRODUCT_OPTIONS, {
      variables: {
         type: { _eq: type.title },
         cart: state.orders.where.cart,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { productOptions: options = {} } = {} } = {},
      }) => {
         const total = options.nodes.reduce(
            (b, a) => b + a.cartItems_aggregate.aggregate.count,
            0
         )
         setTotal(existing => ({ ...existing, [type.title]: total }))
      },
   })
   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      toast.error('Could not get the products list, please refresh the page!')
      return (
         <ErrorState
            height="320px"
            message="Could not get the products list, please refresh the page!"
         />
      )
   }

   if (productOptions.aggregate.count === 0)
      return <Filler height="320px" message="No products yet!" />
   return (
      <ul>
         {productOptions.nodes.map(node => (
            <Product key={node.id}>
               <aside>
                  <Text as="h3" title={node.displayName}>
                     {node.displayName.split('->').pop().trim()}
                  </Text>
                  <Text as="subtitle">
                     Total: {node.cartItems_aggregate?.aggregate?.count}
                  </Text>
               </aside>
               <main>
                  {node.cartItems_aggregate?.aggregate?.count === 0 ? (
                     <span>No order items.</span>
                  ) : (
                     <Cards nodes={node.cartItems_aggregate?.nodes || []} />
                  )}
               </main>
            </Product>
         ))}
      </ul>
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
            </ListItem>
         ))}
      </List>
   )
}

const Product = styled.li`
   display: grid;
   padding: 8px;
   grid-gap: 24px;
   overflow: hidden;
   max-height: 180px;
   border-radius: 2px;
   border: 1px solid #e1e1e1;
   grid-template-columns: 220px 1fr;
   + li {
      margin-top: 16px;
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
