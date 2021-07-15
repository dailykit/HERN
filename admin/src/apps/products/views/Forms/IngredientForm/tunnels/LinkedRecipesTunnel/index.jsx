import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { Filler, Text, TunnelHeader } from '@dailykit/ui'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { useTabs } from '../../../../../../../shared/providers'
import { S_SIMPLE_RECIPES_FROM_INGREDIENT } from '../../../../../graphql'
import { TunnelBody } from '../styled'
import { ProductContent, ProductImage, StyledProductWrapper } from './styled'
import { LinkIcon } from '../../../../../../../shared/assets/icons'

const LinkedRecipesTunnel = ({ state, closeTunnel }) => {
   const { addTab } = useTabs()
   const [recipes, setRecipes] = React.useState([])

   const { loading } = useSubscription(S_SIMPLE_RECIPES_FROM_INGREDIENT, {
      variables: {
         where: {
            ingredientId: {
               _eq: state.id,
            },
            isArchived: { _eq: false },
            simpleRecipe: {
               isArchived: { _eq: false },
            },
         },
      },
      onSubscriptionData: data => {
         setRecipes(
            data.subscriptionData.data.simpleRecipeIngredientProcessings
         )
      },
   })

   return (
      <>
         <TunnelHeader
            title={`Linked Recipes (${recipes.length})`}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="recipe_create_product_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-create-ingredients-linked-recipes-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {recipes.length ? (
                     <>
                        {recipes.map(r => (
                           <RecipeTile
                              key={r.simpleRecipe.id}
                              title={r.simpleRecipe.name}
                              assets={r.simpleRecipe.assets}
                              onClick={() =>
                                 addTab(
                                    r.simpleRecipe.name,
                                    `/products/recipes/${r.simpleRecipe.id}`
                                 )
                              }
                           />
                        ))}
                     </>
                  ) : (
                     <Filler message="No recipes created from this ingredient yet!" />
                  )}
               </>
            )}
            <Banner id="products-app-ingredients-create-ingredients-linked-recipes-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default LinkedRecipesTunnel

const RecipeTile = ({ assets, title, onClick }) => {
   return (
      <StyledProductWrapper onClick={onClick}>
         <span>
            <LinkIcon size={16} color="#333" />
         </span>
         <ProductContent>
            {Boolean(assets && assets?.images?.length) && (
               <ProductImage src={assets.images[0]} />
            )}
            <Text as="p"> {title} </Text>
         </ProductContent>
      </StyledProductWrapper>
   )
}
