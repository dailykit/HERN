import { rrulestr } from 'rrule'
import { isPointInPolygon } from 'geolib'
import { isClient, get_env } from '../../index'
import axios from 'axios'

// return delivery status of store (with recurrences, mileRange info, timeSlot info and drivable distance if store available for on demand delivery)
export const isStoreOnDemandDeliveryAvailable = async (
   finalRecurrences,
   eachStore,
   address
) => {
   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      const end = new Date(now.getTime() + 1000 * 60 * 60 * 24) // tomorrow
      const dates = rrulestr(finalRecurrences[rec].recurrence.rrule).between(
         start,
         now
      )
      if (dates.length) {
         if (finalRecurrences[rec].recurrence.timeSlots.length) {
            for (let timeslot of finalRecurrences[rec].recurrence.timeSlots) {
               if (timeslot.mileRanges.length) {
                  const timeslotFromArr = timeslot.from.split(':')
                  const timeslotToArr = timeslot.to.split(':')
                  const fromTimeStamp = new Date(now.getTime())
                  fromTimeStamp.setHours(
                     timeslotFromArr[0],
                     timeslotFromArr[1],
                     timeslotFromArr[2]
                  )
                  const toTimeStamp = new Date(now.getTime())
                  toTimeStamp.setHours(
                     timeslotToArr[0],
                     timeslotToArr[1],
                     timeslotToArr[2]
                  )
                  // check if current time falls within time slot

                  if (
                     now.getTime() > fromTimeStamp.getTime() &&
                     now.getTime() < toTimeStamp.getTime()
                  ) {
                     const distanceDeliveryStatus =
                        await isStoreDeliveryAvailableByDistance(
                           timeslot.mileRanges,
                           eachStore,
                           address
                        )

                     const { aerial, drivable, zipcode, geoBoundary } =
                        distanceDeliveryStatus.result
                     const status = aerial && drivable && zipcode && geoBoundary

                     if (status || rec == finalRecurrences.length - 1) {
                        return {
                           status,
                           result: distanceDeliveryStatus.result,
                           rec: finalRecurrences[rec],
                           mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                           timeSlotInfo: timeslot,
                           message: status
                              ? 'Delivery available in your location'
                              : 'Delivery not available in your location.',
                           drivableDistance:
                              distanceDeliveryStatus.drivableDistance,
                        }
                     }
                  } else {
                     if (rec == finalRecurrences.length - 1) {
                        return {
                           status: false,
                           message:
                              'Sorry, We do not offer Delivery at this time.',
                        }
                     }
                  }
               }
            }
         } else {
            if (rec == finalRecurrences.length - 1) {
               return {
                  status: false,
                  message: 'Sorry, We do not offer Delivery at this time.',
               }
            }
         }
      } else {
         if (rec == finalRecurrences.length - 1) {
            return {
               status: false,
               message: 'Sorry, We do not offer Delivery on this day.',
            }
         }
      }
   }
}

// return delivery status of store (with recurrences, mileRange info, timeSlot info and drivable distance if store available for pre order delivery)
export const isStorePreOrderDeliveryAvailable = async (
   finalRecurrences,
   eachStore,
   address
) => {
   let fulfilledRecurrences = []
   for (let rec in finalRecurrences) {
      for (let timeslot of finalRecurrences[rec].recurrence.timeSlots) {
         if (timeslot.mileRanges.length) {
            const distanceDeliveryStatus =
               await isStoreDeliveryAvailableByDistance(
                  timeslot.mileRanges,
                  eachStore,
                  address
               )
            const { aerial, drivable, zipcode, geoBoundary } =
               distanceDeliveryStatus.result
            const status = aerial && drivable && zipcode && geoBoundary
            if (status) {
               fulfilledRecurrences = [
                  ...fulfilledRecurrences,
                  finalRecurrences[rec],
               ]
            }
            if (
               rec == finalRecurrences.length - 1 &&
               fulfilledRecurrences.length > 0
            ) {
               return {
                  status,
                  result: distanceDeliveryStatus.result,
                  rec: fulfilledRecurrences,
                  mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                  timeSlotInfo: timeslot,
                  message: status
                     ? 'Pre Order Delivery available in your location'
                     : 'Delivery not available in your location.',
                  drivableDistance: distanceDeliveryStatus.drivableDistance,
               }
            } else {
               if (rec == finalRecurrences.length - 1) {
                  return {
                     status: false,
                     message:
                        'Sorry, you seem to be placed far out of our delivery range.',
                  }
               }
            }
         }
      }
   }
}

const isStoreDeliveryAvailableByDistance = async (
   mileRanges,
   eachStore,
   address
) => {
   const userLocation = { ...address }
   console.log('userLocation', userLocation)
   let isStoreDeliveryAvailableByDistanceStatus = {
      aerial: true,
      drivable: true,
      zipcode: true,
      geoBoundary: true,
   }
   let drivableByGoogleDistance = null
   for (let mileRange in mileRanges) {
      // aerial distance
      if (mileRanges[mileRange].distanceType === 'aerial') {
         const aerialDistance = mileRanges[mileRange]
         let result =
            eachStore.aerialDistance >= aerialDistance.from &&
            eachStore.aerialDistance <= aerialDistance.to
         if (result) {
            isStoreDeliveryAvailableByDistanceStatus['aerial'] =
               result && !mileRanges[mileRange].isExcluded
         } else {
            isStoreDeliveryAvailableByDistanceStatus['aerial'] = result
         }
      }
      // drivable distance
      if (mileRanges[mileRange].distanceType === 'drivable') {
         try {
            const origin = isClient ? window.location.origin : ''
            const url = `${origin}/server/api/distance-matrix`
            const postLocationData = {
               key: get_env('GOOGLE_API_KEY'),
               lat1: userLocation.latitude,
               lon1: userLocation.longitude,
               lat2: eachStore.location.lat,
               lon2: eachStore.location.lng,
            }
            const { data } = await axios.post(url, postLocationData)
            const drivableDistance = mileRanges[mileRange]
            const distanceMileFloat =
               data.rows[0].elements[0].distance.text.split(' ')[0]
            drivableByGoogleDistance = distanceMileFloat
            let result =
               distanceMileFloat >= drivableDistance.from &&
               distanceMileFloat <= drivableDistance.to
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['drivable'] =
                  result && !mileRanges[mileRange].isExcluded
            } else {
               isStoreDeliveryAvailableByDistanceStatus['drivable'] = result
            }
         } catch (error) {
            console.log('getDataWithDrivableDistance', error)
         }
      }

      // zip code
      if (
         mileRanges[mileRange].zipcodes === null ||
         mileRanges[mileRange].zipcodes
      ) {
         // assuming null as true
         if (mileRanges[mileRange].zipcodes === null) {
            isStoreDeliveryAvailableByDistanceStatus['zipcode'] = true
         } else {
            const zipcodes = mileRanges[mileRange].zipcodes.zipcodes
            let result = Boolean(
               zipcodes.find(x => x == parseInt(userLocation.address.zipcode))
            )
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['zipcode'] =
                  result && !mileRanges[mileRange].isExcluded
            } else {
               isStoreDeliveryAvailableByDistanceStatus['zipcode'] = result
            }
         }
      }
      // geoBoundary
      if (
         mileRanges[mileRange].geoBoundary === null ||
         mileRanges[mileRange].geoBoundary
      ) {
         // assuming null as true
         if (mileRanges[mileRange].geoBoundary === null) {
            isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = true
         } else {
            const geoBoundaries =
               mileRanges[mileRange].geoBoundary.geoBoundaries
            const storeValidationForGeoBoundaries = isPointInPolygon(
               {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
               },
               geoBoundaries
            )

            let result = storeValidationForGeoBoundaries
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] =
                  result && !mileRanges[mileRange].isExcluded
            } else {
               isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = result
            }
         }
      }
      if (
         isStoreDeliveryAvailableByDistanceStatus.aerial &&
         isStoreDeliveryAvailableByDistanceStatus.drivable &&
         isStoreDeliveryAvailableByDistanceStatus.zipcode &&
         isStoreDeliveryAvailableByDistanceStatus.geoBoundary
      ) {
         return {
            result: isStoreDeliveryAvailableByDistanceStatus,
            mileRangeInfo: mileRanges[mileRange],
         }
      }
   }
   return {
      result: isStoreDeliveryAvailableByDistanceStatus,
      mileRangeInfo: null,
      drivableDistance: drivableByGoogleDistance,
   }
}
