import React, { memo } from 'react'
import { Flex } from '@dailykit/ui'
import { useRouter } from 'next/router'
import { Wrapper } from './styles'
import Button from '../Button'
import { theme } from '../../theme'
import { isEmpty, isExpired } from '../../utils'

const AvailableDate = ({
   data,
   selectedExperienceClassId,
   multiOptions = [],
   isMulti = false,
   onClick,
   bookingType,
   cart
}) => {
   const router = useRouter()
   console.log('Rendering availableDate')
   const clickHandler = ({ date, time, id }) => {
      if (!isEmpty(cart) && id === cart?.experienceClassId) {
         router.push(`/checkout?cartId=${cart?.id}`)
      } else {
         onClick({
            date,
            time,
            selectedExperienceClassId: id
         })
      }
   }

   const dynamicButtonTitle = slot => {
      if (slot?.isBooked) {
         return 'Sold out'
      }
      if (isExpired(slot?.date, new Date())) {
         return 'Expired'
      }
      if (!isEmpty(cart) && slot?.id === cart?.experienceClassId) {
         return 'Checkout'
      }
      return 'Choose'
   }

   if (isMulti) {
      return (
         <Wrapper>
            <Flex container flexDirection="column">
               <p className="date">{data?.date}</p>
               <div className="slot-wrapper">
                  {data?.slots.map(slot => {
                     return (
                        <Button
                           key={`${slot?.time}-${slot?.id}`}
                           backgroundColor={
                              multiOptions.some(
                                 opt =>
                                    opt.selectedExperienceClassId === slot?.id
                              )
                                 ? theme.colors.secondaryColor
                                 : theme.colors.lightBackground.grey
                           }
                           className={`custom-slot-Btn text6 poll_${dynamicButtonTitle(
                              slot
                           )
                              .toLowerCase()
                              .replace(' ', '_')} ${
                              multiOptions.some(
                                 opt =>
                                    opt.selectedExperienceClassId === slot?.id
                              ) && 'selected_poll_btn'
                           }`}
                           onClick={() =>
                              clickHandler({
                                 date: data?.date,
                                 time: slot?.time,
                                 id: slot?.id
                              })
                           }
                           disabled={
                              slot?.isBooked ||
                              isExpired(slot?.date, new Date()) ||
                              slot?.id === cart?.experienceClassId
                           }
                           title={dynamicButtonTitle(slot)}
                        >
                           <span className="time text8">{slot?.time}</span>
                        </Button>
                     )
                  })}
               </div>
            </Flex>
         </Wrapper>
      )
   } else {
      return (
         <Wrapper>
            <div className="flexWrapper">
               <p className="date text8">{data?.date}</p>
               <Flex
                  container
                  justifyContent="flex-start"
                  flexWrap="wrap"
                  flexDirection="column"
               >
                  {data?.slots.map(slot => {
                     return (
                        <Flex
                           container
                           justifyContent="space-between"
                           alignItems="center"
                           padding="1rem 0"
                        >
                           <Flex container flexDirection="column">
                              <span
                                 className={`time-info text4 ${dynamicButtonTitle(
                                    slot
                                 )
                                    .toLowerCase()
                                    .replace(' ', '_')}_text`}
                              >
                                 {slot?.time}
                              </span>
                              {/* <span className="time-info">{bookingType}</span> */}
                           </Flex>
                           <Button
                              key={`${slot?.time}-${slot?.id}`}
                              // backgroundColor={
                              //   selectedExperienceClassId === slot?.id
                              //     ? theme.colors.secondaryColor
                              //     : theme.colors.mainBackground
                              // }

                              className={`custom-slot-Btn text8 ${dynamicButtonTitle(
                                 slot
                              )
                                 .toLowerCase()
                                 .replace(' ', '_')}`}
                              onClick={() =>
                                 clickHandler({
                                    date: data?.date,
                                    time: slot?.time,
                                    id: slot?.id
                                 })
                              }
                              disabled={
                                 slot?.isBooked ||
                                 isExpired(slot?.date, new Date())
                              }
                              title={dynamicButtonTitle(slot)}
                           >
                              {dynamicButtonTitle(slot)}
                           </Button>
                        </Flex>
                     )
                  })}
               </Flex>
            </div>
         </Wrapper>
      )
   }
}

export default memo(AvailableDate)
