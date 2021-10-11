import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Flex } from '@dailykit/ui'
import { Popover, Button } from 'antd'
import { Wrapper, Popup } from './styles'
import SelectParticipant from '../SelectParticipant'
import { ChevronDown, ChevronUp } from '../../../Icons'
import { useExperienceInfo } from '../../../../Providers'
import { theme } from '../../../../theme'

export default function Participant({ experienceId }) {
   const { state: experienceState } = useExperienceInfo()
   const { participants } = useMemo(() => {
      return experienceState
   }, [experienceState])
   const [showPopup, setShowPopup] = useState(false)
   const node = useRef()

   return (
      <Wrapper ref={node}>
         <Popover
            placement="bottom"
            arrowPointAtCenter
            content={<SelectParticipant experienceId={experienceId} />}
            trigger="click"
         >
            <button
               className="select-participant"
               onClick={() => setShowPopup(prev => !prev)}
            >
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <div>
                     <p className="head text8">Select No. of guests</p>
                     <p className="guest_para text6">{participants} guests</p>
                  </div>
                  {showPopup ? (
                     <ChevronUp size="24" color={theme.colors.textColor5} />
                  ) : (
                     <ChevronDown size="24" color={theme.colors.textColor5} />
                  )}
               </Flex>
            </button>
         </Popover>
      </Wrapper>
   )
}
