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
import { graphQLClientSide } from '../../../lib'
import { GET_ALL_RECURRENCES, GET_BRAND_LOCATION } from '../../../graphql'
import { isClient } from '../../index'

const getSortedStoresByAerialDistance = async (brandLocations, address) => {
   console.log('address', address, brandLocations)
   if (!address && brandLocations.length === 1) {
      return brandLocations
   }
   // add arial distance
   const brandLocationsWithAerialDistance = await Promise.all(
      brandLocations.map(async eachStore => {
         const aerialDistance = getDistance(
            {
               latitude: address.latitude,
               longitude: address.longitude,
            },
            {
               latitude: eachStore.location.lat,
               longitude: eachStore.location.lng,
            },
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

export const getStoresWithValidations = async props => {
   const {
      brand,
      locationId = null,
      fulfillmentType, // ONDEMAND_DELVIERY PREORDER_DELVIERY etc.
      address,
      autoSelect = false,
      includeInvalidStore = false,
   } = props
   // fulfillmentStatus {deliveryStatus, pickupStatus, dineinStatus}
   if (!isClient) {
      return []
   }
   // get all store for brand
   const { brandLocations } = await graphQLClientSide.request(
      GET_BRAND_LOCATION,
      {
         where: {
            brandId: {
               _eq: brand.id,
            },
            ...(locationId && { locationId: { _eq: locationId } }),
         },
      }
   )

   // get all store which are deliverable
   const { brandLocations: deliverableBrandLocations = [] } =
      await graphQLClientSide.request(GET_BRAND_LOCATION, {
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
            ...(locationId || { locationId: { _eq: locationId } }),
         },
      })

   const { brandRecurrences } = await graphQLClientSide.request(
      GET_ALL_RECURRENCES,
      {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: fulfillmentType },
            },
            _or: [
               {
                  brandLocationId: {
                     _in: deliverableBrandLocations.map(x => x.id),
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      }
   )

   const sortedStoresByAerialDistance = await getSortedStoresByAerialDistance(
      brandLocations,
      address
   )
   const sortedStoresByAerialDistanceWithValidation = []

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
                  const deliveryStatus = {
                     status: false,
                     message:
                        'Sorry, there is no store available for delivery.',
                  }
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     deliveryStatus
               } else {
                  const deliveryStatus = await isStoreOnDemandDeliveryAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i],
                     address
                  )
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     deliveryStatus
               }
            }
            break
         case 'PREORDER_DELIVERY':
            {
               if (finalRecurrences.length === 0) {
                  const deliveryStatus = {
                     status: false,
                     message:
                        'Sorry, there is no store available for pre order delivery.',
                  }
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     deliveryStatus
               } else {
                  const deliveryStatus = await isStorePreOrderDeliveryAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i],
                     address
                  )
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     deliveryStatus
               }
            }
            break
         case 'ONDEMAND_PICKUP':
            {
               if (finalRecurrences.length === 0) {
                  const pickupStatus = {
                     status: false,
                     message: 'Sorry, there is no store available for pickup.',
                  }
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     pickupStatus
               } else {
                  const pickupStatus = isStoreOnDemandPickupAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i]
                  )
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     pickupStatus
               }
            }
            break
         case 'PREORDER_PICKUP':
            {
               if (finalRecurrences.length === 0) {
                  const pickupStatus = {
                     status: false,
                     message: 'Sorry, there is no store available for pickup.',
                  }
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     pickupStatus
               } else {
                  const pickupStatus = isStorePreOrderPickupAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i]
                  )
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     pickupStatus
               }
            }
            break
         case 'ONDEMAND_DINEIN':
            {
               if (finalRecurrences.length === 0) {
                  const dineInStatus = {
                     status: false,
                     message: 'Sorry, there is no store available for dine in.',
                  }
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     dineInStatus
               } else {
                  const dineInStatus = isStoreOnDemandDineInAvailable(
                     finalRecurrences,
                     sortedStoresByAerialDistance[i]
                  )
                  sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                     dineInStatus
               }
            }
            break
         case 'SCHEDULED_DINEIN': {
            if (finalRecurrences.length === 0) {
               const dineInStatus = {
                  status: false,
                  message: 'Sorry, there is no store available for dine in.',
               }
               sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                  dineInStatus
            } else {
               const dineInStatus = isStorePreOrderDineInAvailable(
                  finalRecurrences,
                  sortedStoresByAerialDistance[i]
               )
               sortedStoresByAerialDistance[i]['fulfillmentStatus'] =
                  dineInStatus
            }
         }
      }

      // when auto select true, check if there any store which available for consumer then return only that store as an array
      if (autoSelect && !includeInvalidStore) {
         if (sortedStoresByAerialDistance[i]['fulfillmentStatus'].status) {
            sortedStoresByAerialDistanceWithValidation.push(
               sortedStoresByAerialDistance[i]
            )
            break
         }
      } else {
         if (sortedStoresByAerialDistance[i]['fulfillmentStatus'].status) {
            sortedStoresByAerialDistanceWithValidation.push(
               sortedStoresByAerialDistance[i]
            )
         } else {
            if (includeInvalidStore) {
               sortedStoresByAerialDistanceWithValidation.push(
                  sortedStoresByAerialDistance[i]
               )
            }
         }
      }
   }

   return sortedStoresByAerialDistanceWithValidation
}
