import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonGroup,
   Flex,
   Form,
   Popup,
   Spacer,
   Text,
   TextButton,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { currencyFmt } from '../../../../shared/utils'
import { MUTATIONS } from '../../graphql'

const EditPrice = ({ product }) => {
   const [showPrimary, setShowPrimary] = React.useState(false)
   const [updatedPrice, setUpdatedPrice] = React.useState({
      value: product.price + '',
      meta: {
         errors: [],
         isTouched: false,
         isValid: true,
      },
   })

   const [update] = useMutation(MUTATIONS.PRODUCT.PRICE.UPDATE, {
      onCompleted: () => toast.success('Successfully updated the price'),
      onError: () => toast.error('Failed to update the price of product.'),
   })

   const validate = () => {
      const { value } = updatedPrice
      if (value === '') {
         setUpdatedPrice({
            ...updatedPrice,
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
         setUpdatedPrice({
            ...updatedPrice,
            meta: {
               errors: ['Please input numbers only!'],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }
      if (v <= 0) {
         setUpdatedPrice({
            ...updatedPrice,
            meta: {
               errors: ['Price should be greater than 0!'],
               isTouched: true,
               isValid: false,
            },
         })
         return
      }

      setUpdatedPrice({
         ...updatedPrice,
         meta: {
            errors: [],
            isValid: true,
            isTouched: true,
         },
      })
      setShowPrimary(true)
   }

   return (
      <>
         <Flex container alignItems="center">
            <Text as="text2">$</Text>
            <Form.Text
               value={updatedPrice.value}
               name="price"
               onBlur={validate}
               onChange={e =>
                  setUpdatedPrice({
                     ...updatedPrice,
                     value: e.target.value,
                  })
               }
               variant="revamp-sm"
               placeholder="enter price"
            />
            <Spacer xAxis size="20px" />
            <Popup
               show={showPrimary}
               clickOutsidePopup={() => setShowPrimary(false)}
            >
               <Popup.Actions>
                  <Popup.Text type="primary"></Popup.Text>
                  <Popup.Close
                     closePopup={() => setShowPrimary(!showPrimary)}
                  />
               </Popup.Actions>
               <Spacer size="12px" />
               <Popup.ConfirmText>
                  Do you want to update the price to{' '}
                  {`${currencyFmt(updatedPrice.value)}`}?
               </Popup.ConfirmText>
               <Popup.Actions>
                  <ButtonGroup align="left">
                     <TextButton
                        type="solid"
                        onClick={() => {
                           setShowPrimary(!showPrimary)
                           if (
                              updatedPrice.meta.isValid &&
                              updatedPrice.value
                           ) {
                              update({
                                 variables: {
                                    id: product.id,
                                    _set: {
                                       unitPrice: updatedPrice.value,
                                    },
                                 },
                              })
                           }
                        }}
                     >
                        Yes
                     </TextButton>
                     <TextButton
                        type="ghost"
                        onClick={() => setShowPrimary(!showPrimary)}
                     >
                        Cancel
                     </TextButton>
                  </ButtonGroup>
               </Popup.Actions>
            </Popup>
         </Flex>
      </>
   )
}

export default EditPrice
