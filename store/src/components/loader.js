import React from 'react'

const InlineLoader = () => (
   <div className="hern-loader">
      <div />
      <div />
      <div />
      <div />
   </div>
)

export const Loader = ({ inline, component }) => {
   if (inline) return <InlineLoader />
   if (component)
      return (
         <div className="hern-loader__component">
            <InlineLoader />
         </div>
      )
   return (
      <div className="hern-loader__wrapper">
         <InlineLoader />
      </div>
   )
}
