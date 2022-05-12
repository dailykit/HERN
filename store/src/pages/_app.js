import { UserProvider } from '../context'
import { Provider as AuthProvider } from 'next-auth/client'
import { PageTransition } from 'next-page-transitions'
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

const transitionClasses = {
   enter: 'animate__animated',
   enterActive: 'animate__bounceInLeft',
   exit: 'animate__animated',
   exitActive: 'animate__bounceOutRight',
}

const AppWrapper = ({ Component, pageProps, router }) => {
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
                                    <PageTransition
                                       timeout={300}
                                       classNames={transitionClasses}
                                    >
                                       <Component
                                          {...pageProps}
                                          key={router.route}
                                       />
                                    </PageTransition>
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
