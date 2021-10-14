import { Spacer, TextButton } from '@dailykit/ui'
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

const DashboardRightPanel = () => {
   const { user } = useAuth()
   const history = useHistory()

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
               <li>Order Summary</li>
               <li>Earnings Overtime</li>
               <li>Customers Overtime</li>
            </OptionTypes>
            <ViewBtn>
               <TextButton type="ghost" size="sm">
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
      </div>
   )
}
export default DashboardRightPanel
