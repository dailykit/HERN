import React, { forwardRef, useRef, useImperativeHandle } from 'react'
import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanels,
   HorizontalTabPanel,
   HorizontalTabs,
   Loader,
   ComboButton,
   Text,
   TextButton,
   Form,
   Flex,
   HelperText,
   Spacer,
   ButtonGroup,
   Collapsible,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { OperationConfig, Tooltip } from '../..'
import { PlusIcon } from '../../../assets/icons'
import { ModifiersContext } from '../../../../apps/products/views/Listings/ProductsListing/context/modifier'
import {
   ModifierFormTunnel,
   ModifierModeTunnel,
   ModifierOptionsTunnel,
   ModifierPhotoTunnel,
   ModifierTemplatesTunnel,
   ModifierTypeTunnel,
} from '../../../../apps/products/views/Listings/ProductsListing/tunnels/productOptionBTunnel/modifierTunnels'
import { PRODUCT_OPTION_TYPES } from '../subscription'

export const ProductOptionsBulkAction = forwardRef((props, ref) => {
   // props
   const {
      initialBulkAction,
      setInitialBulkAction,
      bulkActions,
      setBulkActions,
      additionalBulkAction,
      setAdditionalBulkAction,
   } = props

   const opConfigInvokedBy = React.useRef('')
   const modifierOpConfig = React.useRef(undefined)
   const {
      modifiersState: { modifierId, modifierName },
      modifiersDispatch,
   } = React.useContext(ModifiersContext)
   // The component instance will be extended
   // with whatever you return from the callback passed
   // as the second argument
   useImperativeHandle(ref, () => ({
      clearModifier() {
         modifiersDispatch({
            type: 'MODIFIER_ID',
            payload: null,
         })
      },
   }))

   const [productOptionTypes, setProductOptionTypes] = React.useState([])
   const [modifiersTunnel, openModifiersTunnel, closeModifiersTunnel] =
      useTunnel(6)
   const [
      operationConfigTunnels,
      openOperationConfigTunnel,
      closeOperationConfigTunnel,
   ] = useTunnel(4)

   const [modifierList, setModifierList] = React.useState([])
   const [operationalConfigData, setOperationalConfigData] = React.useState({})

   React.useEffect(() => {
      if (modifierId !== null) {
         setInitialBulkAction(prevState => ({
            ...prevState,
            modifierId,
         }))
         setBulkActions(prevState => ({ ...prevState, modifierId }))
      }
   }, [modifierId])

   // console.log('this is modifier list', modifiers)
   const { loading } = useSubscription(PRODUCT_OPTION_TYPES.LIST, {
      onSubscriptionData: data => {
         setProductOptionTypes(data.subscriptionData.data.productOptionTypes)
      },
   })

   const handleAddModifier = optionId => {
      openModifiersTunnel(1)
   }
   const handleModifierClear = () => {
      modifiersDispatch({
         type: 'MODIFIER_ID',
         payload: null,
      })
      setInitialBulkAction(prevState => ({ ...prevState, modifierId: null }))
   }
   const handleAddOpConfig = optionId => {
      opConfigInvokedBy.current = 'option'
      openOperationConfigTunnel(1)
   }
   const handleOperationConfigClear = () => {
      setInitialBulkAction(prevState => ({
         ...prevState,
         operationConfigId: null,
      }))
   }
   const saveOperationConfig = config => {
      setInitialBulkAction(prevState => ({
         ...prevState,
         operationConfigId: config.id,
      }))
      setOperationalConfigData(config)
      setBulkActions(prevState => ({
         ...prevState,
         operationConfigId: config.id,
      }))
   }
   console.log('operational data', operationalConfigData)
   if (loading) {
      return <Loader />
   }
   return (
      <>
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
                  // openOperationConfigTunnel={value => {
                  //    opConfigInvokedBy.current = 'modifier'
                  //    openOperationConfigTunnel(value)
                  // }}
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
         {initialBulkAction.modifierId === null ? (
            <ComboButton type="ghost" onClick={handleAddModifier}>
               <PlusIcon /> Add Modifiers
            </ComboButton>
         ) : (
            <Flex container justifyContent="space-between" alignItems="center">
               <Text as="h3">Modifier:</Text>
               <Text as="text1">{modifierName}</Text>
               <TextButton
                  type="ghost"
                  onClick={() => {
                     if ('modifierId' in bulkActions) {
                        const newOption = { ...bulkActions }
                        delete newOption.modifierId
                        setBulkActions(newOption)
                     }
                     handleModifierClear()
                  }}
               >
                  {' '}
                  Clear
               </TextButton>
            </Flex>
         )}
         {initialBulkAction.operationConfigId === null ? (
            <ComboButton type="ghost" onClick={handleAddOpConfig}>
               <PlusIcon /> Add Operational Configuration
            </ComboButton>
         ) : (
            <Flex container justifyContent="space-between" alignItems="center">
               <Text as="h3">Operational Config:</Text>
               <Text as="text1">
                  {operationalConfigData?.station?.name} -
                  {operationalConfigData?.labelTemplate?.name}
               </Text>
               <TextButton
                  type="ghost"
                  onClick={() => {
                     if ('operationConfigId' in bulkActions) {
                        const newOption = { ...bulkActions }
                        delete newOption.operationConfigId
                        setBulkActions(newOption)
                     }
                     handleOperationConfigClear()
                  }}
               >
                  {' '}
                  Clear
               </TextButton>
            </Flex>
         )}
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
                              onClick={() => {}}
                           >
                              Set {column.columnName}
                           </TextButton>
                        </HorizontalTab>
                        <HorizontalTab>
                           <TextButton
                              type="ghost"
                              size="sm"
                              disabled={column.columnName in bulkActions}
                              onClick={() => {}}
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
                                       initialBulkAction[column.columnName].set
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
                                          initialBulkAction[column.columnName]
                                             .decrease !== 0
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
                                          setAdditionalBulkAction(prevState => {
                                             const newOption = {
                                                ...prevState,
                                             }
                                             delete newOption[column.columnName]
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
                                       column.columnName in additionalBulkAction
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
                                          initialBulkAction[column.columnName]
                                             .increase !== 0
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
                                          setAdditionalBulkAction(prevState => {
                                             const newOption = {
                                                ...prevState,
                                             }
                                             delete newOption[column.columnName]
                                             return newOption
                                          })
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
                                       column.columnName in additionalBulkAction
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
         <CollapsibleComponentWithTabs
            bulkActions={bulkActions}
            columnName="label"
            title="Label"
            concatType="concatDataString"
            columnConcat="labelConcat"
            initialBulkAction={initialBulkAction}
            setBulkActions={setBulkActions}
            setInitialBulkAction={setInitialBulkAction}
            isNullable={false}
         />
      </>
   )
})
const CollapsibleComponentWithTabs = ({
   bulkActions,
   columnName,
   title,
   concatType,
   columnConcat,
   example,
   initialBulkAction,
   isNullable,
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

      const nestedCheckPrepend = checkNested(
         bulkActions,
         concatTypeCR,
         column,
         positionSecondary
      )
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
                     onClick={() => {}}
                  >
                     Set {title}
                  </TextButton>
               </HorizontalTab>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={isAppendPrependVisible(columnName, concatType)}
                     onClick={() => {}}
                  >
                     Append or Prepend
                  </TextButton>
               </HorizontalTab>
               {isNullable && (
                  <HorizontalTab>
                     <TextButton
                        type="ghost"
                        size="sm"
                        disabled={isSetNullVisible(columnName, concatType)}
                        onClick={() => {}}
                     >
                        Set Null
                     </TextButton>
                  </HorizontalTab>
               )}
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
                              const newColumnName =
                                 initialBulkAction[columnName]
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
                              newColumnName.tablename = 'productOption'
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
                              newColumnName.tablename = 'productOption'
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
