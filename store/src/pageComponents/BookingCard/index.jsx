import React from 'react'
import { CardWrapper } from './styled'
import { Divider } from 'antd'
import { getDateWithTime } from '../../utils'
import { getMinute } from '../../utils'

export default function Card({ experienceInfo, showPaymentDetails = true }) {
   return (
      <CardWrapper>
         <img
            className="exp_img"
            src={experienceInfo?.assets?.images[0]}
            alt="experince-img"
         />
         <div style={{ padding: '1rem 1rem 2rem 1rem' }}>
            <div className="experience-info">
               <div className="experience-details">
                  <p className="proxinova_text text7">
                     {experienceInfo?.title}
                  </p>
                  <h2 className="experience-heading text9">Be ready on</h2>
                  <div className="experience-date">
                     <h2 className="text4">
                        {getDateWithTime(
                           experienceInfo?.experienceClass?.startTimeStamp
                        )}
                     </h2>
                  </div>
                  <p className="experience-heading text9">
                     Duration:{' '}
                     {getMinute(experienceInfo?.experienceClass?.duration)} mins
                  </p>
               </div>
            </div>
            {showPaymentDetails && (
               <>
                  {' '}
                  <Divider plain className="divider" orientation="left">
                     Payment details
                  </Divider>
                  <div className="price-details">
                     <div className="pricing">
                        <p className="proxinova_text text9">Total Amount</p>
                        <p className="proxinova_text text9">
                           ${experienceInfo?.toPayByParent}
                        </p>
                     </div>
                     <div className="pricing">
                        <p className="proxinova_text text9">Paid Amount</p>
                        <p className="proxinova_text text9">
                           ${experienceInfo?.paidAmount}
                        </p>
                     </div>
                     {experienceInfo?.balancePayment > 0 ? (
                        <div className="pricing">
                           <p className="proxinova_text text8">
                              Net Balance(USD)
                           </p>
                           <p className="proxinova_text text8">
                              ${experienceInfo?.balancePayment}
                           </p>
                        </div>
                     ) : (
                        <h2 className="full-payment-msg">
                           Hurray!! Enjoy the experience
                        </h2>
                     )}
                  </div>
               </>
            )}
         </div>
      </CardWrapper>
   )
}
