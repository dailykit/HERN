import React from 'react'
import { render } from 'react-dom'
import i18n from 'i18next'
import Keycloak from 'keycloak-js'
import { initReactI18next } from 'react-i18next'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { BrowserRouter as Router } from 'react-router-dom'

// Toasts
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Backend from 'i18next-http-backend'

import App from './App'
import {
   AuthProvider,
   TabProvider,
   DataProvider,
   BottomBarProvider,
   BannerProvider,
} from './shared/providers'
import { get_env } from './shared/utils'

import './global.css'




const languages = ['en', 'fr', 'es', 'he', 'de', 'el', 'hi', 'it']

Sentry.init({
   dsn: 'https://55533db4419a47f1b4416c0512a608ad@o460444.ingest.sentry.io/5460641',
   integrations: [new Integrations.BrowserTracing()],

   // We recommend adjusting this value in production, or using tracesSampler
   // for finer control
   tracesSampleRate: 1.0,
})

const keycloak = new Keycloak({
   realm: get_env('REACT_APP_KEYCLOAK_REALM'),
   url: get_env('REACT_APP_KEYCLOAK_URL'),
   clientId: 'apps',
   'ssl-required': 'none',
   'public-client': true,
   'bearer-only': false,
   'verify-token-audience': true,
   'use-resource-role-mappings': true,
   'confidential-port': 0,
})

i18n
   .use(Backend)
   .use(initReactI18next)
   .init({
      backend: {
         loadPath: '/apps/locales/{{lng}}/{{ns}}.json',
      },
      lng: 'en',
      fallbackLng: false,
      debug: false,
      whitelist: languages,
      interpolation: {
         escapeValue: false,
      },
      react: {
         wait: true,
         useSuspense: false,
      },
   })
   .then(() =>
      render(
         <AuthProvider keycloak={keycloak}>
            <DataProvider>
               <Router basename={get_env('PUBLIC_URL')}>
                  <BottomBarProvider>
                     <BannerProvider>
                        <TabProvider>
                           <ToastContainer
                              position="bottom-left"
                              autoClose={3000}
                              hideProgressBar={false}
                              newestOnTop={false}
                              closeOnClick
                              rtl={false}
                              pauseOnFocusLoss
                              draggable
                              pauseOnHover
                           />
                           <App />
                        </TabProvider>
                     </BannerProvider>
                  </BottomBarProvider>
               </Router>
            </DataProvider>
         </AuthProvider>,
         document.getElementById('root')
      )
   )
