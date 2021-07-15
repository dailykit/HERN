import React from 'react'
import { Checkbox } from '@dailykit/ui'

import { Section } from './styled'
import { FlexContainer } from '../../../../views/Forms/styled'

import { useFilters } from '../../../context/filters'

export default function Compressable() {
   const { filters, dispatch } = useFilters()

   const toggleCompressable = () => {
      dispatch({
         type: 'TOGGLE_COMPRESSABLE',
         payload: { value: filters.isCompressable },
      })
   }

   return (
      <Section>
         <FlexContainer>
            <Checkbox
               checked={filters.isCompressable}
               onChange={toggleCompressable}
            />
            <span style={{ width: '12px' }} />
            <h5>Compressable</h5>
         </FlexContainer>
      </Section>
   )
}
