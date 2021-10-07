import '../styles/globals.css'
import { ToastProvider } from 'react-toast-notifications'
import {
   UserProvider,
   ExperienceProvider,
   DataProvider,
   ProductProvider,
   RSVPProvider,
   CartProvider,
   PollProvider
} from '../Providers'
import { ConfigProvider } from '../lib'
import 'antd/dist/antd.css'

function MyApp({ Component, pageProps }) {
   return (
      <>
         <DataProvider>
            <ConfigProvider>
               <UserProvider>
                  <ProductProvider>
                     <RSVPProvider>
                        <PollProvider>
                           <ToastProvider
                              autoDismiss
                              placement="top-right"
                              autoDismissTimeout={3000}
                           >
                              <CartProvider>
                                 <ExperienceProvider>
                                    <Component {...pageProps} />
                                 </ExperienceProvider>
                              </CartProvider>
                           </ToastProvider>
                        </PollProvider>
                     </RSVPProvider>
                  </ProductProvider>
               </UserProvider>
            </ConfigProvider>
         </DataProvider>
      </>
   )
}

export default MyApp
