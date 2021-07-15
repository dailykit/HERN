import React from 'react'
import _ from 'lodash'
import { useSubscription } from '@apollo/react-hooks'

import { QUERIES } from '../graphql'
import { Loader } from '../components'
import { useAuth } from '../../../shared/providers'

const ConfigContext = React.createContext()

const initialState = {
   tunnel: { visible: false },
   stations: [],
   current_station: { id: null },
   scale: {
      weight_simulation: {
         app: 'order',
         type: 'scale',
         value: { isActive: false },
         identifier: 'weight simulation',
      },
   },
   print: {
      print_simulation: {
         app: 'order',
         type: 'print',
         value: { isActive: false },
         identifier: 'print simulation',
      },
   },
   kot: {
      group_by_station: {
         app: 'order',
         type: 'kot',
         value: { isActive: false },
         identifier: 'group by station',
      },
      group_by_product_type: {
         app: 'order',
         type: 'kot',
         value: { isActive: false },
         identifier: 'group by product type',
      },
      print_automatically: {
         app: 'order',
         type: 'kot',
         value: { isActive: false },
         identifier: 'print automatically',
      },
      default_kot_printer: {
         app: 'order',
         type: 'kot',
         value: { printNodeId: '' },
         identifier: 'default kot printer',
      },
   },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_SETTING':
         return {
            ...state,
            [payload.field]: { ...state[payload.field], ...payload.value },
         }
      case 'SET_CURRENT_STATION':
         return { ...state, current_station: payload }
      case 'SET_STATIONS':
         return { ...state, stations: payload }
      case 'TOGGLE_TUNNEL':
         return { ...state, tunnel: payload }
      default:
         return state
   }
}

export const ConfigProvider = ({ children }) => {
   const { user } = useAuth()
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const { loading, data: { stations = [] } = {} } = useSubscription(
      QUERIES.STATIONS.BY_USER,
      {
         variables: {
            ...(user.email && { email: { _eq: user.email } }),
         },
      }
   )
   const {
      loading: loadingSettings,
      data: { settings = [] } = {},
   } = useSubscription(QUERIES.SETTINGS.LIST)

   React.useEffect(() => {
      if (!loadingSettings && !_.isEmpty(settings)) {
         const weighIndex = settings.findIndex(
            setting => setting.identifier === 'weight simulation'
         )
         if (weighIndex !== -1) {
            const { __typename, ...rest } = settings[weighIndex]
            dispatch({
               type: 'SET_SETTING',
               payload: {
                  field: 'scale',
                  value: {
                     weight_simulation: rest,
                  },
               },
            })
         }
         const printIndex = settings.findIndex(
            setting => setting.identifier === 'print simulation'
         )
         if (printIndex !== -1) {
            const { __typename, ...rest } = settings[printIndex]
            dispatch({
               type: 'SET_SETTING',
               payload: {
                  field: 'print',
                  value: {
                     print_simulation: rest,
                  },
               },
            })
         }
         const groupByStationIndex = settings.findIndex(
            setting => setting.identifier === 'group by station'
         )
         if (groupByStationIndex !== -1) {
            const { __typename, ...rest } = settings[groupByStationIndex]
            dispatch({
               type: 'SET_SETTING',
               payload: {
                  field: 'kot',
                  value: {
                     group_by_station: rest,
                  },
               },
            })
         }
         const groupByProductTypeIndex = settings.findIndex(
            setting => setting.identifier === 'group by product type'
         )
         if (groupByProductTypeIndex !== -1) {
            const { __typename, ...rest } = settings[groupByProductTypeIndex]
            dispatch({
               type: 'SET_SETTING',
               payload: {
                  field: 'kot',
                  value: {
                     group_by_product_type: rest,
                  },
               },
            })
         }
         const printAutoIndex = settings.findIndex(
            setting => setting.identifier === 'print automatically'
         )
         if (printAutoIndex !== -1) {
            const { __typename, ...rest } = settings[printAutoIndex]
            dispatch({
               type: 'SET_SETTING',
               payload: {
                  field: 'kot',
                  value: {
                     print_automatically: rest,
                  },
               },
            })
         }
         const defaultKOTPrinterIndex = settings.findIndex(
            setting => setting.identifier === 'default kot printer'
         )
         if (defaultKOTPrinterIndex !== -1) {
            const { __typename, ...rest } = settings[defaultKOTPrinterIndex]
            dispatch({
               type: 'SET_SETTING',
               payload: {
                  field: 'kot',
                  value: {
                     default_kot_printer: rest,
                  },
               },
            })
         }
      }
   }, [loadingSettings, settings])

   React.useEffect(() => {
      if (!loading && !_.isEmpty(stations)) {
         dispatch({ type: 'SET_STATIONS', payload: stations })
         const [station] = stations
         dispatch({ type: 'SET_CURRENT_STATION', payload: station })
      }
   }, [loading, stations])

   if (loading) return <Loader />
   return (
      <ConfigContext.Provider value={{ state, dispatch, methods: {} }}>
         {children}
      </ConfigContext.Provider>
   )
}

export const useConfig = () => React.useContext(ConfigContext)
