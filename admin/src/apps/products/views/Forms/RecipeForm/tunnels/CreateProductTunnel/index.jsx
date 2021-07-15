import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { OptionTile, Spacer, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { useTabs } from '../../../../../../../shared/providers'
import { logger } from '../../../../../../../shared/utils'
import { PRODUCTS, PRODUCT_OPTION_TYPES } from '../../../../../graphql'
import { TunnelBody } from '../styled'

const CreateProductTunnel = ({ state, closeTunnel }) => {
   const { addTab } = useTabs()
   const [productOptionTypes, setProductOptionTypes] = React.useState([])

   const { loading } = useSubscription(PRODUCT_OPTION_TYPES.LIST, {
      onSubscriptionData: data => {
         setProductOptionTypes(data.subscriptionData.data.productOptionTypes)
      },
   })
   const [createProduct, { loading: creatingProduct }] = useMutation(
      PRODUCTS.CREATE,
      {
         onCompleted: data => {
            toast.success('Product created!')
            addTab(
               data.createProduct.name,
               `/products/products/${data.createProduct.id}`
            )
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const createProductFromRecipe = type => {
      if (creatingProduct) return
      const generatedProductOptions = state.simpleRecipeYields.map(y => ({
         label: y.yield.label || `${y.yield.serving} servings`,
         simpleRecipeYieldId: y.id,
         type,
      }))
      const object = {
         type: 'simple',
         name: state.name,
         description: state.description,
         assets: state.assets,
         productOptions: {
            data: generatedProductOptions,
         },
      }
      createProduct({
         variables: {
            object,
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Select Option Type for Product"
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="recipe_create_product_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-recipes-create-recipe-create-product-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {productOptionTypes.map(op => (
                     <>
                        <OptionTile
                           title={op.title}
                           onClick={() => createProductFromRecipe(op.title)}
                        />
                        <Spacer size="16px" />
                     </>
                  ))}
               </>
            )}
            <Banner id="products-app-recipes-create-recipe-create-product-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default CreateProductTunnel
