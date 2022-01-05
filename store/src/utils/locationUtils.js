import { rrulestr } from 'rrule'
import { isPointInPolygon } from 'geolib'
import { isClient, get_env } from './index'
import axios from 'axios'
import _, { each } from 'lodash'
import { formatISO, add } from 'date-fns'
import { getDistance, convertDistance } from 'geolib'

export const getMinutes = time => {
   return parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
}

export const makeDoubleDigit = num => {
   if (num.toString().length === 1) {
      return '0' + num
   } else {
      return num
   }
}

export const getTimeFromMinutes = num => {
   const hours = num / 60
   const rhours = Math.floor(hours)
   const minutes = (hours - rhours) * 60
   const rminutes = Math.round(minutes)
   return makeDoubleDigit(rhours) + ':' + makeDoubleDigit(rminutes)
}
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
                        return {
                           status,
                           result: distanceDeliveryStatus.result,
                           rec: finalRecurrences[rec],
                           mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                           timeSlotInfo: timeslot,
                           message: status
                              ? 'Delivery available in your location'
                              : 'Delivery not available in your location.',
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
                  return {
                     status,
                     result: distanceDeliveryStatus.result,
                     rec: finalRecurrences[rec],
                     mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                     timeSlotInfo: timeslot,
                     message: status
                        ? 'Delivery available in your location'
                        : 'Delivery not available in your location.',
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
            eachStore.aerialDistance <= aerialDistance.to &&
            !mileRanges[mileRange].isExcluded

         isStoreDeliveryAvailableByDistanceStatus['aerial'] = result
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
               distanceMileFloat <= drivableDistance.to &&
               !mileRanges[mileRange].isExcluded

            isStoreDeliveryAvailableByDistanceStatus['drivable'] = result
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

            isStoreDeliveryAvailableByDistanceStatus['zipcode'] =
               result && !mileRanges[mileRange].isExcluded
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

            isStoreDeliveryAvailableByDistanceStatus['geoBoundary'] = result
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
                           rec: finalRecurrences[rec],
                           timeSlotInfo: timeslot,
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
         rec: finalRecurrences,
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

export const combineRecurrenceAndBrandLocation = (
   eachStore,
   brandRecurrences
) => {
   const storeLocationRecurrence = brandRecurrences.filter(
      x => x.brandLocationId === eachStore.id
   )

   // getting brand recurrence by location [consist different brandLocation ids]

   const storeRecurrencesLength = storeLocationRecurrence.length

   // if there is brandLocationId in brandRecurrences we use only those brandRecurrences which has eachStore.id for particular eachStore other wise (brand level recurrences) we use reoccurrences which as brandLocationId == null
   const finalBrandLocationRecurrence =
      storeRecurrencesLength === 0
         ? brandRecurrences.filter(x => x.brandLocationId === null)
         : storeLocationRecurrence

   const finalBrandRecurrence = brandRecurrences.filter(
      x => x.brandId === eachStore.brandId
   )

   if (finalBrandLocationRecurrence.length === 0) {
      eachStore.recurrences = finalBrandRecurrence
      return eachStore.recurrences[0].recurrence
   } else {
      eachStore.recurrences = finalBrandLocationRecurrence
      return eachStore.recurrences[0].recurrence
   }
}
export const generateDeliverySlots = recurrences => {
   console.log('recurrences', recurrences)
   let data = []
   for (let rec of recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      // const start = now;
      const end = new Date(now.getTime() + 7 * 1000 * 60 * 60 * 24) // 7 days later
      const dates = rrulestr(rec.rrule).between(start, end)
      dates.forEach(date => {
         if (rec.timeSlots.length) {
            rec.timeSlots.forEach(timeslot => {
               // if multiple mile ranges, only first one will be taken
               if (timeslot.mileRanges.length) {
                  const leadTime = timeslot.mileRanges[0].leadTime
                  const [fromHr, fromMin, fromSec] = timeslot.from.split(':')
                  const [toHr, toMin, toSec] = timeslot.to.split(':')
                  const fromTimeStamp = new Date(
                     date.setHours(fromHr, fromMin, fromSec)
                  )
                  const toTimeStamp = new Date(
                     date.setHours(toHr, toMin, toSec)
                  )
                  // start + lead time < to
                  const leadMiliSecs = leadTime * 60000
                  if (now.getTime() + leadMiliSecs < toTimeStamp.getTime()) {
                     // if start + lead time > from -> set new from time
                     let slotStart
                     let slotEnd =
                        toTimeStamp.getHours() + ':' + toTimeStamp.getMinutes()
                     if (
                        now.getTime() + leadMiliSecs >
                        fromTimeStamp.getTime()
                     ) {
                        // new start time = lead time + now
                        const newStartTimeStamp = new Date(
                           now.getTime() + leadMiliSecs
                        )
                        slotStart =
                           newStartTimeStamp.getHours() +
                           ':' +
                           newStartTimeStamp.getMinutes()
                     } else {
                        slotStart =
                           fromTimeStamp.getHours() +
                           ':' +
                           fromTimeStamp.getMinutes()
                     }
                     // check if date already in slots
                     const dateWithoutTime = date.toDateString()
                     const index = data.findIndex(
                        slot => slot.date === dateWithoutTime
                     )
                     if (index === -1) {
                        data.push({
                           date: dateWithoutTime,
                           slots: [
                              {
                                 start: slotStart,
                                 end: slotEnd,
                                 mileRangeId: timeslot.mileRanges[0].id,
                              },
                           ],
                        })
                     } else {
                        data[index].slots.push({
                           start: slotStart,
                           end: slotEnd,
                           mileRangeId: timeslot.mileRanges[0].id,
                        })
                     }
                  }
               } else {
                  return {
                     status: false,
                     message:
                        'Sorry, you seem to be placed far out of our delivery range.',
                  }
               }
            })
         } else {
            return { status: false, message: 'Sorry! No time slots available.' }
         }
      })
   }
   return { status: true, data }
}

export const generateMiniSlots = (data, size) => {
   console.log('miniSlots', data)
   let newData = []
   data.forEach(el => {
      el.slots.forEach(slot => {
         const startMinutes = getMinutes(slot.start)
         const endMinutes = getMinutes(slot.end)
         let startPoint = startMinutes
         while (startPoint < endMinutes) {
            const index = newData.findIndex(datum => datum.date === el.date)
            if (index === -1) {
               newData.push({
                  date: el.date,
                  slots: [{ time: getTimeFromMinutes(startPoint), ...slot }],
               })
            } else {
               newData[index].slots.push({
                  time: getTimeFromMinutes(startPoint),
                  ...slot,
               })
            }
            startPoint = startPoint + size
         }
      })
   })
   return newData
}
export const generatePickUpSlots = recurrences => {
   console.log('recurrences', recurrences)
   let data = []
   recurrences.forEach(rec => {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      // const start = now;
      const end = new Date(now.getTime() + 6 * 1000 * 60 * 60 * 24) // 7 days later
      const dates = rrulestr(rec.rrule).between(start, end)
      dates.forEach(date => {
         if (rec.timeSlots.length) {
            rec.timeSlots.forEach(timeslot => {
               const timeslotFromArr = timeslot.from.split(':')
               const timeslotToArr = timeslot.to.split(':')
               const fromTimeStamp = new Date(
                  date.setHours(
                     timeslotFromArr[0],
                     timeslotFromArr[1],
                     timeslotFromArr[2]
                  )
               )
               const toTimeStamp = new Date(
                  date.setHours(
                     timeslotToArr[0],
                     timeslotToArr[1],
                     timeslotToArr[2]
                  )
               )
               // start + lead time < to
               const leadMiliSecs = timeslot.pickUpLeadTime * 60000
               if (now.getTime() + leadMiliSecs < toTimeStamp.getTime()) {
                  // if start + lead time > from -> set new from time
                  let slotStart
                  let slotEnd =
                     toTimeStamp.getHours() + ':' + toTimeStamp.getMinutes()
                  if (now.getTime() + leadMiliSecs > fromTimeStamp.getTime()) {
                     // new start time = lead time + now
                     const newStartTimeStamp = new Date(
                        now.getTime() + leadMiliSecs
                     )
                     slotStart =
                        newStartTimeStamp.getHours() +
                        ':' +
                        newStartTimeStamp.getMinutes()
                  } else {
                     slotStart =
                        fromTimeStamp.getHours() +
                        ':' +
                        fromTimeStamp.getMinutes()
                  }
                  // check if date already in slots
                  const dateWithoutTime = date.toDateString()
                  const index = data.findIndex(
                     slot => slot.date === dateWithoutTime
                  )
                  if (index === -1) {
                     data.push({
                        date: dateWithoutTime,
                        slots: [
                           {
                              start: slotStart,
                              end: slotEnd,
                           },
                        ],
                     })
                  } else {
                     data[index].slots.push({
                        start: slotStart,
                        end: slotEnd,
                     })
                  }
               }
            })
         } else {
            return { status: false }
         }
      })
   })
   return { status: true, data }
}

export const generateTimeStamp = (time, date, slotTiming) => {
   let formatedTime = time.split(':')
   formatedTime =
      makeDoubleDigit(formatedTime[0]) + ':' + makeDoubleDigit(formatedTime[1])

   const currTimestamp = formatISO(new Date())
   const selectedDate = formatISO(new Date(date))
   const from = `${selectedDate.split('T')[0]}T${formatedTime}:00+${
      currTimestamp.split('+')[1]
   }`

   const to = formatISO(add(new Date(from), { minutes: slotTiming }))
   return { from, to }
}

export const autoSelectStore = async (
   brandLocation,
   brandRecurrences,
   fulfillmentType
) => {
   const fulfillmentStatus = () => {
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
   const getAerialDistance = async (data, sorted = false) => {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))

      // add arial distance
      const dataWithAerialDistance = await Promise.all(
         data.map(async eachStore => {
            const aerialDistance = getDistance(
               userLocation,
               eachStore.location.locationAddress.locationCoordinates,
               0.1
            )
            const aerialDistanceInMiles = convertDistance(aerialDistance, 'mi')
            eachStore['aerialDistance'] = parseFloat(
               aerialDistanceInMiles.toFixed(2)
            )
            eachStore['distanceUnit'] = 'mi'
            if (brandRecurrences && fulfillmentType === 'ONDEMAND_DELIVERY') {
               const deliveryStatus = await isStoreOnDemandDeliveryAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus()] = deliveryStatus
            }
            if (brandRecurrences && fulfillmentType === 'PREORDER_DELIVERY') {
               const deliveryStatus = await isPreOrderDeliveryAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus()] = deliveryStatus
            }
            if (fulfillmentType === 'ONDEMAND_PICKUP' && brandRecurrences) {
               const pickupStatus = isStoreOnDemandPickupAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus()] = pickupStatus
            }
            if (fulfillmentType === 'PREORDER_PICKUP' && brandRecurrences) {
               const pickupStatus = isStorePreOrderPickupAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus()] = pickupStatus
            }
            if (fulfillmentType === 'ONDEMAND_DINEIN' && brandRecurrences) {
               const dineInStatus = isStoreOnDemandDineInAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus()] = dineInStatus
            }
            if (fulfillmentType === 'SCHEDULED_DINEIN' && brandRecurrences) {
               const dineInStatus = isStorePreOrderDineInAvailable(
                  brandRecurrences,
                  eachStore
               )
               eachStore[fulfillmentStatus()] = dineInStatus
            }
            return eachStore
         })
      )
      // sort by distance
      if (sorted) {
         const sortedDataWithAerialDistance = _.sortBy(dataWithAerialDistance, [
            x => x.aerialDistance,
         ])

         return sortedDataWithAerialDistance
      }
      return dataWithAerialDistance
   }
   const bar = await getAerialDistance(brandLocation, true)
   return [bar, fulfillmentStatus()]
}
