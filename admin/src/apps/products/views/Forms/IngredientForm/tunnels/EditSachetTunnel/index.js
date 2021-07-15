import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { FETCH_UNITS, UPDATE_SACHET } from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'

const EditSachetTunnel = ({ state, closeTunnel }) => {
   const { ingredientState } = React.useContext(IngredientContext)

   const sachet =
      state.ingredientProcessings[ingredientState.processingIndex]
         .ingredientSachets[ingredientState.sachetIndex]

   const [quantity, setQuantity] = React.useState({
      value: sachet.quantity,
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [unit, setUnit] = React.useState({
      value: sachet.unit,
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [tracking, setTracking] = React.useState({
      value: sachet.tracking,
   })

   // Subscription
   const { data: { units = [] } = {}, loading, error } = useSubscription(
      FETCH_UNITS
   )

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   // Mutation
   const [updateSachet, { loading: inFlight }] = useMutation(UPDATE_SACHET, {
      variables: {
         id: sachet.id,
         set: {
            tracking: tracking.value,
            quantity: quantity.value,
            unit: unit.value,
         },
      },
      onCompleted: () => {
         toast.success('Sachet updated!')
         closeTunnel(1)
      },
      onError: () => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handler
   const save = () => {
      if (inFlight) return
      updateSachet()
   }

   return (
      <>
         <TunnelHeader
            title="Edit Sachet"
            right={{ action: save, title: inFlight ? 'Saving...' : 'Save' }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="edit_sachet_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-edit-sachet-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <Flex>
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
                  <Flex>
                     <Form.Toggle
                        id="tracking"
                        name="tracking"
                        value={tracking.value}
                        onChange={() =>
                           setTracking({ ...tracking, value: !tracking.value })
                        }
                     >
                        Track Inventory
                     </Form.Toggle>
                  </Flex>
                  <Spacer size="24px" />
               </>
            )}
            <Banner id="products-app-ingredients-edit-sachet-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default EditSachetTunnel
