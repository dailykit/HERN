import _ from 'lodash'
import { getDistance, convertDistance } from 'geolib'
import {
   isStoreOnDemandDeliveryAvailable,
   isStorePreOrderDeliveryAvailable,
   isStorePreOrderPickupAvailable,
   isStoreOnDemandPickupAvailable,
   isStoreOnDemandDineInAvailable,
   isStorePreOrderDineInAvailable,
} from '.'

const fulfillmentStatus = fulfillmentType => {
   let type
   if (
      fulfillmentType === 'ONDEMAND_PICKUP' ||
      fulfillmentType === 'PREORDER_PICKUP'
   ) {
      type = 'pickupStatus'
      return type
   }
   if (
      fulfillmentType === 'ONDEMAND_DELIVERY' ||
      fulfillmentType === 'PREORDER_DELIVERY'
   ) {
      type = 'deliveryStatus'
      return type
   }
   if (
      fulfillmentType === 'ONDEMAND_DINEIN' ||
      fulfillmentType === 'SCHEDULED_DINEIN'
   ) {
      type = 'dineInStatus'
      return type
   }
}

const getSortedStoresByAerialDistance = async (brandLocations, address) => {
   console.log('address', address)
   // add arial distance
   const brandLocationsWithAerialDistance = await Promise.all(
      brandLocations.map(async eachStore => {
         const aerialDistance = getDistance(
            {
               latitude: address.latitude,
               longitude: address.longitude,
            },
            eachStore.location.locationAddress.locationCoordinates,
            0.1
         )
         const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
         eachStore['aerialDistance'] = parseFloat(
            aerialDistanceInMiles.toFixed(2)
         )
         eachStore['distanceUnit'] = 'mi'
         return eachStore
      })
   )
   // sort by aerial distance
   const sortedBrandLocationsWithAerialDistance = _.sortBy(
      brandLocationsWithAerialDistance,
      [x => x.aerialDistance]
   )
   return sortedBrandLocationsWithAerialDistance
}

export const getStoresWithValidations = async (
   brandLocations,
   brandRecurrences,
   fulfillmentType, // ONDEMAND_DELVIERY PREORDER_DELVIERY etc.
   address,
   autoSelect = false
) => {
   // return --> an array
   // array --> array[0] = store(s) with validation | array[1] fulfillmentStatus {deliveryStatus, pickupStatus, dineinStatus}

   const sortedStoresByAerialDistance = await getSortedStoresByAerialDistance(
      brandLocations,
      address
   )

   for (let i = 0; i < sortedStoresByAerialDistance.length; i++) {
      const storeLocationRecurrences = brandRecurrences.filter(
         x => x.brandLocationId === sortedStoresByAerialDistance[i].id
      )
      // getting brand recurrence by location [consist different brandLocation ids]

      const storeRecurrencesLength = storeLocationRecurrences.length

      // if there is brandLocationId in brandRecurrences we use only those brandRecurrences which has eachStore.id for particular eachStore other wise (brand level recurrences) we use reoccurrences which as brandLocationId == null

      const finalRecurrences =
         storeRecurrencesLength === 0
            ? brandRecurrences.filter(x => x.brandLocationId === null)
            : storeLocationRecurrences
      switch (fulfillmentType) {
         case 'ONDEMAND_DELIVERY':
            {
               if (finalRecurrences.length === 0) {
                  deliveryStatus = {
                     status: false,
                     message:
                        'Sorry, there is no store available for delivery.',
                  }
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = deliveryStatus
               } else {
                  const deliveryStatus = await isStoreOnDemandDeliveryAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i],
                     address
                  )
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = deliveryStatus
               }
            }
            break
         case 'PREORDER_DELIVERY':
            {
               if (finalRecurrences.length === 0) {
                  deliveryStatus = {
                     status: false,
                     message:
                        'Sorry, there is no store available for pre order delivery.',
                  }
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = deliveryStatus
               } else {
                  const deliveryStatus = await isStorePreOrderDeliveryAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i],
                     address
                  )
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = deliveryStatus
               }
            }
            break
         case 'ONDEMAND_PICKUP':
            {
               if (finalRecurrences.length === 0) {
                  pickupStatus = {
                     status: false,
                     message: 'Sorry, there is no store available for pickup.',
                  }
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = pickupStatus
               } else {
                  const pickupStatus = isStoreOnDemandPickupAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i]
                  )
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = pickupStatus
               }
            }
            break
         case 'PREORDER_PICKUP':
            {
               if (finalRecurrences.length === 0) {
                  pickupStatus = {
                     status: false,
                     message: 'Sorry, there is no store available for pickup.',
                  }
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = pickupStatus
               } else {
                  const pickupStatus = isStorePreOrderPickupAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i]
                  )
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = pickupStatus
               }
            }
            break
         case 'ONDEMAND_DINEIN':
            {
               if (finalRecurrences.length === 0) {
                  dineInStatus = {
                     status: false,
                     message: 'Sorry, there is no store available for dine in.',
                  }
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = dineInStatus
               } else {
                  const dineInStatus = isStoreOnDemandDineInAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i]
                  )
                  sortedStoresByAerialDistance[i][
                     fulfillmentStatus(fulfillmentType)
                  ] = dineInStatus
               }
            }
            break
         case 'SCHEDULED_DINEIN': {
            if (finalRecurrences.length === 0) {
               dineInStatus = {
                  status: false,
                  message: 'Sorry, there is no store available for dine in.',
               }
               sortedStoresByAerialDistance[i][
                  fulfillmentStatus(fulfillmentType)
               ] = dineInStatus
            } else {
               const dineInStatus = isStorePreOrderDineInAvailable(
                  finalRecurrences,
                  sortedStoresByAerialDistance[i]
               )
               sortedStoresByAerialDistance[i][
                  fulfillmentStatus(fulfillmentType)
               ] = dineInStatus
            }
         }
      }

      // when auto select true, check if there any store which available for consumer then return only that store as an array
      if (autoSelect) {
         if (
            sortedStoresByAerialDistance[i][fulfillmentStatus(fulfillmentType)]
               .status
         ) {
            return [
               [sortedStoresByAerialDistance[i]],
               fulfillmentStatus(fulfillmentType),
            ]
         }
      }
   }

   // when auto select true and no store available to select
   if (autoSelect) {
      return [[], fulfillmentStatus(fulfillmentType)]
   }

   return [sortedStoresByAerialDistance, fulfillmentStatus(fulfillmentType)]
}
