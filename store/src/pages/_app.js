import App from 'next/app'
import { UserProvider } from '../context'
import { Provider as AuthProvider } from 'next-auth/client'
import {
   ApolloProvider,
   ConfigProvider,
   ScriptProvider,
   PaymentProvider,
} from '../lib'
import { get_env, isClient } from '../utils'
import { ToastProvider } from 'react-toast-notifications'

import GlobalStyles from '../styles/global'
import '../styles/globals.css'
import '../styles/main.scss'
import {
   OnDemandMenuProvider,
   CartProvider,
   LanguageProvider,
} from '../context'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null
const pixelId = isClient && get_env('PIXEL_ID')
const options = {
   autoConfig: true,
   debug: true,
}
// initializing react pixel
isClient && ReactPixel.init(pixelId, {}, options)

const AppWrapper = ({ Component, pageProps }) => {
   return (
      <AuthProvider session={pageProps.session}>
         <ApolloProvider>
            <GlobalStyles />
            <ConfigProvider>
               <ScriptProvider>
                  <OnDemandMenuProvider>
                     <LanguageProvider>
                        <ToastProvider
                           autoDismiss
                           placement="bottom-center"
                           autoDismissTimeout={3000}
                        >
                           <UserProvider>
                              <CartProvider>
                                 <PaymentProvider>
                                    <Component {...pageProps} />
                                 </PaymentProvider>
                              </CartProvider>
                           </UserProvider>
                        </ToastProvider>
                     </LanguageProvider>
                  </OnDemandMenuProvider>
               </ScriptProvider>
            </ConfigProvider>
         </ApolloProvider>
      </AuthProvider>
   )
}

export default AppWrapper
