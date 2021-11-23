import React from 'react'
import { Flex } from '@dailykit/ui'
import { Card, CardImage, CardBody } from './styles.js'
import { Clock } from '../../Icons'
import { theme } from '../../../theme.js'
import { getMinute, getDateWithTime, getTime, getDate } from '../../../utils'
import Button from '../../Button'
import { Divider, Badge } from 'antd'
import router from 'next/router'

export default function NormalExperienceCard({ cardDetails, ...props }) {
   const {
      experience,
      experienceBookingOptions = [],
      cutoffTime,
      id
   } = cardDetails
   return (
      <Badge.Ribbon
         text={`expires on ${cutoffTime ? getDateWithTime(cutoffTime) : 'N/A'}`}
         color={theme.colors.darkBackground.darkblue}
         placement="start"
      >
         <Card {...props}>
            <CardImage>
               <img src={experience?.assets?.images[0]} alt="card-img" />
            </CardImage>
            <CardBody>
               <h2 className="exp-name">{experience?.title}</h2>
               <div className="flex-div" style={{ margin: '.5rem 0 0 0' }}>
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
               </div>
               <Divider plain className="poll-option-divider" />

               <p className="most-voted">Most Voted</p>
               <div className="slot-div-wrap">
                  {experienceBookingOptions?.map(option => {
                     return (
                        <>
                           <div key={option?.id} className="slot-div">
                              <div className="flex-div">
                                 <p className="most-voted-info">
                                    {getDate(
                                       option?.experienceClass?.startTimeStamp
                                    )}
                                    <br />
                                    {getTime(
                                       option?.experienceClass?.startTimeStamp
                                    )}
                                 </p>
                                 <p
                                    className="most-voted-info"
                                    style={{ textAlign: 'right' }}
                                 >
                                    {option?.voting?.aggregate?.count} <br />
                                    votes
                                 </p>
                              </div>
                           </div>
                        </>
                     )
                  })}
               </div>
            </CardBody>
            <Button
               className="book-exp Maven-Pro text8"
               onClick={() => router.push(`/dashboard/myPolls/${id}`)}
            >
               View Votes
            </Button>
         </Card>
      </Badge.Ribbon>
   )
}
