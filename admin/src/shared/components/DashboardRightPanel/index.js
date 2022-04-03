import {
   Spacer,
   TextButton,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React, { useContext } from 'react'
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
import { useHistory } from 'react-router-dom'
import EarningOverTime from '../Reports/ReportTiles/TotalEarnings/Tunnels/earningOverTime'
import OrderSummaryReport from '../Reports/ReportTiles/TotalOrders/tunnels/orderSummary'
import BrandShopDate from '../BrandShopDateProvider'
import CustomerOverTime from '../Reports/ReportTiles/Customers/Tunnels/customerOverTime'
import { BrandContext } from './../../../App'
import BrandManagerList from '../OperationalMode/Listing/ListForIds/brandId'
import BrandLocationManagerList from '../OperationalMode/Listing/ListForIds/brandIdLocation'

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
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [brandTunnels, openBrandTunnel, closeBrandTunnel] = useTunnel(1)
   const [
      brandLocationTunnels,
      openBrandLocationTunnel,
      closeBrandLocationTunnel,
   ] = useTunnel(1)

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
               <li
                  onClick={() => {
                     brandContext.brandId
                        ? history.push(
                             `/operationMode/${brandContext.brandName}-${brandContext.brandId}`
                          )
                        : openBrandTunnel(1)
                  }}
               >
                  Brand Manager Operation Mode
               </li>
               <li
                  onClick={() => {
                     brandContext.brandLocationId
                        ? history.push(
                             `/operationMode/${brandContext.brandName}-${brandContext.brandId}${brandContext.brandLocationId}`
                          )
                        : openBrandLocationTunnel(1)
                  }}
               >
                  Brand Location Manager Operation Mode
               </li>
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
         <Tunnels tunnels={brandTunnels}>
            <Tunnel popup={true} layer={4} size="md">
               <BrandManagerList closeTunnel={closeBrandTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={brandLocationTunnels}>
            <Tunnel popup={true} layer={4} size="md">
               <BrandLocationManagerList
                  closeTunnel={closeBrandLocationTunnel}
               />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
export default DashboardRightPanel
