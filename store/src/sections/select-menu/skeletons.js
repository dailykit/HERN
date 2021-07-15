import React from 'react'
import tw, { styled } from 'twin.macro'

export const SkeletonProduct = () => {
   return (
      <SkeletonMain>
         <header>
            <span />
         </header>
         <ul>
            <li>
               <div />
               <footer />
            </li>
            <li>
               <div />
               <footer />
            </li>
            <li>
               <div />
               <footer />
            </li>
         </ul>
      </SkeletonMain>
   )
}

export const SkeletonCart = () => {
   return
}

const SkeletonMain = styled.main`
   ${tw`mt-4`}
   header {
      ${tw`border-b h-12 mb-3`}
      span {
         ${tw`w-1/12 block h-8 bg-gray-100`}
      }
   }
   ul {
      ${tw`grid gap-3`}
      grid-template-rows: 220px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
   }
   li {
      ${tw`p-2 border flex flex-col bg-white p-2 rounded overflow-hidden`}
      div {
         ${tw`flex-1 bg-gray-100`}
      }
      footer {
         ${tw`mt-2 h-8 bg-gray-100`}
      }
   }
`
