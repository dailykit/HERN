import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { Section } from './styled'
import { FlexContainer } from '../../../../views/Forms/styled'

import { useFilters } from '../../../context/filters'

export default function FDACompliant() {
   const { filters, dispatch } = useFilters()

   const toggleFDACompliant = () => {
      dispatch({
         type: 'TOGGLE_FDACOMPLIANT',
         payload: { value: filters.isFDACompliant },
      })
   }

   return (
      <Section>
         <FlexContainer>
            <Checkbox
               checked={filters.isFDACompliant}
               onChange={toggleFDACompliant}
            />
            <span style={{ width: '12px' }} />
            <h5>FDA Complaint</h5>
         </FlexContainer>
      </Section>
   )
}
