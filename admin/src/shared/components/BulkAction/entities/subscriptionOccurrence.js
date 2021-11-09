import React from 'react'
import {
   TextButton,
   Text,
   Flex,
   Form,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanels,
   HorizontalTab,
   HorizontalTabPanel,
   Collapsible,
} from '@dailykit/ui'
import { Tooltip } from '../..'

export const SubscriptionOccurrence = props => {
   const {
      initialBulkAction,
      setInitialBulkAction,
      bulkActions,
      setBulkActions,
   } = props
   return (
      <>
         <CollapsibleComponentWithTabs
            bulkActions={bulkActions}
            columnName="startTimeStamp"
            columnConcat="startTimeStamp"
            concatType="timeStamp"
            initialBulkAction={initialBulkAction}
            setBulkActions={setBulkActions}
            setInitialBulkAction={setInitialBulkAction}
            title="Start Time "
            columnType="string"
         />
         <CollapsibleComponentWithTabs
            bulkActions={bulkActions}
            columnName="cutoffTimeStamp"
            columnConcat="cutoffTimeStamp"
            concatType="timeStamp"
            initialBulkAction={initialBulkAction}
            setBulkActions={setBulkActions}
            setInitialBulkAction={setInitialBulkAction}
            title="Cut Off Time "
            columnType="string"
         />
      </>
   )
}
const CollapsibleComponentWithTabs = ({
   bulkActions,
   columnName,
   title,
   concatType,
   columnConcat,
   initialBulkAction,
   setBulkActions,
   setInitialBulkAction,
}) => {
   const checkNested = (obj, level, ...rest) => {
      if (obj === undefined) return false
      if (rest.length === 0 && obj.hasOwnProperty(level)) return true
      return checkNested(obj[level], ...rest)
   }
   const commonRemove = (
      column,
      concatTypeCR,
      positionPrimary,
      positionSecondary
   ) => {
      // positionPrimary use for changing field
      // positionSecondary use for another field
      // concatTypeCR -> concatType in common remove function
      concatTypeCR = 'timeStamp'
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
   const isAppendPrependVisible = column => {
      const checkForColumnNull = initialBulkAction[column] == null
      if (checkForColumnNull) return checkForColumnNull
      const checkForColumnLength = initialBulkAction[column].length > 0
      return checkForColumnNull || checkForColumnLength
   }

   return (
      <CollapsibleComponent heading={title}>
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={isAppendPrependVisible(columnName, concatType)}
                     onClick={() => {
                        console.log('clear')
                     }}
                  >
                     Increase or Decrease
                  </TextButton>
               </HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <Form.Group>
                     <Form.Label htmlFor={columnName} title={title}>
                        <Flex container alignItems="center">
                           <Text as="text1">Increase {title}</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [columnConcat]: {
                                       ...initialBulkAction[columnConcat],
                                       forIncrease: '',
                                    },
                                 })
                                 commonRemove(
                                    columnName,
                                    concatType,
                                    'intervalincrementvalue',
                                    'intervaldecrementvalue'
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
                        value={initialBulkAction[columnConcat].forIncrease}
                        onChange={e =>
                           setInitialBulkAction({
                              ...initialBulkAction,
                              [columnConcat]: {
                                 ...initialBulkAction[columnConcat],
                                 forIncrease: e.target.value,
                              },
                           })
                        }
                        onBlur={() => {
                           if (initialBulkAction[columnConcat].forIncrease) {
                              let newColumnAppend

                              newColumnAppend =
                                 initialBulkAction[columnConcat].forIncrease

                              const newConcatData = {
                                 ...bulkActions[concatType],
                              }
                              const newColumnName = {
                                 ...newConcatData[columnName],
                              }
                              newColumnName.columnname = columnName
                              newColumnName.intervalincrementvalue =
                                 newColumnAppend
                              newColumnName.schemaname = 'subscription'
                              newColumnName.tablename = 'subscriptionOccurence'
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
                              'intervalincrementvalue',
                              'intervaldecrementvalue'
                           )
                        }}
                        placeholder={`Enter Increase Time`}
                     />
                  </Form.Group>

                  <Form.Group>
                     <Form.Label htmlFor={columnName} title={title}>
                        <Flex container alignItems="center">
                           <Text as="text1">Decrease {title}</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [columnConcat]: {
                                       ...initialBulkAction[columnConcat],
                                       forDecrease: '',
                                    },
                                 })
                                 commonRemove(
                                    columnName,
                                    concatType,
                                    'intervalincrementvalue',
                                    'intervaldecrementvalue'
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
                        value={initialBulkAction[columnConcat].forDecrease}
                        onChange={e =>
                           setInitialBulkAction({
                              ...initialBulkAction,
                              [columnConcat]: {
                                 ...initialBulkAction[columnConcat],
                                 forDecrease: e.target.value,
                              },
                           })
                        }
                        onBlur={() => {
                           if (initialBulkAction[columnConcat].forDecrease) {
                              let newColumnPrepend

                              newColumnPrepend =
                                 initialBulkAction[columnConcat].forDecrease

                              const newConcatData = {
                                 ...bulkActions[concatType],
                              }
                              const newColumnName = {
                                 ...newConcatData[columnName],
                              }
                              newColumnName.columnname = columnName
                              newColumnName.intervaldecrementvalue =
                                 newColumnPrepend
                              newColumnName.schemaname = 'subscription'
                              newColumnName.tablename = 'subscriptionOccurence'
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
                              'intervalincrementvalue',
                              'intervaldecrementvalue'
                           )
                        }}
                        placeholder={`Enter decrease Time`}
                     />
                  </Form.Group>
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
