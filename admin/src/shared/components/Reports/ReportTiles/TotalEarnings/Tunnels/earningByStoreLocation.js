import { useSubscription } from '@apollo/react-hooks'
import React from 'react'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { GET_TOTAL_EARNING } from '../../../../DashboardAnalytics/graphQl/subscription'
import moment from 'moment'
import { Filler, Flex, Spacer } from '@dailykit/ui'
import { InlineLoader } from '../../../../InlineLoader'
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../../ErrorState'
import { EarningByStoreLocationChart } from './chart'
import EarningByStoreLocationTable from './Listing/earningByStoreLocation'
import { GET_STORE_LOCATION_INSIGHTS } from '../graphql/subscription'

export const EarningByStoreLocation = () => {
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const { brandShop, from, to } = brandShopDateState
   const [sortedEarningByStoreLocation, setSortedEarningByStoreLocation] =
      React.useState([])
   const [
      earningByStoreLocationCompareData,
      setEarningByStoreLocationCompareData,
   ] = React.useState([])
   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(GET_STORE_LOCATION_INSIGHTS, {
      fetchPolicy: 'network-only',
      variables: {
         //totalEarning
         params: {
            where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
               from !== moment('2017 - 01 - 01') &&
               `AND o.created_at >= '${from}'`
            } ${
               from !== moment('2017 - 01 - 01') &&
               `AND o.created_at < '${moment(to)
                  .add(1, 'd')
                  .format('YYYY-MM-DD')}'`
            } ${
               brandShop.brandId ? `AND o."brandId" = ${brandShop.brandId}` : ''
            } ${
               brandShop.shopTitle
                  ? `AND oc.source = \'${brandShop.shopTitle}\'`
                  : ''
            }`,
         },
      },
   })
   const { loading: subsCompareLoading, error: subsCompareError } =
      useSubscription(GET_STORE_LOCATION_INSIGHTS, {
         skip: brandShopDateState.compare.isSkip,
         variables: {
            params: {
               where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
                  brandShopDateState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND o.created_at >= '${brandShopDateState.compare.from}'`
               } ${
                  brandShopDateState.compare.from !==
                     moment('2017 - 01 - 01') &&
                  `AND o.created_at < '${moment(brandShopDateState.compare.to)
                     .add(1, 'd')
                     .format('YYYY-MM-DD')}'`
               } ${
                  brandShopDateState.brandShop.brandId
                     ? `AND o."brandId" = ${brandShopDateState.brandShop.brandId}`
                     : ''
               } ${
                  brandShopDateState.brandShop.shopTitle
                     ? `AND oc.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                     : ''
               }`,
            },
         },
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.insights_analytics[0].getLocationInsights

            setEarningByStoreLocationCompareData(newData)
         },
      })

   React.useEffect(() => {
      if (insights_analytics.length) {
         if (insights_analytics[0].getLocationInsights.length > 1)
            setSortedEarningByStoreLocation(
               insights_analytics[0].getLocationInsights
            )
      }
   }, [insights_analytics])
   if (subsLoading) return <InlineLoader />

   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState
            height="320px"
            message="Could not get Earning by store location data"
         />
      )
   }
   if (
      insights_analytics.length == 0 ||
      insights_analytics[0].getLocationInsights.length == 0
   ) {
      return <Filler message="Earning By Store Location Not Available" />
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
                  <EarningByStoreLocationChart
                     earningByStoreLocationData={sortedEarningByStoreLocation.slice(
                        0,
                        10
                     )}
                     earningByStoreLocationCompareData={
                        earningByStoreLocationCompareData
                     }
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
                  <EarningByStoreLocationTable
                     earningByStoreLocation={
                        insights_analytics[0].getLocationInsights
                     }
                     currency={brandShopDateState.currency}
                     setSortedEarningByStoreLocation={
                        setSortedEarningByStoreLocation
                     }
                  />
               </div>
            </Flex>
         </Flex>
      </>
   )
}
