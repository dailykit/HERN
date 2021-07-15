import React from 'react'
import { Tunnel, Tunnels } from '@dailykit/ui'
import { CreateUnitConversion, UnitConversionsListing } from './tunnels'
import { toast } from 'react-toastify'
import { UNIT_CONVERSIONS } from './graphql'
import { useMutation } from '@apollo/react-hooks'
import { logger } from '../../utils'

const LinkConversionsTunnels = ({
   schema,
   table,
   entityId,
   tunnels,
   openTunnel,
   closeTunnel,
   onSave,
}) => {
   const [upsertSupplierItemUnitConversions] = useMutation(
      UNIT_CONVERSIONS.SUPPLIER_ITEMS.CREATE,
      {
         onCompleted: () => {
            toast.success('Unit conversions linked!')
            onSave()
         },
         onError: error => {
            logger(error)
            toast.error('Something went wrong!')
         },
      }
   )

   const [upsertBulkItemUnitConversions] = useMutation(
      UNIT_CONVERSIONS.BULK_ITEMS.CREATE,
      {
         onCompleted: () => {
            toast.success('Unit conversions linked!')
            onSave()
         },
         onError: error => {
            logger(error)
            toast.error('Something went wrong!')
         },
      }
   )

   const [upsertSachetItemUnitConversions] = useMutation(
      UNIT_CONVERSIONS.SACHET_ITEMS.CREATE,
      {
         onCompleted: () => {
            toast.success('Unit conversions linked!')
            onSave()
         },
         onError: error => {
            logger(error)
            toast.error('Something went wrong!')
         },
      }
   )

   const getMutationFunction = (schema, table) => {
      switch (schema) {
         case 'inventory': {
            switch (table) {
               case 'supplierItem':
                  return upsertSupplierItemUnitConversions
               case 'bulkItem':
                  return upsertBulkItemUnitConversions
               case 'sachetItem':
                  return upsertSachetItemUnitConversions
            }
            break
         }
         case 'ingredient': {
         }
      }
   }

   const handleOnSave = options => {
      if (schema && table && entityId) {
         const fn = getMutationFunction(schema, table)
         if (fn) {
            fn({
               variables: {
                  objects: options.map(op => ({
                     entityId,
                     unitConversionId: op.id,
                  })),
               },
            })
         } else {
            toast.error('Incorrect schema or table name!')
         }
      } else {
         toast.error('Not all props were passed in!')
      }
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1}>
            <UnitConversionsListing
               openTunnel={openTunnel}
               closeTunnel={closeTunnel}
               onSave={handleOnSave}
            />
         </Tunnel>
         <Tunnel layer={2}>
            <CreateUnitConversion closeTunnel={closeTunnel} />
         </Tunnel>
      </Tunnels>
   )
}

export default LinkConversionsTunnels
