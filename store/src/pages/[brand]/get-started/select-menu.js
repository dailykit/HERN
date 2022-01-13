import React from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../../../context'
import {
   SEO,
   Layout,
   LoginWarning,
   ExternalJSCSSFiles,
} from '../../../components'
import { getPageProps, isClient, renderPageContent } from '../../../utils'

const SelectMenu = props => {
   const { settings, linkedFiles, folds, seoSettings } = props
   const router = useRouter()
   const { isAuthenticated, isLoading } = useUser()
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         // router.push(getRoute('/get-started/register'))
      }
   }, [isAuthenticated, isLoading])



   return (
      <Layout settings={settings}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         {!isAuthenticated && !isLoading ? (
            <LoginWarning />
         ) : (
            <main>{renderPageContent(folds)}</main>
         )}
      </Layout>
   )
}

export default SelectMenu

export async function getStaticProps({ params }) {
   const { parsedData, settings, seoSettings, linkedFiles } =
      await getPageProps(params, '/get-started/select-menu')

   return {
      props: { folds: parsedData, linkedFiles, settings, seoSettings },
      revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
