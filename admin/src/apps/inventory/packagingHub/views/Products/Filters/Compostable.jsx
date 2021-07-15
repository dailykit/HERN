import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { Section } from './styled'
import { FlexContainer } from '../../../../views/Forms/styled'

import { useFilters } from '../../../context/filters'

export default function Compostable() {
   const { filters, dispatch } = useFilters()

   const toggleCompostable = () => {
      dispatch({
         type: 'TOGGLE_COMPOSTABLE',
         payload: { value: filters.isCompostable },
      })
   }

   return (
      <Section>
         <FlexContainer>
            <Checkbox
               checked={filters.isCompostable}
               onChange={toggleCompostable}
            />
            <span style={{ width: '12px' }} />
            <h5>Compostable</h5>
         </FlexContainer>
      </Section>
   )
}
