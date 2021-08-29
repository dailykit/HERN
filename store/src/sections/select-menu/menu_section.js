import React from 'react'
import { isEmpty } from 'lodash'
import tw, { styled } from 'twin.macro'
import { useQuery } from '@apollo/react-hooks'
import { webRenderer } from '@dailykit/web-renderer'

import { MenuProvider, useMenu } from './state'
import { WeekPicker } from './week_picker'
import { GET_FILEID } from '../../graphql'
import { HelperBar, Loader } from '../../components'
import { CartPanel } from './cart'
import { Menu } from './menu'
import { useConfig } from '../../lib'
import { get_env, isClient } from '../../utils'

export const MenuSection = () => {
   const { configOf } = useConfig('Select-Menu')
   const config = configOf('select-menu-header')
   return (
      <MenuProvider isCheckout>
         <main className="hern-select-menu__main">
            <div>
               <WeekPicker isFixed />
               <header className="hern-select-menu__header">
                  <div
                     className="hern-select-menu__header__before"
                     style={{
                        backgroundImage: `url(
                           ${
                              !isEmpty(config?.header?.images)
                                 ? config?.header?.images[0]?.url
                                 : ''
                           }
                        )`,
                     }}
                  />
                  {config?.header?.heading && (
                     <h1 className="hern-select-menu__header__heading">
                        {config?.header?.heading}
                     </h1>
                  )}
                  {config?.header?.subHeading && (
                     <h3 className="hern-select-menu__header__sub-heading">
                        {config?.header?.subHeading}
                     </h3>
                  )}
               </header>
            </div>
            <MenuContent />
         </main>
         <div id="select-menu-bottom-01"></div>
      </MenuProvider>
   )
}
const MenuContent = () => {
   const { state } = useMenu()
   const { loading } = useQuery(GET_FILEID, {
      variables: {
         divId: ['select-menu-bottom-01'],
      },
      onCompleted: ({ content_subscriptionDivIds: fileData }) => {
         if (fileData.length) {
            fileData.forEach(data => {
               if (data?.fileId) {
                  const fileId = [data?.fileId]
                  const cssPath =
                     data?.subscriptionDivFileId?.linkedCssFiles.map(file => {
                        return file?.cssFile?.path
                     })
                  const jsPath = data?.subscriptionDivFileId?.linkedJsFiles.map(
                     file => {
                        return file?.jsFile?.path
                     }
                  )
                  webRenderer({
                     type: 'file',
                     config: {
                        uri: isClient && get_env('DATA_HUB_HTTPS'),
                        adminSecret: isClient && get_env('ADMIN_SECRET'),
                        expressUrl: isClient && get_env('EXPRESS_URL'),
                     },
                     fileDetails: [
                        {
                           elementId: 'select-menu-bottom-01',
                           fileId,
                           cssPath: cssPath,
                           jsPath: jsPath,
                        },
                     ],
                  })
               }
            })
         }
      },

      onError: error => {
         console.error(error)
      },
   })

   if (state?.isOccurencesLoading || loading) {
      return (
         <section className="hern-select-menu__loading">
            <Loader inline />
         </section>
      )
   }
   if (!state?.week?.id)
      return (
         <section className="hern-select-menu__helper-bar">
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  No menu available for this week!
               </HelperBar.SubTitle>
            </HelperBar>
         </section>
      )
   return (
      <section className="hern-select-menu__content">
         <Menu />
         <CartPanel noSkip isCheckout />
      </section>
   )
}
