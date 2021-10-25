import React from 'react'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import {
   Spacer,
   TunnelHeader,
   TextButton,
   Text,
   Flex,
   IconButton,
} from '@dailykit/ui'
import { toast } from 'react-toastify'

import { TunnelBody } from './styled'

import { RemoveIcon } from '../../../apps/products/assets/icons'
import ConfirmationPopup from './confirmationPopup'
import {
   SIMPLE_RECIPE_UPDATE,
   UPDATE_PRODUCTS,
   UPDATE_INGREDIENTS,
   CONCATENATE_ARRAY_COLUMN,
   CONCATENATE_STRING_COLUMN,
   UPDATE_PRODUCT_OPTIONS,
   INCREASE_PRICE_AND_DISCOUNT,
   INCREMENTS_IN_PRODUCT_OPTIONS,
   UPDATE_SUBSCRIPTION_OCCURRENCE_PRODUCT,
   INCREASE_PRICE_SUBSCRIPTION_OCCURRENCE_PRODUCT,
} from './mutation'
import { RecipeBulkAction } from './entities/recipe'
import { IngredientBulkAction } from './entities/ingredients'
import { ProductBulkAction } from './entities/products'
import { ProductOptionsBulkAction } from './entities/productOptions'
import { SubscriptionOccurrenceProductBulkAction } from './entities/subscriptionOccurenceProduct'

const BulkActions = ({
   table,
   selectedRows,
   removeSelectedRow,
   setSelectedRows,
   keyName = 'name',
   close,
}) => {
   // ref
   const productOptionsTableRef = React.useRef()

   // initial states for entities
   const [initialBulkActionRecipe, setInitialBulkActionRecipe] = React.useState(
      {
         isPublished: false,
         type: false,
         cuisineName: {
            defaultOption: null,
            value: '',
         },
         author: '',
         cookingTime: '',
         utensils: '',
         notIncluded: '',
         description: '',
         utensilsConcat: {
            forAppend: '',
            forPrepend: '',
         },
         notIncludedConcat: {
            forAppend: '',
            forPrepend: '',
         },
         descriptionConcat: {
            forAppend: '',
            forPrepend: '',
         },
      }
   )
   const [initialBulkActionIngredient, setInitialBulkActionIngredient] =
      React.useState({
         isPublished: false,
         category: {
            defaultOption: null,
            value: '',
         },
         nameConcat: {
            forAppend: '',
            foePrepend: '',
         },
      })
   const [initialBulkActionProduct, setInitialBulkActionProduct] =
      React.useState({
         isPublished: false,
         additionalText: '',
         description: '',
         tags: '',
         additionalTextConcat: {
            forAppend: '',
            forPrepend: '',
         },
         descriptionConcat: {
            forAppend: '',
            forPrepend: '',
         },
         tagsConcat: {
            forAppend: '',
            forPrepend: '',
         },
         price: {
            set: 0,
            increase: 0,
            decrease: 0,
         },
         discount: {
            set: 0,
            increase: 0,
            decrease: 0,
         },
      })
   const [initialBulkActionProductOption, setInitialBulkActionProductOption] =
      React.useState({
         label: '',
         modifierId: null,
         operationConfigId: null,
         labelConcat: {
            forAppend: '',
            forPrepend: '',
         },
         price: {
            set: 0,
            increase: 0,
            decrease: 0,
         },
         discount: {
            set: 0,
            increase: 0,
            decrease: 0,
         },
      })
   const [
      initialBulkActionSubscriptionOccurrenceProduct,
      setInitialBulkActionSubscriptionOccurrenceProduct,
   ] = React.useState({
      addOnPrice: {
         set: 0,
         increase: 0,
         decrease: 0,
      },
      // productCategory: {
      //    defaultOption: null,
      //    value: '',
      // },

      // planTitle: {
      //    value: '',
      // },
   })
   // additional bulk actions (actions which not to be set)
   const [additionalBulkAction, setAdditionalBulkAction] = React.useState({})

   // bulkAction consists changes to be set in entities
   const [bulkActions, setBulkActions] = React.useState({})
   const [showPopup, setShowPopup] = React.useState(false)
   const [popupHeading, setPopupHeading] = React.useState('')

   // product options modifier
   const handleModifierClear = () => {
      productOptionsTableRef.current.clearModifier()
      setInitialBulkActionProductOption(prevState => ({
         ...prevState,
         modifierId: null,
      }))
   }

   const handleOperationConfigClear = () => {
      setInitialBulkActionProductOption(prevState => ({
         ...prevState,
         operationConfigId: null,
      }))
   }

   // clear all actions
   const clearAllActions = () => {
      if (table === 'Recipe') {
         setInitialBulkActionRecipe(prevState => ({
            ...prevState,
            isPublished: !prevState.isPublished,
            type: !prevState.type,
            author: '',
            cookingTime: '',
            utensils: '',
            cuisineName: {
               defaultOption: null,
               value: '',
            },
            notIncluded: '',
            description: '',
            utensilsConcat: {
               forAppend: '',
               forPrepend: '',
            },
            notIncludedConcat: {
               forAppend: '',
               forPrepend: '',
            },
            descriptionConcat: {
               forAppend: '',
               forPrepend: '',
            },
         }))
      } else if (table === 'Ingredient') {
         setInitialBulkActionIngredient(prevState => ({
            ...prevState,
            isPublished: !prevState.isPublished,
            category: {
               defaultOption: null,
               value: '',
            },
            nameConcat: {
               forAppend: '',
               foePrepend: '',
            },
         }))
      } else if (table === 'Product') {
         setInitialBulkActionProduct(prevState => ({
            ...prevState,
            isPublished: !prevState.isPublished,
            additionalText: '',
            description: '',
            tags: '',
            additionalTextConcat: {
               forAppend: '',
               forPrepend: '',
            },
            descriptionConcat: {
               forAppend: '',
               forPrepend: '',
            },
            tagsConcat: {
               forAppend: '',
               forPrepend: '',
            },
            price: {
               set: 0,
               increase: 0,
               decrease: 0,
            },
            discount: {
               set: 0,
               increase: 0,
               decrease: 0,
            },
         }))
      } else if (table === 'Menu Product Occurrence') {
         setInitialBulkActionSubscriptionOccurrenceProduct(prevState => ({
            ...prevState,
            addOnPrice: {
               set: 0,
               increase: 0,
               decrease: 0,
            },
            // productCategory: {
            //    defaultOption: null,
            //    value: '',
            // },

            // planTitle: {
            //    value: '',
            // },
         }))
      } else {
         // for product options
         handleModifierClear()
         handleOperationConfigClear()
         setInitialBulkActionProductOption({
            label: '',
            modifierId: null,
            operationConfigId: null,
            labelConcat: {
               forAppend: '',
               forPrepend: '',
            },
            price: {
               set: 0,
               increase: 0,
               decrease: 0,
            },
            discount: {
               set: 0,
               increase: 0,
               decrease: 0,
            },
         })
      }
      setBulkActions({})
   }
   // mutation
   const [simpleRecipeUpdate] = useMutation(SIMPLE_RECIPE_UPDATE, {
      onCompleted: () => {
         toast.success('Update Successfully')
         close(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })

   const [updateProducts] = useMutation(UPDATE_PRODUCTS, {
      onCompleted: () => {
         toast.success('Update Successfully')
         close(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })

   const [updateIngredients] = useMutation(UPDATE_INGREDIENTS, {
      onCompleted: () => {
         toast.success('Update Successfully')
         close(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })
   const [updateProductOptions] = useMutation(UPDATE_PRODUCT_OPTIONS, {
      onCompleted: () => {
         toast.success('Update Successfully')
         close(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
      },
   })
   const [updateSubscriptionOccurrenceProduct] = useMutation(
      UPDATE_SUBSCRIPTION_OCCURRENCE_PRODUCT,
      {
         onCompleted: () => {
            toast.success('Update Successfully')
            close(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
         },
      }
   )

   const [concatenateArrayColumn] = useLazyQuery(CONCATENATE_ARRAY_COLUMN, {
      onCompleted: () => {
         toast.success('Update Successfully')
         close(1)
      },
      onError: () => {
         toast.error('Something went wrong!')
      },
   })
   const [concatenateStringColumn, { loading, error }] = useLazyQuery(
      CONCATENATE_STRING_COLUMN,
      {
         onCompleted: () => {
            toast.success('Update Successfully')
            close(1)
         },
         onError: () => {
            toast.error('Something went wrong!')
         },
      }
   )
   const [increasePriceAndDiscount] = useMutation(INCREASE_PRICE_AND_DISCOUNT, {
      onCompleted: () => {
         toast.success('Update Successfully')
         //  close(1)
      },
      onError: () => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })
   const [incrementsInProductOptions] = useMutation(
      INCREMENTS_IN_PRODUCT_OPTIONS,
      {
         onCompleted: () => {
            toast.success('Update Successfully')
            // close(1)
         },
         onError: () => {
            toast.error('Something went wrong!')
            //  logger(error)
         },
      }
   )
   const [increasePriceSubscriptionOccurrenceProduct] = useMutation(
      INCREASE_PRICE_SUBSCRIPTION_OCCURRENCE_PRODUCT,
      {
         onCompleted: () => {
            toast.success('Update Successfully')
            //  close(1)
         },
         onError: () => {
            toast.error('Something went wrong!')
            //  logger(error)
         },
      }
   )

   // additional function
   const additionalFunction = () => {
      if (table === 'Product') {
         increasePriceAndDiscount({
            variables: {
               price: additionalBulkAction.price || 0,
               discount: additionalBulkAction.discount || 0,
               ids: selectedRows.map(x => x.id),
            },
         })
         close(1)
      }
      if (table === 'Product Options') {
         incrementsInProductOptions({
            variables: {
               _inc: additionalBulkAction,
               _in: selectedRows.map(row => row.id),
            },
         })
         close(1)
      }
      if (table === 'Menu Product Occurrence') {
         increasePriceSubscriptionOccurrenceProduct({
            variables: {
               addOnPrice: additionalBulkAction.addOnPrice || 0,
               where: { id: { _in: selectedRows.map(row => row.id) } },
            },
         })
         close(1)
      }
   }
   console.log('Additional Action:::', additionalBulkAction, bulkActions)
   // This  function only use for bulk action mutation
   const getMutation = table => {
      switch (table) {
         case 'Recipe':
            return simpleRecipeUpdate
         case 'Product':
            return updateProducts
         case 'Ingredient':
            return updateIngredients
         case 'Product Options':
            return updateProductOptions
         case 'Menu Product Occurrence':
            return updateSubscriptionOccurrenceProduct
         default:
            return null
      }
   }
   const handleOnUpdate = () => {
      const fn = getMutation(table)
      if ('concatData' in bulkActions) {
         const toBeConcat = Object.keys(bulkActions.concatData)
         if (toBeConcat.length > 0) {
            const newConcatData = { ...bulkActions.concatData }
            toBeConcat.forEach(data => {
               newConcatData[data].arrayofids =
                  '(' + selectedRows.map(idx => idx.id).join(',') + ')'
               newConcatData[data].appendvalue = newConcatData[data].appendvalue
                  ? newConcatData[data].appendvalue
                  : []
               newConcatData[data].prependvalue = newConcatData[data]
                  .prependvalue
                  ? newConcatData[data].prependvalue
                  : []
               concatenateArrayColumn({
                  variables: {
                     concatData: newConcatData[data],
                  },
               })
            })
         }
      }
      if ('concatDataString' in bulkActions) {
         const toBeConcat = Object.keys(bulkActions.concatDataString)
         console.log(1)
         console.log(toBeConcat)
         if (toBeConcat.length > 0) {
            console.log(2)
            const newConcatDataString = { ...bulkActions.concatDataString }
            toBeConcat.forEach(data => {
               console.log(3)
               newConcatDataString[data].arrayofids =
                  '(' + selectedRows.map(idx => idx.id).join(',') + ')'
               newConcatDataString[data].appendvalue = newConcatDataString[data]
                  .appendvalue
                  ? newConcatDataString[data].appendvalue
                  : ''
               newConcatDataString[data].prependvalue = newConcatDataString[
                  data
               ].prependvalue
                  ? newConcatDataString[data].prependvalue
                  : ''
               console.log('this is concatDataString', newConcatDataString)
               concatenateStringColumn({
                  variables: {
                     concatDataString: newConcatDataString[data],
                  },
               })
            })
         }
      }
      //additional action use for those action which not to be set.(increment)
      if (additionalFunction) {
         console.log('in additional')
         additionalFunction()
      }
      if (fn) {
         const newBulkAction = { ...bulkActions }
         if ('concatData' in bulkActions) {
            delete newBulkAction.concatData
         }
         if ('concatDataString' in bulkActions) {
            delete newBulkAction.concatDataString
         }
         if (Object.keys(newBulkAction).length !== 0) {
            fn({
               variables: {
                  ids: selectedRows.map(idx => idx.id),
                  _set: newBulkAction,
               },
            })
         }
      } else {
         toast.error('Incorrect schema or table name!')
      }
   }

   return (
      <>
         <TunnelHeader
            title="Apply Bulk Actions"
            close={() => close(1)}
            right={{
               title: 'Delete Selected Data',
               action: function () {
                  setShowPopup(true)
                  setPopupHeading(`Delete Selected ${table}`)
                  setBulkActions({ isArchived: true })
               },
            }}
         />
         <TunnelBody>
            <ConfirmationPopup
               bulkActions={bulkActions}
               setBulkActions={setBulkActions}
               showPopup={showPopup}
               setShowPopup={setShowPopup}
               popupHeading={popupHeading}
               selectedRows={selectedRows}
               handleOnUpdate={handleOnUpdate}
               table={table}
               setSelectedRows={setSelectedRows}
            />
            <Flex
               container
               as="header"
               width="100%"
               justifyContent="flex-start"
            >
               <Flex width="50%">
                  <Flex
                     container
                     as="header"
                     alignItems="center"
                     justifyContent="space-between"
                     padding="0px 0px 10px 0px"
                  >
                     <Text as="h3">{table}</Text>
                     <span
                        style={{
                           color: '#919699',
                           fontStyle: 'italic',
                           fontWeight: '500',
                           marginRight: '20px',
                        }}
                     >
                        {selectedRows.length}{' '}
                        {selectedRows.length > 1 ? table + 's' : table} selected{' '}
                     </span>
                  </Flex>
                  <div
                     style={{
                        height: '48vh',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                     }}
                  >
                     {selectedRows.map((item, id) => (
                        <div
                           as="title"
                           style={{
                              backgroundColor: `${
                                 id % 2 === 0 ? '#F4F4F4' : '#fff'
                              }`,
                              color: '#202020',
                           }}
                           key={id}
                        >
                           <Flex
                              container
                              as="header"
                              alignItems="center"
                              justifyContent="space-between"
                           >
                              {item[keyName]}
                              <IconButton
                                 type="ghost"
                                 onClick={() => {
                                    removeSelectedRow(item.id)
                                    setSelectedRows(prevState =>
                                       prevState.filter(
                                          row => row.id !== item.id
                                       )
                                    )
                                 }}
                              >
                                 <RemoveIcon color="#FF5A52" />
                              </IconButton>
                           </Flex>
                        </div>
                     ))}
                  </div>
               </Flex>
               <Flex width="50%" padding="0px 0px 0px 20px">
                  <Flex
                     container
                     justifyContent="space-between"
                     alignItems="center"
                  >
                     <Text as="h3">Bulk Actions</Text>
                     <TextButton
                        type="ghost"
                        size="sm"
                        onClick={() => {
                           clearAllActions()
                        }}
                     >
                        Clear All Actions
                     </TextButton>
                  </Flex>
                  <Spacer size="8px" />
                  <Flex height="44vh" overflowY="auto">
                     {/* {children} */}
                     {table === 'Recipe' && (
                        <RecipeBulkAction
                           initialBulkAction={initialBulkActionRecipe}
                           setInitialBulkAction={setInitialBulkActionRecipe}
                           bulkActions={bulkActions}
                           setBulkActions={setBulkActions}
                        />
                     )}
                     {table === 'Ingredient' && (
                        <IngredientBulkAction
                           initialBulkAction={initialBulkActionIngredient}
                           setInitialBulkAction={setInitialBulkActionIngredient}
                           bulkActions={bulkActions}
                           setBulkActions={setBulkActions}
                        />
                     )}
                     {table === 'Product' && (
                        <ProductBulkAction
                           initialBulkAction={initialBulkActionProduct}
                           setInitialBulkAction={setInitialBulkActionProduct}
                           bulkActions={bulkActions}
                           setBulkActions={setBulkActions}
                           additionalBulkAction={additionalBulkAction}
                           setAdditionalBulkAction={setAdditionalBulkAction}
                        />
                     )}
                     {table === 'Product Options' && (
                        <ProductOptionsBulkAction
                           ref={productOptionsTableRef}
                           initialBulkAction={initialBulkActionProductOption}
                           setInitialBulkAction={
                              setInitialBulkActionProductOption
                           }
                           bulkActions={bulkActions}
                           setBulkActions={setBulkActions}
                           additionalBulkAction={additionalBulkAction}
                           setAdditionalBulkAction={setAdditionalBulkAction}
                        />
                     )}
                     {table === 'Menu Product Occurrence' && (
                        <SubscriptionOccurrenceProductBulkAction
                           initialBulkAction={
                              initialBulkActionSubscriptionOccurrenceProduct
                           }
                           setInitialBulkAction={
                              setInitialBulkActionSubscriptionOccurrenceProduct
                           }
                           bulkActions={bulkActions}
                           setBulkActions={setBulkActions}
                           additionalBulkAction={additionalBulkAction}
                           setAdditionalBulkAction={setAdditionalBulkAction}
                        />
                     )}
                  </Flex>
                  <Spacer size="16px" />
                  <Flex container alignItems="center" justifyContent="flex-end">
                     <TextButton
                        type="solid"
                        size="md"
                        disabled={
                           selectedRows.length > 0 &&
                           (Object.keys(bulkActions).length !== 0 ||
                           Object.keys(additionalBulkAction).length !== 0
                              ? false
                              : true)
                        }
                        onClick={() => {
                           setShowPopup(true)
                           setPopupHeading('Save All Changes')
                        }}
                     >
                        Save Changes
                     </TextButton>
                  </Flex>
               </Flex>
            </Flex>
         </TunnelBody>
      </>
   )
}
export default BulkActions
