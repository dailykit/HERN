import React from 'react'

export const Loader = ({ inline, component, type = 'default' }) => {
   if (inline) return <InlineLoader />
   if (component)
      return (
         <div className="hern-loader__component">
            <InlineLoader />
         </div>
      )
   return <div className="hern-loader__wrapper">{getLoader(type)}</div>
}
const InlineLoader = () => (
   <div className="hern-loader">
      <div />
      <div />
      <div />
      <div />
   </div>
)
const getLoader = type => {
   switch (type) {
      case 'cart-loading':
         return <img src="/assets/gifs/cart_loader.gif" />
      case 'order-loading':
         return <img src="/assets/gifs/pan_loader.gif" />
      default:
         return (
            <div className="hern-loader__wrapper">
               <InlineLoader />
            </div>
         )
   }
}
