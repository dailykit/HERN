import React from 'react'
import styled from 'styled-components'
import { Banner } from '../../../shared/components'

import { Header, Categories, CartButton } from './components'

export default function PackaginHub() {
   return (
      <Wrapper>
         <Banner id="inventory-app-packaging-hub-top" />
         <CartButton />
         <Header />
         <Categories />
         <Banner id="inventory-app-packaging-hub-bottom" />
      </Wrapper>
   )
}

const Wrapper = styled.div`
   position: relative;
`
