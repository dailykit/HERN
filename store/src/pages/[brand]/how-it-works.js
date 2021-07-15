import tw from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'
import React from 'react'
import Link from 'next/link'
import ReactHtmlParser from 'react-html-parser'

import { isClient } from '../../utils'
import { GET_FILEID } from '../../graphql'
import { GET_FILES } from '../../graphql'
import { graphQLClient } from '../../lib'
import 'regenerator-runtime'
import { fileParser, getSettings } from '../../utils'
import { SEO, Layout, PageLoader } from '../../components'

const HowItWorks = props => {
   const { data, settings } = props

   React.useEffect(() => {
      try {
         if (data.length && typeof document !== 'undefined') {
            const scripts = data.flatMap(fold => fold.scripts)
            const fragment = document.createDocumentFragment()

            scripts.forEach(script => {
               const s = document.createElement('script')
               s.setAttribute('type', 'text/javascript')
               s.setAttribute('src', script)
               fragment.appendChild(s)
            })

            document.body.appendChild(fragment)
         }
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [data])
   return (
      <Layout settings={settings}>
         <SEO title="How it works" />
         <div id="how-it-works">
            {Boolean(data.length) &&
               ReactHtmlParser(
                  data.find(fold => fold.id === 'how-it-works')?.content
               )}
         </div>
      </Layout>
   )
}

export default HowItWorks

export async function getStaticProps({ params }) {
   const client = await graphQLClient()
   const data = await client.request(GET_FILES, {
      divId: ['how-it-works'],
   })

   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/')

   const parsedData = await fileParser(data.content_subscriptionDivIds)

   return {
      props: { data: parsedData, seo, settings },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
