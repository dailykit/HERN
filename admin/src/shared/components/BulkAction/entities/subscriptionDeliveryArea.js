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
   Spacer,
   ButtonGroup,
   HelperText,
   Dropdown,
   ButtonTile,
   useTunnel,
   IconButton,
} from '@dailykit/ui'
import { Tooltip } from '../..'
import PickUpTunnel from '../../../../apps/subscription/views/Forms/Subscription/sections/PickUp'
import { isElement, isEmpty } from 'lodash'
import styled from 'styled-components'
import { DeleteIcon } from '../../../assets/icons'
import { parseAddress } from '../../../utils'

export const SubscriptionDeliveryArea = props => {
   const {
      initialBulkAction,
      setInitialBulkAction,
      bulkActions,
      setBulkActions,
      additionalBulkAction,
      setAdditionalBulkAction,
   } = props
   const [tunnels, openOptionTunnel, closeOptionTunnel] = useTunnel(1)
   const [pickupOption, setPickupOption] = React.useState(null)

   return (
      <>
         {[{ heading: 'Delivery Price', columnName: 'deliveryPrice' }].map(
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
                              Set {column.heading}
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
                                 htmlFor="DeliveryPrice "
                                 title="Delivery Price "
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
                                    <Tooltip identifier="subscriptions_deliveryPrice_increase" />
                                 </Flex>
                              </Form.Label>
                              <Form.Number
                                 id={column.columnName}
                                 name={column.columnName}
                                 min="0"
                                 // disabled={initialBulkAction.deliveryPrice.decrease !== 0}
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
                                    <Tooltip identifier="subscription_deliveryPrice_increase" />
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
                                    <Tooltip identifier="subscription_deliveryPrice_decrease" />
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
         <CollapsibleComponent heading="Delivery Time">
            <Form.Group>
               <Form.Label htmlFor="deliveryTimeFrom" title="deliveryTimeFrom">
                  <Flex container alignItems="center">
                     <Text as="text1">From</Text>
                     <Tooltip identifier="form_subscription_tunnel_zipcode_field_delivery_from" />
                  </Flex>
               </Form.Label>
               <Form.Time
                  id="deliveryTimeFrom"
                  name="deliveryTimeFrom"
                  placeholder="Enter delivery from"
                  value={initialBulkAction.deliveryTimeFrom}
                  onChange={e => {
                     console.log('this is e', e.target)
                     e.persist()
                     setInitialBulkAction(() => ({
                        ...initialBulkAction,
                        deliveryTime: {
                           from: {
                              ...initialBulkAction.deliveryTime.from,
                              from: e.target.value,
                           },
                        },
                     }))
                     setBulkActions({
                        ...bulkActions,
                        deliveryTime: {
                           ...bulkActions.deliveryTime,
                           from: e.target.value,
                        },
                     })
                  }}
               />
            </Form.Group>
            <Spacer size="16px" xAxis />
            <Form.Group>
               <Form.Label htmlFor="deliveryTimeTo" title="deliveryTimeTo">
                  <Flex container alignItems="center">
                     <Text as="text1">To</Text>
                     <Tooltip identifier="form_subscription_tunnel_zipcode_field_delivery_to" />
                  </Flex>
               </Form.Label>
               <Form.Time
                  id="deliveryTimeTo"
                  name="deliveryTimeTo"
                  placeholder="Enter delivery to"
                  value={initialBulkAction.deliveryTimeTo}
                  onChange={e => {
                     e.persist()
                     setInitialBulkAction(() => ({
                        ...initialBulkAction,
                        deliveryTime: {
                           to: {
                              ...initialBulkAction.deliveryTime.to,
                              to: e.target.value,
                           },
                        },
                     }))
                     setBulkActions({
                        ...bulkActions,
                        deliveryTime: {
                           ...bulkActions.deliveryTime,
                           to: e.target.value,
                        },
                     })
                  }}
               />
            </Form.Group>
         </CollapsibleComponent>

         <Form.Group>
            <Form.Toggle
               name="isDeliveryActive"
               onChange={() => {
                  setInitialBulkAction(() => ({
                     ...initialBulkAction,
                     isDeliveryActive: {
                        ...initialBulkAction.isDeliveryActive,
                        isDeliveryActive: !initialBulkAction.isDeliveryActive,
                     },
                  }))
                  setBulkActions({
                     ...bulkActions,
                     isDeliveryActive: !bulkActions.isDeliveryActive,
                  })
               }}
               value={initialBulkAction.isDeliveryActive.value}
            >
               Delivery Active
            </Form.Toggle>
         </Form.Group>
         <Spacer size="20px" />
         {!isEmpty(pickupOption) && (
            <>
               <Form.Group>
                  <Form.Toggle
                     name="isPickupActive"
                     onChange={() => {
                        setInitialBulkAction(() => ({
                           ...initialBulkAction,
                           isPickupActive: {
                              ...initialBulkAction.isPickupActive,
                              isPickupActive: !initialBulkAction.isPickupActive,
                           },
                        }))
                        setBulkActions({
                           ...bulkActions,
                           isPickupActive: !bulkActions.isPickupActive,
                        })
                     }}
                     value={initialBulkAction.isPickupActive.value}
                  >
                     PickUp Active
                  </Form.Toggle>
               </Form.Group>
               <Spacer size="24px" />
               <SelectedOption
                  option={pickupOption}
                  setPickupOption={setPickupOption}
               />
               <Spacer size="24px" />
            </>
         )}
         <ButtonTile
            noIcon
            type="secondary"
            text="Select Pickup Option"
            onClick={() => openOptionTunnel(1)}
         />
         <PickUpTunnel
            onSave={option => setPickupOption(option)}
            tunnel={{
               list: tunnels,
               close: closeOptionTunnel,
            }}
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
const SelectedOption = ({ option, setPickupOption }) => {
   return (
      <Styles.SelectedOption container alignItems="center">
         <main>
            <section>
               <span>Pickup time</span>
               <p as="subtitle">
                  {option?.time?.from} - {option?.time?.to}
               </p>
            </section>
            <Spacer size="16px" xAxis />
            <section>
               <span>Address</span>
               <p as="subtitle">{parseAddress(option.address)}</p>
            </section>
            <Spacer size="16px" />
         </main>
         <aside>
            <IconButton
               size="sm"
               type="ghost"
               onClick={() => setPickupOption(null)}
            >
               <DeleteIcon color="#FF5A52" />
            </IconButton>
         </aside>
      </Styles.SelectedOption>
   )
}
const Styles = {
   Row: styled.div`
      display: flex;
      align-items: center;
      > section {
         flex: 1;
      }
   `,
   Options: styled.ul``,
   Option: styled.li`
      list-style: none;
   `,
   SelectedOption: styled.div`
      display: flex;
      > section {
         > span {
            font-size: 14px;
            text-transform: uppercase;
            color: #433e46;
            letter-spacing: 0.4px;
         }
         > p {
            color: #555b6e;
         }
      }
   `,
}
