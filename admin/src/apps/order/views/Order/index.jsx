import React from 'react'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import htmlToReact from 'html-to-react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isEmpty, isNull, groupBy } from 'lodash'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import {
   Tag,
   Flex,
   Text,
   Form,
   Spacer,
   Filler,
   Tunnel,
   Tunnels,
   useTunnel,
   TextButton,
   IconButton,
   TunnelHeader,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   DropdownButton,
} from '@dailykit/ui'

import { Products } from './sections'
import { formatDate } from '../../utils'
import { findAndSelectSachet } from './methods'
import { ResponsiveFlex, Styles } from './styled'
import { QUERIES, MUTATIONS } from '../../graphql'
import { useConfig, useOrder } from '../../context'
import { EditIcon, PrintIcon, UserIcon } from '../../assets/icons'
import { useAccess, useAuth, useTabs } from '../../../../shared/providers'
import {
   currencyFmt,
   logger,
   parseAddress,
   get_env,
} from '../../../../shared/utils'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../shared/components'

const isPickup = value => ['ONDEMAND_PICKUP', 'PREORDER_PICKUP'].includes(value)

const address = 'apps.order.views.order.'
const parser = new htmlToReact.Parser(React)

const Order = () => {
   const params = useParams()
   const { user } = useAuth()
   const { t } = useTranslation()
   const { isSuperUser } = useAccess()
   const { tab, addTab } = useTabs()
   const { state: config } = useConfig()
   const { state, switchView, dispatch } = useOrder()
   const [tabIndex, setTabIndex] = React.useState(0)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [addressTunnels, openAddressTunnel, closeAddressTunnel] = useTunnel(1)
   const [isThirdParty, setIsThirdParty] = React.useState(false)
   const [updateOrder] = useMutation(MUTATIONS.ORDER.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })

   const { loading: sourceLoading, data: { orderSource = [] } = {} } = useQuery(
      QUERIES.ORDER.SOURCE,
      {
         variables: {
            orderId: params.id,
         },
      }
   )

   const {
      loading,
      error,
      data: { order = {} } = {},
   } = useSubscription(QUERIES.ORDER.DETAILS, {
      variables: {
         id: params.id,
      },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         setIsThirdParty(Boolean(data?.order?.thirdPartyOrderId))
      },
   })

   const {
      loading: productsLoading,
      error: productsError,
      data: { products = [] } = {},
   } = useSubscription(QUERIES.ORDER.PRODUCTS, {
      skip: !order?.cartId,
      variables: {
         where: {
            levelType: { _eq: 'orderItem' },
            cartId: {
               _eq: order?.cartId,
            },
         },
      },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         setIsThirdParty(Boolean(data?.order?.thirdPartyOrderId))
      },
   })

   React.useEffect(() => {
      if (!productsLoading && !isEmpty(products)) {
         const [product] = products
         dispatch({
            type: 'SELECT_PRODUCT',
            payload: product,
         })
      }
   }, [productsLoading, products])

   /*
   React.useEffect(() => {
      if (!mealkitsLoading && !readytoeatsLoading && !inventoriesLoading) {
         const types = [
            !isEmpty(mealkits) && 'MEALKIT',
            !isEmpty(inventories) && 'INVENTORY',
            !isEmpty(readytoeats) && 'READYTOEAT',
         ].filter(Boolean)

         let isSelected = Boolean(state.current_product?.id)
         if (!isEmpty(mealkits)) {
            if (!isSelected) {
               const [mealkit] = mealkits
               dispatch({ type: 'SELECT_PRODUCT', payload: mealkit })
               findAndSelectSachet({
                  dispatch,
                  isSuperUser,
                  product: mealkit,
                  station: config.current_station,
               })
               isSelected = true
            } else {
               const mealkit = mealkits.find(
                  node => node.id === state.current_product?.id
               )
               if (!isEmpty(mealkit)) {
                  findAndSelectSachet({
                     dispatch,
                     isSuperUser,
                     product: mealkit,
                     station: config.current_station,
                  })
                  setTabIndex(types.indexOf('MEALKIT'))
               }
            }
         }
         if (!isEmpty(inventories)) {
            if (!isSelected) {
               const [inventory] = inventories
               dispatch({ type: 'SELECT_PRODUCT', payload: inventory })
               findAndSelectSachet({
                  dispatch,
                  isSuperUser,
                  product: inventory,
                  station: config.current_station,
               })
               isSelected = true
            } else {
               const inventory = inventories.find(
                  node => node.id === state.current_product?.id
               )
               if (!isEmpty(inventory)) {
                  findAndSelectSachet({
                     dispatch,
                     isSuperUser,
                     product: inventory,
                     station: config.current_station,
                  })
                  setTabIndex(types.indexOf('INVENTORY'))
               }
            }
         }
         if (!isEmpty(readytoeats)) {
            if (!isSelected) {
               const [readytoeat] = readytoeats
               dispatch({ type: 'SELECT_PRODUCT', payload: readytoeat })
               findAndSelectSachet({
                  dispatch,
                  isSuperUser,
                  product: readytoeat,
                  station: config.current_station,
               })
               isSelected = true
            } else {
               const readytoeat = readytoeats.find(
                  node => node.id === state.current_product?.id
               )
               if (!isEmpty(readytoeat)) {
                  findAndSelectSachet({
                     dispatch,
                     isSuperUser,
                     product: readytoeat,
                     station: config.current_station,
                  })
                  setTabIndex(types.indexOf('READYTOEAT'))
               }
            }
         }
      }
   }, [
      mealkits,
      mealkitsLoading,
      readytoeats,
      readytoeatsLoading,
      inventories,
      inventoriesLoading,
   ])
   */

   React.useEffect(() => {
      if (!loading && order?.id && !tab) {
         addTab(`ORD${order?.id}`, `/order/orders/${order?.id}`)
      }
   }, [loading, order, tab, addTab])

   React.useEffect(() => {
      return () => switchView('SUMMARY')
   }, [switchView])

   const print = React.useCallback(() => {
      const template = encodeURIComponent(
         JSON.stringify({ name: 'bill1', type: 'bill', format: 'pdf' })
      )
      const data = encodeURIComponent(JSON.stringify({ id: order?.id }))
      window.open(
         `${get_env(
            'REACT_APP_TEMPLATE_URL'
         )}?template=${template}&data=${data}`,
         '_blank'
      )
   }, [order])

   const printKOT = async () => {
      try {
         const url = `${
            new URL(window._env_.REACT_APP_DATA_HUB_URI).origin
         }/datahub/v1/query`
         await axios.post(
            url,
            {
               type: 'invoke_event_trigger',
               args: {
                  name: 'printKOT',
                  payload: {
                     new: {
                        id: order.id,
                        status: 'ORDER_UNDER_PROCESSING',
                     },
                  },
               },
            },
            {
               headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'x-hasura-admin-secret': get_env(
                     'REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET'
                  ),
               },
            }
         )
      } catch (err) {
         logger(err)
      }
   }

   const viewKOT = React.useCallback(() => {
      const kots = async () => {
         try {
            const { data: { data = {}, success } = {} } = await axios.get(
               `${get_env('REACT_APP_DAILYOS_SERVER_URI')}/api/kot-urls?id=${
                  order.id
               }`
            )
            if (success) {
               data.forEach(node => window.open(node.url, '_blank'))
            }
         } catch (err) {
            logger(err)
         }
      }
      kots()
   }, [order])

   /*
   const onTabChange = React.useCallback(
      index => {
         setTabIndex(index)
         const types = [
            !isEmpty(mealkits) && 'MEALKIT',
            !isEmpty(inventories) && 'INVENTORY',
            !isEmpty(readytoeats) && 'READYTOEAT',
         ].filter(Boolean)

         if (types[index] === 'MEALKIT') {
            const [mealkit] = mealkits
            dispatch({ type: 'SELECT_PRODUCT', payload: mealkit })
            findAndSelectSachet({
               dispatch,
               isSuperUser,
               product: mealkit,
               station: config.current_station,
            })
         } else if (types[index] === 'INVENTORY') {
            const [inventory] = inventories
            dispatch({ type: 'SELECT_PRODUCT', payload: inventory })
            findAndSelectSachet({
               dispatch,
               isSuperUser,
               product: inventory,
               station: config.current_station,
            })
         } else if (types[index] === 'READYTOEAT') {
            const [readytoeat] = readytoeats
            dispatch({ type: 'SELECT_PRODUCT', payload: readytoeat })
            findAndSelectSachet({
               dispatch,
               isSuperUser,
               product: readytoeat,
               station: config.current_station,
            })
         }
      },
      [setTabIndex, mealkits, inventories, readytoeats]
   )
   */

   if (loading || productsLoading) return <InlineLoader />
   if (error) {
      logger(error)
      toast.error('Failed to fetch order details!')
      return <ErrorState message="Failed to fetch order details!" />
   }
   const types = groupBy(products, 'productOptionType')
   if (isEmpty(order))
      return (
         <Flex>
            <Filler message="No order details found!" />
         </Flex>
      )
   return (
      <Flex>
         <Banner id="order-app-single-order-top" />
         <Spacer size="16px" />
         <ResponsiveFlex
            container
            as="header"
            padding="0 16px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h4">ORD{order?.cart?.id}</Text>
               {!isThirdParty && Boolean(order?.cart?.isTest) && (
                  <>
                     <Spacer size="8px" xAxis />
                     <Tag>Test</Tag>
                  </>
               )}
               {!sourceLoading && isThirdParty && !isEmpty(orderSource) && (
                  <>
                     <Spacer size="16px" xAxis />
                     <Flex container alignItems="center">
                        <Text as="h4">Source:</Text>
                        <Spacer size="8px" xAxis />
                        <Flex
                           as="span"
                           container
                           width="24px"
                           height="24px"
                           alignItems="center"
                           justifyContent="center"
                        >
                           <img
                              alt={
                                 orderSource[0]?.thirdPartyCompany?.title || ''
                              }
                              src={orderSource[0]?.thirdPartyCompany?.imageUrl}
                              style={{
                                 height: '100%',
                                 width: '100%',
                                 objectFit: 'contain',
                              }}
                           />
                        </Flex>
                        <Spacer size="8px" xAxis />
                        <Text as="p" style={{ textTransform: 'capitalize' }}>
                           {orderSource[0]?.thirdPartyCompany?.title}
                        </Text>
                     </Flex>
                     <Spacer size="16px" xAxis />
                     <Flex container alignItems="center">
                        <Text as="h4">Third Party Order Id:</Text>
                        <Spacer size="8px" xAxis />
                        <Text as="p">
                           {order.thirdPartyOrder?.thirdPartyOrderId}
                        </Text>
                     </Flex>
                  </>
               )}
               <Spacer size="16px" xAxis />
               {!isThirdParty && (
                  <IconButton size="sm" type="outline" onClick={print}>
                     <PrintIcon size={16} />
                  </IconButton>
               )}
               <Spacer size="16px" xAxis />
               {!isThirdParty && !isPickup(order?.fulfillmentType) && (
                  <TextButton
                     size="sm"
                     type="outline"
                     fallBackMessage="Pending order confirmation!"
                     hasAccess={Boolean(order.isAccepted && !order.isRejected)}
                     onClick={() =>
                        dispatch({
                           type: 'DELIVERY_PANEL',
                           payload: { orderId: order?.id },
                        })
                     }
                  >
                     View Delivery
                  </TextButton>
               )}
            </Flex>
            <Flex container alignItems="center" flexWrap="wrap">
               <Spacer size="16px" xAxis />
               <Flex as="section" container alignItems="center">
                  <Flex container alignItems="center">
                     <Text as="h4">{t(address.concat('ordered'))}</Text>
                     <Tooltip identifier="order_details_date_ordered_on" />
                  </Flex>
                  <Text as="p">
                     &nbsp;:&nbsp;{formatDate(order?.created_at)}
                  </Text>
               </Flex>
               {!isThirdParty && (
                  <>
                     <Spacer size="32px" xAxis />
                     <Flex as="section" container alignItems="center">
                        <TimeSlot
                           openTunnel={openTunnel}
                           type={order.fulfillmentType}
                           time={order.cart.fulfillmentInfo?.slot}
                        />
                     </Flex>
                  </>
               )}
            </Flex>
         </ResponsiveFlex>
         <Spacer size="16px" />

         <ResponsiveFlex
            container
            padding="0 16px"
            alignItems="center"
            justifyContent="space-between"
         >
            {!isThirdParty ? (
               <Flex container alignItems="center">
                  <Text as="h3">
                     {order.cart.assembledProducts.aggregate.count} /{' '}
                     {order.cart.packedProducts.aggregate.count} /{' '}
                     {order.cart.totalProducts.aggregate.count}
                     &nbsp;{t(address.concat('items'))}
                  </Text>
                  <Spacer size="8px" xAxis />
                  <Text as="h4">&middot; {order.cart?.orderStatus?.title}</Text>
               </Flex>
            ) : (
               <span />
            )}

            <ResponsiveFlex container style={{ alignItems: 'center' }}>
               {!isThirdParty && (
                  <>
                     <Flex width="240px">
                        <DropdownButton title="KOT Options">
                           <DropdownButton.Options>
                              <DropdownButton.Option onClick={() => printKOT()}>
                                 Print KOT
                              </DropdownButton.Option>
                              <DropdownButton.Option onClick={() => viewKOT()}>
                                 View in browser
                              </DropdownButton.Option>
                           </DropdownButton.Options>
                        </DropdownButton>
                     </Flex>
                     <Spacer size="24px" xAxis />
                  </>
               )}
               <Flex container>
                  <TextButton
                     type="solid"
                     disabled={order.isAccepted}
                     onClick={() =>
                        updateOrder({
                           variables: {
                              id: order.id,
                              _set: {
                                 isAccepted: true,
                                 ...(order.isRejected && { isRejected: false }),
                              },
                           },
                        })
                     }
                  >
                     {order.isAccepted ? 'Accepted' : 'Accept'}
                  </TextButton>
                  <Spacer size="14px" xAxis />
                  <TextButton
                     type="ghost"
                     onClick={() =>
                        updateOrder({
                           variables: {
                              id: order.id,
                              _set: {
                                 isRejected: !order.isRejected,
                              },
                           },
                        })
                     }
                  >
                     {order.isRejected ? 'Un Reject' : 'Reject'}
                  </TextButton>
               </Flex>
            </ResponsiveFlex>
         </ResponsiveFlex>
         <Spacer size="8px" />
         <Flex padding="0 16px">
            {order.cart.source === 'subscription' && (
               <>
                  <Text as="text1">Details: </Text>
                  <span>
                     {order.cart.subscriptionOccurence?.title?.title}, serves{' '}
                     {order.cart.subscriptionOccurence?.serving?.size}, count{' '}
                     {order.cart.subscriptionOccurence?.itemCount?.count}
                  </span>
               </>
            )}
         </Flex>
         <Spacer size="8px" />
         <Flex padding="0 16px" container alignItems="center">
            <IconButton
               type="ghost"
               size="sm"
               onClick={() => openAddressTunnel(1)}
            >
               <EditIcon color="#367BF5" />
            </IconButton>
            {order.cart?.address && !isEmpty(order.cart?.address) && (
               <>
                  <Text as="text1">Address:</Text>
                  <Spacer size="14px" xAxis />
                  <p style={{ marginBottom: '0em' }}>
                     {parseAddress(order.cart?.address)}
                  </p>
               </>
            )}
         </Flex>
         <Spacer size="8px" />
         {isThirdParty ? (
            <HorizontalTabs>
               <HorizontalTabList style={{ padding: '0 16px' }}>
                  <HorizontalTab>Email Content</HorizontalTab>
                  <HorizontalTab>Products</HorizontalTab>
               </HorizontalTabList>
               <HorizontalTabPanels>
                  <HorizontalTabPanel>
                     {parser.parse(order?.thirdPartyOrder?.emailContent)}
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     {isNull(order.thirdPartyOrder.products) ? (
                        <Filler message="No products available." />
                     ) : (
                        <Styles.Products>
                           {order.thirdPartyOrder.products.map(
                              (product, index) => (
                                 <Styles.ProductItem key={index}>
                                    <Flex
                                       container
                                       alignItems="center"
                                       justifyContent="space-between"
                                    >
                                       <span>{product.label}</span>
                                       <span>
                                          {currencyFmt(product.price || 0)}
                                       </span>
                                    </Flex>
                                    <Spacer size="14px" />
                                    <Flex container alignItems="center">
                                       <Flex
                                          as="span"
                                          container
                                          alignItems="center"
                                       >
                                          <UserIcon size={16} />
                                       </Flex>
                                       <Spacer size="6px" xAxis />
                                       <span>{product.quantity}</span>
                                    </Flex>
                                 </Styles.ProductItem>
                              )
                           )}
                        </Styles.Products>
                     )}
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>
         ) : (
            <HorizontalTabs
            // index={tabIndex} onChange={onTabChange}
            >
               <HorizontalTabList style={{ padding: '0 16px' }}>
                  {Object.keys(types).map(key => (
                     <HorizontalTab key={key}>
                        {key === 'null' ? 'Others' : key}
                        <span> ({types[key].length})</span>
                     </HorizontalTab>
                  ))}
               </HorizontalTabList>
               <HorizontalTabPanels>
                  {Object.values(types).map((listing, index) => (
                     <HorizontalTabPanel key={index}>
                        <Products
                           products={listing}
                           loading={productsLoading}
                           error={productsError}
                        />
                     </HorizontalTabPanel>
                  ))}
               </HorizontalTabPanels>
            </HorizontalTabs>
         )}

         <EditDeliveryTunnel
            tunnels={tunnels}
            cartId={order.cartId}
            closeTunnel={closeTunnel}
            fulfillment={order.cart?.fulfillmentInfo}
         />
         <EditAddressTunnel
            cartId={order.cartId}
            tunnels={addressTunnels}
            address={order.cart?.address}
            closeTunnel={closeAddressTunnel}
         />
         <Banner id="order-app-single-order-bottom" />
      </Flex>
   )
}

export default Order

const TimeSlot = ({ openTunnel, type, time = {} }) => {
   return (
      <Flex as="section" container alignItems="center">
         <Flex container alignItems="center">
            <Text as="h4">{isPickup(type) ? 'Pick Up' : 'Delivery'}</Text>
            <Tooltip identifier="order_details_date_fulfillment" />
         </Flex>
         <Text as="p" style={{ marginBottom: '0em' }}>
            {time?.from && moment(time?.from).format(': MMM DD, YYYY')}
            &nbsp;
            {time?.from ? moment(time?.from).format('hh:mmA') : 'N/A'}-
            {time?.to ? moment(time?.to).format('hh:mmA') : 'N/A'}
         </Text>
         <Spacer size="16px" xAxis />
         <IconButton type="ghost" size="sm" onClick={() => openTunnel(1)}>
            <EditIcon color="#367BF5" />
         </IconButton>
      </Flex>
   )
}

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

const EditDeliveryTunnel = ({
   cartId,
   tunnels,
   closeTunnel,
   fulfillment = {},
}) => {
   const [form, setForm] = React.useState({
      date: '',
      from: '',
      to: '',
   })
   const [updateCart, { loading }] = useMutation(MUTATIONS.CART.UPDATE.ONE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
         closeTunnel(1)
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })

   React.useEffect(() => {
      if (
         fulfillment &&
         !isEmpty(fulfillment) &&
         fulfillment.slot?.from &&
         fulfillment.slot?.to
      ) {
         setForm({
            date: moment(fulfillment.slot?.from).format('YYYY-MM-DD'),
            from: moment(fulfillment.slot?.from).format('HH:mm'),
            to: moment(fulfillment.slot?.to).format('HH:mm'),
         })
      }
   }, [fulfillment])

   const onSubmit = () => {
      let from = evalTime(form.date, form.from)
      let to = evalTime(form.date, form.to)
      if (moment(from).unix() > moment(to).unix()) {
         toast.error('Delivery from must be less than delivery till time.')
         return
      }
      const result = {
         type: fulfillment.type,
         slot: {
            from: evalTime(form.date, form.from),
            to: evalTime(form.date, form.to),
         },
      }
      updateCart({
         variables: {
            pk_columns: { id: cartId },
            _set: { fulfillmentInfo: result },
         },
      })
   }

   const handleChange = e => {
      const { name, value } = e.target
      setForm(existing => ({ ...existing, [name]: value }))
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader
               title="Edit Delivery Time"
               close={() => closeTunnel(1)}
               right={{
                  title: 'Save',
                  action: onSubmit,
                  isLoading: loading,
               }}
            />
            <Banner id="order-app-single-order-edit-delivery-tunnel-top" />
            <Flex padding="16px" overflowY="auto" height="calc(100vh - 195px)">
               <Form.Group>
                  <Form.Label htmlFor="date" title="date">
                     Date
                  </Form.Label>
                  <Form.Date
                     id="date"
                     name="date"
                     value={form.date}
                     onChange={handleChange}
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="from" title="from">
                     From
                  </Form.Label>
                  <Form.Time
                     id="from"
                     name="from"
                     value={form.from}
                     onChange={handleChange}
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="to" title="to">
                     To
                  </Form.Label>
                  <Form.Time
                     id="to"
                     name="to"
                     value={form.to}
                     onChange={handleChange}
                  />
               </Form.Group>
            </Flex>
            <Banner id="order-app-single-order-edit-delivery-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

const EditAddressTunnel = ({ cartId, tunnels, closeTunnel, address = {} }) => {
   const [form, setForm] = React.useState({
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
   })
   const [updateCart, { loading }] = useMutation(MUTATIONS.CART.UPDATE.ONE, {
      onCompleted: () => {
         toast.success('Successfully updated the order!')
         closeTunnel(1)
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the order')
      },
   })

   React.useEffect(() => {
      if (address && !isEmpty(address)) {
         setForm(address)
      }
   }, [address])

   const onSubmit = () => {
      updateCart({
         variables: {
            pk_columns: { id: cartId },
            _set: { address: form },
         },
      })
   }

   const handleChange = e => {
      const { name, value } = e.target
      setForm(existing => ({ ...existing, [name]: value }))
   }

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="sm">
            <TunnelHeader
               title="Edit Address"
               close={() => closeTunnel(1)}
               right={{
                  title: 'Save',
                  action: onSubmit,
                  isLoading: loading,
               }}
            />
            <Banner id="order-app-single-order-edit-address-tunnel-top" />
            <Flex padding="16px" overflowY="auto" height="calc(100vh - 195px)">
               <Form.Group>
                  <Form.Label htmlFor="line1" title="line1">
                     Apartment/Building Info/Street info*
                  </Form.Label>
                  <Form.Text
                     id="line1"
                     name="line1"
                     value={form.line1}
                     onChange={handleChange}
                     placeholder="Apartment/Building Info/Street info*"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="line2" title="line2">
                     Line 2
                  </Form.Label>
                  <Form.Text
                     id="line2"
                     name="line2"
                     value={form.line2}
                     onChange={handleChange}
                     placeholder="Enter line 2"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="city" title="city">
                     City
                  </Form.Label>
                  <Form.Text
                     id="city"
                     name="city"
                     value={form.city}
                     onChange={handleChange}
                     placeholder="Enter city"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="zipcode" title="zipcode">
                     Zipcode
                  </Form.Label>
                  <Form.Text
                     id="zipcode"
                     name="zipcode"
                     value={form.zipcode}
                     onChange={handleChange}
                     placeholder="Enter zipcode"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="state" title="state">
                     State
                  </Form.Label>
                  <Form.Text
                     id="state"
                     name="state"
                     value={form.state}
                     onChange={handleChange}
                     placeholder="Enter state"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="country" title="country">
                     Country
                  </Form.Label>
                  <Form.Text
                     id="country"
                     name="country"
                     value={form.country}
                     onChange={handleChange}
                     placeholder="Enter country"
                  />
               </Form.Group>
            </Flex>
            <Banner id="order-app-single-order-edit-address-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
