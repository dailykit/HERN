import React from 'react'
import { DashboardTile } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { useTranslation } from 'react-i18next'

import { useTabs } from '../../../../shared/providers'
import { StyledHome, StyledCardList } from './styled'

import { RECIPES_COUNT, PRODUCTS, INGREDIENTS_COUNT } from '../../graphql'
import { Banner } from '../../../../shared/components'
import {
   IngredientsSvg,
   ProductsSvg,
   RecipesSvg,
} from '../../../../shared/assets/illustrationTileSvg'

const address = 'apps.products.views.home.'

const Home = () => {
   const { addTab } = useTabs()
   const { t } = useTranslation()

   const { data: ingredientsData } = useSubscription(INGREDIENTS_COUNT)
   const { data: recipeData } = useSubscription(RECIPES_COUNT)
   const { data: productsData } = useSubscription(PRODUCTS.COUNT)

   return (
      <StyledHome>
         <Banner id="products-app-home-top" />
         <h1>{t(address.concat('products app'))}</h1>
         <StyledCardList>
            <DashboardTile
               title={t(address.concat('products'))}
               count={productsData?.productsAggregate.aggregate.count || '...'}
               conf="All available"
               onClick={() => addTab('Products', '/products/products')}
               tileSvg={<ProductsSvg />}
            />
            <DashboardTile
               title={t(address.concat('recipes'))}
               count={
                  recipeData?.simpleRecipesAggregate.aggregate.count || '...'
               }
               conf="All available"
               onClick={() => addTab('Recipes', '/products/recipes')}
               tileSvg={<RecipesSvg />}
            />
            <DashboardTile
               title={t(address.concat('ingredients'))}
               count={
                  ingredientsData?.ingredientsAggregate.aggregate.count || '...'
               }
               conf="All available"
               onClick={() => addTab('Ingredients', '/products/ingredients')}
               tileSvg={<IngredientsSvg />}
            />
         </StyledCardList>
         <Banner id="products-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
