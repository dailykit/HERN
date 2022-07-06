import React from 'react'
import { useRouter } from 'next/router'

const PageBanner = ({ image, heading, subHeading }) => {
   const router = useRouter()
   const route = router.route

   return (
      <header
         className={
            route === '/[brand]/menu'
               ? 'hern-page-banner__header-two'
               : 'hern-page-banner__header'
         }
      >
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
