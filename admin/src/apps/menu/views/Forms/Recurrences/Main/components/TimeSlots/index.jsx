import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonGroup, ButtonTile, Flex, Form, IconButton, SectionTab, SectionTabList, SectionTabPanel, SectionTabPanels, SectionTabs } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DeliveryRanges } from '../'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { DELETE_TIME_SLOT, UPDATE_TIME_SLOT } from '../../../../../../graphql'
import { Switch } from 'antd'
import { DeleteIcon, PlusIcon } from '../../../../../../../../shared/assets/icons'
import { Tabs, Button } from 'antd';
import { TabsAction, TabsHeading, TimeSlotDetails, TimeSlotHeading } from './styled'
import moment from 'moment'

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
   // ant design declaration 
   const { TabPane } = Tabs;

   function callback(key) {
      console.log("ant", key);
   }
   // time format

   const TimeType = ({ timeSlot }) => {
      if (moment(timeSlot.to, "HH:mm:ss").isBefore(moment("09:00:00", "HH:mm:ss")) &&
         moment(timeSlot.from, "HH:mm:ss").isSameOrAfter(moment("04:00:00", "HH:mm:ss"))) {
         return "Early Morning"
      }
      else if (moment(timeSlot.from, "HH:mm:ss").isSameOrAfter(moment("09:00:00", "HH:mm:ss")) &&
         moment(timeSlot.to, "HH:mm:ss").isSameOrBefore(moment("12:00:00", "HH:mm:ss"))) {
         return "Morning"
      }
      else if (moment(timeSlot.from, "HH:mm:ss").isSameOrAfter(moment("12:00:01", "HH:mm:ss")) &&
         moment(timeSlot.to, "HH:mm:ss").isSameOrBefore(moment("16:00:00", "HH:mm:ss"))) {
         return "Noon"
      }
      else if (moment(timeSlot.from, "HH:mm:ss").isSameOrAfter(moment("16:00:01", "HH:mm:ss")) &&
         moment(timeSlot.to, "HH:mm:ss").isSameOrBefore(moment("19:00:00", "HH:mm:ss"))) {
         return "Evening"
      }
      else if (moment(timeSlot.from, "HH:mm:ss").isSameOrAfter(moment("19:00:01", "HH:mm:ss")) &&
         moment(timeSlot.to, "HH:mm:ss").isSameOrBefore(moment("22:00:00", "HH:mm:ss"))) {
         return "Night"
      }
      else if (moment(timeSlot.from, "HH:mm:ss").isSameOrAfter(moment("22:00:01", "HH:mm:ss")) &&
         moment(timeSlot.to, "HH:mm:ss").isSameOrBefore(moment("04:00:00", "HH:mm:ss"))) {
         return "Late Night"
      }
      else {
         return "Specific Time Slot"
      }
   }
   // console.log("timeslot", timeSlots);
   return (
      <>
         <TimeSlotHeading>
            Time Slots
         </TimeSlotHeading>
         <Tabs
            type="editable-card"
            onChange={callback}
            onEdit={addTimeSlot}
         >
            {timeSlots.map(timeSlot => (
               <TabPane tab={`${TimeType({ timeSlot })} \n(${timeSlot.from} - ${timeSlot.to})`} key={timeSlot.id} closable={false}>
                  <TimeSlotDetails>
                     <TabsHeading>
                        <TimeType timeSlot={timeSlot} />
                        <spam> ( {timeSlot.from} - {timeSlot.to} )</spam>
                     </TabsHeading>
                     <TabsAction>
                        <Switch
                           name={`timeSlot-${timeSlot.id}`}
                           value={timeSlot.isActive}
                           checked={timeSlot.isActive}
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
                           checkedChildren="Published"
                           unCheckedChildren="UnPublished"
                           title="Press to change publish type"

                        />
                        <IconButton
                           type="ghost"
                           title="Delete Time Slot"
                           onClick={() => deleteHandler(timeSlot.id)}
                        >
                           <DeleteIcon color=" #FF5A52" />
                        </IconButton>
                     </TabsAction>
                  </TimeSlotDetails>
                  {type.includes('DELIVERY') && (
                     <Flex key={timeSlot.id} style={{ marginTop: "10px" }} >
                        <DeliveryRanges
                           timeSlotId={timeSlot.id}
                           mileRanges={timeSlot.mileRanges}
                           openTunnel={openTunnel}
                        />
                     </Flex>
                  )}

               </TabPane>
            ))}

         </Tabs>
      </>
   )
}

export default TimeSlots
