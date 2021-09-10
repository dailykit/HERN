import React from 'react'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Collapsible,
   ComboButton,
   Dropdown,
   Flex,
   Form,
   IconButton,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'

import { PRODUCT_OPTION, PRODUCT_OPTION_TYPES } from '../../../../graphql'
import { logger } from '../../../../../../shared/utils'
import {
   DeleteIcon,
   EditIcon,
   PlusIcon,
} from '../../../../../../shared/assets/icons'
import { ModifiersContext } from '../../../../context/product/modifiers'
import { ProductContext } from '../../../../context/product'
import validator from '../validators'
import {
   ServingsTunnel,
   ModifierFormTunnel,
   ModifierModeTunnel,
   ModifierOptionsTunnel,
   ModifierPhotoTunnel,
   ModifierTemplatesTunnel,
   ModifierTypeTunnel,
   InventoryBundleModeTunnel,
   InventoryBundleFormTunnel,
   InventoryBundleItemTypeTunnel,
   InventoryBundleItemsTunnel,
   InventoryBundleListingTunnel,
} from './tunnels'
import {
   DragNDrop,
   InlineLoader,
   OperationConfig,
} from '../../../../../../shared/components'
import { useDnd } from '../../../../../../shared/components/DragNDrop/useDnd'
import { from } from 'apollo-link'
import { InventoryBundleContext } from '../../../../context/product/inventoryBundle'

const ProductOptions = ({ productId, productName, options }) => {
   const SERVING_TUNNEL_TYPES = ['mealKit', 'readyToEat', 'Meal Kit']

   const { initiatePriority } = useDnd()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   const [
      inventoryTunnels,
      openInventoryTunnel,
      closeInventoryTunnel,
   ] = useTunnel(5)
   const [
      modifiersTunnel,
      openModifiersTunnel,
      closeModifiersTunnel,
   ] = useTunnel(6)
   const [
      operationConfigTunnels,
      openOperationConfigTunnel,
      closeOperationConfigTunnel,
   ] = useTunnel(4)

   const { productState, productDispatch } = React.useContext(ProductContext)
   const { modifiersDispatch } = React.useContext(ModifiersContext)
   const { bundleDispatch } = React.useContext(InventoryBundleContext)

   const [productOptionTypes, setProductOptionTypes] = React.useState([])

   const opConfigInvokedBy = React.useRef('')
   const modifierOpConfig = React.useRef(undefined)

   React.useEffect(() => {
      if (options.length) {
         initiatePriority({
            tablename: 'productOption',
            schemaname: 'products',
            data: options,
         })
      }
   }, [options])

   const { loading } = useSubscription(PRODUCT_OPTION_TYPES.LIST, {
      onSubscriptionData: data => {
         setProductOptionTypes(data.subscriptionData.data.productOptionTypes)
      },
   })

   const [createProductOption] = useMutation(PRODUCT_OPTION.CREATE, {
      onCompleted: () => {
         toast.success('Option created.')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateProductOption] = useMutation(PRODUCT_OPTION.UPDATE, {
      onCompleted: () => {
         toast.success('Option updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleAddOption = () => {
      createProductOption({
         variables: {
            object: {
               productId,
            },
         },
      })
   }

   const handleAddOptionItem = option => {
      productDispatch({
         type: 'OPTION_ID',
         payload: option.id,
      })
      if (SERVING_TUNNEL_TYPES.includes(option.type)) {
         openTunnel(1)
      } else {
         bundleDispatch({
            type: 'LABEL',
            payload: `${productName} - ${option.label}`,
         })
         openInventoryTunnel(1)
      }
   }

   const handleEditOptionItem = option => {
      productDispatch({
         type: 'OPTION_ID',
         payload: option.id,
      })
      if (option.simpleRecipeYield) {
         openTunnel(1)
      } else {
         bundleDispatch({
            type: 'BUNDLE_ID',
            payload: option.inventoryProductBundle.id,
         })
         openInventoryTunnel(2)
      }
   }

   const handleAddModifier = optionId => {
      modifiersDispatch({
         type: 'OPTION_ID',
         payload: optionId,
      })
      openModifiersTunnel(1)
   }

   const handleEditModifier = modifier => {
      modifiersDispatch({
         type: 'MODIFIER_ID',
         payload: modifier.id,
      })
      openModifiersTunnel(2)
   }

   const handleAddOpConfig = optionId => {
      productDispatch({
         type: 'OPTION_ID',
         payload: optionId,
      })
      opConfigInvokedBy.current = 'option'
      openOperationConfigTunnel(1)
   }

   const saveOperationConfig = config => {
      if (opConfigInvokedBy.current === 'option') {
         updateProductOption({
            variables: {
               id: productState.optionId,
               _set: {
                  operationConfigId: config.id,
               },
            },
         })
      }
      if (opConfigInvokedBy.current === 'modifier') {
         modifierOpConfig.current = config
      }
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <ServingsTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={inventoryTunnels}>
            <Tunnel layer={1}>
               <InventoryBundleModeTunnel
                  open={openInventoryTunnel}
                  close={closeInventoryTunnel}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <InventoryBundleFormTunnel
                  open={openInventoryTunnel}
                  close={closeInventoryTunnel}
               />
            </Tunnel>
            <Tunnel layer={3}>
               <InventoryBundleItemTypeTunnel
                  open={openInventoryTunnel}
                  close={closeInventoryTunnel}
               />
            </Tunnel>
            <Tunnel layer={4}>
               <InventoryBundleItemsTunnel close={closeInventoryTunnel} />
            </Tunnel>
            <Tunnel layer={5}>
               <InventoryBundleListingTunnel close={closeInventoryTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={modifiersTunnel}>
            <Tunnel layer={1}>
               <ModifierModeTunnel
                  open={openModifiersTunnel}
                  close={closeModifiersTunnel}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <ModifierFormTunnel
                  open={openModifiersTunnel}
                  close={closeModifiersTunnel}
                  openOperationConfigTunnel={value => {
                     opConfigInvokedBy.current = 'modifier'
                     openOperationConfigTunnel(value)
                  }}
                  modifierOpConfig={modifierOpConfig.current}
               />
            </Tunnel>
            <Tunnel layer={3}>
               <ModifierTypeTunnel
                  open={openModifiersTunnel}
                  close={closeModifiersTunnel}
               />
            </Tunnel>
            <Tunnel layer={4}>
               <ModifierOptionsTunnel close={closeModifiersTunnel} />
            </Tunnel>
            <Tunnel layer={5}>
               <ModifierPhotoTunnel close={closeModifiersTunnel} />
            </Tunnel>
            <Tunnel layer={6}>
               <ModifierTemplatesTunnel close={closeModifiersTunnel} />
            </Tunnel>
         </Tunnels>
         <OperationConfig
            tunnels={operationConfigTunnels}
            openTunnel={openOperationConfigTunnel}
            closeTunnel={closeOperationConfigTunnel}
            onSelect={saveOperationConfig}
         />
         {Boolean(options.length) && (
            <Flex margin="0 0 32px 0">
               <DragNDrop
                  list={options}
                  droppableId="productOptionsDroppableId"
                  tablename="productOption"
                  schemaname="products"
               >
                  {options.map(option => (
                     <Option
                        key={option.id}
                        option={option}
                        productOptionTypes={productOptionTypes}
                        handleAddOptionItem={() => handleAddOptionItem(option)}
                        handleEditOptionItem={() =>
                           handleEditOptionItem(option)
                        }
                        handleAddModifier={() => handleAddModifier(option.id)}
                        handleEditModifier={() =>
                           handleEditModifier(option.modifier)
                        }
                        handleAddOpConfig={() => handleAddOpConfig(option.id)}
                     />
                  ))}
               </DragNDrop>
            </Flex>
         )}
         <ButtonTile
            type="secondary"
            text="Add Option"
            onClick={handleAddOption}
         />
      </>
   )
}

export default ProductOptions

const Option = ({
   option,
   productOptionTypes,
   handleAddOptionItem,
   handleAddModifier,
   handleEditModifier,
   handleEditOptionItem,
   handleAddOpConfig,
}) => {
   const [history, setHistory] = React.useState({
      ...option,
   })
   const [selectedOptionTypeIndex, setSelectedOptionTypeIndex] = React.useState(
      null
   )

   const searchedOption = option => console.log(option)

   React.useEffect(() => {
      if (option.type && productOptionTypes.length) {
         const index = productOptionTypes.findIndex(
            el => el.title === option.type
         )
         if (index !== -1) {
            setSelectedOptionTypeIndex(index + 1)
         }
      }
   }, [option.type, productOptionTypes])

   React.useEffect(() => {
      setHistory({ ...option })
   }, [option.label, option.price, option.discount, option.quantity])

   const [label, setLabel] = React.useState({
      value: option.label || '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [quantity, setQuantity] = React.useState({
      value: option.quantity,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [price, setPrice] = React.useState({
      value: option.price,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [discount, setDiscount] = React.useState({
      value: option.discount,
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })

   const [updateProductOption] = useMutation(PRODUCT_OPTION.UPDATE, {
      onCompleted: () => {
         toast.success('Option updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [deleteProductOption] = useMutation(PRODUCT_OPTION.DELETE, {
      onCompleted: () => {
         toast.success('Option deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleDeleteOptionItem = () => {
      updateProductOption({
         variables: {
            id: option.id,
            _set: {
               simpleRecipeYieldId: null,
               supplierItemId: null,
               sachetItemId: null,
               inventoryProductBundleId: null,
            },
         },
      })
   }

   const handleDeleteOption = () => {
      const isConfirmed = window.confirm(
         `Are you sure you want to delete - ${option.label}?`
      )
      if (isConfirmed) {
         deleteProductOption({
            variables: {
               id: option.id,
            },
         })
      }
   }

   const isActuallyUpdated = (field, value) => {
      if (history[field] !== value) {
         return true
      }
      return false
   }

   const handleBlur = field => {
      switch (field) {
         case 'label': {
            const val = label.value.trim()
            const { isValid, errors } = validator.label(val)
            if (isValid && isActuallyUpdated(field, val)) {
               updateProductOption({
                  variables: {
                     id: option.id,
                     _set: {
                        label: val,
                     },
                  },
               })
            }
            setLabel({
               ...label,
               meta: {
                  isTouched: true,
                  isValid,
                  errors,
               },
            })
            return
         }
         case 'price': {
            const val = price.value
            const { isValid, errors } = validator.price(val)
            if (isValid && isActuallyUpdated(field, val)) {
               updateProductOption({
                  variables: {
                     id: option.id,
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
               updateProductOption({
                  variables: {
                     id: option.id,
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
         case 'quantity': {
            const val = quantity.value
            const { isValid, errors } = validator.quantity(val)
            if (isValid && isActuallyUpdated(field, val)) {
               updateProductOption({
                  variables: {
                     id: option.id,
                     _set: {
                        quantity: val,
                     },
                  },
               })
            }
            setQuantity({
               ...quantity,
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

   const selectedOption = selected => {
      updateProductOption({
         variables: {
            id: option.id,
            _set: {
               type: selected.title,
               simpleRecipeYieldId: null,
               supplierItemId: null,
               sachetItemId: null,
            },
         },
      })
   }

   const renderLinkedItem = () => {
      if (!option.type) return null

      const renderItemName = () => {
         if (option.simpleRecipeYield) {
            return `${option.simpleRecipeYield.simpleRecipe.name} - ${option.simpleRecipeYield.yield.serving} serving`
         }
         if (option.inventoryProductBundle) {
            return `${option.inventoryProductBundle.label}`
         }
      }

      return (
         <>
            {option.simpleRecipeYield || option.inventoryProductBundle ? (
               <Flex container alignItems="center">
                  <Text as="title">{renderItemName()}</Text>
                  <Spacer xAxis size="16px" />
                  <IconButton type="ghost" onClick={handleEditOptionItem}>
                     <EditIcon color="#00A7E1" />
                  </IconButton>
                  <Spacer xAxis size="8px" />
                  <IconButton type="ghost" onClick={handleDeleteOptionItem}>
                     <DeleteIcon color="#FF5A52" />
                  </IconButton>
               </Flex>
            ) : (
               <IconButton type="ghost" onClick={handleAddOptionItem}>
                  <PlusIcon />
               </IconButton>
            )}
         </>
      )
   }

   const renderHead = () => {
      return (
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            width="100%"
         >
            <Flex container alignItems="center">
               <Flex maxWidth="140px">
                  <Form.Label htmlFor={`label-${option.id}`} title="label">
                     Label
                  </Form.Label>
                  <Form.Text
                     id={`label-${option.id}`}
                     name={`label-${option.id}`}
                     onBlur={() => handleBlur('label')}
                     onChange={e =>
                        setLabel({ ...label, value: e.target.value })
                     }
                     value={label.value}
                     placeholder="Enter label"
                     hasError={label.meta.isTouched && !label.meta.isValid}
                  />
               </Flex>
               <Spacer xAxis size="32px" />
               <Flex maxWidth="100px">
                  <Form.Label
                     htmlFor={`quantity-${option.id}`}
                     title="quantity"
                  >
                     Quantity
                  </Form.Label>
                  <Form.Number
                     id={`quantity-${option.id}`}
                     name={`quantity-${option.id}`}
                     onBlur={() => handleBlur('quantity')}
                     onChange={e =>
                        setQuantity({ ...quantity, value: e.target.value })
                     }
                     value={quantity.value}
                     placeholder="Enter quantity"
                     hasError={
                        quantity.meta.isTouched && !quantity.meta.isValid
                     }
                  />
               </Flex>
               <Spacer xAxis size="16px" />
               <Flex maxWidth="100px">
                  <Form.Label htmlFor={`price-${option.id}`} title="price">
                     Price
                  </Form.Label>
                  <Form.Number
                     id={`price-${option.id}`}
                     name={`price-${option.id}`}
                     onBlur={() => handleBlur('price')}
                     onChange={e =>
                        setPrice({ ...price, value: e.target.value })
                     }
                     value={price.value}
                     placeholder="Enter price"
                     hasError={price.meta.isTouched && !price.meta.isValid}
                  />
               </Flex>
               <Spacer xAxis size="16px" />
               <Flex maxWidth="100px">
                  <Form.Label
                     htmlFor={`discount-${option.id}`}
                     title="discount"
                  >
                     Discount
                  </Form.Label>
                  <Form.Number
                     id={`discount-${option.id}`}
                     name={`discount-${option.id}`}
                     onBlur={() => handleBlur('discount')}
                     onChange={e =>
                        setDiscount({ ...discount, value: e.target.value })
                     }
                     value={discount.value}
                     placeholder="Enter discount"
                     hasError={
                        discount.meta.isTouched && !discount.meta.isValid
                     }
                  />
               </Flex>
               <Spacer xAxis size="32px" />
               <Flex width="265px" style={{marginBottom:'22px'}}>
                  <Form.Label title="option-type">Type</Form.Label>
                  <Dropdown
                     type="single"
                     defaultValue={selectedOptionTypeIndex}
                     options={productOptionTypes}
                     searchedOption={searchedOption}
                     selectedOption={selectedOption}
                     placeholder="type what you're looking for..."
                  />
               </Flex>
               <Spacer xAxis size="32px" />
               {renderLinkedItem()}
            </Flex>
            <IconButton type="ghost" onClick={handleDeleteOption}>
               <DeleteIcon color="#FF5A52" />
            </IconButton>
         </Flex>
      )
   }

   const handleDeleteModifier = () => {
      updateProductOption({
         variables: {
            id: option.id,
            _set: {
               modifierId: null,
            },
         },
      })
   }

   const handleDeleteOpConfig = () => {
      updateProductOption({
         variables: {
            id: option.id,
            _set: {
               operationConfigId: null,
            },
         },
      })
   }

   const renderBody = () => {
      return (
         <Flex container padding="8px 0 0 0">
            <Flex>
               {option.modifier ? (
                  <Flex container alignItems="center">
                     <Flex>
                        <Text as="subtitle">Modifier Template</Text>
                        <Text as="p">{option.modifier.name}</Text>
                     </Flex>
                     <Spacer xAxis size="16px" />
                     <IconButton type="ghost" onClick={handleEditModifier}>
                        <EditIcon color="#00A7E1" />
                     </IconButton>
                     <Spacer xAxis size="8px" />
                     <IconButton type="ghost" onClick={handleDeleteModifier}>
                        <DeleteIcon color="#FF5A52" />
                     </IconButton>
                  </Flex>
               ) : (
                  <ComboButton type="ghost" onClick={handleAddModifier}>
                     <PlusIcon /> Add Modifiers
                  </ComboButton>
               )}
            </Flex>
            <Spacer xAxis size="32px" />
            <Flex>
               {option.operationConfig ? (
                  <Flex container alignItems="center">
                     <Flex>
                        <Text as="subtitle">Operation Configuration</Text>
                        <Text as="p">{option.operationConfig.name}</Text>
                     </Flex>
                     <Spacer xAxis size="16px" />
                     <IconButton type="ghost" onClick={handleAddOpConfig}>
                        <EditIcon color="#00A7E1" />
                     </IconButton>
                     <Spacer xAxis size="8px" />
                     <IconButton type="ghost" onClick={handleDeleteOpConfig}>
                        <DeleteIcon color="#FF5A52" />
                     </IconButton>
                  </Flex>
               ) : (
                  <ComboButton type="ghost" onClick={handleAddOpConfig}>
                     <PlusIcon /> Add Operational Configuration
                  </ComboButton>
               )}
            </Flex>
         </Flex>
      )
   }

   return <Collapsible isDraggable head={renderHead()} body={renderBody()} />
}
