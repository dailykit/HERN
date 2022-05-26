import React from 'react'
import { Login as AuthMethods } from '../../components'
import { useConfig } from '../../lib'
import { useUser } from '../../context'
import { getRoute } from '../../utils'
import { useRouter } from 'next/router'

export const Login = ({ config }) => {
   const { configOf } = useConfig()
   const authConfig = configOf('Auth Methods', 'brand')

   const { isAuthenticated, isLoading } = useUser()
   const router = useRouter()

   const brandDefaultLogInMethod = React.useMemo(() => {
      if (authConfig?.loginSettings?.defaultLogInMethod?.value?.value) {
         return authConfig?.loginSettings?.defaultLogInMethod?.value?.value
      } else {
         return 'email'
      }
   }, [authConfig])
   const loginBy = React.useMemo(() => {
      if (config?.loginSettings?.componentToRender?.value?.value) {
         return config?.loginSettings?.componentToRender?.value?.value
      } else if (authConfig?.loginSettings?.defaultLogInMethod?.value?.value) {
         return authConfig?.loginSettings?.defaultLogInMethod?.value?.value
      } else {
         return 'email'
      }
   }, [config, authConfig])
   /** Brand level config for login illustration **/
   const loginIllustration = configOf('Login Illustrations', 'brand')
   const illustration =
      loginIllustration?.['Login Illustration']?.illustrationImage?.value ??
      'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/16322-user_login.png' //fallback Image

   const showIllustration =
      loginIllustration?.['Login Illustration']?.showLoginIllustration?.value ??
      false //false as fallback value

   const loginBackgroundImages =
      loginIllustration?.['Login Background Image']?.backgroundImage?.value ??
      'https://dailykit-237-breezychef.s3.us-east-2.amazonaws.com/images/93576-Coupon%20Image%20%282%29.png' //fallback Image
   const showBackground =
      loginIllustration?.['Login Background Image']?.showBackground?.value ??
      false

   React.useEffect(() => {
      if (isAuthenticated && !isLoading) {
         router.push(getRoute('/'))
      }
   }, [isLoading, isAuthenticated])

   return (
      <div
         style={
            showBackground
               ? {
                    backgroundImage: `url('${loginBackgroundImages}')`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#fff',
                    minHeight: 'auto',
                 }
               : {}
         }
         className="hern-login-v1-container"
      >
         {/**Illustration image */}
         {showIllustration && (
            <div className="hern-login-v1-container__img">
               <img src={illustration} alt="Login" />
            </div>
         )}
         {/**Login Component */}
         {isLoading ? null : isAuthenticated ? (
            <div
               style={{
                  fontWeight: '600',
                  fontFamily: 'var(--hern-primary-font)',
                  fontSize: '1.8rem',
               }}
            >
               Seems like you are already logged in redirecting to Home page
            </div>
         ) : (
            <AuthMethods
               socialLogin={authConfig.socialLoginMethods?.socialLogin?.value}
               singleLoginMethod={
                  authConfig.loginSettings?.singleLoginMethod?.value || false
               }
               loginBy={loginBy}
               brandDefaultLogInMethod={brandDefaultLogInMethod}
               currentAuth={loginBy}
               showBackground={showBackground}
            />
         )}
      </div>
   )
}
