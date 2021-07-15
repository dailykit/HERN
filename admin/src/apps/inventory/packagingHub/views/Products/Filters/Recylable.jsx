import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { Section } from './styled'
import { FlexContainer } from '../../../../views/Forms/styled'

import { useFilters } from '../../../context/filters'

export default function Recyclable() {
   const { filters, dispatch } = useFilters()

   const toggleRecylable = () => {
      dispatch({
         type: 'TOGGLE_RECYLABLE',
         payload: { value: filters.isRecylable },
      })
   }

   return (
      <Section>
         <FlexContainer>
            <Checkbox
               checked={filters.isRecylable}
               onChange={toggleRecylable}
            />
            <span style={{ width: '12px' }} />
            <h5>Recyclable</h5>
         </FlexContainer>
      </Section>
   )
}
