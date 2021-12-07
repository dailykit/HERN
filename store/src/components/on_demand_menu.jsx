import React, { useState } from 'react'
import { onDemandMenuContext } from '../context'
import { useOnClickOutside } from '../utils/useOnClickOutisde'
export const OnDemandMenu = () => {
   const [showMenuItems, setShowMenuItems] = useState('0')
   const ref = React.useRef()
   useOnClickOutside(ref, () => setShowMenuItems('0'))
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   const { isMenuLoading, categories } = onDemandMenu
   if (isMenuLoading) {
      return <p>Loading</p>
   }
   return (
      <>
         <div
            className="hern-on-demand-menu"
            onClick={() => setShowMenuItems('100%')}
         >
            <span className="hern-on-demand-menu-title">MENU</span>
         </div>
         {showMenuItems && (
            <div
               className="hern-on-demand-menu-list-container"
               style={{ height: `${showMenuItems}` }}
            >
               <div ref={ref} className="hern-on-demand-menu-list">
                  <ul>
                     {categories.map((each, index) => (
                        <li
                           onClick={() => setShowMenuItems('0')}
                           key={'menu-list' + index}
                        >
                           <a href={`#hern-product-category-${each.name}`}>
                              <span>{each.name}</span>
                              <span>{each.products.length}</span>
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         )}
      </>
   )
}
