import React from 'react'
import moment from 'moment'
import { Flex } from '@dailykit/ui'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Wrap } from './styles'
import { usePoll } from '../../../Providers'

export default function PollDeadline() {
   const { state: pollState, updatePollInfo } = usePoll()
   const { cutoffDate, pollOptions } = pollState
   const sortedClassOptionDates = pollOptions.sort(function (a, b) {
      var dateA = new Date(a.date),
         dateB = new Date(b.date)
      return dateA - dateB
   })
   const maxDate = new Date(sortedClassOptionDates[0]?.date)
   const minDate = new Date()

   return (
      <Wrap>
         <img
            className="calendar-img"
            src="/assets/images/calendar.png"
            alt="calendar_icon"
         />
         <h2 className="proxima_nova sub-heading text8">
            Poll is set and ready to be sent
         </h2>
         <p className="proxima_nova small-heading text9">
            Set Deadline for Poll Responses
         </p>
         <Flex container alignItems="center" justifyContent="center">
            <DatePicker
               onChange={date =>
                  updatePollInfo({
                     cutoffDate: date
                  })
               }
               inline
               selected={cutoffDate}
               minDate={minDate}
               maxDate={maxDate}
            />
         </Flex>
      </Wrap>
   )
}
