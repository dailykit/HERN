import React from 'react'
import { TruckIcon } from '../../assets/icons'
import { useTabs } from '../../../../shared/providers'
import {
   ActionButton,
   CardContent,
   CardData,
   CardImage,
   CardPrice,
   CardWrapper,
   Flexi,
   FlexiSpaced,
   Lead,
} from './styled'

export default function ProductCard({
   product: {
      id,
      packagingName,
      packagingCompanyBrand: { name: brandName } = {},
      length,
      thickness,
      width,
      LWHUnit,
      packagingPurchaseOptions = [],
      assets = {},
   } = {},
}) {
   const { addTab } = useTabs()
   const openProductDetailsView = () => {
      addTab(packagingName, `/inventory/packaging-hub/product/${id}`)
   }

   return (
      <CardWrapper onClick={openProductDetailsView}>
         <CardContent>
            <CardImage>
               <img
                  style={{ width: '100%', height: '100%' }}
                  src={assets?.images[0]?.url}
                  alt="product"
               />
            </CardImage>
            <CardData>
               <h1>{packagingName}</h1>
               <Lead>
                  by <span style={{ color: '#00a7e1' }}>{brandName}</span>
               </Lead>

               <Flexi style={{ marginTop: '16px' }}>
                  <div>
                     <TruckIcon />
                  </div>
                  <span style={{ width: '8px' }} />
                  <div>
                     <span>Min Purchase Quantity</span>
                     <p>
                        {packagingPurchaseOptions[0]?.quantity || ''}{' '}
                        {packagingPurchaseOptions[0]?.unit || ''}
                     </p>
                  </div>
               </Flexi>
               <FlexiSpaced>
                  <div>
                     <span>Size</span>
                     <p>
                        {length}*{width} {LWHUnit}
                     </p>
                  </div>
                  <div>
                     <span>Thickness</span>
                     <p>
                        {thickness || 'N/A'} {thickness ? LWHUnit : null}
                     </p>
                  </div>
               </FlexiSpaced>

               <CardPrice>
                  Price start from $
                  {packagingPurchaseOptions[0]?.salesPrice || 'N/a'}
               </CardPrice>
            </CardData>
         </CardContent>
         <ActionButton>CREATE PURCHASE ORDE</ActionButton>
      </CardWrapper>
   )
}
