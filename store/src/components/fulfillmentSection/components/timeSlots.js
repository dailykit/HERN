import React from 'react'
import _ from 'lodash'
import moment from 'moment'
import { Radio, Space } from 'antd'
import { generateTimeStamp } from '../../../utils'
import { Button } from '../../button'
import classNames from 'classnames'

export const TimeSlots = ({
   onFulfillmentTimeClick,
   selectedSlot,
   timeSlotsFor,
   availableDaySlots,
   setSelectedSlot,
}) => {
   const [showAllDates, setShowAllDates] = React.useState(false)
   const [showAllTimeSlots, setShowAllTimeSlots] = React.useState(false)

   //Showing first 5 slots at a time
   const daySlots = showAllDates
      ? availableDaySlots
      : _.slice(availableDaySlots, 0, 5)

   const timeSlots = selectedSlot
      ? showAllTimeSlots
         ? selectedSlot.slots
         : _.slice(selectedSlot.slots, 0, 5)
      : null

   return (
      <>
         <div className="hern-fulfillment__day-slots-container">
            <p className="hern-cart__fulfillment__slot__header">
               Schedule your {timeSlotsFor}
            </p>
            <p className="hern-cart__fulfillment-slot-heading">Select Date</p>

            <ul className="hern-cart__fulfillment-slots">
               {daySlots.map(eachSlot => {
                  return (
                     <li
                        key={eachSlot.date}
                        role="button"
                        className={classNames(
                           'hern-cart__fulfillment-slots__item',
                           {
                              'hern-cart__fulfillment-slots__item--active':
                                 selectedSlot?.date === eachSlot.date,
                           }
                        )}
                        onClick={() => setSelectedSlot(eachSlot)}
                     >
                        {moment(eachSlot.date).format('DD MMM YY')}
                     </li>
                  )
               })}
            </ul>
            <Button
               className="hern-cart__fulfillment-slots__item__show-all-btn"
               variant="ghost"
               onClick={() => setShowAllDates(!showAllDates)}
            >
               {showAllDates ? 'Show less' : 'show all'}
            </Button>
         </div>
         {selectedSlot && (
            <div className="hern-fulfillment__time-slots-container">
               <p className="hern-cart__fulfillment-slot-heading">
                  Select Time
               </p>
               <ul className="hern-cart__fulfillment-slots">
                  {_.sortBy(timeSlots, [
                     function (slot) {
                        return moment(slot.time, 'HH:mm')
                     },
                  ]).map((eachSlot, index, elements) => {
                     const slot = {
                        from: eachSlot.time,
                        to: moment(eachSlot.time, 'HH:mm')
                           .add(eachSlot.intervalInMinutes, 'm')
                           .format('HH:mm'),
                     }

                     const handleOnTimeSlotClick = () => {
                        const newTimeStamp = generateTimeStamp(
                           eachSlot.time,
                           selectedSlot.date,
                           eachSlot.intervalInMinutes
                        )
                        onFulfillmentTimeClick(
                           newTimeStamp,
                           eachSlot.mileRangeId
                        )
                     }
                     return (
                        <li
                           key={eachSlot}
                           role="button"
                           onClick={() => handleOnTimeSlotClick(eachSlot)}
                           className={classNames(
                              'hern-cart__fulfillment-slots__item',
                              {
                                 'hern-cart__fulfillment-slots__item--active':
                                    selectedSlot?.date === eachSlot.date,
                              }
                           )}
                        >
                           {slot.from}
                           {'-'}
                           {slot.to}
                        </li>
                     )
                  })}
               </ul>
               <Button
                  className="hern-cart__fulfillment-slots__item__show-all-btn"
                  variant="ghost"
                  onClick={() => setShowAllTimeSlots(!showAllTimeSlots)}
               >
                  {showAllTimeSlots ? 'Show less' : 'show all'}
               </Button>
            </div>
         )}
      </>
   )
}
