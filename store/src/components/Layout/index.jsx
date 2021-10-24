import React from 'react'
import Footer from '../Footer'
import Navbar from '../Navbar'

const Layout = ({
   children,
   noHeader,
   navigationMenuItems = [],
   footerHtml = ''
}) => {
   return (
      <>
         {!noHeader && (
            <Navbar
               navigationMenuItems={navigationMenuItems}
               floating={false}
            />
         )}
         {!noHeader && (
            <Navbar navigationMenuItems={navigationMenuItems} floating={true} />
         )}
         {children}
         <Footer footerHtml={footerHtml} />
      </>
   )
}

export default Layout
