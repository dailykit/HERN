import React from 'react'
import moment from 'moment'
import { useSubscription } from '@apollo/react-hooks'
import { BrandShopDateContext } from '../../../../BrandShopDateProvider/context'
import { GET_BRAND_INSIGHT } from '../graphql/subscription'
import { Filler, Flex, Spacer } from '@dailykit/ui'
import EarningByBrandTable from './Listing/earningByBrand'
import { InlineLoader } from '../../../../InlineLoader'
import { logger } from '../../../../../utils'
import { toast } from 'react-toastify'
import { ErrorState } from '../../../../ErrorState'
import { EarningByBrandChart } from './chart'

export const EarningByBrand = () => {
   const { brandShopDateState } = React.useContext(BrandShopDateContext)
   const [sortedEarningByBrandData, setSortedEarningByBrandData] =
      React.useState([])
   const [earningByBrandCompareData, setEarningByBrandCompareData] =
      React.useState([])

   const {
      data: { insights_analytics = [] } = {},
      loading: subsLoading,
      error: subsError,
   } = useSubscription(GET_BRAND_INSIGHT, {
      variables: {
         params: {
            where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
               brandShopDateState.from !== moment('2017 - 01 - 01') &&
               `AND o.created_at >= '${brandShopDateState.from}'`
            } ${
               brandShopDateState.from !== moment('2017 - 01 - 01') &&
               `AND o.created_at < '${moment(brandShopDateState.to)
                  .add(1, 'd')
                  .format('YYYY-MM-DD')}'`
            } ${
               brandShopDateState.brandShop.shopTitle
                  ? `AND c.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                  : ''
            }`,
            columns: 'title, id',
         },
      },
   })
   useSubscription(GET_BRAND_INSIGHT, {
      skip: brandShopDateState.compare.isSkip,
      variables: {
         params: {
            where: `"isAccepted" = true AND COALESCE("isRejected", false) = false AND "paymentStatus" = \'SUCCEEDED\' ${
               brandShopDateState.compare.from !== moment('2017 - 01 - 01') &&
               `AND o.created_at >= '${brandShopDateState.compare.from}'`
            } ${
               brandShopDateState.compare.from !== moment('2017 - 01 - 01') &&
               `AND o.created_at < '${moment(brandShopDateState.compare.to)
                  .add(1, 'd')
                  .format('YYYY-MM-DD')}'`
            } ${
               brandShopDateState.brandShop.shopTitle
                  ? `AND c.source = \'${brandShopDateState.brandShop.shopTitle}\'`
                  : ''
            }`,
            columns: 'title, id',
         },
      },
      onSubscriptionData: ({ subscriptionData }) => {
         setEarningByBrandCompareData(
            subscriptionData.data.insights_analytics[0].getBrandInsights
         )
      },
   })

   React.useEffect(() => {
      if (insights_analytics.length) {
         setSortedEarningByBrandData(insights_analytics[0]?.getBrandInsights)
      }
   }, [insights_analytics])

   if (subsLoading) return <InlineLoader />

   if (subsError) {
      logger(subsError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState
            height="320px"
            message="Could not get Earning brand data"
         />
      )
   }

   if (
      insights_analytics.length == 0 ||
      insights_analytics[0].getBrandInsights.length == 0
   ) {
      return <Filler message="Earning By Brand Data Not Available" />
   }
   return (
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
               <EarningByBrandChart
                  earningByBrandData={sortedEarningByBrandData.slice(0, 10)}
                  earningByBrandCompareData={earningByBrandCompareData}
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
               <EarningByBrandTable
                  earningByBrand={insights_analytics[0]?.getBrandInsights}
                  setSortedEarningByBrandData={setSortedEarningByBrandData}
               />
            </div>
         </Flex>
      </Flex>
   )
}
