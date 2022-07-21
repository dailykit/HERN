import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { MenuIcon } from '../assets/icons'
import { onDemandMenuContext } from '../context'
import { useOnClickOutside } from '../utils/useOnClickOutisde'
import * as Scroll from 'react-scroll'
import { useTranslation } from '../context'
import { useConfig } from '../lib'

export const OnDemandMenu = props => {
   // props
   // menuTYpe --> floating or navigation anchor
   const { menuType, categories, showCount, navbarAlignment = 'CENTER' } = props
   const showProductCount = showCount ?? showCount ?? true
   const [showMenuItems, setShowMenuItems] = useState('0')
   const [activeCategory, setActiveCategory] = useState(null)

   const { configOf } = useConfig()
   const headerLayoutStyle =
      configOf('header-navigation', 'navigation')?.headerNavigation?.layout
         ?.value?.value || 'layout-two'
   const ref = React.useRef()
   useOnClickOutside(ref, () => setShowMenuItems('0'))

   const { t, dynamicTrans, locale } = useTranslation()

   // const { isMenuLoading, categories } = onDemandMenu
   // if (isMenuLoading) {
   //    return <p>Loading</p>
   // }
   const currentLang = React.useMemo(() => locale, [locale])
   useEffect(() => {
      if (showMenuItems === '100%') {
         document.querySelector('body').style.overflowY = 'hidden'
      } else {
         document.querySelector('body').style.overflowY = 'auto'
      }
      //for lang. translation
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [showMenuItems, currentLang])

   const navAlignment = React.useMemo(() => {
      const value = {
         CENTER: 'center',
         LEFT: 'flex-start',
         RIGHT: 'flex-end',
      }
      return value[navbarAlignment]
   }, [navbarAlignment])

   if (menuType && menuType === 'navigationAnchorMenu') {
      return (
         <div
            className={classNames('hern-on-demand-menu__navigationAnchor')}
            style={{
               justifyContent: navAlignment,
               top:
                  headerLayoutStyle === 'layout-one'
                     ? 0
                     : 'var(--hern-navigation-menu-height)',
            }}
         >
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
                        key={'menu-list' + index}
                     >
                        <Scroll.Link
                           smooth={true}
                           activeClass="hern-on-demand-menu__navigationAnchor-li--active"
                           to={each.name}
                           spy={true}
                           offset={
                              headerLayoutStyle === 'layout-one' ? -60 : -130
                           }
                        >
                           <span>
                              <span data-translation="true">{each.name}</span>
                              {showProductCount && (
                                 <> ({each?.products?.length})</>
                              )}
                           </span>
                        </Scroll.Link>
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
                  <h3 className="hern-on-demand-menu__heading">
                     Our categories
                  </h3>
                  <ul>
                     {categories.map((each, index) => (
                        <li key={each.name + index}>
                           <Scroll.Link
                              containerId="hern-on-demand-order-container"
                              smooth={true}
                              activeClass="hern-on-demand-menu__li--active "
                              to={each.name}
                              spy={true}
                           >
                              <div onClick={() => setShowMenuItems('0%')}>
                                 <span>
                                    {each.name}{' '}
                                    <span
                                       style={{
                                          display: 'inline-block',
                                          padding: '0.5rem',
                                       }}
                                    ></span>
                                 </span>
                                 {showProductCount && (
                                    <span>{each.products.length}</span>
                                 )}
                              </div>
                           </Scroll.Link>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         )}
      </>
   )
}
