import { useToasts } from 'react-toast-notifications'
import { useRouter } from 'next/router'
import { useTranslation } from '../context'
import { isClient } from './isClient'
import { getRoute } from './getRoute'
import { useConfig } from '../lib'

export const handleLoginSuccess = () => {
   const router = useRouter()
   const { t } = useTranslation()
   const { addToast } = useToasts()
   const { settings } = useConfig()

   const isSubscriptionStore =
      settings?.availability?.isSubscriptionAvailable?.Subscription
         ?.isSubscriptionAvailable?.value ?? false

   const notRedirectRoutes = [
      '/login',
      '/sign-up',
      '/forgot-password',
      '/reset-password',
   ]
   const loginSuccess = () => {
      addToast(t('Login successfully!'), { appearance: 'success' })
      if (isClient) {
         const redirectTo = localStorage.getItem('redirect_to')
         const landedOn = localStorage.getItem('landed_on')
         const redirectedFrom = localStorage.getItem('redirected_from')

         if (redirectTo) {
            const route = getRoute(redirectTo)
            router.push(route)
            localStorage.removeItem('redirect_to')
         } else if (landedOn) {
            const route = landedOn.replace(window.location.origin, '')
            router.push(getRoute(route))
            localStorage.removeItem('landed_on')
         } else if (
            redirectedFrom &&
            !notRedirectRoutes.includes(
               redirectedFrom.replace(window.location.origin, '')
            )
         ) {
            const route = redirectedFrom.replace(window.location.origin, '')
            router.push(getRoute(route))
            localStorage.removeItem('redirected_from')
         } else if (isSubscriptionStore) {
            router.push(getRoute('/our-plans'))
         } else {
            router.push(getRoute('/order'))
         }
      }
   }
   return { loginSuccess }
}
