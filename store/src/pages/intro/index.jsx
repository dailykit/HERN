import React from 'react'
import { Intro, Layout, SEO } from '../../components'
import { getNavigationMenuItems, getGlobalFooter } from '../../lib'

export default function IntroPage({
   navigationMenuItems = [],
   footerHtml = ''
}) {
   return (
      <Layout navigationMenuItems={navigationMenuItems} footerHtml={footerHtml}>
         <SEO title="Intro" />
         <div style={{ padding: '1rem' }}>
            <Intro />
         </div>
      </Layout>
   )
}

export const getStaticProps = async () => {
   const domain = 'primanti.dailykit.org'
   const navigationMenuItems = await getNavigationMenuItems(domain)
   const footerHtml = await getGlobalFooter()
   return {
      props: {
         navigationMenuItems,
         footerHtml
      }
   }
}
