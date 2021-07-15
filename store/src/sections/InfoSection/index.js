import React from 'react'
import tw, { styled } from 'twin.macro'
import { useSubscription } from '@apollo/react-hooks'

import { InfoBlock } from '../InfoBlock'
import { INFORMATION_GRID } from '../../graphql'

export const InfoSection = ({ page, identifier }) => {
   const { loading, data: { infoGrid = [] } = {} } = useSubscription(
      INFORMATION_GRID,
      {
         variables: { page: { _eq: page }, identifier: { _eq: identifier } },
      }
   )
   if (loading)
      return (
         <Wrapper>
            <header css={tw`flex flex-col items-center`}>
               <div tw="w-5/12 h-6 bg-gray-100 rounded-full" />
               <div tw="mt-3 w-8/12 h-5 bg-gray-100 rounded-full" />
            </header>
            <ul tw="mt-5 grid grid-cols-3 gap-4">
               <li tw="h-48 bg-gray-100" />
               <li tw="h-48 bg-gray-100" />
               <li tw="h-48 bg-gray-100" />
            </ul>
         </Wrapper>
      )
   if (infoGrid.length === 0) return null
   return (
      <InfoBlock
         heading={infoGrid[0].heading}
         columns={infoGrid[0].columnsCount}
         subHeading={infoGrid[0].subHeading}
         orientation={infoGrid[0].blockOrientation}
      >
         {infoGrid[0].blocks.map(block => (
            <InfoBlock.Item
               key={block.id}
               heading={block.title}
               icon={block.thumbnail}
               subHeading={block.description}
            />
         ))}
      </InfoBlock>
   )
}

const Wrapper = styled.div`
   margin: 0 auto;
   max-width: 980px;
   padding: 48px 0;
   width: calc(100% - 40px);
`
