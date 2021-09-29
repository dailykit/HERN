import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Spacer,
   TunnelHeader,
   TextButton,
   Text,
   Flex,
   Dropdown,
   IconButton,
   ButtonGroup,
   RadioGroup,
   Form,
   HelperText,
   ClearIcon,
   Collapsible,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { randomSuffix } from '../../../../../../../shared/utils'
import { TunnelBody } from '../styled'
import { useTabs } from '../../../../../../../shared/providers'
import { PRODUCTS } from '../../../../../graphql'
import { DeleteIcon, RemoveIcon } from '../../../../../assets/icons'
import { Tooltip } from '../../../../../../../shared/components'
import ConfirmationPopup from './confirmationPopup'
import {
   SIMPLE_RECIPE_UPDATE,
   CREATE_CUISINE_NAME,
} from '../../../../../graphql/mutations'
import { CUISINES_NAMES } from '../../../../../graphql/subscriptions'
import BulkActions from '../../../../../../../shared/components/BulkAction'
const address = 'apps.menu.views.listings.productslisting.'

export default function BulkActionsTunnel({
   close,
   selectedRows,
   setSelectedRows,
   removeSelectedRow,
}) {
   const { t } = useTranslation()
   const { addTab } = useTabs()

   const [showPopup, setShowPopup] = React.useState(false)
   const [popupHeading, setPopupHeading] = React.useState('')
   const [initialBulkAction, setInitialBulkAction] = React.useState({
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
   })
   const [bulkActions, setBulkActions] = React.useState({})
   const [cuisineNames, setCuisineNames] = React.useState([])
   const radioPublishOption = [
      { id: 1, title: 'Publish', payload: { isPublished: true } },
      { id: 2, title: 'Unpublish', payload: { isPublished: false } },
   ]
   const radioTypeOption = [
      { id: 1, title: 'Non-vegetarian', payload: { type: 'Non-vegetarian' } },
      { id: 2, title: 'Vegetarian', payload: { type: 'Vegetarian' } },
      { id: 3, title: 'Vegan', payload: { type: 'Vegan' } },
   ]
   const removeRecipe = index => {
      console.log('index', index)
      removeSelectedRow(index)
      setSelectedRows(prevState => prevState.filter(row => row.id !== index))
   }

   // Mutations

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
   const [createCuisineName] = useMutation(CREATE_CUISINE_NAME, {
      onCompleted: () => {
         toast.success('Update Successfully')
         setInitialBulkAction({ ...initialBulkAction, cuisineName: '' })
      },
      onError: error => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })
   //Subscription
   const { loading, error } = useSubscription(CUISINES_NAMES, {
      onSubscriptionData: data => {
         const newCuisine = data.subscriptionData.data.cuisineNames.map(x => {
            x.payload = { cuisine: x.title }
            return x
         })
         setCuisineNames(newCuisine)
      },
   })

   const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)
   const createCuisine = () => {
      const newCuisine = capitalize(initialBulkAction.cuisineName.value)
      createCuisineName({
         variables: {
            name: newCuisine,
         },
      })
   }
   const clearAllActions = () => {
      setInitialBulkAction(prevState => ({
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
      setBulkActions({})
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
      const checkNestedUtensils = checkNested(bulkActions, concatType, column)
      if (checkNestedUtensils) {
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
   const isSetVisible = (column, concatType) => {
      concatType =
         concatType === 'concatData' ? 'concatData' : 'concatDataString'

      const checkForColumnNull = initialBulkAction[column] == null
      if (checkForColumnNull) return checkForColumnNull
      const checkForAppendPrepend =
         checkNested(bulkActions, concatType, column, 'appendvalue') ||
         checkNested(bulkActions, concatType, column, 'prependvalue')
      return checkForAppendPrepend || checkForColumnNull
   }
   const isAppendPrependVisible = column => {
      const checkForColumnNull = initialBulkAction[column] == null
      if (checkForColumnNull) return checkForColumnNull
      const checkForColumnLength = initialBulkAction[column].length > 0
      return checkForColumnNull || checkForColumnLength
   }
   const isSetNullVisible = (column, concatType) => {
      concatType =
         concatType === 'concatData' ? 'concatData' : 'concatDataString'
      if (!(initialBulkAction[column] == null)) {
         const checkForAppendPrepend =
            checkNested(bulkActions, concatType, column, 'appendvalue') ||
            checkNested(bulkActions, concatType, column, 'prependvalue')
         const checkForColumnLength = initialBulkAction[column].length > 0
         return checkForAppendPrepend || checkForColumnLength
      }
   }
   return (
      <>
         <BulkActions
            table="Recipe"
            schemaName="simpleRecipe"
            tableName="simpleRecipe"
            selectedRows={selectedRows}
            removeSelectedRow={removeRecipe}
            bulkActions={bulkActions}
            setBulkActions={setBulkActions}
            clearAllActions={clearAllActions}
            close={close}
         >
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
               <Text as="text1">Type</Text>
               <TextButton
                  type="ghost"
                  size="sm"
                  onClick={() => {
                     setInitialBulkAction(prevState => ({
                        ...prevState,
                        type: !prevState.type,
                     }))
                     setBulkActions(prevState => {
                        delete prevState.type
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
                  options={radioTypeOption}
                  active={initialBulkAction.type}
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
                        delete newActions['type']
                        return newActions
                     })
                  }}
               />
            </ButtonGroup>
            <br />
            <Flex container alignItems="center">
               <Text as="text1">Cuisine Type</Text>
               <TextButton
                  type="ghost"
                  size="sm"
                  onClick={() => {
                     setInitialBulkAction(prevState => ({
                        ...prevState,
                        cuisineName: {
                           ...prevState.cuisineName,
                           defaultOption: null,
                        },
                     }))
                     setBulkActions(prevState => {
                        delete prevState.cuisine
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
               defaultValue={initialBulkAction.cuisineName.defaultOption}
               options={cuisineNames}
               addOption={() => createCuisine()}
               searchedOption={option =>
                  setInitialBulkAction({
                     ...initialBulkAction,
                     cuisineName: {
                        ...initialBulkAction.cuisineName,
                        value: option,
                     },
                  })
               }
               selectedOption={option => {
                  setInitialBulkAction(prevState => ({
                     ...prevState,
                     cuisineName: {
                        ...prevState.cuisineName,
                        defaultOption: option,
                     },
                  }))
                  setBulkActions(prevState => ({
                     ...prevState,
                     ...option.payload,
                  }))
               }}
               placeholder="choose cuisine type"
            />
            <Spacer size="20px" />
            <Flex container>
               <Form.Group>
                  <Form.Label htmlFor="author" title="author">
                     <Flex container alignItems="center">
                        <Text as="text1">Author</Text>
                        <TextButton
                           type="ghost"
                           size="sm"
                           onClick={() => {
                              setInitialBulkAction({
                                 ...initialBulkAction,
                                 author: '',
                              })
                              setBulkActions(prevState => {
                                 const newOption = { ...prevState }
                                 delete newOption['author']
                                 return newOption
                              })
                           }}
                        >
                           Clear
                        </TextButton>
                        <Tooltip identifier="recipe_author" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="author"
                     name="author"
                     value={initialBulkAction.author}
                     onBlur={() => {
                        if (initialBulkAction.author) {
                           setBulkActions({
                              ...bulkActions,
                              author: initialBulkAction.author,
                           })
                           return
                        }
                        if ('author' in bulkActions) {
                           const newOptions = { ...bulkActions }
                           delete newOptions['author']
                           setBulkActions(newOptions)
                           return
                        }
                     }}
                     onChange={e => {
                        setInitialBulkAction({
                           ...initialBulkAction,
                           author: e.target.value,
                        })
                     }}
                     placeholder="Enter author name"
                  />
               </Form.Group>
               <Spacer xAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="cookingTime" title="cookingTime">
                     <Flex container alignItems="center">
                        <Text as="text2">Cooking Time(mins)</Text>
                        <TextButton
                           type="ghost"
                           size="sm"
                           onClick={() => {
                              setInitialBulkAction({
                                 ...initialBulkAction,
                                 cookingTime: '',
                              })
                              setBulkActions(prevState => {
                                 const newOption = { ...prevState }
                                 delete newOption['cookingTime']
                                 return newOption
                              })
                           }}
                        >
                           Clear
                        </TextButton>
                        <Tooltip identifier="recipe_cooking_time" />
                     </Flex>
                  </Form.Label>
                  <Form.Number
                     id="cookingTime"
                     name="cookingTime"
                     value={initialBulkAction.cookingTime}
                     placeholder="Enter cooking time"
                     onChange={e =>
                        setInitialBulkAction({
                           ...initialBulkAction,
                           cookingTime: e.target.value,
                        })
                     }
                     onBlur={() => {
                        if (initialBulkAction.cookingTime) {
                           setBulkActions({
                              ...bulkActions,
                              cookingTime: initialBulkAction.cookingTime,
                           })
                           return
                        }
                        if ('cookingTime' in initialBulkAction) {
                           const newOptions = { ...bulkActions }
                           delete newOptions['cookingTime']
                           setBulkActions(newOptions)
                           return
                        }
                     }}
                  />
               </Form.Group>
            </Flex>
            <Spacer size="10px" />
            <CollapsibleComponent heading="Utensils">
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isSetVisible('utensils', 'concatData')}
                           onClick={() => {}}
                        >
                           Set Utensils
                        </TextButton>
                     </HorizontalTab>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isAppendPrependVisible(
                              'utensils',
                              'concatData'
                           )}
                           onClick={() => {}}
                        >
                           Append or Prepend
                        </TextButton>
                     </HorizontalTab>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isSetNullVisible('utensils', 'concatData')}
                           onClick={() => {}}
                        >
                           Set Null
                        </TextButton>
                     </HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <Form.Group>
                           <Form.Label htmlFor="utensils" title="utensils">
                              <Flex container alignItems="center">
                                 <Text as="text1">Utensils</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          utensils: '',
                                       })
                                       setBulkActions(prevState => {
                                          const newOption = { ...prevState }
                                          delete newOption['utensils']
                                          return newOption
                                       })
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_utensils" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="utensils"
                              name="utensils"
                              value={initialBulkAction.utensils}
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    utensils: e.target.value,
                                 })
                              }
                              onBlur={() => {
                                 if (initialBulkAction.utensils) {
                                    const newUtensils =
                                       initialBulkAction.utensils
                                          .split(',')
                                          .map(tag => {
                                             const newTag = tag.trim()
                                             return capitalize(newTag)
                                          })
                                    setBulkActions({
                                       ...bulkActions,
                                       utensils: newUtensils,
                                    })
                                    return
                                 }
                                 if ('utensils' in bulkActions) {
                                    const newOptions = { ...bulkActions }
                                    delete newOptions['utensils']
                                    setBulkActions(newOptions)
                                    return
                                 }
                              }}
                              placeholder="Enter utensils"
                           />
                        </Form.Group>
                        <Form.Error>
                           Changing utensils will overwrite already existing
                           utensils
                        </Form.Error>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Pan, Spoon, Bowl"
                        />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Form.Group>
                           <Form.Label htmlFor="utensils" title="utensils">
                              <Flex container alignItems="center">
                                 <Text as="text1">Utensils Append</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          utensilsConcat: {
                                             ...initialBulkAction.utensilsConcat,
                                             forAppend: '',
                                          },
                                       })
                                       commonRemove(
                                          'utensils',
                                          'concatData',
                                          'appendvalue',
                                          'prependvalue'
                                       )
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_utensils" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="utensilsAppend"
                              name="utensilsConcat"
                              value={initialBulkAction.utensilsConcat.forAppend}
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    utensilsConcat: {
                                       ...initialBulkAction.utensilsConcat,
                                       forAppend: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (
                                    initialBulkAction.utensilsConcat.forAppend
                                 ) {
                                    const newUtensils =
                                       initialBulkAction.utensilsConcat.forAppend
                                          .split(',')
                                          .map(tag => {
                                             const newTag = tag.trim()
                                             return capitalize(newTag)
                                          })
                                    const concatData = {
                                       ...bulkActions.concatData,
                                    }
                                    const newUtensil = {
                                       ...concatData.utensils,
                                    }
                                    newUtensil.columnname = 'utensils'
                                    newUtensil.appendvalue = newUtensils
                                    newUtensil.schemaname = 'simpleRecipe'
                                    newUtensil.tablename = 'simpleRecipe'
                                    concatData.utensils = newUtensil
                                    setBulkActions({
                                       ...bulkActions,
                                       concatData,
                                    })
                                    return
                                 }
                                 commonRemove(
                                    'utensils',
                                    'concatData',
                                    'appendvalue',
                                    'prependvalue'
                                 )
                              }}
                              placeholder="Enter append utensils"
                           />
                        </Form.Group>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Pan, Spoon, Bowl"
                        />
                        <Form.Group>
                           <Form.Label htmlFor="utensils" title="utensils">
                              <Flex container alignItems="center">
                                 <Text as="text1">Utensils Prepend</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          utensilsConcat: {
                                             ...initialBulkAction.utensilsConcat,
                                             forPrepend: '',
                                          },
                                       })
                                       commonRemove(
                                          'utensils',
                                          'concatData',
                                          'prependvalue',
                                          'appendvalue'
                                       )
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_utensils" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="utensilsPrepend"
                              name="utensilsPrepend"
                              value={
                                 initialBulkAction.utensilsConcat.forPrepend
                              }
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    utensilsConcat: {
                                       ...initialBulkAction.utensilsConcat,
                                       forPrepend: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (
                                    initialBulkAction.utensilsConcat.forPrepend
                                 ) {
                                    const newUtensils =
                                       initialBulkAction.utensilsConcat.forPrepend
                                          .split(',')
                                          .map(tag => {
                                             const newTag = tag.trim()
                                             return capitalize(newTag)
                                          })
                                    const concatData = {
                                       ...bulkActions.concatData,
                                    }
                                    const newUtensil = {
                                       ...concatData.utensils,
                                    }
                                    newUtensil.columnname = 'utensils'
                                    newUtensil.prependvalue = newUtensils
                                    newUtensil.schemaname = 'simpleRecipe'
                                    newUtensil.tablename = 'simpleRecipe'
                                    concatData.utensils = newUtensil
                                    setBulkActions({
                                       ...bulkActions,
                                       concatData,
                                    })
                                    return
                                 }
                                 commonRemove(
                                    'utensils',
                                    'concatData',
                                    'prependvalue',
                                    'appendvalue'
                                 )
                              }}
                              placeholder="Enter prepend utensils"
                           />
                        </Form.Group>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Pan, Spoon, Bowl"
                        />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Flex
                           container
                           justifyContent="center"
                           flexDirection="column"
                        >
                           <Flex container alignItems="center">
                              <Text as="text1">Set Utensils Null </Text>
                              <Spacer xAxis size="10px" />
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setBulkActions(prevState => {
                                       delete prevState.utensils
                                       return prevState
                                    })
                                    setInitialBulkAction(prevState => ({
                                       ...prevState,
                                       utensils: '',
                                    }))
                                 }}
                              >
                                 Clear
                              </TextButton>
                           </Flex>
                           <Spacer size="10px" />
                           <ButtonGroup align="left">
                              <TextButton
                                 type="solid"
                                 size="sm"
                                 disabled={initialBulkAction.utensils == null}
                                 onClick={() => {
                                    setInitialBulkAction(prevState => ({
                                       ...prevState,
                                       utensils: null,
                                    }))
                                    setBulkActions(prevState => ({
                                       ...prevState,
                                       utensils: null,
                                    }))
                                 }}
                              >
                                 {initialBulkAction.utensils == null
                                    ? 'Already'
                                    : 'Set'}{' '}
                                 Null
                              </TextButton>
                           </ButtonGroup>
                        </Flex>
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </CollapsibleComponent>
            <CollapsibleComponent heading="Description">
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isSetVisible(
                              'description',
                              'concatDataString'
                           )}
                           onClick={() => {}}
                        >
                           Set Description
                        </TextButton>
                     </HorizontalTab>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isAppendPrependVisible(
                              'description',
                              'concatDataString'
                           )}
                           onClick={() => {}}
                        >
                           Append or Prepend
                        </TextButton>
                     </HorizontalTab>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isSetNullVisible(
                              'description',
                              'concatDataString'
                           )}
                           onClick={() => {}}
                        >
                           Set Null
                        </TextButton>
                     </HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <Form.Group>
                           <Form.Label
                              htmlFor="description"
                              title="description"
                           >
                              <Flex container alignItems="center">
                                 <Text as="text1">Description</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          description: '',
                                       })
                                       setBulkActions(prevState => {
                                          const newOption = { ...prevState }
                                          delete newOption['description']
                                          return newOption
                                       })
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_description" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="description"
                              name="description"
                              value={initialBulkAction.description}
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    description: e.target.value,
                                 })
                              }
                              onBlur={() => {
                                 if (initialBulkAction.description) {
                                    const newDescription = capitalize(
                                       initialBulkAction.description
                                    )
                                    setBulkActions({
                                       ...bulkActions,
                                       description: newDescription,
                                    })
                                    return
                                 }
                                 if ('description' in bulkActions) {
                                    const newOptions = { ...bulkActions }
                                    delete newOptions['description']
                                    setBulkActions(newOptions)
                                    return
                                 }
                              }}
                              placeholder="Enter description"
                           />
                        </Form.Group>
                        <Form.Error>
                           Changing description will overwrite already existing
                           description
                        </Form.Error>
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Form.Group>
                           <Form.Label
                              htmlFor="description"
                              title="description"
                           >
                              <Flex container alignItems="center">
                                 <Text as="text1">Description Append</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          descriptionConcat: {
                                             ...initialBulkAction.descriptionConcat,
                                             forAppend: '',
                                          },
                                       })
                                       commonRemove(
                                          'description',
                                          'concatDataString',
                                          'appendvalue',
                                          'prependvalue'
                                       )
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_description" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="descriptionAppend"
                              name="descriptionConcat"
                              value={
                                 initialBulkAction.descriptionConcat.forAppend
                              }
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    descriptionConcat: {
                                       ...initialBulkAction.descriptionConcat,
                                       forAppend: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (
                                    initialBulkAction.descriptionConcat
                                       .forAppend
                                 ) {
                                    const newDescriptionAppend = capitalize(
                                       initialBulkAction.descriptionConcat
                                          .forAppend
                                    )
                                    const concatDataString = {
                                       ...bulkActions.concatDataString,
                                    }
                                    const newDescription = {
                                       ...concatDataString.description,
                                    }
                                    newDescription.columnname = 'description'
                                    newDescription.appendvalue =
                                       newDescriptionAppend
                                    newDescription.schemaname = 'simpleRecipe'
                                    newDescription.tablename = 'simpleRecipe'
                                    concatDataString.description =
                                       newDescription
                                    setBulkActions({
                                       ...bulkActions,
                                       concatDataString,
                                    })
                                    return
                                 }
                                 commonRemove(
                                    'description',
                                    'concatDataString',
                                    'appendvalue',
                                    'prependvalue'
                                 )
                              }}
                              placeholder="Enter append description"
                           />
                        </Form.Group>
                        <Form.Group>
                           <Form.Label
                              htmlFor="description"
                              title="description"
                           >
                              <Flex container alignItems="center">
                                 <Text as="text1">Description Prepend</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          descriptionConcat: {
                                             ...initialBulkAction.descriptionConcat,
                                             forPrepend: '',
                                          },
                                       })
                                       commonRemove(
                                          'description',
                                          'concatDataString',
                                          'prependvalue',
                                          'appendvalue'
                                       )
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_description" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="descriptionPrepend"
                              name="descriptionPrepend"
                              value={
                                 initialBulkAction.descriptionConcat.forPrepend
                              }
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    descriptionConcat: {
                                       ...initialBulkAction.descriptionConcat,
                                       forPrepend: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (
                                    initialBulkAction.descriptionConcat
                                       .forPrepend
                                 ) {
                                    const newDescriptionPrepend = capitalize(
                                       initialBulkAction.descriptionConcat
                                          .forPrepend
                                    )

                                    const concatDataString = {
                                       ...bulkActions.concatDataString,
                                    }
                                    const newDescription = {
                                       ...concatDataString.description,
                                    }
                                    newDescription.columnname = 'description'
                                    newDescription.prependvalue =
                                       newDescriptionPrepend
                                    newDescription.schemaname = 'simpleRecipe'
                                    newDescription.tablename = 'simpleRecipe'
                                    concatDataString.description =
                                       newDescription
                                    setBulkActions({
                                       ...bulkActions,
                                       concatDataString,
                                    })
                                    return
                                 }
                                 commonRemove(
                                    'description',
                                    'concatDataString',
                                    'prependvalue',
                                    'appendvalue'
                                 )
                              }}
                              placeholder="Enter prepend description"
                           />
                        </Form.Group>
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Flex
                           container
                           justifyContent="center"
                           flexDirection="column"
                        >
                           <Flex container alignItems="center">
                              <Text as="text1">Set Description Null </Text>
                              <Spacer xAxis size="10px" />
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setBulkActions(prevState => {
                                       delete prevState.description
                                       return prevState
                                    })
                                    setInitialBulkAction(prevState => ({
                                       ...prevState,
                                       description: '',
                                    }))
                                 }}
                              >
                                 Clear
                              </TextButton>
                           </Flex>
                           <Spacer size="10px" />
                           <ButtonGroup align="left">
                              <TextButton
                                 type="solid"
                                 size="sm"
                                 disabled={
                                    initialBulkAction.description == null
                                 }
                                 onClick={() => {
                                    setInitialBulkAction(prevState => ({
                                       ...prevState,
                                       description: null,
                                    }))
                                    setBulkActions(prevState => ({
                                       ...prevState,
                                       description: null,
                                    }))
                                 }}
                              >
                                 {initialBulkAction.description == null
                                    ? 'Already'
                                    : 'Set'}{' '}
                                 Null
                              </TextButton>
                           </ButtonGroup>
                        </Flex>
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </CollapsibleComponent>
            <CollapsibleComponent heading="What you'll need">
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isSetVisible('notIncluded', 'concatData')}
                           onClick={() => {}}
                        >
                           Set What you'll need
                        </TextButton>
                     </HorizontalTab>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isAppendPrependVisible(
                              'notIncluded',
                              'concatData'
                           )}
                           onClick={() => {}}
                        >
                           Append or Prepend
                        </TextButton>
                     </HorizontalTab>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={isSetNullVisible(
                              'notIncluded',
                              'concatData'
                           )}
                           onClick={() => {}}
                        >
                           Set Null
                        </TextButton>
                     </HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <Form.Group>
                           <Form.Label
                              htmlFor="notIncluded"
                              title="notIncluded"
                           >
                              <Flex container alignItems="center">
                                 <Text as="text1">What you'll need</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          notIncluded: '',
                                       })
                                       setBulkActions(prevState => {
                                          const newOption = { ...prevState }
                                          delete newOption['notIncluded']
                                          return newOption
                                       })
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_notIncluded" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="notIncluded"
                              name="notIncluded"
                              value={initialBulkAction.notIncluded}
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    notIncluded: e.target.value,
                                 })
                              }
                              onBlur={() => {
                                 if (initialBulkAction.notIncluded) {
                                    const newNotIncluded =
                                       initialBulkAction.notIncluded
                                          .split(',')
                                          .map(tag => {
                                             const newTag = tag.trim()
                                             return capitalize(newTag)
                                          })
                                    setBulkActions({
                                       ...bulkActions,
                                       notIncluded: newNotIncluded,
                                    })
                                    return
                                 }
                                 if ('notIncluded' in bulkActions) {
                                    const newOptions = { ...bulkActions }
                                    delete newOptions['notIncluded']
                                    setBulkActions(newOptions)
                                    return
                                 }
                              }}
                              placeholder="Enter What you'll need"
                           />
                        </Form.Group>
                        <Form.Error>
                           Changing this will overwrite already existing What
                           you'll need
                        </Form.Error>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Salt, Oil"
                        />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Form.Group>
                           <Form.Label
                              htmlFor="notIncluded"
                              title="notIncluded"
                           >
                              <Flex container alignItems="center">
                                 <Text as="text1">What you'll need append</Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          notIncludedConcat: {
                                             ...initialBulkAction.notIncludedConcat,
                                             forAppend: '',
                                          },
                                       })
                                       commonRemove(
                                          'notIncluded',
                                          'concatData',
                                          'appendvalue',
                                          'prependvalue'
                                       )
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_notIncluded" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="notIncludedAppend"
                              name="notIncludedConcat"
                              value={
                                 initialBulkAction.notIncludedConcat.forAppend
                              }
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    notIncludedConcat: {
                                       ...initialBulkAction.notIncludedConcat,
                                       forAppend: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (
                                    initialBulkAction.notIncludedConcat
                                       .forAppend
                                 ) {
                                    const newNotIncludedAppend =
                                       initialBulkAction.notIncludedConcat.forAppend
                                          .split(',')
                                          .map(tag => {
                                             const newTag = tag.trim()
                                             return capitalize(newTag)
                                          })
                                    const concatData = {
                                       ...bulkActions.concatData,
                                    }
                                    const newNotIncluded = {
                                       ...concatData.notIncluded,
                                    }
                                    newNotIncluded.columnname = 'notIncluded'
                                    newNotIncluded.appendvalue =
                                       newNotIncludedAppend
                                    newNotIncluded.schemaname = 'simpleRecipe'
                                    newNotIncluded.tablename = 'simpleRecipe'
                                    concatData.notIncluded = newNotIncluded
                                    setBulkActions({
                                       ...bulkActions,
                                       concatData,
                                    })
                                    return
                                 }
                                 commonRemove(
                                    'notIncluded',
                                    'concatData',
                                    'appendvalue',
                                    'prependvalue'
                                 )
                              }}
                              placeholder="Enter What you'll need append "
                           />
                        </Form.Group>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Salt, Oil"
                        />
                        <Form.Group>
                           <Form.Label
                              htmlFor="notIncludedPrepend"
                              title="notIncludedPrepend"
                           >
                              <Flex container alignItems="center">
                                 <Text as="text1">
                                    Prepend what you'll need
                                 </Text>
                                 <TextButton
                                    type="ghost"
                                    size="sm"
                                    onClick={() => {
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          notIncludedConcat: {
                                             ...initialBulkAction.notIncludedConcat,
                                             forPrepend: '',
                                          },
                                       })
                                       commonRemove(
                                          'notIncluded',
                                          'concatData',
                                          'prependvalue',
                                          'appendvalue'
                                       )
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 <Tooltip identifier="recipe_not_included_prepend" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="notIncludedPrepend"
                              name="notIncludedPrepend"
                              value={
                                 initialBulkAction.notIncludedConcat.forPrepend
                              }
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    notIncludedConcat: {
                                       ...initialBulkAction.notIncludedConcat,
                                       forPrepend: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (
                                    initialBulkAction.notIncludedConcat
                                       .forPrepend
                                 ) {
                                    const newNotIncludedPrepend =
                                       initialBulkAction.notIncludedConcat.forPrepend
                                          .split(',')
                                          .map(tag => {
                                             const newTag = tag.trim()
                                             return capitalize(newTag)
                                          })
                                    const concatData = {
                                       ...bulkActions.concatData,
                                    }
                                    const newNotIncluded = {
                                       ...concatData.notIncluded,
                                    }
                                    newNotIncluded.columnname = 'notIncluded'
                                    newNotIncluded.prependvalue =
                                       newNotIncludedPrepend
                                    newNotIncluded.schemaname = 'simpleRecipe'
                                    newNotIncluded.tablename = 'simpleRecipe'
                                    concatData.notIncluded = newNotIncluded
                                    setBulkActions({
                                       ...bulkActions,
                                       concatData,
                                    })
                                    return
                                 }
                                 commonRemove(
                                    'notIncluded',
                                    'concatData',
                                    'prependvalue',
                                    'appendvalue'
                                 )
                              }}
                              placeholder="Enter prepend What you'll need append"
                           />
                        </Form.Group>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Oil, Salt"
                        />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Flex
                           container
                           justifyContent="center"
                           flexDirection="column"
                        >
                           <Flex container alignItems="center">
                              <Text as="text1">Set What you'll need Null </Text>
                              <Spacer xAxis size="10px" />
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setBulkActions(prevState => {
                                       delete prevState.notIncluded
                                       return prevState
                                    })
                                    setInitialBulkAction(prevState => ({
                                       ...prevState,
                                       notIncluded: '',
                                    }))
                                 }}
                              >
                                 Clear
                              </TextButton>
                           </Flex>
                           <Spacer size="10px" />
                           <ButtonGroup align="left">
                              <TextButton
                                 type="solid"
                                 size="sm"
                                 disabled={
                                    initialBulkAction.notIncluded == null
                                 }
                                 onClick={() => {
                                    setInitialBulkAction(prevState => ({
                                       ...prevState,
                                       notIncluded: null,
                                    }))
                                    setBulkActions(prevState => ({
                                       ...prevState,
                                       notIncluded: null,
                                    }))
                                 }}
                              >
                                 {initialBulkAction.notIncluded == null
                                    ? 'Already'
                                    : 'Set'}{' '}
                                 Null
                              </TextButton>
                           </ButtonGroup>
                        </Flex>
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </CollapsibleComponent>
         </BulkActions>
      </>
   )
}

const CollapsibleComponent = ({ children, heading }) => (
   <Collapsible
      isHeadClickable={true}
      head={
         <Flex
            margin="10px 0"
            container
            alignItems="center"
            justifyContent="space-between"
            width="100%"
         >
            <Text as="title"> {heading} </Text>
         </Flex>
      }
      body={
         <Flex margin="10px 0" container flexDirection="column">
            {children}
         </Flex>
      }
      defaultOpen={false}
      isDraggable={false}
   />
)

const RadioAction = ({
   actionLabel,
   radioOptions,
   keyName,
   seedState,
   setSeedState,
   setBulkActions,
}) => {
   return (
      <>
         <Flex container alignItems="center">
            <Text as="text1">{actionLabel}</Text>
            <TextButton
               type="ghost"
               size="sm"
               onClick={() => {
                  setSeedState(prevState => ({
                     ...prevState,
                     [keyName]: !prevState[keyName],
                  }))
                  setBulkActions(prevState => {
                     delete prevState[keyName]
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
               options={radioOptions}
               active={seedState[keyName]}
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
                     delete newActions[keyName]
                     return newActions
                  })
               }}
            />
         </ButtonGroup>
      </>
   )
}
const DropdownAction = ({
   actionLabel,
   keyName,
   seedState,
   setSeedState,
   addOption,
   dropdownOption,
   placeholder,
   setBulkActions,
}) => (
   <>
      <Flex container alignItems="center">
         <Text as="text1">{actionLabel}</Text>
         <TextButton
            type="ghost"
            size="sm"
            onClick={() => {
               setSeedState(prevState => ({
                  ...prevState,
                  [keyName]: {
                     defaultOption: null,
                     value: '',
                  },
               }))
               setBulkActions(prevState => {
                  delete prevState[keyName]
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
         defaultValue={seedState[keyName].defaultOption}
         options={dropdownOption}
         addOption={() => addOption()}
         searchedOption={option =>
            setSeedState({
               ...seedState,
               [keyName]: {
                  ...seedState[keyName],
                  value: option,
               },
            })
         }
         selectedOption={option => {
            setSeedState(prevState => ({
               ...prevState,
               [keyName]: {
                  ...prevState[keyName],
                  defaultOption: option,
               },
            }))
            setBulkActions(prevState => ({
               ...prevState,
               ...option.payload,
            }))
         }}
         placeholder={placeholder}
      />
   </>
)
