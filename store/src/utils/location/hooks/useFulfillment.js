import React, { useState, useEffect } from 'react'
import {
   GET_BRAND_LOCATION,
   BRAND_ONDEMAND_DELIVERY_RECURRENCES,
   ONDEMAND_DINE_BRAND_RECURRENCES,
   ONDEMAND_PICKUP_BRAND_RECURRENCES,
   PREORDER_DELIVERY_BRAND_RECURRENCES,
   PREORDER_PICKUP_BRAND_RECURRENCES,
   SCHEDULED_DINEIN_BRAND_RECURRENCES,
   BRAND_LOCATIONS,
} from '../../../graphql'
import { useConfig } from '../../../lib'
import { getStoresWithValidations } from '../'
import { useQuery } from '@apollo/react-hooks'

function useFulfillment(address, fulfillmentType) {
   console.log(
      'addressInFulfillment',
      address,
      fulfillmentType,
      fulfillmentType === 'ONDEMAND_DELIVERY',
      fulfillmentType === 'PREORDER_DELIVERY'
   )
   // 1. Auto-Select store (Address, FulfillmentType)
   // 2. Show inValid Stores (Address, FulfillmentType)
   // 3. Get ValidStores (Address, FulfillmentType)
   // 4. Get All stores (Address, FulfillmentType)
   // get all store when user address available

   // context
   const { orderTabs, brand } = useConfig()
   const [isFulfillmentLoading, setIsFulfillmentLoading] = useState(true)
   console.log('isFulfillmentLoading1', isFulfillmentLoading)
   const [
      onDemandDeliveryBrandRecurrence,
      setOnDemandDeliveryBrandReoccurrence,
   ] = useState(null)
   const [
      preOrderDeliveryBrandRecurrence,
      setPreOrderDeliveryBrandReoccurrence,
   ] = useState(null)
   const [onDemandPickupBrandRecurrence, setOnDemandPickupBrandReoccurrence] =
      useState(null)
   const [preOrderPickupBrandRecurrence, setPreOrderPickupBrandReoccurrence] =
      useState(null)
   const [onDemandDineinBrandRecurrence, setOnDemandDineinBrandReoccurrence] =
      useState(null)
   const [preOrderDineinBrandRecurrence, setPreOrderDineinBrandReoccurrence] =
      useState(null)
   const [brandLocations, setBrandLocations] = useState(null)

   const [
      deliverableBrandLocationsLoading,
      setDeliverableBrandLocationsLoading,
   ] = useState(true)

   // get all store
   const { loading: allAvailableStoreLoading, error: allAvailableStoreError } =
      useQuery(GET_BRAND_LOCATION, {
         skip: !(brand || brand.id),
         variables: {
            where: {
               brandId: {
                  _eq: brand.id,
               },
            },
         },
         onCompleted: ({ brands_brand_location = [] }) => {
            setBrandLocations(brands_brand_location)
            if (brands_brand_location.length !== 0) {
               setBrandLocations(brands_brand_location)
            }
         },
         onError: error => {
            console.log('getBrandLocationError', error)
         },
      })

   // this data use for only delivery
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
               setDeliverableBrandLocationsLoading(false)
            }
         },
         onError: error => {
            console.log(error)
         },
      }
   )

   // onDemand delivery recurrences
   const { loading: onDemandDeliveryBrandRecurrenceLoading } = useQuery(
      BRAND_ONDEMAND_DELIVERY_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !brand ||
            !brand.id ||
            !(fulfillmentType === 'ONDEMAND_DELIVERY'),
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
               setOnDemandDeliveryBrandReoccurrence(data.brandRecurrences)
               setIsFulfillmentLoading(false)
            }
         },
         onError: e => {
            console.log('Ondemand brand recurrences error:::', e)
         },
      }
   )

   // preOrderDelivery recurrences
   const { loading: preOrderDeliveryBrandRecurrenceLoading } = useQuery(
      PREORDER_DELIVERY_BRAND_RECURRENCES,
      {
         skip:
            !brands_brand_location_aggregate?.nodes ||
            !brands_brand_location_aggregate?.nodes.length > 0 ||
            !brand ||
            !brand.id ||
            !(fulfillmentType === 'PREORDER_DELIVERY'),
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
               setPreOrderDeliveryBrandReoccurrence(data.brandRecurrences)
               setIsFulfillmentLoading(false)
            }
         },
         onError: e => {
            console.log('preOrder brand recurrences error:::', e)
         },
      }
   )

   // ondemand pickup recurrences
   const { loading: onDemandPickupRecurrenceLoading } = useQuery(
      ONDEMAND_PICKUP_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id || !(fulfillmentType === 'ONDEMAND_PICKUP'),
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_PICKUP' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            console.log('ondemandPickup', data)
            if (data) {
               setOnDemandPickupBrandReoccurrence(data.brandRecurrences)
               setIsFulfillmentLoading(false)
            }
         },
      }
   )

   // preorder pickup recurrences
   const { loading: preOrderPickRecurrencesLoading } = useQuery(
      PREORDER_PICKUP_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id || !(fulfillmentType === 'PREORDER_PICKUP'),
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'PREORDER_PICKUP' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            console.log('PREoRDER', data)
            if (data) {
               setPreOrderPickupBrandReoccurrence(data.brandRecurrences)
               setIsFulfillmentLoading(false)
            }
         },
      }
   )

   const { loading: onDemandDineinRecurrenceLoading } = useQuery(
      ONDEMAND_DINE_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id || !(fulfillmentType === 'ONDEMAND_DINEIN'),
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'ONDEMAND_DINEIN' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            console.log('ondemandDineIn', data)
            if (data) {
               setOnDemandDineinBrandReoccurrence(data.brandRecurrences)
               setIsFulfillmentLoading(false)
            }
         },
      }
   )
   const { loading: preOrderDineinRecurrencesLoading } = useQuery(
      SCHEDULED_DINEIN_BRAND_RECURRENCES,
      {
         skip: !brand || !brand.id || !(fulfillmentType === 'SCHEDULED_DINEIN'),
         variables: {
            where: {
               isActive: { _eq: true },
               recurrence: {
                  isActive: { _eq: true },
                  type: { _eq: 'SCHEDULED_DINEIN' },
               },
               brandId: { _eq: brand.id },
            },
         },
         onCompleted: data => {
            console.log('preorderDineIn', data)
            if (data) {
               setPreOrderDineinBrandReoccurrence(data.brandRecurrences)
               setIsFulfillmentLoading(false)
            }
         },
      }
   )

   const brandRecurrences = React.useMemo(() => {
      switch (fulfillmentType) {
         case 'ONDEMAND_DELIVERY':
            return onDemandDeliveryBrandRecurrence
         case 'PREORDER_DELIVERY':
            return preOrderDeliveryBrandRecurrence
         case 'ONDEMAND_PICKUP':
            return onDemandPickupBrandRecurrence
         case 'PREORDER_PICKUP':
            return preOrderPickupBrandRecurrence
         case 'ONDEMAND_DINEIN':
            return onDemandDineinBrandRecurrence
         case 'PREORDER_DINEIN':
            return preOrderDineinBrandRecurrence
      }
   }, [
      fulfillmentType,
      onDemandDeliveryBrandRecurrence,
      preOrderDeliveryBrandRecurrence,
   ])

   const autoSelectStore = async () => {
      return await getStoresWithValidations(
         brandLocations,
         brandRecurrences,
         fulfillmentType,
         address,
         true // true--> autoSelectStore
      )
   }

   const getInvalidStores = async (address, fulfillmentType) => {
      const [stores, fulfillmentStatus] = await getStoresWithValidations(
         brandLocations,
         brandRecurrences,
         fulfillmentType,
         address,
         false // false--> autoSelectStore
      )
      const inValidStores = stores.filter(
         store => !store.fulfillmentStatus.status
      )
      return [inValidStores, fulfillmentStatus]
   }

   const getValidStores = async (address, fulfillmentType) => {
      const stores = await getStoresWithValidations(
         brandLocations,
         brandRecurrences,
         fulfillmentType,
         address,
         false // false--> autoSelectStore
      )
      const validStores = stores.filter(store => store.fulfillmentStatus.status)
      return [validStores, fulfillmentStatus]
   }

   const getAllStoresWithValidation = async (address, fulfillmentType) => {
      return await getStoresWithValidations(
         brandLocations,
         brandRecurrences,
         fulfillmentType,
         address,
         false // false--> autoSelectStore
      )
   }

   return {
      allAvailableStoreLoading,
      onDemandDeliveryBrandRecurrenceLoading,
      preOrderDeliveryBrandRecurrenceLoading,
      onDemandPickupRecurrenceLoading,
      preOrderPickRecurrencesLoading,
      onDemandDineinRecurrenceLoading,
      preOrderDineinRecurrencesLoading,
      brands_brand_location_aggregate,
      deliverableBrandLocationsLoading,
      autoSelectStore,
      getAllStoresWithValidation,
      getValidStores,
      getInvalidStores,
      isFulfillmentLoading,
      setIsFulfillmentLoading,
   }
}

export { useFulfillment }
