import { rrulestr } from 'rrule'
import _ from 'lodash'
import moment from 'moment'

export const isStoreOnDemandPickupAvailable = finalRecurrences => {
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
            const sortedTimeSlots = _.sortBy(
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
export const isStorePreOrderPickupAvailable = finalRecurrences => {
   return {
      status: true,
      message: 'Store available for pre order pre order pickup.',
      rec: finalRecurrences,
   }
}
