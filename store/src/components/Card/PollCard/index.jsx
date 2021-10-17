import React from 'react'
import { Flex } from '@dailykit/ui'
import { Card, CardImage, CardBody } from './styles.js'
import { Clock } from '../../Icons'
import { theme } from '../../../theme.js'
import { getMinute, getDateWithTime } from '../../../utils'
import Button from '../../Button'
import { Divider, Badge } from 'antd'

export default function NormalExperienceCard({ cardDetails, ...props }) {
   const { experience, experienceBookingOptions = [], cutoffTime } = cardDetails
   return (
      <Badge.Ribbon
         text={`expires on ${cutoffTime ? getDateWithTime(cutoffTime) : 'N/A'}`}
         color={theme.colors.darkBackground.darkblue}
         placement="start"
      >
         <Card {...props} onClick={props?.onCardClick}>
            <CardImage>
               <img src={experience?.assets?.images[0]} alt="card-img" />
            </CardImage>
            <CardBody>
               <h2 className="exp-name">{experience?.title}</h2>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  margin=".5rem 0 0 0"
               >
                  {/* <div className="expert-info-wrapper"> */}
                  <div className="expertImgDiv">
                     <img
                        className="expert-img"
                        src={
                           experience?.experienceClasses[0]
                              ?.experienceClassExpert?.assets?.images[0]
                        }
                        alt="expert-img"
                     />
                     <p className="expert-name">
                        {
                           experience?.experienceClasses[0]
                              ?.experienceClassExpert?.firstName
                        }{' '}
                        {
                           experience?.experienceClasses[0]
                              ?.experienceClassExpert?.lastName
                        }
                     </p>
                  </div>

                  {/* </div> */}
                  <span className="duration">
                     <Clock
                        size={theme.sizes.h6}
                        color={theme.colors.textColor4}
                     />
                     <span>
                        {getMinute(experience?.experienceClasses[0]?.duration)}
                        min
                     </span>
                  </span>
               </Flex>
               <Divider
                  plain
                  className="poll-option-divider"
                  orientation="left"
               >
                  Most Voted
               </Divider>
               <div className="slot-div-wrap">
                  {experienceBookingOptions?.map(option => {
                     return (
                        <div key={option?.id} className="slot-div">
                           <Flex
                              container
                              alignItems="center"
                              justifyContent="space-between"
                              margin="0 0 12px 0"
                           >
                              <p className="slot-info-time">
                                 {getDateWithTime(
                                    option?.experienceClass?.startTimeStamp
                                 )}
                              </p>
                              <p className="vote-head">
                                 {option?.voting?.aggregate?.count} votes
                              </p>
                           </Flex>
                           <Button
                              className="book-slot Proxima-Nova text8"
                              onClick={() => props.bookingHandler({ option })}
                           >
                              Book Slot
                           </Button>
                        </div>
                     )
                  })}
               </div>
            </CardBody>
         </Card>
      </Badge.Ribbon>
   )
}
