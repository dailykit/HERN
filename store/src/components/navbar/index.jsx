import MessengerIcon from './icons/redirect.svg'
import LeftArrow from './icons/leftArrow.svg'
import React, { useState, useEffect, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import Link from 'next/link'
import { getRoute } from '../../utils'
import { usePayment } from '../../lib'

function NavigationBar({ children, Data }) {
   const { initializePayment } = usePayment()
   return (
      <Navbar>
         {Data.map((menu, index) => {
            if (menu.parentNavigationMenuItemId == null) {
               return (
                  <NavItem key={index} menu={menu}>
                     {menu.childNodes.length > 0 && (
                        <DropdownMenu
                           childMenu={menu}
                           Data={Data}
                        ></DropdownMenu>
                     )}
                  </NavItem>
               )
            }
         })}
         {children}
         <button onClick={() => initializePayment(2373)}>Pay</button>
      </Navbar>
   )
}

function Navbar(props) {
   return (
      <nav className="hern-navbar">
         <ul className="hern-navbar__list">{props.children}</ul>
      </nav>
   )
}

function NavItem({ children, menu }) {
   const [open, setOpen] = useState(false)

   return (
      <li className="hern-navbar__list__item">
         {menu.childNodes.length > 0 ? (
            <span onClick={() => setOpen(!open)}>{menu.label}</span>
         ) : (
            <Link href={getRoute(menu.url)}>{menu.label}</Link>
         )}

         {open && children}
      </li>
   )
}

function DropdownMenu({ childMenu, Data }) {
   const [activeMenu, setActiveMenu] = useState(childMenu.label)
   const [lastRender, setLastRender] = useState([childMenu.label])
   const [menuHeight, setMenuHeight] = useState(null)
   const dropdownRef = useRef(null)

   useEffect(() => {
      setMenuHeight(dropdownRef?.current?.firstChild?.offsetHeight + 25)
   }, [])

   function calcHeight(el) {
      const height = el.offsetHeight
      setMenuHeight(height)
   }

   function DropdownItem({ children, childMenu, goToMenu }) {
      return (
         <>
            <div>
               <div
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     justifyContent: 'space-between',
                     cursor: 'default !important',
                     alignItems: 'center',
                  }}
               >
                  {childMenu &&
                  childMenu.childNodes &&
                  childMenu.childNodes.length > 0 ? (
                     <div
                        style={{
                           color: 'inherit',
                           width: '80%',
                           cursor: 'pointer',
                        }}
                        className="menu-item"
                        onClick={() => {
                           setLastRender(prevState => [...prevState, goToMenu])
                           return goToMenu && setActiveMenu(goToMenu)
                        }}
                     >
                        <span className="span-class">{children} </span>
                     </div>
                  ) : (
                     <span
                        style={{
                           color: 'inherit',
                           width: '80%',
                           cursor: 'pointer',
                        }}
                        className="menu-item link-class"
                     >
                        <Link href={getRoute(childMenu.url)}>{children}</Link>
                     </span>
                  )}

                  <div
                     style={{ width: '20%', cursor: 'pointer' }}
                     className="menu-item"
                  >
                     <Link
                        href={getRoute(childMenu.url)}
                        className="menu-item link-class"
                     >
                        <MessengerIcon />
                     </Link>
                  </div>
               </div>
            </div>
         </>
      )
   }
   'active menu', activeMenu

   return (
      <div
         className="nav-dropdown"
         style={{ height: menuHeight + 25 }}
         ref={dropdownRef}
      >
         {Data.map((menu, index) => {
            return (
               <>
                  <CSSTransition
                     in={lastRender[lastRender.length - 1] === menu.label}
                     timeout={500}
                     classNames="menu-primary"
                     unmountOnExit
                     key={index}
                     onEnter={calcHeight}
                  >
                     <div className="menu">
                        <div
                           style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              cursor: 'default !important',
                              alignItems: 'center',
                           }}
                        >
                           {lastRender.length > 1 && (
                              <div
                                 style={{ width: '10%', cursor: 'pointer' }}
                                 className="menu-item"
                                 onClick={() => {
                                    if (lastRender.length > 1) {
                                       const newRen = [...lastRender]
                                       newRen.pop()
                                       setLastRender(newRen)
                                       return
                                    }
                                 }}
                              >
                                 <span style={{ width: '100%' }}>
                                    <LeftArrow />
                                 </span>
                              </div>
                           )}
                           <div
                              style={{ color: 'inherit', width: '60%' }}
                              className="menu-item"
                           >
                              {/* <h3>{menu.label}</h3> */}
                              <span
                                 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                 }}
                              >
                                 {menu.label}
                              </span>
                           </div>
                           <div
                              style={{ width: '20%', cursor: 'pointer' }}
                              className="menu-item"
                           >
                              <Link
                                 href={getRoute(menu.url)}
                                 className="menu-item link-class"
                              >
                                 <MessengerIcon />
                              </Link>
                           </div>
                        </div>
                        {menu.childNodes.map((childMenu, index) => {
                           return (
                              <DropdownItem
                                 childMenu={childMenu}
                                 key={index}
                                 goToMenu={childMenu.label}
                              >
                                 {childMenu.label}
                              </DropdownItem>
                           )
                        })}
                     </div>
                  </CSSTransition>
               </>
            )
         })}
      </div>
   )
}

export default NavigationBar
