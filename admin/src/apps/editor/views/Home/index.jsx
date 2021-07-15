import React from 'react'
import { Banner } from '../../../../shared/components'
import { StyledHome } from './styled'

export const Home = () => {
   return (
      <StyledHome>
         <Banner id="editor-app-home-top" />
         <h1>Select the file from the Sidebar</h1>
         <Banner id="editor-app-home-bottom" />
      </StyledHome>
   )
}
