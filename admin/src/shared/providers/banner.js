import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './auth'
const BannerContext = React.createContext()

export const BannerProvider = ({ children }) => {
   const [banners, setBanners] = React.useState([])
   return (
      <BannerContext.Provider value={{ banners, setBanners }}>
         {children}
      </BannerContext.Provider>
   )
}

export const useBanner = id => {
   const { banners, setBanners } = React.useContext(BannerContext)
   const { user } = useAuth()
   const location = useLocation()

   const getEntityInfo = url => {
      let regex, matches

      regex = /\/[a-z0-9]+/g
      matches = url.match(regex)

      if (matches) {
         const appVisited = matches[0]?.slice(1)
         switch (appVisited) {
            case 'order':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }

            case 'products':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }

            case 'inventory':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }

            case 'subscription':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'crm':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }

            case 'settings':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }

            case 'safety':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'menu':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'brands':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'insights':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'editor':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'content':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
            case 'carts':
               regex = /\/[a-z0-9]+/g
               matches = url.match(regex)
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }

            default:
               return {
                  appVisited: matches[0]?.slice(1) || null,
                  entityVisited: matches[1]?.slice(1) || null,
                  entityId: matches[2]?.slice(1) || null,
               }
         }
      } else {
         return {
            appVisited: null,
            entityVisited: null,
            entityId: null,
         }
      }
   }
   const { appVisited, entityVisited, entityId } = getEntityInfo(
      location.pathname
   )
   return {
      userEmail: user?.email,
      requestedUrl: location.pathname,
      appVisited,
      entityVisited,
      entityId,
   }
}
