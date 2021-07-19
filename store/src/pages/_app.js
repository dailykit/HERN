import App from 'next/app'
import { UserProvider } from '../context'
import { Provider as AuthProvider } from 'next-auth/client'
import { ApolloProvider, ConfigProvider, ScriptProvider } from '../lib'
import { ToastProvider } from 'react-toast-notifications'

import GlobalStyles from '../styles/global'
import '../styles/globals.css'

const AppWrapper = ({ Component, pageProps }) => {
   return (
      <AuthProvider session={pageProps.session}>
         <ApolloProvider>
            <GlobalStyles />
            <ConfigProvider>
               <ScriptProvider>
                  <UserProvider>
                     <ToastProvider
                        autoDismiss
                        placement="bottom-center"
                        autoDismissTimeout={3000}
                     >
                        <Component {...pageProps} />
                     </ToastProvider>
                  </UserProvider>
               </ScriptProvider>
            </ConfigProvider>
         </ApolloProvider>
      </AuthProvider>
   )
}

export default AppWrapper
