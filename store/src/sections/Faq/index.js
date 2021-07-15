import React from 'react'
import tw, { styled, css } from 'twin.macro'

import { useConfig } from '../../lib'
import { PlusIcon, MinusIcon } from '../../assets/icons'

const Faq = ({ heading, subHeading, children, ...props }) => {
   const { configOf } = useConfig('Visual')
   return (
      <BlockWrapper {...props} theme={configOf('theme-color')}>
         {heading && <Heading>{heading}</Heading>}
         {subHeading && <SubHeading>{subHeading}</SubHeading>}
         <Container>{children}</Container>
      </BlockWrapper>
   )
}

const Heading = ({ children }) => {
   return <h1 tw="mb-1 text-center text-green-600 text-4xl">{children}</h1>
}
const SubHeading = ({ children }) => {
   return <h4 tw="mb-4 text-center text-gray-600 text-lg">{children}</h4>
}

const Item = ({ icon, question, answer }) => {
   const [isOpen, toggleIsOpen] = React.useState(false)
   return (
      <li tw="flex flex-col border mb-3">
         {icon && (
            <img
               src={icon}
               alt={question}
               title={question}
               tw="w-20 h-20 rounded-full"
            />
         )}
         {question && (
            <button
               onClick={() => toggleIsOpen(!isOpen)}
               tw="bg-gray-100 pr-2 flex justify-between items-center cursor-pointer"
            >
               <h4 tw="text-lg p-3 text-gray-700">{question}</h4>
               <span tw="h-8 w-8 flex items-center justify-center">
                  {isOpen ? (
                     <MinusIcon tw="stroke-current text-green-700" />
                  ) : (
                     <PlusIcon tw="stroke-current text-green-700" />
                  )}
               </span>
            </button>
         )}
         {isOpen && (
            <div tw="border-t pt-2 pb-3 px-3">
               {answer && <p tw="text-gray-700">{answer}</p>}
            </div>
         )}
      </li>
   )
}

Faq.Item = Item

export { Faq }

const BlockWrapper = styled.div(
   ({ theme }) => css`
      max-width: 980px;
      padding: 48px 0;
      margin: 0 auto;
      width: calc(100% - 40px);
      h1 {
         color: ${theme?.accent || tw`text-green-600`};
      }
   `
)

const Container = styled.ul`
   ${tw`mt-6`}
   li {
      overflow: hidden;
      border-radius: 4px;
   }
`
