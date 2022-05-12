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
   } = useManual()
   const [selectedOption, setSelectedOption] = React.useState({})
   const [quantity, setQuantity] = React.useState(1)
   const [modifiersState, setModifiersState] = React.useState({
      isValid: true,
      selectedModifiers: [],
   })
   const [productOptionType, setProductOptionType] = React.useState('')
   const [isLoading, setIsLoading] = React.useState(true)

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: locationId,
         },
      }),
      [brand, locationId]
   )

   const {
      data: { product = {} } = {},
      loading,
      error,
   } = useSubscription(QUERIES.PRODUCTS.ONE, {
      skip: !productId,
      variables: {
         id: productId,
         priceArgs: argsForByLocation,
         discountArgs: argsForByLocation,
         defaultCartItemArgs: argsForByLocation,
         productOptionPriceArgs: argsForByLocation,
         productOptionDiscountArgs: argsForByLocation,
         productOptionCartItemArgs: argsForByLocation,
         modifierCategoryOptionPriceArgs: argsForByLocation,
         modifierCategoryOptionDiscountArgs: argsForByLocation,
         modifierCategoryOptionCartItemArgs: argsForByLocation,
      },
   })

   React.useEffect(() => {
      if (!isEmpty(product)) {
         const defaultProductOption =
            product.productOptions.find(
               option => option.id === product.defaultProductOptionId
            ) || product.productOptions[0]

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
               .map((value, key) => ({
                  type: key,
                  data: value,
               }))
               .value()
            return [
               groupedData,
               groupedData.map((eachType, index) => ({
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

   const add = () => {
      const cartItem = getCartItemWithModifiers(
         selectedOption.cartItem,
         modifiersState.selectedModifiers,
         product.type
      )
      const objects = new Array(quantity).fill({ ...cartItem, cartId: +cartId })
      insertCartItems({
         variables: {
            objects,
         },
      })
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
            (acc, op) => acc + op.data[0].unitPrice,
            0
         )
      }
      return total * quantity
   }, [product, selectedOption, modifiersState.selectedModifiers, quantity])

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
                              productOptionsGroupedByProductOptionType.find(
                                 eachGroupType =>
                                    eachGroupType.type === option.value ||
                                    eachGroupType.type === 'null'
                              ).data[0]
                           )
                        }}
                     />
                  )}

                  <Spacer size="12px" />
                  <ProductOptions
                     productOptions={
                        productOptionsGroupedByProductOptionType.find(
                           eachGroupType =>
                              eachGroupType.type === productOptionType ||
                              eachGroupType.type === 'null'
                        ).data
                     }
                     selectedOption={selectedOption}
                     handleOptionSelect={option => setSelectedOption(option)}
                  />
                  <Spacer size="8px" />
                  {selectedOption?.modifier && (
                     <Modifiers
                        data={selectedOption.modifier}
                        handleChange={result => setModifiersState(result)}
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
