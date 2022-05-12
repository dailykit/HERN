import { rrulestr } from 'rrule'
import moment from 'moment'

export const getTimeSlotsValidation = (
   recurrences,
   cartFrom,
   cartTo,
   cartMileRangeId
) => {
   for (let rec in recurrences) {
      const from = new Date(cartFrom) // from
      const to = new Date(cartTo)
      const currentTime = new Date()
      const start = new Date(from.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.validTimeSlots.length) {
         for (let timeslot of recurrences[rec].recurrence.validTimeSlots) {
            if (timeslot.validMileRange) {
               const timeslotFromArr = timeslot.from.split(':')
               const timeslotToArr = timeslot.to.split(':')
               const fromTimeStamp = new Date(from.getTime())
               fromTimeStamp.setHours(
                  timeslotFromArr[0],
                  timeslotFromArr[1],
                  timeslotFromArr[2]
               )
               const toTimeStamp = new Date(from.getTime())
               toTimeStamp.setHours(
                  timeslotToArr[0],
                  timeslotToArr[1],
                  timeslotToArr[2]
               )
               // check if cart from and to time falls within time slot
               if (
                  from.getTime() >= fromTimeStamp.getTime() &&
                  from.getTime() <= toTimeStamp.getTime() &&
                  to.getTime() <= toTimeStamp.getTime()
               ) {
                  const leadTime = timeslot.validMileRange.leadTime
                  const isDateValid =
                     currentTime.getTime() + leadTime * 60000 <= to.getTime()
                  return {
                     status: isDateValid,
                     message: isDateValid
                        ? 'Valid date and time'
                        : 'In Valid Date',
                  }
               } else {
                  if (
                     recurrences[rec].recurrence.validTimeSlots.indexOf(
                        timeslot
                     ) ==
                     recurrences[rec].recurrence.validTimeSlots.length - 1
                  ) {
                     return {
                        status: false,
                        message: 'time not valid',
                     }
                  }
               }
            }
         }
      } else {
         if (rec == recurrences.length - 1) {
            return {
               status: false,
               message: 'Time slot not available',
            }
         }
      }
   }
}

export const getOnDemandValidation = (recurrences, cartMileRangeId) => {
   for (let rec in recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.timeSlots.length) {
         const sortedTimeSlots = _.sortBy(
            recurrences[rec].recurrence.timeSlots,
            [
               function (slot) {
                  return moment(slot.from, 'HH:mm')
               },
            ]
         )
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
                  now.getTime() > fromTimeStamp.getTime() &&
                  now.getTime() < toTimeStamp.getTime()
               ) {
                  const isCartMileRangeIdAvailableInTimeSlot =
                     timeslot.mileRanges.find(
                        each => each.id === cartMileRangeId
                     )
                  if (isCartMileRangeIdAvailableInTimeSlot) {
                     return {
                        status: true,
                     }
                  } else {
                     return { status: false }
                  }
               } else {
                  const timeslotIndex =
                     recurrences[rec].recurrence.timeSlots.indexOf(timeslot)
                  const timesSlotsLength =
                     recurrences[rec].recurrence.timeSlots.length
                  if (timeslotIndex == timesSlotsLength - 1) {
                     return {
                        status: false,
                        message:
                           'Sorry, We do not offer Delivery at this time.',
                     }
                  }
               }
            }
         }
      }
   }
}

export const getPickupTimeSlotValidation = (
   recurrences,
   cartFrom,
   cartTo,
   cartTimeSlotId
) => {
   for (let rec in recurrences) {
      const from = new Date(cartFrom) // from
      const to = new Date(cartTo)
      const currentTime = new Date()
      const start = new Date(from.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.timeSlots.length) {
         const timeslot = recurrences[rec].recurrence.timeSlots.find(
            eachTimeSlot => eachTimeSlot.id === cartTimeSlotId
         )
         if (timeslot) {
            const timeslotFromArr = timeslot.from.split(':')
            const timeslotToArr = timeslot.to.split(':')
            const fromTimeStamp = new Date(from.getTime())
            fromTimeStamp.setHours(
               timeslotFromArr[0],
               timeslotFromArr[1],
               timeslotFromArr[2]
            )
            const toTimeStamp = new Date(from.getTime())
            toTimeStamp.setHours(
               timeslotToArr[0],
               timeslotToArr[1],
               timeslotToArr[2]
            )
            // check if cart from and to time falls within time slot
            if (
               from.getTime() >= fromTimeStamp.getTime() &&
               from.getTime() <= toTimeStamp.getTime() &&
               to.getTime() <= toTimeStamp.getTime()
            ) {
               const leadTime = timeslot.pickUpLeadTime
               const isDateValid =
                  currentTime.getTime() + leadTime * 60000 <= to.getTime()
               return {
                  status: isDateValid,
                  message: isDateValid
                     ? 'Valid date and time'
                     : 'In Valid Date',
               }
            }
         } else {
            if (rec == recurrences.length - 1) {
               return {
                  status: false,
                  message: 'Time slot not available1',
               }
            }
         }
      } else {
         if (rec == recurrences.length - 1) {
            return {
               status: false,
               message: 'Time slot not available',
            }
         }
      }
   }
}

export const getOndemandPickupTimeValidation = (
   recurrences,
   cartTimeSlotId
) => {
   for (let rec in recurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday

      if (recurrences[rec].recurrence.timeSlots.length) {
         const timeslot = recurrences[rec].recurrence.timeSlots.find(
            eachTimeSlot => eachTimeSlot.id === cartTimeSlotId
         )
         if (timeslot) {
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
            if (
               now.getTime() >= fromTimeStamp.getTime() &&
               now.getTime() <= toTimeStamp.getTime()
            ) {
               const prepTime = timeslot.pickUpPrepTime
               const isDateValid =
                  now.getTime() + prepTime * 60000 <= toTimeStamp.getTime()
               return {
                  status: isDateValid,
                  message: isDateValid ? 'Valid date and time' : 'Invalid Date',
               }
            }
         } else {
            if (rec == recurrences.length - 1) {
               return {
                  status: false,
                  message: 'Time slot not available',
               }
            }
         }
      } else {
         if (rec == recurrences.length - 1) {
            return {
               status: false,
               message: 'Time slot not available',
            }
         }
      }
   }
}
