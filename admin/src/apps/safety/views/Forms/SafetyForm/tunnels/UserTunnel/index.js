import React from 'react'
import {
   List,
   ListItem,
   ListOptions,
   ListSearch,
   useSingleList,
   TunnelHeader,
} from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { TunnelBody } from '../styled'
import { SafetyCheckContext } from '../../../../../context/check'
import { Banner } from '../../../../../../../shared/components'

const address = 'apps.safety.views.forms.safetyform.tunnels.usertunnel.'
const UserTunnel = ({ openTunnel, closeTunnel, users }) => {
   const { t } = useTranslation()
   const { checkDispatch } = React.useContext(SafetyCheckContext)

   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(users)

   // Effect
   React.useEffect(() => {
      if (Object.keys(current).length) {
         checkDispatch({
            type: 'USER',
            payload: current,
         })
         openTunnel(2)
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title={t(address.concat('select user'))}
            close={() => closeTunnel(1)}
         />
         <Banner id="safety-apps-safety-checks-safety-check-details-user-tunnel-top" />
         <TunnelBody>
            <List>
               {Object.keys(current).length > 0 ? (
                  <ListItem type="SSL1" title={current.title} />
               ) : (
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder={t(
                        address.concat('type what you’re looking for')
                     )}
                  />
               )}
               <ListOptions>
                  {list
                     .filter(option =>
                        option.title.toLowerCase().includes(search)
                     )
                     .map(option => (
                        <ListItem
                           type="SSL1"
                           key={option.id}
                           title={option.title}
                           isActive={option.id === current.id}
                           onClick={() => selectOption('id', option.id)}
                        />
                     ))}
               </ListOptions>
            </List>
         </TunnelBody>
         <Banner id="safety-apps-safety-checks-safety-check-details-user-tunnel-bottom" />
      </>
   )
}

export default UserTunnel
