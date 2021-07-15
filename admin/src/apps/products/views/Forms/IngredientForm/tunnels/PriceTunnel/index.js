import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { UPDATE_PROCESSING } from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'
import { Tooltip, Banner } from '../../../../../../../shared/components'

const PriceTunnel = ({ state, close }) => {
   const { ingredientState } = React.useContext(IngredientContext)

   const [cost, setCost] = React.useState({
      value:
         state.ingredientProcessings[ingredientState.processingIndex].cost
            ?.value ?? 0,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [per, setPer] = React.useState({
      value:
         state.ingredientProcessings[ingredientState.processingIndex].cost
            ?.per ?? 100,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })

   // Mutation
   const [updateProcessing, { loading: inFlight }] = useMutation(
      UPDATE_PROCESSING,
      {
         onCompleted: () => {
            toast.success('Cost updated!')
            close(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   // Handlers
   const save = () => {
      try {
         if (inFlight || !cost.meta.isValid || !per.meta.isValid) return
         updateProcessing({
            variables: {
               id:
                  state.ingredientProcessings[ingredientState.processingIndex]
                     .id,
               set: {
                  cost: {
                     value: +cost.value,
                     per: +per.value,
                  },
               },
            },
         })
      } catch (error) {
         toast.error('Something went wrong!')
         logger(error)
      }
   }

   return (
      <>
         <TunnelHeader
            title={`Add Cost for ${
               state.ingredientProcessings[ingredientState.processingIndex]
                  .processingName
            } ${state.name}`}
            right={{ action: save, title: inFlight ? 'Saving...' : 'Save' }}
            close={() => close(1)}
            tooltip={<Tooltip identifier="processing_price_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-processing-price-tunnel-top" />
            <Flex container>
               <Form.Group>
                  <Form.Label htmlFor="cost" title="cost">
                     Cost*
                  </Form.Label>
                  <Form.Number
                     id="cost"
                     name="cost"
                     onChange={e =>
                        setCost({
                           ...cost,
                           value: e.target.value,
                        })
                     }
                     onBlur={() => {
                        const { isValid, errors } = validator.price(cost.value)
                        setCost({
                           ...cost,
                           meta: {
                              isTouched: true,
                              isValid,
                              errors,
                           },
                        })
                     }}
                     value={cost.value}
                     placeholder="Enter cost"
                     hasError={cost.meta.isTouched && !cost.meta.isValid}
                  />
                  {cost.meta.isTouched &&
                     !cost.meta.isValid &&
                     cost.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
               <Spacer xAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="per" title="per">
                     Quantity(per gms)*
                  </Form.Label>
                  <Form.Number
                     id="per"
                     name="per"
                     onChange={e =>
                        setPer({
                           ...per,
                           value: e.target.value,
                        })
                     }
                     onBlur={() => {
                        const { isValid, errors } = validator.quantity(
                           per.value
                        )
                        setPer({
                           ...per,
                           meta: {
                              isTouched: true,
                              isValid,
                              errors,
                           },
                        })
                     }}
                     value={per.value}
                     placeholder="Enter quantity"
                     hasError={per.meta.isTouched && !per.meta.isValid}
                  />
                  {per.meta.isTouched &&
                     !per.meta.isValid &&
                     per.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Banner id="products-app-ingredients-processing-price-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default PriceTunnel
