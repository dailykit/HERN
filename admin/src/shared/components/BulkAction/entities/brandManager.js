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
   const radioAvailableOption = [
      { id: 1, title: 'Available', payload: { isAvailable: true } },
      { id: 2, title: 'Unavailable', payload: { isAvailable: false } },
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
         <Flex container alignItems="center">
            <Text as="text1">Change Available Status</Text>
            <TextButton
               type="ghost"
               size="sm"
               onClick={() => {
                  setInitialBulkAction(prevState => ({
                     ...prevState,
                     isAvailable: !prevState.isAvailable,
                  }))
                  setBulkActions(prevState => {
                     delete prevState.isAvailable
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
               options={radioAvailableOption}
               active={initialBulkAction.isAvailable}
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
                     delete newActions['isAvailable']
                     return newActions
                  })
               }}
            />
         </ButtonGroup>
         <Spacer size="10px" />

         <CollapsibleComponent heading="Set Price" key={1}>
            <HorizontalTabs>
               <HorizontalTabList>
                  <HorizontalTab>
                     <TextButton
                        type="ghost"
                        size="sm"
                        disabled={
                           'markupOnStandardPriceInPercentage' in bulkActions // in bulk action we are using markupOnStandardPriceInPercentage as it is used in table by this name but in intialBulkAction we are using the same under the name of markupPrice
                        }
                        onClick={() => {
                           setBulkActions(prevData => {
                              const newData = { ...prevData }
                              delete newData[
                                 'markupOnStandardPriceInPercentage'
                              ]
                              return newData
                           })
                        }}
                     >
                        Specific Price
                     </TextButton>
                  </HorizontalTab>
                  <HorizontalTab>
                     <TextButton
                        type="ghost"
                        size="sm"
                        disabled={'specificPrice' in bulkActions}
                        onClick={() => {
                           setBulkActions(prevData => {
                              const newData = { ...prevData }
                              delete newData['specificPrice']
                              return newData
                           })
                        }}
                     >
                        Markup Price
                     </TextButton>
                  </HorizontalTab>
               </HorizontalTabList>
               <HorizontalTabPanels>
                  <HorizontalTabPanel>
                     <Form.Group>
                        <Form.Label
                           htmlFor="specificPrice "
                           title="specificPrice "
                        >
                           <Flex container alignItems="center">
                              <Text as="text1">Specific Price</Text>
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setInitialBulkAction({
                                       ...initialBulkAction,
                                       specificPrice: 0,
                                    })
                                    setBulkActions(prevState => {
                                       const newOption = {
                                          ...prevState,
                                       }
                                       delete newOption['specificPrice']
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
                           id="specificPrice"
                           name="specificPrice"
                           min="0"
                           // disabled={initialBulkAction.price.decrease !== 0}
                           value={initialBulkAction.specificPrice}
                           placeholder="Enter price"
                           onChange={e =>
                              setInitialBulkAction({
                                 ...initialBulkAction,
                                 specificPrice: e.target.value,
                              })
                           }
                           onBlur={() => {
                              if (initialBulkAction.specificPrice) {
                                 setBulkActions({
                                    ...bulkActions,
                                    specificPrice:
                                       initialBulkAction.specificPrice,
                                 })
                                 return
                              }
                              if ('specificPrice' in bulkActions) {
                                 const newOptions = {
                                    ...bulkActions,
                                 }
                                 delete newOptions['specificPrice']
                                 setBulkActions(newOptions)
                                 return
                              }
                           }}
                        />
                     </Form.Group>
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     <Form.Group>
                        <Form.Label htmlFor="markupPrice " title="markupPrice ">
                           <Flex container alignItems="center">
                              <Text as="text1"> Markup Price</Text>
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setInitialBulkAction({
                                       ...initialBulkAction,
                                       markupPrice: 0,
                                    })
                                    setBulkActions(prevState => {
                                       const newOption = {
                                          ...prevState,
                                       }
                                       delete newOption[
                                          'markupOnStandardPriceInPercentage'
                                       ]
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
                           id="markupPrice"
                           name="markupPrice"
                           min="0"
                           // disabled={initialBulkAction.price.decrease !== 0}
                           value={initialBulkAction.markupPrice}
                           placeholder="Enter price"
                           onChange={e =>
                              setInitialBulkAction({
                                 ...initialBulkAction,
                                 markupPrice: e.target.value,
                              })
                           }
                           onBlur={() => {
                              if (initialBulkAction.markupPrice) {
                                 setBulkActions({
                                    ...bulkActions,
                                    markupOnStandardPriceInPercentage:
                                       initialBulkAction.markupPrice,
                                 })
                                 return
                              }
                              if (
                                 'markupOnStandardPriceInPercentage' in
                                 bulkActions
                              ) {
                                 const newOptions = {
                                    ...bulkActions,
                                 }
                                 delete newOptions[
                                    'markupOnStandardPriceInPercentage'
                                 ]
                                 setBulkActions(newOptions)
                                 return
                              }
                           }}
                        />
                     </Form.Group>
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>
         </CollapsibleComponent>
         <CollapsibleComponent heading="Specific Discount" key={2}>
            <HorizontalTabs>
               <HorizontalTabList>
                  <HorizontalTab>
                     <TextButton
                        type="ghost"
                        size="sm"
                        disabled={
                           'markupOnStandardPriceInPercentage' in bulkActions // in bulk action we are using markupOnStandardPriceInPercentage as it is used in table by this name but in intialBulkAction we are using the same under the name of markupPrice
                        }
                        onClick={() => {
                           console.log('Specific Discount')
                        }}
                     >
                        Specific Discount
                     </TextButton>
                  </HorizontalTab>
               </HorizontalTabList>
               <HorizontalTabPanels>
                  <HorizontalTabPanel>
                     <Form.Group>
                        <Form.Label
                           htmlFor="specificDiscount"
                           title="specificDiscount "
                        >
                           <Flex container alignItems="center">
                              <Text as="text1">Specific Discount</Text>
                              <TextButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setInitialBulkAction({
                                       ...initialBulkAction,
                                       specificDiscount: 0,
                                    })
                                    setBulkActions(prevState => {
                                       const newOption = {
                                          ...prevState,
                                       }
                                       delete newOption['specificDiscount']
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
                           id="specificDiscount"
                           name="specificDiscount"
                           min="0"
                           // disabled={initialBulkAction.price.decrease !== 0}
                           value={initialBulkAction.specificDiscount}
                           placeholder="Enter price"
                           onChange={e =>
                              setInitialBulkAction({
                                 ...initialBulkAction,
                                 specificDiscount: e.target.value,
                              })
                           }
                           onBlur={() => {
                              if (initialBulkAction.specificDiscount) {
                                 setBulkActions({
                                    ...bulkActions,
                                    specificDiscount:
                                       initialBulkAction.specificDiscount,
                                 })
                                 return
                              }
                              if ('specificDiscount' in bulkActions) {
                                 const newOptions = {
                                    ...bulkActions,
                                 }
                                 delete newOptions['specificDiscount']
                                 setBulkActions(newOptions)
                                 return
                              }
                           }}
                        />
                     </Form.Group>
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>
         </CollapsibleComponent>
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
