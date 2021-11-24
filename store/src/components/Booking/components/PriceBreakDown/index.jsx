import React from 'react'
import { Wrap } from './styles'
import { theme } from '../../../../theme'
import { useExperienceInfo } from '../../../../Providers'

export default function PriceBreakDown() {
   const { state: experienceState } = useExperienceInfo()
   const { classTypeInfo, priceBreakDown, pricePerPerson } = experienceState
   return (
      <Wrap>
         <div className="flex-div">
            <p className="price-breakdown-info text-left">
               First {classTypeInfo?.minimumParticipant} guests
            </p>
            <div className="flex-div column">
               <p className="price-breakdown-info text-right bold red">
                  ${classTypeInfo?.minimumBookingAmount}
               </p>
               {classTypeInfo?.discount && (
                  <small className="price-breakdown-info text-right red">
                     {classTypeInfo?.discount}% off
                  </small>
               )}
            </div>
         </div>
         <br />
         {priceBreakDown?.ranges.map((range, index) => {
            return (
               <>
                  <div className="flex-div">
                     <p className="price-breakdown-info text-left">
                        {`${range?.from}-${range?.to} guests`}
                     </p>
                     <div className="flex-div column">
                        <p className="price-breakdown-info text-right">
                           additional{' '}
                           <span className="price-breakdown-info text-right bold red">
                              ${range?.price}
                           </span>{' '}
                           per person
                        </p>
                     </div>
                  </div>

                  {/* need to first properly calculate the actual discount */}
                  <div className="flex-div">
                     <p className="price-breakdown-info text-right red">
                        {`${(
                           ((pricePerPerson - range?.price) / pricePerPerson) *
                           100
                        ).toFixed(2)}
                        % off`}
                     </p>
                  </div>
               </>
            )
         })}
      </Wrap>
   )
}
