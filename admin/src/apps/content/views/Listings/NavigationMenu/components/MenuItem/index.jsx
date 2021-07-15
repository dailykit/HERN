import React, { useState, useContext, useEffect, useRef } from 'react'
import { Form, ComboButton, IconButton } from '@dailykit/ui'
import { StyledWrapper } from './styles'
import Popup from '../Popup'
import NavMenuContext from '../../../../../context/NavMenu'
import { useNavbarMenu } from '../../../../../context/Mutation'
import {
   ChevronRight,
   ChevronDown,
   DeleteIcon,
} from '../../../../../../../shared/assets/icons'
import { randomSuffix } from '../../../../../../../shared/utils'
import { toggleNode } from '../../../../../utils'

export default function MenuItem({ menuItem }) {
   const { createMenuItem, updateMenuItem, deleteMenuItem } = useNavbarMenu()
   const [navMenuContext, setNavMenuContext] = useContext(NavMenuContext)
   const { menuId } = navMenuContext
   const [isPopupActive, setIsPopupActive] = useState(false)
   const [isChildVisible, setIsChildVisible] = useState(
      menuItem?.isChildOpen || false
   )
   const [label, setLabel] = useState(menuItem?.label || '')
   const [url, setUrl] = useState(menuItem?.url || '')
   const wrapperRef = useRef(null)
   const showPopup = () => {
      setIsPopupActive(prev => !prev)
   }
   const onToggle = async () => {
      setIsChildVisible(prev => !prev)
      // console.log(menuItem, navMenuContext)
      const mutated = await toggleNode(navMenuContext.menuItems, menuItem.id)
      console.log('mutationllll', mutated)
      setNavMenuContext({
         ...navMenuContext,
         menuItems: mutated,
      })
   }

   // create menu item handler
   const createMenuItemHandler = type => {
      createMenuItem({
         variables: {
            label: `label-${randomSuffix()}`,
            navigationMenuId: menuId,
            parentNavigationMenuItemId:
               type === 'childItem' ? menuItem.id : null,
         },
      })
   }

   // update menu item handler

   const onBlurHandler = e => {
      const { name, value } = e.target
      updateMenuItem({
         variables: {
            menuItemId: menuItem.id,
            _set: {
               [name]: value,
            },
         },
      })
   }

   // delete menu item handler
   const deleteMenuItemHandler = () => {
      deleteMenuItem({
         variables: {
            menuItemId: menuItem.id,
         },
      })
   }

   useEffect(() => {
      // if clicked on outside of element close popup
      function handleClickOutside(event) {
         if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setIsPopupActive(false)
         }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
         // Unbind the event listener on clean up
         document.removeEventListener('mousedown', handleClickOutside)
      }
   }, [wrapperRef])

   return (
      <StyledWrapper isPopupActive={isPopupActive} ref={wrapperRef}>
         <div className="menuItemDiv">
            <div className="menuContent-left">
               <span className="chevronIcon" onClick={onToggle}>
                  {isChildVisible ? (
                     <ChevronDown size="24px" color="#555b6e" />
                  ) : (
                     <ChevronRight size="24px" color="#555b6e" />
                  )}
               </span>
               <div className="menu-left-option">
                  <Form.Text
                     name="label"
                     onBlur={onBlurHandler}
                     onChange={e => setLabel(e.target.value)}
                     value={label}
                     placeholder="Menu item label"
                     textAlign="left"
                     fontSize="16px"
                     padding="10px"
                     height="40px"
                  />
               </div>
            </div>
            <div className="menuContent-right">
               <div className="menuContent-right-item">
                  <div className="menu-right-option">
                     <Form.Text
                        name="url"
                        onBlur={onBlurHandler}
                        onChange={e => setUrl(e.target.value)}
                        value={url}
                        placeholder="URL"
                        textAlign="left"
                        fontSize="16px"
                        padding="10px"
                        height="40px"
                     />
                  </div>
                  <div className="action" id="actionOption">
                     <ComboButton type="ghost" onClick={showPopup}>
                        Action
                        <ChevronDown size="24px" color="#555b6e" />
                     </ComboButton>
                     <IconButton type="ghost" onClick={deleteMenuItemHandler}>
                        <DeleteIcon size="24px" color="#555b6e" />
                     </IconButton>
                  </div>
               </div>
            </div>
         </div>
         <Popup
            createMenuItemHandler={createMenuItemHandler}
            isPopupActive={isPopupActive}
         />
      </StyledWrapper>
   )
}
