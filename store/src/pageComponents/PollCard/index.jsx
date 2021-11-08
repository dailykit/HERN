import React, { useMemo } from 'react'
import { CardWrapper } from './styled'
import { getDateWithTime } from '../../utils'

export default function Card({ experienceInfo = null }) {
   const experience =
      experienceInfo?.experienceBookingOptions[0]?.experienceClass?.experience
   const experienceClass =
      experienceInfo?.experienceBookingOptions[0]?.experienceClass
   const totalPollOptions = experienceInfo?.experienceBookingOptions.length
   const mostVotedOption = useMemo(() => {
      const result = experienceInfo?.experienceBookingOptions.reduce(
         (prev, current) => {
            return prev?.voting?.aggregate?.count >
               current?.voting?.aggregate?.count
               ? prev
               : current
         }
      )
      return result
   }, [experienceInfo])

   return (
      <CardWrapper>
         <img
            className="exp_img"
            src={experience?.assets?.images[0]}
            alt="experince-img"
         />
         <div style={{ padding: '1rem 1rem 2rem 1rem' }}>
            <div className="experience-info">
               <div className="experience-details">
                  <p className="mavenPro_text text7">{experience?.title}</p>
                  <h2 className="experience-heading text9">Poll expiring on</h2>
                  <div className="experience-date">
                     <h2 className="text4">
                        {getDateWithTime(experienceInfo?.cutoffTime)}
                     </h2>
                  </div>
               </div>
            </div>
            <div className="price-details">
               <div className="pricing">
                  <p className="mavenPro_text text9">Created at</p>
                  <p className="mavenPro_text text9">
                     {' '}
                     {getDateWithTime(experienceInfo?.created_at)}
                  </p>
               </div>
               <div className="pricing">
                  <p className="mavenPro_text text9">Total poll options</p>
                  <p className="mavenPro_text text9">{totalPollOptions}</p>
               </div>
               <div className="pricing">
                  <p className="mavenPro_text text9">Most voted option</p>
                  <p className="mavenPro_text text9">
                     {getDateWithTime(
                        mostVotedOption?.experienceClass?.startTimeStamp
                     )}{' '}
                     ({mostVotedOption?.voting?.aggregate?.count} votes)
                  </p>
               </div>
            </div>
         </div>
      </CardWrapper>
   )
}
