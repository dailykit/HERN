import React from 'react'
import { Wrapper } from './styles'
import SelectParticipant from '../SelectParticipant'
import { theme } from '../../../../theme'
import CustomTooltip from '../../../CustomTooltip'

export default function Participant({ experienceId }) {
   return (
      <Wrapper>
         <div className="flex-row">
            <p className="head text8">Estimated Number of Guests</p>
            <CustomTooltip title="Don't worry, you'll be able to adjust this up to 15 days before your experience date. If you need to adjust after that window, reach out to info@stayinsocial.com and we'll do our best to accommodate your changes." />
         </div>

         <SelectParticipant experienceId={experienceId} />
      </Wrapper>
   )
}
