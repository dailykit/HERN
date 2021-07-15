import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { randomSuffix } from '../../../../../../../shared/utils'
import { TunnelBody, SolidTile } from '../styled'
import { useTabs } from '../../../../../../../shared/providers'
import { PRODUCTS } from '../../../../../graphql'
import { Tooltip, Banner } from '../../../../../../../shared/components'

const address = 'apps.menu.views.listings.productslisting.'

export default function ProductTypeTunnel({ close }) {
   const { t } = useTranslation()
   const { addTab } = useTabs()

   // Mutations
   const [createProduct] = useMutation(PRODUCTS.CREATE, {
      onCompleted: data => {
         toast.success('Product created!')
         addTab(
            data.createProduct.name,
            `/products/products/${data.createProduct.id}`
         )
      },
   })

   const handleCreateProduct = type => {
      const object = {
         name: `${type}-${randomSuffix()}`,
         type,
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
            title={t(address.concat('select type of product'))}
            close={() => close(3)}
            tooltip={
               <Tooltip identifier="products_listing_products_type_tunnel" />
            }
         />
         <TunnelBody>
            <Banner id="products-app-products-product-type-tunnel-top" />
            <SolidTile onClick={() => handleCreateProduct('simple')}>
               <Text as="h1">Simple Product</Text>
               <Text as="subtitle">Simple Product</Text>
            </SolidTile>
            <Spacer size="16px" />
            <SolidTile onClick={() => handleCreateProduct('customizable')}>
               <Text as="h1">{t(address.concat('customizable product'))}</Text>
               <Text as="subtitle">
                  <Trans i18nKey={address.concat('subtitle 3')}>
                     Customizable product has recipe options with one recipe as
                     default
                  </Trans>
               </Text>
            </SolidTile>
            <Spacer size="16px" />
            <SolidTile onClick={() => handleCreateProduct('combo')}>
               <Text as="h1">{t(address.concat('combo product'))}</Text>
               <Text as="subtitle">
                  <Trans i18nKey={address.concat('subtitle 4')}>
                     Advanced product is an item with your recipes, sold as Meal
                     Kits as well as Ready to Eat
                  </Trans>
               </Text>
            </SolidTile>
            <Spacer size="16px" />
            <Banner id="products-app-products-product-type-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}
