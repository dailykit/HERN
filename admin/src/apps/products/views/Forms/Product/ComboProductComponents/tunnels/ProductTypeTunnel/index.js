import React from 'react'
import { OptionTile, Spacer, TunnelHeader } from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { Tooltip, Banner } from '../../../../../../../../shared/components'
import { ProductContext } from '../../../../../../context/product'
import { TunnelBody } from '../../../tunnels/styled'

const address =
   'apps.menu.views.forms.product.comboproduct.tunnels.producttypetunnel.'

const ProductTypeTunnel = ({ closeTunnel, openTunnel }) => {
   const { t } = useTranslation()
   const { productDispatch } = React.useContext(ProductContext)

   const select = type => {
      productDispatch({
         type: 'PRODUCT_TYPE',
         payload: type,
      })
      openTunnel(2)
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select product type'))}
            close={() => closeTunnel(1)}
            tooltip={
               <Tooltip identifier="combo_product_products_type_tunnel" />
            }
         />
         <TunnelBody>
            <Banner id="products-app-combo-product-products-type-tunnel-top" />
            <OptionTile
               title="Simple Product"
               onClick={() => select('simple')}
            />
            <Spacer size="16px" />
            <OptionTile
               title="Customizable Product"
               onClick={() => select('customizable')}
            />
            <Banner id="products-app-combo-product-products-type-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ProductTypeTunnel
