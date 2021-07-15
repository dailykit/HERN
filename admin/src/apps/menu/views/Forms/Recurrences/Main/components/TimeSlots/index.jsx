import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonTile, Form, IconButton } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DeliveryRanges } from '../'
import { logger } from '../../../../../../../../shared/utils'
import { DeleteIcon } from '../../../../../../assets/icons'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { DELETE_TIME_SLOT, UPDATE_TIME_SLOT } from '../../../../../../graphql'
import { Flex } from '../../../styled'
import { TableRecord } from './styled'

const TimeSlots = ({ recurrenceId, timeSlots, openTunnel }) => {
   const { recurrenceDispatch } = React.useContext(RecurrenceContext)
   const { type } = useParams()

   // Mutations
   const [updateTimeSlot] = useMutation(UPDATE_TIME_SLOT, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [deleteTimeSlot] = useMutation(DELETE_TIME_SLOT, {
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
      if (window.confirm('Are you sure you want to delete this time slot?')) {
         deleteTimeSlot({
            variables: {
               id,
            },
         })
      }
   }

   const addTimeSlot = () => {
      recurrenceDispatch({
         type: 'RECURRENCE',
         payload: recurrenceId,
      })
      openTunnel(2)
   }

   return (
      <>
         {Boolean(timeSlots.length) && (
            <>
               {timeSlots.map(timeSlot => (
                  <TableRecord key={timeSlot.id}>
                     <div style={{ padding: '16px' }}>
                        {timeSlot.from} - {timeSlot.to}
                     </div>
                     {type.includes('PICKUP') && (
                        <div style={{ padding: '16px' }}>
                           {type.includes('ONDEMAND')
                              ? timeSlot.pickUpPrepTime
                              : timeSlot.pickUpLeadTime}{' '}
                           mins.
                        </div>
                     )}
                     <Flex
                        direction="row"
                        align="center"
                        style={{ padding: '16px' }}
                     >
                        <Form.Toggle
                           name={`timeSlot-${timeSlot.id}`}
                           value={timeSlot.isActive}
                           onChange={() =>
                              updateTimeSlot({
                                 variables: {
                                    id: timeSlot.id,
                                    set: {
                                       isActive: !timeSlot.isActive,
                                    },
                                 },
                              })
                           }
                        />
                        <IconButton
                           type="ghost"
                           onClick={() => deleteHandler(timeSlot.id)}
                        >
                           <DeleteIcon color=" #FF5A52" />
                        </IconButton>
                     </Flex>
                     {type.includes('DELIVERY') && (
                        <div>
                           <DeliveryRanges
                              timeSlotId={timeSlot.id}
                              mileRanges={timeSlot.mileRanges}
                              openTunnel={openTunnel}
                           />
                        </div>
                     )}
                  </TableRecord>
               ))}
            </>
         )}
         <ButtonTile
            noIcon
            type="secondary"
            text="Add Time Slot"
            onClick={addTimeSlot}
         />
      </>
   )
}

export default TimeSlots
