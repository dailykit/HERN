import React from 'react'
import { Text } from '@dailykit/ui'
import { Route } from 'react-router-dom'

// Views
import {
   Home,
   RecipesListing,
   RecipeForm,
   IngredientsListing,
   IngredientForm,
   ProductsListing,
   ProductForm,
} from '../../views'
import { ErrorBoundary, Flex } from '../../../../shared/components'
import { useAccess } from '../../../../shared/providers'

const Main = () => {
   return (
      <>
         <Route exact path="/products">
            <AccessCheck
               title="home"
               message="You do not have sufficient permission to access recipe app."
            >
               <Home />
            </AccessCheck>
         </Route>

         <Route exact path="/products/recipes">
            <AccessCheck
               title="recipes"
               message="You do not have sufficient permission to see recipes listing."
            >
               <RecipesListing />
            </AccessCheck>
         </Route>

         <Route path="/products/recipes/:id">
            <AccessCheck
               title="recipe"
               message="You do not have sufficient permission to see recipe details."
            >
               <RecipeForm />
            </AccessCheck>
         </Route>

         <Route exact path="/products/ingredients">
            <AccessCheck
               title="ingredients"
               message="You do not have sufficient permission to see ingredients listing."
            >
               <IngredientsListing />
            </AccessCheck>
         </Route>

         <Route path="/products/ingredients/:id">
            <AccessCheck
               title="ingredients"
               message="You do not have sufficient permission to see ingredient details."
            >
               <IngredientForm />
            </AccessCheck>
         </Route>

         <Route exact path="/products/products">
            <AccessCheck
               title="products"
               message="You do not have sufficient permission to access products listing."
            >
               <ProductsListing />
            </AccessCheck>
         </Route>

         <Route exact path="/products/products/:id">
            <AccessCheck
               title="products"
               message="You do not have sufficient permission to access products listing."
            >
               <ProductForm />
            </AccessCheck>
         </Route>
      </>
   )
}

export default Main

const AccessCheck = ({ title, children, message }) => {
   const { canAccessRoute, accessPermission } = useAccess()
   return canAccessRoute(title) ? (
      <ErrorBoundary rootRoute="/apps/products">{children}</ErrorBoundary>
   ) : (
      <Flex container height="100%" alignItems="center" justifyContent="center">
         <Text as="title">
            {accessPermission('ROUTE_READ', title)?.fallbackMessage || message}
         </Text>
      </Flex>
   )
}
