import {
   Spacer,
   TextButton,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { useAuth } from '../../providers'
import {
   CustomerIcon,
   OrderIcon,
   ProductIcon,
   QuickNav,
   ReportIcon,
} from './assets/icons'
import {
   DashboardReport,
   UserText,
   OptionTypes,
   SvgBoxReport,
   ViewBtn,
   DashboardQuickNav,
   SvgBoxQuickNav,
   TextQuickNav,
   AppItem,
} from './styled'
import { useLocation, useHistory } from 'react-router-dom'
import EarningOverTime from '../Reports/ReportTiles/TotalEarnings/Tunnels/earningOverTime'
import OrderSummaryReport from '../Reports/ReportTiles/TotalOrders/tunnels/orderSummary'
import BrandShopDate from '../BrandShopDateProvider'
import CustomerOverTime from '../Reports/ReportTiles/Customers/Tunnels/customerOverTime'

const DashboardRightPanel = () => {
   const { user } = useAuth()
   const history = useHistory()
   const [reportTunnels, openReportTunnel, closeReportTunnel] = useTunnel(6)
   const [orderReportTunnels, openOrderReportTunnel, closeOrderReportTunnel] =
      useTunnel(3)
   const [
      customerReportTunnels,
      openCustomerReportTunnel,
      closeCustomerReportTunnel,
   ] = useTunnel(2)

   return (
      <div>
         <DashboardReport>
            <SvgBoxReport>
               <ReportIcon />
            </SvgBoxReport>
            <UserText>
               <p>Hi {user?.name || 'user'}!</p>
               <span>Would you like to see your Reports</span>
            </UserText>
            <OptionTypes>
               <li onClick={() => openOrderReportTunnel(1)}>Order Summary</li>
               <li onClick={() => openReportTunnel(1)}>Earnings Overtime</li>
               <li onClick={() => openCustomerReportTunnel(1)}>
                  Customers Overtime
               </li>
            </OptionTypes>
            <ViewBtn>
               <TextButton
                  onClick={() => history.push('/insights')}
                  type="ghost"
                  size="sm"
               >
                  View More
               </TextButton>
            </ViewBtn>
         </DashboardReport>
         <Spacer yaxis size="20px" />

         <DashboardQuickNav>
            <SvgBoxQuickNav>
               <QuickNav />
            </SvgBoxQuickNav>
            <TextQuickNav>Quick Navigation</TextQuickNav>
            <AppItem>
               <li
                  onClick={() => history.push('/order/orders')}
                  title="Go to Orders"
               >
                  <OrderIcon />
                  Orders
               </li>
               <li
                  onClick={() => history.push('/crm/customers')}
                  title="Go to Customers List"
               >
                  <CustomerIcon />
                  Customers
               </li>
               <li
                  onClick={() => history.push('/products/products')}
                  title="Go to Product List"
               >
                  <ProductIcon />
                  Products
               </li>
            </AppItem>
         </DashboardQuickNav>
         <Spacer yaxis size="20px" />

         <Tunnels tunnels={reportTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Earning over time"
                  close={() => closeReportTunnel(1)}
                  description="This is a description"
               />
               <EarningOverTime />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={orderReportTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Order Summary Report"
                  close={() => closeOrderReportTunnel(1)}
                  description="This is a description"
               />
               <OrderSummaryReport />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={customerReportTunnels}>
            <Tunnel size="full" layer={1}>
               <TunnelHeader
                  title="Customer over time"
                  close={() => closeCustomerReportTunnel(1)}
                  description="This is a description"
               />
               <BrandShopDate
                  brandProvider
                  shopTypeProvider
                  datePickerProvider
                  compareProvider
                  groupTimeProvider
               >
                  <CustomerOverTime />
               </BrandShopDate>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
export default DashboardRightPanel
