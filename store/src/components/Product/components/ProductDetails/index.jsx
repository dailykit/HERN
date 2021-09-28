import React from 'react'
import { Flex } from '@dailykit/ui'
import { Wrapper, Footer } from './styles'
import Counter from '../Counter'
import Button from '../../../Button'
import InlineLoader from '../../../InlineLoader'
import { useUser } from '../../../../Providers'
import { isEmpty, currency } from '../../../../utils'

export default function ProductDetails({
   selectedProduct,
   selectedProductOption,
   handleProductOptionClick,
   productQuantity,
   handleQtyUpdate
}) {
   console.log('selectedProduct', selectedProduct)
   const {
      name = 'N/A',
      assets = {},
      price = 0,
      tags = [],
      type = 'simple',
      description = 'N/A',
      productOptions = [],
      additionalText = '',
      discount = 0
   } = selectedProduct

   const { toggleProductModal } = useUser()

   // if (isEmpty(selectedProduct)) return <InlineLoader />;

   return (
      <>
         <Wrapper>
            <div className="product_img_wrapper">
               <img src={assets?.images[0]} alt="product-img" />
            </div>
            <h1 className="product_name">{name}</h1>
            {type && <div className="product_type">{type}</div>}
            {additionalText && (
               <p className="product_extra_info_text">{additionalText}</p>
            )}
            {description && (
               <p className="product_extra_info_text">{description}</p>
            )}
            {discount > 0 && (
               <div class="product_discount_badge">{discount}% off</div>
            )}
            <h3 className="productOptions_heading">Available Options</h3>
            {type === 'simple' && (
               <>
                  {productOptions.length ? (
                     <>
                        {productOptions.map(productOption => {
                           return (
                              <div
                                 onClick={() =>
                                    handleProductOptionClick(productOption)
                                 }
                                 className={
                                    !isEmpty(selectedProductOption) &&
                                    productOption?.id ===
                                       selectedProductOption?.id
                                       ? 'productOption_wrapper selectedProductOption_wrapper'
                                       : 'productOption_wrapper'
                                 }
                              >
                                 <p>{productOption?.label}</p>
                                 <p>
                                    {currency} {productOption?.price}
                                 </p>
                              </div>
                           )
                        })}
                     </>
                  ) : (
                     <p>&#128542; No Available Options!</p>
                  )}
               </>
            )}
         </Wrapper>
         <Footer>
            <Button
               onClick={e => e.stopPropagation()}
               disabled={isEmpty(selectedProductOption)}
            >
               <Flex
                  padding="0 8px"
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Counter
                     productQuantity={productQuantity}
                     handleQtyUpdate={handleQtyUpdate}
                  />
                  <p
                     onClick={e => {
                        toggleProductModal(false)
                     }}
                  >
                     Add
                  </p>
               </Flex>
            </Button>
         </Footer>
      </>
   )
}
