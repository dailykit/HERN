import React from 'react'
import tw from 'twin.macro'

import { Loader } from './loader'

export const PageLoader = () => {
   return (
      <div>
         <header tw="px-3 top-0 w-screen fixed h-16 border-b border-gray-200 flex items-center justify-between">
            <aside css={tw`flex items-center`}>
               <span tw="mr-3 w-12 h-12 rounded-full bg-gray-200 border border-gray-300" />
               <span tw="w-32 h-8 rounded bg-gray-200 border border-gray-300" />
            </aside>
            <aside tw="w-10 h-10 rounded-full bg-gray-200 border border-gray-300" />
         </header>
         <main>
            <Loader inline />
         </main>
      </div>
   )
}
