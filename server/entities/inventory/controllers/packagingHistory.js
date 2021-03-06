import { client } from '../../../lib/graphql'
import { GET_PACKAGING } from '../graphql/queries'
import { updatePackaging } from './utils'

export const handlePackagingHistory = async (req, res, next) => {
   try {
      const { quantity, status, packagingId } = req.body.event.data.new
      const { old } = req.body.event.data

      // fetch the packaging (with id === packagingId)
      const { packaging = {} } = await client.request(GET_PACKAGING, {
         id: packagingId
      })

      if (status === 'CANCELLED' && old && old.status === 'PENDING') {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            const set = {
               committed: packaging.committed - Math.abs(quantity)
            }
            await updatePackaging(packagingId, set)
            res.status(200).json({
               ok: true,
               message: 'packaging updated'
            })
            return
         }

         if (quantity > 0) {
            // set bulkItem's awaiting -> - |quantity|
            const set = {
               awaiting: packaging.awaiting - Math.abs(quantity)
            }

            await updatePackaging(packagingId, set)
            res.status(200).json({
               ok: true,
               message: 'packaging updated'
            })
            return
         }
      }

      if (status === 'CANCELLED' && old && old.status === 'COMPLETED') {
         if (quantity < 0) {
            // set bulkItem's committed -> - |quantity|
            const set = {
               onHand: packaging.onHand + Math.abs(quantity),
               consumed: packaging.consumed - Math.abs(quantity)
            }

            await updatePackaging(packagingId, set)
            res.status(200).json({
               ok: true,
               message: 'packaging updated'
            })
            return
         }

         if (quantity > 0) {
            const set = {
               onHand: packaging.onHand - Math.abs(quantity)
            }

            await updatePackaging(packagingId, set)
            res.status(200).json({
               ok: true,
               message: 'packaging updated'
            })
            return
         }
      }

      if (status === 'PENDING' && old && old.status === 'COMPLETED') {
         if (quantity > 0) {
            const set = {
               onHand: packaging.onHand - Math.abs(quantity),
               awaiting: packaging.awaiting + Math.abs(quantity)
            }

            await updatePackaging(packagingId, set)
            res.status(200).json({
               ok: true,
               message: 'packaging updated'
            })
            return
         }

         if (quantity < 0) {
            const set = {
               onHand: bulkItemData.bulkItem.onHand + Math.abs(quantity),
               consumed: bulkItemData.bulkItem.consumed - Math.abs(quantity),
               committed: bulkItemData.bulkItem.committed + Math.abs(quantity)
            }

            await updatePackaging(packagingId, set)
            res.status(200).json({
               ok: true,
               message: 'packaging updated'
            })
            return
         }
      }

      if (status === 'PENDING' && quantity < 0) {
         // update bulkItem's commited field -> +|quantity|
         const set = {
            committed: packaging.committed + Math.abs(quantity)
         }

         await updatePackaging(packagingId, set)
         res.status(200).json({
            ok: true,
            message: 'packaging updated'
         })
         return
      }

      if (status === 'COMPLETED' && quantity < 0) {
         // set bulkItem' commited -> - |quantity|
         //               on-hand -> - |quantity|
         //               consumed -> + |quantity|
         const set = {
            committed: packaging.committed - Math.abs(quantity),
            onHand: packaging.onHand - Math.abs(quantity),
            consumed: packaging.consumed + Math.abs(quantity)
         }

         await updatePackaging(packagingId, set)
         res.status(200).json({
            ok: true,
            message: 'packaging updated'
         })
         return
      }

      if (status === 'PENDING' && quantity > 0) {
         // set bulkItem's awaiting -> + |quantity|
         const set = {
            awaiting: packaging.awaiting + Math.abs(quantity)
         }

         await updatePackaging(packagingId, set)
         res.status(200).json({
            ok: true,
            message: 'packaging updated'
         })
         return
      }

      if (status === 'COMPLETED' && quantity > 0) {
         // set bulkItem's onHand -> + |quantity|
         // set bulkItem's awaiting -> - |awaiting|
         const set = {
            awaiting: packaging.awaiting - Math.abs(quantity),
            onHand: packaging.onHand + Math.abs(quantity)
         }

         await updatePackaging(packagingId, set)
         res.status(200).json({
            ok: true,
            message: 'packaging updated'
         })
         return
      }
   } catch (error) {
      next(error)
   }
}
