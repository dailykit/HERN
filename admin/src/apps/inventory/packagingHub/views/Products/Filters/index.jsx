import React from 'react'
import styled from 'styled-components'

import { Section } from './styled'

import Sizes from './Sizes'
import FDACompliant from './FDACompliant'
import Recylable from './Recylable'
import Compostable from './Compostable'
import WaterResistance from './WaterResistance'
import GreaseResistance from './GreaseResistance'
import Compressable from './Compressable'

export default function Filters() {
   return (
      <Wrapper>
         <Section>
            <h5 style={{ color: '#00A7E1' }}>Filters</h5>
         </Section>

         <Sizes />
         <FDACompliant />
         <Recylable />
         <Compostable />
         <WaterResistance />
         <GreaseResistance />
         <Compressable />
      </Wrapper>
   )
}
const Wrapper = styled.div`
   flex: 1;
`
