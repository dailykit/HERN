import { rrulestr } from 'rrule'
import { isPointInPolygon } from 'geolib'
import { isClient, get_env } from './index'
import axios from 'axios'

export const isStoreOnDemandDeliveryAvailable = async (
   brandRecurrences,
   eachStore
) => {
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
                           eachStore
                        )

                     const { aerial, drivable, zipcode, geoBoundary } =
                        distanceDeliveryStatus.result
                     const status = aerial && drivable && zipcode && geoBoundary

                     if (status || rec == finalRecurrences.length - 1) {
                        return { status, result: distanceDeliveryStatus.result }
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

export const isPreOrderDeliveryAvailable = async (
   brandRecurrences,
   eachStore
) => {
   // this fn use for pre order delivery
   // bcz in pre order we need not to validate time (check either store available by distance or not)
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
   if (finalRecurrences.length === 0) {
      return {
         status: false,
         message: 'Sorry, there is no store available for pickup.',
      }
   } else {
      for (let rec in finalRecurrences) {
         for (let timeslot of finalRecurrences[rec].recurrence.timeSlots) {
            if (timeslot.mileRanges.length) {
               const distanceDeliveryStatus =
                  await isStoreDeliveryAvailableByDistance(
                     timeslot.mileRanges,
                     eachStore
                  )
               const { aerial, drivable, zipcode, geoBoundary } =
                  distanceDeliveryStatus.result
               const status = aerial && drivable && zipcode && geoBoundary

               if (status || rec == finalRecurrences.length - 1) {
                  return { status, result: distanceDeliveryStatus.result }
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

const isStoreDeliveryAvailableByDistance = async (mileRanges, eachStore) => {
   const userLocation = JSON.parse(localStorage.getItem('userLocation'))
   let isStoreDeliveryAvailableByDistanceStatus = {
      aerial: true,
      drivable: true,
      zipcode: true,
      geoBoundary: true,
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
            let result =
               distanceMileFloat >= drivableDistance.from &&
               distanceMileFloat <= drivableDistance.to
            if (result) {
               result = !mileRanges[mileRange].isExcluded
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

            let result =
               storeValidationForGeoBoundaries &&
               !mileRanges[mileRange].isExcluded
            if (storeValidationForGeoBoundaries) {
               result = !mileRanges[mileRange].isExcluded
               isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = result
            }
         }
      }
   }
   return {
      result: isStoreDeliveryAvailableByDistanceStatus,
   }
}

export const isStoreOnDemandPickupAvailable = (brandRecurrences, eachStore) => {
   // there is no need for checking validation for store mile ranges bcz user will pick up form store

   // only store timing will matter

   // filter store which as there specific brandRecurrences (those brand recurrences where location id not null)
   const storeLocationRecurrences = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   const storeRecurrencesLength = storeLocationRecurrences.length

   // if there is no brandRecurrences where brandLocation is not null then take available brandRecurrences for brand
   const finalRecurrences =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrences

   // there is no recurrences available for store
   if (finalRecurrences.length === 0) {
      return {
         status: false,
         message: 'Sorry, there is no store available for pickup.',
      }
   } else {
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
               for (let timeslot of finalRecurrences[rec].recurrence
                  .timeSlots) {
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
                     if (rec == finalRecurrences.length - 1) {
                        return {
                           status: true,
                           message: 'Store available for pickup.',
                        }
                     }
                  } else {
                     if (rec == finalRecurrences.length - 1) {
                        return {
                           status: false,
                           message:
                              'Sorry, We do not offer Pickup at this time.',
                        }
                     }
                  }
               }
            } else {
               if (rec == finalRecurrences.length - 1) {
                  return {
                     status: false,
                     message: 'Sorry, We do not offer Pickup at this time.',
                  }
               }
            }
         } else {
            if (rec == finalRecurrences.length - 1) {
               return {
                  status: false,
                  message: 'Sorry, We do not offer Pickup on this day.',
               }
            }
         }
      }
   }
}
export const isStorePreOrderPickupAvailable = (brandRecurrences, eachStore) => {
   // there is no need for check mile ranges as well as timing

   // recurrences for specific location
   const storeLocationRecurrences = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   const storeRecurrencesLength = storeLocationRecurrences.length

   // final recurrences by specific location or brand recurrences
   const finalRecurrences =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrences

   if (finalRecurrences.length === 0) {
      return {
         status: false,
         message: 'Sorry, there is no store available for pre order pickup.',
      }
   } else {
      return {
         status: true,
         message: 'Store available for pre order pre order pickup.',
      }
   }
}
export const isStoreOnDemandDineInAvailable = (brandRecurrences, eachStore) => {
   // same as onDemand pick up
   const storeLocationRecurrences = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   const storeRecurrencesLength = storeLocationRecurrences.length

   const finalRecurrences =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrences
   if (finalRecurrences.length === 0) {
      return {
         status: false,
         message: 'Sorry, there is no store available for dine in.',
      }
   } else {
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
               for (let timeslot of finalRecurrences[rec].recurrence
                  .timeSlots) {
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
                     if (rec == finalRecurrences.length - 1) {
                        return {
                           status: true,
                           message: 'Store available for Dine In.',
                        }
                     }
                  } else {
                     if (rec == finalRecurrences.length - 1) {
                        return {
                           status: false,
                           message:
                              'Sorry, We do not offer Dine In at this time.',
                        }
                     }
                  }
               }
            } else {
               if (rec == finalRecurrences.length - 1) {
                  return {
                     status: false,
                     message: 'Sorry, We do not offer Dine In at this time.',
                  }
               }
            }
         } else {
            if (rec == finalRecurrences.length - 1) {
               return {
                  status: false,
                  message: 'Sorry, We do not offer Dine In on this day.',
               }
            }
         }
      }
   }
}

export const isStorePreOrderDineInAvailable = (brandRecurrences, eachStore) => {
   // same as preOrder pickup
   const storeLocationRecurrences = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   const storeRecurrencesLength = storeLocationRecurrences.length

   const finalRecurrences =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrences
   if (finalRecurrences.length === 0) {
      return {
         status: false,
         message: 'Sorry, there is no store available for dine in.',
      }
   } else {
      return {
         status: true,
         message: 'Store available for pre order dine in.',
      }
   }
}
