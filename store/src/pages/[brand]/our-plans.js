import React from 'react'
import { SEO, Layout, ExternalJSCSSFiles } from '../../components'
import { renderPageContent, getPageProps } from '../../utils'
import 'regenerator-runtime'

const SelectPlan = props => {
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props

   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main className="hern-our-plans__main">
            {renderPageContent(folds, [
               {
                  component: 'Plans',
                  props: { cameFrom: 'our-plans' },
               },
            ])}
         </main>
      </Layout>
   )
}

export default SelectPlan

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/our-plans')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
      },
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
