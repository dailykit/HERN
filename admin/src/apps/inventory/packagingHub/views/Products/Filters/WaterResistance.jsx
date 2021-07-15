import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { Section } from './styled'
import { FlexContainer } from '../../../../views/Forms/styled'

import { useFilters } from '../../../context/filters'

export default function WaterResistance() {
   const {
      filters: { isInnerWaterResistant, isOuterWaterResistant },
      dispatch,
   } = useFilters()

   const toggleWaterResistance = () =>
      dispatch({
         type: 'TOGGLE_WATER_RESITANCE',
         payload: { value: { isInnerWaterResistant, isOuterWaterResistant } },
      })

   const toggleInnerWaterResistance = () =>
      dispatch({
         type: 'TOGGLE_INNER_WATER_RESISTANCE',
         payload: { value: isInnerWaterResistant },
      })

   const toggleOuterWaterResistance = () =>
      dispatch({
         type: 'TOGGLE_OUTER_WATER_RESISTANCE',
         payload: { value: isOuterWaterResistant },
      })

   return (
      <Section>
         <FlexContainer>
            <Checkbox
               checked={isInnerWaterResistant && isOuterWaterResistant}
               onChange={toggleWaterResistance}
            />
            <span style={{ width: '12px' }} />
            <h5>Water Resistant</h5>
         </FlexContainer>

         {isInnerWaterResistant || isOuterWaterResistant ? (
            <>
               <br />
               <FlexContainer style={{ marginLeft: '16px' }}>
                  <Checkbox
                     checked={isInnerWaterResistant}
                     onChange={toggleInnerWaterResistance}
                  />
                  <span style={{ width: '12px' }} />
                  <h5>Inner Water Resistant</h5>
               </FlexContainer>
               <br />
               <FlexContainer style={{ marginLeft: '16px' }}>
                  <Checkbox
                     checked={isOuterWaterResistant}
                     onChange={toggleOuterWaterResistance}
                  />
                  <span style={{ width: '12px' }} />
                  <h5>Outer Water Resistant</h5>
               </FlexContainer>
            </>
         ) : null}
      </Section>
   )
}
