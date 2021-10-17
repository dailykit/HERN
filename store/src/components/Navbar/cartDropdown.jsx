import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { CSSTransition } from 'react-transition-group'
import { useMutation } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import { DropdownWrapper } from './styles'
import { useCustomMutation } from './useCustomMutation'
import { Filler } from '../../components'
import { DeleteIcon } from '../../components/Icons'
import { DELETE_EXPERIENCE_BOOKINGS, DELETE_CART } from '../../graphql'

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
               {carts.length > 0 ? (
                  carts.map(cart => {
                     return (
                        <DropdownMenuItem
                           onClick={() =>
                              router.push(`/checkout?cartId=${cart?.id}`)
                           }
                        >
                           <img
                              src={
                                 cart?.experienceClass?.experience?.assets
                                    ?.images[0]
                              }
                              alt="cart-img"
                           />
                           <p className="title">
                              {cart?.experienceClass?.experience?.title}
                           </p>
                           <span
                              className="icon-right"
                              onClick={e => {
                                 e.stopPropagation()
                                 deleteHandler(cart?.id)
                              }}
                           >
                              <DeleteIcon size="18" color="#fff" />
                           </span>
                        </DropdownMenuItem>
                     )
                  })
               ) : (
                  <Filler
                     message="Cart is Empty :("
                     linkUrl="/experiences"
                     linkText="Checkout our Experiences"
                  />
               )}
            </div>
         </CSSTransition>
      </DropdownWrapper>
   )
}
