import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonGroup, ButtonTile, ComboButton, Form, IconButton, SectionTab, SectionTabList, SectionTabPanel, SectionTabPanels, SectionTabs } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { DeliveryCharges } from '../'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { DELETE_MILE_RANGE, UPDATE_MILE_RANGE } from '../../../../../../graphql'
import { Flex } from '../../../styled'
import { DeleteIcon, PlusIcon } from '../../../../../../../../shared/assets/icons'
import { Switch } from 'antd'
import { StyledCardAction, StyledContext, StyledHeading, StyledHeadingAction, StyledHeadingText } from './styled'

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
         {mileRanges?.length > 0 ? (
            <>

               <SectionTabs sectionTabListWidth={"365px"}>
                  <SectionTabList>
                     <StyledHeading>
                        <StyledHeadingText>
                           Delivery Area
                        </StyledHeadingText>
                        <StyledHeadingAction>
                           <ButtonGroup>
                              <IconButton
                                 type="ghost"
                                 size="md"
                                 title="Click to add a delivery area"
                                 onClick={addMileRange}
                                 width="auto"
                                 height="auto"
                              >
                                 <PlusIcon color="#919699" />
                              </IconButton>
                           </ButtonGroup>
                        </StyledHeadingAction>
                     </StyledHeading>
                     {mileRanges.map(mileRange => (
                        <SectionTab
                           key={mileRange.id}
                           dataSelectedBoxShadow={"0px 1px 8px rgba(0, 0, 0, 0.1)"}
                           borderRadius={"4px"}
                           dataSelectedBorder={"2px solid #367BF5"}
                           height={"auto"}
                           width={"24em"}
                           padding={"0.5em"}
                        >
                           <Flex>
                              <StyledContext>
                                 <div>Prep Time</div>
                                 <div>{mileRange.leadTime || mileRange.prepTime} mins.</div>
                              </StyledContext>
                              <StyledContext>
                                 <div>Mile Range</div>
                                 <div> {mileRange.from} - {mileRange.to}</div>
                              </StyledContext>
                              <StyledContext>
                                 <div>Delivery Type</div>
                                 <div>{mileRange.distanceType}</div>
                              </StyledContext>
                              <StyledContext>
                                 <div>Zipcodes</div>
                                 <div>{mileRange?.zipcodes?.zipcodes.map(x => <span>{x}, </span>)}</div>
                              </StyledContext>
                              <StyledContext>
                                 <div>Geo-Boundary</div>
                                 <div>{mileRange?.geoBoundary?.geoBoundaries.map(boundary => <span>{<span>({boundary.latitude},{boundary.longitude}) </span>}</span>)}</div>
                              </StyledContext>
                              <StyledCardAction>
                                 <Switch
                                    name={`mileRange-${mileRange.id}`}
                                    value={mileRange.isActive}
                                    checkedChildren="Published"
                                    unCheckedChildren="UnPublished"
                                    defaultChecked
                                    title="Press to change publish type"
                                    onChange={() =>
                                       updateMileRange({
                                          variables: {
                                             id: mileRange.id,
                                             set: {
                                                isActive:
                                                   !mileRange.isActive,
                                             },
                                          },
                                       })
                                    }
                                 />
                                 <IconButton
                                    type="ghost"
                                    title="Delete Delivery Area"
                                    onClick={() =>
                                       deleteHandler(mileRange.id)
                                    }
                                 >
                                    <DeleteIcon color=" #FF5A52" />
                                 </IconButton>
                              </StyledCardAction>
                           </Flex>
                        </SectionTab>
                     ))}
                  </SectionTabList>
                  <SectionTabPanels>
                     {mileRanges.map(mileRange => (
                        <div>
                           <SectionTabPanel key={mileRange.id} style={{ background: "white" }}>
                              <DeliveryCharges
                                 mileRangeId={mileRange.id}
                                 charges={mileRange.charges}
                                 openTunnel={openTunnel}
                              />
                           </SectionTabPanel>
                        </div>
                     ))}
                  </SectionTabPanels>
               </SectionTabs>
            </>
         ) : (
            <ButtonTile
               type="secondary"
               text="Add Mile Ranges"
               onClick={addMileRange}
            />
         )}
      </>

   )
}

export default DeliveryRanges
