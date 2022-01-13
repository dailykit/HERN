import { Flex } from '@dailykit/ui'
import React from 'react'
import { ComingSoon } from '../../../../../shared/assets/illustrations'
import { StyledHome } from './styled'

const MarketPlace = () => {

    return (
        <StyledHome className="Coming">
            <Flex
                container
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                top="190px"
            >
                <ComingSoon />
                <h1>Coming soon!</h1>
            </Flex>
        </StyledHome>
    )
}

export default MarketPlace
