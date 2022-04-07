import React, { useContext, useState } from 'react'
import { useSubscription } from '@apollo/react-hooks'
import moment from 'moment'
import '../../tableStyle.css'
import { RECENT_ORDERS } from '../../graphql/subscription'
import { InlineLoader } from '../../../InlineLoader'
import { logger } from '../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../ErrorState'
import { Filler } from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from '../../tableOptions'
import { TableHeader } from '../../shared'
import { useEffect } from 'react'
// import { DashboardTableContext } from '../../context'
import { useHistory } from 'react-router-dom'
import { BrandContext } from './../../../../../../src/App'
import { useTabs } from '../../../../providers'

const RecentOrderTable = () => {
   const [recentOrders, setRecentOrders] = useState([])
   const [status, setStatus] = useState({ loading: true })
   // const { dashboardTableState } = React.useContext(DashboardTableContext)
   const history = useHistory()
   const [brandContext] = useContext(BrandContext)
   const { addTab } = useTabs()

   const { loading: subsLoading, error: subsError } = useSubscription(
      RECENT_ORDERS,
      {
         variables: {
            where: {
               cart: {
                  brandId: {
                     _in: brandContext.brandId,
                  },
                  locationId: {
                     _in: brandContext.locationId,
                  },
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const data = subscriptionData.data.orders
            const newData = data.map(order => {
               const newOrder = {}
               newOrder.id = order.id
               newOrder.created_at = moment(order.created_at).format('ll')
               newOrder.customerName = `${
                  order.cart?.customerInfo?.customerFirstName || 'N/A'
               } ${order.cart?.customerInfo?.customerLastName || ''}`
               switch (order.cart?.status) {
                  case 'ORDER_PENDING':
                     newOrder.status = 'Pending'
                     break
                  case 'ORDER_UNDER_PROCESSING':
                     newOrder.status = 'Under Processing'
                     break
                  case 'ORDER_READY_TO_ASSEMBLE':
                     newOrder.status = 'Ready To Assemble'
                     break
                  case 'ORDER_READY_TO_DISPATCH':
                     newOrder.status = 'Ready To Dispatch'
                     break
                  case 'ORDER_DELIVERED':
                     newOrder.status = 'Delivered'
                     break
                  case 'ORDER_OUT_FOR_DELIVERY':
                     newOrder.status = 'Out For Delivery'
                     break
                  default:
                     newOrder.status = 'Rejected'
                     break
               }
               return newOrder
            })
            setRecentOrders(newData)
            setStatus({ ...status, loading: false })
         },
      }
   )
   // console.log('recent orders', recentOrders)
   const tableHeaderOnClick = () => {
      history.push('order')
   }
   React.useEffect(() => {
      addTab('Home', '/')
   }, [brandContext.brandId, brandContext.locationId])
   const columns = [
      { title: 'Order Id', field: 'id' },
      {
         title: 'Customer Name',
         field: 'customerName',
      },
      {
         title: 'Order At',
         field: 'created_at',
      },
      {
         title: 'Status',
         field: 'status',
         formatter: reactFormatter(<StatusFormatter />),
      },
   ]

   if (subsLoading || status.loading) {
      return <InlineLoader />
   }
   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   if (recentOrders.length == 0) {
      return <Filler message="No Recent Order Data Available" />
   }
   return (
      <>
         <TableHeader heading="Recent Order" onClick={tableHeaderOnClick}>
            <ReactTabulator
               data={recentOrders}
               columns={columns}
               options={TableOptions}
               data-custom-attr="test-custom-attribute"
               className="dashboard-table"
            />
         </TableHeader>
      </>
   )
}
const StatusFormatter = ({ cell }) => {
   const [bgColor, setBgColor] = useState('')
   useEffect(() => {
      switch (cell._cell.value) {
         case 'Pending':
            setBgColor(' #001E6C')
            break
         case 'Under Processing':
            setBgColor(' #FBB13C')
            break
         case 'Ready To Assemble':
            setBgColor(' #555B6E')
            break
         case 'Ready To Dispatch':
            setBgColor('#3C91E6')
            break
         case 'Delivered':
            setBgColor('  #53C22B')
            break
         case 'Out For Delivery':
            setBgColor(' #1EA896')
            break
         default:
            setBgColor('#FF2626')
      }
   }, [])
   if (!bgColor) {
      return <span>{cell._cell.value}</span>
   }
   return (
      <>
         <span style={{ color: `${bgColor}` }}>{cell._cell.value}</span>
      </>
   )
}
export default RecentOrderTable
