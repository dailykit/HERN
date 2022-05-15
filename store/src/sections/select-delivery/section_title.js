import React from 'react'

export const SectionTitle = ({ count, title }) => {
   return (
      <h3 className="hern-delivery__section-title">
         <span>{count}</span>
         {title}
      </h3>
   )
}
