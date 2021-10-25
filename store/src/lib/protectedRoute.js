import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useUser } from '../Providers'
import { isClient } from '../utils'

const protectedRoute = WrappedComponent => {
   return props => {
      const { state } = useUser()
      const { isAuthenticated } = state
      const Router = useRouter()

      useEffect(() => {
         if (!isAuthenticated) {
            if (isClient) {
               localStorage.setItem('openLoginModal', true)
            }
            Router.replace('/')
         }
      }, [])

      if (isAuthenticated) {
         return <WrappedComponent {...props} />
      } else {
         return null
      }
   }
}

export default protectedRoute
