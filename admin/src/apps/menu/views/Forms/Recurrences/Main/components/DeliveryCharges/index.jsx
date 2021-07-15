import React from 'react'
import { ButtonTile, IconButton } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'

import { TableRecord } from './styled'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { Flex } from '../../../styled'
import { DeleteIcon, EditIcon } from '../../../../../../assets/icons'
import { DELETE_CHARGE } from '../../../../../../graphql'
import { currencyFmt, logger } from '../../../../../../../../shared/utils'

const DeliveryCharges = ({ mileRangeId, charges, openTunnel }) => {
   const { recurrenceDispatch } = React.useContext(RecurrenceContext)

   // Mutations
   const [deleteCharge] = useMutation(DELETE_CHARGE, {
      onCompleted: () => {
         toast.success('Deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const deleteHandler = id => {
      if (window.confirm('Are you sure you want to delete this charge?')) {
         deleteCharge({
            variables: {
               id,
            },
         })
      }
   }

   const addCharge = () => {
      recurrenceDispatch({
         type: 'CHARGE',
         payload: undefined,
      })
      recurrenceDispatch({
         type: 'MILE_RANGE',
         payload: mileRangeId,
      })
      openTunnel(4)
   }

   const updateCharge = charge => {
      recurrenceDispatch({
         type: 'CHARGE',
         payload: charge,
      })
      openTunnel(4)
   }

   return (
      <>
         {charges.map(charge => (
            <TableRecord key={charge.id}>
               <div style={{ padding: '8px' }}>
                  {currencyFmt(Number(charge.orderValueFrom) || 0)} -{' '}
                  {currencyFmt(Number(charge.orderValueUpto) || 0)}
               </div>
               <div style={{ padding: '8px' }}>
                  {currencyFmt(Number(charge.charge) || 0)}
               </div>
               <Flex direction="row" align="center" style={{ padding: '8px' }}>
                  <IconButton type="ghost" onClick={() => updateCharge(charge)}>
                     <EditIcon color="#00A7E1" />
                  </IconButton>
                  <IconButton
                     type="ghost"
                     onClick={() => deleteHandler(charge.id)}
                  >
                     <DeleteIcon color="#FF5A52" />
                  </IconButton>
               </Flex>
            </TableRecord>
         ))}
         <ButtonTile
            noIcon
            type="secondary"
            text="Add Delivery Charge"
            onClick={addCharge}
         />
      </>
   )
}

export default DeliveryCharges
