import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   IconButton,
   MinusIcon,
   PlusIcon,
   RadioGroup,
   Spacer,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
} from '@dailykit/ui'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { InlineLoader } from '../../../../../../../shared/components'
import {
   calcDiscountedPrice,
   camelCaseToNormalText,
   currencyFmt,
   logger,
} from '../../../../../../../shared/utils'
import Modifiers from '../../../../../components/Modifiers'
import ProductOptions from '../../../../../components/ProductOptions'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import { useManual } from '../../state'
import { getCartItemWithModifiers } from './utils'
import QuantitySelector from '../../../../../components/QuantitySelector'
import _, { isEmpty } from 'lodash'

export const ProductOptionsTunnel = ({ panel }) => {
   const [tunnels] = panel
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="md">
            <Content panel={panel} />
         </Tunnel>
      </Tunnels>
   )
}

const Content = ({ panel }) => {
   const { id: cartId } = useParams()
   const [, , closeTunnel] = panel
   const {
      state: { productId },
      brand,
      locationId,
      brandLocation,
   } = useManual()
   const [selectedOption, setSelectedOption] = React.useState({})
   const [quantity, setQuantity] = React.useState(1)
   const [modifiersState, setModifiersState] = React.useState({
      isValid: true,
      selectedModifiers: [],
      selectedNestedModifiers: [],
   })
   const [productOptionType, setProductOptionType] = React.useState('')
   const [isLoading, setIsLoading] = React.useState(true)

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
            brand_locationId: brandLocation?.id,
         },
      }),
      [brand, locationId, brandLocation?.id]
   )

   const {
      data: { product = {} } = {},
      loading,
      error,
   } = useSubscription(QUERIES.PRODUCTS.ONE, {
      skip: !productId,
      variables: {
         id: productId,
         params: argsForByLocation,
      },
   })

   React.useEffect(() => {
      if (!isEmpty(product)) {
         const defaultProductOption =
            product.productOptions.find(
               option =>
                  option.id === product.defaultProductOptionId &&
                  product.isPublished &&
                  product.isAvailable
            ) ||
            product.productOptions.find(x => x.isPublished && x.isAvailable)

         setProductOptionType(defaultProductOption?.type)
         setSelectedOption(defaultProductOption)
         setIsLoading(false)
      }
   }, [product])

   const [productOptionsGroupedByProductOptionType, allProductOptionTypeList] =
      React.useMemo(() => {
         if (!isEmpty(product) && product.productOptions?.length) {
            const groupedData = _.chain(product.productOptions)
               .groupBy('type')
               .map((value, key) => {
                  const isTypePublished = value.some(x => x.isPublished)
                  return {
                     type: key,
                     data: value,
                     isTypePublished,
                  }
               })
               .value()
            return [
               groupedData,
               groupedData
                  .filter(type => type.isTypePublished)
                  .map((eachType, index) => ({
                     id: index + 1,
                     title:
                        eachType.type === 'null'
                           ? 'Others'
                           : camelCaseToNormalText(eachType.type),
                     value: eachType.type,
                  })),
            ]
         } else {
            return [[], []]
         }
      }, [product])

   if (error) {
      console.log(error)
   }

   const [insertCartItems, { loading: adding }] = useMutation(
      MUTATIONS.CART.ITEM.INSERT_MANY,
      {
         onCompleted: () => {
            toast.success('Item added to cart!')
            closeTunnel(1)
         },
         onError: error => {
            logger(error)
            toast.error('Failed to add product to cart!')
         },
      }
   )

   const add = async () => {
      const allSelectedOptions = modifiersState.selectedModifiers
      const allNestedSelectedOptions = modifiersState.selectedNestedModifiers
      //no modifier available in product options
      if (!selectedOption.modifier) {
         // console.log('PASS')
         // addToCart({ ...selectedOption, quantity })
         const cartItem = getCartItemWithModifiers(
            selectedOption.cartItem,
            allSelectedOptions.map(x => x.cartItem)
         )
         const objects = new Array(quantity).fill({
            ...cartItem,
            cartId: +cartId,
         })
         // console.log('cartItem', objects)
         insertCartItems({
            variables: {
               objects,
            },
         })

         // if (edit) {
         //    methods.cartItems.delete({
         //       variables: {
         //          where: {
         //             id: {
         //                _in: productCartDetail.ids,
         //             },
         //          },
         //       },
         //    })
         // }
         // closeModifier()
         return
      }

      let allCatagories = selectedOption.modifier?.categories || []
      let allAdditionalCatagories = []
      if (!_.isEmpty(selectedOption.additionalModifiers)) {
         selectedOption.additionalModifiers.forEach(eachAdditionalModifier => {
            eachAdditionalModifier.modifier.categories.forEach(eachCategory => {
               allAdditionalCatagories.push(eachCategory)
            })
         })
      }

      let finalCategories = [...allCatagories, ...allAdditionalCatagories]

      let errorState = []
      for (let i = 0; i < finalCategories.length; i++) {
         const allFoundedOptionsLength = allSelectedOptions.filter(
            x => x.modifierCategoryID === finalCategories[i].id
         ).length

         if (
            finalCategories[i]['isRequired'] &&
            finalCategories[i]['type'] === 'multiple'
         ) {
            const min = finalCategories[i]['limits']['min']
            const max = finalCategories[i]['limits']['max']
            if (
               allFoundedOptionsLength > 0 &&
               min <= allFoundedOptionsLength &&
               (max
                  ? allFoundedOptionsLength <= max
                  : allFoundedOptionsLength <=
                    finalCategories[i].options.length)
            ) {
            } else {
               errorState.push(finalCategories[i].id)
            }
         }
      }
      let nestedFinalCategories = []
      let nestedFinalErrorCategories = []
      // console.log('finalCategories', finalCategories)
      finalCategories.forEach(eachCategory => {
         eachCategory.options.forEach(eachOption => {
            if (eachOption.additionalModifierTemplateId) {
               nestedFinalCategories.push(
                  ...eachOption.additionalModifierTemplate.categories
               )
            }
         })
      })
      if (nestedFinalCategories.length > 0) {
         for (let i = 0; i < nestedFinalCategories.length; i++) {
            const allFoundedOptionsLength = allNestedSelectedOptions.filter(
               x => x.modifierCategoryID === nestedFinalCategories[i].id
            ).length

            if (
               nestedFinalCategories[i]['isRequired'] &&
               nestedFinalCategories[i]['type'] === 'multiple'
            ) {
               const min = nestedFinalCategories[i]['limits']['min']
               const max = nestedFinalCategories[i]['limits']['max']
               if (
                  allFoundedOptionsLength > 0 &&
                  min <= allFoundedOptionsLength &&
                  (max
                     ? allFoundedOptionsLength <= max
                     : allFoundedOptionsLength <=
                       nestedFinalCategories[i].options.length)
               ) {
               } else {
                  nestedFinalErrorCategories.push(nestedFinalCategories[i].id)
               }
            }
         }
      }
      // setErrorCategories(errorState)
      // nestedSetErrorCategories(nestedFinalErrorCategories)
      if (errorState.length > 0 || nestedFinalErrorCategories.length > 0) {
         // console.log('FAIL')
         return
      } else {
         // console.log('PASS')
         const nestedModifierOptionsGroupByParentModifierOptionId =
            allNestedSelectedOptions.length > 0
               ? _.chain(allNestedSelectedOptions)
                    .groupBy('parentModifierOptionId')
                    .map((value, key) => ({
                       parentModifierOptionId: +key,
                       data: value,
                    }))
                    .value()
               : []

         if (!_.isEmpty(nestedModifierOptionsGroupByParentModifierOptionId)) {
            const cartItem = getCartItemWithModifiers(
               selectedOption.cartItem,
               allSelectedOptions.map(x => x.cartItem),
               nestedModifierOptionsGroupByParentModifierOptionId
            )
            const objects = new Array(quantity).fill({
               ...cartItem,
               cartId: +cartId,
            })
            insertCartItems({
               variables: {
                  objects,
               },
            })
            // await addToCart(cartItem, quantity)
         } else {
            const cartItem = getCartItemWithModifiers(
               selectedOption.cartItem,
               allSelectedOptions.map(x => x.cartItem)
            )
            const objects = new Array(quantity).fill({
               ...cartItem,
               cartId: +cartId,
            })

            insertCartItems({
               variables: {
                  objects,
               },
            })
         }
         // if (edit) {
         //    methods.cartItems.delete({
         //       variables: {
         //          where: {
         //             id: {
         //                _in: productCartDetail.ids,
         //             },
         //          },
         //       },
         //    })
         // }
      }
   }

   const totalPrice = React.useMemo(() => {
      if (!product) return 0
      let total = calcDiscountedPrice(product.price, product.discount)
      if (selectedOption) {
         total += calcDiscountedPrice(
            selectedOption.price,
            selectedOption.discount
         )
         total += modifiersState.selectedModifiers.reduce(
            (acc, op) => acc + op.cartItem.data[0].unitPrice,
            0
         )
         if (modifiersState.selectedNestedModifiers.length) {
            total += modifiersState.selectedNestedModifiers.reduce(
               (acc, op) => acc + op.cartItem.data[0].unitPrice,
               0
            )
         }
      }
      return total * quantity
   }, [
      product,
      selectedOption,
      modifiersState.selectedModifiers,
      modifiersState.selectedNestedModifiers,
      quantity,
   ])

   return (
      <>
         <TunnelHeader
            title="Select Options"
            close={() => closeTunnel(1)}
            right={{
               title: 'Add',
               isLoading: adding,
               disabled: !selectedOption || !modifiersState.isValid,
               action: add,
            }}
         />
         <Styles.TunnelBody
            padding="16px"
            overflowY="auto"
            height="calc(100vh - 193px)"
         >
            {loading || isLoading ? (
               <InlineLoader />
            ) : (
               <>
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="flex-end"
                     height="40px"
                  >
                     <Text as="text2">{product.name}</Text>
                     <Spacer size="8px" xAxis />
                     <Text as="text2">Total: {currencyFmt(totalPrice)}</Text>
                  </Flex>
                  {allProductOptionTypeList.length > 1 && (
                     <RadioGroup
                        options={allProductOptionTypeList}
                        active={
                           allProductOptionTypeList.find(
                              x =>
                                 x.value == productOptionType ||
                                 x.value == 'null'
                           ).id
                        }
                        onChange={option => {
                           setProductOptionType(option.value)
                           setSelectedOption(
                              productOptionsGroupedByProductOptionType
                                 .find(
                                    eachGroupType =>
                                       eachGroupType.type === option.value ||
                                       eachGroupType.type === 'null'
                                 )
                                 .data.find(
                                    option =>
                                       option.isPublished && option.isAvailable
                                 )
                           )
                        }}
                     />
                  )}

                  <Spacer size="12px" />
                  <ProductOptions
                     productOptions={
                        productOptionsGroupedByProductOptionType.find(
                           eachGroupType =>
                              (eachGroupType.type === productOptionType ||
                                 eachGroupType.type === 'null') &&
                              eachGroupType.isTypePublished
                        ).data
                     }
                     selectedOption={selectedOption}
                     handleOptionSelect={option => setSelectedOption(option)}
                  />
                  <Spacer size="8px" />
                  {selectedOption?.modifier && (
                     <Modifiers
                        data={selectedOption.modifier}
                        additionalModifiers={
                           selectedOption.additionalModifiers || []
                        }
                        handleChange={result => setModifiersState(result)}
                        productOption={selectedOption}
                        setProductOption={setSelectedOption}
                     />
                  )}
                  <Styles.Fixed width="120px" margin="0 auto">
                     <QuantitySelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                     />
                  </Styles.Fixed>
               </>
            )}
         </Styles.TunnelBody>
      </>
   )
}

const Styles = {
   TunnelBody: styled(Flex)`
      position: relative;
   `,
   Fixed: styled(Flex)`
      position: sticky;
      bottom: 0;
   `,
}
