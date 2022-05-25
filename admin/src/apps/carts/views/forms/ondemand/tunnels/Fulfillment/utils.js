import { rrulestr } from 'rrule'
import { formatISO, add } from 'date-fns'
import { getdrivableDistance } from '../../../../../../../shared/api'
import moment from 'moment'
import { sortBy } from 'lodash'
import { get_env } from '../../../../../../../shared/utils'
import axios from 'axios'
import { isPointInPolygon, convertDistance } from 'geolib'

export const generateTimeStamp = (time, date, slotTiming = 15) => {
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

export const deg2rad = deg => {
   return deg * (Math.PI / 180)
}

export const getDistance = async (
   lat1,
   lon1,
   lat2,
   lon2,
   drivableDistance = false
) => {
   const res = { aerial: null, drivable: null }
   if (drivableDistance) {
      try {
         const { rows } = await getdrivableDistance({ lat1, lon1, lat2, lon2 })
         if (rows.length) {
            const [best] = rows
            if (best.elements.length) {
               const [record] = best.elements
               // console.log({ record })
               if (record.distance.text.includes('ft')) {
                  const ft = parseInt(record.distance.text)
                  res.drivable = ft * 0.0001893939
               } else {
                  res.drivable = parseInt(record.distance.text)
               }
            } else {
               throw Error('No elements found!')
            }
         } else {
            throw Error('No rows found!')
         }
      } catch (err) {
         console.log('Error calculating distance!')
         console.log(err.message)
      }
   }

   let R = 6371 // Radius of the earth in km
   let dLat = deg2rad(lat2 - lat1) // deg2rad below
   let dLon = deg2rad(lon2 - lon1)
   let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
         Math.cos(deg2rad(lat2)) *
         Math.sin(dLon / 2) *
         Math.sin(dLon / 2)
   let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
   let d = R * c * 0.621 // Distance in miles

   res.aerial = d
   return res
}

export const generateMiniSlots = (data, size) => {
   let newData = []
   data.forEach(el => {
      el.slots.forEach(slot => {
         const startMinutes = getMinutes(slot.start)
         const endMinutes = getMinutes(slot.end)
         let startPoint = startMinutes
         while (startPoint < endMinutes) {
            const index = newData.findIndex(datum => datum.date === el.date)
            const time = getTimeFromMinutes(startPoint)
            if (index === -1) {
               newData.push({
                  title: el.date,
                  id: el.date,
                  value: el.date,
                  date: el.date,
                  slots: [
                     { title: time, value: time, id: time, time, ...slot },
                  ],
               })
            } else {
               newData[index].slots.push({
                  title: time,
                  id: time,
                  value: time,
                  time,
                  ...slot,
               })
            }
            startPoint = startPoint + size
         }
      })
   })
   return newData
}

export const isPickUpAvailable = finalRecurrences => {
   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const isValidDay = isDateValidInRRule(
         finalRecurrences[rec].recurrence.rrule
      )
      if (isValidDay) {
         if (finalRecurrences[rec].recurrence.timeSlots.length) {
            const sortedTimeSlots = sortBy(
               finalRecurrences[rec].recurrence.timeSlots,
               [
                  function (slot) {
                     return moment(slot.from, 'HH:mm')
                  },
               ]
            )
            let validTimeSlots = []
            for (let timeslot of sortedTimeSlots) {
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
                  finalRecurrences[rec].recurrence.validTimeSlots =
                     validTimeSlots
                  if (rec == finalRecurrences.length - 1) {
                     return {
                        status: true,
                        rec: [finalRecurrences[rec]],
                        timeSlotInfo: timeslot,
                        message: 'Store available for pickup.',
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

export const generatePickUpSlots = recurrences => {
   let data = []
   recurrences.forEach(rec => {
      // console.log('rec', rec)
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
                  slotStart =
                     fromTimeStamp.getHours() + ':' + fromTimeStamp.getMinutes()
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
                              intervalInMinutes: intervalInMinutes,
                           },
                        ],
                     })
                  } else {
                     data[index].slots.push({
                        start: slotStart,
                        end: slotEnd,
                        intervalInMinutes: intervalInMinutes,
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

export const isDeliveryAvailable = recurrences => {
   for (let rec of recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      const end = new Date(now.getTime() + 1000 * 60 * 60 * 24) // tomorrow
      const dates = rrulestr(rec.rrule).between(start, now)
      if (dates.length) {
         if (rec.timeSlots.length) {
            for (let timeslot of rec.timeSlots) {
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
                     return {
                        status: true,
                        mileRangeId: timeslot.mileRanges[0].id,
                     }
                  } else {
                     return {
                        status: false,
                        message:
                           'Sorry, We do not offer Delivery at this time.',
                     }
                  }
               } else {
                  return {
                     status: false,
                     message:
                        'Sorry, you seem to be placed far out of our delivery range.',
                  }
               }
            }
         } else {
            return {
               status: false,
               message: 'Sorry, We do not offer Delivery at this time.',
            }
         }
      } else {
         return {
            status: false,
            message: 'Sorry, We do not offer Delivery on this day.',
         }
      }
   }
}

export const generateDeliverySlots = recurrences => {
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

const isDateValidInRRule = (rString, date = null) => {
   // const rString = "RRULE:FREQ=DAILY;COUNT=10;WKST=MO;BYDAY=MO,TU,WE,TH,SA";

   const rStringWithoutRRULE = rString.replace('RRULE:', '') // remove RRULE from string
   const rStringParamsArray = rStringWithoutRRULE.split(';') // split by ; remaining string

   // create an object which contain all params from string
   let rRuleParamObject = {}
   rStringParamsArray.forEach(eachParam => {
      const pair = keyValuePairFromString(eachParam)
      rRuleParamObject = { ...rRuleParamObject, ...pair }
   })
   // {FREQ: "DAILY", COUNT: "10", WKST: "MO", BYDAY: "MO,TU,WE,TH,SA"}
   let availableDays
   const dateToBeCheck = date
      ? moment(date).format('dd').toLocaleUpperCase()
      : moment().format('dd').toLocaleUpperCase()

   if (rRuleParamObject?.BYDAY) {
      availableDays = rRuleParamObject?.BYDAY.split(',')
   } else {
      if (rRuleParamObject.FREQ === 'DAILY') {
         availableDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
      } else {
         availableDays = [dateToBeCheck]
      }
   }

   // check current day code exist in available by day
   const indexOfCurrentDay = availableDays.indexOf(dateToBeCheck)
   if (indexOfCurrentDay === -1) {
      return false
   } else {
      return true
   }
}

// this fn will create an bject from string which conatin '='
// example
// companyName="HERN" --> {companyName:"HERN"}
const keyValuePairFromString = stringWithEqual => {
   const valueArray = stringWithEqual.split('=')
   const keyValueObj = {}
   keyValueObj[valueArray[0]] = valueArray[1]
   return keyValueObj
}

const drivableDistanceBetweenStoreAndCustomerFn = () => ({
   value: null,
   isValidated: false,
})

export const isStoreOnDemandDeliveryAvailable = async (
   finalRecurrences,
   eachStore,
   address
) => {
   let fulfilledRecurrences = []
   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const drivableDistanceBetweenStoreAndCustomer =
         drivableDistanceBetweenStoreAndCustomerFn()
      const isValidDay = isDateValidInRRule(
         finalRecurrences[rec].recurrence.rrule
      )
      if (isValidDay) {
         if (finalRecurrences[rec].recurrence.timeSlots.length) {
            const sortedTimeSlots = sortBy(
               finalRecurrences[rec].recurrence.timeSlots,
               [
                  function (slot) {
                     return moment(slot.from, 'HH:mm')
                  },
               ]
            )
            let validTimeSlots = []
            for (let timeslot of sortedTimeSlots) {
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
                     now.getTime() >= fromTimeStamp.getTime() &&
                     now.getTime() <= toTimeStamp.getTime()
                  ) {
                     const distanceDeliveryStatus =
                        await isStoreDeliveryAvailableByDistance(
                           timeslot.mileRanges,
                           eachStore,
                           address,
                           drivableDistanceBetweenStoreAndCustomer
                        )

                     const { isDistanceValid, zipcode, geoBoundary } =
                        distanceDeliveryStatus.result
                     const status = isDistanceValid && zipcode && geoBoundary
                     if (status) {
                        timeslot.validMileRange =
                           distanceDeliveryStatus.mileRangeInfo
                        validTimeSlots.push(timeslot)
                        finalRecurrences[rec].recurrence.validTimeSlots =
                           validTimeSlots
                        fulfilledRecurrences = [
                           ...fulfilledRecurrences,
                           finalRecurrences[rec],
                        ]
                     }
                     // const timeslotIndex = sortedTimeSlots.indexOf(timeslot)
                     // const timesSlotsLength = sortedTimeSlots.length

                     if (status || rec == finalRecurrences.length - 1) {
                        return {
                           status: validTimeSlots.length > 0,
                           result: distanceDeliveryStatus.result,
                           rec: fulfilledRecurrences,
                           mileRangeInfo: distanceDeliveryStatus.mileRangeInfo,
                           timeSlotInfo: timeslot,
                           message:
                              validTimeSlots.length > 0
                                 ? 'Delivery available in your location'
                                 : 'Delivery not available in your location.',
                           drivableDistance:
                              distanceDeliveryStatus.drivableDistance,
                        }
                     }
                  } else {
                     const timeslotIndex =
                        finalRecurrences[rec].recurrence.timeSlots.indexOf(
                           timeslot
                        )
                     const timesSlotsLength =
                        finalRecurrences[rec].recurrence.timeSlots.length
                     if (timeslotIndex == timesSlotsLength - 1) {
                        return {
                           status: false,
                           message:
                              'Sorry, We do not offer Delivery at this time.',
                        }
                     }
                  }
               } else {
                  return {
                     status: false,
                     message: 'Sorry, delivery range is not available.',
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

const isStoreDeliveryAvailableByDistance = async (
   mileRanges,
   eachStore,
   address,
   drivableDistanceBetweenStoreAndCustomer
) => {
   const userLocation = { ...address }
   // console.log('userLocation', userLocation,eachStore)
   let isStoreDeliveryAvailableByDistanceStatus = {
      isDistanceValid: false,
      zipcode: false,
      geoBoundary: false,
   }
   let drivableByGoogleDistance = null
   let mileRangeInfo = null
   for (let mileRange in mileRanges) {
      // aerial distance
      if (mileRanges[mileRange].distanceType === 'aerial') {
         const aerialDistance = mileRanges[mileRange]
         if (aerialDistance.from !== null && aerialDistance.to !== null) {
            let result =
               eachStore.aerialDistance >= aerialDistance.from &&
               eachStore.aerialDistance <= aerialDistance.to
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['isDistanceValid'] =
                  result && !mileRanges[mileRange].isExcluded
            } else {
               continue
            }
         } else {
            isStoreDeliveryAvailableByDistanceStatus['isDistanceValid'] = true
         }
      }
      // drivable distance
      if (mileRanges[mileRange].distanceType === 'drivable') {
         const drivableDistance = mileRanges[mileRange]
         if (drivableDistance.from !== null && drivableDistance.to !== null) {
            try {
               if (
                  drivableDistanceBetweenStoreAndCustomer.value &&
                  drivableDistanceBetweenStoreAndCustomer.isValidated
               ) {
                  let result =
                     drivableDistanceBetweenStoreAndCustomer.value >=
                        drivableDistance.from &&
                     drivableDistanceBetweenStoreAndCustomer.value <=
                        drivableDistance.to
                  if (result) {
                     isStoreDeliveryAvailableByDistanceStatus[
                        'isDistanceValid'
                     ] = result && !mileRanges[mileRange].isExcluded
                  } else {
                     continue
                  }
               } else {
                  const origin = get_env('REACT_APP_DAILYOS_SERVER_URI')
                  const url = `${origin}/api/distance-matrix`
                  const postLocationData = {
                     key: get_env('REACT_APP_MAPS_API_KEY'),
                     lat1: userLocation.lat,
                     lon1: userLocation.lng,
                     lat2: eachStore.location.lat,
                     lon2: eachStore.location.lng,
                  }
                  const { data } = await axios.post(url, postLocationData)
                  const distanceMeter = data.rows[0].elements[0].distance.value

                  const distanceMileFloat = convertDistance(distanceMeter, 'mi')

                  drivableByGoogleDistance = distanceMileFloat
                  drivableDistanceBetweenStoreAndCustomer.value =
                     distanceMileFloat
                  drivableDistanceBetweenStoreAndCustomer.isValidated = true
                  let result =
                     distanceMileFloat >= drivableDistance.from &&
                     distanceMileFloat <= drivableDistance.to
                  if (result) {
                     isStoreDeliveryAvailableByDistanceStatus[
                        'isDistanceValid'
                     ] = result && !mileRanges[mileRange].isExcluded
                  } else {
                     continue
                  }
               }
            } catch (error) {
               console.log('getDataWithDrivableDistance', error)
            }
         } else {
            isStoreDeliveryAvailableByDistanceStatus['isDistanceValid'] = true
         }
      }

      // zip code
      if (
         mileRanges[mileRange].zipcodes === null ||
         mileRanges[mileRange].zipcodes
      ) {
         // assuming null as true
         if (
            mileRanges[mileRange].zipcodes === null ||
            mileRanges[mileRange].zipcodes.zipcodes.length == 0
         ) {
            isStoreDeliveryAvailableByDistanceStatus['zipcode'] = true
         } else {
            const zipcodes = mileRanges[mileRange].zipcodes.zipcodes
            let result = Boolean(
               zipcodes.find(x => x == parseInt(userLocation.zipcode))
            )
            if (result) {
               isStoreDeliveryAvailableByDistanceStatus['zipcode'] =
                  result && !mileRanges[mileRange].isExcluded
               if (!(result && !mileRanges[mileRange].isExcluded)) {
                  return {
                     result: {
                        isDistanceValid: true,
                        zipcode: false,
                        geoBoundary: true,
                     },
                     mileRangeInfo: null,
                     drivableDistance: null,
                  }
               }
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
               if (!(result && !mileRanges[mileRange].isExcluded)) {
                  return {
                     result: {
                        isDistanceValid: true,
                        zipcode: true,
                        geoBoundary: false,
                     },
                     mileRangeInfo: null,
                     drivableDistance: null,
                  }
               }
            }
         }
      }
      if (
         isStoreDeliveryAvailableByDistanceStatus.isDistanceValid &&
         isStoreDeliveryAvailableByDistanceStatus.zipcode &&
         isStoreDeliveryAvailableByDistanceStatus.geoBoundary
      ) {
         mileRangeInfo = mileRanges[mileRange]
      }
   }
   return {
      result: isStoreDeliveryAvailableByDistanceStatus,
      mileRangeInfo: mileRangeInfo,
      drivableDistance: drivableByGoogleDistance,
   }
}
