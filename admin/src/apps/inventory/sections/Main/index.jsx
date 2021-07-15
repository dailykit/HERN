import React from 'react'
import { Text } from '@dailykit/ui'
import styled from 'styled-components'
import { Switch, Route } from 'react-router-dom'

// Views
import {
   Home,
   SupplierListing,
   ItemListing,
   SupplierForm,
   ItemForm,
   WorkOrdersListing,
   BulkOrderForm,
   PurchaseOrdersListing,
   PurchaseOrderForm,
   SachetOrderForm,
   Packagings,
   SachetPackaging,
   PackagingPurchaseOrderForm,
} from '../../views'

import PackagingHub from '../../packagingHub'
import { Flex } from '../../../../shared/components'
import { useAccess } from '../../../../shared/providers'
import PackagingHubProducts from '../../packagingHub/views/Products'
import PackagingHubProductDetails from '../../packagingHub/views/ProductDetails'

const MainWrapper = styled.main`
   overflow-x: auto;
   position: relative;
`

const Main = () => {
   return (
      <MainWrapper>
         <Switch>
            <Route path="/inventory" exact>
               <AccessCheck
                  title="home"
                  message="You do not have sufficient permission to see Inventory app."
               >
                  <Home />
               </AccessCheck>
            </Route>
            <Route path="/inventory/suppliers" exact>
               <AccessCheck
                  title="suppliers"
                  message="You do not have sufficient permission to see suppliers listing."
               >
                  <SupplierListing />
               </AccessCheck>
            </Route>
            <Route path="/inventory/suppliers/:id" exact>
               <AccessCheck
                  title="supplier"
                  message="You do not have sufficient permission to see suppliers details."
               >
                  <SupplierForm />
               </AccessCheck>
            </Route>
            <Route path="/inventory/items" exact>
               <AccessCheck
                  title="items"
                  message="You do not have sufficient permission to see items listing."
               >
                  <ItemListing />
               </AccessCheck>
            </Route>
            <Route path="/inventory/items/:id" exact>
               <AccessCheck
                  title="item"
                  message="You do not have sufficient permission to see item details."
               >
                  <ItemForm />
               </AccessCheck>
            </Route>
            <Route path="/inventory/work-orders" exact>
               <AccessCheck
                  title="work-orders"
                  message="You do not have sufficient permission to see work orders."
               >
                  <WorkOrdersListing />
               </AccessCheck>
            </Route>
            <Route path="/inventory/work-orders/sachet/:id" exact>
               <AccessCheck
                  title="work-orders/sachet"
                  message="You do not have sufficient permission to see work order sachet."
               >
                  <SachetOrderForm />
               </AccessCheck>
            </Route>
            <Route path="/inventory/work-orders/bulk/:id" exact>
               <AccessCheck
                  title="work-orders/bulk"
                  message="You do not have sufficient permission to see work order bulk."
               >
                  <BulkOrderForm />
               </AccessCheck>
            </Route>
            <Route path="/inventory/purchase-orders" exact>
               <AccessCheck
                  title="purchase-orders"
                  message="You do not have sufficient permission to see purchase orders."
               >
                  <PurchaseOrdersListing />
               </AccessCheck>
            </Route>
            <Route path="/inventory/purchase-orders/item/:id" exact>
               <AccessCheck
                  title="purchase-orders/item"
                  message="You do not have sufficient permission to see purchase order item."
               >
                  <PurchaseOrderForm />
               </AccessCheck>
            </Route>
            <Route path="/inventory/purchase-orders/packaging/:id" exact>
               <AccessCheck
                  title="purchase-orders/packaging"
                  message="You do not have sufficient permission to see purchase order packaging."
               >
                  <PackagingPurchaseOrderForm />
               </AccessCheck>
            </Route>
            <Route path="/inventory/packagings" exact>
               <AccessCheck
                  title="packagings"
                  message="You do not have sufficient permission to see packagings."
               >
                  <Packagings />
               </AccessCheck>
            </Route>
            <Route path="/inventory/packagings/:id" exact>
               <AccessCheck
                  title="packaging"
                  message="You do not have sufficient permission to see packagings details."
               >
                  <SachetPackaging />
               </AccessCheck>
            </Route>
            <Route path="/inventory/packaging-hub" exact>
               <AccessCheck
                  title="packaging-hub"
                  message="You do not have sufficient permission to see packaging hub."
               >
                  <PackagingHub />
               </AccessCheck>
            </Route>
            <Route path="/inventory/packaging-hub/products/:id" exact>
               <AccessCheck
                  title="packaging-hub/products"
                  message="You do not have sufficient permission to see packaging hub products"
               >
                  <PackagingHubProducts />
               </AccessCheck>
            </Route>
            <Route path="/inventory/packaging-hub/product/:id" exact>
               <AccessCheck
                  title="packaging-hub/product"
                  message="You do not have sufficient permission to see packaging hub product."
               >
                  <PackagingHubProductDetails />
               </AccessCheck>
            </Route>
         </Switch>
      </MainWrapper>
   )
}

export default Main

const AccessCheck = ({ title, children, message }) => {
   const { canAccessRoute, accessPermission } = useAccess()
   return canAccessRoute(title) ? (
      children
   ) : (
      <Flex container height="100%" alignItems="center" justifyContent="center">
         <Text as="title">
            {accessPermission('ROUTE_READ', title)?.fallbackMessage || message}
         </Text>
      </Flex>
   )
}
