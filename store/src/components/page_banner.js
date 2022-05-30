import React from 'react'

const PageBanner = ({ image, heading, subHeading }) => {
   return (
      <header className="hern-page-banner__header">
         <div
            className="hern-page-banner__header__before"
            style={{
               backgroundImage: `url('${image}')`,
            }}
         />
         {heading && (
            <h1 className="hern-page-banner__header__heading">{heading}</h1>
         )}
         {subHeading && (
            <h3 className="hern-page-banner__header__sub-heading">
               {subHeading}
            </h3>
         )}
      </header>
   )
}

export { PageBanner }
