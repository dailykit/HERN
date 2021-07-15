import React from 'react'
import {
   Spacer,
   TextButton,
   Text,
   Flex,
   ButtonGroup,
   RadioGroup,
   Form,
   HelperText,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanels,
   HorizontalTab,
   HorizontalTabPanel,
   Collapsible,
   IconButton,
} from '@dailykit/ui'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTabs } from '../../../../../../../shared/providers'
import { INCREASE_PRICE_AND_DISCOUNT } from '../../../../../graphql/mutations'
import BulkActions from '../../../../../../../shared/components/BulkAction'
import { Tooltip } from '../../../../../../../shared/components'
import { useMutation } from '@apollo/react-hooks'
const address = 'apps.menu.views.listings.productslisting.'
export default function BulkActionsTunnel({
   close,
   selectedRows,
   removeSelectedRow,
}) {
   const { t } = useTranslation()
   const { addTab } = useTabs()

   const [initialBulkAction, setInitialBulkAction] = React.useState({
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
   const [bulkActions, setBulkActions] = React.useState({})
   const [additionalBulkAction, setAdditionalBulkAction] = React.useState({}) //actions which not to be set
   const radioPublishOption = [
      { id: 1, title: 'Publish', payload: { isPublished: true } },
      { id: 2, title: 'Unpublish', payload: { isPublished: false } },
   ]
   const removeRecipe = index => {
      console.log('index', index)
      removeSelectedRow(index)
   }
   const [increasePriceAndDiscount] = useMutation(INCREASE_PRICE_AND_DISCOUNT, {
      onCompleted: () => {
         toast.success('Update Successfully')
         close(1)
      },
      onError: () => {
         toast.error('Something went wrong!')
         //  logger(error)
      },
   })
   const clearAllActions = () => {
      setInitialBulkAction(prevState => ({
         ...prevState,
         isPublished: !prevState.isPublished,
      }))
      setBulkActions({})
   }

   const additionalFunction = () => {
      increasePriceAndDiscount({
         variables: {
            price: additionalBulkAction.price || 0,
            discount: additionalBulkAction.discount || 0,
            ids: selectedRows.map(x => x.id),
         },
      })
   }
   return (
      <>
         <BulkActions
            additionalBulkAction={additionalBulkAction}
            additionalFunction={additionalFunction}
            table="Product"
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
                     console.log('publish clear')
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
                        console.log(option.payload)
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
            <Spacer size="10px" />
            {[
               { heading: 'Price', columnName: 'price' },
               { heading: 'Discount', columnName: 'discount' },
            ].map((column, i) => {
               return (
                  <CollapsibleComponent heading={column.heading} key={i}>
                     <HorizontalTabs>
                        <HorizontalTabList>
                           <HorizontalTab>
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 disabled={
                                    column.columnName in additionalBulkAction
                                 }
                                 onClick={() => {
                                    console.log('clear')
                                 }}
                              >
                                 Set {column.columnName}
                              </TextButton>
                           </HorizontalTab>
                           <HorizontalTab>
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 disabled={column.columnName in bulkActions}
                                 onClick={() => {
                                    console.log('clear')
                                 }}
                              >
                                 {column.heading} increase or decrease
                              </TextButton>
                           </HorizontalTab>
                        </HorizontalTabList>
                        <HorizontalTabPanels>
                           <HorizontalTabPanel>
                              <Form.Group>
                                 <Form.Label htmlFor="Price " title="Price ">
                                    <Flex container alignItems="center">
                                       <Text as="text1">{column.heading}</Text>
                                       <TextButton
                                          type="ghost"
                                          size="sm"
                                          // disabled={initialBulkAction.price.decrease !== 0}
                                          onClick={() => {
                                             setInitialBulkAction({
                                                ...initialBulkAction,
                                                [column.columnName]: {
                                                   ...initialBulkAction[
                                                      column.columnName
                                                   ],
                                                   set: 0,
                                                },
                                             })
                                             setBulkActions(prevState => {
                                                const newOption = {
                                                   ...prevState,
                                                }
                                                delete newOption[
                                                   [column.columnName]
                                                ]
                                                return newOption
                                             })
                                          }}
                                       >
                                          Clear
                                       </TextButton>
                                       <Tooltip identifier="recipe_price_increase" />
                                    </Flex>
                                 </Form.Label>
                                 <Form.Number
                                    id={column.columnName}
                                    name={column.columnName}
                                    min="0"
                                    // disabled={initialBulkAction.price.decrease !== 0}
                                    value={
                                       initialBulkAction[column.columnName].set
                                    }
                                    placeholder="Enter price"
                                    onChange={e =>
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          [column.columnName]: {
                                             ...initialBulkAction[
                                                column.columnName
                                             ],
                                             set: e.target.value,
                                          },
                                       })
                                    }
                                    onBlur={() => {
                                       if (
                                          initialBulkAction[column.columnName]
                                             .set
                                       ) {
                                          setBulkActions({
                                             ...bulkActions,
                                             [column.columnName]:
                                                initialBulkAction[
                                                   column.columnName
                                                ].set,
                                          })
                                          return
                                       }
                                       if (column.columnName in bulkActions) {
                                          const newOptions = {
                                             ...bulkActions,
                                          }
                                          delete newOptions[column.columnName]
                                          setBulkActions(newOptions)
                                          return
                                       }
                                    }}
                                 />
                              </Form.Group>
                           </HorizontalTabPanel>
                           <HorizontalTabPanel>
                              <Form.Group>
                                 <Form.Label
                                    htmlFor="Increase By"
                                    title="Increase By"
                                 >
                                    <Flex container alignItems="center">
                                       <Text as="text1">
                                          {column.heading} Increase By
                                       </Text>
                                       <TextButton
                                          type="ghost"
                                          size="sm"
                                          min="0"
                                          disabled={
                                             initialBulkAction[
                                                column.columnName
                                             ].decrease !== 0
                                          }
                                          onClick={() => {
                                             setInitialBulkAction({
                                                ...initialBulkAction,
                                                [column.columnName]: {
                                                   ...initialBulkAction[
                                                      column.columnName
                                                   ],
                                                   increase: 0,
                                                },
                                             })
                                             setAdditionalBulkAction(
                                                prevState => {
                                                   const newOption = {
                                                      ...prevState,
                                                   }
                                                   delete newOption[
                                                      column.columnName
                                                   ]
                                                   return newOption
                                                }
                                             )
                                          }}
                                       >
                                          Clear
                                       </TextButton>
                                       <Tooltip identifier="recipe_price_increase" />
                                    </Flex>
                                 </Form.Label>
                                 <Form.Number
                                    id="priceIncreaseBy"
                                    name="priceIncreaseBy"
                                    min="0"
                                    disabled={
                                       initialBulkAction[column.columnName]
                                          .decrease !== 0
                                    }
                                    value={
                                       initialBulkAction[column.columnName]
                                          .increase
                                    }
                                    placeholder="Enter price increase by"
                                    onChange={e =>
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          [column.columnName]: {
                                             ...initialBulkAction[
                                                column.columnName
                                             ],
                                             increase: e.target.value,
                                          },
                                       })
                                    }
                                    onBlur={() => {
                                       if (
                                          initialBulkAction[column.columnName]
                                             .increase
                                       ) {
                                          setAdditionalBulkAction({
                                             ...additionalBulkAction,
                                             [column.columnName]:
                                                initialBulkAction[
                                                   column.columnName
                                                ].increase,
                                          })
                                          return
                                       }
                                       if (
                                          column.columnName in
                                          additionalBulkAction
                                       ) {
                                          const newOptions = {
                                             ...additionalBulkAction,
                                          }
                                          delete newOptions[column.columnName]
                                          setAdditionalBulkAction(newOptions)
                                          return
                                       }
                                    }}
                                 />
                              </Form.Group>
                              <Form.Group>
                                 <Form.Label
                                    htmlFor="Price Decrease By"
                                    title="Price Decrease By"
                                 >
                                    <Flex container alignItems="center">
                                       <Text as="text1">
                                          {column.heading} Decrease By
                                       </Text>
                                       <TextButton
                                          type="ghost"
                                          size="sm"
                                          disabled={
                                             initialBulkAction[
                                                column.columnName
                                             ].increase !== 0
                                          }
                                          onClick={() => {
                                             setInitialBulkAction({
                                                ...initialBulkAction,
                                                [column.columnName]: {
                                                   ...initialBulkAction[
                                                      column.columnName
                                                   ],
                                                   decrease: 0,
                                                },
                                             })
                                             setAdditionalBulkAction(
                                                prevState => {
                                                   const newOption = {
                                                      ...prevState,
                                                   }
                                                   delete newOption[
                                                      column.columnName
                                                   ]
                                                   return newOption
                                                }
                                             )
                                          }}
                                       >
                                          Clear
                                       </TextButton>
                                       <Tooltip identifier="recipe_price_decrease" />
                                    </Flex>
                                 </Form.Label>
                                 <Form.Number
                                    id="priceDecreaseBy"
                                    name="priceDecreaseBy"
                                    min="0"
                                    disabled={
                                       initialBulkAction[column.columnName]
                                          .increase !== 0
                                    }
                                    value={
                                       initialBulkAction[column.columnName]
                                          .decrease
                                    }
                                    placeholder="Enter price decrease by"
                                    onChange={e =>
                                       setInitialBulkAction({
                                          ...initialBulkAction,
                                          [column.columnName]: {
                                             ...initialBulkAction[
                                                column.columnName
                                             ],
                                             decrease: e.target.value,
                                          },
                                       })
                                    }
                                    onBlur={() => {
                                       if (
                                          initialBulkAction[column.columnName]
                                             .decrease
                                       ) {
                                          setAdditionalBulkAction({
                                             ...additionalBulkAction,
                                             [column.columnName]:
                                                initialBulkAction[
                                                   column.columnName
                                                ].decrease * -1,
                                          })
                                          return
                                       }
                                       if (
                                          column.columnName in
                                          additionalBulkAction
                                       ) {
                                          const newOptions = {
                                             ...additionalBulkAction,
                                          }
                                          delete newOptions[column.columnName]
                                          setAdditionalBulkAction(newOptions)
                                          return
                                       }
                                    }}
                                 />
                              </Form.Group>
                           </HorizontalTabPanel>
                        </HorizontalTabPanels>
                     </HorizontalTabs>
                  </CollapsibleComponent>
               )
            })}

            <Spacer size="10px" />
            <CollapsibleComponentWithTabs
               bulkActions={bulkActions}
               columnName="additionalText"
               columnConcat="additionalTextConcat"
               concatType="concatDataString"
               initialBulkAction={initialBulkAction}
               setBulkActions={setBulkActions}
               setInitialBulkAction={setInitialBulkAction}
               title="Additional Text"
            />
            <CollapsibleComponentWithTabs
               bulkActions={bulkActions}
               columnName="description"
               columnConcat="descriptionConcat"
               concatType="concatDataString"
               initialBulkAction={initialBulkAction}
               setBulkActions={setBulkActions}
               setInitialBulkAction={setInitialBulkAction}
               title="Description"
            />
            <CollapsibleComponentWithTabs
               bulkActions={bulkActions}
               columnName="tags"
               columnConcat="tagsConcat"
               concatType="concatData"
               example="Gift, Cake"
               initialBulkAction={initialBulkAction}
               setBulkActions={setBulkActions}
               setInitialBulkAction={setInitialBulkAction}
               title="Tags"
            />
         </BulkActions>
      </>
   )
}
const CollapsibleComponentWithTabs = ({
   bulkActions,
   columnName,
   title,
   concatType,
   columnConcat,
   example,
   initialBulkAction,
   setBulkActions,
   setInitialBulkAction,
}) => {
   const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)
   const checkNested = (obj, level, ...rest) => {
      if (obj === undefined) return false
      if (rest.length == 0 && obj.hasOwnProperty(level)) return true
      return checkNested(obj[level], ...rest)
   }
   const commonRemove = (
      column,
      concatTypeCR,
      positionPrimary,
      positionSecondary
   ) => {
      //positionPrimary use for changing field
      //positionSecondary use for another field
      //concatTypeCR -> concatType in common remove function
      concatTypeCR =
         concatTypeCR === 'concatData' ? 'concatData' : 'concatDataString'
      console.log('this is new concat type', concatTypeCR)
      const nestedCheckPrepend = checkNested(
         bulkActions,
         concatTypeCR,
         column,
         positionSecondary
      )
      console.log('im in', nestedCheckPrepend)
      if (nestedCheckPrepend) {
         const newBulkAction = { ...bulkActions }
         delete newBulkAction[concatTypeCR][column][positionPrimary]
         setBulkActions(newBulkAction)
         return
      }
      const checkNestedColumn = checkNested(bulkActions, concatTypeCR, column)
      if (checkNestedColumn) {
         const newBulkAction = { ...bulkActions }
         delete newBulkAction[concatTypeCR][column]
         setBulkActions(newBulkAction)
      }
      if (concatTypeCR in bulkActions) {
         if (Object.keys(bulkActions[concatTypeCR]).length === 0) {
            const newBulkAction = { ...bulkActions }
            delete newBulkAction[concatTypeCR]
            setBulkActions(newBulkAction)
         }
      }
   }
   const isSetVisible = (column, concatTypeISV) => {
      //concatTypeCR -> concatType in is visible function

      concatTypeISV =
         concatTypeISV === 'concatData' ? 'concatData' : 'concatDataString'
      console.log('this is new concat type', concatTypeISV)
      const checkForColumnNull = initialBulkAction[column] == null
      if (checkForColumnNull) return checkForColumnNull
      const checkForAppendPrepend =
         checkNested(bulkActions, concatTypeISV, column, 'appendvalue') ||
         checkNested(bulkActions, concatTypeISV, column, 'prependvalue')
      return checkForAppendPrepend || checkForColumnNull
   }
   const isAppendPrependVisible = column => {
      const checkForColumnNull = initialBulkAction[column] == null
      if (checkForColumnNull) return checkForColumnNull
      const checkForColumnLength = initialBulkAction[column].length > 0
      return checkForColumnNull || checkForColumnLength
   }
   const isSetNullVisible = (column, concatTypeISV) => {
      //concatTypeCR -> concatType in is visible function
      concatTypeISV =
         concatTypeISV === 'concatData' ? 'concatData' : 'concatDataString'
      if (!(initialBulkAction[column] == null)) {
         const checkForAppendPrepend =
            checkNested(bulkActions, concatTypeISV, column, 'appendvalue') ||
            checkNested(bulkActions, concatTypeISV, column, 'prependvalue')
         const checkForColumnLength = initialBulkAction[column].length > 0
         return checkForAppendPrepend || checkForColumnLength
      }
   }
   return (
      <CollapsibleComponent heading={title}>
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={isSetVisible(columnName, concatType)}
                     onClick={() => {
                        console.log('clear')
                     }}
                  >
                     Set {title}
                  </TextButton>
               </HorizontalTab>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={isAppendPrependVisible(columnName, concatType)}
                     onClick={() => {
                        console.log('clear')
                     }}
                  >
                     Append or Prepend
                  </TextButton>
               </HorizontalTab>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={isSetNullVisible(columnName, concatType)}
                     onClick={() => {
                        console.log('clear')
                     }}
                  >
                     Set Null
                  </TextButton>
               </HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <Form.Group>
                     <Form.Label htmlFor={columnName} title={columnName}>
                        <Flex container alignItems="center">
                           <Text as="text1">{title}</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [columnName]: '',
                                 })
                                 setBulkActions(prevState => {
                                    const newOption = { ...prevState }
                                    delete newOption[columnName]
                                    return newOption
                                 })
                              }}
                           >
                              Clear
                           </TextButton>
                           <Tooltip identifier="products" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id={columnName}
                        name={columnName}
                        value={initialBulkAction[columnName]}
                        onChange={e =>
                           setInitialBulkAction({
                              ...initialBulkAction,
                              [columnName]: e.target.value,
                           })
                        }
                        onBlur={() => {
                           if (initialBulkAction[columnName]) {
                              const newColumnName = initialBulkAction[
                                 columnName
                              ]
                                 .split(',')
                                 .map(tag => {
                                    const newTag = tag.trim()
                                    return capitalize(newTag)
                                 })
                              setBulkActions({
                                 ...bulkActions,
                                 [columnName]: newColumnName,
                              })
                              return
                           }
                           if (columnName in bulkActions) {
                              const newOptions = { ...bulkActions }
                              delete newOptions[columnName]
                              setBulkActions(newOptions)
                              return
                           }
                        }}
                        placeholder={`Enter ${columnName}`}
                     />
                  </Form.Group>
                  <Form.Error>
                     Changing {columnName} will overwrite already existing
                     {columnName}
                  </Form.Error>
                  {concatType == 'concatData' && (
                     <HelperText
                        message={`Enter comma separated values, for example: ${example}`}
                        type="hint"
                     />
                  )}
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Form.Group>
                     <Form.Label htmlFor={columnName} title={columnName}>
                        <Flex container alignItems="center">
                           <Text as="text1">{title} Append</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [columnConcat]: {
                                       ...initialBulkAction[columnConcat],
                                       forAppend: '',
                                    },
                                 })
                                 commonRemove(
                                    columnName,
                                    concatType,
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
                        id={`${columnName}Append`}
                        name={`${columnName}Append`}
                        value={initialBulkAction[columnConcat].forAppend}
                        onChange={e =>
                           setInitialBulkAction({
                              ...initialBulkAction,
                              [columnConcat]: {
                                 ...initialBulkAction[columnConcat],
                                 forAppend: e.target.value,
                              },
                           })
                        }
                        onBlur={() => {
                           if (initialBulkAction[columnConcat].forAppend) {
                              let newColumnAppend
                              if (concatType == 'concatData') {
                                 newColumnAppend = initialBulkAction[
                                    columnConcat
                                 ].forAppend
                                    .split(',')
                                    .map(tag => {
                                       const newTag = tag.trim()
                                       return capitalize(newTag)
                                    })
                              } else {
                                 newColumnAppend =
                                    initialBulkAction[columnConcat].forAppend
                              }

                              const newConcatData = {
                                 ...bulkActions[concatType],
                              }
                              const newColumnName = {
                                 ...newConcatData[columnName],
                              }
                              newColumnName.columnname = columnName
                              newColumnName.appendvalue = newColumnAppend
                              newColumnName.schemaname = 'products'
                              newColumnName.tablename = 'product'
                              newConcatData[columnName] = newColumnName
                              setBulkActions({
                                 ...bulkActions,
                                 [concatType]: newConcatData,
                              })
                              return
                           }
                           commonRemove(
                              columnName,
                              columnName,
                              'appendvalue',
                              'prependvalue'
                           )
                        }}
                        placeholder={`Enter append ${columnName}`}
                     />
                  </Form.Group>
                  {concatType == 'concatData' && (
                     <HelperText
                        type="hint"
                        message={`Enter comma separated values, for example: ${example}`}
                     />
                  )}
                  <Form.Group>
                     <Form.Label htmlFor={columnName} title={columnName}>
                        <Flex container alignItems="center">
                           <Text as="text1">{title} Prepend</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [columnConcat]: {
                                       ...initialBulkAction[columnConcat],
                                       forPrepend: '',
                                    },
                                 })
                                 commonRemove(
                                    columnName,
                                    concatType,
                                    'prependvalue',
                                    'appendvalue'
                                 )
                              }}
                           >
                              Clear
                           </TextButton>
                           <Tooltip identifier="products" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id={`${columnName}Prepend`}
                        name={`${columnName}Prepend`}
                        value={initialBulkAction[columnConcat].forPrepend}
                        onChange={e =>
                           setInitialBulkAction({
                              ...initialBulkAction,
                              [columnConcat]: {
                                 ...initialBulkAction[columnConcat],
                                 forPrepend: e.target.value,
                              },
                           })
                        }
                        onBlur={() => {
                           if (initialBulkAction[columnConcat].forPrepend) {
                              let newColumnPrepend
                              if (concatType == 'concatData') {
                                 newColumnPrepend = initialBulkAction[
                                    columnConcat
                                 ].forPrepend
                                    .split(',')
                                    .map(tag => {
                                       const newTag = tag.trim()
                                       return capitalize(newTag)
                                    })
                              } else {
                                 newColumnPrepend =
                                    initialBulkAction[columnConcat].forPrepend
                              }

                              const newConcatData = {
                                 ...bulkActions[concatType],
                              }
                              const newColumnName = {
                                 ...newConcatData[columnName],
                              }
                              newColumnName.columnname = columnName
                              newColumnName.prependvalue = newColumnPrepend
                              newColumnName.schemaname = 'products'
                              newColumnName.tablename = 'product'
                              newConcatData[columnName] = newColumnName
                              setBulkActions({
                                 ...bulkActions,
                                 [concatType]: newConcatData,
                              })
                              return
                           }
                           commonRemove(
                              columnName,
                              concatType,
                              'prependvalue',
                              'appendvalue'
                           )
                        }}
                        placeholder={`Enter ${columnName} prepend`}
                     />
                  </Form.Group>
                  {concatType == 'concatData' && (
                     <HelperText
                        type="hint"
                        message={`Enter comma separated values, for example: ${example}`}
                     />
                  )}
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Flex
                     container
                     justifyContent="center"
                     flexDirection="column"
                  >
                     <Flex container alignItems="center">
                        <Text as="text1">Set {title} Null </Text>
                        <Spacer xAxis size="10px" />
                        <TextButton
                           type="ghost"
                           size="sm"
                           onClick={() => {
                              setBulkActions(prevState => {
                                 delete prevState[columnName]
                                 return prevState
                              })
                              setInitialBulkAction(prevState => ({
                                 ...prevState,
                                 [columnName]: '',
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
                           disabled={initialBulkAction[columnName] == null}
                           onClick={() => {
                              setInitialBulkAction(prevState => ({
                                 ...prevState,
                                 [columnName]: null,
                              }))
                              setBulkActions(prevState => ({
                                 ...prevState,
                                 [columnName]: null,
                              }))
                           }}
                        >
                           {initialBulkAction[columnName] == null
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
