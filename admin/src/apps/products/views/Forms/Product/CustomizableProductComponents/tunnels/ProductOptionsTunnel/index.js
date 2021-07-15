import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Text, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../../shared/components'
import {
   isIncludedInOptions,
   logger,
} from '../../../../../../../../shared/utils'
import {
   CUSTOMIZABLE_PRODUCT_COMPONENT,
   PRODUCT_OPTION,
} from '../../../../../../graphql'
import { TunnelBody } from '../../../tunnels/styled'
import validators from '../../../validators'
import { OptionWrapper } from './styled'

const ProductOptionsTunnel = ({
   customizableOptionId,
   productId,
   selectedOptions,
   closeTunnel,
}) => {
   const [options, setOptions] = React.useState([])

   const transformAndSetOptions = React.useCallback(options => {
      const updatedOptions = options.map(option => {
         const isAlreadySelected = isIncludedInOptions(
            option.id,
            selectedOptions
         )
         return {
            ...option,
            isSelected: isAlreadySelected,
            price: {
               value: isAlreadySelected
                  ? selectedOptions.find(op => op.optionId === option.id).price
                  : option.price,
               meta: { isValid: true, isTouched: false, errors: [] },
            },
            discount: {
               value: isAlreadySelected
                  ? selectedOptions.find(op => op.optionId === option.id)
                       .discount
                  : option.discount,
               meta: { isValid: true, isTouched: false, errors: [] },
            },
         }
      })
      setOptions([...updatedOptions])
   }, [])

   const { loading } = useSubscription(PRODUCT_OPTION.LIST, {
      variables: {
         where: {
            productId: { _eq: productId },
            isArchived: { _eq: false },
         },
      },
      onSubscriptionData: data =>
         transformAndSetOptions(data.subscriptionData.data.productOptions),
   })

   // Mutation
   const [
      updateCustomizableProductComponent,
      { loading: updating },
   ] = useMutation(CUSTOMIZABLE_PRODUCT_COMPONENT.UPDATE, {
      onCompleted: () => {
         toast.success('Product options updated!')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateOption = (optionId, field, value) => {
      const updatedOptions = options.map(option =>
         option.id === optionId
            ? field === 'isSelected'
               ? { ...option, [field]: value }
               : { ...option, [field]: { ...option[field], value } }
            : option
      )
      setOptions(updatedOptions)
   }

   const validate = (optionId, { name, value }) => {
      if (name.includes('price')) {
         const { isValid, errors } = validators.price(value)
         const updatedOptions = options.map(option =>
            option.id === optionId
               ? {
                    ...option,
                    price: {
                       ...option.price,
                       meta: { isValid, errors, isTouched: true },
                    },
                 }
               : option
         )
         setOptions(updatedOptions)
      }
      if (name.includes('discount')) {
         const { isValid, errors } = validators.discount(value)
         const updatedOptions = options.map(option =>
            option.id === optionId
               ? {
                    ...option,
                    discount: {
                       ...option.discount,
                       meta: { isValid, errors, isTouched: true },
                    },
                 }
               : option
         )
         setOptions(updatedOptions)
      }
   }

   const save = () => {
      try {
         const selectedOptions = options.filter(({ isSelected }) => isSelected)
         if (!selectedOptions.length) {
            throw Error('Select at least one option!')
         }
         const isEveryOptionValid = selectedOptions.every(
            ({ price, discount }) => price.meta.isValid && discount.meta.isValid
         )
         if (isEveryOptionValid) {
            const finalOptions = selectedOptions.map(
               ({ id, price, discount }) => ({
                  optionId: id,
                  price: +price.value,
                  discount: +discount.value,
               })
            )
            updateCustomizableProductComponent({
               variables: {
                  id: customizableOptionId,
                  _set: {
                     options: finalOptions,
                  },
               },
            })
         } else {
            throw Error('Selected options must be valid!')
         }
      } catch (err) {
         toast.error(err.message)
      }
   }

   return (
      <>
         <TunnelHeader
            title="Select options to add"
            close={() => closeTunnel(1)}
            tooltip={
               <Tooltip identifier="customizable_product_product_options_tunnel" />
            }
            right={{
               title: updating ? 'Updating...' : 'Update',
               action: () => !updating && save(),
            }}
         />
         <TunnelBody>
            <Banner id="products-app-customizable-product-product-options-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {options.map(option => (
                     <OptionWrapper key={option.id}>
                        <Flex container alignItems="center">
                           <Form.Group>
                              <Form.Checkbox
                                 name={`option-${option.id}`}
                                 value={option.isSelected}
                                 onChange={() =>
                                    updateOption(
                                       option.id,
                                       'isSelected',
                                       !option.isSelected
                                    )
                                 }
                              />
                           </Form.Group>
                           <Flex>
                              <Text as="p">
                                 {option.label} - {option.product.name}
                              </Text>
                              <Spacer size="4px" />
                              <Flex container>
                                 <Form.Group>
                                    <Form.Label
                                       htmlFor={`option-price-${option.id}`}
                                       title={`option-price-${option.id}`}
                                    >
                                       Price*
                                    </Form.Label>
                                    <Form.Number
                                       id={`option-price-${option.id}`}
                                       name={`option-price-${option.id}`}
                                       onChange={e =>
                                          updateOption(
                                             option.id,
                                             'price',
                                             e.target.value
                                          )
                                       }
                                       onBlur={e =>
                                          validate(option.id, e.target)
                                       }
                                       value={option.price.value}
                                       placeholder="Enter option price"
                                       hasError={
                                          option.price.meta.isTouched &&
                                          !option.price.meta.isValid
                                       }
                                    />
                                    {option.price.meta.isTouched &&
                                       !option.price.meta.isValid &&
                                       option.price.meta.errors.map(
                                          (error, index) => (
                                             <Form.Error key={index}>
                                                {error}
                                             </Form.Error>
                                          )
                                       )}
                                 </Form.Group>
                                 <Spacer xAxis size="16px" />
                                 <Form.Group>
                                    <Form.Label
                                       htmlFor={`option-discount-${option.id}`}
                                       title={`option-discount-${option.id}`}
                                    >
                                       Discount*
                                    </Form.Label>
                                    <Form.Number
                                       id={`option-discount-${option.id}`}
                                       name={`option-discount-${option.id}`}
                                       onChange={e =>
                                          updateOption(
                                             option.id,
                                             'discount',
                                             e.target.value
                                          )
                                       }
                                       onBlur={e =>
                                          validate(option.id, e.target)
                                       }
                                       value={option.discount.value}
                                       placeholder="Enter option discount"
                                       hasError={
                                          option.discount.meta.isTouched &&
                                          !option.discount.meta.isValid
                                       }
                                    />
                                    {option.discount.meta.isTouched &&
                                       !option.discount.meta.isValid &&
                                       option.discount.meta.errors.map(
                                          (error, index) => (
                                             <Form.Error key={index}>
                                                {error}
                                             </Form.Error>
                                          )
                                       )}
                                 </Form.Group>
                              </Flex>
                           </Flex>
                        </Flex>
                     </OptionWrapper>
                  ))}
               </>
            )}
            <Banner id="products-app-customizable-product-product-options-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ProductOptionsTunnel
