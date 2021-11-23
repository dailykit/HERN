import React from 'react'
import { Flex } from '@dailykit/ui'
import { Card, CardImage, CardBody } from './styles.js'
import { Clock, ChevronRight } from '../../Icons'
import { theme } from '../../../theme'
import { getDate, getTime, getMinute } from '../../../utils'
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
               <div className="flex-div" style={{ margin: '0.5rem 0 0 0' }}>
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
                  <span className="duration text10">
                     <Clock
                        size={theme.sizes.h6}
                        color={theme.colors.textColor4}
                     />
                     <span className="text10">
                        {getMinute(experience?.experienceClasses[0]?.duration)}
                        min
                     </span>
                  </span>
               </div>
               <div className="flex-div" style={{ margin: '8px 0 1rem 0' }}>
                  <p className="experience-date">
                     Be Ready
                     <br /> at
                  </p>
                  <p className="experience-date" style={{ textAlign: 'right' }}>
                     {getDate(experience?.experienceClasses[0]?.startTimeStamp)}

                     <br />
                     {getTime(experience?.experienceClasses[0]?.startTimeStamp)}
                  </p>
               </div>
               <Button className="book-exp" onClick={props.onCardClick}>
                  View Booking
               </Button>
            </CardBody>
         </Card>
      </Badge.Ribbon>
   )
}
