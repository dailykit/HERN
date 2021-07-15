import React from 'react'
import tw, { styled, css } from 'twin.macro'

import { useConfig } from '../../lib'

const InfoBlock = ({ heading, subHeading, columns, children, orientation }) => {
   const { configOf } = useConfig('Visual')

   return (
      <BlockWrapper theme={configOf('theme-color')}>
         {heading && <Heading>{heading}</Heading>}
         {subHeading && <SubHeading>{subHeading}</SubHeading>}
         <Container count={columns} orientation={orientation}>
            {children}
         </Container>
      </BlockWrapper>
   )
}

const Heading = ({ children }) => {
   return <h1 tw="mb-1 text-center text-green-600 text-4xl">{children}</h1>
}
const SubHeading = ({ children }) => {
   return <h4 tw="mb-4 text-center text-gray-600 text-lg">{children}</h4>
}

const Item = ({ icon, heading, subHeading }) => {
   return (
      <li>
         {icon && (
            <img
               src={icon}
               alt={heading}
               title={heading}
               tw="w-20 h-20 rounded-full"
            />
         )}
         <section>
            {heading && <h3 tw="text-xl text-green-700">{heading}</h3>}
            {subHeading && <p tw="text-gray-700">{subHeading}</p>}
         </section>
      </li>
   )
}

InfoBlock.Item = Item

export { InfoBlock }

const BlockWrapper = styled.div(
   ({ theme }) => css`
      padding: 48px 0;
      margin: 0 auto;
      max-width: 980px;
      width: calc(100% - 40px);
      h1,
      h3 {
         color: ${theme.accent || tw`text-green-600`};
      }
   `
)

const Container = styled.ul(
   ({ count, orientation }) => css`
   ${tw`grid gap-6`}
   grid-template-columns: repeat(${count}, 1fr);
   @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
   }
   @media (max-width: 567px) {
      grid-template-columns: 1fr;
   }
   li {
      ${
         orientation === 'row'
            ? tw`flex flex-col items-center text-center`
            : tw`flex items-start space-x-3`
      }
   }
`
)
