import React from 'react'
import Footer from '../Footer'
import Navbar from '../Navbar'

const Layout = ({ children, noHeader, navigationMenuItems = [] }) => {
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
         {/* <Footer /> */}
      </>
   )
}

export default Layout
