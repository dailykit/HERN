import React from 'react'
import styled from 'styled-components'
import {
   Filler,
   Flex,
   IconButton,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   TunnelHeader,
   Tunnels,
} from '@dailykit/ui'
import { useParams } from 'react-router'
import { useManual } from '../../state'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import { toast } from 'react-toastify'
import {
   calcDiscountedPrice,
   currencyFmt,
   logger,
} from '../../../../../../../shared/utils'
import { InlineLoader } from '../../../../../../../shared/components'
import {
   ChevronLeft,
   ChevronRight,
} from '../../../../../../../shared/assets/icons'
import ProductOptions from '../../../../../components/ProductOptions'
import Modifiers from '../../../../../components/Modifiers'
import QuantitySelector from '../../../../../components/QuantitySelector'
import { getCartItemWithModifiers } from './utils'

export const ComboComponentsTunnel = ({ panel }) => {
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

   const [stages, setStages] = React.useState([])
   const [currentStage, setCurrentStage] = React.useState(0)
   const [quantity, setQuantity] = React.useState(1)

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

   const totalPrice = React.useMemo(() => {
      if (!product) return 0
      let total = calcDiscountedPrice(product.price, product.discount)
      for (const stage of stages) {
         if (stage?.option) {
            total += stage.option.cartItem.unitPrice
            if (stage.modifiersState.selectedModifiers) {
               total += stage.modifiersState.selectedModifiers.reduce(
                  (acc, op) => acc + op.data[0].unitPrice,
                  0
               )
            }
         }
      }
      return total * quantity
   }, [product, quantity])

   const formatData = options =>
      options.map(op => ({ ...op, ...op.productOption }))

   const handleOptionSelect = React.useCallback(
      option => {
         const updatedStages = [...stages]
         const cartItem = option.cartItem || option.comboCartItem
         cartItem.comboProductComponentId =
            product.comboProductComponents[currentStage].id
         const updatedStage = {
            ...updatedStages[currentStage],
            option: {
               ...option,
               cartItem,
            },
            modifiersState: {
               isValid: true,
               selectedModifiers: [],
            },
         }
         const isValid = isStageValid(updatedStage)
         updatedStages[currentStage] = {
            ...updatedStage,
            isValid,
         }
         setStages(updatedStages)
      },
      [currentStage, stages]
   )

   const handleModifiersChange = React.useCallback(
      result => {
         const updatedStages = [...stages]
         const updatedStage = {
            ...updatedStages[currentStage],
            modifiersState: result,
         }
         const isValid = isStageValid(updatedStage)
         updatedStages[currentStage] = {
            ...updatedStage,
            isValid,
         }
         setStages(updatedStages)
      },
      [currentStage, stages]
   )

   const handleComponentSelect = React.useCallback(
      component => {
         const updatedStages = [...stages]
         const updatedStage = {
            ...updatedStages[currentStage],
            customizableComponent: component,
         }
         const isValid = isStageValid(updatedStage)
         updatedStages[currentStage] = {
            ...updatedStage,
            isValid,
         }
         setStages(updatedStages)
      },
      [currentStage, stages]
   )

   const goBack = () => {
      const updatedStages = [...stages]
      updatedStages[currentStage] = {
         isValid: false,
         option: null,
         customizableComponent: null,
         modifiersState: {
            isValid: true,
            selectedModifiers: [],
         },
      }
      setStages(updatedStages)
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

   const renderComboComponent = React.useCallback(() => {
      const comboComponent = product.comboProductComponents[currentStage]
      const selectedComponent = stages[currentStage]?.customizableComponent
      const selectedOption = stages[currentStage]?.option

      if (comboComponent.linkedProduct.type === 'simple') {
         return (
            <>
               <ProductOptions
                  productOptions={formatData(
                     product.comboProductComponents[currentStage]
                        .selectedOptions
                  )}
                  selectedOption={stages[currentStage]?.option}
                  handleOptionSelect={handleOptionSelect}
               />
               <Spacer size="8px" />
               {stages[currentStage]?.option?.modifier && (
                  <Modifiers
                     data={stages[currentStage].option.modifier}
                     handleChange={handleModifiersChange}
                  />
               )}
            </>
         )
      } else {
         return (
            <>
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
               <Spacer size="12px" />
               {selectedComponent ? (
                  <>
                     <ProductOptions
                        productOptions={formatData(
                           selectedComponent.selectedOptions
                        )}
                        selectedOption={selectedOption}
                        handleOptionSelect={handleOptionSelect}
                     />
                     <Spacer size="8px" />
                     {selectedOption?.modifier && (
                        <Modifiers
                           data={selectedOption.modifier}
                           handleChange={handleModifiersChange}
                        />
                     )}
                  </>
               ) : (
                  <>
                     {comboComponent.linkedProduct.customizableProductComponents
                        .length ? (
                        <>
                           {comboComponent.linkedProduct.customizableProductComponents.map(
                              component => (
                                 <Styles.Component
                                    container
                                    alignItems="center"
                                    key={component.id}
                                    onClick={() =>
                                       handleComponentSelect(component)
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
            </>
         )
      }
   }, [product, stages, currentStage])

   const isStageValid = (stage = stages[currentStage]) => {
      const comboComponent = product.comboProductComponents[currentStage]

      if (comboComponent.linkedProduct.type === 'simple') {
         if (stage.option && stage.modifiersState.isValid) {
            return true
         }
      } else {
         if (
            stage.customizableComponent &&
            stage.option &&
            stage.modifiersState.isValid
         ) {
            return true
         }
      }
      return false
   }

   const clearAllNextStages = () => {
      const updatedStages = stages
      updatedStages.fill(null, currentStage)
      setStages(updatedStages)
   }

   const handleStageChange = op => {
      if (op === 'next' && currentStage !== stages.length - 1) {
         setCurrentStage(prevStage => prevStage + 1)
      }
      if (op === 'prev' && currentStage !== 0) {
         clearAllNextStages()
         setCurrentStage(prevStage => prevStage - 1)
      }
   }

   React.useEffect(() => {
      if (product?.comboProductComponents?.length && !stages.length) {
         setStages(new Array(product.comboProductComponents.length).fill(null))
      }
   }, [product, stages])

   const add = () => {
      const stagesWithModifiers = stages.map(stage =>
         getCartItemWithModifiers(
            stage.option.cartItem,
            stage.modifiersState.selectedModifiers
         )
      )

      const comboProductCartItem = {
         cartId: +cartId,
         productId: product.id,
         unitPrice: calcDiscountedPrice(product.price, product.discount),
         childs: {
            data: stagesWithModifiers,
         },
      }

      const objects = new Array(quantity).fill(comboProductCartItem)
      insertCartItems({
         variables: { objects },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Select Product"
            close={() => closeTunnel(1)}
            right={{
               title: 'Add',
               isLoading: adding,
               disabled: stages.some(stage => !stage?.isValid),
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
                  {product.comboProductComponents.length ? (
                     <>
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-between"
                           height="40px"
                        >
                           <Flex container alignItems="center">
                              {currentStage !== 0 && (
                                 <>
                                    <IconButton
                                       type="ghost"
                                       size="sm"
                                       onClick={() => handleStageChange('prev')}
                                    >
                                       <ChevronLeft size={20} />
                                    </IconButton>
                                    <Spacer xAxis size="8px" />
                                 </>
                              )}
                              {currentStage !== stages.length - 1 && (
                                 <>
                                    <IconButton
                                       type="ghost"
                                       size="sm"
                                       onClick={() => handleStageChange('next')}
                                       disabled={!stages[currentStage]?.isValid}
                                    >
                                       <ChevronRight size={20} color="#000" />
                                    </IconButton>
                                    <Spacer xAxis size="8px" />
                                 </>
                              )}
                              <Text as="text2">
                                 {
                                    product.comboProductComponents[currentStage]
                                       .label
                                 }{' '}
                                 ({currentStage + 1}/{stages.length})
                              </Text>
                           </Flex>
                           <Text as="text2">
                              Total: {currencyFmt(totalPrice)}
                           </Text>
                        </Flex>
                        {renderComboComponent()}

                        <Styles.Fixed width="120px" margin="0 auto">
                           {currentStage === stages.length - 1 ? (
                              <QuantitySelector
                                 quantity={quantity}
                                 setQuantity={setQuantity}
                              />
                           ) : (
                              <TextButton
                                 type="solid"
                                 size="sm"
                                 onClick={() => handleStageChange('next')}
                                 disabled={!stages[currentStage]?.isValid}
                              >
                                 Proceed to Next Item
                              </TextButton>
                           )}
                        </Styles.Fixed>
                     </>
                  ) : (
                     <Filler message="No components found!" />
                  )}
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
