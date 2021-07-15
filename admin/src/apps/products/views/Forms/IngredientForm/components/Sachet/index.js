import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Checkbox,
   IconButton,
   Text,
   Form,
   Flex,
   Spacer,
   Collapsible,
   ComboButton,
   Tunnels,
   Tunnel,
   useTunnel,
} from '@dailykit/ui'
import { toast } from 'react-toastify'

import { StyledTable } from './styled'
import { Container, Grid } from '../styled'
import { UPDATE_MODE } from '../../../../../graphql'
import { IngredientContext } from '../../../../../context/ingredient'
import { currencyFmt, logger } from '../../../../../../../shared/utils'
import { CloseIcon, EditIcon, TickIcon } from '../../../../../assets/icons'
import {
   DragNDrop,
   Nutrition,
   Tooltip,
} from '../../../../../../../shared/components'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'
import { ItemTypeTunnel } from '../../tunnels'
import ItemListTunnel from '../../tunnels/ItemListTunnel'
import { DeleteIcon } from '../../../../../../../shared/assets/icons'

const Sachet = ({
   state,
   openNutritionTunnel,
   openSachetTunnel,
   openEditSachetTunnel,
}) => {
   const { initiatePriority } = useDnd()

   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )

   const [tunnels, openItemTunnel, closeItemTunnel] = useTunnel(2)

   const [sachet, setSachet] = React.useState(
      state.ingredientProcessings[ingredientState.processingIndex]
         .ingredientSachets[ingredientState.sachetIndex]
   )

   React.useEffect(() => {
      if (
         state.ingredientProcessings[ingredientState.processingIndex]
            .ingredientSachets[ingredientState.sachetIndex]
      ) {
         setSachet(
            state.ingredientProcessings[ingredientState.processingIndex]
               .ingredientSachets[ingredientState.sachetIndex]
         )
      } else {
         setSachet(
            state.ingredientProcessings[ingredientState.processingIndex]
               .ingredientSachets[0]
         )
      }
   }, [state, ingredientState.processingIndex, ingredientState.sachetIndex])

   React.useEffect(() => {
      if (sachet.modeOfFulfillments.length) {
         initiatePriority({
            tablename: 'modeOfFulfillment',
            schemaname: 'ingredient',
            data: sachet.modeOfFulfillments,
         })
      }
   }, [sachet])

   // Mutation
   const [updateMode] = useMutation(UPDATE_MODE, {
      onCompleted: data => {
         if (data.updateModeOfFulfillment?.isArchived) {
            toast.success('Item deleted successfully!')
         } else {
            toast.success('Item updated successfully!')
         }
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const setPublished = (mode, val) => {
      if (!mode.isLive) {
         return toast.error('Mode is not available!')
      }
      return updateMode({
         variables: {
            id: mode.id,
            set: {
               isPublished: val,
            },
         },
      })
   }

   const editMOF = mode => {
      ingredientDispatch({
         type: 'EDIT_MODE',
         payload: {
            ...mode,
            packaging: mode.packaging
               ? {
                    ...mode.packaging,
                    title: mode.packaging.name,
                 }
               : null,
            labelTemplate: mode.labelTemplate
               ? {
                    ...mode.labelTemplate,
                    title: mode.labelTemplate.name,
                 }
               : null,
            bulkItem: mode.bulkItem
               ? {
                    ...mode.bulkItem,
                    title: `${mode.bulkItem.supplierItem.name} ${mode.bulkItem.processingName}`,
                 }
               : null,
            sachetItem: mode.sachetItem
               ? {
                    ...mode.sachetItem,
                    title: `${mode.sachetItem.bulkItem.supplierItem.name}  ${mode.sachetItem.bulkItem.processingName} ${mode.sachetItem.unitSize} ${mode.sachetItem.unit}`,
                 }
               : null,
         },
      })
      openEditSachetTunnel(2)
   }

   const deleteMOF = mode => {
      updateMode({
         variables: {
            id: mode.id,
            set: {
               isArchived: true,
            },
         },
      })
   }

   const renderLiveMOF = (id, modes = []) => {
      const liveMode = modes.find(mode => mode.id === id)
      if (liveMode) {
         if (liveMode.sachetItem) {
            return `${liveMode.sachetItem.bulkItem.supplierItem.name} ${liveMode.sachetItem.bulkItem.processingName} ${liveMode.sachetItem.unitSize} ${liveMode.sachetItem.unit}`
         }
         if (liveMode.bulkItem) {
            return `${liveMode.bulkItem.supplierItem.name} ${liveMode.bulkItem.processingName}`
         }
         return 'NA'
      }
      return 'NA'
   }

   const renderModeType = mode => {
      if (mode.sachetItem) {
         return 'Planned Lot'
      }
      if (mode.bulkItem) {
         return 'Real-time'
      }
      return '-'
   }

   const renderItemName = mode => {
      if (mode.sachetItem) {
         return `${mode.sachetItem.bulkItem.supplierItem.name} ${mode.sachetItem.bulkItem.processingName} ${mode.sachetItem.unitSize} ${mode.sachetItem.unit}`
      }
      if (mode.bulkItem) {
         return `${mode.bulkItem.supplierItem.name} ${mode.bulkItem.processingName}`
      }
      return '-'
   }

   const renderInventoryQuantity = (mode, category) => {
      if (mode.bulkItem) {
         return `${mode.bulkItem[category]} ${mode.bulkItem.unit}`
      }
      if (mode.sachetItem) {
         return `${mode.sachetItem[category]} pkt`
      }
      return '-'
   }

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <ItemTypeTunnel
                  closeTunnel={closeItemTunnel}
                  openTunnel={openItemTunnel}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <ItemListTunnel closeTunnel={closeItemTunnel} />
            </Tunnel>
         </Tunnels>
         <Container bottom="32">
            <Grid>
               <Flex container alignItems="center">
                  <span>
                     {sachet.tracking ? (
                        <TickIcon color="#00A7E1" stroke={2} size={20} />
                     ) : (
                        <CloseIcon color="#FF5A52" size={20} />
                     )}
                  </span>
                  <Spacer xAxis size="8px" />
                  <Text as="title">Tracking Inventory</Text>
               </Flex>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Flex container alignItems="center">
                     <Text as="subtitle">Active: </Text>
                     <Spacer xAxis size="8px" />
                     <Text as="text2">
                        {renderLiveMOF(
                           sachet.liveMOF,
                           sachet.modeOfFulfillments
                        )}
                     </Text>
                  </Flex>
                  <IconButton
                     type="ghost"
                     onClick={() => openEditSachetTunnel(1)}
                  >
                     <EditIcon color="#00A7E1" />
                  </IconButton>
               </Flex>
            </Grid>
         </Container>
         <DragNDrop
            list={sachet.modeOfFulfillments}
            droppableId="mofDroppableId"
            tablename="modeOfFulfillment"
            schemaname="ingredient"
         >
            {sachet.modeOfFulfillments?.map(mode => (
               <Collapsible
                  key={mode.id}
                  isDraggable
                  title={renderModeType(mode)}
                  head={
                     <Flex
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                     >
                        <Flex container alignItems="center">
                           <Flex>
                              <Text as="subtitle">Item</Text>
                              <Text as="p">{renderItemName(mode)}</Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Cost</Text>
                              <Text as="p">
                                 {currencyFmt(
                                    Number(mode.cost.toFixed(2)) || 0
                                 )}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Accuracy</Text>
                              <Text as="p">
                                 {mode.accuracy
                                    ? `Atleast ${mode.accuracy} %`
                                    : "Don't Weigh"}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                        </Flex>
                        <Flex container alignItems="center">
                           {mode.isPublished ? (
                              <ComboButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() =>
                                    setPublished(mode, !mode.isPublished)
                                 }
                              >
                                 <CloseIcon
                                    color="#36B6E2"
                                    size={14}
                                    stroke={1.5}
                                 />
                                 Make Unavailable
                              </ComboButton>
                           ) : (
                              <ComboButton
                                 type="outline"
                                 size="sm"
                                 onClick={() =>
                                    setPublished(mode, !mode.isPublished)
                                 }
                              >
                                 <TickIcon
                                    color="#36B6E2"
                                    size={14}
                                    stroke={1.5}
                                 />
                                 Make Available
                              </ComboButton>
                           )}
                           <Spacer xAxis size="16px" />
                           <IconButton
                              type="ghost"
                              size="sm"
                              onClick={() => editMOF(mode)}
                           >
                              <EditIcon color="#00A7E1" />
                           </IconButton>
                           <Spacer xAxis size="8px" />
                           <IconButton
                              type="ghost"
                              size="sm"
                              onClick={() => deleteMOF(mode)}
                           >
                              <DeleteIcon color="#FF5A52" />
                           </IconButton>
                        </Flex>
                     </Flex>
                  }
                  body={
                     <Flex
                        container
                        alignItems="center"
                        height="60px"
                        margin="8px 0 0 0"
                        width="100%"
                        justifyContent="space-between"
                     >
                        <Flex container alignItems="center">
                           <Flex>
                              <Text as="subtitle">Packaging</Text>
                              <Text as="p">{mode.packaging?.name || '-'}</Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Station</Text>
                              <Text as="p">
                                 {mode.operationConfig?.station?.name || '-'}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Label Template</Text>
                              <Text as="p">
                                 {mode.operationConfig?.labelTemplate?.name ||
                                    '-'}
                              </Text>
                           </Flex>
                        </Flex>
                        <Flex container alignItems="center">
                           <Flex>
                              <Text as="subtitle">On Hand</Text>
                              <Text as="p">
                                 {renderInventoryQuantity(mode, 'onHand')}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Awaiting</Text>
                              <Text as="p">
                                 {renderInventoryQuantity(mode, 'awaiting')}
                              </Text>
                           </Flex>
                           <Spacer xAxis size="24px" />
                           <Flex>
                              <Text as="subtitle">Committed</Text>
                              <Text as="p">
                                 {renderInventoryQuantity(mode, 'committed')}
                              </Text>
                           </Flex>
                        </Flex>
                     </Flex>
                  }
               />
            ))}
         </DragNDrop>
         <Container top="32">
            <ButtonTile
               type="secondary"
               text="Add Item"
               onClick={() => {
                  ingredientDispatch({
                     type: 'SACHET_ID',
                     payload: sachet.id,
                  })
                  openItemTunnel(1)
               }}
            />
         </Container>
         <Container top="32">
            <Flex container maxWidth="200px">
               <Text as="subtitle"> Cost </Text>
               <Tooltip identifier="sachet_cost" />
            </Flex>
            <Text as="p">{currencyFmt(Number(sachet.cost) || 0)}</Text>
         </Container>
         <Container top="32">
            <Flex container maxWidth="200px">
               <Text as="subtitle"> Nutrition </Text>
               <Tooltip identifier="sachet_nutritional_info" />
            </Flex>
            {sachet.nutritionalInfo ? (
               <Nutrition data={sachet.nutritionalInfo} vertical />
            ) : (
               <ButtonTile
                  type="secondary"
                  text="Add Nutritional Values"
                  onClick={() => openNutritionTunnel(1)}
               />
            )}
         </Container>
      </>
   )
}

export default Sachet
