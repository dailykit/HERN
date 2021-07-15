import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@apollo/react-hooks'

// Components
import {
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   AvatarGroup,
   Avatar,
   Text,
   Flex,
} from '@dailykit/ui'

import { APPS } from '../../../graphql'
import { useTabs } from '../../../../../shared/providers'
import { Banner, InlineLoader } from '../../../../../shared/components'

const address = 'apps.settings.views.listings.appslisting.'

const AppsListing = () => {
   const { t } = useTranslation()
   const { tab, addTab } = useTabs()
   const { loading, data: { apps = [] } = {} } = useSubscription(APPS.LIST)

   React.useEffect(() => {
      if (!tab) {
         addTab('Apps', '/settings/apps')
      }
   }, [tab, addTab])

   return (
      <Flex margin="0 auto" width="calc(100% - 32px)" maxWidth="1280px">
         <Banner id="settings-app-apps-listing-top" />
         <div>
            <Flex
               container
               as="header"
               height="80px"
               alignItems="center"
               justifyContent="space-between"
            >
               <Text as="h2">{t(address.concat('apps'))}</Text>
            </Flex>
            <Table>
               <TableHead>
                  <TableRow>
                     <TableCell>{t(address.concat('apps'))}</TableCell>
                     <TableCell>
                        {t(address.concat('roles assigned'))}
                     </TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {loading ? (
                     <InlineLoader />
                  ) : (
                     apps.map(node => (
                        <TableRow key={node.title}>
                           <TableCell>
                              <AvatarGroup>
                                 <Avatar
                                    withName
                                    type="round"
                                    url=""
                                    title={node.title}
                                 />
                              </AvatarGroup>
                           </TableCell>
                           <TableCell>
                              <AvatarGroup>
                                 {node.roles.map(({ role }) => (
                                    <Avatar
                                       url=""
                                       key={role.id}
                                       title={role.title}
                                    />
                                 ))}
                              </AvatarGroup>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
         <Banner id="settings-app-apps-listing-bottom" />
      </Flex>
   )
}

export default AppsListing
