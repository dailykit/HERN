import React from 'react'
import { providers, getSession } from 'next-auth/client'
import { useConfig } from '../../../lib'

import { getPageProps, renderPageContent } from '../../../utils'
import { SEO, Layout, ExternalJSCSSFiles } from '../../../components'
import 'regenerator-runtime'

const Register = props => {
   const { settings, linkedFiles, folds, seoSettings } = props
   const { configOf } = useConfig()
   const backgroundFromConfig = configOf(
      'register-background',
      'Register'
   )?.registerBackground
   return (
      <Layout settings={settings}>
         <SEO seoSettings={seoSettings} />
         <ExternalJSCSSFiles externalFiles={linkedFiles} />
         <main
            className="hern-register"
            style={
               backgroundFromConfig && {
                  backgroundImage:
                     'url(' +
                     backgroundFromConfig?.BackgroundImage?.value +
                     ')',
                  backgroundColor: backgroundFromConfig?.backgroundColor?.value,
               }
            }
         >
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
   const { parsedData, settings, seoSettings, linkedFiles } =
      await getPageProps(context.params, '/get-started/register')
   console.log(context)
   const { req, res } = context
   const session = await getSession({ req })

   if (session && res && session.accessToken) {
      return {
         props: {
            folds: parsedData,
            session,
            settings,
            seoSettings,
            // revalidate: 60,
            linkedFiles,
            providers: await providers(context),
         },
      }
   }

   return {
      props: {
         folds: parsedData,
         session: null,
         settings,
         seoSettings,
         linkedFiles,
         // revalidate: 60,
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
