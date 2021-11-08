import { rrulestr } from 'rrule'
import { isPointInPolygon } from 'geolib'

export const isStoreDeliveryAvailable = (brandRecurrences, eachStore) => {
   const storeLocationRecurrences = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   // getting brand recurrence by location [consist different brandLocation ids]

   const storeRecurrencesLength = storeLocationRecurrences.length

   // if there is brandLocationId in brandRecurrences we use only those brandRecurrences which has eachStore.id for particular eachStore other wise (brand level recurrences) we use reoccurrences which as brandLocationId == null
   const finalRecurrences =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrences

   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      const end = new Date(now.getTime() + 1000 * 60 * 60 * 24) // tomorrow
      const dates = rrulestr(finalRecurrences[rec].recurrence.rrule).between(
         start,
         now
      )
      console.log('dates', dates)
      console.log('dates', finalRecurrences)
      if (dates.length) {
         if (brandRecurrences[rec].recurrence.timeSlots.length) {
            for (let timeslot of brandRecurrences[rec].recurrence.timeSlots) {
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
                  console.log(
                     'dates',
                     now.getTime() > fromTimeStamp.getTime() &&
                        now.getTime() < toTimeStamp.getTime()
                  )
                  if (
                     now.getTime() > fromTimeStamp.getTime() &&
                     now.getTime() < toTimeStamp.getTime()
                  ) {
                     const distanceDeliveryStatus =
                        isStoreDeliveryAvailableByDistance(
                           timeslot.mileRanges,
                           eachStore
                        )
                     const { aerial, geoBoundary, zipcode } =
                        distanceDeliveryStatus
                     console.log(
                        (aerial && geoBoundary && zipcode) ||
                           rec == finalRecurrences.length - 1,
                        'dele'
                     )
                     if (
                        (aerial && geoBoundary && zipcode) ||
                        rec == finalRecurrences.length - 1
                     ) {
                        return distanceDeliveryStatus
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

const isStoreDeliveryAvailableByDistance = (mileRanges, eachStore) => {
   let isStoreDeliveryAvailableByDistanceStatus = {
      aerial: false,
      //   drivable: false,
      zipcode: false,
      geoBoundary: false,
   }

   for (let mileRange in mileRanges) {
      // aerial distance
      if (mileRanges[mileRange].distanceType === 'aerial') {
         const aerialDistance = mileRanges[mileRange]
         let result =
            eachStore.aerialDistance >= aerialDistance.from &&
            eachStore.aerialDistance <= aerialDistance.to
         if (result) {
            result = !mileRanges[mileRange].isExcluded
            isStoreDeliveryAvailableByDistanceStatus['aerial'] = result
         }
      }
      // drivable distance
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
            let result =
               Boolean(zipcodes.find(x => x == eachStore.location.zipcode)) &&
               !mileRanges[mileRange].isExcluded
            if (result) {
               result = !mileRanges[mileRange].isExcluded
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
         console.log('inGeoBoundryBefore')
         if (mileRanges[mileRange].geoBoundary === null) {
            console.log('inGeoBoundry')
            isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = true
         } else {
            console.log('inGeoBoundryElse')

            const geoBoundaries =
               mileRanges[mileRange].geoBoundary.geoBoundaries
            const storeValidationForGeoBoundaries = isPointInPolygon(
               {
                  latitude: eachStore.location.lat,
                  longitude: eachStore.location.lng,
               },
               geoBoundaries
            )
            if (storeValidationForGeoBoundaries) {
               result = !mileRanges[mileRange].isExcluded
               isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = result
            }
         }
      }
   }
   return {
      status: true,
      result: isStoreDeliveryAvailableByDistanceStatus,
   }
}
