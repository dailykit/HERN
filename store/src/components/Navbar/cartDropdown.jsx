import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { CSSTransition } from 'react-transition-group'
import { Divider } from 'antd'
import { useToasts } from 'react-toast-notifications'
import { DropdownWrapper } from './styles'
import { useCustomMutation } from './useCustomMutation'
import { Filler } from '../../components'
import { DeleteIcon } from '../../components/Icons'
import { theme } from '../../theme'
import { isEmpty } from '../../utils'

export default function CartDropdownMenu({ carts, ...props }) {
   const router = useRouter()
   const { CART, EXPERIENCE_BOOKINGS } = useCustomMutation()
   const { addToast } = useToasts()
   const [activeMenu, setActiveMenu] = useState(carts[0]?.id)
   const [menuHeight, setMenuHeight] = useState(null)
   const dropdownRef = useRef(null)

   useEffect(() => {
      setMenuHeight(dropdownRef.current?.firstChild?.offsetHeight || 0 + 30)
   }, [])

   function calcHeight(el) {
      const height = el.offsetHeight
      setMenuHeight(height)
   }

   const checkoutHandler = cartId => {
      router.push(`/checkout?cartId=${cartId}`)
   }
   const deleteHandler = async cartId => {
      console.log('CartId -->', cartId)
      await EXPERIENCE_BOOKINGS.delete.mutation({
         variables: {
            cartId: cartId
         }
      })

      await CART.delete.mutation({
         variables: {
            cartIds: [cartId]
         }
      })
   }

   const DropdownMenuItem = ({ children, onClick }) => {
      return (
         <div className="dropdown-menu-item" onClick={onClick}>
            {children}
         </div>
      )
   }

   if (isEmpty(carts)) {
      return (
         <Filler
            message="Cart is Empty :("
            linkUrl="/experiences"
            linkText="Checkout our Experiences"
         />
      )
   }

   return (
      <DropdownWrapper {...props} ref={dropdownRef}>
         <CSSTransition
            in={activeMenu === carts[0]?.id}
            unmountOnExit
            timeout={500}
            classNames="menu-primary"
            onEnter={calcHeight}
         >
            <div className="dropdown-menu">
               {carts.map((cart, index) => {
                  return (
                     <>
                        <DropdownMenuItem>
                           <img
                              src={
                                 cart?.experienceClass?.experience?.assets
                                    ?.images[0]
                              }
                              alt="cart-img"
                           />
                           <div className="cart-info-wrap">
                              <p className="title">
                                 {cart?.experienceClass?.experience?.title}
                              </p>
                              <div class="cart-action-btn-wrap">
                                 <span
                                    className="cart-action-icon text9"
                                    onClick={e => {
                                       e.stopPropagation()
                                       checkoutHandler(cart?.id)
                                    }}
                                 >
                                    Checkout
                                 </span>
                                 <span
                                    className="cart-action-icon text9"
                                    onClick={e => {
                                       e.stopPropagation()
                                       deleteHandler(cart?.id)
                                    }}
                                 >
                                    <DeleteIcon size="16" color="#fff" />
                                 </span>
                              </div>
                           </div>
                        </DropdownMenuItem>
                        {index !== carts.length - 1 && (
                           <Divider
                              plain
                              style={{
                                 color: theme.colors.textColor4,
                                 margin: 0,
                                 borderTop: `1px solid ${theme.colors.textColor7}`
                              }}
                           />
                        )}
                     </>
                  )
               })}
            </div>
         </CSSTransition>
      </DropdownWrapper>
   )
}
