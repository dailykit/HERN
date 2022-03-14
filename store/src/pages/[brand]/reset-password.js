import React from 'react'
import { Layout, ExternalJSCSSFiles } from '../../components'
import { renderPageContent, getPageProps } from '../../utils'

const ResetPasswordPage = props => {
   const { folds, settings, linkedFiles } = props

   return (
      <Layout settings={settings}>
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default ResetPasswordPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, linkedFiles } =
      await getPageProps(params, '/reset-password')

   return {
      props: { folds: parsedData, linkedFiles, settings, navigationMenus },
      // revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
