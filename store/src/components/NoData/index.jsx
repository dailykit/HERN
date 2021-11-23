import React from 'react'
import { Wrapper } from './styles'
import { NoDataIcon } from '../Icons'

function NoDataComp({ message = 'No Data' }) {
   return (
      <Wrapper>
         <NoDataIcon />
         <p class="title">{message}</p>
      </Wrapper>
   )
}

export default NoDataComp
