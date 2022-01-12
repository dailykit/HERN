import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonGroup, ButtonTile, Flex, Form, IconButton, SectionTab, SectionTabList, SectionTabPanel, SectionTabPanels, SectionTabs } from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DeliveryRanges } from '../'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { DELETE_TIME_SLOT, UPDATE_TIME_SLOT } from '../../../../../../graphql'
import { SectionTabDay, SectionTabDelete, StyledInsideSectionTab, StyledSectionBottom, StyledSectionTop, StyledTabListHeading } from '../../styled'
import { Switch } from 'antd'
import { DeleteIcon, PlusIcon } from '../../../../../../../../shared/assets/icons'
import { Tabs, Button } from 'antd';
import { parseString } from 'rrule/dist/esm/src/parsestring'
import { TabsAction, TabsHeading, TimeSlotDetails, TimeSlotHeading } from './styled'

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
   // abt design declaration 
   const { TabPane } = Tabs;

   function callback(key) {
      console.log("ant", key);
   }

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
               <TabPane tab={` \n ( ${timeSlot.from} - ${timeSlot.to} )`} key={timeSlot.id} closable={false}>
                  <TimeSlotDetails>
                     <TabsHeading>( {timeSlot.from} - {timeSlot.to} )</TabsHeading>
                     <TabsAction>
                        <Switch
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
                           checkedChildren="Published"
                           unCheckedChildren="UnPublished"
                           defaultChecked
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
         {/* {timeSlots?.length > 0 ? (
            <>
               <SectionTabs>
                  <SectionTabList>
                     <StyledTabListHeading>
                        <div>Time Slot</div>
                        <ButtonGroup>
                           <IconButton
                              type="ghost"
                              size="md"
                              title="Click to add a new time slot"
                              onClick={addTimeSlot}
                              style={{ right: '0.5em' }}
                           >
                              <PlusIcon color="#919699" />
                           </IconButton>
                        </ButtonGroup>
                     </StyledTabListHeading>
                     {timeSlots.map(timeSlot => (
                        <SectionTab key={timeSlot.id}>
                           <StyledInsideSectionTab>
                              <StyledSectionTop>
                                 <SectionTabDay>
                                    <div>
                                       {timeSlot.from} - {timeSlot.to}
                                    </div>
                                    {type.includes('PICKUP') && (
                                       <div >
                                          {type.includes('ONDEMAND')
                                             ? timeSlot.pickUpPrepTime
                                             : timeSlot.pickUpLeadTime}{' '}
                                          mins.
                                       </div>
                                    )}
                                 </SectionTabDay>
                                 <IconButton
                                    type="ghost"
                                    style={SectionTabDelete}
                                    title="Delete Time Slot"
                                    onClick={() => deleteHandler(timeSlot.id)}

                                 >
                                    <DeleteIcon color=" #FF5A52" />
                                 </IconButton>
                              </StyledSectionTop>
                              <StyledSectionBottom style={{ justifyContent: " flex-end" }}>
                                 <Switch
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
                                    checkedChildren="Published"
                                    unCheckedChildren="UnPublished"
                                    defaultChecked
                                    title="Press to change publish type"

                                 />
                              </StyledSectionBottom>
                           </StyledInsideSectionTab>
                        </SectionTab>
                     ))}
                  </SectionTabList>
                  <SectionTabPanels>
                     {timeSlots.map(timeSlot => (
                        <div>
                           {type.includes('DELIVERY') && (
                              <SectionTabPanel key={timeSlot.id} style={{ background: "white" }}>
                                 <DeliveryRanges
                                    timeSlotId={timeSlot.id}
                                    mileRanges={timeSlot.mileRanges}
                                    openTunnel={openTunnel}
                                 />
                              </SectionTabPanel>
                           )}

                        </div>
                     ))}
                  </SectionTabPanels>
               </SectionTabs>
            </>
         ) : (
            <ButtonTile
               type="secondary"
               text="Add Time Slot"
               onClick={addTimeSlot}
            />
         )} */}
      </>
   )
}

export default TimeSlots
