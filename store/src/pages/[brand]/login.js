import React, { useEffect } from 'react'
import { SEO, Layout, ExternalJSCSSFiles } from '../../components'
import { renderPageContent, getPageProps, getRoute } from '../../utils'
import 'regenerator-runtime'
import { useRouter } from 'next/router'
import { Loader } from '../../components/loader'
import { useUser } from '../../context'

const LoginPage = props => {
   const router = useRouter()
   const { folds, settings, navigationMenus, seoSettings, linkedFiles } = props
   const { isAuthenticated, isLoading } = useUser()
   React.useLayoutEffect(() => {
      if (isAuthenticated && !isLoading) {
         router.push(getRoute('/'))
      }
   }, [isLoading])
   if (isLoading)
      return (
         <Layout settings={settings} navigationMenus={navigationMenus}>
            <Loader />
         </Layout>
      )
   if (isAuthenticated)
      return (
         <Layout settings={settings} navigationMenus={navigationMenus}>
            <div
               style={{
                  fontWeight: '600',
                  fontFamily: 'var(--hern-primary-font)',
                  fontSize: '1.8rem',
                  textAlign: 'center',
                  padding: '200px 0',
               }}
            >
               You are logged in <br /> Redirecting...
            </div>
         </Layout>
      )
   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main>{renderPageContent(folds)}</main>
      </Layout>
   )
}

export default LoginPage

export const getStaticProps = async ({ params }) => {
   const { parsedData, settings, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/login')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         settings,
         navigationMenus,
         seoSettings,
      },
      // revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
