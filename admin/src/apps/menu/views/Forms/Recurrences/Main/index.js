import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   ComboButton,
   Form,
   IconButton,
   PlusIcon,
   SectionTab,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
   SectionTabs,
   Tag,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { rrulestr } from 'rrule'
import {
   ErrorBoundary,
   InlineLoader,
   Tooltip,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import {
   RecurrenceContext,
   reducers,
   state as initialState,
} from '../../../../context/recurrence'
import {
   DELETE_RECURRENCE,
   RECURRENCES,
   UPDATE_RECURRENCE,
} from '../../../../graphql'
import { Container, Flex, Grid } from '../styled'
import { TimeSlots } from './components'
import {
   SectionTabDay,
   SectionTabDelete,
   SectionTabLink,
   StyledInsideSectionTab,
   StyledSectionBottom,
   StyledSectionTab,
   StyledSectionTop,
   TableHeader,
   TableRecord,
} from './styled'
import {
   BrandsTunnel,
   ChargesTunnel,
   MileRangeTunnel,
   ReccurenceTunnel,
   TimeSlotTunnel,
} from './tunnels'
import { DeleteIcon } from '../../../../../../shared/assets/icons'
import { Switch } from 'antd'

const Main = () => {
   const [recurrences, setRecurrences] = React.useState(undefined)
   const { type } = useParams()
   const [recurrenceState, recurrenceDispatch] = React.useReducer(
      reducers,
      initialState
   )
   const [isClicked, setIsClicked] = React.useState(false)
   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   // Subscription
   const { loading, error } = useSubscription(RECURRENCES, {
      variables: {
         type,
      },
      onSubscriptionData: data => {
         setRecurrences(data.subscriptionData.data.recurrences)
      },
   })

   // Mutations
   const [updateRecurrence] = useMutation(UPDATE_RECURRENCE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [deleteRecurrence] = useMutation(DELETE_RECURRENCE, {
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
      if (window.confirm('Are you sure you want to delete this recurrence?')) {
         deleteRecurrence({
            variables: {
               id,
            },
         })
      }
   }

   const linkWithBrands = recurrenceId => {
      recurrenceDispatch({
         type: 'RECURRENCE',
         payload: recurrenceId,
      })
      openTunnel(5)
   }

   if (!loading && error) return <ErrorBoundary rootRoute="/apps/menu" />

   return (
      <RecurrenceContext.Provider
         value={{ recurrenceState, recurrenceDispatch }}
      >
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <ReccurenceTunnel closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={2} size="sm">
               <TimeSlotTunnel closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={3} size="md">
               <MileRangeTunnel closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={4} size="sm">
               <ChargesTunnel closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={5} size="lg">
               <BrandsTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Container
            position="fixed"
            height="100vh"
            style={{ overflowY: 'scroll', width: '100%' }}
         >
            <Container
               paddingX="32"
               paddingY="16"
               bg="#fff"
               position="fixed"
               width="100%"
               style={{ zIndex: '10' }}
            >
               <Flex direction="row" align="center">
                  <Grid cols="2" style={{ alignItems: 'center' }}>
                     <Text as="h1">Recurrences</Text>
                     <div as="title">
                        {type.split('_').map(word => (
                           <Tag>{word[0] + word.slice(1).toLowerCase()}</Tag>
                        ))}
                     </div>
                  </Grid>
                  <ComboButton type="solid" onClick={() => openTunnel(1)}>
                     <PlusIcon /> Create Recurrence
                  </ComboButton>
               </Flex>
            </Container>
            {loading ? (
               <InlineLoader />
            ) : (
               <Container top="80" paddingX="32" bottom="64">
                  {Boolean(recurrences?.length) && (
                     <>
                        <TableHeader>
                           <Flex
                              direction="row"
                              align="center"
                              justify="flex-start"
                           >
                              Recurrences
                              <Tooltip identifier="recurrences_table_recurrences" />
                           </Flex>
                           <Flex
                              direction="row"
                              align="center"
                              justify="flex-start"
                           >
                              Availability
                              <Tooltip identifier="recurrences_table_availability" />
                           </Flex>
                           <Flex
                              direction="row"
                              align="center"
                              justify="flex-start"
                           >
                              Time Slots
                              <Tooltip identifier="recurrences_table_time_slots" />
                           </Flex>
                           {type.includes('PICKUP') && (
                              <Flex
                                 direction="row"
                                 align="center"
                                 justify="flex-start"
                              >
                                 {type.includes('PREORDER') ? 'Lead' : 'Prep'}{' '}
                                 Time
                                 <Tooltip
                                    identifier={
                                       type.includes('PREORDER')
                                          ? 'recurrences_table_lead_time'
                                          : 'recurrences_table_prep_time'
                                    }
                                 />
                              </Flex>
                           )}
                           <Flex
                              direction="row"
                              align="center"
                              justify="flex-start"
                           >
                              Availability
                              <Tooltip identifier="recurrences_table_availability" />
                           </Flex>
                           {type.includes('DELIVERY') && (
                              <>
                                 <Flex
                                    direction="row"
                                    align="center"
                                    justify="flex-start"
                                 >
                                    Delivery Range
                                    <Tooltip identifier="recurrences_table_delivery_range" />
                                 </Flex>
                                 <Flex
                                    direction="row"
                                    align="center"
                                    justify="flex-start"
                                 >
                                    {type.includes('PREORDER')
                                       ? 'Lead'
                                       : 'Prep'}{' '}
                                    Time
                                    <Tooltip
                                       identifier={
                                          type.includes('PREORDER')
                                             ? 'recurrences_table_lead_time'
                                             : 'recurrences_table_prep_time'
                                       }
                                    />
                                 </Flex>
                                 <Flex
                                    direction="row"
                                    align="center"
                                    justify="flex-start"
                                 >
                                    Availability
                                    <Tooltip identifier="recurrences_table_availability" />
                                 </Flex>
                                 <Flex
                                    direction="row"
                                    align="center"
                                    justify="flex-start"
                                 >
                                    Order Value
                                    <Tooltip identifier="recurrences_table_order_value" />
                                 </Flex>
                                 <Flex
                                    direction="row"
                                    align="center"
                                    justify="flex-start"
                                 >
                                    Charges
                                    <Tooltip identifier="recurrences_table_charges" />
                                 </Flex>
                              </>
                           )}
                        </TableHeader>

                        <SectionTabs>
                           <SectionTabList>
                              {recurrences.map(recurrence => (
                                 <SectionTab key={recurrence.id}>
                                    <StyledInsideSectionTab>
                                       <StyledSectionTop>
                                          <SectionTabDay>
                                             {rrulestr(recurrence.rrule)
                                                .toText()
                                                .replace(/^\w/, char =>
                                                   char.toUpperCase()
                                                )}
                                          </SectionTabDay>
                                          <IconButton
                                             type="ghost"
                                             style={SectionTabDelete}
                                             onClick={() =>
                                                deleteHandler(recurrence.id)
                                             }
                                          >
                                             <DeleteIcon color=" #FF5A52" />
                                          </IconButton>
                                       </StyledSectionTop>
                                       <StyledSectionBottom>
                                          <TextButton
                                             type="ghost"
                                             size="sm"
                                             style={SectionTabLink}
                                             onClick={() =>
                                                linkWithBrands(recurrence.id)
                                             }
                                          >
                                             Link with Brands
                                          </TextButton>
                                          <Switch
                                             name={`recurrence-${recurrence.id}`}
                                             value={recurrence.isActive}
                                             checkedChildren="Published"
                                             unCheckedChildren="UnPublished"
                                             defaultChecked
                                             onChange={() =>
                                                updateRecurrence({
                                                   variables: {
                                                      id: recurrence.id,
                                                      set: {
                                                         isActive:
                                                            !recurrence.isActive,
                                                      },
                                                   },
                                                })
                                             }
                                          />
                                       </StyledSectionBottom>
                                    </StyledInsideSectionTab>
                                 </SectionTab>
                              ))}
                           </SectionTabList>
                           <SectionTabPanels>
                              {recurrences.map(recurrence => (
                                 <SectionTabPanel key={recurrence.id}>
                                    <TimeSlots
                                       recurrenceId={recurrence.id}
                                       timeSlots={recurrence.timeSlots}
                                       openTunnel={openTunnel}
                                    />
                                 </SectionTabPanel>
                              ))}
                           </SectionTabPanels>
                        </SectionTabs>
                     </>
                  )}
                  <ButtonTile
                     type="primary"
                     size="lg"
                     text="Add Recurrence"
                     onClick={() => openTunnel(1)}
                  />
               </Container>
            )}
         </Container>
      </RecurrenceContext.Provider>
   )
}

export default Main
