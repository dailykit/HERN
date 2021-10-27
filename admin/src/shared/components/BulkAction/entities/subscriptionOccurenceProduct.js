import React from 'react'
import {
   Spacer,
   TextButton,
   Text,
   Flex,
   Form,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabList,
   HorizontalTab,
   HorizontalTabs,
   Collapsible,
   Dropdown,
} from '@dailykit/ui'
import { Tooltip } from '../..'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { PRODUCT_CATEGORY_SUBSCRIPTION_OCCURRENCE_PRODUCT } from '../mutation'
import { PRODUCT_CATEGORY_OF_SUBSCRIPTION_OCCURRENCE_PRODUCT } from '../subscription'

export const SubscriptionOccurrenceProductBulkAction = props => {
   const {
      initialBulkAction,
      setInitialBulkAction,
      bulkActions,
      setBulkActions,
      additionalBulkAction,
      setAdditionalBulkAction,
   } = props
   const [productCategories, setProductCategories] = React.useState([])

   // subscription
   useSubscription(PRODUCT_CATEGORY_OF_SUBSCRIPTION_OCCURRENCE_PRODUCT, {
      onSubscriptionData: data => {
         console.log(
            'data.subscriptionData.data.productCategories.subscriptionOccurenceProducts::::::::',
            data.subscriptionData.data.productCategories
         )
         const newProductCategories =
            data.subscriptionData.data.productCategories.map((item, index) => ({
               ...item,
               id: index + 1,
               payload: { productCategory: item.title },
            }))
         setProductCategories(newProductCategories)
      },
   })
   const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)

   return (
      <>
         {[{ heading: 'AddOnPrice', columnName: 'addOnPrice' }].map(
            (column, i) => (
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
                              <Form.Label
                                 htmlFor="AddOnPrice "
                                 title="AddOnPrice "
                              >
                                 <Flex container alignItems="center">
                                    <Text as="text1">{column.heading}</Text>
                                    <TextButton
                                       type="ghost"
                                       size="sm"
                                       // disabled={initialBulkAction.addOnAddOnPrice.decrease !== 0}
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
                                    <Tooltip identifier="recipe_addOnPrice_increase" />
                                 </Flex>
                              </Form.Label>
                              <Form.Number
                                 id={column.columnName}
                                 name={column.columnName}
                                 min="0"
                                 // disabled={initialBulkAction.addOnPrice.decrease !== 0}
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
                                    <Tooltip identifier="recipe_addOnPrice_increase" />
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
                                    <Tooltip identifier="recipe_addOnPrice_decrease" />
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
         )}
         <Flex container alignItems="center">
            <Text as="text1">Product Category</Text>
            <TextButton
               type="ghost"
               size="sm"
               onClick={() => {
                  setInitialBulkAction(prevState => ({
                     ...prevState,
                     productCategory: {
                        defaultOption: null,
                        value: '',
                     },
                  }))
                  setBulkActions(prevState => {
                     delete prevState['productCategory']
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
            defaultValue={initialBulkAction.productCategory.defaultOption}
            options={productCategories}
            // addOption={() => {
            //    createProductCategory()
            // }}
            searchedOption={option =>
               setInitialBulkAction({
                  ...initialBulkAction,
                  productCategory: {
                     ...initialBulkAction.productCategory,
                     value: option,
                  },
               })
            }
            selectedOption={option => {
               setInitialBulkAction(prevState => ({
                  ...prevState,
                  productCategory: {
                     ...prevState,
                     defaultOption: option,
                  },
               }))
               setBulkActions(prevState => ({
                  ...prevState,
                  ...option.payload,
               }))
            }}
            placeholder="choose product type"
         />
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
