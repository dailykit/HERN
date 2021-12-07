import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { MenuIcon } from '../assets/icons'
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

   // const { isMenuLoading, categories } = onDemandMenu
   // if (isMenuLoading) {
   //    return <p>Loading</p>
   // }

   useEffect(() => {
      if (showMenuItems === '100%') {
         document.querySelector('body').style.overflowY = 'hidden'
      } else {
         document.querySelector('body').style.overflowY = 'auto'
      }
   }, [showMenuItems])

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
                        onClick={e => {
                           e.preventDefault()
                           setActiveCategory(each.name)
                           document
                              .getElementById(
                                 `hern-product-category-${each.name}`
                              )
                              .scrollIntoView({
                                 behavior: 'smooth',
                                 block: 'start',
                              })
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
            <MenuIcon />
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
                           onClick={e => {
                              setShowMenuItems('0')
                              e.preventDefault()
                              document
                                 .getElementById(
                                    `hern-product-category-${each.name}`
                                 )
                                 .scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                 })
                           }}
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
