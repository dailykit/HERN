import React from 'react'

import PlanProducts from './PlanProducts'
import AddOnProducts from './AddOnProducts'

const Products = ({ noSkip, isCheckout }) => {
   return (
      <section>
         <PlanProducts noSkip={noSkip} isCheckout={isCheckout} />
         <AddOnProducts />
      </section>
   )
}

export default Products
