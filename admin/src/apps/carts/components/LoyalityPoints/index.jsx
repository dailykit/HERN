import React from 'react'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import styled from 'styled-components'
import {
   Filler,
   Flex,
   Form,
   IconButton,
   Spacer,
   Text,
   TextButton,
   ButtonTile,
} from '@dailykit/ui'

import { CloseIcon } from '../../../../shared/assets/icons'
import { MUTATIONS } from '../../graphql'
import { logger } from '../../../../shared/utils'

const LoyaltyPoints = ({ loyaltyPoints }) => {
   const { id: cartId } = useParams()
   const [points, setPoints] = React.useState({
      value: '',
      meta: {
         errors: [],
         isTouched: false,
         isValid: true,
      },
   })

   const [updateCart, { loading }] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => {
         toast.success(
            `Successfully ${
               points.value > 0 ? 'added' : 'removed'
            } loyalty points.`
         )
         setPoints({
            value: 0,
            meta: {
               errors: [],
               isTouched: false,
               isValid: true,
            },
         })
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the fulfillment details.')
      },
   })

   const validate = e => {
      const { value } = e.target
      if (value === '') {
         setPoints({
            ...points,
            meta: {
               errors: [],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }

      const v = parseInt(value)
      if (isNaN(v)) {
         setPoints({
            ...points,
            meta: {
               errors: ['Please input numbers only!'],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }
      if (v <= 0) {
         setPoints({
            ...points,
            meta: {
               errors: ['Points should be greater than 0!'],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }
      if (v > loyaltyPoints.usable) {
         setPoints({
            ...points,
            meta: {
               errors: [`Points should be less than ${loyaltyPoints.usable}!`],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }
      if (v % 1 !== 0) {
         setPoints({
            ...points,
            meta: {
               errors: [`Points should be integers only!`],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }

      setPoints({
         ...points,
         meta: {
            errors: [],
            isValid: true,
            isTouched: true,
         },
      })
   }

   if (!loyaltyPoints.usable && !loyaltyPoints.used) return null

   return (
      <>
         <Text as="text2">Loyalty Points</Text>
         <Spacer size="4px" />
         <Styles.LoyaltyPoints>
            {loyaltyPoints.used ? (
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Text as="h3"> {loyaltyPoints.used} </Text>
                  <IconButton
                     type="ghost"
                     isLoading={loading}
                     onClick={() => {
                        updateCart({
                           variables: {
                              id: cartId,
                              _set: {
                                 loyaltyPointsUsed: 0,
                              },
                           },
                        })
                     }}
                  >
                     <CloseIcon color="#ec3333" />
                  </IconButton>
               </Flex>
            ) : (
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <Flex>
                     <Form.Group>
                        <Form.Label htmlFor="points" title="points">
                           Points
                        </Form.Label>
                        <Form.Number
                           id="points"
                           name="points"
                           onBlur={validate}
                           onChange={e =>
                              setPoints({ ...points, value: e.target.value })
                           }
                           value={points.value}
                           placeholder="Enter points"
                           hasError={
                              points.meta.isTouched && !points.meta.isValid
                           }
                        />
                        {points.meta.isTouched &&
                           !points.meta.isValid &&
                           points.meta.errors.map((error, index) => (
                              <Form.Error justifyContent="center" key={index}>
                                 {error}
                              </Form.Error>
                           ))}
                     </Form.Group>
                     <Spacer size="4px" />
                     <Text as="text3">Max: {loyaltyPoints.usable}</Text>
                  </Flex>
                  <TextButton
                     type="ghost"
                     disabled={!points.meta.isValid || !points.value}
                     isLoading={loading}
                     onClick={() => {
                        if (points.meta.isValid && points.value) {
                           updateCart({
                              variables: {
                                 id: cartId,
                                 _set: {
                                    loyaltyPointsUsed: points.value,
                                 },
                              },
                           })
                        }
                     }}
                  >
                     Use
                  </TextButton>
               </Flex>
            )}
         </Styles.LoyaltyPoints>
      </>
   )
}

export default LoyaltyPoints

const Styles = {
   LoyaltyPoints: styled.div`
      background: #ffffff;
      border: 1px solid #ececec;
      padding: 8px;
   `,
}
