import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   IconButton,
   PlusIcon,
   RadioGroup,
   Spacer,
   TunnelHeader,
   useTunnel,
   Filler,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   OperationConfig,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { CREATE_SACHET, FETCH_UNITS } from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'
import { StyledTable } from './styled'

const SachetTunnel = ({ state, closeTunnel, openTunnel }) => {
   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )

   const [
      operationConfigTunnels,
      openOperationConfigTunnel,
      closeOperationConfigTunnel,
   ] = useTunnel(4)

   // State
   const [quantity, setQuantity] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [unit, setUnit] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [tracking, setTracking] = React.useState({
      value: true,
   })

   const options = [
      { id: 1, title: 'Atleast 80%', value: '80' },
      { id: 2, title: 'Atleast 95%', value: '95' },
      { id: 3, title: "Don't Weigh", value: '0' },
   ]

   // Subscription
   const { data: { units = [] } = {}, loading, error } = useSubscription(
      FETCH_UNITS,
      {
         onSubscriptionData: data => {
            if (data.subscriptionData.data.units.length) {
               setUnit({
                  ...unit,
                  value: data.subscriptionData.data.units[0].title,
               })
            }
         },
      }
   )

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   // Handlers
   const close = () => {
      ingredientDispatch({
         type: 'CLEAN',
      })
      closeTunnel(1)
   }
   const propagate = (type, val) => {
      if (
         val &&
         !(ingredientState[type].sachetItem || ingredientState[type].bulkItem)
      ) {
         ingredientDispatch({
            type: 'CURRENT_MODE',
            payload: type,
         })
         openTunnel(2)
      }
      ingredientDispatch({
         type: 'MODE',
         payload: {
            mode: type,
            name: 'isLive',
            value: val,
         },
      })
   }
   const selectPackaging = type => {
      ingredientDispatch({
         type: 'CURRENT_MODE',
         payload: type,
      })
      openTunnel(3)
   }
   const selectOperationConfiguration = type => {
      ingredientDispatch({
         type: 'CURRENT_MODE',
         payload: type,
      })
      openOperationConfigTunnel(1)
   }

   // Mutations
   const [createSachet, { loading: inFlight }] = useMutation(CREATE_SACHET, {
      onCompleted: () => {
         toast.success('Sachet added!')
         close()
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const add = () => {
      try {
         if (inFlight) return
         if (!quantity.value) {
            return toast.error('Quantity is required!')
         }
         const object = {
            ingredientId: state.id,
            ingredientProcessingId:
               state.ingredientProcessings[ingredientState.processingIndex].id,
            quantity: quantity.value,
            unit: unit.value,
            tracking: tracking.value,
         }
         createSachet({
            variables: {
               objects: [object],
            },
         })
      } catch (error) {
         toast.error('Something went wrong!')
         logger(error)
      }
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <OperationConfig
            tunnels={operationConfigTunnels}
            openTunnel={openOperationConfigTunnel}
            closeTunnel={closeOperationConfigTunnel}
            onSelect={config =>
               ingredientDispatch({
                  type: 'MODE',
                  payload: {
                     mode: ingredientState.currentMode,
                     name: 'operationConfig',
                     value: config,
                  },
               })
            }
         />
         <TunnelHeader
            title="Add Sachet"
            right={{ action: add, title: inFlight ? 'Adding...' : 'Add' }}
            close={close}
            tooltip={<Tooltip identifier="add_sachet_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-sachet-tunnel-top" />
            {units.length ? (
               <>
                  <Flex maxWidth="300px">
                     <Form.Group>
                        <Form.Label htmlFor="quantity" title="quantity">
                           Quantity*
                        </Form.Label>
                        <Form.TextSelect>
                           <Form.Number
                              id="quantity"
                              name="quantity"
                              value={quantity.value}
                              placeholder="Enter sachet quantity"
                              onChange={e =>
                                 setQuantity({
                                    ...quantity,
                                    value: e.target.value,
                                 })
                              }
                              onBlur={() => {
                                 const { isValid, errors } = validator.quantity(
                                    quantity.value
                                 )
                                 setQuantity({
                                    ...quantity,
                                    meta: {
                                       isTouched: true,
                                       isValid,
                                       errors,
                                    },
                                 })
                              }}
                           />
                           <Form.Select
                              id="unit"
                              name="unit"
                              options={units}
                              value={unit.value}
                              placeholder="Choose unit"
                              defaultValue={unit.value}
                              onChange={e =>
                                 setUnit({ ...unit, value: e.target.value })
                              }
                           />
                        </Form.TextSelect>
                        {quantity.meta.isTouched &&
                           !quantity.meta.isValid &&
                           quantity.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                  </Flex>
                  <Spacer size="24px" />
                  <Flex container maxWidth="300px">
                     <Form.Toggle
                        id="tracking"
                        name="tracking"
                        value={tracking.value}
                        onChange={() =>
                           setTracking({ ...tracking, value: !tracking.value })
                        }
                     >
                        <Flex container>
                           Track Inventory
                           <Tooltip identifier="sachet_tracking_inventory" />
                        </Flex>
                     </Form.Toggle>
                  </Flex>
               </>
            ) : (
               <Filler
                  message="No units found! To start, please add some."
                  height="500px"
               />
            )}
            <Banner id="products-app-ingredients-sachet-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default SachetTunnel
