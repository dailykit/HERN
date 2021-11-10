import React from 'react'
import { Flex } from '@dailykit/ui'
import { Card, CardImage, CardBody } from './styles.js'
import { Clock, ChevronRight } from '../../Icons'
import { theme } from '../../../theme'
import { getDateWithTime, getMinute } from '../../../utils'
import router from 'next/router'
import { Badge } from 'antd'
import Button from '../../Button'

export default function UpcomingExperienceCard({ cardDetails, ...props }) {
   const { experience, totalParticipants, totalRsvpCount } = cardDetails
   return (
      <Badge.Ribbon
         text={`${totalRsvpCount} out of ${totalParticipants} accepted`}
         color={theme.colors.textColor}
         placement="start"
      >
         <Card {...props} onClick={props?.onCardClick}>
            <CardImage>
               <img src={experience?.assets?.images[0]} alt="card-img" />
            </CardImage>
            <CardBody>
               <h2 className="exp-name text7">{experience?.title}</h2>
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
                     <p className="expert-name text10">
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
                  <span className="duration expert-name text10">
                     <Clock
                        size={theme.sizes.h6}
                        color={theme.colors.textColor4}
                     />
                     <span className="expert-name text10">
                        {getMinute(experience?.experienceClasses[0]?.duration)}
                        min
                     </span>
                  </span>
               </Flex>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  margin="8px 0 1rem 0"
               >
                  <p className="expert-name text10">Be Ready at</p>
                  <p className="expert-name text10">
                     {getDateWithTime(
                        experience?.experienceClasses[0]?.startTimeStamp
                     )}
                  </p>
               </Flex>
               <Button className="book-exp" onClick={props.onCardClick}>
                  View Booking
               </Button>
            </CardBody>
         </Card>
      </Badge.Ribbon>
   )
}
