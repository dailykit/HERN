import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonTile, Form, IconButton } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { DeliveryCharges } from '../'
import { logger } from '../../../../../../../../shared/utils'
import { DeleteIcon } from '../../../../../../assets/icons'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { DELETE_MILE_RANGE, UPDATE_MILE_RANGE } from '../../../../../../graphql'
import { Flex } from '../../../styled'
import { TableRecord } from './styled'

const DeliveryRanges = ({ timeSlotId, mileRanges, openTunnel }) => {
   const { recurrenceDispatch } = React.useContext(RecurrenceContext)

   // Mutations
   const [updateMileRange] = useMutation(UPDATE_MILE_RANGE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [deleteMileRange] = useMutation(DELETE_MILE_RANGE, {
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
      if (window.confirm('Are you sure you want to delete this mile range?')) {
         deleteMileRange({
            variables: {
               id,
            },
         })
      }
   }

   const addMileRange = () => {
      recurrenceDispatch({
         type: 'TIME_SLOT',
         payload: timeSlotId,
      })
      openTunnel(3)
   }

   return (
      <>
         {mileRanges.map(mileRange => (
            <TableRecord key={mileRange.id}>
               <div style={{ padding: '8px' }}>
                  {mileRange.from} - {mileRange.to} miles
               </div>
               <div style={{ padding: '8px' }}>
                  {mileRange.leadTime || mileRange.prepTime} mins.
               </div>
               <Flex direction="row" align="center" style={{ padding: '16px' }}>
                  <Form.Toggle
                     name={`mileRange-${mileRange.id}`}
                     value={mileRange.isActive}
                     onChange={() =>
                        updateMileRange({
                           variables: {
                              id: mileRange.id,
                              set: {
                                 isActive: !mileRange.isActive,
                              },
                           },
                        })
                     }
                  />
                  <IconButton
                     type="ghost"
                     onClick={() => deleteHandler(mileRange.id)}
                  >
                     <DeleteIcon color=" #FF5A52" />
                  </IconButton>
               </Flex>
               <div>
                  <DeliveryCharges
                     mileRangeId={mileRange.id}
                     charges={mileRange.charges}
                     openTunnel={openTunnel}
                  />
               </div>
            </TableRecord>
         ))}
         <ButtonTile
            noIcon
            type="secondary"
            text="Add Mile Ranges"
            onClick={addMileRange}
         />
      </>
   )
}

export default DeliveryRanges
