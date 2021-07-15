import App from 'next/app'
import { UserProvider } from '../context'
import { ApolloProvider, ConfigProvider, ScriptProvider } from '../lib'
import { ToastProvider } from 'react-toast-notifications'

import GlobalStyles from '../styles/global'
import '../styles/globals.css'

const AppWrapper = ({ Component, pageProps }) => {
   return (
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
   )
}

export default AppWrapper
