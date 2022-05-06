import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonGroup,
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
   StyledTabListHeading,
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
   console.log('new recurrences finding::', recurrences)
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

   // hover on toggle and delete icon
   const [mouseState, setMouseState] = React.useState({
      isHovered: {},
   })
   const [mouseClickedState, setMouseClickedState] = React.useState({
      isClicked: { [0]: true },
   })
   // console.log(mouseState)
   const handleMouseEnter = index => {
      setMouseState({
         isHovered: {
            [index]: true,
         },
      })
   }
   const handleMouseLeave = index => {
      setMouseState({
         isHovered: {
            [index]: false,
         },
      })
   }
   const handleMouseClicked = index => {
      setMouseClickedState({
         isClicked: {
            [index]: true,
         },
      })
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
            <Tunnel layer={2} size="md">
               <TimeSlotTunnel closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={3} size="md">
               <MileRangeTunnel closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={4} size="md">
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
                     <PlusIcon color="#f3f3f3" /> Create Recurrence
                  </ComboButton>
               </Flex>
            </Container>
            {loading ? (
               <InlineLoader />
            ) : (
               <Container
                  top="80"
                  paddingX="32"
                  bottom="64"
                  style={{ paddingBottom: '54px' }}
               >
                  {recurrences?.length > 0 ? (
                     <>
                        <SectionTabs>
                           <SectionTabList>
                              <StyledTabListHeading>
                                 <div>Recurrence</div>
                                 <ButtonGroup>
                                    <IconButton
                                       type="ghost"
                                       size="md"
                                       title="Click to add a new recurrence"
                                       onClick={() => openTunnel(1)}
                                       style={{ right: '0.5em' }}
                                    >
                                       <PlusIcon color="#919699" />
                                    </IconButton>
                                 </ButtonGroup>
                              </StyledTabListHeading>
                              {recurrences.map((recurrence, index) => (
                                 <SectionTab
                                    key={recurrence.id}
                                    dataSelectedBoxShadow={
                                       '0px 1px 8px rgba(0, 0, 0, 0.1)'
                                    }
                                    height={'auto'}
                                    dataSelectedBorder={'2px solid #367BF5'}
                                    dataSelectedHoverBorder={
                                       '2px solid #F3F3F3'
                                    }
                                    hoverBorder={'2px solid #F3F3F3'}
                                    borderRadius={'8px'}
                                    border={'2px solid #F3F3F3'}
                                    padding={'none'}
                                 >
                                    <StyledInsideSectionTab
                                       style={{ height: 'auto' }}
                                       onMouseEnter={() =>
                                          handleMouseEnter(index)
                                       }
                                       onMouseLeave={() =>
                                          handleMouseLeave(index)
                                       }
                                       onClick={() => handleMouseClicked(index)}
                                    >
                                       <StyledSectionTop>
                                          <div>
                                             <SectionTabDay>
                                                {rrulestr(recurrence.rrule)
                                                   .toText()
                                                   .replace(/^\w/, char =>
                                                      char.toUpperCase()
                                                   )}
                                             </SectionTabDay>
                                             <Flex
                                                style={{ marginTop: '10px' }}
                                             >
                                                {recurrence.brands.map(
                                                   (brand, index) => (
                                                      <Flex>
                                                         {
                                                            brand
                                                               ?.brand_location
                                                               ?.location.label
                                                         }
                                                      </Flex>
                                                   )
                                                )}
                                             </Flex>
                                          </div>
                                          {(mouseState.isHovered[index] ||
                                             mouseClickedState.isClicked[
                                                index
                                             ]) && (
                                             <IconButton
                                                type="ghost"
                                                style={SectionTabDelete}
                                                title="Delete Recurrence"
                                                onClick={() =>
                                                   deleteHandler(recurrence.id)
                                                }
                                             >
                                                <DeleteIcon color=" #FF5A52" />
                                             </IconButton>
                                          )}
                                       </StyledSectionTop>
                                       <StyledSectionBottom>
                                          <TextButton
                                             type="ghost"
                                             size="sm"
                                             style={SectionTabLink}
                                             title="Link with brands"
                                             onClick={() =>
                                                linkWithBrands(recurrence.id)
                                             }
                                          >
                                             Link with Brands
                                          </TextButton>
                                          {(mouseState.isHovered[index] ||
                                             mouseClickedState.isClicked[
                                                index
                                             ]) && (
                                             <Switch
                                                name={`recurrence-${recurrence.id}`}
                                                value={recurrence.isActive}
                                                checked={recurrence.isActive}
                                                checkedChildren="Published"
                                                unCheckedChildren="UnPublished"
                                                title="Press to change publish type"
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
                                          )}
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
                  ) : (
                     <ButtonTile
                        type="primary"
                        size="lg"
                        text="Add Recurrence"
                        onClick={() => openTunnel(1)}
                     />
                  )}
               </Container>
            )}
         </Container>
      </RecurrenceContext.Provider>
   )
}

export default Main
