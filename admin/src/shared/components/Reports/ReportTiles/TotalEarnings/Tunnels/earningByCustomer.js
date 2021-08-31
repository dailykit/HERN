import { useSubscription } from '@apollo/react-hooks'
import { Filler, Flex, Spacer, Text } from '@dailykit/ui'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts'
import { logger } from '../../../../../utils'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { ErrorState } from '../../../../ErrorState'
import { InlineLoader } from '../../../../InlineLoader'
import { EARNING_BY_CUSTOMERS } from '../../../graphql/subscription'
import EarningByCustomerTable from './Listing/earningByCustomer'

const EarningByCustomer = () => {
   const [customerData, setCustomerData] = useState([])
   const [status, setStatus] = useState({ loading: true })

   const { brandShopDateState } = React.useContext(BrandShopDateContext)

   const { loading: subsLoading, error: subsError } = useSubscription(
      EARNING_BY_CUSTOMERS,
      {
         variables: {
            earningByCustomerArg: {
               params: {
                  where: `id IS NOT NULL ${
                     brandShopDateState.from && brandShopDateState.to
                        ? `AND \"created_at\" >= '${brandShopDateState.from}' AND \"created_at\" <= '${brandShopDateState.to}'`
                        : ''
                  } ${
                     brandShopDateState.brandShop.brandId
                        ? `AND a."brandId" = ${brandShopDateState.brandShop.brandId}`
                        : ''
                  } ${
                     brandShopDateState.brandShop.shopTitle
                        ? `AND b.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                        : ''
                  }`,
               },
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newCustomerData =
               subscriptionData.data.insights_analytics[0].getTopCustomers.map(
                  customer => {
                     const newCustomer = {}
                     newCustomer.email = customer.email || 'N/A'
                     newCustomer.fullName = `${customer.firstName || 'N/A'} ${
                        customer.lastName || ''
                     }`
                     newCustomer.phoneNumber = customer.phoneNumber || 'N/A'
                     newCustomer.totalAmountPaid = customer.totalAmountPaid || 0
                     newCustomer.orders = customer.totalOrders || 0
                     newCustomer.totalTax = customer.totalTax || 0
                     newCustomer.totalDiscount = customer.totalDiscount || 0
                     newCustomer.netSale = parseFloat(
                        (
                           newCustomer.totalAmountPaid -
                           newCustomer.totalTax -
                           newCustomer.totalDiscount
                        ).toFixed(2)
                     )
                     return newCustomer
                  }
               )
            setCustomerData(newCustomerData)
            setStatus({ ...status, loading: false })
         },
      }
   )

   useEffect(() => {
      if (subsLoading) {
         setStatus({ ...status, loading: true })
      }
   }, [subsLoading])

   if (status.loading || (subsLoading && !subsError)) {
      return <InlineLoader />
   }

   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState
            height="320px"
            message="Could not get Earning by customer data"
         />
      )
   }

   if (customerData.length == 0) {
      return <Filler message="No customer data available" />
   }

   return (
      <>
         <Flex>
            <Spacer size="20px" />
            <Flex>
               <div
                  style={{
                     background: '#FFFFFF',
                     boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                     borderRadius: '10px',
                     padding: '40px 40px 10px 0px',
                  }}
               >
                  <EarningByCustomerChart
                     earningByCustomerData={customerData.slice(0, 10)}
                  />
               </div>
            </Flex>
            <Spacer size="20px" />

            <Flex>
               <div
                  style={{
                     background: '#FFFFFF',
                     boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                     borderRadius: '10px',
                     padding: '10px 0px',
                  }}
               >
                  <EarningByCustomerTable
                     earningByCustomerData={customerData}
                  />
               </div>
            </Flex>
         </Flex>
      </>
   )
}

const EarningByCustomerChart = props => {
   const { earningByCustomerData } = props
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
         return (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f9f9f9',
                  color: '#8884d8 !important',
                  width: '11rem',
                  height: 'auto',
                  margin: '2px 2px',
                  padding: '2px 2px',
                  boxShadow: '5px 5px 10px #888888',
               }}
            >
               <Spacer size="3px" />
               <Text as="text3">
                  Customer Name: {payload[0].payload['fullName']}
               </Text>
               <Text as="text3">
                  Earning: {brandShopDateState.currency}
                  {payload[0].payload['total']}
               </Text>
               <Text as="text3">
                  Tax: {brandShopDateState.currency}
                  {payload[0].payload['totalTax']}
               </Text>
               <Text as="text3">
                  Discount: {brandShopDateState.currency}
                  {payload[0].payload['totalDiscount']}
               </Text>
            </div>
         )
      }

      return null
   }
   return (
      <>
         <Flex height="22rem">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart
                  width={550}
                  height={300}
                  data={earningByCustomerData}
                  margin={{
                     top: 5,
                     right: 0,
                     left: 0,
                     bottom: 5,
                  }}
               >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fullName" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                     name="Earning"
                     type="monotone"
                     dataKey="totalAmountPaid"
                     stroke="#8884d8"
                  />
               </LineChart>
            </ResponsiveContainer>
         </Flex>
      </>
   )
}
export default EarningByCustomer
