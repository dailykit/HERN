import React from 'react'
import { Layout } from '../../components'
import {
   processExternalFiles,
   renderPageContent,
   getPageProps,
} from '../../utils'

const ResetPasswordPage = props => {
   const { folds, settings, linkedFiles } = props
   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings}>
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
      revalidate: 60, // will be passed to the page component as props
   }
}
export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
