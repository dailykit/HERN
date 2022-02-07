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
      const end = new Date(now.getTime() + 10 * 1000 * 60 * 60 * 24) // 7 days later
      const dates = rrulestr(rec.rrule).between(start, end)
      dates.forEach(date => {
         if (rec.validTimeSlots.length) {
            rec.validTimeSlots.forEach(timeslot => {
               // if multiple mile ranges, only first one will be taken
               if (timeslot.validMileRange) {
                  const leadTime = timeslot.validMileRange.leadTime
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
                     slotStart =
                        fromTimeStamp.getHours() +
                        ':' +
                        fromTimeStamp.getMinutes()
                     // if (
                     //    now.getTime() + leadMiliSecs >
                     //    fromTimeStamp.getTime()
                     // ) {
                     //    // new start time = lead time + now
                     //    const newStartTimeStamp = new Date(
                     //       now.getTime() + leadMiliSecs
                     //    )
                     //    slotStart =
                     //       newStartTimeStamp.getHours() +
                     //       ':' +
                     //       newStartTimeStamp.getMinutes()
                     // } else {
                     //    slotStart =
                     //       fromTimeStamp.getHours() +
                     //       ':' +
                     //       fromTimeStamp.getMinutes()
                     // }
                     // check if date already in slots
                     const dateWithoutTime = date.toDateString()
                     const index = data.findIndex(
                        slot => slot.date === dateWithoutTime
                     )
                     const [HH, MM, SS] = timeslot.slotInterval
                        ? timeslot.slotInterval.split(':')
                        : []
                     const intervalInMinutes = Boolean(HH && MM && SS)
                        ? +HH * 60 + +MM
                        : null
                     if (index === -1) {
                        data.push({
                           date: dateWithoutTime,
                           slots: [
                              {
                                 start: slotStart,
                                 end: slotEnd,
                                 mileRangeId: timeslot.validMileRange.id,
                                 intervalInMinutes: intervalInMinutes,
                              },
                           ],
                        })
                     } else {
                        data[index].slots.push({
                           start: slotStart,
                           end: slotEnd,
                           mileRangeId: timeslot.validMileRange.id,
                           intervalInMinutes: intervalInMinutes,
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
   // data --> delivery slots group by dates
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
            if (slot.intervalInMinutes) {
               startPoint = startPoint + slot.intervalInMinutes
            } else {
               startPoint = startPoint + size
            }
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
      const end = new Date(now.getTime() + 10 * 1000 * 60 * 60 * 24) // 7 days later
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
   fulfillmentType,
   address
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
      console.log('addressIN', address)
      const dataWithAerialDistance = await Promise.all(
         data.map(async eachStore => {
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
            if (brandRecurrences && fulfillmentType === 'ONDEMAND_DELIVERY') {
               const deliveryStatus = await isStoreOnDemandDeliveryAvailable(
                  brandRecurrences,
                  eachStore,
                  address
               )
               eachStore[fulfillmentStatus()] = deliveryStatus
            }
            if (brandRecurrences && fulfillmentType === 'PREORDER_DELIVERY') {
               const deliveryStatus = await isPreOrderDeliveryAvailable(
                  brandRecurrences,
                  eachStore,
                  address
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
   const bar = await getAerialDistance(brandLocation, true, address)
   return [bar, fulfillmentStatus()]
}

export const getAddressByCoordinates = async (lat, lng) => {
   let result
   fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${get_env(
         'GOOGLE_API_KEY'
      )}`
   )
      .then(res => res.json())
      .then(data => {
         if (data.status === 'OK' && data.results.length > 0) {
            const formatted_address =
               data.results[0].formatted_address.split(',')
            const mainText = formatted_address
               .slice(0, formatted_address.length - 3)
               .join(',')
            const secondaryText = formatted_address
               .slice(formatted_address.length - 3)
               .join(',')
            const address = {}
            data.results[0].address_components.forEach(node => {
               if (node.types.includes('locality')) {
                  address.city = node.long_name
               }
               if (node.types.includes('administrative_area_level_1')) {
                  address.state = node.long_name
               }
               if (node.types.includes('country')) {
                  address.country = node.long_name
               }
               if (node.types.includes('postal_code')) {
                  address.zipcode = node.long_name
               }
            })

            result = {
               status: true,
               data: {
                  mainText,
                  secondaryText,
                  ...address,
                  latitude: lat,
                  longitude: lng,
               },
            }
         }
      })
      .catch(e => {
         console.log('error', e)
         result = {
            status: false,
            message: e,
         }
      })

   return result
}
