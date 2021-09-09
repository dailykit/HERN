import React from 'react'
import { providers, getSession } from 'next-auth/client'

import { getPageProps, processJsFile, renderPageContent } from '../../../utils'
import { SEO, Layout } from '../../../components'
import 'regenerator-runtime'

const Register = props => {
   const { settings, folds } = props
   React.useEffect(() => {
      try {
         processJsFile(folds)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [folds])

   return (
      <Layout settings={settings}>
         <SEO title="Register" />
         <main className="hern-register">
            {renderPageContent(folds, [
               {
                  component: 'Registration',
                  props: { settings: settings },
               },
            ])}
         </main>
      </Layout>
   )
}
export default Register

export const getStaticProps = async context => {
   const { parsedData, seo, settings } = await getPageProps(
      context.params,
      '/get-started/register'
   )
   console.log(context)
   const { req, res } = context
   const session = await getSession({ req })

   if (session && res && session.accessToken) {
      return {
         props: {
            folds: parsedData,
            session,
            seo,
            settings,
            revalidate: 60,
            providers: await providers(context),
         },
      }
   }

   return {
      props: {
         folds: parsedData,
         session: null,
         seo,
         settings,
         revalidate: 60,
         providers: await providers(context),
      },
   }
}

export const getStaticPaths = () => {
   return {
      paths: [],
      fallback: 'blocking',
   }
}
