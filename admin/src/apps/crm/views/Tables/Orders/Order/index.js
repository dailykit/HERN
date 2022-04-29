import React, { useState, useContext, useRef } from 'react'
import { Text, Avatar, useTunnel, Flex } from '@dailykit/ui'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { useQuery } from '@apollo/react-hooks'
import { ORDER } from '../../../../graphql'
import { capitalizeString } from '../../../../Utils'
import { PaymentCard } from '../../../../components'
import { ChevronRight } from '../../../../../../shared/assets/icons'
import { Tooltip, InlineLoader } from '../../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../../shared/providers'
import { combineCartItems } from '../../../../../../shared/utils'
import { toast } from 'react-toastify'
import {
   OrderStatusTunnel,
   PaymentStatusTunnel,
} from '../../../Forms/CustomerRelation/Tunnel'
import {
   StyledWrapper,
   StyledContainer,
   StyledSideBar,
   StyledMainBar,
   StyledTable,
   StyledDiv,
   StyledSpan,
   SideCard,
   StyledInput,
   SmallText,
   Card,
   CardInfo,
} from './styled'
import options from '../../../tableOptions'
import { currencyFmt, logger } from '../../../../../../shared/utils'
// import BrandContext from '../../../../context/Brand'
import * as moment from 'moment'
import { BrandContext } from '../../../../../../App'
import { useParams } from 'react-router-dom'

const OrderInfo = () => {
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const { dispatch, tab } = useTabs()
   const params = useParams()
   console.log('order', params)
   const { tooltip } = useTooltip()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [tunnels1, openTunnel1, closeTunnel1] = useTunnel(1)
   const [products, setProducts] = useState(undefined)
   const [orderData, setOrderData] = useState({})
   const tableRef = useRef()
   const { loading } = useQuery(ORDER, {
      variables: {
         orderId: tab.data.oid,
         brandId: params.brandId,
      },
      onCompleted: ({ brand: { brand_Orders = [] } = {} } = {}) => {
         const quantity = combineCartItems(
            brand_Orders[0]?.cart?.cartItems
         ).length
         console.log('quantity', quantity)
         setOrderData(brand_Orders[0])
         const result = brand_Orders[0]?.cart?.cartItems?.map(item => {
            return {
               products: item?.displayName || 'N/A',
               servings: quantity || 'N/A',
               discount: item.discount || 'N/A',
               discountedPrice: item?.unitPrice || 'N/A',
            }
         })
         setProducts(result)
      },
      onError: error => {
         toast.error('Something went wrong order')
         logger(error)
      },
   })

   const setOrder = (orderId, order) => {
      dispatch({
         type: 'STORE_TAB_DATA',
         payload: {
            path: tab.path,
            data: { oid: orderId, isOrderClicked: order },
         },
      })
   }

   const columns = [
      {
         title: 'Products',
         field: 'products',
         hozAlign: 'left',
         width: 300,
         headerTooltip: function (column) {
            const identifier = 'product_listing_name_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Servings',
         field: 'servings',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'product_listing_serving_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Discount',
         field: 'discount',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'product_listing_discount_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => currencyFmt(Number(cell.getValue()) || 0),
      },
      {
         title: 'Discounted Price',
         field: 'discountedPrice',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'product_listing_discounted_price_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => currencyFmt(Number(cell.getValue()) || 0),
      },
   ]

   let deliveryPartner = null
   let deliveryAgent = null
   if (orderData?.deliveryService !== null) {
      deliveryPartner = (
         <>
            <Text as="subtitle">Delivery Partner: </Text>
            <Card>
               <Avatar
                  withName
                  type="round"
                  title={orderData?.deliveryService?.companyName || 'N/A'}
                  url={orderData?.deliveryService?.logo || ''}
               />
            </Card>
         </>
      )
   }
   if (orderData?.driverInfo !== null) {
      deliveryAgent = (
         <>
            <Flex container alignItems="center">
               <Text as="subtitle">Delivery Assign To:</Text>
               <Tooltip identifier="customer_order_delivery_agent" />
            </Flex>
            <Card>
               <Avatar
                  withName
                  type="round"
                  title={`${orderData?.driverInfo?.driverFirstName || ''} ${
                     orderData?.driverInfo?.driverLastName || 'N/A'
                  }`}
                  url={orderData?.driverInfo?.driverPicture || ''}
               />
               <CardInfo bgColor="rgba(243, 243, 243, 0.4)">
                  <Text as="p">Total Paid:</Text>
                  <Text as="p">
                     {currencyFmt(Number(orderData?.deliveryFee?.value || 0))}
                  </Text>
               </CardInfo>
            </Card>
         </>
      )
   }

   let deliveryInfoCard = null
   if (deliveryPartner !== null || deliveryAgent !== null)
      deliveryInfoCard = (
         <SideCard>
            {deliveryPartner}
            {deliveryAgent}
         </SideCard>
      )
   if (loading) return <InlineLoader />
   return (
      <StyledWrapper>
         <Flex container alignItems="center" justifyContent="space-between">
            <StyledContainer>
               <StyledInput
                  type="button"
                  onClick={() => setOrder('', false)}
                  value="Orders"
               />
               <ChevronRight size="20" />
               <Text as="p">Order Id: #{tab.data.oid}</Text>
            </StyledContainer>
            <SmallText onClick={() => openTunnel(1)}>
               Check Order Status
            </SmallText>
         </Flex>
         <Flex container margin="0 0 0 6px" height="80px" alignItems="center">
            <Text as="h1">Order Id: #{tab.data.oid}</Text>
            <Tooltip identifier="product_list_heading" />
         </Flex>
         <StyledContainer>
            <StyledMainBar>
               <StyledDiv>
                  <StyledSpan>
                     Ordered on:{' '}
                     {moment(orderData?.created_at).format(
                        'MMMM Do YYYY, h:mm:ss a'
                     ) || 'N/A'}
                  </StyledSpan>
                  <StyledSpan>Delivered on: N/A</StyledSpan>
                  <StyledSpan>
                     Channel:{' '}
                     {capitalizeString(orderData?.cart?.source || 'N/A')}
                  </StyledSpan>
               </StyledDiv>
               <StyledTable>
                  {Boolean(products) && (
                     <ReactTabulator
                        columns={columns}
                        data={products}
                        ref={tableRef}
                        options={{
                           ...options,
                           placeholder: 'No Order Available Yet !',
                        }}
                     />
                  )}
                  <CardInfo>
                     <Text as="title">
                        {orderData?.cart?.billingDetails?.itemTotal?.label}
                     </Text>
                     <Text as="title">
                        {currencyFmt(
                           Number(
                              orderData?.cart?.billingDetails?.itemTotal
                                 ?.value || 0
                           )
                        )}
                     </Text>
                  </CardInfo>
                  <CardInfo>
                     <Text as="title">
                        {orderData?.cart?.billingDetails?.deliveryPrice?.label}
                     </Text>
                     <Text as="title">
                        {currencyFmt(
                           Number(
                              orderData?.cart?.billingDetails?.deliveryPrice
                                 ?.value || 0
                           )
                        )}
                     </Text>
                  </CardInfo>
                  <CardInfo>
                     <Text as="title">
                        {orderData?.cart?.billingDetails?.discount?.label}
                     </Text>
                     <Text as="title">
                        {currencyFmt(
                           Number(
                              orderData?.cart?.billingDetails?.discount
                                 ?.value || 0
                           )
                        )}
                     </Text>
                  </CardInfo>
                  <CardInfo>
                     <Text as="title">
                        {orderData?.cart?.billingDetails?.totalPrice?.label}
                     </Text>
                     <Text as="title">
                        {currencyFmt(
                           Number(
                              orderData?.cart?.billingDetails?.totalPrice
                                 ?.value || 0
                           )
                        )}
                     </Text>
                  </CardInfo>
                  <CardInfo>
                     <Text as="title">Wallet Amount Used</Text>
                     <Text as="title">
                        {currencyFmt(orderData?.cart?.walletAmountUsed)}
                     </Text>
                  </CardInfo>
                  <CardInfo>
                     <Text as="title">Loyalty Points Used</Text>
                     <Text as="title">
                        {orderData?.cart?.loyaltyPointsUsed}
                     </Text>
                  </CardInfo>
                  <CardInfo bgColor="#f3f3f3">
                     <Text as="h2">Total Paid</Text>
                     <Text as="h2">
                        {currencyFmt(Number(orderData?.amountPaid || 0))}
                     </Text>
                  </CardInfo>
               </StyledTable>
            </StyledMainBar>
            <StyledSideBar>
               <PaymentCard
                  cardData={orderData?.cart?.paymentCart || 'N/A'}
                  billingAddDisplay="none"
                  bgColor="rgba(243,243,243,0.4)"
                  margin="0 0 16px 0"
                  defaultTag="(Used for this order)"
                  onClick={() => openTunnel1(1)}
                  smallText="Check Payment Status"
                  identifier="payment_card_info"
               />
               {deliveryInfoCard}
            </StyledSideBar>
         </StyledContainer>
         <OrderStatusTunnel
            tunnels={tunnels}
            openTunnel={openTunnel}
            closeTunnel={closeTunnel}
         />
         <PaymentStatusTunnel
            tunnels={tunnels1}
            openTunnel={openTunnel1}
            closeTunnel={closeTunnel1}
         />
      </StyledWrapper>
   )
}

export default OrderInfo
