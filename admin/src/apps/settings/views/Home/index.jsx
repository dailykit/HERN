import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '@apollo/react-hooks'

import { DashboardTile, Text, Loader } from '@dailykit/ui'

import { StyledHome, StyledCardList } from './styled'
import { STATIONS, ROLES, USERS } from '../../graphql'
import { useTabs } from '../../../../shared/providers'
import { Banner } from '../../../../shared/components'
import { DevicesSvg, MasterListSvg, RolesSvg, StationsSvg, UsersSvg } from '../../../../shared/assets/illustrationTileSvg'

const address = 'apps.settings.views.home.'

const Home = () => {
   const { addTab } = useTabs()
   const { t } = useTranslation()
   const {
      loading: stationsLoading,
      error: stationsError,
      data: { stationsAggregate = {} } = {},
   } = useSubscription(STATIONS.AGGREGATE)
   const {
      loading: rolesLoading,
      error: rolesError,
      data: { rolesAggregate = {} } = {},
   } = useSubscription(ROLES.AGGREGATE)
   const {
      loading: usersLoading,
      error: usersError,
      data: { settings_user_aggregate = {} } = {},
   } = useSubscription(USERS.AGGREGATE)

   if (stationsLoading || usersLoading || rolesLoading) return <Loader />
   if (stationsError) return <div>{stationsError.message}</div>
   if (usersError) return <div>{usersError.message}</div>
   if (rolesError) return <div>{rolesError.message}</div>
   return (
      <StyledHome>
         <Banner id="settings-app-home-top" />
         <Text as="h1">{t(address.concat('settings app'))}</Text>
         <StyledCardList>
            <DashboardTile
               title={t(address.concat('users'))}
               count={settings_user_aggregate.aggregate.count}
               conf="All available"
               onClick={() => addTab('Users', '/settings/users')}
               tileSvg={<UsersSvg />}
            />
            <DashboardTile
               conf="All available"
               count={rolesAggregate.aggregate.count}
               title={t(address.concat('roles'))}
               onClick={() => addTab('Roles', '/settings/roles')}
               tileSvg={<RolesSvg />}
            />
            <DashboardTile
               title={t(address.concat('devices'))}
               count="4"
               conf="All active"
               onClick={() => addTab('Devices', '/settings/devices')}
               tileSvg={<DevicesSvg />}
            />
            <DashboardTile
               title={t(address.concat('stations'))}
               count={stationsAggregate.aggregate.count}
               conf="All active"
               onClick={() => addTab('Stations', '/settings/stations')}
               tileSvg={<StationsSvg />}
            />
            <DashboardTile
               title={t(address.concat('master lists'))}
               count="5"
               conf="All active"
               onClick={() => addTab('Master Lists', '/settings/master-lists')}
               tileSvg={<MasterListSvg />}
            />
            <DashboardTile
               title="Market Place"
               onClick={() => addTab('Market Place', '/settings/marketplace')}
            // tileSvg={<MasterListSvg />}
            />
            <DashboardTile
               title="Envs"
               onClick={() => addTab('Envs', '/settings/envs')}
            // tileSvg={<MasterListSvg />}
            />
         </StyledCardList>
         <Banner id="settings-app-home-bottom" />
      </StyledHome>
   )
}

export default Home
