import classNames from 'classnames'
import React, { useState } from 'react'
import { onDemandMenuContext } from '../context'
import { useOnClickOutside } from '../utils/useOnClickOutisde'
export const OnDemandMenu = props => {
   // props
   // menuTYpe --> floating or navigation anchor
   const { menuType, categories } = props
   const [showMenuItems, setShowMenuItems] = useState('0')
   const [activeCategory, setActiveCategory] = useState(null)
   const ref = React.useRef()
   useOnClickOutside(ref, () => setShowMenuItems('0'))
   const { onDemandMenu } = React.useContext(onDemandMenuContext)
   // const { isMenuLoading, categories } = onDemandMenu
   // if (isMenuLoading) {
   //    return <p>Loading</p>
   // }
   if (menuType && menuType === 'navigationAnchorMenu') {
      return (
         <div className={classNames('hern-on-demand-menu__navigationAnchor')}>
            <ul>
               {categories.map((each, index) => (
                  <React.Fragment key={index}>
                     <li
                        className={classNames(
                           'hern-on-demand-menu__navigationAnchor-li',
                           {
                              'hern-on-demand-menu__navigationAnchor-li--active':
                                 each.name === activeCategory,
                           }
                        )}
                        onClick={() => {
                           setActiveCategory(each.name)
                        }}
                        key={'menu-list' + index}
                     >
                        <a href={`#hern-product-category-${each.name}`}>
                           <span>{each.name}</span>
                           <span>
                              {' ('}
                              {each.products.length}
                              {')'}
                           </span>
                        </a>
                     </li>
                  </React.Fragment>
               ))}
            </ul>
         </div>
      )
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
