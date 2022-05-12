// import { rrulestr } from 'rrule'
import { isDateValidInRRule } from '../../'

export const isStoreOnDemandDineInAvailable = finalRecurrences => {
   for (let rec in finalRecurrences) {
      const now = new Date() // now
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24) // yesterday
      const end = new Date(now.getTime() + 1000 * 60 * 60 * 24) // tomorrow
      // const dates = rrulestr(finalRecurrences[rec].recurrence.rrule).between(
      //    start,
      //    now
      // )
      const isValidDay = isDateValidInRRule(
         finalRecurrences[rec].recurrence.rrule
      )
      if (isValidDay) {
         if (finalRecurrences[rec].recurrence.timeSlots.length) {
            for (let timeslot of finalRecurrences[rec].recurrence.timeSlots) {
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
                        message: 'Sorry, We do not offer Dine In at this time.',
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

export const isStorePreOrderDineInAvailable = finalRecurrences => {
   return {
      status: true,
      message: 'Store available for pre order dine in.',
      rec: finalRecurrences,
   }
}
