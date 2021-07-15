import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   IconButton,
   PlusIcon,
   RadioGroup,
   Spacer,
   Text,
   TunnelHeader,
   useTunnel,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   OperationConfig,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { EditIcon } from '../../../../../assets/icons'
import { IngredientContext } from '../../../../../context/ingredient'
import { UPDATE_MODE } from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'
import { StyledTable } from './styled'

const EditModeTunnel = ({ closeTunnel, openTunnel }) => {
   const {
      ingredientState: { editMode: mode },
      ingredientDispatch,
   } = React.useContext(IngredientContext)

   const [
      operationConfigTunnels,
      openOperationConfigTunnel,
      closeOperationConfigTunnel,
   ] = useTunnel(4)

   const options = [
      { id: 1, title: 'Atleast 80%', value: '80' },
      { id: 2, title: 'Atleast 95%', value: '95' },
      { id: 3, title: "Don't Weigh", value: '0' },
   ]

   const close = () => {
      closeTunnel(2)
      ingredientDispatch({
         type: 'EDIT_MODE',
         payload: null,
      })
   }

   // Mutation
   const [updateMode, { loading: inFlight }] = useMutation(UPDATE_MODE, {
      onCompleted: () => {
         toast.success('Mode updated!')
         close()
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const save = () => {
      try {
         if (inFlight) return
         updateMode({
            variables: {
               id: mode.id,
               set: {
                  accuracy: mode.accuracy,
                  bulkItemId: mode.bulkItem?.id || null,
                  sachetItemId: mode.sachetItem?.id || null,
                  packagingId: mode.packaging?.id || null,
                  operationConfigId: mode.operationConfig?.id || null,
               },
            },
         })
      } catch (error) {
         toast.error('Something went wrong!')
         logger(error)
      }
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

   return (
      <>
         <OperationConfig
            tunnels={operationConfigTunnels}
            openTunnel={openOperationConfigTunnel}
            closeTunnel={closeOperationConfigTunnel}
            onSelect={config =>
               ingredientDispatch({
                  type: 'EDIT_MODE',
                  payload: {
                     ...mode,
                     operationConfig: config,
                  },
               })
            }
         />
         <TunnelHeader
            title="Edit Mode"
            right={{ action: save, title: inFlight ? 'Saving...' : 'Save' }}
            close={close}
            tooltip={<Tooltip identifier="edit_mode_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-edit-mode-tunnel-top" />
            <Flex margin="0 0 20px 0">
               <Text as="subtitle">Mode of Fulfillment</Text>
               <Text as="text1">{renderModeType(mode)}</Text>
            </Flex>
            <Flex margin="0 0 20px 0">
               <Text as="subtitle">Item</Text>
               <Flex container alignItems="center">
                  <Text as="text1">{renderItemName(mode)}</Text>
                  <Spacer xAxis size="12px" />
                  <IconButton
                     type="ghost"
                     size="sm"
                     onClick={() => openTunnel(3)}
                  >
                     <EditIcon color="#367BF5" />
                  </IconButton>
               </Flex>
            </Flex>
            <Flex margin="0 0 20px 0">
               <Text as="subtitle">Accuracy</Text>
               <RadioGroup
                  options={options}
                  active={
                     options.find(op => op.value === mode?.accuracy)?.id || 3
                  }
                  onChange={option =>
                     ingredientDispatch({
                        type: 'EDIT_MODE',
                        payload: {
                           ...mode,
                           accuracy: option.value,
                        },
                     })
                  }
               />
            </Flex>
            <Flex margin="0 0 20px 0" alignItems="center" container>
               <Flex>
                  <Text as="subtitle">Packaging</Text>
                  {mode.packaging ? (
                     <Flex container alignItems="center">
                        <Text as="text1">{mode.packaging.title}</Text>
                        <Spacer xAxis size="12px" />
                        <IconButton
                           type="ghost"
                           size="sm"
                           onClick={() => openTunnel(5)}
                        >
                           <EditIcon color="#367BF5" />
                        </IconButton>
                     </Flex>
                  ) : (
                     <IconButton
                        type="ghost"
                        size="sm"
                        onClick={() => openTunnel(5)}
                     >
                        <PlusIcon color="#367BF5" />
                     </IconButton>
                  )}
               </Flex>
               <Spacer xAxis size="32px" />
               <Flex>
                  <Text as="subtitle">Label Template</Text>
                  {mode.operationConfig ? (
                     <Flex container alignItems="center">
                        <Text as="text1">
                           {`${mode.operationConfig.station.name} - ${mode.operationConfig.labelTemplate.name}`}
                        </Text>
                        <IconButton
                           type="ghost"
                           size="sm"
                           onClick={() => openOperationConfigTunnel(1)}
                        >
                           <EditIcon color="#367BF5" />
                        </IconButton>
                     </Flex>
                  ) : (
                     <IconButton
                        type="ghost"
                        size="sm"
                        onClick={() => openOperationConfigTunnel(1)}
                     >
                        <PlusIcon color="#367BF5" />
                     </IconButton>
                  )}
               </Flex>
            </Flex>
            {/* <StyledTable cellSpacing={0}>
               <thead>
                  <tr>
                     <th>Mode of Fulfillment</th>
                     <th>Item</th>
                     <th>Accuracy</th>
                     <th>Packaging</th>
                     <th>Operational Configuration</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>
                        {ingredientState?.editMode?.type === 'realTime'
                           ? 'Real Time'
                           : 'Planned Lot'}
                     </td>
                     <td>
                        {ingredientState?.editMode?.bulkItem ||
                        ingredientState?.editMode?.sachetItem ? (
                           <Flex container>
                              {ingredientState?.editMode?.bulkItem?.title ||
                                 ingredientState?.editMode?.sachetItem?.title}
                              <IconButton
                                 type="ghost"
                                 onClick={() => openTunnel(3)}
                              >
                                 <EditIcon color="#00A7E1" />
                              </IconButton>
                           </Flex>
                        ) : (
                           <IconButton
                              type="ghost"
                              onClick={() => openTunnel(3)}
                           >
                              <PlusIcon color="#00A7E1" />
                           </IconButton>
                        )}
                     </td>
                     <td>
                        <RadioGroup
                           options={options}
                           active={
                              options.find(
                                 op =>
                                    op.value ===
                                    ingredientState?.editMode?.accuracy
                              )?.id || 3
                           }
                           onChange={option =>
                              ingredientDispatch({
                                 type: 'EDIT_MODE',
                                 payload: {
                                    ...ingredientState?.editMode,
                                    accuracy: option.value,
                                 },
                              })
                           }
                        />
                     </td>
                     <td>
                        {ingredientState.editMode.packaging ? (
                           <Flex container>
                              {ingredientState.editMode.packaging?.title}
                              <IconButton
                                 type="ghost"
                                 onClick={() => openTunnel(4)}
                              >
                                 <EditIcon color="#07A8E2" />
                              </IconButton>
                           </Flex>
                        ) : (
                           <IconButton
                              type="ghost"
                              onClick={() => openTunnel(4)}
                           >
                              <PlusIcon color="#07A8E2" />
                           </IconButton>
                        )}
                     </td>
                     <td>
                        {ingredientState?.editMode?.operationConfig ? (
                           <Flex container>
                              {`${ingredientState.editMode.operationConfig.station.name} - ${ingredientState.editMode.operationConfig.labelTemplate.name}`}
                              <IconButton
                                 type="ghost"
                                 onClick={() => openOperationConfigTunnel(1)}
                              >
                                 <EditIcon color="#07A8E2" />
                              </IconButton>
                           </Flex>
                        ) : (
                           <IconButton
                              type="ghost"
                              onClick={() => openOperationConfigTunnel(1)}
                           >
                              <PlusIcon color="#07A8E2" />
                           </IconButton>
                        )}
                     </td>
                  </tr>
               </tbody>
            </StyledTable>
            </StyledTable> */}
            <Banner id="products-app-ingredients-edit-mode-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default EditModeTunnel
