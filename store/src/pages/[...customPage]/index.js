import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { Layout, SEO } from '../../components'
import { graphqlClient } from '../../lib'
import { fileParser } from '../../utils'
import { GET_PAGE_MODULES } from '../../graphql'
import {
   getNavigationMenuItems,
   getWebPageModule,
   getGlobalFooter
} from '../../lib'

const CustomPage = ({
   navigationMenuItems = [],
   parsedData = [],
   internalPageName = 'StayIn Social',
   footerHtml = ''
}) => {
   React.useEffect(() => {
      try {
         if (parsedData.length && typeof document !== 'undefined') {
            const scripts = parsedData.flatMap(fold => fold.scripts)
            const fragment = document.createDocumentFragment()
            console.log({ scripts })
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
   }, [parsedData])

   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title={internalPageName} />
         <div id="custom-page-div">
            {Boolean(parsedData.length) &&
               parsedData.map(fold => ReactHtmlParser(fold?.content))}
         </div>
      </Layout>
   )
}

export default CustomPage

export const getStaticProps = async ({ params }) => {
   const domain = 'primanti.dailykit.org'
   const route = `/${params.customPage[0]}`
   let parsedData = []
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const brandPages = await getWebPageModule({ domain, route })
   const footerHtml = await getGlobalFooter()

   if (brandPages.length > 0) {
      //parsed data of page
      parsedData = await fileParser(brandPages[0]['brandPageModules'])
   }
   return {
      props: {
         navigationMenuItems,
         parsedData,
         internalPageName: brandPages[0]['internalPageName'],
         footerHtml
      }
   }
}

export const getStaticPaths = async () => {
   const client = await graphqlClient()
   const { data: { brands_brandPages: brandPages = [] } = {} } =
      await client.query({
         query: GET_PAGE_MODULES,
         variables: {
            where: {
               brandId: {
                  _eq: 1069 // hardcoded for now until we have a better way to get the brandId
               }
            }
         }
      })
   const paths = brandPages.map(item => ({
      params: { customPage: [item.route.substring(1)] }
   }))
   return {
      paths,
      fallback: false
   }
}
