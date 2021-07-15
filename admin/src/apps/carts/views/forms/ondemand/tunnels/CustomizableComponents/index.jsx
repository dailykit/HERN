import React from 'react'
import styled from 'styled-components'
import {
   Filler,
   Flex,
   IconButton,
   Spacer,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
} from '@dailykit/ui'
import { useManual } from '../../state'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import { InlineLoader } from '../../../../../../../shared/components'
import { useParams } from 'react-router'
import {
   calcDiscountedPrice,
   currencyFmt,
   logger,
} from '../../../../../../../shared/utils'
import ProductOptions from '../../../../../components/ProductOptions'
import Modifiers from '../../../../../components/Modifiers'
import { ChevronLeft } from '../../../../../../../shared/assets/icons'
import { getCartItemWithModifiers } from './utils'
import { toast } from 'react-toastify'
import QuantitySelector from '../../../../../components/QuantitySelector'

export const CustomizableComponentsTunnel = ({ panel }) => {
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
   } = useManual()

   const [selectedComponent, setSelectedComponent] = React.useState(null)
   const [selectedOption, setSelectedOption] = React.useState(null)
   const [quantity, setQuantity] = React.useState(1)
   const [modifiersState, setModifiersState] = React.useState({
      isValid: true,
      selectedModifiers: [],
   })

   const { data: { product = {} } = {}, loading, error } = useSubscription(
      QUERIES.PRODUCTS.ONE,
      {
         skip: !productId,
         variables: { id: productId },
      }
   )
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

   const renderProduct = product => {
      return (
         <>
            {product.assets && Boolean(product.assets.images.length) && (
               <>
                  <Styles.Image
                     src={product.assets.images[0]}
                     alt={product.name}
                  />
                  <Spacer xAxis size="12px" />
               </>
            )}
            <Text as="h3"> {product.name} </Text>
         </>
      )
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

   const formatData = options =>
      options.map(op => ({ ...op, ...op.productOption }))

   const goBack = () => {
      setSelectedComponent(null)
      setSelectedOption(null)
      setModifiersState({ isValid: true, selectedModifiers: [] })
      setQuantity(1)
   }

   return (
      <>
         <TunnelHeader
            title="Select Product"
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
            height="calc(100vh - 196px)"
         >
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <Flex
                     container
                     alignItems="center"
                     justifyContent={
                        selectedComponent ? 'space-between' : 'flex-end'
                     }
                     height="40px"
                  >
                     {selectedComponent && (
                        <Flex container alignItems="center">
                           <IconButton type="ghost" size="sm" onClick={goBack}>
                              <ChevronLeft size={20} />
                           </IconButton>
                           <Spacer xAxis size="8px" />
                           <Text as="text2">
                              {selectedComponent.linkedProduct.name}
                           </Text>
                        </Flex>
                     )}
                     <Text as="text2">Total: {currencyFmt(totalPrice)}</Text>
                  </Flex>
                  <Spacer size="12px" />
                  {selectedComponent ? (
                     <>
                        <ProductOptions
                           productOptions={formatData(
                              selectedComponent.selectedOptions
                           )}
                           selectedOption={selectedOption}
                           handleOptionSelect={option =>
                              setSelectedOption(option)
                           }
                        />
                        <Spacer size="8px" />
                        {selectedOption?.modifier && (
                           <Modifiers
                              data={selectedOption.modifier}
                              handleChange={result => setModifiersState(result)}
                           />
                        )}
                     </>
                  ) : (
                     <>
                        {product.customizableProductComponents.length ? (
                           <>
                              {product.customizableProductComponents.map(
                                 component => (
                                    <Styles.Component
                                       container
                                       alignItems="center"
                                       key={component.id}
                                       onClick={() =>
                                          setSelectedComponent(component)
                                       }
                                    >
                                       {renderProduct(component.linkedProduct)}
                                    </Styles.Component>
                                 )
                              )}
                           </>
                        ) : (
                           <Filler message="No components found!" />
                        )}
                     </>
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
      height: inherit;
   `,
   Component: styled(Flex)`
      margin-bottom: 16px;
      padding: 0 16px;
      height: 72px;
      cursor: pointer;
      border: 1px solid #efefef;
   `,
   Image: styled.img`
      height: 56px;
      width: 56px;
      border-radius: 2px;
   `,
   Fixed: styled(Flex)`
      position: sticky;
      bottom: 0;
   `,
}
