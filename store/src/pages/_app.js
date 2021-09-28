import "../styles/globals.css";
import { ToastProvider } from "react-toast-notifications";
import {
  AuthProvider,
  ExperienceProvider,
  DataProvider,
  ProductProvider,
  RSVPProvider,
  CartProvider,
  PollProvider,
} from "../Providers";
import { ConfigProvider } from "../lib";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DataProvider>
        <AuthProvider>
          <ConfigProvider>
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
          </ConfigProvider>
        </AuthProvider>
      </DataProvider>
    </>
  );
}

export default MyApp;
