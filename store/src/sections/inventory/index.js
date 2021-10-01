import React from 'react'
import { useRouter } from 'next/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { isClient } from '../../utils'
import { INVENTORY_DETAILS } from '../../graphql'
import { HelperBar, Loader } from '../../components'

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
         <main className="hern-inventory">
            <HelperBar type="info">
               <HelperBar.Title>No such inventory exists!</HelperBar.Title>
            </HelperBar>
         </main>
      )
   }
   return (
      <>
         <main className="hern-inventory">
            <h1 className="hern-inventory__title">
               {inventory?.cartItem?.name}
            </h1>
            <div className="hern-inventory__img__wrapper">
               {inventory?.cartItem.image ? (
                  <img
                     className="hern-inventory__img"
                     src={inventory?.cartItem.image}
                     alt={inventory?.cartItem.name}
                  />
               ) : (
                  'N/A'
               )}
            </div>
         </main>
         <button
            className="hern-inventory__go-back-btn"
            onClick={() => isClient && window.history.go(-1)}
         >
            Go back to menu
         </button>
      </>
   )
}
