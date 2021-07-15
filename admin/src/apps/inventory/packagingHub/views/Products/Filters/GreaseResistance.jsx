import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { Section } from './styled'
import { FlexContainer } from '../../../../views/Forms/styled'

import { useFilters } from '../../../context/filters'

export default function GreaseResistance() {
   const {
      filters: { isInnerGreaseResistant, isOuterGreaseResistant },
      dispatch,
   } = useFilters()

   const toggleGreaseResistance = () =>
      dispatch({
         type: 'TOGGLE_GREASE_RESITANCE',
         payload: { value: { isInnerGreaseResistant, isOuterGreaseResistant } },
      })

   const toggleInnerGreaseResistance = () =>
      dispatch({
         type: 'TOGGLE_INNER_GREASE_RESISTANCE',
         payload: { value: isInnerGreaseResistant },
      })

   const toggleOuterGreaseResistance = () =>
      dispatch({
         type: 'TOGGLE_OUTER_GREASE_RESISTANCE',
         payload: { value: isOuterGreaseResistant },
      })

   return (
      <Section>
         <FlexContainer>
            <Checkbox
               checked={isInnerGreaseResistant && isOuterGreaseResistant}
               onChange={toggleGreaseResistance}
            />
            <span style={{ width: '12px' }} />
            <h5>Grease Resistant</h5>
         </FlexContainer>

         {isInnerGreaseResistant || isOuterGreaseResistant ? (
            <>
               <br />
               <FlexContainer style={{ marginLeft: '16px' }}>
                  <Checkbox
                     checked={isInnerGreaseResistant}
                     onChange={toggleInnerGreaseResistance}
                  />
                  <span style={{ width: '12px' }} />
                  <h5>Inner Grease Resistant</h5>
               </FlexContainer>
               <br />
               <FlexContainer style={{ marginLeft: '16px' }}>
                  <Checkbox
                     checked={isOuterGreaseResistant}
                     onChange={toggleOuterGreaseResistance}
                  />
                  <span style={{ width: '12px' }} />
                  <h5>Outer Grease Resistant</h5>
               </FlexContainer>
            </>
         ) : null}
      </Section>
   )
}
