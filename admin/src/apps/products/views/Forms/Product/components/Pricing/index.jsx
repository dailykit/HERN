import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import { PRODUCT } from '../../../../../graphql'
import validator from '../../validators'

const Pricing = ({ state }) => {
   console.log('🚀 ~ file: index.jsx ~ line 10 ~ Pricing ~ state', state)
   const [history, setHistory] = React.useState({
      price: state.price,
      discount: state.discount,
   })
   const [price, setPrice] = React.useState({
      value: state.price,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [discount, setDiscount] = React.useState({
      value: state.discount,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })

   React.useEffect(() => {
      setPrice({ ...price, value: state.price })
      setDiscount({ ...discount, value: state.discount })
      setHistory({
         price: state.price,
         discount: state.discount,
      })
   }, [state.price, state.discount])

   const [updateProduct] = useMutation(PRODUCT.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const isActuallyUpdated = (field, value) => {
      if (history[field] !== value) {
         return true
      }
      return false
   }

   const handleBlur = field => {
      switch (field) {
         case 'price': {
            const val = price.value
            const { isValid, errors } = validator.price(val)
            if (isValid && isActuallyUpdated(field, val)) {
               updateProduct({
                  variables: {
                     id: state.id,
                     _set: {
                        price: val,
                     },
                  },
               })
            }
            setPrice({
               ...price,
               meta: {
                  isTouched: true,
                  isValid,
                  errors,
               },
            })
            return
         }
         case 'discount': {
            const val = discount.value
            const { isValid, errors } = validator.discount(val)
            if (isValid && isActuallyUpdated(field, val)) {
               updateProduct({
                  variables: {
                     id: state.id,
                     _set: {
                        discount: val,
                     },
                  },
               })
            }
            setDiscount({
               ...discount,
               meta: {
                  isTouched: true,
                  isValid,
                  errors,
               },
            })
            return
         }
         default:
            return null
      }
   }

   return (
      <Flex width="50%">
         <Flex>
            <Form.Label htmlFor="price" title="price">
               Price*
            </Form.Label>
            <Form.Number
               id="price"
               name="price"
               onBlur={() => handleBlur('price')}
               onChange={e => setPrice({ ...price, value: e.target.value })}
               value={price.value}
               placeholder="Enter price"
               hasError={price.meta.isTouched && !price.meta.isValid}
            />
         </Flex>
         <Spacer size="16px" />
         <Flex>
            <Form.Label htmlFor="discount" title="discount">
               Discount*
            </Form.Label>
            <Form.Number
               id="discount"
               name="discount"
               onBlur={() => handleBlur('discount')}
               onChange={e =>
                  setDiscount({ ...discount, value: e.target.value })
               }
               value={discount.value}
               placeholder="Enter discount"
               hasError={discount.meta.isTouched && !discount.meta.isValid}
            />
         </Flex>
      </Flex>
   )
}

export default Pricing
