import React from 'react'
import ReactImageFallback from 'react-image-fallback'

import { formatCurrency } from '../utils'
import { CloseIcon } from '../assets/icons'
import { useConfig } from '../lib'
import { Loader } from './loader'

export const CartProduct = ({ product, isRemovable, onDelete }) => {
   const { buildImageUrl, noProductImage } = useConfig()
   return (
      <li className="hern-cart-product">
         <div className="hern-cart-product__img">
            {product.image ? (
               <ReactImageFallback
                  src={buildImageUrl('100x75', product.image)}
                  fallbackImage={product.image}
                  initialImage={<Loader />}
                  alt={product.name}
                  className="image__thumbnail"
               />
            ) : (
               <img src={noProductImage} alt={product.name} />
            )}
         </div>
         <main className="hern-cart-product__info">
            <p className="hern-cart-product__name" title={product.name}>
               {product.name}
            </p>
            <p className="hern-cart-product__quantity">
               {product.isAddOn && formatCurrency(product.unitPrice)} x
               {product?.quantity || 1}
            </p>
            {!product.isAddOn && product.isAutoAdded && (
               <span className="hern-cart-product__tag">Auto Selected</span>
            )}
            {Boolean(product.addOnPrice) && (
               <span className="hern-cart-product__tag">
                  {product.addOnLabel}&nbsp;
                  {formatCurrency(product.addOnPrice)}
               </span>
            )}
         </main>
         {isRemovable && (
            <section className="hern-cart-product__remove">
               <button
                  className="hern-cart-product__remove__btn"
                  onClick={() => onDelete(product)}
                  title="Remove Product"
               >
                  <CloseIcon
                     size={16}
                     stroke="currentColor"
                     color="rgba(55,65,81,1)"
                  />
               </button>
            </section>
         )}
      </li>
   )
}
