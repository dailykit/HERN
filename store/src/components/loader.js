import React from 'react'

const InlineLoader = () => (
   <div className="hern-loader">
      <div />
      <div />
      <div />
      <div />
   </div>
)

export const Loader = ({ inline }) => {
   if (inline) return <InlineLoader />
   return (
      <div className="hern-loader__wrapper">
         <InlineLoader />
      </div>
   )
}
