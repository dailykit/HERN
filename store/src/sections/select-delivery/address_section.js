import React from 'react'
import { isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import tw, { styled, css } from 'twin.macro'

import { useDelivery } from './state'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { CheckIcon } from '../../assets/icons'
import { AddressTunnel } from './address_tunnel'
import { Button, HelperBar } from '../../components'
import { getRoute } from '../../utils'

export const AddressSection = () => {
   const router = useRouter()
   const { user } = useUser()
   const { configOf } = useConfig()
   const { state, dispatch } = useDelivery()

   React.useEffect(() => {
      if (
         Array.isArray(user?.platform_customer?.addresses) &&
         !isEmpty(user?.platform_customer?.addresses)
      ) {
         const [address] = user?.platform_customer?.addresses
         addressSelection(address)
      }
   }, [dispatch, user])

   const addressSelection = address => {
      dispatch({ type: 'SET_ADDRESS', payload: address })
   }

   const toggleTunnel = value => {
      dispatch({ type: 'TOGGLE_TUNNEL', payload: value })
   }
   const theme = configOf('theme-color', 'Visual')

   return (
      <>
         <header css={tw`mt-6 mb-3 flex items-center justify-between`}>
            <SectionTitle theme={theme}>Select Address</SectionTitle>
            {user?.platform_customer?.addresses.length > 0 && (
               <Button bg={theme?.accent} onClick={() => toggleTunnel(true)}>
                  Add Address
               </Button>
            )}
         </header>
         {state.address.error && (
            <HelperBar type="error">
               <HelperBar.SubTitle>{state.address.error}</HelperBar.SubTitle>
               <HelperBar.Buttom
                  onClick={() =>
                     router.push(getRoute('/get-started/select-plan'))
                  }
               >
                  Change Plan
               </HelperBar.Buttom>
            </HelperBar>
         )}
         {user?.platform_customer?.addresses.length > 0 ? (
            <AddressList>
               {user?.platform_customer?.addresses.map(address => (
                  <AddressCard
                     key={address.id}
                     onClick={() => addressSelection(address)}
                     className={`${
                        state.address.selected?.id === address.id && 'active'
                     }`}
                  >
                     <AddressCardLeft>
                        <CheckIcon
                           size={18}
                           css={[
                              tw`stroke-current`,
                              state.address.selected?.id === address.id
                                 ? tw`text-green-700`
                                 : tw`text-gray-400`,
                           ]}
                        />
                     </AddressCardLeft>
                     <label onClick={() => addressSelection(address)}>
                        <span>{address.line1}</span>
                        <span>{address.line2}</span>
                        <span>{address.city}</span>
                        <span>{address.state}</span>
                        <span>{address.country}</span>
                        <span>{address.zipcode}</span>
                     </label>
                  </AddressCard>
               ))}
            </AddressList>
         ) : (
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Let's start with adding an address
               </HelperBar.SubTitle>
               <HelperBar.Button onClick={() => toggleTunnel(true)}>
                  Add Address
               </HelperBar.Button>
            </HelperBar>
         )}
         {state.address.tunnel && <AddressTunnel />}
      </>
   )
}

const AddressList = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-1
      md:grid-cols-2
   `}
   grid-auto-rows: minmax(130px, auto);
`

const SectionTitle = styled.h3(
   ({ theme }) => css`
      ${tw`text-green-600 text-xl`}
      ${theme?.accent && `color: ${theme.accent}`}
   `
)

const AddressCard = styled.li`
   ${tw`flex border border-gray-300 text-gray-700 cursor-pointer rounded overflow-hidden hover:(border-2 border-green-700)`}
   label {
      ${tw`p-3 cursor-pointer`}
   }
   span {
      ${tw`block`}
   }
   &.active {
      ${tw`border-2 border-green-700`}
   }
   :hover svg {
      ${tw`text-green-700`}
   }
`

const AddressCardLeft = styled.aside(
   () => css`
      width: 48px;
      ${tw`flex items-center justify-center h-full`}
   `
)
