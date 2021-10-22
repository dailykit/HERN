import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Spacer,
   TextButton,
   Text,
   Flex,
   Dropdown,
   ButtonGroup,
   RadioGroup,
   Form,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { INGREDIENT_CATEGORY_CREATE } from '../mutation'
import { INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE } from '../subscription'

import { Tooltip } from '../..'

export const IngredientBulkAction = ({
   initialBulkAction,
   setInitialBulkAction,
   bulkActions,
   setBulkActions,
}) => {
   const [ingredientCategories, setIngredientCategories] = React.useState([])
   const radioPublishOption = [
      { id: 1, title: 'Publish', payload: { isPublished: true } },
      { id: 2, title: 'Unpublish', payload: { isPublished: false } },
   ]

   // mutation
   const [_createIngredientCategory] = useMutation(INGREDIENT_CATEGORY_CREATE, {
      variables: {
         name: initialBulkAction.category.value,
      },
      onCompleted: () => {
         toast.success('Update Successfully')
         setInitialBulkAction({
            ...initialBulkAction,
            category: { ...initialBulkAction.category, value: '' },
         })
      },
      onError: error => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })
   // subscription
   useSubscription(INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE, {
      onSubscriptionData: data => {
         const newIngredientCategories =
            data.subscriptionData.data.ingredientCategories.map(
               (item, index) => ({
                  ...item,
                  id: index + 1,
                  payload: { category: item.title },
               })
            )
         setIngredientCategories(newIngredientCategories)
      },
   })
   const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)
   const createIngredientCategory = () => {
      const newCategory = capitalize(initialBulkAction.category.value)
      _createIngredientCategory({
         variables: {
            name: newCategory,
         },
      })
   }

   const checkNested = (obj, level, ...rest) => {
      if (obj === undefined) return false
      if (rest.length == 0 && obj.hasOwnProperty(level)) return true
      return checkNested(obj[level], ...rest)
   }
   const commonRemove = (
      column,
      concatType,
      positionPrimary,
      positionSecondary
   ) => {
      //positionPrimary use for changing field
      //positionSecondary use for another field
      concatType =
         concatType === 'concatData' ? 'concatData' : 'concatDataString'
      const nestedCheckPrepend = checkNested(
         bulkActions,
         concatType,
         column,
         positionSecondary
      )
      if (nestedCheckPrepend) {
         const newBulkAction = { ...bulkActions }
         delete newBulkAction[concatType][column][positionPrimary]
         setBulkActions(newBulkAction)
         return
      }
      const checkNestedColumn = checkNested(bulkActions, concatType, column)
      if (checkNestedColumn) {
         const newBulkAction = { ...bulkActions }
         delete newBulkAction[concatType][column]
         setBulkActions(newBulkAction)
      }
      if (concatType in bulkActions) {
         if (Object.keys(bulkActions[concatType]).length === 0) {
            const newBulkAction = { ...bulkActions }
            delete newBulkAction[concatType]
            setBulkActions(newBulkAction)
         }
      }
   }
   return (
      <>
         <Flex container alignItems="center">
            <Text as="text1">Change Publish Status</Text>
            <TextButton
               type="ghost"
               size="sm"
               onClick={() => {
                  setInitialBulkAction(prevState => ({
                     ...prevState,
                     isPublished: !prevState.isPublished,
                  }))
                  setBulkActions(prevState => {
                     delete prevState.isPublished
                     return prevState
                  })
               }}
            >
               Clear
            </TextButton>
         </Flex>
         <Spacer size="10px" />
         <ButtonGroup align="left">
            <RadioGroup
               options={radioPublishOption}
               active={initialBulkAction.isPublished}
               onChange={option => {
                  if (option !== null) {
                     setBulkActions(prevState => ({
                        ...prevState,
                        ...option.payload,
                     }))
                     return
                  }
                  setBulkActions(prevState => {
                     const newActions = { ...prevState }
                     delete newActions['isPublished']
                     return newActions
                  })
               }}
            />
         </ButtonGroup>
         <br />
         <Flex container alignItems="center">
            <Text as="text1">Ingredient Category</Text>
            <TextButton
               type="ghost"
               size="sm"
               onClick={() => {
                  setInitialBulkAction(prevState => ({
                     ...prevState,
                     category: {
                        defaultOption: null,
                        value: '',
                     },
                  }))
                  setBulkActions(prevState => {
                     delete prevState['category']
                     return prevState
                  })
               }}
            >
               Clear
            </TextButton>
         </Flex>
         <Spacer size="10px" />
         <Dropdown
            type="single"
            defaultValue={initialBulkAction.category.defaultOption}
            options={ingredientCategories}
            addOption={() => {
               createIngredientCategory()
            }}
            searchedOption={option =>
               setInitialBulkAction({
                  ...initialBulkAction,
                  category: {
                     ...initialBulkAction.category,
                     value: option,
                  },
               })
            }
            selectedOption={option => {
               setInitialBulkAction(prevState => ({
                  ...prevState,
                  category: {
                     ...prevState,
                     defaultOption: option,
                  },
               }))
               setBulkActions(prevState => ({
                  ...prevState,
                  ...option.payload,
               }))
            }}
            placeholder="choose ingredient type"
         />
         <Spacer size="10px" />
         <Form.Group>
            <Form.Label htmlFor="nameAppend" title="nameAppend">
               <Flex container alignItems="center">
                  <Text as="text1">Ingredient name append</Text>
                  <TextButton
                     type="ghost"
                     size="sm"
                     onClick={() => {
                        setInitialBulkAction({
                           ...initialBulkAction,
                           nameConcat: {
                              ...initialBulkAction.nameConcat,
                              forAppend: '',
                           },
                        })
                        commonRemove(
                           'name',
                           'concatDataString',
                           'appendvalue',
                           'prependvalue'
                        )
                     }}
                  >
                     Clear
                  </TextButton>
                  <Tooltip identifier="product" />
               </Flex>
            </Form.Label>
            <Form.Text
               id="nameAppend"
               name="nameAppend"
               value={initialBulkAction.nameConcat.forAppend}
               onChange={e =>
                  setInitialBulkAction({
                     ...initialBulkAction,
                     nameConcat: {
                        ...initialBulkAction.nameConcat,
                        forAppend: e.target.value,
                     },
                  })
               }
               onBlur={() => {
                  if (initialBulkAction.nameConcat.forAppend) {
                     const newNameAppend =
                        initialBulkAction.nameConcat.forAppend

                     const concatDataString = {
                        ...bulkActions.concatDataString,
                     }
                     const newName = {
                        ...concatDataString.name,
                     }
                     newName.columnname = 'name'
                     newName.appendvalue = newNameAppend
                     newName.schemaname = 'ingredient'
                     newName.tablename = 'ingredient'
                     concatDataString.name = newName
                     setBulkActions({
                        ...bulkActions,
                        concatDataString,
                     })
                  }
               }}
               placeholder="Enter ingredient name append"
            />
         </Form.Group>
         <Spacer size="10px" />
         <Form.Group>
            <Form.Label htmlFor="namePrepend" title="namePrepend">
               <Flex container alignItems="center">
                  <Text as="text1">Ingredient name prepend</Text>
                  <TextButton
                     type="ghost"
                     size="sm"
                     onClick={() => {
                        setInitialBulkAction({
                           ...initialBulkAction,
                           nameConcat: {
                              ...initialBulkAction.nameConcat,
                              forPrepend: '',
                           },
                        })
                        commonRemove(
                           'name',
                           'concatDataString',
                           'prependvalue',
                           'appendvalue'
                        )
                     }}
                  >
                     Clear
                  </TextButton>
                  <Tooltip identifier="product" />
               </Flex>
            </Form.Label>
            <Form.Text
               id="namePrepend"
               name="namePrepend"
               value={initialBulkAction.nameConcat.forPrepend}
               onChange={e =>
                  setInitialBulkAction({
                     ...initialBulkAction,
                     nameConcat: {
                        ...initialBulkAction.nameConcat,
                        forPrepend: e.target.value,
                     },
                  })
               }
               onBlur={() => {
                  if (initialBulkAction.nameConcat.forPrepend) {
                     const newNamePrepend =
                        initialBulkAction.nameConcat.forPrepend

                     const concatDataString = {
                        ...bulkActions.concatDataString,
                     }
                     const newName = {
                        ...concatDataString.name,
                     }
                     newName.columnname = 'name'
                     newName.prependvalue = newNamePrepend
                     newName.schemaname = 'ingredient'
                     newName.tablename = 'ingredient'
                     concatDataString.name = newName
                     setBulkActions({
                        ...bulkActions,
                        concatDataString,
                     })
                  }
               }}
               placeholder="Enter ingredient name prepend"
            />
         </Form.Group>
      </>
   )
}
