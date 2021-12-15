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
} from '@dailykit/ui'
import React from 'react'
import { Tooltip } from '../..'

const BrandManagerBulkAction = props => {
   const {
      initialBulkAction,
      setInitialBulkAction,
      bulkActions,
      setBulkActions,
      additionalBulkAction,
      setAdditionalBulkAction,
   } = props
   const radioPublishOption = [
      { id: 1, title: 'Publish', payload: { isPublished: true } },
      { id: 2, title: 'Unpublish', payload: { isPublished: false } },
   ]

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
         <Spacer size="10px" />
         {[
            { heading: 'Specific Price', columnName: 'specificPrice' },
            { heading: 'Specific Discount', columnName: 'specificDiscount' },
         ].map((column, i) => (
            <CollapsibleComponent heading={column.heading} key={i}>
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>
                        <TextButton
                           type="ghost"
                           size="sm"
                           disabled={column.columnName in additionalBulkAction}
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
                                          delete newOption[[column.columnName]]
                                          return newOption
                                       })
                                    }}
                                 >
                                    Clear
                                 </TextButton>
                                 {/* <Tooltip identifier="recipe_price_increase" /> */}
                              </Flex>
                           </Form.Label>
                           <Form.Number
                              id={column.columnName}
                              name={column.columnName}
                              min="0"
                              // disabled={initialBulkAction.price.decrease !== 0}
                              value={initialBulkAction[column.columnName].set}
                              placeholder="Enter price"
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [column.columnName]: {
                                       ...initialBulkAction[column.columnName],
                                       set: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 if (initialBulkAction[column.columnName].set) {
                                    setBulkActions({
                                       ...bulkActions,
                                       [column.columnName]:
                                          initialBulkAction[column.columnName]
                                             .set,
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
                                 {/* <Tooltip identifier="recipe_price_increase" /> */}
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
                                 initialBulkAction[column.columnName].increase
                              }
                              placeholder="Enter price increase by"
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [column.columnName]: {
                                       ...initialBulkAction[column.columnName],
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
                                          initialBulkAction[column.columnName]
                                             .increase,
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
                                 {/* <Tooltip identifier="recipe_price_decrease" /> */}
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
                                 initialBulkAction[column.columnName].decrease
                              }
                              placeholder="Enter price decrease by"
                              onChange={e =>
                                 setInitialBulkAction({
                                    ...initialBulkAction,
                                    [column.columnName]: {
                                       ...initialBulkAction[column.columnName],
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
                                          initialBulkAction[column.columnName]
                                             .decrease * -1,
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
         ))}
         <Form.Group>
            <Form.Toggle
               name="isAvailable"
               onChange={() => {
                  setInitialBulkAction(() => ({
                     ...initialBulkAction,
                     isAvailable: {
                        ...initialBulkAction.isAvailable,
                        isAvailable: !initialBulkAction.isAvailable,
                     },
                  }))
                  setBulkActions({
                     ...bulkActions,
                     isAvailable: !bulkActions.isAvailable,
                  })
               }}
               value={initialBulkAction.isAvailable.value}
            >
               Availability
            </Form.Toggle>
         </Form.Group>
         <Spacer size="20px" />
      </>
   )
}
export default BrandManagerBulkAction

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
