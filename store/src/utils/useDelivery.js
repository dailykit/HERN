import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import {
   BRAND_LOCATIONS,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
   PREORDER_DELIVERY_BRAND_RECURRENCES,
} from '../graphql'
import { useConfig } from '../lib'

function useDelivery(address, fulfillmentType) {
   const { brand, orderTabs } = useConfig()

   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )

   const [onDemandBrandRecurrence, setOnDemandBrandReoccurrence] =
      useState(null)
   const [preOrderBrandRecurrence, setPreOrderBrandReoccurrence] =
      useState(null)
   const [brandLocationsLoading, setBranLocationsLoading] = useState(true)

   const [deliveryType, setDeliveryType] = useState(
      fulfillmentType
         ? fulfillmentType === 'ONDEMAND_DELIVERY'
            ? 'ONDEMAND'
            : 'PREORDER'
         : orderTabFulfillmentType.includes('ONDEMAND_DELIVERY')
         ? 'ONDEMAND'
         : 'PREORDER'
   )

   // get all store when user address available
   const { data: { brands_brand_location_aggregate = {} } = {} } = useQuery(
      BRAND_LOCATIONS,
      {
         skip: !address?.city || !address?.state || !brand || !brand?.id,
         variables: {
            where: {
               _or: [
                  {
                     location: {
                        city: { _eq: address?.city },
                        state: { _eq: address?.state },
                     },
                  },
                  {
                     _or: [
                        { doesDeliverOutsideCity: { _eq: true } },
                        { doesDeliverOutsideState: { _eq: true } },
                     ],
                  },
               ],
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            if (data) {
               setBranLocationsLoading(false)
            }
         },
         onError: error => {
            console.log(error)
         },
      }
   )

   // onDemand delivery
   const { loading: brandRecurrencesLoading } = useQuery(
      BRAND_ONDEMAND_DELIVERY_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !brand ||
            !brand.id ||
            !(deliveryType === 'ONDEMAND'),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: brand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setOnDemandBrandReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('Ondemand brand recurrences error:::', e)
         },
      }
   )

   // preOrderDelivery
   const { loading: preOrderBrandRecurrencesLoading } = useQuery(
      PREORDER_DELIVERY_BRAND_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !brand ||
            !brand.id ||
            !(deliveryType === 'PREORDER'),
         variables: {
            where: {
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_DELIVERY' },
               },
               _or: [
                  {
                     brandLocationId: {
                        _in: brands_brand_location_aggregate?.nodes?.map(
                           x => x.id
                        ),
                     },
                  },
                  { brandId: { _eq: brand.id } },
               ],
               isActive: { _eq: true },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               setPreOrderBrandReoccurrence(data.brandRecurrences)
            }
         },
         onError: e => {
            console.log('preOrder brand recurrences error:::', e)
         },
      }
   )

   return {
      onDemandBrandRecurrence,
      preOrderBrandRecurrence,
      brands_brand_location_aggregate,
      brandRecurrencesLoading,
      preOrderBrandRecurrencesLoading,
      deliveryType,
      setDeliveryType,
      brandLocationsLoading,
      brandLocations: brands_brand_location_aggregate?.nodes,
   }
}

export { useDelivery }
