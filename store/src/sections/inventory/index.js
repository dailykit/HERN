import React from 'react'
import tw, { styled } from 'twin.macro'
import { useRouter } from 'next/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../utils'
import { INVENTORY_DETAILS } from '../../graphql'
import { Loader } from '../../components'

export const Inventory = () => {
   const router = useRouter()
   const { addToast } = useToasts()
   const [inventory, setInventory] = React.useState(null)

   const [getInventory, { loading }] = useLazyQuery(INVENTORY_DETAILS, {
      onCompleted: ({ inventoryProduct }) => {
         setInventory(inventoryProduct)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   React.useEffect(() => {
      let inventoryId = Number(router.query.id)
      let optionId = Number(router.query.option)
      getInventory({
         variables: {
            id: inventoryId,
            args: {
               optionId: optionId,
            },
         },
      })
   }, [router.query, getInventory])

   if (loading) return <Loader inline />

   if (!inventory) {
      return (
         <h1 tw="py-4 text-2xl text-gray-600 text-center">
            No such inventory exists!
         </h1>
      )
   }
   return (
      <>
         <InventoryContainer>
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {inventory?.cartItem?.name}
            </h1>
            <InventoryImage>
               {inventory?.cartItem.image ? (
                  <img
                     src={inventory?.cartItem.image}
                     alt={inventory?.cartItem.name}
                     tw="w-full h-full border-gray-100 object-cover rounded-lg"
                  />
               ) : (
                  'N/A'
               )}
            </InventoryImage>
         </InventoryContainer>
         <Button onClick={() => isClient && window.history.go(-1)}>
            Go back to menu
         </Button>
      </>
   )
}

const InventoryContainer = styled.div`
   margin: auto;
   max-width: 640px;
   padding: 16px 0;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const InventoryImage = styled.div`
   height: 320px;
   @media (max-width: 567px) {
      height: 240px;
   }
`

const Button = styled.button`
   left: 50%;
   bottom: 16px;
   ${tw`fixed bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
`
