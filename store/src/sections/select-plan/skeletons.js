import React from 'react'
import tw, { styled } from 'twin.macro'

export const SkeletonPlan = () => {
   return (
      <SkeletonPlanItem>
         <header />
         <main>
            <section />
            <section />
         </main>
         <footer>
            <span />
         </footer>
      </SkeletonPlanItem>
   )
}

const SkeletonPlanItem = styled.li`
   height: 420px;
   ${tw`flex flex-col rounded p-3 border`}
   header {
      height: 40px;
      ${tw`w-7/12 bg-gray-100`}
   }
   main {
      ${tw`my-6`}
      section {
         ${tw`h-16 mb-6 bg-gray-100`}
      }
   }
   footer {
      ${tw`mt-auto`}
      span {
         ${tw`h-12 rounded-full block bg-gray-100`}
      }
   }
`
