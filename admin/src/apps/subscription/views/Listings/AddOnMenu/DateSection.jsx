import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Spacer } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import DayPicker, { DateUtils } from 'react-day-picker'

import 'react-day-picker/lib/style.css'

import { useMenu } from './state'
import { OCCURRENCES_DATES } from '../../../graphql'
import { Tooltip } from '../../../../../shared/components'

const DateSection = () => {
   const { state, dispatch } = useMenu()
   const { data: { occurrences_dates = [] } = {} } = useSubscription(
      OCCURRENCES_DATES
   )

   function isDayDisabled(day) {
      return !occurrences_dates
         .map(node => new Date(node.date))
         .some(disabledDay => DateUtils.isSameDay(day, disabledDay))
   }

   const handleDayClick = (day, { selected }) => {
      localStorage.removeItem('serving_size')
      const selectedDays = state.dates.concat()
      if (selected) {
         const selectedIndex = selectedDays.findIndex(selectedDay =>
            DateUtils.isSameDay(selectedDay, day)
         )
         selectedDays.splice(selectedIndex, 1)
      } else {
         selectedDays.push(day)
      }
      dispatch({ type: 'SET_DATE', payload: selectedDays })
   }

   return (
      <aside>
         <Flex container height="48px" alignItems="center">
            <Text as="h2">Date</Text>
            <Tooltip identifier="listing_menu_section_date_heading" />
         </Flex>
         <Spacer size="16px" />
         <DatePickerWrapper>
            <DayPicker
               selectedDays={state.dates}
               onDayClick={handleDayClick}
               disabledDays={isDayDisabled}
            />
         </DatePickerWrapper>
      </aside>
   )
}

export default DateSection

const DatePickerWrapper = styled.section`
   .DayPicker-Month {
      margin: 0;
   }
`
