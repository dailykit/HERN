import React from 'react'
import { Collapse } from 'antd'
import { CardWrapper } from './styles'
import { getMinute, getDateWithTime, isEmpty } from '../../utils'
import { theme } from '../../theme'
import Participant from '../../components/Booking/components/Participant'

export default function Card({ experienceInfo }) {
   const { Panel } = Collapse
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
                  {/* <h2 className="experience-heading text8">Your Experience</h2> */}
                  <p className="mavenPro_text text7">{experienceInfo?.title}</p>
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
                  <div className="select-participants">
                     <Participant experienceId={experienceInfo?.experienceId} />
                  </div>
               </div>
            </div>

            <div className="price-details">
               <div className="pricing">
                  <p className="mavenPro_text text9">Overall Total amount</p>
                  <p className="mavenPro_text text9">
                     $
                     {!isEmpty(experienceInfo?.cartOwnerBilling?.totalToPay)
                        ? (experienceInfo?.cartOwnerBilling?.totalToPay).toFixed(
                             2
                          )
                        : 'N/A'}
                  </p>
               </div>
               <div className="estimate-billing-div">
                  <Collapse accordion={true}>
                     <Panel header="View breakdown" key="1">
                        <div class="estimated-billing-details">
                           <table>
                              <tr>
                                 <td>Total Participants</td>
                                 <td>{experienceInfo?.totalParticipants}</td>
                              </tr>
                              <tr>
                                 <td>Total experience price</td>
                                 <td>
                                    $
                                    {experienceInfo?.experienceClassType?.priceRanges?.totalPriceBreak
                                       .find(
                                          item =>
                                             item.person ===
                                             experienceInfo?.totalParticipants
                                       )
                                       .totalPrice.toFixed(2)}
                                 </td>
                              </tr>
                              <tr>
                                 <td>Total kit</td>
                                 <td>{experienceInfo?.totalKit}</td>
                              </tr>
                              <tr>
                                 <td>Total kit price</td>
                                 <td>${experienceInfo?.totalKitPrice}</td>
                              </tr>
                              <tr>
                                 <td>Total Tax</td>
                                 <td>
                                    $
                                    {
                                       experienceInfo?.cartOwnerBilling
                                          ?.itemTotalTaxExcluded
                                    }
                                 </td>
                              </tr>
                           </table>
                        </div>
                     </Panel>
                  </Collapse>
               </div>

               <div className="pricing">
                  <p className="mavenPro_text text9">Booking Amount</p>
                  <p className="mavenPro_text text9">
                     ${experienceInfo?.balancePayment}
                  </p>
               </div>
               <div className="pricing boldText">
                  <p className="mavenPro_text text9">Payable Now(USD)</p>
                  <p className="mavenPro_text text9">
                     ${experienceInfo?.balancePayment}
                  </p>
               </div>
            </div>
         </div>
      </CardWrapper>
   )
}
