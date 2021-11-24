import React from 'react'
import { Loader } from '@dailykit/ui'
import { get_env } from '../utils'
const AuthContext = React.createContext()

export const AuthProvider = ({ keycloak, children }) => {
   const [initialized, setInitialized] = React.useState(false)

   const isByPassKeycloak = get_env('BYPASS_KEYCLOAK')

   React.useEffect(() => {
      if (isByPassKeycloak !== "true") {
         (async () => {
            await keycloak.init({
               onLoad: 'login-required',
               promiseType: 'native',
            })
            setInitialized(true)
         })()
      } else {
         setInitialized(true)
      }
   }, [])

   if (!initialized) return <Loader />
   return (
      <AuthContext.Provider value={[keycloak, initialized]}>
         {children}
      </AuthContext.Provider>
   )
}

export const useAuth = () => {
   const [user, setUser] = React.useState({})
   const [keycloak, initialized] = React.useContext(AuthContext)

   React.useEffect(() => {
      if (keycloak.authenticated) {
         ; (async () => {
            const profile = await keycloak.loadUserInfo()
            setUser(profile)
         })()
      }
   }, [])

   const login = () => keycloak.login()
   const logout = () => keycloak.logout()

   return {
      user,
      login,
      logout,
      keycloak,
      isInitialized: initialized,
      isAuthenticated: keycloak.authenticated,
   }
}
