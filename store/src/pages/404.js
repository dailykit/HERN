import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const PageNotFound = dynamic(() =>
   import('../sections/404').then(promise => promise.PageNotFound)
)
const NotFoundPage = () => {
   return (
      <>
         <Head>Page not found!</Head>
         <PageNotFound />
      </>
   )
}

export default NotFoundPage
