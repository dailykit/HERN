import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTabs } from '../../../../shared/providers'
import { ScreenIcon } from '../../assets/icons'
import { Flex } from '@dailykit/ui'
import { StyledHome } from './styled'

const address = 'apps.viewStore.views.home.'

const Home = () => {
   const { addTab } = useTabs()
   const { t } = useTranslation()

   return (
      <StyledHome className="Coming">
         <Flex
            container
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            top="190px"
         >
            <ScreenIcon />
            <h1>Coming soon!</h1>
         </Flex>
      </StyledHome>
   )
}

export default Home
