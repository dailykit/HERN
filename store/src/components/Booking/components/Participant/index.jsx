import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Flex } from '@dailykit/ui'
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
   const handleClick = e => {
      if (node.current.contains(e.target)) {
         // inside click
         return
      }
      // outside click
      setShowPopup(false)
   }

   useEffect(() => {
      document.addEventListener('mousedown', handleClick)

      return () => {
         document.removeEventListener('mousedown', handleClick)
      }
   }, [])

   return (
      <Wrapper ref={node}>
         <button
            className="select-participant"
            onClick={() => setShowPopup(prev => !prev)}
         >
            <Flex container alignItems="center" justifyContent="space-between">
               <div>
                  <p className="head text8">GUESTS</p>
                  <p className=" text8">{participants} guests</p>
               </div>
               {showPopup ? (
                  <ChevronUp size="16" color={theme.colors.textColor7} />
               ) : (
                  <ChevronDown size="16" color={theme.colors.textColor7} />
               )}
            </Flex>
         </button>
         <Popup show={showPopup}>
            <div className="pointer" />
            <SelectParticipant experienceId={experienceId} />
         </Popup>
      </Wrapper>
   )
}
