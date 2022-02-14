import React from 'react'
import _ from 'lodash'
import moment from 'moment'
import { Radio, Space } from 'antd'
import { generateTimeStamp } from '../../../utils'
import { useConfig } from '../../../lib'
import { useCart } from '../../../context'

export const TimeSlots = ({
   onFulfillmentTimeClick,
   selectedSlot,
   timeSlotsFor,
   availableDaySlots,
   setSelectedSlot,
}) => {
   return (
      <Space direction={'vertical'}>
         <div className="hern-fulfillment__day-slots-container">
            <p>Please Select Schedule For {timeSlotsFor}</p>
            <p className="hern-cart__fulfillment-slot-heading">
               Fulfillment Date
            </p>
            <Radio.Group
               onChange={e => {
                  setSelectedSlot(e.target.value)
               }}
            >
               {availableDaySlots.map((eachSlot, index) => {
                  return (
                     <Radio.Button value={eachSlot} size="large">
                        {moment(eachSlot.date).format('DD MMM YY')}
                     </Radio.Button>
                  )
               })}
            </Radio.Group>
         </div>
         {selectedSlot && (
            <div className="hern-fulfillment__time-slots-container">
               <p className="hern-cart__fulfillment-slot-heading">
                  Fulfillment Time
               </p>
               <Radio.Group
                  onChange={e => {
                     const newTimeStamp = generateTimeStamp(
                        e.target.value.time,
                        selectedSlot.date,
                        e.target.value.intervalInMinutes
                     )
                     onFulfillmentTimeClick(
                        newTimeStamp,
                        e.target.value.mileRangeId
                     )
                  }}
               >
                  {_.sortBy(selectedSlot.slots, [
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
                     return (
                        <Radio.Button value={eachSlot}>
                           {slot.from}
                           {'-'}
                           {slot.to}
                        </Radio.Button>
                     )
                  })}
               </Radio.Group>
            </div>
         )}
      </Space>
   )
}
